# DevBox

A browser-first developer toolkit built with React and Vite. DevBox provides practical utilities for API work, data transformation, security, configuration, code generation, assets and developer workflows.

## Tool directory

### API & backend
- HTTP API Workbench
- Webhook Request Tester
- API Mock Response Builder
- OpenAPI Workbench
- HTTP Headers Inspector
- GraphQL Workbench
- WebSocket Client
- URL Inspector & Builder
- cURL Builder

### Data & database
- Data Transform Studio (JSON, CSV and YAML)
- SQL Workbench
- SQL Seed Data Generator
- Database Schema Designer
- JSON Schema Generator
- Mock Data Studio
- JSON Diff

### Security & configuration
- JWT Secret Generator
- JWT Inspector
- Hash & HMAC
- Environment File Builder
- .env Inspector
- Docker Compose Builder
- Dockerfile Builder
- .gitignore Builder

### Code generation & developer workflow
- JSON to TypeScript
- API Scaffold Generator
- Code Formatter
- Diff & Merge
- Cron Expression Studio
- Regex Workbench
- Unix Timestamp Converter
- Color Converter

### Assets, web & documentation
- App Icon Studio (Android, iOS and web icon packs)
- Favicon & Web Icon Pack (multi-size PNGs and web manifest)
- Social Preview Studio (Open Graph / social sharing artwork)
- CSS Gradient Studio (linear and radial gradient builder)
- Image Compressor
- SVG Optimizer
- Base64 File Encoder
- UUID Batch Generator
- Sample Files Library
- PWA Manifest Builder
- Robots & Sitemap Generator
- GitHub Actions Builder
- Nginx Config Builder
- Markdown Studio

## Run locally

    npm ci
    npm run dev

Open the local Vite URL shown in the terminal.

## Build and checks

    npm run audit
    npm run build

The GitHub Actions CI workflow runs the production dependency audit and Vite build. The Pages workflow builds and deploys the static site.

## Privacy and browser limitations

- Most generators and converters run locally in your browser.
- Recent tools, favorites and theme preferences are stored in local browser storage.
- HTTP request tools use the browser Fetch API. Cross-origin requests require the destination to permit the DevBox origin through CORS; DevBox does not proxy requests or bypass CORS.
- Base64 is encoding, not encryption. Do not use it to protect secrets.
- PWA offline support caches the static application shell and same-origin static assets. It does not make third-party APIs or remote services available offline.
- Do not paste production secrets into tools or send credentials to endpoints you do not trust.

## Deployment

The production site is published through GitHub Pages at:

https://maazuh1997.github.io/DevBox/

The Vite base path is configured as /DevBox/ to support project-page hosting and direct tool routes.
