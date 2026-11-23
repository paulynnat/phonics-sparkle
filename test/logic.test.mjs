import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { DISTRACTORS, FIELDS, MAIN_PATH, newFlight, tapFlight } from "../js/bee.js";
import { CLIP_TEXT, LINE_BANK, PAGES, PROXY, allCopy, bankLine, isBankLine, judgeHearing } from "../js/content.js";
import { parseLaunch } from "../js/launch.js";
import { PROXY as nudgeProxy, chooseNudge, proxyPayload } from "../js/nudges.js";
import {
  applyRestore,
  emptyProgress,
  gateOk,
  loadProgress,
  makeCode,
  readCode,
  recordHome,
  recordMiss,
  recordTalk,
  saveProgress,
  soundNote,
} from "../js/progress.js";
import { fallbackLine, lineFromModel } from "../server/nudge-proxy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function memory() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test("QR links open the listening pages", () => {
  const say = parseLaunch("?book=prek&unit=2&page=13");
  assert.equal(say.screen, "page");
  assert.equal(say.page, 13);
  const maze = parseLaunch("book=prek&unit=2&page=15");
  assert.equal(maze.screen, "page");
  assert.equal(maze.page, 15);
  assert.equal(parseLaunch("?book=PreK&unit=2&page=13").page, 13);
  assert.equal(parseLaunch("").screen, "home");
  assert.equal(parseLaunch("?book=k1").screen, "later");
  assert.equal(parseLaunch("?book=prek&unit=4").screen, "later");
  assert.equal(parseLaunch("?book=prek&unit=2&page=99").screen, "later");
  assert.equal(parseLaunch("?book=prek&unit=2&play=bee&field=bonus").field, "bonus");
  assert.equal(PAGES[13].autoplay, true);
  assert.equal(PAGES[15].autoplay, true);
  assert.equal(PAGES[12].autoplay, false);
});

test("bee path is bag, bed, bun, box, bug, and distractors stay off the path", () => {
  assert.deepEqual(FIELDS.main.path, ["bag", "bed", "bun", "box", "bug"]);
  assert.deepEqual(MAIN_PATH, FIELDS.main.path);
  for (const word of DISTRACTORS) {
    assert.equal(FIELDS.main.cells.includes(word), true, word);
    assert.equal(FIELDS.main.path.includes(word), false, word);
    assert.equal(FIELDS.bonus.cells.includes(word), true, word);
  }
  assert.equal(FIELDS.main.cells.includes("hive"), true);
  assert.equal(new Set(FIELDS.main.cells).size, FIELDS.main.cells.length);
  assert.notDeepEqual(FIELDS.bonus.path, FIELDS.main.path);
  for (const word of FIELDS.bonus.path) assert.equal(FIELDS.bonus.cells.includes(word), true);

  let flight = newFlight(FIELDS.main);
  flight = tapFlight(flight, FIELDS.main, "cat");
  assert.equal(flight.step, 0);
  assert.equal(flight.message, "soft");
  flight = tapFlight(flight, FIELDS.main, "bug");
  assert.equal(flight.step, 0);
  flight = tapFlight(flight, FIELDS.main, "hive");
  assert.equal(flight.message, "wait");
  for (const word of MAIN_PATH) {
    flight = tapFlight(flight, FIELDS.main, word);
  }
  assert.equal(flight.done, true);
  assert.equal(flight.message, "home");
  assert.equal(flight.step, 5);
});

test("a good try earns the sticker, and the restore code round trips", () => {
  let progress = emptyProgress();
  assert.equal(progress.earned, false);
  progress = recordMiss(progress);
  assert.equal(progress.earned, false);
  progress = recordTalk(progress);
  progress = recordTalk(progress);
  assert.equal(progress.earned, false);
  progress = recordTalk(progress);
  assert.equal(progress.earned, true);
  assert.equal(soundNote(progress), "Bb had a good try with Ori.");

  progress = recordHome(emptyProgress(), "main");
  assert.equal(progress.earned, true);
  assert.equal(soundNote(progress), "Bb feels steady.");
  progress = recordMiss(recordMiss(recordMiss(recordMiss(recordMiss(progress)))));
  assert.equal(soundNote(progress), "Bb would like a little more play.");

  const code = makeCode(progress);
  const restored = readCode(`  ${code.slice(0, 8)} ${code.slice(8)} `);
  assert.equal(restored.bee.homes, 1);
  assert.equal(restored.bee.misses, 5);
  assert.equal(readCode(`${code.slice(0, -1)}0`), null);
  assert.equal(readCode("nope"), null);

  const kept = applyRestore({ ...emptyProgress(), mic: { noteSeen: true, declined: true } }, restored);
  assert.equal(kept.mic.declined, true);
  assert.equal(kept.earned, true);

  const store = memory();
  saveProgress(store, kept);
  assert.equal(loadProgress(store).bee.homes, 1);
  assert.equal(gateOk("15"), true);
  assert.equal(gateOk("16"), false);
});

