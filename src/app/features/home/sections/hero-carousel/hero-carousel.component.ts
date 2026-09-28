import {
  Component, ChangeDetectionStrategy, NgZone, OnInit, OnDestroy, signal, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrCurrencyPipe } from '../../../../shared/pipes/inr-currency.pipe';
import { LanguageService } from '../../../../core/services/language.service';
import { SafeStorageService } from '../../../../core/services/safe-storage.service';

interface Slide {
  id: number;
  image: string;
  bgColor: string;
  badge?: string;
  badgeColor?: string;
  eyebrow: string;
  title: string;
  titleColor: string;
  subtitle?: string;
  bullets: string[];
  ctaLabel?: string;
  ctaPrice?: number;
  ctaSecondary?: string;
  extraBadge?: string;
  footerTags?: string[];
  accentColor?: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
  <div
    class="relative overflow-hidden w-full aspect-video bg-gray-100 dark:bg-gray-800"
    role="region"
    aria-roledescription="carousel"
    aria-label="Featured products"
    (mouseenter)="pauseAuto()" (mouseleave)="resumeAuto()">

    <!-- Slides — container keeps the source images' 16:9 ratio so nothing is cropped -->
    @for (slide of slides; track slide.id; let i = $index) {
      <div
        class="absolute inset-0 transition-opacity duration-700 w-full h-full bg-cover bg-center bg-no-repeat"
        role="group"
        [attr.aria-label]="'Slide ' + (i + 1) + ' of ' + slides.length"
        [attr.aria-hidden]="current() !== i"
        [class.opacity-100]="current() === i"
        [class.opacity-0]="current() !== i"
        [class.pointer-events-none]="current() !== i"
        [style.background-image]="'url(' + slide.image + ')'"
      >
        <!-- Image-only slide: no gradient overlay, no text, no extra UI treatment -->

        <!-- Badge (e.g. "Save 40%") -->
        @if (slide.badge) {
          <div class="absolute top-1/2 right-10 w-20 h-20 rounded-full flex flex-col items-center justify-center text-center text-[10px] font-bold leading-tight z-20"
               [style.background]="slide.badgeColor ?? '#dc2626'"
               style="color: white;">
            {{ slide.badge }}
          </div>
        }

        <!-- Extra corner badge -->
        @if (slide.extraBadge) {
          <div class="absolute top-12 right-16 text-right z-10">
            <span class="text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ slide.extraBadge }}</span>
          </div>
        }
      </div>
    }
    <!-- Dot navigation — 32px tap targets with the small visual dot inside -->
    <div class="absolute bottom-2 right-2 flex gap-1 z-10">
      @for (slide of slides; track slide.id; let i = $index) {
        <button
          class="w-8 h-8 flex items-center justify-center"
          (click)="goTo(i)"
          [attr.aria-label]="'Go to slide ' + (i+1)"
          [attr.aria-current]="current() === i"
        >
          <span
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            [class]="current() === i ? 'bg-zoeing-secondary scale-125' : 'bg-white/40 hover:bg-white/70'"
          ></span>
        </button>
      }
    </div>

    <!-- Prev/Next arrows — 44px touch targets -->
    <button
      class="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors z-10"
      (click)="prev()"
      aria-label="Previous slide"
    >
      <span class="material-icons text-lg">chevron_left</span>
    </button>
    <button
      class="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors z-10"
      (click)="next()"
      aria-label="Next slide"
    >
      <span class="material-icons text-lg">chevron_right</span>
    </button>
  </div>
  `,
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  protected lang = inject(LanguageService);
  private browser = inject(SafeStorageService);
  private zone = inject(NgZone);
  current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  readonly slides: Slide[] = [
    {
      id: 1,
      image: '/assets/images/coneryor%20belt.png',
      bgColor: 'transparent',
      eyebrow: '',
      title: '',
      titleColor: '#000000',
      subtitle: '',
      bullets: [],
      ctaSecondary: '',
      footerTags: [],
      accentColor: '#000000',
    },
    {
      id: 2,
      image: '/assets/images/electrical%20and%20instrument.png',
      bgColor: 'transparent',
      eyebrow: '',
      title: '',
      titleColor: '#000000',
      subtitle: '',
      bullets: [],
      ctaSecondary: '',
      footerTags: [],
      accentColor: '#000000',
    },
    {
      id: 3,
      image: '/assets/images/Industrial%20pneumatics.png',
      bgColor: 'transparent',
      eyebrow: '',
      title: '',
      titleColor: '#000000',
      subtitle: '',
      bullets: [],
      ctaSecondary: '',
      footerTags: [],
      accentColor: '#000000',
    },
    {
      id: 4,
      image: '/assets/images/mech%20fastnening.png',
      bgColor: 'transparent',
      badge: 'NEW\nPRODUCT',
      badgeColor: '#dc2626',
      eyebrow: '',
      title: '',
      titleColor: '#000000',
      subtitle: '',
      bullets: [],
      ctaSecondary: '',
      footerTags: [],
      accentColor: '#000000',
    },
    {
      id: 5,
      image: '/assets/images/Oil%20%20%26%20grease.png',
      bgColor: 'transparent',
      eyebrow: '',
      title: '',
      titleColor: '#000000',
      subtitle: '',
      bullets: [],
      ctaSecondary: '',
      footerTags: [],
      accentColor: '#000000',
    },
    {
      id: 6,
      image: '/assets/images/power%20transmission.png',
      bgColor: 'transparent',
      eyebrow: '',
      title: '',
      titleColor: '#000000',
      subtitle: '',
      bullets: [],
      ctaSecondary: '',
      footerTags: [],
      accentColor: '#000000',
    },
  ];

  ngOnInit(): void {
    // SSR: timers are browser-only — the interval is purely visual
    if (!this.browser.inBrowser) return;
    this.startAuto();
  }
  ngOnDestroy(): void { clearInterval(this.timer); }

  startAuto(): void {
    if (!this.browser.inBrowser) return;
    // A live interval keeps zone.js permanently unstable, which blocks
    // hydration (NG0506) — keep the TIMER outside the zone. Each state write
    // re-enters the zone: signal writes made outside it don't schedule
    // change detection in zone.js apps.
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => this.zone.run(() => this.next()), 5000);
    });
  }

  pauseAuto(): void { clearInterval(this.timer); }
  resumeAuto(): void { this.startAuto(); }

  next(): void { this.current.update(c => (c + 1) % this.slides.length); }
  prev(): void { this.current.update(c => (c - 1 + this.slides.length) % this.slides.length); }
  goTo(i: number): void { this.current.set(i); }
}
