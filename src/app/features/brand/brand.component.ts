import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { LanguageService } from '../../core/services/language.service';
import { Brand, ApiCategory } from '../../models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="max-w-screen-xl mx-auto px-4 py-10">
      <ng-container *ngIf="!selectedBrand(); else brandDetail">
        <section class="space-y-6">
          <span class="text-sm font-semibold uppercase tracking-widest text-zoeing-secondary">Manufacturer Catalogue</span>
          <h1 class="font-display text-4xl md:text-5xl text-zoeing-primary dark:text-white font-black">Trusted industrial manufacturers for your projects</h1>
          <p class="max-w-3xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            Explore a curated selection of premium manufacturing partners, including pneumatic, motion control, electrical and tooling brands that power modern factories.
          </p>
        </section>

        <div class="mt-8">
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              *ngFor="let letter of letters"
              type="button"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              [ngClass]="activeLetter() === letter ? 'bg-zoeing-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
              (click)="setActiveLetter(letter)">
              {{ letter }}
            </button>
          </div>

          <div *ngIf="brands().length === 0; else brandsLoaded" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-center text-gray-600 dark:text-gray-300">
            Loading brands...
          </div>

          <ng-template #brandsLoaded>
            <ng-container *ngFor="let group of groupedBrands(); let i = index">
              <section class="mb-8">
                <h2 class="text-lg font-semibold text-zoeing-primary dark:text-white mb-4">{{ group.letter }}</h2>
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    *ngFor="let brand of group.brands"
                    type="button"
                    class="w-full text-left rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition hover:border-zoeing-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                    (click)="openBrand(brand)">
                    <p class="font-semibold text-zoeing-primary dark:text-white">{{ brand.name }}</p>
                    <p *ngIf="brand.logo" class="text-xs text-gray-500 dark:text-gray-400 mt-2">{{ brand.logo }}</p>
                  </button>
                </div>
              </section>
            </ng-container>
          </ng-template>
        </div>
      </ng-container>

      <ng-template #brandDetail>
        <section class="space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-sm text-gray-500">Manufacturer detail</p>
              <h1 class="text-4xl font-bold text-zoeing-primary dark:text-white">{{ selectedBrand()?.name }}</h1>
              <p class="mt-3 text-gray-600 dark:text-gray-300 max-w-3xl">
                Browse categories and subcategories available under this brand. Select any category or subcategory to see the full product listing.
              </p>
            </div>
            <button class="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-zoeing-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              (click)="goToBrandList()">
              Back to manufacturers
            </button>
          </div>
        </section>

        <div class="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">All Categories</p>
            <div *ngIf="categories().length === 0; else categoryNav">
              <p class="text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
            </div>

            <ng-template #categoryNav>
              <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li *ngFor="let category of categories()">
                  <a class="block rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    [routerLink]="['/products']"
                    [queryParams]="{ brand: selectedBrand()?.slug, category: category.name }">
                    {{ category.name }}
                  </a>
                  <ul *ngIf="category.sub_category?.length" class="mt-1 ml-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <li *ngFor="let sub of category.sub_category">
                      <a class="block rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        [routerLink]="['/products']"
                        [queryParams]="{ brand: selectedBrand()?.slug, category: category.name, subCategory: sub.name }">
                        {{ sub.name }}
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </ng-template>
          </aside>

          <section class="space-y-6">
            <div *ngIf="categories().length === 0; else categoryList" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-gray-500 dark:text-gray-400">
              Loading category content...
            </div>

            <ng-template #categoryList>
              <div *ngFor="let category of categories()" class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                <div class="flex items-center justify-between gap-4 mb-4">
                  <h2 class="text-xl font-semibold text-zoeing-primary dark:text-white">{{ category.name }}</h2>
                  <a class="text-sm text-zoeing-primary dark:text-zoeing-secondary hover:underline"
                    [routerLink]="['/products']"
                    [queryParams]="{ brand: selectedBrand()?.slug, category: category.name }">
                    View all
                  </a>
                </div>
                <div *ngIf="category.sub_category?.length; else noSubcategories" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <a *ngFor="let sub of category.sub_category"
                    class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-4 hover:border-zoeing-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    [routerLink]="['/products']"
                    [queryParams]="{ brand: selectedBrand()?.slug, category: category.name, subCategory: sub.name }">
                    <p class="font-semibold text-zoeing-primary dark:text-white">{{ sub.name }}</p>
                  </a>
                </div>
                <ng-template #noSubcategories>
                  <p class="text-sm text-gray-500 dark:text-gray-400">No subcategories available.</p>
                </ng-template>
              </div>
            </ng-template>
          </section>
        </div>
      </ng-template>
    </main>
  `,
})
export class BrandComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected lang = inject(LanguageService);

  private readonly mockBrands: Brand[] = [
    { id: '1', name: 'ZOIENG', slug: 'zoieng', logo: 'Local Industrial Partner', bgColor: '#111827', textColor: '#F8FAFC', featured: true },
    { id: '2', name: 'SMC', slug: 'smc', logo: 'Pneumatic Automation', bgColor: '#002B5C', textColor: '#FFFFFF' },
    { id: '3', name: 'OMRON', slug: 'omron', logo: 'Sensors & Control', bgColor: '#003366', textColor: '#FFFFFF' },
    { id: '4', name: 'FESTO', slug: 'festo', logo: 'Fluid Power', bgColor: '#003A63', textColor: '#FFFFFF' },
    { id: '5', name: 'THK', slug: 'thk', logo: 'Linear Motion', bgColor: '#003366', textColor: '#FFFFFF' },
    { id: '6', name: 'NSK', slug: 'nsk', logo: 'Bearing Precision', bgColor: '#1F2937', textColor: '#FFFFFF' },
    { id: '7', name: 'PANASONIC', slug: 'panasonic', logo: 'Electrical Components', bgColor: '#002B5C', textColor: '#FFFFFF' },
    { id: '8', name: 'ABB', slug: 'abb', logo: 'Power & Automation', bgColor: '#DD0000', textColor: '#FFFFFF' },
    { id: '9', name: 'SCHNEIDER', slug: 'schneider-electric', logo: 'Energy Controllers', bgColor: '#1D5A0D', textColor: '#FFFFFF' },
    { id: '10', name: 'MITSUBISHI', slug: 'mitsubishi-electric', logo: 'PLC & Drives', bgColor: '#C8102E', textColor: '#FFFFFF' },
    { id: '11', name: 'BOSCH REXROTH', slug: 'bosch-rexroth', logo: 'Motion Systems', bgColor: '#003A63', textColor: '#FFFFFF' },
    { id: '12', name: 'YASKAWA', slug: 'yaskawa', logo: 'Robotics', bgColor: '#0B4F8C', textColor: '#FFFFFF' },
    { id: '13', name: 'KEYENCE', slug: 'keyence', logo: 'Machine Vision', bgColor: '#E60012', textColor: '#FFFFFF' },
    { id: '14', name: 'PARKER', slug: 'parker-hannifin', logo: 'Hydraulics', bgColor: '#003E7E', textColor: '#FFFFFF' },
    { id: '15', name: 'SKF', slug: 'skf', logo: 'Precision Bearings', bgColor: '#0046AE', textColor: '#FFFFFF' },
  ];

  private readonly mockCategories: ApiCategory[] = [
    { name: 'Automation Components', sub_category: [
      { name: 'Pneumatic', materials: [] },
      { name: 'Air Valves', materials: [] },
      { name: 'Sensors', materials: [] },
    ]},
    { name: 'Electrical Control', sub_category: [
      { name: 'Relays & Timers', materials: [] },
      { name: 'PLC Modules', materials: [] },
      { name: 'Power Supplies', materials: [] },
    ]},
    { name: 'Motion & Transmission', sub_category: [
      { name: 'Linear Guides', materials: [] },
      { name: 'Bearings', materials: [] },
      { name: 'Gearboxes', materials: [] },
    ]},
  ];

  brands = signal<Brand[]>(this.mockBrands);
  categories = signal<ApiCategory[]>([]);
  selectedBrand = signal<Brand | null>(null);
  activeLetter = signal('All');
  currentSlug = signal<string | null>(null);

  readonly letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  readonly groupedBrands = computed(() => {
    const letters = new Map<string, Brand[]>();
    const sorted = [...this.brands()].sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach(brand => {
      const first = (brand.name?.charAt(0) ?? '#').toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : '#';
      if (!letters.has(letter)) {
        letters.set(letter, []);
      }
      letters.get(letter)!.push(brand);
    });

    const groups = Array.from(letters.entries()).map(([letter, brands]) => ({ letter, brands }));
    if (this.activeLetter() === 'All') {
      return groups;
    }
    return groups.filter(group => group.letter === this.activeLetter());
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentSlug.set(params.get('slug'));
      this.syncSelectedBrand();
    });

    this.productService.getBrands().subscribe(brands => {
      this.brands.set(brands.length ? brands : this.mockBrands);
      this.syncSelectedBrand();
    });

    this.productService.getCategories().subscribe(categories => {
      this.categories.set(categories.length ? categories : this.mockCategories);
    });
  }

  setActiveLetter(letter: string): void {
    this.activeLetter.set(letter);
  }

  openBrand(brand: Brand): void {
    this.router.navigate(['/manufacturers', brand.slug]);
  }

  goToBrandList(): void {
    this.router.navigate(['/manufacturers']);
  }

  private syncSelectedBrand(): void {
    const slug = this.currentSlug();
    if (!slug) {
      this.selectedBrand.set(null);
      return;
    }
    const brand = this.brands().find(item => item.slug === slug) ?? null;
    this.selectedBrand.set(brand);
  }
}
