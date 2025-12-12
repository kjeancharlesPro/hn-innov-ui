/** Constantes du dashboard hackathon */

export const DASHBOARD_CONSTANTS = {
  MIN_PARTICIPANTS: 3,
  MIN_JURY_MEMBERS: 1,
  MIN_DAYS_BETWEEN_PERIODS: 6,
  DEFAULT_START_HOUR: 15,
  HACKATHON_START_DAY: 3,
  HACKATHON_DURATION_DAYS: 2,
} as const;

export const COUNTDOWN_TITLES = {
  EN_COURS: 'Le hackathon a commencé',
  TERMINE: 'Le hackathon est fini',
  EN_PREPARATION: 'Le hackathon commence bientôt',
  EN_ATTENTE: '',
} as const;
