# Gabriela Olivera — portfolio site — working conventions

This is the personal portfolio site, built on the same hand-written
semantic-HTML approach and the same design tokens as the Terroir case
study repo. See that repo's CLAUDE.md for the reasoning behind the
overall approach; this file covers what's specific to this site.

## The figure-staleness chain — six copies, one source of truth

The numbers on this page (22,834 parcels · 21,491 scored · 13,040
expansion candidates, plus Apophenia's 9 / 26wk / 4) exist in **six**
places now, and only the first is authoritative:

1. **The Terroir pipeline** (`horticultural-land-suitability-nz`) —
   the single source of truth. Every other copy below is downstream of
   this one and can go stale silently.
2. The Terroir case study (`terroir-case-study` repo)
3. **This site** (`index.html`, the `.stats` blocks in the Work section)
4. The CV PDF committed to this repo (`assets/cv/gabriela-olivera-cv.pdf`)
5. LinkedIn
6. Seek

No rule in this repo, or in any repo, reaches numbers 5 and 6 — they
live entirely outside git and outside CI. That is exactly why this has
already gone stale twice.

**Whenever a figure changes in the Terroir pipeline, re-check all six
downstream copies in the same session** — not just the ones a diff
would catch. Re-checking this site and the CV PDF is necessary but not
sufficient: explicitly go and look at LinkedIn and Seek too, in the
same sitting, because nothing will ever prompt you to otherwise.

**Resolved 2026-08-12:** the Apophenia card's "26wk Forecast · with 90%
confidence intervals" was wrong at its source — Apophenia's 26-week
chart draws a fixed ±6/12/18-point band, not a statistically fitted
interval, and its methodology modal had even attributed the *90-day*
chart's formula to the 26-week chart. Apophenia's own copy was fixed
first (all "confidence interval"/"confidence band" language relabelled
as "projection band" — see that repo's CLAUDE.md), then this card was
updated to match: "with a fixed-width projection band." Keep fixing in
that order — source repo first, this site second — so the two don't
drift apart in the other direction.

## Copy #4, the CV, is a binary one

The "Download CV" link points at a PDF committed to this repo
(`assets/cv/gabriela-olivera-cv.pdf`). Unlike the HTML/CSS above, a
changed PDF produces no readable diff — git will show the file changed,
never what changed in it. That makes it easy to forget it's part of
the same staleness chain as the numbers above.

**Whenever the CV changes, replace this repo's copy in the same
change** — never leave the repo's PDF one version behind "for later".

The visible date under the Download CV buttons
(`.site-footer__cv-date` in `index.html`) is the file's own date, not
a build timestamp — update it by hand, in the same commit, every time
the PDF is replaced. That line exists so a visitor (or Gabriela,
months later) can tell at a glance whether the PDF behind the link is
current, without opening it.

The CV's header also carries its own copy of the site's canonical
URL (`gabrielaolivera.nz`, next to the email and LinkedIn/GitHub
handles) — an eighth copy that isn't in "sitemap.xml and robots.txt
reference the canonical URL, not a copy of it" above because none of
the tooling described there can see it: `check:canonical` reads HTML
tags with a regex, and a PDF has none. **If this site ever moves
domains again, the CV's header needs a manual re-export in the same
change** — no check will ever catch it silently drifting, the same
blind spot the OG card's accent colour had before `check:og-card`
existed, except there is no equivalent check possible here short of
extracting the PDF's text by hand.

## The OG card carries its own copy of both the tokens and the numbers

`assets/images/og-card.png` (the Open Graph / Twitter preview image) repeats
the same three Terroir numbers as the `.stats` block above — another place
in "The figure-staleness chain" that isn't in the numbered list, because it
isn't HTML — *and* it repeats the site's `--accent` colour as a rendered
pixel value, which nothing in that chain covers at all. Unlike the numbers
in HTML, this is a flat PNG: a changed accent, or a changed number, produces
no diff a reviewer would ever read — the same problem the CV PDF has. It
already happened once — the site was repainted from Terroir's brown to
`--accent: #1A4A82`, and the card kept shipping the old brown indefinitely,
because nothing ever looked at it again.

**Whenever `--accent`/`--bg`/`--text*` in `assets/styles.css` change, or the
numbers in the card's copy change, regenerate it in the same change:**

```
npm run generate:og-card
```

This renders `scripts/og-card-template.html` (a standalone page, linked to
the real `assets/styles.css` and the same self-hosted fonts as the site, so
there is nothing to keep in sync by hand) at exactly 1200×630 in a headless
browser and overwrites `assets/images/og-card.png`. Edit the template — not
the PNG, and never by hand in an image editor — to change layout or copy.

**This is enforced, not just documented:** `npm run check:og-card`
(`scripts/check-og-card.mjs`, wired into `npm run check` and CI) reads
`--accent` straight out of `assets/styles.css`, reads the committed PNG's
actual pixels, and fails if the colour the bar/eyebrow/numbers were
rendered in doesn't match — plus fails if the file's real dimensions don't
match what `og:image:width`/`og:image:height` declare. It was verified
against a real mismatch before being trusted: temporarily reverting
`--accent` to Terroir's old brown made it fail with "found 0 pixels
matching --accent", exactly as it should have failed the first time this
went stale.

## sitemap.xml and robots.txt reference the canonical URL, not a copy of it

The site's canonical URL is repeated in **seven** places across four
files — one fact, seven copies, no build step tying them together (see
"hand-written HTML... never a bundled export" below):
`index.html`'s `<link rel="canonical">`, its `og:url`, `og:image` and
`twitter:image`, `404.html`'s `<link rel="canonical">`, `sitemap.xml`'s
`<loc>`, and `robots.txt`'s `Sitemap:` line. When `sitemap.xml` and
`robots.txt` were first written, their URLs were copied *from*
`index.html`'s actual canonical tag, not retyped from memory.

**If this site ever moves to a custom domain, all seven need to change
together, in the same commit.** Miss any one of them and it goes stale
exactly like the OG card's accent colour did: no build step will ever
catch it, and nothing about a wrong-but-valid URL looks broken to a
casual read of the page.

**This is enforced, not just documented:** `npm run check:canonical`
(`scripts/check-canonical-urls.mjs`, wired into `npm run check` and CI)
treats `index.html`'s `<link rel="canonical">` as the one source of
truth, computes what each of the other six *should* say from it, and
fails naming the exact file and tag if any of them disagree — not just
that something, somewhere, does. Verified against a real mismatch
before being trusted: temporarily pointing `404.html`'s canonical at
the wrong path made it fail with the exact file, the expected value and
the actual value named, then it was reverted clean.

404.html is deliberately **not** in `sitemap.xml` — it's `noindex`
(see `404.html` itself), and a sitemap should only list pages meant to
be indexed. That means this is a one-page sitemap; if a second real
page is ever added to the site, it belongs in `sitemap.xml` too, with
its own accurate `lastmod`.

## Google Search Console verification file

`google081f77d423ca3a8e.html`, in the repo root, is not part of the site
— it's how Google Search Console verifies ownership of this property,
by re-checking that this exact file is still served at
`https://gabrielaoliveranz.github.io/google081f77d423ca3a8e.html`.

**It must stay in the repo permanently, byte-for-byte, and never be
"cleaned up".** Deleting it doesn't error, doesn't 404 anywhere
visible, and doesn't break any check in this repo — it just silently
un-verifies the property the next time Google re-checks, with no
warning to anyone here.

Its content (`google-site-verification: google081f77d423ca3a8e.html`)
is Google's required format, not a mistake: a single line of plain
text with an `.html` extension, not an actual HTML document. That
makes it look like exactly the kind of thing `npm run check:html`
should flag — it doesn't, in practice (`html-validate`'s recommended
preset doesn't fault a tag-less file), but rather than depend on that
holding true forever, it's explicitly listed in `.htmlvalidateignore`
with a comment explaining why, so it stays excluded by name if
`check:html`'s scope is ever broadened from the current `index.html
404.html` to something that walks the directory. No other check in
this repo needed the same treatment: `check:links`, `check:a11y`,
`check:overflow`, `check:assets` and `check:og-card` all work from the
fixed `PAGES` list in `scripts/lib/browser-env.mjs` (or explicit
filenames), never a directory scan, so none of them touch this file
either way.

## The status line

"Open to data analyst roles" will be wrong the day this changes, and is
easy to forget about because it doesn't sit next to any other date or
version marker on the page.

**Chosen approach: a single clearly-commented line, not evergreen
phrasing.** It's kept in two places, both marked with an HTML comment
naming this section of CLAUDE.md:
- an HTML comment near the top of `<body>` in `index.html`
  (`<!-- STATUS: open to data analyst roles -->`)
- the visible line itself, in the footer meta row

Evergreen phrasing ("Mount Maunganui, Bay of Plenty" with no
availability claim at all) was the alternative — rejected because the
availability statement is doing real work for recruiters landing on
this page, and a stale-but-invisible truth is worse than a
stale-but-easy-to-find one. Update or delete both the comment and the
line the day this stops being true.

## Adding a project

The Work section is built so adding a project is copying one
self-contained block and changing its content — no layout maths, no
duplicated CSS, and the alternating band colour / left-right rhythm
keeps working automatically at three, five, or any other count.

**To add a project:** copy one whole `.project-band` block (the `<div
class="project-band"><div class="project-band__inner">…</div></div>`
for Terroir or Apophenia) and paste it as a new sibling inside `<section
id="work">` in `index.html`, then change:

- the `<h2 class="work__title work__title--on-dark">` text
- the `<img>` `src`, `alt`, `width`/`height` in `.project-card__media`
- `.project-card__title`, `.project-card__eyebrow`, `.project-card__text`
- the `<li class="stat">` values (both the visible number and its
  `data-count-target`), labels and notes in `.stats`
- the `.project-card__links` hrefs (and the optional
  `.project-card__wake-note` paragraph, if the project also wakes from
  sleep)

**Never add or change a class** to control colour or left/right order.
Both are derived purely from the new block's *position* among its
`.project-band` siblings (`#work .project-band:nth-of-type(odd/even)`
in `assets/styles.css`) — a third project automatically gets the light
band + media-on-left layout of the first, a fourth automatically gets
the dark band + media-on-right layout of the second, and so on. This
used to be manual (`.project-band--a`/`--b`, `.project-card--reverse`)
until it was replaced with the positional rule specifically so copying
a block needs zero decisions.

## Quote band, "How I work" scrollytelling, and Signal stack — ported from a design reference, not reinterpreted

Three sections (the Terroir-bug quote, "How I work", and the tools row —
renamed Signal stack) were rebuilt to be a close visual match of an
external design reference (a `.dc.html` file), not a version adapted to
this site's existing palette. Where the reference's own colours differ
from this site's design tokens, the reference wins — several new custom
properties exist in `:root` (`--border-dark-card`, `--text-signal-label`,
`--text-stage-label`) purely because the reference specified an exact hex
that didn't map to anything already defined. **If asked to adjust these
three sections again, treat the reference as the source of truth for
colour/type/motion, not this site's pre-existing patterns** — the first
attempt at this work used existing tokens that were close-but-not-exact,
and had to be redone.

**Quote band** (`.quote-band`, `index.html`'s `<section>` right after
`#work`): light `--bg-section` background, top/bottom `clip-path` cut
(not a straight-sided box), navy (`--accent-label`) editorial-weight
quote in `--font-display`, a giant low-opacity `&ldquo;` glyph
absolutely positioned behind it, and `"19.4%"` picked out in `--accent`.
`data-reveal` stays on it for the existing `IntersectionObserver`
fade-in — the only thing carried over from the pre-rebuild version
rather than the reference, by explicit request.

**"How I work"** (`#how-i-work`) is a `position: sticky` canvas
scrollytelling piece inside a `min-height: 340vh` container
(`assets/how-i-work-scroll.js`), not a card grid: a `<canvas>` draws a
seeded, deterministic point field that morphs through three phases keyed
to scroll progress (`noise` → aligned `grid` → a single trend `line`,
right-half-only, cut off before it ever reaches the text column) while
four text blocks cross-fade in sync, each holding at full opacity before
the next one takes over. `#how-i-work-grid` (a plain, always-rendered
card grid, dark-palette per the reference — `--bg-dark-highlight`
cards, `--border-dark-card` borders, never the light cards this section
used before) is the **real accessible content**: it never leaves the
accessibility tree (moved to `.sr-only`, not `display: none`, once the
scroll version activates) and is the entire experience for
no-JS/no-`IntersectionObserver`/`prefers-reduced-motion` visitors, same
gate `html.motion-ready` as everywhere else on this page.
`#how-i-work-scroll` (the canvas + cross-fading text) is `aria-hidden`
**unconditionally in the HTML**, not toggled — see the a11y note below
for why.

**Signal stack** (`#signal-stack`, replacing the old tooling-bar
marquee/single-word-drop) spells out one tool word at a time letter by
letter with real Matter.js physics (`assets/signal-stack.js`): each
letter drops from above under gravity into its own natural typeset
position, staggered per letter index so the word cascades in left to
right, then holds until the whole cycle (2700ms, timed from
`performance.now()`, never chained `setTimeout`s) swaps in the next
word. `#signal-stack-static` (a plain flex row of all 8 words, same dark
palette) is the real accessible content, moved to `.sr-only` rather than
hidden once physics takes over; `#signal-stack-frame` is `aria-hidden`
unconditionally, same reasoning as the scrollytelling canvas above.

**Progressive enhancement is unchanged in shape from the rest of this
site:** both new scripts bail out entirely — leaving their respective
static/grid fallback as the whole story — unless `html.motion-ready` is
present (`script.js`'s `IntersectionObserver` + no
`prefers-reduced-motion` gate) and, for Signal stack, the self-hosted
Matter.js build actually loaded.

**Why the scrollytelling canvas's text is `aria-hidden` unconditionally,
not conditionally like the tooling-bar's old falling word was:** the
text's opacity is a continuous function of scroll progress (a
cross-fade, by design — two adjacent items are legitimately both
partially visible mid-transition). A CSS `opacity` transition already
proved once, on the old tooling-bar exit animation, that axe's
animated-state pass will flag a partially-transparent text element for
real (if transient) insufficient contrast — see the git history on this
file for that incident. Rather than chase a contrast-safe opacity
threshold for a value that's *supposed* to vary continuously, the
scrollytelling text and the Signal stack physics letters are both
`aria-hidden` in the markup itself: axe never audits an aria-hidden
subtree, and the always-visible plain-text source (`#how-i-work-grid`,
`#signal-stack-static`) carries the real accessible content regardless.
Verified clean across repeated `check:a11y` runs (both passes), not just
once — the contrast bug this avoids was itself timing-dependent.

