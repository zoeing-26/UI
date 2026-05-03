import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product, ProductFilter, ApiMaterial } from '../../models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MaterialCardComponent } from '../../shared/components/material-card/material-card.component';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, MaterialCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <main class="max-w-screen-xl mx-auto px-4 py-10">

    <!-- Header -->
    <div class="mb-8 space-y-1">
      <!-- Breadcrumb -->
      @if (filter().category) {
        <p class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <span>Products</span>
          <span class="material-icons text-[12px]">chevron_right</span>
          <span>{{ filter().category }}</span>
          @if (filter().subCategory) {
            <span class="material-icons text-[12px]">chevron_right</span>
            <span class="text-gray-600 dark:text-gray-300">{{ filter().subCategory }}</span>
          }
        </p>
      }
      <h1 class="text-2xl font-bold text-zoeing-navy dark:text-white">{{ heading() }}</h1>
      @if (materialsMode()) {
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ materials().length }} product{{ materials().length !== 1 ? 's' : '' }} found
        </p>
      }
    </div>

    @if (loading()) {
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        @for (_ of skeletons; track $index) {
          <div class="rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse h-64"></div>
        }
      </div>
    } @else {

      <!-- Materials mode (from category sidebar) -->
      @if (materialsMode()) {
        @if (materials().length === 0) {
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-gray-500 dark:text-gray-400">
            <span class="material-icons text-4xl mb-2 block">inventory_2</span>
            No materials found for <strong>{{ filter().subCategory }}</strong>.
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            @for (item of materials(); track item.id) {
              <app-material-card [mat]="item" />
            }
          </div>
        }

      <!-- Products mode (generic filters / brand) -->
      } @else {
        @if (products().length === 0) {
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-gray-500 dark:text-gray-400">
            <span class="material-icons text-4xl mb-2 block">search_off</span>
            No products found for the selected filters.
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            @for (item of products(); track item.id) {
              <app-product-card [product]="item" />
            }
          </div>
        }
      }
    }

  </main>
  `,
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  protected lang = inject(LanguageService);

  products = signal<Product[]>([]);
  materials = signal<ApiMaterial[]>([]);
  loading = signal(true);
  materialsMode = signal(false);
  filter = signal<ProductFilter>({});

  readonly skeletons = Array(8);

  readonly heading = computed(() => {
    const { subCategory, category, brand } = this.filter();
    if (subCategory) return subCategory;
    if (category) return `${category} Products`;
    if (brand) return `${brand} Products`;
    return 'All Products';
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const filter: ProductFilter = {};
      const category = params.get('category');
      const subCategory = params.get('subCategory');
      const brand = params.get('brand');
      const query = params.get('q');

      if (category) filter.category = category;
      if (subCategory) filter.subCategory = subCategory;
      if (brand) filter.brand = brand;
      if (query) filter.q = query;

      this.filter.set(filter);

      if (category && subCategory) {
        this.loadMaterials(category, subCategory);
      } else {
        this.loadProducts(filter);
      }
    });
  }

  private loadMaterials(category: string, subCategory: string): void {
    this.loading.set(true);
    this.materialsMode.set(true);
    this.productService.getMaterialsBySubCategory(category, subCategory).subscribe({
      next: items => {
        this.materials.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.materials.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadProducts(filter: ProductFilter): void {
    this.loading.set(true);
    this.materialsMode.set(false);
    this.productService.getProducts(filter).subscribe({
      next: result => {
        this.products.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }
}
