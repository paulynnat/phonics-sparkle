import { asset } from "./assets.js";
import { FIELDS } from "./bee.js";
import { GATE, PAGES, SAY_WORDS, TABS, TIP, TALK_WORDS, UI } from "./content.js";
import { makeCode, soundNote } from "./progress.js";
import { glassSvg, hiveSvg, oriSvg } from "./icons.js";

const PETALS = ["#F7C6D4", "#E3D0F7", "#C9E4FB", "#FBE3A2", "#F8D4C0", "#D5F0D4"];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function nav(current) {
  return `<nav class="nav" aria-label="Play">${TABS.map(
    (tab) =>
      `<button type="button" data-act="nav" data-to="${tab.to}"${current === tab.id ? ' aria-current="page"' : ""}>${esc(tab.label)}</button>`,
  ).join("")}</nav>`;
}

export function bannerHtml() {
  return `<div class="banner">
    <p>${esc(UI.keptGoing)} ${esc(UI.stickerLine)}</p>
    <button type="button" class="btn btn-orange" data-act="nav" data-to="book=prek&unit=2&play=garden">${esc(UI.seeGarden)}</button>
  </div>`;
}

function grownDetails(lines) {
  return `<details class="grown">
    <summary>${esc(UI.forGrown)}</summary>
    ${lines.map((line) => `<p>${esc(line)}</p>`).join("")}
  </details>`;
}

function pictureButton(id, extra = "") {
  return `<button type="button" class="pic-card" data-act="hear-one" data-id="${id}" data-say="${id}" ${extra}>
    <img src="${asset(`art/${id}.png`)}" alt="${esc(id)}">
  </button>`;
}

function oriTurn(model) {
  const word = SAY_WORDS[model.talkIndex] || SAY_WORDS[0];
  const supported = model.speechOk;
  const declined = model.progress.mic.declined || !supported;
  let control = "";
  if (model.micNote) {
    control = `<div class="note" role="dialog" aria-labelledby="note-title">
      <h2 id="note-title">${esc(UI.noteTitle)}</h2>
      <p>${esc(UI.noteBody)}</p>
      <p>${esc(UI.noteChoice)}</p>
      <button type="button" class="btn btn-green" data-act="mic-yes">${esc(UI.micYes)}</button>
      <button type="button" class="btn btn-quiet" data-act="mic-no">${esc(UI.micNo)}</button>
    </div>`;
  } else if (declined) {
    control = `${supported ? "" : `<p>${esc(UI.noMic)}</p>`}
      <button type="button" class="btn btn-green" data-act="said-it">${esc(UI.iSaid)}</button>`;
  } else {
    control = `<button type="button" class="btn btn-green" data-act="say">${esc(UI.sayWord)}</button>`;
  }
  return `<section class="ori-card">
    <div class="talk-row">
      ${oriSvg()}
      <button type="button" class="pic-card" data-act="hear-one" data-id="${word}" data-say="${word}">
        <img data-ori-pic src="${asset(`art/${word}.png`)}" alt="${esc(word)}">
      </button>
    </div>
    <p data-status>${esc(model.listening ? UI.listening : UI.yourTurn)}</p>
    <p class="nudge" data-nudge>${esc(model.nudge || "")}</p>
    <div class="actions">${control}</div>
  </section>`;
}

function cell(id, mode, flight, field, index) {
  const petal = PETALS[index % PETALS.length];
  const nextId = flight && !flight.done ? field.path[flight.step] : "";
  const seen = flight ? field.path.slice(0, flight.step) : [];
  const cls = ["flower"];
  if (mode === "play" && id === nextId) cls.push("is-next");
  if (seen.includes(id)) cls.push("is-visited");
  const style = `style="--petal:${petal}"`;
  if (id === "hive") {
    const face = `<span class="petals"></span><span class="face">${hiveSvg()}</span>`;
    if (mode === "play") {
      return `<button type="button" class="${cls.join(" ")}" ${style} data-act="fly" data-id="hive" data-cell="hive" aria-label="hive">${face}</button>`;
    }
    return `<div class="${cls.join(" ")}" ${style} data-cell="hive">${face}</div>`;
  }
  const act = mode === "play" ? "fly" : "hear-one";
  return `<button type="button" class="${cls.join(" ")}" ${style} data-act="${act}" data-id="${id}" data-cell="${id}" data-say="${id}">
    <span class="petals"></span><span class="face"><img src="${asset(`art/${id}.png`)}" alt="${esc(id)}"></span>
  </button>`;
}

