import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { ApiMaterial } from '../../models/product.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';

@Component({
  selector: 'app-material-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, InrCurrencyPipe, LayoutWrapperComponent],
  template: `
  <app-layout-wrapper layoutType="full">
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <aside class="hidden lg:flex w-1/3 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-col relative">
        <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(circle, #0D4C6A 1px, transparent 1px); background-size: 30px 30px;"></div>
        <div class="relative z-10 flex-1 flex items-center justify-center p-12">
          @if (material()?.image) {
            <img [src]="material()!.image!" [alt]="material()!.name" class="object-contain w-full h-full max-h-[70vh] transition-transform duration-500 hover:scale-105" />
          } @else {
            <div class="flex flex-col items-center gap-3 text-gray-300 dark:text-gray-700 select-none">
              <span class="material-icons text-9xl">precision_manufacturing</span>
              <span class="text-sm font-mono uppercase tracking-widest">No Image Available</span>
            </div>
          }
        </div>
        <div class="absolute top-6 left-6 z-20 flex flex-col gap-2">
          @if (material()?.industry) {
            <span class="bg-zoeing-gold text-zoeing-navy text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-sm">
              {{ material()!.industry }}
            </span>
          }
          @if (isEconomySeries()) {
            <span class="bg-zoeing-navy text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-sm">
              Economy Series
            </span>
          }
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto relative">
        <div class="max-w-4xl mx-auto p-6 lg:p-12">
          <nav class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-8">
            <button (click)="goBack()" class="flex items-center gap-1 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">
              <span class="material-icons text-sm">arrow_back</span> Back
            </button>
            @if (material()?.category) {
              <span class="material-icons text-[12px]">chevron_right</span>
              <a [routerLink]="['/product-list']" [queryParams]="{ category: material()!.category }" class="hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">{{ material()!.category }}</a>
            }
            @if (material()?.sub_category) {
              <span class="material-icons text-[12px]">chevron_right</span>
              <a [routerLink]="['/product-list']" [queryParams]="{ category: material()!.category, subCategory: material()!.sub_category }" class="hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">{{ material()!.sub_category }}</a>
            }
            <span class="material-icons text-[12px]">chevron_right</span>
            <span class="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{{ material()?.name }}</span>
          </nav>

          @if (loading()) {
            <div class="space-y-8 animate-pulse">
              <div class="h-12 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
              <div class="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div class="grid grid-cols-2 gap-4">
                <div class="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div class="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
            </div>
          } @else if (notFound()) {
            <div class="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-600">
              <span class="material-icons text-6xl mb-4">inventory_2</span>
              <p class="text-xl font-semibold mb-2">Product not found</p>
              <a routerLink="/inventory" class="btn-primary">Browse Inventory</a>
            </div>
          } @else if (material()) {
            <div class="space-y-10">
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ material()!.product_code }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-zoeing-gold/20 text-zoeing-gold uppercase tracking-wide border border-zoeing-gold/30">Verified Grade</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-display font-black text-zoeing-navy dark:text-white leading-tight">{{ material()!.name || material()!.product_code }}</h1>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                  <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                    <span class="material-icons text-sm">description</span> Technical Description
                  </h2>
                  @if (material()!.description) {
                    <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ material()!.description }}</p>
                  } @else {
                    <p class="text-sm italic text-gray-400">No detailed description available for this component.</p>
                  }
                </div>

                <div class="md:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                  <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                      <span class="material-icons text-sm">fact_check</span> Technical Specifications
                    </h2>
                  </div>
                  <table class="w-full text-sm text-left">
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      @for (spec of specifications(); track spec.label) {
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium w-1/3">{{ spec.label }}</td>
                          <td class="py-3 px-4 font-mono text-gray-900 dark:text-white">{{ spec.value }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <div class="md:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                  <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                    <span class="material-icons text-sm">attach_file</span> Documentation
                  </h2>
                  <div class="flex flex-wrap gap-3">
                    @for (url of attachments(); track url; let i = $index) {
                      <a [href]="url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                        <span class="material-icons text-sm text-red-500">picture_as_pdf</span>
                        Datasheet {{ i + 1 }}
                      </a>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </main>

      <div class="hidden lg:flex w-80 shrink-0 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col p-6 relative">
        <div class="sticky top-6 space-y-8">
          <div class="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Unit Price</p>
            @if (material()?.price) {
              <div class="flex items-baseline gap-2">
                <p class="text-4xl font-display font-black text-zoeing-navy dark:text-white">{{ material()!.price | inrCurrency }}</p>
              </div>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                Exclusive of GST (18%) <br>
                Bulk pricing available upon request.
              </p>
            } @else {
              <p class="text-xl font-bold text-gray-500 dark:text-gray-400">Price on Request</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                Contact our technical team for custom pricing based on volume.
              </p>
            }
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Quantity</span>
              <span class="text-xs font-mono text-gray-400">{{ material()?.count }} available</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 flex items-center border border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <button (click)="decreaseQty()" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span class="material-icons text-lg">remove</span>
                </button>
                <span class="flex-1 text-center font-mono font-bold text-lg">{{ qty() }}</span>
                <button (click)="increaseQty()" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span class="material-icons text-lg">add</span>
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              @if (inStock()) {
                <button (click)="onAddToCart()" [class]="addedFeedback() ? 'bg-green-600 text-white' : 'bg-zoeing-navy text-white hover:bg-zoeing-navy-light'" class="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2">
                  <span class="material-icons text-base">{{ addedFeedback() ? 'check_circle' : 'add_shopping_cart' }}</span>
                  {{ addedFeedback() ? 'Added to Cart' : 'Add to Cart' }}
                </button>
              } @else {
                <button (click)="onRequestMail()" class="w-full py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 transition-all shadow-md flex items-center justify-center gap-2">
                  <span class="material-icons text-base">mail</span>
                  Request by Mail
                </button>
              }
              <button (click)="onQuote()" class="w-full py-3 rounded-xl bg-zoeing-secondary text-white font-bold text-sm hover:bg-zoeing-secondary-dark transition-all shadow-md flex items-center justify-center gap-2">
                <span class="material-icons text-base">description</span>
                Request Technical Quote
              </button>
            </div>
          </div>

          <div class="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span class="material-icons text-green-500 text-sm">verified_user</span>
              <span class="text-[11px] font-medium text-gray-600 dark:text-gray-300">Quality Assured Compliance</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span class="material-icons text-blue-500 text-sm">local_shipping</span>
              <span class="text-[11px] font-medium text-gray-600 dark:text-gray-300">Express Dispatch Logistics</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span class="material-icons text-amber-500 text-sm">support_agent</span>
              <span class="text-[11px] font-medium text-gray-600 dark:text-gray-300">Expert Sourcing Support</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:hidden flex flex-col p-6 space-y-8">
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center justify-center min-h-64">
          @if (material()?.image) {
            <img [src]="material()!.image!" [alt]="material()!.name" class="object-contain max-h-64" />
          } @else {
            <span class="material-icons text-6xl text-gray-300">precision_manufacturing</span>
          }
        </div>

        <div class="space-y-6">
          <h1 class="text-3xl font-display font-black text-zoeing-navy dark:text-white">{{ material()?.name }}</h1>
          <div class="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div class="flex items-baseline gap-2 mb-4">
              <p class="text-2xl font-display font-black text-zoeing-navy dark:text-white">{{ material()?.price | inrCurrency }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 flex items-center border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                <button (click)="decreaseQty()" class="px-4 py-2 bg-gray-100 dark:bg-gray-800"><span class="material-icons text-sm">remove</span></button>
                <span class="flex-1 text-center font-bold">{{ qty() }}</span>
                <button (click)="increaseQty()" class="px-4 py-2 bg-gray-100 dark:bg-gray-800"><span class="material-icons text-sm">add</span></button>
              </div>
            </div>
            <button (click)="onAddToCart()" class="w-full py-3 rounded-xl bg-zoeing-navy text-white font-bold">Add to Cart</button>
            <button (click)="onQuote()" class="w-full py-3 rounded-xl bg-zoeing-secondary text-white font-bold">Request Quote</button>
          </div>
        </div>
      </div>
    </div>
  </app-layout-wrapper>
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

  readonly isEconomySeries = computed(() => {
    const m = this.material();
    return m?.industry === 'Economy Series' || m?.description?.toLowerCase().includes('economy series');
  });

  readonly specifications = computed(() => {
    const m = this.material();
    if (!m) return [];
    return [
      { label: 'Product Code', value: m.product_code },
      { label: 'Manufacturer/Brand', value: m.brand || 'ZOIENG' },
      { label: 'Category', value: m.category || 'General' },
      { label: 'Sub-Category', value: m.sub_category || 'General' },
      { label: 'Industrial Sector', value: m.industry || 'General Manufacturing' },
      { label: 'Availability', value: this.inStock() ? `${m.count} units in stock` : 'Out of Stock' },
      { label: 'Price', value: m.price ? `${m.price} (Excl. GST)` : 'On Request' },
    ];
  });

  readonly attachments = computed(() => {
    const m = this.material();
    if (!m) return [];
    const urls = [m.attachment_1, m.attachment_2, m.attachment_3, m.attachment_4];
    return urls.filter((u): u is string => !!u);
  });

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
