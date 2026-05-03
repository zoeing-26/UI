import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ThemeService } from './core/services/theme.service';

/** Factory to init theme on app bootstrap (reads localStorage / system preference) */
function initTheme(themeService: ThemeService) {
  return () => themeService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Router with input binding and view transitions
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // HTTP client with functional interceptors
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    // Animations
    provideAnimations(),

    // App initializer: init theme on bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: initTheme,
      deps: [ThemeService],
      multi: true,
    },
  ],
};
