import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { ApiMaterial } from '../../models/product.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-material-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  template: `
  <main class="max-w-screen-xl mx-auto px-4 py-8">

    <!-- Back / Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-6">
      <button (click)="goBack()"
        class="flex items-center gap-1 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">
        <span class="material-icons text-sm">arrow_back</span>
        Back
      </button>
      @if (material()?.category) {
        <span class="material-icons text-[12px]">chevron_right</span>
        <a [routerLink]="['/product-list']"
           [queryParams]="{ category: material()!.category }"
           class="hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">
          {{ material()!.category }}
        </a>
      }
      @if (material()?.sub_category) {
        <span class="material-icons text-[12px]">chevron_right</span>
        <a [routerLink]="['/product-list']"
           [queryParams]="{ category: material()!.category, subCategory: material()!.sub_category }"
           class="hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">
          {{ material()!.sub_category }}
        </a>
      }
      @if (material()?.name) {
        <span class="material-icons text-[12px]">chevron_right</span>
        <span class="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{{ material()!.name }}</span>
      }
    </div>

    <!-- Loading skeleton -->
    @if (loading()) {
      <div class="grid lg:grid-cols-2 gap-8 animate-pulse">
        <div class="rounded-xl bg-gray-100 dark:bg-gray-800 h-96"></div>
        <div class="space-y-4">
          <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
          <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
          <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div class="h-12 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
          <div class="flex gap-3">
            <div class="h-10 bg-gray-100 dark:bg-gray-800 rounded flex-1"></div>
            <div class="h-10 bg-gray-100 dark:bg-gray-800 rounded flex-1"></div>
          </div>
        </div>
      </div>
    }

    <!-- Not found -->
    @else if (notFound()) {
      <div class="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-600">
        <span class="material-icons text-6xl mb-4">inventory_2</span>
        <p class="text-xl font-semibold mb-2">Product not found</p>
        <p class="text-sm mb-6">This product may have been removed or the link is invalid.</p>
        <a routerLink="/inventory" class="btn-primary">Browse Inventory</a>
      </div>
    }

    <!-- Detail content -->
    @else if (material()) {
      <div class="grid lg:grid-cols-2 gap-8 xl:gap-12">

        <!-- LEFT: Image panel -->
        <div class="flex flex-col gap-4">
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                      flex items-center justify-center relative overflow-hidden" style="min-height:380px">
            @if (material()!.image) {
              <img [src]="material()!.image!" [alt]="material()!.name"
                   class="object-contain p-8 w-full" style="max-height:360px" />
            } @else {
              <div class="flex flex-col items-center gap-3 text-gray-300 dark:text-gray-700 select-none">
                <span class="material-icons text-8xl">precision_manufacturing</span>
                <span class="text-sm">No image available</span>
              </div>
            }

            <!-- Industry badge -->
            @if (material()!.industry) {
              <span class="absolute top-4 left-4 bg-brand-yellow text-brand-blue-dark text-xs font-bold
                           px-2.5 py-1 rounded uppercase tracking-wide">
                {{ material()!.industry }}
              </span>
            }
          </div>

          <!-- Info chips below image -->
          <div class="flex flex-wrap gap-2">
            @if (material()!.category) {
              <span class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <span class="material-icons text-[14px] text-blue-500">category</span>
                {{ material()!.category }}
              </span>
            }
            @if (material()!.sub_category) {
              <span class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <span class="material-icons text-[14px] text-violet-500">layers</span>
                {{ material()!.sub_category }}
              </span>
            }
            @if (material()!.brand) {
              <span class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <span class="material-icons text-[14px] text-amber-500">verified</span>
                {{ material()!.brand }}
              </span>
            }
          </div>
        </div>

        <!-- RIGHT: Detail panel -->
        <div class="flex flex-col gap-5">

          <!-- Product code + series -->
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {{ material()!.product_code }}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30
                         text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              Economy Series
            </span>
          </div>

          <!-- Name -->
          <h1 class="text-2xl sm:text-3xl font-bold text-zoeing-navy dark:text-white leading-snug">
            {{ material()!.name || material()!.product_code }}
          </h1>

          <!-- Stock status -->
          <div class="flex items-center gap-2">
            @if (inStock()) {
              <span class="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                In Stock
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500">
                ({{ material()!.count }} units available)
              </span>
            } @else {
              <span class="flex items-center gap-1.5 text-sm font-semibold text-red-500 dark:text-red-400">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                Out of Stock
              </span>
            }
          </div>

          <!-- Price -->
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4">
            @if (material()!.price) {
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">Price from</p>
              <p class="text-3xl font-extrabold text-zoeing-secondary dark:text-zoeing-secondary-light">
                {{ material()!.price! | inrCurrency }}
              </p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Exclusive of GST · Bulk pricing available</p>
            } @else {
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">Price on Request</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Contact us for bulk or custom pricing</p>
            }
          </div>

          <!-- Qty + Actions -->
          <div class="flex flex-col gap-3">

            @if (inStock()) {
              <!-- Qty selector -->
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">Qty:</span>
                <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                  <button (click)="decreaseQty()"
                    class="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors font-bold text-lg leading-none">−</button>
                  <span class="px-4 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 min-w-[2.5rem] text-center">
                    {{ qty() }}
                  </span>
                  <button (click)="increaseQty()"
                    class="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors font-bold text-lg leading-none">+</button>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex gap-3">
                <button (click)="onAddToCart()"
                  class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm
                         transition-colors"
                  [class]="addedFeedback()
                    ? 'bg-green-600 text-white'
                    : 'bg-zoeing-primary hover:bg-zoeing-primary-light text-white'">
                  <span class="material-icons text-base">{{ addedFeedback() ? 'check_circle' : 'add_shopping_cart' }}</span>
                  {{ addedFeedback() ? 'Added!' : 'Add to Cart' }}
                </button>
                <button (click)="onQuote()"
                  class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm
                         bg-zoeing-secondary hover:bg-zoeing-secondary-dark text-white transition-colors">
                  <span class="material-icons text-base">description</span>
                  Request Quote
                </button>
              </div>
            } @else {
              <!-- Qty selector for out-of-stock too -->
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">Qty:</span>
                <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                  <button (click)="decreaseQty()"
                    class="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors font-bold text-lg leading-none">−</button>
                  <span class="px-4 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 min-w-[2.5rem] text-center">
                    {{ qty() }}
                  </span>
                  <button (click)="increaseQty()"
                    class="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors font-bold text-lg leading-none">+</button>
                </div>
              </div>
              <button (click)="onRequestMail()"
                class="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm
                       bg-brand-blue hover:bg-brand-blue/90 text-white transition-colors">
                <span class="material-icons text-base">add_shopping_cart</span>
                Add to Cart (Request by Mail)
              </button>
            }
          </div>

          <!-- Trust badges -->
          <div class="flex flex-wrap gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span class="material-icons text-sm text-green-500">verified_user</span>
              Quality Assured
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span class="material-icons text-sm text-blue-500">local_shipping</span>
              Fast Dispatch
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span class="material-icons text-sm text-amber-500">support_agent</span>
              Expert Support
            </div>
          </div>
        </div>
      </div>

      <!-- Datasheets & Manuals -->
      @if (material()!.attachment?.length) {
        <div class="mt-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 class="text-base font-bold text-zoeing-navy dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-base text-zoeing-navy dark:text-zoeing-gold">attach_file</span>
            Datasheets &amp; Manuals
          </h2>
          <div class="flex flex-col gap-2">
            @for (doc of material()!.attachment!; track doc.file) {
              <a [href]="doc.file" target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400
                        hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                <span class="material-icons text-[16px] text-red-500">picture_as_pdf</span>
                {{ doc.name }}
              </a>
            }
          </div>
        </div>
      }

      <!-- Description + Specifications -->
      <div class="mt-10 grid lg:grid-cols-2 gap-6">

        <!-- Description -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 class="text-base font-bold text-zoeing-navy dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-base text-zoeing-navy dark:text-zoeing-gold">description</span>
            Description
          </h2>
          @if (material()!.description) {
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {{ material()!.description }}
            </p>
          } @else {
            <div class="flex flex-col items-center py-6 text-gray-300 dark:text-gray-700">
              <span class="material-icons text-3xl mb-2">notes</span>
              <p class="text-sm">No description available for this product.</p>
              <p class="text-xs mt-1 text-gray-400">Contact us for detailed specifications.</p>
            </div>
          }
        </div>

        <!-- Product Specifications -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 class="text-base font-bold text-zoeing-navy dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-base text-zoeing-navy dark:text-zoeing-gold">fact_check</span>
            Product Details
          </h2>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium w-40">Product Code</td>
                <td class="py-2.5 font-mono text-gray-800 dark:text-gray-100">{{ material()!.product_code }}</td>
              </tr>
              @if (material()!.name) {
                <tr>
                  <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium">Name</td>
                  <td class="py-2.5 text-gray-800 dark:text-gray-100">{{ material()!.name }}</td>
                </tr>
              }
              @if (material()!.category) {
                <tr>
                  <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium">Category</td>
                  <td class="py-2.5 text-gray-800 dark:text-gray-100">{{ material()!.category }}</td>
                </tr>
              }
              @if (material()!.sub_category) {
                <tr>
                  <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium">Sub-Category</td>
                  <td class="py-2.5 text-gray-800 dark:text-gray-100">{{ material()!.sub_category }}</td>
                </tr>
              }
              @if (material()!.industry) {
                <tr>
                  <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium">Industry</td>
                  <td class="py-2.5 text-gray-800 dark:text-gray-100">{{ material()!.industry }}</td>
                </tr>
              }
              @if (material()!.brand) {
                <tr>
                  <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium">Brand</td>
                  <td class="py-2.5 text-gray-800 dark:text-gray-100">{{ material()!.brand }}</td>
                </tr>
              }
              <tr>
                <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium">Availability</td>
                <td class="py-2.5">
                  @if (inStock()) {
                    <span class="text-green-600 dark:text-green-400 font-semibold">In Stock ({{ material()!.count }})</span>
                  } @else {
                    <span class="text-red-500 dark:text-red-400 font-semibold">Out of Stock</span>
                  }
                </td>
              </tr>
              @if (material()!.price) {
                <tr>
                  <td class="py-2.5 pr-4 text-gray-400 dark:text-gray-500 font-medium">Price</td>
                  <td class="py-2.5 font-semibold text-zoeing-secondary dark:text-zoeing-secondary-light">
                    {{ material()!.price! | inrCurrency }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

  </main>
  `,
})
export class MaterialDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cart = inject(CartService);

  material = signal<ApiMaterial | null>(null);
  loading = signal(true);
  notFound = signal(false);
  addedFeedback = signal(false);
  qty = signal(1);

  inStock = computed(() => (this.material()?.count ?? 0) > 0);

  ngOnInit(): void {
    const state = history.state as { material?: ApiMaterial };
    if (state?.material?.id) {
      this.material.set(state.material);
      this.loading.set(false);
    } else {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.productService.getMaterialById(id).subscribe({
        next: mat => {
          if (mat) {
            this.material.set(mat);
          } else {
            this.notFound.set(true);
          }
          this.loading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    }
  }

  goBack(): void { history.back(); }

  increaseQty(): void { this.qty.update(q => q + 1); }
  decreaseQty(): void { this.qty.update(q => Math.max(1, q - 1)); }

  onAddToCart(): void {
    const m = this.material();
    if (!m) return;
    this.cart.addMaterial(m, this.qty());
    this.addedFeedback.set(true);
    setTimeout(() => this.addedFeedback.set(false), 1500);
  }

  onQuote(): void {
    const m = this.material();
    if (!m) return;
    const items: unknown[] = JSON.parse(localStorage.getItem('quoteItems') || '[]');
    const exists = (items as { id: number }[]).find(i => i.id === m.id);
    if (!exists) {
      items.push({
        id: m.id, name: m.name, product_code: m.product_code,
        image: m.image, price: m.price ?? 0, qty: this.qty(), industry: m.industry,
      });
      localStorage.setItem('quoteItems', JSON.stringify(items));
    }
    this.router.navigate(['/quote']);
  }

  onRequestMail(): void {
    const m = this.material();
    if (!m) return;
    this.cart.addMaterial(m, this.qty());
    this.router.navigate(['/cart']);
  }
}
