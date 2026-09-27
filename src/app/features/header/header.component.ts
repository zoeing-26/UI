import {
  Component, ChangeDetectionStrategy, inject, signal, HostListener, OnInit, OnDestroy, afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

interface NavItem { label: string; key: string; link: string; hasDropdown?: boolean; badge?: string; badgeColor?: string; }

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <header class="sticky-header shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-md" [class.scrolled]="isScrolled()">

    <div class="border-b border-[#dfeaf1] bg-[#f4f6f8] px-3 py-2.5 sm:px-4 dark:border-gray-800 dark:bg-gray-900">
      <div class="mx-auto flex max-w-[1420px] flex-wrap items-center gap-2 sm:gap-3 md:flex-nowrap md:gap-4">

        <a routerLink="/" class="shrink-0" aria-label="ZOIENG Home">
          <img
            src="assets/ZO_Industrial_Engineering_Supplies_Transparent.svg"
            alt="ZOIENG"
            class="h-9 w-auto sm:h-10 md:h-[52px]"
          />
        </a>

        <div class="relative min-w-0 flex-1">
          <input
            type="text"
            class="w-full rounded-full border border-[#dfe5ec] bg-[#eef3f7] py-2 pl-3 pr-10 text-xs text-gray-900 placeholder:text-gray-500 focus:border-[#0b4d69] focus:outline-none focus:ring-2 focus:ring-[#0b4d69]/10 sm:py-2.5 sm:pl-4 sm:pr-12 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-zoeing-gold dark:focus:ring-zoeing-gold/20"
            [placeholder]="lang.t('search_placeholder')"
            [(ngModel)]="searchQuery"
            (keyup.enter)="triggerSearch()"
          />
          <button
            class="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#f5a63a] text-white shadow-[0_8px_16px_rgba(245,166,58,0.35)] transition hover:brightness-105 sm:h-9 sm:w-9"
            (click)="triggerSearch()"
            type="button"
            aria-label="Search products"
          >
            <span class="material-icons text-base">search</span>
          </button>
        </div>

        <div class="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#0b4d69] shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-amber-300 dark:hover:bg-white/20"
            (click)="theme.toggle()"
            [title]="theme.isDark() ? 'Light Mode' : 'Dark Mode'"
            type="button"
            aria-label="Toggle theme"
          >
            @if (theme.isDark()) {
              <span class="material-icons text-lg">light_mode</span>
            } @else {
              <span class="material-icons text-lg">dark_mode</span>
            }
          </button>

          <a routerLink="/cart" class="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#1d2b36] shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/20">
            <span class="material-icons text-lg">shopping_cart</span>
            @if (cartCount() > 0) {
              <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d95431] text-[9px] font-bold text-white">
                {{ cartCount() > 99 ? '99+' : cartCount() }}
              </span>
            }
          </a>

          <a routerLink="/login" class="hidden items-center gap-1.5 rounded-full bg-[#f5a63a] px-3 py-2 text-xs font-bold text-white shadow-[0_10px_20px_rgba(245,166,58,0.28)] transition hover:brightness-105 sm:flex">
            <span class="material-icons text-sm">person</span>
            <span class="whitespace-nowrap">{{ lang.t('login') }}</span>
          </a>

          <button
            class="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#0b4d69] shadow-sm transition hover:bg-white md:hidden dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/20"
            (click)="toggleMobileMenu()"
            type="button"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Toggle mobile menu"
          >
            <span class="material-icons">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
          </button>

          <div class="hidden items-center gap-1 rounded-full border border-[#dfe5ec] bg-white/80 px-1.5 py-1 text-[11px] font-semibold text-[#1d2b36] md:flex dark:border-gray-700 dark:bg-white/10 dark:text-gray-100">
            <button class="rounded-full px-2 py-1" [class.text-[#0b4d69]="lang.lang() === 'en' && !theme.isDark()" [class.text-amber-300]="lang.lang() === 'en' && theme.isDark()" (click)="setLang('en')">EN</button>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <button class="rounded-full px-2 py-1" [class.text-[#0b4d69]="lang.lang() === 'hi' && !theme.isDark()" [class.text-amber-300]="lang.lang() === 'hi' && theme.isDark()" (click)="setLang('hi')">हि</button>
          </div>

          <button class="hidden items-center gap-1 rounded-full px-2.5 py-1.5 text-[#1d2b36] hover:bg-white/80 transition-colors md:flex dark:text-gray-100 dark:hover:bg-white/10">
            {{ lang.t('other') }}
            <span class="material-icons text-sm">expand_more</span>
          </button>
        </div>
      </div>
    </div>

    <nav class="bg-[#0b506d]">
      <div class="mx-auto flex max-w-[1420px] items-center px-2 md:px-0">
        @if (!isMobile()) {
          <div class="hidden flex-1 items-center md:flex">
            <a
              routerLink="/"
              routerLinkActive="bg-white/12 text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.5)]"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <span class="material-icons text-base">home</span>
              Home
            </a>

            @for (item of navItems; track item.key) {
              <a [routerLink]="item.link"
                routerLinkActive="bg-white/12 text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.5)]"
                [routerLinkActiveOptions]="{ exact: item.link !== '/manufacturers' }"
                class="flex items-center gap-1 whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white">
                {{ item.label }}
                @if (item.badge) {
                  <span class="ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold" [class]="item.badgeColor || 'bg-red-600 text-white'">{{ item.badge }}</span>
                }
                @if (item.hasDropdown) {
                  <span class="material-icons text-xs">expand_more</span>
                }
              </a>
            }
          </div>
        }

        <a routerLink="/quote" [queryParams]="{fresh: '1'}"
           class="ml-auto flex items-center gap-2 rounded-md bg-gradient-to-r from-[#f0a648] to-[#d88b32] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(216,139,50,0.3)] transition hover:brightness-110 md:rounded-l-md md:rounded-r-none">
          <span class="material-icons text-sm">description</span>
          {{ lang.t('quote_order') }}
        </a>
      </div>

      @if (mobileMenuOpen()) {
        <div class="md:hidden border-t border-white/10 bg-[#0a465d]">
          <a
            routerLink="/"
            (click)="closeMobileMenu()"
            class="flex w-full items-center gap-2 border-b border-white/10 px-6 py-3 text-left text-sm text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <span class="material-icons text-sm">home</span>
            Home
          </a>
          @for (item of navItems; track item.key) {
            <a [routerLink]="item.link"
              (click)="closeMobileMenu()"
              routerLinkActive="bg-white/10 text-white"
              [routerLinkActiveOptions]="{ exact: item.link !== '/manufacturers' }"
              class="block border-b border-white/10 px-6 py-3 text-left text-sm text-slate-200 hover:bg-white/10 hover:text-white"
            >
              {{ item.label }}
            </a>
          }
        </div>
      }
    </nav>
  </header>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected theme = inject(ThemeService);
  protected lang  = inject(LanguageService);
  protected cart  = inject(CartService);
  protected auth  = inject(AuthService);
  private router  = inject(Router);

  searchQuery    = '';
  isScrolled     = signal(false);
  isMobile       = signal(false);
  mobileMenuOpen = signal(false);

  readonly cartCount = this.cart.count;

  private navSub?: Subscription;

  constructor() {
    // Browser-only: correct mobile layout after hydration (ngOnInit does not
    // re-run for hydrated components, so resize alone would miss the initial state).
    afterNextRender(() => this.updateMobileState());
  }

  readonly navItems: NavItem[] = [
    { label: 'Manufacturers', key: 'manufacturers', link: '/manufacturers' },
    { label: 'Inventory',     key: 'inventory',     link: '/inventory' },
    { label: 'About',         key: 'about',         link: '/about' },
  ];

  ngOnInit(): void {
    this.updateMobileState();

    this.navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const tree = this.router.parseUrl(e.urlAfterRedirects);
        this.searchQuery = tree.queryParams['q'] ?? '';
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void { this.navSub?.unsubscribe(); }

  @HostListener('window:scroll') onScroll(): void { this.isScrolled.set(window.scrollY > 60); }

  @HostListener('window:resize') onResize(): void { this.updateMobileState(); }

  private updateMobileState(): void {
    // SSR guard: window is undefined during server rendering
    if (typeof window === 'undefined') return;
    this.isMobile.set(window.innerWidth < 1024);
    if (!this.isMobile()) {
      this.mobileMenuOpen.set(false);
    }
  }

  triggerSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/inventory'], { queryParams: { q } });
    }
  }

  setLang(l: 'en' | 'hi'): void { this.lang.setLanguage(l); }
  toggleMobileMenu(): void { this.mobileMenuOpen.set(!this.mobileMenuOpen()); }
  closeMobileMenu(): void { this.mobileMenuOpen.set(false); }
}
