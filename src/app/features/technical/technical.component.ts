import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-technical',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="max-w-screen-xl mx-auto px-4 py-10">
      <section class="space-y-6">
        <span class="text-sm font-semibold uppercase tracking-widest text-zoeing-gold">Technical Resources</span>
        <h1 class="font-display text-4xl md:text-5xl text-zoeing-navy dark:text-white font-black">Expert product guidance for engineering teams</h1>
        <p class="max-w-3xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          Access the technical content you need to choose the right parts, spec systems correctly, and optimize equipment performance.
        </p>
        <ul class="grid gap-4 md:grid-cols-2 text-gray-700 dark:text-gray-300">
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Application notes for automation and fluid power</li>
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Specification help for mechanical design</li>
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Compatibility guidance for controls and sensors</li>
          <li class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">Support for procurement and quality checks</li>
        </ul>
      </section>
    </main>
  `,
})
export class TechnicalComponent {}
