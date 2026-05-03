
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateProfileRequest, ChangePasswordRequest, ProfileResponse } from '../../models/nutriomedics.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private usersApiUrl = `${environment.apiUrl}/admin/users`;
  
  private allUsersCache$: Observable<User[]> | null = null;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    if (!this.allUsersCache$) {
      this.allUsersCache$ = this.http.get<User[]>(this.usersApiUrl).pipe(
        shareReplay(1), // ✅ Cache the response
        catchError(this.handleError)
      );
    }
    return this.allUsersCache$;
  }

  clearCache(): void {
    this.allUsersCache$ = null;
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/profile`, request).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, request).pipe(
      catchError(this.handleError)
    );
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.usersApiUrl, request).pipe(
      tap(() => this.clearCache()), 
      catchError(this.handleError)
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersApiUrl}/${id}`).pipe(
      tap(() => this.clearCache()), 
      catchError(this.handleError)
    );
  }

  updateUserRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.usersApiUrl}/${id}/role?role=${role}`, {}).pipe(
      tap(() => this.clearCache()), 
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Unexpected error occurred';
    if (error.status === 0) {
      message = 'Network error – backend not reachable';
    } else if (error.status === 401) {
      message = 'Unauthorized – please login again';
    } else if (error.status === 403) {
      message = 'Access denied – insufficient permissions';
    } else if (error.status === 409) {
      message = 'Email already exists';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    console.error('UserService Error:', error);
    return throwError(() => new Error(message));
  }
}