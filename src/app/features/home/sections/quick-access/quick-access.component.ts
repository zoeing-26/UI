import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { CartService } from '../../../../core/services/cart.service';
import { InrCurrencyPipe } from '../../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-quick-access',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  template: `
  <section class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">

    <!-- Quote & Order -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <div class="bg-brand-blue text-white px-4 py-2 flex items-center gap-2">
        <span class="material-icons text-sm text-brand-yellow">description</span>
        <span class="text-sm font-bold">{{ lang.t('quote_and_order') }}</span>
      </div>
      <div class="p-4 flex items-center gap-6 flex-wrap">
        <a routerLink="/quote" [queryParams]="{fresh: '1'}" class="btn-yellow text-sm font-bold px-4 py-2">
          <span class="material-icons text-sm">description</span>
          {{ lang.t('quote_order') }}
        </a>
        <div class="flex items-center gap-5">
          @for (item of orderActions; track item.label) {
            <button class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors group">
              <div class="relative">
                <span class="material-icons text-2xl group-hover:scale-110 transition-transform">{{ item.icon }}</span>
                @if (item.badge !== undefined && item.badge > 0) {
                  <span class="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{{ item.badge }}</span>
                }
              </div>
              <span class="text-[10px] font-medium text-center leading-tight max-w-[60px]">{{ item.label }}</span>
            </button>
          }
        </div>
      </div>
    </div>

    <!-- Need Help -->
    <!--<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <div class="bg-brand-blue text-white px-4 py-2 flex items-center gap-2">
        <span class="material-icons text-sm text-brand-yellow">help_outline</span>
        <span class="text-sm font-bold">{{ lang.t('need_help') }}</span>
      </div>
      <div class="p-4 flex items-center gap-6 flex-wrap">
        @for (item of helpActions; track item.label) {
          <button class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors group">
            <span class="material-icons text-2xl group-hover:scale-110 transition-transform">{{ item.icon }}</span>
            <span class="text-[10px] font-medium text-center leading-tight max-w-[70px]">{{ item.label }}</span>
          </button>
        }
      </div> 
    </div> -->
  </section>
  `,
})
export class QuickAccessComponent {
  protected lang = inject(LanguageService);
  private cartService = inject(CartService);

  readonly orderActions = [
    { label: 'Cart', icon: 'shopping_cart', badge: 0 },
    { label: 'Order History', icon: 'receipt_long', badge: undefined },
    { label: 'Quote History', icon: 'request_quote', badge: undefined },
  ];

  readonly helpActions = [
    { label: 'Track Shipment', icon: 'local_shipping' },
    { label: 'Part Number Checker', icon: 'qr_code_scanner' },
    { label: 'Free CAD Download', icon: 'view_in_ar' },
  ];
}
