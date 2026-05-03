import {
  Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrCurrencyPipe } from '../../../../shared/pipes/inr-currency.pipe';
import { LanguageService } from '../../../../core/services/language.service';

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
  <div class="relative overflow-hidden rounded-none w-full min-h-96"
       (mouseenter)="pauseAuto()" (mouseleave)="resumeAuto()">

    <!-- Slides -->
    @for (slide of slides; track slide.id; let i = $index) {
      <div
        class="absolute inset-0 transition-opacity duration-700 flex flex-col w-full h-full bg-contain bg-right bg-no-repeat"
        [class.opacity-100]="current() === i"
        [class.opacity-0]="current() !== i"
        [class.pointer-events-none]="current() !== i"
        [style.background-image]="'url(' + slide.image + ')'"
      >
        <!-- Dark overlay for text readability -->
        <div class="absolute inset-0" [style.background]="slide.bgColor"></div>
        
        <!-- Content Section (Text Above) -->
        <div class="relative flex-shrink-0 px-10 md:px-16 pt-10 pb-6 z-10">
          <!-- Eyebrow -->
          <p class="text-xs font-semibold tracking-widest uppercase mb-2 opacity-70"
             [style.color]="slide.titleColor">
            {{ slide.eyebrow }}
          </p>

          <!-- Title -->
          <h2 class="font-display font-black text-4xl md:text-5xl leading-none mb-3"
              [style.color]="slide.titleColor">
            {{ slide.title }}
          </h2>

          @if (slide.subtitle) {
            <p class="text-sm text-gray-300 mb-3 max-w-md">{{ slide.subtitle }}</p>
          }

          <!-- Bullets -->
          <ul class="mb-5 space-y-1">
            @for (b of slide.bullets; track b) {
              <li class="flex items-center gap-2 text-sm text-gray-200">
                <span class="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      [style.background]="slide.accentColor ?? '#D97706'">
                  <span class="material-icons text-[10px] text-black">check</span>
                </span>
                {{ b }}
              </li>
            }
          </ul>

          <!-- CTAs -->
          <div class="flex items-center gap-3 flex-wrap">
            @if (slide.ctaLabel) {
              <button class="btn-yellow font-bold text-sm px-5 py-2.5 rounded">
                {{ slide.ctaLabel }}
                @if (slide.ctaPrice) {
                  {{ slide.ctaPrice | inrCurrency:true }}
                }
              </button>
            }
            @if (slide.ctaSecondary) {
              <button class="text-white border border-white/50 hover:border-white text-sm px-4 py-2.5 rounded transition-colors">
                {{ slide.ctaSecondary }} ›
              </button>
            }
          </div>

          <!-- Footer tags -->
          @if (slide.footerTags?.length) {
            <div class="flex gap-3 mt-4">
              @for (tag of slide.footerTags; track tag) {
                <span class="flex items-center gap-1 text-[11px] text-gray-300 bg-white/10 px-2 py-1 rounded">
                  <span class="material-icons text-[12px]" [style.color]="slide.accentColor ?? '#D97706'">check_circle</span>
                  {{ tag }}
                </span>
              }
            </div>
          }
        </div>

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
    <!-- Dot navigation -->
    <div class="absolute bottom-4 right-4 flex gap-2 z-10">
      @for (slide of slides; track slide.id; let i = $index) {
        <button
          class="w-2.5 h-2.5 rounded-full transition-all duration-300"
          [class]="current() === i ? 'bg-zoeing-secondary scale-125' : 'bg-white/40 hover:bg-white/70'"
          (click)="goTo(i)"
          [attr.aria-label]="'Slide ' + (i+1)"
        ></button>
      }
    </div>

    <!-- Prev/Next arrows -->
    <button
      class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors z-10"
      (click)="prev()"
    >
      <span class="material-icons text-lg">chevron_left</span>
    </button>
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors z-10"
      (click)="next()"
    >
      <span class="material-icons text-lg">chevron_right</span>
    </button>
  </div>
  `,
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  protected lang = inject(LanguageService);
  current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  readonly slides: Slide[] = [
    {
      id: 1,
      image: '/assets/images/linear-motor-actuators.jpg',
      bgColor: 'linear-gradient(135deg, rgba(10, 10, 10, 0.7) 0%, rgba(26, 26, 46, 0.8) 100%)',
      eyebrow: 'Zoieng economy',
      title: 'LINEAR MOTOR ACTUATORS',
      titleColor: '#D97706',
      bullets: ['High speed up to 2m/s', 'High repeatability ±5 microns or ±2 microns', 'Long lifetime up to 50,000 hours'],
      ctaLabel: 'Starting Price',
      ctaPrice: 12264,
      ctaSecondary: 'Know More',
      extraBadge: 'Zoieng QCT Model',
      footerTags: ['HIGH QUALITY', 'LOW COST', 'QUICK DELIVERY'],
      accentColor: '#D97706',
    },
    {
      id: 2,
      image: '/assets/images/tapered-pin-set.jpg',
      bgColor: 'linear-gradient(135deg, rgba(15, 15, 26, 0.7) 0%, rgba(26, 10, 10, 0.8) 100%)',
      badge: 'Competitive Price\nSave 40%\nfrom Standard',
      badgeColor: '#dc2626',
      eyebrow: 'Zoieng economy',
      title: 'Zoieng TAPERED PIN SET',
      titleColor: '#D97706',
      bullets: ['Angle of tapered shape(°): 1, 3, 5', 'Outer diameter: 13 to 30 mm', 'Components: Set'],
      ctaLabel: 'Starting Price',
      ctaPrice: 450,
      ctaSecondary: 'Know More',
      footerTags: ['Free Ground Delivery', 'Technical Support'],
      accentColor: '#D97706',
    },
    {
      id: 3,
      image: '/assets/images/small-ac-motors.jpg',
      bgColor: 'linear-gradient(135deg, rgba(17, 17, 17, 0.7) 0%, rgba(26, 26, 0, 0.8) 100%)',
      eyebrow: 'Zoieng economy | Half Price, Zoieng Quality',
      title: 'Small AC Motors',
      titleColor: '#D97706',
      subtitle: 'Compact power solutions for reliable and efficient motion control.',
      bullets: ['A wide variety of options for every application need', 'Stable performance with low noise and long service life'],
      ctaSecondary: 'Know More',
      accentColor: '#D97706',
    },
    {
      id: 4,
      image: '/assets/images/industrial-conveyor-belts.jpg',
      bgColor: 'linear-gradient(135deg, rgba(13, 26, 13, 0.7) 0%, rgba(10, 26, 26, 0.8) 100%)',
      badge: 'NEW\nPRODUCT',
      badgeColor: '#dc2626',
      eyebrow: 'Zoieng economy',
      title: 'Industrial Conveyor Belts',
      titleColor: '#D97706',
      subtitle: 'Streamline Your Production with industrial conveyor belts',
      bullets: ['Minimize design & assembly effort', 'Adaptable to any production setup', 'Complete synchronous ready to deploy'],
      ctaSecondary: 'Know More',
      footerTags: ['Free Ground Delivery', 'Technical Support', '3D CAD Free Download'],
      accentColor: '#D97706',
    },
    {
      id: 5,
      image: '/assets/images/ball-bearings-guides.jpg',
      bgColor: 'linear-gradient(135deg, rgba(26, 0, 0, 0.7) 0%, rgba(10, 10, 26, 0.8) 100%)',
      eyebrow: 'Zoieng economy',
      title: 'BALL BEARINGS & GUIDES',
      titleColor: '#F59E0B',
      subtitle: 'Precision-engineered for demanding industrial environments.',
      bullets: ['Stainless steel and chrome steel options', 'Deep groove and angular contact types', 'Sizes from 3mm to 200mm bore'],
      ctaLabel: 'Starting Price',
      ctaPrice: 71,
      ctaSecondary: 'Know More',
      accentColor: '#F59E0B',
    },
    {
      id: 6,
      image: '/assets/images/aluminum-extrusion-frames.webp',
      bgColor: 'linear-gradient(135deg, rgba(10, 26, 10, 0.7) 0%, rgba(26, 26, 10, 0.8) 100%)',
      eyebrow: 'Zoieng economy',
      title: 'ALUMINUM EXTRUSION FRAMES',
      titleColor: '#D97706',
      subtitle: 'Build robust, modular machine structures with ease.',
      bullets: ['6 & 8 series profiles available', 'Compatible with standard accessories', 'Cut-to-length available on order'],
      ctaLabel: 'Starting Price',
      ctaPrice: 299,
      ctaSecondary: 'Know More',
      footerTags: ['Free Ground Delivery', '3D CAD Free Download'],
      accentColor: '#D97706',
    },
  ];

  ngOnInit(): void { this.startAuto(); }
  ngOnDestroy(): void { clearInterval(this.timer); }

  startAuto(): void {
    this.timer = setInterval(() => this.next(), 5000);
  }

  pauseAuto(): void { clearInterval(this.timer); }
  resumeAuto(): void { this.startAuto(); }

  next(): void { this.current.update(c => (c + 1) % this.slides.length); }
  prev(): void { this.current.update(c => (c - 1 + this.slides.length) % this.slides.length); }
  goTo(i: number): void { this.current.set(i); }
}
