import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../core/services/partner.service';
import { Partnership } from '../../models/nutriomedics.models';
import { firstValueFrom } from 'rxjs';
import { take, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-partnership',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partnership.component.html',
  styleUrls: ['./partnership.component.scss']
})
export class PartnershipComponent implements OnInit {
  partnerships: Partnership[] = [];
  isLoading = true;
  error = '';

  constructor(
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPartnerships();
  }

  async loadPartnerships(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      const data = await firstValueFrom(
        this.partnerService.getAll().pipe(
          take(1),
          timeout(8000) // prevents infinite hanging
        )
      );
      this.partnerships = data.filter(p => p.isActive);
      if (this.partnerships.length === 0) {
        this.error = 'No active partnerships found.';
      }
    } catch (err: any) {
      console.error('API error:', err);
      this.error = err.name === 'TimeoutError'
        ? 'The server is taking too long to respond. Please check your connection and try again.'
        : 'Failed to load partnerships. Please refresh or try again later.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  retry(): void {
    this.loadPartnerships();
  }
}