// Runs axe-core against a local static server, then shuts the server
// down cleanly. Runs http-server in-process via its own API instead of
// spawning it as a subprocess: spawning + killing a subprocess tree on
// Windows needs either wmic.exe (removed from current Windows builds,
// which is what start-server-and-test/tree-kill depend on) or taskkill
// /T — running in-process sidesteps needing either.
//
// axe is pointed at an explicit Chrome + ChromeDriver pair installed by
// browser-driver-manager, rather than the npm chromedriver package plus
// whatever Chrome happens to be preinstalled: those two drift out of sync
// independently (npm resolves chromedriver's own latest version; CI images
// bump their preinstalled Chrome on their own schedule), which is exactly
// what broke this check in CI (chromedriver 151 vs. runner Chrome 150).
// browser-driver-manager downloads a matched Chrome-for-Testing +
// ChromeDriver pair and caches it, so the two versions can't disagree.
//
// Two passes run, and both must be clean:
//
//   1. Reduced-motion pass (npx axe CLI). Forces
//      prefers-reduced-motion so the scroll-reveal in styles.css never
//      applies (html.motion-ready [data-reveal] is the only rule that sets
//      opacity:0), landing on the same fully-visible DOM a no-JS or
//      reduced-motion visitor gets. Catches genuine colour/contrast and
//      markup defects without the animation's opacity:0 state producing
//      false 1:1-contrast violations.
//
//   2. Animated-state pass (custom selenium-webdriver + axe-core). Runs
//      with motion enabled — what most visitors actually see — scrolls the
//      full page so every [data-reveal] section crosses the
//      IntersectionObserver threshold and finishes its transition, then
//      audits the settled, fully-revealed DOM. Catches anything the
//      reduced-motion pass can't see: e.g. an element that never gets
//      marked .is-visible at all, or a reveal transition that leaves
//      something behind at low contrast.
//
// Neither pass alone is sufficient: the reduced-motion pass never exercises
// the animated code path at all, and an unscrolled animated-state scan would
// just fail the same way the original bug did.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import {
  BASE,
  PAGES,
  installMatchedChrome,
  readDriverPaths,
  startStaticServer,
  waitForServer,
} from "./lib/browser-env.mjs";

const require = createRequire(import.meta.url);

function runReducedMotionPass(chromePath, chromedriverPath) {
  const urls = PAGES.map((p) => `${BASE}/${p}`).join(" ");
  console.log("\n=== Pass 1/2: reduced-motion (scroll-reveal never applies) ===");
  return new Promise((resolve) => {
    const axe = spawn(
      `npx axe ${urls} --exit --chrome-path "${chromePath}" --chromedriver-path "${chromedriverPath}" --chrome-options force-prefers-reduced-motion`,
      { stdio: "inherit", shell: true }
    );
    axe.on("close", (code) => resolve(code ?? 1));
  });
}

async function buildAnimatedDriver(chromePath, chromedriverPath) {
  const service = new chrome.ServiceBuilder(chromedriverPath);
  const options = new chrome.Options();
  options.addArguments("headless", "no-sandbox", "disable-gpu", "window-size=1280,900");
  options.setChromeBinaryPath(chromePath);
  return new Builder().forBrowser("chrome").setChromeOptions(options).setChromeService(service).build();
}

// Scrolls the full document in overlapping steps so every [data-reveal]
// section crosses the 0.2 IntersectionObserver threshold, then waits out
// the 700ms opacity/transform transition (styles.css) before checking that
// nothing got left behind unrevealed.
async function revealFullPage(driver) {
  const scrollHeight = await driver.executeScript("return document.documentElement.scrollHeight;");
  const viewportHeight = await driver.executeScript("return window.innerHeight;");
  const step = Math.max(200, Math.round(viewportHeight * 0.6));
  for (let y = 0; y < scrollHeight; y += step) {
    await driver.executeScript("window.scrollTo(0, arguments[0]);", y);
    await driver.sleep(120);
  }
  await driver.executeScript("window.scrollTo(0, document.documentElement.scrollHeight);");
  await driver.sleep(900);

  const stuck = await driver.executeScript(
    "return Array.from(document.querySelectorAll('[data-reveal]:not(.is-visible)'))" +
      ".map(function (el) { return el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + String(el.className).trim().replace(/\\s+/g, '.') : ''); });"
  );
  if (stuck.length > 0) {
    throw new Error(`scroll-reveal never triggered for: ${stuck.join(", ")}`);
  }
}

async function runAxeInBrowser(driver, axeSource) {
  await driver.executeScript(axeSource);
  return driver.executeAsyncScript(
    "var done = arguments[arguments.length - 1];" +
      "axe.run(document, {}, function (err, results) {" +
      "  if (err) { done({ error: String(err) }); return; }" +
      "  done(results);" +
      "});"
  );
}

function reportViolations(label, url, results) {
  if (results.error) {
    console.error(`  [${label}] ${url}: error running axe — ${results.error}`);
    return true;
  }
  if (results.violations.length === 0) {
    console.log(`  [${label}] ${url}: 0 violations found!`);
    return false;
  }
  for (const v of results.violations) {
    console.error(`  [${label}] ${url}: "${v.id}" — ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})`);
    for (const n of v.nodes) {
      console.error(`      ${n.target.join(" ")}`);
    }
  }
  return true;
}

async function runAnimatedPass(chromePath, chromedriverPath) {
  console.log("\n=== Pass 2/2: animated state (scrolled + revealed) ===");
  const axeSource = readFileSync(require.resolve("axe-core/axe.js"), "utf8");
  let failed = false;
  for (const page of PAGES) {
    const url = `${BASE}/${page}`;
    const driver = await buildAnimatedDriver(chromePath, chromedriverPath);
    try {
      await driver.get(url);
      await revealFullPage(driver);
      const results = await runAxeInBrowser(driver, axeSource);
      if (reportViolations("animated", url, results)) failed = true;
    } catch (err) {
      console.error(`  [animated] ${url}: ${err.message}`);
      failed = true;
    } finally {
      await driver.quit();
    }
  }
  return failed ? 1 : 0;
}

installMatchedChrome();
const { chromePath, chromedriverPath } = readDriverPaths();

const server = startStaticServer();

let exitCode = 1;
try {
  await waitForServer(`${BASE}/index.html`);
  const reducedMotionCode = await runReducedMotionPass(chromePath, chromedriverPath);
  const animatedCode = await runAnimatedPass(chromePath, chromedriverPath);
  exitCode = reducedMotionCode !== 0 || animatedCode !== 0 ? 1 : 0;
} finally {
  server.close();
}

process.exit(exitCode);
