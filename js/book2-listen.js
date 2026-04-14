/**
 * book2-listen.js — Listen & Find (riddle) game for Book 2 (Activity II).
 *
 * URL: activity2.html?book=2&unit=<n>
 *
 * - Shows a grid of picture + word flashcards for the unit.
 * - Displays a riddle prompt; child taps the correct card.
 * - Correct: green highlight + advance to next riddle.
 * - Wrong: shake animation; retry same riddle.
 * - Fallback (no riddles): random target, prompt "Find: <word>".
 */

import {
  qs, loadBook2, playAudio, makeCard, clearFeedback, triggerShake, shuffle,
} from "./book2-utils.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────

const titleEl       = document.getElementById("title");
const promptTextEl  = document.getElementById("promptText");
const playBtn       = document.getElementById("playPrompt");
const cardsEl       = document.getElementById("cards");
const footerEl      = document.querySelector(".footer");
const nextBtn       = document.getElementById("nextRound");

// ── State ─────────────────────────────────────────────────────────────────────

let riddles      = [];  // array of { prompt, answer }
let riddleIndex  = 0;
let currentAnswer = "";
let unitData      = null;

// ── Riddle helpers ────────────────────────────────────────────────────────────

/** Compose riddles: use data riddles if available; otherwise synthesise simple ones. */
function buildRiddles(unit) {
  if (unit.riddles && unit.riddles.length > 0) {
    return unit.riddles.slice(); // use provided riddles
  }
  // Fallback: one riddle per word — "Find: <word>"
  return shuffle(unit.words).map(word => ({
    prompt: `Find: ${word}`,
    answer: word,
  }));
}

/** Show the current riddle and update UI. */
function showRiddle() {
  if (!riddles.length) return;

  const riddle = riddles[riddleIndex];
  currentAnswer = riddle.answer.toLowerCase();

  if (promptTextEl) promptTextEl.textContent = riddle.prompt;

  // Show riddle progress e.g. "1 / 4"
  const progressEl = document.getElementById("riddleProgress");
  if (progressEl) {
    progressEl.textContent = `${riddleIndex + 1} / ${riddles.length}`;
  }

  clearFeedback(cardsEl);
  if (nextBtn) nextBtn.style.display = "none";
  // Audio plays only when the user presses the Play button.
}

/** Advance to next riddle, or show a completion message. */
function nextRiddle() {
  riddleIndex++;
  if (riddleIndex < riddles.length) {
    showRiddle();
  } else {
    // All riddles done — show a "done" state
    if (promptTextEl) promptTextEl.textContent = "🎉 Great job! You found all the words!";
    if (nextBtn) nextBtn.style.display = "none";
    if (playBtn) playBtn.style.display = "none";

    const progressEl = document.getElementById("riddleProgress");
    if (progressEl) progressEl.textContent = `${riddles.length} / ${riddles.length}`;

    clearFeedback(cardsEl);
    // Highlight all cards green as celebration
    cardsEl.querySelectorAll(".flashcard").forEach(el => el.classList.add("correct"));

    // Add a "Play again" button
    const again = document.createElement("button");
    again.className = "btn";
    again.type = "button";
    again.textContent = "Play Again";
    again.addEventListener("click", () => {
      riddles   = buildRiddles(unitData);
      riddleIndex = 0;
      again.remove();
      if (playBtn) playBtn.style.display = "";
      showRiddle();
    });
    if (nextBtn) nextBtn.insertAdjacentElement("afterend", again);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

(async () => {
  const unitNum = parseInt(qs("unit") || "1", 10);

  const data = await loadBook2();
  unitData = (data.units || []).find(u => u.unit === unitNum);
  if (!unitData) {
    throw new Error(`Unit ${unitNum} not found in book-2.json`);
  }

  // Page title
  if (titleEl) {
    titleEl.textContent = `Unit ${unitData.unit} \u2014 Listen & Find`;
  }

  // Footer links
  if (footerEl) {
    footerEl.innerHTML =
      `<a class="btn secondary" href="./index.html?book=2">\u2190 Back to Book 2</a>
       <a class="btn" href="./activity1.html?book=2&amp;unit=${unitData.unit}">Memory Match \u2192</a>`;
    if (nextBtn) footerEl.appendChild(nextBtn);
  }

  // Build riddles
  riddles = buildRiddles(unitData);

  // Render flashcard grid
  if (cardsEl) {
    cardsEl.innerHTML = "";
    unitData.words.forEach(word => {
      const card = makeCard(word, async () => {
        if (word.toLowerCase() === currentAnswer) {
          clearFeedback(cardsEl);
          card.classList.add("correct");
          try { await playAudio(word); } catch (_) {}
          if (nextBtn) nextBtn.style.display = "";
        } else {
          triggerShake(card);
        }
      });
      cardsEl.appendChild(card);
    });
  }

  // Play button → play the answer word audio
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      playAudio(currentAnswer).catch(() => {});
    });
  }

  // Next round button
  if (nextBtn) {
    nextBtn.addEventListener("click", nextRiddle);
  }

  showRiddle();
})().catch(err => {
  console.error(err);
  document.body.innerHTML =
    `<pre style="white-space:pre-wrap;color:#ffb4b4;padding:18px">` +
    `Error: ${err.message}</pre>`;
});
