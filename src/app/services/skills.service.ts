import { Injectable } from '@angular/core';

export interface SkillInfo {
  value: string;
  option: string;
  title: string;
  descriptions: string[];
}

/**
 * Service de gestion des compétences.
 * Principe SOLID: Single Responsibility - Gère uniquement les données des compétences.
 */
@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  private readonly skills: Record<string, SkillInfo> = {
    Développeur: {
      value: 'Développeur',
      option: 'Développeur',
      title: 'Développeur',
      descriptions: [
        'Maîtrise des langages comme Java, Python, JavaScript, etc.',
        'Capacité à coder rapidement et à résoudre des problèmes techniques.',
      ],
    },
    Designer: {
      value: 'Designer',
      option: 'Designer',
      title: 'Designer',
      descriptions: [
        'Créent des interfaces intuitives et attractives.',
        "Pensent l'expérience utilisateur pour rendre le projet crédible et utilisable.",
      ],
    },
    'Chef de projet': {
      value: 'Chef de projet',
      option: 'Chef de projet',
      title: 'Chef de projet',
      descriptions: [
        "Structurent l'idée, définissent la vision et la stratégie.",
        'Assurent la cohérence entre innovation et faisabilité.',
      ],
    },
    Communicant: {
      value: 'Communicant',
      option: 'Communicant',
      title: 'Communicant',
      descriptions: [
        'Pitchent le projet devant le jury.',
        'Valorisation de la solution et storytelling pour convaincre.',
      ],
    },
  };

  /**
   * Retourne toutes les compétences disponibles.
   * @returns Liste des compétences
   */
  getAllSkills(): SkillInfo[] {
    return Object.values(this.skills);
  }

  /**
   * Retourne les informations d'une compétence spécifique.
   * @param skillValue La valeur de la compétence
   * @returns Les informations de la compétence ou null
   */
  getSkillInfo(skillValue: string): SkillInfo | null {
    return this.skills[skillValue] || null;
  }

  /**
   * Vérifie si une compétence existe.
   * @param skillValue La valeur de la compétence
   * @returns true si la compétence existe
   */
  hasSkill(skillValue: string): boolean {
    return skillValue in this.skills;
  }
}
