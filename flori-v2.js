// ---------- Florilegium v2: pressed flowers for each topic ----------
window.FLORI_BLOOMS = (function () {
  const S = (inner) => `<svg class="bloom" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
  const stem = (c = "#6F8A57") => `<path d="M50 96C49 76 52 58 50 34" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  return {
    // lavender sprig
    PHILOSOPHY: S(stem() + [0, 1, 2, 3, 4, 5, 6].map((i) => `<ellipse cx="${50 + (i % 2 ? 5 : -5)}" cy="${34 - i * 4}" rx="4" ry="6" fill="#A58BC2" opacity="${.65 + i * .04}" transform="rotate(${i % 2 ? 25 : -25} ${50 + (i % 2 ? 5 : -5)} ${34 - i * 4})"/>`).join("") + `<path d="M50 70q-12-6-18-2q8 8 18 2z" fill="#8FA874"/>`),
    // rose
    PSYCHOLOGY: S(stem() + `<path d="M50 74q-14-4-20 2q10 8 20-2z" fill="#8FA874"/><circle cx="50" cy="30" r="17" fill="#D9A3AE"/><path d="M50 18c9 0 13 7 10 13s-12 7-15 1 0-10 5-10" stroke="#B07A86" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M36 33c2 8 9 12 17 11" stroke="#B07A86" stroke-width="1.6" fill="none"/>`),
    // fern
    SCIENCE: S(`<path d="M50 96C50 70 48 46 56 8" stroke="#6F8A57" stroke-width="2" fill="none"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const y = 84 - i * 9, s = 1 - i * .09; return `<ellipse cx="${41 + i * .6}" cy="${y}" rx="${10 * s}" ry="3.4" fill="#8FA874" transform="rotate(-24 ${41 + i * .6} ${y})"/><ellipse cx="${60 + i * .6}" cy="${y - 2}" rx="${10 * s}" ry="3.4" fill="#7E9A62" transform="rotate(24 ${60 + i * .6} ${y - 2})"/>`; }).join("")),
    // dried wheat
    HISTORY: S(`<path d="M50 96C50 70 50 50 50 14" stroke="#C8A66B" stroke-width="2" fill="none"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="44" cy="${22 + i * 8}" rx="3.4" ry="6" fill="#D9BC86" transform="rotate(-30 44 ${22 + i * 8})"/><ellipse cx="56" cy="${22 + i * 8}" rx="3.4" ry="6" fill="#CFAF77" transform="rotate(30 56 ${22 + i * 8})"/>`).join("")),
    // daisy
    SOCIETY: S(stem() + `<path d="M50 72q12-6 18 0q-10 7-18 0z" fill="#8FA874"/>` + Array.from({ length: 10 }, (_, i) => `<ellipse cx="50" cy="16" rx="4.4" ry="12" fill="#FBF4F3" stroke="#E2C7CC" stroke-width="1" transform="rotate(${i * 36} 50 28)"/>`).join("") + `<circle cx="50" cy="28" r="6.5" fill="#E8C27A"/>`),
    // sprout
    "SELF-GROWTH": S(stem() + `<path d="M50 46c-4-12-16-16-24-12 4 10 14 14 24 12z" fill="#8FA874"/><path d="M50 38c4-12 16-16 24-12-4 10-14 14-24 12z" fill="#7E9A62"/>`),
  };
})();
