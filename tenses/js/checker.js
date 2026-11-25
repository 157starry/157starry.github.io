/* Pengecek kalimat mini kuis (tanpa AI).
   Mengecek: kata kunci ada, bentuk kata kerja benar, auxiliary benar, kecocokan subjek.
   check(kalimat, tenseId, verb, lang, markers) → { ok, msg } */
(function () {
  // bentuk kata kerja: [V1, V1+s, V2, V3, V-ing]; '|' = ejaan alternatif
  const V = {
    visit: ['visit', 'visits', 'visited', 'visited', 'visiting'],
    study: ['study', 'studies', 'studied', 'studied', 'studying'],
    cook: ['cook', 'cooks', 'cooked', 'cooked', 'cooking'],
    travel: ['travel', 'travels', 'travelled|traveled', 'travelled|traveled', 'travelling|traveling'],
    watch: ['watch', 'watches', 'watched', 'watched', 'watching'],
    work: ['work', 'works', 'worked', 'worked', 'working'],
    play: ['play', 'plays', 'played', 'played', 'playing'],
    read: ['read', 'reads', 'read', 'read', 'reading'],
    finish: ['finish', 'finishes', 'finished', 'finished', 'finishing'],
    eat: ['eat', 'eats', 'ate', 'eaten', 'eating'],
    write: ['write', 'writes', 'wrote', 'written', 'writing'],
    see: ['see', 'sees', 'saw', 'seen', 'seeing'],
    go: ['go', 'goes', 'went', 'gone', 'going'],
    buy: ['buy', 'buys', 'bought', 'bought', 'buying'],
    learn: ['learn', 'learns', 'learned|learnt', 'learned|learnt', 'learning'],
    call: ['call', 'calls', 'called', 'called', 'calling'],
    leave: ['leave', 'leaves', 'left', 'left', 'leaving'],
    help: ['help', 'helps', 'helped', 'helped', 'helping']
  };
  const IDX = { base: 0, s: 1, past: 2, pp: 3, ing: 4 };

  // aux: pola regex sebelum kata kerja; label: yang ditampilkan ke user
  const ADV = "(?:\\s+(?:not|never|ever|just|already|always|still|really|recently|probably|definitely|also|finally|often|usually|sometimes|soon|certainly|all))*";
  const T = {
    'present-continuous': { form: 'ing', aux: "(?:am|is|are|'m|'s|'re|isn't|aren't)", label: 'am/is/are', agree: 'be-pres' },
    'present-perfect': { form: 'pp', aux: "(?:have|has|'ve|'s|haven't|hasn't)", label: 'have/has', agree: 'have' },
    'present-perfect-continuous': { form: 'ing', aux: "(?:have|has|'ve|'s|haven't|hasn't)" + ADV + "\\s+been", label: 'have/has been', agree: 'have' },
    'past-continuous': { form: 'ing', aux: "(?:was|were|wasn't|weren't)", label: 'was/were', agree: 'be-past' },
    'past-perfect': { form: 'pp', aux: "(?:had|'d|hadn't)", label: 'had' },
    'past-perfect-continuous': { form: 'ing', aux: "(?:had|'d|hadn't)" + ADV + "\\s+been", label: 'had been' },
    'simple-future': { form: 'base', aux: "(?:will|'ll|won't|(?:am|is|are|'m|'s|'re)" + ADV + "\\s+going\\s+to)", label: 'will' },
    'future-continuous': { form: 'ing', aux: "(?:will|'ll|won't)" + ADV + "\\s+be", label: 'will be' },
    'future-perfect': { form: 'pp', aux: "(?:will|'ll|won't)" + ADV + "\\s+have", label: 'will have' },
    'future-perfect-continuous': { form: 'ing', aux: "(?:will|'ll|won't)" + ADV + "\\s+have" + ADV + "\\s+been", label: 'will have been' },
    'past-future': { form: 'base', aux: "(?:would|'d|wouldn't)", label: 'would' },
    'past-future-continuous': { form: 'ing', aux: "(?:would|'d|wouldn't)" + ADV + "\\s+be", label: 'would be' },
    'past-future-perfect': { form: 'pp', aux: "(?:would|'d|wouldn't)" + ADV + "\\s+have", label: 'would have' },
    'past-future-perfect-continuous': { form: 'ing', aux: "(?:would|'d|wouldn't)" + ADV + "\\s+have" + ADV + "\\s+been", label: 'would have been' }
  };

  const MSG = {
    empty: ['Tulis kalimatmu dulu ya.', 'Write your sentence first.'],
    nokw: ['Kata kunci "{k}" belum ada di kalimatmu.', 'The keyword "{k}" is missing.'],
    form: ['Bentuk kata kerjanya belum pas. Untuk tense ini pakai "{f}".', 'The verb form is not right yet. This tense needs "{f}".'],
    aux: ['Bentuk "{f}" sudah ada, tapi sebelumnya perlu "{a}".', 'You have "{f}", but it needs "{a}" before it.'],
    i_am: ['Untuk "I", pasangannya "am".', 'With "I", use "am".'],
    sg_is: ['Untuk he/she/it, pakai "is".', 'With he/she/it, use "is".'],
    pl_are: ['Untuk you/we/they, pakai "are".', 'With you/we/they, use "are".'],
    sg_was: ['Untuk I/he/she/it, pakai "was".', 'With I/he/she/it, use "was".'],
    pl_were: ['Untuk you/we/they, pakai "were".', 'With you/we/they, use "were".'],
    sg_has: ['Untuk he/she/it, pakai "has".', 'With he/she/it, use "has".'],
    pl_have: ['Untuk I/you/we/they, pakai "have".', 'With I/you/we/they, use "have".'],
    needS: ['Subjek he/she/it: kata kerjanya perlu -s/-es ("{s}").', 'With he/she/it, the verb needs -s/-es ("{s}").'],
    noS: ['Subjek I/you/we/they: kata kerjanya tanpa -s ("{b}").', 'With I/you/we/they, the verb has no -s ("{b}").'],
    doBase: ['Setelah do/does/did, kata kerja kembali ke V1 ("{b}").', 'After do/does/did, use the base verb ("{b}").'],
    doesSg: ['Untuk he/she/it, pakai "does", bukan "do".', 'With he/she/it, use "does", not "do".'],
    notPresent: ['Kalimat ini memakai tense lain. Simple Present cukup subjek + V1 atau V1+s.', 'This uses a different tense. Simple Present is just subject + V1 or V1+s.'],
    needPast: ['Untuk Simple Past, pakai bentuk V2 ("{p}") atau did + V1.', 'Simple Past needs the V2 form ("{p}") or did + base verb.'],
    notPast: ['Kalimat ini memakai tense lain. Simple Past cukup subjek + V2.', 'This uses a different tense. Simple Past is just subject + V2.'],
    ok: ['Polanya sudah tepat!', 'The pattern is right!'],
    bonus: [' Bonus: ada penanda waktu yang cocok.', ' Bonus: you used a matching time marker.']
  };

  const alt = (s) => '(?:' + s + ')';
  const wb = (s) => '\\b' + alt(s) + '\\b';

  function check(input, tense, verb, lang, markers) {
    const li = lang === 'en' ? 1 : 0;
    const f = V[verb];
    const say = (k, rep) => {
      let m = MSG[k][li];
      Object.keys(rep || {}).forEach((x) => { m = m.split('{' + x + '}').join(rep[x]); });
      return m;
    };
    const first = (i) => f[i].split('|')[0];
    const lo = ' ' + String(input || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').trim() + ' ';
    if (!lo.trim()) return { ok: false, msg: say('empty') };
    const any = wb(f.join('|'));
    if (!new RegExp(any).test(lo)) return { ok: false, msg: say('nokw', { k: verb }) };

    const bonus = (markers || []).some((m) => {
      const clean = m.replace(/…/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
      return clean.length > 1 && lo.indexOf(' ' + clean.split(' ')[0]) >= 0 && lo.indexOf(clean.split(' ').slice(-1)[0]) >= 0;
    });
    const done = () => ({ ok: true, msg: say('ok') + (bonus ? say('bonus') : '') });
    const auxBefore = "\\b(?:am|is|are|was|were|be|been|being|will|would|have|has|had|'m|'re|'ve|'ll|'d|isn't|aren't|wasn't|weren't|won't|wouldn't|haven't|hasn't|hadn't)" + ADV + "\\s+";

    if (tense === 'simple-present') {
      const base = wb(f[0]), s = wb(f[1]);
      const doRe = new RegExp("\\b(do|does|don't|doesn't)(?:\\s+not)?" + ADV + "\\s+" + alt(f[1] + '|' + f[2]) + "\\b");
      if (doRe.test(lo)) return { ok: false, msg: say('doBase', { b: f[0] }) };
      if (new RegExp(auxBefore + alt(f.join('|')) + '\\b').test(lo)) return { ok: false, msg: say('notPresent') };
      if (new RegExp("\\b(he|she|it)\\s+(do|don't)\\b").test(lo)) return { ok: false, msg: say('doesSg') };
      if (new RegExp("\\b(he|she|it)" + ADV + "\\s+" + base).test(lo)) return { ok: false, msg: say('needS', { s: f[1] }) };
      if (new RegExp("\\b(i|you|we|they)" + ADV + "\\s+" + s).test(lo)) return { ok: false, msg: say('noS', { b: f[0] }) };
      if (new RegExp(base + '|' + s).test(lo)) return done();
      return { ok: false, msg: say('notPresent') };
    }

    if (tense === 'simple-past') {
      if (new RegExp("\\b(did|didn't)(?:\\s+not)?" + ADV + "\\s+" + alt(f[2] + '|' + f[1]) + "\\b").test(lo) && f[2] !== f[0]) return { ok: false, msg: say('doBase', { b: f[0] }) };
      if (new RegExp("\\b(did|didn't)(?:\\s+not)?" + ADV + "\\s+" + wb(f[0])).test(lo)) return done();
      if (new RegExp(auxBefore + alt(f.join('|')) + '\\b').test(lo)) return { ok: false, msg: say('notPast') };
      if (new RegExp(wb(f[2])).test(lo)) return done();
      return { ok: false, msg: say('needPast', { p: first(2) }) };
    }

    const c = T[tense];
    const formRe = wb(f[IDX[c.form]]);
    const shown = first(IDX[c.form]);
    if (!new RegExp(formRe).test(lo)) return { ok: false, msg: say('form', { f: shown }) };

    // kecocokan subjek
    if (c.agree === 'be-pres') {
      if (/\bi\s+(is|are)\b/.test(lo)) return { ok: false, msg: say('i_am') };
      if (/\b(he|she|it)\s+(am|are)\b/.test(lo)) return { ok: false, msg: say('sg_is') };
      if (/\b(you|we|they)\s+(am|is)\b/.test(lo)) return { ok: false, msg: say('pl_are') };
    } else if (c.agree === 'be-past') {
      if (/\b(i|he|she|it)\s+were\b/.test(lo)) return { ok: false, msg: say('sg_was') };
      if (/\b(you|we|they)\s+was\b/.test(lo)) return { ok: false, msg: say('pl_were') };
    } else if (c.agree === 'have') {
      if (/\b(he|she|it)\s+(have|haven't)\b/.test(lo)) return { ok: false, msg: say('sg_has') };
      if (/\b(i|you|we|they)\s+(has|hasn't)\b/.test(lo)) return { ok: false, msg: say('pl_have') };
    }
    const full = new RegExp('(?:\\b|(?=\'))' + c.aux + ADV + '\\s+' + alt(f[IDX[c.form]]) + '\\b');
    if (!full.test(lo)) return { ok: false, msg: say('aux', { f: shown, a: c.label }) };
    return done();
  }

  window.JK = window.JK || {};
  window.JK.checker = { check, VERBS: V, label: (t) => (T[t] ? T[t].label : null) };
})();
