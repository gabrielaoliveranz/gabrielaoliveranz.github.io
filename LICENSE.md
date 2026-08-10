# Licence

This repository is a personal portfolio site: prose, visual design, and
a handful of hand-written HTML/CSS/JS files that present that content
— not a reusable software library. [Creative Commons Attribution 4.0
International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
covers it, rather than a software licence like MIT.

**Why CC BY 4.0 specifically, and why not MIT:**

- Creative Commons itself recommends against CC licences for software
  — they're not designed for source-code redistribution and carry no
  patent grant. `assets/script.js` is real code, but it's a ~170-line
  progressive enhancement (count-up, scroll-reveal, a copy-email
  control, a tooling-bar toggle, a back-to-top button — none required
  for the page's content to work) attached to what is overwhelmingly
  prose and design, not a library anyone would import or depend on.
  Splitting it into its own MIT-licensed file the way the sister repo
  splits code from data would be more machinery than this amount of
  code warrants.
- Of the CC variants, **BY** (attribution only) fits a portfolio piece
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
- **`assets/cv/gabriela-olivera-cv.pdf`** — a personal document, not
  creative work being offered for reuse. All rights reserved.
- **The project screenshots** (`assets/images/terroir-screenshot.jpg`,
  `assets/images/apophenia-screenshot.jpg`) reproduce this site's own
  two dashboards. The Terroir one is ultimately LINZ/S-map/LCDB/Open-Meteo
  -derived data — see the sister repo's own [Data and licensing](https://github.com/gabrielaoliveranz/horticultural-land-suitability-nz#data-and-licensing)
  section for those sources' terms. This repository doesn't hold rights
  over that underlying data any more than the sister repo does.
