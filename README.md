# Phonics Sparkle

Welcome to **Phonics Sparkle** — the playful evolution of our phonics app! This Version 2 build introduces brand‑new assets, refreshed designs, and a brighter, more engaging experience for early readers.

## ✨ Overview
Phonics Sparkle is designed to make learning phonics fun, interactive, and visually delightful. With bold sticker‑style illustrations, cheerful themes, and interactive activities, children can explore sounds, words, and pictures in a way that truly sparkles.

## 🌟 Key Features
- **Unit‑based progression**: Each letter introduces recognition, writing, playful activity, and CVC word practice.  
- **Interactive Activities (Demo Units R, T, Z)**:  
  - **Activity I**: 3 CVC word flashcards per letter (word + image + audio).  
  - **Activity IV**: Parent reads a nonsense sentence aloud; child chooses the correct word from Activity I.  
- **Playful Learning**: Child‑friendly themes that encourage exploration and creativity.  
- **Parent‑Focused Guides**: Clear instructions to support at‑home phonics practice.  
- **Engagement Boost**: Activities that combine reading, recognition, and coloring for hands‑on fun.  

## 📁 Asset Folders

Word images and audio are stored in two top-level folders:

| Folder | Contents | Naming convention |
|--------|----------|-------------------|
| `DEST_IMAGE_FOLDER/` | One image per word | `<word>.png` (also accepts `.jpg`, `.jpeg`, `.webp`) |
| `DEST_AUDIO_FOLDER/` | One audio clip per word | `<word>.mp3` (also accepts `.wav`, `.m4a`) |

### Adding new words
1. Place `<word>.png` in `DEST_IMAGE_FOLDER/`.
2. Place `<word>.mp3` (or `.wav`) in `DEST_AUDIO_FOLDER/`.
3. Add the word to the appropriate letter entry in `data/book-<n>.json`.
4. Run the asset validation script to confirm nothing is missing:
   ```bash
   node scripts/validate-assets.js
   ```

> **Note:** The legacy `assets/` folder is kept for backward-compatibility (e.g., the placeholder SVG) but word assets should no longer be placed there.

## 🚀 Getting Started
1. Clone or download the repo.  
2. Open the app build in your preferred environment.  
3. Explore the demo activities for Units R, T, and Z.  

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
