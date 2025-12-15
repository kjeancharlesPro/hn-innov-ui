import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StatusService } from './status.service';
import { HackathonService } from './hackathon.service';

/**
 * Service de gestion des transitions entre statuts du hackathon.
 * Principe SOLID: Single Responsibility - Gère uniquement les transitions de statut.
 * Principe SOLID: Dependency Inversion - Dépend d'abstractions (services injectés).
 */
@Injectable({
  providedIn: 'root',
})
export class StatusTransitionService {
  constructor(private statusService: StatusService, private hackathonService: HackathonService) {}

  /**
   * Effectue la transition vers EN_PREPARATION.
   * @returns Observable de la réponse
   */
  transitionToPreparation(): Observable<any> {
    return this.statusService.setEnPreparation();
  }

  /**
   * Effectue la transition vers EN_COURS.
   * Génère les équipes avant de changer le statut.
   * @returns Observable de la réponse
   */
  transitionToEnCours(): Observable<any> {
    return new Observable((observer) => {
      this.hackathonService.generate().subscribe({
        next: (generateResponse) => {
          this.statusService.setEnCours().subscribe({
            next: (statusResponse) => {
              observer.next({
                status: statusResponse,
                teams: generateResponse.teams,
              });
              observer.complete();
            },
            error: (err) => {
              console.error('❌ Erreur lors de la mise à jour du statut vers EN_COURS:', err);
              observer.error(err);
            },
          });
        },
        error: (err) => {
          console.error('❌ Erreur lors de la génération des équipes:', err);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Effectue la transition vers TERMINE.
   * @returns Observable de la réponse
   */
  transitionToTermine(): Observable<any> {
    return this.statusService.setTermine();
  }

  /**
   * Effectue la transition vers EN_ATTENTE.
   * @returns Observable de la réponse
   */
  transitionToEnAttente(): Observable<any> {
    return this.statusService.setEnAttente();
  }
}
