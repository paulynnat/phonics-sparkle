/**
 * Bee flight for Unit 2.
 * The main path is bag, bed, bun, box, bug, then the hive.
 * Distractors are cat, dog, sun, hen, ox, and axe.
 * The bonus field reuses these approved pictures in a new layout.
 * A second picture set is not included. Each new picture needs an OK first.
 */

export const DISTRACTORS = ["cat", "dog", "sun", "hen", "ox", "axe"];
export const MAIN_PATH = ["bag", "bed", "bun", "box", "bug"];

export const FIELDS = {
  main: {
    id: "main",
    path: MAIN_PATH,
    cells: ["cat", "dog", "bug", "hive", "sun", "bun", "box", "ox", "bag", "bed", "hen", "axe"],
  },
  bonus: {
    id: "bonus",
    path: ["bun", "bag", "box", "bed", "bug"],
    cells: ["ox", "bug", "sun", "hive", "bed", "hen", "box", "cat", "bag", "axe", "dog", "bun"],
  },
};

export function newFlight(field) {
  return { field: field.id, step: 0, done: false, misses: 0, message: "look" };
}

export function tapFlight(flight, field, id) {
  if (flight.done) return { ...flight, message: "home", last: id };
  if (id === "hive") return { ...flight, message: "wait", last: id };
  const next = field.path[flight.step];
  if (id === next) {
    const step = flight.step + 1;
    const done = step >= field.path.length;
    return { ...flight, step, done, message: done ? "home" : "fly", last: id };
  }
  if (field.path.slice(0, flight.step).includes(id)) {
    return { ...flight, message: "again", last: id };
  }
  return { ...flight, misses: flight.misses + 1, message: "soft", last: id };
}
