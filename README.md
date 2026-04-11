# Phonics Sparkle

Welcome to **Phonics Sparkle** — the playful evolution of our phonics app! This Version 2 build introduces brand‑new assets, refreshed designs, and a brighter, more engaging experience for early readers.

## ✨ Overview
Phonics Sparkle is designed to make learning phonics fun, interactive, and visually delightful. With bold sticker‑style illustrations, cheerful themes, and interactive activities, children can explore sounds, words, and pictures in a way that truly sparkles.

## 🌟 Key Features
- **Unit‑based progression**: Each letter introduces recognition, writing, playful activity, and CVC word practice.  
- **Interactive Activities (All 26 Letters)**:  
  - **Activity I**: flashcards per letter (word + image + audio).  
  - **Activity IV**: Parent reads a nonsense sentence aloud; child chooses the correct word from Activity I.  
- **Playful Learning**: Child‑friendly themes that encourage exploration and creativity.  
- **Parent‑Focused Guides**: Clear instructions to support at‑home phonics practice.  
- **Engagement Boost**: Activities that combine reading, recognition, and coloring for hands‑on fun.  

## 📁 Asset Locations
All word assets live in two root‑level folders:

| Folder | Contents | Naming convention |
|---|---|---|
| `DEST_IMAGE_FOLDER/` | Word illustration images | `<word>.png` (e.g. `rat.png`) |
| `DEST_AUDIO_FOLDER/` | Word pronunciation audio | `<word>.mp3` (or `.wav` for `fan` and `walk`) |

**Rules:**
- File names are lowercase and match the word exactly (e.g. `bee.png`, `bee.mp3`).
- Most audio files use `.mp3`; `fan.wav` and `walk.wav` are the exceptions and are handled automatically by the app.
- Word lists and letter–word mappings are defined in `data/book-1.json`. Adding a new letter entry there will automatically unlock that letter on the home page.

## 🗂 Data Files
- **`data/book-1.json`** — Defines all letter entries (words list) and Activity IV prompts/answers for Book 1. The home page reads this file at load time to determine which letters are enabled.

## 🚀 Getting Started
1. Clone or download the repo.  
2. Serve the repo root with any static HTTP server (required for `fetch()` to load JSON), e.g.:  
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```
3. Open `http://localhost:<port>/` and explore all 26 letter activities.

> **GitHub Pages**: the site is published at https://paulynnat.github.io/phonics-sparkle/ — all letters are now unlocked.

## 🔍 Validating Assets
To check that every word in `data/book-1.json` has a matching image and audio file, compare the word list in `book-1.json` against the files in `DEST_IMAGE_FOLDER/` and `DEST_AUDIO_FOLDER/`. For example:

```bash
# List all words defined in the JSON
node -e "const d=require('./data/book-1.json'); Object.values(d.letters).forEach(l=>l.words.forEach(w=>console.log(w)))"

# Compare against image files
ls DEST_IMAGE_FOLDER/
```

## 🛡 Responsible AI Guidelines
Because Phonics Sparkle is designed for children, we follow strict Responsible AI principles:

- **Child Privacy Protection**: No personal data from children is collected, stored, or shared. All content is anonymous and focused solely on learning.  
- **Pedagogical Soundness**: Activities are designed with early childhood literacy experts to ensure they are developmentally appropriate and effective for phonics learning.  
- **Age Appropriateness**: Visuals, words, and instructions are tailored for young learners, avoiding sensitive or unsuitable content.  
- **Transparency**: Parents are provided with clear guides on how activities work and how they support phonics development.  
- **Safety First**: All assets are created to be family‑friendly, cheerful, and free from harmful or misleading material.  

## 🤝 Contributing
We welcome contributions from educators, designers, and developers who share our vision of playful, responsible phonics learning. To contribute:

1. **Fork the repo** and create a new branch for your changes.  
2. **Follow Responsible AI principles** — ensure all contributions are child‑safe, privacy‑respecting, and pedagogically sound.  
3. **Document your changes clearly** so parents and collaborators understand the purpose and impact.  
4. **Submit a pull request** with a description of your contribution and how it supports early reading engagement.  

Please note: Contributions that do not align with child‑safety or pedagogical standards will not be accepted.

**Tagline:** *Enabling learning through technology.*
