const cacheUrls = [
  "/",
  "/css/material-icons.css",
  "/js/navigo.min.js",
  "/css/normalize.css",
  "/css/Toast.css",
  "/css/main.css",
  "/noart.png",
  "/Downable3.png",
  "/js/vendor/modernizr-3.8.0.min.js",
  "/js/plugins.js",
  "/js/color-thief.umd.js",
  "/js/Base64.js",
  "/js/pouchdb.min.js",
  "/js/Toast.js",
  "/js/FullViewDriver.js",
  "/js/QueueManager.js",
  "/js/swal.min.js",
  "/js/AudioPlayer.js",
  "/js/main.js",
  "/css/MaterialIcons-Regular.woff2",
  "/sw.js",
  "/index.html",
  "/favicon.ico",
  "/icon.png",
  "/css/NoBlur.css",
  "/site.webmanifest"
];
const VERSION = "v3.62c"
self.addEventListener("install", function (e) {
  console.log("ServiceWorker install event");
  e.waitUntil(
    caches.open("DownableFEv3").then(function (cache) {
      return cache.addAll(cacheUrls);
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log(event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

 