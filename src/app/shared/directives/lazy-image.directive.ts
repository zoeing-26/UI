import {
  Directive, ElementRef, OnInit, OnDestroy, input, inject,
} from '@angular/core';

/**
 * LazyImageDirective — uses IntersectionObserver to load images only when in viewport.
 * Usage: <img appLazyImage [src]="imageUrl" />
 */
@Directive({ selector: 'img[appLazyImage]', standalone: true })
export class LazyImageDirective implements OnInit, OnDestroy {
  src = input<string>('');
  placeholder = input<string>('assets/placeholder.svg');

  private el = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const img = this.el.nativeElement;
    img.src = this.placeholder();
    img.classList.add('transition-opacity', 'duration-300', 'opacity-0');

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = this.src();
            img.onload = () => img.classList.replace('opacity-0', 'opacity-100');
            img.onerror = () => { img.src = this.placeholder(); img.classList.replace('opacity-0', 'opacity-100'); };
            this.observer?.disconnect();
          }
        });
      },
      { rootMargin: '100px 0px', threshold: 0.01 }
    );

    this.observer.observe(img);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
