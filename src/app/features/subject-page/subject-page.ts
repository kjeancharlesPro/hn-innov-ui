import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../env/env.dev';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subject-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './subject-page.html',
  styleUrl: './subject-page.css',
})
export class SubjectPage {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  submitted = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      title: [''],
      description: [''],
      problem: [''],
      innovation: [''],
    });
  }

  onSubmit() {
    this.submitted = true;

    console.log('oui');

    if (this.form.invalid) {
      this.error = 'Veuillez corriger les erreurs dans le formulaire avant de soumettre à nouveau.';
      this.success = false;
      this.autoCloseAlert('error', 3000);
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

    const url = `${environment.apiUrl}/subjects`;

    const payload = {
      title: this.form.value.title,
      description: this.form.value.description,
      problem: this.form.value.problem,
      innovation: this.form.value.innovation,
    };

    this.http.post(url, payload).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.error = null;
        this.form.reset();
        this.submitted = false;
        // Auto close after 3 seconds with fade out
        this.autoCloseAlert('success', 3000);

        console.log('oui');
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
