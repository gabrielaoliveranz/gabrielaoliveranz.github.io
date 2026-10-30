# Licence

This repository is a business website: prose, visual design, and
a handful of hand-written HTML/CSS/JS files that present that content
— not a reusable software library. [Creative Commons Attribution 4.0
International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
covers it, rather than a software licence like MIT.

**Why CC BY 4.0 specifically, and why not MIT:**

- Creative Commons itself recommends against CC licences for software
  — they're not designed for source-code redistribution and carry no
  patent grant. `assets/site.js` and `assets/v3.js` are real code, but they're a small
  progressive enhancement (animations, the contact form, a copy-email
  control and similar, none required for the page's content to work)
  attached to what is
  overwhelmingly prose and design, not a library anyone would import or
  depend on. Splitting it into its own MIT-licensed file the way the
  sister repo splits code from data would be more machinery than this
  amount of code warrants.
- Of the CC variants, **BY** (attribution only) fits a website like this
  best: the point of publishing this is for it to be read, referenced,
  and reused with credit — not restricted. **NC** (non-commercial) was
  considered and rejected: "non-commercial" is famously ambiguous in
  practice, and there's no real risk here worth that friction. **ND**
  (no derivatives) was rejected because it would block exactly the kind
  of legitimate adaptation (e.g. someone using this as a structural
  reference for their own portfolio) that attribution alone already
  handles fairly.

**What this licence does not cover:**

- **`assets/fonts/`** — Archivo, Source Sans 3 and Bricolage Grotesque
  are Google Fonts, distributed under the [SIL Open Font License 1.1](https://openfontlicense.org/).
  Self-hosting the `.woff2` files here doesn't relicense them; they
  remain under the OFL, same as if they were loaded from Google's own
  servers.
- **`assets/images/headshot.jpg`** — a personal photo of Gabriela
  Olivera. All rights reserved; it isn't available for reuse under
  CC BY like the rest of this repository.
- **`assets/favicon.png`** — Gabriela Olivera's own personal logo mark
  (the bar-chart-and-dot icon, on its dark-navy square), supplied by
  her directly rather than designed for this repo, and used unchanged
  for both the browser favicon and the header brand mark. Same
  treatment as the headshot above: all rights reserved, not available
  for reuse under CC BY like the rest of this repository.
- **`assets/cv/gabriela-olivera-cv.pdf`** — a personal document, not
  creative work being offered for reuse. All rights reserved.
- **The project screenshots** (`assets/images/terroir-screenshot.jpg`,
  `assets/images/apophenia-screenshot.jpg`) reproduce this site's own
  two dashboards. The Terroir one is ultimately LINZ/S-map/LCDB/Open-Meteo
  -derived data — see the sister repo's own [Data and licensing](https://github.com/gabrielaoliveranz/horticultural-land-suitability-nz#data-and-licensing)
  section for those sources' terms. This repository doesn't hold rights
  over that underlying data any more than the sister repo does.
- **GoatCounter** (every page's `<head>`) — cookie-free visit counting by
  [GoatCounter](https://www.goatcounter.com), whose `count.js` is under the
  [EUPL 1.2](https://github.com/arp242/goatcounter/blob/master/LICENSE).
  Loaded from `gc.zgo.at` rather than self-hosted: the visits are sent to
  GoatCounter's server anyway, so a local copy would add a file to keep in
  sync without keeping any traffic off a third party. Described in the
  privacy policy (sections 02 and 06).
