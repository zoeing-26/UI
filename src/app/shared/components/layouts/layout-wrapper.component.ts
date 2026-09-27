import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="layoutType === 'full' ? 'w-full' : 'max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8'">
      <ng-content></ng-content>
    </div>
  `
})
export class LayoutWrapperComponent {
  @Input() layoutType: 'boxed' | 'full' = 'boxed';
}
