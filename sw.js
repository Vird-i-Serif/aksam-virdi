// Akşam Virdi: internetsiz açılma. Dosya güncellenince SURUM'u bir artır.
const SURUM = "v3";
const CACHE = "aksam-virdi-" + SURUM;
const DOSYALAR = ["./", "index.html", "manifest.webmanifest", "kapak.jpg", "tac.webp",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce kayıtlı kopyayı göster, arkada yenisini indir (bir sonraki açılışta güncel olur)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const kayitli = await c.match(e.request, { ignoreSearch: true });
    const yeni = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => kayitli);
    return kayitli || yeni;
  }));
});
