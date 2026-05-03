import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { ServiceService } from '../../core/services/service.service';
import { ResearchService } from '../../core/services/research.service';
import { PartnerService } from '../../core/services/partner.service';
import { BlogService } from '../../core/services/blog.service';
import { ContactService } from '../../core/services/contact.service';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user: any;
  loading = true;
  error = '';

  stats = {
    products: 0,
    services: 0,
    research: 0,
    partners: 0,
    blogs: 0,
    contacts: 0
  };

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private serviceService: ServiceService,
    private researchService: ResearchService,
    private partnerService: PartnerService,
    private blogService: BlogService,
    private contactService: ContactService,
    private cdr: ChangeDetectorRef  // ← ADD THIS
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.loadStats();
  }

  private async loadStats(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();  // ← FORCE UPDATE IMMEDIATELY

    try {
      const results = await Promise.allSettled([
        firstValueFrom(this.productService.getAll().pipe(take(1))),
        firstValueFrom(this.serviceService.getAll().pipe(take(1))),
        firstValueFrom(this.researchService.getAll().pipe(take(1))),
        firstValueFrom(this.partnerService.getAll().pipe(take(1))),
        firstValueFrom(this.blogService.getAllPosts().pipe(take(1))),
        firstValueFrom(this.contactService.getAllMessages().pipe(take(1)))
      ]);

      const products = results[0].status === 'fulfilled' ? results[0].value : [];
      const services = results[1].status === 'fulfilled' ? results[1].value : [];
      const research = results[2].status === 'fulfilled' ? results[2].value : [];
      const partners = results[3].status === 'fulfilled' ? results[3].value : [];
      const blogs = results[4].status === 'fulfilled' ? results[4].value : [];
      const contacts = results[5].status === 'fulfilled' ? results[5].value : [];

      this.stats = {
        products: products.length,
        services: services.length,
        research: research.length,
        partners: partners.length,
        blogs: blogs.length,
        contacts: contacts.length
      };

    } catch (err: any) {
      console.error('Dashboard error:', err);
      this.error = 'Failed to load dashboard data';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();  // ← FORCE UPDATE AFTER CHANGES
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}