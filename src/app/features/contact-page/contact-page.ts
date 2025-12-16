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
      return;
    }

    const subject = encodeURIComponent(this.form.value.subject);
    const message = encodeURIComponent(this.form.value.message);

    const mailtoUrl = `mailto:hackathonhn@gmail.com?subject=${subject}&body=${message}`;

    window.location.href = mailtoUrl;
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
