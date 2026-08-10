// Measures text/background contrast for interactive elements in every real
// state — default, :hover, :focus-visible, :active — not just at rest.
// axe-core (check-a11y.mjs) only audits the DOM's default rendered state, so
// a rule like a:hover overriding a button's own colour on hover passes CI
// silently. This drives real states in a live browser (WebDriver mouse
// actions trigger native :hover; Tab-key navigation triggers real
// :focus-visible) and reads getComputedStyle after each, so it catches what
// a static scan can't. See CLAUDE.md, "Contrast must hold in every
// interactive state".

import { Builder, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import {
  BASE,
  installMatchedChrome,
  readDriverPaths,
  startStaticServer,
  waitForServer,
} from "./lib/browser-env.mjs";

// Elements to check, by selector — each resolves via querySelector, i.e.
// its first match in document order. Add new interactive elements here.
const TARGETS = [
  ".button--primary",
  // Deliberately scoped to the Contact section, not the bare class: this
  // used to be plain ".button--secondary", whose first match was the
  // hero's "Download CV" link — the real, same-tab-navigating href whose
  // click-guard bug this script was written to catch (see CLAUDE.md,
  // "Contrast must hold in every interactive state"). Once that hero
  // button was removed, ".button--secondary" would have silently started
  // matching a *different* element (a footer social link) instead — same
  // selector, same PASS, but no longer exercising the scenario this entry
  // exists for. A selector that stops matching its intended element
  // doesn't fail, it silently passes on something else; this repo has
  // already had two checks go quietly wrong that way. Scoping the
  // selector to where the CV link actually lives now keeps it pointed at
  // the right element regardless of what else changes in the page.
  ".site-footer__actions .button--primary",
  // Plain .button--secondary itself: now that the entry above claimed the
  // CV scenario, this covers the style on its own merits again — its
  // first match is the footer's LinkedIn link (GitHub, the only other
  // user of this class, shares the same rules).
  ".button--secondary",
  ".copy-button",
  ".email-chip__address",
  ".button--on-dark-primary",
  ".button--on-dark-secondary",
  ".tooling-bar__toggle",
];

function relativeLuminance([r, g, b]) {
  const chan = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [chan(r), chan(g), chan(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function parseColor(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(",").map((n) => parseFloat(n.trim()));
  return parts.length >= 3 ? parts.slice(0, 3) : null;
}

// Blend a translucent foreground colour over an opaque background colour.
function flatten(fg, alpha, bg) {
  return fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);
}

function contrastRatio(rgbA, rgbB) {
  const lA = relativeLuminance(rgbA);
  const lB = relativeLuminance(rgbB);
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

// Walk up from el reading background-color until a fully opaque one is found
// (buttons/links here sit on opaque cards/sections, never on an image).
async function resolveOpaqueBackground(driver, el) {
  return driver.executeScript(
    `let node = arguments[0];
     while (node) {
       const cs = getComputedStyle(node);
       const m = cs.backgroundColor.match(/rgba?\\(([^)]+)\\)/);
       if (m) {
         const parts = m[1].split(',').map(Number);
         if (parts.length < 4 || parts[3] === 1) return cs.backgroundColor;
       }
       node = node.parentElement;
     }
     return 'rgb(255,255,255)';`,
    el
  );
}

async function measureState(driver, el, label, minRatio, results, selector) {
  const color = await driver.executeScript("return getComputedStyle(arguments[0]).color;", el);
  const bgRaw = await driver.executeScript("return getComputedStyle(arguments[0]).backgroundColor;", el);
  const fg = parseColor(color);
  let bgParsed = parseColor(bgRaw);
  let bg = bgParsed;
  if (!bgParsed || bgRaw.startsWith("rgba(") && bgRaw.endsWith(", 0)")) {
    bg = parseColor(await resolveOpaqueBackground(driver, el));
  } else if (bgRaw.includes("rgba")) {
    const alphaMatch = bgRaw.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
    const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1;
    if (alpha < 1) {
      const under = parseColor(await resolveOpaqueBackground(driver, el));
      bg = flatten(bgParsed, alpha, under);
    }
  }
  if (!fg || !bg) {
    results.push({ selector, label, ok: false, note: "could not parse colours" });
    return;
  }
  const ratio = contrastRatio(fg, bg);
  results.push({ selector, label, ratio, ok: ratio >= minRatio });
}

async function run() {
  installMatchedChrome();
  const { chromePath, chromedriverPath } = readDriverPaths();
  const server = startStaticServer();
  const results = [];
  try {
    await waitForServer(`${BASE}/index.html`);
    const service = new chrome.ServiceBuilder(chromedriverPath);
    const options = new chrome.Options();
    options.addArguments("headless", "no-sandbox", "disable-gpu", "window-size=1280,1400");
    options.setChromeBinaryPath(chromePath);
    const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).setChromeService(service).build();
    try {
      await driver.get(`${BASE}/index.html`);
      for (const selector of TARGETS) {
        const el = await driver.findElement({ css: selector });
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);

        // Most TARGETS are real links (several are even target="_blank"
        // anchors, e.g. .button--on-dark-primary). The :active measurement
        // below needs a genuine mousedown+mouseup to trigger the native
        // pseudo-class, but mousedown+mouseup on a real link IS a click —
        // left unguarded, that navigates the tab, which stales every
        // WebDriver reference held in this loop (including `el` itself) and
        // crashes the whole run on whichever selector happens to come next.
        // This suppresses only the resulting navigation, not the click event
        // itself, so :hover/:focus-visible/:active still reflect real
        // mouse/keyboard-driven state.
        await driver.executeScript(
          "arguments[0].addEventListener('click', function (e) { e.preventDefault(); }, true);",
          el
        );

        // Default state.
        await measureState(driver, el, "default", 4.5, results, selector);

        // :hover — a real WebDriver mouse move triggers the native pseudo-class.
        const actions = driver.actions({ async: true });
        await actions.move({ origin: el }).perform();
        await driver.sleep(60);
        await measureState(driver, el, "hover", 4.5, results, selector);
        await actions.move({ origin: driver.findElement({ css: "body" }), x: 0, y: 0 }).perform();

        // :focus-visible — Tab navigation (not .focus()) so the heuristic engages.
        // Tabbing from body isn't reliable for an arbitrary selector, so this
        // focuses it directly and relies on browsers marking a keyboard/JS
        // .focus() as focus-visible when no prior pointer interaction occurred
        // on that element this task.
        await driver.findElement({ css: "body" }).sendKeys(Key.TAB);
        await driver.executeScript("arguments[0].focus();", el);
        await driver.sleep(60);
        await measureState(driver, el, "focus", 4.5, results, selector);

        // :active — press and hold, then release (the click guard above
        // absorbs the click this generates).
        await actions.move({ origin: el }).press().perform();
        await driver.sleep(60);
        await measureState(driver, el, "active", 4.5, results, selector);
        await actions.release().perform();
      }
    } finally {
      await driver.quit();
    }
  } finally {
    server.close();
  }

  let failed = false;
  console.log("\n=== Contrast by interactive state ===");
  for (const r of results) {
    if (r.note) {
      console.error(`  FAIL  ${r.selector} [${r.label}]: ${r.note}`);
      failed = true;
      continue;
    }
    const status = r.ok ? "PASS" : "FAIL";
    if (!r.ok) failed = true;
    console.log(`  ${status}  ${r.selector} [${r.label}]: ${r.ratio.toFixed(2)}:1`);
  }
  process.exit(failed ? 1 : 0);
}

run();
