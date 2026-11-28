/* Buku Tamu (dashboard pemilik): halaman #/pemilik.
   Hanya terbuka dengan kunci pemilik (secret OWNER_PASS di Supabase).
   JK.owner.mount(view, api)   api: { t, esc, lang(), data } */
(function () {
  const S = { data: null, q: '', loading: false, err: '' };

  function fmt(api, iso) {
    if (!iso) return '–';
    try {
      return new Intl.DateTimeFormat(api.lang() === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
    } catch (e) { return iso.slice(0, 16).replace('T', ' '); }
  }
  const label = (api, r) => r.name || api.t('ownGuest').replace('{n}', r.no);

  function lockHTML(api) {
    const { t, esc } = api;
    return '<div class="page owner"><div class="eyebrow">Keeper</div><h1>' + esc(t('ownTitle')) + '</h1>' +
      '<form class="panel own-lock" id="ownLock"><p>' + esc(S.err || t('ownNeed')) + '</p>' +
      '<label class="sr-only" for="ownKey">' + esc(t('detOwnerPh')) + '</label>' +
      '<input id="ownKey" type="password" autocomplete="current-password" placeholder="' + esc(t('detOwnerPh')) + '">' +
      '<button type="submit" class="btn-gold inline">' + esc(t('detOwnerSave')) + '</button></form></div>';
  }

  function tableHTML(api) {
    const { t, esc } = api, d = S.data, T = d.totals || {};
    const q = S.q.trim().toLowerCase();
    const rows = (d.rows || []).filter((r) => !q || label(api, r).toLowerCase().indexOf(q) >= 0);
    const tile = (k, v) => '<div class="own-tile"><b>' + esc(v) + '</b><span>' + esc(t(k)) + '</span></div>';
    const cols = t('ownCols');
    return '<div class="page owner">' +
      '<div class="own-top"><div><div class="eyebrow">Keeper</div><h1>' + esc(t('ownTitle')) + '</h1><p class="lede">' + esc(t('ownLede')) + '</p></div>' +
        '<div class="own-actions"><button type="button" class="btn-line inline" id="ownReload">' + esc(t('ownRefresh')) + '</button>' +
        '<button type="button" class="link-btn" id="ownOut">' + esc(t('ownLogout')) + '</button></div></div>' +
      '<div class="own-tiles">' + tile('ownVisitors', T.visitors || 0) + tile('ownNamed', T.named || 0) + tile('ownVisits', T.visits || 0) +
        tile('ownChecks', T.checks || 0) + tile('ownActive', T.active7 || 0) + tile('ownNew', T.new24 || 0) + '</div>' +
      '<div class="panel own-card"><label class="sr-only" for="ownQ">' + esc(t('ownSearch')) + '</label>' +
        '<input id="ownQ" class="own-q" type="search" placeholder="' + esc(t('ownSearch')) + '" value="' + esc(S.q) + '">' +
        (rows.length ? '<div class="own-scroll"><table class="own-table"><thead><tr>' + cols.map((c) => '<th scope="col">' + esc(c) + '</th>').join('') + '<th><span class="sr-only">' + esc(t('ownDel')) + '</span></th></tr></thead><tbody>' +
          rows.map((r) => '<tr><th scope="row" class="' + (r.name ? 'named' : 'guest') + '">' + esc(label(api, r)) + '</th>' +
            '<td>' + r.visits + '</td><td>' + esc(fmt(api, r.first_seen)) + '</td><td>' + esc(fmt(api, r.last_seen)) + '</td>' +
            '<td>' + r.checks + '</td><td><span class="own-bar" style="--v:' + (r.gears / 16) + '"></span>' + r.gears + ' / 16</td>' +
            '<td>' + r.floors + ' / 5</td><td>' + r.best + '</td>' +
            '<td><button type="button" class="link-btn own-del" data-vid="' + esc(r.vid) + '" data-name="' + esc(label(api, r)) + '">' + esc(t('ownDel')) + '</button></td></tr>').join('') +
          '</tbody></table></div>' : '<p class="own-empty">' + esc(t('ownEmpty')) + '</p>') +
      '</div></div>';
  }

  async function load(view, api) {
    S.loading = true; S.err = '';
    view.innerHTML = '<div class="page owner"><div class="eyebrow">Keeper</div><h1>' + api.esc(api.t('ownTitle')) + '</h1><p class="lede">' + api.esc(api.t('ownLoading')) + '</p></div>';
    const r = await JK.visitors.list();
    S.loading = false;
    if (!document.body.contains(view) || location.hash.indexOf('#/pemilik') !== 0) return;
    if (r && r.status === 401) {
      JK.visitors.setOwner(''); window.dispatchEvent(new Event('jk-owner-change'));
      S.err = api.t('ownBad'); S.data = null; return mount(view, api);
    }
    if (!r || !r.body || !r.body.ok) {
      view.innerHTML = '<div class="page owner"><div class="eyebrow">Keeper</div><h1>' + api.esc(api.t('ownTitle')) + '</h1><p class="lede">' + api.esc(api.t('ownFail')) + '</p></div>';
      return;
    }
    // pastikan kunjungan pemilik dari browser ini (sebelum kunci dipasang) tidak ikut terhitung
    const mine = JK.visitors.vid();
    if ((r.body.rows || []).some((x) => x.vid === mine)) { await JK.visitors.remove(mine); return load(view, api); }
    S.data = r.body;
    paint(view, api);
  }

  function paint(view, api) {
    view.innerHTML = tableHTML(api);
    const q = view.querySelector('#ownQ');
    q.addEventListener('input', () => {
      S.q = q.value; const pos = q.selectionStart;
      paint(view, api);
      const n = view.querySelector('#ownQ'); n.focus(); n.setSelectionRange(pos, pos);
    });
    view.querySelector('#ownReload').addEventListener('click', () => load(view, api));
    view.querySelector('#ownOut').addEventListener('click', () => {
      JK.visitors.setOwner(''); S.data = null; S.err = '';
      window.dispatchEvent(new Event('jk-owner-change'));
      mount(view, api);
    });
    view.querySelectorAll('.own-del').forEach((b) => b.addEventListener('click', async () => {
      if (!window.confirm(api.t('ownDelAsk').replace('{name}', b.dataset.name))) return;
      const r = await JK.visitors.remove(b.dataset.vid);
      if (r && r.body && r.body.ok) load(view, api);
    }));
  }

  function mount(view, api) {
    if (!JK.visitors.isOwner()) {
      view.innerHTML = lockHTML(api);
      const f = view.querySelector('#ownLock');
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = view.querySelector('#ownKey').value.trim();
        if (!v) return;
        JK.visitors.setOwner(v); S.err = '';
        window.dispatchEvent(new Event('jk-owner-change'));
        load(view, api);
      });
      view.querySelector('#ownKey').focus();
      return;
    }
    if (S.data && !S.loading) return paint(view, api); // ganti bahasa: pakai data yang sudah ada
    load(view, api);
  }

  window.JK = window.JK || {};
  window.JK.owner = { mount };
})();
