# Phonics Sparkle

A quiet companion for the Phonics Sparkle books. This demo is **Pre-K Book 1, Unit 2, the letter Bb**. A child can hear the page, talk to Ori, help the bee fly home, and grow one sticker.

The earlier flashcard demo is still in the history of `main` (the commit before this change). It is not what this branch publishes.

## Open it

The app is static. Paths are relative, so it can be served from a subfolder such as GitHub Pages.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

Published site: https://paulynnat.github.io/phonics-sparkle/

Listening pages in the book use a QR code. Only pages 13 and 15 have one.

- Say it, see it: `index.html?book=prek&unit=2&page=13`
- Sound maze: `index.html?book=prek&unit=2&page=15`

Each of those screens says the pictures and models the b sound. A grown-up can also open the app and choose the book, unit, and page. K1, K2, and the other letters are not in this demo.

## What a child can do

There are no timers, scores, or accounts.

- **Talk to Ori.** Ori shows a picture and the child says the word. The first time, a short note asks the grown-up before the microphone is used. The voice is not saved. If the microphone is unavailable, the child can still have a go.
- **Bee flight.** Tap pictures that start with the b sound. The path is bag, bed, bun, box, bug, then the hive. Cat, dog, sun, hen, ox, and axe are other pictures. A miss is a soft "Try another." One more field uses the same pictures in a new layout. A second set of pictures is not included, because each new picture needs an OK first.
- **Sticker garden.** The Bb sticker is for keeping going. It appears after the bee gets home, or after three tries with Ori. The other letters are resting.

Picture words are spoken. They are not printed as words for the child to read. Letters taught in the book so far are a and b.

## Grown-ups

Progress stays in local storage on the device. There is no child account.

The grown-up page sits behind a small gate: "What is 8 plus 7?" It shows the teacher's tip for Bb, a plain note on how the sound is going, and a private restore code. The code holds the sticker and a few counts. It does not hold a name or a voice. On a new device, open Grown-ups, pass the gate, and paste the code.

## Ori's words

Ori uses a fixed list of kind lines, including "Nearly. Pop your lips a bit more." The list works on static GitHub Pages with no server.

The code can later call a small proxy (`server/nudge-proxy.mjs`). That proxy is **off**. The app does not know a Gemini URL until `PROXY.enabled` and `PROXY.url` in `js/content.js` are changed on purpose. The proxy reads `GEMINI_API_KEY` from the environment and will only return a line from the fixed list. Do not put the key in the repository or in client code.

```bash
GEMINI_API_KEY=your-key node server/nudge-proxy.mjs
```

Without the key, the proxy still returns a fixed line. The Pages site does not start this server.

## Sound

Clips were made with the `en-SG-LunaNeural` voice (Standard Singapore English) through the free [edge-tts](https://github.com/rany2/edge-tts) library. The rate is a little slower than the default. The pitch is not raised. The short b sound is the opening of that voice, trimmed so it does not bloom into a long "uh".

If a clip cannot play, the browser speech API is used, preferring an `en-SG` voice and then `en-GB`. The short b sound is not replaced with the letter name.

A voice drift check is not part of this demo.

## Offline

After the first visit, a service worker stores the pages, pictures, and sounds so they can open again without a connection, where the browser allows it.

## Words on the screen

British spelling. Warm, short lines. No nonsense words. No eye icon. A magnifying glass marks "look" on Say it, see it.

## Checks

```bash
npm test
```

That runs the logic checks (QR parsing, the bee path, the sticker, the restore code, and the nudge bank). It does not need a browser.
