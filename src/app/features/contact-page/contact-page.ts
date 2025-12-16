import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../env/env.dev';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  submitted = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    if (this.form.invalid) {
      this.error = 'Veuillez remplir tous les champs avant de soumettre.';
      this.success = false;
      return;
    }

    this.loading = true;

    const url = `${environment.apiUrl}/contact`;

    this.http.post(url, this.form.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.form.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.success = false;
        this.loading = false;
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(
      control &&
      control.invalid &&
      (control.touched || this.submitted)
    );
  }

  closeAlert(type: 'success' | 'error') {
    if (type === 'success') this.success = false;
    else this.error = null;
  }
}
