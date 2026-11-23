/**
 * Optional Ori nudge proxy. Off unless you run it yourself.
 * The static site does not call this. GitHub Pages cannot run it.
 *
 *   GEMINI_API_KEY=... node server/nudge-proxy.mjs
 *
 * The key is read from the environment only. Do not write it into a file.
 * The proxy may only return a line from the fixed bank.
 */

import http from "node:http";
import { pathToFileURL } from "node:url";
import { LINE_BANK, bankLine, isBankLine } from "../js/content.js";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export function fallbackLine(situation, turn) {
  return bankLine(situation, turn).text;
}

export function lineFromModel(text, situation, turn) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (isBankLine(cleaned)) return cleaned;
  return fallbackLine(situation, turn);
}

export async function geminiLine(situation, turn) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallbackLine(situation, turn);
  const bank = (LINE_BANK[situation] || LINE_BANK.effort).map((line) => line.text);
  const prompt = [
    "You are Ori, a kind orchid, nudging a young child who is trying the b sound.",
    "Reply with one line from the bank and nothing else.",
    "Do not add words. Do not mention a score.",
    `Situation: ${situation}`,
    "Bank:",
    ...bank.map((line) => `- ${line}`),
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );
  if (!response.ok) return fallbackLine(situation, turn);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join(" ") || "";
  return lineFromModel(text, situation, turn);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 2048) {
        reject(new Error("too big"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

export function createServer() {
  return http.createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "content-type");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.method !== "POST" || request.url !== "/nudge") {
      response.writeHead(404);
      response.end();
      return;
    }
    try {
      const body = JSON.parse((await readBody(request)) || "{}");
      const situation = ["praise", "nearly", "listen", "effort"].includes(body.situation)
        ? body.situation
        : "effort";
      const turn = Number(body.turn) || 0;
      const line = await geminiLine(situation, turn);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ line: lineFromModel(line, situation, turn) }));
    } catch {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ line: fallbackLine("effort", 0) }));
    }
  });
}

const launchedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (launchedDirectly) {
  createServer().listen(PORT, HOST, () => {
    const mode = process.env.GEMINI_API_KEY ? "Gemini, checked against the bank" : "fixed lines only";
    console.log(`Nudge proxy on http://${HOST}:${PORT}/nudge (${mode})`);
  });
}
