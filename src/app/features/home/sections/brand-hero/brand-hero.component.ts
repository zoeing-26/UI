import {
  Component, ChangeDetectionStrategy, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface VideoClip { src: SafeUrl; label: string; industry: string; }

@Component({
  selector: 'app-brand-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <div class="relative w-full overflow-hidden" style="height: 50vh; background: #1a2535;">

    @for (clip of clips; track $index; let i = $index) {
      @if (i === currentIndex()) {
        <video
          class="w-full h-full"
          style="object-fit: cover; display: block;"
          [muted]="true"
          autoplay
          playsinline
          preload="auto"
          (ended)="next()"
        >
          <source [src]="clip.src" type="video/mp4" />
        </video>
      }
    }

    <!-- Bottom gradient -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none"></div>

    <!-- Heading -->
    <div class="absolute bottom-8 left-6 md:left-10">
      <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color: #F59E0B; opacity: 0.85;">
        {{ clips[currentIndex()].industry }}
      </p>
      <h2 class="font-display font-black text-2xl md:text-4xl leading-tight drop-shadow-lg" style="color: #F59E0B;">
        {{ clips[currentIndex()].label }}
      </h2>
    </div>

    <!-- Dot / pill indicators -->
    <div class="absolute bottom-9 right-6 flex gap-2 items-center">
      @for (clip of clips; track $index; let i = $index) {
        <button
          class="rounded-full transition-all duration-300"
          [class]="i === currentIndex()
            ? 'w-6 h-2 bg-amber-400'
            : 'w-2 h-2 bg-white/40 hover:bg-white/70'"
          (click)="currentIndex.set(i)"
        ></button>
      }
    </div>

  </div>
  `,
})
export class BrandHeroComponent {
  private sanitizer = inject(DomSanitizer);

  currentIndex = signal(0);

  readonly clips: VideoClip[] = [
    {
      src: this.sanitizer.bypassSecurityTrustUrl(
        '/assets/videos/From KlickPin CF Pin on Industrial - Royalty Free Video - Pin-1083397254103183183.mp4'
      ),
      label: 'Oil & Gas Industrial',
      industry: 'Energy & Manufacturing',
    },
    {
      src: this.sanitizer.bypassSecurityTrustUrl(
        '/assets/videos/From KlickPin CF Car Engine Assemblage _ Otomotiv mühendisliği Oto tamircisi Motorlar - Pin-176133035422959568.mp4'
      ),
      label: 'Automobile Industrial',
      industry: 'Automotive Engineering',
    },
  ];

  next(): void {
    this.currentIndex.update(i => (i + 1) % this.clips.length);
  }
}
