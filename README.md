# Phonics Sparkle

Welcome to **Phonics Sparkle** — the playful evolution of our phonics app! This Version 2 build introduces brand‑new assets, refreshed designs, and a brighter, more engaging experience for early readers.

## ✨ Overview
Phonics Sparkle is designed to make learning phonics fun, interactive, and visually delightful. With bold sticker‑style illustrations, cheerful themes, and interactive activities, children can explore sounds, words, and pictures in a way that truly sparkles.

## 🌟 Key Features
- **Unit‑based progression**: Each letter introduces recognition, writing, playful activity, and CVC word practice.  
- **Interactive Activities (All 26 Letters, A–Z)**:  
  - **Activity I**: Word flashcards per letter (word + image + audio).  
  - **Activity IV**: Parent reads a nonsense sentence aloud; child chooses the correct word from Activity I.  
- **Playful Learning**: Child‑friendly themes that encourage exploration and creativity.  
- **Parent‑Focused Guides**: Clear instructions to support at‑home phonics practice.  
- **Engagement Boost**: Activities that combine reading, recognition, and coloring for hands‑on fun.  

## 🚀 Getting Started
1. Clone or download the repo.  
2. Open `index.html` in a browser (or serve via GitHub Pages / any static server).  
3. Explore activities for any letter A–Z.  

## 🔍 Validating Assets Locally
Requires [Node.js](https://nodejs.org/) (LTS recommended).

```bash
node scripts/validate-assets.js
```

This checks:
- All JSON data files in `data/` parse without errors.
- Every word in `data/book-1.json` has a matching `.png` image under `assets/img/words/` and a `.mp3` audio file under `assets/audio/words/`.
- All Activity IV answers exist in their corresponding word lists.
- All 26 letters (a–z) are present in `book-1.json`.

### Replacing placeholder assets with real audio/images
The placeholder image and audio files can be replaced with real assets at any time.
Simply copy the real files (named `<word>.png` and `<word>.mp3`) into the appropriate folders and re-run the validation script to confirm coverage.

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
