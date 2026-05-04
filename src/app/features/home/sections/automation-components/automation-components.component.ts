import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { ApiCategory, ApiMaterial } from '../../../../models/product.model';
import { InrCurrencyPipe } from '../../../../shared/pipes/inr-currency.pipe';

/** Cards are ~160px + 12px gap = ~172px each. Promo card ~176px + 16px gap.
 *  On a 1280px screen the product area is ~1088px → fits ~6 cards.
 *  If a category has more than 6 products we enable marquee. */
const MARQUEE_THRESHOLD = 6;

interface CategoryRow {
  name: string;
  icon: string;
  bg: string;
  textClass: string;
  tagline: string;
  materials: ApiMaterial[];
  marquee: boolean;
  dur: string;
}

@Component({
  selector: 'app-automation-components',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  styles: [`
    @keyframes marquee-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-track {
      animation: marquee-scroll var(--dur, 40s) linear infinite;
      will-change: transform;
    }
    .marquee-wrap:hover .marquee-track {
      animation-play-state: paused;
    }
    .scroll-row {
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .scroll-row::-webkit-scrollbar { display: none; }
  `],
  template: `
  <section class="my-8">
    <div class="flex items-center justify-between mb-5">
      <h2 class="section-title mb-0">{{ lang.t('automation') }}</h2>
      <a routerLink="/inventory"
         class="text-xs font-semibold text-brand-blue dark:text-brand-yellow hover:underline flex items-center gap-1">
        View All <span class="material-icons text-sm">arrow_forward</span>
      </a>
    </div>

    @if (loading()) {
      <div class="space-y-6">
        @for (i of skeletons; track i) {
          <div class="flex gap-4">
            <div class="w-44 shrink-0 h-52 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div class="flex-1 flex gap-3 overflow-hidden">
              @for (j of cardSkeletons; track j) {
                <div class="shrink-0 w-40 h-52 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
              }
            </div>
          </div>
        }
      </div>

    } @else if (rows().length === 0) {
      <div class="flex items-center justify-center h-40 text-gray-400 text-sm">No categories available</div>

    } @else {
      <div class="space-y-6">

        @for (row of visibleRows(); track row.name) {
          <div class="flex gap-4 items-stretch">

            <!-- ── Left promo card ── -->
            <div class="hidden sm:flex w-44 shrink-0 rounded-xl overflow-hidden flex-col"
                 [style.background]="row.bg">
              <div class="p-4 flex flex-col gap-2 flex-1">
                <div class="w-10 h-10 rounded-lg bg-black/15 flex items-center justify-center">
                  <span class="material-icons text-xl" [class]="row.textClass">{{ row.icon }}</span>
                </div>
                <span class="font-display font-black text-sm leading-tight uppercase"
                      [class]="row.textClass">{{ row.name }}</span>
                <span class="text-[10px] font-medium opacity-80 leading-snug"
                      [class]="row.textClass">{{ row.tagline }}</span>
                <div class="mt-auto">
                  <div class="text-[10px] font-semibold opacity-70 mb-2" [class]="row.textClass">
                    {{ row.materials.length }} Products
                  </div>
                  <a routerLink="/inventory"
                     class="block text-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                     [class]="row.textClass === 'text-zinc-900'
                       ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                       : 'bg-white/20 text-white hover:bg-white/30'">
                    View More
                  </a>
                </div>
              </div>
            </div>

            <!-- ── Right: product row ── -->
            <div class="flex-1 min-w-0">

              @if (row.marquee) {
                <!-- Overflow → infinite marquee (items duplicated for seamless loop) -->
                <div class="marquee-wrap overflow-hidden">
                  <div class="marquee-track flex gap-3 py-0.5" [style.--dur]="row.dur">
                    @for (item of row.materials; track item.id) {
                      <ng-container *ngTemplateOutlet="card; context: { $implicit: item }"></ng-container>
                    }
                    @for (item of row.materials; track 'dup' + item.id) {
                      <ng-container *ngTemplateOutlet="card; context: { $implicit: item }"></ng-container>
                    }
                  </div>
                </div>
              } @else {
                <!-- Fits on screen → static row -->
                <div class="scroll-row flex gap-3 py-0.5">
                  @for (item of row.materials; track item.id) {
                    <ng-container *ngTemplateOutlet="card; context: { $implicit: item }"></ng-container>
                  }
                </div>
              }

            </div>
          </div>
        }

        <!-- ── Load More / Show Less ── -->
        @if (rows().length > initialCount) {
          <div class="flex items-center gap-4 pt-2">
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            @if (!allVisible()) {
              <button
                class="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-brand-blue text-brand-blue dark:border-brand-yellow dark:text-brand-yellow font-semibold text-sm hover:bg-brand-blue hover:text-white dark:hover:bg-brand-yellow dark:hover:text-zinc-900 transition-all"
                (click)="loadMore()"
              >
                <span class="material-icons text-base">expand_more</span>
                Load More
                <span class="bg-brand-blue/10 dark:bg-brand-yellow/20 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {{ rows().length - visibleCount() }} more
                </span>
              </button>
            } @else {
              <button
                class="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                (click)="showLess()"
              >
                <span class="material-icons text-base">expand_less</span>
                Show Less
              </button>
            }
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>
        }

      </div>
    }
  </section>

  <!-- ── Mini product card template ── -->
  <ng-template #card let-item>
    <div class="shrink-0 w-40 flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden cursor-pointer hover:shadow-lg hover:border-brand-blue/50 dark:hover:border-brand-yellow/50 transition-all"
         (click)="goToDetail(item)">

      <div class="h-20 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
        @if (item.image) {
          <img [src]="item.image" [alt]="item.name" class="h-full w-full object-contain p-2" loading="lazy" />
        } @else {
          <span class="material-icons text-3xl text-gray-300 dark:text-gray-600">precision_manufacturing</span>
        }
      </div>

      <div class="flex flex-col flex-1 p-2.5 gap-1">
        <p class="text-[9px] font-mono text-gray-400 dark:text-gray-500 truncate">{{ item.product_code }}</p>
        <p class="text-[11px] font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 flex-1">
          {{ item.name || item.product_code }}
        </p>

        <div class="flex items-center justify-between mt-1">
          @if (item.price) {
            <span class="text-xs font-bold text-zoeing-secondary dark:text-zoeing-secondary-light">
              {{ item.price | inrCurrency }}
            </span>
          } @else {
            <span class="text-[10px] text-gray-400 italic">POA</span>
          }
          <span class="w-1.5 h-1.5 rounded-full shrink-0"
                [class]="(item.count ?? 0) > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
          </span>
        </div>

        <div class="mt-1.5" (click)="$event.stopPropagation()">
          @if ((item.count ?? 0) > 0) {
            <button
              class="w-full py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
              [class]="isAdded(item.id)
                ? 'bg-green-600 text-white'
                : 'bg-zoeing-primary hover:bg-zoeing-primary-light text-white'"
              (click)="addToCart(item)"
            >
              <span class="material-icons text-[13px]">{{ isAdded(item.id) ? 'check' : 'add_shopping_cart' }}</span>
              {{ isAdded(item.id) ? 'Added!' : 'Add to Cart' }}
            </button>
          } @else {
            <button
              class="w-full py-1.5 rounded text-[11px] font-semibold bg-brand-blue hover:bg-brand-blue/90 text-white transition-colors flex items-center justify-center gap-1"
              (click)="requestByMail(item)"
            >
              <span class="material-icons text-[13px]">add_shopping_cart</span>
              Request
            </button>
          }
        </div>
      </div>
    </div>
  </ng-template>
  `,
})
export class AutomationComponentsComponent implements OnInit {
  protected lang = inject(LanguageService);
  private productService = inject(ProductService);
  private cart   = inject(CartService);
  private router = inject(Router);

