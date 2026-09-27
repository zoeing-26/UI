import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  // Respect X-Forwarded-* headers when running behind a load balancer / reverse
  // proxy so req.protocol reflects the real client scheme (https).
  server.set('trust proxy', 1);

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // ── Security headers (SSR + static) ─────────────────────────────────────────
  server.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    // HSTS is ignored on plain http (local dev) and enforced once TLS is on.
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content-Security-Policy tuned for this app:
    //  - Google Fonts (styles + font files)
    //  - API + websocket origins from the environment config
    //  - https: images because product images come from the API host
    //  - 'unsafe-inline' scripts kept for framework compatibility; tighten to
    //    'self' (plus nonces) once verified nothing injects inline scripts.
    const api = process.env['API_ORIGIN'] ?? 'https://zoieng-dev-api.zoieng.com';
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      `connect-src 'self' ${api} ${api.replace(/^https/, 'wss')}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    next();
  });

  // ── Static assets ────────────────────────────────────────────────────────────
  // Hashed build output can be cached forever; anything else (HTML) must not be
  // cached so SSR pages stay fresh.
  const oneYearImmutable = 'public, max-age=31536000, immutable';
  const hashedAsset = /\.(?:js|mjs|css|woff2?|ttf|svg|png|jpe?g|webp|avif|gif|ico|mp4|webm)$/i;

  server.get('**', express.static(browserDistFolder, {
    setHeaders(res, path) {
      if (hashedAsset.test(path)) {
        res.setHeader('Cache-Control', oneYearImmutable);
      } else {
        res.setHeader('Cache-Control', 'no-store');
      }
    },
    index: false,
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    res.setHeader('Cache-Control', 'no-store');

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host ?? 'localhost'}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
