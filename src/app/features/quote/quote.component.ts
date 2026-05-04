import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';

interface QuoteItem {
  id: number | string;
  name: string;
  product_code: string;
  image: string | null;
  price: number;
  qty: number;
  industry?: string;
}

const STORAGE_KEY = 'quoteItems';
type Step         = 'method' | 'details' | 'submitted';
type MethodCard   = 'guest' | 'returning' | 'new' | null;
type CustomerType = 'individual' | 'company';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <main class="max-w-screen-xl mx-auto px-4 py-8">

    <!-- Breadcrumb -->
    <nav class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-4">
      <a routerLink="/" class="hover:text-brand-blue">Home</a>
      <span class="material-icons text-[12px]">chevron_right</span>
      <a routerLink="/inventory" class="hover:text-brand-blue">Products</a>
      <span class="material-icons text-[12px]">chevron_right</span>
      <span class="text-gray-600 dark:text-gray-300">Request for Quote</span>
    </nav>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-zoeing-navy dark:text-white">Request for Quote</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in your details and we'll get back to you with pricing.</p>
    </div>

    <!-- ══ SUCCESS ═══════════════════════════════════════════════════════════ -->
    @if (step() === 'submitted') {
      <div class="max-w-lg mx-auto text-center py-16">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <span class="material-icons text-3xl text-green-600 dark:text-green-400">check_circle</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Quote Submitted!</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Thank you! Our team will review your request and contact you within 24 hours.
        </p>
        @if (apiResponse()) {
          <div class="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-xs font-mono text-gray-600 dark:text-gray-300 overflow-auto max-h-48">
            <p class="text-[10px] font-sans font-semibold uppercase tracking-wide text-gray-400 mb-1">API Response</p>
            {{ apiResponse() | json }}
          </div>
        }
        <div class="flex gap-3 justify-center">
          <a routerLink="/inventory"
             class="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Continue Shopping
          </a>
          <a routerLink="/"
             class="px-5 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 transition-colors">
            Go Home
          </a>
        </div>
      </div>

    <!-- ══ MAIN TWO-COLUMN LAYOUT ════════════════════════════════════════════ -->
    } @else {
      <div class="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

        <!-- ── LEFT: Quote items (always visible) ─────────────────────────── -->
        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-gray-800 dark:text-gray-100">
              Quote Items
              @if (items().length > 0) {
                <span class="ml-1.5 text-xs font-normal text-gray-400">({{ items().length }})</span>
              }
            </h2>
            @if (items().length > 0) {
              <button (click)="clearAll()"
                class="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-0.5">
                <span class="material-icons text-[14px]">delete_sweep</span> Clear all
              </button>
            }
          </div>

          @if (formErrors()['items']) {
            <p class="text-xs text-red-500 flex items-center gap-1">
              <span class="material-icons text-[14px]">error</span>{{ formErrors()['items'] }}
            </p>
          }

          @if (items().length === 0) {
            <div class="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
              <span class="material-icons text-4xl text-gray-300 dark:text-gray-600 mb-2 block">inventory_2</span>
              <p class="text-sm text-gray-500 dark:text-gray-400">No products added yet.</p>
            </div>
          } @else {
            @for (item of items(); track item.id) {
              <div class="flex items-center gap-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5">
                <div class="w-10 h-10 shrink-0 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  @if (item.image) {
                    <img [src]="item.image" [alt]="item.name" class="w-full h-full object-contain p-0.5" loading="lazy" />
                  } @else {
                    <span class="material-icons text-base text-gray-300 dark:text-gray-600">image</span>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-1">{{ item.name }}</p>
                  <p class="text-[10px] text-gray-400 font-mono">{{ item.product_code }}</p>
                  @if (item.price > 0) {
                    <p class="text-[10px] text-zoeing-secondary font-semibold">{{ item.price | inrCurrency }} × {{ item.qty }}</p>
                  }
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button class="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                          (click)="updateQty(item.id,-1)" [disabled]="item.qty<=1">−</button>
                  <span class="w-5 text-center text-xs font-semibold text-gray-800 dark:text-gray-100 select-none">{{ item.qty }}</span>
                  <button class="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          (click)="updateQty(item.id,1)">+</button>
                </div>
                <button class="shrink-0 text-gray-300 hover:text-red-500 transition-colors" (click)="removeItem(item.id)">
                  <span class="material-icons text-sm">close</span>
                </button>
              </div>
            }
          }

          <!-- Note: product not in catalog -->
          <div class="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 px-3 py-2.5 mt-1">
            <span class="material-icons text-amber-500 dark:text-amber-400 text-base shrink-0 mt-0.5">lightbulb</span>
            <p class="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <span class="font-bold">Can't find your product?</span>
              You can manually enter the
              <span class="font-semibold underline decoration-dotted">Product Name</span>,
              <span class="font-semibold underline decoration-dotted">Brand</span>,
              <span class="font-semibold underline decoration-dotted">Product ID / Code</span> and
              <span class="font-semibold underline decoration-dotted">Quantity</span> below,
              or upload a file (catalogue, BOM, drawing) — our team will source it for you.
            </p>
          </div>

          <!-- Add manually — always visible -->
          <button
            class="flex items-center justify-center gap-1.5 w-full rounded-lg border text-xs font-semibold py-2 transition-colors"
            [class]="showManualForm() ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white'"
            (click)="showManualForm.set(!showManualForm())"
          >
            <span class="material-icons text-sm">{{ showManualForm() ? 'remove_circle_outline' : 'add_circle_outline' }}</span>
            {{ showManualForm() ? 'Cancel' : 'Add Products Manually' }}
          </button>

          @if (showManualForm()) {
            <div class="border border-brand-blue/30 dark:border-brand-blue/40 rounded-lg p-3 space-y-2.5 bg-blue-50/50 dark:bg-blue-900/10">
              <p class="text-[11px] font-bold text-brand-blue dark:text-blue-400 uppercase tracking-wide flex items-center gap-1">
                <span class="material-icons text-sm">edit_note</span>Enter Product Details
              </p>
              <div class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                  <label class="block text-[10px] font-bold text-brand-blue dark:text-blue-400 mb-0.5 uppercase tracking-wide">Product Name <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="manualForm.name" placeholder="e.g. Linear Guide Rail"
                    class="w-full border-2 border-brand-blue/40 dark:border-blue-500/40 rounded px-2 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-brand-blue dark:text-blue-400 mb-0.5 uppercase tracking-wide">Brand</label>
                  <input type="text" [(ngModel)]="manualForm.brand" placeholder="e.g. MISUMI, SMC"
                    class="w-full border-2 border-brand-blue/40 dark:border-blue-500/40 rounded px-2 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-brand-blue dark:text-blue-400 mb-0.5 uppercase tracking-wide">Product ID / Code</label>
                  <input type="text" [(ngModel)]="manualForm.product_code" placeholder="e.g. LG-25-500"
                    class="w-full border-2 border-brand-blue/40 dark:border-blue-500/40 rounded px-2 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-brand-blue dark:text-blue-400 mb-0.5 uppercase tracking-wide">Quantity <span class="text-red-500">*</span></label>
                  <input type="number" [(ngModel)]="manualForm.qty" min="1" placeholder="1"
                    class="w-full border-2 border-brand-blue/40 dark:border-blue-500/40 rounded px-2 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
              </div>
              @if (manualFormError()) {
                <p class="text-[11px] text-red-500 flex items-center gap-1">
                  <span class="material-icons text-[13px]">error</span>{{ manualFormError() }}
                </p>
              }
              <button
                class="w-full py-1.5 bg-brand-blue text-white text-xs font-semibold rounded hover:bg-brand-blue/90 transition-colors flex items-center justify-center gap-1"
                (click)="addManualItem()"
              >
                <span class="material-icons text-sm">add</span>Add to Quote
              </button>
            </div>
          }

          <!-- Browse Products button -->
          <a routerLink="/inventory"
             class="flex items-center justify-center gap-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold py-2 text-gray-600 dark:text-gray-300 hover:border-brand-blue hover:text-brand-blue dark:hover:border-brand-yellow dark:hover:text-brand-yellow transition-colors">
            <span class="material-icons text-sm">storefront</span>
            Browse All Products
          </a>

          <!-- OR + Upload — always visible -->
          <div class="flex items-center gap-2 my-2">
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500">OR</span>
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors"
               (click)="fileInput.click()">
            <span class="material-icons text-2xl text-gray-400">cloud_upload</span>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Click to upload files</p>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">PDF, Word, Excel, images, ZIP, EXE and more</p>
            <input type="file" multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.exe,.msi,.jpg,.jpeg,.png,.gif,.bmp,.webp,.dwg,.dxf,.step,.stp,.igs,.iges"
              (change)="onFileSelected($event)" class="hidden" #fileInput />
          </div>

          @if (selectedFiles().length > 0) {
            <ul class="space-y-1">
              @for (f of selectedFiles(); track f.name; let fi = $index) {
                <li class="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded px-2 py-1.5">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="material-icons text-[14px] text-gray-400 shrink-0">insert_drive_file</span>
                    <span class="truncate text-gray-700 dark:text-gray-300">{{ f.name }}</span>
                  </div>
                  <button (click)="removeFile(fi)" class="ml-2 shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                    <span class="material-icons text-[13px]">close</span>
                  </button>
                </li>
              }
            </ul>
          }

          <!-- Pricing summary -->
          @if (items().length > 0) {
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-1.5 text-xs">
              <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Price Summary</p>

              @for (item of items(); track item.id) {
                <div class="flex items-center justify-between text-gray-700 dark:text-gray-300">
                  <span class="truncate max-w-[60%] text-[11px]">{{ item.name }}</span>
                  @if (item.price > 0) {
                    <span class="font-medium shrink-0">{{ item.price * item.qty | inrCurrency }}</span>
                  } @else {
                    <span class="italic text-gray-400 shrink-0">On Request</span>
                  }
                </div>
              }

              @if (subtotal() > 0) {
                <div class="border-t border-gray-100 dark:border-gray-800 pt-1.5 mt-1.5 space-y-1">
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span class="font-medium">{{ subtotal() | inrCurrency }}</span>
                  </div>
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>GST (18%)</span>
                    <span class="font-medium">{{ gst() | inrCurrency }}</span>
                  </div>
                  <div class="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1">
                    <span>Estimated Total</span>
                    <span class="text-zoeing-secondary">{{ grandTotal() | inrCurrency }}</span>
                  </div>
                </div>
              }

              @if (porCount() > 0) {
                <p class="text-[10px] text-amber-600 dark:text-amber-400 pt-1">
                  * {{ porCount() }} item{{ porCount() > 1 ? 's' : '' }} priced on request — final quote may vary.
                </p>
              }
            </div>
          }
        </section>

        <!-- ── RIGHT: Method or Details ────────────────────────────────────── -->
        <aside class="space-y-3 sticky top-24">

          <!-- ════════════ STEP: METHOD ══════════════════════════════════════ -->
          @if (step() === 'method') {
            <h2 class="font-bold text-gray-800 dark:text-white text-lg">
              Choose your preferred checkout method.
            </h2>

            <!-- ── Card 1: Guest Checkout ── -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <button
                class="w-full flex items-center justify-between px-5 py-4 text-left"
                (click)="toggleCard('guest')"
              >
                <div>
                  <p class="font-bold text-gray-800 dark:text-white">Guest Checkout</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">You don't need to sign up to continue.</p>
                </div>
                <span class="material-icons text-gray-400 transition-transform"
                      [class.rotate-180]="openCard() === 'guest'">expand_more</span>
              </button>

              @if (openCard() === 'guest') {
                <div class="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    <strong class="text-gray-700 dark:text-gray-300">Note:</strong>
                    You will have the opportunity to sign-up later.
                  </p>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name <span class="text-red-500">*</span></label>
                    <input type="text" [(ngModel)]="guestForm.name" placeholder="John Doe" [class]="inlineInputClass(authError() && !guestForm.name)" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span class="text-red-500">*</span></label>
                    <input type="email" [(ngModel)]="guestForm.email" placeholder="john@company.com" [class]="inlineInputClass(authError() && !guestForm.email)" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone <span class="text-red-500">*</span></label>
                    <input type="tel" [(ngModel)]="guestForm.phone" placeholder="+91 98765 43210" [class]="inlineInputClass(authError() && !guestForm.phone)" />
                  </div>
                  @if (authError() && openCard() === 'guest') {
                    <p class="text-xs text-red-500 flex items-center gap-1">
                      <span class="material-icons text-[13px]">error</span>{{ authError() }}
                    </p>
                  }
                  <button
                    class="w-full py-2.5 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors"
                    (click)="continueAsGuest()"
                  >Continue without registering</button>
                </div>
              }
            </div>

            <!-- ── Card 2: Returning Customer ── -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <button
                class="w-full flex items-center justify-between px-5 py-4 text-left"
                (click)="toggleCard('returning')"
              >
                <div>
                  <p class="font-bold text-gray-800 dark:text-white">Returning Customer</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Already have a web account? Login for a faster experience.</p>
                </div>
                <span class="material-icons text-gray-400 transition-transform"
                      [class.rotate-180]="openCard() === 'returning'">expand_more</span>
              </button>

              @if (openCard() === 'returning') {
                <div class="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                  @if (auth.isLoggedIn()) {
                    <!-- Already logged in -->
                    <div class="flex items-center gap-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span class="material-icons text-green-600 dark:text-green-400">account_circle</span>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{{ auth.user()?.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ auth.user()?.email }}</p>
                      </div>
                    </div>
                    <button
                      class="w-full py-2.5 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors"
                      (click)="continueAsReturning()"
                    >Continue as {{ auth.user()?.name }}</button>
                  } @else {
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span class="text-red-500">*</span></label>
                        <input type="email" [(ngModel)]="loginForm.email" placeholder="you@company.com" [class]="inlineInputClass(false)" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span class="text-red-500">*</span></label>
                        <input type="password" [(ngModel)]="loginForm.password" placeholder="••••••••" [class]="inlineInputClass(false)" />
                      </div>
                      @if (authError() && openCard() === 'returning') {
                        <p class="text-xs text-red-500 flex items-center gap-1">
                          <span class="material-icons text-[13px]">error</span>{{ authError() }}
                        </p>
                      }
                      <button
                        class="w-full py-2.5 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        (click)="continueAsReturning()"
                        [disabled]="submitting()"
                      >
                        @if (submitting() && openCard() === 'returning') {
                          <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>Logging in…
                        } @else { Login and Continue }
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- ── Card 3: New Customer ── -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <button
                class="w-full flex items-center justify-between px-5 py-4 text-left"
                (click)="toggleCard('new')"
              >
                <div>
                  <p class="font-bold text-gray-800 dark:text-white">New Customer</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Sign up to track orders and complete quotes faster.
                  </p>
                </div>
                <span class="material-icons text-gray-400 transition-transform"
                      [class.rotate-180]="openCard() === 'new'">expand_more</span>
              </button>

              @if (openCard() === 'new') {
                <div class="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    If you sign up you will be able to view your order history, track your order
                    progress and complete orders more quickly in future.
                  </p>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span class="text-red-500">*</span></label>
                    <input type="email" [(ngModel)]="registerForm.email" placeholder="you@company.com" [class]="inlineInputClass(authError() && !registerForm.email)" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span class="text-red-500">*</span></label>
                    <input type="password" [(ngModel)]="registerForm.password" placeholder="Min 8 characters" [class]="inlineInputClass(authError() && !registerForm.password)" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password <span class="text-red-500">*</span></label>
                    <input type="password" [(ngModel)]="registerForm.confirmPassword" placeholder="Re-enter password"
                      [class]="inlineInputClass(!!(authError() && registerForm.password !== registerForm.confirmPassword))" />
                  </div>
                  @if (authError() && openCard() === 'new') {
                    <p class="text-xs text-red-500 flex items-center gap-1">
                      <span class="material-icons text-[13px]">error</span>{{ authError() }}
                    </p>
                  }
                  <button
                    class="w-full py-2.5 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors"
                    (click)="continueAsNew()"
                  >Signup and continue</button>
                </div>
              }
            </div>

          <!-- ════════════ STEP: DETAILS ══════════════════════════════════════ -->
          } @else {
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">

              <!-- Back + heading -->
              <div class="flex items-center gap-3">
                <button class="text-gray-400 hover:text-brand-blue transition-colors"
                        (click)="backToMethod()">
                  <span class="material-icons text-xl">arrow_back</span>
                </button>
                <h2 class="font-semibold text-gray-800 dark:text-gray-100">Your Details</h2>
              </div>

              <!-- Individual / Company tabs -->
              <div class="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  class="flex-1 py-2 text-sm font-semibold transition-colors"
                  [class]="customerType() === 'individual'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  (click)="customerType.set('individual')"
                >
                  <span class="material-icons text-base align-middle mr-1">person</span>Individual
                </button>
                <button
                  class="flex-1 py-2 text-sm font-semibold transition-colors border-l border-gray-200 dark:border-gray-700"
                  [class]="customerType() === 'company'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  (click)="customerType.set('company')"
                >
                  <span class="material-icons text-base align-middle mr-1">business</span>Company
                </button>
              </div>

              <!-- Full Name -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input type="text" [(ngModel)]="detailsForm.full_name" placeholder="John Doe"
                  [class]="fieldClass('full_name')" />
                @if (formErrors()['full_name']) {
                  <p class="text-[11px] text-red-500 mt-1">{{ formErrors()['full_name'] }}</p>
                }
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input type="email" [(ngModel)]="detailsForm.email" placeholder="john@company.com"
                  [class]="fieldClass('email')" />
                @if (formErrors()['email']) {
                  <p class="text-[11px] text-red-500 mt-1">{{ formErrors()['email'] }}</p>
                }
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone <span class="text-red-500">*</span>
                </label>
                <input type="tel" [(ngModel)]="detailsForm.phone" placeholder="+91 98765 43210"
                  [class]="fieldClass('phone')" />
                @if (formErrors()['phone']) {
                  <p class="text-[11px] text-red-500 mt-1">{{ formErrors()['phone'] }}</p>
                }
              </div>

              <!-- Company Name — required for company, optional for individual -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                  @if (customerType() === 'company') {
                    <span class="text-red-500"> *</span>
                  } @else {
                    <span class="text-gray-400 font-normal"> (optional)</span>
                  }
                </label>
                <input type="text" [(ngModel)]="detailsForm.company_name" placeholder="ACME Corp"
                  [class]="fieldClass('company_name')" />
                @if (formErrors()['company_name']) {
                  <p class="text-[11px] text-red-500 mt-1">{{ formErrors()['company_name'] }}</p>
                }
              </div>

              <!-- Message -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirements / Message
                </label>
                <textarea [(ngModel)]="detailsForm.message" rows="3"
                  placeholder="Describe your requirements, delivery timeline, etc."
                  class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none">
                </textarea>
              </div>

              <!-- API error -->
              @if (apiError()) {
                <div class="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                  <span class="material-icons text-[14px]">error</span>{{ apiError() }}
                </div>
              }

              <!-- Submit -->
              <button
                class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                (click)="submitDetails()"
                [disabled]="submitting()"
              >
                @if (submitting()) {
                  <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>Submitting…
                } @else {
                  <span class="material-icons text-base">send</span>Submit Quote Request
                }
              </button>

            </div>
          }

        </aside>
      </div>
    }
  </main>
  `,
})
export class QuoteComponent implements OnInit {
  private productService = inject(ProductService);
  private route          = inject(ActivatedRoute);
  private cart           = inject(CartService);
  protected auth         = inject(AuthService);

  step         = signal<Step>('method');
  openCard     = signal<MethodCard>(null);
  customerType = signal<CustomerType>('individual');

  items         = signal<QuoteItem[]>([]);
  selectedFiles = signal<File[]>([]);
  submitting    = signal(false);
  apiResponse   = signal<unknown>(null);
  apiError      = signal<string | null>(null);
  authError     = signal<string | null>(null);
  formErrors    = signal<Record<string, string>>({});

  subtotal         = computed(() => this.items().reduce((s, i) => s + i.price * i.qty, 0));
  gst              = computed(() => Math.round(this.subtotal() * 0.18));
  grandTotal       = computed(() => this.subtotal() + this.gst());
  porCount         = computed(() => this.items().filter(i => i.price === 0).length);

  showManualForm = signal(false);
  manualFormError = signal<string | null>(null);
  manualForm = { name: '', brand: '', product_code: '', qty: 1 };

  // Auth forms for method step
  guestForm    = { name: '', email: '', phone: '' };
  loginForm    = { email: '', password: '' };
  registerForm = { email: '', password: '', confirmPassword: '' };

  // Details form (pre-filled after method)
  detailsForm = { full_name: '', email: '', phone: '', company_name: '', message: '' };

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['fresh']) {
      this.items.set([]);
      return;
    }

    const searchTerm = localStorage.getItem('quoteSearch');
    if (searchTerm) {
      this.manualForm.name = searchTerm;
      this.showManualForm.set(true);
      localStorage.removeItem('quoteSearch');
    }

    const fromMatCart: QuoteItem[] = this.cart.matItems().map(i => ({
      id: i.materialId,
      name: i.material.name ?? i.material.product_code,
      product_code: i.material.product_code ?? '',
      image: i.material.image ?? null,
      price: i.price,
      qty: i.qty,
      industry: i.material.industry ?? undefined,
    }));

    const fromProductCart: QuoteItem[] = this.cart.items().map(i => ({
      id: i.productId,
      name: i.product.name,
      product_code: i.product.partNumber ?? String(i.productId),
      image: i.product.image ?? null,
      price: i.price,
      qty: i.qty,
    }));

    // Always read localStorage items (Request by Mail / Request Quote from detail page)
    let fromStorage: QuoteItem[] = [];
    try {
      const raw: unknown[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      fromStorage = raw.map((item: any) => item?.product
        ? { id: item.product.id, name: item.product.name,
            product_code: item.product.partNumber ?? String(item.product.id),
            image: item.product.image ?? null, price: item.product.price ?? 0, qty: item.quantity ?? 1 }
        : { id: item.id, name: item.name, product_code: item.product_code ?? '',
            image: item.image ?? null, price: item.price ?? 0, qty: item.qty ?? 1,
            industry: item.industry } as QuoteItem
      );
    } catch { /* ignore */ }

    // Merge all sources, deduplicate by id (cart takes priority over localStorage)
    const cartIds = new Set([
      ...fromMatCart.map(i => String(i.id)),
      ...fromProductCart.map(i => String(i.id)),
    ]);
    const uniqueStorage = fromStorage.filter(i => !cartIds.has(String(i.id)));

    this.items.set([...fromMatCart, ...fromProductCart, ...uniqueStorage]);
  }

  // ── Method step navigation ─────────────────────────────────────────────────

  toggleCard(card: MethodCard): void {
    this.openCard.set(this.openCard() === card ? null : card);
    this.authError.set(null);
  }

  continueAsGuest(): void {
    if (!this.guestForm.name || !this.guestForm.email || !this.guestForm.phone) {
      this.authError.set('Please fill in all required fields.');
      return;
    }
    this.detailsForm.full_name = this.guestForm.name;
    this.detailsForm.email     = this.guestForm.email;
    this.detailsForm.phone     = this.guestForm.phone;
    this.authError.set(null);
    this.step.set('details');
  }

  continueAsReturning(): void {
    if (this.auth.isLoggedIn()) {
      const u = this.auth.user()!;
      this.detailsForm.full_name    = u.name;
      this.detailsForm.email        = u.email;
      this.detailsForm.company_name = u.company ?? '';
      if (u.company) this.customerType.set('company');
      this.step.set('details');
      return;
    }
    if (!this.loginForm.email || !this.loginForm.password) {
      this.authError.set('Please enter your email and password.');
      return;
    }
    this.submitting.set(true);
    this.authError.set(null);
    this.auth.login({ email: this.loginForm.email, password: this.loginForm.password }).subscribe({
      next: () => {
        const u = this.auth.user();
        this.detailsForm.full_name    = u?.name ?? '';
        this.detailsForm.email        = u?.email ?? this.loginForm.email;
        this.detailsForm.company_name = u?.company ?? '';
        if (u?.company) this.customerType.set('company');
        this.submitting.set(false);
        this.step.set('details');
      },
      error: (err) => {
        this.submitting.set(false);
        this.authError.set(err?.error?.message ?? 'Login failed. Please check your credentials.');
      },
    });
  }

  continueAsNew(): void {
    if (!this.registerForm.email || !this.registerForm.password) {
      this.authError.set('Please fill in all required fields.');
      return;
    }
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.authError.set('Passwords do not match.');
      return;
    }
    this.detailsForm.email = this.registerForm.email;
    this.authError.set(null);
    this.step.set('details');
  }

  backToMethod(): void {
    this.step.set('method');
    this.apiError.set(null);
    this.formErrors.set({});
  }

  // ── Details step submit ────────────────────────────────────────────────────

  submitDetails(): void {
    const e: Record<string, string> = {};
    if (!this.detailsForm.full_name.trim()) e['full_name'] = 'Full name is required.';
    if (!this.detailsForm.email.trim())     e['email']     = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.detailsForm.email)) e['email'] = 'Enter a valid email.';
    if (!this.detailsForm.phone.trim())     e['phone']     = 'Phone is required.';
    if (this.customerType() === 'company' && !this.detailsForm.company_name.trim())
      e['company_name'] = 'Company name is required for company accounts.';
    if (this.items().length === 0) e['items'] = 'Add at least one product before submitting.';
    this.formErrors.set(e);
    if (Object.keys(e).length > 0) return;

    const payload = {
      user_name:    this.detailsForm.full_name.trim(),
      email:        this.detailsForm.email.trim(),
      phone:        this.detailsForm.phone.trim(),
      company_name: this.detailsForm.company_name.trim() || undefined,
      customer_type: this.customerType(),
      message:      this.detailsForm.message.trim(),
      materials: this.items().map(i => ({
        product_code: i.product_code,
        name:         i.name,
        quantity:     i.qty,
      })),
    };

    this.submitting.set(true);
    this.apiError.set(null);

    this.productService.createEnquiry(payload).subscribe({
      next: (res) => {
        this.apiResponse.set(res);
        this.step.set('submitted');
        this.submitting.set(false);
        localStorage.removeItem(STORAGE_KEY);
        this.cart.clear();
      },
      error: (err) => {
        this.submitting.set(false);
        this.apiError.set(err?.error?.message ?? err?.message ?? 'Submission failed. Please try again.');
      },
    });
  }

  // ── Item management ────────────────────────────────────────────────────────

  updateQty(id: number | string, delta: number): void {
    this.items.update(l => l.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
    this.persist();
  }

  removeItem(id: number | string): void {
    this.items.update(l => l.filter(i => i.id !== id));
    this.persist();
  }

  clearAll(): void {
    this.items.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  // ── Manual item entry ──────────────────────────────────────────────────────

  addManualItem(): void {
    if (!this.manualForm.name.trim()) {
      this.manualFormError.set('Product name is required.');
      return;
    }
    if (!this.manualForm.qty || this.manualForm.qty < 1) {
      this.manualFormError.set('Quantity must be at least 1.');
      return;
    }
    this.manualFormError.set(null);
    const newItem: QuoteItem = {
      id: `manual-${Date.now()}`,
      name: this.manualForm.name.trim(),
      product_code: this.manualForm.product_code.trim()
        ? (this.manualForm.brand.trim()
            ? `${this.manualForm.brand.trim()} · ${this.manualForm.product_code.trim()}`
            : this.manualForm.product_code.trim())
        : (this.manualForm.brand.trim() || '—'),
      image: null,
      price: 0,
      qty: Number(this.manualForm.qty),
    };
    this.items.update(l => [...l, newItem]);
    this.persist();
    this.manualForm = { name: '', brand: '', product_code: '', qty: 1 };
    this.showManualForm.set(false);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  inlineInputClass(hasError: boolean | string | null | undefined): string {
    const base = 'w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 ';
    return hasError
      ? base + 'border-red-400 focus:ring-red-400'
      : base + 'border-gray-300 dark:border-gray-600 focus:ring-brand-blue';
  }

  fieldClass(field: string): string {
    const base = 'w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 ';
    return this.formErrors()[field]
      ? base + 'border-red-400 focus:ring-red-400'
      : base + 'border-gray-300 dark:border-gray-600 focus:ring-brand-blue';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.selectedFiles.update(f => [...f, ...Array.from(input.files!)]);
  }

  removeFile(index: number): void {
    this.selectedFiles.update(f => f.filter((_, i) => i !== index));
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }
}
