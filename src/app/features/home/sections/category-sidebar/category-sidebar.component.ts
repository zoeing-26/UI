import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { ProductService } from '../../../../core/services/product.service';
import { ApiCategory, ApiMaterial } from '../../../../models/product.model';
import { InrCurrencyPipe } from '../../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
  <aside class="relative w-full lg:w-[36rem] shrink-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">

    <!-- Header -->
    <div class="bg-brand-blue text-white px-4 py-2.5 flex items-center gap-2">
      <span class="material-icons text-sm text-brand-yellow">grid_view</span>
      <span class="text-sm font-bold tracking-wide">{{ lang.t('search_by_category') }}</span>
    </div>

    <div class="lg:flex h-72" (mouseleave)="clearHovered()">

      <!-- ── Column 1: Categories ── -->
      <div class="lg:w-40 shrink-0 border-b border-gray-100 dark:border-gray-800 lg:border-b-0 lg:border-r h-full overflow-y-auto">
        @if (loading()) {
          <div class="p-4 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue mx-auto"></div>
            <p class="text-xs text-gray-500 mt-2">Loading…</p>
          </div>
        } @else {
          <ul class="divide-y divide-gray-100 dark:divide-gray-800">
            @for (cat of categories(); track cat.name; let ci = $index) {
              <li (mouseenter)="setHoveredCategory(cat.name)">
                <button
                  class="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left group"
                  [class]="hoveredCategory() === cat.name
                    ? 'bg-brand-blue text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
                >
                  <span class="truncate leading-snug" [title]="cat.name">{{ cat.name }}</span>
                </button>
              </li>
            }
          </ul>
        }
      </div>

      <!-- ── Column 2: Subcategories ── -->
      <div class="hidden lg:flex lg:flex-col lg:w-40 shrink-0 border-r border-gray-100 dark:border-gray-800 h-full overflow-y-auto">
        @if (hoveredSubCategories().length > 0) {
          <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 pt-2.5 pb-1 shrink-0">
            {{ hoveredCategory() }}
          </p>
          <ul class="divide-y divide-gray-50 dark:divide-gray-800 flex-1">
            @for (group of hoveredSubCategories(); track group.name; let i = $index) {
              <li (mouseenter)="setHoveredSubCategory(group.name)">
                <button
                  class="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors group"
                  [class]="hoveredSubCategory() === group.name
                    ? 'bg-gray-50 dark:bg-gray-800 text-brand-blue dark:text-brand-yellow font-medium'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  (click)="navigateToSubCategory(hoveredCategory()!, group.name)"
                >
                  <span class="flex-1 text-sm truncate">{{ group.name }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500 shrink-0">{{ group.materials.length }}</span>
                </button>
              </li>
            }
          </ul>
        } @else if (hoveredCategory()) {
          <div class="flex flex-col items-center justify-center flex-1 p-4 text-center text-gray-400 dark:text-gray-600">
            <span class="material-icons text-2xl mb-1">inbox</span>
            <p class="text-xs">No subcategories</p>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center flex-1 p-4 text-center text-gray-300 dark:text-gray-700">
            <span class="material-icons text-2xl mb-1">arrow_forward</span>
            <p class="text-xs">Hover a category</p>
          </div>
        }
      </div>

      <!-- ── Column 3: Products ── -->
      <div class="hidden lg:flex lg:flex-col lg:flex-1 h-full overflow-hidden">
        @if (hoveredMaterials().length > 0) {
          <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 pt-2.5 pb-1 shrink-0">
            {{ hoveredSubCategory() }}
          </p>
          <ul class="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-gray-800">
            @for (item of hoveredMaterials(); track item.id) {
              <li>
                <button
                  class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors"
                  (click)="navigateToMaterial(item)"
                >
                  <!-- Stock dot -->
                  <span class="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5"
                    [class]="(item.count ?? 0) > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                  </span>

                  <!-- Name + code -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-700 dark:text-gray-200 truncate group-hover:text-brand-blue dark:group-hover:text-brand-yellow leading-snug">
                      {{ item.name || item.product_code }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
                      {{ item.product_code }}
                    </p>
                  </div>

                  <!-- Price -->
                  @if (item.price) {
                    <span class="text-xs font-semibold text-zoeing-secondary dark:text-zoeing-secondary-light shrink-0">
                      {{ item.price | inrCurrency }}
                    </span>
                  } @else {
                    <span class="text-xs text-gray-400 dark:text-gray-500 shrink-0 italic">POA</span>
                  }
                </button>
              </li>
            }
          </ul>

          <!-- View all footer -->
          <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-800/50">
            <button
              class="w-full text-xs font-semibold text-brand-blue dark:text-brand-yellow hover:underline flex items-center justify-center gap-1 transition-colors"
              (click)="navigateToSubCategory(hoveredCategory()!, hoveredSubCategory()!)"
            >
              View all {{ hoveredMaterials().length }} products
              <span class="material-icons text-xs">arrow_forward</span>
            </button>
          </div>

        } @else if (hoveredSubCategory()) {
          <div class="flex flex-col items-center justify-center flex-1 p-4 text-center text-gray-400 dark:text-gray-600">
            <span class="material-icons text-2xl mb-1">inventory_2</span>
            <p class="text-xs">No products found</p>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center flex-1 p-4 text-center text-gray-300 dark:text-gray-700">
            <span class="material-icons text-2xl mb-1">arrow_forward</span>
            <p class="text-xs">Hover a subcategory</p>
          </div>
        }
      </div>

    </div>
  </aside>
  `,
})
export class CategorySidebarComponent implements OnInit {
  protected lang = inject(LanguageService);
  private productService = inject(ProductService);
  private router = inject(Router);

  categories = signal<ApiCategory[]>([]);
  loading = signal(true);
  hoveredCategory = signal<string | null>(null);
  hoveredSubCategory = signal<string | null>(null);

  hoveredSubCategories = computed(() =>
    this.categories().find(c => c.name === this.hoveredCategory())?.sub_category ?? []
  );

  hoveredMaterials = computed(() =>
    this.hoveredSubCategories().find(s => s.name === this.hoveredSubCategory())?.materials ?? []
  );

  // ── Icon & colour palettes ─────────────────────────────────────────────────

  private readonly subCategoryIconMap: [string, string][] = [
    ['linear', 'linear_scale'],
    ['rotary', 'rotate_right'],
    ['motion', 'moving'],
    ['shaft', 'radio_button_unchecked'],
    ['bearing', 'settings'],
    ['guide', 'straighten'],
    ['rail', 'horizontal_rule'],
    ['screw', 'build'],
    ['bolt', 'bolt'],
    ['nut', 'hardware'],
    ['fastener', 'construction'],
    ['wire', 'cable'],
    ['wiring', 'cable'],
    ['connector', 'electrical_services'],
    ['sensor', 'sensors'],
    ['actuator', 'play_circle'],
    ['pneumatic', 'air'],
    ['hydraulic', 'water_drop'],
    ['electrical', 'electrical_services'],
    ['motor', 'electric_bolt'],
    ['drive', 'speed'],
    ['coupling', 'link'],
    ['clamp', 'grip_do'],
    ['bracket', 'crop_square'],
    ['plate', 'crop_din'],
    ['cylinder', 'circle'],
    ['spring', 'compress'],
    ['seal', 'lock'],
    ['filter', 'filter_alt'],
    ['valve', 'stream'],
    ['conveyor', 'conveyor_belt'],
    ['cutting', 'content_cut'],
    ['tool', 'handyman'],
    ['safety', 'health_and_safety'],
    ['lab', 'science'],
    ['plastic', 'format_shapes'],
    ['mold', 'view_in_ar'],
    ['press', 'compress'],
    ['injection', 'syringe'],
  ];

  private readonly fallbackIcons = [
    'precision_manufacturing', 'auto_fix_high', 'inventory_2',
    'category', 'widgets', 'view_module', 'extension',
    'layers', 'tune', 'workspaces', 'hexagon', 'dashboard',
  ];

  private readonly categoryIcons = [
    'factory', 'electric_bolt', 'build', 'biotech',
    'conveyor_belt', 'handyman', 'construction', 'recycling',
  ];

  private readonly categoryIconColors = [
    'text-blue-500', 'text-emerald-500', 'text-violet-500', 'text-amber-500',
    'text-rose-500', 'text-cyan-500', 'text-orange-500', 'text-teal-500',
  ];

  private readonly iconColors = [
    'text-blue-500', 'text-emerald-500', 'text-violet-500', 'text-amber-500',
    'text-rose-500', 'text-cyan-500', 'text-orange-500', 'text-teal-500',
    'text-indigo-500', 'text-pink-500', 'text-lime-500', 'text-sky-500',
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => { this.categories.set(cats); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getCategoryIcon(name: string, index: number): string {
    const lower = name.toLowerCase();
    if (lower.includes('automation') || lower.includes('motion')) return 'precision_manufacturing';
    if (lower.includes('wiring') || lower.includes('wire')) return 'cable';
    if (lower.includes('fastener') || lower.includes('screw')) return 'construction';
    if (lower.includes('electrical') || lower.includes('electric')) return 'electric_bolt';
    if (lower.includes('cutting') || lower.includes('tool')) return 'content_cut';
    if (lower.includes('safety')) return 'health_and_safety';
    if (lower.includes('lab')) return 'science';
    return this.categoryIcons[index % this.categoryIcons.length];
  }

  getCategoryIconColor(index: number): string {
    return this.categoryIconColors[index % this.categoryIconColors.length];
  }

  getSubCategoryIcon(name: string, index: number): string {
    const lower = name.toLowerCase();
    for (const [keyword, icon] of this.subCategoryIconMap) {
      if (lower.includes(keyword)) return icon;
    }
    return this.fallbackIcons[index % this.fallbackIcons.length];
  }

  getIconColor(index: number): string {
    return this.iconColors[index % this.iconColors.length];
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  setHoveredCategory(key: string): void {
    this.hoveredCategory.set(key);
    this.hoveredSubCategory.set(null);
  }

  setHoveredSubCategory(key: string): void {
    this.hoveredSubCategory.set(key);
  }

  clearHovered(): void {
    this.hoveredCategory.set(null);
    this.hoveredSubCategory.set(null);
  }

  navigateToSubCategory(category: string, subCategory: string): void {
    this.router.navigate(['/product-list'], { queryParams: { category, subCategory } });
  }

  navigateToMaterial(item: ApiMaterial): void {
    this.router.navigate(['/material', item.id], { state: { material: item } });
  }
}
