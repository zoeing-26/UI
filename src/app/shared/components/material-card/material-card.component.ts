import { Component, ChangeDetectionStrategy, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { CartService } from '../../../core/services/cart.service';
import { SafeStorageService } from '../../../core/services/safe-storage.service';
import { GeoLocationService, isMaterialBlocked } from '../../../core/services/geo-location.service';
import { ApiMaterial } from '../../../models/product.model';

@Component({
  selector: 'app-material-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
    <div class="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.3rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-[0_18px_34px_rgba(15,23,42,0.08)] transition-all duration-250 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_22px_40px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-[0_20px_36px_rgba(2,8,23,0.45)]"
         (click)="onCardClick()">

      <div class="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950" style="height:210px">
        @if (mat().image) {
          <img
            [src]="mat().image!"
            [alt]="mat().name"
            class="w-full object-contain p-4 transition-transform duration-250 group-hover:scale-[1.03]"
            style="max-height:170px"
            loading="lazy"
          />
        } @else {
          <div class="flex flex-col items-center justify-center gap-1 select-none text-slate-300 dark:text-slate-600">
            <span class="material-icons text-4xl">image</span>
            <span class="text-[10px] uppercase tracking-[0.2em]">No Image</span>
          </div>
        }

        @if (mat().industry) {
          <span class="absolute left-3 top-3 rounded-full bg-amber-300/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm">
            {{ mat().industry }}
          </span>
        }

        @if (blocked()) {
          <span class="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-600/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
            <span class="material-icons text-[11px]">public_off</span> Blocked
          </span>
        }
      </div>

      <div class="flex flex-1 flex-col gap-2 p-4">
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {{ mat().product_code }}
          </p>
          @if (inStock()) {
            <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              In stock
            </span>
          }
        </div>

        <p class="flex-1 text-[15px] font-semibold leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">
          {{ mat().name || mat().product_code }}
        </p>

        <p class="text-[11px] font-medium text-amber-700 dark:text-amber-300">Economy Series</p>

        <div class="mt-1 flex items-end justify-between gap-2">
          <div>
            @if (mat().price) {
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Price from</p>
              <p class="text-base font-bold text-[#0d4c6a] dark:text-[#f4c977]">
                {{ mat().price! | inrCurrency }}
              </p>
            } @else {
              <p class="text-[11px] text-slate-400 dark:text-slate-500 italic">Price on Request</p>
            }
          </div>
        </div>

        <div class="pt-1">
          @if (blocked()) {
            <p class="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red-500 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              <span class="material-icons text-[13px]">public_off</span>
              Not available in {{ regionName() }}
            </p>
          } @else if (inStock()) {
            <p class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              ● Stock available • {{ mat().count }} units
            </p>
          } @else {
            <button
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-3 text-[11px] font-semibold text-white transition-colors hover:bg-sky-700"
              (click)="onRequestMail(); $event.stopPropagation()"
            >
              <span class="material-icons text-[14px]">mail</span>
              Request by Mail
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class MaterialCardComponent {
  mat = input.required<ApiMaterial>();

  private cart    = inject(CartService);
  private router  = inject(Router);
  private storage = inject(SafeStorageService);
  private geo     = inject(GeoLocationService);

  protected inStock       = computed(() => (this.mat().count ?? 0) > 0);
  /** Region blocking: material must not be offered in the visitor's country. */
  protected blocked       = computed(() => isMaterialBlocked(this.mat(), this.geo.country(), this.geo.blockedIds()));
  protected regionName    = computed(() => this.geo.countryName() || 'your region');
  protected addedFeedback = signal(false);

  onCardClick(): void {
    if (this.blocked()) return;
    this.router.navigate(['/material', this.mat().id], { state: { material: this.mat() } });
  }

  onAddToCart(): void {
    this.cart.addMaterial(this.mat());
    this.addedFeedback.set(true);
    // User-triggered → browser-only; timeout runs only after hydration
    setTimeout(() => this.addedFeedback.set(false), 1500);
  }

  onQuote(): void {
    const m = this.mat();
    const storage = this.storage;
    let items: Array<Record<string, unknown>> = [];
    try {
      items = JSON.parse(storage.getItem('quoteItems') || '[]') as Array<Record<string, unknown>>;
    } catch { items = []; }
    const exists = items.find(i => i['id'] === m.id);
    if (!exists) {
      items.push({
        id: m.id, name: m.name, product_code: m.product_code,
        image: m.image, price: m.price ?? 0, qty: 1, industry: m.industry,
      });
      storage.setItem('quoteItems', JSON.stringify(items));
    }
    this.router.navigate(['/quote']);
  }

  onRequestMail(): void {
    this.cart.addMaterial(this.mat());
    this.router.navigate(['/cart']);
  }
}
