import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-clearance',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="max-w-screen-xl mx-auto px-4 py-10">
      <section class="space-y-6">
        <span class="text-sm font-semibold uppercase tracking-widest text-zoeing-gold">Stock Clearance</span>
        <h1 class="font-display text-4xl md:text-5xl text-zoeing-navy dark:text-white font-black">Clearance inventory for immediate delivery</h1>
        <p class="max-w-3xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          Find high-quality industrial stock available for fast shipment. Ideal for urgent orders, replacement parts, and budget-sensitive projects.
        </p>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white">Ready-to-ship</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-300">Selected products from automation, tooling and electrical categories.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white">Limited-time pricing</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-300">Competitive clearance offers on industry-leading parts.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white">Bulk support</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-300">Fast quotes for large and repeat orders.</p>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class StockClearanceComponent {}
