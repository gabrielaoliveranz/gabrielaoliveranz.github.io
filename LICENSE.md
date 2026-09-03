# Licence

This repository is a personal portfolio site: prose, visual design, and
a handful of hand-written HTML/CSS/JS files that present that content
— not a reusable software library. [Creative Commons Attribution 4.0
International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
covers it, rather than a software licence like MIT.

**Why CC BY 4.0 specifically, and why not MIT:**

- Creative Commons itself recommends against CC licences for software
  — they're not designed for source-code redistribution and carry no
  patent grant. `assets/script.js`, `assets/how-i-work-scroll.js` and
  `assets/signal-stack.js` are real code, but together they're a small
  progressive enhancement (count-up, scroll-reveal, a copy-email
  control, the "How I work" scrollytelling canvas, the Signal stack
  letter-by-letter word carousel, a back-to-top button — none required
  for the page's content to work) attached to what is
  overwhelmingly prose and design, not a library anyone would import or
  depend on. Splitting it into its own MIT-licensed file the way the
  sister repo splits code from data would be more machinery than this
  amount of code warrants. (`assets/vendor/matter.min.js`, the one
  actual third-party library among them, is separately MIT-licensed —
  see below.)
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
- **`assets/icons/`** (`github.png`, `linkedin.png`, `email.png`,
  `location-pin.png`, `cv.png`) — Flaticon icons under their Free
  Licence, which requires attribution:
  - Github icons created by Pixel perfect — [Flaticon](https://www.flaticon.com/free-icons/github)
  - Linkedin icons created by Magnific — [Flaticon](https://www.flaticon.com/free-icons/linkedin)
  - Email icons created by Uniconlabs — [Flaticon](https://www.flaticon.com/free-icons/email)
  - Location pin icons created by Pixel perfect — [Flaticon](https://www.flaticon.com/free-icons/location-pin)
  - Curriculum vitae icons created by Mayor Icons — [Flaticon](https://www.flaticon.com/free-icons/curriculum-vitae)

  Checked both directions (see CLAUDE.md, "Every third-party asset is
  self-hosted or justified, and either way it's in LICENSE.md"): every
  file in `assets/icons/` has a credit above naming
  it, and every credit above names a file that's actually in
  `assets/icons/` and actually rendered on the page (as a CSS
  `mask-image` on a decorative `.icon` span, recoloured via
  `background-color` — see `assets/styles.css`). No entry for an icon
  that isn't used, no icon without an entry.
- **`assets/vendor/matter.min.js`** — [Matter.js](https://brm.io/matter-js/)
  0.19.0 by Liam Brummitt, under the [MIT Licence](https://github.com/liabru/matter-js/blob/master/LICENSE).
  Self-hosted rather than loaded from a CDN, same reasoning as the
  self-hosted fonts above — see CLAUDE.md, "Every third-party asset is
  self-hosted or justified". Drives the Signal stack's letter-by-letter
  word carousel (`assets/signal-stack.js`).
