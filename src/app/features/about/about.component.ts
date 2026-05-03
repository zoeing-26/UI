import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="max-w-screen-xl mx-auto px-4 py-10">
      <section class="space-y-8">
        <div class="space-y-4">
          <span class="text-sm font-semibold uppercase tracking-widest text-zoeing-gold">About ZOIENG</span>
          <h1 class="font-display text-4xl md:text-5xl text-zoeing-navy dark:text-white font-black">Industrial strength sourcing for the global manufacturing supply chain</h1>
          <p class="max-w-3xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            ZOIENG is a business-focused industrial marketplace built for engineers, procurement teams and factories worldwide. We combine industrial automation components, fasteners, toolmaking supplies, and global logistics to keep manufacturing operations moving fast and reliably.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white mb-3">What we serve</h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Automation parts, pneumatic equipment, motion control, tooling, and industrial consumables from trusted brands and system partners.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white mb-3">Who we support</h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Manufacturers, OEMs, machine builders, automation teams and procurement managers around the world.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-zoeing-navy dark:text-white mb-3">Why choose us</h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Local pricing, expert product guidance, fast sourcing and transparent delivery for industrial orders.</p>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-2xl font-semibold text-zoeing-navy dark:text-white">Our mission</h2>
            <p class="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">Enable global industry to access the right parts and tools quickly, with confidence that the product and service meet exacting specifications.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 class="text-2xl font-semibold text-zoeing-navy dark:text-white">Our values</h2>
            <ul class="mt-3 space-y-2 text-gray-600 dark:text-gray-300 list-disc list-inside leading-relaxed">
              <li>Quality technical sourcing</li>
              <li>Competitive pricing</li>
              <li>Fast delivery and support</li>
              <li>Trusted industrial brands</li>
            </ul>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-zoeing-navy dark:text-white">24/7 expert support</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">Get practical guidance on part selection, specifications and procurement strategy from our technical sourcing team.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-zoeing-navy dark:text-white">Bulk order convenience</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">Secure quotes, MOQ options, and faster fulfilment for recurring industrial supplies.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-zoeing-navy dark:text-white">Local logistics</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">Trusted delivery partners that help move parts across manufacturing hubs quickly and safely.</p>
          </div>
          <div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-zoeing-navy dark:text-white">Quality assurance</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">Sourced from brands with proven compliance and strong technical support worldwide.</p>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class AboutComponent {}
