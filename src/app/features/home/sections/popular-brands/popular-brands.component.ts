import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language.service';

interface BrandCard { name: string; bg: string; text: string; border?: string; }

@Component({
  selector: 'app-popular-brands',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <section class="my-6">
    <h2 class="section-title">{{ lang.t('popular_brand') }}</h2>

    <!-- Infinite left-to-right marquee -->
    <div class="overflow-hidden" (mouseenter)="paused = true" (mouseleave)="paused = false">
      <div
        class="flex gap-3 w-max"
        [style.animation]="'brandScroll 30s linear infinite'"
        [style.animation-play-state]="paused ? 'paused' : 'running'"
      >
        <!-- Render twice for seamless loop -->
        @for (brand of brands; track brand.name + '1') {
          <div
            class="brand-card shrink-0 flex flex-col items-center justify-center rounded-lg px-5 py-3 cursor-pointer"
            [style.background]="brand.bg"
            [style.color]="brand.text"
            [style.border]="brand.border ?? '1px solid var(--border)'"
          >
            <span class="font-display font-black text-base whitespace-nowrap">{{ brand.name }}</span>
          </div>
        }
        @for (brand of brands; track brand.name + '2') {
          <div
            class="brand-card shrink-0 flex flex-col items-center justify-center rounded-lg px-5 py-3 cursor-pointer"
            [style.background]="brand.bg"
            [style.color]="brand.text"
            [style.border]="brand.border ?? '1px solid var(--border)'"
            aria-hidden="true"
          >
            <span class="font-display font-black text-base whitespace-nowrap">{{ brand.name }}</span>
          </div>
        }
      </div>
    </div>
  </section>
  `,
  styles: [`
    @keyframes brandScroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `],
})
export class PopularBrandsComponent {
  protected lang = inject(LanguageService);
  paused = false;

  readonly brands: BrandCard[] = [
    { name: 'Zoieng economy',     bg: '#D97706', text: '#ffffff' },
    { name: 'Schneider Electric', bg: '#3dcd58', text: '#ffffff' },
    { name: 'OrientalMotor',      bg: '#ff6b00', text: '#ffffff' },
    { name: 'Mitutoyo',           bg: '#cc0000', text: '#ffffff' },
    { name: 'SCHMALZ',            bg: '#003087', text: '#ffffff' },
    { name: 'OMRON',              bg: '#1a1a1a', text: '#cc0000' },
    { name: 'KHK Stock Gears',    bg: '#cc0000', text: '#ffffff' },
    { name: 'SMC',                bg: '#e0e0e0', text: '#003087' },
    { name: 'KOGANEI',            bg: '#003087', text: '#D97706' },
    { name: 'Mitsuboshi',         bg: '#1a1a1a', text: '#ffffff' },
    { name: 'NIC AUTOTEC',        bg: '#f0f0f0', text: '#1a1a1a' },
    { name: 'Miki Pulley',        bg: '#003087', text: '#ffffff' },
  ];
}
