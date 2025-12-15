import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
      subject: [''],
      message: [''],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      this.error = 'Veuillez remplir tous les champs avant de soumettre.';
      this.success = false;
      return;
    }

    this.loading = true;
    this.error = null;

    const url = `${environment.apiUrl}/contact`;

    this.http.post(url, this.form.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.error = null;
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

  closeAlert(type: 'success' | 'error') {
    if (type === 'success') this.success = false;
    else this.error = null;
  }
}
