# ZOIENG UI Angular Skill

Use this skill when working in the ZOIENG Angular frontend. This project is a standalone Angular 18 application with Tailwind styling, signals-based state, and a shared API wrapper.

## Project snapshot
- App entry: [src/main.ts](src/main.ts)
- Bootstrap and providers: [src/app/app.config.ts](src/app/app.config.ts)
- Route table: [src/app/app.routes.ts](src/app/app.routes.ts)
- Shared API layer: [src/app/core/services/api.service.ts](src/app/core/services/api.service.ts)
- Core models: [src/app/models/product.model.ts](src/app/models/product.model.ts)

## Primary conventions
- Use standalone components and avoid introducing NgModules for new work.
- Use `inject()` in services and components rather than constructor-based dependency injection when the existing style supports it.
- Prefer `signal()`, `computed()`, and `effect()` for shared UI state; this repo already uses them heavily in services like ThemeService and AuthService.
- Keep most backend-facing logic inside the service layer, especially under [src/app/core/services](src/app/core/services).
- Keep feature routes lazy-loaded via `loadComponent` in [src/app/app.routes.ts](src/app/app.routes.ts).
- Keep shared UI pieces under [src/app/shared](src/app/shared) and page-level features under [src/app/features](src/app/features).

## Data and API rules
- Use [src/app/core/services/api.service.ts](src/app/core/services/api.service.ts) as the central HTTP helper.
- Preserve the backend response contract: `{ success: true, data: ... }`.
- Do not duplicate endpoint paths or response mapping logic in multiple services.
- When a new backend contract appears, add or update the corresponding interface in [src/app/models/product.model.ts](src/app/models/product.model.ts).

## Feature implementation guidance
- If the route is backend-driven, first inspect the matching service and route component before introducing a new API flow.
- Keep components focused on rendering and user interaction; move stateful request logic into services.
- Reuse existing patterns for products, brands, categories, banners, cart, and quotes instead of creating parallel implementations.

## Component conventions
- Nearly every UI view is a standalone Angular component using `@Component({ standalone: true })`.
- Route-level features live under [src/app/features](src/app/features); reusable UI pieces live under [src/app/shared](src/app/shared).
- Shared cards and widgets should stay reusable and ideally receive inputs/outputs, not pull in page-specific state.
- Home-page sections are imported into [src/app/features/home/home.component.ts](src/app/features/home/home.component.ts) and should remain composable.
- Many home sections use `@defer` for non-critical rendering and `OnPush` change detection where already present.

## Component inventory
- Root shell: [src/app/app.component.ts](src/app/app.component.ts) wires the global header and footer.
- Layout and navigation: [src/app/features/header/header.component.ts](src/app/features/header/header.component.ts), [src/app/features/footer/footer.component.ts](src/app/features/footer/footer.component.ts).
- Home page and sections: [src/app/features/home/home.component.ts](src/app/features/home/home.component.ts), [src/app/features/home/sections/brand-hero/brand-hero.component.ts](src/app/features/home/sections/brand-hero/brand-hero.component.ts), [src/app/features/home/sections/category-sidebar/category-sidebar.component.ts](src/app/features/home/sections/category-sidebar/category-sidebar.component.ts), [src/app/features/home/sections/hero-carousel/hero-carousel.component.ts](src/app/features/home/sections/hero-carousel/hero-carousel.component.ts), [src/app/features/home/sections/promo-banners/promo-banners.component.ts](src/app/features/home/sections/promo-banners/promo-banners.component.ts), [src/app/features/home/sections/popular-brands/popular-brands.component.ts](src/app/features/home/sections/popular-brands/popular-brands.component.ts), [src/app/features/home/sections/zoieng-channel/zoieng-channel.component.ts](src/app/features/home/sections/zoieng-channel/zoieng-channel.component.ts), [src/app/features/home/sections/quick-access/quick-access.component.ts](src/app/features/home/sections/quick-access/quick-access.component.ts), [src/app/features/home/sections/automation-components/automation-components.component.ts](src/app/features/home/sections/automation-components/automation-components.component.ts), [src/app/features/home/sections/economy-series/economy-series.component.ts](src/app/features/home/sections/economy-series/economy-series.component.ts).
- Route features: [src/app/features/about/about.component.ts](src/app/features/about/about.component.ts), [src/app/features/auth/login/login.component.ts](src/app/features/auth/login/login.component.ts), [src/app/features/auth/register/register.component.ts](src/app/features/auth/register/register.component.ts), [src/app/features/brand/brand.component.ts](src/app/features/brand/brand.component.ts), [src/app/features/cart/cart.component.ts](src/app/features/cart/cart.component.ts), [src/app/features/economy-series/economy-series.component.ts](src/app/features/economy-series/economy-series.component.ts), [src/app/features/inventory/inventory.component.ts](src/app/features/inventory/inventory.component.ts), [src/app/features/material-detail/material-detail.component.ts](src/app/features/material-detail/material-detail.component.ts), [src/app/features/product-list/product-list.component.ts](src/app/features/product-list/product-list.component.ts), [src/app/features/promotion/promotion.component.ts](src/app/features/promotion/promotion.component.ts), [src/app/features/quote/quote.component.ts](src/app/features/quote/quote.component.ts), [src/app/features/stock-clearance/stock-clearance.component.ts](src/app/features/stock-clearance/stock-clearance.component.ts), [src/app/features/technical/technical.component.ts](src/app/features/technical/technical.component.ts).
- Shared components: [src/app/shared/components/product-card/product-card.component.ts](src/app/shared/components/product-card/product-card.component.ts), [src/app/shared/components/material-card/material-card.component.ts](src/app/shared/components/material-card/material-card.component.ts).

## Env and build expectations
- Run with `npm install` and `npm start`.
- Use the environment files in [src/environments/environment.ts](src/environments/environment.ts) and [src/environments/environment.prod.ts](src/environments/environment.prod.ts) instead of hard-coding API URLs.
- Prefer `npm run build` or `npm run build:prod` for verification when making changes that affect routes, providers, or services.

## Avoid
- Do not bypass `ApiService` unless there is a clear, documented reason.
- Do not create new module-based architecture.
- Do not hard-code API URLs or duplicate response shape handling.
- Do not add stateful logic directly to components when a service already owns the relevant data.
- Do not turn a shared component into a route-specific component by coupling it to page-only state.
