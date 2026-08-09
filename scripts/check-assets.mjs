// Fails if any local asset referenced from the HTML or CSS doesn't exist on
// disk with that exact case. Windows and macOS filesystems are
// case-insensitive by default, so a reference like
// assets/cv/gabriela-olivera-cv.pdf against an actual file named
// Gabriela_Olivera_CV.pdf resolves fine on a dev machine — and then 404s
// the moment it's served from GitHub Pages, which runs on case-sensitive
// Linux. This check reads the real directory listings (not fs.existsSync,
// which is itself case-insensitive on Windows/macOS) so it catches a case
// mismatch on any platform, before it ever reaches CI.
//
// Scoped to plain relative paths only (no scheme, e.g. not
// "https://..."): those are genuinely files in this repo. Absolute URLs
// under this site's own domain are deliberately NOT resolved against this
// repo's filesystem — some of them (e.g. the Terroir case study link)
// point at a sibling GitHub Pages project site living in a different repo,
// not a path inside this one, and linkinator (npm run check:links) already
// verifies every URL, local or remote, actually resolves.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "./lib/browser-env.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Matches src="..." / href="..." attribute values from any local HTML file.
const ATTR_RE = /(?:src|href)="([^"]+)"/g;

// url(...) references inside assets/styles.css (fonts) — resolved relative
// to assets/, since that's where the CSS file itself lives.
const CSS_URL_RE = /url\(["']?([^"')]+)["']?\)/g;

function isLocalRelativePath(ref) {
  if (!ref) return false;
  if (/^([a-z][a-z0-9+.-]*:)/i.test(ref)) return false; // has a scheme (http:, mailto:, tel:, ...)
  if (ref.startsWith("//")) return false; // protocol-relative
  if (ref.startsWith("#")) return false; // in-page anchor
  if (ref.startsWith("/")) return false; // root-relative page route (e.g. "/", "/#work") — not a repo file path
  return true;
}

// Case-exact existence check: walks the path segment by segment, comparing
// each segment against the real directory listing rather than trusting the
// OS's (often case-insensitive) path resolution.
function existsExactCase(relPath) {
  const segments = relPath.split("/").filter(Boolean);
  let dir = ROOT;
  for (const segment of segments) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) return false;
    dir = join(dir, segment);
  }
  return true;
}

function check(source, rawRef, baseDir) {
  const stripped = rawRef.split(/[?#]/)[0];
  const relPath = posix.normalize(posix.join(baseDir, stripped));
  if (!existsExactCase(relPath)) {
    console.error(`FAIL  ${source}: "${rawRef}" — no file at ./${relPath} (exact case)`);
    return false;
  }
  return true;
}

function main() {
  let failed = false;
  let checked = 0;

  for (const page of PAGES) {
    const html = readFileSync(join(ROOT, page), "utf8");
    for (const match of html.matchAll(ATTR_RE)) {
      const ref = match[1];
      if (!isLocalRelativePath(ref)) continue;
      checked++;
      if (!check(page, ref, ".")) failed = true;
    }
  }

  const cssPath = "assets/styles.css";
  const css = readFileSync(join(ROOT, cssPath), "utf8");
  for (const match of css.matchAll(CSS_URL_RE)) {
    if (!isLocalRelativePath(match[1])) continue;
    checked++;
    if (!check(cssPath, match[1], "assets")) failed = true;
  }

  console.log(`${failed ? "FAIL" : "OK"}  checked ${checked} local asset reference(s) across ${[...PAGES, cssPath].join(", ")}`);
  process.exit(failed ? 1 : 0);
}

main();
