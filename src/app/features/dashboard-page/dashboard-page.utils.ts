/** Utilitaires pour le Dashboard - gestion dates, formatage et calculs */

import { Period } from '../../interfaces';
import { Participant } from '../../services';

/** Calcule les dates de la prochaine période (mercredi et vendredi à 15h) */
export function calculateNextPeriodDates(): Period {
  const now = new Date();

  const currentDay = now.getDay();
  let daysUntilNextWednesday = (3 - currentDay + 7) % 7;

  if (daysUntilNextWednesday === 0 && now.getHours() >= 15) {
    daysUntilNextWednesday = 7;
  } else if (daysUntilNextWednesday === 0) {
    daysUntilNextWednesday = 7;
  }

  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + daysUntilNextWednesday);
  nextWednesday.setHours(15, 0, 0, 0);

  const nextFriday = new Date(nextWednesday);
  nextFriday.setDate(nextWednesday.getDate() + 2);
  nextFriday.setHours(15, 0, 0, 0);

  return {
    startDate: nextWednesday.toISOString(),
    endDate: nextFriday.toISOString(),
  };
}

/** Calcule le nombre de jours écoulés entre deux dates */
export function calculateDaysSince(startDate: Date, endDate: Date = new Date()): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return timeDiff / (1000 * 60 * 60 * 24);
}

/** Formate une date en composants jour et mois */
export function formatDateComponents(
  date: Date,
  locale: string = 'fr-FR'
): { day: string; month: string } {
  const day = String(date.getDate());
  const month = date.toLocaleDateString(locale, { month: 'short' }).replace('.', '');
  return { day, month };
}

/** Décompose une durée en jours, heures, minutes et secondes */
export function calculateTimeComponents(distance: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

/** Formate l'affichage des membres d'une équipe */
export function formatTeamMembers(participants: Participant[] | null | undefined): string {
  if (!participants || participants.length === 0) return '—';
  return participants
    .map((participant) => `${participant.firstName.substring(0, 1)} ${participant.lastName}`)
    .join(', ');
}

/** Extrait la liste des équipes depuis différents formats API */
export function extractTeamsList(teamsList: any): any[] {
  if (!teamsList) return [];
  if (Array.isArray(teamsList)) return teamsList;
  return teamsList._embedded?.teamEntities || teamsList.content || [];
}

/** Extrait une liste d'entités depuis une réponse API HAL */
export function extractEntitiesList(response: any, entityName: string): any[] {
  return response?._embedded?.[entityName] || [];
}

/** Extrait les données de période depuis différents formats API */
export function extractPeriodData(periodResponse: any): any {
  return periodResponse?._embedded?.periodEntities?.[0] || null;
}

/** Sélectionne un élément aléatoire dans un tableau */
export function selectRandomElement<T>(array: T[]): T | null {
  if (!array || array.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/** Crée des dates de test pour le développement */
export function createTestDates(
  now: Date,
  startOffsetMinutes: number = 10,
  endOffsetMinutes: number = 10
): { start: Date; end: Date } {
  const start = new Date(now.getTime() + startOffsetMinutes * 60 * 1000);
  const end = new Date(now.getTime() + endOffsetMinutes * 60 * 1000);
  return { start, end };
}

// Re-exports
export type { HackathonStatus } from '../../interfaces';
export * from '../../constantes';
