var CACHE = "plantloc-v2";
var ASSETS = ["./", "index.html", "map.enc", "assets.enc", "manifest.json",
              "icon-192.png", "icon-512.png", "encrypt.html"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (a) { return c.add(a).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// stale-while-revalidate: answer from cache instantly, refresh the cache in the
// background so re-uploaded files (index.html, assets.enc, map.enc) arrive on
// the next launch. fetch(..., {cache:"reload"}) from the page skips the cache.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  if (e.request.cache === "reload" || e.request.cache === "no-store") {
    e.respondWith(
      fetch(e.request).then(function (r) {
        if (r && r.ok) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return r;
      })
    );
    return;
  }
  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(e.request).then(function (r) {
          if (r && r.ok) c.put(e.request, r.clone());
          return r;
        }).catch(function () { return hit; });
        if (hit) { e.waitUntil(net.catch(function () {})); return hit; }
        return net.then(function (r) {
          if (r) return r;
          if (e.request.mode === "navigate") return c.match("index.html");
          return Response.error();
        });
      });
    })
  );
});