function fieldHtml(field, mode, flight) {
  const cells = field.cells.map((id, index) => cell(id, mode, flight, field, index)).join("");
  const bee =
    mode === "play"
      ? `<div class="bee-token"><img src="${asset("art/bee.png")}" alt=""></div><div class="bee-start" data-bee-start></div>`
      : "";
  return `<div class="field">${bee}${cells}</div>`;
}

function strip() {
  return `<p class="strip" aria-hidden="true">${"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    .split("")
    .map((letter) => `<span class="${letter === "B" ? "on" : ""}">${letter}</span>`)
    .join("")}</p>`;
}

function home() {
  return `<section class="screen hero">
    <p class="eyebrow">${esc(UI.book)}</p>
    <h1>${esc(UI.appName)}</h1>
    <p class="big-letters" aria-hidden="true"><span class="cap">B</span><span>b</span></p>
    <img class="hero-bee" src="${asset("art/bee.png")}" alt="">
    <p class="lead">${esc(UI.homeLead)}</p>
    <div class="choices choices-stack">
      <button type="button" class="big-choice" data-act="nav" data-to="book=prek&unit=2&page=13">
        <img src="${asset("art/bug.png")}" alt=""><span>${esc(PAGES[13].title)} ${glassSvg()}</span>
      </button>
      <button type="button" class="big-choice" data-act="nav" data-to="book=prek&unit=2&page=15">
        <img src="${asset("art/bee.png")}" alt=""><span>${esc(PAGES[15].title)}</span>
      </button>
      <button type="button" class="big-choice" data-act="nav" data-to="book=prek&unit=2&play=talk">
        ${oriSvg()}<span>${esc(UI.talkTitle)}</span>
      </button>
      <button type="button" class="big-choice" data-act="nav" data-to="book=prek&unit=2&play=bee">
        <img src="${asset("art/bee.png")}" alt=""><span>${esc(UI.beeTitle)}</span>
      </button>
      <button type="button" class="big-choice" data-act="nav" data-to="book=prek&unit=2&play=garden">
        <span class="flower-dot" aria-hidden="true"></span><span>${esc(UI.gardenTitle)}</span>
      </button>
    </div>
    <details class="picker">
      <summary>${esc(UI.choose)}</summary>
      <h2>${esc(UI.bookLabel)}</h2>
      <div class="choices">
        <button type="button" data-act="nav" data-to="book=prek&unit=2" aria-pressed="true">${esc(UI.prek)}</button>
        <button type="button" data-act="nav" data-to="book=k1">${esc(UI.k1)}</button>
        <button type="button" data-act="nav" data-to="book=k2">${esc(UI.k2)}</button>
      </div>
      <h2>${esc(UI.unitWord)}</h2>
      <div class="choices">
        <button type="button" data-act="nav" data-to="book=prek&unit=2" aria-pressed="true">${esc(UI.unit2)}</button>
      </div>
      <h2>${esc(UI.pageWord)}</h2>
      <div class="choices choices-stack">
        ${[12, 13, 14, 15, 16]
          .map(
            (page) =>
              `<button type="button" data-act="nav" data-to="book=prek&unit=2&page=${page}">${page} ${esc(PAGES[page].title)}</button>`,
          )
          .join("")}
      </div>
      <button type="button" class="btn btn-quiet" data-act="nav" data-to="book=prek&unit=2&play=grown">${esc(UI.grownTitle)}</button>
    </details>
  </section>`;
}

function sayScreen(model) {
  const page = PAGES[13];
  const pictures = page.pictures.map((id) => pictureButton(id)).join("");
  return `<section class="screen tone-green">
    ${model.banner ? bannerHtml() : ""}
    <p class="chip">${esc(page.family)}</p>
    <h1>${glassMark(13)}${esc(page.title)}</h1>
    <div class="pic-row">${pictures}</div>
    <p class="hint">${esc(page.child)}</p>
    <div class="actions">
      <button type="button" class="btn btn-green" data-act="hear-page" data-say="sound-b">${esc(UI.hearIt)}</button>
    </div>
    ${oriTurn(model)}
    ${grownDetails(page.grown)}
  </section>`;
}

