#!/usr/bin/env node
/**
 * validate-assets.js
 *
 * Verifies that every word referenced in data/book-1.json has a matching
 * image (.png) and audio (.mp3) file under assets/img/words/ and
 * assets/audio/words/ respectively.
 *
 * Also validates that all data JSON files parse correctly.
 *
 * Usage (from repo root):
 *   node scripts/validate-assets.js
 *
 * Exit code 0 = all checks passed.
 * Exit code 1 = one or more checks failed (details printed to stdout).
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const IMG_DIR   = path.join(ROOT, 'assets', 'img', 'words');
const AUD_DIR   = path.join(ROOT, 'assets', 'audio', 'words');
const DATA_DIR  = path.join(ROOT, 'data');

let errors = 0;

// ── 1. Validate all JSON files in data/ ──────────────────────────────────────
const jsonFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
console.log(`\n=== JSON validation (${jsonFiles.length} files) ===`);
jsonFiles.forEach(file => {
  const filePath = path.join(DATA_DIR, file);
  try {
    JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`  ✔  ${file}`);
  } catch (err) {
    console.error(`  ✘  ${file}: ${err.message}`);
    errors++;
  }
});

// ── 2. Load book-1.json and check all words have assets ───────────────────────
const bookPath = path.join(DATA_DIR, 'book-1.json');
let bookData;
try {
  bookData = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
} catch (err) {
  console.error(`\nFatal: cannot parse book-1.json — ${err.message}`);
  process.exit(1);
}

// Collect every unique word referenced
const allWords = new Set();
Object.values(bookData.letters || {}).forEach(({ words }) => {
  (words || []).forEach(w => allWords.add(w));
});
// Also check activity4 answers are in the word list
const activity4 = bookData.activity4 || {};

console.log(`\n=== Asset coverage check (${allWords.size} unique words) ===`);

const missingImg = [];
const missingAud = [];

[...allWords].sort().forEach(word => {
  const imgPng  = path.join(IMG_DIR, `${word}.png`);
  const imgSvg  = path.join(IMG_DIR, `${word}.svg`);
  const audFile = path.join(AUD_DIR, `${word}.mp3`);
  const hasImg  = fs.existsSync(imgPng) || fs.existsSync(imgSvg);
  const hasAud  = fs.existsSync(audFile);

  if (!hasImg) missingImg.push(word);
  if (!hasAud) missingAud.push(word);
});

if (missingImg.length === 0) {
  console.log('  ✔  All words have image files.');
} else {
  console.error(`  ✘  Missing images (${missingImg.length}): ${missingImg.join(', ')}`);
  errors++;
}

if (missingAud.length === 0) {
  console.log('  ✔  All words have audio files.');
} else {
  console.error(`  ✘  Missing audio (${missingAud.length}): ${missingAud.join(', ')}`);
  errors++;
}

// ── 3. Check activity4 answers exist in the word list ────────────────────────
console.log('\n=== Activity IV answer cross-check ===');
let a4Errors = 0;
Object.entries(activity4).forEach(([letter, { answer }]) => {
  const words = (bookData.letters[letter] || {}).words || [];
  if (!words.includes(answer)) {
    console.error(`  ✘  letter "${letter}": activity4 answer "${answer}" not in word list [${words.join(', ')}]`);
    a4Errors++;
    errors++;
  }
});
if (a4Errors === 0) {
  console.log('  ✔  All activity4 answers are present in their letter word lists.');
}

// ── 4. Check all 26 letters are covered ──────────────────────────────────────
console.log('\n=== Letter coverage (a–z) ===');
const letters = bookData.letters || {};
const missingLetters = [];
for (let i = 97; i <= 122; i++) {
  const ch = String.fromCharCode(i);
  if (!letters[ch]) missingLetters.push(ch);
}
if (missingLetters.length === 0) {
  console.log('  ✔  All 26 letters (a–z) are present in book-1.json.');
} else {
  console.error(`  ✘  Missing letters: ${missingLetters.join(', ')}`);
  errors++;
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('');
if (errors === 0) {
  console.log('✅  All checks passed!');
} else {
  console.error(`❌  ${errors} check(s) failed.`);
}
process.exit(errors === 0 ? 0 : 1);
