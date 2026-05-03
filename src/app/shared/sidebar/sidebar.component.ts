import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar-overlay" [class.active]="isOpen" (click)="close()"></div>
    <div class="sidebar" [class.active]="isOpen">
      <div class="sidebar-header">
        <h2>Menu</h2>
        <button class="sidebar-close" (click)="close()">&times;</button>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li *ngFor="let link of links">
            <a [routerLink]="link.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: link.route === '/' }"
               (click)="close()">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  links = [
    { label: 'Home',        route: '/' },
    { label: 'About Us',    route: '/about' },
    { label: 'Products',    route: '/products' },
    { label: 'Services',    route: '/services' },
    { label: 'Research',    route: '/research' },
    { label: 'Partnership', route: '/partnerships' },
    { label: 'Blog',        route: '/blog' },
    { label: 'Contact',     route: '/contact' },
  ];

  close() {
    this.closeEvent.emit();
  }
}