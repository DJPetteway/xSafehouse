// Renders brand/banner.html to PNGs for each platform.
// Usage: npm i playwright && node brand/render-banners.mjs
// (set CHROMIUM_PATH to use an already-installed Chromium)
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = "file://" + path.join(dir, "banner.html");

// s = content scale so the logo lands inside each platform's safe area
const sizes = [
  { name: "banner-x-1500x500", w: 1500, h: 500, s: 0.92 },
  { name: "banner-youtube-2560x1440", w: 2560, h: 1440, s: 1.0 }, // safe area 1546x423
  { name: "banner-discord-960x540", w: 960, h: 540, s: 0.62 },
  { name: "banner-wide-1920x640", w: 1920, h: 640, s: 1.15 },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage();
for (const { name, w, h, s } of sizes) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`${src}?w=${w}&h=${h}&s=${s}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(dir, `${name}.png`) });
  console.log("wrote", name);
}
await browser.close();
