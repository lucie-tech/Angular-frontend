import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../../shared/navbar/nav.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent],
  template: `
    <app-nav></app-nav>
    <main class="public-main">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%);
    }
    
    .public-main {
      background: transparent;
      min-height: calc(100vh - 70px - 60px);
      padding-top: 70px;
    }
  `]
})
export class PublicLayoutComponent {}