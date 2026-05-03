import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Service } from '../../models/nutriomedics.models';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private apiUrl = `${environment.apiUrl}/services`;
  private services$: Observable<Service[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Service[]> {
    if (!this.services$) {
      this.services$ = this.http.get<Service[]>(this.apiUrl).pipe(
        shareReplay(1),   // ✅ persistent cache
        catchError(this.handleError.bind(this))
      );
    }
    return this.services$;
  }

  getActive(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  create(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError.bind(this))
    );
  }

  update(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service).pipe(
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
    this.services$ = null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) message = 'Network error – check your connection.';
    else if (error.status === 403) message = 'You are not authorized.';
    else if (error.status === 404) message = 'Service not found.';
    else if (error.status === 500) message = 'Server error – try again later.';
    console.error(`ServiceService [${error.status}]:`, error.message);
    return throwError(() => new Error(message));
  }
}