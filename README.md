# Gabriela Olivera — Portfolio

![Portfolio homepage hero](assets/preview/hero.png)

[![Checks](https://github.com/gabrielaoliveranz/gabrielaoliveranz.github.io/actions/workflows/checks.yml/badge.svg)](https://github.com/gabrielaoliveranz/gabrielaoliveranz.github.io/actions/workflows/checks.yml)

Personal portfolio — one page, no blog, no build step. Built on the
same hand-written semantic HTML, design tokens and CI checks as the
[Terroir case study](https://github.com/gabrielaoliveranz/terroir-case-study).

## Structure

```
gabrielaoliveranz.github.io/
├── index.html
├── 404.html
├── sitemap.xml
├── robots.txt
├── assets/
│   ├── styles.css
│   ├── script.js
│   ├── favicon.svg
│   ├── cv/gabriela-olivera-cv.pdf   # the real CV
│   ├── fonts/                        # self-hosted Archivo, Source Sans 3 + Bricolage Grotesque
│   ├── icons/                         # Flaticon mask-image icons — see LICENSE.md
│   ├── images/                       # real headshot + project screenshots
│   └── preview/hero.png              # this README's cover image (homepage hero)
├── scripts/                           # html/link/a11y/overflow/contrast/asset
│   │                                   # checks, plus the OG card generator
├── package.json
├── .htmlvalidate.json
└── CLAUDE.md                          # working conventions — read before editing
```

## Replacing content later

- `assets/images/headshot.jpg` — 800×800px, square crop
- `assets/images/terroir-screenshot.jpg` — 1600×900px (16:9)
- `assets/images/apophenia-screenshot.jpg` — 1600×900px (16:9)
- `assets/cv/gabriela-olivera-cv.pdf` — whenever the CV is replaced, swap
  this repo's copy in the same change (no visible "last updated" date to
  keep in sync — that line was deliberately removed; see CLAUDE.md,
  "Copy #4, the CV, is a binary one").

## Local preview

```bash
npm install
npm run serve   # http://localhost:8080
```

## Checks

```bash
npm run check   # html-validate, linkinator, axe-core, overflow, contrast states, asset paths, untracked files, OG card — same as CI
```

## Regenerating the OG card

`assets/images/og-card.png` is rendered from `scripts/og-card-template.html`,
not hand-edited — see CLAUDE.md, "The OG card carries its own copy of both
the tokens and the numbers".

```bash
npm run generate:og-card   # after editing the template, its copy, or --accent/--bg/--text* in styles.css
```

## Live

https://gabrielaolivera.nz/

## Licence

CC BY 4.0 — see [LICENSE.md](LICENSE.md).
