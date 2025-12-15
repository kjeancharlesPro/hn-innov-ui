/** Constantes du dashboard hackathon */

export const DASHBOARD_CONSTANTS = {
  MIN_PARTICIPANTS: 4,
  MIN_JURY_MEMBERS: 1,
  MIN_DAYS_BETWEEN_PERIODS: 6,
  DEFAULT_START_HOUR: 15,
  HACKATHON_START_DAY: 3,
  HACKATHON_DURATION_DAYS: 2,

  // Configuration des tests (en minutes)
  TEST_START_OFFSET_MINUTES: 5, // Début dans 5 minutes (préparation)
  TEST_END_OFFSET_MINUTES: 10, // Fin dans 10 minutes (en cours = 5 min)
  TEST_CLEANUP_OFFSET_MINUTES: 5, // Nettoyage dans 5 minutes après fin

  // Configuration du polling
  STATUS_CHECK_INTERVAL_MS: 5000, // Vérification toutes les 5 secondes
  CLEANUP_CHECK_INTERVAL_MS: 1000, // Vérification nettoyage toutes les secondes
  DATA_RELOAD_DELAY_MS: 1000, // Délai avant rechargement des données

  // IDs par défaut
  DEFAULT_PERIOD_ID: 1,
  DEFAULT_HACKATHON_ID: 1,
} as const;

export const COUNTDOWN_TITLES = {
  EN_COURS: 'Le hackathon a commencé',
  TERMINE: 'Le hackathon est fini',
  EN_PREPARATION: 'Le hackathon commence bientôt',
  EN_ATTENTE: '',
} as const;
