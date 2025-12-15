import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ParticipantService,
  JuryMemberService,
  SubjectService,
  StatusService,
  EmailService,
  FormValidationService,
  SkillsService,
  PayloadBuilderService,
} from '../../services';
import { Subject } from '../../interfaces/intefaces';

/**
 * Page d'inscription pour les participants et membres du jury au hackathon.
 * Permet l'inscription avec sélection de compétences et de sujets.
 * Gère l'état du hackathon et adapte le formulaire en conséquence.
 */
@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage implements OnInit {
  /** Formulaire réactif pour l'inscription */
  form: FormGroup;

  /** Indicateur de chargement */
  loading = false;

  /** Message d'erreur à afficher */
  error: string | null = null;

  /** Indicateur de succès de l'inscription */
  success = false;

  /** Indicateur si le formulaire a été soumis */
  submitted = false;

  /** Liste des sujets disponibles pour le hackathon */
  availableSubject: Subject[] = [];

  /** Détails du sujet sélectionné */
  selectedIssueDetails: Subject | null = null;

  /** Statut actuel du hackathon (EN_ATTENTE, EN_PREPARATION, EN_COURS, TERMINE) */
  hackathonStatus: string | null = null;

  /** Indicateur si les inscriptions sont fermées */
  registrationClosed = false;

  /** Détails de la compétence sélectionnée */
  selectedSkillDetails: {
    value: string;
    option: string;
    title: string;
    descriptions: string[];
  } | null = null;

  constructor(
    private fb: FormBuilder,
    private participantService: ParticipantService,
    private juryMemberService: JuryMemberService,
    private subjectService: SubjectService,
    private statusService: StatusService,
    private emailService: EmailService,
    private formValidationService: FormValidationService,
    private skillsService: SkillsService,
    private payloadBuilderService: PayloadBuilderService
  ) {
    this.form = this.createForm();
  }

  /**
   * Initialise le composant au chargement.
   * Vérifie le statut du hackathon, charge les sujets disponibles et configure les listeners.
   */
  ngOnInit(): void {
    this.checkHackathonStatus();
    this.loadAvailableIssues();
    this.setupFormListeners();
  }

  /**
   * Retourne la liste des compétences sous forme de tableau.
   * @returns Liste des compétences disponibles
   */
  get skillsList() {
    return this.skillsService.getAllSkills();
  }

  /**
   * Crée et configure le formulaire réactif avec toutes les validations.
   * @returns FormGroup configuré avec les champs et validateurs
   */
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
      { validators: this.formValidationService.emailMatchValidator }
    );
  }

  /**
   * Configure les listeners pour les changements de valeurs du formulaire.
   * Écoute les changements de rôle et d'idée pour adapter le formulaire.
   */
  private setupFormListeners(): void {
    this.form.get('role')?.valueChanges.subscribe((role) => {
      this.handleRoleChange(role);
    });

    this.form.get('hasIdea')?.valueChanges.subscribe((hasIdea) => {
      this.handleIdeaOptionChange(hasIdea);
    });
  }

  /**
   * Vérifie le statut actuel du hackathon depuis l'API.
   * Détermine si les inscriptions sont ouvertes ou fermées.
   */
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

  /**
   * Gère le changement de rôle (participant/jury) dans le formulaire.
   * Adapte les validateurs et les champs requis en fonction du rôle.
   * @param role Le rôle sélectionné ('participant' ou 'jury')
   */
  private handleRoleChange(role: string): void {
    if (role === 'jury') {
      this.form.get('skill')?.setValue('');
      this.form.get('skill')?.clearValidators();
      this.form.get('hasIdea')?.setValidators([this.formValidationService.hasIdeaValidator]);
      this.selectedSkillDetails = null;
    } else if (role === 'participant') {
      this.form.get('skill')?.setValidators([Validators.required]);
      this.form.get('hasIdea')?.setValue('none');
      this.form.get('hasIdea')?.clearValidators();
    }
    this.form.get('skill')?.updateValueAndValidity();
    this.form.get('hasIdea')?.updateValueAndValidity();
  }

  /**
   * Gère la sélection d'une compétence.
   * Met à jour les détails affichés pour la compétence sélectionnée.
   * @param event L'événement de sélection
   */
  onSkillSelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const skillValue = target.value;

    if (skillValue) {
      this.selectedSkillDetails = this.skillsService.getSkillInfo(skillValue);
    } else {
      this.selectedSkillDetails = null;
    }
  }

  /**
   * Gère le changement d'option pour l'idée (aucune/adopter/proposer).
   * Configure les validateurs appropriés selon l'option choisie.
   * @param hasIdea L'option sélectionnée ('none', 'adopt', 'propose')
   */
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

  /**
   * Gère la soumission du formulaire d'inscription.
   * Valide les données, crée le participant/jury et envoie l'email de confirmation.
   */
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

  /**
   * Envoie une notification par email après inscription.
   * Le type d'email dépend du statut actuel du hackathon.
   * @param email L'adresse email du destinataire
   */
  private sendEmailNotification(email: string): void {
    if (!this.hackathonStatus) {
      console.warn('⚠️ Statut du hackathon non défini, email non envoyé');
      this.handleSubmitSuccess();
      return;
    }

    this.emailService.sendRegistrationEmail(email, this.hackathonStatus).subscribe({
      next: () => {
        const emailType = this.hackathonStatus === 'EN_ATTENTE' ? 'pré-invitation' : 'invitation';
        this.handleSubmitSuccess();
      },
      error: (err: any) => {
        console.error("Erreur lors de l'envoi de l'email:", err);
        // On considère quand même l'inscription comme réussie
        this.handleSubmitSuccess();
      },
    });
  }

  /**
   * Construit le payload pour l'API selon le rôle.
   * Inclut toutes les données du formulaire nécessaires à la création.
   * @param role Le rôle sélectionné ('participant' ou 'jury')
   * @returns Objet contenant les données formatées pour l'API
   */
  private buildPayload(role: string): any {
    return this.payloadBuilderService.buildPayload(this.form, role);
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
