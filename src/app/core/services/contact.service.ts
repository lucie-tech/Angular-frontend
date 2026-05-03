import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { ContactMessage } from '../../models/nutriomedics.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private baseUrl = `${environment.apiUrl}/contact`;
  private adminUrl = `${environment.apiUrl}/contact/admin/messages`;
  private messages$: Observable<ContactMessage[]> | null = null;

  constructor(private http: HttpClient) {}

  // Public
  sendMessage(data: Partial<ContactMessage>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.baseUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  // Admin
  getAllMessages(): Observable<ContactMessage[]> {
    if (!this.messages$) {
      this.messages$ = this.http.get<ContactMessage[]>(this.adminUrl).pipe(
        shareReplay(1),   // ✅ persistent cache
        catchError(this.handleError)
      );
    }
    return this.messages$;
  }

  getUnreadMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${this.adminUrl}/unread`).pipe(
      catchError(this.handleError)
    );
  }

  getMessageById(id: number): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(`${this.adminUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  markAsRead(id: number): Observable<ContactMessage> {
    return this.http.put<ContactMessage>(`${this.adminUrl}/${id}/read`, {}).pipe(
      tap(() => this.clearCache()),   // ✅ clear cache after update
      catchError(this.handleError)
    );
  }

  replyToMessage(id: number, replyMessage: string): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(`${this.adminUrl}/${id}/reply`, { replyMessage }).pipe(
      tap(() => this.clearCache()),   // ✅ clear cache after reply
      catchError(this.handleError)
    );
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`).pipe(
      tap(() => this.clearCache()),   // ✅ clear cache after delete
      catchError(this.handleError)
    );
  }

  clearCache(): void {
    this.messages$ = null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) message = 'Network error – check your connection.';
    else if (error.status === 403) message = 'You are not authorized.';
    else if (error.status === 404) message = 'Message not found.';
    else if (error.status === 500) message = 'Server error – try again later.';
    console.error(`ContactService [${error.status}]:`, error.message);
    return throwError(() => new Error(message));
  }
}

export type { ContactMessage };