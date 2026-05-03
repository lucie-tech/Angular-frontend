// src/app/admin/hero/hero.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroService } from '../../core/services/hero.service';
import { HeroImage } from '../../models/nutriomedics.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-hero-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroAdminComponent implements OnInit, OnDestroy {
  heroImages: HeroImage[] = [];
  loading: boolean = false;
  showForm: boolean = false;
  isEditing: boolean = false;
  deleteConfirmId: number | null = null;
  imagePreviewUrl: string | null = null;
  private destroy$ = new Subject<void>();
  
  form: Partial<HeroImage> = {
    imageUrl: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    displayOrder: 0,
    isActive: true
  };

  constructor(private heroService: HeroService) {}

  ngOnInit(): void {
    this.loadHeroImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHeroImages(): void {
    this.loading = true;
    this.heroService.getAllHeroImages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: HeroImage[]) => {
          this.heroImages = data;
          this.loading = false;
        },
        error: (err: Error) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  openAddForm(): void {
    this.form = {
      imageUrl: '',
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      displayOrder: this.heroImages.length + 1,
      isActive: true
    };
    this.imagePreviewUrl = null;
    this.isEditing = false;
    this.showForm = true;
  }

  openEditForm(heroImage: HeroImage): void {
    this.form = { ...heroImage };
    this.imagePreviewUrl = heroImage.imageUrl;
    this.isEditing = true;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.form = {
      imageUrl: '',
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      displayOrder: 0,
      isActive: true
    };
    this.imagePreviewUrl = null;
  }

  previewImage(): void {
    if (this.form.imageUrl && this.form.imageUrl.trim()) {
      this.imagePreviewUrl = this.form.imageUrl;
    } else {
      this.imagePreviewUrl = null;
    }
  }

  saveHeroImage(): void {
    if (!this.form.imageUrl?.trim()) {
      alert('Please enter an image URL');
      return;
    }
    if (!this.form.title?.trim()) {
      alert('Please enter a title');
      return;
    }

    // Build a clean payload – no extra fields, types corrected
    const payload: any = {
      imageUrl: this.form.imageUrl.trim(),
      title: this.form.title.trim(),
      subtitle: (this.form.subtitle || '').trim(),
      buttonText: (this.form.buttonText || '').trim(),
      buttonLink: (this.form.buttonLink || '').trim(),
      displayOrder: Number(this.form.displayOrder),
      isActive: this.form.isActive === true
    };

    if (this.isEditing && this.form.id) {
      // For update, include the id
      payload.id = this.form.id;
      this.heroService.updateHeroImage(this.form.id, payload).subscribe({
        next: () => {
          this.heroService.clearCache();
          this.loadHeroImages();
          this.closeForm();
          alert('Hero image updated successfully');
        },
        error: (err: any) => {
          console.error(err);
          const msg = err.error?.message || err.message || 'Update failed';
          alert(msg);
        }
      });
    } else {
      // For creation, NO id field
      this.heroService.createHeroImage(payload).subscribe({
        next: () => {
          this.heroService.clearCache();
          this.loadHeroImages();
          this.closeForm();
          alert('Hero image created successfully');
        },
        error: (err: any) => {
          console.error(err);
          const msg = err.error?.message || err.message || 'Creation failed';
          alert(msg);
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  deleteHeroImage(): void {
    if (!this.deleteConfirmId) return;
    this.heroService.deleteHeroImage(this.deleteConfirmId).subscribe({
      next: () => {
        this.heroService.clearCache();
        this.loadHeroImages();
        this.deleteConfirmId = null;
        alert('Hero image deleted successfully');
      },
      error: (err: any) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  toggleStatus(heroImage: HeroImage): void {
    const updated = { ...heroImage, isActive: !heroImage.isActive };
    this.heroService.updateHeroImage(heroImage.id, updated).subscribe({
      next: () => {
        this.heroService.clearCache();
        this.loadHeroImages();
      },
      error: (err: any) => {
        console.error(err);
        alert('Status update failed');
      }
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const current: HeroImage = this.heroImages[index];
    const previous: HeroImage = this.heroImages[index - 1];
    
    const currentOrder: number = current.displayOrder;
    const previousOrder: number = previous.displayOrder;
    
    current.displayOrder = previousOrder;
    previous.displayOrder = currentOrder;
    
    this.heroService.updateHeroImage(current.id, { displayOrder: previousOrder }).subscribe();
    this.heroService.updateHeroImage(previous.id, { displayOrder: currentOrder }).subscribe();
    
    setTimeout(() => {
      this.heroService.clearCache();
      this.loadHeroImages();
    }, 500);
  }

  moveDown(index: number): void {
    if (index === this.heroImages.length - 1) return;
    const current: HeroImage = this.heroImages[index];
    const next: HeroImage = this.heroImages[index + 1];
    
    const currentOrder: number = current.displayOrder;
    const nextOrder: number = next.displayOrder;
    
    current.displayOrder = nextOrder;
    next.displayOrder = currentOrder;
    
    this.heroService.updateHeroImage(current.id, { displayOrder: nextOrder }).subscribe();
    this.heroService.updateHeroImage(next.id, { displayOrder: currentOrder }).subscribe();
    
    setTimeout(() => {
      this.heroService.clearCache();
      this.loadHeroImages();
    }, 500);
  }
}