// Fails if the site footer differs between pages. The footer is hand-copied
// into each page (no build step), so this compares each page's footer with
// the home page's after normalising the only things that may differ: the
// relative path to /assets/ and whether the Newsletter link is "#newsletter"
// (on the home page and small-business, where the section exists) or
// "/#newsletter" (everywhere else).

import { readFileSync } from "node:fs";

const PAGES = [
  "index.html",
  "404.html",
  "small-business/index.html",
  "privacy/index.html",
  "case-studies/litchfields-grain/index.html",
];

function footer(path) {
  const html = readFileSync(path, "utf8");
  const m = html.match(/<footer class="site-foot"[\s\S]*?<\/footer>/);
  if (!m) throw new Error(`${path}: no <footer class="site-foot"> found`);
  return m[0]
    .replace(/src="(?:\.\.\/)*\/?assets\//g, 'src="ASSETS/')
    .replace('href="/#newsletter"', 'href="#newsletter"')
    .replace(/\s+/g, " ")
    .trim();
}

const expected = footer(PAGES[0]);
let failed = false;
for (const p of PAGES.slice(1)) {
  if (footer(p) !== expected) {
    console.error(`FAIL: footer in ${p} differs from the one in ${PAGES[0]}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`Footer is identical on all ${PAGES.length} pages.`);
