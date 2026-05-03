import {
  Component, ChangeDetectionStrategy, inject, output, input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { LazyImageDirective } from '../../directives/lazy-image.directive';
import { CartService } from '../../../core/services/cart.service';
import { LanguageService } from '../../../core/services/language.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InrCurrencyPipe, LazyImageDirective],
  template: `
    <div
      class="product-card card flex flex-col rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-full"
      (click)="cardClicked.emit(product())"
    >
      <!-- Image -->
      <div class="relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden"
           style="height: 160px;">
        <img
          appLazyImage
          [src]="product().image"
          [alt]="product().name"
          class="object-contain max-h-full w-full p-3"
          style="max-height: 140px;"
        />
        @if (product().series === 'economy') {
          <span class="absolute top-2 left-2 bg-brand-yellow text-brand-blue-dark text-[10px] font-bold px-1.5 py-0.5 rounded">
            ECO
          </span>
        }
        @if (product().discountPercent) {
          <span class="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{{ product().discountPercent }}%
          </span>
        }
      </div>

      <!-- Content -->
      <div class="flex flex-col flex-1 p-3 gap-1">
        <!-- Brand -->
        @if (product().brand) {
          <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
            {{ product().brand }}
          </p>
        }

        <!-- Name -->
        <p class="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 flex-1">
          {{ product().name }}
        </p>

        <!-- Series label -->
        @if (product().series === 'economy') {
          <p class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Economy Series</p>
        }

        <!-- Price -->
        <div class="mt-1 flex items-center justify-between gap-1">
          <div>
            @if (product().originalPrice && product().originalPrice! > product().price) {
              <p class="text-[10px] text-gray-400 line-through">
                {{ product().originalPrice | inrCurrency }}
              </p>
            }
            <p class="text-sm font-bold text-zoeing-secondary dark:text-zoeing-secondary-light">
              {{ lang.t('price_from') }} {{ product().price | inrCurrency }}
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-1">
            <!-- Quote button -->
            <button
              class="w-7 h-7 rounded-full bg-zoeing-secondary hover:bg-zoeing-secondary-dark text-white flex items-center justify-center transition-colors shrink-0"
              (click)="onQuote($event)"
              [title]="lang.t('request_quote')"
            >
              <span class="material-icons text-sm">description</span>
            </button>

            <!-- Add to cart -->
            <button
              class="w-7 h-7 rounded-full bg-zoeing-primary hover:bg-zoeing-primary-light text-white flex items-center justify-center transition-colors shrink-0"
              (click)="onAddToCart($event)"
              [title]="lang.t('add_to_cart')"
            >
              <span class="material-icons text-sm">add</span>
            </button>
          </div>
        </div>

        <!-- Stock -->
        <p class="text-[10px]" [class]="product().inStock ? 'text-green-600' : 'text-red-500'">
          {{ product().inStock ? lang.t('in_stock') : lang.t('out_of_stock') }}
        </p>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  product = input.required<Product>();
  cardClicked = output<Product>();

  protected cart = inject(CartService);
  protected lang = inject(LanguageService);
  private router = inject(Router);

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.cart.add(this.product());
  }

  onQuote(event: Event): void {
    event.stopPropagation();
    // Store the product in localStorage or a service for the quote page
    const quoteItems = JSON.parse(localStorage.getItem('quoteItems') || '[]');
    const existingItem = quoteItems.find((item: any) => item.product.id === this.product().id);

    if (!existingItem) {
      quoteItems.push({
        product: this.product(),
        quantity: 1,
        notes: ''
      });
      localStorage.setItem('quoteItems', JSON.stringify(quoteItems));
    }

    // Navigate to quote page
    this.router.navigate(['/quote']);
  }
}
