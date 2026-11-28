/* Pengunjung: ID acak per browser, nama panggilan, dan pencatatan ke Edge Function tense-visitors.
   Tidak ada yang dikirim selama kunci pemilik aktif (pemilik tidak ikut terhitung).
   JK.visitors: { me(), isOwner(), ownerPass(), setOwner(v), visit(progress), setName(n), skip(),
                  shouldGreet(), check(), progress(p), list(), remove(vid) } */
(function () {
  const ENDPOINT = 'https://ulnmlwvehuofukpmsgyl.supabase.co/functions/v1/tense-visitors';
  const PUBLIC_KEY = 'sb_publishable_A2yYd8nRwg33aTVIXoMmXw_dQ-hszir';
  const K_VID = 'jk-vid', K_ME = 'jk-me', K_OWNER = 'jk-owner', K_SESSION = 'jk-visit', K_SENT = 'jk-sent';
  const REMIND_AT = 3; // kunjungan ke-3: Starry mengajak kenalan sekali lagi

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* mode privat */ } }
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* abaikan */ } }
  };

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function vid() {
    let v = ls.get(K_VID);
    if (!v) { v = uuid(); ls.set(K_VID, v); }
    return v;
  }
  function me() {
    let m = {};
    try { m = JSON.parse(ls.get(K_ME) || '{}') || {}; } catch (e) { m = {}; }
    return { name: m.name || '', skipped: !!m.skipped, reminded: !!m.reminded, visits: +m.visits || 0 };
  }
  const saveMe = (m) => ls.set(K_ME, JSON.stringify(m));

  const ownerPass = () => ls.get(K_OWNER) || '';
  const isOwner = () => !!ownerPass();
  const setOwner = (v) => ls.set(K_OWNER, v || null);

  async function send(action, extra, asOwner) {
    if (isOwner() && !asOwner) return null; // pemilik tidak dicatat
    try {
      const headers = { 'Content-Type': 'application/json', apikey: PUBLIC_KEY };
      if (isOwner()) headers['x-owner-pass'] = ownerPass();
      const res = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify(Object.assign({ action, vid: vid() }, extra || {})), keepalive: action !== 'list' });
      let body = null; try { body = await res.json(); } catch (e) { /* abaikan */ }
      return { status: res.status, body };
    } catch (e) { return null; }
  }

  /* satu kunjungan per sesi browser */
  function visit(p) {
    const m = me();
    if (ss.get(K_SESSION)) return m;
    ss.set(K_SESSION, '1');
    if (isOwner()) return m;
    m.visits += 1; saveMe(m);
    send('visit', Object.assign({ name: m.name || null }, p || {}));
    ss.set(K_SENT, JSON.stringify(p || {}));
    return m;
  }
  function shouldGreet() {
    if (isOwner()) return null;
    const m = me();
    if (m.name) return null;
    if (!m.skipped) return 'first';
    if (!m.reminded && m.visits >= REMIND_AT) return 'remind';
    return null;
  }
  function setName(n) {
    const name = String(n || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const m = me(); m.name = name; m.skipped = true; m.reminded = true; saveMe(m);
    send('name', { name: name || null });
    return name;
  }
  function skip(wasRemind) {
    const m = me(); m.skipped = true; if (wasRemind) m.reminded = true; saveMe(m);
  }
  function check() { send('check'); }
  function progress(p) {
    const key = JSON.stringify(p);
    if (ss.get(K_SENT) === key) return; // tidak berubah
    ss.set(K_SENT, key);
    send('progress', p);
  }
  async function list() { return send('list', {}, true); }
  async function remove(id) { return send('delete', { vid: id }, true); }

  window.JK = window.JK || {};
  window.JK.visitors = { me, vid, isOwner, ownerPass, setOwner, visit, shouldGreet, setName, skip, check, progress, list, remove };
})();
