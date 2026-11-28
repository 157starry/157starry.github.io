/* Adegan Menara Kuis: latar SVG per lantai + ikon kecil untuk peta menara.
   JK.scenes.backdrop(n) → <svg> latar lantai n (1–5), dipasang di belakang pintu
   JK.scenes.icon(n)     → ikon garis 40×40 untuk daftar lantai
   JK.scenes.tower(done, open) → ilustrasi menara utuh untuk halaman peta
   Warna lewat variabel --sc-* di style.css (malam/siang). */
(function () {
  const W = 380, H = 520, GROUND = 474;

  // angka acak tetap (supaya buku & bintang tidak berubah tiap render)
  function rng(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  function stars(n, seed, y1, y2, x1, x2) {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) {
      const x = (x1 || 0) + r() * ((x2 || W) - (x1 || 0)), y = y1 + r() * (y2 - y1), s = r() < 0.15 ? 1.8 : 0.9 + r() * 0.6;
      g += '<circle class="sc-twinkle" style="animation-delay:' + (r() * 4).toFixed(1) + 's" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + s.toFixed(1) + '" fill="#FFF6DA"/>';
    }
    return '<g class="sc-stars">' + g + '</g>';
  }
  function torch(x, y) {
    return '<g><rect x="' + (x - 3) + '" y="' + y + '" width="6" height="30" rx="2" fill="var(--sc-iron)"/>' +
      '<path d="M' + (x - 9) + ' ' + y + ' h18 l-3 8 h-12 Z" fill="var(--brass)"/>' +
      '<circle cx="' + x + '" cy="' + (y - 12) + '" r="26" fill="var(--sc-glow)" opacity=".16"/>' +
      '<path class="flame" d="M' + x + ' ' + (y - 26) + ' Q' + (x + 9) + ' ' + (y - 11) + ' ' + x + ' ' + (y - 1) + ' Q' + (x - 9) + ' ' + (y - 11) + ' ' + x + ' ' + (y - 26) + ' Z" fill="#FFC857"/>' +
      '<path class="flame" d="M' + x + ' ' + (y - 17) + ' Q' + (x + 4) + ' ' + (y - 8) + ' ' + x + ' ' + (y - 2) + ' Q' + (x - 4) + ' ' + (y - 8) + ' ' + x + ' ' + (y - 17) + ' Z" fill="#FFF3C4"/></g>';
  }
  function candle(x, y, h) {
    return '<g><rect x="' + (x - 4) + '" y="' + y + '" width="8" height="' + h + '" rx="2" fill="#F3E7C9"/>' +
      '<circle cx="' + x + '" cy="' + (y - 7) + '" r="16" fill="var(--sc-glow)" opacity=".18"/>' +
      '<path class="flame" d="M' + x + ' ' + (y - 14) + ' Q' + (x + 5) + ' ' + (y - 6) + ' ' + x + ' ' + (y - 1) + ' Q' + (x - 5) + ' ' + (y - 6) + ' ' + x + ' ' + (y - 14) + ' Z" fill="#FFC857"/></g>';
  }
  const bricks = (id, w, h) => '<pattern id="' + id + '" width="' + w + '" height="' + (h * 2) + '" patternUnits="userSpaceOnUse">' +
    '<path d="M0 ' + h + ' H' + w + ' M0 ' + (h * 2) + ' H' + w + ' M' + (w / 2) + ' 0 V' + h + ' M0 ' + h + ' V' + (h * 2) + '" stroke="var(--sc-mortar)" stroke-width="1.5" fill="none"/></pattern>';

  /* 1 · Gerbang: tembok luar istana, dua menara, obor, jalan batu */
  function gate() {
    let merlons = ''; for (let x = 70; x < 310; x += 34) merlons += '<rect x="' + x + '" y="118" width="20" height="22" fill="var(--sc-wall)"/>';
    const tower = (x) => '<rect x="' + x + '" y="84" width="72" height="' + (GROUND - 84) + '" fill="var(--sc-wall)"/><rect x="' + x + '" y="84" width="72" height="' + (GROUND - 84) + '" fill="url(#sc1b)"/>' +
      [0, 1, 2].map((k) => '<rect x="' + (x + k * 26) + '" y="62" width="20" height="24" fill="var(--sc-wall)"/>').join('') +
      '<rect x="' + (x + 31) + '" y="150" width="10" height="34" rx="5" fill="var(--sc-dark)"/><rect x="' + (x + 31) + '" y="260" width="10" height="34" rx="5" fill="var(--sc-dark)"/>' +
      '<rect x="' + (x + 70) + '" y="84" width="2" height="' + (GROUND - 84) + '" fill="var(--sc-dark)" opacity=".5"/>' +
      '<line x1="' + (x + 36) + '" y1="62" x2="' + (x + 36) + '" y2="18" stroke="var(--sc-iron)" stroke-width="3"/>' +
      '<path class="sc-flag" d="M' + (x + 37) + ' 20 Q' + (x + 52) + ' 16 ' + (x + 66) + ' 24 Q' + (x + 52) + ' 30 ' + (x + 37) + ' 36 Z" fill="var(--sc-banner)"/>';
    return '<defs>' + bricks('sc1b', 36, 18) + '<linearGradient id="sc1s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-sky1)"/><stop offset="1" stop-color="var(--sc-sky2)"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#sc1s)"/>' + stars(40, 7, 6, 120) +
      '<circle cx="190" cy="56" r="20" fill="var(--sc-moon)"/><circle cx="190" cy="56" r="34" fill="var(--sc-moon)" opacity=".12"/>' +
      '<path d="M0 170 Q60 130 120 160 T250 150 T380 160 V' + H + ' H0 Z" fill="var(--sc-hill)"/>' +
      '<rect x="60" y="138" width="260" height="' + (GROUND - 138) + '" fill="var(--sc-wall)"/><rect x="60" y="138" width="260" height="' + (GROUND - 138) + '" fill="url(#sc1b)"/>' + merlons +
      tower(-6) + tower(314) +
      torch(52, 300) + torch(328, 300) +
      '<rect y="' + GROUND + '" width="' + W + '" height="' + (H - GROUND) + '" fill="var(--sc-floor)"/>' +
      '<path d="M108 ' + GROUND + ' H272 L330 ' + H + ' H50 Z" fill="var(--sc-path)"/>' +
      '<path d="M100 486 H280 M88 500 H292 M74 514 H306 M160 ' + GROUND + ' L150 486 M220 ' + GROUND + ' L230 486 M140 486 L130 500 M190 486 V500 M240 486 L250 500 M118 500 L108 514 M170 500 L166 514 M214 500 L218 514 M262 500 L272 514" stroke="var(--sc-mortar)" stroke-width="1.5"/>' +
      '<path d="M18 ' + GROUND + ' q3 -9 6 0 q3 -7 6 0 M346 ' + GROUND + ' q3 -9 6 0 q3 -7 6 0" stroke="var(--sc-grass)" stroke-width="2" fill="none"/>';
  }

  /* 2 · Tangga Spiral: dinding melengkung, anak tangga melingkar naik, jendela panah */
  function spiral() {
    let steps = '';
    // tangga kiri: naik dari bawah ke kiri atas
    for (let i = 0; i < 9; i++) {
      const y = 452 - i * 40, x = -4 + Math.sin(i * 0.5) * 8, w = 78 - i * 3;
      steps += '<rect x="' + x + '" y="' + (y + 10) + '" width="' + w + '" height="30" fill="var(--sc-riser)"/><path d="M' + x + ' ' + (y + 10) + ' L' + (x + 8) + ' ' + y + ' H' + (x + w + 8) + ' L' + (x + w) + ' ' + (y + 10) + ' Z" fill="var(--sc-step)"/>';
    }
    // tangga kanan: lanjutan lingkaran, makin tinggi
    for (let i = 0; i < 7; i++) {
      const y = 214 - i * 34, w = 70 - i * 2, x = W - w + 4 - Math.sin(i * 0.5) * 8;
      steps += '<rect x="' + x + '" y="' + (y + 9) + '" width="' + w + '" height="26" fill="var(--sc-riser)"/><path d="M' + x + ' ' + (y + 9) + ' L' + (x - 8) + ' ' + y + ' H' + (x + w - 8) + ' L' + (x + w) + ' ' + (y + 9) + ' Z" fill="var(--sc-step)"/>';
    }
    const slit = (x, y) => '<rect x="' + x + '" y="' + y + '" width="14" height="58" rx="7" fill="var(--sc-sky2)"/><rect x="' + x + '" y="' + y + '" width="14" height="58" rx="7" fill="none" stroke="var(--sc-dark)" stroke-width="3"/>' +
      '<path d="M' + x + ' ' + (y + 58) + ' L' + (x - 40) + ' ' + (y + 190) + ' H' + (x + 54) + ' L' + (x + 14) + ' ' + (y + 58) + ' Z" fill="var(--sc-sky2)" opacity=".1"/>';
    return '<defs>' + bricks('sc2b', 30, 15) + '<linearGradient id="sc2w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--sc-dark)"/><stop offset=".5" stop-color="var(--sc-wall)"/><stop offset="1" stop-color="var(--sc-dark)"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#sc2w)"/><rect width="' + W + '" height="' + H + '" fill="url(#sc2b)" opacity=".8"/>' +
      '<path d="M0 0 Q190 40 380 0" stroke="var(--sc-dark)" stroke-width="10" fill="none" opacity=".5"/>' +
      slit(150, 48) + slit(218, 48) + steps +
      candle(118, 210, 26) + candle(262, 232, 22) +
      '<ellipse cx="190" cy="' + (GROUND + 22) + '" rx="210" ry="40" fill="var(--sc-floor)"/>' +
      '<ellipse cx="190" cy="' + (GROUND + 22) + '" rx="150" ry="26" fill="none" stroke="var(--sc-mortar)" stroke-width="1.5"/>';
  }

  /* 3 · Lorong Besar: pilar, jendela mawar, lampu gantung, karpet merah */
  function hall() {
    const pillar = (x) => '<rect x="' + x + '" y="40" width="34" height="' + (GROUND - 40) + '" fill="var(--sc-col)"/>' +
      '<rect x="' + (x - 6) + '" y="34" width="46" height="14" fill="var(--sc-col2)"/><rect x="' + (x - 6) + '" y="' + (GROUND - 16) + '" width="46" height="16" fill="var(--sc-col2)"/>' +
      '<path d="M' + (x + 9) + ' 52 V' + (GROUND - 20) + ' M' + (x + 17) + ' 52 V' + (GROUND - 20) + ' M' + (x + 25) + ' 52 V' + (GROUND - 20) + '" stroke="var(--sc-dark)" stroke-width="1.5" opacity=".35"/>' +
      '<path d="M' + (x + 3) + ' 120 h28 v96 l-14 -12 l-14 12 Z" fill="var(--sc-banner)"/><path d="M' + (x + 17) + ' 146 l3 7 h7 l-6 4 l2 7 l-6 -4 l-6 4 l2 -7 l-6 -4 h7 Z" fill="var(--brass)"/>';
    const chand = (x) => '<line x1="' + x + '" y1="0" x2="' + x + '" y2="70" stroke="var(--sc-iron)" stroke-width="2"/>' +
      '<path d="M' + (x - 26) + ' 76 Q' + x + ' 96 ' + (x + 26) + ' 76" stroke="var(--brass)" stroke-width="3" fill="none"/>' +
      candle(x - 24, 64, 12) + candle(x, 72, 12) + candle(x + 24, 64, 12);
    let spokes = ''; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; spokes += '<line x1="190" y1="104" x2="' + (190 + 30 * Math.cos(a)).toFixed(1) + '" y2="' + (104 + 30 * Math.sin(a)).toFixed(1) + '"/>'; }
    return '<defs>' + bricks('sc3b', 48, 24) + '<radialGradient id="sc3r"><stop offset="0" stop-color="#FFE7A3"/><stop offset=".6" stop-color="#C96A4A"/><stop offset="1" stop-color="#5A3A8A"/></radialGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="var(--sc-wall)"/><rect width="' + W + '" height="' + H + '" fill="url(#sc3b)" opacity=".6"/>' +
      '<path d="M0 0 H380 V26 H0 Z" fill="var(--sc-dark)"/>' +
      '<circle cx="190" cy="104" r="40" fill="var(--sc-dark)"/><circle cx="190" cy="104" r="33" fill="url(#sc3r)" opacity=".9"/>' +
      '<g stroke="var(--sc-dark)" stroke-width="2.5">' + spokes + '</g><circle cx="190" cy="104" r="9" fill="var(--sc-dark)"/><circle cx="190" cy="104" r="34" fill="none" stroke="var(--brass)" stroke-width="2"/>' +
      '<path d="M78 190 Q78 150 190 132 Q302 150 302 190" fill="none" stroke="var(--sc-col2)" stroke-width="10"/>' +
      chand(108) + chand(272) + pillar(20) + pillar(326) +
      '<rect y="' + GROUND + '" width="' + W + '" height="' + (H - GROUND) + '" fill="var(--sc-floor)"/>' +
      '<path d="M0 ' + (GROUND + 15) + ' H380 M0 ' + (GROUND + 32) + ' H380 M60 ' + GROUND + ' L40 ' + H + ' M120 ' + GROUND + ' L108 ' + H + ' M260 ' + GROUND + ' L272 ' + H + ' M320 ' + GROUND + ' L340 ' + H + '" stroke="var(--sc-mortar)" stroke-width="1.5"/>' +
      '<path d="M128 ' + GROUND + ' H252 L286 ' + H + ' H94 Z" fill="#7A1F2B"/><path d="M128 ' + GROUND + ' L94 ' + H + ' M252 ' + GROUND + ' L286 ' + H + '" stroke="var(--brass)" stroke-width="3"/>';
  }

  /* 4 · Pintu Tersembunyi: dinding rak buku, sarang laba-laba, lilin */
  function hidden() {
    const r = rng(42), COLS = ['#7A1F2B', '#2F4A6E', '#3E6B4F', '#8A6A2E', '#5A3A6E', '#A0522D', '#2E5E5E', '#6E4A2A'];
    let books = '';
    for (let row = 0; row < 8; row++) {
      const base = 66 + row * 58; let x = 10;
      while (x < W - 10) {
        const w = 7 + Math.floor(r() * 9), h = 34 + Math.floor(r() * 14), c = COLS[Math.floor(r() * COLS.length)];
        if (r() < 0.06) { books += '<rect x="' + x + '" y="' + (base - h + 6) + '" width="' + h + '" height="8" fill="' + c + '" transform="rotate(-12 ' + x + ' ' + base + ')"/>'; x += 18; continue; }
        books += '<rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" fill="' + c + '"/><rect x="' + x + '" y="' + (base - h + 6) + '" width="' + w + '" height="2" fill="#D9B26E" opacity=".55"/>';
        x += w + 1;
      }
      books += '<rect x="0" y="' + base + '" width="' + W + '" height="8" fill="var(--sc-shelf2)"/>';
    }
    const web = (x, y, sx) => '<g stroke="#E8E2D2" stroke-width=".9" fill="none" opacity=".45" transform="translate(' + x + ' ' + y + ') scale(' + sx + ' 1)">' +
      '<path d="M0 0 L60 0 M0 0 L0 60 M0 0 L46 40 M0 0 L22 56 M0 0 L56 20"/><path d="M18 0 Q14 10 0 16 M34 0 Q28 20 0 32 M50 0 Q42 30 0 48"/></g>';
    return '<rect width="' + W + '" height="' + H + '" fill="var(--sc-shelf)"/>' + books +
      '<rect x="0" y="0" width="10" height="' + H + '" fill="var(--sc-shelf2)"/><rect x="' + (W - 10) + '" y="0" width="10" height="' + H + '" fill="var(--sc-shelf2)"/>' +
      '<rect width="' + W + '" height="' + H + '" fill="var(--sc-dim)"/>' +
      web(0, 0, 1) + web(W, 0, -1) +
      '<rect y="' + GROUND + '" width="' + W + '" height="' + (H - GROUND) + '" fill="var(--sc-floor)"/>' +
      '<path d="M0 ' + (GROUND + 22) + ' H380" stroke="var(--sc-mortar)" stroke-width="1.5"/>' +
      '<rect x="14" y="430" width="52" height="8" rx="2" fill="var(--sc-shelf2)"/><rect x="20" y="438" width="6" height="' + (GROUND - 438) + '" fill="var(--sc-shelf2)"/><rect x="54" y="438" width="6" height="' + (GROUND - 438) + '" fill="var(--sc-shelf2)"/>' +
      candle(40, 408, 22) +
      '<path d="M330 ' + GROUND + ' l10 -14 l12 4 l8 10 Z" fill="#F3E7C9" opacity=".7"/>';
  }

  /* 5 · Observatorium: kubah, celah langit berbintang, teleskop, peta bintang */
  function observatory() {
    let ribs = ''; for (let k = 1; k < 6; k++) { const x = k * W / 6; ribs += '<path d="M' + x + ' 300 Q' + (190 + (x - 190) * 0.55) + ' 40 190 6" />'; }
    const consts = '<g stroke="var(--brass)" stroke-width="1.2" fill="none" opacity=".75"><path d="M60 ' + (GROUND + 30) + ' L110 ' + (GROUND + 16) + ' L150 ' + (GROUND + 28) + ' M230 ' + (GROUND + 26) + ' L270 ' + (GROUND + 14) + ' L320 ' + (GROUND + 30) + '"/></g>' +
      '<g fill="var(--hi)"><circle cx="60" cy="' + (GROUND + 30) + '" r="2"/><circle cx="110" cy="' + (GROUND + 16) + '" r="2.4"/><circle cx="150" cy="' + (GROUND + 28) + '" r="2"/><circle cx="230" cy="' + (GROUND + 26) + '" r="2"/><circle cx="270" cy="' + (GROUND + 14) + '" r="2.4"/><circle cx="320" cy="' + (GROUND + 30) + '" r="2"/></g>';
    return '<defs><linearGradient id="sc5d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-night)"/><stop offset="1" stop-color="var(--sc-wall)"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#sc5d)"/>' +
      '<path d="M0 300 Q0 6 190 6 Q380 6 380 300 V' + H + ' H0 Z" fill="var(--sc-dark)" opacity=".55"/>' +
      '<g fill="none" stroke="var(--brass)" stroke-width="2" opacity=".55">' + ribs + '<path d="M0 300 Q0 6 190 6 Q380 6 380 300"/></g>' +
      '<path d="M162 10 Q190 4 218 10 L232 300 H148 Z" fill="var(--sc-night)"/>' + stars(36, 11, 12, 290, 150, 230) +
      '<circle cx="204" cy="60" r="10" fill="var(--sc-moon)" opacity=".9"/>' +
      stars(18, 5, 20, 260, 10, 140) + stars(18, 9, 20, 260, 240, 370) +
      '<g transform="rotate(-24 344 410)"><rect x="334" y="300" width="20" height="112" rx="5" fill="var(--brass)"/><rect x="330" y="294" width="28" height="14" rx="3" fill="var(--hi)"/><rect x="337" y="350" width="14" height="6" fill="var(--brassDk2)"/></g>' +
      '<path d="M330 ' + GROUND + ' L346 410 L362 ' + GROUND + ' M346 410 V' + GROUND + '" stroke="var(--sc-iron)" stroke-width="4" fill="none"/>' +
      '<g transform="translate(48 380)"><circle r="26" fill="none" stroke="var(--brass)" stroke-width="2"/><ellipse rx="26" ry="9" fill="none" stroke="var(--brass)" stroke-width="1.5" transform="rotate(-24)"/><circle r="6" fill="var(--hi)"/><circle class="sc-orbit" cx="23" cy="-11" r="4" fill="#6FB8B2"/><line x1="0" y1="26" x2="0" y2="94" stroke="var(--brassDk2)" stroke-width="4"/></g>' +
      '<rect y="' + GROUND + '" width="' + W + '" height="' + (H - GROUND) + '" fill="var(--sc-floor)"/>' +
      '<ellipse cx="190" cy="' + (GROUND + 24) + '" rx="170" ry="20" fill="none" stroke="var(--brass)" stroke-width="2" opacity=".7"/>' + consts;
  }

  const SCENES = [gate, spiral, hall, hidden, observatory];
  function backdrop(n) {
    const f = SCENES[(n - 1) % 5] || gate;
    return '<svg class="sc-bg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' + f() + '</svg>';
  }

  /* ikon garis per lantai (daftar di peta menara) */
  const ICONS = [
    '<path d="M8 36 V14 h6 v4 h4 v-4 h4 v4 h4 v-4 h6 V36"/><path d="M15 36 V26 a5 5 0 0 1 10 0 V36"/>',
    '<path d="M20 4 a14 14 0 1 1 -12 7"/><path d="M20 12 a8 8 0 1 1 -7 4"/><path d="M8 11 l-2 -5 M8 11 l5 -1"/><circle cx="20" cy="20" r="1.6"/>',
    '<path d="M6 36 h28 M8 33 h24"/><path d="M11 33 V14 M17 33 V14 M23 33 V14 M29 33 V14"/><path d="M6 14 h28 L20 5 Z"/>',
    '<rect x="7" y="5" width="26" height="31" rx="1"/><path d="M7 15 h26 M7 25 h26 M11 5 v10 M15 5 v10 M24 15 v10 M28 15 v10 M13 25 v11 M19 25 v11"/><circle cx="27" cy="31" r="1.6"/>',
    '<path d="M6 30 a14 14 0 0 1 28 0 Z"/><path d="M18 17 l14 -9"/><path d="M6 34 h28"/><path d="M12 10 l1 2 l2 .4 l-1.6 1.4 l.4 2 l-1.8 -1 l-1.8 1 l.4 -2 l-1.6 -1.4 l2 -.4 Z"/>'
  ];
  function icon(n) {
    return '<svg class="fl-ico" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[n - 1] + '</svg>';
  }

  /* ilustrasi menara utuh: lantai 1 di bawah, kubah observatorium di puncak */
  function tower(done, open) {
    const segY = [404, 316, 228, 140, 52], segH = 88;
    const lit = (n) => n <= done ? 'var(--hi)' : n === open ? 'var(--sc-glow)' : 'var(--sc-dark)';
    const cls = (n) => n <= done ? 'done' : n === open ? 'open' : 'locked';
    const win = [
      (y, n) => '<path d="M86 ' + (y + 86) + ' V' + (y + 50) + ' a24 24 0 0 1 48 0 V' + (y + 86) + ' Z" fill="' + lit(n) + '"/><path d="M110 ' + (y + 30) + ' V' + (y + 86) + '" stroke="var(--sc-wall)" stroke-width="3"/>',
      (y, n) => '<rect x="78" y="' + (y + 22) + '" width="10" height="34" rx="5" fill="' + lit(n) + '"/><rect x="132" y="' + (y + 40) + '" width="10" height="34" rx="5" fill="' + lit(n) + '"/><path d="M60 ' + (y + 70) + ' L160 ' + (y + 30) + '" stroke="var(--sc-mortar)" stroke-width="2"/>',
      (y, n) => [76, 101, 126].map((x) => '<path d="M' + x + ' ' + (y + 72) + ' V' + (y + 34) + ' a9 9 0 0 1 18 0 V' + (y + 72) + ' Z" fill="' + lit(n) + '"/>').join(''),
      (y, n) => '<rect x="102" y="' + (y + 36) + '" width="16" height="16" rx="2" fill="' + lit(n) + '"/><path d="M70 ' + (y + 20) + ' h24 M126 ' + (y + 68) + ' h24" stroke="var(--sc-mortar)" stroke-width="2"/>',
      (y, n) => '<rect x="96" y="' + (y + 50) + '" width="28" height="30" rx="3" fill="' + lit(n) + '"/>'
    ];
    let g = '';
    for (let i = 0; i < 5; i++) {
      const n = i + 1, y = segY[i];
      g += '<g class="tw-seg ' + cls(n) + '"><rect x="' + (52 + i * 2) + '" y="' + y + '" width="' + (116 - i * 4) + '" height="' + segH + '" fill="var(--sc-wall)"/>' +
        '<rect x="' + (52 + i * 2) + '" y="' + y + '" width="' + (116 - i * 4) + '" height="' + segH + '" fill="url(#twb)"/>' +
        '<rect x="' + (46 + i * 2) + '" y="' + (y + segH - 6) + '" width="' + (128 - i * 4) + '" height="8" fill="var(--sc-col2)"/>' + win[i](y, n) +
        '<text x="' + (178 - i * 2) + '" y="' + (y + 52) + '" class="tw-n">' + n + '</text></g>';
    }
    return '<svg class="tw-art" viewBox="0 0 220 500" aria-hidden="true" focusable="false"><defs>' + bricks('twb', 24, 12) + '</defs>' +
      stars(22, 3, 4, 120, 0, 220) +
      g +
      '<path d="M58 52 Q58 4 110 2 Q162 4 162 52 Z" fill="var(--sc-col2)"/><path d="M104 4 L104 52" stroke="var(--sc-night)" stroke-width="10"/>' +
      '<g transform="rotate(-30 120 34)"><rect x="112" y="0" width="12" height="40" rx="3" fill="var(--brass)"/></g>' +
      '<rect x="20" y="492" width="180" height="8" rx="3" fill="var(--sc-floor)"/></svg>';
  }

  window.JK = window.JK || {};
  window.JK.scenes = { backdrop, icon, tower };
})();
