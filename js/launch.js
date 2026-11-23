/** Read book, unit, and page from a QR link or the grown-up picker. */

const BOOK_PAGES = new Set(["12", "13", "14", "15", "16"]);

function base(extra) {
  return {
    book: "prek",
    unit: 2,
    page: 13,
    field: "main",
    openPanel: false,
    ...extra,
  };
}

export function parseLaunch(search) {
  const q = new URLSearchParams(String(search || "").replace(/^\?/, ""));
  const book = (q.get("book") || "").toLowerCase();
  const unit = q.get("unit");
  const page = q.get("page");
  const play = (q.get("play") || "").toLowerCase();
  const field = q.get("field") === "bonus" ? "bonus" : "main";
  const ours = (!book || book === "prek") && (!unit || unit === "2");

  if (book && book !== "prek") return base({ screen: "later", book, unit: unit || 2 });
  if (book === "prek" && unit && unit !== "2") return base({ screen: "later", book, unit });
  if (ours && page && !BOOK_PAGES.has(page) && !play) {
    return base({ screen: "later", page });
  }
  if (ours && (page === "15" || play === "bee")) {
    return base({ screen: "bee", page: 15, field });
  }
  if (ours && (play === "garden" || play === "grown")) {
    return base({ screen: "garden", openPanel: play === "grown" });
  }
  if (ours && ["12", "14", "16"].includes(page)) {
    return base({ screen: "page", page: Number(page) });
  }
  return base({ screen: "say", page: 13 });
}
