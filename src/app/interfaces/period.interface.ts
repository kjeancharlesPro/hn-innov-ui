/** Interface pour les dates de période du hackathon */
export interface FormatedPeriod {
  startDay: string;
  endDay: string;
  startMonth: string;
  endMonth: string;
}

export interface Period {
  id?: number;
  startDate: string;
  endDate: string;
}

export interface Periods {
  _embedded?: {
    periodEntities: Period[];
  };
  content?: Period[];
}
