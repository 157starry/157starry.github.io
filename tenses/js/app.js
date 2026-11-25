/* Aplikasi utama: pengaturan (bahasa, siang/malam), router halaman, beranda 3D. */
(function () {
  const { i18n, data } = window.JK;
  const { PLANETS, TENSES, LEVER } = data;
  const t = (k) => i18n.t(k);
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- pengaturan tersimpan ---------- */
  const KEY = 'jk-settings';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
  const state = {
    lang: saved.lang === 'en' ? 'en' : 'id',
    theme: saved.theme === 'day' ? 'day' : 'night',
    lever: 4,
    sel: null,
    mastered: Array.isArray(saved.mastered) ? saved.mastered : []
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ lang: state.lang, theme: state.theme, mastered: state.mastered })); } catch (e) { /* mode privat: abaikan */ } };

  i18n.lang = state.lang;
  document.documentElement.dataset.theme = state.theme;

  /* ---------- orrery 3D ---------- */
  let orrery = null, err3d = false;
  function startOrrery() {
    if (orrery || err3d || window.innerWidth < 1024) return;
    try {
      orrery = new JK.Orrery($('#orrery'), {
        planets: PLANETS,
        onPick: (id) => { state.sel = id; renderPlanetPanel(); hideTip(); },
        onHover: (id, x, y) => showTip(id, x, y)
      });
      orrery.setDay(state.theme === 'day');
      orrery.setLabels({ past: t('past'), now: t('now'), future: t('future') });
      const L = LEVER[state.lever]; orrery.setLever(state.lever, L.planet);
    } catch (e) {
      err3d = true; orrery = null;
      const box = $('#err3d'); if (box) box.hidden = false;
    }
  }

  const tip = $('#tip');
  function showTip(id, x, y) {
    if (!id) return hideTip();
    const p = PLANETS.find((q) => q.id === id);
    tip.textContent = p.name[state.lang];
    tip.style.left = (x + 14) + 'px'; tip.style.top = (y - 34) + 'px';
    tip.hidden = false;
  }
  function hideTip() { tip.hidden = true; }

  /* ---------- header: bahasa & mode ---------- */
  function syncHeader() {
    document.querySelectorAll('.seg [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
    $('#modeBtn').setAttribute('aria-label', state.theme === 'night' ? t('modeToDay') : t('modeToNight'));
    $('meta[name="theme-color"]').setAttribute('content', state.theme === 'night' ? '#0B1029' : '#F4EBDD');
  }
  document.querySelectorAll('.seg [data-lang]').forEach((b) => b.addEventListener('click', () => {
    if (state.lang === b.dataset.lang) return;
    state.lang = b.dataset.lang; i18n.lang = state.lang; save();
    i18n.apply(); syncHeader(); render();
    if (orrery) orrery.setLabels({ past: t('past'), now: t('now'), future: t('future') });
  }));
  $('#modeBtn').addEventListener('click', () => {
    state.theme = state.theme === 'night' ? 'day' : 'night'; save();
    document.documentElement.dataset.theme = state.theme;
    syncHeader();
    if (orrery) orrery.setDay(state.theme === 'day');
  });

  /* ---------- router ---------- */
  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [a, b] = h.split('/');
    if (a === 'materi') return { route: 'lessons', planet: b || null };
    if (a === 'menara') return { route: 'quiz' };
    return { route: 'home' };
  }

  function render() {
    const r = parse();
    document.body.className = 'route-' + r.route;
    document.querySelectorAll('.nav [data-route]').forEach((a) => {
      if (a.dataset.route === r.route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    hideTip();
    const view = $('#view');
    if (r.route === 'home') {
      view.innerHTML = homeHTML();
      bindHome();
      startOrrery();
      if (orrery) orrery.resume();
      if (err3d) $('#err3d').hidden = false;
    } else {
      if (orrery) orrery.pause();
      view.innerHTML = r.route === 'lessons' ? lessonsHTML() : quizHTML();
      window.scrollTo(0, 0);
      if (r.route === 'lessons' && r.planet) {
        const el = document.getElementById('planet-' + r.planet);
        if (el) { el.classList.add('focus'); el.scrollIntoView({ block: 'center' }); }
      }
    }
    document.title = t('appName') + ' · ' + (r.route === 'home' ? t('title') : r.route === 'lessons' ? t('lessonsTitle') : t('quizTitle'));
  }
  window.addEventListener('hashchange', () => { if (parse().route !== 'home') state.sel = null; render(); $('#view').focus({ preventScroll: true }); });

  /* ---------- beranda ---------- */
  const chevron = (d) => '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 L5 8 L10 13' : 'M6 3 L11 8 L6 13') + '" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  function homeHTML() {
    const done = state.mastered.length;
    return '<section class="home">' +
      '<div class="intro"><div class="eyebrow">' + esc(t('eyebrow')) + '</div><h1>' + esc(t('title')) + '</h1><p>' + esc(t('hint')) + '</p></div>' +
      '<p id="err3d" class="err3d" hidden>' + esc(t('err3d')) + '</p>' +
      '<aside id="planetPanel" class="panel planet-panel" hidden></aside>' +
      '<div class="panel gears"><div class="gears-head"><span class="eyebrow">' + esc(t('gears')) + '</span><b>' + done + ' / 16</b></div>' +
        '<div class="gear-grid">' + Array.from({ length: 16 }, (_, i) => '<span' + (i < done ? ' class="on"' : '') + '></span>').join('') + '</div>' +
        '<p>' + esc(t('gearsHint')) + '</p></div>' +
      '<div class="panel lever">' +
        '<div class="lever-head"><span class="eyebrow">' + esc(t('lever')) + '</span><span class="lever-tense" id="lvTense"></span></div>' +
        '<p class="lever-sentence" id="lvSentence" aria-live="polite"></p>' +
        '<p class="lever-exp" id="lvExp"></p>' +
        '<div class="lever-row">' +
          '<button type="button" class="step" id="lvPrev" aria-label="' + esc(t('prev')) + '">' + chevron(-1) + '</button>' +
          '<div class="lever-track"><label class="sr-only" for="lvRange">' + esc(t('lever')) + '</label>' +
            '<input id="lvRange" type="range" min="0" max="8" step="1" value="' + state.lever + '">' +
            '<div class="lever-scale"><span>' + esc(t('past')) + '</span><span>' + esc(t('now')) + '</span><span>' + esc(t('future')) + '</span></div></div>' +
          '<button type="button" class="step" id="lvNext" aria-label="' + esc(t('next')) + '">' + chevron(1) + '</button>' +
        '</div></div>' +
      '</section>';
  }

  function updateLever() {
    const L = LEVER[state.lever];
    $('#lvTense').textContent = TENSES[L.tense].name;
    const s = $('#lvSentence'); s.textContent = '';
    s.append(L.pre); const m = document.createElement('mark'); m.textContent = L.verb; s.append(m, L.post);
    $('#lvExp').innerHTML = esc(L.exp[state.lang]) + ' · <b>' + esc(TENSES[L.tense].f) + '</b>';
    $('#lvRange').value = state.lever;
    $('#lvRange').setAttribute('aria-valuetext', TENSES[L.tense].name);
    if (orrery) orrery.setLever(state.lever, L.planet);
  }

  function bindHome() {
    const setL = (v) => { state.lever = Math.max(0, Math.min(8, v)); updateLever(); };
    $('#lvRange').addEventListener('input', (e) => setL(+e.target.value));
    $('#lvPrev').addEventListener('click', () => setL(state.lever - 1));
    $('#lvNext').addEventListener('click', () => setL(state.lever + 1));
    updateLever();
    renderPlanetPanel();
  }

  function renderPlanetPanel() {
    const box = $('#planetPanel');
    if (!box) return;
    const p = PLANETS.find((q) => q.id === state.sel);
    if (!p) { box.hidden = true; return; }
    const n = PLANETS.indexOf(p) + 1;
    box.innerHTML = '<div class="eyebrow">' + esc(t('planet')) + ' ' + n + ' · ' + esc(t('level')) + ' ' + esc(p.lv) + '</div>' +
      '<h2>' + esc(p.name[state.lang]) + '</h2><p>' + esc(p.desc[state.lang]) + '</p>' +
      '<div class="tense-list">' + p.tenses.map((k) => '<div>' + esc(TENSES[k].name) + '<small>' + esc(TENSES[k].f) + '</small></div>').join('') + '</div>' +
      '<a class="btn-gold" href="#/materi/' + p.id + '">' + esc(t('enter')) + '</a>' +
      '<button type="button" class="btn-line" id="backBtn">' + esc(t('back')) + '</button>';
    box.hidden = false;
    $('#backBtn').addEventListener('click', () => { state.sel = null; box.hidden = true; if (orrery) orrery.back(); });
  }

  /* ---------- materi (tahap 1: peta) ---------- */
  const DOT = { mercury: '#A8917E', venus: '#E2BF7E', earth: '#3A7BD0', mars: '#C2583A', jupiter: '#C99A6E', saturn: '#E3C88E', uranus: '#7CC4BE', neptune: '#4F6AD0' };
  function lessonsHTML() {
    return '<div class="page lessons"><div class="sheet">' + esc(t('sheet')) + ' · 16</div>' +
      '<h1>' + esc(t('lessonsTitle')) + '</h1><p class="lede">' + esc(t('lessonsLede')) + '</p>' +
      '<div class="planet-grid">' + PLANETS.map((p, i) =>
        '<section class="bp-card" id="planet-' + p.id + '"><div class="bp-head"><span class="bp-dot" style="background:' + DOT[p.id] + '"></span>' +
        '<div><div class="fig">FIG. 0' + (i + 1) + '</div><h2>' + esc(p.name[state.lang]) + '</h2></div><span class="bp-lv">' + esc(p.lv) + '</span></div>' +
        '<p class="bp-desc">' + esc(p.desc[state.lang]) + '</p>' +
        '<div class="bp-tenses">' + p.tenses.map((k) => '<div class="bp-tense"><b>' + esc(TENSES[k].name) + '</b><code>' + esc(TENSES[k].f) + '</code><span>' + esc(t('soon')) + '</span></div>').join('') + '</div></section>'
      ).join('') + '</div><p class="note">' + esc(t('lessonSoon')) + '</p></div>';
  }

  /* ---------- menara (tahap 1: placeholder) ---------- */
  const LOCK = '<svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true"><rect x="2" y="9" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 9V6a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  function quizHTML() {
    const fl = t('floors');
    return '<div class="page quiz"><ol class="tower">' + fl.map((f, i) => '<li class="' + (i === fl.length - 1 ? 'peak' : '') + '"><span class="n">' + (i + 1) + '</span>' + esc(f) + LOCK + '</li>').join('') + '</ol>' +
      '<div><div class="eyebrow">' + esc(t('navQuiz')) + '</div><h1>' + esc(t('quizTitle')) + '</h1><p class="lede">' + esc(t('quizLede')) + '</p>' +
      '<div class="panel quiz-soon"><p>' + esc(t('quizSoon')) + '</p><a class="btn-line" href="#/">' + esc(t('toHome')) + '</a></div></div></div>';
  }

  /* ---------- layar kecil ---------- */
  $('#copyLink').addEventListener('click', async (e) => {
    try { await navigator.clipboard.writeText(location.href.split('#')[0]); e.target.textContent = t('smallCopied'); } catch (err) { /* abaikan */ }
  });

  window.addEventListener('resize', () => { if (parse().route === 'home' && !orrery && window.innerWidth >= 1024) startOrrery(); });

  /* ---------- mulai ---------- */
  i18n.apply();
  syncHeader();
  render();
})();
