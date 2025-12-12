import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';

export interface Participant {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  skill: string[];
}

export interface ParticipantsResponse {
  _embedded?: {
    participantEntities: Participant[];
  };
  content?: Participant[];
}

/** Service pour gérer les appels API relatifs aux participants */
@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly baseUrl = `${environment.apiUrl}/participants`;

  constructor(private http: HttpClient) {}

  deleteAll(): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/delete');
  }
  /** Récupère le nombre total de participants */
  getCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  /** Récupère la liste complète des participants */
  getAll(): Observable<ParticipantsResponse> {
    return this.http.get<ParticipantsResponse>(this.baseUrl);
  }

  /** Récupère un participant par son ID */
  getById(id: number): Observable<Participant> {
    return this.http.get<Participant>(`${this.baseUrl}/${id}`);
  }

  /** Crée un nouveau participant */
  create(participant: Participant): Observable<Participant> {
    return this.http.post<Participant>(this.baseUrl, participant);
  }

  /** Met à jour un participant existant */
  update(id: number, participant: Participant): Observable<Participant> {
    return this.http.put<Participant>(`${this.baseUrl}/${id}`, participant);
  }

  /** Supprime un participant */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
