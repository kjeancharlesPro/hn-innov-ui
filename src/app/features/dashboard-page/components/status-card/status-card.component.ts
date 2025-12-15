import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col gap-4 rounded-xl bg-white/5 bg-card-dark p-6 justify-start text-center h-full min-h-[150px]"
    >
      <h3 class="text-sm font-semibold text-white/80 font-display">Statut du hackathon</h3>

      @if(loading) {
      <div class="flex items-center justify-center py-6">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      } @else if(status === 'EN_ATTENTE') {
      <span
        class="inline-flex items-center justify-center rounded-full bg-primary/20 px-8 py-3 text-xl font-bold text-primary"
      >
        En attente
      </span>
      } @else if (status === 'EN_PREPARATION') {
      <span
        class="inline-flex items-center justify-center rounded-full bg-secondary/20 px-8 py-3 text-xl font-bold text-secondary"
      >
        En préparation
      </span>
      } @else if(status === 'EN_COURS') {
      <span
        class="inline-flex items-center justify-center rounded-full bg-primary/20 px-8 py-3 text-xl font-bold text-primary"
      >
        En cours
      </span>
      } @else if(status === 'TERMINE') {
      <span
        class="inline-flex items-center justify-center rounded-full bg-secondary/30 px-8 py-3 text-xl font-bold text-secondary"
      >
        Terminé
      </span>
      }
    </div>
  `,
})
export class StatusCardComponent {
  @Input() status: string | null = '';
  @Input() loading: boolean = false;
}
