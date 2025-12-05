import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/env.prd';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  submitted = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['participant', Validators.required],
      skill: [''],
      subject: [''],
      description: [''],
    });

    // Reset irrelevant field when role changes
    this.form.get('role')!.valueChanges.subscribe((role) => {
      if (role === 'jury') {
        this.form.get('skill')!.setValue('');
      } else if (role === 'participant') {
        this.form.get('subject')!.setValue('');
        this.form.get('description')!.setValue('');
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      this.error = 'Veuillez corriger les erreurs dans le formulaire avant de soumettre à nouveau.';
      this.success = false;
      this.autoCloseAlert('error', 3000);
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

    const role = this.form.get('role')!.value;
    const url =
      role === 'jury' ? `${environment.apiUrl}/jury-members` : `${environment.apiUrl}/participants`;

    // Build payload depending on role to avoid sending irrelevant fields
    const participantPayload = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      email: this.form.value.email,
      skill: role === 'participant' ? this.form.value.skill : [],
    };

    const juryMemberPayload = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      email: this.form.value.email,
      subject: this.form.value.subject,
      description: this.form.value.description,
    };

    this.http.post(url, role === 'jury' ? juryMemberPayload : participantPayload).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.error = null;
        this.form.reset({ role: 'participant' });
        this.submitted = false;
        // Auto close after 3 seconds with fade out
        this.autoCloseAlert('success', 3000);
      },
      error: (err) => {
        console.error("Erreur lors de l'inscription:", err);
        this.error = err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.success = false;
        this.loading = false;
        // Auto close after 5 seconds with fade out
        this.autoCloseAlert('error', 5000);
      },
    });
  }

  closeAlert(type: 'success' | 'error') {
    if (type === 'success') {
      this.success = false;
    } else {
      this.error = null;
    }
  }

  private autoCloseAlert(type: 'success' | 'error', delayMs: number) {
    setTimeout(() => {
      this.closeAlert(type);
    }, delayMs);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }
}