  private rawCategories = signal<ApiCategory[]>([]);
  loading  = signal(true);
  addedIds = signal<Set<number>>(new Set());

  readonly initialCount = 2;
  visibleCount = signal(this.initialCount);

  readonly skeletons    = Array(2);
  readonly cardSkeletons = Array(5);

  private readonly categoryIconMap: [string, string][] = [
    ['automation',  'precision_manufacturing'],
    ['motion',      'rotate_right'],
    ['wiring',      'cable'],
    ['wire',        'cable'],
    ['fastener',    'construction'],
    ['screw',       'build'],
    ['electrical',  'electric_bolt'],
    ['cutting',     'content_cut'],
    ['tool',        'handyman'],
    ['safety',      'health_and_safety'],
    ['lab',         'science'],
    ['clean',       'clean_hands'],
    ['pneumatic',   'air'],
    ['hydraulic',   'water_drop'],
    ['conveyor',    'conveyor_belt'],
    ['sensor',      'sensors'],
    ['bearing',     'settings'],
    ['press',       'compress'],
    ['plastic',     'format_shapes'],
  ];

  private readonly promoThemes: { bg: string; textClass: string }[] = [
    { bg: 'linear-gradient(160deg,#f59e0b 0%,#d97706 100%)', textClass: 'text-zinc-900' },
    { bg: 'linear-gradient(160deg,#1d4ed8 0%,#1e3a8a 100%)', textClass: 'text-white' },
    { bg: 'linear-gradient(160deg,#7c3aed 0%,#5b21b6 100%)', textClass: 'text-white' },
    { bg: 'linear-gradient(160deg,#059669 0%,#065f46 100%)', textClass: 'text-white' },
    { bg: 'linear-gradient(160deg,#dc2626 0%,#991b1b 100%)', textClass: 'text-white' },
    { bg: 'linear-gradient(160deg,#0891b2 0%,#155e75 100%)', textClass: 'text-white' },
    { bg: 'linear-gradient(160deg,#ea580c 0%,#9a3412 100%)', textClass: 'text-white' },
    { bg: 'linear-gradient(160deg,#0f766e 0%,#134e4a 100%)', textClass: 'text-white' },
  ];

