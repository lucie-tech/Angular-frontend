import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Partnership } from '../../models/nutriomedics.models';

export type { Partnership };

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private apiUrl = `${environment.apiUrl}/partnerships`;
  private partners$: Observable<Partnership[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Partnership[]> {
    if (!this.partners$) {
      this.partners$ = this.http.get<Partnership[]>(this.apiUrl).pipe(
        shareReplay(1),   // ✅ persistent cache
        catchError(this.handleError.bind(this))
      );
    }
    return this.partners$;
  }

  getActive(): Observable<Partnership[]> {
    return this.http.get<Partnership[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getById(id: number): Observable<Partnership> {
    return this.http.get<Partnership>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  create(partner: Partial<Partnership>): Observable<Partnership> {
    return this.http.post<Partnership>(this.apiUrl, partner).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError.bind(this))
    );
  }

  update(id: number, partner: Partial<Partnership>): Observable<Partnership> {
    return this.http.put<Partnership>(`${this.apiUrl}/${id}`, partner).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError.bind(this))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError.bind(this))
    );
  }

  clearCache(): void {
    this.partners$ = null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0)        message = 'Network error – check your connection.';
    else if (error.status === 403) message = 'You are not authorized.';
    else if (error.status === 404) message = 'Partnership not found.';
    else if (error.status === 500) message = 'Server error – try again later.';
    console.error(`PartnerService [${error.status}]:`, error.message);
    return throwError(() => new Error(message));
  }
}