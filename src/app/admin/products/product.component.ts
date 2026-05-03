import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Product {
  id?: number;
  userId?: number;
  name: string;
  description: string;
  category: string;
  slug: string;
  tagline: string;
  status: string;
  featured: boolean;
  clinicalBenefits: string;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductsComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/products';
  private backendUrl = 'http://localhost:8080';

  products: Product[] = [];
  loading = false;
  showModal = false;
  isEditing = false;
  searchTerm = '';
  deleteConfirmId: number | null = null;
  
  // NEW: URL-based image instead of file upload
  imageUrlInput: string = '';
  imagePreview: string | null = null;
  
  form: Product = this.emptyForm();

  statusOptions = ['active', 'inactive', 'draft'];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.loadProducts(); 
  }

  emptyForm(): Product {
    return {
      name: '',
      description: '',
      category: '',
      slug: '',
      tagline: '',
      status: 'active',
      featured: false,
      clinicalBenefits: '',
      imageUrl: null
    };
  }

  loadProducts() {
    this.loading = true;
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('Error loading products:', e);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Helper method to get full image URL
  getImageUrl(imageUrl: string | null): string {
    if (!imageUrl) {
      return '';
    }
    // If it's already a full URL (Cloudinary or other), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, it's a local path
    return `${this.backendUrl}${imageUrl}`;
  }

  openAddForm() {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.imageUrlInput = '';
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditForm(product: Product) {
    this.form = { ...product };
    this.isEditing = true;
    this.imageUrlInput = product.imageUrl || '';
    if (this.form.imageUrl) {
      this.imagePreview = this.getImageUrl(this.form.imageUrl);
    }
    this.showModal = true;
  }

  closeForm() {
    this.showModal = false;
    this.form = this.emptyForm();
    this.imageUrlInput = '';
    this.imagePreview = null;
  }

  // NEW: Handle image URL input instead of file selection
  onImageUrlChange() {
    if (this.imageUrlInput && this.imageUrlInput.trim()) {
      let url = this.imageUrlInput.trim();
      
      // Validate URL format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('Please enter a valid URL starting with http:// or https://');
        this.imagePreview = null;
        return;
      }
      
      this.imagePreview = url;
      this.form.imageUrl = url;
    } else {
      this.imagePreview = null;
      this.form.imageUrl = null;
    }
    this.cdr.detectChanges();
  }

  // Optional: Add a test button to verify image URL works
  testImageUrl() {
    if (this.imageUrlInput) {
      const img = new Image();
      img.onload = () => {
        alert('✅ Image URL is valid and loads successfully!');
      };
      img.onerror = () => {
        alert('❌ Could not load image from this URL. Please check the link and make sure it\'s publicly accessible.');
      };
      img.src = this.imageUrlInput;
    } else {
      alert('Please enter an image URL first');
    }
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onNameChange() {
    if (this.form.name && !this.isEditing) {
      this.form.slug = this.generateSlug(this.form.name);
    }
  }

  saveProduct() {
    if (!this.form.name || !this.form.description || !this.form.category) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare product data (no file upload anymore)
    const productData = {
      name: this.form.name,
      description: this.form.description,
      category: this.form.category,
      slug: this.form.slug || this.generateSlug(this.form.name),
      tagline: this.form.tagline || '',
      status: this.form.status || 'active',
      featured: this.form.featured || false,
      clinicalBenefits: this.form.clinicalBenefits || '',
      imageUrl: this.form.imageUrl || null  // Save the URL directly
    };
    
    if (this.isEditing && this.form.id) {
      // Update existing product
      this.http.put<Product>(`${this.apiUrl}/${this.form.id}`, productData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
          alert('Product updated successfully!');
        },
        error: (e) => {
          console.error('Update error:', e);
          alert('Failed to update product');
        }
      });
    } else {
      // Create new product
      this.http.post<Product>(this.apiUrl, productData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
          alert('Product created successfully!');
        },
        error: (e) => {
          console.error('Create error:', e);
          alert('Failed to create product');
        }
      });
    }
  }

  confirmDelete(id: number) { 
    this.deleteConfirmId = id; 
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  deleteProduct() {
    if (!this.deleteConfirmId) return;
    this.http.delete(`${this.apiUrl}/${this.deleteConfirmId}`).subscribe({
      next: () => {
        this.loadProducts();
        this.deleteConfirmId = null;
        alert('Product deleted successfully!');
      },
      error: (e) => {
        console.error('Delete error:', e);
        alert('Failed to delete product');
      }
    });
  }

  toggleFeatured(product: Product) {
    const updated = { ...product, featured: !product.featured };
    
    this.http.put<Product>(`${this.apiUrl}/${product.id}`, updated).subscribe({
      next: () => this.loadProducts(),
      error: (e) => {
        console.error('Toggle featured error:', e);
        alert('Failed to update featured status');
      }
    });
  }

  get filteredProducts() {
    if (!this.searchTerm) return this.products;
    return this.products.filter(product =>
      product.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.tagline?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}