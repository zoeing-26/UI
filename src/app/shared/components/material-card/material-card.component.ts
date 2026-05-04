import { Component, ChangeDetectionStrategy, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { CartService } from '../../../core/services/cart.service';
import { ApiMaterial } from '../../../models/product.model';

@Component({
  selector: 'app-material-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
    <div class="group flex flex-col rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-full cursor-pointer hover:shadow-md hover:border-brand-blue/40 transition-all"
         (click)="onCardClick()">

      <!-- Image -->
      <div class="relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center" style="height:160px">
        @if (mat().image) {
          <img
            [src]="mat().image!"
            [alt]="mat().name"
            class="object-contain w-full p-3"
            style="max-height:140px"
            loading="lazy"
          />
        } @else {
          <div class="flex flex-col items-center justify-center gap-1 text-gray-300 dark:text-gray-600 select-none">
            <span class="material-icons text-4xl">image</span>
            <span class="text-[10px]">No Image</span>
          </div>
        }

        <!-- Industry badge -->
        @if (mat().industry) {
          <span class="absolute top-2 left-2 bg-brand-yellow text-brand-blue-dark text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">
            {{ mat().industry }}
          </span>
        }
      </div>

      <!-- Body -->
      <div class="flex flex-col flex-1 p-3 gap-1">

        <!-- Product code -->
        <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
          {{ mat().product_code }}
        </p>

        <!-- Name -->
        <p class="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 flex-1">
          {{ mat().name || mat().product_code }}
        </p>

        <!-- Series label -->
        <p class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Economy Series</p>

        <!-- Price row -->
        <div class="mt-1 flex items-end justify-between gap-2">
          <div>
            @if (mat().price) {
              <p class="text-[10px] text-gray-500 dark:text-gray-400">Price from</p>
              <p class="text-sm font-bold text-zoeing-secondary dark:text-zoeing-secondary-light">
                {{ mat().price! | inrCurrency }}
              </p>
            } @else {
              <p class="text-[11px] text-gray-400 dark:text-gray-500 italic">Price on Request</p>
            }
          </div>

          <!-- Cart + Quote buttons (in-stock only) -->
          @if (inStock()) {
            <div class="flex gap-1 shrink-0" (click)="$event.stopPropagation()">
              <button
                class="w-7 h-7 rounded-full bg-zoeing-secondary hover:bg-zoeing-secondary-dark text-white flex items-center justify-center transition-colors"
                title="Request Quote"
                (click)="onQuote()"
              >
                <span class="material-icons text-sm">description</span>
              </button>
              <button
                class="w-7 h-7 rounded-full bg-zoeing-primary hover:bg-zoeing-primary-light text-white flex items-center justify-center transition-colors"
                title="Add to Cart"
                (click)="onAddToCart()"
              >
                <span class="material-icons text-sm">{{ addedFeedback() ? 'check' : 'add' }}</span>
              </button>
            </div>
          }
        </div>

        <!-- Stock / request row -->
        <div class="mt-1.5">
          @if (inStock()) {
            <p class="text-[10px] font-medium text-green-600 dark:text-green-400">
              ● In Stock ({{ mat().count }})
            </p>
          } @else {
            <button
              class="w-full flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-semibold bg-brand-blue hover:bg-brand-blue/90 text-white transition-colors"
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

  private cart   = inject(CartService);
  private router = inject(Router);

  protected inStock       = computed(() => (this.mat().count ?? 0) > 0);
  protected addedFeedback = signal(false);

  onCardClick(): void {
    this.router.navigate(['/material', this.mat().id], { state: { material: this.mat() } });
  }

  onAddToCart(): void {
    this.cart.addMaterial(this.mat());
    this.addedFeedback.set(true);
    setTimeout(() => this.addedFeedback.set(false), 1500);
  }

  onQuote(): void {
    const m = this.mat();
    const items: unknown[] = JSON.parse(localStorage.getItem('quoteItems') || '[]');
    const exists = (items as { id: number }[]).find(i => i.id === m.id);
    if (!exists) {
      items.push({
        id: m.id, name: m.name, product_code: m.product_code,
        image: m.image, price: m.price ?? 0, qty: 1, industry: m.industry,
      });
      localStorage.setItem('quoteItems', JSON.stringify(items));
    }
    this.router.navigate(['/quote']);
  }

  onRequestMail(): void {
    this.cart.addMaterial(this.mat());
    this.router.navigate(['/cart']);
  }
}
