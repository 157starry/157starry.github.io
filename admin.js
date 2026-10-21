// ============================================================
//  s(T☆R)light · Keeper's room (admin.html)
// ============================================================
(function () {
  const { sb, esc, safeUrl, fmtMonth, md, uploadImage, toast } = SL;
  const $ = (id) => document.getElementById(id);
  if (!sb) { $("login").hidden = false; $("loginErr").textContent = "Not connected: check config.js"; return; }

  // ---------- What each star stores ----------
  const SECTIONS = {
    lecto: {
      label: "lect(o)", table: "star_posts", singleFeatured: true, hint: "Long writing. Drafts stay hidden until you publish.",
      order: [["published_at", false]],
      title: (r) => r.title,
      sub: (r) => `${r.published ? "" : "Draft · "}${r.category || "no topic"} · ${fmtMonth(r.published_at)}`,
      badge: (r) => (r.featured ? "★ featured" : ""),
      fields: [
        { k: "title", label: "Title", type: "text", req: true, max: 200 },
        { k: "dek", label: "Subtitle (one line under the title)", type: "text", max: 300 },
        { k: "category", label: "Topic", type: "text", max: 40, suggest: true, hint: "e.g. Communication, Media, Society, Essays" },
        { k: "body", label: "Writing", type: "markdown" },
        { k: "published_at", label: "Date shown on the post", type: "date" },
        { k: "featured", label: "Feature this at the top of lect(o)", type: "check", def: false },
        { k: "published", label: "Published (visible to everyone)", type: "check", def: false },
      ],
    },
    flori: {
      label: "Florilegium", table: "star_flori", reorder: true, hint: "Drag ⠿ to change the order. ♡ = shown on the front of Florilegium.",
      title: (r) => r.title,
      badge: (r) => (r.kind === "book" && r.featured ? "♡ recommended" : ""),
      sub: (r) => ({ quote: "Quote", book: "Book", read: "Read" }[r.kind] || "") + (r.author ? " · " + r.author : "") + (r.genre ? " · " + r.genre : ""),
      thumb: (r) => r.image_url,
      fields: [
        { k: "kind", label: "Type", type: "select", def: "quote", options: [["quote", "Quote / reflection"], ["book", "Book for the shelf"], ["read", "Good read (link)"]] },
        { k: "title", label: "The quote, book title, or article title", type: "textarea", req: true, max: 600 },
        { k: "author", label: "Author / source", type: "text", max: 120 },
        { k: "genre", label: "Genre", type: "text", max: 40, suggest: true, hint: "One or more, separated by commas: Psychology, Philosophy, History, Fiction…", showIf: (v) => v.kind === "book" },
        { k: "note", label: "Your little note (shows in handwriting)", type: "text", max: 200 },
        { k: "url", label: "Link", type: "url", hint: "Needed for reads. Optional for books.", showIf: (v) => v.kind !== "quote" },
        { k: "image_url", label: "Book cover (optional)", type: "image", folder: "covers", showIf: (v) => v.kind === "book" },
        { k: "featured", label: "♡ Recommend: show this book on the front (All tab)", type: "check", def: false, showIf: (v) => v.kind === "book" },
        { k: "published", label: "Visible", type: "check", def: true },
      ],
    },
    songs: {
      label: "Nocturnes", table: "star_songs", reorder: true, singleFeatured: true, hint: "Drag ⠿ to change the order. ★ = On repeat this week.",
      title: (r) => r.title, sub: (r) => [r.artist, r.mood].filter(Boolean).join(" · "),
      badge: (r) => (r.featured ? "★ on repeat" : ""),
      fields: [
        { k: "title", label: "Song title", type: "text", req: true, max: 160 },
        { k: "artist", label: "Artist", type: "text", max: 120 },
        { k: "url", label: "Link", type: "url", hint: "Paste a YouTube, Spotify or Apple Music link." },
        { k: "note", label: "Why I love it (one line)", type: "text", max: 160 },
        { k: "mood", label: "Mood", type: "text", max: 30, suggest: true, hint: "One or more, separated by commas: soft, hype, rainy, study…" },
        { k: "featured", label: "★ On repeat this week (only one song)", type: "check", def: false },
        { k: "published", label: "Visible", type: "check", def: true },
      ],
    },
    places: {
      label: "Lieux", table: "star_places", hint: "Tap the map to place a pin, or search a place.",
      order: [["visited_on", false], ["created_at", false]],
      title: (r) => r.name, sub: (r) => (r.visited_on ? fmtMonth(r.visited_on) : "") + (r.lat == null ? " · no pin yet" : ""),
      thumb: (r) => (Array.isArray(r.photos) && r.photos[0]) || r.photo_url,
      fields: [
        { k: "name", label: "Place name", type: "text", req: true, max: 120 },
        { k: "note", label: "One sentence about it", type: "text", max: 300 },
        { k: "visited_on", label: "When", type: "date" },
        { k: "pin", label: "Pin on the map", type: "map" },
        { k: "photos", label: "Photos (up to 4, the first one is the cover)", type: "images", folder: "places", max: 4 },
        { k: "published", label: "Visible", type: "check", def: true },
      ],
    },
    lab: {
      label: "Starry Lab", table: "star_projects", reorder: true, hint: "Things you built. Drag ⠿ to change the order.",
      title: (r) => r.name, sub: (r) => r.tags || "", thumb: (r) => r.image_url,
      fields: [
        { k: "name", label: "Project name", type: "text", req: true, max: 80 },
        { k: "description", label: "What it is, and why you made it", type: "textarea", max: 500 },
        { k: "url", label: "Link", type: "url" },
        { k: "tags", label: "Tags (separate with commas)", type: "text", max: 120 },
        { k: "image_url", label: "Picture", type: "image", folder: "projects" },
        { k: "published", label: "Visible", type: "check", def: true },
      ],
    },
  };

  let cur = "lecto";
  let rows = [];
  let editing = null; // row being edited, or {} for new

  // ---------- Auth ----------
  async function start() {
    const { data } = await sb.auth.getSession();
    data.session ? enter() : ($("login").hidden = false);
  }
  async function enter() {
    const { data: ok } = await sb.rpc("quefory_is_keeper");
    if (!ok) {
      await sb.auth.signOut();
      $("login").hidden = false; $("dash").hidden = true;
      $("loginErr").textContent = "This account isn't the Keeper.";
      return;
    }
    $("login").hidden = true; $("dash").hidden = false; $("logout").hidden = false;
    renderTabs(); load();
  }
  $("loginBtn").onclick = login;
  $("password").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
  async function login() {
    $("loginErr").textContent = "";
    $("loginBtn").disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
    $("loginBtn").disabled = false;
    if (error) return ($("loginErr").textContent = "Email or password is wrong.");
    enter();
  }
  $("logout").onclick = async () => { await sb.auth.signOut(); location.reload(); };

  // ---------- List ----------
  function renderTabs() {
    $("stabs").innerHTML = Object.entries(SECTIONS).map(([k, s]) =>
      `<button class="stab" role="tab" data-k="${k}" aria-selected="${k === cur}">${esc(s.label)}</button>`).join("");
    $("stabs").querySelectorAll(".stab").forEach((b) => b.onclick = () => { cur = b.dataset.k; renderTabs(); load(); });
    $("secHint").textContent = SECTIONS[cur].hint;
  }

  async function load() {
    const s = SECTIONS[cur];
    $("list").innerHTML = `<div class="empty">Loading…</div>`;
    let q = sb.from(s.table).select("*");
    const order = s.reorder ? [["position", true], ["created_at", false]] : s.order;
    order.forEach(([c, asc]) => { q = q.order(c, { ascending: asc }); });
    const { data, error } = await q;
    if (error) { $("list").innerHTML = `<div class="empty">Couldn't load. ${esc(error.message)}</div>`; return; }
    rows = data || [];
    renderList();
  }

  function renderList() {
    const s = SECTIONS[cur];
    if (!rows.length) { $("list").innerHTML = `<div class="empty">Nothing here yet.<br><span class="scribble">tap + New ✧</span></div>`; return; }
    $("list").innerHTML = rows.map((r, i) => {
      const th = s.thumb ? safeUrl(s.thumb(r)) : "";
      const badge = s.badge ? s.badge(r) : "";
      return `<div class="row">
        ${s.thumb ? `<div class="thumb" ${th ? `style="background-image:url('${esc(th)}')"` : ""}></div>` : ""}
        <div class="t" data-i="${i}"><b>${esc(s.title(r))}${badge ? `<span class="badge">${esc(badge)}</span>` : ""}${r.published === false ? `<span class="badge g">hidden</span>` : ""}</b>
        <span>${esc(s.sub(r))}</span></div>
        ${s.reorder ? `<div class="arrows"><button data-top="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move to the top" title="Move to the top">⤒</button><button class="grip" aria-label="Drag to reorder" title="Drag to reorder">⠿</button></div>` : ""}
      </div>`;
    }).join("");
    $("list").querySelectorAll(".t").forEach((el) => el.onclick = () => openForm(rows[+el.dataset.i]));
    $("list").querySelectorAll("[data-top]").forEach((b) => b.onclick = () => {
      const i = +b.dataset.top;
      rows.unshift(rows.splice(i, 1)[0]);
      renderList(); saveOrder();
    });
    if (s.reorder) makeSortable();
  }

  // ---------- Drag to reorder (SortableJS: mouse + touch, auto-scrolls on long lists) ----------
  let sortable = null, sortLib = null;
  function loadSortable() {
    if (window.Sortable) return Promise.resolve(window.Sortable);
    if (!sortLib) sortLib = new Promise((ok, no) => {
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js";
      sc.onload = () => ok(window.Sortable); sc.onerror = no;
      document.head.appendChild(sc);
    });
    return sortLib;
  }
  async function makeSortable() {
    try { await loadSortable(); } catch { toast("Drag isn't available right now. Use ⤒ instead."); return; }
    if (sortable) { sortable.destroy(); sortable = null; }
    sortable = Sortable.create($("list"), {
      handle: ".grip", draggable: ".row", animation: 160,
      ghostClass: "drag-ghost", chosenClass: "drag-chosen",
      scroll: true, scrollSensitivity: 90, scrollSpeed: 14, bubbleScroll: true,
      onEnd: (e) => {
        if (e.oldIndex === e.newIndex) return;
        rows.splice(e.newIndex, 0, rows.splice(e.oldIndex, 1)[0]);
        renderList(); saveOrder();
      },
    });
  }
  (function dragStyles() {
    const st = document.createElement("style");
    st.textContent = `.arrows .grip{cursor:grab;touch-action:none;font-size:20px;line-height:1}
      .arrows .grip:active{cursor:grabbing}
      .row.drag-ghost{opacity:.35}
      .row.drag-chosen{box-shadow:0 10px 28px rgba(80,40,50,.18)}
      .multi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}
      .multi:empty{display:none}
      .mp{position:relative;aspect-ratio:1;border-radius:10px;background:#eee center/cover}
      .mp button{position:absolute;top:4px;width:24px;height:24px;border-radius:50%;border:0;background:rgba(255,255,255,.92);cursor:pointer;font-size:14px;line-height:24px;padding:0}
      .mp .rm{right:4px}.mp .mv{left:4px}
      #pickMap .leaflet-tile-pane{filter:sepia(.35) saturate(.7) hue-rotate(-15deg) brightness(1.04)}
      .mp .cov{position:absolute;left:4px;bottom:4px;font-size:10px;background:#8F5864;color:#fff;border-radius:8px;padding:2px 6px}`;
    document.head.appendChild(st);
  })();

  async function saveOrder() {
    const s = SECTIONS[cur];
    const jobs = [];
    rows.forEach((r, idx) => {
      if (r.position !== idx) { r.position = idx; jobs.push(sb.from(s.table).update({ position: idx }).eq("id", r.id)); }
    });
    const res = await Promise.all(jobs);
    if (res.some((x) => x.error)) { toast("Couldn't save the order"); load(); }
    else if (jobs.length) toast("Order saved ✧");
  }

  // ---------- Form ----------
  $("newBtn").onclick = () => openForm(null);
  $("closeSheet").onclick = closeForm;
  let pickMap = null, pickMarker = null;

  function suggestions(k) {
    return [...new Set(rows.map((r) => r[k]).filter(Boolean))];
  }

  function fieldHtml(f, v) {
    const id = "f_" + f.k;
    const val = v[f.k];
    const lab = f.type === "check" ? "" : `<label class="lb" for="${id}">${esc(f.label)}${f.req ? " *" : ""}</label>`;
    const hint = f.hint ? `<p class="hint">${esc(f.hint)}</p>` : "";
    let input = "";
    switch (f.type) {
      case "text": case "url":
        input = `<input id="${id}" class="field" type="${f.type === "url" ? "url" : "text"}" ${f.max ? `maxlength="${f.max}"` : ""} value="${esc(val ?? "")}" ${f.suggest ? `list="dl_${f.k}"` : ""} ${f.type === "url" ? 'placeholder="https://…"' : ""}>`
          + (f.suggest ? `<datalist id="dl_${f.k}">${suggestions(f.k).map((o) => `<option value="${esc(o)}">`).join("")}</datalist>` : "");
        break;
      case "textarea":
        input = `<textarea id="${id}" class="field" ${f.max ? `maxlength="${f.max}"` : ""}>${esc(val ?? "")}</textarea>`; break;
      case "select":
        input = `<select id="${id}" class="field">${f.options.map(([o, t]) => `<option value="${o}" ${(val ?? f.def) === o ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`; break;
      case "date": {
        const d = val ? new Date(val) : (f.k === "published_at" ? new Date() : null);
        const iso = d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";
        input = `<input id="${id}" class="field" type="date" value="${iso}">`; break;
      }
      case "check":
        input = `<label class="check"><input id="${id}" type="checkbox" ${(val ?? f.def) ? "checked" : ""}> ${esc(f.label)}</label>`; break;
      case "image": {
        const u = safeUrl(val);
        input = `<div class="imgbox"><div class="pv" id="${id}_pv" ${u ? `style="background-image:url('${esc(u)}')"` : ""}></div>
          <div><input type="file" accept="image/*" id="${id}_file" hidden>
          <button type="button" class="b line" data-pick="${id}">${u ? "Change photo" : "Choose photo"}</button>
          <button type="button" class="b ghost" data-clear="${id}" ${u ? "" : "hidden"}>Remove</button>
          <p class="hint" id="${id}_st">Photos are resized automatically.</p></div></div>
          <input type="hidden" id="${id}" value="${esc(u)}">`; break;
      }
      case "images": {
        const list = (Array.isArray(val) && val.length ? val : (v.photo_url ? [v.photo_url] : [])).map(safeUrl).filter(Boolean).slice(0, f.max || 4);
        input = `<div class="multi" id="${id}_box"></div>
          <input type="file" accept="image/*" multiple id="${id}_file" hidden>
          <button type="button" class="b line" id="${id}_add">Add photos</button>
          <p class="hint" id="${id}_st">Up to ${f.max || 4}. Photos are resized automatically.</p>
          <input type="hidden" id="${id}" value="${esc(JSON.stringify(list))}">`;
        break;
      }
      case "markdown":
        input = `<div class="tools" data-for="${id}">
            <button type="button" data-md="b" title="Bold"><b>B</b></button>
            <button type="button" data-md="i" title="Italic"><i>I</i></button>
            <button type="button" data-md="h" title="Heading">H</button>
            <button type="button" data-md="q" title="Pull quote">❝</button>
            <button type="button" data-md="l" title="Link">🔗</button>
            <button type="button" data-md="ul" title="List">•</button>
            <button type="button" data-md="hr" title="Divider">✧</button>
            <button type="button" data-md="img" title="Add image">🖼</button>
            <button type="button" data-md="pv" title="Preview" style="margin-left:auto">Preview</button></div>
          <textarea id="${id}" class="field big" placeholder="Start writing… Leave an empty line between paragraphs.">${esc(val ?? "")}</textarea>
          <div class="preview prose" id="${id}_pv" hidden></div>
          <input type="file" accept="image/*" id="${id}_file" hidden>
          <p class="hint">**bold** · *italic* · ## heading · &gt; quote · [text](link). End with a "References" heading for sources.</p>`;
        break;
      case "map":
        input = `<div class="two"><input id="f_search" class="field" placeholder="Search a place…"><button type="button" class="b line" id="f_go" style="flex:none">Find</button></div>
          <div class="results" id="f_results"></div>
          <div id="pickMap" style="margin-top:8px"></div>
          <div class="two" style="margin-top:8px"><input id="f_lat" class="field" placeholder="Latitude" inputmode="decimal" value="${v.lat ?? ""}"><input id="f_lng" class="field" placeholder="Longitude" inputmode="decimal" value="${v.lng ?? ""}"></div>`;
        break;
    }
    return `<div class="fw" data-k="${f.k}">${lab}${input}${hint}</div>`;
  }

  function currentValues() {
    const v = {};
    SECTIONS[cur].fields.forEach((f) => {
      const el = $("f_" + f.k);
      if (f.type === "check") v[f.k] = el ? el.checked : f.def;
      else if (f.type !== "map") v[f.k] = el ? el.value : "";
    });
    return v;
  }

  function applyShowIf() {
    const v = currentValues();
    SECTIONS[cur].fields.forEach((f) => {
      if (!f.showIf) return;
      const w = document.querySelector(`.fw[data-k="${f.k}"]`);
      if (w) w.hidden = !f.showIf(v);
    });
  }

  function openForm(row) {
    const s = SECTIONS[cur];
    editing = row || {};
    $("formTitle").textContent = (row ? "Edit · " : "New · ") + s.label;
    $("form").innerHTML = s.fields.map((f) => fieldHtml(f, editing)).join("");
    $("formErr").textContent = "";
    $("delBtn").hidden = !row;
    $("actions").innerHTML = `<button class="b ghost" id="cancelBtn">Cancel</button><button class="b dark" id="saveBtn">Save</button>`;
    $("cancelBtn").onclick = closeForm;
    $("saveBtn").onclick = save;
    $("sheet").hidden = false; $("actions").hidden = false;
    document.body.style.overflow = "hidden";
    $("sheet").scrollTop = 0;
    wireForm();
    applyShowIf();
  }

  function closeForm() {
    $("sheet").hidden = true;
    document.body.style.overflow = "";
    if (pickMap) { pickMap.remove(); pickMap = null; pickMarker = null; }
  }

  function wireForm() {
    $("form").querySelectorAll("select").forEach((el) => el.onchange = applyShowIf);

    // image fields
    $("form").querySelectorAll("[data-pick]").forEach((b) => {
      const id = b.dataset.pick, file = $(id + "_file");
      b.onclick = () => file.click();
      file.onchange = async () => {
        if (!file.files[0]) return;
        $(id + "_st").textContent = "Uploading…"; b.disabled = true; $("saveBtn").disabled = true;
        try {
          const f = SECTIONS[cur].fields.find((x) => "f_" + x.k === id);
          const url = await uploadImage(file.files[0], f.folder);
          $(id).value = url;
          $(id + "_pv").style.backgroundImage = `url('${url}')`;
          $(id + "_st").textContent = "Uploaded ✧";
          document.querySelector(`[data-clear="${id}"]`).hidden = false;
        } catch (e) { $(id + "_st").textContent = "Upload failed. Try another photo."; }
        b.disabled = false; $("saveBtn").disabled = false; file.value = "";
      };
    });
    $("form").querySelectorAll("[data-clear]").forEach((b) => b.onclick = () => {
      const id = b.dataset.clear;
      $(id).value = ""; $(id + "_pv").style.backgroundImage = ""; b.hidden = true;
    });

    // multi-photo fields
    SECTIONS[cur].fields.filter((f) => f.type === "images").forEach((f) => {
      const id = "f_" + f.k, max = f.max || 4, hid = $(id), box = $(id + "_box"), file = $(id + "_file"), add = $(id + "_add");
      if (!hid) return;
      const get = () => { try { return JSON.parse(hid.value || "[]"); } catch { return []; } };
      const draw = () => {
        const list = get();
        box.innerHTML = list.map((u, i) => `<div class="mp" style="background-image:url('${esc(u)}')">
          ${i === 0 ? `<span class="cov">cover</span>` : `<button type="button" class="mv" data-first="${i}" title="Make cover">★</button>`}
          <button type="button" class="rm" data-rm="${i}" aria-label="Remove">×</button></div>`).join("");
        add.hidden = list.length >= max;
        box.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { const l = get(); l.splice(+b.dataset.rm, 1); hid.value = JSON.stringify(l); draw(); });
        box.querySelectorAll("[data-first]").forEach((b) => b.onclick = () => { const l = get(); l.unshift(l.splice(+b.dataset.first, 1)[0]); hid.value = JSON.stringify(l); draw(); });
      };
      add.onclick = () => file.click();
      file.onchange = async () => {
        const picked = [...file.files].slice(0, max - get().length);
        if (!picked.length) return;
        add.disabled = true; $("saveBtn").disabled = true;
        for (let i = 0; i < picked.length; i++) {
          $(id + "_st").textContent = `Uploading ${i + 1} of ${picked.length}…`;
          try { const url = await uploadImage(picked[i], f.folder); hid.value = JSON.stringify([...get(), url].slice(0, max)); draw(); }
          catch { toast("One photo failed to upload"); }
        }
        $(id + "_st").textContent = "Uploaded ✧ Tap ★ to choose the cover.";
        add.disabled = false; $("saveBtn").disabled = false; file.value = "";
      };
      draw();
    });

    // markdown toolbar
    $("form").querySelectorAll(".tools").forEach((bar) => {
      const ta = $(bar.dataset.for), pv = $(bar.dataset.for + "_pv"), file = $(bar.dataset.for + "_file");
      const wrap = (a, b, ph) => {
        const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || ph;
        ta.setRangeText(a + sel + b, s, e, "end"); ta.focus();
      };
      const line = (prefix, ph) => {
        const s = ta.selectionStart, start = ta.value.lastIndexOf("\n", s - 1) + 1;
        const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd) || ph;
        ta.setRangeText((start === s ? "" : "\n\n") + prefix + sel + "\n", ta.selectionStart, ta.selectionEnd, "end"); ta.focus();
      };
      bar.querySelectorAll("[data-md]").forEach((btn) => btn.onclick = async () => {
        const m = btn.dataset.md;
        if (m === "b") wrap("**", "**", "bold text");
        if (m === "i") wrap("*", "*", "italic text");
        if (m === "h") line("## ", "Heading");
        if (m === "q") line("> ", "A line worth highlighting");
        if (m === "ul") line("- ", "list item");
        if (m === "hr") line("", "---");
        if (m === "l") { const u = prompt("Paste the link (https://…)"); if (u && /^https?:\/\//i.test(u)) wrap("[", `](${u})`, "link text"); }
        if (m === "img") file.click();
        if (m === "pv") {
          const on = pv.hidden;
          pv.hidden = !on; ta.hidden = on;
          btn.textContent = on ? "Edit" : "Preview";
          if (on) pv.innerHTML = md(ta.value) || "<p><i>Nothing yet.</i></p>";
        }
      });
      if (file) file.onchange = async () => {
        if (!file.files[0]) return;
        toast("Uploading image…");
        try {
          const url = await uploadImage(file.files[0], "posts");
          const s = ta.selectionStart;
          ta.setRangeText(`\n\n![](${url})\n\n`, s, s, "end");
          toast("Image added ✧");
        } catch { toast("Upload failed"); }
        file.value = "";
      };
    });

    // map picker
    if ($("pickMap")) {
      const lat = parseFloat($("f_lat").value), lng = parseFloat($("f_lng").value);
      const has = !isNaN(lat) && !isNaN(lng);
      pickMap = L.map("pickMap").setView(has ? [lat, lng] : [1.3521, 103.8198], has ? 15 : 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(pickMap);
      const setPin = (la, ln, fly) => {
        $("f_lat").value = la.toFixed(6); $("f_lng").value = ln.toFixed(6);
        if (pickMarker) pickMarker.setLatLng([la, ln]); else pickMarker = L.marker([la, ln]).addTo(pickMap);
        if (fly) pickMap.setView([la, ln], 15);
      };
      if (has) setPin(lat, lng, false);
      pickMap.on("click", (e) => setPin(e.latlng.lat, e.latlng.lng, false));
      setTimeout(() => pickMap.invalidateSize(), 150);
      const search = async () => {
        const q = $("f_search").value.trim();
        if (!q) return;
        $("f_results").innerHTML = `<p class="hint">Searching…</p>`;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`);
          const list = await r.json();
          $("f_results").innerHTML = list.length ? list.map((p, i) => `<button type="button" data-i="${i}">${esc(p.display_name)}</button>`).join("") : `<p class="hint">No match. Try tapping the map.</p>`;
          $("f_results").querySelectorAll("button").forEach((b) => b.onclick = () => {
            const p = list[+b.dataset.i];
            setPin(parseFloat(p.lat), parseFloat(p.lon), true);
            if (!$("f_name").value) $("f_name").value = p.display_name.split(",")[0];
            $("f_results").innerHTML = "";
          });
        } catch { $("f_results").innerHTML = `<p class="hint">Search unavailable. Tap the map instead.</p>`; }
      };
      $("f_go").onclick = search;
      $("f_search").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); search(); } });
    }
  }

  function slugify(t) {
    const base = String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "post";
    let s = base, n = 2;
    const taken = new Set(rows.filter((r) => r.id !== editing.id).map((r) => r.slug));
    while (taken.has(s)) s = `${base}-${n++}`;
    return s;
  }

  async function save() {
    const s = SECTIONS[cur];
    const v = currentValues();
    const out = {};
    for (const f of s.fields) {
      const w = document.querySelector(`.fw[data-k="${f.k}"]`);
      const hiddenField = w && w.hidden;
      if (f.type === "map") {
        const la = parseFloat($("f_lat").value), ln = parseFloat($("f_lng").value);
        out.lat = isNaN(la) ? null : la; out.lng = isNaN(ln) ? null : ln;
        continue;
      }
      let val = v[f.k];
      if (f.type === "images") {
        let list = []; try { list = JSON.parse(val || "[]"); } catch {}
        out[f.k] = list;
        if (cur === "places") out.photo_url = list[0] || null;
        continue;
      }
      if (f.type === "check") { out[f.k] = !!val; continue; }
      val = hiddenField ? "" : String(val ?? "").trim();
      if (f.req && !val) { $("formErr").textContent = `Please fill in “${f.label}”.`; return; }
      if (f.type === "url" && val && !/^https?:\/\//i.test(val)) { $("formErr").textContent = "Links must start with https://"; return; }
      if (f.type === "date") { out[f.k] = val ? (f.k === "published_at" ? new Date(val + "T12:00:00").toISOString() : val) : (f.k === "published_at" ? new Date().toISOString() : null); continue; }
      out[f.k] = val === "" ? null : val;
    }
    if (cur === "lecto") {
      if (out.body == null) out.body = "";
      out.updated_at = new Date().toISOString();
      if (!editing.id) out.slug = slugify(out.title);
    }

    $("saveBtn").disabled = true; $("formErr").textContent = "";
    let res, id = editing.id;
    if (id) {
      res = await sb.from(s.table).update(out).eq("id", id);
    } else {
      id = (crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));
      out.id = id;
      if (s.reorder) out.position = rows.length ? Math.min(...rows.map((r) => r.position || 0)) - 1 : 0;
      res = await sb.from(s.table).insert(out);
    }
    if (!res.error && out.featured && s.singleFeatured) await sb.from(s.table).update({ featured: false }).neq("id", id);
    $("saveBtn").disabled = false;
    if (res.error) { $("formErr").textContent = "Couldn't save: " + res.error.message; return; }
    toast("Saved ✧");
    closeForm(); load();
  }

  $("delBtn").onclick = async () => {
    if (!editing || !editing.id) return;
    if (!confirm("Delete this for good?")) return;
    const { error } = await sb.from(SECTIONS[cur].table).delete().eq("id", editing.id);
    if (error) return ($("formErr").textContent = "Couldn't delete: " + error.message);
    toast("Deleted"); closeForm(); load();
  };

  start();
})();
