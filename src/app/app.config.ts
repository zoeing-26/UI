import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ThemeService } from './core/services/theme.service';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

/** Factory to init theme on app bootstrap (reads localStorage / system preference) */
function initTheme(themeService: ThemeService) {
  return () => themeService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Router with input binding and view transitions
    provideRouter(routes, withComponentInputBinding(), withViewTransitions(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),

    // HTTP client with functional interceptors.
    // provideClientHydration() below enables the HTTP transfer cache by default:
    // GET responses fetched during SSR are embedded in the HTML (ng-state) and
    // reused by the browser instead of being refetched. Requests carrying an
    // Authorization header are never cached, so per-user data stays private.
    // withFetch(): recommended for SSR — Node's fetch avoids the xhr2 shim and
    // is required for reliable streaming/hydration performance on the server.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),

    // Animations
    provideAnimations(),

    // App initializer: init theme on bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: initTheme,
      deps: [ThemeService],
      multi: true,
    },

    // SSR hydration: reuse server-rendered DOM, replay events that fired before
    // hydration, and cache GET responses made on the server so the browser does
    // not re-fetch data that is already embedded in the HTML (ng-state).
    provideClientHydration(withEventReplay()),
  ],
};
