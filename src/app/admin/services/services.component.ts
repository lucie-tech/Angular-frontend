import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';
import { Service } from '../../models/nutriomedics.models';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class AdminServicesComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  showForm = false;
  isEditing = false;
  deleteConfirmId: number | null = null;
  form: Partial<Service> = this.emptyForm();

  // Fixed: use 'label' instead of 'value' to match template
  iconOptions = [
    { key: 'activity', label: 'Activity' },
    { key: 'heart', label: 'Heart' },
    { key: 'shield', label: 'Shield' },
    { key: 'users', label: 'Users' },
    { key: 'book', label: 'Book' },
    { key: 'briefcase', label: 'Briefcase' },
    { key: 'chat', label: 'Chat' },
    { key: 'clipboard', label: 'Clipboard' }
  ];

  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  private emptyForm(): Partial<Service> {
    return {
      title: '',
      description: '',
      slug: '',
      iconKey: '',
      displayOrder: 0,
      isActive: true
    };
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getAll().subscribe({
      next: (data) => {
        this.services = data;
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

  openEditForm(service: Service): void {
    this.form = { ...service };
    this.isEditing = true;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.form = this.emptyForm();
  }

  saveService(): void {
    if (!this.form.title) {
      alert('Title is required.');
      return;
    }

    if (!this.form.slug) {
      this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const payload = { ...this.form };
    if (this.isEditing && this.form.id) {
      this.serviceService.update(this.form.id, payload).subscribe({
        next: () => {
          this.loadServices();
          this.closeForm();
          alert('Service updated');
        },
        error: (err) => {
          console.error(err);
          alert('Update failed');
        }
      });
    } else {
      this.serviceService.create(payload).subscribe({
        next: () => {
          this.loadServices();
          this.closeForm();
          alert('Service created');
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

  deleteService(): void {
    if (!this.deleteConfirmId) return;
    this.serviceService.delete(this.deleteConfirmId).subscribe({
      next: () => {
        this.loadServices();
        this.deleteConfirmId = null;
        alert('Service deleted');
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  toggleActive(service: Service): void {
    const updated = { ...service, isActive: !service.isActive };
    this.serviceService.update(service.id!, updated).subscribe({
      next: () => this.loadServices(),
      error: (err) => {
        console.error(err);
        alert('Status update failed');
      }
    });
  }
}