// Shared setup for the local-server + matched-Chrome checks
// (check-a11y.mjs, check-overflow.mjs): installing a version-matched
// Chrome/ChromeDriver pair via browser-driver-manager, reading their paths,
// and serving the static site during the check.

import { createServer } from "http-server";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const PORT = 8080;
export const BASE = `http://localhost:${PORT}`;
export const PAGES = ["index.html", "404.html"];

const ENV_PATH = join(homedir(), ".browser-driver-manager", ".env");

export function installMatchedChrome() {
  const result = spawnSync("npx browser-driver-manager install chrome", {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error("browser-driver-manager failed to install a matched Chrome/ChromeDriver pair");
  }
}

export function readDriverPaths() {
  const env = readFileSync(ENV_PATH, "utf8");
  const get = (key) => {
    const match = env.match(new RegExp(`^${key}="(.+)"$`, "m"));
    if (!match) throw new Error(`${key} not found in ${ENV_PATH}`);
    return match[1];
  };
  return {
    chromePath: get("CHROME_TEST_PATH"),
    chromedriverPath: get("CHROMEDRIVER_TEST_PATH"),
  };
}

export function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(url)
        .then(() => resolve())
        .catch((err) => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Server didn't respond within ${timeoutMs}ms: ${err.message}`));
          } else {
            setTimeout(attempt, 200);
          }
        });
    };
    attempt();
  });
}

export function startStaticServer() {
  const server = createServer({ root: ".", cache: -1 });
  server.listen(PORT);
  return server;
}
