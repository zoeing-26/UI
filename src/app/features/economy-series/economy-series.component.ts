import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-economy-series',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="max-w-screen-xl mx-auto px-4 py-10">
      <section class="space-y-6">
        <span class="text-sm font-semibold uppercase tracking-widest text-zoeing-gold">Economy Series</span>
        <h1 class="font-display text-4xl md:text-5xl text-zoeing-navy dark:text-white font-black">Cost-smart components without compromise</h1>
        <p class="max-w-3xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          Discover economic industrial products selected for reliable performance, value pricing, and dependable delivery across manufacturing workflows.
        </p>
        <ul class="grid gap-3 md:grid-cols-2 text-gray-700 dark:text-gray-300">
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Standard pneumatic actuators</li>
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Budget-friendly fasteners</li>
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Cost effective sensors and switches</li>
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Essential machine accessories</li>
        </ul>
      </section>
    </main>
  `,
})
export class EconomySeriesComponent {}
