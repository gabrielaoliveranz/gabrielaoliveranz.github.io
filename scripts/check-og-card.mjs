// Fails if assets/images/og-card.png doesn't actually reflect the current
// --accent token, or doesn't match the dimensions the OG meta tags declare
// for it. This exists because it already happened silently once: the site
// was repainted from Terroir's brown to blue, and the card — a static PNG
// with no build step tying it to the CSS — kept shipping the old accent
// for who knows how long, because nothing ever looked at it again.
// scripts/generate-og-card.mjs makes fixing that easy; this makes not
// noticing it impossible. See CLAUDE.md, "The OG card is an eighth copy".
//
// Reads the actual committed PNG's pixels (not the template, not an
// assumption) and reads --accent from the actual current styles.css (not
// a hardcoded copy of it) — so this check is honest about drifting either
// way: a changed token or a stale image both fail it.

import { readFileSync } from "node:fs";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import {
  BASE,
  installMatchedChrome,
  readDriverPaths,
  startStaticServer,
  waitForServer,
} from "./lib/browser-env.mjs";

const IMAGE_PATH = "assets/images/og-card.png";
const IMAGE_URL = `${BASE}/${IMAGE_PATH}`;

// The bar alone is a solid 16x630 rectangle — ~10,000 exact-match pixels
// when current. A stale or wrong accent should produce ~0.
const MIN_MATCHING_PIXELS = 1000;

function readAccent() {
  const css = readFileSync("assets/styles.css", "utf8");
  const match = css.match(/--accent:\s*(#[0-9A-Fa-f]{6})/);
  if (!match) throw new Error("Could not find --accent in assets/styles.css");
  return match[1].toUpperCase();
}

function readDeclaredDimensions() {
  const html = readFileSync("index.html", "utf8");
  const width = html.match(/property="og:image:width"\s+content="(\d+)"/);
  const height = html.match(/property="og:image:height"\s+content="(\d+)"/);
  if (!width || !height) throw new Error("Could not find og:image:width/height in index.html");
  return { width: Number(width[1]), height: Number(height[1]) };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Counts matching pixels inside the browser rather than shipping a
// 1200x630 image's full RGBA data (millions of numbers) back over the
// WebDriver protocol as JSON.
async function readImageAndCountAccent(driver, r, g, b) {
  return driver.executeAsyncScript(`
    var done = arguments[arguments.length - 1];
    var url = arguments[0], r = arguments[1], g = arguments[2], b = arguments[3];
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var matching = 0;
      for (var i = 0; i < data.length; i += 4) {
        if (data[i] === r && data[i + 1] === g && data[i + 2] === b) matching++;
      }
      done({ width: img.naturalWidth, height: img.naturalHeight, matching: matching });
    };
    img.onerror = function () { done({ error: "image failed to load" }); };
    img.src = url;
  `, IMAGE_URL, r, g, b);
}

async function main() {
  const accentHex = readAccent();
  const [ar, ag, ab] = hexToRgb(accentHex);
  const declared = readDeclaredDimensions();

  installMatchedChrome();
  const { chromePath, chromedriverPath } = readDriverPaths();
  const server = startStaticServer();
  let failed = false;
  try {
    await waitForServer(IMAGE_URL);
    const service = new chrome.ServiceBuilder(chromedriverPath);
    const options = new chrome.Options();
    options.addArguments("headless", "no-sandbox", "disable-gpu");
    options.setChromeBinaryPath(chromePath);
    const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).setChromeService(service).build();
    try {
      // Navigate to a same-origin page first — the driver otherwise starts
      // on about:blank, whose opaque origin makes even a same-host image
      // load look cross-origin and fail (or taint the canvas) once it's
      // drawn.
      await driver.get(`${BASE}/404.html`);
      const image = await readImageAndCountAccent(driver, ar, ag, ab);
      if (image.error) {
        console.error(`FAIL  ${IMAGE_PATH}: ${image.error}`);
        process.exit(1);
      }

      if (image.width !== declared.width || image.height !== declared.height) {
        failed = true;
        console.error(
          `FAIL  dimensions: ${IMAGE_PATH} is ${image.width}x${image.height}, ` +
            `but index.html declares og:image:width/height as ${declared.width}x${declared.height}`
        );
      } else {
        console.log(`OK    dimensions: ${image.width}x${image.height} matches declared og:image size`);
      }

      const matching = image.matching;
      if (matching < MIN_MATCHING_PIXELS) {
        failed = true;
        console.error(
          `FAIL  accent colour: found ${matching} pixel(s) matching --accent (${accentHex}) in ${IMAGE_PATH}, ` +
            `expected at least ${MIN_MATCHING_PIXELS}. The card is stale — run \`npm run generate:og-card\`.`
        );
      } else {
        console.log(`OK    accent colour: ${matching} pixels match --accent (${accentHex})`);
      }
    } finally {
      await driver.quit();
    }
  } finally {
    server.close();
  }

  process.exit(failed ? 1 : 0);
}

main();
