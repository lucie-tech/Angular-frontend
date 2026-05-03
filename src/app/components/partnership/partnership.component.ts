import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../core/services/partner.service';
import { Partnership } from '../../models/nutriomedics.models';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

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
      const data = await firstValueFrom(this.partnerService.getAll().pipe(take(1)));
      this.partnerships = data.filter(p => p.isActive);
    } catch (err: any) {
      console.error(err);
      this.error = 'Failed to load partnerships.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}