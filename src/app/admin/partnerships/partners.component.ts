import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../core/services/partner.service';      // ← fixed: ../../ not ../../
import { Partnership } from '../../models/nutriomedics.models';           // ← fixed

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class AdminPartnersComponent implements OnInit {
  partners: Partnership[] = [];
  loading = false;
  showForm = false;
  isEditing = false;
  deleteConfirmId: number | null = null;
  form: Partial<Partnership> = this.emptyForm();

  partnerTypes = [
    'Academic & Research',
    'Healthcare',
    'Government',
    'Non-Profit',
    'Industry',
    'International',
    'Technology',
    'Other'
  ];

  constructor(private partnerService: PartnerService) {}

  ngOnInit(): void {
    this.loadPartners();
  }

  private emptyForm(): Partial<Partnership> {
    return {
      partnerType: '',
      organizationName: '',
      description: '',
      logoUrl: null,
      websiteUrl: null,
      displayOrder: 1,
      isActive: true
    };
  }

  loadPartners(): void {
    this.loading = true;
    this.partnerService.getAll().subscribe({
      next: (data) => {
        this.partners = data;
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

  openEditForm(partner: Partnership): void {
    this.form = { ...partner };
    this.isEditing = true;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.form = this.emptyForm();
  }

  savePartner(): void {
    if (!this.form.organizationName || !this.form.partnerType) {
      alert('Organization name and partner type are required.');
      return;
    }

    const payload = { ...this.form };
    if (this.isEditing && this.form.id) {
      this.partnerService.update(this.form.id, payload).subscribe({
        next: () => {
          this.loadPartners();
          this.closeForm();
          alert('Partner updated');
        },
        error: (err) => {
          console.error(err);
          alert('Update failed');
        }
      });
    } else {
      this.partnerService.create(payload).subscribe({
        next: () => {
          this.loadPartners();
          this.closeForm();
          alert('Partner created');
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

  deletePartner(): void {
    if (!this.deleteConfirmId) return;
    this.partnerService.delete(this.deleteConfirmId).subscribe({
      next: () => {
        this.loadPartners();
        this.deleteConfirmId = null;
        alert('Partner deleted');
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  toggleActive(partner: Partnership): void {
    const updated = { ...partner, isActive: !partner.isActive };
    this.partnerService.update(partner.id!, updated).subscribe({
      next: () => this.loadPartners(),
      error: (err) => {
        console.error(err);
        alert('Status update failed');
      }
    });
  }
}