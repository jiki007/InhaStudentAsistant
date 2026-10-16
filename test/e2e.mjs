// End-to-end check in a real (headless) Chromium at phone size.
// Run: npm run e2e   (needs `npm i -D playwright` and `npx playwright install chromium`)
// Writes screenshots to docs/evidence/ and prints PASS/FAIL per acceptance criterion.
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = pathToFileURL(path.join(root, "index.html")).href;
const out = path.join(root, "docs", "evidence");
fs.mkdirSync(out, { recursive: true });

const offline = process.argv.includes("--offline"); // block CDN + tiles to test the fallback map
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
if (offline) await page.route(/^https?:\/\//, (r) => r.abort());

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log("PASS", name); }
  catch (e) { failures++; console.log("FAIL", name, "-", e.message); }
}
const expectEq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
async function search(q) {
  await page.fill("[data-testid=search-input]", q);
  await page.click("[data-testid=search-submit]");
}

await page.goto(url);
const mapKind = await page.evaluate(() => window.__inhaMapKind);
console.log("map:", mapKind);

await check("S1-AC1 '60th Anniversary' pins 60th Anniversary Hall", async () => {
  await search("60th Anniversary");
  expectEq(await page.getAttribute("[data-testid=map]", "data-pinned"), "B60", "pinned building");
  expectEq(await page.textContent("[data-testid=building-name]"), "60th Anniversary Hall", "card title");
  await page.screenshot({ path: path.join(out, "s1-ac1-search-60th.png") });
});

await check("S1-AC1 Korean '60주년기념관' pins the same building", async () => {
  await search("60주년기념관");
  expectEq(await page.getAttribute("[data-testid=map]", "data-pinned"), "B60", "pinned building");
});

await check("S1-AC2 'XYZ99' shows 'Unrecognized building code'", async () => {
  await search("XYZ99");
  const msg = await page.textContent("[data-testid=message]");
  if (!msg.includes("Unrecognized building code")) throw new Error("message was: " + msg);
  expectEq(await page.isHidden("[data-testid=building-card]"), true, "card hidden");
  await page.screenshot({ path: path.join(out, "s1-ac2-unrecognized.png") });
});

await check("S2-AC1 View Directory shows floor-by-floor English list", async () => {
  await search("60th Anniversary");
  await page.click("[data-testid=view-directory]");
  const floors = await page.$$eval("[data-testid=floor-list] > li", (els) => els.map((e) => e.dataset.floor));
  expectEq(floors.join(","), "1,2,3,4", "floors");
  await page.screenshot({ path: path.join(out, "s2-ac1-directory.png"), fullPage: true });
});

await check("S2-AC2 filter '302' shows only room 302 on floor 3", async () => {
  await page.fill("[data-testid=room-filter]", "302");
  const rooms = await page.$$eval("[data-testid=floor-list] [data-room]", (els) => els.map((e) => e.dataset.room));
  const floors = await page.$$eval("[data-testid=floor-list] > li", (els) => els.map((e) => e.dataset.floor));
  expectEq(rooms.join(","), "302", "rooms");
  expectEq(floors.join(","), "3", "floors");
  await page.locator("[data-testid=directory]").screenshot({ path: path.join(out, "s2-ac2-filter-302.png") });
});

await check("S2 rule: building without floor data shows disabled button", async () => {
  await search("Library");
  expectEq(await page.isDisabled("[data-testid=view-directory]"), true, "disabled");
  expectEq((await page.textContent("[data-testid=view-directory]")).trim(), "Data unavailable for this building", "label");
  await page.screenshot({ path: path.join(out, "s2-rule-no-data.png") });
});

await check("Security: HTML in the search box is shown as text, not executed", async () => {
  await page.evaluate(() => { window.__xss = false; });
  await search('<img src=x onerror="window.__xss=true">');
  await page.waitForTimeout(300);
  expectEq(await page.evaluate(() => window.__xss), false, "script executed");
  expectEq(await page.locator("[data-testid=message] img").count(), 0, "img element injected");
});

await check("Mobile: no horizontal scroll at 390px width", async () => {
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  if (sw > cw) throw new Error(`scrollWidth ${sw} > clientWidth ${cw}`);
});

await browser.close();
console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
