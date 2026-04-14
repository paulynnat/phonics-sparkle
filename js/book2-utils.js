/**
 * book2-utils.js — Shared helpers for Book 2 activities.
 *
 * Exported by book2-match.js and book2-listen.js.
 *
 * Asset paths follow the same conventions as demo.js:
 *   images : /phonics-sparkle/DEST_IMAGE_FOLDER/<word>.png
 *   audio  : /phonics-sparkle/DEST_AUDIO_FOLDER/<word>.mp3  (or .wav for some)
 */

export const BASE = "/phonics-sparkle";

// Words whose audio file uses .wav instead of .mp3 (same set as demo.js)
export const AUDIO_WAV_WORDS = new Set(["fan", "walk"]);

// Inline SVG placeholder shown when an image fails to load
export const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%231a2340' rx='8'/%3E%3Ctext x='40' y='48' font-size='28' text-anchor='middle' fill='%23445' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

/** Return query-string param by name. */
export function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

/** Return { img, audio } asset paths for a word. */
export function assetPaths(word) {
  const audioExt = AUDIO_WAV_WORDS.has(word) ? "wav" : "mp3";
  return {
    img:   `${BASE}/DEST_IMAGE_FOLDER/${word}.png`,
    audio: `${BASE}/DEST_AUDIO_FOLDER/${word}.${audioExt}`,
  };
}

// One shared Audio instance avoids overlapping playback.
const player = new Audio();

/** Play audio for a word; resolves when done (or silently ignores errors). */
export function playAudio(word) {
  const { audio } = assetPaths(word);
  player.pause();
  player.currentTime = 0;
  player.src = audio;
  return player.play().catch(() => {});
}

/** Play multiple words sequentially with a short pause between each. */
export function playWordsSequentially(words, delayMs = 700) {
  return words.reduce(
    (p, w) => p.then(() => playAudio(w)).then(() => new Promise(r => setTimeout(r, delayMs))),
    Promise.resolve()
  );
}

/** Fisher-Yates shuffle (returns new array). */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Load and return book-2.json (no-store cache). */
export async function loadBook2() {
  const res = await fetch(`${BASE}/data/book-2.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load book-2.json (HTTP ${res.status})`);
  return res.json();
}

/**
 * Create a flashcard button element (picture + word label).
 * Mirrors the makeCard helper in demo.js so existing CSS applies.
 */
export function makeCard(word, onClickHandler) {
  const { img } = assetPaths(word);

  const btn = document.createElement("button");
  btn.className = "flashcard";
  btn.type = "button";
  btn.dataset.word = word;

  const imgEl = document.createElement("img");
  imgEl.className = "pic";
  imgEl.alt = word;
  imgEl.src = img;
  imgEl.loading = "eager";
  imgEl.onerror = function () {
    console.warn(`[Phonics Sparkle] Image not found: ${img}`);
    this.onerror = null;
    this.src = PLACEHOLDER_IMG;
  };

  const wordEl = document.createElement("div");
  wordEl.className = "word";
  wordEl.textContent = word;

  btn.appendChild(wordEl);
  btn.appendChild(imgEl);
  btn.addEventListener("click", onClickHandler);
  return btn;
}

/** Remove correct/shake classes from all flashcards inside container. */
export function clearFeedback(container) {
  container.querySelectorAll(".flashcard").forEach(el =>
    el.classList.remove("correct", "shake")
  );
}

/** Apply shake animation to an element (resets first so it re-triggers). */
export function triggerShake(el) {
  el.classList.remove("shake");
  void el.offsetWidth; // force reflow so animation restarts
  el.classList.add("shake");
}
