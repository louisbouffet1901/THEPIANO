// Petits messages éphémères.
export function toast(msg, kind = '', ms = 2600) {
  const host = document.getElementById('toasts');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  host.append(el);
  setTimeout(() => el.remove(), ms);
}
