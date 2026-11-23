/**
 * Pre-K Book 1, Unit 2 (Bb). Picture words are spoken, not printed for the child to read.
 * Ori's lines are the fixed bank. A later proxy may pick one of these lines and nothing else.
 */

export const PROXY = Object.freeze({
  enabled: false,
  url: "",
});

export const UI = {
  appName: "Phonics Sparkle",
  book: "Pre-K Book 1",
  unitLabel: "Unit 2",
  letter: "Bb",
  homeLead: "Hear the sound. Try the words. Help the bee fly home.",
  choose: "Grown-ups, choose a page",
  bookLabel: "Book",
  unitWord: "Unit",
  pageWord: "Page",
  prek: "Pre-K",
  k1: "K1",
  k2: "K2",
  unit2: "Unit 2, Bb",
  laterK1: "K1 is not in this demo yet.",
  laterK2: "K2 is not in this demo yet.",
  laterBook: "That book is not in this demo yet.",
  laterUnit: "That unit is not in this demo yet.",
  laterPage: "That page is not in this demo yet.",
  playThis: "You can play Pre-K Unit 2.",
  back: "Back to play",
  lips: "Lips together, then pop.",
  hearIt: "Hear it",
  hearSound: "Hear the sound",
  hearName: "Hear the name",
  trace: "Trace the letters in your book. Say the sound as you go.",
  tapPictures: "Tap the pictures that start with the sound.",
  helpBee: "Help the bee",
  talkTitle: "Talk to Ori",
  beeTitle: "Bee flight",
  gardenTitle: "Your garden",
  grownTitle: "Grown-ups",
  findSound: "Find a picture that starts with the sound.",
  tryAnother: "Try another.",
  beeHome: "The bee is home.",
  hiveWait: "The hive can wait.",
  oneMore: "One more field",
  flyAgain: "Fly again",
  yourTurn: "Your turn",
  sayWord: "Say the word",
  iSaid: "I said it",
  nextPicture: "Next picture",
  listening: "Ori is listening.",
  noteTitle: "A note for grown-ups",
  noteBody:
    "Ori uses the microphone for a moment while your child says the word. The app does not save the voice. Nothing is sent to Phonics Sparkle.",
  noteChoice: "You can say no. Your child can still play.",
  micYes: "Turn on the microphone",
  micNo: "Not now",
  noMic: "This browser cannot use the microphone. You can still have a go.",
  tabSay: "Say it",
  tabBee: "Bee flight",
  tabGarden: "Garden",
  gardenLead: "This sticker is for keeping going.",
  gardenWait: "Have a good try with Ori or the bee.",
  gardenMore: "More letters are resting.",
  stickerLine: "A sticker for your garden.",
  seeGarden: "See the garden",
  keptGoing: "You kept going.",
  forGrown: "For grown-ups",
  robotChild: "Tap a picture to hear the word.",
  gateQ: "What is 8 plus 7?",
  gateOpen: "Open",
  gateBad: "That answer did not open the gate.",
  tipTitle: "Teacher's tip",
  steady: "Bb feels steady.",
  morePlay: "Bb would like a little more play.",
  withOri: "Bb had a good try with Ori.",
  waiting: "Bb is waiting for a good try.",
  stickerRule:
    "The Bb sticker is for keeping going. It appears after the bee gets home, or after three tries with Ori.",
  codeTitle: "Restore code",
  codeBody:
    "This code is private to you. It holds the sticker and a few counts. It does not hold a name or a voice.",
  codeThis: "Code on this device",
  codeOther: "Code from another device",
  copyCode: "Copy the code",
  copied: "Copied.",
  copyByHand: "Select the code and copy it by hand.",
  restore: "Restore",
  codeBad: "That code did not work.",
  codeOk: "The garden is restored.",
  clear: "Clear this device",
  clearAsk: "This clears the garden on this device.",
  clearYes: "Yes, clear it",
  nudgeNote: "Ori's words on this demo come from a fixed list. A server nudge can be switched on later.",
  bonusNote: "The extra field uses the same pictures. A new picture set needs your OK.",
  familyLetters: "Letters and sounds",
  familyListen: "Listen and say",
  familySpell: "Spell and write",
  howToHelp: "How to help",
  tryAgainSoft: "Let us try that again.",
};

export const GATE = {
  question: UI.gateQ,
  answer: "15",
};

export const TIP = {
  body: "The letter's name is bee, but its sound is a short pop of the lips. A child may say the letter name and then the rest of bug. Or they may add a little uh before the rest of bag. This is completely normal, and it fades with gentle practice.",
  help: [
    "Clip the sound short. Keep it a pop, with no uh after it.",
    "Say the name and the sound as a pair.",
    "Copy the lips together. Look at page 13.",
    "Play I spy with the sound, not the name.",
    "Praise every try. Confidence grows with each go.",
  ],
};

