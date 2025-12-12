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
    {
      question: 'Lorem ipsum dolor sit amet?',
      answer:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      isOpen: false,
    },
    {
      question: 'Consectetur adipiscing elit sed?',
      answer:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      isOpen: false,
    },
    {
      question: 'Eiusmod tempor incididunt labore?',
      answer:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      isOpen: false,
    },
    {
      question: 'Quis nostrud exercitation ullamco?',
      answer:
        'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
      isOpen: false,
    },
    {
      question: 'Magna aliqua enim minim veniam?',
      answer:
        'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
      isOpen: false,
    },
    {
      question: 'Ut labore et dolore magna aliqua?',
      answer:
        'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
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
