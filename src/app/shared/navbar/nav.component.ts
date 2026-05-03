import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarComponent],
  template: `
    <nav [class.scrolled]="isScrolled">
      <div class="sidebar-toggle" (click)="toggleSidebar()">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
      <div class="logo-container">
        <img src="assets/images/app-logo.jpeg" alt="Nutriomedics Logo" class="logo-img">
      </div>
      <ul class="nav-links">
        <li *ngFor="let link of navLinks">
          <a [routerLink]="link.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: link.route === '/' }">
            {{ link.label }}
          </a>
        </li>
      </ul>
    </nav>
    <app-sidebar [isOpen]="isSidebarOpen" (closeEvent)="closeSidebar()"></app-sidebar>
  `,
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  isSidebarOpen = false;
  isScrolled = false;

  navLinks = [
    { label: 'Home', route: '/' },
    { label: 'About', route: '/about' },
    { label: 'Products', route: '/products' },
    { label: 'Services', route: '/services' },
    { label: 'Contact', route: '/contact' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}