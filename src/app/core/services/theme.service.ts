import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { SafeStorageService } from './safe-storage.service';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(SafeStorageService);
  private readonly STORAGE_KEY = 'zoieng_theme';

  // Dark is the site default (business decision); an explicit user choice
  // saved in localStorage always wins over the default.
  private _theme = signal<Theme>('dark');

  /** Public read-only signal */
  readonly theme = this._theme.asReadonly();

  /** Derived: is dark mode active? */
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.init();
    // Side-effect: sync DOM whenever theme changes (browser only)
    effect(() => {
      const dark = this.isDark();
      const doc = this.storage.doc;
      if (!doc) return; // server render — nothing to sync
      doc.documentElement.classList.toggle('dark', dark);
      doc.documentElement.setAttribute('data-theme', this._theme());
    });
  }

  /**
   * Initialize from localStorage; dark is the default when nothing is saved.
   * (The old system-preference fallback was removed — the business wants a
   * consistent dark-first look, and the user can still switch to light.)
   */
  init(): void {
    const saved = this.storage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      this._theme.set(saved);
      return;
    }
    this._theme.set('dark');
  }

  /** Toggle between light and dark */
  toggle(): void {
    this._theme.update(t => (t === 'light' ? 'dark' : 'light'));
    this.storage.setItem(this.STORAGE_KEY, this._theme());
  }

  /** Explicitly set theme */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.storage.setItem(this.STORAGE_KEY, theme);
  }
}
