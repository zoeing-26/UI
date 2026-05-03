import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ApiMaterial } from '../../models/product.model';
import { MaterialCardComponent } from '../../shared/components/material-card/material-card.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, MaterialCardComponent],
  template: `
  <main class="max-w-screen-xl mx-auto px-4 py-10">

    <!-- Header -->
    <section class="mb-8">
      <p class="text-xs font-bold uppercase tracking-widest text-zoeing-accent mb-2">
        Product Inventory
      </p>
      <h1 class="font-display font-black text-4xl md:text-5xl text-zoeing-primary
                 dark:text-white mb-3">
        All Products
      </h1>
      <p class="text-gray-600 dark:text-gray-300 max-w-2xl text-base leading-relaxed">
        Browse our complete catalogue. Request a quote or add to cart — we handle
        the sourcing directly from manufacturers.
      </p>
    </section>

    <!-- Search + stats row -->
    <div class="flex flex-wrap items-center gap-4 mb-6">

      <!-- Search -->
      <div class="relative flex-1 min-w-[220px] max-w-sm">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-sm">
          search
        </span>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search by name, code, description…"
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600
                 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                 placeholder-gray-400 focus:outline-none focus:border-zoeing-primary
                 focus:ring-1 focus:ring-zoeing-primary/40 transition-colors"
        />
      </div>

      <!-- Stats chips -->
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span class="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
          <span class="font-bold text-zoeing-primary dark:text-white">{{ materials().length }}</span> total
        </span>
        <span class="bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
          <span class="font-bold text-green-600 dark:text-green-400">{{ inStockCount() }}</span> in stock
        </span>
        <span class="bg-zoeing-primary/5 dark:bg-zoeing-primary/10 px-3 py-1.5 rounded-full">
          <span class="font-bold text-zoeing-primary dark:text-zoeing-accent">{{ filtered().length }}</span> shown
        </span>
      </div>
    </div>

    <!-- Category filter tabs -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        *ngFor="let cat of categories()"
        (click)="activeCategory.set(cat)"
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
        [class]="activeCategory() === cat
          ? 'bg-zoeing-primary text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
      >{{ cat }}</button>
    </div>

    <!-- Sub-category filter (only when a category is selected) -->
    @if (activeCategory() !== 'All' && subCategories().length > 1) {
      <div class="flex flex-wrap gap-2 mb-6">
        @for (sub of subCategories(); track sub) {
          <button
            (click)="activeSubCategory.set(sub)"
            class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
            [class]="activeSubCategory() === sub
              ? 'bg-zoeing-accent text-white'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'"
          >{{ sub }}</button>
        }
      </div>
    }

    <!-- Loading skeleton -->
    @if (loading()) {
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
          <div class="h-56 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
        }
      </div>
    }

    <!-- Error -->
    @if (error()) {
      <div class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50
                  dark:bg-red-900/20 p-6 text-center">
        <span class="material-icons text-red-400 text-3xl mb-2 block">wifi_off</span>
        <p class="text-red-600 dark:text-red-400 font-medium">{{ error() }}</p>
      </div>
    }

    <!-- Grid -->
    @if (!loading() && !error()) {
      @if (filtered().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          @for (mat of filtered(); track mat.id) {
            <app-material-card [mat]="mat" />
          }
        </div>
      } @else {
        <div class="text-center py-20 text-gray-400 dark:text-gray-500">
          <span class="material-icons text-5xl block mb-3">search_off</span>
          <p class="font-medium">No products match your filters</p>
          <button
            class="mt-3 text-sm text-zoeing-primary dark:text-zoeing-accent hover:underline"
            (click)="clearFilters()"
          >Clear filters</button>
        </div>
      }
    }

  </main>
  `,
})
export class InventoryComponent implements OnInit {
  private productService = inject(ProductService);

  materials     = signal<ApiMaterial[]>([]);
  loading       = signal(true);
  error         = signal('');
  activeCategory    = signal('All');
  activeSubCategory = signal('All');
  searchQuery       = '';

  readonly categories = computed(() => {
    const cats = [...new Set(this.materials().map(m => m.category ?? 'Other'))].sort();
    return ['All', ...cats];
  });

  readonly subCategories = computed(() => {
    const cat = this.activeCategory();
    const items = cat === 'All'
      ? this.materials()
      : this.materials().filter(m => (m.category ?? 'Other') === cat);
    const subs = [...new Set(items.map(m => m.sub_category ?? 'General'))].sort();
    return ['All', ...subs];
  });

  readonly filtered = computed((): ApiMaterial[] => {
    let items = this.materials();
    const cat = this.activeCategory();
    const sub = this.activeSubCategory();
    const q   = this.searchQuery.toLowerCase().trim();

    if (cat !== 'All') items = items.filter(m => (m.category ?? 'Other') === cat);
    if (sub !== 'All') items = items.filter(m => (m.sub_category ?? 'General') === sub);
    if (q) {
      items = items.filter(m =>
        (m.name ?? m.product_code).toLowerCase().includes(q) ||
        m.product_code.toLowerCase().includes(q) ||
        (m.description?.toLowerCase().includes(q) ?? false) ||
        (m.brand?.toLowerCase().includes(q) ?? false)
      );
    }
    return items;
  });

  readonly inStockCount = computed(() =>
    this.materials().filter(m => (m.count ?? 0) > 0).length
  );

  ngOnInit(): void {
    this.productService.getAllMaterials().subscribe({
      next: mats => {
        this.materials.set(mats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load inventory. Please try again.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.activeCategory.set('All');
    this.activeSubCategory.set('All');
    this.searchQuery = '';
  }
}
