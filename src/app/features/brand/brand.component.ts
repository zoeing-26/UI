import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ApiBrand, ApiMaterial } from '../../models/product.model';
import { MaterialCardComponent } from '../../shared/components/material-card/material-card.component';
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';

@Component({
  selector: 'app-brand',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, MaterialCardComponent, LayoutWrapperComponent],
  template: `
  <app-layout-wrapper layoutType="full">
    <div class="relative min-h-screen overflow-hidden bg-[#edf2f4] text-slate-900 transition-colors duration-300 dark:bg-[#050d16] dark:text-slate-100">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_24%)]"></div>
      <main class="relative mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-10 xl:px-12">
        @if (!selectedBrand()) {
          <div class="space-y-7">
            <header class="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-gradient-to-br from-[#0a2d42] via-[#0d3e59] to-[#091b2a] p-6 shadow-[0_26px_64px_rgba(2,8,23,0.38)] sm:p-8 lg:p-10">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.25),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_32%)]"></div>
              <div class="relative space-y-5">
                <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300 backdrop-blur-sm">
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-300"></span>
                  Manufacturer Catalogue
                </span>
                <h1 class="max-w-5xl font-display text-[clamp(2.4rem,4vw,5.3rem)] font-black leading-[0.94] tracking-[-0.07em] text-white">
                  Trusted Industrial Manufacturers
                </h1>
                <p class="max-w-4xl text-sm leading-relaxed text-slate-200 sm:text-base">
                  Explore premium manufacturing partners powering modern factories — from pneumatic and motion control to electrical, tooling, and precision assembly brands.
                </p>
              </div>
            </header>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_14px_26px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Manufacturers</p>
                <p class="mt-2 font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white">{{ brands().length }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_14px_26px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Product Lines</p>
                <p class="mt-2 font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white">{{ totalProductCount() }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_14px_26px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">In Stock</p>
                <p class="mt-2 font-display text-3xl font-black tracking-tight text-amber-500 dark:text-amber-300">{{ totalInStockCount() }}</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                (click)="activeLetter.set('All')"
                class="flex h-10 min-w-[3rem] items-center justify-center rounded-full border px-3 text-sm font-black transition-all"
                [class]="activeLetter() === 'All'
                  ? 'border-[#f59e0b] bg-[#f59e0b] text-slate-950 shadow-[0_14px_28px_rgba(245,158,11,0.25)]'
                  : 'border-slate-200 bg-slate-200/80 text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
              >
                All
              </button>

              @for (letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); track letter) {
                <button
                  type="button"
                  (click)="activeLetter.set(letter)"
                  class="flex h-10 min-w-[2.4rem] items-center justify-center rounded-full border px-2 text-sm font-medium transition-all"
                  [class]="activeLetter() === letter
                    ? 'border-[#f59e0b] bg-[#f59e0b] text-slate-950 shadow-[0_12px_24px_rgba(245,158,11,0.22)]'
                    : 'border-slate-200 bg-slate-200/80 text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
                >
                  {{ letter }}
                </button>
              }
            </div>

            @if (loading()) {
              <div class="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3 lg:grid-cols-4">
                @for (i of [1,2,3,4,5,6,7,8]; track i) {
                  <div class="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-200/80 dark:border-slate-800 dark:bg-slate-900/80"></div>
                }
              </div>
            } @else if (error()) {
              <div class="rounded-2xl border border-red-300/70 bg-red-950/30 p-6 text-center shadow-sm">
                <span class="material-icons mb-2 block text-3xl text-red-400">wifi_off</span>
                <p class="font-medium text-red-300">{{ error() }}</p>
              </div>
            } @else {
              @if (groupedBrands().length === 0) {
                <div class="rounded-3xl border border-dashed border-slate-300 bg-white/60 py-20 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                  <span class="material-icons mb-4 block text-6xl">search_off</span>
                  <p class="text-lg font-medium">No manufacturers found for "{{ activeLetter() }}"</p>
                </div>
              } @else {
                @for (group of groupedBrands(); track group.letter) {
                  <div class="pt-4">
                    <div class="mb-4 flex items-center gap-3">
                      <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-xl font-black text-white shadow-lg dark:bg-white dark:text-slate-900">{{ group.letter }}</span>
                      <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                      <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{{ group.brands.length }} brands</span>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      @for (brand of group.brands; track brand.id) {
                        <button
                          type="button"
                          (click)="openBrand(brand)"
                          class="group w-full rounded-[22px] border border-slate-200 bg-white/85 text-left shadow-[0_16px_32px_rgba(2,8,23,0.08)] backdrop-blur-sm transition-all duration-250 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_28px_48px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_18px_35px_rgba(2,8,23,0.35)] dark:hover:border-amber-400"
                        >
                          <div class="h-1.5 w-full rounded-t-[22px] bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-500"></div>
                          <div class="px-5 pb-5 pt-4">
                            <div class="mb-4 flex items-center justify-between gap-2">
                              <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-black text-slate-900 shadow-inner ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700">
                                {{ brand.name.charAt(0).toUpperCase() }}
                              </span>
                              <span class="material-icons text-base text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-amber-400 dark:text-slate-500">arrow_forward</span>
                            </div>
                            <p class="font-display text-[2rem] font-black leading-none tracking-[-0.05em] text-slate-900 dark:text-slate-100">
                              {{ brand.name }}
                            </p>
                            <p class="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                              <span class="material-icons text-sm text-amber-500">inventory_2</span>
                              {{ brand.materials.length }} products
                            </p>
                          </div>
                        </button>
                      }
                    </div>
                  </div>
                }
              }
            }
          </div>
        } @else {
          <div class="space-y-8">
            <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div class="space-y-4">
                <button (click)="goToBrandList()"
                  class="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  <span class="material-icons text-sm">arrow_back</span> Back to Registry
                </button>
                <h1 class="font-display text-4xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-5xl">
                  {{ selectedBrand()?.name }}
                </h1>
              </div>

              <div class="relative w-full md:w-80">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</span>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Search brand catalog..."
                  class="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#0c3550] via-[#0c4866] to-[#071824] p-5 text-white shadow-[0_20px_40px_rgba(2,8,23,0.35)] sm:p-6">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                <p class="text-2xl font-display font-black">{{ selectedBrand()?.materials?.length ?? 0 }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">Total Registry</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                <p class="text-2xl font-display font-black text-amber-300">{{ inStockCount() }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">In Stock</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                <p class="text-2xl font-display font-black">{{ filteredMaterials().length }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">Showing</p>
              </div>
            </div>

            @if (filteredMaterials().length > 0) {
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                @for (mat of filteredMaterials(); track mat.id) {
                  <app-material-card [mat]="mat" />
                }
              </div>
            } @else {
              <div class="rounded-3xl border border-dashed border-slate-300 bg-white/60 py-20 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                <span class="material-icons mb-4 block text-6xl">search_off</span>
                <p class="font-medium">No products match "{{ searchQuery }}"</p>
                <button (click)="searchQuery = ''" class="mt-3 text-sm text-amber-500 hover:underline">Clear search</button>
              </div>
            }
          </div>
        }
      </main>
    </div>
  </app-layout-wrapper>
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

  readonly totalProductCount = computed(() =>
    this.brands().reduce((sum, brand) => sum + (brand.materials?.length ?? 0), 0)
  );

  readonly totalInStockCount = computed(() =>
    this.brands().reduce((sum, brand) => sum + (brand.materials?.filter(m => (m.count ?? 0) > 0).length ?? 0), 0)
  );

  readonly inStockCount = computed(() =>
    (this.selectedBrand()?.materials ?? []).filter(m => (m.count ?? 0) > 0).length
  );

  // Brand Stats object for cleaner template
  readonly brandStats = computed(() => {
    const brand = this.selectedBrand();
    if (!brand) return null;
    return {
      total: brand.materials.length,
      inStock: this.inStockCount(),
      showing: this.filteredMaterials().length
    };
  });

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
