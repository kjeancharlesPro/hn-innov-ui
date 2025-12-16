import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

/**
 * Service de validation des formulaires.
 * Principe SOLID: Single Responsibility - Gère uniquement les validations personnalisées.
 */
@Injectable({
  providedIn: 'root',
})
export class FormValidationService {
  /**
   * Validateur personnalisé pour vérifier que les emails correspondent.
   * @param group Le FormGroup contenant les champs email et emailConfirm
   * @returns Objet d'erreur si les emails ne correspondent pas, null sinon
   */
  emailMatchValidator(group: FormGroup): ValidationErrors | null {
    const email = group.get('email')?.value;
    const emailConfirm = group.get('emailConfirm')?.value;

    if (email && emailConfirm && email !== emailConfirm) {
      group.get('emailConfirm')?.setErrors({ emailMismatch: true });
      return { emailMismatch: true };
    }

    return null;
  }

  /**
   * Validateur pour le champ hasIdea.
   * @param control Le contrôle à valider
   * @returns Objet d'erreur si aucune option n'est sélectionnée, null sinon
   */
  hasIdeaValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === 'none' || !value) {
      return { required: true };
    }
    return null;
  }
}
