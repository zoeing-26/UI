import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Indian Rupee currency.
 * Usage: {{ 12264 | inrCurrency }}  →  ₹12,264
 *        {{ 184 | inrCurrency:true }}  →  ₹184/-
 */
@Pipe({ name: 'inrCurrency', standalone: true, pure: true })
export class InrCurrencyPipe implements PipeTransform {
  transform(value: string | number | null | undefined, showDash = false): string {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';

    // Indian number system: last 3 digits, then groups of 2
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);

    return showDash ? `${formatted}/-` : formatted;
  }
}
