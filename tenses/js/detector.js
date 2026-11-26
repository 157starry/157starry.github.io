/* Grammar Detector: halaman #/detector.
   Kirim kalimat ke Edge Function Supabase (AI Claude Haiku). Kalau gagal / kuota habis,
   otomatis memakai detector cadangan berbasis aturan (rules.js).
   JK.detector.mount(view, api)   api: { t, esc, lang(), data } */
(function () {
  const ENDPOINT = 'https://ulnmlwvehuofukpmsgyl.supabase.co/functions/v1/grammar-detector';
  const PUBLIC_KEY = 'sb_publishable_A2yYd8nRwg33aTVIXoMmXw_dQ-hszir'; // kunci publik Starry Lab (aman di browser)
  const MAX = 300, PER_DAY = 20, TIMEOUT = 25000;
  const EXAMPLES = [
    'When I arrived, she has already left.',
    'He have been studying English since two years.',
    'If it will rain tomorrow, we would stay at home.',
    'By next June, I will have finished my thesis.'
  ];

  // bertahan saat ganti bahasa / mode / pindah halaman
  const S = { text: '', busy: false, res: null, src: null, why: null, asked: '' };

  let repaint = null; // fungsi paint milik halaman yang sedang tampil
  const fill = (s, rep) => Object.keys(rep).reduce((m, k) => m.split('{' + k + '}').join(rep[k]), s);

  /* sorot potongan teks (tanpa tumpang tindih), aman dari HTML */
  function marks(text, items, esc) {
    const lo = text.toLowerCase(), ranges = [];
    items.forEach((it) => {
      const p = (it.phrase || '').trim();
      if (!p) return;
      let from = 0, at;
      while ((at = lo.indexOf(p.toLowerCase(), from)) >= 0) {
        const end = at + p.length;
        if (!ranges.some((r) => at < r.e && end > r.s)) { ranges.push({ s: at, e: end, open: it.open, close: it.close || '</mark>' }); break; }
        from = at + 1;
      }
    });
    ranges.sort((a, b) => a.s - b.s);
    let out = '', pos = 0;
    ranges.forEach((r) => { out += esc(text.slice(pos, r.s)) + r.open + esc(text.slice(r.s, r.e)) + r.close; pos = r.e; });
    return out + esc(text.slice(pos));
  }

  function planetOf(data, tense) { return data.PLANETS.find((p) => p.tenses.indexOf(tense) >= 0) || null; }
  function colorOf(data, tense) { const p = planetOf(data, tense); return p ? data.DOT[p.id] : 'var(--t3)'; }

  /* ---------- tampilan ---------- */
  function html(api) {
    const { t, esc } = api;
    return '<div class="page detector">' +
      '<section class="det-side">' +
        '<div class="eyebrow">' + esc(t('detEyebrow')) + '</div>' +
        '<h1>' + esc(t('detTitle')) + '</h1>' +
        '<p class="lede">' + esc(t('detLede')) + '</p>' +
        '<form class="panel det-form" id="detForm" novalidate>' +
          '<label class="det-label" for="detIn">' + esc(t('detLabel')) + '</label>' +
          '<textarea id="detIn" rows="4" maxlength="' + MAX + '" placeholder="' + esc(t('detPh')) + '" spellcheck="false" autocomplete="off">' + esc(S.text) + '</textarea>' +
          '<div class="det-row"><span class="det-count" id="detCount" aria-live="polite"></span><span class="det-note">' + esc(fill(t('detRules'), { n: MAX, d: PER_DAY })) + '</span></div>' +
          '<p class="det-err" id="detErr" role="alert" hidden></p>' +
          '<button type="submit" class="btn-gold" id="detBtn">' + esc(t('detCheck')) + '</button>' +
          '<div class="det-try"><span>' + esc(t('detTry')) + '</span>' +
            EXAMPLES.map((e, i) => '<button type="button" class="det-ex" data-ex="' + i + '">' + esc(e) + '</button>').join('') + '</div>' +
        '</form>' +
      '</section>' +
      '<section class="det-main" id="detOut" tabindex="-1" aria-live="polite">' + resultHTML(api) + '</section>' +
    '</div>';
  }

  function resultHTML(api) {
    const { t, esc, data } = api, lg = api.lang();
    if (S.busy) {
      return '<div class="panel det-empty busy"><div class="lens spin" aria-hidden="true"><i></i></div><h2>' + esc(t('detChecking')) + '</h2></div>';
    }
    const r = S.res;
    if (!r) {
      return '<div class="panel det-empty"><div class="lens" aria-hidden="true"><i></i></div><h2>' + esc(t('detEmptyT')) + '</h2><p>' + esc(t('detEmptyB')) + '</p></div>';
    }
    const src = '<p class="det-src' + (S.src === 'rules' ? ' rules' : '') + '">' +
      (S.src === 'rules' && S.why ? esc(fill(t('detWhy')[S.why] || t('detWhy').error, { n: PER_DAY })) + ' ' : '') +
      esc(S.src === 'ai' ? t('detSrcAI') : t('detSrcRules')) + '</p>';
    if (!r.is_sentence) {
      return '<div class="panel det-card"><div class="det-status no"><b>' + esc(t('detNotSentence')) + '</b></div>' +
        (r.summary && r.summary[lg] ? '<p class="det-sum">' + esc(r.summary[lg]) + '</p>' : '') + '</div>' + src;
    }
    const n = r.issues.length;
    // status + dua kalimat
    let out = '<div class="panel det-card">' +
      '<div class="det-status ' + (n ? 'no' : 'ok') + '"><span class="dot"></span><b>' + esc(n ? fill(t('detBad'), { n }) : t('detOk')) + '</b></div>';
    if (n) {
      out += '<div class="det-pair"><div><div class="det-k">' + esc(t('detYours')) + '</div><p class="det-sent orig">' +
        marks(S.asked, r.issues.map((i) => ({ phrase: i.wrong, open: '<mark class="bad">' })), esc) + '</p></div>' +
        '<div><div class="det-k">' + esc(t('detFixed')) + '</div><p class="det-sent">' + clauseLine(api, r) + '</p></div></div>';
    } else {
      out += '<p class="det-sent big">' + clauseLine(api, r) + '</p>';
    }
    out += '</div>';
    // peta klausa
    if (r.clauses.length) {
      out += '<div class="panel det-card"><div class="det-head"><h2>' + esc(t('detClauses')) + '</h2><span>' + esc(t('detClausesHint')) + '</span></div><div class="cl-list">' +
        r.clauses.map((c) => {
          const T = data.TENSES[c.tense], p = planetOf(data, c.tense);
          const name = T ? T.name : c.tense === 'modal' ? t('detModal') : t('detOther');
          const meta = T ? '<b>' + esc(name) + '</b><span>' + esc(p.name[lg]) + '</span><code>' + esc(T.f) + '</code>' : '<b>' + esc(name) + '</b>';
          const body = '<span class="cl-dot"></span><span class="cl-body"><span class="cl-text">' + marks(c.text, [{ phrase: c.verb, open: '<mark>' }], esc) + '</span><span class="cl-meta">' + meta + '</span></span>';
          return T ? '<a class="cl-row" style="--pc:' + colorOf(data, c.tense) + '" href="#/materi/' + c.tense + '">' + body + '<span class="cl-go" aria-hidden="true">→</span></a>'
            : '<div class="cl-row" style="--pc:var(--t3)">' + body + '</div>';
        }).join('') + '</div></div>';
    }
    // penjelasan kesalahan
    if (n) {
      const K = t('kinds');
      out += '<div class="panel det-card"><div class="det-head"><h2>' + esc(t('detIssues')) + '</h2></div><ol class="iss-list">' +
        r.issues.map((i) => '<li><div class="iss-fix"><s>' + esc(i.wrong) + '</s><span aria-hidden="true">→</span><b>' + esc(i.right) + '</b><em>' + esc(K[i.kind] || K.other) + '</em></div>' +
          '<p>' + esc(i[lg] || i.en || i.id) + '</p></li>').join('') + '</ol></div>';
    }
    // catatan & naik level
    const sum = r.summary && r.summary[lg];
    if (sum || r.upgrade) {
      out += '<div class="det-duo">' +
        (sum ? '<div class="panel det-card compact"><div class="det-k">' + esc(t('detSummary')) + '</div><p class="det-sum">' + esc(sum) + '</p></div>' : '') +
        (r.upgrade && r.upgrade.sentence ? '<div class="panel det-card compact up"><div class="det-k">' + esc(t('detUpgrade')) + '</div><p class="det-sent">' + esc(r.upgrade.sentence) + '</p><p class="det-sum">' + esc(r.upgrade[lg] || '') + '</p></div>' : '') +
        '</div>';
    }
    return out + src;
  }

  /* kalimat perbaikan dengan garis bawah warna planet per klausa */
  function clauseLine(api, r) {
    const { esc, data } = api, text = r.corrected || S.asked, lo = text.toLowerCase();
    let out = '', pos = 0;
    r.clauses.forEach((c) => {
      const at = c.text ? lo.indexOf(c.text.toLowerCase(), pos) : -1;
      if (at < 0) return;
      out += esc(text.slice(pos, at)) + '<span class="cl-u" style="--pc:' + colorOf(data, c.tense) + '">' + esc(text.slice(at, at + c.text.length)) + '</span>';
      pos = at + c.text.length;
    });
    return out + esc(text.slice(pos));
  }

  /* ---------- logika ---------- */
  async function askAI(text) {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: PUBLIC_KEY },
        body: JSON.stringify({ text }),
        signal: ctrl.signal
      });
      let body = null;
      try { body = await res.json(); } catch (e) { /* bukan JSON */ }
      if (res.ok && body && body.ok && body.result) return { ok: true, result: body.result };
      const code = body && body.error;
      return { ok: false, why: code === 'limit_visitor' || code === 'limit_day' ? code : res.status >= 500 || res.status === 404 ? 'offline' : 'error' };
    } catch (e) {
      return { ok: false, why: 'offline' };
    } finally { clearTimeout(timer); }
  }

  function mount(view, api) {
    view.innerHTML = html(api);
    const $ = (s) => view.querySelector(s);
    const ta = $('#detIn'), count = $('#detCount'), err = $('#detErr'), btn = $('#detBtn');
    const upd = () => { count.textContent = ta.value.length + ' / ' + MAX; };
    upd();
    const showErr = (m) => { err.textContent = m; err.hidden = !m; };
    const paint = () => {
      const out = $('#detOut'); if (!out || !document.body.contains(out)) return;
      out.innerHTML = resultHTML(api);
      btn.disabled = S.busy; btn.textContent = api.t(S.busy ? 'detChecking' : 'detCheck');
    };
    btn.disabled = S.busy;
    repaint = paint;
    ta.addEventListener('input', () => { S.text = ta.value; upd(); showErr(''); });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#detForm').requestSubmit(); } });
    view.querySelectorAll('.det-ex').forEach((b) => b.addEventListener('click', () => {
      ta.value = S.text = EXAMPLES[+b.dataset.ex]; upd(); showErr(''); ta.focus();
    }));
    $('#detForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (S.busy) return;
      const text = ta.value.replace(/\s+/g, ' ').trim();
      if (!text) return showErr(api.t('detEmpty'));
      if (text.length > MAX) return showErr(fill(api.t('detTooLong'), { n: MAX }));
      S.busy = true; S.asked = text; paint();
      const r = await askAI(text);
      if (r.ok) { S.res = r.result; S.src = 'ai'; S.why = null; }
      else { S.res = JK.rules.analyze(text); S.src = 'rules'; S.why = r.why; }
      S.busy = false;
      if (repaint) repaint();
      const o = document.getElementById('detOut'); if (o) o.focus({ preventScroll: true });
    });
  }

  window.JK = window.JK || {};
  window.JK.detector = { mount };
})();
