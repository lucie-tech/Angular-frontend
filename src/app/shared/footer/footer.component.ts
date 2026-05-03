import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <footer>
      <div class="footer-container">
        <div class="footer-logo" routerLink="/" routerLinkActive="active">Nutriomedics</div>
        <div class="footer-copy">All rights reserved. &copy; 2026 Nutriomedics Company Limited · Dodoma, Tanzania</div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background:  #fffffff5;
      border-top: 1px solid rgb(220, 241, 232);
      padding: 0.25rem 4vw;
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      margin-top: auto;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 100;
    }

    footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background:  #afe7c8;
    }

    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.1rem;
      text-align: center;
    }

    .footer-logo {
      font-family: 'Inter', 'SF Pro Display', system-ui;
      font-size: 1.25rem;
      font-weight: 300;
      letter-spacing: -0.3px;
      background: rgba(9, 20, 16, 0.6);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      cursor: pointer;
      transition: opacity 0.2s ease;
      display: inline-block;
      width: fit-content;
    }

    .footer-logo:hover {
      opacity: 0.85;
    }

    .footer-copy {
      font-size: 0.85rem;
      color: rgba(9, 20, 16, 0.6);
      font-weight: 400;
      letter-spacing: 0.2px;
    }

    @media (max-width: 60px) {
      footer {
        padding: 0.15rem 0.12rem;
      }
      .footer-copy {
        font-size: 0.2rem;
      }
      .footer-logo {
        font-size: 0.15rem;
      }
    }
  `]
})
export class FooterComponent {}