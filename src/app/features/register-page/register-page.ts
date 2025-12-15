import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ParticipantService,
  JuryMemberService,
  SubjectService,
  StatusService,
  EmailService,
} from '../../services';
import { Subject } from '../../interfaces/intefaces';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  submitted = false;
  availableSubject: Subject[] = [];
  selectedIssueDetails: Subject | null = null;
  hackathonStatus: string | null = null;
  registrationClosed = false;
  selectedSkillDetails: {
    value: string;
    option: string;
    title: string;
    descriptions: string[];
  } | null = null;

  skillsInfo: {
    [key: string]: { value: string; option: string; title: string; descriptions: string[] };
  } = {
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

  constructor(
    private fb: FormBuilder,
    private participantService: ParticipantService,
    private juryMemberService: JuryMemberService,
    private subjectService: SubjectService,
    private statusService: StatusService,
    private emailService: EmailService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.checkHackathonStatus();
    this.loadAvailableIssues();
    this.setupFormListeners();
  }

  get skillsList() {
    return Object.values(this.skillsInfo);
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        emailConfirm: ['', [Validators.required, Validators.email]],
        role: ['participant', Validators.required],
        hasIdea: ['none'],
        skill: ['', Validators.required],
        selectedIssue: [''],
        title: [''],
        description: [''],
        problem: [''],
        innovation: [''],
      },
      { validators: this.emailMatchValidator }
    );
  }

  private emailMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const email = group.get('email')?.value;
    const emailConfirm = group.get('emailConfirm')?.value;

    if (email && emailConfirm && email !== emailConfirm) {
      group.get('emailConfirm')?.setErrors({ emailMismatch: true });
      return { emailMismatch: true };
    }

    return null;
  }

  private hasIdeaValidator(control: any): { [key: string]: boolean } | null {
    const value = control.value;
    if (value === 'none' || !value) {
      return { required: true };
    }
    return null;
  }

  private setupFormListeners(): void {
    this.form.get('role')?.valueChanges.subscribe((role) => {
      this.handleRoleChange(role);
    });

    this.form.get('hasIdea')?.valueChanges.subscribe((hasIdea) => {
      this.handleIdeaOptionChange(hasIdea);
    });
  }

  private checkHackathonStatus(): void {
    this.statusService.getCurrent().subscribe({
      next: (status) => {
        this.hackathonStatus = status.state;
        this.registrationClosed = status.state === 'EN_COURS' || status.state === 'TERMINE';

        if (this.registrationClosed) {
          this.form.disable();
          this.error =
            status.state === 'EN_COURS'
              ? 'Les inscriptions sont fermées : le hackathon est actuellement en cours.'
              : 'Les inscriptions sont fermées : le hackathon est terminé.';
        }
      },
      error: (err) => {
        console.error('Erreur lors de la vérification du statut:', err);
      },
    });
  }

  private handleRoleChange(role: string): void {
    if (role === 'jury') {
      this.form.get('skill')?.setValue('');
      this.form.get('skill')?.clearValidators();
      this.form.get('hasIdea')?.setValidators([this.hasIdeaValidator.bind(this)]);
      this.selectedSkillDetails = null;
    } else if (role === 'participant') {
      this.form.get('skill')?.setValidators([Validators.required]);
      this.form.get('hasIdea')?.setValue('none');
      this.form.get('hasIdea')?.clearValidators();
    }
    this.form.get('skill')?.updateValueAndValidity();
    this.form.get('hasIdea')?.updateValueAndValidity();
  }

  onSkillSelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const skillValue = target.value;

    if (skillValue && this.skillsInfo[skillValue]) {
      this.selectedSkillDetails = this.skillsInfo[skillValue];
    } else {
      this.selectedSkillDetails = null;
    }
  }

  private handleIdeaOptionChange(hasIdea: string): void {
    if (hasIdea === 'none' || hasIdea === 'adopt') {
      this.clearIdeaFields();
    }
    if (hasIdea === 'none') {
      this.clearSelectedIssue();
      this.form.get('selectedIssue')?.clearValidators();
      this.form.get('title')?.clearValidators();
      this.form.get('description')?.clearValidators();
      this.form.get('problem')?.clearValidators();
      this.form.get('innovation')?.clearValidators();
    } else if (hasIdea === 'adopt') {
      this.form.get('selectedIssue')?.setValidators([Validators.required]);
      this.form.get('title')?.clearValidators();
      this.form.get('description')?.clearValidators();
      this.form.get('problem')?.clearValidators();
      this.form.get('innovation')?.clearValidators();
    } else if (hasIdea === 'propose') {
      this.clearSelectedIssue();
      this.form.get('selectedIssue')?.clearValidators();
      this.form.get('title')?.setValidators([Validators.required]);
      this.form.get('description')?.setValidators([Validators.required]);
      this.form.get('problem')?.setValidators([Validators.required]);
      this.form.get('innovation')?.setValidators([Validators.required]);
    }
    this.form.get('selectedIssue')?.updateValueAndValidity();
    this.form.get('title')?.updateValueAndValidity();
    this.form.get('description')?.updateValueAndValidity();
    this.form.get('problem')?.updateValueAndValidity();
    this.form.get('innovation')?.updateValueAndValidity();
  }

  private clearIdeaFields(): void {
    this.form.patchValue({
      title: '',
      problem: '',
      description: '',
      innovation: '',
    });
  }

  private clearSelectedIssue(): void {
    this.form.get('selectedIssue')?.setValue('');
    this.selectedIssueDetails = null;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registrationClosed) {
      this.showError('Les inscriptions sont actuellement fermées.');
      return;
    }

    if (this.form.invalid) {
      this.showError(
        'Veuillez corriger les erreurs dans le formulaire avant de soumettre à nouveau.'
      );
      this.autoCloseAlert('error', 3000);
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

    const role = this.form.get('role')?.value;
    const email = this.form.get('email')?.value;
    const payload = this.buildPayload(role);

    if (role === 'jury') {
      this.juryMemberService.create(payload).subscribe({
        next: () => this.sendEmailNotification(email),
        error: (err: any) => this.handleSubmitError(err),
      });
    } else {
      this.participantService.create(payload).subscribe({
        next: () => this.sendEmailNotification(email),
        error: (err: any) => this.handleSubmitError(err),
      });
    }
  }

  private sendEmailNotification(email: string): void {
    if (!this.hackathonStatus) {
      console.warn('⚠️ Statut du hackathon non défini, email non envoyé');
      this.handleSubmitSuccess();
      return;
    }

    this.emailService.sendRegistrationEmail(email, this.hackathonStatus).subscribe({
      next: () => {
        const emailType = this.hackathonStatus === 'EN_ATTENTE' ? 'pré-invitation' : 'invitation';
        console.log(`✉️ Email de ${emailType} envoyé à:`, email);
        this.handleSubmitSuccess();
      },
      error: (err: any) => {
        console.error("Erreur lors de l'envoi de l'email:", err);
        // On considère quand même l'inscription comme réussie
        this.handleSubmitSuccess();
      },
    });
  }

  private buildPayload(role: string): any {
    const { firstName, lastName, email, skill, title, description, problem, innovation } =
      this.form.value;

    if (role === 'participant') {
      return {
        firstName,
        lastName,
        email,
        skill: skill || [],
      };
    }

    return {
      firstName,
      lastName,
      email,
      title,
      description,
      problem,
      innovation,
    };
  }

  private handleSubmitSuccess(): void {
    this.success = true;
    this.loading = false;
    this.error = null;
    this.form.reset({ role: 'participant', hasIdea: 'none' });
    this.selectedSkillDetails = null;
    // Réappliquer la validation pour le champ skill après le reset
    this.form.get('skill')?.setValidators([Validators.required]);
    this.form.get('skill')?.updateValueAndValidity();
    this.submitted = false;
    this.autoCloseAlert('success', 3000);
  }

  private handleSubmitError(err: any): void {
    console.error("Erreur lors de l'inscription:", err);
    this.showError(err.error?.message || 'Une erreur est survenue. Veuillez réessayer.');
    this.loading = false;
    this.autoCloseAlert('error', 5000);
  }

  private showError(message: string): void {
    this.error = message;
    this.success = false;
  }

  closeAlert(type: 'success' | 'error'): void {
    if (type === 'success') {
      this.success = false;
    } else {
      this.error = null;
    }
  }

  private autoCloseAlert(type: 'success' | 'error', delayMs: number): void {
    setTimeout(() => this.closeAlert(type), delayMs);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  loadAvailableIssues(): void {
    this.subjectService.getAll().subscribe({
      next: (response) => this.handleIssuesLoaded(response),
      error: (err) => console.error('Erreur lors du chargement des idées:', err),
    });
  }

  private handleIssuesLoaded(response: any): void {
    const subjects = response._embedded?.subjectEntities || [];
    console.log(subjects);

    this.availableSubject = subjects.map((subject: Subject) => this.mapSubjectToIssue(subject));
  }

  private mapSubjectToIssue(subject: Subject): Subject {
    const id = this.extractIdFromLinks(subject);

    return {
      id,
      title: subject.title || 'Sans titre',
      description: subject.description,
      problem: subject.problem,
      innovation: subject.innovation,
    };
  }

  private extractIdFromLinks(subject: Subject): string {
    const selfHref = subject._links?.self?.href || '';
    const idMatch = selfHref.match(/\/subjects\/(\d+)$/);
    return idMatch ? idMatch[1] : subject.id || '';
  }

  onIssueSelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const problemId = target.value;

    if (problemId) {
      this.selectIssue(problemId);
    } else {
      this.clearIssueSelection();
    }
  }

  private selectIssue(issueId: string): void {
    const selected = this.availableSubject.find((issue) => issue.id === issueId);

    if (selected) {
      this.selectedIssueDetails = selected;
      this.form.patchValue({
        title: selected.title,
        description: selected.description,
        problem: selected.problem,
        innovation: selected.innovation,
      });
    }
  }

  private clearIssueSelection(): void {
    this.selectedIssueDetails = null;
    this.clearIdeaFields();
  }
}
