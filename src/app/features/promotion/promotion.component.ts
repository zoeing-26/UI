import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';

interface Offer {
  id: string;
  title: string;
  category: 'Bundle' | 'Clearance' | 'Volume';
  valueMetric: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
}

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-layout-wrapper layoutType="full">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">

      <!-- HERO SECTION -->
      <section class="relative bg-zoeing-navy text-white py-20 lg:py-32 overflow-hidden">
        <!-- Industrial Grid Overlay -->
        <div class="absolute inset-0 opacity-10 pointer-events-none"
             style="background-image: radial-gradient(circle, #D97706 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="max-w-screen-xl mx-auto px-6 relative z-10">
          <div class="max-w-3xl space-y-6">
            <span class="inline-block px-3 py-1 rounded-full bg-zoeing-gold/20 text-zoeing-gold text-xs font-bold uppercase tracking-widest border border-zoeing-gold/30">
              Strategic Sourcing
            </span>
            <h1 class="font-display font-black text-4xl md:text-6xl leading-tight tracking-tighter">
              Optimizing Industrial <span class="text-zoeing-gold">Procurement.</span>
            </h1>
            <p class="text-lg md:text-xl text-gray-300 leading-relaxed opacity-90">
              Access strategic bundles, high-volume discounts, and opportunistic clearance stock to reduce operational expenditure without compromising technical precision.
            </p>
          </div>
        </div>
      </section>

      <!-- OFFER GALLERY -->
      <main class="max-w-screen-xl mx-auto px-6 py-20">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

          <!-- Bundle Offer (Primary) -->
          <div class="md:col-span-2 group relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:border-zoeing-gold transition-all shadow-sm">
            <div class="flex flex-col h-full justify-between space-y-8">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-zoeing-gold/10 text-zoeing-gold border border-zoeing-gold/20">
                    Strategic Bundle
                  </span>
                  <span class="font-mono text-zoeing-navy dark:text-zoeing-gold font-bold text-lg">Save 15%</span>
                </div>
                <h2 class="text-3xl font-display font-black text-zoeing-navy dark:text-white mb-4">
                  Pneumatic System Integration
                </h2>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-lg max-w-2xl">
                  Optimize your automation cells with our curated bundles. Includes precision cylinders, manifold valves, and industrial tubing packages with a single procurement ID.
                </p>
              </div>
              <div class="flex items-center justify-between">
                <a routerLink="/inventory"
                   class="px-6 py-3 bg-zoeing-navy text-white font-bold text-sm rounded-xl hover:bg-zoeing-navy-light transition-all shadow-md flex items-center gap-2">
                  Claim Bundle Offer <span class="material-icons text-sm">arrow_forward</span>
                </a>
                <span class="text-xs text-gray-400 uppercase font-semibold tracking-tighter">Ref: BNDL-PNU-2026</span>
              </div>
            </div>
          </div>

          <!-- Clearance Offer -->
          <div class="group relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:border-zoeing-gold transition-all shadow-sm">
            <div class="flex flex-col h-full justify-between space-y-6">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                  Clearance
                </span>
                <h2 class="text-xl font-display font-black text-zoeing-navy dark:text-white mt-4 mb-2">
                  Tooling & Fasteners
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Opportunistic savings on high-volume fastener sets and precision tooling.
                </p>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-mono text-red-600 dark:text-red-400 font-bold">UP TO 40% OFF</span>
                <a routerLink="/inventory"
                   class="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-zoeing-navy hover:text-white transition-all">
                  <span class="material-icons text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Volume Offer -->
          <div class="group relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:border-zoeing-gold transition-all shadow-sm">
            <div class="flex flex-col h-full justify-between space-y-6">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-zoeing-navy/10 text-zoeing-navy dark:text-zoeing-gold border border-zoeing-navy/20">
                  Volume
                </span>
                <h2 class="text-xl font-display font-black text-zoeing-navy dark:text-white mt-4 mb-2">
                  Bulk Material Sourcing
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Custom pricing tiers for recurring industrial supplies and large-scale projects.
                </p>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-mono text-zoeing-navy dark:text-zoeing-gold font-bold">TIERED PRICING</span>
                <a routerLink="/quote"
                   class="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-zoeing-navy hover:text-white transition-all">
                  <span class="material-icons text-sm">description</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Corporate Value Card -->
          <div class="md:col-span-2 rounded-3xl border border-gray-200 dark:border-gray-800 bg-zoeing-navy text-white p-8 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-64 h-64 bg-zoeing-gold/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-zoeing-gold/20 transition-all duration-700"></div>
            <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div class="space-y-4 max-w-xl">
                <h2 class="text-3xl font-display font-black leading-tight">
                  Strategic Partnering for <span class="text-zoeing-gold">Zero-Friction</span> Sourcing.
                </h2>
                <p class="text-gray-300 leading-relaxed opacity-80">
                  We don't just offer discounts; we optimize your supply chain by reducing lead times and ensuring technical compliance across all components.
                </p>
              </div>
              <a routerLink="/about"
                 class="shrink-0 px-8 py-4 bg-zoeing-gold text-zoeing-navy font-bold rounded-xl hover:bg-white transition-all shadow-xl flex items-center gap-2 uppercase tracking-widest text-xs">
                Learn our Approach <span class="material-icons text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  </app-layout-wrapper>
  `,
})
export class PromotionComponent {}
