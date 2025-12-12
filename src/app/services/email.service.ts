import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';

/** Service pour gérer les envois d'emails */
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly baseUrl = environment.apiUrl + '/mails';

  constructor(private http: HttpClient) {}

  /** Envoie une invitation par email (pour statut EN_PREPARATION ou EN_COURS) */
  sendInvitation(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sendInvitation/${email}`, {});
  }

  /** Envoie une pré-invitation par email (pour statut EN_ATTENTE) */
  sendPreInvitation(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sendPreInvitation/${email}`, {});
  }

  /** Envoie des invitations à tous les inscrits */
  sendInvitations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sendInvitations`, {});
  }

  /** Envoie un email selon le statut du hackathon */
  sendRegistrationEmail(email: string, hackathonStatus: string) {
    if (hackathonStatus === 'EN_ATTENTE') {
      return this.sendPreInvitation(email);
    } else if (hackathonStatus === 'EN_PREPARATION') {
      return this.sendInvitation(email);
    } else {
      return this.sendInvitation(email);
    }
  }
}
