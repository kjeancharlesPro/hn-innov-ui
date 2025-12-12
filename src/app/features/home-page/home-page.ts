import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubjectService, Subject } from '../../services/subject.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private subjectService = inject(SubjectService);
  private cdr = inject(ChangeDetectorRef);

  isModalOpen = false;
  subjects: Subject[] = [];
  isLoading = false;

  isFaqModalOpen = false;
  faqs = [
    // Général
    { type: 'section', title: 'Général' },
    {
      type: 'faq',
      question: "Qu'est-ce qu'un hackathon ?",
      answer: "Évènement au cours duquel des développeurs se réunissent durant plusieurs jours autour d'un projet collaboratif de programmation informatique ou de création numérique.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Quand et où se déroulera le hackathon ?",
      answer: "Il commence le mercredi à 14h30 et se termine le vendredi à la même heure.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Quel est le thème ou le défi principal du hackathon ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y a-t-il des frais d'inscription ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Puis-je participer seul ou dois-je faire partie d'une équipe ?",
      answer: "Les équipes peuvent être à effectifs variables allant de 2 à 4 personnes.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Quelle est la taille maximale d'une équipe ?",
      answer: "Les équipes peuvent être composées de 2 à 4 participants.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Dois-je avoir des compétences techniques pour participer ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },

    // Inscription et Participation
    { type: 'section', title: 'Inscription et Participation' },
    {
      type: 'faq',
      question: "Comment puis-je m'inscrire au hackathon ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "La date limite d'inscription est-elle flexible ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Puis-je m'inscrire sur place le jour du hackathon ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Que dois-je apporter pour participer ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y a-t-il des restrictions d'âge pour participer ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },

    // Logistique
    { type: 'section', title: 'Logistique' },
    {
      type: 'faq',
      question: "Le hackathon est-il en présentiel, en ligne, ou les deux ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Quelles sont les heures d'ouverture et de fermeture du hackathon ?",
      answer: "Il commence le mercredi à 14h30 et se termine le vendredi à la même heure.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y a-t-il des repas ou des collations fournis ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Puis-je dormir sur place pendant le hackathon ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y a-t-il du matériel fourni (ordinateurs, accès internet, etc.) ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },

    // Développement et Projet
    { type: 'section', title: 'Développement et Projet' },
    {
      type: 'faq',
      question: "Quels sont les critères d'évaluation des projets ?",
      answer: "L’objectif est de réaliser un prototype répondant à la problématique de départ dans un temps imparti.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Puis-je utiliser des bibliothèques, frameworks ou outils existants ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y a-t-il des restrictions sur les technologies ou les outils à utiliser ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Dois-je présenter un projet fonctionnel ou un prototype ?",
      answer: "L’objectif est de réaliser un prototype répondant à la problématique de départ.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Combien de temps aurai-je pour présenter mon projet ?",
      answer: "La solution de chaque équipe sera présentée à un jury après la fin du compte à rebours.",
      isOpen: false,
    },

    // Prix et Reconnaissance
    { type: 'section', title: 'Prix et Reconnaissance' },
    {
      type: 'faq',
      question: "Quels sont les prix à gagner ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Comment les gagnants seront-ils sélectionnés ?",
      answer: "Le jury devra être présent le vendredi de fin du hackathon pour délibérer.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y a-t-il des prix spécifiques pour certaines catégories (ex. : meilleur design, meilleure innovation) ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Les projets gagnants seront-ils publiés ou partagés publiquement ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },

    // Sécurité et Confidentialité
    { type: 'section', title: 'Sécurité et Confidentialité' },
    {
      type: 'faq',
      question: "Comment mes données personnelles seront-elles utilisées ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y a-t-il des règles de confidentialité ou de propriété intellectuelle que je dois respecter ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },

    // Contact et Support
    { type: 'section', title: 'Contact et Support' },
    {
      type: 'faq',
      question: "Qui puis-je contacter en cas de questions ou de problèmes pendant le hackathon ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
    {
      type: 'faq',
      question: "Y aura-t-il des mentors ou des experts disponibles pour nous aider ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isOpen: false,
    },
  ];

  openIdeasModal() {
    this.isModalOpen = true;
    this.subjects = [];
    this.isLoading = true;
    this.loadSubjects();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openFaqModal() {
    this.isFaqModalOpen = true;
  }

  closeFaqModal() {
    this.isFaqModalOpen = false;
  }

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  private loadSubjects() {
    this.isLoading = true;
    console.log('Début du chargement des idées...', 'isLoading =', this.isLoading);

    this.subjectService.getAll().subscribe({
      next: (response) => {
        console.log('Réponse reçue:', response);
        this.subjects = response._embedded.subjectEntities || [];
        this.isLoading = false;
        console.log('isLoading après chargement =', this.isLoading);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des idées:', error);
        this.subjects = [];
        this.isLoading = false;
        console.log('isLoading après erreur =', this.isLoading);
        this.cdr.detectChanges();
      },
    });
  }
}
