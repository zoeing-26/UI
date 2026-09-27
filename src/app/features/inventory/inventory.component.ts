import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy, HostListener, afterNextRender,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ApiMaterial } from '../../models/product.model';
import { MaterialCardComponent } from '../../shared/components/material-card/material-card.component';
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, MaterialCardComponent, LayoutWrapperComponent],
  template: `
  <app-layout-wrapper layoutType="full">
    <div class="flex h-screen overflow-hidden bg-[#eef2f4] dark:bg-gray-950">

      <aside
        [class]="sidebarOpen()
          ? 'translate-x-0 w-72'
          : '-translate-x-full lg:translate-x-0 lg:w-72'"
        class="fixed lg:sticky top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
               backdrop-blur-md bg-white/90 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-800
               flex flex-col shadow-[0_0_0_1px_rgba(15,23,42,0.02)]">

        <div class="p-5 border-b border-gray-200 dark:border-gray-800">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 mb-4">
            Inventory Control
          </p>

          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-sm">search</span>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Filter components..."
              class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700
                     rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                     placeholder-gray-400 focus:outline-none focus:border-zoeing-navy
                     focus:ring-2 focus:ring-zoeing-navy/15 transition-colors"
            />
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 mb-3 px-2">
              Categories
            </p>
            <div class="space-y-1.5">
              @for (cat of categories(); track cat) {
                <button
                  (click)="activeCategory.set(cat)"
                  class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  [class]="activeCategory() === cat
                    ? 'bg-zoeing-navy text-white shadow-[0_10px_20px_rgba(13,76,106,0.18)]'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
                >
                  {{ cat }}
                </button>
              }
            </div>
          </div>

          <!-- Sub-categories (Conditional) -->
          @if (activeCategory() !== 'All' && subCategories().length > 1) {
            <div class="animate-fade-in">
              <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-2">
                Sub-groups
              </p>
              <div class="space-y-1">
                @for (sub of subCategories(); track sub) {
                  <button
                    (click)="activeSubCategory.set(sub)"
                    class="w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all"
                    [class]="activeSubCategory() === sub
                      ? 'bg-zoeing-accent text-white shadow-sm'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'"
                  >
                    {{ sub }}
                  </button>
                }
              </div>
            </div>
          }
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            (click)="clearFilters()"
            class="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-500 hover:text-zoeing-primary transition-colors"
          >
            <span class="material-icons text-sm">filter_alt_off</span>
            Reset Filters
          </button>
        </div>
      </aside>

      <!-- Main Viewport -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#f4f7f9] dark:bg-gray-950">

        @if (isMobile()) {
          <button
            (click)="toggleSidebar()"
            class="absolute top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800"
            type="button"
            aria-label="Toggle sidebar"
          >
            <span class="material-icons text-gray-700 dark:text-gray-200">{{ sidebarOpen() ? 'close' : 'menu' }}</span>
          </button>
        }

        <!-- Technical Header -->
        <header class="sticky top-0 z-30 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 sm:px-6 py-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div class="pl-12 lg:pl-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-zoeing-primary/80 dark:text-zoeing-accent mb-1.5">
                Precision Supply
              </p>
              <h1 class="font-display font-black text-[2.05rem] sm:text-[2.35rem] text-zoeing-primary dark:text-white tracking-[-0.06em] leading-none">
                Product Inventory
              </h1>
            </div>

            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 px-3 py-2 shadow-sm">
                <span class="block text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Registry</span>
                <span class="mt-1 block font-mono text-base font-bold text-gray-900 dark:text-white">{{ materials().length }}</span>
              </div>
              <div class="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-2 shadow-sm">
                <span class="block text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">In Stock</span>
                <span class="mt-1 block font-mono text-base font-bold text-emerald-700 dark:text-emerald-300">{{ inStockCount() }}</span>
              </div>
              <div class="rounded-xl border border-zoeing-primary/15 dark:border-zoeing-accent/20 bg-blue-50/80 dark:bg-zoeing-navy/30 px-3 py-2 shadow-sm">
                <span class="block text-[9px] font-bold uppercase tracking-[0.18em] text-zoeing-primary dark:text-zoeing-accent">Showing</span>
                <span class="mt-1 block font-mono text-base font-bold text-zoeing-primary dark:text-zoeing-accent">{{ filtered().length }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Fluid Content Area -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">

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
            <div class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center">
              <span class="material-icons text-red-400 text-3xl mb-2 block">wifi_off</span>
              <p class="text-red-600 dark:text-red-400 font-medium">{{ error() }}</p>
            </div>
          }

          @if (!loading() && !error()) {
            @if (filtered().length > 0) {
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                @for (mat of filtered(); track mat.id) {
                  <div class="group rounded-[1.5rem] border border-gray-200/90 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-250 hover:-translate-y-1.5 hover:shadow-[0_22px_36px_rgba(15,23,42,0.1)] overflow-hidden ring-1 ring-transparent hover:ring-zoeing-primary/10">
                    <app-material-card [mat]="mat" />
                  </div>
                }
              </div>
            } @else {
              <div class="py-20 flex flex-col items-center text-center max-w-sm mx-auto">
                <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
                  <span class="material-icons text-4xl text-gray-400 dark:text-gray-500">search_off</span>
                </div>
                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">No products found</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {{ searchQuery() ? 'No results for "' + searchQuery() + '"' : 'No products match the selected filters.' }}
                </p>
                <div class="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    class="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-zoeing-primary text-white font-semibold text-sm hover:bg-zoeing-primary/90 transition-colors"
                    (click)="requestQuote()"
                  >
                    <span class="material-icons text-base">description</span>
                    Request for Quote
                  </button>
                  <button
                    class="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    (click)="clearFilters()"
                  >
                    <span class="material-icons text-base">filter_alt_off</span>
                    Clear Filters
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </main>
    </div>
  </app-layout-wrapper>
  `,
})
export class InventoryComponent implements OnInit, OnDestroy {
  private routeSub?: Subscription;
  private productService = inject(ProductService);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);

  private pendingCategory = 'All';
  private pendingSubCategory = 'All';

  materials         = signal<ApiMaterial[]>([]);
  loading           = signal(true);
  error             = signal('');
  activeCategory    = signal('All');
  activeSubCategory = signal('All');
  searchQuery       = signal('');
  sidebarOpen       = signal(false);
  isMobile          = signal(false);

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
    const q   = this.searchQuery().toLowerCase().trim();

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

  @HostListener('window:resize')
  onResize(): void {
    this.updateMobileState();
  }

  private updateMobileState(): void {
    // SSR guard: window is undefined during server rendering
    if (typeof window === 'undefined') return;
    this.isMobile.set(window.innerWidth < 768);
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  constructor() {
    // Browser-only: re-evaluate mobile layout after hydration
    afterNextRender(() => this.updateMobileState());
  }

  ngOnInit(): void {
    this.updateMobileState();

    this.routeSub = this.route.queryParamMap.subscribe(params => {
      this.searchQuery.set(params.get('q') ?? '');
      this.pendingCategory = params.get('category') ?? 'All';
      this.pendingSubCategory = params.get('subCategory') ?? 'All';
      this.applyRouteFilters();
    });

    this.productService.getAllMaterials().subscribe({
      next: mats => {
        this.materials.set(mats);
        this.loading.set(false);
        this.applyRouteFilters();
      },
      error: ()   => { this.error.set('Could not load inventory. Please try again.'); this.loading.set(false); },
    });
  }

  ngOnDestroy(): void { this.routeSub?.unsubscribe(); }

  private applyRouteFilters(): void {
    const availableCategories = this.categories();
    const validCategory = this.pendingCategory && availableCategories.includes(this.pendingCategory)
      ? this.pendingCategory
      : 'All';

    this.activeCategory.set(validCategory);

    if (validCategory !== 'All') {
      const availableSubCategories = this.subCategories();
      const validSubCategory = this.pendingSubCategory && availableSubCategories.includes(this.pendingSubCategory)
        ? this.pendingSubCategory
        : 'All';

      this.activeSubCategory.set(validSubCategory);
    } else {
      this.activeSubCategory.set('All');
    }
  }

  clearFilters(): void {
    this.activeCategory.set('All');
    this.activeSubCategory.set('All');
    this.router.navigate(['/inventory']);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  requestQuote(): void {
    const q = this.searchQuery();
    if (q) localStorage.setItem('quoteSearch', q);
    this.router.navigate(['/quote']);
  }
}
