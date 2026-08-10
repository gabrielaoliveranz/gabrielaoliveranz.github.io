// Fails if the site's canonical URL has drifted between any of the places
// it's repeated: index.html's own <link rel="canonical">, its og:url,
// og:image and twitter:image tags, 404.html's <link rel="canonical">,
// sitemap.xml's <loc>, and robots.txt's Sitemap: line. There's no build
// step tying these together (see CLAUDE.md, "hand-written HTML... never a
// bundled export"), so each is a hand-maintained copy of the same fact —
// exactly the kind of thing that goes stale silently, the way og-card.png's
// accent colour already did once. See CLAUDE.md, "sitemap.xml and
// robots.txt reference the canonical URL, not a copy of it".
//
// index.html's <link rel="canonical"> is treated as the one source of
// truth; every other value is checked against what it implies. On a
// mismatch, the failure names the exact file and tag involved, and shows
// both the expected and actual value — not just that something disagrees.

import { readFileSync } from "node:fs";

function extract(source, label, re) {
  const match = source.match(re);
  if (!match) throw new Error(`Could not find ${label}`);
  return match[1];
}

function main() {
  const indexHtml = readFileSync("index.html", "utf8");
  const notFoundHtml = readFileSync("404.html", "utf8");
  const sitemapXml = readFileSync("sitemap.xml", "utf8");
  const robotsTxt = readFileSync("robots.txt", "utf8");

  // Source of truth.
  const origin = extract(indexHtml, "index.html <link rel=\"canonical\">", /<link rel="canonical" href="([^"]+)">/);

  const actual = {
    'index.html <link rel="canonical">': origin, // trivially itself; parsed above to prove it exists
    'index.html <meta property="og:url">': extract(indexHtml, 'index.html og:url', /<meta property="og:url" content="([^"]+)">/),
    'index.html <meta property="og:image">': extract(indexHtml, 'index.html og:image', /<meta property="og:image" content="([^"]+)">/),
    'index.html <meta name="twitter:image">': extract(indexHtml, 'index.html twitter:image', /<meta name="twitter:image" content="([^"]+)">/),
    '404.html <link rel="canonical">': extract(notFoundHtml, '404.html canonical', /<link rel="canonical" href="([^"]+)">/),
    'sitemap.xml <loc>': extract(sitemapXml, 'sitemap.xml <loc>', /<loc>([^<]+)<\/loc>/),
    'robots.txt Sitemap:': extract(robotsTxt, 'robots.txt Sitemap:', /Sitemap:\s*(\S+)/),
  };

  const expected = {
    'index.html <link rel="canonical">': origin,
    'index.html <meta property="og:url">': origin,
    'index.html <meta property="og:image">': `${origin}assets/images/og-card.png`,
    'index.html <meta name="twitter:image">': `${origin}assets/images/og-card.png`,
    '404.html <link rel="canonical">': `${origin}404.html`,
    'sitemap.xml <loc>': origin,
    'robots.txt Sitemap:': `${origin}sitemap.xml`,
  };

  let failed = false;
  for (const key of Object.keys(expected)) {
    if (actual[key] === expected[key]) {
      console.log(`OK    ${key}: ${actual[key]}`);
    } else {
      failed = true;
      console.error(`FAIL  ${key}`);
      console.error(`      expected: ${expected[key]}`);
      console.error(`      actual:   ${actual[key]}`);
    }
  }

  if (failed) {
    console.error(
      "\nOne or more URLs have drifted from index.html's <link rel=\"canonical\">. " +
        "If this is an intentional domain move, update all seven together — see " +
        "CLAUDE.md, \"sitemap.xml and robots.txt reference the canonical URL, not a copy of it\"."
    );
  }

  process.exit(failed ? 1 : 0);
}

main();
