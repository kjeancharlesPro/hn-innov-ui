import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';

/**
 * Service pour gérer les opérations liées aux hackathons.
 * Permet la récupération, la génération et la suppression de hackathons.
 */
@Injectable({
  providedIn: 'root',
})
export class HackathonService {
  private readonly baseUrl = `${environment.apiUrl}/hackathons`;

  constructor(private http: HttpClient) {}

  /**
   * Supprime tous les hackathons.
   * @returns Observable vide
   */
  deleteAll(): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/delete');
  }

  /**
   * Récupère la liste des hackathons.
   * @returns Observable contenant les hackathons au format HATEOAS
   */
  get(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  /**
   * Génère un nouveau hackathon avec les équipes.
   * Crée automatiquement les équipes à partir des participants inscrits.
   * @returns Observable contenant le hackathon généré et ses équipes
   */
  generate(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/generate`, {});
  }

  /**
   * Récupère les équipes d'un hackathon spécifique.
   * @param hackathonId ID du hackathon
   * @returns Observable contenant les équipes
   */
  getTeams(hackathonId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${hackathonId}/teams`);
  }

  /**
   * Récupère le membre du jury assigné à un hackathon.
   * Le jury membre définit le sujet/thème du hackathon.
   * @param hackathonId ID du hackathon
   * @returns Observable contenant les informations du membre du jury
   */
  getJuryMember(hackathonId: number | null): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${hackathonId}/juryMember`);
  }

  /** Supprime un hackathon */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