function pageScreen(model) {
  const page = PAGES[model.page];
  const banner = model.banner ? bannerHtml() : "";
  if (model.page === 15) {
    return `<section class="screen tone-${page.tone}">
      ${banner}
      <p class="chip">${esc(page.family)}</p>
      <h1>${esc(page.title)}</h1>
      <p data-status>${esc(page.child)}</p>
      ${fieldHtml(FIELDS.main, "listen", null)}
      <div class="actions">
        <button type="button" class="btn btn-green" data-act="hear-page" data-say="sound-b">${esc(UI.hearIt)}</button>
      </div>
      ${grownDetails(page.grown)}
    </section>`;
  }
  if (model.page === 16) {
    return `<section class="screen tone-${page.tone}">
      ${banner}
      <p class="chip">${esc(page.family)}</p>
      <h1>${esc(page.title)}</h1>
      <p>${esc(page.child)}</p>
      ${page.rows
        .map(
          (row, index) => `<div class="robot-row"><span class="num">${index + 1}</span><div class="robot-pics">${row
            .map((id) => pictureButton(id))
            .join("")}</div></div>`,
        )
        .join("")}
      <button type="button" class="btn btn-green" data-act="hear-page">${esc(UI.hearIt)}</button>
      ${grownDetails(page.grown)}
    </section>`;
  }
  const pictures = page.pictures.map((id) => pictureButton(id)).join("");
  const letters =
    model.page === 12 || model.page === 14
      ? `<p class="big-letters" aria-hidden="true"><span class="cap">B</span><span>b</span></p>`
      : "";
  const pictureWrap = model.page === 13 ? "pic-row" : "stack";
  return `<section class="screen tone-${page.tone}">
    ${banner}
    <p class="chip">${esc(page.family)}</p>
    <h1>${glassMark(model.page)}${esc(page.title)}</h1>
    ${letters}
    ${model.page === 12 ? strip() : ""}
    <div class="${pictureWrap}">${pictures}</div>
    <p class="hint">${esc(page.child)}</p>
    <div class="actions">
      ${model.page === 12 ? `<button type="button" class="btn btn-green" data-act="hear-one" data-id="bee">${esc(UI.hearName)}</button>` : ""}
      <button type="button" class="btn btn-green" data-act="hear-page" data-say="sound-b">${model.page === 12 ? esc(UI.hearSound) : esc(UI.hearIt)}</button>
    </div>
    ${grownDetails(page.grown)}
  </section>`;
}

function glassMark(page) {
  return page === 13 ? `<span class="glass-wrap">${glassSvg()}</span>` : "";
}

function talk(model) {
  const word = TALK_WORDS[model.talkIndex];
  const supported = model.speechOk;
  const declined = model.progress.mic.declined || !supported;
  let actions = "";
  if (model.micNote) {
    actions = `<div class="note" role="dialog" aria-labelledby="note-title">
      <h2 id="note-title">${esc(UI.noteTitle)}</h2>
      <p>${esc(UI.noteBody)}</p>
      <p>${esc(UI.noteChoice)}</p>
      <button type="button" class="btn btn-green" data-act="mic-yes">${esc(UI.micYes)}</button>
      <button type="button" class="btn btn-quiet" data-act="mic-no">${esc(UI.micNo)}</button>
    </div>`;
  } else if (declined) {
    actions = `${supported ? "" : `<p>${esc(UI.noMic)}</p>`}
      <button type="button" class="btn btn-green" data-act="said-it">${esc(UI.iSaid)}</button>`;
  } else {
    actions = `<button type="button" class="btn btn-green" data-act="say">${esc(UI.sayWord)}</button>`;
  }
  return `<section class="screen">
    ${model.banner ? bannerHtml() : ""}
    <h1>${esc(UI.talkTitle)}</h1>
    <div class="talk-row">
      ${oriSvg()}
      ${pictureButton(word)}
    </div>
    <p class="dots" aria-hidden="true">${TALK_WORDS.map((_, index) => `<span class="${index === model.talkIndex ? "on" : ""}"></span>`).join("")}</p>
    <p data-status>${esc(model.listening ? UI.listening : UI.yourTurn)}</p>
    <p class="nudge" data-nudge>${esc(model.nudge || "")}</p>
    <div class="actions">
      <button type="button" class="btn btn-quiet" data-act="hear-one" data-id="${word}">${esc(UI.hearIt)}</button>
      ${actions}
      <button type="button" class="btn btn-quiet" data-act="next-picture">${esc(UI.nextPicture)}</button>
    </div>
  </section>`;
}

