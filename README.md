# ZOIENG Global — Angular 18 B2B E-Commerce Platform

> Industrial B2B e-commerce UI for ZOIENG Global  
> Built with **Angular 18 Standalone Components + Tailwind CSS + Signals**

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start
# → Opens http://localhost:4200

# 3. Build for production
npm run build:prod
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api.service.ts          ← Base HTTP client wrapper (typed)
│   │   │   ├── auth.service.ts         ← JWT auth + user signal
│   │   │   ├── cart.service.ts         ← Cart state via signals
│   │   │   ├── language.service.ts     ← i18n English/Hindi (signals)
│   │   │   ├── product.service.ts      ← All product/category/brand API calls
│   │   │   └── theme.service.ts        ← Dark/Light mode (signals + DOM sync)
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts     ← Attaches Bearer JWT token
│   │   │   └── error.interceptor.ts    ← 401/403/500 global error handling
│   │   └── guards/
│   │       └── auth.guard.ts           ← Protects authenticated routes
│   ├── shared/
│   │   ├── components/
│   │   │   └── product-card/           ← Reusable product card (signal inputs)
│   │   ├── pipes/
│   │   │   └── inr-currency.pipe.ts    ← ₹ Indian Rupee formatter
│   │   └── directives/
│   │       └── lazy-image.directive.ts ← IntersectionObserver lazy loading
│   ├── features/
│   │   ├── header/                     ← 3-row sticky header + mega dropdown
│   │   ├── footer/                     ← Payment methods + links + ticker
│   │   └── home/
│   │       └── sections/
│   │           ├── hero-carousel/      ← 6-slide auto-play carousel
│   │           ├── category-sidebar/   ← 13 category vertical list
│   │           ├── quick-access/       ← Quote & Order + Need Help
│   │           ├── promo-banners/      ← 4-column promotional banners
│   │           ├── popular-brands/     ← Horizontal scroll brand logos
│   │           ├── zoieng-channel/     ← Video thumbnail grid
│   │           ├── economy-series/     ← Product grid with promo card
│   │           └── automation-components/ ← Product grid + Load More
│   ├── models/
│   │   └── product.model.ts            ← All TypeScript interfaces
│   ├── app.component.ts                ← Root component
│   ├── app.config.ts                   ← provideRouter, provideHttpClient, APP_INITIALIZER
│   └── app.routes.ts                   ← Lazy-loaded routes
├── environments/
│   ├── environment.ts                  ← Dev: http://localhost:8000/api/v1
│   └── environment.prod.ts             ← Prod: https://api.zoieng.com
└── styles/
    └── main.scss                       ← Tailwind + CSS variables + all global styles
```

---

## 🔌 Backend API (Python FastAPI / Django REST)

The app expects a Python backend at:
- **Dev:** `http://localhost:8000/api/v1`
- **Prod:** `https://api.zoieng.com`

### Expected Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (supports `?category=&brand=&series=&page=&limit=&q=`) |
| GET | `/products/:id` | Single product |
| GET | `/products/search?q=` | Search autocomplete |
| GET | `/products/economy-series` | Economy series products |
| GET | `/products/automation` | Automation products |
| GET | `/products/featured` | Featured products |
| GET | `/categories` | All categories |
| GET | `/categories/:id/children` | Sub-categories |
| GET | `/brands` | All brands |
| GET | `/brands/featured` | Featured brands |
| GET | `/banners` | Hero carousel banners |
| GET | `/banners/promo` | Promo section banners |
| POST | `/cart` | Sync cart to server |
| GET | `/quotes` | List quotes |
| POST | `/quotes` | Create quote |
| POST | `/auth/login` | Login → returns JWT |
| POST | `/auth/logout` | Logout |

### API Response Format

All endpoints must return:
```json
{
  "success": true,
  "data": { ... }
}
```

Paginated endpoints return:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 12,
    "totalPages": 9
  }
}
```

---

## 🌗 Theme System

Toggle via sun/moon icon in header. Theme persists in `localStorage`.

```ts
// Inject anywhere
const theme = inject(ThemeService);
theme.toggle();            // toggle light/dark
theme.setTheme('dark');    // explicit set
theme.isDark();            // computed signal → boolean
```

---

## 🌐 Language (i18n)

Switch EN/हि via header toggle. Language persists in `localStorage`.

```ts
const lang = inject(LanguageService);
lang.t('categories')       // → 'Categories' or 'श्रेणियाँ'
lang.setLanguage('hi');    // explicit set
lang.lang()                // signal → 'en' | 'hi'
```

---

## 🛒 Cart (Signals)

```ts
const cart = inject(CartService);
cart.add(product);         // add item
cart.remove(productId);    // remove item
cart.count()               // signal → number
cart.total()               // signal → number (₹)
cart.clear();              // clear all
```

---

## ⚙️ Angular 18 Features Used

| Feature | Where |
|---------|-------|
| `signal()` / `computed()` | All services + components |
| `inject()` function | All services + components (no constructor injection) |
| `input()` / `output()` | ProductCardComponent |
| `@defer (on viewport)` | Home page sections (lazy loading) |
| `@for` / `@if` / `@switch` | All templates (new control flow) |
| `effect()` | ThemeService DOM sync |
| `toSignal()` | Search results |
| Standalone components | Every component (no NgModules) |
| Functional interceptors | authInterceptor, errorInterceptor |
| `withViewTransitions()` | Router config |
| `provideAppInitializer()` | Theme init on bootstrap |

---

## 🎨 Color Variables

```css
--brand-blue: #003087
--brand-blue-light: #0048cc
--brand-blue-dark: #001a4d
--brand-yellow: #FFD700
--surface: #ffffff / #0d0d0d (dark)
--text-primary: #1a1a1a / #f0f0f0 (dark)
--border: #e0e4ec / #2a2a2a (dark)
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `xl` 1280px | Full desktop — sidebar, 6-col grid, 3-row header |
| `lg` 1024px | Laptop — sidebar visible, 4-col grid |
| `md` 768px | Tablet — sidebar hidden, hamburger menu |
| `xs` 375px | Mobile — 2-col grid, stacked header |
