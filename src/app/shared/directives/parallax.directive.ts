import {
  Directive, ElementRef, OnInit, OnDestroy, NgZone, inject, input,
} from '@angular/core';

/**
 * ParallaxDirective — moves the host element vertically based on scroll position.
 *
 * Usage:
 *   <div appParallax [speed]="0.3">...</div>     // moves at 30% of scroll speed (background)
 *   <div appParallax [speed]="-0.5">...</div>    // moves opposite direction
 *   <div appParallax [speed]="0.2" [axis]="'x'">  // horizontal parallax
 *
 * Performance:
 *   - Uses requestAnimationFrame + IntersectionObserver
 *   - Only runs when element is in viewport
 *   - Auto-disables on mobile (<= 768px) and prefers-reduced-motion
 *   - Listens to passive scroll events for smooth performance
 */
@Directive({
  selector: '[appParallax]',
  standalone: true,
})
export class ParallaxDirective implements OnInit, OnDestroy {
  /** Parallax speed: 1 = same as scroll, 0.3 = slower (background), -0.3 = opposite */
  speed = input<number>(0.3);

  /** Axis: 'y' (default) or 'x' */
  axis = input<'x' | 'y'>('y');

  /** Disable parallax (for testing or per-instance opt-out) */
  disabled = input<boolean>(false);

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private zone = inject(NgZone);

  private rafId = 0;
  private isInView = false;
  private observer?: IntersectionObserver;
  private scrollHandler?: () => void;
  private resizeHandler?: () => void;
  private isMobile = false;
  private reduceMotion = false;

  ngOnInit(): void {
    this.checkConstraints();

    // Don't run parallax on mobile or when user prefers reduced motion
    if (this.isMobile || this.reduceMotion || this.disabled()) return;

    // Mark element with class for CSS targeting
    this.el.nativeElement.classList.add('parallax-layer');

    // Use IntersectionObserver to only animate visible elements
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          this.isInView = e.isIntersecting;
          if (this.isInView) this.scheduleUpdate();
        });
      },
      { threshold: 0, rootMargin: '100px 0px' }
    );
    this.observer.observe(this.el.nativeElement);

    // Run scroll handler outside Angular's zone for performance
    this.zone.runOutsideAngular(() => {
      this.scrollHandler = () => this.scheduleUpdate();
      this.resizeHandler = () => {
        this.checkConstraints();
        this.scheduleUpdate();
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      window.addEventListener('resize', this.resizeHandler, { passive: true });
    });

    // Initial position
    this.scheduleUpdate();
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.observer?.disconnect();
  }

  private checkConstraints(): void {
    this.isMobile = window.innerWidth <= 768;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private scheduleUpdate(): void {
    if (!this.isInView) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.update());
  }

  private update(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const winH = window.innerHeight;

    // Element's center distance from viewport center
    const elCenter = rect.top + rect.height / 2;
    const winCenter = winH / 2;
    const offset = (elCenter - winCenter) * this.speed();

    const transform = this.axis() === 'y'
      ? `translate3d(0, ${offset}px, 0)`
      : `translate3d(${offset}px, 0, 0)`;

    this.el.nativeElement.style.transform = transform;
  }
}
