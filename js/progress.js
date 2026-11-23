/**
 * Progress stays on the device. The restore code carries the sticker and a few counts.
 * It never carries a name, a voice, or a transcript.
 */

import { UI } from "./content.js";

export const STORAGE_KEY = "phonicsSparkle.prek.progress.v1";
const GATE_KEY = "phonicsSparkle.grownup";

export function emptyProgress() {
  return {
    v: 1,
    talkTries: 0,
    bee: { homes: 0, bonusHomes: 0, misses: 0 },
    mic: { noteSeen: false, declined: false },
    earned: false,
  };
}

function cap(n) {
  const value = Number(n);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(999, Math.floor(value));
}

export function normalise(data) {
  const base = emptyProgress();
  const bee = data && data.bee ? data.bee : data || {};
  const progress = {
    ...base,
    talkTries: cap(data?.talkTries),
    bee: {
      homes: cap(bee.homes),
      bonusHomes: cap(bee.bonusHomes),
      misses: cap(bee.misses),
    },
    mic: {
      noteSeen: Boolean(data?.mic?.noteSeen),
      declined: Boolean(data?.mic?.declined),
    },
  };
  return markEarned(progress);
}

export function markEarned(progress) {
  const earned = progress.talkTries >= 3 || progress.bee.homes >= 1 || progress.bee.bonusHomes >= 1;
  return { ...progress, earned };
}

export function loadProgress(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return normalise(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(storage, progress) {
  storage.setItem(STORAGE_KEY, JSON.stringify(normalise(progress)));
}

export function recordTalk(progress) {
  return markEarned({ ...progress, talkTries: cap(progress.talkTries + 1) });
}

export function recordHome(progress, field) {
  const bee = { ...progress.bee };
  if (field === "bonus") bee.bonusHomes = cap(bee.bonusHomes + 1);
  else bee.homes = cap(bee.homes + 1);
  return markEarned({ ...progress, bee });
}

export function recordMiss(progress) {
  return { ...progress, bee: { ...progress.bee, misses: cap(progress.bee.misses + 1) } };
}

export function soundNote(progress) {
  if (!progress.earned) return UI.waiting;
  const homes = progress.bee.homes + progress.bee.bonusHomes;
  if (homes === 0) return UI.withOri;
  if (progress.bee.misses >= 4 && progress.bee.misses > homes * 2) return UI.morePlay;
  return UI.steady;
}

function checksum(body) {
  let n = 0;
  for (let i = 0; i < body.length; i += 1) n = (n + body.charCodeAt(i) * (i + 1)) % 65536;
  return n.toString(16).padStart(4, "0");
}

function b64url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(body) {
  const padded = body.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((body.length + 3) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function makeCode(progress) {
  const ready = normalise(progress);
  const payload = JSON.stringify({
    v: 1,
    talkTries: ready.talkTries,
    homes: ready.bee.homes,
    bonusHomes: ready.bee.bonusHomes,
    misses: ready.bee.misses,
  });
  const body = b64url(payload);
  return `PS1-${body}-${checksum(body)}`;
}

export function readCode(code) {
  const clean = String(code || "").replace(/\s+/g, "");
  const match = /^PS1-([A-Za-z0-9_-]+)-([0-9a-f]{4})$/.exec(clean);
  if (!match || checksum(match[1]) !== match[2]) return null;
  try {
    const data = JSON.parse(fromB64url(match[1]));
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    return normalise({
      talkTries: data.talkTries,
      bee: { homes: data.homes, bonusHomes: data.bonusHomes, misses: data.misses },
    });
  } catch {
    return null;
  }
}

export function applyRestore(current, restored) {
  return normalise({ ...restored, mic: current.mic });
}

export function grownOpen(storage) {
  return storage.getItem(GATE_KEY) === "yes";
}

export function unlockGrown(storage) {
  storage.setItem(GATE_KEY, "yes");
}

export function gateOk(answer) {
  return String(answer || "").trim() === "15";
}
