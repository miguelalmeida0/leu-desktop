# Leu Desktop

A quiet workspace for reading, learning and connecting ideas. Open the product, browse six original sample PDFs, teach an idea back, compare it with its source, and build a knowledge trail. No account or API key is needed.

## Run locally

Node.js 22.13 or a supported newer LTS version. Install with `npm ci`, run `npm run dev`, and build with `npm run build`. `npm run preview` serves the production build on port 4179, including the configured security headers. Run `npm test` while that server is running; install Chromium with `npx playwright install chromium` first.

## What is real

Reading, search, filtering, notes, highlights, page progression, local PDF text import, quizzes, teach-back drafts, source navigation and saved trails work in the browser. State persists locally. Reset demo restores the seeded library and removes local interactions.

Learning explanations, quiz answers and concept connections are deterministic and grounded in the bundled original sample notes. Teach-back comparison checks source terms, not semantic correctness. There is no live model inference, Apple Foundation Models, microphone processing, or backend in this web demo. The native iOS product has a separate release process.

## Architecture

- `src/domain`: typed source corpus, learner-owned state, runtime validation, source-backed explanations and lazy PDF extraction.
- `src/components`: shared shell, source links, book covers, dialogs and learning sessions.
- `src/pages`: independently routed workspaces. Reader, learning, graph, notes and settings load on demand.
- `public/samples`: six original PDFs from the native product's public sample bundle. `scripts/extract-corpus.py` reproduces the readable source corpus using Poppler's `pdftotext`.
- `tests`: Playwright journeys, accessibility, local import/privacy, keyboard behavior and persistence tests at five desktop widths.

## Privacy and limits

Imported PDFs are processed by a local worker. Only extracted text is persisted, not the original PDF bytes. Imports are limited to 2 MB, 40 pages, and 120,000 extracted characters. Image-only scans and encrypted PDFs are not supported. Browser storage is not encrypted or backed up; clear/reset it after use on shared devices. No analytics or telemetry is included.

Source PDFs and display typography use original sample content. The desktop layout follows the approved graphite/lime workspace reference. The native iOS repository is independent.

## Deployment

Deploy as a new Vercel Vite project. `vercel.json` supplies SPA routing and security headers. Use a preview first, smoke-test its browser behavior, then promote the validated deployment to production. The default production domain is supplied by Vercel. No private environment variables are required.
