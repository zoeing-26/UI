// ─── Product Models ───────────────────────────────────────────────────────────

export type ProductSeries = 'economy' | 'standard' | 'premium';
export type ProductCategory =
  | 'automation' | 'fasteners' | 'materials' | 'wiring'
  | 'electrical' | 'cutting-tools' | 'processing-tools'
  | 'material-handling' | 'safety' | 'lab' | 'press-die'
  | 'plastic-mold' | 'injection-molding';

export interface Product {
  id: string;
  name: string;
  nameHi?: string;         // Hindi translation
  brand: string;
  brandLogo?: string;
  category: ProductCategory;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  images?: string[];
  series: ProductSeries;
  inStock: boolean;
  partNumber?: string;
  tags?: string[];
  description?: string;
  specifications?: Record<string, string>;
  minOrderQty?: number;
  leadTimeDays?: number;
  has3DCAD?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  category?: string;
  subCategory?: string;
  brand?: string;
  series?: ProductSeries;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Category Models ──────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  nameHi?: string;
  icon?: string;
  slug: string;
  children?: SubCategory[];
  productCount?: number;
}

export interface SubCategory {
  id: string;
  name: string;
  nameHi?: string;
  parentId: string;
  slug: string;
  productCount?: number;
}

// ─── API Category Models (v1/materials response) ──────────────────────────────

export interface ApiMaterialAttachment {
  name: string;
  file: string;
}

export interface ApiMaterial {
  id: number;
  name?: string;
  description: string | null;
  count: number;
  price: string | number | null;  // API returns price as string e.g. "1250.00"
  product_code: string;
  image: string | null;
  industry: string | null;
  category?: string;
  brand?: string | null;
  sub_category?: string;
  attachment?: ApiMaterialAttachment[];
}

export interface AllMaterialsResponse {
  message: string;
  materials: ApiMaterial[];
}

// Shape returned by GET /v1/brand_materials
export interface ApiBrand {
  id: number;
  name: string;
  materials: ApiMaterial[];
}

export interface ApiSubProduct {
  name: string;
  materials: ApiMaterial[];
}

export interface ApiCategory {
  name: string;
  sub_category: ApiSubProduct[];
}

// ─── Brand Models ─────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  logoUrl?: string;
  bgColor?: string;
  textColor?: string;
  slug: string;
  featured?: boolean;
}

// ─── Banner / Slide Models ────────────────────────────────────────────────────

export interface Banner {
  id: string;
  title: string;
  titleHi?: string;
  subtitle?: string;
  subtitleHi?: string;
  description?: string;
  bgColor: string;
  textColor?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaPrice?: number;
  bullets?: string[];
  badge?: string;
  theme: 'dark' | 'light';
  order: number;
  active: boolean;
}

// ─── Cart Models ──────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  product: Product;
  qty: number;
  price: number;
  totalPrice: number;
}

export interface MaterialCartItem {
  materialId: number;
  material: ApiMaterial;
  qty: number;
  price: number;      // 0 when material.price is null
  totalPrice: number;
}

export interface CartResponse {
  success: boolean;
  cartId: string;
  itemCount: number;
  total: number;
}

// ─── Quote Models ─────────────────────────────────────────────────────────────

export interface Quote {
  id: string;
  quoteNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  items: CartItem[];
  total: number;
  validUntil: string;
  createdAt: string;
}

// ─── Auth Models ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  company?: string;
  gstNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  gstNumber?: string;
  role: 'customer' | 'admin' | 'sales';
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
