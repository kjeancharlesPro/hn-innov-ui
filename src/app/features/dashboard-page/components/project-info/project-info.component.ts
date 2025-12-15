import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from '../../../../services';

@Component({
  selector: 'app-project-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-4 rounded-xl bg-white/5 bg-card-dark p-6 text-left">
      <h3 class="text-lg font-semibold text-white/80">Titre du projet</h3>
      <p class="text-2xl font-bold text-white">
        {{ showInfo && subject.title ? subject.title : '' }}
      </p>
      <div class="mt-2 border-t border-border-dark pt-4 space-y-3">
        <div>
          <h4 class="text-base font-semibold text-white/90 mb-1">Description du projet</h4>
          <p class="text-white/80 text-sm">
            {{ showInfo && subject.description ? subject.description : '' }}
          </p>
        </div>
        <div>
          <h4 class="text-base font-semibold text-white/90 mb-1">Problème à résoudre</h4>
          <p class="text-white/80 text-sm">
            {{ showInfo && subject.problem ? subject.problem : '' }}
          </p>
        </div>
        <div>
          <h4 class="text-base font-semibold text-white/90 mb-1">
            Innovation et originalité du projet
          </h4>
          <p class="text-white/80 text-sm">
            {{ showInfo && subject.innovation ? subject.innovation : '' }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ProjectInfoComponent {
  @Input() subject!: Subject;
  @Input() showInfo = false;
}
