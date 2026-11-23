const CACHE = "phonics-sparkle-prek-u2-v2";

const FILES = [
  "./",
  "index.html",
  "css/app.css",
  "manifest.webmanifest",
  "favicon.svg",
  "icon-192.png",
  "icon-512.png",
  "js/app.js",
  "js/assets.js",
  "js/audio.js",
  "js/bee.js",
  "js/content.js",
  "js/icons.js",
  "js/launch.js",
  "js/nudges.js",
  "js/progress.js",
  "js/speech.js",
  "js/views.js",
  "fonts/nunito-400.woff2",
  "fonts/nunito-700.woff2",
  "fonts/nunito-800.woff2",
  "art/axe.png",
  "art/bag.png",
  "art/bed.png",
  "art/bee.png",
  "art/box.png",
  "art/bug.png",
  "art/bun.png",
  "art/cat.png",
  "art/dog.png",
  "art/hen.png",
  "art/ox.png",
  "art/sun.png",
  "audio/axe.mp3",
  "audio/bag.mp3",
  "audio/bed.mp3",
  "audio/bee-home.mp3",
  "audio/bee.mp3",
  "audio/box.mp3",
  "audio/bug.mp3",
  "audio/bun.mp3",
  "audio/cat.mp3",
  "audio/dog.mp3",
  "audio/hen.mp3",
  "audio/hive-wait.mp3",
  "audio/kept-going.mp3",
  "audio/n-effort-0.mp3",
  "audio/n-effort-1.mp3",
  "audio/n-effort-2.mp3",
  "audio/n-listen-0.mp3",
  "audio/n-listen-1.mp3",
  "audio/n-listen-2.mp3",
  "audio/n-nearly-0.mp3",
  "audio/n-nearly-1.mp3",
  "audio/n-nearly-2.mp3",
  "audio/n-nearly-3.mp3",
  "audio/n-praise-0.mp3",
  "audio/n-praise-1.mp3",
  "audio/n-praise-2.mp3",
  "audio/n-praise-3.mp3",
  "audio/ox.mp3",
  "audio/sound-b.mp3",
  "audio/sticker.mp3",
  "audio/sun.mp3",
  "audio/try-another.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES.map((file) => new URL(file, self.location).href)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

function rangeFrom(request, cached) {
  const header = request.headers.get("range") || "";
  const match = /bytes=(\d+)-(\d*)/.exec(header);
  if (!match) return cached;
  return cached.arrayBuffer().then((buffer) => {
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : buffer.byteLength - 1;
    const slice = buffer.slice(start, end + 1);
    return new Response(slice, {
      status: 206,
      headers: {
        "Content-Type": cached.headers.get("Content-Type") || "audio/mpeg",
        "Content-Range": `bytes ${start}-${end}/${buffer.byteLength}`,
        "Content-Length": String(slice.byteLength),
        "Accept-Ranges": "bytes",
      },
    });
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.headers.has("range")) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (!cached) return fetch(request);
        return rangeFrom(request, cached);
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type === "basic") cache.put(request, response.clone());
        return response;
      } catch (error) {
        if (request.mode === "navigate") {
          const fallback = await cache.match(new URL("index.html", self.location).href);
          if (fallback) return fallback;
        }
        throw error;
      }
    })(),
  );
});
