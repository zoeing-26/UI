import { Injectable, signal, computed } from '@angular/core';
import { CartItem, MaterialCartItem, Product, ApiMaterial } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly PRODUCT_KEY  = 'zoieng_cart';
  private readonly MATERIAL_KEY = 'zoieng_material_cart';

  private _items    = signal<CartItem[]>(this.load<CartItem[]>(this.PRODUCT_KEY));
  private _matItems = signal<MaterialCartItem[]>(this.load<MaterialCartItem[]>(this.MATERIAL_KEY));

  readonly items        = this._items.asReadonly();
  readonly matItems     = this._matItems.asReadonly();
  readonly count        = computed(() =>
    this._items().length + this._matItems().length
  );
  readonly total        = computed(() =>
    this._items().reduce((s, i) => s + i.price * i.qty, 0) +
    this._matItems().reduce((s, i) => s + i.price * i.qty, 0)
  );
  readonly isEmpty      = computed(() => this._items().length === 0 && this._matItems().length === 0);

  // ── Product cart ───────────────────────────────────────────────────────────

  add(product: Product, qty = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.productId === product.id);
      if (existing) {
        return items.map(i =>
          i.productId === product.id
            ? { ...i, qty: i.qty + qty, totalPrice: (i.qty + qty) * i.price }
            : i
        );
      }
      return [...items, { productId: product.id, product, qty, price: product.price, totalPrice: product.price * qty }];
    });
    this.persist(this.PRODUCT_KEY, this._items());
  }

  remove(productId: string): void {
    this._items.update(items => items.filter(i => i.productId !== productId));
    this.persist(this.PRODUCT_KEY, this._items());
  }

  updateQty(productId: string, qty: number): void {
    if (qty <= 0) { this.remove(productId); return; }
    this._items.update(items =>
      items.map(i => i.productId === productId ? { ...i, qty, totalPrice: qty * i.price } : i)
    );
    this.persist(this.PRODUCT_KEY, this._items());
  }

  // ── Material cart ──────────────────────────────────────────────────────────

  addMaterial(material: ApiMaterial, qty = 1): void {
    const price = typeof material.price === 'string' ? parseFloat(material.price) || 0 : (material.price ?? 0);
    this._matItems.update(items => {
      const existing = items.find(i => i.materialId === material.id);
      if (existing) {
        return items.map(i =>
          i.materialId === material.id
            ? { ...i, qty: i.qty + qty, totalPrice: (i.qty + qty) * price }
            : i
        );
      }
      return [...items, { materialId: material.id, material, qty, price, totalPrice: price * qty }];
    });
    this.persist(this.MATERIAL_KEY, this._matItems());
  }

  removeMaterial(materialId: number): void {
    this._matItems.update(items => items.filter(i => i.materialId !== materialId));
    this.persist(this.MATERIAL_KEY, this._matItems());
  }

  updateMaterialQty(materialId: number, qty: number): void {
    if (qty <= 0) { this.removeMaterial(materialId); return; }
    this._matItems.update(items =>
      items.map(i => i.materialId === materialId ? { ...i, qty, totalPrice: qty * i.price } : i)
    );
    this.persist(this.MATERIAL_KEY, this._matItems());
  }

  clear(): void {
    this._items.set([]);
    this._matItems.set([]);
    localStorage.removeItem(this.PRODUCT_KEY);
    localStorage.removeItem(this.MATERIAL_KEY);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private persist(key: string, data: unknown): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private load<T>(key: string): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [] as T;
    }
  }
}
