import { playClip, playList, stopAudio } from "./audio.js";
import { FIELDS, newFlight, tapFlight } from "./bee.js";
import { PAGES, TALK_WORDS, UI } from "./content.js";
import { parseLaunch } from "./launch.js";
import { chooseNudge } from "./nudges.js";
import {
  applyRestore,
  emptyProgress,
  gateOk,
  grownOpen,
  loadProgress,
  makeCode,
  readCode,
  recordHome,
  recordMiss,
  recordTalk,
  saveProgress,
  unlockGrown,
} from "./progress.js";
import { listenFor, speechSupported, stopListening } from "./speech.js";
import { bannerHtml, renderApp } from "./views.js";

const app = document.querySelector("#app");
const live = document.querySelector("#live");
let progress = loadProgress(localStorage);
let routeKey = "";
let busy = false;
let booted = false;

const state = {
  screen: "home",
  book: "prek",
  unit: 2,
  page: 13,
  field: "main",
  flight: newFlight(FIELDS.main),
  talkIndex: 0,
  nudge: "",
  listening: false,
  micNote: false,
  banner: false,
  autoplay: false,
  playWord: false,
  focus: false,
  gateMessage: "",
  restoreMessage: "",
  confirmClear: false,
};

function announce(text) {
  if (!live || !text) return;
  live.textContent = "";
  live.textContent = text;
}

function model() {
  return { ...state, progress, speechOk: speechSupported(), grown: grownOpen(sessionStorage) };
}

function syncFromUrl() {
  const launch = parseLaunch(location.search);
  const key = JSON.stringify(launch);
  const changed = key !== routeKey;
  routeKey = key;
  state.screen = launch.screen;
  state.book = launch.book || "prek";
  state.unit = launch.unit || 2;
  state.page = launch.page || state.page;
  state.field = launch.field || "main";
  if (!changed) return;
  stopAudio();
  stopListening();
  state.listening = false;
  state.micNote = false;
  state.nudge = "";
  state.banner = false;
    state.confirmClear = false;
    state.focus = booted;
    booted = true;
  if (launch.screen === "bee") state.flight = newFlight(FIELDS[state.field] || FIELDS.main);
  state.autoplay = launch.screen === "page" && Boolean(PAGES[launch.page]?.autoplay);
  state.playWord = launch.screen === "talk";
}

function render() {
  app.innerHTML = renderApp(model());
  const title = app.querySelector("h1");
  document.title = `${title ? title.textContent : UI.appName} · ${UI.appName}`;
  if (state.focus && title) {
    title.tabIndex = -1;
    title.focus();
    state.focus = false;
  }
  if (state.screen === "bee") requestAnimationFrame(() => placeBee(true));
  if (state.autoplay) {
    state.autoplay = false;
    startPageAudio();
  } else if (state.playWord) {
    state.playWord = false;
    playClip(TALK_WORDS[state.talkIndex]);
  }
}

function navigate(search) {
  const url = new URL(location.href);
  url.search = search ? `?${String(search).replace(/^\?/, "")}` : "";
  history.pushState(null, "", url);
  syncFromUrl();
  render();
}

function highlight(id) {
  document.querySelectorAll("[data-say]").forEach((el) => {
    el.classList.toggle("is-speaking", Boolean(id) && el.dataset.say === id);
  });
}

function startPageAudio() {
  const page = state.screen === "bee" ? PAGES[15] : PAGES[state.page];
  if (!page) return;
  app.querySelector("[data-act=hear-page]")?.classList.remove("needs-hear");
  playList(page.playlist, highlight).then((result) => {
    if (result === "blocked") app.querySelector("[data-act=hear-page]")?.classList.add("needs-hear");
  });
}

function setStatus(text) {
  const el = document.querySelector("[data-status]");
  if (el) el.textContent = text;
  announce(text);
}

