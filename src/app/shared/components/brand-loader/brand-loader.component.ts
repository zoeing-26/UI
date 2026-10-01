import {
  Component, ChangeDetectionStrategy, input, signal, computed, inject, NgZone, OnDestroy,
} from '@angular/core';
import { SafeStorageService } from '../../../core/services/safe-storage.service';

/**
 * BrandLoaderComponent — full-screen brand splash used on every screen while
 * the app bootstraps / hydrates.
 *
 * Visual: dark navy sheet with the ZO monogram (solid Z + ring-shaped O).
 * Inside the O spins a small engine impeller — pure CSS `@keyframes` rotation
 * (no WAAPI, no transitions: both stall in the embedded preview).
 *
 * Dismissal: parent passes `active` (progress signal). While active, the
 * overlay covers the viewport; once false it unmounts entirely, so there is
 * no fade animation to get stuck in embedded contexts.
 *
 * Safety valve: a browser-only hard timeout (MAX_SPLASH_MS) hides the loader
 * even if the readiness signal never fires — the splash must never trap the
 * user. `MIN_SPLASH_MS` keeps the brand beat visible on fast connections.
 */
@Component({
  selector: 'app-brand-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-7 select-none"
        style="background: radial-gradient(circle at 50% 42%, #0D4C6A 0%, #0A3A52 46%, #04121A 100%);"
        role="status"
        [attr.aria-label]="label()"
      >
        <!-- ── ZO monogram: Z solid, O = ring with rotating engine ── -->
        <div class="flex items-center" [style.gap.px]="monogramGap()">
          <!-- Z -->
          <span
            class="font-display font-black leading-none"
            [style.fontSize.px]="glyphSize()"
            [style.color]="'#F59E0B'"
            [style.letterSpacing.px]="-2"
          >Z</span>

          <!-- O: ring + engine impeller spinning inside -->
          <span
            class="relative inline-flex items-center justify-center rounded-full"
            [style.width.px]="ringSize()"
            [style.height.px]="ringSize()"
            [style.marginLeft.px]="-6"
            style="border: 0.09em solid #E2E8F0;"
            [style.fontSize.px]="glyphSize()"
          >
            <!-- engine: hub + 5 blades, rotates forever (CSS keyframes) -->
            <svg
              class="zo-engine"
              [attr.width]="engineSize()"
              [attr.height]="engineSize()"
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="4.2" fill="#F59E0B" />
              <g fill="#E2E8F0">
                <path d="M20 20 L26.5 8.5 A12.6 12.6 0 0 0 20 7.4 Z" />
                <path d="M20 20 L33.2 15.4 A12.6 12.6 0 0 0 29.1 9.3 Z" transform="rotate(72 20 20)" />
                <path d="M20 20 L33.2 15.4 A12.6 12.6 0 0 0 29.1 9.3 Z" transform="rotate(144 20 20)" />
                <path d="M20 20 L33.2 15.4 A12.6 12.6 0 0 0 29.1 9.3 Z" transform="rotate(216 20 20)" />
                <path d="M20 20 L33.2 15.4 A12.6 12.6 0 0 0 29.1 9.3 Z" transform="rotate(288 20 20)" />
              </g>
            </svg>
          </span>
        </div>

        <!-- Wordmark -->
        <div class="flex flex-col items-center gap-1.5 text-center px-6">
          <span
            class="font-display font-black uppercase"
            [style.fontSize.px]="wordSize()"
            [style.letterSpacing.px]="3"
            [style.color]="'#F8FAFC'"
          >ZO-Industrial</span>
          <span
            class="font-mono uppercase"
            [style.fontSize.px]="subSize()"
            [style.letterSpacing.px]="4"
            [style.color]="'rgba(226,232,240,0.55)'"
          >Engineering Supplies</span>
        </div>

        <!-- Indeterminate rail -->
        <div
          class="overflow-hidden rounded-full"
          [style.width.px]="railWidth()"
          [style.height.px]="3"
          style="background: rgba(226,232,240,0.14);"
        >
          <div class="zo-rail h-full w-1/3 rounded-full" style="background: linear-gradient(90deg, #D97706, #F59E0B);"></div>
        </div>
      </div>
    }
  `,
  styles: [
    // Engine rotation — plain CSS keyframes only (preview-safe).
    '.zo-engine { animation: zo-engine-spin 1.15s linear infinite; transform-origin: 50% 50%; display: block; }',
    '@keyframes zo-engine-spin { to { transform: rotate(360deg); } }',
    // Rail sweep — also plain keyframes.
    '.zo-rail { animation: zo-rail-slide 1.3s ease-in-out infinite; }',
    '@keyframes zo-rail-slide { 0% { transform: translateX(-110%); } 100% { transform: translateX(330%); } }',
    '@media (prefers-reduced-motion: reduce) { .zo-engine, .zo-rail { animation: none; } }',
  ],
})
export class BrandLoaderComponent {
  /** Driven by the parent: truthy while the app is not ready. */
  readonly active = input(true);
  /** Accessibility label / screen-reader text. */
  readonly label = input('ZO-Industrial Engineering Supplies — loading');

  private readonly storage = inject(SafeStorageService);
  private readonly zone = inject(NgZone);

  /** Hard cap so a stuck readiness signal can never trap the user. */
  private static readonly MAX_SPLASH_MS = 4000;
  /** Keep the brand beat visible at least this long (fast loads included). */
  private static readonly MIN_SPLASH_MS = 450;

  private readonly bootedAt = Date.now();
  private readonly minElapsed = signal(false);
  private readonly forceHidden = signal(false);

  private minTimer: ReturnType<typeof setTimeout> | null = null;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Visible while the parent keeps `active` true; after it flips false the
   * splash lingers until MIN_SPLASH_MS has elapsed (brand beat on fast
   * loads). The hard cap overrides everything so the splash can never trap
   * the user, even if the readiness signal never fires.
   */
  readonly visible = computed(() =>
    !this.forceHidden() && (this.active() || !this.minElapsed()),
  );

  // Responsive sizing (SSR-safe via SafeStorageService.viewportWidth).
  readonly glyphSize = computed(() => {
    const w = this.storage.viewportWidth;
    return w < 420 ? 92 : w < 900 ? 108 : 124;
  });
  readonly ringSize = computed(() => Math.round(this.glyphSize() * 0.92));
  readonly engineSize = computed(() => Math.round(this.ringSize() * 0.56));
  readonly monogramGap = computed(() => Math.round(this.glyphSize() * 0.06));
  readonly wordSize = computed(() => Math.round(this.glyphSize() * 0.26));
  readonly subSize = computed(() => Math.max(10, Math.round(this.glyphSize() * 0.1)));
  readonly railWidth = computed(() => Math.round(this.ringSize() * 2.1));

  constructor() {
    if (!this.storage.inBrowser) return; // SSR: render static splash, no timers

    // Timers run OUTSIDE NgZone; each state write re-enters the zone so
    // OnPush change detection actually runs (zone-exit lesson from session).
    this.zone.runOutsideAngular(() => {
      this.minTimer = setTimeout(() => {
        this.zone.run(() => this.minElapsed.set(true));
      }, BrandLoaderComponent.MIN_SPLASH_MS);

      this.maxTimer = setTimeout(() => {
        this.zone.run(() => this.forceHidden.set(true));
      }, BrandLoaderComponent.MAX_SPLASH_MS);
    });
  }

  ngOnDestroy(): void {
    if (this.minTimer) clearTimeout(this.minTimer);
    if (this.maxTimer) clearTimeout(this.maxTimer);
  }
}
