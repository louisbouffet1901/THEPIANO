// Version à plat (générée automatiquement).
const VERSION = 'piano-9180d9c8d342';
const BUILT = '2026-10-24';
const ASSETS = ["./","LICENSE-inter.txt","LICENSE-literata.txt","abcjs-LICENSE.md","abcjs-basic-min.js","abcjs-basic-min.js.LICENSE","activity.js","analysis-client.js","analysis-engine.js","analysis-panel.js","analysis-worker.js","app.css","app.js","audio.js","backup.js","charts.js","content-analyses.js","content-excerpts.js","content-index.js","content-mastery-facts.js","content-melodies.js","content-meta.js","content-piecemap.js","content-pieces.js","content-tips.js","countin.js","data-ref-clair-de-lune.js","data-ref-op15-1.js","data-sight-1.js","data-sight-2.js","data-sight-3.js","data-sight-4.js","data-sight-5.js","data-sight-sources.js","db.js","diagrams.js","favicon.svg","icon-192.png","icon-512.png","icon.svg","icons.js","impro-check.js","index.html","inter-latin-wght-normal.woff2","latency.js","lazy.js","literata-latin-wght-italic.woff2","literata-latin-wght-normal.woff2","local-scores.js","manifest.webmanifest","maskable-512.png","metronome.js","midi.js","musicxml.js","n1-impro.js","n1-interpretation.js","n1-lecture.js","n1-oreille.js","n1-technique.js","n1-theorie.js","n2-impro.js","n2-interpretation.js","n2-lecture.js","n2-oreille.js","n2-technique.js","n2-theorie.js","piano-A0.mp3","piano-A1.mp3","piano-A2.mp3","piano-A3.mp3","piano-A4.mp3","piano-A5.mp3","piano-A6.mp3","piano-A7.mp3","piano-C1.mp3","piano-C2.mp3","piano-C3.mp3","piano-C4.mp3","piano-C5.mp3","piano-C6.mp3","piano-C7.mp3","piano-C8.mp3","piano-Ds1.mp3","piano-Ds2.mp3","piano-Ds3.mp3","piano-Ds4.mp3","piano-Ds5.mp3","piano-Ds6.mp3","piano-Ds7.mp3","piano-Fs1.mp3","piano-Fs2.mp3","piano-Fs3.mp3","piano-Fs4.mp3","piano-Fs5.mp3","piano-Fs6.mp3","piano-Fs7.mp3","piecemap.js","pitch.js","score-widget.js","score.js","session.js","store.js","theory.js","toast.js","tool-analyzer.js","tool-compose.js","tool-ear.js","tool-earpath.js","tool-earplay.js","tool-exercises.js","tool-improfree.js","tool-improv.js","tool-lesson.js","tool-mastery.js","tool-metronome-ui.js","tool-notespeed.js","tool-paliers.js","tool-readdrill.js","tool-rhythm.js","tool-sight.js","tool-warmup.js","updates.js","util.js","version.js","voice.js","widgets.js"];
// Un cache par site : deux copies de l'appli sur la même adresse (github.io) ne s'effacent plus.
const PREFIX = 'piano:' + new URL(self.registration.scope).pathname + ':';
const CACHE = PREFIX + VERSION;
const LEGACY = /^piano-[0-9a-f]{12}$/; // caches de la V2 (sans préfixe)

self.addEventListener('install', e => {
  // Pas d'activation automatique : l'appli propose « Recharger » quand la nouvelle version est prête.
  // cache: 'reload' : les fichiers viennent du serveur, jamais du cache HTTP du navigateur (qui peut garder
  // quelques minutes l'ancienne version : on mélangerait deux versions).
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'skip-waiting') self.skipWaiting();
  else if (d.type === 'version' && e.source) e.source.postMessage({ type: 'version', version: VERSION, built: BUILT });
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => (k.startsWith(PREFIX) && k !== CACHE) || LEGACY.test(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true })).then(hit => hit || fetch(req).then(res => {
    if (res.ok && new URL(req.url).pathname.startsWith(new URL(self.registration.scope).pathname)) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  }).catch(() => (req.mode === 'navigate' ? caches.open(CACHE).then(c => c.match('./')) : Response.error()))));
});
