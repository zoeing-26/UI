import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
  <footer class="mt-10 border-t border-gray-200 dark:border-gray-700">

    <!-- News Ticker -->
    <div class="bg-zoeing-navy text-white overflow-hidden py-2 flex items-center gap-3">
      <span class="shrink-0 bg-zoeing-gold text-zoeing-navy-dark text-[11px] font-bold px-3 py-1 ml-3">NEWS</span>
      <div class="overflow-hidden flex-1">
        <p class="animate-ticker text-sm whitespace-nowrap">
          Instant quotes available — submit your BOM and get competitive pricing within 24 hours &nbsp;&nbsp;|&nbsp;&nbsp;
          Economy Series: Factory automation components at up to 50% below standard market price &nbsp;&nbsp;|&nbsp;&nbsp;
          Free 3D CAD downloads on select products — compatible with STEP, IGES, and DXF formats &nbsp;&nbsp;|&nbsp;&nbsp;
          In-stock items ship same day — free ground delivery across India on Economy Series orders &nbsp;&nbsp;|&nbsp;&nbsp;
          Technical support available for product selection, specifications, and custom requirements
        </p>
      </div>
    </div>

    <!-- Payment Methods -->
    <!--<div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-5 px-4">
      <div class="max-w-screen-xl mx-auto">
        <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span class="material-icons text-sm text-zoeing-navy">payment</span>
          {{ lang.t('payment_methods') }}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          @for (method of paymentMethods; track method.title) {
            <div>
              <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{{ method.title }}</p>
              <div class="flex flex-wrap gap-1.5">
                @for (card of method.cards; track card) {
                  <span class="text-[10px] border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-medium">
                    {{ card }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div> -->

    <!-- Main Footer Links -->
    <div class="bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div class="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        @for (col of footerColumns; track col.title) {
          <div>
            <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              {{ col.title }}
            </h4>
            <ul class="space-y-2">
              @for (link of col.links; track link.label) {
                <li>
                  <a
                    [routerLink]="link.route ?? null"
                    class="text-sm text-gray-500 dark:text-gray-400 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors flex items-center gap-1 cursor-pointer">
                    @if (link.external) {
                      <span class="material-icons text-xs">open_in_new</span>
                    } @else {
                      ›
                    }
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <div class="max-w-screen-xl mx-auto mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          @for (social of socials; track social.label) {
            <button
              class="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              [style.background]="social.color"
              [title]="social.label"
            >
              <span class="material-icons text-white text-lg">{{ social.icon }}</span>
            </button>
          }
        </div>

        <p class="text-xs text-gray-400 dark:text-gray-500 text-center">
          © {{ year }} ZOIENG Global Pvt. Ltd. All rights reserved.
        </p>

        <div class="text-xs text-gray-500 dark:text-gray-400 text-right">
          <p class="font-semibold text-gray-700 dark:text-gray-200">ZOIENG Global Contact</p>
          <p>📞 1800-XXX-XXXX &nbsp;|&nbsp; ✉ support&#64;zoieng.com</p>
        </div>
      </div>
    </div>
  </footer>
  `,
})
export class FooterComponent {
  protected lang = inject(LanguageService);
  readonly year = new Date().getFullYear();

  readonly paymentMethods = [
    { title: 'Credit Card', cards: ['Amex', 'Diners', 'Mastercard', 'RuPay'] },
    { title: 'Debit Card', cards: ['Visa', 'Mastercard', 'Maestro', 'RuPay'] },
    { title: 'Net Banking', cards: ['SBI', 'ICICI', 'HDFC', 'Axis', 'Kotak'] },
    { title: 'UPI', cards: ['BHIM', 'PhonePe', 'GPay', 'Paytm', 'WhatsApp Pay'] },
    { title: 'Cheque on Delivery', cards: ['Existing Customers Only'] },
    { title: 'Online Payment', cards: ['QR Code Available'] },
  ];

  readonly footerColumns = [
    { title: 'Customer Service', links: [
      { label: 'Register',        route: '/register',  external: false },
      { label: 'How To Use',      route: null,         external: false },
      { label: 'Catalog Request', route: null,         external: false },
      { label: 'Inquiry',         route: null,         external: false },
      { label: 'Sitemap',         route: null,         external: false },
    ] },
    { title: 'My Account', links: [
      { label: 'Request a Quote', route: '/quote',     external: false },
      { label: 'Cart',            route: '/cart',      external: false },
      { label: 'Order History',   route: null,         external: false },
      { label: 'Quote History',   route: null,         external: false },
    ] },
    { title: 'About ZOIENG', links: [
      { label: 'Company Profile', route: '/about',     external: false },
      { label: 'Code of Conduct', route: null,         external: true  },
      { label: 'Privacy Policy',  route: null,         external: false },
      { label: 'Terms of Use',    route: null,         external: false },
      { label: 'Eco-Friendly',    route: null,         external: true  },
      { label: 'RoHS Information',route: null,         external: false },
    ] },
    { title: 'Related Sites', links: [
      { label: 'ZOIENG Group Inc.',         route: null,          external: true  },
      { label: 'Country/Region/Language',   route: null,          external: true  },
      { label: 'Technical Data',            route: '/inventory',  external: false },
      { label: 'Technical Tutorial',        route: null,          external: true  },
    ] },
  ];

  readonly socials = [
    { label: 'Facebook', icon: 'facebook', color: '#1877f2' },
    { label: 'LinkedIn', icon: 'link', color: '#0a66c2' },
    { label: 'YouTube', icon: 'smart_display', color: '#ff0000' },
    { label: 'Instagram', icon: 'photo_camera', color: '#e1306c' },
  ];
}
