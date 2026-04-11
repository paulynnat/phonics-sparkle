#!/usr/bin/env node
/**
 * validate-assets.js
 *
 * Checks that every word referenced in data/book-*.json has a corresponding
 * image in DEST_IMAGE_FOLDER/ and audio in DEST_AUDIO_FOLDER/.
 *
 * Usage:
 *   node scripts/validate-assets.js
 *
 * Exit code 0 = all assets present; 1 = one or more assets missing.
 */

const fs   = require("fs");
const path = require("path");

const ROOT        = path.resolve(__dirname, "..");
const IMG_DIR     = path.join(ROOT, "DEST_IMAGE_FOLDER");
const AUDIO_DIR   = path.join(ROOT, "DEST_AUDIO_FOLDER");
const DATA_DIR    = path.join(ROOT, "data");
const IMG_EXTS    = [".png", ".jpg", ".jpeg", ".webp"];
const AUDIO_EXTS  = [".mp3", ".wav", ".m4a"];

/** Return the first matching file path for a word, or null. */
function findFile(dir, word, extensions) {
  for (const ext of extensions) {
    const candidate = path.join(dir, `${word}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Build a human-readable list of candidates that were probed. */
function triedPaths(dir, word, extensions) {
  return extensions.map(e => path.join(dir, `${word}${e}`)).join(", ");
}

/** Collect all book-*.json data files. */
function getDataFiles() {
  return fs.readdirSync(DATA_DIR)
    .filter(f => /^book-\d+\.json$/.test(f))
    .map(f => path.join(DATA_DIR, f));
}

let totalWords   = 0;
let missingCount = 0;

for (const dataFile of getDataFiles()) {
  const book = JSON.parse(fs.readFileSync(dataFile, "utf8"));

  for (const [letter, letterData] of Object.entries(book.letters ?? {})) {
    for (const word of letterData.words ?? []) {
      totalWords++;
      const imgPath   = findFile(IMG_DIR,   word, IMG_EXTS);
      const audioPath = findFile(AUDIO_DIR, word, AUDIO_EXTS);

      if (!imgPath) {
        console.warn(`[MISSING IMAGE]  book=${book.bookId} letter=${letter} word="${word}"\n  Tried: ${triedPaths(IMG_DIR, word, IMG_EXTS)}`);
        missingCount++;
      }

      if (!audioPath) {
        console.warn(`[MISSING AUDIO]  book=${book.bookId} letter=${letter} word="${word}"\n  Tried: ${triedPaths(AUDIO_DIR, word, AUDIO_EXTS)}`);
        missingCount++;
      }
    }
  }
}

if (missingCount === 0) {
  console.log(`✓ All ${totalWords} word(s) have matching image and audio assets.`);
  process.exit(0);
} else {
  console.error(`\n✗ ${missingCount} missing asset(s) detected across ${totalWords} word(s).`);
  process.exit(1);
}
