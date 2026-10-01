import { Injectable, inject, signal, computed } from '@angular/core';
import { SafeStorageService } from './safe-storage.service';
import { ProductService } from './product.service';
import { ApiMaterial } from '../../models/product.model';

const GEO_CACHE_KEY = 'zoieng.geo.country';
const GEO_OVERRIDE_KEY = 'zoieng.geo.override';
/** Re-resolve the IP country after 7 days (travelling users get fresh data). */
const GEO_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/**
 * Fallback when the IP lookup fails. Chosen as the home market so a geo
 * outage never wrongly hides materials — blocking is opt-in per country.
 */
const DEFAULT_COUNTRY = 'IN';
const GEO_LOOKUP_URL = 'https://ipapi.co/json/';

const EMPTY_SET: ReadonlySet<number> = new Set<number>();

/**
 * True when `material` must not be offered in `country`.
 * Empty country (SSR / pre-resolution) → never blocked, so the server render
 * and the pre-hydration client render agree and nothing flickers off.
 *
 * `extraBlockedIds` is the service-level fallback set: only /v1/brand_materials
 * embeds `blocked_countries` today, so materials arriving from other endpoints
 * (/v1/all_materials, /v1/materials) are matched here by id.
 */
export function isMaterialBlocked(
  material: ApiMaterial,
  country: string,
  extraBlockedIds?: ReadonlySet<number>,
): boolean {
  if (extraBlockedIds?.has(material.id)) return true;
  if (!country) return false;
  const code = country.toUpperCase();
  return (material.blocked_countries ?? []).some(c => (c?.code ?? '').toUpperCase() === code);
}

/**
 * GeoLocationService — resolves the visitor's country for region-based
 * material blocking (business rule: some manufacturers forbid sale in
 * certain countries, e.g. BEST-MINI blocked in the UAE).
 *
 * Resolution is browser-only and non-blocking:
 *  1. A QA/pinning override (`zoieng.geo.override`) wins if present.
 *  2. A cached lookup (7-day TTL) is used to avoid refiring the IP API.
 *  3. Otherwise a public IP-geolocation endpoint is fetched once; on any
 *     failure we fall back to the home market (IN) rather than hiding goods.
 *
 * It also builds a per-country blocked-material-id set from
 * /v1/brand_materials (the only endpoint that currently returns
 * `blocked_countries`), exposed reactively as `blockedIds()` and consumed by
 * `isMaterialBlocked()` so every listing is filtered even when its own
 * endpoint omits the field. When the backend adds the field everywhere, the
 * inline check still applies and the map simply stays a harmless redundancy.
 *
 * On the server the signals stay `''` / empty, so SSR markup is rendered
 * unfiltered and filtered counts land right after hydration.
 */
@Injectable({ providedIn: 'root' })
export class GeoLocationService {
  private readonly storage = inject(SafeStorageService);
  private readonly productService = inject(ProductService);

  /** ISO-3166 alpha-2 country code, `''` until resolved. */
  readonly country = signal('');
  readonly countryName = signal('');
  readonly resolved = computed(() => this.country() !== '');

  /** material id → blocked country codes (from /v1/brand_materials). */
  private readonly blockedByCountry = signal<ReadonlyMap<number, readonly string[]>>(new Map());

  /** Ids of materials blocked in the resolved country (reactive, SSR-empty). */
  readonly blockedIds = computed<ReadonlySet<number>>(() => {
    const country = this.country();
    if (!country) return EMPTY_SET;
    const set = new Set<number>();
    this.blockedByCountry().forEach((codes, id) => {
      if (codes.some(c => c.toUpperCase() === country)) set.add(id);
    });
    return set;
  });

  private inflight: Promise<void> | null = null;

  constructor() {
    // Browser-only: resolve immediately from cache, else kick off the lookup.
    if (this.storage.inBrowser) {
      void this.resolve();
      this.loadBlockedMap();
    }
  }

  /** Idempotent: reads the override/cache, or starts one shared IP lookup. */
  resolve(): Promise<void> {
    const override = this.storage.getItem(GEO_OVERRIDE_KEY);
    if (override) {
      this.country.set(override.toUpperCase());
      this.countryName.set('');
      return Promise.resolve();
    }

    const cached = this.readCache();
    if (cached) {
      this.country.set(cached.code);
      this.countryName.set(cached.name);
      return Promise.resolve();
    }

    this.inflight ??= this.lookup();
    return this.inflight;
  }

  /**
   * QA hook — pin a country code (e.g. `'AE'`) to preview blocking, or `null`
   * to clear the pin and fall back to the real cached/looked-up country.
   */
  setOverride(code: string | null): void {
    if (code) {
      this.storage.setItem(GEO_OVERRIDE_KEY, code.toUpperCase());
    } else {
      this.storage.removeItem(GEO_OVERRIDE_KEY);
    }
    this.inflight = null;
    void this.resolve();
  }

  private readCache(): GeoRecord | null {
    const raw = this.storage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    try {
      const rec = JSON.parse(raw) as GeoRecord;
      if (!rec?.code || typeof rec.resolvedAt !== 'number') return null;
      if (Date.now() - rec.resolvedAt > GEO_TTL_MS) return null;
      return rec;
    } catch {
      return null;
    }
  }

  private async lookup(): Promise<void> {
    try {
      const res = await fetch(GEO_LOOKUP_URL, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`geo lookup failed: HTTP ${res.status}`);
      const data = (await res.json()) as { country_code?: string; country_name?: string };
      const code = (data.country_code ?? '').trim().toUpperCase();
      if (code.length !== 2) throw new Error('geo lookup returned no country code');

      const record: GeoRecord = { code, name: data.country_name ?? code, resolvedAt: Date.now() };
      this.storage.setItem(GEO_CACHE_KEY, JSON.stringify(record));
      this.country.set(record.code);
      this.countryName.set(record.name);
    } catch {
      // Never block goods because geolocation failed — default to home market.
      this.country.set(DEFAULT_COUNTRY);
      this.countryName.set('India');
    } finally {
      this.inflight = null;
    }
  }

  /**
   * One-shot fetch of /v1/brand_materials to collect which materials are
   * blocked in which countries. Failure degrades gracefully: materials keep
   * being filtered by their inline `blocked_countries` field when present.
   */
  private loadBlockedMap(): void {
    this.productService.getBrands().subscribe({
      next: brands => {
        const map = new Map<number, readonly string[]>();
        for (const brand of brands ?? []) {
          for (const m of brand.materials ?? []) {
            const codes = (m.blocked_countries ?? [])
              .map(c => c?.code ?? '')
              .filter(c => c.length > 0)
              .map(c => c.toUpperCase());
            if (codes.length > 0) map.set(m.id, codes);
          }
        }
        this.blockedByCountry.set(map);
      },
      error: () => {
        // Leave the map empty — inline fields (when present) still apply.
      },
    });
  }
}

interface GeoRecord {
  code: string;
  name: string;
  resolvedAt: number;
}
