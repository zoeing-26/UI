import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <img
      [src]="logoSrc"
      [attr.alt]="label"
      [attr.aria-label]="label"
      class="block"
      [class.sm]="size === 'sm'"
      [class.md]="size === 'md'"
      [class.lg]="size === 'lg'"
      [style.color]="primaryColor"
      preserveAspectRatio="xMidYMid meet"
    />
  `,
  styles: [
    ':host { display: inline-block; }',
    'img { display: block; max-width: 100%; height: auto; }',
    '.sm { width: 120px; }',
    '.md { width: 200px; }',
    '.lg { width: 260px; }'
  ],
})
export class LogoComponent {
  @Input() label = 'ZO-Industrial Engineering Supplies';
  @Input() primaryColor = '#0b2e3b';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() viewBox = '0 0 650 220';

  readonly logoSrc = 'assets/ZO_Industrial_Engineering_Supplies_Transparent.svg';
}
