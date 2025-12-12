import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';

/** Service pour gérer les appels API relatifs aux hackathons */
@Injectable({
  providedIn: 'root',
})
export class HackathonService {
  private readonly baseUrl = `${environment.apiUrl}/hackathons`;

  constructor(private http: HttpClient) {}

  deleteAll(): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/delete');
  }

  /** Récupère le hackathon actuel */
  get(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  /** Génère un nouveau hackathon avec les équipes */
  generate(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/generate`, {});
  }

  /** Récupère les équipes d'un hackathon */
  getTeams(hackathonId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${hackathonId}/teams`);
  }

  /** Récupère le membre du jury d'un hackathon */
  getJuryMember(hackathonId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${hackathonId}/juryMember`);
  }

  /** Supprime un hackathon */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
