import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const { chromium } = await import("playwright-core").catch(() =>
  import("/tmp/pw/node_modules/playwright-core/index.mjs"),
);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shots = "/tmp/shots";
fs.mkdirSync(shots, { recursive: true });

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  const file = path.join(root, path.normalize(rel));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
const base = "http://127.0.0.1:4173/";
const errors = [];

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"],
});

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function tinyTargets(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".btn, .nav button, .flower, .pic-card, .big-choice")]
      .filter((el) => !el.hidden && el.getClientRects().length)
      .map((el) => {
        const box = el.getBoundingClientRect();
        return { w: Math.round(box.width), h: Math.round(box.height), name: el.getAttribute("aria-label") || el.dataset.act || el.textContent.trim().slice(0, 40) };
      })
      .filter((box) => box.h < 48 || box.w < 44),
  );
}

async function shot(page, name) {
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.screenshot({ path: path.join(shots, name) });
}

async function fly(page, id) {
  await page.waitForFunction(() => document.documentElement.dataset.busy !== "1");
  await page.locator(`[data-act=fly][data-id=${id}]`).click();
  await page.waitForFunction(() => document.documentElement.dataset.busy === "1");
  await page.waitForFunction(() => document.documentElement.dataset.busy === "0");
}

function watch(page) {
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
}

const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
watch(page);

await page.goto(`${base}index.html`, { waitUntil: "networkidle" });
await page.waitForSelector("h1");
if ((await overflow(page)) > 1) errors.push(`home overflow ${await overflow(page)}`);
const tinyHome = await tinyTargets(page);
if (tinyHome.length) errors.push(`tiny home ${JSON.stringify(tinyHome)}`);
await shot(page, "landing-home.png");
const gap = await page.evaluate(() => {
  const choices = [...document.querySelectorAll(".big-choice")];
  const el = choices[choices.length - 1];
  el.scrollIntoView({ block: "center" });
  const nav = document.querySelector(".nav").getBoundingClientRect();
  const box = el.getBoundingClientRect();
  return nav.top - box.bottom;
});
if (gap < 4) errors.push(`garden button sits under the nav by ${gap}`);

await page.goto(`${base}index.html?book=prek&unit=2&page=13`, { waitUntil: "networkidle" });
await page.waitForSelector("h1");
const title13 = await page.locator("h1").innerText();
if (!title13.includes("Say it, see it")) errors.push(`page 13 title ${title13}`);
for (const word of ["bee", "bug", "bag"]) {
  if ((await page.locator(`img[alt="${word}"]`).count()) < 1) errors.push(`missing ${word}`);
}
const visible13 = await page.locator("main").innerText();
if (/\bbag\b/i.test(visible13)) errors.push("bag is printed on the child page");
await page.waitForFunction(() => ["playing", "blocked", "idle"].includes(document.documentElement.dataset.audio || ""), null, { timeout: 4000 }).catch(() => errors.push("page 13 audio did not start"));
await page.click("[data-act=hear-page]");
await page.waitForFunction(() => document.documentElement.dataset.audio === "playing", null, { timeout: 4000 }).catch(() => errors.push("hear button did not play"));
await shot(page, "landing-page13.png");

await page.goto(`${base}index.html?book=prek&unit=2&page=15`, { waitUntil: "networkidle" });
await page.waitForSelector("h1");
if (!(await page.locator("h1").innerText()).includes("Sound maze")) errors.push("page 15 heading");
for (const word of ["cat", "dog", "bug", "sun", "bun", "box", "ox", "bag", "bed", "hen", "axe"]) {
  if ((await page.locator(`.flower img[alt="${word}"]`).count()) < 1) errors.push(`maze missing ${word}`);
}
await page.click("[data-act=nav][data-to='book=prek&unit=2&play=bee']");
await page.waitForSelector("[data-act=fly][data-id=bag]");
await shot(page, "bee-flight.png");

await fly(page, "cat");
const afterCat = await page.locator("[data-status]").innerText();
if (!afterCat.includes("Try another")) errors.push(`soft miss text: ${afterCat}`);
for (const word of ["bag", "bed", "bun", "box", "bug"]) await fly(page, word);
await page.waitForFunction(() => (document.querySelector("[data-status]")?.textContent || "").includes("The bee is home"));
const homeText = await page.locator("[data-status]").innerText();
if (!homeText.includes("The bee is home")) errors.push(`home text: ${homeText}`);
if (await page.locator("[data-done]").getAttribute("hidden")) errors.push("done actions stayed hidden");

