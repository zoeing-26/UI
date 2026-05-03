import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'zoieng_theme';

  private _theme = signal<Theme>('light');

  /** Public read-only signal */
  readonly theme = this._theme.asReadonly();

  /** Derived: is dark mode active? */
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.init();
    // Side-effect: sync DOM whenever theme changes
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.setAttribute('data-theme', this._theme());
    });
  }

  /** Initialize from localStorage or system preference */
  init(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      this._theme.set(saved);
      return;
    }
    // Fallback to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._theme.set(prefersDark ? 'dark' : 'light');
  }

  /** Toggle between light and dark */
  toggle(): void {
    this._theme.update(t => (t === 'light' ? 'dark' : 'light'));
    localStorage.setItem(this.STORAGE_KEY, this._theme());
  }

  /** Explicitly set theme */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }
}