**Two real Matter.js bugs surfaced building Signal stack, both caught by
measurement, not by eye:**

1. **Letters collided with each other.** All of a word's letter bodies
   share one Matter `World`; by default any two bodies in it can
   collide. Adjacent letters converging on the same baseline row at
   slightly staggered times shoved each other sideways, breaking
   legibility on landing (caught by screenshot: "Power BI" landed with
   overlapping letters). Fixed by giving every letter body the same
   negative `collisionFilter.group` — Matter's rule is that
   same-negative-group bodies never collide with each other, while each
   still collides normally with the (group 0) floor.
2. **`inertia: Infinity` as a body-creation option didn't reliably lock
   rotation.** `Matter.Body.setInertia(body, Infinity)`, called
   explicitly right after `Bodies.rectangle(...)`, does.

**A methodology trap while diagnosing both of the above: repeated
Selenium screenshots (or `executeScript` polling) can starve the page's
own `requestAnimationFrame` loop badly enough to make working physics
look broken or "blank."** Several early diagnostic screenshots showed
the Signal stack stage completely blank, or a word frozen mid-fall long
past when it should have settled — that pointed at a real bug, but
wasn't one. An in-page timer (a `setInterval` logging to a
`window`-level array, reading real elapsed time with zero Selenium
round-trips in the loop) proved the actual word-cycle timing was a
clean, correct 2700ms throughout; the "broken" runs were ones taking
many screenshots or `executeScript` calls in a tight loop, which measurably
delayed the page's own animation frames. **The fix for the test, not the
page: take one screenshot per page load after a single plain
`sleep()`, or read state via an in-page recorder fetched once at the
end — never via repeated `executeScript` polling interleaved with
screenshot capture.** Confirmed all 8 words (`SQL`, `Python`, `R`,
`Power BI`, `Excel`, `ETL`, `Data quality`, `Git`) land straight and
legible this way before either fix above was trusted.

