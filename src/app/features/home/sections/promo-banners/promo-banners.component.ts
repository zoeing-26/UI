import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language.service';

interface PromoBanner {
  id: number;
  bg: string;
  textColor: string;
  tag?: string;
  tagColor?: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  icon: string;
}

@Component({
  selector: 'app-promo-banners',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
    @for (banner of banners; track banner.id) {
      <div
        class="rounded-lg p-4 flex flex-col gap-2 cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden relative min-h-[100px]"
        [style.background]="banner.bg"
      >
        @if (banner.tag) {
          <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded w-fit"
                [style.background]="banner.tagColor ?? '#16a34a'"
                style="color:white">
            {{ banner.tag }}
          </span>
        }
        <p class="font-display font-bold text-sm leading-snug" [style.color]="banner.textColor">
          {{ banner.title }}
        </p>
        @if (banner.subtitle) {
          <p class="text-xs opacity-80" [style.color]="banner.textColor">{{ banner.subtitle }}</p>
        }
        @if (banner.highlight) {
          <p class="font-display text-2xl font-black" [style.color]="banner.textColor">{{ banner.highlight }}</p>
        }
        <span class="material-icons absolute bottom-3 right-3 text-3xl opacity-20" [style.color]="banner.textColor">{{ banner.icon }}</span>
      </div>
    }
  </section>
  `,
})
export class PromoBannersComponent {
  protected lang = inject(LanguageService);

  readonly banners: PromoBanner[] = [
    {
      id: 1,
      bg: '#FFD700',
      textColor: '#003087',
      title: 'STOCK CLEARANCE!',
      subtitle: 'PRICE DROP UP TO 95%',
      highlight: '-30% -60% -95%',
      icon: 'local_offer',
    },
    {
      id: 2,
      bg: '#1a1a1a',
      textColor: '#4ade80',
      tag: 'NEW',
      tagColor: '#16a34a',
      title: 'Streamline Your Production',
      subtitle: 'Industrial conveyor belts',
      icon: 'conveyor_belt',
    },
    {
      id: 3,
      bg: '#1a0a0a',
      textColor: '#f97316',
      title: 'REFER & EARN',
      subtitle: '₹3,000 Per Successful Registration',
      icon: 'group_add',
    },
    {
      id: 4,
      bg: '#0a0a1a',
      textColor: '#60a5fa',
      title: 'Up To ₹10,000 Off',
      subtitle: 'Register with Us and Save More',
      icon: 'savings',
    },
  ];
}
