import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_CONFIG } from '../config/api.config';
import { ProductService } from './product.service';
import { ServiceService } from './service.service';
import { ResearchService } from './research.service';
import { PartnerService } from './partner.service';
import { BlogService } from './blog.service';
import { ContactService } from './contact.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private TOKEN_KEY = 'token';
  private USER_KEY = 'user';
  private TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity
  private timeoutId: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
    private productService: ProductService,
    private serviceService: ServiceService,
    private researchService: ResearchService,
    private partnerService: PartnerService,
    private blogService: BlogService,
    private contactService: ContactService
  ) {
    this.startInactivityTimer();
    this.listenForActivity();
  }

  login(email: string, password: string) {
    return this.http.post<any>(
      `${API_CONFIG.baseUrl}/api/auth/login`,
      { email, password }
    );
  }

  saveAuth(res: any) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res));
    this.resetInactivityTimer();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() > expiry) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  updateUserData(user: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  logout() {
    // Clear all service caches to prevent cross-user data leakage
    this.productService.clearCache();
    this.serviceService.clearCache();
    this.researchService.clearCache();
    this.partnerService.clearCache();
    this.blogService.clearCache();
    this.contactService.clearCache();

    localStorage.clear();
    this.clearInactivityTimer();
    this.router.navigate(['/admin/login']);
  }

  private listenForActivity(): void {
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer(), { passive: true });
    });
  }

  private startInactivityTimer(): void {
    if (!this.isLoggedIn()) return;
    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          if (this.isLoggedIn()) {
            alert('Session expired due to inactivity. Please log in again.');
            this.logout();
          }
        });
      }, this.TIMEOUT_MS);
    });
  }

  private clearInactivityTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}