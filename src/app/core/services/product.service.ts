import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Product, ProductFilter, ProductListResponse,
  Category, ApiCategory, ApiMaterial, ApiBrand, AllMaterialsResponse, Banner, Quote, CartResponse, CartItem,
} from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  // ── Products ──────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/products
   * Supports pagination, filtering by category, brand, series, price range, search query
   */
  getProducts(filter: ProductFilter = {}): Observable<ProductListResponse> {
    return this.api.get<ProductListResponse>('products', filter as Record<string, string | number | boolean>);
  }

  /**
   * GET /api/v1/products/:id
   */
  getProductById(id: string): Observable<Product> {
    return this.api.get<Product>(`products/${id}`);
  }

  /**
   * GET /api/v1/products/search?q=&limit=
   */
  searchProducts(query: string, limit = 10): Observable<Product[]> {
    return this.api.get<Product[]>('products/search', { q: query, limit });
  }

  /**
   * GET /api/v1/products/economy-series
   */
  getEconomySeries(page = 1, limit = 12): Observable<ProductListResponse> {
    return this.api.get<ProductListResponse>('products/economy-series', { page, limit });
  }

  /**
   * GET /api/v1/products/automation
   */
  getAutomationProducts(page = 1, limit = 12): Observable<ProductListResponse> {
    return this.api.get<ProductListResponse>('products/automation', { page, limit });
  }

  /**
   * GET /api/v1/products/featured
   */
  getFeaturedProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('products/featured');
  }

  // ── Categories ────────────────────────────────────────────────────────────

  /**
   * GET /v1/materials
   */
  getCategories(): Observable<ApiCategory[]> {
    return this.api.getRaw<ApiCategory[]>('v1/materials');
  }

  /**
   * Filter materials for a specific category + subcategory from the /v1/materials tree
   */
  getMaterialsBySubCategory(category: string, subCategory: string): Observable<ApiMaterial[]> {
    return this.getCategories().pipe(
      map(cats => {
        const cat = cats.find(c => c.name === category);
        const sub = cat?.sub_category.find(s => s.name === subCategory);
        return sub?.materials ?? [];
      })
    );
  }

  /**
   * GET /v1/materials/:id/children
   */
  getSubCategories(categoryId: string): Observable<Category[]> {
    return this.api.get<Category[]>(`v1/materials/${categoryId}/children`);
  }

  // ── Brands ────────────────────────────────────────────────────────────────

  /**
   * GET /v1/brand_materials
   */
  getBrands(): Observable<ApiBrand[]> {
    return this.api.getRaw<ApiBrand[]>('v1/brand_materials');
  }

  /**
   * GET /v1/all_materials
   */
  getAllMaterials(): Observable<ApiMaterial[]> {
    return this.api.getRaw<AllMaterialsResponse>('v1/all_materials').pipe(
      map(res => res.materials)
    );
  }

  /**
   * Find a single material by id across all materials
   */
  getMaterialById(id: number): Observable<ApiMaterial | undefined> {
    return this.getAllMaterials().pipe(
      map(materials => materials.find(m => m.id === id))
    );
  }

  /**
   * GET /v1/brand_materials/featured
   */
  getFeaturedBrands(): Observable<ApiBrand[]> {
    return this.api.getRaw<ApiBrand[]>('v1/brand_materials/featured');
  }

  /**
   * POST /v1/enquery
   */
  createEnquiry(payload: unknown): Observable<unknown> {
    return this.api.post<unknown>('v1/enquiry', payload);
  }

  // ── Banners / Slides ──────────────────────────────────────────────────────

  /**
   * GET /api/v1/banners
   */
  getBanners(): Observable<Banner[]> {
    return this.api.get<Banner[]>('banners');
  }

  /**
   * GET /api/v1/banners/promo
   */
  getPromoBanners(): Observable<Banner[]> {
    return this.api.get<Banner[]>('banners/promo');
  }

  // ── Cart API (server-side sync) ───────────────────────────────────────────

  /**
   * POST /api/v1/cart
   * Sync local cart to server (requires auth)
   */
  syncCart(items: CartItem[]): Observable<CartResponse> {
    return this.api.post<CartResponse>('cart', { items });
  }

  /**
   * GET /api/v1/cart
   */
  getServerCart(): Observable<CartItem[]> {
    return this.api.get<CartItem[]>('cart');
  }

  // ── Quotes ────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/quotes
   */
  getQuotes(): Observable<Quote[]> {
    return this.api.get<Quote[]>('quotes');
  }

  /**
   * POST /api/v1/quotes
   */
  createQuote(items: CartItem[]): Observable<Quote> {
    return this.api.post<Quote>('quotes', { items });
  }

  /**
   * GET /api/v1/quotes/:id
   */
  getQuoteById(id: string): Observable<Quote> {
    return this.api.get<Quote>(`quotes/${id}`);
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/orders
   */
  getOrders(): Observable<unknown[]> {
    return this.api.get<unknown[]>('orders');
  }

  /**
   * GET /api/v1/orders/:id/track
   */
  trackOrder(orderId: string): Observable<unknown> {
    return this.api.get<unknown>(`orders/${orderId}/track`);
  }
}