function bee(model) {
  const field = FIELDS[model.field];
  const message = {
    look: UI.findSound,
    fly: UI.findSound,
    soft: UI.tryAnother,
    wait: UI.hiveWait,
    home: UI.beeHome,
    again: UI.findSound,
  }[model.flight.message] || UI.findSound;
  return `<section class="screen">
    ${model.banner ? bannerHtml() : ""}
    <h1>${esc(UI.beeTitle)}</h1>
    <p data-status>${esc(message)}</p>
    ${fieldHtml(field, "play", model.flight)}
    <div class="actions">
      <button type="button" class="btn btn-quiet" data-act="hear-page">${esc(UI.hearIt)}</button>
    </div>
    <div class="done" data-done ${model.flight.done ? "" : "hidden"}>
      ${model.field === "main" ? `<button type="button" class="btn btn-orange" data-act="bonus">${esc(UI.oneMore)}</button>` : ""}
      <button type="button" class="btn btn-green" data-act="replay">${esc(UI.flyAgain)}</button>
    </div>
    ${grownDetails([PAGES[15].grown[0], UI.bonusNote])}
  </section>`;
}

function garden(model) {
  const earned = model.progress.earned;
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const plots = letters
    .map((letter) => {
      if (letter === "b") {
        return `<button type="button" class="plot${earned ? " is-earned" : ""}" data-act="hear-one" data-id="sound-b" aria-label="${earned ? "Bb sticker" : "b"}">
          ${earned ? `<img src="${asset("art/bee.png")}" alt="">` : `<span class="seed" aria-hidden="true"></span>`}
          <span class="plot-letter">b</span>
        </button>`;
      }
      return `<div class="plot is-resting" aria-hidden="true"><span class="plot-letter">${letter}</span></div>`;
    })
    .join("");
  return `<section class="screen">
    <h1>${esc(UI.gardenTitle)}</h1>
    <p>${esc(UI.gardenLead)}</p>
    <div class="plots">${plots}</div>
    <img class="garden-banner" src="${asset("art/garden-banner.jpg")}" alt="A sunny garden">
    <details class="grown-panel"${model.openPanel ? " open" : ""}>
      <summary>${esc(UI.forGrown)}</summary>
      ${grownTools(model)}
    </details>
  </section>`;
}

function pageSwitcher() {
  return `<h2>${esc(UI.choose)}</h2>
    <p class="quiet">${esc(UI.bookLabel)}</p>
    <div class="choices">
      <button type="button" data-act="nav" data-to="book=prek&unit=2&page=13">${esc(UI.prek)}</button>
      <button type="button" data-act="nav" data-to="book=k1">${esc(UI.k1)}</button>
      <button type="button" data-act="nav" data-to="book=k2">${esc(UI.k2)}</button>
    </div>
    <p class="quiet">${esc(UI.pageWord)}</p>
    <div class="choices choices-stack">
      ${[12, 13, 14, 15, 16]
        .map(
          (page) =>
            `<button type="button" data-act="nav" data-to="book=prek&unit=2&page=${page}">${page} ${esc(PAGES[page].title)}</button>`,
        )
        .join("")}
    </div>`;
}

function grownTools(model) {
  if (!model.grown) {
    return `<form class="gate" data-form="gate">
      <label for="gate-answer">${esc(GATE.question)}</label>
      <input id="gate-answer" name="answer" inputmode="numeric" autocomplete="off" enterkeyhint="done">
      <button type="submit" class="btn btn-green">${esc(UI.gateOpen)}</button>
      <p data-status>${esc(model.gateMessage || "")}</p>
    </form>`;
  }
  const code = makeCode(model.progress);
  return `<p class="sound-note">${esc(soundNote(model.progress))}</p>
    <p>${esc(UI.stickerRule)}</p>
    <h2>${esc(UI.codeTitle)}</h2>
    <p>${esc(UI.codeBody)}</p>
    <label>${esc(UI.codeThis)}
      <textarea readonly data-code>${esc(code)}</textarea>
    </label>
    <div class="actions">
      <button type="button" class="btn btn-quiet" data-act="copy-code">${esc(UI.copyCode)}</button>
    </div>
    <label>${esc(UI.codeOther)}
      <textarea data-paste></textarea>
    </label>
    <div class="actions">
      <button type="button" class="btn btn-green" data-act="restore">${esc(UI.restore)}</button>
    </div>
    <p data-restore-msg>${esc(model.restoreMessage || "")}</p>
    ${
      model.confirmClear
        ? `<p>${esc(UI.clearAsk)}</p><div class="actions"><button type="button" class="btn btn-quiet" data-act="clear-yes">${esc(UI.clearYes)}</button></div>`
        : `<div class="actions"><button type="button" class="btn btn-quiet" data-act="clear">${esc(UI.clear)}</button></div>`
    }
    ${pageSwitcher()}
    <h2>${esc(UI.tipTitle)}</h2>
    <p>${esc(TIP.body)}</p>`;
}

