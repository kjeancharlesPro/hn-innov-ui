import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col gap-4 rounded-xl bg-white/5 bg-card-dark p-6 justify-start text-center h-full min-h-[150px]"
    >
      <h3 class="text-sm font-semibold text-white/80 font-display">Nombre d'inscrits</h3>
      <div class="flex justify-center items-center divide-x divide-border-dark">
        <div class="px-4">
          <p class="text-3xl font-bold text-primary">{{ participantsCount }}</p>
          <p class="text-sm text-white/70">Participants</p>
        </div>
        <div class="px-4">
          <p class="text-3xl font-bold text-primary">{{ juryCount }}</p>
          <p class="text-sm text-white/70">Jury</p>
        </div>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  @Input() participantsCount = 0;
  @Input() juryCount = 0;
}
