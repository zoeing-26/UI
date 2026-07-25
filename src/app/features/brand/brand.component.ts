import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ApiBrand, ApiMaterial } from '../../models/product.model';
import { MaterialCardComponent } from '../../shared/components/material-card/material-card.component';

@Component({
  selector: 'app-brand',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, MaterialCardComponent],
  template: `
  <main class="max-w-screen-xl mx-auto px-4 py-10">

    <!-- ═══ BRAND LIST ═══ -->
    @if (!selectedBrand()) {

      <!-- Header -->
      <section class="mb-8">
        <p class="text-xs font-bold uppercase tracking-widest text-zoeing-accent mb-2">
          Manufacturer Catalogue
        </p>
        <h1 class="font-display font-black text-4xl md:text-5xl text-zoeing-primary
                   dark:text-white mb-3">
          Trusted Industrial Manufacturers
        </h1>
        <p class="text-gray-600 dark:text-gray-300 max-w-2xl text-base leading-relaxed">
          Explore premium manufacturing partners powering modern factories — from
          pneumatic and motion control to electrical and tooling brands.
        </p>
      </section>

      <!-- Letter filter -->
      <div class="flex flex-wrap gap-1.5 mb-6">
        @for (letter of letters; track letter) {
          <button
            class="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            [class]="activeLetter() === letter
              ? 'bg-zoeing-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
            (click)="activeLetter.set(letter)"
          >{{ letter }}</button>
        }
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
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

      <!-- Brand grid grouped by letter -->
      @if (!loading() && !error()) {
        @if (groupedBrands().length === 0) {
          <div class="text-center py-16 text-gray-400 dark:text-gray-500">
            <span class="material-icons text-4xl block mb-2">search_off</span>
            No manufacturers found for "{{ activeLetter() }}"
          </div>
        }
        @for (group of groupedBrands(); track group.letter) {
          <section class="mb-8">
            <h2 class="text-sm font-bold text-zoeing-primary dark:text-zoeing-accent
                       uppercase tracking-widest mb-3 border-b border-gray-100
                       dark:border-gray-800 pb-2">
              {{ group.letter }}
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              @for (brand of group.brands; track brand.id) {
                <button
                  type="button"
                  class="text-left rounded-xl border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-900 overflow-hidden
                         hover:border-zoeing-primary hover:shadow-md transition-all group"
                  (click)="openBrand(brand)"
                >
                  <!-- Brand colour bar -->
                  <div class="h-2 bg-zoeing-primary group-hover:bg-zoeing-accent transition-colors"></div>
                  <div class="p-4">
                    <p class="font-display font-black text-lg text-zoeing-primary
                               dark:text-white leading-tight mb-1">
                      {{ brand.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span class="material-icons text-sm">inventory_2</span>
                      {{ brand.materials.length }}
                      {{ brand.materials.length === 1 ? 'product' : 'products' }}
                    </p>
                  </div>
                </button>
              }
            </div>
          </section>
        }
      }
    }

    <!-- ═══ BRAND DETAIL ═══ -->
    @if (selectedBrand(); as brand) {

      <!-- Header row -->
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <button
            class="flex items-center gap-1 text-sm text-zoeing-primary dark:text-zoeing-accent
                   hover:underline mb-3"
            (click)="goToBrandList()"
          >
            <span class="material-icons text-sm">arrow_back</span>
            Back to manufacturers
          </button>
          <h1 class="font-display font-black text-4xl text-zoeing-primary dark:text-white mb-1">
            {{ brand.name }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ brand.materials.length }} product{{ brand.materials.length !== 1 ? 's' : '' }} available
          </p>
        </div>

        <!-- Search -->
        <div class="relative w-full sm:w-72">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-sm">
            search
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search products…"
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600
                   rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                   placeholder-gray-400 focus:outline-none focus:border-zoeing-primary
                   focus:ring-1 focus:ring-zoeing-primary/40 transition-colors"
          />
        </div>
      </div>

      <!-- Stats bar -->
      <div class="flex gap-6 mb-6 p-4 rounded-xl bg-zoeing-primary/5 dark:bg-zoeing-primary/10
                  border border-zoeing-primary/10">
        <div class="text-center">
          <p class="font-display font-black text-2xl text-zoeing-primary dark:text-white">
            {{ brand.materials.length }}
          </p>
          <p class="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Products
          </p>
        </div>
        <div class="text-center">
          <p class="font-display font-black text-2xl text-zoeing-accent">
            {{ inStockCount() }}
          </p>
          <p class="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            In Stock
          </p>
        </div>
        <div class="text-center">
          <p class="font-display font-black text-2xl text-gray-700 dark:text-gray-300">
            {{ filteredMaterials().length }}
          </p>
          <p class="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Showing
          </p>
        </div>
      </div>

      <!-- Materials grid -->
      @if (filteredMaterials().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          @for (mat of filteredMaterials(); track mat.id) {
            <app-material-card [mat]="mat" />
          }
        </div>
      } @else {
        <div class="text-center py-20 text-gray-400 dark:text-gray-500">
          <span class="material-icons text-5xl block mb-3">search_off</span>
          <p class="font-medium">No products match "{{ searchQuery }}"</p>
          <button
            class="mt-3 text-sm text-zoeing-primary dark:text-zoeing-accent hover:underline"
            (click)="searchQuery = ''"
          >Clear search</button>
        </div>
      }
    }

  </main>
  `,
})
export class BrandComponent implements OnInit {
  private productService = inject(ProductService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);