function placeBee(snap) {
  const token = app.querySelector(".bee-token");
  const field = app.querySelector(".field");
  if (!token || !field || !state.flight) return;
  const target = beeTarget();
  if (!target) return;
  if (snap) token.style.transition = "none";
  const fieldBox = field.getBoundingClientRect();
  const cellBox = target.getBoundingClientRect();
  const atStart = target.hasAttribute("data-bee-start");
  const x = cellBox.left - fieldBox.left + (atStart ? 0 : cellBox.width * 0.08);
  const y = cellBox.top - fieldBox.top - (atStart ? 36 : 6);
  token.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  if (snap) {
    token.getBoundingClientRect();
    token.style.transition = "";
  }
}

function beeTarget() {
  if (!state.flight.done && state.flight.step === 0) return app.querySelector("[data-bee-start]");
  if (state.flight.done) return app.querySelector('[data-cell="hive"]');
  const id = FIELDS[state.field].path[state.flight.step - 1];
  return app.querySelector(`[data-cell="${id}"]`);
}

function paintFlight() {
  const field = FIELDS[state.field];
  const nextId = state.flight.done ? "" : field.path[state.flight.step];
  const seen = new Set(field.path.slice(0, state.flight.step));
  app.querySelectorAll("[data-cell]").forEach((el) => {
    el.classList.toggle("is-next", el.dataset.cell === nextId);
    el.classList.toggle("is-visited", seen.has(el.dataset.cell));
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function celebrate() {
  state.banner = true;
  const main = app.querySelector("main");
  if (main && !main.querySelector(".banner")) main.insertAdjacentHTML("afterbegin", bannerHtml());
  announce(`${UI.keptGoing} ${UI.stickerLine}`);
  await playClip("sticker");
}

function setBusy(value) {
  busy = value;
  document.documentElement.dataset.busy = value ? "1" : "0";
}

async function onFly(id) {
  if (busy || state.flight.done) return;
  setBusy(true);
  stopAudio();
  const field = FIELDS[state.field];
  const wasDone = state.flight.done;
  const next = tapFlight(state.flight, field, id);
  state.flight = next;
  try {
    if (next.message === "soft") {
      progress = recordMiss(progress);
      saveProgress(localStorage, progress);
      const soft = app.querySelector(`[data-cell="${id}"]`);
      soft?.classList.add("is-soft");
      window.setTimeout(() => soft?.classList.remove("is-soft"), 450);
      setStatus(UI.tryAnother);
      await playList([id, "try-another"], highlight);
      return;
    }
    if (next.message === "wait") {
      setStatus(UI.hiveWait);
      await playClip("hive-wait");
      return;
    }
    if (next.message === "again") {
      await playClip(id);
      return;
    }
    if (next.message === "fly" || (next.message === "home" && !wasDone)) {
      const before = progress.earned;
      paintFlight();
      placeBee(false);
      if (next.message === "home") {
        progress = recordHome(progress, state.field);
        saveProgress(localStorage, progress);
        await delay(560);
        setStatus(UI.beeHome);
        app.querySelector("[data-done]")?.removeAttribute("hidden");
        await playClip("bee-home");
        if (!before && progress.earned) await celebrate();
      } else {
        setStatus(UI.findSound);
        await playClip(id);
      }
    }
  } finally {
    setBusy(false);
  }
}

function paintListening(on) {
  app.querySelectorAll(".ori").forEach((el) => el.classList.toggle("is-listening", on));
  const status = app.querySelector("[data-status]");
  if (!status) return;
  if (on) status.textContent = UI.listening;
  else if (!state.nudge) status.textContent = UI.yourTurn;
}

async function hadAGo(situation) {
  const before = progress.earned;
  progress = recordTalk(progress);
  saveProgress(localStorage, progress);
  const choice = await chooseNudge({ situation, turn: progress.talkTries });
  state.nudge = choice.line.text;
  const slot = app.querySelector("[data-nudge]");
  if (slot) slot.textContent = choice.line.text;
  announce(choice.line.text);
  if (situation === "nearly") await playList([choice.line.id, "sound-b"]);
  else await playClip(choice.line.id);
  if (!before && progress.earned) await celebrate();
}

async function finishListen(pending) {
  state.listening = true;
  paintListening(true);
  const result = await pending;
  state.listening = false;
  paintListening(false);
  if (result.situation === "declined") {
    progress = { ...progress, mic: { noteSeen: true, declined: true } };
    saveProgress(localStorage, progress);
    render();
    return;
  }
  if (result.situation === "unavailable") return hadAGo("effort");
  const situation = result.situation === "quiet" ? "listen" : result.situation;
  return hadAGo(situation);
}

function onSay() {
  if (speechSupported() && !progress.mic.noteSeen) {
    state.micNote = true;
    render();
    return;
  }
  if (!speechSupported() || progress.mic.declined) return hadAGo("effort");
  return finishListen(listenFor(TALK_WORDS[state.talkIndex]));
}

function onMicYes() {
  progress = { ...progress, mic: { noteSeen: true, declined: false } };
  saveProgress(localStorage, progress);
  state.micNote = false;
  const pending = listenFor(TALK_WORDS[state.talkIndex]);
  render();
  return finishListen(pending);
}

function onMicNo() {
  progress = { ...progress, mic: { noteSeen: true, declined: true } };
  saveProgress(localStorage, progress);
  state.micNote = false;
  render();
}

function onNext() {
  stopAudio();
  state.talkIndex = (state.talkIndex + 1) % TALK_WORDS.length;
  state.nudge = "";
  render();
  playClip(TALK_WORDS[state.talkIndex]);
}

async function onCopy() {
  const msg = app.querySelector("[data-restore-msg]");
  try {
    await navigator.clipboard.writeText(makeCode(progress));
    if (msg) msg.textContent = UI.copied;
  } catch {
    if (msg) msg.textContent = UI.copyByHand;
  }
}

function onRestore() {
  const pasted = app.querySelector("[data-paste]")?.value || "";
  const next = readCode(pasted);
  if (!next) {
    state.restoreMessage = UI.codeBad;
    render();
    return;
  }
  progress = applyRestore(progress, next);
  saveProgress(localStorage, progress);
  state.restoreMessage = UI.codeOk;
  render();
}

function onGate(form) {
  if (!gateOk(new FormData(form).get("answer"))) {
    state.gateMessage = UI.gateBad;
    render();
    return;
  }
  unlockGrown(sessionStorage);
  state.gateMessage = "";
  render();
}

app.addEventListener("click", (event) => {
  const el = event.target.closest("[data-act]");
  if (!el || !app.contains(el)) return;
  const act = el.dataset.act;
  if (act === "nav") navigate(el.dataset.to || "");
  else if (act === "hear-page") startPageAudio();
  else if (act === "hear-one") {
    stopAudio();
    highlight(el.dataset.id);
    playClip(el.dataset.id).then(() => highlight(""));
  } else if (act === "fly") onFly(el.dataset.id);
  else if (act === "say") onSay();
  else if (act === "mic-yes") onMicYes();
  else if (act === "mic-no") onMicNo();
  else if (act === "said-it") hadAGo("effort");
  else if (act === "next-picture") onNext();
  else if (act === "bonus") navigate("book=prek&unit=2&play=bee&field=bonus");
  else if (act === "replay") {
    state.flight = newFlight(FIELDS[state.field]);
    state.banner = false;
    render();
  } else if (act === "copy-code") onCopy();
  else if (act === "restore") onRestore();
  else if (act === "clear") {
    state.confirmClear = true;
    render();
  } else if (act === "clear-yes") {
    progress = emptyProgress();
    saveProgress(localStorage, progress);
    state.confirmClear = false;
    state.restoreMessage = "";
    render();
  }
});

app.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.dataset.form !== "gate") return;
  event.preventDefault();
  onGate(form);
});

window.addEventListener("popstate", () => {
  syncFromUrl();
  render();
});

window.addEventListener("resize", () => {
  if (state.screen === "bee") placeBee(true);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(new URL("../sw.js", import.meta.url)).catch(() => {});
}

syncFromUrl();
render();
