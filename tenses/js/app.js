/* Aplikasi utama: pengaturan (bahasa, siang/malam), router halaman, beranda 3D,
   halaman materi, mini kuis, roda gigi, dan pop-up naik level. */
(function () {
  const { i18n, data, lessons, checker } = window.JK;
  const { PLANETS, TENSES, LEVER, DOT } = data;
  const t = (k) => i18n.t(k);
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ORDER = PLANETS.reduce((a, p) => a.concat(p.tenses), []);
  const planetOf = (tid) => PLANETS.find((p) => p.tenses.indexOf(tid) >= 0);

  /* ---------- pengaturan tersimpan ---------- */
  const KEY = 'jk-settings';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
  const state = {
    lang: saved.lang === 'en' ? 'en' : 'id',
    theme: saved.theme === 'day' ? 'day' : 'night',
    lever: 4,
    sel: null,
    mastered: Array.isArray(saved.mastered) ? saved.mastered.filter((x) => TENSES[x]) : [],
    level: 'easy',
    quiz: null,
    towerCleared: Math.max(0, Math.min(5, +saved.towerCleared || 0)),
    towerBest: Math.max(0, +saved.towerBest || 0)
  };
  const progressOf = () => ({ gears: state.mastered.length, floors: state.towerCleared, best: state.towerBest });
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ lang: state.lang, theme: state.theme, mastered: state.mastered, towerCleared: state.towerCleared, towerBest: state.towerBest })); } catch (e) { /* mode privat: abaikan */ }
    if (JK.visitors) JK.visitors.progress(progressOf());
  };
  const isMastered = (tid) => state.mastered.indexOf(tid) >= 0;

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
      orrery.setLever(state.lever, LEVER[state.lever].planet);
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
    syncMe();
  }
  function syncMe() {
    const b = $('#meBtn'), V = JK.visitors;
    if (!b || !V) return;
    const m = V.me();
    b.textContent = V.isOwner() ? t('meOwner') : m.name ? t('meHi').replace('{name}', m.name) : t('meHello');
    b.classList.toggle('named', !!m.name || V.isOwner());
  }
  $('#meBtn').addEventListener('click', () => {
    if (JK.visitors.isOwner()) location.hash = '#/pemilik';
    else openWelcome('edit');
  });
  window.addEventListener('jk-owner-change', syncMe);
  document.querySelectorAll('.seg [data-lang]').forEach((b) => b.addEventListener('click', () => {
    if (state.lang === b.dataset.lang) return;
    state.lang = b.dataset.lang; i18n.lang = state.lang; save();
    i18n.apply(); syncHeader(); render(true);
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
    if (a === 'materi') {
      if (b && TENSES[b]) return { route: 'lesson', tense: b };
      return { route: 'lessons', planet: b || null };
    }
    if (a === 'menara') { const n = parseInt(b, 10); return { route: 'quiz', floor: n >= 1 && n <= 5 ? n : null }; }
    if (a === 'detector') return { route: 'detector' };
    if (a === 'pemilik') return { route: 'owner' };
    return { route: 'home' };
  }

  function render(keepScroll) {
    const r = parse();
    const bodyRoute = r.route === 'lesson' ? 'lessons' : r.route;
    document.body.className = 'route-' + bodyRoute;
    document.querySelectorAll('.nav [data-route]').forEach((a) => {
      if (a.dataset.route === bodyRoute) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    hideTip();
    const view = $('#view');
    const y = window.scrollY;
    if (r.route === 'home') {
      view.innerHTML = homeHTML();
      bindHome();
      startOrrery();
      if (orrery) orrery.resume();
      if (err3d) $('#err3d').hidden = false;
    } else {
      if (orrery) orrery.pause();
      if (r.route === 'lessons') view.innerHTML = lessonsHTML();
      else if (r.route === 'lesson') { view.innerHTML = lessonHTML(r.tense); bindLesson(r.tense); }
      else if (r.route === 'detector') JK.detector.mount(view, detectorApi);
      else if (r.route === 'owner') JK.owner.mount(view, detectorApi);
      else if (r.floor && r.floor <= state.towerCleared + 1) JK.tower.play(view, r.floor, towerApi);
      else view.innerHTML = JK.tower.overview(towerApi);
      window.scrollTo(0, keepScroll ? y : 0);
      if (r.route === 'lessons' && r.planet && !keepScroll) {
        const el = document.getElementById('planet-' + r.planet);
        if (el) { el.classList.add('focus'); el.scrollIntoView({ block: 'center' }); }
      }
    }
    const title = r.route === 'home' ? t('title') : r.route === 'lessons' ? t('lessonsTitle') : r.route === 'lesson' ? TENSES[r.tense].name : r.route === 'detector' ? t('detTitle') : r.route === 'owner' ? t('ownTitle') : t('quizTitle');
    document.title = t('appName') + ' · ' + title;
  }
  window.addEventListener('hashchange', () => {
    if (parse().route !== 'home') state.sel = null;
    closeModal();
    render(); $('#view').focus({ preventScroll: true });
  });

  /* ---------- beranda ---------- */
  const chevron = (d) => '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 L5 8 L10 13' : 'M6 3 L11 8 L6 13') + '" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const gearGrid = () => Array.from({ length: 16 }, (_, i) => '<span' + (i < state.mastered.length ? ' class="on"' : '') + '></span>').join('');
  function homeHTML() {
    return '<section class="home">' +
      '<div class="intro"><div class="eyebrow">' + esc(t('eyebrow')) + '</div><h1>' + esc(t('title')) + '</h1><p>' + esc(t('hint')) + '</p></div>' +
      '<p id="err3d" class="err3d" hidden>' + esc(t('err3d')) + '</p>' +
      '<aside id="planetPanel" class="panel planet-panel" hidden></aside>' +
      '<div class="panel gears"><div class="gears-head"><span class="eyebrow">' + esc(t('gears')) + '</span><b>' + state.mastered.length + ' / 16</b></div>' +
        '<div class="gear-grid">' + gearGrid() + '</div><p>' + esc(t('gearsHint')) + '</p></div>' +
      '<div class="panel lever">' +
        '<div class="lever-head"><span class="eyebrow">' + esc(t('lever')) + '</span><a class="lever-tense" id="lvTense" href="#/materi"></a></div>' +
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
    const a = $('#lvTense'); a.textContent = TENSES[L.tense].name; a.href = '#/materi/' + L.tense;
    const s = $('#lvSentence'); s.textContent = '';
    const m = document.createElement('mark'); m.textContent = L.verb; s.append(L.pre, m, L.post);
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
      '<div class="tense-list">' + p.tenses.map((k) => '<a href="#/materi/' + k + '">' + esc(TENSES[k].name) + (isMastered(k) ? ' <em>✓</em>' : '') + '<small>' + esc(TENSES[k].f) + '</small></a>').join('') + '</div>' +
      '<a class="btn-gold" href="#/materi/' + p.tenses[0] + '">' + esc(t('enter')) + '</a>' +
      '<button type="button" class="btn-line" id="backBtn">' + esc(t('back')) + '</button>';
    box.hidden = false;
    $('#backBtn').addEventListener('click', () => { state.sel = null; box.hidden = true; if (orrery) orrery.back(); });
  }

  /* ---------- peta materi ---------- */
  function lessonsHTML() {
    return '<div class="page lessons"><div class="sheet">' + esc(t('sheet')) + ' · ' + state.mastered.length + ' / 16 ' + esc(t('mastered')) + '</div>' +
      '<h1>' + esc(t('lessonsTitle')) + '</h1><p class="lede">' + esc(t('lessonsLede')) + '</p><p class="map-hint">' + esc(t('mapHint')) + '</p>' +
      '<div class="planet-grid">' + PLANETS.map((p, i) =>
        '<section class="bp-card" id="planet-' + p.id + '"><div class="bp-head"><span class="bp-dot" style="background:' + DOT[p.id] + '"></span>' +
        '<div><div class="fig">FIG. 0' + (i + 1) + '</div><h2>' + esc(p.name[state.lang]) + '</h2></div><span class="bp-lv">' + esc(p.lv) + '</span></div>' +
        '<p class="bp-desc">' + esc(p.desc[state.lang]) + '</p>' +
        '<div class="bp-tenses">' + p.tenses.map((k) => '<a class="bp-tense' + (isMastered(k) ? ' done' : '') + '" href="#/materi/' + k + '"><b>' + esc(TENSES[k].name) + '</b><code>' + esc(TENSES[k].f) + '</code><span>' + esc(isMastered(k) ? t('mastered') + ' ✓' : t('start') + ' →') + '</span></a>').join('') + '</div></section>'
      ).join('') + '</div></div>';
  }

  /* ---------- timeline SVG ---------- */
  function timelineSVG(tl, note) {
    const X = { now: 310, past: 160, future: 460, pastfut: 160 };
    const ref = X[tl.ref], pf = tl.ref === 'pastfut';
    const acc = 'var(--bp-acc)', line = 'var(--bp-line)', dim = 'var(--bp-t3)';
    let g = '';
    // sumbu
    g += '<line x1="20" y1="70" x2="600" y2="70" stroke="' + line + '" stroke-width="2"/><path d="M590 64 L602 70 L590 76" fill="none" stroke="' + line + '" stroke-width="2"/>';
    g += '<line x1="310" y1="36" x2="310" y2="98" stroke="' + dim + '" stroke-width="1" stroke-dasharray="3 4"/>';
    if (tl.ref !== 'now') {
      g += '<line x1="' + ref + '" y1="30" x2="' + ref + '" y2="100" stroke="' + acc + '" stroke-width="2"/>';
      g += '<text x="' + ref + '" y="22" fill="' + acc + '" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">' + esc(t('refPoint').toUpperCase()) + '</text>';
    } else {
      g += '<line x1="310" y1="30" x2="310" y2="100" stroke="' + acc + '" stroke-width="2"/>';
    }
    const dash = pf ? ' stroke-dasharray="6 4"' : '';
    // pastfut: proyeksi dari titik acuan ke "bayangan"
    const c = pf ? 260 : ref;
    if (pf) {
      g += '<path d="M' + (ref + 6) + ' 52 Q 210 30 ' + (c - 8) + ' 52" fill="none" stroke="' + acc + '" stroke-width="1.5" stroke-dasharray="4 4"/>';
      g += '<text x="' + c + '" y="22" fill="' + dim + '" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">' + esc(t('imagined').toUpperCase()) + '</text>';
    }
    if (tl.asp === 'simple') {
      if (tl.ref === 'now') [130, 200, 270, 350, 420, 490].forEach((x) => { g += '<circle cx="' + x + '" cy="70" r="6" fill="' + acc + '"/>'; });
      else g += '<circle cx="' + c + '" cy="70" r="8" fill="' + (pf ? 'none' : acc) + '" stroke="' + acc + '" stroke-width="2"' + dash + '/>';
    } else if (tl.asp === 'cont') {
      g += '<rect x="' + (c - 75) + '" y="56" width="150" height="28" rx="14" fill="var(--bp-verbBg, rgba(255,214,107,.18))" stroke="' + acc + '" stroke-width="1.5" stroke-dasharray="6 4"/>';
      g += '<circle cx="' + c + '" cy="70" r="5" fill="' + acc + '"/>';
    } else if (tl.asp === 'perf') {
      const s = c - 110;
      g += '<circle cx="' + s + '" cy="70" r="7" fill="' + (pf ? 'none' : acc) + '" stroke="' + acc + '" stroke-width="2"' + dash + '/>';
      g += '<path d="M' + (s + 10) + ' 70 L' + (c - 8) + ' 70" stroke="' + acc + '" stroke-width="2.5"' + dash + '/><path d="M' + (c - 16) + ' 64 L' + (c - 6) + ' 70 L' + (c - 16) + ' 76" fill="none" stroke="' + acc + '" stroke-width="2.5"/>';
    } else {
      const s = c - 150;
      g += '<rect x="' + s + '" y="58" width="' + (c - s) + '" height="24" rx="12" fill="var(--bp-verbBg, rgba(255,214,107,.18))" stroke="' + acc + '" stroke-width="1.5"' + (pf ? dash : ' stroke-dasharray="6 4"') + '/>';
      g += '<path d="M' + (c - 14) + ' 62 L' + (c - 2) + ' 70 L' + (c - 14) + ' 78" fill="none" stroke="' + acc + '" stroke-width="2.5"/>';
    }
    g += '<text x="20" y="114" fill="' + dim + '" font-family="JetBrains Mono, monospace" font-size="12">' + esc(t('past').toUpperCase()) + '</text>';
    g += '<text x="310" y="114" fill="' + dim + '" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">' + esc(t('now').toUpperCase()) + '</text>';
    g += '<text x="600" y="114" fill="' + dim + '" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="end">' + esc(t('future').toUpperCase()) + '</text>';
    return '<svg class="tl" viewBox="0 0 620 124" role="img" aria-label="' + esc(t('timeT') + ': ' + note) + '">' + g + '</svg><p class="tl-note">' + esc(note) + '</p>';
  }

  /* ---------- halaman materi satu tense ---------- */
  function lessonHTML(tid) {
    const L = lessons[tid], T = TENSES[tid], p = planetOf(tid), lg = state.lang, li = lg === 'id' ? 1 : 2;
    const n = ORDER.indexOf(tid);
    if (!state.quiz || state.quiz.tense !== tid) state.quiz = { tense: tid, q: 0, correct: [], answer: '', fb: null };
    const part = (x) => '<span class="part' + (x === 'S' ? '' : ' hl') + '">' + esc(x) + '</span>';
    const formula = (sign, parts, ex) => '<div class="frow"><span class="fsign">' + sign + '</span><div class="fparts">' + parts.map(part).join('<span class="fplus">+</span>') + '</div><span class="fex">' + esc(ex) + '</span></div>';
    const prev = ORDER[n - 1], next = ORDER[n + 1];
    return '<div class="page lesson">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">' + esc(t('navHome')) + '</a><span>›</span><a href="#/materi">' + esc(t('lessonsTitle')) + '</a><span>›</span><a href="#/materi/' + p.id + '">' + esc(p.name[lg]) + '</a><span>›</span><span aria-current="page">' + esc(T.name) + '</span></nav>' +
      '<div class="lhead"><div><div class="sheet">' + esc(t('sheet')) + ' · ' + esc(p.name[lg]) + ' · ' + String(n + 1).padStart(2, '0') + ' / 16</div>' +
        '<h1>' + esc(T.name) + (isMastered(tid) ? ' <span class="done-badge" title="' + esc(t('mastered')) + '">✓</span>' : '') + '</h1><p class="lede">' + esc(L.tag[lg]) + '</p></div>' +
        '<div class="ltabs">' + p.tenses.map((k) => '<a href="#/materi/' + k + '"' + (k === tid ? ' aria-current="page"' : '') + '>' + esc(TENSES[k].name) + (isMastered(k) ? ' ✓' : '') + '</a>').join('') + '</div></div>' +
      '<div class="lgrid"><div class="lcol">' +
        '<section class="bp-card"><div class="fig">FIG. 01</div><h2>' + esc(t('whenT')) + '</h2><div class="uses">' +
          L.uses.map((u, i) => '<div class="use"><span class="num">' + (i + 1) + '</span><div><b>' + esc(u[lg === 'id' ? 0 : 1]) + '</b><i>' + esc(u[2]) + '</i></div></div>').join('') + '</div></section>' +
        '<section class="bp-card"><div class="fig">FIG. 02</div><h2>' + esc(t('formulaT')) + '</h2><div class="formulas">' +
          formula('(+)', L.forms.pos, L.fx[0]) + formula('(−)', L.forms.neg, L.fx[1]) + formula('(?)', L.forms.q, L.fx[2]) + '</div></section>' +
        '<section class="bp-card"><div class="fig">FIG. 03</div><h2>' + esc(t('timeT')) + '</h2>' + timelineSVG(L.tl, L.tlNote[lg]) +
          '<div class="markers"><span class="mk-label">' + esc(t('markersT')) + '</span>' + L.markers.map((m) => '<span class="mk">' + esc(m) + '</span>').join('') + '</div></section>' +
        '<div class="duo">' +
          '<section class="bp-card compact"><div class="fig bad">' + esc(t('mistakeT').toUpperCase()) + '</div><p class="mis"><s>' + esc(L.mistake.w) + '</s><br>' + esc(L.mistake.r) + ' ✓</p><p class="why">' + esc(L.mistake.why[lg]) + '</p></section>' +
          '<section class="bp-card compact"><div class="fig good">' + esc(t('twinT').toUpperCase()) + '</div><p class="mis">' + esc(L.twin.a) + ' <em>→ ' + esc(L.twin.na[lg]) + '</em><br>' + esc(L.twin.b) + ' <em>→ ' + esc(L.twin.nb[lg]) + '</em></p><a class="twin-link" href="#/materi/' + L.twin.to + '">' + esc(TENSES[L.twin.to].name) + ' →</a></section>' +
        '</div>' +
      '</div><div class="lcol">' +
        '<section class="bp-card"><div class="fig">FIG. 04</div><h2>' + esc(t('exT')) + '</h2>' +
          '<div class="lv-tabs" role="tablist">' + ['easy', 'medium', 'hard'].map((k) => '<button type="button" role="tab" data-lv="' + k + '" aria-selected="' + (state.level === k) + '">' + k[0].toUpperCase() + k.slice(1) + '</button>').join('') + '</div>' +
          '<div id="exList" class="ex-list"></div></section>' +
        '<section class="bp-card quizcard" id="quizCard"></section>' +
      '</div></div>' +
      '<nav class="lnav">' + (prev ? '<a href="#/materi/' + prev + '">← ' + esc(t('prevT')) + ': ' + esc(TENSES[prev].name) + '</a>' : '<span></span>') +
        (next ? '<a href="#/materi/' + next + '">' + esc(t('nextT')) + ': ' + esc(TENSES[next].name) + ' →</a>' : '<span></span>') + '</nav>' +
      '</div>';
  }

  function renderExamples(tid) {
    const L = lessons[tid], li = state.lang === 'id' ? 1 : 2;
    $('#exList').innerHTML = L.ex[state.level].map((e) => '<div class="ex"><p>' + esc(e[0]) + '</p><span>' + esc(e[li]) + '</span></div>').join('');
    document.querySelectorAll('.lv-tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.lv === state.level)));
  }

  function renderQuiz(tid) {
    const L = lessons[tid], q = state.quiz, verb = L.quiz.verbs[q.q], done = isMastered(tid);
    const dots = L.quiz.verbs.map((_, i) => '<span class="qd' + (q.correct.indexOf(i) >= 0 ? ' ok' : '') + (i === q.q ? ' cur' : '') + '"></span>').join('');
    const fb = q.fb;
    $('#quizCard').innerHTML =
      '<div class="qhead"><h2>' + esc(t('quizT')) + '</h2><span class="fig">' + esc(t('question')) + ' ' + (q.q + 1) + ' / 5</span></div>' +
      '<div class="qdots" aria-hidden="true">' + dots + '</div>' +
      '<p class="qask">' + esc(t('quizAsk').replace('{tense}', TENSES[tid].name)) + '</p>' +
      '<div class="kw">' + esc(verb) + '</div>' +
      '<label class="qlabel" for="qAns">' + esc(t('yours')) + '</label>' +
      '<textarea id="qAns" rows="2" placeholder="' + esc(t('ph')) + '" autocomplete="off" spellcheck="false">' + esc(q.answer) + '</textarea>' +
      '<div class="qbtns"><button type="button" class="btn-gold inline" id="qCheck">' + esc(t('check')) + '</button><button type="button" class="btn-line inline" id="qNext">' + esc(t('nextQ')) + '</button></div>' +
      '<div id="qFb" role="status" aria-live="polite">' + (fb ? '<div class="fb ' + (fb.ok ? 'ok' : 'no') + '"><b>' + esc(fb.ok ? t('right') : t('wrong')) + '</b> ' + esc(fb.msg) + '</div>' : '') + '</div>' +
      '<p class="qgoal">' + esc(done ? t('quizDone') : t('quizGoal')) + '</p>';
    const ta = $('#qAns');
    ta.addEventListener('input', () => { q.answer = ta.value; });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doCheck(tid); } });
    $('#qCheck').addEventListener('click', () => doCheck(tid));
    $('#qNext').addEventListener('click', () => { q.q = (q.q + 1) % 5; q.answer = ''; q.fb = null; renderQuiz(tid); $('#qAns').focus(); });
  }

  function doCheck(tid) {
    const L = lessons[tid], q = state.quiz;
    q.answer = $('#qAns').value;
    const r = checker.check(q.answer, tid, L.quiz.verbs[q.q], state.lang, L.markers);
    q.fb = r;
    if (r.ok && q.correct.indexOf(q.q) < 0) q.correct.push(q.q);
    renderQuiz(tid);
    $('#qAns').focus();
    if (r.ok && q.correct.length >= 4 && !isMastered(tid)) {
      state.mastered.push(tid); save();
      setTimeout(() => openModal(tid), 500);
    }
  }

  function bindLesson(tid) {
    renderExamples(tid);
    document.querySelectorAll('.lv-tabs button').forEach((b) => b.addEventListener('click', () => { state.level = b.dataset.lv; renderExamples(tid); }));
    renderQuiz(tid);
  }

  /* ---------- pop-up naik level ---------- */
  let lastFocus = null;
  function openModal(tid) {
    const m = $('#modal'), n = state.mastered.length, next = ORDER.find((k) => !isMastered(k));
    lastFocus = document.activeElement;
    m.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="mTitle">' +
      '<div class="m-gear" aria-hidden="true"><span class="glow"></span><span class="spin"><i class="teeth"></i><i class="body"></i><i class="bar v"></i><i class="bar h"></i></span></div>' +
      '<div class="m-eyebrow">' + esc(t('levelEyebrow')) + '</div>' +
      '<h2 id="mTitle">' + esc(TENSES[tid].name) + '</h2>' +
      '<p class="m-sub">' + esc(n >= 16 ? t('allDone') : t('levelSub')) + '</p>' +
      '<div class="m-count">' + esc(t('gears')) + ' ' + n + ' / 16</div>' +
      '<div class="m-slots">' + Array.from({ length: 16 }, (_, i) => '<span class="' + (i < n - 1 ? 'on' : i === n - 1 ? 'new' : '') + '"></span>').join('') + '</div>' +
      '<div class="m-btns"><a class="btn-gold inline" href="#/">' + esc(t('toObs')) + '</a>' +
        (next ? '<a class="btn-line inline" href="#/materi/' + next + '">' + esc(t('nextLesson')) + ': ' + esc(TENSES[next].name) + '</a>' : '') + '</div>' +
      '<button type="button" class="m-close" id="mClose" aria-label="' + esc(t('close')) + '">×</button></div>';
    m.hidden = false;
    $('#mClose').addEventListener('click', closeModal);
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
    $('.m-btns a', m).focus();
  }
  function closeModal() {
    const m = $('#modal');
    if (m.hidden) return;
    m.hidden = true; m.innerHTML = '';
    if (welcomeKind && welcomeKind !== 'edit') JK.visitors.skip(welcomeKind === 'remind');
    welcomeKind = null;
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
  }
  document.addEventListener('keydown', (e) => {
    const m = $('#modal');
    if (m.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const f = m.querySelectorAll('a, button, input');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- sambutan Starry (kenalan) ---------- */
  let welcomeKind = null;
  function openWelcome(kind) {
    const m = $('#modal'), V = JK.visitors, me = V.me();
    if (!m.hidden) return;
    welcomeKind = kind;
    lastFocus = document.activeElement;
    const title = kind === 'remind' ? t('welRemindT').replace('{n}', me.visits) : t('welT');
    const body = kind === 'remind' ? t('welRemindB') : kind === 'edit' && me.name ? t('welEditB') : t('welB');
    m.innerHTML = '<div class="modal-card welcome" role="dialog" aria-modal="true" aria-labelledby="wTitle">' +
      '<div class="w-orrery" aria-hidden="true"><span class="ring"></span><span class="spin"><i></i></span><span class="sun"></span></div>' +
      '<div class="eyebrow">' + esc(t('appName')) + '</div>' +
      '<h2 id="wTitle">' + esc(title) + '</h2><p class="w-body">' + esc(body) + '</p>' +
      '<form id="wForm" class="w-form" novalidate><label for="wName">' + esc(t('welLabel')) + '</label>' +
        '<input id="wName" maxlength="40" autocomplete="nickname" placeholder="' + esc(t('welPh')) + '" value="' + esc(me.name) + '">' +
        '<p class="w-err" id="wErr" role="alert" hidden></p>' +
        '<div class="w-btns"><button type="submit" class="btn-gold inline">' + esc(t('welSave')) + '</button>' +
        '<button type="button" class="btn-line inline" id="wSkip">' + esc(kind === 'edit' ? t('close') : t('welSkip')) + '</button></div></form>' +
      '<p class="w-note">' + esc(t('welPrivacy')) + '</p>' +
      '<button type="button" class="m-close" id="mClose" aria-label="' + esc(t('close')) + '">×</button></div>';
    m.hidden = false;
    const done = () => { closeModal(); };
    $('#wForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#wName').value.trim();
      if (!v) { const er = $('#wErr'); er.textContent = t('welEmpty'); er.hidden = false; return; }
      V.setName(v); welcomeKind = null; done(); syncMe();
    });
    $('#wSkip').addEventListener('click', done);
    $('#mClose').addEventListener('click', done);
    m.addEventListener('click', (e) => { if (e.target === m) done(); });
    $('#wName').focus();
  }

  /* ---------- menara kuis (lihat tower.js) ---------- */
  const towerApi = {
    t, esc,
    lang: () => state.lang,
    cleared: () => state.towerCleared,
    setCleared: (n) => { state.towerCleared = Math.max(state.towerCleared, n); save(); },
    best: () => state.towerBest,
    setBest: (n) => { state.towerBest = n; save(); }
  };

  /* ---------- grammar detector (lihat detector.js) ---------- */
  const detectorApi = { t, esc, lang: () => state.lang, data };

  /* ---------- layar kecil ---------- */
  $('#copyLink').addEventListener('click', async (e) => {
    try { await navigator.clipboard.writeText(location.href.split('#')[0]); e.target.textContent = t('smallCopied'); } catch (err) { /* abaikan */ }
  });

  window.addEventListener('resize', () => { if (parse().route === 'home' && !orrery && window.innerWidth >= 1024) startOrrery(); });

  /* ---------- mulai ---------- */
  i18n.apply();
  if (JK.visitors) JK.visitors.visit(progressOf());
  syncHeader();
  render();
  setTimeout(() => {
    const k = JK.visitors && JK.visitors.shouldGreet();
    if (k && parse().route !== 'owner' && window.innerWidth >= 1024) openWelcome(k);
  }, 1200);
})();
