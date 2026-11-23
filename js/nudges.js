/**
 * Ori picks a fixed line. A Gemini call can be switched on later by setting
 * PROXY.enabled and PROXY.url to a server you run. The client rejects any
 * reply that is not in the bank. The API key never lives here.
 */

import { PROXY, bankLine, findLine, isBankLine } from "./content.js";

export { PROXY };

export function proxyPayload(situation, turn) {
  return { situation, turn };
}

export async function chooseNudge({ situation, turn = 0, proxy = PROXY, fetchImpl } = {}) {
  const fallback = bankLine(situation, turn);
  if (!proxy?.enabled || !proxy.url) return { line: fallback, source: "bank" };
  const fetchFn = fetchImpl || globalThis.fetch;
  try {
    const res = await fetchFn(proxy.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(proxyPayload(situation, turn)),
    });
    if (!res.ok) return { line: fallback, source: "bank" };
    const data = await res.json();
    if (!data || !isBankLine(data.line)) return { line: fallback, source: "bank" };
    return { line: findLine(data.line), source: "proxy" };
  } catch {
    return { line: fallback, source: "bank" };
  }
}
