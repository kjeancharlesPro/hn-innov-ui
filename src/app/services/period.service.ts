import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';
import { Period, Periods } from '../interfaces';

/** Service pour gérer les appels API relatifs aux périodes de hackathon */
@Injectable({
  providedIn: 'root',
})
export class PeriodService {
  private readonly baseUrl = `${environment.apiUrl}/periods`;

  constructor(private http: HttpClient) {}

  /** Récupère toutes les périodes (triées par date de début décroissante) */
  getAll(size: number = 10): Observable<Periods> {
    return this.http.get<Periods>(`${this.baseUrl}?sort=startDate,desc&size=${size}`);
  }

  /** Récupère la période la plus récente */
  getCurrent(): Observable<Periods> {
    return this.getAll(1);
  }

  /** Récupère une période par son ID */
  getById(id: number): Observable<Period> {
    return this.http.get<Period>(`${this.baseUrl}/${id}`);
  }

  /**
   * Recherche la première période terminée avant une date cible
   * Utilisé pour trouver la période précédente
   */
  findPreviousPeriod(targetDate: string): Observable<Period> {
    const endpoint = `${this.baseUrl}/search/findFirstByEndDateLessThanEqualOrderByEndDateDesc`;
    return this.http.get<Period>(`${endpoint}?targetDate=${targetDate}`);
  }

  /**
   * Récupère la période précédente (terminée avant maintenant)
   */
  getPrevious(): Observable<Period> {
    const now = new Date().toISOString().replace('Z', '');
    return this.findPreviousPeriod(now);
  }

  /** Crée une nouvelle période */
  create(period: Period): Observable<Period> {
    return this.http.post<Period>(this.baseUrl, period);
  }

  /** Met à jour une période existante */
  update(id: number, period: Period): Observable<Period> {
    return this.http.put<Period>(`${this.baseUrl}/${id}`, period);
  }

  /** Supprime une période */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