test("nudges stay inside the fixed bank and the proxy is off", async () => {
  assert.equal(PROXY.enabled, false);
  assert.equal(nudgeProxy.url, "");
  assert.equal(isBankLine("Nearly. Pop your lips a bit more."), true);
  assert.equal(isBankLine("That was wrong."), false);
  let calls = 0;
  const off = await chooseNudge({
    situation: "nearly",
    turn: 0,
    fetchImpl: async () => {
      calls += 1;
      return { ok: true, json: async () => ({ line: "Nope." }) };
    },
  });
  assert.equal(calls, 0);
  assert.equal(off.source, "bank");
  assert.equal(off.line.text, bankLine("nearly", 0).text);

  const rejected = await chooseNudge({
    situation: "praise",
    turn: 1,
    proxy: { enabled: true, url: "https://example.test/nudge" },
    fetchImpl: async () => ({ ok: true, json: async () => ({ line: "You failed." }) }),
  });
  assert.equal(rejected.source, "bank");

  const accepted = await chooseNudge({
    situation: "effort",
    turn: 0,
    proxy: { enabled: true, url: "https://example.test/nudge" },
    fetchImpl: async (_url, options) => {
      const body = JSON.parse(options.body);
      assert.deepEqual(Object.keys(body).sort(), ["situation", "turn"]);
      return { ok: true, json: async () => ({ line: LINE_BANK.effort[0].text }) };
    },
  });
  assert.equal(accepted.source, "proxy");
  assert.equal(accepted.line.id, "n-effort-0");
  assert.deepEqual(Object.keys(proxyPayload("praise", 2)).sort(), ["situation", "turn"]);
  assert.equal(lineFromModel("You failed.", "praise", 0), fallbackLine("praise", 0));
  assert.equal(lineFromModel(LINE_BANK.nearly[0].text, "nearly", 3), LINE_BANK.nearly[0].text);
});

test("hearing is kind and does not need a perfect word", () => {
  assert.equal(judgeHearing(["bag"], "bag"), "praise");
  assert.equal(judgeHearing(["the bag"], "bag"), "praise");
  assert.equal(judgeHearing(["Be."], "bee"), "praise");
  assert.equal(judgeHearing(["buh"], "bug"), "praise");
  assert.equal(judgeHearing(["cat"], "bug"), "nearly");
  assert.equal(judgeHearing([""], "bed"), "quiet");
  assert.equal(judgeHearing([], "box"), "quiet");
});

test("on screen copy is British, warm, and free of dash punctuation", () => {
  const banned = /\b(color|colors|favorite|gray|recognize|mom|wrong|fail|score|nonsense|expert|eyeball)\b/i;
  for (const line of allCopy()) {
    assert.equal(/[\u2014\u2013]/.test(line), false, line);
    assert.equal(/ - /.test(line), false, line);
    assert.equal(banned.test(line), false, line);
  }
});

test("the client has no API key and pages use relative URLs", () => {
  const clientFiles = ["index.html", "css/app.css", "sw.js", "manifest.webmanifest"];
  for (const file of fs.readdirSync(path.join(root, "js"))) clientFiles.push(`js/${file}`);
  const secret = /AIza[0-9A-Za-z\-_]{10,}|GEMINI_API_KEY\s*=\s*["'][^"']+["']|generativelanguage/;
  for (const file of clientFiles) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    assert.equal(secret.test(text), false, file);
    assert.equal(/\s(?:src|href)=["']\//.test(text), false, file);
    assert.equal(/url\(\s*["']?\//.test(text), false, file);
  }
  const server = fs.readFileSync(path.join(root, "server/nudge-proxy.mjs"), "utf8");
  assert.equal(/AIza[0-9A-Za-z\-_]{10,}/.test(server), false);
  assert.equal(/GEMINI_API_KEY\s*=\s*["']/.test(server), false);
});

test("every clip and picture used by the app is in the repo and the service worker", () => {
  const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  const ids = new Set(["sound-b", ...Object.keys(CLIP_TEXT)]);
  for (const page of Object.values(PAGES)) {
    for (const id of page.playlist || []) ids.add(id);
    for (const id of page.pictures || []) ids.add(id);
    for (const row of page.rows || []) for (const id of row) ids.add(id);
  }
  for (const id of ids) {
    assert.equal(fs.existsSync(path.join(root, "audio", `${id}.mp3`)), true, id);
    assert.equal(sw.includes(`audio/${id}.mp3`), true, id);
  }
  for (const file of fs.readdirSync(path.join(root, "art"))) {
    assert.equal(sw.includes(`art/${file}`), true, file);
  }
  const block = sw.slice(sw.indexOf("const FILES"), sw.indexOf("];"));
  const listed = [...block.matchAll(/"([^"]+)"/g)].map((match) => match[1]).filter((file) => file !== "./");
  for (const file of listed) assert.equal(fs.existsSync(path.join(root, file)), true, file);
});
