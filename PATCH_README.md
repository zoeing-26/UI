# ZOEING Branding + Parallax Feature Patch

This patch applies on top of your existing `D:\zoeing\misumi-ng` project.

## What this patch adds

1. **Refined ZOEING color palette** extracted from your screenshots:
   - Deep navy `#0A1F44` (dark nav bar)
   - Gold `#FFC72C` (Quote/Order CTA)
   - Soft blue-gray `#EEF3FA` (decorative circles)
   - Mid-blue `#1E5BA8` (secondary CTAs)

2. **NEW Parallax directive** — `appParallax [speed]="0.3"` on any element
   - Uses `requestAnimationFrame` + `IntersectionObserver` for smooth perf
   - Auto-disables on mobile and `prefers-reduced-motion`
   - Runs outside Angular's NgZone to avoid change detection thrash

3. **NEW Brand Hero section** — "Precision Components. Delivered On Time."
   - Full-width parallax band between Promo Banners and Popular Brands
   - 4 decorative circles moving at different scroll speeds (`0.4`, `-0.3`, `0.6`, `-0.5`)
   - Animated dot grid background
   - Stats row + dual CTAs + trust badges

4. **Rebranded** all "MISUMI" → "ZOEING" with logo `Z` square mark

---

## How to apply

Drop these files into your `D:\zoeing\misumi-ng\` project, **overwriting** the existing files:

| File in patch | → Goes to |
|---|---|
| `tailwind.config.js` | `D:\zoeing\misumi-ng\tailwind.config.js` |
| `src/styles/main.scss` | `D:\zoeing\misumi-ng\src\styles\main.scss` |
| `src/app/core/services/language.service.ts` | `D:\zoeing\misumi-ng\src\app\core\services\language.service.ts` |
| `src/app/features/header/header.component.ts` | `D:\zoeing\misumi-ng\src\app\features\header\header.component.ts` |
| `src/app/features/footer/footer.component.ts` | `D:\zoeing\misumi-ng\src\app\features\footer\footer.component.ts` |
| `src/app/features/home/home.component.ts` | `D:\zoeing\misumi-ng\src\app\features\home\home.component.ts` |

**NEW files** (create these — they don't exist yet):

| File in patch | → Create at |
|---|---|
| `src/app/shared/directives/parallax.directive.ts` | `D:\zoeing\misumi-ng\src\app\shared\directives\parallax.directive.ts` |
| `src/app/features/home/sections/brand-hero/brand-hero.component.ts` | `D:\zoeing\misumi-ng\src\app\features\home\sections\brand-hero\brand-hero.component.ts` |

Then:

```bash
cd D:\zoeing\misumi-ng
npm start
```

---

## Using the parallax directive elsewhere

The new directive is reusable. Drop it on any element:

```html
<!-- Slow background (moves slower than scroll) -->
<div class="bg-image" appParallax [speed]="0.3"></div>

<!-- Reverse parallax (moves opposite to scroll) -->
<img appParallax [speed]="-0.5" src="..." />

<!-- Horizontal parallax -->
<div appParallax [speed]="0.4" [axis]="'x'"></div>

<!-- Disable on demand -->
<div appParallax [speed]="0.3" [disabled]="isPrintMode"></div>
```

Don't forget to import it in your component:
```ts
import { ParallaxDirective } from '../../shared/directives/parallax.directive';

@Component({
  standalone: true,
  imports: [CommonModule, ParallaxDirective],
  // ...
})
```

---

## New Tailwind color tokens

You can now use these classes anywhere:

```html
<button class="bg-zoeing-navy text-white">Primary</button>
<button class="bg-zoeing-gold text-zoeing-navy-dark">Gold CTA</button>
<div class="border-zoeing-stroke text-zoeing-ink">Card</div>
<p class="text-zoeing-ash">Muted text</p>
<div class="bg-zoeing-fog">Decorative bg</div>
```

Old `bg-brand-blue` / `bg-brand-yellow` still works (back-compat aliases mapped to new ZOEING colors).

---

## Performance notes

- Parallax runs in `runOutsideAngular()` zone — zero change detection cycles per scroll
- IntersectionObserver pauses parallax when element leaves viewport
- `requestAnimationFrame` throttles updates to display refresh rate
- `will-change: transform` hints GPU compositing
- Mobile (≤ 768px) and `prefers-reduced-motion` users get the static version
