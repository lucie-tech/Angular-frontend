// src/app/core/services/blog.service.ts (updated)

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BlogPost } from '../../models/nutriomedics.models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blog/posts`;
  private allPosts$: Observable<BlogPost[]> | null = null;
  private posts$: Observable<BlogPost[]> | null = null;

  constructor(private http: HttpClient) {}

  getPosts(): Observable<BlogPost[]> {
    if (!this.posts$) {
      this.posts$ = this.http.get<BlogPost[]>(this.apiUrl).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.posts$;
  }

  getAllPosts(): Observable<BlogPost[]> {
    if (!this.allPosts$) {
      this.allPosts$ = this.http.get<BlogPost[]>(`${this.apiUrl}/all`).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.allPosts$;
  }

  getPostById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createPost(post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.apiUrl, post).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  updatePost(id: number, post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.apiUrl}/${id}`, post).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  clearCache(): void {
    this.allPosts$ = null;
    this.posts$ = null;
  }

  hasValidDocument(post?: BlogPost | null): boolean {
    return !!post?.documentUrl?.trim();
  }

  getDocumentUrl(post?: BlogPost | null): string {
    if (!post?.documentUrl) return '';
    const url = post.documentUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${environment.apiUrl}${url}`;
  }

  toEmbeddableUrl(url: string): string {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      return url.includes('/preview') ? url : url.replace('/view', '/preview');
    }
    return url;
  }

  // Helper method for featured image
  getFeaturedImage(post: BlogPost): string {
    if (post.imageUrl && post.imageUrl.trim()) {
      return post.imageUrl;
    }
    return '/assets/images/blog/default.jpg';
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
      message = 'Blog post not found';
    } else if (error.status === 500) {
      message = 'Server error';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    console.error('BlogService Error:', error);
    return throwError(() => new Error(message));
  }
}