import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language.service';

interface VideoCard { id: number; title: string; thumbnail: string; duration?: string; }

@Component({
  selector: 'app-zoieng-channel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <section class="my-6">
    <h2 class="section-title">{{ lang.t('zoeing_channel') }}</h2>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      @for (video of videos; track video.id) {
        <div class="video-card rounded-lg overflow-hidden cursor-pointer" style="height: 160px;">
          <!-- Thumbnail bg -->
          <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span class="material-icons text-5xl text-gray-600">smart_display</span>
          </div>

          <!-- Play button -->
          <div class="play-btn">
            <span class="material-icons text-brand-blue text-xl ml-0.5">play_arrow</span>
          </div>

          <!-- Duration badge -->
          @if (video.duration) {
            <span class="absolute top-2 right-2 z-10 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
              {{ video.duration }}
            </span>
          }

          <!-- Title overlay -->
          <div class="video-title">{{ video.title }}</div>
        </div>
      }
    </div>
  </section>
  `,
})
export class ZoiengChannelComponent {
  protected lang = inject(LanguageService);

  readonly videos: VideoCard[] = [
    { id: 1, title: 'Zoieng Global | Feat. Urvashi Rautela | e-catalog and WOS', thumbnail: '', duration: '3:24' },
    { id: 2, title: 'Zoieng Global | Feat. Urvashi Rautela | Lead Time Advantage | e-catalog', thumbnail: '', duration: '2:58' },
    { id: 3, title: 'Introduction of Zoieng & Services | Feat. Urvashi Rautela | Zoieng Global', thumbnail: '', duration: '4:11' },
    { id: 4, title: 'Zoieng Global | Feat. Urvashi Rautela - Mechanical Components e-catalog', thumbnail: '', duration: '3:47' },
    { id: 5, title: 'Zoieng Global | Feat. Urvashi Rautela - Electrical Components e-catalog', thumbnail: '', duration: '3:02' },
  ];
}
