
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HeroImage } from '../../models/nutriomedics.models';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private apiUrl = `${environment.apiUrl}/hero/images`;
  private allHeroImages$: Observable<HeroImage[]> | null = null;
  private activeHeroImages$: Observable<HeroImage[]> | null = null;

  constructor(private http: HttpClient) {}

  getAllHeroImages(): Observable<HeroImage[]> {
    if (!this.allHeroImages$) {
      this.allHeroImages$ = this.http.get<HeroImage[]>(`${this.apiUrl}/all`).pipe(
        shareReplay(1), 
        catchError(this.handleError)
      );
    }
    return this.allHeroImages$;
  }

  getHeroImages(): Observable<HeroImage[]> {
    if (!this.activeHeroImages$) {
      this.activeHeroImages$ = this.http.get<HeroImage[]>(this.apiUrl).pipe(
        shareReplay(1), 
        catchError(this.handleError)
      );
    }
    return this.activeHeroImages$;
  }

  getHeroImageById(id: number): Observable<HeroImage> {
    return this.http.get<HeroImage>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createHeroImage(heroImage: Partial<HeroImage>): Observable<HeroImage> {
    return this.http.post<HeroImage>(this.apiUrl, heroImage).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  updateHeroImage(id: number, heroImage: Partial<HeroImage>): Observable<HeroImage> {
    return this.http.put<HeroImage>(`${this.apiUrl}/${id}`, heroImage).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  deleteHeroImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  clearCache(): void {
    this.allHeroImages$ = null;
    this.activeHeroImages$ = null;
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
      message = 'Hero image not found';
    } else if (error.status === 500) {
      message = 'Server error';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    console.error('HeroService Error:', error);
    return throwError(() => new Error(message));
  }
}