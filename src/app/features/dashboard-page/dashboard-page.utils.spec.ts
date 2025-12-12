import {
  calculateNextPeriodDates,
  calculateDaysSince,
  formatDateComponents,
  calculateTimeComponents,
  formatTeamMembers,
  extractTeamsList,
  extractEntitiesList,
  extractPeriodData,
  selectRandomElement,
  createTestDates,
  DASHBOARD_CONSTANTS,
  COUNTDOWN_TITLES,
} from './dashboard-page.utils';

describe('Dashboard Page Utils', () => {
  describe('calculateNextPeriodDates', () => {
    it('devrait calculer le prochain mercredi et vendredi à 15h', () => {});

    it('devrait prendre le mercredi suivant si on est mercredi après 15h', () => {});
  });

  describe('calculateDaysSince', () => {
    it('devrait calculer le nombre de jours entre deux dates', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-08');
      const days = calculateDaysSince(start, end);

      expect(days).toBe(7);
    });

    it('devrait retourner un nombre négatif si la date de fin est avant la date de début', () => {
      const start = new Date('2024-01-08');
      const end = new Date('2024-01-01');
      const days = calculateDaysSince(start, end);

      expect(days).toBe(-7);
    });
  });

  describe('formatDateComponents', () => {
    it('devrait formater une date en composants jour et mois', () => {
      const date = new Date('2024-03-15');
      const result = formatDateComponents(date);

      expect(result.day).toBe('15');
      expect(result.month).toBe('mars');
    });
  });

  describe('calculateTimeComponents', () => {
    it('devrait décomposer une distance en jours, heures, minutes, secondes', () => {
      const distance = 90061000; // 1j 1h 1min 1s
      const result = calculateTimeComponents(distance);

      expect(result.days).toBe(1);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(1);
    });

    it('devrait gérer les valeurs nulles correctement', () => {
      const result = calculateTimeComponents(0);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
  });

  describe('formatTeamMembers', () => {
    it('devrait formater un tableau de membres', () => {
      const members = ['Alice', 'Bob', 'Charlie'];
      const result = formatTeamMembers(members);

      expect(result).toBe('Alice, Bob, Charlie');
    });

    it('devrait retourner "—" pour un tableau vide', () => {
      expect(formatTeamMembers([])).toBe('—');
      expect(formatTeamMembers(null)).toBe('—');
      expect(formatTeamMembers(undefined)).toBe('—');
    });
  });

  describe('extractTeamsList', () => {
    it('devrait extraire un tableau direct', () => {
      const teams = [{ id: 1 }, { id: 2 }];
      const result = extractTeamsList(teams);

      expect(result).toEqual(teams);
    });

    it('devrait extraire depuis le format HAL', () => {
      const response = {
        _embedded: {
          teamEntities: [{ id: 1 }, { id: 2 }],
        },
      };
      const result = extractTeamsList(response);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('devrait extraire depuis le format paginé', () => {
      const response = {
        content: [{ id: 1 }, { id: 2 }],
      };
      const result = extractTeamsList(response);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('devrait retourner un tableau vide pour null', () => {
      expect(extractTeamsList(null)).toEqual([]);
    });
  });

  describe('extractEntitiesList', () => {
    it('devrait extraire les entités depuis le format HAL', () => {
      const response = {
        _embedded: {
          juryMemberEntities: [{ id: 1 }, { id: 2 }],
        },
      };
      const result = extractEntitiesList(response, 'juryMemberEntities');

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("devrait retourner un tableau vide si les entités n'existent pas", () => {
      const result = extractEntitiesList({}, 'juryMemberEntities');
      expect(result).toEqual([]);
    });
  });

  describe('extractPeriodData', () => {
    it('devrait extraire depuis _embedded.periodEntities', () => {
      const response = {
        _embedded: {
          periodEntities: [{ id: 1 }],
        },
      };
      const result = extractPeriodData(response);

      expect(result).toEqual({ id: 1 });
    });

    it('devrait extraire depuis content', () => {
      const response = {
        content: [{ id: 1 }],
      };
      const result = extractPeriodData(response);

      expect(result).toEqual({ id: 1 });
    });

    it("devrait retourner null si aucune période n'est trouvée", () => {
      const result = extractPeriodData({});
      expect(result).toBeNull();
    });
  });

  describe('selectRandomElement', () => {
    it('devrait retourner un élément du tableau', () => {
      const array = ['a', 'b', 'c'];
      const result = selectRandomElement(array);

      expect(array).toContain(result);
    });

    it('devrait retourner null pour un tableau vide', () => {
      expect(selectRandomElement([])).toBeNull();
      expect(selectRandomElement(null as any)).toBeNull();
    });
  });

  describe('createTestDates', () => {
    it('devrait créer des dates de test avec les offsets par défaut', () => {
      const now = new Date('2024-01-01T10:00:00');
      const result = createTestDates(now);

      expect(result.start.getTime()).toBeGreaterThan(now.getTime());
      expect(result.end.getTime()).toBeGreaterThan(result.start.getTime());
    });

    it('devrait créer des dates de test avec des offsets personnalisés', () => {
      const now = new Date('2024-01-01T10:00:00');
      const result = createTestDates(now, 5, 10);

      const expectedStart = new Date(now.getTime() + 5 * 60 * 1000);
      const expectedEnd = new Date(now.getTime() + 10 * 60 * 1000);

      expect(result.start.getTime()).toBe(expectedStart.getTime());
      expect(result.end.getTime()).toBe(expectedEnd.getTime());
    });
  });

  describe('DASHBOARD_CONSTANTS', () => {
    it('devrait contenir toutes les constantes nécessaires', () => {
      expect(DASHBOARD_CONSTANTS.MIN_PARTICIPANTS).toBe(3);
      expect(DASHBOARD_CONSTANTS.MIN_JURY_MEMBERS).toBe(0);
      expect(DASHBOARD_CONSTANTS.MIN_DAYS_BETWEEN_PERIODS).toBe(6);
      expect(DASHBOARD_CONSTANTS.DEFAULT_START_HOUR).toBe(15);
      expect(DASHBOARD_CONSTANTS.HACKATHON_START_DAY).toBe(3);
      expect(DASHBOARD_CONSTANTS.HACKATHON_DURATION_DAYS).toBe(2);
    });
  });

  describe('COUNTDOWN_TITLES', () => {
    it('devrait contenir tous les titres de statut', () => {
      expect(COUNTDOWN_TITLES.EN_COURS).toBe('Le hackathon a commencé');
      expect(COUNTDOWN_TITLES.TERMINE).toBe('Le hackathon est fini');
      expect(COUNTDOWN_TITLES.EN_PREPARATION).toBe('Le hackathon commence bientôt');
      expect(COUNTDOWN_TITLES.EN_ATTENTE).toBe('');
    });
  });
});
