/**
 * book2-match.js — Memory Match game for Book 2 (Activity 1).
 *
 * URL: activity1.html?book=2&unit=<n>
 *
 * Modes:
 *   pic-word  : Picture card ↔ Word-text card  (default / beginner)
 *   word-word : Word-text card ↔ Word-text card (every pair is the same word, both sides text)
 */

import {
  qs, loadBook2, assetPaths, playAudio, playWordsSequentially,
  shuffle, makeCard, PLACEHOLDER_IMG,
} from "./book2-utils.js";

// ── DOM refs (added by activity1.html) ──────────────────────────────────────

const titleEl    = document.getElementById("title");
const cardsEl    = document.getElementById("cards");
const footerEl   = document.querySelector(".footer");

// ── State ────────────────────────────────────────────────────────────────────

let flipped  = [];   // at most 2 card elements currently face-up (unmatched)
let matched  = 0;    // number of matched pairs
let moves    = 0;
let locked   = false; // prevent clicks during mismatch-flip-back delay
let totalPairs = 0;
let currentUnit = null;
let currentMode = "pic-word";

// ── Helpers ──────────────────────────────────────────────────────────────────

function updateMoveCount() {
  const el = document.getElementById("moveCount");
  if (el) el.textContent = String(moves);
}

/**
 * Build an array of card descriptor objects for the given mode.
 *
 * Each descriptor: { id, pairId, word, type ("pic" | "word") }
 *
 * pic-word mode (8 cards = 4 pairs):
 *   Pair i = { picture card for words[i], word-text card for words[i] }
 *
 * word-word mode (8 cards = 4 pairs):
 *   Each pair = two word-text cards showing the SAME word (all 4 words × 2).
 *   All cards in the unit share the same rhyming family — the mode shifts
 *   focus to reading the words rather than picture recognition.
 */
function buildCardDescriptors(words, mode) {
  const descs = [];
  if (mode === "word-word") {
    words.forEach((word, i) => {
      descs.push({ id: descs.length, pairId: i, word, type: "word" });
      descs.push({ id: descs.length, pairId: i, word, type: "word" });
    });
  } else {
    // Default: pic-word
    words.forEach((word, i) => {
      descs.push({ id: descs.length, pairId: i, word, type: "pic" });
      descs.push({ id: descs.length, pairId: i, word, type: "word" });
    });
  }
  return shuffle(descs);
}

// ── Card rendering ───────────────────────────────────────────────────────────

function buildCardEl(desc) {
  const { img } = assetPaths(desc.word);

  const card = document.createElement("div");
  card.className = "memory-card";
  card.dataset.id = String(desc.id);
  card.dataset.pairId = String(desc.pairId);

  const inner = document.createElement("div");
  inner.className = "memory-card-inner";

  // Front face (face-down appearance)
  const front = document.createElement("div");
  front.className = "memory-card-front";
  front.setAttribute("aria-hidden", "true");
  front.textContent = "✦";

  // Back face (face-up appearance)
  const back = document.createElement("div");
  back.className = "memory-card-back";

  if (desc.type === "pic") {
    const imgEl = document.createElement("img");
    imgEl.className = "memory-pic";
    imgEl.alt = desc.word;
    imgEl.src = img;
    imgEl.onerror = function () {
      this.onerror = null;
      this.src = PLACEHOLDER_IMG;
    };
    back.appendChild(imgEl);
  } else {
    const wordEl = document.createElement("span");
    wordEl.className = "memory-word";
    wordEl.textContent = desc.word;
    back.appendChild(wordEl);
  }

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener("click", () => onCardClick(card, desc));
  return card;
}

// ── Game logic ───────────────────────────────────────────────────────────────

function onCardClick(card, desc) {
  if (locked) return;
  if (card.classList.contains("flipped")) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("flipped");
  flipped.push({ card, desc });

  if (flipped.length < 2) return;

  moves++;
  updateMoveCount();
  locked = true;

  const [a, b] = flipped;

  if (a.desc.pairId === b.desc.pairId) {
    // Match!
    matched++;
    a.card.classList.add("matched");
    b.card.classList.add("matched");

    // Collect words to play (unique — avoid playing same word twice in word-word mode)
    const wordsToPlay = [...new Set([a.desc.word, b.desc.word])];
    playWordsSequentially(wordsToPlay).catch(() => {});

    flipped = [];
    locked = false;

    if (matched === totalPairs) {
      setTimeout(showWinPanel, 600);
    }
  } else {
    // No match — flip back after delay
    setTimeout(() => {
      a.card.classList.remove("flipped");
      b.card.classList.remove("flipped");
      flipped = [];
      locked = false;
    }, 1000);
  }
}

