import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:8080/api/users/forgot-password', { email: this.email })
      .subscribe({
        next: (response: any) => {
          console.log('Reset link sent:', response);
          this.submitted = true;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.successMessage = 'If your email is registered, you will receive a reset link';
          this.loading = false;
          setTimeout(() => {
            this.submitted = true;
          }, 2000);
        }
      });
  }
}