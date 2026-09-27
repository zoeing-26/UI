import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject, interval, takeUntil } from 'rxjs';
import { SafeStorageService } from '../../../../core/services/safe-storage.service';

interface VideoClip { src: SafeUrl; label: string; industry: string; }

@Component({
  selector: 'app-brand-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <div
    class="group relative isolate w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#082f45_0%,#0d4c6a_46%,#1f6d8e_100%)] shadow-[0_28px_80px_rgba(13,76,106,0.22)]"
    style="height: min(68vh, 640px);"
    (mouseenter)="pauseAutoplay()"
    (mouseleave)="resumeAutoplay()"
  >
    <video
      class="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-100 transition-opacity duration-500 ease-out saturate-[1.08] contrast-[1.04]"
      [src]="clips[currentIndex()].src"
      [style.opacity]="isTransitioning() ? '0' : '1'"
      [muted]="true"
      autoplay
      playsinline
      preload="auto"
      [attr.aria-label]="clips[currentIndex()].label"
    ></video>

    <video
      class="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-0 transition-opacity duration-500 ease-out saturate-[1.08] contrast-[1.04]"
      [src]="clips[nextIndex()].src"
      [style.opacity]="isTransitioning() ? '1' : '0'"
      [muted]="true"
      autoplay
      playsinline
      preload="auto"
      [attr.aria-label]="clips[nextIndex()].label"
    ></video>

    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_28%)]"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/25 to-slate-950/10"></div>
    <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"></div>

    <div class="absolute inset-0 flex flex-col justify-between p-5 md:p-8 lg:p-10">
      <div class="flex items-start justify-between gap-4">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_18px_rgba(251,146,60,0.9)]"></span>
          Industrial procurement
        </div>

        <div class="hidden sm:flex items-center rounded-full border border-white/10 bg-slate-950/20 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 backdrop-blur-sm">
          {{ currentIndex() + 1 }} / {{ clips.length }}
        </div>
      </div>

      <div class="max-w-2xl">
        <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-200/80 md:text-xs">
          Trusted solutions for critical operations
        </p>
        <h2 class="mt-3 max-w-xl font-display text-3xl font-black leading-none tracking-[-0.05em] text-white drop-shadow-[0_10px_18px_rgba(15,23,42,0.35)] md:text-5xl">
          {{ clips[currentIndex()].label }}
        </h2>
        <p class="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-200 md:text-base">
          {{ clips[currentIndex()].industry }}
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(217,119,6,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(217,119,6,0.42)]"
          >
            Request a quote
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-200 hover:bg-white/10"
          >
            Explore categories
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/20 px-2.5 py-2 backdrop-blur-sm" aria-label="Select industry slide">
          @for (clip of clips; track clip.label; let i = $index) {
            <button
              type="button"
              class="rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900"
              [class]="i === currentIndex() ? 'h-2.5 w-8 bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.8)]' : 'h-2.5 w-2.5 bg-white/45 hover:bg-white/80'"
              [attr.aria-label]="'View ' + clip.label + ' slide'"
              [attr.aria-pressed]="i === currentIndex()"
              (click)="selectClip(i)"
            ></button>
          }
        </div>

        <div class="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70 md:flex">
          <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.8)]"></span>
          Auto-play
        </div>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-0 h-1 bg-white/10">
      <div
        class="h-full origin-left rounded-r-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 transition-[width] duration-500 ease-out"
        [style.width.%]="((currentIndex() + 1) / clips.length) * 100"
      ></div>
    </div>
  </div>
  `,
})
export class BrandHeroComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private browser = inject(SafeStorageService);
  private destroy$ = new Subject<void>();
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;

  currentIndex = signal(0);
  nextIndex = signal(0);
  isTransitioning = signal(false);
  private isPaused = signal(false);

  readonly videoList: string[] = [
    '/assets/videos/oil-gas-hero.mp4',
    '/assets/videos/coolant.mp4',
    '/assets/videos/CNC_video.mp4',
    '/assets/videos/water_treatment.mp4',
    '/assets/videos/cement_treatment.mp4',
  ];

  readonly clips: VideoClip[] = this.videoList.map((path, index) => ({
    src: this.sanitizer.bypassSecurityTrustUrl(path),
    label: [
      'Oil & Gas',
      'District Cooling',
      'CNC & Precision Engineering',
      'Water Treatment & Utilities',
      'Cement Industry',
    ][index],
    industry: [
      'Industrial Products for the Oil & Gas Industry',
      'Industrial Supplies for District Cooling Operations',
      'Industrial Supplies for CNC & Precision Engineering',
      'Industrial Supplies for Water Treatment & Utilities',
      'Industrial Supplies for Cement Industry',
    ][index],
  }));

  ngOnInit(): void {
    this.nextIndex.set(this.currentIndex());
    // SSR: autoplay timer + document access are browser-only
    if (!this.browser.inBrowser) return;
    interval(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.goToNext());
  }

  ngOnDestroy(): void {
    this.stopTransition();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private stopTransition(): void {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }

  private activateVideo(index: number): void {
    this.stopTransition();
    const incoming = document.querySelectorAll('video')[1] as HTMLVideoElement | undefined;
    if (incoming) {
      incoming.currentTime = 0;
      incoming.load();
      incoming.play().catch(() => undefined);
    }

    this.transitionTimer = setTimeout(() => {
      this.currentIndex.set(index);
      this.isTransitioning.set(false);
      this.nextIndex.set(index);
      const active = document.querySelectorAll('video')[0] as HTMLVideoElement | undefined;
      if (active) {
        active.currentTime = 0;
        active.load();
        active.play().catch(() => undefined);
      }
    }, 420);
  }

  goToNext(): void {
    if (this.isPaused()) {
      return;
    }
    const next = (this.currentIndex() + 1) % this.clips.length;
    this.advanceTo(next);
  }

  selectClip(index: number): void {
    if (index === this.currentIndex()) {
      return;
    }
    this.advanceTo(index);
  }

  private advanceTo(index: number): void {
    const next = index % this.clips.length;
    this.nextIndex.set(next);
    this.isTransitioning.set(true);
    const incoming = document.querySelectorAll('video')[1] as HTMLVideoElement | undefined;
    if (incoming) {
      incoming.src = this.clips[next].src as unknown as string;
      incoming.currentTime = 0;
      incoming.load();
      incoming.play().catch(() => undefined);
    }
    this.activateVideo(next);
  }

  pauseAutoplay(): void {
    this.isPaused.set(true);
  }

  resumeAutoplay(): void {
    this.isPaused.set(false);
  }
}
