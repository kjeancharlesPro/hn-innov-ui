import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * Service de construction de payload pour l'API.
 * Principe SOLID: Single Responsibility - Construit uniquement les payloads.
 * Principe SOLID: Open/Closed - Facilement extensible pour de nouveaux types.
 */
@Injectable({
  providedIn: 'root',
})
export class PayloadBuilderService {
  /**
   * Construit le payload pour l'inscription d'un participant.
   * @param form Le formulaire contenant les données
   * @returns Payload formaté pour l'API
   */
  buildParticipantPayload(form: FormGroup): any {
    const hasIdea = form.get('hasIdea')?.value;
    const payload: any = {
      firstName: form.get('firstName')?.value,
      lastName: form.get('lastName')?.value,
      email: form.get('email')?.value,
      skill: form.get('skill')?.value,
    };

    if (hasIdea === 'adopt') {
      payload.subject = form.get('selectedIssue')?.value;
    } else if (hasIdea === 'propose') {
      payload.subject = {
        title: form.get('title')?.value,
        description: form.get('description')?.value,
        problem: form.get('problem')?.value,
        innovation: form.get('innovation')?.value,
      };
    }

    return payload;
  }

  /**
   * Construit le payload pour l'inscription d'un membre du jury.
   * @param form Le formulaire contenant les données
   * @returns Payload formaté pour l'API
   */
  buildJuryMemberPayload(form: FormGroup): any {
    const hasIdea = form.get('hasIdea')?.value;
    const payload: any = {
      firstName: form.get('firstName')?.value,
      lastName: form.get('lastName')?.value,
      email: form.get('email')?.value,
    };

    if (hasIdea === 'adopt') {
      payload.subject = form.get('selectedIssue')?.value;
    } else if (hasIdea === 'propose') {
      payload.subject = {
        title: form.get('title')?.value,
        description: form.get('description')?.value,
        problem: form.get('problem')?.value,
        innovation: form.get('innovation')?.value,
      };
    }

    return payload;
  }

  /**
   * Construit le payload selon le rôle.
   * @param form Le formulaire
   * @param role Le rôle (participant ou jury)
   * @returns Payload formaté
   */
  buildPayload(form: FormGroup, role: string): any {
    return role === 'jury' ? this.buildJuryMemberPayload(form) : this.buildParticipantPayload(form);
  }
}
