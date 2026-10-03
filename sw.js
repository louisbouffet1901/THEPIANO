// Version à plat (générée automatiquement).
const VERSION = 'piano-248a4143f092';
const ASSETS = ["./","LICENSE-inter.txt","LICENSE-literata.txt","abcjs-LICENSE.md","abcjs-basic-min.js","abcjs-basic-min.js.LICENSE","app.css","app.js","audio.js","charts.js","content-analyses.js","content-excerpts.js","content-index.js","content-pieces.js","content-tips.js","diagrams.js","favicon.svg","icon-192.png","icon-512.png","icon.svg","index.html","inter-latin-wght-normal.woff2","literata-latin-wght-italic.woff2","literata-latin-wght-normal.woff2","manifest.webmanifest","maskable-512.png","metronome.js","midi.js","n1-impro.js","n1-interpretation.js","n1-lecture.js","n1-oreille.js","n1-technique.js","n1-theorie.js","n2-impro.js","n2-interpretation.js","n2-lecture.js","n2-oreille.js","n2-technique.js","n2-theorie.js","piano-A0.mp3","piano-A1.mp3","piano-A2.mp3","piano-A3.mp3","piano-A4.mp3","piano-A5.mp3","piano-A6.mp3","piano-A7.mp3","piano-C1.mp3","piano-C2.mp3","piano-C3.mp3","piano-C4.mp3","piano-C5.mp3","piano-C6.mp3","piano-C7.mp3","piano-C8.mp3","piano-Ds1.mp3","piano-Ds2.mp3","piano-Ds3.mp3","piano-Ds4.mp3","piano-Ds5.mp3","piano-Ds6.mp3","piano-Ds7.mp3","piano-Fs1.mp3","piano-Fs2.mp3","piano-Fs3.mp3","piano-Fs4.mp3","piano-Fs5.mp3","piano-Fs6.mp3","piano-Fs7.mp3","pitch.js","score.js","store.js","toast.js","tool-analyzer.js","tool-ear.js","tool-improv.js","tool-metronome-ui.js","tool-sight.js","util.js","widgets.js"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match('./'))));
});
