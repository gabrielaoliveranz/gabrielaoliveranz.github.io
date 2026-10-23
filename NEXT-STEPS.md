# Next steps

Working notes for picking this back up: what's pending and why.

## Case studies

The first real case study, **Litchfields Grain**, is live at
`/case-studies/litchfields-grain/`, linked from the home page and from
the small-business page's Case studies section, and listed in
`sitemap.xml`.

Next ones get their own folder under `case-studies/`, a card on the
home page and on `/small-business/`, a `sitemap.xml` entry, and an entry
in `check:html` / `check:links`. Use only material the client has
approved, with sample or masked figures, never real client data.

## Testimonials

Planned, not built. Add the section once there's a first real client
testimonial (a LinkedIn Services review has been requested from
Litchfields Grain).

## No "Clients" logo row yet

Hold off on a client-logos section until there are several clients and
each has given written permission to use their name and logo there. One
client isn't a credible logo row on its own, and a logo used without
written permission is a real problem, not just a design one.

## `assets/styles.css`

The previous design's stylesheet is no longer loaded by any page, but
`scripts/check-og-card.mjs` reads `--accent` from it. Retire it only
together with pointing that script (and the OG card generator) at
`assets/site.css`.
