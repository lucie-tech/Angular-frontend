// src/app/core/services/faq.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FAQ } from '../../models/nutriomedics.models';

@Injectable({
  providedIn: 'root'  // ← This is important - makes service available globally
})
export class FAQService {
  private apiUrl = `${environment.apiUrl}/faqs`;
  private activeFAQs$: Observable<FAQ[]> | null = null;
  private allFAQs$: Observable<FAQ[]> | null = null;

  constructor(private http: HttpClient) {}

  getActiveFAQs(): Observable<FAQ[]> {
    if (!this.activeFAQs$) {
      this.activeFAQs$ = this.http.get<FAQ[]>(`${this.apiUrl}/active`).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.activeFAQs$;
  }

  getAllFAQs(): Observable<FAQ[]> {
    if (!this.allFAQs$) {
      this.allFAQs$ = this.http.get<FAQ[]>(this.apiUrl).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.allFAQs$;
  }

  getFAQById(id: number): Observable<FAQ> {
    return this.http.get<FAQ>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createFAQ(faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.post<FAQ>(this.apiUrl, faq).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  updateFAQ(id: number, faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.put<FAQ>(`${this.apiUrl}/${id}`, faq).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  deleteFAQ(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  clearCache(): void {
    this.activeFAQs$ = null;
    this.allFAQs$ = null;
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Unexpected error occurred';
    if (error.status === 0) {
      message = 'Network error – backend not reachable';
    } else if (error.status === 401) {
      message = 'Unauthorized – please login again';
    } else if (error.status === 403) {
      message = 'Access denied – insufficient permissions';
    } else if (error.status === 404) {
      message = 'FAQ not found';
    } else if (error.status === 500) {
      message = 'Server error';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    console.error('FAQService Error:', error);
    return throwError(() => new Error(message));
  }
}