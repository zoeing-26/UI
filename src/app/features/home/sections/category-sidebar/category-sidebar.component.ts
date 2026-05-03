import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { ProductService } from '../../../../core/services/product.service';
import { ApiCategory, ApiSubProduct } from '../../../../models/product.model';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <aside class="relative w-full lg:w-[32rem] shrink-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-brand-blue text-white px-4 py-2.5 flex items-center gap-2">
      <span class="material-icons text-sm text-brand-yellow">grid_view</span>
      <span class="text-sm font-bold tracking-wide">{{ lang.t('search_by_category') }}</span>
    </div>

    <div class="lg:flex" (mouseleave)="setHoveredCategory(null)">
      <!-- Left: category list -->
      <div class="lg:w-56 shrink-0 border-b border-gray-100 dark:border-gray-800 lg:border-b-0 lg:border-r lg:border-gray-100 dark:lg:border-gray-700">
        @if (loading()) {
          <div class="p-4 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue mx-auto"></div>
            <p class="text-sm text-gray-500 mt-2">Loading categories...</p>
          </div>
        } @else {
          <ul class="divide-y divide-gray-100 dark:divide-gray-800">
            @for (cat of categories(); track cat.name; let ci = $index) {
              <li (mouseenter)="setHoveredCategory(cat.name)">
                <button
                  class="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors text-left group"
                  [class]="hoveredCategory() === cat.name
                    ? 'bg-brand-blue text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'"
                >
                  <span class="flex items-center gap-2.5 min-w-0 overflow-hidden">
                    <span
                      class="material-icons text-[18px] shrink-0 transition-colors"
                      [class]="hoveredCategory() === cat.name ? 'text-brand-yellow' : getCategoryIconColor(ci)"
                    >{{ getCategoryIcon(cat.name, ci) }}</span>
                    <span class="truncate" [title]="cat.name">{{ cat.name }}</span>
                  </span>
                  @if (cat.sub_category.length > 0) {
                    <span
                      class="material-icons text-xs transition-colors"
                      [class]="hoveredCategory() === cat.name ? 'text-white/70' : 'text-gray-300 dark:text-gray-600'"
                    >chevron_right</span>
                  }
                </button>
              </li>
            }
          </ul>
        }
      </div>

      <!-- Right: subcategory list -->
      <div class="hidden lg:flex lg:flex-1 min-h-[200px] items-start">
        @if (hoveredSubProducts().length > 0) {
          <div class="w-full">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-4 pt-3 pb-1">
              {{ hoveredCategory() }}
            </p>
            <ul class="divide-y divide-gray-50 dark:divide-gray-800">
              @for (group of hoveredSubProducts(); track group.name; let i = $index) {
                <li>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
                    (click)="navigateToSubCategory(hoveredCategory()!, group.name)"
                  >
                    <span
                      class="material-icons text-[18px] shrink-0"
                      [class]="getIconColor(i)"
                    >{{ getSubCategoryIcon(group.name, i) }}</span>
                    <span class="flex-1 text-sm text-gray-700 dark:text-gray-200 group-hover:text-brand-blue dark:group-hover:text-brand-yellow">
                      {{ group.name }}
                    </span>
                    <span class="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
                      {{ group.materials.length }} item{{ group.materials.length !== 1 ? 's' : '' }}
                    </span>
                    <span class="material-icons text-xs text-gray-300 dark:text-gray-600 group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors">chevron_right</span>
                  </button>
                </li>
              }
            </ul>
          </div>
        } @else if (hoveredCategory()) {
          <div class="flex flex-col items-center justify-center w-full h-full p-6 text-center text-gray-400 dark:text-gray-600">
            <span class="material-icons text-3xl mb-1">inbox</span>
            <p class="text-xs">No subcategories</p>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center w-full h-full p-6 text-center text-gray-300 dark:text-gray-700">
            <span class="material-icons text-3xl mb-1">arrow_back</span>
            <p class="text-xs">Hover a category</p>
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

  // ── Derived state ──────────────────────────────────────────────────────────

  hoveredSubProducts(): ApiSubProduct[] {
    return this.categories().find(c => c.name === this.hoveredCategory())?.sub_category ?? [];
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

  setHoveredCategory(key: string | null): void {
    this.hoveredCategory.set(key);
  }

  navigateToSubCategory(category: string, subCategory: string): void {
    this.router.navigate(['/products'], { queryParams: { category, subCategory } });
  }
}
