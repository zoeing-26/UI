import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Zoieng Global | Industrial B2B E-Commerce',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'Products | Zoieng Global',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Cart | Zoieng Global',
  },
  {
    path: 'quote',
    loadComponent: () =>
      import('./features/quote/quote.component').then(m => m.QuoteComponent),
    title: 'Request Quote | Zoieng Global',
  },
  {
    path: 'manufacturers',
    loadComponent: () =>
      import('./features/brand/brand.component').then(m => m.BrandComponent),
    title: 'Manufacturers | Zoieng Global',
  },
  {
    path: 'manufacturers/:slug',
    loadComponent: () =>
      import('./features/brand/brand.component').then(m => m.BrandComponent),
    title: 'Manufacturers | Zoieng Global',
  },
  {
    path: 'brand',
    redirectTo: 'manufacturers',
    pathMatch: 'full',
  },
  {
    path: 'brand/:slug',
    redirectTo: 'manufacturers/:slug',
    pathMatch: 'full',
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/economy-series/economy-series.component').then(m => m.EconomySeriesComponent),
    title: 'Inventory | Zoieng Global',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'About ZOIENG | Zoieng Global',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In | Zoieng Global',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Create Account | Zoieng Global',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
