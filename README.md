# DevBox

A professional browser-first developer toolkit built with React + Vite.

## Included tools

- JSON Formatter / Validator / Minifier
- JWT Decoder
- UUID v4 Generator
- Base64 Encoder / Decoder
- SHA-256 / SHA-384 / SHA-512 Hash Generator
- Regex Tester
- Unix Timestamp Converter
- URL Encoder / Decoder
- QR Generator
- Color Converter
- HTTP Tester
- Markdown Preview
- SQL Formatter

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Architecture

The first version is intentionally backend-light. Tool state is handled in the browser and JSON/HTTP work can be used without a database. LocalStorage is used only for user convenience such as theme, favorites and the JSON workspace.

## Next production layers

1. PWA/offline support
2. SEO-ready dedicated routes for every tool
3. More advanced formatters/parsers
4. Local history/workspaces
5. Shareable encrypted snippets
6. Optional account + Pro tier
7. Ads only on free tool pages
8. Analytics with privacy-conscious configuration


## Phase 2

- SEO-aware document titles and descriptions per tool
- Keyboard shortcut Cmd/Ctrl + K for global search
- Installable PWA shell with service worker
- Responsive tool routing foundation
- Improved focus states and navigation polish

The next implementation phase can add real client-side routing, dedicated SEO landing pages, structured data, richer parser engines, workspace/history UX and production deployment configuration.


## Phase 3

- Browser URL routing for every tool (`/json`, `/jwt`, `/uuid`, etc.)
- Back/forward browser navigation support
- Tool-specific document titles and descriptions
- SEO-oriented tool introduction content
- Expanded tool discovery grid
- Canonical metadata foundation

### Deployment note

For clean tool URLs on static hosting, configure SPA fallback/rewrites so unknown paths serve `index.html`.


## Phase 4

The core tools now have richer workflows:

- JSON: validation feedback, line awareness, key sorting, file import, pretty/minify modes and character statistics
- JWT: decoded header/payload/signature, claims table and expiration awareness
- Regex: match groups, flags, match counts and replacement mode
- SQL: keyword casing, indentation controls and improved multiline formatting


## Phase 5 — Visual redesign

DevBox now uses a visual system inspired by the supplied Leon reference:

- Dark editorial navigation
- Red/coral accent system
- Black/white high-contrast surfaces
- Space Grotesk display typography + DM Sans body typography
- Thin editorial rules
- Circular decorative motifs
- Outlined oversized hero typography
- Strong CTA treatment
- Minimal square controls and circular icon treatments
- Generous whitespace and portfolio-style section hierarchy
- Light/dark variants adapted to DevBox rather than copied as a portfolio

## Phase 6 — Functional routing and UX repair

- Fixed tool navigation by defining the shared `selectTool` route handler.
- Added browser history/back/forward support for every tool.
- Added Vercel SPA rewrites and Netlify redirects so `/jwt`, `/regex`, `/sql`, etc. work after refresh/deep-linking.
- Added a static `404.html` fallback for hosts that support SPA fallback through a 404 document.
- Made Settings functional with theme, favorites and privacy controls.
- Added the Leon-inspired editorial hero CTA and visual hierarchy.


## Phase 6 — Workspace UX

- Local recent-work history
- Load/delete/clear history
- Workspace modal
- Category filters
- Local-first persistence
