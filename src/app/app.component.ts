import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './features/header/header.component';
import { FooterComponent } from './features/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <router-outlet />
    <app-footer />
  `,
})
export class AppComponent {}
