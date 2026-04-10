/**
 * demo.js — shared module for the publisher demo (Activity I & IV).
 *
 * Pages include this as:  <script type="module" src="./js/demo.js"></script>
 * The active unit is read from the URL querystring:  ?unit=r|t|z
 *
 * Asset paths (relative to the GitHub Pages project root):
 *   images : /phonics-sparkle/assets/img/words/<word>.png
 *   audio  : /phonics-sparkle/assets/audio/words/<word>.mp3
 */

const BASE = "/phonics-sparkle";

// ── helpers ──────────────────────────────────────────────────────────────────

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

async function loadUnits() {
  const res = await fetch(`${BASE}/data/demo-units.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load demo-units.json (HTTP ${res.status})`);
  return res.json();
}

function assetPaths(word) {
  return {
    img:   `${BASE}/assets/img/words/${word}.png`,
    audio: `${BASE}/assets/audio/words/${word}.mp3`,
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

  btn.innerHTML =
    `<div class="word">${word}</div>` +
    `<img class="pic" alt="${word}" src="${img}" loading="eager" />`;

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
  const unitId = (qs("unit") || "").toLowerCase();
  if (!unitId) {
    throw new Error('Missing ?unit= query parameter. Use ?unit=r, ?unit=t, or ?unit=z.');
  }

  const { units } = await loadUnits();
  const unit = units.find(u => u.unitId === unitId);
  if (!unit) throw new Error(`Unknown unit "${unitId}". Expected r, t, or z.`);

  // ── Update navigation links to preserve the active unit ──────────────────
  const toA4 = document.getElementById("toA4");
  if (toA4) toA4.href = `./activity4.html?unit=${unitId}`;

  const toA1 = document.getElementById("toA1");
  if (toA1) toA1.href = `./activity1.html?unit=${unitId}`;

  // ── Update page title ────────────────────────────────────────────────────
  const titleEl = document.getElementById("title");
  if (titleEl) {
    const actLabel = currentPage() === "a1" ? "Activity I" : "Activity IV";
    titleEl.textContent = `${unit.label} \u2014 ${actLabel}`;
  }

  // ── Render cards ─────────────────────────────────────────────────────────
  const cardsEl = document.getElementById("cards");
  if (!cardsEl) return;

  if (currentPage() === "a1") {
    // Activity I: every card click MUST play that word's audio.
    unit.words.forEach(word => {
      cardsEl.appendChild(makeCard(word, async () => {
        try {
          await playAudio(word);
        } catch (err) {
          console.error("Audio playback error:", err);
          alert(
            `Audio could not be played for "${word}".\n` +
            `Expected file: ${BASE}/assets/audio/words/${word}.mp3`
          );
        }
      }));
    });
  }

  if (currentPage() === "a4") {
    // Activity IV: show prompt, correct → highlight + audio; incorrect → shake, no audio.
    const promptEl = document.getElementById("prompt");
    if (promptEl) {
      promptEl.textContent = unit.activity4?.prompt ?? "Parent reads aloud.";
    }

    const answer = (unit.activity4?.answer ?? "").toLowerCase();

    unit.words.forEach(word => {
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
