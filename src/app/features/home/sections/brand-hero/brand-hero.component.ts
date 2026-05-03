import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ParallaxDirective } from '../../../../shared/directives/parallax.directive';

@Component({
  selector: 'app-brand-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective],
  template: `
  <!--
    Container: full-width, fixed 50vh — sets the visible frame.
    Video: 100% × 100% with object-contain shows the entire video at correct
    aspect ratio inside that frame; bg-black fills any letterbox area.
    appParallax on the video adds the scroll-depth shift; overflow-hidden clips it.
  -->
  <div class="w-full bg-black overflow-hidden" style="height: 50vh;">
    <video
      appParallax [speed]="0.12"
      class="w-full h-full"
      style="object-fit: fill; display: block;"
      [src]="videoSrc"
      [muted]="true"
      autoplay
      loop
      playsinline
      preload="auto"
    ></video>
  </div>
  `,
})
export class BrandHeroComponent {
  private sanitizer = inject(DomSanitizer);

  readonly videoSrc: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(
    '/assets/videos/From KlickPin CF Pin on Industrial - Royalty Free Video - Pin-1083397254103183183.mp4'
  );
}
