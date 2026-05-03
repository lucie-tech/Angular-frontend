import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { ResearchArea } from '../../models/nutriomedics.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResearchService {
  private apiUrl = `${environment.apiUrl}/research-areas`;
  private research$: Observable<ResearchArea[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ResearchArea[]> {
    if (!this.research$) {
      this.research$ = this.http.get<ResearchArea[]>(this.apiUrl).pipe(
        shareReplay(1),   // ✅ persistent cache
        catchError(this.handleError)
      );
    }
    return this.research$;
  }

  getActive(): Observable<ResearchArea[]> {
    return this.http.get<ResearchArea[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<ResearchArea> {
    return this.http.get<ResearchArea>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(data: Partial<ResearchArea>): Observable<ResearchArea> {
    return this.http.post<ResearchArea>(this.apiUrl, data).pipe(
      tap(() => this.clearCache()),   // ✅ clear cache after create
      catchError(this.handleError)
    );
  }

  update(id: number, data: Partial<ResearchArea>): Observable<ResearchArea> {
    return this.http.put<ResearchArea>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.clearCache()),   // ✅ clear cache after update
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache()),   // ✅ clear cache after delete
      catchError(this.handleError)
    );
  }

  clearCache(): void {
    this.research$ = null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) message = 'Network error – check your connection.';
    else if (error.status === 403) message = 'You are not authorized.';
    else if (error.status === 404) message = 'Data not found.';
    else if (error.status === 500) message = 'Server error – try again later.';
    console.error(`ResearchService [${error.status}]:`, error.message);
    return throwError(() => new Error(message));
  }
}