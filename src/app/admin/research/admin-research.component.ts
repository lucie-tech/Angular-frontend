import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResearchService } from '../../core/services/research.service';
import { ResearchArea } from '../../models/nutriomedics.models';

@Component({
  selector: 'app-admin-research',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-research.component.html',
  styleUrls: ['./admin-research.component.scss']
})
export class AdminResearchComponent implements OnInit {
  research: ResearchArea[] = [];   // ← renamed from researchAreas
  loading = false;
  showForm = false;
  isEditing = false;
  deleteConfirmId: number | null = null;
  form: Partial<ResearchArea> = this.emptyForm();

  focusTags = [
    'Diabetes', 'CKD', 'Oncology', 'Functional Foods',
    'Cardiovascular', 'Obesity', 'Pediatric Nutrition',
    'Gut Health', 'Immunonutrition', 'Other'
  ];

  constructor(private researchService: ResearchService) {}

  ngOnInit(): void {
    this.loadResearch();
  }

  private emptyForm(): Partial<ResearchArea> {
    return {
      title: '',
      description: '',
      focusTag: '',
      displayOrder: 1,
      isActive: true
    };
  }

  loadResearch(): void {
    this.loading = true;
    this.researchService.getAll().subscribe({
      next: (data) => {
        this.research = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.showForm = true;
  }

  openEditForm(item: ResearchArea): void {
    this.form = { ...item };
    this.isEditing = true;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.form = this.emptyForm();
  }

  saveResearch(): void {
    if (!this.form.title || !this.form.description) {
      alert('Title and description are required.');
      return;
    }

    const payload = { ...this.form };
    if (this.isEditing && this.form.id) {
      this.researchService.update(this.form.id, payload).subscribe({
        next: () => {
          this.loadResearch();
          this.closeForm();
          alert('Research area updated');
        },
        error: (err) => {
          console.error(err);
          alert('Update failed');
        }
      });
    } else {
      this.researchService.create(payload).subscribe({
        next: () => {
          this.loadResearch();
          this.closeForm();
          alert('Research area created');
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

  deleteResearch(): void {
    if (!this.deleteConfirmId) return;
    this.researchService.delete(this.deleteConfirmId).subscribe({
      next: () => {
        this.loadResearch();
        this.deleteConfirmId = null;
        alert('Research area deleted');
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  toggleActive(item: ResearchArea): void {
    const updated = { ...item, isActive: !item.isActive };
    this.researchService.update(item.id!, updated).subscribe({
      next: () => this.loadResearch(),
      error: (err) => {
        console.error(err);
        alert('Status update failed');
      }
    });
  }
}