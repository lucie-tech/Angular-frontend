// src/app/admin/faqs/faq.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FAQService } from '../../core/services/faq.service';
import { FAQ } from '../../models/nutriomedics.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FAQComponent implements OnInit, OnDestroy {
  faqs: FAQ[] = [];
  loading = false;
  showForm = false;
  isEditing = false;
  deleteConfirmId: number | null = null;
  private destroy$ = new Subject<void>();
  
  form: Partial<FAQ> = {
    question: '',
    answer: '',
    additionalInfo: null,
    displayOrder: 0,
    isActive: true
  };

  constructor(private faqService: FAQService) {}

  ngOnInit(): void {
    this.loadFAQs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFAQs(): void {
    this.loading = true;
    this.faqService.getAllFAQs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.faqs = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  openAddForm(): void {
    this.form = {
      question: '',
      answer: '',
      additionalInfo: null,
      displayOrder: this.faqs.length + 1,
      isActive: true
    };
    this.isEditing = false;
    this.showForm = true;
  }

  openEditForm(faq: FAQ): void {
    this.form = { ...faq };
    this.isEditing = true;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.form = {
      question: '',
      answer: '',
      additionalInfo: null,
      displayOrder: 0,
      isActive: true
    };
  }

  saveFAQ(): void {
    if (!this.form.question?.trim()) {
      alert('Please enter a question');
      return;
    }
    if (!this.form.answer?.trim()) {
      alert('Please enter an answer');
      return;
    }

    if (this.isEditing && this.form.id) {
      this.faqService.updateFAQ(this.form.id, this.form).subscribe({
        next: () => {
          this.faqService.clearCache(); // ✅ Clear cache
          this.loadFAQs();
          this.closeForm();
          alert('FAQ updated successfully');
        },
        error: (err) => {
          console.error(err);
          alert('Update failed');
        }
      });
    } else {
      this.faqService.createFAQ(this.form).subscribe({
        next: () => {
          this.faqService.clearCache(); // ✅ Clear cache
          this.loadFAQs();
          this.closeForm();
          alert('FAQ created successfully');
        },
        error: (err) => {
          console.error(err);
          alert('Creation failed');
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  deleteFAQ(): void {
    if (!this.deleteConfirmId) return;
    this.faqService.deleteFAQ(this.deleteConfirmId).subscribe({
      next: () => {
        this.faqService.clearCache(); // ✅ Clear cache
        this.loadFAQs();
        this.deleteConfirmId = null;
        alert('FAQ deleted successfully');
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  toggleStatus(faq: FAQ): void {
    const updated = { ...faq, isActive: !faq.isActive };
    this.faqService.updateFAQ(faq.id, updated).subscribe({
      next: () => {
        this.faqService.clearCache(); // ✅ Clear cache
        this.loadFAQs();
      },
      error: (err) => {
        console.error(err);
        alert('Status update failed');
      }
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const current = this.faqs[index];
    const previous = this.faqs[index - 1];
    
    const currentOrder = current.displayOrder;
    const previousOrder = previous.displayOrder;
    
    current.displayOrder = previousOrder;
    previous.displayOrder = currentOrder;
    
    this.faqService.updateFAQ(current.id, { displayOrder: previousOrder }).subscribe();
    this.faqService.updateFAQ(previous.id, { displayOrder: currentOrder }).subscribe();
    
    setTimeout(() => {
      this.faqService.clearCache();
      this.loadFAQs();
    }, 500);
  }

  moveDown(index: number): void {
    if (index === this.faqs.length - 1) return;
    const current = this.faqs[index];
    const next = this.faqs[index + 1];
    
    const currentOrder = current.displayOrder;
    const nextOrder = next.displayOrder;
    
    current.displayOrder = nextOrder;
    next.displayOrder = currentOrder;
    
    this.faqService.updateFAQ(current.id, { displayOrder: nextOrder }).subscribe();
    this.faqService.updateFAQ(next.id, { displayOrder: currentOrder }).subscribe();
    
    setTimeout(() => {
      this.faqService.clearCache();
      this.loadFAQs();
    }, 500);
  }
}