import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatedPeriod, Period } from '../../../../interfaces';

@Component({
  selector: 'app-period-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col gap-4 rounded-xl bg-white/5 bg-card-dark p-6 justify-start text-center h-full min-h-[150px]"
    >
      <h3 class="text-sm font-semibold text-white/80 font-display">Période</h3>

      @if(loading) {
      <div class="flex items-center justify-center py-6">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      } @else if(showDates) {
      <div class="flex items-center justify-center gap-2">
        <div class="flex flex-col items-center justify-center rounded-md bg-white/10 px-3 py-1">
          <span class="text-2xl font-bold text-gradient">
            {{ formatedPeriod.startDay }}
          </span>
          <span class="text-xs font-medium uppercase tracking-wider text-white/70">
            {{ formatedPeriod.startMonth }}
          </span>
        </div>
        <span class="text-xl font-bold text-white/80">-</span>
        <div class="flex flex-col items-center justify-center rounded-md bg-white/10 px-3 py-1">
          <span class="text-2xl font-bold text-gradient">
            {{ formatedPeriod.endDay }}
          </span>
          <span class="text-xs font-medium uppercase tracking-wider text-white/70">
            {{ formatedPeriod.endMonth }}
          </span>
        </div>
      </div>
      } @else {
      <div class="flex flex-col items-center justify-center gap-2">
        <p class="text-xs text-white/50">Dernier hackathon</p>
        <p class="text-lg font-semibold text-white/90">{{ lastHackathonDate || 'Aucun' }}</p>
        @if(daysSince > 0) {
        <p class="text-xs text-white/50">Il y a {{ daysSince }} jour(s)</p>
        }
      </div>
      }
    </div>
  `,
})
export class PeriodCardComponent {
  @Input() formatedPeriod!: FormatedPeriod;
  @Input() period!: Period;
  @Input() showDates = true;
  @Input() lastHackathonDate = '';
  @Input() daysSince = 0;
  @Input() loading = false;

  get periodEndDateFormatted(): string {
    if (!this.period?.endDate) return '';
    const endDate = new Date(this.period.endDate);
    return endDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
