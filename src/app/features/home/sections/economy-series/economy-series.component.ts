import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { LanguageService } from '../../../../core/services/language.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../models/product.model';

// Static fallback data for UI rendering
const ECONOMY_PRODUCTS: Product[] = [
  { id: 'e1', name: 'Linear Guides', brand: 'Zoieng', category: 'automation', price: 1024, image: '', series: 'economy', inStock: true },
  { id: 'e2', name: 'Linear Bushings', brand: 'Zoieng', category: 'automation', price: 184, image: '', series: 'economy', inStock: true },
  { id: 'e3', name: 'Ball Bearings', brand: 'Zoieng', category: 'automation', price: 71, image: '', series: 'economy', inStock: true },
  { id: 'e4', name: 'Caster Wheels', brand: 'Zoieng', category: 'automation', price: 597, image: '', series: 'economy', inStock: true },
  { id: 'e5', name: 'Handles', brand: 'Zoieng', category: 'fasteners', price: 149, image: '', series: 'economy', inStock: true },
  { id: 'e6', name: 'Switching Hubs', brand: 'Zoieng', category: 'electrical', price: 5415, image: '', series: 'economy', inStock: false },
  { id: 'e7', name: 'Shaft Collars', brand: 'Zoieng', category: 'automation', price: 89, image: '', series: 'economy', inStock: true },
  { id: 'e8', name: 'Oil Free Bushings', brand: 'Zoieng', category: 'automation', price: 245, image: '', series: 'economy', inStock: true },
  { id: 'e9', name: 'Locating Pins', brand: 'Zoieng', category: 'press-die', price: 67, image: '', series: 'economy', inStock: true },
  { id: 'e10', name: 'Aluminum Brackets', brand: 'Zoieng', category: 'automation', price: 312, image: '', series: 'economy', inStock: true },
  { id: 'e11', name: 'Spring Plungers', brand: 'Zoieng', category: 'fasteners', price: 95, image: '', series: 'economy', inStock: true },
  { id: 'e12', name: 'Timing Pulleys', brand: 'Zoieng', category: 'automation', price: 487, image: '', series: 'economy', inStock: false },
];

@Component({
  selector: 'app-economy-series',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProductCardComponent],
  template: `
  <section class="my-6">
    <h2 class="section-title">{{ lang.t('economy_series') }}</h2>

    <div class="flex gap-4">
      <!-- Left promo card -->
      <div class="hidden lg:flex w-44 shrink-0 rounded-lg overflow-hidden flex-col"
           style="background: linear-gradient(180deg, var(--zoeing-gold) 0%, var(--zoeing-gold-dark) 100%); min-height: 340px;">
        <div class="p-4 flex flex-col gap-2 flex-1">
          <span class="font-display font-black text-brand-blue text-lg leading-tight">ECONOMY SERIES</span>
          <span class="text-xs font-semibold text-brand-blue-dark opacity-80">Factory Automation Components</span>

          <!-- Fake component visual -->
          <div class="flex-1 flex items-center justify-center">
            <div class="grid grid-cols-2 gap-1.5">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="w-12 h-10 rounded bg-brand-blue/20 flex items-center justify-center">
                  <span class="material-icons text-brand-blue text-lg">{{ icons[i-1] }}</span>
                </div>
              }
            </div>
          </div>

          <button class="btn-primary text-xs w-full justify-center">
            {{ lang.t('view_more') }} ›
          </button>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="flex-1 min-w-0">
        @if (loading()) {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
              <div class="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        }
      </div>
    </div>
  </section>
  `,
})
export class EconomySeriesComponent implements OnInit {
  protected lang = inject(LanguageService);
  private productService = inject(ProductService);

  products = signal<Product[]>(ECONOMY_PRODUCTS);
  loading = signal(false);

  readonly icons = ['settings', 'hardware', 'layers', 'cable', 'electric_bolt', 'build'];

  ngOnInit(): void {
    // Try API, fallback to static data
    this.productService.getEconomySeries(1, 12).subscribe({
      next: res => { if (res.items.length) this.products.set(res.items); },
      error: () => { /* static data already set */ },
    });
  }
}
