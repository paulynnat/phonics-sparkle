/** Play pre-generated clips. If a clip cannot start, speak with en-GB, then en-SG. */

import { asset } from "./assets.js";
import { CLIP_TEXT } from "./content.js";

let audio = null;
let token = 0;
let playGen = 0;

function element() {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
  }
  return audio;
}

function phase(name) {
  if (typeof document !== "undefined") document.documentElement.dataset.audio = name;
}

export function stopAudio() {
  token += 1;
  if (audio) audio.pause();
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  phase("idle");
}

function chooseVoice() {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  return (
    voices.find((voice) => /en[-_]GB/i.test(voice.lang)) ||
    voices.find((voice) => /en[-_]SG/i.test(voice.lang)) ||
    voices.find((voice) => /^en/i.test(voice.lang)) ||
    null
  );
}

function speakFallback(id) {
  const text = CLIP_TEXT[id];
  if (!text || !window.speechSynthesis) return Promise.resolve(false);
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = chooseVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-GB";
    }
    utterance.rate = 0.92;
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

function delay(ms, my) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(my === token), ms);
  });
}

async function playOne(id, my) {
  const node = element();
  const gen = ++playGen;
  node.src = asset(`audio/${id}.mp3`);
  try {
    await node.play();
  } catch (error) {
    if (my !== token) return "cancelled";
    if (error && error.name === "NotAllowedError") return "blocked";
    if (id === "sound-b") return "played";
    const spoken = await speakFallback(id);
    return spoken ? "played" : "blocked";
  }
  if (my !== token) return "cancelled";
  await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      node.removeEventListener("ended", finish);
      node.removeEventListener("pause", onPause);
      node.removeEventListener("error", onError);
      resolve();
    };
    const onPause = () => {
      if (my !== token || node.ended) finish();
    };
    const onError = async () => {
      if (id !== "sound-b" && my === token) await speakFallback(id);
      finish();
    };
    node.addEventListener("ended", finish);
    node.addEventListener("pause", onPause);
    node.addEventListener("error", onError);
    if (node.ended || gen !== playGen) finish();
  });
  return my === token ? "played" : "cancelled";
}

export async function playClip(id) {
  const my = ++token;
  phase("playing");
  const result = await playOne(id, my);
  if (my !== token) return "cancelled";
  phase(result === "blocked" ? "blocked" : "idle");
  return result;
}

export async function playList(ids, onStep) {
  const my = ++token;
  phase("playing");
  for (let i = 0; i < ids.length; i += 1) {
    if (my !== token) return "cancelled";
    onStep?.(ids[i]);
    const result = await playOne(ids[i], my);
    if (result === "blocked") {
      onStep?.("");
      phase("blocked");
      return "blocked";
    }
    if (result !== "played") return "cancelled";
    const still = await delay(160, my);
    if (!still) return "cancelled";
  }
  if (my !== token) return "cancelled";
  onStep?.("");
  phase("idle");
  return "played";
}