  brands       = signal<ApiBrand[]>([]);
  loading      = signal(true);
  error        = signal('');
  activeLetter = signal('All');
  selectedBrand = signal<ApiBrand | null>(null);
  searchQuery   = '';

  readonly letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  readonly groupedBrands = computed(() => {
    const filtered = this.activeLetter() === 'All'
      ? this.brands()
      : this.brands().filter(b =>
          b.name.charAt(0).toUpperCase() === this.activeLetter()
        );

    const map = new Map<string, ApiBrand[]>();
    [...filtered]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(brand => {
        const letter = /[A-Z]/i.test(brand.name.charAt(0))
          ? brand.name.charAt(0).toUpperCase()
          : '#';
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter)!.push(brand);
      });

    return Array.from(map.entries()).map(([letter, brands]) => ({ letter, brands }));
  });

  readonly filteredMaterials = computed((): ApiMaterial[] => {
    const brand = this.selectedBrand();
    if (!brand) return [];
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return brand.materials;
    return brand.materials.filter(m =>
      (m.name ?? m.product_code).toLowerCase().includes(q) ||
      m.product_code.toLowerCase().includes(q) ||
      (m.description?.toLowerCase().includes(q) ?? false)
    );
  });

  readonly inStockCount = computed(() =>
    (this.selectedBrand()?.materials ?? []).filter(m => (m.count ?? 0) > 0).length
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('slug');
      if (idParam && this.brands().length) {
        this.selectById(Number(idParam));
      } else if (!idParam) {
        this.selectedBrand.set(null);
      }
    });

    this.productService.getBrands().subscribe({
      next: brands => {
        this.brands.set(brands);
        this.loading.set(false);
        const idParam = this.route.snapshot.paramMap.get('slug');
        if (idParam) this.selectById(Number(idParam));
      },
      error: () => {
        this.error.set('Could not load manufacturers. Please try again.');
        this.loading.set(false);
      },
    });
  }

  openBrand(brand: ApiBrand): void {
    this.searchQuery = '';
    this.selectedBrand.set(brand);
    this.router.navigate(['/manufacturers', brand.id]);
  }

  goToBrandList(): void {
    this.searchQuery = '';
    this.selectedBrand.set(null);
    this.router.navigate(['/manufacturers']);
  }

  private selectById(id: number): void {
    const brand = this.brands().find(b => b.id === id) ?? null;
    this.selectedBrand.set(brand);
  }
}
