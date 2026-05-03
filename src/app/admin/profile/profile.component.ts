import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  admin = { name: '', email: '' };

  passwordForm = {
    newPassword: '',
    confirmPassword: ''
  };

  loading = false;
  successMessage = '';
  errorMessage = '';

  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        this.admin.name = user.name ?? '';
        this.admin.email = user.email ?? '';
        this.authService.updateUserData(user);
      },
      error: () => {
        const user = this.authService.getUser();
        this.admin.name = user?.name ?? '';
        this.admin.email = user?.email ?? '';
      }
    });
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  closeForm(): void {
    this.location.back();
  }

  updateProfile(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const name = this.admin.name.trim();
    if (!name) {
      this.errorMessage = 'Name is required';
      return;
    }

    const newPass = this.passwordForm.newPassword;
    const confirmPass = this.passwordForm.confirmPassword;
    const isChangingPassword = newPass || confirmPass;

    if (isChangingPassword) {
      if (newPass !== confirmPass) {
        this.errorMessage = 'Passwords do not match';
        return;
      }
      if (newPass.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters';
        return;
      }
    }

    this.loading = true;
    const payload: any = { name };
    if (isChangingPassword) {
      payload.password = newPass;
    }

    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profile updated successfully';
        this.cdr.detectChanges();

        this.userService.getProfile().subscribe({
          next: (freshUser: any) => {
            this.admin.name = freshUser.name;
            this.admin.email = freshUser.email;
            this.authService.updateUserData(freshUser);
            this.cdr.detectChanges();
          }
        });

        this.passwordForm.newPassword = '';
        this.passwordForm.confirmPassword = '';
        this.showNewPassword = false;
        this.showConfirmPassword = false;

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Update failed';
        this.cdr.detectChanges();
        this.passwordForm.newPassword = '';
        this.passwordForm.confirmPassword = '';
        this.showNewPassword = false;
        this.showConfirmPassword = false;
      }
    });
  }
}