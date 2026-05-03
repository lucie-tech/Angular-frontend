import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isLoggingOut = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const publicUrls = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/register-bootstrap'
    ];

    const isPublic = publicUrls.some(url => req.url.includes(url));

    let authReq = req;

    if (!isPublic) {
      const token = this.authService.getToken();

      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 && !this.isLoggingOut) {
          this.isLoggingOut = true;

          this.authService.logout();

          setTimeout(() => {
            this.isLoggingOut = false;
          }, 1000);
        }

        return throwError(() => error);
      })
    );
  }
}