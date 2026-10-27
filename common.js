// ============================================================
//  s(T☆R)light · shared helpers (used by every page)
// ============================================================
(function () {
  const cfg = window.STARLIGHT || {};
  const ready = cfg.supabaseUrl && !cfg.supabaseUrl.startsWith("PASTE");
  const sb = ready && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Only allow http(s) links and our own assets/ folder
  const safeUrl = (u) => {
    const s = String(u || "").trim();
    return /^(https?:\/\/|assets\/)/i.test(s) ? s : "";
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtMonth = (d) => { if (!d) return ""; const x = new Date(d); return `${MONTHS[x.getMonth()]} ${x.getFullYear()}`; };
  const fmtDate = (d) => { if (!d) return ""; const x = new Date(d); return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`; };

  const readMins = (text) => Math.max(1, Math.round(String(text || "").trim().split(/\s+/).length / 200));

  // Markdown → safe HTML (pages that use it load marked + DOMPurify)
  const md = (text) => {
    if (!window.marked || !window.DOMPurify) return `<p>${esc(text)}</p>`;
    const html = window.marked.parse(String(text || ""), { breaks: true, gfm: true });
    return window.DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
  };

  // Which app a music/read link opens in
  const platform = (url) => {
    const u = String(url || "").toLowerCase();
    if (u.includes("youtu")) return "YouTube";
    if (u.includes("spotify")) return "Spotify";
    if (u.includes("music.apple")) return "Apple Music";
    if (u.includes("soundcloud")) return "SoundCloud";
    if (u.includes("substack")) return "Substack";
    if (u.includes("medium.com")) return "Medium";
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "Link"; }
  };

  // Small deterministic random from a string (for star positions / colours)
  const hash = (str) => {
    let h = 2166136261;
    for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  };

  const PALETTE = ["#EBCFD4", "#C9D8B6", "#E8D9B8", "#D4C2DD", "#F2C6B9", "#BFD3D6"];
  const tint = (str) => PALETTE[Math.floor(hash(str) * PALETTE.length) % PALETTE.length];

  // Shrink a photo in the browser before uploading (max 1600px, JPEG)
  async function compress(file, max = 1600, quality = 0.82) {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = URL.createObjectURL(file);
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, "image/jpeg", quality));
  }

  async function uploadImage(file, folder = "misc") {
    if (!sb) throw new Error("not connected");
    const blob = await compress(file);
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await sb.storage.from("starlight").upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    return sb.storage.from("starlight").getPublicUrl(path).data.publicUrl;
  }

  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2200);
  }

  window.SL = { cfg, sb, ready, esc, safeUrl, fmtMonth, fmtDate, readMins, md, platform, hash, tint, uploadImage, toast };

  // Private view counter: +1 per page (or essay) per browser session. Never counts admin or the signed-in Keeper.
  (async function countView() {
    try {
      if (!sb || /admin/.test(location.pathname)) return;
      const page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
      const p = new URLSearchParams(location.search).get("p");
      const key = p ? `post:${p.toLowerCase()}` : `page:${page.toLowerCase()}`;
      if (!/^(page|post):[a-z0-9-]{1,80}$/.test(key)) return;
      try { if (sessionStorage.getItem("sl_v_" + key)) return; sessionStorage.setItem("sl_v_" + key, "1"); } catch {}
      const { data } = await sb.auth.getSession();
      if (data && data.session) return; // that's you
      await sb.rpc("star_hit", { k: key });
    } catch {}
  })();
})();
