import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Countdown } from '../interfaces/countdown.interface';
import { calculateTimeComponents } from '../features/dashboard-page/dashboard-page.utils';

/**
 * Service de gestion du compte à rebours.
 * Principe SOLID: Single Responsibility - Gère uniquement le countdown.
 * Principe SOLID: Dependency Inversion - Utilise des abstractions (Observable).
 */
@Injectable({
  providedIn: 'root',
})
export class CountdownService {
  private countdownSubject = new BehaviorSubject<Countdown>({
    title: 'Le hackathon commence bientôt',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hadEnded: false,
  });

  private intervalId: any = null;

  /**
   * Observable du countdown pour s'abonner aux changements.
   */
  countdown$: Observable<Countdown> = this.countdownSubject.asObservable();

  /**
   * Démarre le compte à rebours vers une date cible.
   * @param targetDate Date cible du compte à rebours
   * @param title Titre du compte à rebours
   * @param onEnd Callback à exécuter quand le countdown se termine
   */
  startCountdown(targetDate: Date, title?: string, onEnd?: () => void): void {
    this.stopCountdown();

    if (title) {
      const current = this.countdownSubject.value;
      this.countdownSubject.next({ ...current, title });
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        this.handleCountdownEnd(onEnd);
        return;
      }

      this.updateCountdownDisplay(distance);
    };

    updateCountdown();
    this.intervalId = setInterval(updateCountdown, 1000);
  }

  /**
   * Arrête le compte à rebours.
   */
  stopCountdown(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Réinitialise le compte à rebours.
   * @param title Nouveau titre
   */
  resetCountdown(title: string = 'Le hackathon commence bientôt'): void {
    this.stopCountdown();
    this.countdownSubject.next({
      title,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hadEnded: false,
    });
  }

  /**
   * Met à jour le titre du countdown.
   * @param title Nouveau titre
   */
  updateTitle(title: string): void {
    const current = this.countdownSubject.value;
    this.countdownSubject.next({ ...current, title });
  }

  /**
   * Retourne la valeur actuelle du countdown.
   */
  getCurrentCountdown(): Countdown {
    return this.countdownSubject.value;
  }

  /**
   * Gère la fin du compte à rebours.
   */
  private handleCountdownEnd(onEnd?: () => void): void {
    const current = this.countdownSubject.value;
    this.countdownSubject.next({
      ...current,
      hadEnded: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    this.stopCountdown();

    if (onEnd) {
      onEnd();
    }
  }

  /**
   * Met à jour l'affichage du compte à rebours.
   */
  private updateCountdownDisplay(distance: number): void {
    const { days, hours, minutes, seconds } = calculateTimeComponents(distance);
    const current = this.countdownSubject.value;

    this.countdownSubject.next({
      ...current,
      days,
      hours,
      minutes,
      seconds,
      hadEnded: false,
    });
  }
}
