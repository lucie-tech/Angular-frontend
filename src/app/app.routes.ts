import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { loginRedirectGuard } from './core/guards/login-redirect.guard';
import { LoginComponent } from './admin/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminServicesComponent } from './admin/services/services.component';
import { AdminPartnersComponent } from './admin/partnerships/partners.component';
import { AdminResearchComponent } from './admin/research/admin-research.component';
import { AdminBlogsComponent } from './admin/blog/blogs.component';
import { ProductsComponent as AdminProductsComponent } from './admin/products/product.component';
import { AdminContactsComponent } from './admin/contacts/admin-contacts.component';
import { ProfileComponent } from './admin/profile/profile.component';
import { FAQComponent } from './admin/faqs/faq.component';
import { HeroAdminComponent } from './admin/hero/hero.component';
import { AdminUsersComponent } from './admin/users/users.component';  // ← ADD THIS
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ProductsComponent } from './components/products/products.component';
import { ServicesComponent } from './components/services/services.component';
import { ContactComponent } from './components/contact/contact.component';
import { PartnershipComponent } from './components/partnership/partnership.component';
import { BlogComponent } from './components/blog/blog.component';
import { ResearchComponent } from './components/research/research.component';

export const routes: Routes = [

  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HeroComponent },
      { path: 'about', component: AboutComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'partnerships', component: PartnershipComponent },
      { path: 'blog', component: BlogComponent },
      { path: 'research', component: ResearchComponent },
    ]
  },

  {
    path: 'admin',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginRedirectGuard]
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./admin/forgot/forgot-password').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./admin/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
          { path: 'dashboard', component: DashboardComponent },
          { path: 'services', component: AdminServicesComponent },
          { path: 'partners', component: AdminPartnersComponent },
          { path: 'research', component: AdminResearchComponent },
          { path: 'blogs', component: AdminBlogsComponent },
          { path: 'products', component: AdminProductsComponent },
          { path: 'contact', component: AdminContactsComponent },
          { path: 'profile', component: ProfileComponent },
          { path: 'faqs', component: FAQComponent },
          { path: 'hero', component: HeroAdminComponent },
          { path: 'users', component: AdminUsersComponent },  // ← ADD USER MANAGEMENT ROUTE
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]
  },

  { path: '**', redirectTo: '' }
];