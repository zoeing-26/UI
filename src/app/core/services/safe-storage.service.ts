import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * SafeStorageService — SSR-safe wrapper around browser-only globals.
 *
 * During server-side rendering there is no `window`, `localStorage`, or real
 * `document`. Every service/component that previously touched those globals
 * directly would crash the server render. Route all access through this
 * service: on the server the reads return `null` / defaults and the writes
 * are no-ops, so rendering completes and state stays client-only.
 */
@Injectable({ providedIn: 'root' })
export class SafeStorageService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  // ── localStorage ────────────────────────────────────────────────────────────

  getItem(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage full or blocked — ignore */
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  // ── window / document helpers ───────────────────────────────────────────────

  /** Viewport width, or a sensible default on the server. */
  get viewportWidth(): number {
    return this.isBrowser ? window.innerWidth : 1280;
  }

  /** True only in the browser — gate timers, observers, and media APIs with this. */
  get inBrowser(): boolean {
    return this.isBrowser;
  }

  /** Prefer-reduced-motion check; false on the server (animations allowed). */
  prefersReducedMotion(): boolean {
    if (!this.isBrowser) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Escape user-supplied URLs before assigning to `location`. */
  get origin(): string {
    return this.isBrowser ? window.location.origin : '';
  }

  /** `document` or `null` on the server — always null-check the result. */
  get doc(): Document | null {
    return this.isBrowser ? this.document : null;
  }
}
