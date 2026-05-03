import {
  Component, ChangeDetectionStrategy, inject, signal,
  HostListener, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';

interface NavItem { label: string; key: string; link: string; hasDropdown?: boolean; badge?: string; badgeColor?: string; }
interface SearchResult { id: string; name: string; price: number; }

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <header class="sticky-header shadow-md" [class.scrolled]="isScrolled()">

    <!-- ROW 1: Top Bar -->
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div class="max-w-screen-xl mx-auto flex items-center gap-3 flex-wrap md:flex-nowrap">

        <!-- ZOIENG Logo -->
        <a routerLink="/" class="flex flex-col items-start shrink-0 mr-2" aria-label="ZOIENG Home">
          <div class="flex items-center gap-2">
            <!-- Z square mark -->
            <span class="w-9 h-9 rounded-md bg-zoeing-navy text-white flex items-center justify-center font-display font-black text-xl shadow-md">
              Z
            </span>
            <span class="font-display font-black text-2xl tracking-tight text-zoeing-navy dark:text-white lowercase">
              zoieng
            </span>
          </div>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap mt-0.5 ml-11">
            {{ lang.t('tagline') }}
          </span>
        </a>

        <!-- Search Bar -->
        <div class="flex-1 flex items-center min-w-0 relative">
          <input
            type="text"
            class="w-full border border-gray-300 dark:border-gray-600 rounded-l-md px-4 py-2 text-sm
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                   focus:outline-none focus:border-zoeing-navy focus:ring-1 focus:ring-zoeing-navy"
            [placeholder]="lang.t('search_placeholder')"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            (keyup.enter)="triggerSearch()"
          />
          <button
            class="bg-zoeing-navy hover:bg-zoeing-navy-light text-white px-4 py-2 rounded-r-md border border-zoeing-navy transition-colors flex items-center gap-1"
            (click)="triggerSearch()"
          >
            <span class="material-icons text-sm">search</span>
            <span class="hidden sm:inline text-sm font-medium">Search</span>
          </button>

          @if (searchResults().length > 0 && searchQuery.length > 1) {
            <div class="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-md shadow-lg z-50 animate-fade-slide">
              @for (item of searchResults(); track item.id) {
                <div class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="material-icons text-gray-400 text-sm">inventory_2</span>
                  <div>
                    <p class="text-sm text-gray-800 dark:text-gray-100">{{ item.name }}</p>
                    <p class="text-xs text-zoeing-blue dark:text-zoeing-gold font-semibold">₹{{ item.price | number }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Right actions -->
        <div class="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <a routerLink="/cart" class="relative flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors p-1">
            <span class="material-icons text-xl">shopping_cart</span>
            @if (cartCount() > 0) {
              <span class="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {{ cartCount() > 99 ? '99+' : cartCount() }}
              </span>
            }
            <span class="text-[10px] hidden md:block">{{ lang.t('cart') }}</span>
          </a>

          <a routerLink="/orders" class="hidden md:flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors p-1">
            <span class="material-icons text-xl">receipt_long</span>
            <span class="text-[10px]">Orders</span>
          </a>

          <a routerLink="/quotes" class="hidden md:flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors p-1">
            <span class="material-icons text-xl">request_quote</span>
            <span class="text-[10px]">Quotes</span>
          </a>

          <button class="hidden md:flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors p-1">
            <span class="material-icons text-xl">headset_mic</span>
            <span class="text-[10px]">{{ lang.t('support') }}</span>
          </button>

          <a routerLink="/login" class="btn-primary text-xs px-3 py-1.5 hidden sm:flex">
            <span class="material-icons text-sm">person</span>
            {{ lang.t('login') }}
          </a>

          <button
            class="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            (click)="theme.toggle()"
            [title]="theme.isDark() ? 'Light Mode' : 'Dark Mode'"
          >
            @if (theme.isDark()) {
              <span class="material-icons text-lg">light_mode</span>
            } @else {
              <span class="material-icons text-lg">dark_mode</span>
            }
          </button>

          <div class="flex items-center gap-1 text-xs border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1">
            <button
              class="font-medium transition-colors"
              [class]="lang.lang() === 'en' ? 'text-zoeing-navy dark:text-zoeing-gold' : 'text-gray-400'"
              (click)="setLang('en')"
            >EN</button>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <button
              class="font-medium transition-colors"
              [class]="lang.lang() === 'hi' ? 'text-zoeing-navy dark:text-zoeing-gold' : 'text-gray-400'"
              (click)="setLang('hi')"
            >हि</button>
          </div>

          <button class="hidden lg:flex text-xs text-gray-600 dark:text-gray-300 items-center gap-0.5">
            {{ lang.t('other') }}
            <span class="material-icons text-sm">expand_more</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ROW 2: Primary Nav -->
    <nav class="bg-zoeing-primary dark:bg-zoeing-primary-dark">
      <div class="max-w-screen-xl mx-auto flex items-center">

        <button
          class="md:hidden text-white px-4 py-3 flex items-center gap-2 hover:bg-zoeing-primary-light transition-colors"
          (click)="toggleMobileMenu()"
        >
          <span class="material-icons">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
          <span class="text-sm font-medium">Menu</span>
        </button>

        <div class="hidden md:flex items-center flex-1">

          <a
            routerLink="/"
            routerLinkActive="bg-zoeing-primary-dark text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-1.5 px-4 py-3 text-gray-200 text-sm font-semibold hover:bg-zoeing-primary-light hover:text-white transition-colors"
          >
            <span class="material-icons text-base">home</span>
            Home
          </a>

          @for (item of navItems; track item.key) {
            <a [routerLink]="item.link"
              routerLinkActive="bg-zoeing-primary-dark text-white"
              [routerLinkActiveOptions]="{ exact: item.link !== '/manufacturers' }"
              class="flex items-center gap-1 px-3 py-3 text-gray-200 text-sm font-medium hover:bg-zoeing-primary-light hover:text-white transition-colors whitespace-nowrap">
              {{ item.label }}
              @if (item.badge) {
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1"
                      [class]="item.badgeColor || 'bg-red-600 text-white'">
                  {{ item.badge }}
                </span>
              }
              @if (item.hasDropdown) {
                <span class="material-icons text-xs">expand_more</span>
              }
            </a>
          }
        </div>

        <a routerLink="/quote" [queryParams]="{fresh: '1'}"
           class="ml-auto flex items-center gap-1.5 bg-zoeing-secondary text-white font-bold text-sm px-4 py-3 hover:bg-zoeing-secondary-dark transition-colors shrink-0">
          <span class="material-icons text-sm">description</span>
          {{ lang.t('quote_order') }}
        </a>
      </div>

      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-zoeing-primary-dark border-t border-zoeing-primary-light animate-fade-slide">
          <a
            routerLink="/"
            (click)="closeMobileMenu()"
            class="w-full block text-left px-6 py-3 text-gray-200 text-sm border-b border-zoeing-primary-light hover:bg-zoeing-primary-light hover:text-white transition-colors flex items-center gap-2"
          >
            <span class="material-icons text-sm">home</span>
            Home
          </a>
          <div class="border-t border-zoeing-primary-light">
            @for (item of navItems; track item.key) {
              <a [routerLink]="item.link"
                routerLinkActive="bg-zoeing-primary-dark text-white"
                [routerLinkActiveOptions]="{ exact: item.link !== '/manufacturers' }"
                (click)="closeMobileMenu()"
                class="w-full block text-left px-6 py-3 text-gray-200 text-sm border-b border-zoeing-primary-light hover:bg-zoeing-primary-light hover:text-white transition-colors">
                {{ item.label }}
              </a>
            }
          </div>
        </div>
      }
    </nav>

  </header>
  `,
})
export class HeaderComponent implements OnInit {
  protected theme = inject(ThemeService);
  protected lang = inject(LanguageService);
  protected cart = inject(CartService);
  protected auth = inject(AuthService);
  private productService = inject(ProductService);

  searchQuery = '';
  searchResults = signal<SearchResult[]>([]);
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  private searchSubject = new Subject<string>();
  readonly cartCount = this.cart.count;


  readonly navItems: NavItem[] = [
    { label: 'Products', key: 'products', link: '/inventory' },
    { label: 'Manufacturers', key: 'manufacturers', link: '/manufacturers' },
    { label: 'Inventory', key: 'inventory', link: '/inventory' },
    { label: 'About', key: 'about', link: '/about' },
  ];


  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length > 1) {
        this.productService.searchProducts(q, 6).subscribe({
          next: products => this.searchResults.set(products.map(p => ({ id: p.id, name: p.name, price: p.price }))),
          error: () => this.searchResults.set([]),
        });
      } else {
        this.searchResults.set([]);
      }
    });
  }

  @HostListener('window:scroll') onScroll(): void { this.isScrolled.set(window.scrollY > 60); }

  onSearchInput(): void { this.searchSubject.next(this.searchQuery); }
  triggerSearch(): void { this.searchResults.set([]); }
  setLang(l: 'en' | 'hi'): void { this.lang.setLanguage(l); }
  toggleMobileMenu(): void { this.mobileMenuOpen.set(!this.mobileMenuOpen()); }
  closeMobileMenu(): void { this.mobileMenuOpen.set(false); }
}
