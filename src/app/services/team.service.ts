import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';
import { Participant } from './participant.service';

export interface TeamMember {
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface Team {
  id?: number;
  name?: string;
  participants: Participant[] | string[];
}

export interface TeamsResponse {
  _embedded?: {
    teamEntities: Team[];
  };
  content?: Team[];
  teams?: Team[];
}

/** Service pour gérer les appels API relatifs aux équipes */
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly baseUrl = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) {}

  createAll(generateResponse: Team[]): Observable<Team[]> {
    return this.http.post<Team[]>(this.baseUrl + '/add', generateResponse);
  }

  /** Récupère la liste complète des équipes */
  getAll(): Observable<TeamsResponse> {
    return this.http.get<TeamsResponse>(this.baseUrl + '/all');
  }

  /** Récupère une équipe par son ID */
  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${id}`);
  }

  /** Crée une nouvelle équipe */
  create(team: Team): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, team);
  }

  /** Met à jour une équipe existante */
  update(id: number, team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.baseUrl}/${id}`, team);
  }

  /** Supprime une équipe */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Supprime toutes les équipes */
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete`);
  }
}
