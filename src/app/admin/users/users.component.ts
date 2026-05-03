// src/app/admin/users/users.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User, CreateUserRequest } from '../../models/nutriomedics.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  showForm = false;
  deleteConfirmId: number | null = null;
  private destroy$ = new Subject<void>();

  form: CreateUserRequest = {
    name: '',
    email: '',
    password: '',
    role: 'ADMIN'
  };

  roles = ['ADMIN', 'USER'];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          alert(err.message);
        }
      });
  }

  openAddForm(): void {
    this.form = {
      name: '',
      email: '',
      password: '',
      role: 'ADMIN'
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  saveUser(): void {
    if (!this.form.name || !this.form.email || !this.form.password) {
      alert('Please fill all required fields');
      return;
    }

    if (this.form.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    this.userService.createUser(this.form).subscribe({
      next: () => {
        this.userService.clearCache(); // ✅ Clear cache after create
        this.loadUsers();
        this.closeForm();
        alert('User created successfully');
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  deleteUser(): void {
    if (!this.deleteConfirmId) return;
    this.userService.deleteUser(this.deleteConfirmId).subscribe({
      next: () => {
        this.userService.clearCache(); // ✅ Clear cache after delete
        this.loadUsers();
        this.deleteConfirmId = null;
        alert('User deleted successfully');
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }

  updateRole(user: User): void {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.userService.clearCache(); // ✅ Clear cache after role update
        this.loadUsers();
        alert(`Role updated to ${newRole}`);
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }

  trackById(index: number, user: User): number {
    return user.id;
  }
}