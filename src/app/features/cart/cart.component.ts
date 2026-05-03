import {
  Component, ChangeDetectionStrategy, inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';

const GST_RATE     = 0.18;
const PROMO_CODES: Record<string, number> = {
  'ZOIENG10': 0.10,
  'FLAT500':  0,       // handled as flat below
};
const FLAT_PROMOS: Record<string, number> = {
  'FLAT500': 500,
};

@Component({
  selector: 'app-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe],
  template: `
  <main class="max-w-screen-lg mx-auto px-4 py-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-zoeing-navy dark:text-white">Your Cart</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ cart.count() }} item{{ cart.count() !== 1 ? 's' : '' }}
        </p>
      </div>
      <a routerLink="/products"
         class="flex items-center gap-1 text-sm text-brand-blue hover:underline dark:text-blue-400">
        <span class="material-icons text-base">arrow_back</span>
        Continue Shopping
      </a>
    </div>

    @if (cart.isEmpty()) {
      <!-- Empty state -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-16 text-center">
        <span class="material-icons text-5xl text-gray-300 dark:text-gray-600 mb-3 block">shopping_cart</span>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
        <a routerLink="/products"
           class="inline-flex items-center gap-1 px-5 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors">
          Browse Products
        </a>
      </div>

    } @else {
      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Left: items list -->
        <div class="flex-1 min-w-0 space-y-3">

          <!-- Material items -->
          @for (item of cart.matItems(); track item.materialId) {
            <div class="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">

              <!-- Image -->
              <div class="w-16 h-16 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                @if (item.material.image) {
                  <img [src]="item.material.image" [alt]="item.material.name"
                       class="w-full h-full object-contain p-1" loading="lazy" />
                } @else {
                  <span class="material-icons text-2xl text-gray-300 dark:text-gray-600">image</span>
                }
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium tracking-wide">
                  {{ item.material.product_code }}
                </p>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                  {{ item.material.name }}
                </p>
                @if (item.material.industry) {
                  <span class="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded px-1.5 py-0.5 font-medium">
                    {{ item.material.industry }}
                  </span>
                }
                @if (item.price > 0) {
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ item.price | inrCurrency }} each
                  </p>
                } @else {
                  <p class="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5">Price on Request</p>
                }
              </div>

              <!-- Qty stepper -->
              <div class="flex items-center gap-1 shrink-0">
                <button
                  class="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold disabled:opacity-40"
                  (click)="cart.updateMaterialQty(item.materialId, item.qty - 1)"
                  [disabled]="item.qty <= 1"
                >−</button>
                <span class="w-8 text-center text-sm font-semibold text-gray-800 dark:text-gray-100 select-none">
                  {{ item.qty }}
                </span>
                <button
                  class="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
                  (click)="cart.updateMaterialQty(item.materialId, item.qty + 1)"
                >+</button>
              </div>

              <!-- Line total -->
              <p class="w-20 text-right text-sm font-bold text-zoeing-secondary dark:text-zoeing-secondary-light shrink-0">
                @if (item.price > 0) {
                  {{ item.price * item.qty | inrCurrency }}
                } @else {
                  —
                }
              </p>

              <!-- Remove -->
              <button
                class="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Remove"
                (click)="cart.removeMaterial(item.materialId)"
              >
                <span class="material-icons text-lg">delete_outline</span>
              </button>
            </div>
          }

          <!-- Product items -->
          @for (item of cart.items(); track item.productId) {
            <div class="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">

              <div class="w-16 h-16 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                <img [src]="item.product.image" [alt]="item.product.name"
                     class="w-full h-full object-contain p-1" loading="lazy" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium tracking-wide">
                  {{ item.product.brand }}
                </p>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                  {{ item.product.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ item.price | inrCurrency }} each
                </p>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button
                  class="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold disabled:opacity-40"
                  (click)="cart.updateQty(item.productId, item.qty - 1)"
                  [disabled]="item.qty <= 1"
                >−</button>
                <span class="w-8 text-center text-sm font-semibold text-gray-800 dark:text-gray-100 select-none">
                  {{ item.qty }}
                </span>
                <button
                  class="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
                  (click)="cart.updateQty(item.productId, item.qty + 1)"
                >+</button>
              </div>

              <p class="w-20 text-right text-sm font-bold text-zoeing-secondary dark:text-zoeing-secondary-light shrink-0">
                {{ item.price * item.qty | inrCurrency }}
              </p>

              <button
                class="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Remove"
                (click)="cart.remove(item.productId)"
              >
                <span class="material-icons text-lg">delete_outline</span>
              </button>
            </div>
          }
        </div>

        <!-- Right: summary -->
        <div class="lg:w-80 shrink-0">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sticky top-24 space-y-4">

            <!-- Promo code -->
            <div>
              <p class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                Promo Code
              </p>
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="promoInput"
                  placeholder="Enter code"
                  [class]="'flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 ' +
                    (promoError() ? 'border-red-400 focus:ring-red-400' : promoApplied() ? 'border-green-400 focus:ring-green-400' : 'border-gray-300 dark:border-gray-600 focus:ring-brand-blue')"
                  (keyup.enter)="applyPromo()"
                />
                <button
                  class="px-3 py-2 text-sm font-semibold rounded-lg transition-colors"
                  [class]="promoApplied()
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-brand-blue text-white hover:bg-brand-blue/90'"
                  (click)="applyPromo()"
                >
                  {{ promoApplied() ? 'Applied' : 'Apply' }}
                </button>
              </div>
              @if (promoError()) {
                <p class="text-[11px] text-red-500 mt-1">{{ promoError() }}</p>
              }
              @if (promoApplied()) {
                <p class="text-[11px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <span class="material-icons text-[13px]">check_circle</span>
                  {{ activePromo() }} applied — {{ promoLabel() }} off
                </p>
              }
            </div>

            <hr class="border-gray-100 dark:border-gray-800" />

            <!-- Price breakdown -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal ({{ cart.count() }} item{{ cart.count() !== 1 ? 's' : '' }})</span>
                <span>{{ subtotal() | inrCurrency }}</span>
              </div>

              @if (discount() > 0) {
                <div class="flex justify-between text-green-600 dark:text-green-400">
                  <span>Promo Discount</span>
                  <span>− {{ discount() | inrCurrency }}</span>
                </div>
              }

              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>GST (18%)</span>
                <span>{{ gst() | inrCurrency }}</span>
              </div>

              <hr class="border-gray-100 dark:border-gray-800" />

              <div class="flex justify-between font-bold text-gray-900 dark:text-white text-base">
                <span>Total</span>
                <span class="text-zoeing-secondary dark:text-zoeing-secondary-light">
                  {{ grandTotal() | inrCurrency }}
                </span>
              </div>

              @if (priceOnRequestCount() > 0) {
                <p class="text-[11px] text-amber-600 dark:text-amber-400">
                  * {{ priceOnRequestCount() }} item{{ priceOnRequestCount() !== 1 ? 's' : '' }} marked "Price on Request" excluded from total
                </p>
              }
            </div>

            <hr class="border-gray-100 dark:border-gray-800" />

            <!-- Actions -->
            <div class="space-y-2">
              <button
                class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 transition-colors"
                (click)="requestQuote()"
              >
                <span class="material-icons text-base">description</span>
                Request for Quote
              </button>
              <button
                class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                (click)="cart.clear()"
              >
                <span class="material-icons text-base">delete_sweep</span>
                Clear Cart
              </button>
            </div>

          </div>
        </div>
      </div>
    }
  </main>
  `,
})
export class CartComponent {
  protected cart   = inject(CartService);
  private   router = inject(Router);

  promoInput  = '';
  activePromo = signal<string | null>(null);
  promoError  = signal<string | null>(null);

  readonly promoApplied   = computed(() => this.activePromo() !== null);
  readonly promoLabel     = computed(() => {
    const code = this.activePromo();
    if (!code) return '';
    if (FLAT_PROMOS[code]) return `₹${FLAT_PROMOS[code]}`;
    return `${(PROMO_CODES[code] * 100).toFixed(0)}%`;
  });

  readonly subtotal = computed(() => this.cart.total());

  readonly discount = computed(() => {
    const code = this.activePromo();
    if (!code) return 0;
    if (FLAT_PROMOS[code]) return Math.min(FLAT_PROMOS[code], this.subtotal());
    const rate = PROMO_CODES[code] ?? 0;
    return Math.round(this.subtotal() * rate);
  });

  readonly afterDiscount  = computed(() => Math.max(0, this.subtotal() - this.discount()));
  readonly gst            = computed(() => Math.round(this.afterDiscount() * GST_RATE));
  readonly grandTotal     = computed(() => this.afterDiscount() + this.gst());

  readonly priceOnRequestCount = computed(() =>
    this.cart.matItems().filter(i => i.price === 0).length
  );

  applyPromo(): void {
    const code = this.promoInput.trim().toUpperCase();
    if (!code) { this.promoError.set('Please enter a promo code.'); return; }
    if (PROMO_CODES[code] !== undefined || FLAT_PROMOS[code] !== undefined) {
      this.activePromo.set(code);
      this.promoError.set(null);
    } else {
      this.promoError.set('Invalid promo code.');
      this.activePromo.set(null);
    }
  }

  requestQuote(): void {
    // Snapshot cart materials into quoteItems localStorage for the quote page
    const quoteItems = this.cart.matItems().map(i => ({
      id: i.materialId,
      name: i.material.name,
      product_code: i.material.product_code,
      image: i.material.image,
      price: i.price,
      qty: i.qty,
    }));
    localStorage.setItem('quoteItems', JSON.stringify(quoteItems));
    this.router.navigate(['/quote']);
  }
}
