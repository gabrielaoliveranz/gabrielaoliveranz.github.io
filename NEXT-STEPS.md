# Next steps

Working notes for picking this back up: what's pending and why.

## Case studies

The first real case study, **Litchfields Grain**, is live at
`/case-studies/litchfields-grain/`, linked from the home page's Case
studies section, and listed in `sitemap.xml`.

Next ones get their own folder under `case-studies/`, a card on the
home page (replacing the "Coming soon" row), a `sitemap.xml` entry, and an
entry in `check:html` / `check:links`. Use only material the client has
approved, with sample or masked figures, never real client data.

## Testimonials

Adriana Litchfield's Google review is on the Litchfields case study page
(full) and on the home page (short excerpt). With two or three more, turn the
home page review into a small grid. Add them only as clients give permission.

## "Trusted by" client logo row (later)

Hold off on a client-logos section until there are several clients and
each has given written permission to use their name and logo there. One
client isn't a credible logo row on its own, and a logo used without
written permission is a real problem, not just a design one.

## `assets/styles.css`

The previous design's stylesheet is no longer loaded by any page, but
`scripts/check-og-card.mjs` reads `--accent` from it. Retire it only
together with pointing that script (and the OG card generator) at
`assets/site.css`.

## Plan prices

Publish "from" prices on the three plan cards once 3 to 4 case studies are
live.
