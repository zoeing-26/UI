# AGENTS.md

This repository is an Angular 18 standalone frontend for the ZOIENG B2B commerce experience. Use this file as the quick-start guide for AI-coded changes.

## What to know first
- Primary docs: [README.md](README.md), [package.json](package.json)
- App bootstrap and router wiring: [src/app/app.config.ts](src/app/app.config.ts)
- Route composition: [src/app/app.routes.ts](src/app/app.routes.ts)
- Shared API wrapper: [src/app/core/services/api.service.ts](src/app/core/services/api.service.ts)

## Build and run
- Install dependencies: `npm install`
- Start dev server: `npm start`
- Production build: `npm run build:prod`
- Regular build: `npm run build`
- Test: `npm test`

## Project conventions
- Prefer the Angular 18 standalone style already used throughout the app.
- Use `inject()` for services in components and services; avoid introducing constructor-based DI unless the existing pattern already requires it.
- Favor `signal()`, `computed()`, and `effect()` for stateful UI logic, especially in services such as [src/app/core/services/theme.service.ts](src/app/core/services/theme.service.ts) and [src/app/core/services/auth.service.ts](src/app/core/services/auth.service.ts).
- Keep most backend-facing logic inside [src/app/core/services/api.service.ts](src/app/core/services/api.service.ts) and feature-specific services beneath [src/app/core/services](src/app/core/services).
- Keep route-level feature components under [src/app/features](src/app/features), and reusable UI pieces under [src/app/shared](src/app/shared).
- Use the environment configuration in [src/environments/environment.ts](src/environments/environment.ts) and [src/environments/environment.prod.ts](src/environments/environment.prod.ts) rather than hard-coding backend URLs.
- Preserve the existing response shape contract from the backend: `{ success: true, data: ... }`.

## Change guidance
- Prefer `loadComponent` lazy routes in [src/app/app.routes.ts](src/app/app.routes.ts) when adding new routes.
- Add or update interfaces in [src/app/models/product.model.ts](src/app/models/product.model.ts) when new data contracts appear.
- Keep UI logic and data retrieval separated: services own state and API calls, components focus on rendering and user interaction.
- If a feature is backend-driven, check the corresponding service and the route component before introducing a new request flow.

## Avoid
- Do not introduce NgModules for new features.
- Do not duplicate API endpoint configuration or response mapping in multiple places.
- Do not bypass the existing `ApiService` helper unless there is a clear, documented reason.