## Full-bleed sections use natural block width, not `width: 100vw`

`.project-band` (the Terroir/Apophenia bands) used to break out of its
container with `width: 100vw; position: relative; left: 50%;
margin-left: -50vw; margin-right: -50vw` — a common full-bleed trick,
but unnecessary here: `#work` (its parent) and `<main>` (its
grandparent) have no `max-width` of their own, so a plain block already
renders exactly as wide as the viewport with nothing to break out of.

**`100vw` always includes the vertical scrollbar's gutter width; the
real viewport (`document.documentElement.clientWidth`) doesn't.**
Whenever a vertical scrollbar is present, `100vw` overshoots the true
available width by the scrollbar's width — invisible on any page short
enough to never need a scrollbar, which is exactly what this page was
before "How I work" gained its 340vh scroll container. That change made
the page tall enough to need a scrollbar it previously didn't, and
`.project-band` started overflowing at 320px by exactly the scrollbar's
width — caught with a real overflow-culprit scan (`clientWidth` 305 vs.
this element's own `right` at 313, motion enabled), not eyeballed, and
correctly understood as a regression this session's own change caused,
not a pre-existing unrelated bug.

**The fix removes the `100vw` trick rather than compensating for it**
(e.g. with a `calc()` scrollbar-width correction) — `.project-band` is
now a plain block with no `width`/`position`/`left`/`margin` overrides
at all, same as `.quote-band`, `.how-i-work` and `.signal-stack`, none
of which ever needed the trick either. **Before adding a new full-bleed
section, check whether its ancestor chain up to `<body>` actually has a
`max-width` to break out of** — on this page, none of them do, so `grep
-n "100vw" assets/styles.css` should only ever turn up this section's
own explanation, never a live rule. The header (`.site-header`) is the
one section that genuinely needs a similar full-bleed effect while
staying centred — it solves the same problem with `padding: 20px
max(32px, calc((100% - 1240px) / 2))` instead, which never references
`100vw` and so was never at risk of this bug.

## Design-tool scaffolding never leaves the working tree

This site was originally built inside an AI design tool, which left its
own runtime and sync-log files sitting in the project directory —
`support.js` (a generated JS bundle, `dc-runtime`'s own preview
runtime), `github.md` (that tool's sync log), `.thumbnail` (a preview
image) and `uploads/` (pasted source screenshots). None of them are
referenced by `index.html` or `404.html` — they're the tool's own
scaffolding, not part of the shipped site — so they're gitignored
rather than deleted, in case the raw `uploads/` screenshots are still
useful as crop sources later.

**Whenever this site is edited inside a similar tool again, check for
new scaffolding files before publishing** — `npm run check:untracked`
(`scripts/check-untracked.mjs`) fails the moment anything untracked and
ungitignored shows up, specifically to catch this before a `git add`
publishes it.

## Contrast must hold in every interactive state, not just at rest

A real bug taught this the hard way: the global `a:hover { color: var(--accent); }`
rule has higher CSS specificity than a plain `.button--primary` class rule, so on
hover it silently overrode every button's text colour — on `.button--primary` that
made the label exactly match its own background, disappearing completely. axe-core
only audits the DOM's default rendered state, so CI stayed green throughout.

**Whenever you touch button, link or control styling, check contrast in every
state — default, `:hover`, `:focus-visible`, `:active` — by measurement, not by
eye.** `scripts/check-contrast-states.mjs` does this for the buttons and the copy
control by real mouse-hover and keyboard-focus in a live browser (not a static
scan) — run it (`npm run check:contrast-states`) after any styling change and add
new interactive elements to its list.

**If you add a real link to that list, its `:active` measurement needs the
click-guard.** The script presses-and-releases the mouse to trigger `:active`,
but on a genuine `<a href>` that press+release *is* a click — unguarded, it
navigates the tab mid-loop and stales every element reference after it. The
script installs a capturing `click` listener that calls `preventDefault()`
before it presses, which absorbs the navigation without touching the
`:hover`/`:focus-visible`/`:active` styling being measured. This was a real,
previously-undetected bug: `check:contrast-states` crashed outright on
`.button--secondary` (whose first match, "Download CV", is a real same-tab
navigation) and was never wired into `checks.yml`, so nothing ever ran it in
CI to notice.

## Every third-party asset is self-hosted or justified, and either way it's in LICENSE.md

Bricolage Grotesque set the hero headline — arguably the single most
prominent piece of text on the site — loaded live from
`fonts.googleapis.com`, while Archivo and Source Sans 3 sat right next
to it in the same `--font-*` tokens, self-hosted from `assets/fonts/`.
`LICENSE.md`'s font section named the two self-hosted ones and said
nothing about the third. None of that made it an infringement — it's
OFL either way — but a licence file that lists fonts and misses one
being actively used stops being a document anyone can trust without
re-auditing it themselves, which defeats the point of having it. This
is the same both-directions failure the sister repo had with icon
credits: entries for things not actually used, silence on the one that
was.

**Check both directions, not just one:** every third-party asset this
site actually loads (fonts, but the same applies to anything added
later) is either self-hosted with a stated reason it wasn't, or
knowingly loaded live with a stated reason why — and either way, it has
an entry in `LICENSE.md`. And separately: every entry `LICENSE.md`
makes must name something the repo still actually uses — an entry for
a font or asset that's been removed is exactly as untrustworthy as a
missing one, just in the other direction.

## A skip list is a coverage hole — every entry needs a stated reason and the narrowest possible pattern

`check:links`'s `--skip` pattern excluded `gabrielaoliveranz\.github\.io`
— the entire domain — to avoid `linkinator` re-fetching this site's own
canonical URL (harmless, but redundant, since it's already being
crawled directly). That one pattern also silently excluded
`https://gabrielaoliveranz.github.io/terroir-case-study/`, the Case
study button on the Terroir project — the only outbound link on this
page whose target this same person controls, and so the only one
breakable by a renamed repo, a disabled Pages site, or a domain move
elsewhere in this person's own GitHub account. LinkedIn (blocks bots)
and the two slow-to-wake dashboards are genuinely justified skips; nothing
about that reasoning extends to a second, unrelated path on the same
domain — the pattern was just wider than any reason for it.

**Every `--skip` entry needs its own stated reason, and a pattern no
wider than that reason requires.** `gabrielaoliveranz\.github\.io/$` —
anchored to the bare root, trailing slash, nothing after — covers only
the actual self-reference, so `/terroir-case-study/` and
`/assets/images/og-card.png` on the same domain are genuinely checked.
Verified, not assumed: deliberately pointed the Case study link at a
path that 404s, confirmed `check:links` reported it, then reverted.

## Line endings are the repo's problem, not core.autocrlf's

Every committed text file is LF. On Windows, Git can transparently
convert that to CRLF on checkout and back to LF on commit — but only if
`core.autocrlf` is set, and that setting lives in *this machine's* git
config, not in the repo. On the machine this site is developed on it
happened to be set at the system level (`core.autocrlf=true` in Git for
Windows' own `gitconfig`), which is why editing `assets/styles.css`
here has never actually produced a stray CRLF-vs-LF diff — checked
directly (`git diff`, `git status`) rather than assumed, the day this
section was written, and both were clean. That was this machine's
config working correctly, not a property of the repository: clone this
repo somewhere with a different `core.autocrlf` — a teammate's default,
a different tool, a CI image — and nothing here would have stopped a
CRLF checkout from turning into a same-content, every-line "modified"
diff on the next edit, which would have looked like a real change and
would have destroyed `git blame` on that file if committed.

**`.gitattributes` makes this the repository's guarantee, not each
contributor's.** `* text=auto eol=lf` normalises every text file to LF
in the object database regardless of what a given machine's config
does locally; true binaries (`.woff2`, `.png`, `.jpg`, `.pdf`, `.ico`)
are marked `binary` explicitly so nothing ever attempts to
line-ending-normalise them. Verified before committing, not assumed:
`git add --renormalize .` immediately after adding the file staged
zero content changes — every already-committed blob already matched
what the new rules produce, so adding this file is confirmed to be
pure hardening, not a mass reformat in disguise.

**If a file ever does show as modified with a suspicious 1:1
insertions-to-deletions count matching its own line count, don't
commit it** — check `git diff --ignore-cr-at-eol` (or `-w`) first. An
empty result there against a non-empty plain `git diff` means the
content is byte-identical and only line endings moved; discard the
working-tree change (`git restore -- <file>`) rather than commit a
no-op diff that erases `git blame` for every line in the file.

## Everything else

Same standard as `terroir-case-study`, plus several checks specific to this
site: `lang="en-NZ"`, real title and meta description, Open Graph and
Twitter cards, `alt` on every image, visible focus states, WCAG AA
contrast, no horizontal overflow from 320px up verified by measurement
(`npm run check:overflow`), en-NZ spelling throughout (colour, organise,
analyse, modelling), hand-written HTML with content in source — never a
bundled export. Every local asset reference (`src`/`href` in the HTML,
`url()` in the CSS) is checked against the real, case-exact filename on
disk (`npm run check:assets`) — Windows and macOS resolve a wrong-case
path locally without complaint, then GitHub Pages 404s it, because Linux
is case-sensitive. Nothing untracked-and-ungitignored can slip into a
commit unnoticed (`npm run check:untracked`) — see "Design-tool
scaffolding never leaves the working tree" above. And the OG card's actual
pixels are checked against the live `--accent` token and the declared
`og:image` dimensions (`npm run check:og-card`) — see "The OG card carries
its own copy of both the tokens and the numbers" above. Checks run in CI on
every push (`.github/workflows/checks.yml`), same as the case study.