function later(model) {
  let message = UI.laterBook;
  if (model.book === "k1") message = UI.laterK1;
  else if (model.book === "k2") message = UI.laterK2;
  else if (model.unit && String(model.unit) !== "2") message = UI.laterUnit;
  else if (model.page) message = UI.laterPage;
  return `<section class="screen">
    <h1>${esc(UI.appName)}</h1>
    <p class="lead">${esc(message)}</p>
    <p>${esc(UI.playThis)}</p>
    <button type="button" class="btn btn-green" data-act="nav" data-to="book=prek&unit=2&page=13">${esc(UI.back)}</button>
  </section>`;
}

function grown(model) {
  if (!model.grown) {
    return `<section class="screen">
      <h1>${esc(UI.grownTitle)}</h1>
      <form class="gate" data-form="gate">
        <label for="gate-answer">${esc(GATE.question)}</label>
        <input id="gate-answer" name="answer" inputmode="numeric" autocomplete="off" enterkeyhint="done">
        <button type="submit" class="btn btn-green">${esc(UI.gateOpen)}</button>
        <p data-status>${esc(model.gateMessage || "")}</p>
      </form>
    </section>`;
  }
  const code = makeCode(model.progress);
  return `<section class="screen grown-sheet">
    <h1>${esc(UI.grownTitle)}</h1>
    <h2>${esc(UI.tipTitle)}</h2>
    <p>${esc(TIP.body)}</p>
    <h2>${esc(UI.howToHelp)}</h2>
    <ul>${TIP.help.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
    <p class="sound-note">${esc(soundNote(model.progress))}</p>
    <p>${esc(UI.stickerRule)}</p>
    <p>${esc(UI.nudgeNote)}</p>
    <p>${esc(UI.bonusNote)}</p>
    <h2>${esc(UI.codeTitle)}</h2>
    <p>${esc(UI.codeBody)}</p>
    <label>${esc(UI.codeThis)}
      <textarea readonly data-code>${esc(code)}</textarea>
    </label>
    <button type="button" class="btn btn-quiet" data-act="copy-code">${esc(UI.copyCode)}</button>
    <label>${esc(UI.codeOther)}
      <textarea data-paste></textarea>
    </label>
    <button type="button" class="btn btn-green" data-act="restore">${esc(UI.restore)}</button>
    <p data-restore-msg>${esc(model.restoreMessage || "")}</p>
    ${
      model.confirmClear
        ? `<p>${esc(UI.clearAsk)}</p><button type="button" class="btn btn-quiet" data-act="clear-yes">${esc(UI.clearYes)}</button>`
        : `<button type="button" class="btn btn-quiet" data-act="clear">${esc(UI.clear)}</button>`
    }
  </section>`;
}

function body(model) {
  if (model.screen === "say" || model.screen === "home" || model.screen === "talk") return sayScreen(model);
  if (model.screen === "page") return pageScreen(model);
  if (model.screen === "bee") return bee(model);
  if (model.screen === "garden" || model.screen === "grown") return garden(model);
  return later(model);
}

export function renderApp(model) {
  const current = model.screen === "bee" ? "bee" : model.screen === "garden" || model.screen === "grown" ? "garden" : "say";
  return `<div class="shell">
    <header class="top">
      <button type="button" class="brand" data-act="nav" data-to="book=prek&unit=2&page=13">${oriSvg()}<span>${esc(UI.appName)}</span></button>
      <span class="unit-pill">${esc(UI.unitLabel)}</span>
      <span class="letter-pill">${esc(UI.letter)}</span>
    </header>
    <main>${body(model)}</main>
    ${nav(current)}
  </div>`;
}
