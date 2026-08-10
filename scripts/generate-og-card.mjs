// Regenerates assets/images/og-card.png from scripts/og-card-template.html
// at exactly 1200x630, using the site's real self-hosted fonts and the
// live --accent/--bg/--text* tokens from assets/styles.css (the template
// links that stylesheet directly, so there's nothing to keep in sync by
// hand). Run after editing the template, the numbers in it, or any of
// those tokens. See CLAUDE.md, "The OG card is an eighth copy".
//
// scripts/check-og-card.mjs then verifies the committed PNG actually
// reflects the current --accent — this script makes regenerating easy,
// that one makes forgetting to loud.

import { writeFileSync } from "node:fs";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import {
  BASE,
  installMatchedChrome,
  readDriverPaths,
  startStaticServer,
  waitForServer,
} from "./lib/browser-env.mjs";

const TEMPLATE_URL = `${BASE}/scripts/og-card-template.html`;
const OUTPUT_PATH = "assets/images/og-card.png";

installMatchedChrome();
const { chromePath, chromedriverPath } = readDriverPaths();
const server = startStaticServer();
try {
  await waitForServer(TEMPLATE_URL);
  const service = new chrome.ServiceBuilder(chromedriverPath);
  const options = new chrome.Options();
  options.addArguments("headless", "no-sandbox", "disable-gpu");
  options.setChromeBinaryPath(chromePath);
  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).setChromeService(service).build();
  try {
    await driver.sendDevToolsCommand("Emulation.setDeviceMetricsOverride", {
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await driver.get(TEMPLATE_URL);
    // Let web fonts finish loading before capturing — without this, the
    // screenshot can race Bricolage Grotesque's fetch and fall back to a
    // system font.
    await driver.executeAsyncScript(`
      var done = arguments[arguments.length - 1];
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { setTimeout(done, 150); });
      } else {
        setTimeout(done, 500);
      }
    `);
    const data = await driver.takeScreenshot();
    writeFileSync(OUTPUT_PATH, Buffer.from(data, "base64"));
    console.log(`Wrote ${OUTPUT_PATH}`);
  } finally {
    await driver.quit();
  }
} finally {
  server.close();
}
process.exit(0);
