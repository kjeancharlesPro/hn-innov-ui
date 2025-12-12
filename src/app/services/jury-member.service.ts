import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';

export interface JuryMember {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  description: string;
  problem: string;
  innovation: string;
}

export interface JuryMembersResponse {
  _embedded?: {
    juryMemberEntities: JuryMember[];
  };
  content?: JuryMember[];
}

/** Service pour gérer les appels API relatifs aux membres du jury */
@Injectable({
  providedIn: 'root',
})
export class JuryMemberService {
  private readonly baseUrl = `${environment.apiUrl}/jury-members`;

  constructor(private http: HttpClient) {}

  /** Récupère le nombre total de membres du jury */
  getCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  /** Récupère la liste complète des membres du jury */
  getAll(): Observable<JuryMembersResponse> {
    return this.http.get<JuryMembersResponse>(this.baseUrl);
  }

  /** Récupère un membre du jury par son ID */
  getById(id: number): Observable<JuryMember> {
    return this.http.get<JuryMember>(`${this.baseUrl}/${id}`);
  }

  /** Crée un nouveau membre du jury */
  create(juryMember: JuryMember): Observable<JuryMember> {
    return this.http.post<JuryMember>(this.baseUrl, juryMember);
  }

  /** Met à jour un membre du jury existant */
  update(id: number, juryMember: JuryMember): Observable<JuryMember> {
    return this.http.put<JuryMember>(`${this.baseUrl}/${id}`, juryMember);
  }

  /** Supprime un membre du jury */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Supprime tous les membres du jury */
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete`);
  }
}
