import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { LanguageService } from '../../../../core/services/language.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../models/product.model';

const AUTO_PRODUCTS: Product[] = [
  { id: 'a1', name: 'Linear Shafts - Straight Type', brand: 'Zoieng', category: 'automation', price: 199, image: '', series: 'standard', inStock: true },
  { id: 'a2', name: 'Linear Guides for Medium Load', brand: 'Zoieng', category: 'automation', price: 1024, image: '', series: 'standard', inStock: true },
  { id: 'a3', name: 'Rotary Shafts One/Both End Stepped', brand: 'Zoieng', category: 'automation', price: 345, image: '', series: 'standard', inStock: true },
  { id: 'a4', name: 'Small Ball Bearing', brand: 'Zoieng', category: 'automation', price: 71, image: '', series: 'economy', inStock: true },
  { id: 'a5', name: 'Star Quick S8M0400', brand: 'Mitsuboshi', category: 'automation', price: 2890, image: '', series: 'standard', inStock: false },
  { id: 'a6', name: 'Aluminum Extrusion 6 Series', brand: 'Zoieng', category: 'automation', price: 299, image: '', series: 'standard', inStock: true },
  { id: 'a7', name: 'Urethane Caster Universal Type', brand: 'Zoieng', category: 'automation', price: 597, image: '', series: 'standard', inStock: true },
  { id: 'a8', name: 'Small Diameter Locating Pins', brand: 'Zoieng', category: 'automation', price: 67, image: '', series: 'economy', inStock: true },
  { id: 'a9', name: 'Bellows Flex CHP', brand: 'Miki Pulley', category: 'automation', price: 4200, image: '', series: 'standard', inStock: true },
  { id: 'a10', name: 'Leveling Foot', brand: 'NIC AUTOTEC', category: 'automation', price: 380, image: '', series: 'standard', inStock: true },
  { id: 'a11', name: 'Linear Bushings - Single', brand: 'Zoieng', category: 'automation', price: 184, image: '', series: 'economy', inStock: true },
  { id: 'a12', name: 'Oil Free Bushings', brand: 'Zoieng', category: 'automation', price: 245, image: '', series: 'economy', inStock: true },
];

@Component({
  selector: 'app-automation-components',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProductCardComponent],
  template: `
  <section class="my-6">
    <h2 class="section-title">{{ lang.t('automation') }}</h2>

    <div class="flex gap-4">
      <!-- Left promo card -->
      <div class="hidden lg:flex w-44 shrink-0 rounded-lg overflow-hidden flex-col"
           style="background: linear-gradient(180deg, #166534 0%, #14532d 100%); min-height: 340px;">
        <div class="p-4 flex flex-col gap-2 flex-1 text-white">
          <span class="font-display font-black text-white text-lg leading-tight">Automation Components</span>
          <span class="text-xs opacity-70">Factory Automation & Motion Control</span>

          <div class="flex-1 flex items-center justify-center">
            <div class="grid grid-cols-2 gap-1.5">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="w-12 h-10 rounded bg-white/10 flex items-center justify-center">
                  <span class="material-icons text-green-300 text-lg">{{ icons[i-1] }}</span>
                </div>
              }
            </div>
          </div>

          <button class="bg-white text-green-900 text-xs font-bold px-3 py-2 rounded hover:bg-gray-100 transition-colors">
            {{ lang.t('view_more') }} ›
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div class="flex-1 min-w-0">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          @for (product of visibleProducts(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>

        <!-- Load More -->
        <div class="flex justify-center mt-5">
          <button
            class="px-6 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:border-brand-blue hover:text-brand-blue dark:hover:text-brand-yellow transition-colors"
            (click)="loadMore()"
            [disabled]="loadingMore()"
          >
            @if (loadingMore()) {
              <span class="flex items-center gap-2">
                <span class="material-icons animate-spin text-sm">refresh</span>
                Loading...
              </span>
            } @else {
              {{ lang.t('load_more') }}
            }
          </button>
        </div>
      </div>
    </div>
  </section>
  `,
})
export class AutomationComponentsComponent implements OnInit {
  protected lang = inject(LanguageService);
  private productService = inject(ProductService);

  private allProducts = signal<Product[]>(AUTO_PRODUCTS);
  visibleProducts = signal<Product[]>(AUTO_PRODUCTS.slice(0, 12));
  loadingMore = signal(false);
  page = signal(1);

  readonly icons = ['settings', 'rotate_right', 'linear_scale', 'view_in_ar', 'electric_bolt', 'build'];

  ngOnInit(): void {
    this.productService.getAutomationProducts(1, 12).subscribe({
      next: res => { if (res.items.length) { this.allProducts.set(res.items); this.visibleProducts.set(res.items); } },
      error: () => {},
    });
  }

  loadMore(): void {
    this.loadingMore.set(true);
    const next = this.page() + 1;
    this.productService.getAutomationProducts(next, 12).subscribe({
      next: res => {
        if (res.items.length) {
          this.visibleProducts.update(prev => [...prev, ...res.items]);
          this.page.set(next);
        }
        this.loadingMore.set(false);
      },
      error: () => this.loadingMore.set(false),
    });
  }
}
