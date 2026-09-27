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
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';
import { UserProfile } from '../../models/product.model';

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
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe, LayoutWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-layout-wrapper layoutType="full">
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <aside class="w-80 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-hidden z-20">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-2 text-zoeing-gold mb-1">
            <span class="material-icons text-sm">auto_awesome</span>
            <span class="text-[10px] font-bold uppercase tracking-widest">Procurement Guide</span>
          </div>
          <h1 class="font-display font-black text-2xl text-zoeing-navy dark:text-white leading-tight">
            Request for Quote
          </h1>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-8">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-zoeing-navy text-white text-[10px] flex items-center justify-center font-bold"
                   [class.ring-4]="step() === 'method'" [class.ring-zoeing-gold]="step() === 'method'">1</div>
              <h3 class="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Configuration</h3>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-9">
              Review your technical requirements and define your procurement method.
            </p>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 text-white text-[10px] flex items-center justify-center font-bold"
                   [class.bg-zoeing-navy]="step() === 'details'"
                   [class.ring-4]="step() === 'details'" [class.ring-zoeing-gold]="step() === 'details'">2</div>
              <h3 class="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Identity</h3>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-9">
              Provide corporate details to ensure pricing aligns with your industry sector.
            </p>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 text-white text-[10px] flex items-center justify-center font-bold"
                   [class.bg-zoeing-navy]="step() === 'submitted'">3</div>
              <h3 class="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Finalization</h3>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-9">
              Our technical sourcing team will verify specifications and issue your quote.
            </p>
          </div>

          <div class="mt-12 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 text-zoeing-navy dark:text-zoeing-gold mb-2">
              <span class="material-icons text-sm">info</span>
              <span class="text-[11px] font-bold uppercase">Technical Tip</span>
            </div>
            <p class="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
              Including a Bill of Materials (BOM) or 3D CAD file reduces lead time by up to 40%.
            </p>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <a routerLink="/" class="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-zoeing-navy dark:hover:text-zoeing-gold transition-colors">
            <span class="material-icons text-sm">arrow_back</span> Back to Home
          </a>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto relative">
        <div class="max-w-5xl mx-auto p-6 lg:p-12">
          @if (step() === 'submitted') {
            <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                <span class="material-icons text-5xl text-green-600 dark:text-green-400">check_circle</span>
              </div>
              <h2 class="text-3xl font-display font-black text-zoeing-navy dark:text-white mb-3">Quote Submitted!</h2>
              <p class="text-gray-600 dark:text-gray-400 max-w-md mb-8 text-lg">
                Thank you. Our technical sourcing team will review your requirements and contact you within 24 hours.
              </p>
              <div class="flex gap-4">
                <a routerLink="/inventory" class="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Continue Shopping
                </a>
                <a routerLink="/" class="px-6 py-3 rounded-lg bg-zoeing-navy text-white text-sm font-bold hover:bg-zoeing-navy-light transition-colors">
                  Return Home
                </a>
              </div>
            </div>
          } @else {
            <div class="grid lg:grid-cols-12 gap-12">
              <div class="lg:col-span-7 space-y-6">
                <div class="flex items-center justify-between">
                  <h2 class="font-display font-black text-xl text-zoeing-navy dark:text-white uppercase tracking-tight">Technical Intake</h2>
                  @if (items().length > 0) {
                    <button (click)="clearAll()" class="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider flex items-center gap-1 transition-colors">
                      <span class="material-icons text-xs">delete_sweep</span> Clear All
                    </button>
                  }
                </div>

                @if (items().length === 0) {
                  <div class="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center bg-white dark:bg-gray-900/50">
                    <span class="material-icons text-5xl text-gray-300 dark:text-gray-700 mb-4 block">inventory_2</span>
                    <p class="text-gray-500 dark:text-gray-400 font-medium">No components added to your request.</p>
                    <a routerLink="/inventory" class="mt-4 inline-block text-sm font-bold text-zoeing-navy dark:text-zoeing-gold hover:underline">Browse Inventory &rarr;</a>
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (item of items(); track item.id) {
                      <div class="group flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 hover:border-zoeing-gold transition-colors shadow-sm">
                        <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                          @if (item.image) {
                            <img [src]="item.image" [alt]="item.name" class="w-full h-full object-contain p-1" />
                          } @else {
                            <span class="material-icons text-gray-400 text-xl">image</span>
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ item.name }}</p>
                          <p class="text-[10px] font-mono text-gray-400">{{ item.product_code }}</p>
                        </div>
                        <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
                          <button (click)="updateQty(item.id,-1)" [disabled]="item.qty<=1" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-zoeing-navy disabled:opacity-30">
                            <span class="material-icons text-xs">remove</span>
                          </button>
                          <span class="text-xs font-bold w-4 text-center">{{ item.qty }}</span>
                          <button (click)="updateQty(item.id,1)" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-zoeing-navy">
                            <span class="material-icons text-xs">add</span>
                          </button>
                        </div>
                        <button (click)="removeItem(item.id)" class="p-2 text-gray-300 hover:text-red-500 transition-colors">
                          <span class="material-icons text-sm">close</span>
                        </button>
                      </div>
                    }
                  </div>
                }

                <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                  <button (click)="showManualForm.set(!showManualForm())" class="w-full flex items-center justify-between p-4 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span class="flex items-center gap-2">
                      <span class="material-icons text-sm text-zoeing-gold">add_circle</span> Add Custom Component
                    </span>
                    <span class="material-icons transition-transform" [class.rotate-180]="showManualForm()">expand_more</span>
                  </button>

                  @if (showManualForm()) {
                    <div class="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                          <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Product Name *</label>
                          <input type="text" [(ngModel)]="manualForm.name" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-zoeing-gold outline-none" />
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Brand</label>
                          <input type="text" [(ngModel)]="manualForm.brand" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-zoeing-gold outline-none" />
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Product Code</label>
                          <input type="text" [(ngModel)]="manualForm.product_code" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-zoeing-gold outline-none" />
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Quantity *</label>
                          <input type="number" [(ngModel)]="manualForm.qty" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-zoeing-gold outline-none" />
                        </div>
                        <div class="flex items-end">
                          <button (click)="addManualItem()" class="w-full py-2 bg-zoeing-navy text-white text-xs font-bold rounded-lg hover:bg-zoeing-navy-light transition-colors">
                            Add to List
                          </button>
                        </div>
                      </div>

                      @if (manualFormError()) {
                        <p class="text-[11px] text-red-500 flex items-center gap-1">
                          <span class="material-icons text-xs">error</span> {{ manualFormError() }}
                        </p>
                      }
                    </div>
                  }
                </div>

                <div class="p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center cursor-pointer hover:border-zoeing-gold transition-colors group" (click)="fileInput.click()">
                  <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span class="material-icons text-gray-400 group-hover:text-zoeing-gold">cloud_upload</span>
                  </div>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-300">Upload BOM / Drawing</p>
                  <p class="text-[11px] text-gray-400 mt-1">PDF, Excel, STEP, DXF supported</p>
                  <input type="file" multiple (change)="onFileSelected($event)" class="hidden" #fileInput />
                </div>

                @if (selectedFiles().length > 0) {
                  <div class="grid grid-cols-2 gap-2">
                    @for (f of selectedFiles(); track f.name; let fi = $index) {
                      <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-[11px]">
                        <span class="truncate flex items-center gap-1">
                          <span class="material-icons text-xs text-gray-400">insert_drive_file</span> {{ f.name }}
                        </span>
                        <button (click)="removeFile(fi)" class="text-gray-400 hover:text-red-500">
                          <span class="material-icons text-xs">close</span>
                        </button>
                      </div>
                    }
                  </div>
                }

                @if (items().length > 0) {
                  <div class="p-6 rounded-2xl bg-zoeing-navy text-white shadow-xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div class="relative z-10">
                      <p class="text-[10px] font-bold uppercase tracking-widest text-zoeing-gold mb-4">Estimated Value</p>
                      <div class="flex items-end justify-between">
                        <div>
                          <p class="text-3xl font-display font-black">{{ grandTotal() | inrCurrency }}</p>
                          <p class="text-[10px] text-gray-400 uppercase mt-1">Incl. GST (18%)</p>
                        </div>
                        <div class="text-right">
                          <p class="text-xs font-bold">Items: {{ items().length }}</p>
                          <p class="text-xs text-gray-400">POR: {{ porCount() }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <div class="lg:col-span-5">
                @if (step() === 'method') {
                  <div class="space-y-4 sticky top-12">
                    <h3 class="text-lg font-bold text-zoeing-navy dark:text-white">Identity Method</h3>

                    <div class="space-y-3">
                      @for (m of methodCards; track m) {
                        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all" [class.ring-2]="openCard() === m" [class.ring-zoeing-gold]="openCard() === m">
                          <button (click)="toggleCard(m)" class="w-full flex items-center justify-between p-4 text-left">
                            <div>
                              <p class="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">
                                {{ m === 'guest' ? 'Guest Checkout' : (m === 'returning' ? 'Returning Customer' : 'New Customer') }}
                              </p>
                              <p class="text-xs text-gray-500 dark:text-gray-400">
                                {{ m === 'guest' ? 'Continue without an account' : (m === 'returning' ? 'Login for faster experience' : 'Track orders and history') }}
                              </p>
                            </div>
                            <span class="material-icons text-gray-400 transition-transform" [class.rotate-180]="openCard() === m">expand_more</span>
                          </button>

                          @if (openCard() === m) {
                            <div class="p-4 pt-0 space-y-3 border-t border-gray-100 dark:border-gray-800">
                              @if (m === 'guest') {
                                <div class="space-y-2">
                                  <input type="text" [(ngModel)]="guestForm.name" placeholder="Full Name *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                  <input type="email" [(ngModel)]="guestForm.email" placeholder="Email *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                  <input type="tel" [(ngModel)]="guestForm.phone" placeholder="Phone *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                  <button (click)="continueAsGuest()" class="w-full py-2 bg-zoeing-navy text-white text-xs font-bold rounded-lg hover:bg-zoeing-navy-light transition-colors">Continue</button>
                                </div>
                              } @else if (m === 'returning') {
                                <div class="space-y-2">
                                  @if (auth.isLoggedIn()) {
                                    <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 mb-3">
                                      <span class="material-icons text-green-600 text-sm">account_circle</span>
                                      <span class="text-xs font-bold text-green-800 dark:text-green-400">{{ auth.user()?.name }}</span>
                                    </div>
                                    <button (click)="continueAsReturning()" class="w-full py-2 bg-zoeing-navy text-white text-xs font-bold rounded-lg">Continue as {{ auth.user()?.name }}</button>
                                  } @else {
                                    <input type="email" [(ngModel)]="loginForm.email" placeholder="Email *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                    <input type="password" [(ngModel)]="loginForm.password" placeholder="Password *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                    <button (click)="continueAsReturning()" class="w-full py-2 bg-zoeing-navy text-white text-xs font-bold rounded-lg disabled:opacity-50" [disabled]="submitting()">
                                      {{ submitting() ? 'Logging in...' : 'Login and Continue' }}
                                    </button>
                                  }
                                </div>
                              } @else {
                                <div class="space-y-2">
                                  <input type="email" [(ngModel)]="registerForm.email" placeholder="Email *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                  <input type="password" [(ngModel)]="registerForm.password" placeholder="Password *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                  <input type="password" [(ngModel)]="registerForm.confirmPassword" placeholder="Confirm Password *" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" />
                                  <button (click)="continueAsNew()" class="w-full py-2 bg-zoeing-navy text-white text-xs font-bold rounded-lg">Sign up and Continue</button>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>

                    @if (authError()) {
                      <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                        <span class="material-icons text-sm">error</span> {{ authError() }}
                      </div>
                    }
                  </div>
                } @else {
                  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6 sticky top-12">
                    <div class="flex items-center gap-3">
                      <button (click)="backToMethod()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                        <span class="material-icons text-xl">arrow_back</span>
                      </button>
                      <h3 class="font-display font-black text-xl text-zoeing-navy dark:text-white uppercase tracking-tight">Corporate Identity</h3>
                    </div>
                    <div class="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      <button (click)="customerType.set('individual')" [class]="customerType() === 'individual' ? 'bg-white dark:bg-gray-700 text-zoeing-navy dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all">Individual</button>
                      <button (click)="customerType.set('company')" [class]="customerType() === 'company' ? 'bg-white dark:bg-gray-700 text-zoeing-navy dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all">Company</button>
                    </div>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Full Name *</label>
                        <input type="text" [(ngModel)]="detailsForm.full_name" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" [class.border-red-400]="formErrors()['full_name']" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Email *</label>
                        <input type="email" [(ngModel)]="detailsForm.email" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" [class.border-red-400]="formErrors()['email']" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Phone *</label>
                        <input type="tel" [(ngModel)]="detailsForm.phone" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" [class.border-red-400]="formErrors()['phone']" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Company Name {{ customerType() === 'company' ? '*' : '(Optional)' }}</label>
                        <input type="text" [(ngModel)]="detailsForm.company_name" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold" [class.border-red-400]="formErrors()['company_name']" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Requirements / Message</label>
                        <textarea [(ngModel)]="detailsForm.message" rows="3" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-zoeing-gold resize-none"></textarea>
                      </div>
                    </div>

                    <button (click)="submitDetails()" [disabled]="submitting() || items().length === 0" class="w-full py-3 bg-zoeing-navy text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-zoeing-navy-light transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      @if (submitting()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      } @else {
                        <span class="material-icons text-sm">send</span> Submit Request
                      }
                    </button>

                    @if (items().length === 0) {
                      <p class="text-center text-[10px] text-red-500 font-bold uppercase">Add at least one product to continue</p>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  </app-layout-wrapper>
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
  methodCards: MethodCard[] = ['guest', 'returning', 'new'];

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

  guestForm    = { name: '', email: '', phone: '' };
  loginForm    = { email: '', password: '' };
  registerForm = { email: '', password: '', confirmPassword: '' };
  detailsForm = { full_name: '', email: '', phone: '', company_name: '', message: '' };

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      const u = this.auth.user();
      if (u) {
        this.prefillUserDetails(u);
      } else {
        this.openCard.set('guest');
      }
    } else {
      this.openCard.set('guest');
    }

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

    const cartIds = new Set([
      ...fromMatCart.map(i => String(i.id)),
      ...fromProductCart.map(i => String(i.id)),
    ]);
    const uniqueStorage = fromStorage.filter(i => !cartIds.has(String(i.id)));

    this.items.set([...fromMatCart, ...fromProductCart, ...uniqueStorage]);
  }

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
      const u = this.auth.user();
      if (u) this.prefillUserDetails(u);
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
        if (u) this.prefillUserDetails(u);
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        this.authError.set(err?.error?.message ?? err?.message ?? 'Login failed. Please check your credentials.');
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
      user_name:     this.detailsForm.full_name.trim(),
      email:         this.detailsForm.email.trim(),
      phone_number:  this.detailsForm.phone.trim(),
      company_name:  this.detailsForm.company_name.trim() || undefined,
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
      next: () => {
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

  private prefillUserDetails(u: UserProfile): void {
    this.detailsForm.full_name    = u.name;
    this.detailsForm.email        = u.email;
    this.detailsForm.company_name = u.company ?? '';
    if (u.company) this.customerType.set('company');
    this.step.set('details');
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
