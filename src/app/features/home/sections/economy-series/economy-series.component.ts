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

interface CategoryRow {
  name: string;
  icon: string;
  color: string;
  materials: ApiMaterial[];
  animDuration: string;
}

@Component({
  selector: 'app-economy-series',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  styles: [`
    @keyframes marquee-left {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-track {
      animation: marquee-left var(--dur, 40s) linear infinite;
      will-change: transform;
    }
    .marquee-wrap:hover .marquee-track {
      animation-play-state: paused;
    }
  `],
  template: `
  <section class="my-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="section-title mb-0">{{ lang.t('economy_series') }}</h2>
      <a routerLink="/inventory"
         class="text-xs font-semibold text-brand-blue dark:text-brand-yellow hover:underline flex items-center gap-1">
        View All <span class="material-icons text-sm">arrow_forward</span>
      </a>
    </div>

    <div class="flex gap-4 items-stretch">

      <!-- Promo card -->
      <div class="hidden lg:flex w-40 xl:w-48 shrink-0 rounded-xl overflow-hidden flex-col"
           style="background: linear-gradient(160deg, #f59e0b 0%, #d97706 100%); min-height:320px">
        <div class="p-4 flex flex-col gap-3 flex-1">
          <span class="font-display font-black text-brand-blue-dark text-base leading-tight uppercase">Economy Series</span>
          <span class="text-[11px] font-medium text-brand-blue-dark/70">Factory Automation Components at best prices</span>

          <div class="flex-1 flex items-center justify-center">
            <div class="grid grid-cols-2 gap-1.5">
              @for (icon of promoIcons; track icon) {
                <div class="w-11 h-9 rounded-md bg-black/10 flex items-center justify-center">
                  <span class="material-icons text-brand-blue-dark text-base">{{ icon }}</span>
                </div>
              }
            </div>
          </div>

          <a routerLink="/inventory"
             class="block text-center bg-brand-blue text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-brand-blue/90 transition-colors">
            Browse All ›
          </a>
        </div>
      </div>

      <!-- Marquee strip -->
      <div class="flex-1 min-w-0">
        @if (loading()) {
          <div class="flex gap-3 overflow-hidden">
            @for (i of skeletons; track i) {
              <div class="shrink-0 w-40 h-52 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            }
          </div>
        } @else if (materials().length === 0) {
          <div class="flex items-center justify-center h-52 text-gray-400 text-sm">No products available</div>
        } @else {
          <div class="marquee-wrap overflow-hidden rounded-lg">
            <div class="marquee-track flex gap-3 py-1" [style.--dur]="animDuration()">

              <!-- First copy -->
              @for (item of materials(); track item.id) {
                <ng-container *ngTemplateOutlet="card; context: { $implicit: item }"></ng-container>
              }
              <!-- Second copy for seamless loop -->
              @for (item of materials(); track 'b' + item.id) {
                <ng-container *ngTemplateOutlet="card; context: { $implicit: item }"></ng-container>
              }

            </div>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ── Mini product card template ── -->
  <ng-template #card let-item>
    <div class="shrink-0 w-40 flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden cursor-pointer hover:shadow-lg hover:border-brand-blue/50 dark:hover:border-brand-yellow/50 transition-all"
         (click)="goToDetail(item)">

      <!-- Image -->
      <div class="h-20 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
        @if (item.image) {
          <img [src]="item.image" [alt]="item.name" class="h-full w-full object-contain p-2" loading="lazy" />
        } @else {
          <span class="material-icons text-3xl text-gray-300 dark:text-gray-600">precision_manufacturing</span>
        }
      </div>

      <!-- Body -->
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

        <!-- Cart action -->
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
export class EconomySeriesComponent implements OnInit {
  protected lang = inject(LanguageService);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private router = inject(Router);

  materials = signal<ApiMaterial[]>([]);
  loading   = signal(true);
  addedIds  = signal<Set<number>>(new Set());

  readonly skeletons   = Array(6);
  readonly promoIcons  = ['settings', 'hardware', 'layers', 'cable', 'electric_bolt', 'build'];

  readonly animDuration = computed(() => {
    const n = this.materials().length;
    return Math.max(20, Math.round(n * 1.8)) + 's';
  });

  ngOnInit(): void {
    this.productService.getAllMaterials().subscribe({
      next: mats => { this.materials.set(mats); this.loading.set(false); },
      error: ()   => { this.loading.set(false); },
    });
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