export const LINE_BANK = {
  praise: [
    { id: "n-praise-0", text: "Yes. You had a go." },
    { id: "n-praise-1", text: "Lovely try. I heard you." },
    { id: "n-praise-2", text: "You popped your lips. Well done." },
    { id: "n-praise-3", text: "I like how you kept going." },
  ],
  nearly: [
    { id: "n-nearly-0", text: "Nearly. Pop your lips a bit more." },
    { id: "n-nearly-1", text: "Lips together, then a little pop." },
    { id: "n-nearly-2", text: "Clip the sound short." },
    { id: "n-nearly-3", text: "Press your lips, then let them pop." },
  ],
  listen: [
    { id: "n-listen-0", text: "Let us hear it once more." },
    { id: "n-listen-1", text: "Listen, then you have a go." },
    { id: "n-listen-2", text: "I am here. Try when you are ready." },
  ],
  effort: [
    { id: "n-effort-0", text: "You tried. That is what matters." },
    { id: "n-effort-1", text: "A good try. The garden likes that." },
    { id: "n-effort-2", text: "You kept going. I am glad." },
  ],
};

export const TALK_WORDS = ["bee", "bug", "bag", "bed", "bun", "box"];

export const SAY_WORDS = ["bee", "bug", "bag"];

export const TABS = [
  { id: "say", label: "Say it", to: "book=prek&unit=2&page=13" },
  { id: "bee", label: "Bee flight", to: "book=prek&unit=2&page=15" },
  { id: "garden", label: "Garden", to: "book=prek&unit=2&play=garden" },
];

export const PAGES = {
  12: {
    title: "Meet Bb",
    family: UI.familyLetters,
    tone: "coral",
    autoplay: false,
    pictures: ["bee"],
    playlist: ["bee", "sound-b"],
    child: UI.lips,
    grown: [
      "This letter is called bee. The sound is a short pop, like the start of bug and bag.",
    ],
  },
  13: {
    title: "Say it, see it",
    family: UI.familyListen,
    tone: "green",
    autoplay: true,
    pictures: ["bee", "bug", "bag"],
    playlist: ["sound-b", "bee", "sound-b", "bug", "sound-b", "bag", "sound-b"],
    child: UI.lips,
    grown: [
      "Say each picture slowly. Lips press together, then pop. The pictures are bee, bug, and bag.",
    ],
  },
  14: {
    title: "Practise Bb",
    family: UI.familySpell,
    tone: "gold",
    autoplay: false,
    pictures: ["bag", "bed"],
    playlist: ["sound-b", "bag", "bed"],
    child: UI.trace,
    grown: ["In the book, trace B and b. The pictures are bag and bed. Both start with the sound."],
  },
  15: {
    title: "Sound maze",
    family: UI.familyListen,
    tone: "green",
    autoplay: true,
    pictures: [],
    playlist: ["sound-b", "cat", "dog", "bug", "sun", "bun", "box", "ox", "bag", "bed", "hen", "axe", "sound-b"],
    child: UI.tapPictures,
    grown: [
      "The bee may land on pictures that start with the sound. The path is bag, bed, bun, box, bug, then the hive.",
    ],
  },
  16: {
    title: "Robot talk",
    family: UI.familyListen,
    tone: "green",
    autoplay: false,
    pictures: [],
    rows: [
      ["bun", "bug", "bee"],
      ["bed", "bee", "box"],
      ["box", "bag", "bun"],
    ],
    playlist: ["bun", "bed", "bag"],
    child: UI.robotChild,
    grown: [
      "In the book, you are the robot. Say the sounds in the word slowly. Your child points to the picture.",
    ],
  },
};

export const LISTENING_PAGES = [13, 15];

/** Spoken fallback if a clip cannot play. The short b sound is never replaced with the letter name. */
export const CLIP_TEXT = {
  bee: "bee",
  bug: "bug",
  bag: "bag",
  bed: "bed",
  bun: "bun",
  box: "box",
  cat: "cat",
  dog: "dog",
  sun: "sun",
  hen: "hen",
  ox: "ox",
  axe: "axe",
  "try-another": "Try another.",
  "bee-home": "The bee is home.",
  sticker: "A sticker for your garden.",
  "kept-going": "You kept going.",
  "hive-wait": "The hive can wait.",
};

for (const list of Object.values(LINE_BANK)) {
  for (const line of list) CLIP_TEXT[line.id] = line.text;
}

const ALIAS = {
  bee: ["bee", "be"],
  bug: ["bug"],
  bag: ["bag"],
  bed: ["bed"],
  bun: ["bun"],
  box: ["box"],
};

export function bankLine(situation, turn = 0) {
  const list = LINE_BANK[situation] || LINE_BANK.effort;
  const n = Math.abs(Number(turn) || 0);
  return list[n % list.length];
}

export function findLine(text) {
  for (const list of Object.values(LINE_BANK)) {
    const hit = list.find((line) => line.text === text);
    if (hit) return hit;
  }
  return null;
}

export function isBankLine(text) {
  return Boolean(findLine(text));
}

export function judgeHearing(transcripts, target) {
  const parts = [];
  for (const raw of transcripts || []) {
    const bits = String(raw)
      .toLowerCase()
      .replace(/[^a-z]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    parts.push(...bits);
  }
  if (!parts.length) return "quiet";
  const ok = new Set(ALIAS[target] || [target]);
  if (parts.some((part) => ok.has(part))) return "praise";
  if (parts.some((part) => part === "b" || part === "buh")) return "praise";
  return "nearly";
}

export function allCopy() {
  const pages = Object.values(PAGES).flatMap((page) => [page.title, page.family, page.child, ...page.grown]);
  return [...Object.values(UI), ...pages, TIP.body, ...TIP.help, ...Object.values(LINE_BANK).flat().map((line) => line.text)];
}
