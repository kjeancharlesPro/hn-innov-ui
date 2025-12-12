import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { forkJoin, of, Subscription, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  calculateNextPeriodDates,
  calculateTimeComponents,
  formatTeamMembers,
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
} from '../../services';
import { Countdown } from '../../interfaces/countdown.interface';
import { FormatedPeriod, Period } from '../../interfaces';

/** Dashboard principal du hackathon avec gestion des statuts et compte à rebours */
@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit, OnDestroy {
  // État UI
  loading = false;
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

  // idées hackathon
  subject: Subject = { id: 0, title: '', description: '', problem: '', innovation: '' };

  // Compte à rebours
  countdown: Countdown = {
    title: 'Le hackathon commence bientôt',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hadEnded: false,
  };

  private countdownInterval: any = null;
  private cleanupInterval: any = null;

  // Subscriptions
  private sub: Subscription | null = null;

  constructor(
    private participantService: ParticipantService,
    private juryMemberService: JuryMemberService,
    private teamService: TeamService,
    private statusService: StatusService,
    private periodService: PeriodService,
    private emailService: EmailService,
    private hackathonService: HackathonService,
    private cdr: ChangeDetectorRef
  ) {}

  // Lifecycle
  ngOnInit(): void {
    this.fetchAllData();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.clearCountdownInterval();
    this.clearCleanupInterval();
  }

  // API - Récupération des données
  fetchAllData(): void {
    this.loading = true;
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
    return this.periodService.getById(1).pipe(catchError(this.handleHttpError('period')));
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

    if (this.status === 'TERMINE') {
      this.countdown.title = 'Nettoyage dans';
      this.scheduleEndOfDayCleanup();
    }

    if (this.status === 'EN_COURS') {
      this.startCountdown(new Date(this.period.endDate));
      this.loadHackathonData();
    }

    if (this.status === 'EN_PREPARATION') {
      this.startCountdown(new Date(this.period.startDate));
      if (this.countdown.hadEnded) {
        this.triggerEnCours();
      }
    }

    if (this.isReadyForPreparation()) {
      this.triggerPreparation();
    }

    this.cdr.detectChanges();
  }

  triggerEnCours(): void {
    this.statusService.setEnCours().subscribe({
      next: (response) => {
        this.status = response.state;
        this.countdown.title = 'Le hackathon se termine bientôt';
        //this.startCountdown(new Date(this.period.endDate));
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour du statut vers EN_COURS:', err);
      },
    });
  }

  // Compte à rebours
  private startCountdown(targetDate: Date): void {
    this.clearCountdownInterval();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        this.countdown.hadEnded = true;
        this.resetCountdownDisplay();
        this.clearCountdownInterval();
        this.handleCountdownEnd();
        return;
      }

      this.updateCountdownDisplay(distance);
      this.cdr.detectChanges();
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  private handleCountdownEnd(): void {
    if (this.status === 'EN_PREPARATION') {
      this.transitionToEnCours();
    } else if (this.status === 'EN_COURS') {
      this.transitionToTermine();
    }
  }

  private transitionToEnCours(): void {
    console.log('🎉 Le hackathon commence maintenant !');

    // D'abord générer les équipes avant de changer le statut
    this.hackathonService.generate().subscribe({
      next: (generateResponse) => {
        this.teams = generateResponse.teams;

        // Une fois les équipes générées, mettre à jour le statut
        this.statusService.setEnCours().subscribe({
          next: (statusResponse) => {
            this.status = statusResponse.state;
            this.countdown.title = 'Le hackathon a commencé';

            // Charger les équipes et le membre du jury du hackathon
            this.loadHackathonData();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour du statut vers EN_COURS:', err);
          },
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors de la génération des équipes:', err);
      },
    });
  }

  private loadHackathonData(): void {
    const hackathonId = 1;

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

    // Charger le membre du jury sélectionné
    this.hackathonService.getJuryMember(hackathonId).subscribe({
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

    // Démarrer le compte à rebours vers la fin
    if (this.period.endDate) {
      this.startCountdown(new Date(this.period.endDate));
    }
  }

  private transitionToTermine(): void {
    console.log('🏁 Le hackathon est terminé !');

    this.statusService.setTermine().subscribe({
      next: (statusResponse) => {
        console.log('✅ Statut mis à jour vers TERMINE:', statusResponse);
        this.status = statusResponse.state;
        this.countdown.title = 'Nettoyage dans';
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
   */
  private resetCountdownDisplay(): void {
    this.countdown = {
      title: 'Le hackathon commence bientôt',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  /**
   * Met à jour l'affichage du compte à rebours avec la distance temporelle
   * @param distance - Distance en millisecondes jusqu'à la date cible
   */
  private updateCountdownDisplay(distance: number): void {
    const { days, hours, minutes, seconds } = calculateTimeComponents(distance);

    this.countdown = {
      title: this.countdown.title,
      days,
      hours,
      minutes,
      seconds,
    };
  }

  /**
   * Arrête et nettoie l'intervalle du compte à rebours
   */
  clearCountdownInterval(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  triggerPreparation(): void {
    this.statusService.setEnPreparation().subscribe({
      next: (response) => {
        this.status = response.state;
        this.countdown.title = 'Le hackathon commence bientôt';
        this.createAndUpdatePeriod();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour du statut vers EN_PREPARATION:', err);
      },
    });
  }

  createAndUpdatePeriod(): void {
    const period: Period = calculateNextPeriodDates();
    const now5MinLater = new Date(Date.now() + 80 * 60000);
    const now10MinLater = new Date(Date.now() + 90 * 60000);

    const testPeriod: Period = {
      id: 1,
      startDate: now5MinLater.toISOString(),
      endDate: now10MinLater.toISOString(),
    };

    this.periodService.update(1, testPeriod).subscribe({
      next: (periodResponse) => {
        this.period = periodResponse;
        this.formatedPeriod = this.convertToFormatedPeriod(periodResponse);
        this.startCountdown(new Date(periodResponse.startDate));
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
   * Planifie le nettoyage des données du hackathon à minuit
   */
  private scheduleEndOfDayCleanup(): void {
    // Calculer le temps jusqu'à minuit
    const now = new Date();
    const midnight = new Date();

    midnight.setHours(24, 0, 0, 0);

    console.log('🕛 Nettoyage programmé pour minuit:', midnight);

    // Démarrer le compte à rebours jusqu'à minuit
    const testMidnight = new Date(Date.now() + 5 * 60000);
    this.startCountdown(testMidnight);

    // Vérifier toutes les secondes si on a atteint minuit
    this.cleanupInterval = setInterval(() => {
      const currentTime = new Date();
      if (currentTime >= testMidnight) {
        this.performEndOfDayCleanup();
      }
    }, 1000);
  }

  /**
   * Effectue le nettoyage de fin de journée - transition vers EN_ATTENTE
   */
  private performEndOfDayCleanup(): void {
    console.log('🧹 Début du nettoyage de fin de journée...');
    this.clearCleanupInterval();

    // Remettre le statut à EN_ATTENTE d'abord, puis supprimer les données
    this.statusService.setEnAttente().subscribe({
      next: (response) => {
        console.log('✅ Statut remis à EN_ATTENTE');
        this.status = response.state;
        this.countdown.title = 'Le hackathon commence bientôt';
        this.resetCountdownDisplay();

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
   * Supprime toutes les données du hackathon (hackathon, équipes, jury, participants)
   */
  private deleteAllHackathonData(): void {
    // Supprimer le hackathon
    this.hackathonService.deleteAll().subscribe({
      next: () => {
        console.log('✅ Hackathon supprimé');
      },
      error: (err: any) => {
        console.error('❌ Erreur lors de la suppression du hackathon:', err);
      },
    });

    // Supprimer toutes les équipes
    this.teamService.deleteAll().subscribe({
      next: () => {
        console.log('✅ Équipes supprimées');
        this.teams = [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Erreur lors de la suppression des équipes:', err);
      },
    });

    // Supprimer tous les membres du jury
    this.juryMemberService.deleteAll().subscribe({
      next: () => {
        console.log('✅ Membres du jury supprimés');
        this.juryMembers = [];
        this.juryCount = 0;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Erreur lors de la suppression des membres du jury:', err);
      },
    });

    // Supprimer tous les participants
    this.participantService.deleteAll().subscribe({
      next: () => {
        console.log('✅ Participants supprimés');
        this.participants = [];
        this.participantsCount = 0;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Erreur lors de la suppression des participants:', err);
      },
    });

    console.log('🎉 Nettoyage terminé, prêt pour le prochain hackathon!');
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
}
