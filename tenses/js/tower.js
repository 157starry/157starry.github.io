/* Menara Kuis: peta menara + permainan per lantai.
   JK.tower.overview(api) → HTML peta; JK.tower.play(view, floor, api) → pasang permainan.
   api: { t, esc, lang(), cleared(), setCleared(n), best(), setBest(n), go(hash) } */
(function () {
  const PER_FLOOR = 5, LIVES = 3;
  const TYPE_IDX = { fill: 0, order: 1, guess: 2, error: 3 };
  const LOCK = '<svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true"><rect x="2" y="9" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 9V6a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  const CHECK = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9.5 L7 13.5 L15 4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let live = null; // permainan yang sedang berjalan (bertahan saat ganti bahasa/mode)
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  /* ---------- peta menara ---------- */
  function overview(api) {
    const { t, esc } = api, fl = t('floors'), lv = t('floorLv'), done = api.cleared();
    const next = Math.min(done + 1, 5);
    const items = fl.map((f, i) => {
      const n = i + 1, st = n <= done ? 'done' : n === done + 1 ? 'open' : 'locked';
      const inner = '<span class="n">' + n + '</span>' + JK.scenes.icon(n) + '<span class="fname">' + esc(f) + '<small>' + esc(lv[i]) + '</small></span>' +
        '<span class="fstat">' + (st === 'done' ? CHECK : st === 'open' ? esc(t('enterFloor')) : LOCK) + '</span>';
      const cls = 'floor ' + st + (n === 5 ? ' peak' : '');
      return '<li>' + (st === 'locked' ? '<span class="' + cls + '" aria-disabled="true">' + inner + '<span class="sr-only">' + esc(t('locked')) + '</span></span>' : '<a class="' + cls + '" href="#/menara/' + n + '">' + inner + '</a>') + '</li>';
    }).join('');
    const types = t('qtypes').map((x) => '<span class="tchip">' + esc(x) + '</span>').join('');
    return '<div class="page quiz">' + JK.scenes.tower(done, Math.min(done + 1, 5)) + '<ol class="tower">' + items + '</ol>' +
      '<div class="tower-side"><div class="eyebrow">' + esc(t('navQuiz')) + '</div><h1>' + esc(t('quizTitle')) + '</h1><p class="lede">' + esc(t('quizLede')) + '</p>' +
      '<div class="panel rules"><p>' + esc(t('towerRules')) + '</p><div class="tchips">' + types + '</div>' +
      '<div class="rules-foot"><span>' + esc(t('bestScore')) + ': <b>' + api.best() + '</b></span><span>' + done + ' / 5 ' + esc(t('cleared')) + '</span></div>' +
      (done >= 5 ? '<a class="btn-gold" href="#/menara/1">' + esc(t('playAgain')) + '</a>' : '<a class="btn-gold" href="#/menara/' + next + '">' + esc(t('startFloor').replace('{n}', next)) + '</a>') +
      '</div></div></div>';
  }

  /* ---------- permainan satu lantai ---------- */
  function play(view, floor, api) {
    const { t, esc } = api;
    const bank = (window.JK.quizbank || []).filter((q) => q.f === floor);
    const TN = window.JK.data.TENSES;
    const resume = live && live.floor === floor && live.S.phase === 'q';
    const S = resume ? live.S : { qs: [], i: 0, lives: LIVES, score: 0, lost: 0, cur: null, phase: 'q' };
    live = { floor, S };

    function prep(q) {
      const c = { q, tries: 0, status: 'idle', picked: [], wrong: [] };
      if (q.type === 'fill' || q.type === 'guess') c.order = shuffle(q.opts.map((_, k) => k));
      if (q.type === 'order') { let w = shuffle(q.words.map((_, k) => k)); let guard = 0; while (w.every((x, k) => x === k) && guard++ < 10) w = shuffle(w); c.bank = w; }
      return c;
    }
    function start() {
      S.qs = shuffle(bank).slice(0, PER_FLOOR); S.i = 0; S.lives = LIVES; S.score = 0; S.lost = 0; S.phase = 'q';
      S.cur = prep(S.qs[0]);
      draw();
    }

    function floorChips() {
      const fl = t('floors'), done = api.cleared();
      return fl.map((f, i) => {
        const n = i + 1, cls = n === floor ? 'cur' : n <= done ? 'done' : 'todo';
        return '<li class="' + cls + '"' + (n === floor ? ' aria-current="step"' : '') + '>' + n + ' · ' + esc(f) + (n <= done && n !== floor ? ' ✓' : '') + '</li>';
      }).join('');
    }
    function candles() {
      return Array.from({ length: LIVES }, (_, k) => {
        const lit = k < S.lives;
        return '<svg width="18" height="34" viewBox="0 0 18 34" aria-hidden="true">' + (lit ? '<path class="flame" d="M9 2 Q15 9 9 14 Q3 9 9 2 Z" fill="#FFC857"/>' : '<path d="M9 6 q2 3 0 6" stroke="var(--t3)" stroke-width="1" fill="none" opacity=".6"/>') +
          '<rect x="4" y="15" width="10" height="18" rx="2" fill="' + (lit ? 'var(--text)' : 'var(--t3)') + '" opacity="' + (lit ? 1 : 0.45) + '"/></svg>';
      }).join('');
    }

    function doorHTML(open, shake) {
      const label = floor === 5 && S.i === PER_FLOOR - 1 ? t('beyondTop') : t('beyond');
      return '<div class="scene fl-' + floor + '">' + JK.scenes.backdrop(floor) + '<div class="door-frame' + (shake ? ' shake' : '') + '"><div class="door-arch">' +
        '<div class="door-light"><span>' + esc(label) + '</span></div>' +
        '<div class="door-leaf left' + (open ? ' open' : '') + '"><i></i><i></i></div>' +
        '<div class="door-leaf right' + (open ? ' open' : '') + '"><i></i><i></i></div>' +
        '<div class="door-lock' + (open ? ' spin' : '') + '"><span></span></div></div></div></div>';
    }

    function questionHTML() {
      const c = S.cur, q = c.q, lg = api.lang(), answered = c.status === 'open';
      let body = '';
      if (q.type === 'fill' || q.type === 'guess') {
        const sent = q.type === 'fill'
          ? esc(q.q).replace('___', '<span class="blank">' + (answered ? esc(q.opts[q.a]) : '&nbsp;') + '</span>')
          : '“' + esc(q.q) + '”';
        body = '<p class="qsent">' + sent + '</p><div class="opts">' + c.order.map((k) => {
          const isA = k === q.a, w = c.wrong.indexOf(k) >= 0;
          const label = q.type === 'guess' ? TN[q.opts[k]].name : q.opts[k];
          return '<button type="button" class="opt' + (w ? ' bad' : '') + (answered && isA ? ' good' : '') + '" data-k="' + k + '"' + (w || answered ? ' disabled' : '') + '>' + esc(label) + '</button>';
        }).join('') + '</div>';
      } else if (q.type === 'order') {
        const picked = c.picked.map((k, pos) => '<button type="button" class="chip on" data-pos="' + pos + '"' + (answered ? ' disabled' : '') + '>' + esc(q.words[k]) + '</button>').join('');
        const bankLeft = c.bank.filter((k) => c.picked.indexOf(k) < 0).map((k) => '<button type="button" class="chip" data-k="' + k + '">' + esc(q.words[k]) + '</button>').join('');
        body = '<div class="slot' + (answered ? ' solved' : '') + '" aria-label="' + esc(t('answerLabel')) + '">' + (picked || '<span class="slot-hint">' + esc(t('tapHint')) + '</span>') + '</div>' +
          '<div class="bank">' + bankLeft + '</div>' +
          (answered ? '' : '<div class="qbtns"><button type="button" class="btn-gold inline" id="tOpen">' + esc(t('openDoor')) + '</button><button type="button" class="btn-line inline" id="tReset">' + esc(t('reset')) + '</button></div>');
      } else {
        body = '<p class="qsent err">' + q.parts.map((p, k) => {
          const w = c.wrong.indexOf(k) >= 0, isA = answered && k === q.a;
          return '<button type="button" class="seg-btn' + (w ? ' bad' : '') + (isA ? ' good' : '') + '" data-k="' + k + '"' + (w || answered ? ' disabled' : '') + '><span>' + esc(p) + '</span><small>' + 'ABCD'[k] + '</small></button>';
        }).join(' ') + '</p>';
      }
      let fb = '';
      if (c.status === 'open') {
        fb = '<div class="fb ok"><b>' + esc(t('doorOpen')) + '</b> ' + esc(q.exp[lg]) + (q.type === 'error' ? ' <em>' + esc(t('correctFix').replace('{fix}', q.fix)) + '</em>' : '') + '</div>' +
          '<button type="button" class="btn-gold inline next" id="tNext">' + esc(S.i === PER_FLOOR - 1 ? t('finishFloor') : t('nextDoor')) + ' →</button>';
      } else if (c.status === 'wrong') {
        fb = '<div class="fb no"><b>' + esc(t('candleOut')) + '</b> ' + esc(t('tryAgain')) + '</div>';
      } else if (c.status === 'incomplete') {
        fb = '<div class="fb">' + esc(t('incomplete')) + '</div>';
      }
      const ask = { fill: 'qFill', guess: 'qGuess', order: 'qOrder', error: 'qError' }[q.type];
      return '<section class="panel qcard"><div class="qno">' + esc(t('door')).toUpperCase() + ' ' + (S.i + 1) + ' / ' + PER_FLOOR + '</div>' +
        '<h2>' + esc(t(ask)) + '</h2>' + body + '<div class="tfb" role="status" aria-live="polite">' + fb + '</div></section>';
    }

    function draw(opts) {
      opts = opts || {};
      const lv = t('floorLv')[floor - 1];
      let main;
      if (S.phase === 'q') {
        const c = S.cur, ti = TYPE_IDX[c.q.type];
        main = '<div class="tplay"><div class="tdoor"><div class="fl-name">' + esc(t('floors')[floor - 1]) + '</div><div class="fl-sub">' + esc(t('floorLabel')) + ' ' + floor + ' · ' + esc(t('door')) + ' ' + (S.i + 1) + ' / ' + PER_FLOOR + ' · ' + esc(lv) + '</div>' +
          doorHTML(c.status === 'open', opts.shake) + '</div>' +
          '<div class="tright"><div class="tchips">' + t('qtypes').map((x, k) => '<span class="tchip' + (k === ti ? ' on' : '') + '">' + esc(x) + '</span>').join('') + '</div>' +
          questionHTML() +
          '<section class="panel guide"><span class="g-orb" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="var(--hi)"/></svg></span><div><b>' + esc(t('guide')) + '</b>' +
            (c.hint ? '<p>' + esc(c.q.hint[api.lang()]) + '</p>' : '<button type="button" class="link-btn" id="tHint">' + esc(t('askHint')) + '</button>') + '</div></section>' +
          '</div></div>';
      } else if (S.phase === 'clear') {
        const perfect = S.lost === 0;
        const isTop = floor === 5;
        main = '<div class="tend panel">' + doorHTML(true) +
          '<div class="tend-text"><div class="eyebrow">' + esc(t('floors')[floor - 1]) + '</div><h2>' + esc(isTop ? t('finaleTitle') : t('clearedTitle').replace('{n}', floor)) + '</h2>' +
          '<p>' + esc(isTop ? t('finaleBody') : t('clearedBody')) + '</p>' + (perfect ? '<p class="perfect">' + esc(t('perfect')) + '</p>' : '') +
          '<div class="tend-score">' + esc(t('floorScore')) + ': <b>' + S.score + '</b></div><div class="qbtns">' +
          (isTop ? '<a class="btn-gold inline" href="#/">' + esc(t('toObs')) + '</a>' : '<a class="btn-gold inline" href="#/menara/' + (floor + 1) + '">' + esc(t('nextFloor').replace('{n}', floor + 1)) + '</a>') +
          '<a class="btn-line inline" href="#/menara">' + esc(t('backTower')) + '</a></div></div></div>';
      } else {
        main = '<div class="tend panel fail">' + doorHTML(false) +
          '<div class="tend-text"><div class="eyebrow">' + esc(t('floors')[floor - 1]) + '</div><h2>' + esc(t('failTitle')) + '</h2><p>' + esc(t('failBody')) + '</p>' +
          '<div class="qbtns"><button type="button" class="btn-gold inline" id="tRetry">' + esc(t('retry')) + '</button><a class="btn-line inline" href="#/menara">' + esc(t('backTower')) + '</a></div></div></div>';
      }
      view.innerHTML = '<div class="page quiz-play"><div class="tbar"><ol class="fchips" aria-label="' + esc(t('floorsLabel')) + '">' + floorChips() + '</ol>' +
        '<div class="tstats"><span class="tlabel">' + esc(t('candles')) + '</span><span class="candles" role="img" aria-label="' + esc(t('livesLabel')) + ': ' + S.lives + '">' + candles() + '</span>' +
        '<span class="tscore">' + esc(t('score')) + ' ' + S.score + '</span></div></div>' + main + '</div>';
      bind();
      if (opts.focus) { const el = view.querySelector(opts.focus); if (el) el.focus(); }
    }

    function correct() {
      const c = S.cur;
      c.status = 'open';
      S.score += c.tries === 0 ? 20 : 10;
      draw({ focus: '#tNext' });
    }
    function wrong(k) {
      const c = S.cur;
      c.tries++; S.lives--; S.lost++;
      if (k !== undefined) c.wrong.push(k);
      c.status = 'wrong'; c.hint = true;
      if (S.lives <= 0) { S.phase = 'fail'; draw({ focus: '#tRetry' }); return; }
      draw({ shake: true });
    }
    function next() {
      if (S.i >= PER_FLOOR - 1) {
        if (S.lost === 0) S.score += 30;
        if (floor > api.cleared()) api.setCleared(floor);
        if (S.score > api.best()) api.setBest(S.score);
        S.phase = 'clear'; draw({ focus: '.tend .btn-gold' });
        return;
      }
      S.i++; S.cur = prep(S.qs[S.i]); draw({ focus: '.qcard h2' });
    }

    function bind() {
      const c = S.cur;
      const on = (sel, fn) => view.querySelectorAll(sel).forEach((el) => el.addEventListener('click', fn));
      on('#tRetry', start);
      on('#tNext', next);
      on('#tHint', () => { c.hint = true; draw(); });
      if (S.phase !== 'q' || c.status === 'open') return;
      const q = c.q;
      on('.opt', (e) => { const k = +e.currentTarget.dataset.k; if (k === q.a) correct(); else wrong(k); });
      on('.seg-btn', (e) => { const k = +e.currentTarget.dataset.k; if (k === q.a) correct(); else wrong(k); });
      on('.bank .chip', (e) => { c.picked.push(+e.currentTarget.dataset.k); c.status = 'idle'; draw(); });
      on('.slot .chip', (e) => { c.picked.splice(+e.currentTarget.dataset.pos, 1); c.status = 'idle'; draw(); });
      on('#tReset', () => { c.picked = []; c.status = 'idle'; draw(); });
      on('#tOpen', () => {
        if (c.picked.length < q.words.length) { c.status = 'incomplete'; draw(); return; }
        if (c.picked.every((k, i) => k === i)) correct();
        else { c.picked = []; wrong(); }
      });
    }

    if (resume) draw(); else start();
  }

  window.JK = window.JK || {};
  window.JK.tower = { overview, play };
})();
