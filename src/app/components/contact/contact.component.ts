import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';

export interface ContactRow {
  label: string;
  value: string;
  iconPath: string;
  extraPath?: string;
  polyline?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  contactForm: FormGroup;
  rating = 0;
  hoverRating = 0;
  submitting = false;
  submitSuccess = false;
  submitError = false;

  subjects = [
    'General Inquiry',
    'Research',
    'Partnership / Collaboration',
  ];

  contactRows: ContactRow[] = [
    {
      label: 'Headquarters',
      value: 'Dodoma, Tanzania · P.O. Box 490',
      iconPath: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
      extraPath: 'M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    },
    {
      label: 'Email',
      value: 'info@nutriomedics.co.tz',
      iconPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
      polyline: '22,6 12,13 2,6',
    },
    {
      label: 'Phone',
      value: '+255 764 432 040',
      iconPath: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      phone:    [''],
      subject:  ['', Validators.required],
      message:  ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  setRating(val: number) { this.rating = val; }
  setHover(val: number)  { this.hoverRating = val; }
  clearHover()           { this.hoverRating = 0; }
  get displayRating()    { return this.hoverRating || this.rating; }

  isInvalid(field: string) {
    const c = this.contactForm.get(field);
    return c?.invalid && (c?.dirty || c?.touched);
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.submitError = false;

    const payload = {
      fullName: this.contactForm.value.fullName,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message,
      messageType: this.rating ? `Rating: ${this.rating}/5` : 'Feedback',
    };

    this.contactService.sendMessage(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        this.contactForm.reset();
        this.rating = 0;
      },
      error: () => {
        this.submitting = false;
        this.submitError = true;
      },
    });
  }
}