// ── Win panel ────────────────────────────────────────────────────────────────

function showWinPanel() {
  const existing = document.getElementById("winPanel");
  if (existing) existing.remove();

  const panel = document.createElement("div");
  panel.id = "winPanel";
  panel.className = "win-panel card";
  panel.innerHTML = `<h2 class="win-title">🎉 You matched all pairs!</h2>
    <p class="muted">Unit ${currentUnit.unit} words:</p>
    <div id="winWords" class="win-words"></div>
    <button id="playAgain" class="btn" type="button">Play Again</button>`;

  const winWords = panel.querySelector("#winWords");
  currentUnit.words.forEach(word => {
    const btn = document.createElement("button");
    btn.className = "btn secondary win-word-btn";
    btn.type = "button";
    btn.textContent = word;
    btn.addEventListener("click", () => playAudio(word));
    winWords.appendChild(btn);
  });

  panel.querySelector("#playAgain").addEventListener("click", startGame);

  cardsEl.insertAdjacentElement("afterend", panel);
}

// ── Mode selector ────────────────────────────────────────────────────────────

function buildControls() {
  const existing = document.getElementById("b2Controls");
  if (existing) existing.remove();

  const row = document.createElement("div");
  row.id = "b2Controls";
  row.className = "b2-controls";

  const label = document.createElement("label");
  label.className = "b2-mode-label";
  label.innerHTML = `<span>Mode:</span>
    <select id="matchMode">
      <option value="pic-word">Picture ↔ Word</option>
      <option value="word-word">Word ↔ Word (rhyming)</option>
    </select>`;

  const moveEl = document.createElement("span");
  moveEl.className = "b2-moves";
  moveEl.innerHTML = `Moves: <strong id="moveCount">0</strong>`;

  row.appendChild(label);
  row.appendChild(moveEl);
  cardsEl.insertAdjacentElement("beforebegin", row);

  row.querySelector("#matchMode").addEventListener("change", e => {
    currentMode = e.target.value;
    startGame();
  });
}

// ── Main game start ──────────────────────────────────────────────────────────

function startGame() {
  // Reset state
  flipped  = [];
  matched  = 0;
  moves    = 0;
  locked   = false;
  updateMoveCount();

  // Remove old win panel
  const wp = document.getElementById("winPanel");
  if (wp) wp.remove();

  // Build and shuffle card descriptors
  const descs = buildCardDescriptors(currentUnit.words, currentMode);
  totalPairs  = currentUnit.words.length; // 4 pairs

  // Clear and render card grid
  cardsEl.innerHTML = "";
  cardsEl.className = "memory-grid";

  descs.forEach(desc => {
    cardsEl.appendChild(buildCardEl(desc));
  });
}

// ── Entry point ──────────────────────────────────────────────────────────────

(async () => {
  const unitNum = parseInt(qs("unit") || "1", 10);

  const data = await loadBook2();
  currentUnit = (data.units || []).find(u => u.unit === unitNum);
  if (!currentUnit) {
    throw new Error(`Unit ${unitNum} not found in book-2.json`);
  }

  // Update page title
  if (titleEl) {
    titleEl.textContent = `Unit ${currentUnit.unit} \u2014 Memory Match`;
  }

  // Update the subtitle paragraph
  const subtitleEl = document.querySelector(".activity-subtitle");
  if (subtitleEl) {
    subtitleEl.textContent = "Flip cards to find matching pairs.";
  }

  // Update footer link to point back to home with book=2
  if (footerEl) {
    footerEl.innerHTML =
      `<a class="btn secondary" href="./index.html?book=2">\u2190 Back to Book 2</a>
       <a class="btn" href="./activity2.html?book=2&amp;unit=${currentUnit.unit}">Go to Listen &amp; Find \u2192</a>`;
  }

  buildControls();
  startGame();
})().catch(err => {
  console.error(err);
  document.body.innerHTML =
    `<pre style="white-space:pre-wrap;color:#ffb4b4;padding:18px">` +
    `Error: ${err.message}</pre>`;
});
