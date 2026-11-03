// Akşam Virdi: internetsiz açılma. Dosya güncellenince SURUM'u bir artır.
const SURUM = "v5";
const CACHE = "aksam-virdi-" + SURUM;
const DOSYALAR = ["./", "index.html", "manifest.webmanifest", "kapak.jpg", "tac.webp",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png", "og.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(DOSYALAR.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const sayfa = req.mode === "navigate" || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (sayfa) {
    // Sayfanın kendisi: önce internetten en güncelini al, internet yoksa kayıtlı kopyayı göster
    e.respondWith(fetch(req, { cache: "no-store" }).then(r => {
      const kopya = r.clone(); caches.open(CACHE).then(c => c.put("index.html", kopya)); return r;
    }).catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
    return;
  }
  // Resimler ve diğerleri: önce kayıtlı kopya, arkada yenisini indir
  e.respondWith(caches.open(CACHE).then(async c => {
    const kayitli = await c.match(req, { ignoreSearch: true });
    const yeni = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => kayitli);
    return kayitli || yeni;
  }));
});
