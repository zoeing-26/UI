import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="max-w-screen-xl mx-auto px-4 py-10">
      <section class="space-y-6">
        <span class="text-sm font-semibold uppercase tracking-widest text-zoeing-gold">Promotions</span>
        <h1 class="font-display text-4xl md:text-5xl text-zoeing-navy dark:text-white font-black">Special deals for your next industrial purchase</h1>
        <p class="max-w-3xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          Check out our latest promotional bundles, discounted product lines and short-term offers for industrial buyers.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white">Pneumatic system bundles</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-300">Discounts on cylinder, valve and tubing packages for automation cells.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white">Fastener and tooling savings</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-300">Better pricing on high-volume part orders and clearance stock.</p>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class PromotionComponent {}
