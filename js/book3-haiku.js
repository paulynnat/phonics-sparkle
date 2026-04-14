/**
 * book3-haiku.js — Activity page for Book 3 haiku units.
 *
 * Pages include this as:  <script type="module" src="./js/book3-haiku.js"></script>
 *
 * Supported query strings:
 *   ?book=3&unit=1          (Book 3, unit 1)
 *
 * Asset paths (relative to the GitHub Pages project root):
 *   images : /phonics-sparkle/DEST_IMAGE_FOLDER/<word>.png
 *   audio  : /phonics-sparkle/DEST_AUDIO_FOLDER/<word>.mp3
 */

const BASE = "/phonics-sparkle";

// Inline SVG placeholder shown when an image fails to load
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%231a2340' rx='8'/%3E%3Ctext x='40' y='48' font-size='28' text-anchor='middle' fill='%23445' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function assetPaths(word) {
  return {
    img:   `${BASE}/DEST_IMAGE_FOLDER/${word}.png`,
    audio: `${BASE}/DEST_AUDIO_FOLDER/${word}.mp3`,
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

function makeCard(word) {
  const { img } = assetPaths(word);

  const btn = document.createElement("button");
  btn.className = "flashcard";
  btn.type = "button";
  btn.dataset.word = word;

  const wordEl = document.createElement("div");
  wordEl.className = "word";
  wordEl.textContent = word;

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

  btn.appendChild(wordEl);
  btn.appendChild(imgEl);

  btn.addEventListener("click", async () => {
    try {
      await playAudio(word);
    } catch (err) {
      const { audio } = assetPaths(word);
      console.warn(`[Phonics Sparkle] Audio not found or could not play: ${audio}`);
    }
  });

  return btn;
}

(async () => {
  const unitNum = parseInt(qs("unit") || "1", 10);

  const res = await fetch(`${BASE}/data/book-3.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load book-3.json (HTTP ${res.status})`);
  const data = await res.json();

  const unitData = (data.units || []).find(u => u.unit === unitNum);
  if (!unitData) throw new Error(`Unit ${unitNum} not found in book-3.json`);

  const totalUnits = data.units.length;

  // ── Page title ─────────────────────────────────────────────────────────────
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = `Book 3 \u2014 ${unitData.label}`;
  document.title = `Book 3 \u2014 ${unitData.label}`;

  // ── Instructions ────────────────────────────────────────────────────────────
  const instrEl = document.getElementById("instructions");
  if (instrEl) {
    instrEl.innerHTML =
      `<strong>Parent:</strong> Read the haiku aloud slowly and repeat 2\u20133 times. Note the 5-7-5 syllable haiku structure.<br />` +
      `<strong>Child:</strong> Listen carefully and clap once every time you hear a word with the ` +
      `<em>${unitData.targetSound}</em> sound.`;
  }

  // ── Haiku ──────────────────────────────────────────────────────────────────
  const haikuEl = document.getElementById("haiku");
  if (haikuEl) {
    haikuEl.innerHTML = unitData.haiku
      .map(line => `<span class="haiku-line">${line}</span>`)
      .join("");
  }

  // ── Word cards ─────────────────────────────────────────────────────────────
  const cardsEl = document.getElementById("cards");
  if (cardsEl) {
    unitData.words.forEach(word => cardsEl.appendChild(makeCard(word)));
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevBtn = document.getElementById("prevUnit");
  const nextBtn = document.getElementById("nextUnit");

  if (prevBtn) {
    if (unitNum > 1) {
      prevBtn.href = `./activity-haiku.html?book=3&unit=${unitNum - 1}`;
    } else {
      prevBtn.style.visibility = "hidden";
    }
  }

  if (nextBtn) {
    if (unitNum < totalUnits) {
      nextBtn.href = `./activity-haiku.html?book=3&unit=${unitNum + 1}`;
    } else {
      nextBtn.style.visibility = "hidden";
    }
  }

  // Unit progress indicator
  const progressEl = document.getElementById("unitProgress");
  if (progressEl) progressEl.textContent = `${unitNum} / ${totalUnits}`;
})().catch(err => {
  console.error(err);
  document.body.innerHTML =
    `<pre style="white-space:pre-wrap;color:#ffb4b4;padding:18px">` +
    `Error: ${err.message}</pre>`;
});
