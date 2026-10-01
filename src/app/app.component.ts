import {
  Component, ChangeDetectionStrategy, inject, signal, NgZone, OnDestroy, afterNextRender,
} from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './features/header/header.component';
import { FooterComponent } from './features/footer/footer.component';
import { BrandLoaderComponent } from './shared/components/brand-loader/brand-loader.component';
import { SafeStorageService } from './core/services/safe-storage.service';

/** Minimum time the splash stays up per screen (brand beat). */
const SPLASH_MIN_MS = 450;

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, BrandLoaderComponent],
  template: `
    @if (splash()) {
      <app-brand-loader [active]="splash()" />
    }
    <app-header />
    <router-outlet />
    <app-footer />
  `,
})
export class AppComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly storage = inject(SafeStorageService);

  /** Brand loader overlay: shown on boot and on every route change. */
  readonly splash = signal(true);

  private navSub?: { unsubscribe(): void };
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!this.storage.inBrowser) return; // SSR: static splash markup only

    // First paint: hide the splash after the app has rendered once (plus the
    // brand beat). Route changes are handled by the router subscription below.
    afterNextRender(() => {
      this.scheduleHide();
    });

    // Every navigation shows the loader again until the new screen lands.
    this.zone.runOutsideAngular(() => {
      this.navSub = this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.zone.run(() => this.splash.set(true));
        } else if (event instanceof NavigationEnd) {
          this.scheduleHide();
        }
      });
    });
  }

  /** Hide after the brand beat; timers outside zone, writes re-enter zone. */
  private scheduleHide(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.zone.runOutsideAngular(() => {
      this.hideTimer = setTimeout(() => {
        this.zone.run(() => this.splash.set(false));
      }, SPLASH_MIN_MS);
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
