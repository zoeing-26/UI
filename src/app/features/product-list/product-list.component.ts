import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { GeoLocationService, isMaterialBlocked } from '../../core/services/geo-location.service';
import { Product, ProductFilter, ApiMaterial } from '../../models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MaterialCardComponent } from '../../shared/components/material-card/material-card.component';
import { LanguageService } from '../../core/services/language.service';
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, MaterialCardComponent, LayoutWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-layout-wrapper layoutType="full">
    <div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">

      <!-- TECHNICAL HEADER -->
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-6 sticky top-0 z-10">
        <div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">

          <div class="space-y-2">
            <!-- Breadcrumb -->
            @if (filter().category) {
              <nav class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <span>Products</span>
                <span class="material-icons text-[12px]">chevron_right</span>
                <span>{{ filter().category }}</span>
                @if (filter().subCategory) {
                  <span class="material-icons text-[12px]">chevron_right</span>
                  <span class="text-gray-600 dark:text-gray-300">{{ filter().subCategory }}</span>
                }
              </nav>
            }
            <div class="flex items-baseline gap-3">
              <h1 class="text-3xl font-display font-black text-zoeing-navy dark:text-white tracking-tight uppercase">
                {{ heading() }}
              </h1>
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                {{ productCount() }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4">
             <div class="px-3 py-1 rounded-full bg-zoeing-gold/10 text-zoeing-gold text-[10px] font-bold uppercase tracking-widest border border-zoeing-gold/20">
               Industrial Grade
             </div>
          </div>
        </div>
      </header>

      <!-- GALLERY VIEWPORT -->
      <main class="flex-1 overflow-y-auto p-6 lg:p-12">
        <div class="max-w-screen-2xl mx-auto">

          @if (loading()) {
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              @for (_ of skeletons; track $index) {
                <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse h-72"></div>
              }
            </div>
          } @else {

            <!-- Materials Gallery (High Density) -->
            @if (materialsMode()) {
              @if (materials().length === 0) {
                <div class="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-20 text-center text-gray-500 dark:text-gray-400">
                  <span class="material-icons text-6xl mb-4 block">inventory_2</span>
                  <p class="text-lg font-medium">No materials found for <strong class="text-zoeing-navy dark:text-white">{{ filter().subCategory }}</strong>.</p>
                  <a routerLink="/inventory" class="mt-6 inline-block px-6 py-2 bg-zoeing-navy text-white rounded-lg text-sm font-bold hover:bg-zoeing-navy-light transition-colors">Browse All Inventory</a>
                </div>
              } @else {
                <div class="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  @for (item of materials(); track item.id) {
                    <app-material-card [mat]="item" />
                  }
                </div>
              }

            <!-- Products Gallery (Catalog Mode) -->
            } @else {
              @if (products().length === 0) {
                <div class="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-20 text-center text-gray-500 dark:text-gray-400">
                  <span class="material-icons text-6xl mb-4 block">search_off</span>
                  <p class="text-lg font-medium">No products found for the selected filters.</p>
                  <a routerLink="/inventory" class="mt-6 inline-block px-6 py-2 bg-zoeing-navy text-white rounded-lg text-sm font-bold hover:bg-zoeing-navy-light transition-colors">Return to Inventory</a>
                </div>
              } @else {
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  @for (item of products(); track item.id) {
                    <app-product-card [product]="item" />
                  }
                </div>
              }
            }
          }
        </div>
      </main>
    </div>
  </app-layout-wrapper>
  `,
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private geo = inject(GeoLocationService);
  protected lang = inject(LanguageService);

  products = signal<Product[]>([]);
  materials = signal<ApiMaterial[]>([]);
  loading = signal(true);
  materialsMode = signal(false);
  filter = signal<ProductFilter>({});

  readonly skeletons = Array(8);

  readonly productCount = computed(() => {
    const count = this.materialsMode() ? this.materials().length : this.products().length;
    return `${count} Components Identified`;
  });

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
        // Region blocking: hide materials not sellable in the visitor's country.
        const country = this.geo.country();
        this.materials.set(country
          ? items.filter(m => !isMaterialBlocked(m, country, this.geo.blockedIds()))
          : items);
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
