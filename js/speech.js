/**
 * Listen once on the device. The transcript is used only to choose a nudge,
 * then dropped. Nothing is written to storage, and the microphone is not recorded.
 */

import { judgeHearing } from "./content.js";

let active = null;

export function speechSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function stopListening() {
  if (!active) return;
  try {
    active.onresult = null;
    active.onerror = null;
    active.onend = null;
    active.abort();
  } catch {
    /* already stopped */
  }
  active = null;
}

export function listenFor(target) {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Speech) return Promise.resolve({ situation: "unavailable" });

  stopListening();
  const rec = new Speech();
  active = rec;
  rec.lang = "en-SG";
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  rec.continuous = false;

  return new Promise((resolve) => {
    let settled = false;
    const texts = [];
    const finish = (situation) => {
      if (settled) return;
      settled = true;
      if (active === rec) active = null;
      resolve({ situation });
    };

    rec.onresult = (event) => {
      for (let i = 0; i < event.results.length; i += 1) {
        for (let j = 0; j < event.results[i].length; j += 1) {
          texts.push(event.results[i][j].transcript);
        }
      }
      finish(judgeHearing(texts, target) === "quiet" ? "listen" : judgeHearing(texts, target));
    };
    rec.onerror = (event) => {
      const code = event.error;
      if (code === "not-allowed" || code === "service-not-allowed") finish("declined");
      else if (code === "no-speech" || code === "aborted") finish("listen");
      else finish("listen");
    };
    rec.onend = () => {
      window.setTimeout(() => finish(texts.length ? judgeHearing(texts, target) : "listen"), 40);
    };
    window.setTimeout(() => {
      try {
        rec.stop();
      } catch {
        finish("listen");
      }
    }, 5000);

    try {
      rec.start();
    } catch {
      finish("unavailable");
    }
  });
}
