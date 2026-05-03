import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../core/services/product.service';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get allProducts(): Product[] {
    return this.products;
  }

  async loadProducts(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      const data = await firstValueFrom(this.productService.getAll().pipe(take(1)));
      this.products = data;
    } catch (err: any) {
      console.error(err);
      this.error = 'Failed to load products. Please try again.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url}`;
  }

  getClinicalBenefits(benefits: string | null | undefined): string[] {
    if (!benefits) return [];
    return benefits.split(';').map(b => b.trim()).filter(b => b);
  }
}