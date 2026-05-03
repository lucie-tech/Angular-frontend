import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {

  isMobileMenuOpen = false;
  currentYear = new Date().getFullYear();
  

navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/products', icon: '💊', label: 'Products' },
  { path: '/admin/services', icon: '⚙️', label: 'Services' },
  { path: '/admin/research', icon: '🔬', label: 'Research' },
  { path: '/admin/partners', icon: '🤝', label: 'Partners' },
  { path: '/admin/blogs', icon: '📝', label: 'Blog Posts' },
  { path: '/admin/faqs', icon: '❓', label: 'FAQs' },
  { path: '/admin/hero', icon: '🎬', label: 'Hero Slider' },
  { path: '/admin/users', icon: '👥', label: 'User Management' }, 
  { path: '/admin/contact', icon: '📞', label: 'Messages' }
];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🔐 Auth check (safe redirect)
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMobileMenuOpen = false;
      });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  goToProfile(): void {
    this.router.navigate(['/admin/profile']);
    this.closeMobileMenu();
  }

  logout(): void {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      this.authService.logout();
    }
  }
}