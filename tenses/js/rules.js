/* Detector cadangan berbasis aturan (tanpa AI).
   Dipakai kalau AI belum terpasang, kuota habis, atau sedang offline.
   JK.rules.analyze(kalimat) → bentuk hasil yang sama dengan AI:
   { is_sentence, corrected, clauses:[{text, verb, tense}], issues:[{wrong, right, kind, id, en}], summary:{id,en}, upgrade:null }
   Hanya mengenali pola tense dan kesalahan umum; tidak memahami makna. */
(function () {
  /* ---------- kosakata ---------- */
  // kata kerja tak beraturan: dasar, V2, V3
  const IRR = ('arise arose arisen|awake awoke awoken|bear bore born|beat beat beaten|become became become|begin began begun|bend bent bent|bet bet bet|bite bit bitten|bleed bled bled|blow blew blown|break broke broken|bring brought brought|build built built|burn burnt burnt|buy bought bought|catch caught caught|choose chose chosen|come came come|cost cost cost|cut cut cut|deal dealt dealt|dig dug dug|do did done|draw drew drawn|dream dreamt dreamt|drink drank drunk|drive drove driven|eat ate eaten|fall fell fallen|feed fed fed|feel felt felt|fight fought fought|find found found|fly flew flown|forget forgot forgotten|forgive forgave forgiven|freeze froze frozen|get got gotten|give gave given|go went gone|grow grew grown|hang hung hung|hear heard heard|hide hid hidden|hit hit hit|hold held held|hurt hurt hurt|keep kept kept|know knew known|lay laid laid|lead led led|leave left left|lend lent lent|let let let|lose lost lost|make made made|mean meant meant|meet met met|pay paid paid|put put put|quit quit quit|read read read|ride rode ridden|ring rang rung|rise rose risen|run ran run|say said said|see saw seen|seek sought sought|sell sold sold|send sent sent|set set set|shake shook shaken|shine shone shone|shoot shot shot|show showed shown|shut shut shut|sing sang sung|sink sank sunk|sit sat sat|sleep slept slept|speak spoke spoken|spend spent spent|stand stood stood|steal stole stolen|stick stuck stuck|strike struck struck|swear swore sworn|swim swam swum|take took taken|teach taught taught|tear tore torn|tell told told|think thought thought|throw threw thrown|understand understood understood|wake woke woken|wear wore worn|win won won|write wrote written')
    .split('|').map((x) => x.split(' '));
  const REG = ('visit study cook travel watch work play finish call help want need like love live move start stop try use wait walk talk ask answer arrive clean close open change enjoy happen hope join laugh listen look miss plan prepare rain snow stay turn decide explain improve practise practice discuss return order pass pick pull push remember share smile support graduate apply complete check climb cry dance hate marry offer receive reply save serve worry learn ' +
    'boil agree allow believe borrow carry collect cover create deliver develop die dress drop end enter expect fail fill fix follow hand hurry imagine include invite jump kiss land last lie listen manage mark matter mention notice paint park phone place post print promise protect provide reach realise realize relax rent repeat report rest review ring rush sail seem shop sign solve sound spell stare suggest surprise taste test thank touch train treat type vote wash wish wonder')
    .split(' ');

  const BASE = new Set(REG), PAST = {}, PP = {}, BASE_OF = {};
  IRR.forEach(([b, p, pp]) => { BASE.add(b); PAST[b] = p; PP[b] = pp; BASE_OF[p] = BASE_OF[p] || b; BASE_OF[pp] = BASE_OF[pp] || b; });
  const IRR_PAST = new Set(IRR.map((x) => x[1])), IRR_PP = new Set(IRR.map((x) => x[2]));
  IRR_PP.add('got');
  const NOT_ED = new Set('need feed seed bed red speed indeed shed bleed breed proceed succeed exceed weed wed bred fled sled shred hundred'.split(' '));
  const NOT_ING = new Set('thing something nothing anything everything morning evening ceiling king ring spring string wing during sibling darling pudding'.split(' '));
  const NOT_PROG = new Set('open clean close like live free own'.split(' '));

  const SUBJ = new Set(['i', 'you', 'we', 'they', 'he', 'she', 'it']);
  const SG3 = new Set(['he', 'she', 'it']);
  const MODAL = new Set(['can', 'could', 'should', 'must', 'may', 'might', 'shall']);
  const AUX = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'to', 'can', 'could', 'should', 'must', 'may', 'might', 'shall']);
  const DET = new Set(['a', 'an', 'the', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'some', 'any', 'no', 'every', 'each', 'of', 'in', 'on', 'at', 'for', 'with', 'from', 'by', 'about', 'into', 'to']);
  const ADV = new Set(['not', 'never', 'ever', 'just', 'already', 'always', 'still', 'really', 'recently', 'probably', 'definitely', 'also', 'finally', 'often', 'usually', 'sometimes', 'soon', 'certainly', 'all', 'only', 'even', 'rarely', 'seldom', 'hardly', 'nearly', 'almost', 'actually', 'suddenly', 'yet']);
  const CONJ = new Set(['when', 'while', 'because', 'before', 'after', 'if', 'until', 'unless', 'although', 'though', 'but', 'and', 'so', 'whereas', 'once', 'since']);
  const TIME_CONJ = new Set(['when', 'before', 'after', 'if', 'until', 'unless', 'once', 'as']);
  const DAYS = 'monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december'.split(' ');
  const PAST_MARK = new RegExp('\\b(yesterday|ago|last (night|week|month|year|summer|winter|weekend|time|' + DAYS.join('|') + ')|in (19|20)\\d\\d)\\b');
  const FUT_MARK = /\b(tomorrow|next (week|month|year|time|summer|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/;
  const SINCE_MARK = new RegExp('\\bsince (\\d|last|yesterday|this|' + DAYS.join('|') + '|i was|childhood|then)');

  /* ---------- bentuk kata kerja ---------- */
  const isIng = (w) => w.length > 4 && w.endsWith('ing') && !NOT_ING.has(w);
  const isEd = (w) => w.length > 3 && w.endsWith('ed') && !NOT_ED.has(w) && !BASE.has(w);
  const isPast = (w) => IRR_PAST.has(w) || isEd(w);
  const isPP = (w) => IRR_PP.has(w) || isEd(w);
  const pastOnly = (w) => (IRR_PAST.has(w) && !BASE.has(w)) || isEd(w);
  function baseOfS(w) {
    if (w.endsWith('ies') && BASE.has(w.slice(0, -3) + 'y')) return w.slice(0, -3) + 'y';
    if (w.endsWith('es') && BASE.has(w.slice(0, -2))) return w.slice(0, -2);
    if (w.endsWith('s') && BASE.has(w.slice(0, -1))) return w.slice(0, -1);
    if (w === 'has') return 'have';
    return null;
  }
  const isS = (w) => !BASE.has(w) && !!baseOfS(w);
  function thirdS(b) {
    if (b === 'have') return 'has';
    if (b === 'do' || b === 'go') return b + 'es';
    if (/(s|x|z|ch|sh)$/.test(b)) return b + 'es';
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ies';
    return b + 's';
  }
  function baseOf(w) {
    if (BASE.has(w)) return w;
    if (BASE_OF[w]) return BASE_OF[w];
    const s = baseOfS(w); if (s) return s;
    if (isEd(w)) {
      const stem = w.slice(0, -2);
      if (BASE.has(stem)) return stem;
      if (BASE.has(stem + 'e')) return stem + 'e';
      if (w.endsWith('ied') && BASE.has(w.slice(0, -3) + 'y')) return w.slice(0, -3) + 'y';
      if (/(.)\1$/.test(stem) && BASE.has(stem.slice(0, -1))) return stem.slice(0, -1);
      return stem;
    }
    return w;
  }
  function regPast(b) {
    if (b.endsWith('e')) return b + 'd';
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ied';
    if (/^(stop|plan|drop|shop|travel|prefer|admit|hug|rob|beg|jog)$/.test(b)) return b + b.slice(-1) + 'ed';
    return b + 'ed';
  }
  const pastOf = (b) => PAST[b] || regPast(b);
  const ppOf = (b) => PP[b] || regPast(b);

  /* ---------- token ---------- */
  function tokenize(text) {
    const out = [];
    const re = /[A-Za-z]+(?:'[A-Za-z]+)?|\d+|[.,;:!?]/g;
    let m;
    while ((m = re.exec(text))) {
      const o = m[0], s = m.index, e = s + o.length, lo = o.toLowerCase();
      const push = (w, part) => out.push({ w, o, s, e, part });
      if (/[.,;:!?]/.test(o)) { out.push({ w: o, o, s, e, part: null, punct: true }); continue; }
      if (lo === "won't") { push('will', 0); push('not', 1); continue; }
      if (lo === "can't") { push('can', 0); push('not', 1); continue; }
      if (lo === "shan't") { push('shall', 0); push('not', 1); continue; }
      if (lo.endsWith("n't")) { push(lo.slice(0, -3), 0); push('not', 1); continue; }
      const c = lo.match(/^([a-z]+)'(m|re|ve|ll|s|d)$/);
      if (c) {
        push(c[1], 0);
        const map = { m: 'am', re: 'are', ve: 'have', ll: 'will' };
        if (map[c[2]]) push(map[c[2]], 1);
        else push("'" + c[2], 1); // 's dan 'd diputuskan setelah melihat kata berikutnya
        continue;
      }
      push(lo, null);
    }
    // putuskan 's (is/has) dan 'd (would/had)
    for (let i = 0; i < out.length; i++) {
      const t = out[i];
      if (t.w !== "'s" && t.w !== "'d") continue;
      let j = i + 1; while (out[j] && ADV.has(out[j].w)) j++;
      const n = out[j] ? out[j].w : '';
      if (t.w === "'s") t.w = (n === 'been' || (isPP(n) && !isIng(n) && !BASE.has(n))) ? 'has' : 'is';
      else t.w = (n === 'been' || (isPP(n) && !BASE.has(n))) ? 'had' : 'would';
    }
    return out;
  }

  /* ---------- klausa ---------- */
  function clausesOf(toks) {
    const groups = [];
    let cur = [];
    toks.forEach((t, i) => {
      const nx = toks[i + 1] ? toks[i + 1].w : '';
      const sinceIsPrep = t.w === 'since' && /^(\d+|last|yesterday|this|childhood|then)$/.test(nx) || (t.w === 'since' && DAYS.indexOf(nx) >= 0);
      const asSoon = t.w === 'as' && nx === 'soon';
      const byTime = t.w === 'by' && nx === 'the' && toks[i + 2] && toks[i + 2].w === 'time';
      if (t.punct) { if (cur.length) groups.push(cur); cur = []; return; }
      if (((CONJ.has(t.w) && !sinceIsPrep) || asSoon || byTime) && cur.length) { groups.push(cur); cur = []; }
      cur.push(t);
    });
    if (cur.length) groups.push(cur);
    // pecah juga klausa tanpa kata sambung: "He said | he would call"
    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi];
      for (let i = 2; i < g.length; i++) {
        const v2 = SUBJ.has(g[i].w) && !DET.has(g[i - 1].w) && !AUX.has(g[i - 1].w) && verbOf(g.slice(0, i)) && verbOf(g.slice(i));
        if (v2 && !v2.weak) { groups.splice(gi, 1, g.slice(0, i), g.slice(i)); break; }
      }
    }
    // gabungkan potongan tanpa kata kerja
    const res = [];
    groups.forEach((g) => {
      const v = verbOf(g);
      if (v || !res.length) res.push({ toks: g, v });
      else res[res.length - 1].toks = res[res.length - 1].toks.concat(g);
    });
    if (res.length > 1 && !res[0].v) { res[1].toks = res[0].toks.concat(res[1].toks); res.shift(); }
    return res;
  }

  function nextI(g, i) { let j = i + 1; while (g[j] && ADV.has(g[j].w)) j++; return j; }

  /* temukan kelompok kata kerja pertama di klausa → { tense, a, b } (indeks token awal & akhir) */
  function verbOf(g) {
    for (let i = 0; i < g.length; i++) {
      const w = g[i].w, j = nextI(g, i), n = g[j] ? g[j].w : '';
      const k = nextI(g, j), n2 = g[k] ? g[k].w : '';
      const m = nextI(g, k), n3 = g[m] ? g[m].w : '';
      const prev = i > 0 ? g[i - 1].w : '';
      if (w === 'would' || w === 'will') {
        const P = w === 'would' ? 'past-future' : 'future';
        const S = w === 'would' ? 'past-future' : 'simple-future';
        if (n === 'have' && n2 === 'been' && isIng(n3)) return { tense: P + '-perfect-continuous', a: i, b: m };
        if (n === 'have' && isPP(n2)) return { tense: P + '-perfect', a: i, b: k };
        if (n === 'be' && isIng(n2)) return { tense: P + '-continuous', a: i, b: k };
        if (n) return { tense: S, a: i, b: j };
      }
      if (MODAL.has(w) && n && !SUBJ.has(n)) return { tense: 'modal', a: i, b: j };
      if (MODAL.has(w) && prev !== 'to') return { tense: 'modal', a: i, b: i };
      if (/^(am|is|are)$/.test(w) && n === 'going' && n2 === 'to' && g[m]) return { tense: 'simple-future', a: i, b: m };
      if (w === 'had') {
        if (n === 'been' && isIng(n2)) return { tense: 'past-perfect-continuous', a: i, b: k };
        if (n === 'been' || isPP(n) || pastOnly(n)) return { tense: 'past-perfect', a: i, b: j };
        if (prev !== 'to') return { tense: 'simple-past', a: i, b: i };
      }
      if (w === 'have' || w === 'has') {
        if (n === 'been' && isIng(n2)) return { tense: 'present-perfect-continuous', a: i, b: k };
        if (n === 'been' || (isPP(n) && !BASE.has(n)) || pastOnly(n)) return { tense: 'present-perfect', a: i, b: j };
        if (!AUX.has(prev)) return { tense: 'simple-present', a: i, b: i };
      }
      if (w === 'was' || w === 'were') return isIng(n) ? { tense: 'past-continuous', a: i, b: j } : { tense: 'simple-past', a: i, b: isPP(n) && !BASE.has(n) ? j : i };
      if (/^(am|is|are)$/.test(w)) return isIng(n) ? { tense: 'present-continuous', a: i, b: j } : { tense: 'simple-present', a: i, b: isPP(n) && !BASE.has(n) ? j : i };
      if (w === 'did' || w === 'do' || w === 'does') {
        const T = w === 'did' ? 'simple-past' : 'simple-present';
        if (n && !SUBJ.has(n) && (BASE.has(n) || isS(n) || pastOnly(n))) return { tense: T, a: i, b: j };
        if (SUBJ.has(n) && g[k] && (BASE.has(n2) || pastOnly(n2) || isS(n2))) return { tense: T, a: i, b: k };
        return { tense: T, a: i, b: i };
      }
      if (AUX.has(prev) || DET.has(prev) || CONJ.has(w) || SUBJ.has(w) || DET.has(w)) continue;
      const afterSubj = SUBJ.has(prev) || (i > 0 && !DET.has(prev) && !ADV.has(prev) && i >= 1);
      if (isPast(w) && !BASE.has(w) && afterSubj) return { tense: 'simple-past', a: i, b: i };
      if ((BASE.has(w) || isS(w)) && (SUBJ.has(prev) || (i > 0 && afterSubj && (isS(w) || ADV.has(g[i - 1].w))))) return { tense: 'simple-present', a: i, b: i };
      if (SUBJ.has(prev) && prev !== 'you' && prev !== 'it' && !isIng(w) && !/ly$/.test(w) && /^[a-z]{3,}$/.test(w)) return { tense: isEd(w) ? 'simple-past' : 'simple-present', a: i, b: i, weak: true };
    }
    return null;
  }

  /* ---------- pesan ---------- */
  const MSG = {
    didBase: ['Setelah {aux}, kata kerja kembali ke bentuk dasar (V1): "{r}".', 'After "{aux}", the verb goes back to its base form (V1): "{r}".'],
    agree: ['Subjek "{s}" berpasangan dengan "{r}", bukan "{w}".', 'The subject "{s}" goes with "{r}", not "{w}".'],
    needS: ['Subjek he/she/it di Simple Present: kata kerjanya perlu -s/-es ("{r}").', 'With he/she/it in the Simple Present, the verb needs -s/-es ("{r}").'],
    noS: ['Subjek I/you/we/they: kata kerjanya tanpa -s ("{r}").', 'With I/you/we/they, the verb has no -s ("{r}").'],
    needPP: ['Setelah have/has/had, pakai V3: "{r}", bukan V2 "{w}".', 'After have/has/had, use the V3 form "{r}", not the V2 "{w}".'],
    needIng: ['Setelah am/is/are/was/were, kata kerja aktif perlu bentuk -ing: "{r}".', 'After am/is/are/was/were, an active verb needs the -ing form: "{r}".'],
    modalBase: ['Setelah "{aux}", kata kerja selalu V1: "{r}".', 'After "{aux}", the verb is always in the base form: "{r}".'],
    ppPast: ['Ada penanda waktu lampau yang jelas ({m}), jadi pakai Simple Past: "{r}". Present Perfect tidak dipakai dengan waktu lampau yang spesifik.', 'There is a specific past time marker ({m}), so use the Simple Past: "{r}". The Present Perfect is not used with a finished, specific time.'],
    presPast: ['Penanda waktu "{m}" menunjukkan masa lalu, jadi kata kerjanya perlu Simple Past: "{r}".', 'The time marker "{m}" points to the past, so the verb needs the Simple Past: "{r}".'],
    pastFut: ['Penanda waktu "{m}" menunjukkan masa depan, jadi pakai "{r}".', 'The time marker "{m}" points to the future, so use "{r}".'],
    since: ['"Since + titik waktu" menghubungkan masa lalu sampai sekarang, jadi pakai Present Perfect: "{r}".', '"Since + a point in time" links the past to now, so use the Present Perfect: "{r}".'],
    timeClause: ['Di klausa waktu/syarat ({c} …), masa depan ditulis dengan Simple Present: "{r}", bukan "will".', 'In a time or condition clause ({c} …), the future is written in the Simple Present: "{r}", not "will".'],
    pastPerf: ['Ada dua kejadian di masa lalu. Yang terjadi lebih dulu memakai Past Perfect: "{r}".', 'There are two past events. The one that happened first takes the Past Perfect: "{r}".'],
    cond2: ['Kalimat pengandaian dengan "if" + Simple Past berpasangan dengan "would", bukan "will": "{r}".', 'A conditional with "if" + Simple Past pairs with "would", not "will": "{r}".'],
    cond3: ['"If" + Past Perfect (pengandaian masa lalu) berpasangan dengan "would have" + V3: "{r}".', '"If" + Past Perfect (an imagined past) pairs with "would have" + V3: "{r}".'],
    okSum: ['Polanya tampak tepat. Detector cadangan hanya memeriksa pola tense, bukan makna kalimat.', 'The patterns look right. The backup detector only checks tense patterns, not meaning.'],
    badSum: ['Detector cadangan menemukan {n} pola yang perlu diperbaiki. Ia hanya memeriksa pola tense, bukan makna kalimat.', 'The backup detector found {n} pattern(s) to fix. It only checks tense patterns, not meaning.'],
    none: ['Detector cadangan tidak menemukan kata kerja yang dikenalinya. Coba kalimat lengkap dengan subjek dan kata kerja.', 'The backup detector could not find a verb it recognises. Try a full sentence with a subject and a verb.']
  };
  const fill = (k, r) => [0, 1].map((li) => Object.keys(r).reduce((m, x) => m.split('{' + x + '}').join(r[x]), MSG[k][li]));

  /* ---------- analisis ---------- */
  function analyze(input) {
    const text = String(input || '').replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').trim();
    const toks = tokenize(text);
    const cls = clausesOf(toks);
    const fixes = []; // { s, e, from: [[tokenIndexInToks, newWord]], kind, msg }
    const used = new Set();

    // helper: buat perbaikan berdasarkan token (hanya token utuh, bukan kontraksi)
    function fix(list, kind, key, rep) {
      const tk = list.map((x) => x[0]);
      if (tk.some((t) => t.part !== null || used.has(t))) return;
      tk.forEach((t) => used.add(t));
      const s = Math.min.apply(null, tk.map((t) => t.s)), e = Math.max.apply(null, tk.map((t) => t.e));
      const span = text.slice(s, e);
      let right = span;
      list.slice().sort((a, b) => b[0].s - a[0].s).forEach(([t, nw]) => {
        const keep = /^[A-Z]/.test(t.o) ? nw.charAt(0).toUpperCase() + nw.slice(1) : nw;
        right = right.slice(0, t.s - s) + keep + right.slice(t.e - s);
      });
      right = right.replace(/\s{2,}/g, ' ').trim();
      if (/^[A-Z]/.test(span) && !/^[A-Z]/.test(right)) right = right.charAt(0).toUpperCase() + right.slice(1);
      const [id, en] = fill(key, Object.assign({ w: span, r: right }, rep || {}));
      fixes.push({ s, e, wrong: span, right, kind, id, en });
    }

    // 1) kesalahan bentuk & kecocokan subjek (per token)
    toks.forEach((t, i) => {
      const j = (() => { let x = i + 1; while (toks[x] && ADV.has(toks[x].w)) x++; return x; })();
      const n = toks[j], prev = toks[i - 1] ? toks[i - 1].w : '';
      const prevAux = AUX.has(prev) || MODAL.has(prev);
      if (!n || n.punct) return;
      if (/^(did|does|do)$/.test(t.w) && (pastOnly(n.w) || isS(n.w)) && !SUBJ.has(n.w)) fix([[n, baseOf(n.w)]], 'verb_form', 'didBase', { aux: t.w });
      if ((MODAL.has(t.w) || t.w === 'will' || t.w === 'would') && (pastOnly(n.w) || isS(n.w)) && !SUBJ.has(n.w) && !IRR_PP.has(n.w) || ((t.w === 'will' || t.w === 'would' || MODAL.has(t.w)) && IRR_PAST.has(n.w) && !BASE.has(n.w))) fix([[n, baseOf(n.w)]], 'verb_form', 'modalBase', { aux: t.w });
      if (/^(have|has|had)$/.test(t.w) && IRR_PAST.has(n.w) && !IRR_PP.has(n.w)) fix([[n, PP[BASE_OF[n.w]]]], 'verb_form', 'needPP');
      if (/^(am|is|are|was|were)$/.test(t.w) && BASE.has(n.w) && !NOT_PROG.has(n.w) && !IRR_PP.has(n.w) && n.part === null && !(toks[j + 1] && toks[j + 1].w === 'to' && n.w === 'going')) {
        const b = n.w, ing = b.endsWith('ie') ? b.slice(0, -2) + 'ying' : b.endsWith('e') && b !== 'be' && b !== 'see' ? b.slice(0, -1) + 'ing' : /^(stop|plan|run|swim|sit|get|put|cut|begin|shop|win)$/.test(b) ? b + b.slice(-1) + 'ing' : b + 'ing';
        fix([[n, ing]], 'verb_form', 'needIng');
      }
      if (!SUBJ.has(t.w) || /^(did|does|do|will|would|can|could|should|must|may|might|let)$/.test(prev) || prevAux) return;
      const ifBefore = prev === 'if' || prev === 'wish';
      const sg = SG3.has(t.w), I = t.w === 'i';
      const agree = (r) => fix([[n, r]], 'agreement', 'agree', { s: t.o });
      if (n.w === 'have' && sg) return agree('has');
      if (n.w === 'has' && !sg) return agree('have');
      if (n.w === 'do' && sg) return agree('does');
      if (n.w === 'does' && !sg) return agree('do');
      if (/^(am|are)$/.test(n.w) && sg) return agree('is');
      if (n.w === 'were' && (sg || I) && !ifBefore) return agree('was');
      if (/^(is|are)$/.test(n.w) && I) return agree('am');
      if (/^(is|am)$/.test(n.w) && !sg && !I) return agree('are');
      if (n.w === 'was' && !sg && !I) return agree('were');
      if (sg && BASE.has(n.w) && !IRR_PAST.has(n.w) && j === i + 1) return fix([[n, thirdS(n.w)]], 'agreement', 'needS');
      if (!sg && isS(n.w) && j === i + 1) return fix([[n, baseOfS(n.w)]], 'agreement', 'noS');
    });

    // 2) kesalahan tense dari konteks (per klausa)
    const info = cls.map((c) => {
      const lo = ' ' + c.toks.map((t) => t.w).join(' ') + ' ';
      const first = c.toks[0] ? c.toks[0].w : '';
      const subj = c.v ? (c.toks.slice(0, c.v.a).reverse().find((t) => SUBJ.has(t.w)) || null) : null;
      return Object.assign(c, { lo, first, subj });
    });
    const has = (tense) => info.some((c) => c.v && c.v.tense === tense);
    info.forEach((c) => {
      if (!c.v) return;
      const g = c.toks, a = g[c.v.a], b = g[c.v.b], T = c.v.tense, lo = c.lo;
      const sg = c.subj ? SG3.has(c.subj.w) : true;
      const pm = lo.match(PAST_MARK), fm = lo.match(FUT_MARK);
      if (T === 'present-perfect' && pm && b !== a) {
        fix([[a, ''], [b, pastOf(baseOf(b.w))]], 'tense', 'ppPast', { m: pm[0] });
      } else if ((T === 'simple-present' || T === 'present-continuous') && pm && a === b && (BASE.has(a.w) || isS(a.w))) {
        fix([[a, pastOf(baseOf(a.w))]], 'tense', 'presPast', { m: pm[0] });
      } else if (T === 'simple-past' && fm && a === b && isPast(a.w)) {
        fix([[a, 'will ' + baseOf(a.w)]], 'tense', 'pastFut', { m: fm[0], r: 'will ' + baseOf(a.w) });
      } else if (T === 'simple-past' && SINCE_MARK.test(lo) && a === b && isPast(a.w) && !/^(was|were)$/.test(a.w)) {
        fix([[a, (sg ? 'has ' : 'have ') + ppOf(baseOf(a.w))]], 'tense', 'since');
      } else if (T === 'simple-future' && a.w === 'will' && (TIME_CONJ.has(c.first) || c.first === 'by') && b !== a && !/\bif you will\b/.test(lo)) {
        const v = baseOf(b.w);
        fix([[a, ''], [b, sg ? thirdS(v) : v]], 'tense', 'timeClause', { c: c.toks[0].o });
      }
    });
    // urutan dua kejadian lampau & pengandaian
    const ifc = info.find((c) => c.first === 'if' && c.v);
    info.forEach((c) => {
      if (!c.v || c === ifc) return;
      const g = c.toks, a = g[c.v.a], T = c.v.tense;
      if (T === 'present-perfect' && has('simple-past') && !c.lo.match(PAST_MARK) && /^(has|have)$/.test(a.w)) fix([[a, 'had']], 'tense', 'pastPerf');
      if (ifc && ifc.v.tense === 'simple-past' && T === 'simple-future' && a.w === 'will') fix([[a, 'would']], 'tense', 'cond2');
      if (ifc && ifc.v.tense === 'past-perfect' && (T === 'past-future' || T === 'simple-future')) {
        const b = g[c.v.b];
        if (b !== a) fix([[a, 'would have'], [b, ppOf(baseOf(b.w))]], 'tense', 'cond3');
      }
    });

    // rakit kalimat perbaikan
    let corrected = text;
    fixes.slice().sort((x, y) => y.s - x.s).forEach((f) => { corrected = corrected.slice(0, f.s) + f.right + corrected.slice(f.e); });
    corrected = corrected.replace(/\s{2,}/g, ' ');
    const cTok = tokenize(corrected), cCls = clausesOf(cTok);
    const clauses = cCls.filter((c) => c.v).map((c) => {
      const s = c.toks[0].s, e = c.toks[c.toks.length - 1].e;
      const vs = c.toks[c.v.a].s, ve = c.toks[c.v.b].e;
      return { text: corrected.slice(s, e), verb: corrected.slice(vs, ve), tense: c.v.tense };
    });
    const ok = !fixes.length;
    const sum = !clauses.length ? fill('none', {}) : ok ? fill('okSum', {}) : fill('badSum', { n: fixes.length });
    return {
      is_sentence: clauses.length > 0,
      corrected,
      clauses,
      issues: fixes.map((f) => ({ wrong: f.wrong, right: f.right, kind: f.kind, id: f.id, en: f.en })),
      summary: { id: sum[0], en: sum[1] },
      upgrade: null
    };
  }

  const api = { analyze };
  if (typeof window !== 'undefined') { window.JK = window.JK || {}; window.JK.rules = api; }
  if (typeof module !== 'undefined') module.exports = api;
})();
