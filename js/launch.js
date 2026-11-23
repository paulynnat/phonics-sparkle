/** Read book, unit, and page from a QR link or the grown-up picker. */

const PLAY = new Set(["talk", "bee", "garden", "grown"]);
const PAGES = new Set(["12", "13", "14", "15", "16"]);

export function parseLaunch(search) {
  const q = new URLSearchParams(search || "");
  const book = (q.get("book") || "").toLowerCase();
  const unit = q.get("unit");
  const page = q.get("page");
  const play = (q.get("play") || "").toLowerCase();
  const field = q.get("field") === "bonus" ? "bonus" : "main";

  if (book && book !== "prek") return { screen: "later", book };
  if (book === "prek" && unit && unit !== "2") return { screen: "later", book, unit };
  if (book === "prek" && unit === "2" && page && !PAGES.has(page) && !play) {
    return { screen: "later", book, unit, page };
  }

  const demo = (!book || book === "prek") && (!unit || unit === "2");
  if (demo && PLAY.has(play)) {
    return { screen: play, book: "prek", unit: 2, field };
  }

  if (book === "prek" && unit === "2" && PAGES.has(page)) {
    return { screen: "page", book: "prek", unit: 2, page: Number(page) };
  }

  return { screen: "home", book: "prek", unit: 2 };
}
