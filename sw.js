var CACHE = "plantloc-v5";
var ASSETS = ["./", "index.html", "map.enc", "assets.enc", "rtu.enc", "manifest.json",
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

// Strategy:
//  - "?fresh=..." URLs (and reload/no-store requests) go straight to the network,
//    bypassing the HTTP cache, and the result is stored under the clean URL.
//  - Everything else: serve from cache instantly, revalidate with the server in the
//    background (cache:"no-cache" forces an ETag check past GitHub Pages' 10-min cache),
//    so the next launch always has the latest files.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var u = new URL(e.request.url);
  if (u.origin !== location.origin) return;

  if (u.searchParams.has("fresh") || e.request.cache === "reload" || e.request.cache === "no-store") {
    e.respondWith(
      fetch(e.request, { cache: "no-store" }).then(function (r) {
        if (r && r.ok) {
          var clean = new URL(u.href); clean.search = "";
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(clean.href, copy); });
        }
        return r;
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(e.request, { cache: "no-cache" }).then(function (r) {
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
