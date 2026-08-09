// Fails if the page has horizontal overflow at any of the target viewport
// widths (document.documentElement.scrollWidth > window.innerWidth). This
// is a measured, not eyeballed, check: a `.subzone` (and any other flex/grid
// item) with the browser's default min-width:auto refuses to shrink below
// its own content's min-content width, so five columns plus their gaps can
// silently exceed a narrow viewport without anything in the CSS looking
// obviously wrong. See CLAUDE.md, "Accessibility is claimed, so it must
// hold" — no horizontal overflow from 320px up, verified by measurement.

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

const WIDTHS = [320, 390, 768];
// Tall enough that the full page always fits without a vertical scrollbar:
// a vertical scrollbar reserves gutter width, which would shrink
// document.documentElement.clientWidth below window.innerWidth for reasons
// that have nothing to do with horizontal overflow and would muddy the
// comparison below.
const HEIGHT = 20000;

async function buildDriver(chromePath, chromedriverPath) {
  const service = new chrome.ServiceBuilder(chromedriverPath);
  const options = new chrome.Options();
  // Same reasoning as check-a11y.mjs's reduced-motion pass: without this,
  // every [data-reveal]/[data-grow] section is still sitting in its
  // pre-reveal opacity:0/scale(0) transform state (styles.css,
  // html.motion-ready [data-reveal]) at measurement time, which distorts
  // both scrollWidth and getBoundingClientRect in ways that don't reflect
  // the settled page any real visitor ends up looking at.
  options.addArguments("headless", "no-sandbox", "disable-gpu", "force-prefers-reduced-motion");
  options.setChromeBinaryPath(chromePath);
  return new Builder().forBrowser("chrome").setChromeOptions(options).setChromeService(service).build();
}

// Finds the actual overflowing elements (not just the top-level symptom) by
// checking every element's rendered box against the viewport — the culprit
// is whatever pokes out furthest, not necessarily the outermost container.
//
// Uses the DevTools Protocol (Emulation.setDeviceMetricsOverride) rather
// than driver.manage().window().setRect(): setRect resizes the actual OS
// window, and Chrome enforces a real minimum window width (~534px on this
// platform) well above our narrowest target widths — it silently clamps
// 320px and 390px requests up to the same floor, which was passing this
// check while the real page overflowed. The CDP override sets the CSS
// viewport directly, independent of any OS window minimum.
async function measure(driver, url, width, height) {
  await driver.sendDevToolsCommand("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await driver.get(url);
  return driver.executeScript(
    // clientWidth, not window.innerWidth: innerWidth includes any vertical
    // scrollbar's gutter, so comparing scrollWidth against it can pass or
    // fail for reasons unrelated to actual content overflow. clientWidth is
    // the real available content width and what scrollWidth should be
    // measured against.
    "var clientWidth = document.documentElement.clientWidth;" +
      "var scrollWidth = document.documentElement.scrollWidth;" +
      "var culprits = [];" +
      "document.querySelectorAll('body *').forEach(function (el) {" +
      "  var r = el.getBoundingClientRect();" +
      "  if (r.right > clientWidth + 1 || r.left < -1) {" +
      "    var cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().replace(/\\s+/g, '.') : '';" +
      "    culprits.push({" +
      "      selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls," +
      "      left: Math.round(r.left)," +
      "      right: Math.round(r.right)," +
      "      width: Math.round(r.width)" +
      "    });" +
      "  }" +
      "});" +
      "culprits.sort(function (a, b) { return b.right - clientWidth - (a.right - clientWidth); });" +
      "return { scrollWidth: scrollWidth, clientWidth: clientWidth, culprits: culprits.slice(0, 10) };"
  );
}

async function main() {
  installMatchedChrome();
  const { chromePath, chromedriverPath } = readDriverPaths();
  const server = startStaticServer();
  let exitCode = 1;
  try {
    await waitForServer(`${BASE}/index.html`);
    const driver = await buildDriver(chromePath, chromedriverPath);
    let failed = false;
    try {
      for (const page of PAGES) {
        for (const width of WIDTHS) {
          const url = `${BASE}/${page}`;
          const { scrollWidth, clientWidth, culprits } = await measure(driver, url, width, HEIGHT);
          const ok = scrollWidth <= clientWidth;
          console.log(
            `${ok ? "OK  " : "FAIL"}  ${page.padEnd(10)} width=${width}px  scrollWidth=${scrollWidth}  clientWidth=${clientWidth}`
          );
          if (!ok) {
            failed = true;
            for (const c of culprits) {
              console.error(`        overflow: ${c.selector}  left=${c.left} right=${c.right} width=${c.width}`);
            }
          }
        }
      }
    } finally {
      await driver.quit();
    }
    exitCode = failed ? 1 : 0;
  } finally {
    server.close();
  }
  process.exit(exitCode);
}

main();
