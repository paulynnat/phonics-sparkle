/**
 * demo.js — shared module for Activity I & IV.
 *
 * Pages include this as:  <script type="module" src="./js/demo.js"></script>
 *
 * Supported query strings:
 *   ?book=1&letter=r          (Book 1, letter r)
 *   ?unit=r                   (legacy — treated as book=1&letter=r)
 *
 * Asset paths (relative to the GitHub Pages project root):
 *   images : /phonics-sparkle/DEST_IMAGE_FOLDER/<word>.png
 *   audio  : /phonics-sparkle/DEST_AUDIO_FOLDER/<word>.mp3  (or .wav for some words)
 */

const BASE = "/phonics-sparkle";

// Words whose audio file uses .wav instead of .mp3
const AUDIO_WAV_WORDS = new Set(["fan", "walk"]);

// Inline SVG placeholder shown when an image fails to load
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%231a2340' rx='8'/%3E%3Ctext x='40' y='48' font-size='28' text-anchor='middle' fill='%23445' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

// ── helpers ──────────────────────────────────────────────────────────────────

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

/** Resolve book and letter from the URL, supporting legacy ?unit= param. */
function resolveParams() {
  const unit    = (qs("unit")   || "").toLowerCase();
  const letter  = (qs("letter") || unit).toLowerCase();
  const bookRaw = parseInt(qs("book") || "1", 10);
  const book    = (Number.isFinite(bookRaw) && bookRaw >= 1) ? bookRaw : 1;
  return { book, letter };
}

async function loadBook(bookId) {
  const res = await fetch(`${BASE}/data/book-${bookId}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load book-${bookId}.json (HTTP ${res.status})`);
  return res.json();
}

function assetPaths(word) {
  const audioExt = AUDIO_WAV_WORDS.has(word) ? "wav" : "mp3";
  return {
    img:   `${BASE}/DEST_IMAGE_FOLDER/${word}.png`,
    audio: `${BASE}/DEST_AUDIO_FOLDER/${word}.${audioExt}`,
  };
}

// One shared Audio instance avoids overlapping playback.
const player = new Audio();

async function playAudio(word) {
  const { audio } = assetPaths(word);
  player.pause();
  player.currentTime = 0;
  player.src = audio;
  return player.play();
}

function makeCard(word, onClickHandler) {
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
  // Fallback: replace broken image with placeholder and warn
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

function clearFeedback(container) {
  container.querySelectorAll(".flashcard").forEach(el =>
    el.classList.remove("correct", "shake")
  );
}

function triggerShake(el) {
  el.classList.remove("shake");
  void el.offsetWidth; // force reflow so animation restarts
  el.classList.add("shake");
}

function currentPage() {
  const p = location.pathname.toLowerCase();
  if (p.endsWith("/activity1.html")) return "a1";
  if (p.endsWith("/activity4.html")) return "a4";
  return "other";
}

// ── main ─────────────────────────────────────────────────────────────────────

(async () => {
  const { book, letter } = resolveParams();
  if (!letter) {
    throw new Error('Missing letter parameter. Use ?book=1&letter=r or legacy ?unit=r.');
  }

  const bookData = await loadBook(book);
  const letterData = bookData.letters?.[letter];
  if (!letterData) {
    throw new Error(`Letter "${letter}" not found in book ${book}.`);
  }

  const words = letterData.words;
  const labelText = `Letter ${letter.toUpperCase()}`;

  // Build the query string to preserve on navigation links
  const navQuery = `?book=${book}&letter=${letter}`;

  // ── Update navigation links ──────────────────────────────────────────────
  const toA4 = document.getElementById("toA4");
  if (toA4) toA4.href = `./activity4.html${navQuery}`;

  const toA1 = document.getElementById("toA1");
  if (toA1) toA1.href = `./activity1.html${navQuery}`;

  // ── Update page title ────────────────────────────────────────────────────
  const titleEl = document.getElementById("title");
  if (titleEl) {
    const actLabel = currentPage() === "a1" ? "Activity I" : "Activity IV";
    titleEl.textContent = `${labelText} \u2014 ${actLabel}`;
  }

  // ── Render cards ─────────────────────────────────────────────────────────
  const cardsEl = document.getElementById("cards");
  if (!cardsEl) return;

  if (currentPage() === "a1") {
    // Activity I: every card click MUST play that word's audio.
    words.forEach(word => {
      cardsEl.appendChild(makeCard(word, async () => {
        try {
          await playAudio(word);
        } catch (err) {
          console.error("Audio playback error:", err);
          const { audio } = assetPaths(word);
          console.warn(`[Phonics Sparkle] Audio not found or could not play: ${audio}`);
          alert(
            `Audio could not be played for "${word}".\n` +
            `Expected file: ${audio}`
          );
        }
      }));
    });
  }

  if (currentPage() === "a4") {
    // Activity IV: show prompt, correct → highlight + audio; incorrect → shake, no audio.
    const activity4 = bookData.activity4?.[letter];
    const promptEl = document.getElementById("prompt");
    if (promptEl) {
      promptEl.textContent = activity4?.prompt ?? "Parent reads aloud.";
    }

    const answer = (activity4?.answer ?? "").toLowerCase();

    words.forEach(word => {
      cardsEl.appendChild(makeCard(word, async e => {
        clearFeedback(cardsEl);

        if (word === answer) {
          e.currentTarget.classList.add("correct");
          try {
            await playAudio(word);
          } catch (err) {
            console.error("Audio playback error:", err);
          }
        } else {
          triggerShake(e.currentTarget);
          // Spec: do NOT play audio on incorrect selection.
        }
      }));
    });
  }
})().catch(err => {
  console.error(err);
  document.body.innerHTML =
    `<pre style="white-space:pre-wrap;color:#ffb4b4;padding:18px">` +
    `Error: ${err.message}</pre>`;
});
