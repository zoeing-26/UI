import {
  Component, ChangeDetectionStrategy, inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';

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
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe, LayoutWrapperComponent],
  template: `
  <app-layout-wrapper layoutType="full">
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

      <!-- MAIN CONTENT: THE ORDER REGISTRY -->
      <main class="flex-1 overflow-y-auto p-6 lg:p-12">
        <div class="max-w-6xl mx-auto">

          <!-- Header -->
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-display font-black text-zoeing-navy dark:text-white uppercase tracking-tight">
                Procurement Summary
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Order Registry: {{ cart.count() }} component{{ cart.count() !== 1 ? 's' : '' }} identified
              </p>
            </div>
            <a routerLink="/inventory"
               class="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">
              <span class="material-icons text-sm">arrow_back</span>
              Return to Inventory
            </a>
          </div>

          @if (cart.isEmpty()) {
            <!-- Empty state -->
            <div class="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-24 text-center">
              <span class="material-icons text-6xl text-gray-300 dark:text-gray-600 mb-4 block">shopping_cart</span>
              <p class="text-lg font-medium text-gray-500 dark:text-gray-400 mb-6">Registry is currently empty.</p>
              <a routerLink="/inventory"
                 class="inline-flex items-center gap-2 px-6 py-3 bg-zoeing-navy text-white rounded-xl text-sm font-bold hover:bg-zoeing-navy-light transition-colors shadow-lg">
                <span class="material-icons text-sm">storefront</span>
                Begin Sourcing
              </a>
            </div>
          } @else {
            <!-- Technical Table -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Component</th>
                      <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center">Quantity</th>
                      <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Unit Price</th>
                      <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Line Total</th>
                      <th class="p-4"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <!-- Material items -->
                    @for (item of cart.matItems(); track item.materialId) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td class="p-4">
                          <div class="flex items-center gap-4">
                            <div class="w-12 h-12 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                              @if (item.material.image) {
                                <img [src]="item.material.image" [alt]="item.material.name" class="w-full h-full object-contain p-1" />
                              } @else {
                                <span class="material-icons text-2xl text-gray-300 dark:text-gray-600">image</span>
                              }
                            </div>
                            <div class="min-w-0">
                              <p class="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase mb-0.5">{{ item.material.product_code }}</p>
                              <p class="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{{ item.material.name }}</p>
                              <div class="flex items-center gap-1.5 mt-1">
                                @if (item.material.industry) {
                                  <span class="text-[9px] bg-zoeing-gold/10 text-zoeing-gold border border-zoeing-gold/20 rounded px-1.5 py-0.5 font-bold uppercase">
                                    {{ item.material.industry }}
                                  </span>
                                }
                                @if (item.material.count === 0) {
                                  <span class="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded px-1.5 py-0.5 font-bold uppercase flex items-center gap-0.5">
                                    <span class="material-icons text-[10px]">mail</span> Request by Mail
                                  </span>
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="p-4 text-center">
                          <div class="flex items-center justify-center gap-2 font-mono">
                            <button (click)="cart.updateMaterialQty(item.materialId, item.qty - 1)" [disabled]="item.qty <= 1"
                                    class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-zoeing-navy disabled:opacity-30 transition-colors">
                              <span class="material-icons text-xs">remove</span>
                            </button>
                            <span class="text-sm font-bold w-8 text-center">{{ item.qty }}</span>
                            <button (click)="cart.updateMaterialQty(item.materialId, item.qty + 1)"
                                    class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-zoeing-navy transition-colors">
                              <span class="material-icons text-xs">add</span>
                            </button>
                          </div>
                        </td>
                        <td class="p-4 text-right font-mono text-sm text-gray-600 dark:text-gray-300">
                          @if (item.price > 0) {
                            {{ item.price | inrCurrency }}
                          } @else {
                            <span class="text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase">Price on Request</span>
                          }
                        </td>
                        <td class="p-4 text-right font-mono text-sm font-bold text-zoeing-navy dark:text-white">
                          @if (item.price > 0) {
                            {{ item.price * item.qty | inrCurrency }}
                          } @else {
                            —
                          }
                        </td>
                        <td class="p-4 text-right">
                          <button (click)="cart.removeMaterial(item.materialId)" class="text-gray-400 hover:text-red-500 transition-colors">
                            <span class="material-icons text-sm">delete_outline</span>
                          </button>
                        </td>
                      </tr>
                    }
                    <!-- Product items -->
                    @for (item of cart.items(); track item.productId) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td class="p-4">
                          <div class="flex items-center gap-4">
                            <div class="w-12 h-12 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                              <img [src]="item.product.image" [alt]="item.product.name" class="w-full h-full object-contain p-1" />
                            </div>
                            <div class="min-w-0">
                              <p class="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase mb-0.5">{{ item.product.brand }}</p>
                              <p class="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{{ item.product.name }}</p>
                            </div>
                          </div>
                        </td>
                        <td class="p-4 text-center">
                          <div class="flex items-center justify-center gap-2 font-mono">
                            <button (click)="cart.updateQty(item.productId, item.qty - 1)" [disabled]="item.qty <= 1"
                                    class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-zoeing-navy disabled:opacity-30 transition-colors">
                              <span class="material-icons text-xs">remove</span>
                            </button>
                            <span class="text-sm font-bold w-8 text-center">{{ item.qty }}</span>
                            <button (click)="cart.updateQty(item.productId, item.qty + 1)"
                                    class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-zoeing-navy transition-colors">
                              <span class="material-icons text-xs">add</span>
                            </button>
                          </div>
                        </td>
                        <td class="p-4 text-right font-mono text-sm text-gray-600 dark:text-gray-300">
                          {{ item.price | inrCurrency }}
                        </td>
                        <td class="p-4 text-right font-mono text-sm font-bold text-zoeing-navy dark:text-white">
                          {{ item.price * item.qty | inrCurrency }}
                        </td>
                        <td class="p-4 text-right">
                          <button (click)="cart.remove(item.productId)" class="text-gray-400 hover:text-red-500 transition-colors">
                            <span class="material-icons text-sm">delete_outline</span>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </main>

      <!-- RIGHT PANE: FISCAL SUMMARY -->
      <aside class="hidden lg:flex w-96 shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 flex-col sticky top-0 h-screen">
        <div class="flex flex-col h-full">
          <div class="mb-8">
            <h2 class="text-lg font-bold text-zoeing-navy dark:text-white uppercase tracking-tight mb-4">Fiscal Summary</h2>
            <div class="space-y-3">
              <!-- Promo Code -->
              <div class="space-y-2">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Promo Code</p>
                <div class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="promoInput"
                    placeholder="Enter code"
                    class="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-zoeing-gold"
                    (keyup.enter)="applyPromo()"
                  />
                  <button
                    class="px-4 py-2 text-xs font-bold rounded-lg transition-colors"
                    [class]="promoApplied()
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-zoeing-navy text-white hover:bg-zoeing-navy-light'"
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
            </div>
          </div>

          <div class="flex-1"></div>

          <!-- Calculation Block -->
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span>Subtotal</span>
                <span class="font-mono">{{ subtotal() | inrCurrency }}</span>
              </div>
              @if (discount() > 0) {
                <div class="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                  <span>Promo Discount</span>
                  <span class="font-mono">− {{ discount() | inrCurrency }}</span>
                </div>
              }
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span>GST (18%)</span>
                <span class="font-mono">{{ gst() | inrCurrency }}</span>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
              <span class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Grand Total</span>
              <span class="text-3xl font-display font-black text-zoeing-secondary dark:text-zoeing-secondary-light font-mono">
                {{ grandTotal() | inrCurrency }}
              </span>
            </div>
            @if (priceOnRequestCount() > 0) {
              <div class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 flex items-start gap-2">
                <span class="material-icons text-amber-600 text-sm shrink-0">warning</span>
                <p class="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  {{ priceOnRequestCount() }} item{{ priceOnRequestCount() !== 1 ? 's' : '' }} marked "Price on Request" are excluded from the total calculations.
                </p>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="mt-8 space-y-3">
            <button
              class="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-zoeing-navy text-white font-bold text-sm hover:bg-zoeing-navy-light transition-all shadow-lg"
              (click)="requestQuote()"
            >
              <span class="material-icons text-base">description</span>
              Request Technical Quote
            </button>
            <button
              class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              (click)="cart.clear()"
            >
              <span class="material-icons text-base">delete_sweep</span>
              Clear Registry
            </button>
          </div>
        </div>
      </aside>
    </div>
  </app-layout-wrapper>
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
