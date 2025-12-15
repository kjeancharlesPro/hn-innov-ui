import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { forkJoin, of, Subscription, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  calculateNextPeriodDates,
  calculateTimeComponents,
  extractEntitiesList,
  extractTeamsList,
  DASHBOARD_CONSTANTS,
} from './dashboard-page.utils';
import {
  ParticipantService,
  JuryMemberService,
  TeamService,
  StatusService,
  PeriodService,
  EmailService,
  HackathonService,
  Subject,
  Team,
  CountdownService,
  StatusTransitionService,
} from '../../services';
import { Countdown } from '../../interfaces/countdown.interface';
import { FormatedPeriod, Period } from '../../interfaces';
import {
  StatusCardComponent,
  PeriodCardComponent,
  StatsCardComponent,
  CountdownComponent,
  ProjectInfoComponent,
} from './components';

/** Dashboard principal du hackathon avec gestion des statuts et compte à rebours */
@Component({
  selector: 'app-dashboard-page',
  imports: [
    CommonModule,
    StatusCardComponent,
    PeriodCardComponent,
    StatsCardComponent,
    CountdownComponent,
    ProjectInfoComponent,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit, OnDestroy {
  // État UI
  loading = false;
  loadingStatus = false;
  loadingPeriod = false;
  error: string | null = null;
  status: string | null = '';

  // Counters
  participantsCount: number = 0;
  juryCount: number = 0;

  // Listes
  juryMembers: any[] = [];
  participants: any[] = [];
  teams: any[] = [];

  // Dates de période
  formatedPeriod: FormatedPeriod = { startDay: '', endDay: '', startMonth: '', endMonth: '' };

  period: Period = { id: 1, startDate: '', endDate: '' };

  /**
   * Retourne la date de fin de période formatée en français.
   * @returns Date formatée ou chaîne vide si aucune date
   */
  get periodEndDateFormatted(): string {
    if (!this.period?.endDate) return '';
    const endDate = new Date(this.period.endDate);
    return endDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Indique si le hackathon est dans un statut actif (pas EN_ATTENTE).
   * @returns true si le statut est actif
   */
  get isStatusActive(): boolean {
    return this.status !== 'EN_ATTENTE';
  }

  /**
   * Indique si les informations du projet doivent être affichées.
   * @returns true si le hackathon est en cours ou terminé
   */
  get isProjectVisible(): boolean {
    return this.status === 'EN_COURS' || this.status === 'TERMINE';
  }

  get daysSinceLastHackathon(): number {
    if (!this.period?.endDate) return 0;
    return Math.floor(this.calculateDaysSinceDate(this.period.endDate));
  }

  get lastHackathonEndDate(): string {
    if (!this.period?.endDate) return '';
    const endDate = new Date(this.period.endDate);
    return endDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /** Sujet du hackathon sélectionné par le jury */
  subject: Subject = { id: 0, title: '', description: '', problem: '', innovation: '' };

  /** ID du hackathon actuel */
  currentHackathonId: number | null = null;

  /** Données du compte à rebours */
  countdown: Countdown = {
    title: 'Le hackathon commence bientôt',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hadEnded: false,
  };

  /** Intervalle de nettoyage de fin de journée */
  private cleanupInterval: any = null;

  /** Intervalle de vérification du statut */
  private statusCheckInterval: any = null;

  /** Subscription aux observables */
  private sub: Subscription | null = null;

  /** Subscription au countdown */
  private countdownSub: Subscription | null = null;

  constructor(
    private participantService: ParticipantService,
    private juryMemberService: JuryMemberService,
    private teamService: TeamService,
    private statusService: StatusService,
    private periodService: PeriodService,
    private emailService: EmailService,
    private hackathonService: HackathonService,
    private cdr: ChangeDetectorRef,
    private countdownService: CountdownService,
    private statusTransitionService: StatusTransitionService
  ) {}

  /**
   * Initialise le composant au chargement.
   * Récupère toutes les données initiales du dashboard.
   */
  ngOnInit(): void {
    this.fetchAllData();
    this.subscribeToCountdown();
  }

  /**
   * S'abonne aux changements du countdown.
   */
  private subscribeToCountdown(): void {
    this.countdownSub = this.countdownService.countdown$.subscribe((countdown) => {
      this.countdown = countdown;
      this.cdr.detectChanges();
    });
  }

  /**
   * Nettoie les ressources avant la destruction du composant.
   * Arrête tous les intervalles et désabonne les observables.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.countdownSub?.unsubscribe();
    this.countdownService.stopCountdown();
    this.clearCleanupInterval();
    this.clearStatusCheckInterval();
  }

  /**
   * Récupère toutes les données nécessaires au dashboard.
   * Utilise forkJoin pour exécuter toutes les requêtes en parallèle.
   */
  fetchAllData(): void {
    this.loading = true;
    this.loadingStatus = true;
    this.loadingPeriod = true;
    this.error = null;

    const requests = {
      participantsList: this.getParticipantsList(),
      juryMembersList: this.getJuryList(),
      period: this.getPeriod(),
      status: this.getStatus(),
      teamsList: this.getTeamsList(),
    };

    this.sub = forkJoin(requests).subscribe({
      next: (results) => this.handleDataFetchSuccess(results),
      error: (err) => this.handleDataFetchError(err),
    });
  }
  private getPeriod(): Observable<any> {
    return this.periodService
      .getById(DASHBOARD_CONSTANTS.DEFAULT_PERIOD_ID)
      .pipe(catchError(this.handleHttpError('period')));
  }

  private getJuryList(): Observable<any> {
    return this.juryMemberService
      .getAll()
      .pipe(catchError(this.handleHttpError('jury-members list')));
  }

  private getParticipantsList(): Observable<any> {
    return this.participantService
      .getAll()
      .pipe(catchError(this.handleHttpError('participants list')));
  }

  private getStatus(): Observable<any> {
    return this.statusService.getCurrent().pipe(catchError(this.handleHttpError('status')));
  }

  private getTeamsList(): Observable<any> {
    return this.teamService.getAll().pipe(catchError(this.handleHttpError('teams list')));
  }

  private handleHttpError(context: string) {
    return (err: any): Observable<null> => {
      console.error(`${context} error`, err);
      return of(null);
    };
  }

  /**
   * Gère le succès de la récupération des données.
   * Traite les résultats et démarre les processus selon le statut.
   * @param results Résultats groupés des requêtes API
   */
  private handleDataFetchSuccess(results: any): void {
    this.juryMembers = extractEntitiesList(results.juryMembersList, 'juryMemberEntities');
    this.participants = extractEntitiesList(results.participantsList, 'participantEntities');
    this.teams = extractTeamsList(results.teamsList);

    this.participantsCount = this.participants.length;
    this.juryCount = this.juryMembers.length;
    this.status = results.status?.state;
    this.formatedPeriod = this.convertToFormatedPeriod(results.period);
    this.period = results.period;
    this.loading = false;
    this.loadingStatus = false;
    this.loadingPeriod = false;

    if (this.status === 'TERMINE') {
      this.countdown.title = 'Nettoyage dans';
      this.scheduleEndOfDayCleanup();
    }

    if (this.status === 'EN_COURS') {
      this.countdownService.startCountdown(
        new Date(this.period.endDate),
        'Fin du Hackathon dans',
        () => this.handleCountdownEnd()
      );
      this.loadHackathonData();
    }

    if (this.status === 'EN_PREPARATION') {
      const startDate = new Date(this.period.startDate);
      const now = new Date();
      this.countdownService.startCountdown(startDate, 'Le hackathon commence dans', () =>
        this.handleCountdownEnd()
      );
    }

    if (this.isReadyForPreparation()) {
      this.triggerPreparation();
    }

    // Démarrer la vérification périodique si en attente
    if (this.status === 'EN_ATTENTE') {
      this.startStatusCheckInterval();
    }

    this.cdr.detectChanges();
  }

  triggerEnCours(): void {
    this.statusTransitionService.transitionToEnCours().subscribe({
      next: (response) => {
        this.status = response.status.state;
        this.teams = response.teams;
        this.countdownService.updateTitle('Le hackathon se termine bientôt');
        this.loadHackathonData();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour du statut vers EN_COURS:', err);
      },
    });
  }

  /**
   * Démarre le compte à rebours vers une date cible.
   * Met à jour l'affichage chaque seconde et gère la fin du compte à rebours.
   * @param targetDate Date cible du compte à rebours
   * @deprecated Utiliser CountdownService.startCountdown()
   */
  private startCountdown(targetDate: Date): void {
    // Déléguer au service
    this.countdownService.startCountdown(targetDate, this.countdown.title, () =>
      this.handleCountdownEnd()
    );
  }

  private handleCountdownEnd(): void {
    if (this.status === 'EN_PREPARATION') {
      this.statusTransitionService.transitionToEnCours().subscribe({
        next: (response) => {
          this.status = response.status.state;
          this.teams = response.teams;
          this.countdownService.updateTitle('Le hackathon a commencé');
          this.loadHackathonData();
        },
        error: (err) => {
          console.error('❌ Erreur lors de la transition vers EN_COURS:', err);
        },
      });
    } else if (this.status === 'EN_COURS') {
      this.transitionToTermine();
    }
  }

  /**
   * Gère la transition vers le statut EN_COURS.
   * Génère les équipes avant de changer le statut et charge les données du hackathon.
   * @deprecated Utiliser StatusTransitionService.transitionToEnCours()
   */
  private transitionToEnCours(): void {
    // Déléguer au service
    this.statusTransitionService.transitionToEnCours().subscribe({
      next: (response) => {
        this.status = response.status.state;
        this.teams = response.teams;
        this.countdownService.updateTitle('Le hackathon a commencé');
        this.loadHackathonData();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la transition vers EN_COURS:', err);
      },
    });
  }

  /**
   * Charge les données du hackathon actuel.
   * Récupère l'ID du hackathon depuis l'API HATEOAS et charge les équipes et le sujet.
   */
  private loadHackathonData(): void {
    // Récupérer d'abord le hackathon actuel pour avoir son ID
    this.hackathonService.get().subscribe({
      next: (hackathonResponse: any) => {
        console.log('🔍 Réponse complète hackathons:', hackathonResponse);
        const hackathons = hackathonResponse?._embedded?.hackathonEntities || [];
        console.log('🔍 Liste des hackathons:', hackathons);

        if (hackathons.length > 0) {
          const currentHackathon = hackathons[0];
          const juryMemberLink = currentHackathon?._links?.juryMember?.href || '';
          console.log('🔍 Lien juryMember:', juryMemberLink);

          // Extraire l'ID du hackathon depuis l'URL (ex: "http://localhost:8080/hackathons/2/juryMember")
          const hackathonIdMatch = juryMemberLink.match(/\/hackathons\/(\d+)\//);
          this.currentHackathonId = hackathonIdMatch ? parseInt(hackathonIdMatch[1], 10) : null;

          if (!this.currentHackathonId) {
            console.error("❌ Impossible d'extraire l'ID du hackathon depuis le lien");
            return;
          }

          // Charger les équipes
          this.teamService.getAll().subscribe({
            next: (teamsResponse: any) => {
              this.teams = extractTeamsList(teamsResponse);
              this.cdr.detectChanges();
            },
            error: (err: any) => {
              console.error('❌ Erreur lors de la récupération des équipes:', err);
            },
          });

          // Charger le membre du jury sélectionné avec le bon ID
          this.hackathonService.getJuryMember(this.currentHackathonId).subscribe({
            next: (juryMemberResponse) => {
              if (juryMemberResponse) {
                this.subject = {
                  id: juryMemberResponse.id || 0,
                  title: juryMemberResponse.title || '',
                  description: juryMemberResponse.description || '',
                  problem: juryMemberResponse.problem || '',
                  innovation: juryMemberResponse.innovation || '',
                };
              }
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('❌ Erreur lors de la récupération du membre du jury:', err);
            },
          });
        } else {
          console.warn('⚠️ Aucun hackathon actuel trouvé');
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors de la récupération du hackathon actuel:', err);
      },
    });

    // Démarrer le compte à rebours vers la fin
    if (this.period.endDate) {
      this.countdownService.startCountdown(
        new Date(this.period.endDate),
        'Fin du Hackathon dans',
        () => this.handleCountdownEnd()
      );
    }
  }

  /**
   * Gère la transition vers le statut TERMINE.
   * Change le statut et planifie le nettoyage de fin de journée.
   */
  private transitionToTermine(): void {
    this.statusTransitionService.transitionToTermine().subscribe({
      next: (statusResponse) => {
        this.status = statusResponse.state;
        this.countdownService.updateTitle('Nettoyage dans');
        this.scheduleEndOfDayCleanup();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour du statut vers TERMINE:', err);
      },
    });
  }

  /**
   * Réinitialise l'affichage du compte à rebours à zéro
   * @deprecated Utiliser CountdownService.resetCountdown()
   */
  private resetCountdownDisplay(): void {
    this.countdownService.resetCountdown();
  }

  /**
   * Met à jour l'affichage du compte à rebours avec la distance temporelle
   * @param distance - Distance en millisecondes jusqu'à la date cible
   * @deprecated Géré automatiquement par CountdownService
   */
  private updateCountdownDisplay(distance: number): void {
    // Plus nécessaire, géré par le service
  }

  /**
   * Arrête et nettoie l'intervalle du compte à rebours
   * @deprecated Utiliser CountdownService.stopCountdown()
   */
  clearCountdownInterval(): void {
    this.countdownService.stopCountdown();
  }

  /**
   * Déclenche le passage en mode préparation.
   * Change le statut vers EN_PREPARATION et crée la période de test.
   */
  triggerPreparation(): void {
    this.statusTransitionService.transitionToPreparation().subscribe({
      next: (response) => {
        this.status = response.state;
        this.countdownService.updateTitle('Le hackathon commence bientôt');
        this.createAndUpdatePeriod();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour du statut vers EN_PREPARATION:', err);
      },
    });
  }

  /**
   * Crée et met à jour la période de test du hackathon.
   * Génère des dates de début et fin avec offsets configurables pour les tests.
   */
  createAndUpdatePeriod(): void {
    // Utiliser UTC+1 (ajouter 1 heure = 3600000 ms)
    const nowTimestamp = Date.now() + 3600000;
    const now5MinLater = new Date(
      nowTimestamp + DASHBOARD_CONSTANTS.TEST_START_OFFSET_MINUTES * 60000
    );
    const now10MinLater = new Date(
      nowTimestamp + DASHBOARD_CONSTANTS.TEST_END_OFFSET_MINUTES * 60000
    );

    const testPeriod: Period = {
      id: DASHBOARD_CONSTANTS.DEFAULT_PERIOD_ID,
      startDate: now5MinLater.toISOString(),
      endDate: now10MinLater.toISOString(),
    };

    this.periodService.update(DASHBOARD_CONSTANTS.DEFAULT_PERIOD_ID, testPeriod).subscribe({
      next: (periodResponse) => {
        this.period = periodResponse;
        this.formatedPeriod = this.convertToFormatedPeriod(periodResponse);
        this.countdownService.startCountdown(
          new Date(periodResponse.startDate),
          'Le hackathon commence dans',
          () => this.handleCountdownEnd()
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur mise à jour période:', err);
      },
    });
  }

  handleDataFetchError(err: any): void {
    console.error('fetchCounts forkJoin error', err);
    this.error = 'Impossible de récupérer les compteurs.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  convertToFormatedPeriod(period: Period): FormatedPeriod {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    const monthNames = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];

    return {
      startDay: startDate.getDate().toString(),
      endDay: endDate.getDate().toString(),
      startMonth: monthNames[startDate.getMonth()],
      endMonth: monthNames[endDate.getMonth()],
    };
  }

  /**
   * Vérifie si toutes les conditions sont remplies pour passer en préparation.
   * Vérifie le statut, le nombre de participants/jury et le délai depuis le dernier hackathon.
   * @returns true si prêt pour la préparation
   */
  isReadyForPreparation(): boolean {
    if (this.status !== 'EN_ATTENTE') {
      return false;
    }

    if (this.juryCount < DASHBOARD_CONSTANTS.MIN_JURY_MEMBERS) {
      return false;
    }

    if (this.participantsCount < DASHBOARD_CONSTANTS.MIN_PARTICIPANTS) {
      return false;
    }

    if (!this.period?.endDate) {
      return false;
    }

    const daysSinceLastPeriod = this.calculateDaysSinceDate(this.period.endDate);

    if (daysSinceLastPeriod <= DASHBOARD_CONSTANTS.MIN_DAYS_BETWEEN_PERIODS) {
      return false;
    }

    return true;
  }

  calculateDaysSinceDate(dateString: string): number {
    const now = new Date().getTime();
    const targetDate = new Date(dateString).getTime();
    const timeDiff = now - targetDate;
    return timeDiff / (1000 * 60 * 60 * 24);
  }

  getTeamMembersDisplay(members: any[]): string {
    if (!members || members.length === 0) {
      return 'Aucun participant';
    }
    return members
      .map((member: any) => {
        if (typeof member === 'string') {
          return member;
        }
        return `${member.firstName || ''} ${member.lastName || ''}`.trim();
      })
      .filter((name) => name.length > 0)
      .join(', ');
  }

  /**
   * Planifie le nettoyage des données du hackathon à minuit.
   * Démarre un compte à rebours et vérifie périodiquement si l'heure est atteinte.
   */
  private scheduleEndOfDayCleanup(): void {
    // Calculer le temps jusqu'à minuit
    const now = new Date();
    const midnight = new Date();

    midnight.setHours(24, 0, 0, 0);

    // Démarrer le compte à rebours jusqu'à minuit
    const testMidnight = new Date(
      Date.now() + DASHBOARD_CONSTANTS.TEST_CLEANUP_OFFSET_MINUTES * 60000
    );
    this.startCountdown(testMidnight);

    // Vérifier toutes les secondes si on a atteint minuit
    this.cleanupInterval = setInterval(() => {
      const currentTime = new Date();
      if (currentTime >= testMidnight) {
        this.performEndOfDayCleanup();
      }
    }, DASHBOARD_CONSTANTS.CLEANUP_CHECK_INTERVAL_MS);
  }

  /**
   * Effectue le nettoyage de fin de journée - transition vers EN_ATTENTE
   */
  private performEndOfDayCleanup(): void {
    this.clearCleanupInterval();

    // Remettre le statut à EN_ATTENTE d'abord, puis supprimer les données
    this.statusTransitionService.transitionToEnAttente().subscribe({
      next: (response) => {
        this.status = response.state;
        this.countdownService.resetCountdown('Le hackathon commence bientôt');

        // Maintenant que le statut est changé, supprimer toutes les données
        this.deleteAllHackathonData();

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la réinitialisation du statut:', err);
      },
    });
  }

  /**
   * Supprime toutes les données du hackathon dans le bon ordre.
   * Respecte les contraintes d'intégrité référentielle de la base de données.
   * Ordre : Hackathon -> Équipes -> Jury -> Participants
   */
  private deleteAllHackathonData(): void {
    // Étape 1 : Supprimer le hackathon en premier (référence jury member)
    this.hackathonService.deleteAll().subscribe({
      next: () => {
        // Étape 2 : Supprimer les équipes (référence participants)
        this.teamService.deleteAll().subscribe({
          next: () => {
            this.teams = [];

            // Étape 3 : Supprimer les membres du jury (plus référencés par hackathon)
            this.juryMemberService.deleteAll().subscribe({
              next: () => {
                this.juryMembers = [];
                this.juryCount = 0;

                // Étape 4 : Supprimer les participants (plus référencés par équipes)
                this.participantService.deleteAll().subscribe({
                  next: () => {
                    this.participants = [];
                    this.participantsCount = 0;

                    // Recharger les données pour mettre à jour les compteurs et vérifier le statut
                    setTimeout(() => {
                      this.fetchAllData();
                    }, DASHBOARD_CONSTANTS.DATA_RELOAD_DELAY_MS);
                  },
                  error: (err: any) => {
                    console.error('❌ Erreur lors de la suppression des participants:', err);
                    this.cdr.detectChanges();
                  },
                });
              },
              error: (err: any) => {
                console.error('❌ Erreur lors de la suppression des membres du jury:', err);
                this.cdr.detectChanges();
              },
            });
          },
          error: (err: any) => {
            console.error('❌ Erreur lors de la suppression des équipes:', err);
            this.cdr.detectChanges();
          },
        });
      },
      error: (err: any) => {
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Arrête et nettoie l'intervalle de nettoyage
   */
  private clearCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Démarre la vérification périodique du statut.
   * Vérifie toutes les 5 secondes si les conditions pour passer en préparation sont remplies.
   */
  private startStatusCheckInterval(): void {
    this.clearStatusCheckInterval();

    this.statusCheckInterval = setInterval(() => {
      // Recharger les données pour avoir les compteurs à jour
      this.sub?.unsubscribe();

      const requests = {
        participantsList: this.getParticipantsList(),
        juryMembersList: this.getJuryList(),
        status: this.getStatus(),
      };

      this.sub = forkJoin(requests).subscribe({
        next: (results) => {
          const newParticipants = extractEntitiesList(
            results.participantsList,
            'participantEntities'
          );
          const newJuryMembers = extractEntitiesList(results.juryMembersList, 'juryMemberEntities');

          this.participants = newParticipants;
          this.juryMembers = newJuryMembers;
          this.participantsCount = newParticipants.length;
          this.juryCount = newJuryMembers.length;
          this.status = results.status?.state;

          // Si on n'est plus en attente, arrêter la vérification
          if (this.status !== 'EN_ATTENTE') {
            this.clearStatusCheckInterval();
          }
          // Si prêt pour la préparation, déclencher la transition
          else if (this.isReadyForPreparation()) {
            this.clearStatusCheckInterval();
            this.triggerPreparation();
          }

          this.cdr.detectChanges();
        },
        error: (err) => {},
      });
    }, DASHBOARD_CONSTANTS.STATUS_CHECK_INTERVAL_MS);
  }

  /**
   * Arrête et nettoie l'intervalle de vérification du statut
   */
  private clearStatusCheckInterval(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }
}
