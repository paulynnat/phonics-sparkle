/**
 * book3-haiku.js — Activity 4 (Haiku) page for Book 3 units.
 *
 * Pages include this as:  <script type="module" src="./js/book3-haiku.js"></script>
 *
 * Supported query strings:
 *   ?book=3&unit=1          (Book 3, unit 1)
 *
 * No images or audio are used on this page. The parent reads the haiku
 * aloud and the child claps for words with the target sound.
 */

const BASE = "/phonics-sparkle";

function qs(name) {
  return new URLSearchParams(location.search).get(name);
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
  const pageTitle = `Unit ${unitNum}: ${unitData.label} haiku`;
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = pageTitle;
  document.title = `Book 3 \u2014 ${pageTitle}`;

  // ── Instructions ────────────────────────────────────────────────────────────
  const instrEl = document.getElementById("instructions");
  if (instrEl) {
    instrEl.innerHTML =
      `<strong>Parent:</strong> Read the haiku aloud slowly and repeat 2\u20133 times. Note the 5-7-5 syllable haiku structure.<br>` +
      `<strong>Child:</strong> Listen carefully and clap once every time you hear a word with the ` +
      `<span class="sound-badge">${unitData.targetSound}</span> sound.`;
  }

  // ── Haiku ──────────────────────────────────────────────────────────────────
  const haikuEl = document.getElementById("haiku");
  if (haikuEl) {
    haikuEl.innerHTML = unitData.haiku
      .map(line => `<span class="haiku-line">${line}</span>`)
      .join("");
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
