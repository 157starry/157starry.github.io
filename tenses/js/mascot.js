/* Maskot bintang (nama di i18n: mascotName).
   JK.mascot.svg(mood, size, decor) → <svg> inline
   JK.mascot.say(mood, text, name, opts) → maskot + gelembung bicara
   mood: idle | happy | think | oops | wow | sad
   Warna lewat variabel CSS --star, --star2, --star-line, --star-ink (lihat style.css). */
(function () {
  const MOODS = ['idle', 'happy', 'think', 'oops', 'wow', 'sad'];

  // bintang 5 sudut gembul: sudut dibulatkan lewat stroke tebal ber-linejoin round
  function starPts(cx, cy, R, r) {
    const p = [];
    for (let k = 0; k < 10; k++) {
      const a = (-90 + 36 * k) * Math.PI / 180, d = k % 2 ? r : R;
      p.push((cx + d * Math.cos(a)).toFixed(1) + ',' + (cy + d * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }
  const BODY = starPts(50, 53, 36, 24);
  const INNER = starPts(50, 55, 23, 15);

  const INK = 'var(--star-ink)';
  const dotEye = (x, y, dx, dy) => '<circle cx="' + (x + (dx || 0)) + '" cy="' + (y + (dy || 0)) + '" r="3.3" fill="' + INK + '"/><circle cx="' + (x + (dx || 0) + 1.1) + '" cy="' + (y + (dy || 0) - 1.2) + '" r="1" fill="#fff"/>';
  const arc = (d, w) => '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  const spark = (x, y, s, fill) => '<path d="M' + x + ' ' + (y - s) + ' Q' + (x + s * .18) + ' ' + (y - s * .18) + ' ' + (x + s) + ' ' + y + ' Q' + (x + s * .18) + ' ' + (y + s * .18) + ' ' + x + ' ' + (y + s) + ' Q' + (x - s * .18) + ' ' + (y + s * .18) + ' ' + (x - s) + ' ' + y + ' Q' + (x - s * .18) + ' ' + (y - s * .18) + ' ' + x + ' ' + (y - s) + 'Z" fill="' + fill + '"/>';

  const FACE = {
    idle: () => '<g class="m-eyes">' + dotEye(41, 53) + dotEye(59, 53) + '</g>' + arc('M46.5 58.5 Q50 61.5 53.5 58.5'),
    happy: () => arc('M37.6 54 Q41 49.6 44.4 54') + arc('M55.6 54 Q59 49.6 62.4 54') +
      '<path d="M45.6 57.6 Q50 64.4 54.4 57.6 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>',
    think: () => '<g class="m-eyes">' + dotEye(41, 53, -1.2, -2) + dotEye(59, 53, -1.2, -2) + '</g>' + arc('M47 59.6 L53.4 58.4') +
      '<g class="m-dots"><circle cx="76" cy="26" r="2" fill="var(--star-line)"/><circle cx="82" cy="19" r="2.6" fill="var(--star-line)"/><circle cx="89" cy="11" r="3.2" fill="var(--star-line)"/></g>',
    oops: () => arc('M37 48.2 L43.6 46', 2) + arc('M63 48.2 L56.4 46', 2) + dotEye(41, 53) + dotEye(59, 53) +
      arc('M45.5 60 q2.25 -2.2 4.5 0 t4.5 0', 2) +
      '<path class="m-drop" d="M70 36 Q73.5 41.5 70 44 Q66.5 41.5 70 36 Z" fill="#9FD8F0" stroke="#5FA9CC" stroke-width=".8"/>',
    wow: () => spark(41, 53, 4.6, INK) + spark(59, 53, 4.6, INK) + '<circle cx="42" cy="51.6" r=".9" fill="#fff"/><circle cx="60" cy="51.6" r=".9" fill="#fff"/>' +
      '<ellipse cx="50" cy="60.4" rx="2.6" ry="3.2" fill="' + INK + '"/>',
    sad: () => arc('M37.6 51.4 Q41 54.6 44.4 51.4') + arc('M55.6 51.4 Q59 54.6 62.4 51.4') + arc('M46.5 61 Q50 57.8 53.5 61') +
      '<path class="m-drop" d="M39 56 Q41.6 60.4 39 62.4 Q36.4 60.4 39 56 Z" fill="#9FD8F0" stroke="#5FA9CC" stroke-width=".8"/>'
  };

  const cheeks = '<g class="m-cheeks"><circle cx="32.5" cy="60" r="6" fill="var(--star-cheek)"/><circle cx="67.5" cy="60" r="6" fill="var(--star-cheek)"/>' +
    '<path d="M30.6 57.6 l-1 2.4 M33.4 57.6 l-1 2.4 M65.6 57.6 l-1 2.4 M68.4 57.6 l-1 2.4" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".8"/></g>';

  // garis orbit putus-putus + kilau (seperti lintasan di orrery)
  function decorSVG(mood) {
    const extra = mood === 'happy' || mood === 'wow'
      ? spark(88, 30, 4.5, 'var(--star-line)') + spark(14, 74, 3.5, 'var(--star-line)') + spark(84, 86, 3, 'var(--star)') : spark(12, 24, 3.2, 'var(--star-line)') + spark(88, 82, 3.6, 'var(--star-line)');
    return '<g class="m-orbit" fill="none" stroke="var(--star-line)" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M22 16 Q50 2 78 12" stroke-dasharray="14 5 2 5"/><path d="M95 44 Q99 72 78 92" stroke-dasharray="20 6 2 6"/>' +
      '<path d="M8 58 Q6 76 18 88"/><path d="M13 82 L18 88 L24 85" stroke-linejoin="round"/></g>' + extra;
  }

  function svg(mood, size, decor) {
    mood = MOODS.indexOf(mood) >= 0 ? mood : 'idle';
    size = size || 64;
    const face = mood === 'think' && !decor ? FACE.think().replace(/<g class="m-dots">[\s\S]*<\/g>$/, '') : FACE[mood]();
    return '<svg class="m-star m-' + mood + '" width="' + size + '" height="' + size + '" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      (decor ? decorSVG(mood) : '') +
      '<g class="m-body"><g transform="rotate(-8 50 53)">' +
        '<polygon points="' + BODY + '" fill="var(--star-edge)" stroke="var(--star-edge)" stroke-width="19" stroke-linejoin="round"/>' +
        '<polygon points="' + BODY + '" fill="var(--star)" stroke="var(--star)" stroke-width="14" stroke-linejoin="round"/>' +
        '<polygon points="' + INNER + '" fill="var(--star2)" stroke="var(--star2)" stroke-width="10" stroke-linejoin="round" opacity=".85"/>' +
        '<ellipse cx="38" cy="38" rx="5.5" ry="2.6" transform="rotate(-38 38 38)" fill="#fff" opacity=".6"/><circle cx="44.5" cy="33" r="1.4" fill="#fff" opacity=".6"/>' +
        cheeks + FACE_WRAP(face) +
      '</g></g></svg>';
  }
  const FACE_WRAP = (f) => '<g class="m-face">' + f + '</g>';

  function say(mood, text, name, opts) {
    opts = opts || {};
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    return '<div class="lumi lumi-' + (mood || 'idle') + (opts.cls ? ' ' + opts.cls : '') + '"' + (opts.id ? ' id="' + opts.id + '"' : '') + '>' +
      '<span class="lumi-fig">' + svg(mood, opts.size || 64, opts.decor) + '</span>' +
      '<div class="lumi-say">' + (name ? '<b>' + esc(name) + '</b>' : '') + (opts.html || (text ? '<p>' + esc(text) + '</p>' : '')) + '</div></div>';
  }

  window.JK = window.JK || {};
  window.JK.mascot = { svg, say, MOODS };
})();
