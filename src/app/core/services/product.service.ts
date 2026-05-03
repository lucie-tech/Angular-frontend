import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/nutriomedics.models';

export type { Product };

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private products$: Observable<Product[]> | null = null;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    if (!this.products$) {
      this.products$ = this.http.get<Product[]>(this.apiUrl).pipe(
        shareReplay(1),   // ✅ persistent cache
        catchError(this.handleError.bind(this))
      );
    }
    return this.products$;
  }

  getAll(): Observable<Product[]> {
    return this.getProducts();
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError.bind(this))
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError.bind(this))
    );
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.updateProduct(id, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError.bind(this))
    );
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${environment.apiUrl}${imageUrl}`;
  }

  getClinicalBenefits(benefits: string | null | undefined): string[] {
    if (!benefits) return [];
    return benefits.split(';').map(b => b.trim()).filter(b => b.length > 0);
  }

  clearCache(): void {
    this.products$ = null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0)        message = 'Network error – check your connection.';
    else if (error.status === 403) message = 'You are not authorized.';
    else if (error.status === 404) message = 'Product not found.';
    else if (error.status === 500) message = 'Server error – try again later.';
    console.error('ProductService error:', error);
    return throwError(() => new Error(message));
  }
}