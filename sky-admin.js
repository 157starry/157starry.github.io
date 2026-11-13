// ============================================================
//  s(T☆R)light · Keeper's room: set tonight's sky weather
//  Needs the star_sky table (see star_sky.sql, run once in Supabase).
// ============================================================
(function () {
  const { sb, toast } = SL;
  if (!sb) return;
  const LABEL = { clear: "clear ✧", cloudy: "cloudy ☁︎", rain: "rain ☂︎" };
  let box = null;

  function mark(w) {
    box.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.w === w)));
  }

  async function build() {
    const dash = document.getElementById("dash"), stabs = document.getElementById("stabs");
    if (!dash || !stabs || box) return;
    box = document.createElement("div");
    box.style.cssText = "margin:12px 0 0;background:var(--card);border-radius:14px;padding:10px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:14px";
    box.innerHTML = `<span>Sky tonight</span><span style="display:flex;gap:6px;flex-wrap:wrap">${
      Object.keys(LABEL).map((w) => `<button class="chip" type="button" data-w="${w}" aria-pressed="false">${LABEL[w]}</button>`).join("")}</span>`;
    dash.insertBefore(box, stabs);
    const { data } = await sb.from("star_sky").select("weather").eq("id", 1).maybeSingle();
    mark((data && data.weather) || "clear");
    box.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-w]");
      if (!b) return;
      const { error } = await sb.from("star_sky").update({ weather: b.dataset.w, updated_at: new Date().toISOString() }).eq("id", 1);
      if (error) { toast("Couldn't save: " + error.message); return; }
      mark(b.dataset.w);
      toast(`Sky set to ${b.dataset.w} ✧`);
    });
  }

  async function check() {
    const { data } = await sb.auth.getSession();
    if (!data || !data.session) { if (box) { box.remove(); box = null; } return; }
    const { data: ok } = await sb.rpc("quefory_is_keeper");
    if (ok) build();
  }

  check();
  sb.auth.onAuthStateChange(() => setTimeout(check, 300));
})();
