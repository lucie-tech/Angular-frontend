import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearchService } from '../../core/services/research.service';
import { ResearchArea } from '../../models/nutriomedics.models';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit {
  researchAreas: ResearchArea[] = [];
  isLoading = true;
  error = '';

  constructor(
    private researchService: ResearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadResearchAreas();
  }

  async loadResearchAreas(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      // Use getActive() directly – backend returns only active ones
      const data = await firstValueFrom(this.researchService.getActive().pipe(take(1)));
      this.researchAreas = data;
    } catch (err: any) {
      console.error(err);
      this.error = 'Failed to load research areas.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}