# Opus Client Website

Website Git submodule of the Opus superproject. React 19, TypeScript, Vite and Astryx. The website uses a standalone visual identity rather than reusing launcher/client layout.

## Routes

| Route | Page |
| --- | --- |
| / | Home, introduction, preview, news |
| /download | OS selector and optional release links |
| /features | Filterable client/launcher feature directory |
| /store | Concept catalogue, search, wishlist, persistent preview bag |
| /premium | Opus Free, Aether, Elysium comparisons |
| /journal | Editorial entries with article routes |
| /account | Registration, login, session and profile |

## Development

Requires Node.js 22.13+.

```bash
cd ~/Projects/Opus/web
npm install
npm run dev
```

Local Vite runs at http://127.0.0.1:5173 and proxies /api to the Node API at 127.0.0.1:8787. The development command launches both.

```bash
npm run typecheck
npm run build
npm run test:api
npm run astryx:components
```

## Releases and commerce

Published download URLs are configured through .env.local with VITE_DOWNLOAD_WINDOWS_URL, VITE_DOWNLOAD_MACOS_URL and VITE_DOWNLOAD_LINUX_URL. A blank URL does not create a fake download.

Store items are explicitly marked as design concepts. Prices, checkout, entitlements, payment processing and premium activation are not live. The preview bag and wishlist are local browser preferences.

## Accounts and waitlist

The Node service in server/index.mjs stores accounts and waitlist entries in a local SQLite database at server/.data/opus.db (gitignored). Passwords are hashed using scrypt; sessions use HttpOnly SameSite cookies. The account flow is functional locally. Waitlist emails are stored but not dispatched.

Public deployment requires TLS, persistent storage, configured outbound email and operational monitoring. Payment provider and subscription billing must be integrated separately before taking payments.

## Production (Node host)

```bash
npm run build
NODE_ENV=production OPUS_PUBLIC_ORIGIN=https://YOUR-VERIFIED-DOMAIN OPUS_API_HOST=127.0.0.1 npm start
```

The production Node server serves the built SPA and API together. Replace the example origin and configure TLS and durable storage.

## Design and AI agents

Original site art direction, with real Opus screenshots only for product explanation. Motion and concave joins are conceptual inspiration, never copied screen layouts. No glow, fake performance figures or generated marketing imagery.

Codex reads AGENTS.md. Antigravity reads GEMINI.md and the shared brand contract in AGENTS.md. ChatGPT via LocalMCP uses the same workspace. Astryx documentation can be queried with the installed CLI.

## Approved design sources

The website design is intentionally independent. The current Approved UI is inspected only for product accuracy and real screenshots:

- Client entry: `../ui-v2/src/main.tsx` → `ProductApp.tsx` → `src/approved/ClientSurface.tsx` and `IngameSurface.tsx`.
- Launcher entry: `../launcher/desktop/src/main.tsx` → `App.tsx` → `src/ui/LauncherSurface.tsx` and `approved-launcher/` CSS.
- Original website identity: warm paper, charcoal ink, editorial typography, original aperture geometry, measured kinetic motion and precise concave joins; no reused launcher hero media.
- Current design previews: `public/previews/launcher-home.png`, `client-home.png`, `client-control-center.png` are captured by Playwright from the current React source, not month-old output files.
- The website styling is authored directly in `src/styles.css`, not layered over an Approved launcher skin. Product UI screenshots remain only in product-preview sections.

Regenerate UI screenshots from the current source without using the owner’s desktop GUI:

```bash
OPUS_CHROMIUM_PATH="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell" npm run capture:ui
```

Run automated browser and API tests:

```bash
npm run test:api
OPUS_CHROMIUM_PATH="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell" npm run test:ui
```

Playwright requires a compatible headless Chromium installation; override `OPUS_CHROMIUM_PATH` if the executable differs. Do not launch, focus or control GUI applications on the owner’s Mac.

## Git policy

All Opus repositories use the single branch `main`. The repository-local default push refspec points exclusively to `refs/heads/main`. `AGENTS.md` defines the strict prohibition against creating auxiliary branches. Public `website` and `opus-optim` repos have GitHub Rulesets preventing branch creation; private repositories cannot use those rules with the present GitHub entitlement.
