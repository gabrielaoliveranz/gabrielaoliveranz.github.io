# Next steps

Working notes for picking this back up — not a durable convention
document (that's `CLAUDE.md`), just what's pending and why.

## Tomorrow

Design review of `/small-business/` with Gabriela — she'll bring
changes from reviewing the local preview (`npm run serve`, then
http://localhost:8080/small-business/index.html).

## Case studies section (planned, not built)

A hidden "Case studies" section for `/small-business/`. For each case:
a client (named or anonymous, per that client's own preference), the
challenge, what was done, the result with a measurable number, a
dashboard screenshot using sample/masked data (never the client's real
figures), and a testimonial quote.

**Unpublished until the first real case (Litchfields Grain) is
approved by the client for publication.** Don't build placeholder or
dummy cases in the meantime — same standard as the Testimonials section
already on the page (see CLAUDE.md, "The small-business page").

## No "Clients" logo row yet

Hold off on a client-logos section until there are several clients, and
each has given written permission to use their name/logo there. One
client isn't a credible logo row on its own, and a logo used without
written permission is a real problem, not just a design one.

## Publishing /small-business/ — the 3 steps

Full context in CLAUDE.md, "The small-business page". In one commit:

1. Add it to `index.html`'s header nav.
2. Add its `<url>` entry to `sitemap.xml`.
3. Remove its `--skip` entry from `check:links` in `package.json`.

Then update `README.md`'s Pages table and file-tree note in the same
change — both currently say this page isn't linked or published yet.