  private readonly taglines: [string, string][] = [
    ['automation', 'Factory Automation Components'],
    ['motion',     'Precision Motion Control'],
    ['wiring',     'Wiring & Cable Solutions'],
    ['wire',       'Wiring & Cable Solutions'],
    ['fastener',   'Fasteners & Fixings'],
    ['screw',      'Screws & Bolts'],
    ['electrical', 'Electrical Components'],
    ['cutting',    'Cutting Tools & Blades'],
    ['tool',       'Hand & Power Tools'],
    ['safety',     'Safety & Protection'],
    ['lab',        'Lab & Clean Room'],
    ['clean',      'Lab & Clean Room'],
    ['pneumatic',  'Pneumatic Systems'],
    ['hydraulic',  'Hydraulic Solutions'],
    ['conveyor',   'Conveyor Systems'],
    ['sensor',     'Sensors & Detection'],
    ['bearing',    'Bearings & Bushings'],
  ];

  readonly rows = computed((): CategoryRow[] =>
    this.rawCategories()
      .map((cat, idx) => {
        const materials = cat.sub_category.flatMap(s => s.materials);
        if (materials.length === 0) return null;
        const marquee = materials.length > MARQUEE_THRESHOLD;
        const theme   = this.promoThemes[idx % this.promoThemes.length];
        return {
          name: cat.name,
          icon: this.getCatIcon(cat.name),
          bg: theme.bg,
          textClass: theme.textClass,
          tagline: this.getTagline(cat.name),
          materials,
          marquee,
          dur: Math.max(20, Math.round(materials.length * 1.8)) + 's',
        } as CategoryRow;
      })
      .filter((r): r is CategoryRow => r !== null)
  );

  readonly visibleRows = computed(() => this.rows().slice(0, this.visibleCount()));
  readonly allVisible  = computed(() => this.visibleCount() >= this.rows().length);

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: cats => { this.rawCategories.set(cats); this.loading.set(false); },
      error: ()   => { this.loading.set(false); },
    });
  }

  loadMore(): void {
    this.visibleCount.update(n => Math.min(n + 2, this.rows().length));
  }

  showLess(): void {
    this.visibleCount.set(this.initialCount);
  }

  private getCatIcon(name: string): string {
    const lower = name.toLowerCase();
    for (const [kw, icon] of this.categoryIconMap) {
      if (lower.includes(kw)) return icon;
    }
    return 'category';
  }

  private getTagline(name: string): string {
    const lower = name.toLowerCase();
    for (const [kw, tl] of this.taglines) {
      if (lower.includes(kw)) return tl;
    }
    return 'Industrial Components';
  }

  isAdded(id: number): boolean {
    return this.addedIds().has(id);
  }

  addToCart(item: ApiMaterial): void {
    this.cart.addMaterial(item);
    this.addedIds.update(s => new Set([...s, item.id]));
    setTimeout(() => {
      this.addedIds.update(s => { const n = new Set(s); n.delete(item.id); return n; });
    }, 1500);
  }

  requestByMail(item: ApiMaterial): void {
    this.cart.addMaterial(item);
    this.router.navigate(['/cart']);
  }

  goToDetail(item: ApiMaterial): void {
    this.router.navigate(['/material', item.id], { state: { material: item } });
  }
}
