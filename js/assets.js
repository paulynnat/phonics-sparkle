/** Resolve a repo file from a module in /js, so GitHub Pages subpaths work. */
export function asset(path) {
  return new URL(`../${path}`, import.meta.url).href;
}
