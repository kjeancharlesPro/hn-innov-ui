import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';
import type { HackathonStatus } from '../features/dashboard-page/dashboard-page.utils';

/**
 * Interface représentant le statut du hackathon.
 */
export interface Status {
  /** ID du statut */
  id?: number;
  /** État actuel du hackathon */
  state: HackathonStatus;
}

/**
 * Service pour gérer le statut du hackathon.
 * Permet de récupérer et modifier l'état du hackathon (EN_ATTENTE, EN_PREPARATION, EN_COURS, TERMINE).
 */
@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private readonly baseUrl = `${environment.apiUrl}/status`;

  constructor(private http: HttpClient) {}

  /** Récupère le statut actuel du hackathon */
  getCurrent(): Observable<Status> {
    return this.http.get<Status>(`${this.baseUrl}/1`);
  }

  /** Met à jour le statut du hackathon */
  update(state: HackathonStatus): Observable<Status> {
    return this.http.put<Status>(`${this.baseUrl}/1`, { state });
  }

  /** Passe au statut EN_PREPARATION */
  setEnPreparation(): Observable<Status> {
    return this.update('EN_PREPARATION');
  }

  /** Passe au statut EN_COURS */
  setEnCours(): Observable<Status> {
    return this.update('EN_COURS');
  }

  /** Passe au statut TERMINE */
  setTermine(): Observable<Status> {
    return this.update('TERMINE');
  }

  /** Passe au statut EN_ATTENTE */
  setEnAttente(): Observable<Status> {
    return this.update('EN_ATTENTE');
  }
}
