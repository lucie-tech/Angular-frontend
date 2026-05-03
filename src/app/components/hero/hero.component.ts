// src/app/components/hero/hero.component.ts

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { HeroService } from '../../core/services/hero.service';
import { HeroImage } from '../../models/nutriomedics.models';

export interface CarouselSlide {
  tag: string;
  title: string;
  desc: string;
  image: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit, OnDestroy {
  private heroService = inject(HeroService);
  private router = inject(Router);

  // ONLY carousel slides are dynamic
  carouselSlides: CarouselSlide[] = [];
  activeSlide = 0;
  exitSlide = -1;
  progressWidth = 0;
  loading = true;
  error = false;
  errorMessage = '';

  private readonly SLIDE_DURATION = 10000;
  private readonly PROGRESS_TICK = 60;
  private elapsed = 0;
  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadHeroImages();
  }

  loadHeroImages(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    this.heroService.getHeroImages().subscribe({
      next: (images: HeroImage[]) => {
        if (images && images.length > 0) {
          // ONLY carousel slides come from database
          this.carouselSlides = images.map((image) => ({
            tag: image.title || '',
            title: image.title || '',
            desc: image.subtitle || '',
            image: image.imageUrl
          }));
          this.startAutoPlay();
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading hero images:', err);
        this.error = true;
        this.errorMessage = 'Failed to load carousel images.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAll();
  }

  nextSlide(): void {
    if (this.carouselSlides.length === 0) return;
    this.changeTo((this.activeSlide + 1) % this.carouselSlides.length);
    this.resetAutoPlay();
  }

  prevSlide(): void {
    if (this.carouselSlides.length === 0) return;
    this.changeTo(
      (this.activeSlide - 1 + this.carouselSlides.length) % this.carouselSlides.length
    );
    this.resetAutoPlay();
  }

  goToSlide(index: number): void {
    if (index === this.activeSlide || this.carouselSlides.length === 0) return;
    this.changeTo(index);
    this.resetAutoPlay();
  }

  private changeTo(next: number): void {
    const prev = this.activeSlide;
    this.exitSlide = prev;
    this.activeSlide = next;

    setTimeout(() => {
      if (this.exitSlide === prev) this.exitSlide = -1;
    }, 600);
  }

  private startAutoPlay(): void {
    if (this.carouselSlides.length <= 1) return;
    
    this.elapsed = 0;
    this.progressWidth = 0;

    this.progressTimer = setInterval(() => {
      this.elapsed += this.PROGRESS_TICK;
      this.progressWidth = Math.min(
        (this.elapsed / this.SLIDE_DURATION) * 100,
        100
      );
    }, this.PROGRESS_TICK);

    this.autoTimer = setInterval(() => {
      this.changeTo((this.activeSlide + 1) % this.carouselSlides.length);
      this.elapsed = 0;
      this.progressWidth = 0;
    }, this.SLIDE_DURATION);
  }

  private stopAll(): void {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private resetAutoPlay(): void {
    this.stopAll();
    this.startAutoPlay();
  }

  retryLoad(): void {
    this.heroService.clearCache();
    this.loadHeroImages();
  }

  // Static navigation methods for buttons
  navigateToProducts(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/products']);
  }

  navigateToContact(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/contact']);
  }

  navigateToAbout(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/about']);
  }

  navigateToPartnership(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/partnerships']);
  }
}