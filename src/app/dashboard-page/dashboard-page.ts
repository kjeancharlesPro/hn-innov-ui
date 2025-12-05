import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { environment } from '../../env/env.prd';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit, OnDestroy {
  getTeamMembersDisplay(members: any[]) {
    if (!members || members.length === 0) {
      return '—';
    }
    return members.map((member) => `${member}`).join(', ');
  }
  loading = false;
  error: string | null = null;

  status: string | null = '';

  // counts
  juryCount: number | null = 0;
  participantsCount: number | null = 0;

  // existing lists (kept for other UI)
  juryMembers: any[] = [];
  participants: any[] = [];
  teams: any[] = [];

  // hackathon period
  startDateDay: string = '';
  startDateMonth: string = '';

  endDateDay: string = '';
  endDateMonth: string = '';

  // hackathon subject and description
  hackathonSubject: string = '';
  hackathonDescription: string = '';

  // Countdown title
  countdownTitle: string = 'Le hackathon commence bientôt';

  // Countdown to hackathon start
  countdownDays: number = 0;
  countdownHours: number = 0;
  countdownMinutes: number = 0;
  countdownSeconds: number = 0;
  private countdownInterval: any = null;
  private hackathonEndDate: Date | null = null;

  private sub: Subscription | null = null;
  previousPeriod: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Load jury member from localStorage if available
    this.loadJuryMemberFromStorage();
    this.fetch();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private loadJuryMemberFromStorage(): void {
    const savedJuryMember = localStorage.getItem('selectedJuryMember');
    if (savedJuryMember) {
      try {
        const juryMember = JSON.parse(savedJuryMember);
        console.log('📖 Membre du jury récupéré depuis localStorage:', juryMember);

        // Extract subject (idea) and description from jury member
        this.hackathonSubject = juryMember.idea || juryMember.subject || '';
        this.hackathonDescription = juryMember.subjectDescription || juryMember.description || '';

        this.cdr.detectChanges();
      } catch (error) {
        console.error('❌ Erreur lors du parsing du jury member depuis localStorage:', error);
      }
    }
  }

  private startCountdown(targetDate: Date): void {
    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        this.countdownDays = 0;
        this.countdownHours = 0;
        this.countdownMinutes = 0;
        this.countdownSeconds = 0;

        // Check current status to determine action
        if (this.status === 'EN_PREPARATION') {
          console.log('🎉 Le hackathon commence maintenant !');

          // Update status to EN_COURS
          this.http.put(`${environment.apiUrl}/status/1`, { state: 'EN_COURS' }).subscribe({
            next: (statusResponse: any) => {
              console.log('✅ Statut mis à jour vers EN_COURS:', statusResponse);
              this.status = statusResponse.state;
              this.countdownTitle = 'Le hackathon a commencé';

              // Generate teams
              this.http.get(`${environment.apiUrl}/teams/generate`).subscribe({
                next: (generateResponse) => {
                  console.log('✅ Équipes générées avec succès:', generateResponse);

                  // Get all teams
                  this.http.get<any>(`${environment.apiUrl}/teams`).subscribe({
                    next: (teamsResponse) => {
                      console.log('📋 Liste des équipes:', teamsResponse);

                      // Update teams list
                      if (teamsResponse) {
                        this.teams = Array.isArray(teamsResponse)
                          ? teamsResponse
                          : teamsResponse._embedded?.teamEntities
                          ? teamsResponse._embedded.teamEntities
                          : teamsResponse.content
                          ? teamsResponse.content
                          : [];
                      }

                      // Get a random jury member and save to localStorage
                      if (this.juryMembers && this.juryMembers.length > 0) {
                        const randomIndex = Math.floor(Math.random() * this.juryMembers.length);
                        const randomJuryMember = this.juryMembers[randomIndex];

                        console.log('👨‍⚖️ Membre du jury sélectionné au hasard:', randomJuryMember);

                        // Save to localStorage
                        localStorage.setItem(
                          'selectedJuryMember',
                          JSON.stringify(randomJuryMember)
                        );
                        console.log('💾 Membre du jury sauvegardé dans localStorage');

                        // Update hackathon subject and description
                        this.hackathonSubject =
                          randomJuryMember.idea || randomJuryMember.subject || '';
                        this.hackathonDescription =
                          randomJuryMember.subjectDescription || randomJuryMember.description || '';
                      } else {
                        console.warn('⚠️ Aucun membre du jury disponible pour la sélection');
                      }

                      // Start countdown to end date
                      if (this.hackathonEndDate) {
                        console.log(
                          '⏰ Démarrage du compte à rebours vers la fin:',
                          this.hackathonEndDate
                        );
                        this.startCountdown(this.hackathonEndDate);
                      }

                      this.cdr.detectChanges();
                    },
                    error: (err) => {
                      console.error('❌ Erreur lors de la récupération des équipes:', err);
                      this.cdr.detectChanges();
                    },
                  });
                },
                error: (err) => {
                  console.error('❌ Erreur lors de la génération des équipes:', err);
                  this.cdr.detectChanges();
                },
              });
            },
            error: (err) => {
              console.error('❌ Erreur lors de la mise à jour du statut:', err);
            },
          });
        } else if (this.status === 'EN_COURS') {
          console.log('🏁 Le hackathon est terminé !');

          // Update status to TERMINE
          this.http.put(`${environment.apiUrl}/status/1`, { state: 'TERMINE' }).subscribe({
            next: (statusResponse: any) => {
              console.log('✅ Statut mis à jour vers TERMINE:', statusResponse);
              this.status = statusResponse.state;
              this.countdownTitle = 'Le hackathon est fini';

              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('❌ Erreur lors de la mise à jour du statut vers TERMINE:', err);
            },
          });
        }

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        return;
      }

      this.countdownDays = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.countdownHours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.countdownMinutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.countdownSeconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.cdr.detectChanges();
    };

    // Initial update
    updateCountdown();

    // Update every second
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    const participantsCount$ = this.http
      .get<number>(`${environment.apiUrl}/participants/count`)
      .pipe(
        catchError((err) => {
          console.error('participants/count error', err);
          return of(null);
        })
      );

    const juryCount$ = this.http.get<number>(`${environment.apiUrl}/jury-members/count`).pipe(
      catchError((err) => {
        console.error('jury-members/count error', err);
        return of(null);
      })
    );

    const juryList$ = this.http.get<any>(`${environment.apiUrl}/jury-members`).pipe(
      catchError((err) => {
        console.error('jury-members list error', err);
        return of(null);
      })
    );

    const participantsList$ = this.http.get<any>(`${environment.apiUrl}/participants`).pipe(
      catchError((err) => {
        console.error('participants list error', err);
        return of(null);
      })
    );

    const status$ = this.http.get<any>(`${environment.apiUrl}/status/1`).pipe(
      catchError((err) => {
        console.error('status error', err);
        return of(null);
      })
    );

    const previousPeriod$ = this.http
      .get<any>(
        `${environment.apiUrl}/periods/search/findFirstByEndDateLessThanEqualOrderByEndDateDesc?targetDate=` +
          new Date().toISOString().replace('Z', '')
      )
      .pipe(
        catchError((err) => {
          console.error('previousPeriod error', err);
          return of(null);
        })
      );

    // Get the most recent period (including future ones)
    const currentPeriod$ = this.http
      .get<any>(`${environment.apiUrl}/periods?sort=startDate,desc&size=1`)
      .pipe(
        catchError((err) => {
          console.error('currentPeriod error', err);
          return of(null);
        })
      );

    const teamsList$ = this.http.get<any>(`${environment.apiUrl}/teams`).pipe(
      catchError((err) => {
        console.error('teams list error', err);
        return of(null);
      })
    );

    this.sub = forkJoin({
      participantsCount: participantsCount$,
      juryCount: juryCount$,
      juryList: juryList$,
      participantsList: participantsList$,
      status: status$,
      previousPeriod: previousPeriod$,
      currentPeriod: currentPeriod$,
      teamsList: teamsList$,
    }).subscribe({
      next: (res) => {
        this.participantsCount = res.participantsCount;
        this.juryCount = res.juryCount;

        this.juryMembers = res.juryList._embedded.juryMemberEntities;
        this.participants = res.participantsList._embedded.participantEntities;

        // Parse teams list
        if (res.teamsList) {
          this.teams = Array.isArray(res.teamsList)
            ? res.teamsList
            : res.teamsList._embedded?.teamEntities
            ? res.teamsList._embedded.teamEntities
            : res.teamsList.content
            ? res.teamsList.content
            : [];
        } else {
          this.teams = [];
        }

        this.status = res.status.state;
        this.previousPeriod = res.previousPeriod;

        console.log('Fetch results:', res);

        // Check if we have a current period and status is EN_PREPARATION or EN_COURS
        const currentPeriodData =
          res.currentPeriod?._embedded?.periodEntities?.[0] ||
          res.currentPeriod?.content?.[0] ||
          null;

        if (currentPeriodData && (this.status === 'EN_PREPARATION' || this.status === 'EN_COURS')) {
          console.log('📅 Utilisation de la période actuelle:', currentPeriodData);

          const start = new Date(currentPeriodData.startDate);
          const end = new Date(currentPeriodData.endDate);

          this.hackathonEndDate = end;

          const startDay = start.getDate();
          const startMonth = start.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');

          const endDay = end.getDate();
          const endMonth = end.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');

          this.startDateDay = String(startDay);
          this.startDateMonth = startMonth;

          this.endDateDay = String(endDay);
          this.endDateMonth = endMonth;

          // Start countdown based on status
          if (this.status === 'EN_PREPARATION') {
            console.log('⏰ Démarrage du compte à rebours vers le début:', start);
            this.startCountdown(start);
          } else if (this.status === 'EN_COURS') {
            console.log('⏰ Démarrage du compte à rebours vers la fin:', end);
            this.startCountdown(end);
          }
        }

        // Update countdown title based on status
        if (this.status === 'EN_COURS') {
          this.countdownTitle = 'Le hackathon a commencé';
        } else if (this.status === 'TERMINE') {
          this.countdownTitle = 'Le hackathon est fini';
        } else if (this.status === 'EN_PREPARATION') {
          this.countdownTitle = 'Le hackathon commence bientôt';
        } else {
          this.countdownTitle = '';
        }

        // Only check conditions if status is EN_ATTENTE
        if (this.status === 'EN_ATTENTE' && this.previousPeriod) {
          const now = new Date().getTime();
          const endDate = new Date(this.previousPeriod.endDate).getTime();
          const dayDiff = now - endDate;
          const dayDiffInDays = dayDiff / (1000 * 60 * 60 * 24);

          if (
            this.juryCount != null &&
            this.juryCount > 0 &&
            this.participantsCount != null &&
            this.participantsCount > 3 &&
            dayDiffInDays > 6
          ) {
            console.log('🚀 Conditions remplies - Déclenchement de la préparation du hackathon');
            console.log(
              `Jury: ${this.juryCount}, Participants: ${
                this.participantsCount
              }, Jours passés: ${Math.floor(dayDiffInDays)}`
            );

            // Update status to EN_PREPARATION
            this.http.put(`${environment.apiUrl}/status/1`, { state: 'EN_PREPARATION' }).subscribe({
              next: (response: any) => {
                console.log('✅ Statut mis à jour avec succès:', response);
                this.status = response.state;
                this.countdownTitle = 'Le hackathon commence bientôt';

                // Calculate next Wednesday at 15h and Friday at 15h
                const now = new Date();
                const currentDay = now.getDay();

                let daysUntilNextWednesday = (3 - currentDay + 7) % 7;
                if (daysUntilNextWednesday === 0 || now.getHours() >= 15) {
                  daysUntilNextWednesday += 7;
                } else if (daysUntilNextWednesday > 0 && currentDay < 3) {
                  daysUntilNextWednesday += 7;
                }

                const nextWednesday = new Date(now);
                nextWednesday.setDate(now.getDate() + daysUntilNextWednesday);
                nextWednesday.setHours(15, 0, 0, 0);

                const nextFriday = new Date(nextWednesday);
                nextFriday.setDate(nextWednesday.getDate() + 2);
                nextFriday.setHours(15, 0, 0, 0);

                console.log('📅 Nouvelle période:', {
                  startDate: nextWednesday.toISOString(),
                  endDate: nextFriday.toISOString(),
                });

                const newPeriod = {
                  startDate: nextWednesday.toISOString(),
                  endDate: nextFriday.toISOString(),
                };

                this.http.post(`${environment.apiUrl}/periods`, newPeriod).subscribe({
                  next: (periodResponse: any) => {
                    console.log('✅ Nouvelle période créée avec succès:', periodResponse);

                    //const start = new Date(periodResponse.startDate);
                    //const end = new Date(periodResponse.endDate);

                    const start = new Date(now.getTime() + 0.5 * 60 * 1000); // 1 minute from now
                    const end = new Date(now.getTime() + 1 * 60 * 1000); // 2 minutes from now

                    //this.hackathonEndDate = endDate;

                    this.hackathonEndDate = end;

                    const startDay = start.getDate();
                    const startMonth = start
                      .toLocaleDateString('fr-FR', { month: 'short' })
                      .replace('.', '');

                    const endDay = end.getDate();
                    const endMonth = end
                      .toLocaleDateString('fr-FR', { month: 'short' })
                      .replace('.', '');

                    this.startDateDay = String(startDay);
                    this.startDateMonth = startMonth;

                    this.endDateDay = String(endDay);
                    this.endDateMonth = endMonth;

                    this.startCountdown(start);
                    this.cdr.detectChanges();
                  },
                  error: (err) => {
                    console.error('❌ Erreur lors de la création de la période:', err);
                    this.cdr.detectChanges();
                  },
                });
              },
              error: (err) => {
                console.error('❌ Erreur lors de la mise à jour du statut:', err);
              },
            });
          } else {
            console.log('⏳ Conditions non remplies pour la préparation:');
            console.log(`- Jury: ${this.juryCount} (besoin > 0)`);
            console.log(`- Participants: ${this.participantsCount} (besoin > 3)`);
            console.log(`- Jours passés: ${Math.floor(dayDiffInDays)} (besoin > 6)`);
          }
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('fetchCounts forkJoin error', err);
        this.error = 'Impossible de récupérer les compteurs.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
