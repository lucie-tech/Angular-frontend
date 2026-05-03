import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isOpen = false;

 links = [
  { label: 'Home',        path: '/' },
  { label: 'About Us',    path: '/about' },
  { label: 'Products',    path: '/products' },
  { label: 'Research',    path: '/research' },
  { label: 'Services',    path: '/services' },
  { label: 'Partnership', path: '/partnerships' },  // was /partnership
  { label: 'Blogs',       path: '/blog' },           // was /blogs
  { label: 'Contacts',    path: '/contact' },        // was /contacts
];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}