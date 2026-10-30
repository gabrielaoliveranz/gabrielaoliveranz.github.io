# Gabriela Olivera, Data Analyst: website

![Website home page](assets/preview/hero.png)

[![Checks](https://github.com/gabrielaoliveranz/gabrielaoliveranz.github.io/actions/workflows/checks.yml/badge.svg)](https://github.com/gabrielaoliveranz/gabrielaoliveranz.github.io/actions/workflows/checks.yml)

Website for Gabriela Olivera, Data Analyst: a data analysis consultancy for
New Zealand small businesses, based in Mount Maunganui. No build step:
hand-written semantic HTML, shared styles and CI checks, the same approach as
the [Terroir case study](https://github.com/gabrielaoliveranz/terroir-case-study).

## Pages

| Page | Status |
| --- | --- |
| `index.html` (`/`) | Live, consultancy home: services, how it works, case studies, privacy, FAQs, newsletter, contact |
| `work/index.html` (`/work/`) | Live, data projects (Terroir, Apophenia, CATCHMENT and more) |
| `small-business/index.html` (`/small-business/`) | Redirect stub to `/` (noindex), kept so old links still work |
| `case-studies/litchfields-grain/index.html` (`/case-studies/litchfields-grain/`) | Live, linked from the home page |
| `privacy/index.html` (`/privacy/`) | Live, linked from every page's footer |
| `newsletter/costs-went-up/index.html` (`/newsletter/costs-went-up/`) | Live, web version of Plain Numbers (27 Oct 2026), linked from the newsletter section on the home page |
| `terms/index.html` (`/terms/`) | Live, linked from every page's footer |
| `404.html` | Live, deliberately not in `sitemap.xml` (`noindex`) |

Every indexable page is listed in `sitemap.xml`.

## Structure

```
gabrielaoliveranz.github.io/
├── index.html
├── 404.html
├── work/index.html
├── small-business/index.html          # redirect to / so old links still work
├── case-studies/litchfields-grain/index.html
├── privacy/index.html
├── terms/index.html
├── newsletter/<issue>/index.html       # web versions of Plain Numbers issues
├── favicon.ico                        # root icon for search engines (the pages link assets/favicon.png)
├── CNAME                              # custom domain: gabrielaolivera.nz
├── google081f77d423ca3a8e.html        # Google Search Console verification, keep as is
├── pinterest-41646.html               # Pinterest domain verification, keep as is
├── sitemap.xml
├── robots.txt
├── assets/
│   ├── chrome.css                     # shared header, footer, contact form, fonts and mobile menu (every page)
│   ├── v3.css / v3.js                 # styles and scripts for the home and case study pages (October 2026 redesign)
│   ├── menu.js                        # mobile menu behaviour (every page)
│   ├── site.css / site.js             # base styles and scripts for the work, privacy, terms, newsletter and 404 pages
│   ├── pro.css                        # editorial layer on top of site.css for those pages
│   ├── case-study-v2.css              # previous case study styles (no longer loaded)
│   ├── newsletter.css                 # extra styles for newsletter issue pages
│   ├── styles.css                     # previous design's stylesheet: no page loads it, but check:og-card
│   │                                  # still reads --accent from it (see NEXT-STEPS.md)
│   ├── favicon.png
│   ├── email/                         # images used by the newsletter emails
│   ├── fonts/                         # self-hosted Archivo, Source Sans 3, Source Serif 4, IBM Plex Mono
│   │                                  # and Bricolage Grotesque (no Google Fonts requests)
│   ├── images/                        # headshot, project screenshots, logos, OG cards
│   │   └── case-studies/              # client logo and dashboard images for the case study
│   └── preview/hero.png               # this README's cover image
├── scripts/                           # html, link, a11y, overflow, contrast, asset,
│                                      # canonical, footer and OG card checks, plus the OG card generator
├── .github/workflows/checks.yml       # runs the checks on every push
├── package.json / package-lock.json
├── .htmlvalidate.json / .htmlvalidateignore
├── .gitattributes / .gitignore
├── LICENSE.md
└── NEXT-STEPS.md                      # what's pending
```

Working notes for editing the site (`CLAUDE.md`) and the Litchfields Grain
case study PDF are kept locally and are not part of this repository.

## Replacing content later

- `assets/images/headshot.jpg`: 800×800px, square crop
- Project screenshots in `assets/images/`: 1600×900px (16:9) or 1600×1000px
- The CV is not published on the site (removed 30 Oct 2026). It is sent
  directly on request.

## Local preview

```bash
npm install
npm run serve   # http://localhost:8080 (no caching, so edits show on refresh)
```

## Checks

```bash
npm run check   # html-validate, linkinator, axe-core, overflow, contrast states, asset paths,
                # untracked files, OG cards, canonical URLs, footer (CI runs all of these
                # except the small-business OG card check)
```

## Regenerating the OG cards

`assets/images/og-card.png` and `assets/images/og-card-small-business.png`
are rendered from templates in `scripts/`, not hand-edited. The case study
card (`assets/images/og-card-litchfields-grain.png`) is a static image with
no generator.

```bash
npm run generate:og-card                  # work page card (og-card.png)
npm run generate:og-card:small-business   # home page card (og-card-small-business.png)
```

## Live

https://gabrielaolivera.nz/

## Licence

CC BY 4.0, see [LICENSE.md](LICENSE.md).
