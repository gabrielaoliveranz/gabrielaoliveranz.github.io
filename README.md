# Gabriela Olivera, Portfolio

![Portfolio homepage hero](assets/preview/hero.png)

[![Checks](https://github.com/gabrielaoliveranz/gabrielaoliveranz.github.io/actions/workflows/checks.yml/badge.svg)](https://github.com/gabrielaoliveranz/gabrielaoliveranz.github.io/actions/workflows/checks.yml)

Personal portfolio and small-business site for a data analyst in
Mount Maunganui, New Zealand. No blog, no build step: hand-written
semantic HTML, shared design tokens and CI checks, the same approach as
the [Terroir case study](https://github.com/gabrielaoliveranz/terroir-case-study).

## Pages

| Page | Status |
| --- | --- |
| `index.html` (`/`) | Live |
| `small-business/index.html` (`/small-business/`) | Live, linked from the header nav |
| `case-studies/litchfields-grain/index.html` (`/case-studies/litchfields-grain/`) | Live, linked from the home page and the small-business page |
| `privacy/index.html` (`/privacy/`) | Live, linked from every page's footer |
| `404.html` | Live, deliberately not in `sitemap.xml` (`noindex`) |

Every indexable page is listed in `sitemap.xml`.

## Structure

```
gabrielaoliveranz.github.io/
├── index.html
├── 404.html
├── small-business/index.html
├── case-studies/litchfields-grain/index.html
├── privacy/index.html
├── favicon.ico                        # root icon for search engines (the pages link assets/favicon.png)
├── CNAME                              # custom domain: gabrielaolivera.nz
├── google081f77d423ca3a8e.html        # Google Search Console verification, keep as is
├── sitemap.xml
├── robots.txt
├── assets/
│   ├── site.css / site.js             # current design, used by every page
│   ├── case-study-v2.css              # extra styles for the case study page
│   ├── favicon.png
│   ├── cv/gabriela-olivera-cv.pdf     # the real CV
│   ├── case-studies/                  # downloadable case study PDF
│   ├── email/                         # images used by the newsletter emails
│   ├── fonts/                         # self-hosted Archivo, Source Sans 3 and Bricolage Grotesque
│   ├── images/                        # headshot, project screenshots, logos, OG cards
│   ├── preview/hero.png               # this README's cover image
│   └── styles.css                     # previous design's stylesheet, not loaded by any page;
│                                      # kept because the OG card check reads its --accent token
├── scripts/                           # html, link, a11y, overflow, contrast, asset,
│                                      # canonical, footer and OG card checks, plus the OG card generator
├── .github/workflows/checks.yml       # runs the checks on every push
├── package.json
├── .htmlvalidate.json
├── LICENSE.md
└── NEXT-STEPS.md                      # what's pending
```

Working notes for editing the site (`CLAUDE.md`) are kept locally and
are not part of this repository.

## Replacing content later

- `assets/images/headshot.jpg`: 800×800px, square crop
- Project screenshots in `assets/images/`: 1600×900px (16:9) or 1600×1000px
- `assets/cv/gabriela-olivera-cv.pdf`: whenever the CV is replaced, swap
  this repo's copy in the same change. There is no visible "last updated"
  date on the site to keep in sync.

## Local preview

```bash
npm install
npm run serve   # http://localhost:8080
```

## Checks

```bash
npm run check   # html-validate, linkinator, axe-core, overflow, contrast states, asset paths,
                # untracked files, OG cards, canonical URLs, footer: same as CI
```

## Regenerating the OG cards

`assets/images/og-card.png` and `assets/images/og-card-small-business.png`
are rendered from templates in `scripts/`, not hand-edited.

```bash
npm run generate:og-card                  # home page card
npm run generate:og-card:small-business   # small-business page card
```

## Live

https://gabrielaolivera.nz/

## Licence

CC BY 4.0, see [LICENSE.md](LICENSE.md).