await page.click("[data-act=bonus]");
await page.waitForSelector(".flower.is-next img");
const bonusNext = await page.locator(".flower.is-next img").getAttribute("alt");
if (bonusNext !== "bun") errors.push(`bonus next ${bonusNext}`);

await page.goto(`${base}index.html?book=prek&unit=2&play=garden`, { waitUntil: "networkidle" });
if ((await page.locator(".plot.is-earned img").count()) < 1) errors.push("sticker missing after the bee got home");
await shot(page, "sticker-garden.png");

await page.goto(`${base}index.html?book=prek&unit=2&play=talk`, { waitUntil: "networkidle" });
if (await page.locator("[data-act=say]").count()) await page.click("[data-act=say]");
if (await page.locator("[data-act=mic-no]").count()) await page.click("[data-act=mic-no]");
await page.click("[data-act=said-it]");
await page.waitForFunction(() => (document.querySelector("[data-nudge]")?.textContent || "").length > 0);
const nudge = await page.locator("[data-nudge]").innerText();
const effort = ["You tried. That is what matters.", "A good try. The garden likes that.", "You kept going. I am glad."];
if (!effort.includes(nudge)) errors.push(`nudge ${nudge}`);
await shot(page, "ori-talk.png");

await page.setViewportSize({ width: 320, height: 700 });
await page.goto(`${base}index.html?book=prek&unit=2&play=bee`, { waitUntil: "networkidle" });
if ((await overflow(page)) > 1) errors.push(`narrow bee overflow ${await overflow(page)}`);
const tinyBee = await tinyTargets(page);
if (tinyBee.length) errors.push(`tiny bee ${JSON.stringify(tinyBee)}`);
await page.setViewportSize({ width: 390, height: 844 });

await page.goto(`${base}index.html?book=prek&unit=2&play=grown`, { waitUntil: "networkidle" });
await page.fill("#gate-answer", "4");
await page.click("button[type=submit]");
if (!(await page.locator("[data-status]").innerText()).includes("did not open")) errors.push("bad gate answer was accepted");
await page.fill("#gate-answer", "15");
await page.click("button[type=submit]");
await page.waitForSelector("[data-code]");
const code = await page.locator("[data-code]").inputValue();
if (!code.startsWith("PS1-")) errors.push(`code ${code}`);
if (!(await page.locator("main").innerText()).includes("Teacher's tip")) errors.push("tip missing");

const fresh = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page2 = await fresh.newPage();
watch(page2);
await page2.goto(`${base}index.html?book=prek&unit=2&play=grown`, { waitUntil: "networkidle" });
await page2.fill("#gate-answer", "15");
await page2.click("button[type=submit]");
await page2.fill("[data-paste]", code);
await page2.click("[data-act=restore]");
if (!(await page2.locator("[data-restore-msg]").innerText()).includes("restored")) errors.push("restore message");
await page2.goto(`${base}index.html?book=prek&unit=2&play=garden`);
if ((await page2.locator(".plot.is-earned").count()) < 1) errors.push("restored garden has no sticker");

const offlinePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(offlinePage);
await offlinePage.goto(`${base}index.html?book=prek&unit=2&page=13`, { waitUntil: "networkidle" });
await offlinePage.waitForFunction(async () => {
  const reg = await navigator.serviceWorker.ready;
  return Boolean(reg.active);
}, null, { timeout: 8000 });
await offlinePage.reload({ waitUntil: "networkidle" });
await offlinePage.context().setOffline(true);
await offlinePage.goto(`${base}index.html?book=prek&unit=2&page=15`, { waitUntil: "domcontentloaded" });
await offlinePage.waitForSelector("h1");
const offlineTitle = await offlinePage.locator("h1").innerText();
if (!offlineTitle.includes("Sound maze")) errors.push(`offline title ${offlineTitle}`);
const loaded = await offlinePage.evaluate(() => {
  const img = document.querySelector(".flower img");
  return img ? img.naturalWidth : 0;
});
if (loaded < 1) errors.push("offline picture did not load");

await browser.close();
server.close();

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("ui check ok");
console.log(fs.readdirSync(shots).join("\n"));
