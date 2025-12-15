import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Countdown } from '../../../../interfaces/countdown.interface';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-xl p-8 text-center shadow-2xl shadow-primary/20"
      style="background: linear-gradient(to right, #a94385, #5a3793);"
    >
      <h2 class="mb-2 text-center text-2xl font-bold text-white">
        {{ countdown.title }}
      </h2>
      <div class="mx-auto flex w-full max-w-2xl justify-center gap-3 py-4 sm:gap-6">
        <div class="flex flex-1 flex-col items-center gap-2">
          <div class="flex h-20 w-full items-center justify-center rounded-lg bg-white/20 lg:h-28">
            <p class="text-4xl font-bold tracking-tight text-white lg:text-6xl">
              {{ showValues ? countdown.days : '-' }}
            </p>
          </div>
          <p class="text-sm font-normal text-white/80">Jours</p>
        </div>
        <div class="flex flex-1 flex-col items-center gap-2">
          <div class="flex h-20 w-full items-center justify-center rounded-lg bg-white/20 lg:h-28">
            <p class="text-4xl font-bold tracking-tight text-white lg:text-6xl">
              {{ showValues ? countdown.hours : '-' }}
            </p>
          </div>
          <p class="text-sm font-normal text-white/80">Heures</p>
        </div>
        <div class="flex flex-1 flex-col items-center gap-2">
          <div class="flex h-20 w-full items-center justify-center rounded-lg bg-white/20 lg:h-28">
            <p class="text-4xl font-bold tracking-tight text-white lg:text-6xl">
              {{ showValues ? countdown.minutes : '-' }}
            </p>
          </div>
          <p class="text-sm font-normal text-white/80">Minutes</p>
        </div>
        <div class="flex flex-1 flex-col items-center gap-2">
          <div class="flex h-20 w-full items-center justify-center rounded-lg bg-white/20 lg:h-28">
            <p class="text-4xl font-bold tracking-tight text-white lg:text-6xl">
              {{ showValues ? countdown.seconds : '-' }}
            </p>
          </div>
          <p class="text-sm font-normal text-white/80">Secondes</p>
        </div>
      </div>
    </div>
  `,
})
export class CountdownComponent {
  @Input() countdown!: Countdown;
  @Input() showValues = true;
}
