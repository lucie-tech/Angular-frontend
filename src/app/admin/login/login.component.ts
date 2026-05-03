import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {

    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Email and password required';
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {

        this.authService.saveAuth(res);

        this.loading = false;

        this.router.navigate(['/admin/dashboard']);
      },

      error: (err) => {
        this.loading = false;

        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (err.status === 0) {
          this.errorMessage = 'Backend not running';
        } else {
          this.errorMessage = 'Server error. Try again later.';
        }
      }
    });
  }
}