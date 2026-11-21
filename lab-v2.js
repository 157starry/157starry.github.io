// ---------- Starry Lab v2: every project gets its own little world to try ----------
window.LAB_WORLDS = (function () {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const svg = (vb, inner) => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;

  // characters who live on the cards
  const BUNNY = svg("0 0 60 60", `<path d="M20 26C16 12 17 2 22 2s6 12 5 24M36 26c1-12 3-24 8-24s4 12 0 24" fill="#fff" stroke="#3A2A2E" stroke-width="1.8"/><path d="M22 8c1 6 1 12 1 16M42 8c-1 6-2 12-3 16" stroke="#F2B8C2" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="31" cy="40" rx="20" ry="17" fill="#fff" stroke="#3A2A2E" stroke-width="1.8"/><g fill="#3A2A2E"><circle class="blink" cx="24" cy="38" r="2"/><circle class="blink" cx="38" cy="38" r="2"/></g><ellipse cx="20" cy="44" rx="3" ry="1.8" fill="#F2B8C2"/><ellipse cx="42" cy="44" rx="3" ry="1.8" fill="#F2B8C2"/><path d="M29 43q2 2 4 0" stroke="#3A2A2E" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  const MATCHA = svg("0 0 62 74", `<path d="M44 2l-6 26" stroke="#E7A9AE" stroke-width="4" stroke-linecap="round"/><path d="M9 22h44c2 0 3 2 3 4l-3 10c3 3 3 8 0 11l-1 4c3 3 3 8 0 11-2 7-8 10-20 10S12 69 10 62c-3-3-3-8 0-11l-1-4c-3-3-3-8 0-11L6 26c0-2 1-4 3-4z" fill="#FFFDF8" stroke="#55703F" stroke-width="1.6"/><path d="M10.5 30h41l-2.4 6c3 3 3 8 0 11l-1 4c2.6 2.6 2.6 6.4 0 9H13c-2.6-2.6-2.6-6.4 0-9l-1-4c-3-3-3-8 0-11z" fill="#8FAE6E"/><path d="M13 60h36c-1.6 6-7 9-18 9S14.6 66 13 60z" fill="#F0B8BC"/><path d="M8 47c8 2 38 2 46 0" stroke="#E7A9AE" stroke-width="3.2" fill="none" stroke-linecap="round"/><g fill="#2E3A2A"><circle class="blink" cx="24" cy="40" r="2.3"/><circle class="blink" cx="36" cy="40" r="2.3"/></g><ellipse cx="19" cy="44" rx="3" ry="1.8" fill="#F0A9AE" opacity=".8"/><ellipse cx="41" cy="44" rx="3" ry="1.8" fill="#F0A9AE" opacity=".8"/><path d="M28 43.5q2 2 4 0" stroke="#2E3A2A" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  const STARCAT = svg("0 0 100 100", `<circle cx="50" cy="52" r="50" fill="#1b2040"/><g stroke="#F5E3E2" stroke-opacity=".5" stroke-width="1.4" fill="none"><path d="M30 38L22 10 44 30H56L78 10 70 38 86 60 68 82 50 88 32 82 14 60z"/></g><g fill="#F5E3E2"><circle cx="22" cy="10" r="2.6"/><circle cx="78" cy="10" r="2.6"/><circle cx="14" cy="60" r="2.2"/><circle cx="86" cy="60" r="2.2"/><circle cx="50" cy="88" r="2.4"/></g><g fill="#E8C27A"><path class="blink" d="M38 50l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/><path class="blink" d="M62 50l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/></g><circle cx="50" cy="66" r="2" fill="#D9A7B4"/>`);
  const PIXBUDDY = svg("0 0 16 14", `<g shape-rendering="crispEdges"><path d="M4 2h8v1h1v1h1v7h-1v1H3v-1H2V4h1V3h1z" fill="#2c3a37"/><path d="M4 3h8v1h1v7H3V4h1z" fill="#F2B8C2"/><rect class="blink" x="5" y="6" width="2" height="2" fill="#2c3a37"/><rect class="blink" x="9" y="6" width="2" height="2" fill="#2c3a37"/><rect x="4" y="8" width="1" height="1" fill="#e57e93"/><rect x="11" y="8" width="1" height="1" fill="#e57e93"/><rect x="7" y="9" width="2" height="1" fill="#2c3a37"/></g>`);
  const PIXCAT = svg("0 0 16 12", `<g shape-rendering="crispEdges"><path d="M2 0h2v1h1v1h6V1h1V0h2v4h1v7H1V4h1z" fill="#3A2A2E"/><path d="M5 5h6v5H5z" fill="#F3E6DA"/><rect class="blink" x="3" y="5" width="2" height="2" fill="#F6E9E9"/><rect class="blink" x="11" y="5" width="2" height="2" fill="#F6E9E9"/><rect x="7" y="7" width="2" height="1" fill="#E7A9AE"/></g>`);

  const STARRY = `<svg aria-hidden="true" id="sp-starrySvg" viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg"> <defs> <radialGradient id="sp-hairG" cx="40%" cy="30%" r="80%"> <stop offset="0" stop-color="#f6f8ff"/><stop offset=".45" stop-color="#bcd2ff"/> <stop offset=".8" stop-color="#9eb2ff"/><stop offset="1" stop-color="#c9a9ff"/> </radialGradient> <linearGradient id="sp-hairTail" x1="0" y1="1" x2="1" y2="0"> <stop offset="0" stop-color="#bcd2ff"/><stop offset=".55" stop-color="#e0b9ff"/><stop offset="1" stop-color="#ffc2e4" stop-opacity=".2"/> </linearGradient> <radialGradient id="sp-skin" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#fff5f0"/><stop offset="1" stop-color="#ffe0d8"/></radialGradient> <linearGradient id="sp-dress" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4e6ff"/><stop offset="1" stop-color="#84b5f2"/></linearGradient> <radialGradient id="sp-eyeG" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#7c9ae0"/><stop offset="1" stop-color="#2b3870"/></radialGradient> <filter id="sp-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter> </defs> <ellipse cx="100" cy="150" rx="94" ry="22" fill="none" stroke="rgba(225,232,255,.45)" stroke-width="1.3" stroke-dasharray="2 6" transform="rotate(-14 100 150)"/> <!-- cosmic hair tail --> <path d="M112 46 C140 20 170 8 199 2 C190 30 172 56 146 82 C134 72 122 60 112 46Z" fill="url(#sp-hairTail)" filter="url(#sp-glow)" opacity=".9"/> <path d="M112 46 C140 20 170 8 199 2 C190 30 172 56 146 82 C134 72 122 60 112 46Z" fill="url(#sp-hairTail)" opacity=".75"/> <!-- hair back --> <path d="M50 92 C46 50 74 30 102 30 C134 30 156 52 152 94 C152 118 146 132 140 138 L60 138 C54 130 50 116 50 92Z" fill="url(#sp-hairG)" filter="url(#sp-glow)" opacity=".7"/> <path d="M50 92 C46 50 74 30 102 30 C134 30 156 52 152 94 C152 118 146 132 140 138 L60 138 C54 130 50 116 50 92Z" fill="url(#sp-hairG)"/> <!-- legs --> <rect x="87" y="208" width="9" height="36" rx="4.5" fill="url(#sp-skin)"/> <rect x="104" y="208" width="9" height="36" rx="4.5" fill="url(#sp-skin)"/> <ellipse cx="91" cy="246" rx="7.5" ry="4.2" fill="#8ea8ee"/> <ellipse cx="109" cy="246" rx="7.5" ry="4.2" fill="#8ea8ee"/> <!-- left arm --> <path d="M80 142 Q65 160 62 182" stroke="#ffe4dc" stroke-width="9" stroke-linecap="round" fill="none"/> <circle cx="62" cy="184" r="5.5" fill="#ffe4dc"/> <!-- dress --> <path d="M80 134 Q100 128 120 134 L128 150 Q136 180 146 212 Q131 220 116 214 Q100 222 86 214 Q70 220 54 212 Q64 180 72 150 Z" fill="url(#sp-dress)"/> <path d="M70 196 Q100 204 132 196" stroke="rgba(255,255,255,.35)" stroke-width="1.5" fill="none"/> <ellipse cx="78" cy="143" rx="11" ry="9" fill="#acd4fb"/> <!-- head --> <g id="sp-head"> <ellipse cx="100" cy="92" rx="44" ry="40" fill="url(#sp-skin)"/> <path d="M56 92 C54 58 78 42 102 42 C128 42 148 60 144 92 C138 78 130 70 124 66 C122 76 114 80 106 78 C108 72 106 66 104 64 C96 74 84 80 70 80 C66 84 60 88 56 92Z" fill="url(#sp-hairG)"/> <path d="M56 88 C52 110 56 126 64 134 C62 118 62 104 60 92Z" fill="url(#sp-hairG)"/> <path d="M144 88 C148 110 144 126 136 134 C138 118 138 104 140 92Z" fill="url(#sp-hairG)"/> <circle cx="72" cy="58" r="1.6" fill="#fff"/> <circle cx="128" cy="54" r="1.3" fill="#fff"/> <circle cx="160" cy="34" r="1.5" fill="#fff"/> <circle cx="182" cy="16" r="1.2" fill="#fff"/> <!-- star tiara --> <g fill="#fff6c9" style="filter:drop-shadow(0 0 4px #fff3a8)"> <path d="M100 30 L102.6 37 L109.5 39.5 L102.6 42 L100 49 L97.4 42 L90.5 39.5 L97.4 37Z"/> <path d="M86 40 L87.4 43.6 L91 45 L87.4 46.4 L86 50 L84.6 46.4 L81 45 L84.6 43.6Z"/> <path d="M114 40 L115.4 43.6 L119 45 L115.4 46.4 L114 50 L112.6 46.4 L109 45 L112.6 43.6Z"/> </g> <g id="sp-eyeL"> <g><ellipse cx="82" cy="98" rx="7.5" ry="9.5" fill="url(#sp-eyeG)"/><circle cx="84.5" cy="94" r="2.8" fill="#fff"/><circle cx="80" cy="101.5" r="1.3" fill="#fff" opacity=".8"/></g> <path d="M74 101 Q82 93 90 101" stroke="#2b3870" stroke-width="2.6" fill="none" stroke-linecap="round"/> </g> <g id="sp-eyeR"> <g><ellipse cx="118" cy="98" rx="7.5" ry="9.5" fill="url(#sp-eyeG)"/><circle cx="120.5" cy="94" r="2.8" fill="#fff"/><circle cx="116" cy="101.5" r="1.3" fill="#fff" opacity=".8"/></g> <path d="M110 101 Q118 93 126 101" stroke="#2b3870" stroke-width="2.6" fill="none" stroke-linecap="round"/> </g> <ellipse cx="71" cy="112" rx="8" ry="5" fill="#ff9fb8" opacity=".55"/> <ellipse cx="129" cy="112" rx="8" ry="5" fill="#ff9fb8" opacity=".55"/> <path d="M94 113 Q100 119 106 113" stroke="#d9647e" stroke-width="2.2" fill="none" stroke-linecap="round"/> </g> <!-- right (waving) arm --> <g id="sp-armR"> <path d="M122 142 L144 178" stroke="#ffe4dc" stroke-width="9" stroke-linecap="round"/> <circle cx="145" cy="180" r="5.5" fill="#ffe4dc"/> <ellipse cx="122" cy="143" rx="11" ry="9" fill="#acd4fb"/> </g> </svg>`;

  const W = [];

  // Merry Christmas.txt — a terminal that types the tree
  W.push({
    test: (p) => /christmas/i.test(p.name + p.url), cls: "w-term", sticker: ["seasonal ✧", "pink"],
    why: "Every December I want to send something to my friends that isn't a sticker. So I typed them a whole sky, one character at a time.",
    html: () => `<div class="bar"><i></i><i></i><i></i><span>merry_christmas.txt</span></div><pre><span class="tree" data-tree></span><span class="msg" data-msg></span></pre><button class="run" type="button">▶ run again</button>`,
    init(el) {
      const TREE = ["    <b>★</b>", "    *", "   *<em>o</em>*", "  *<u>o</u>**<em>o</em>", " **<em>o</em>**<u>o</u>*", "*<u>o</u>***<em>o</em>***", "    ||"];
      const t = el.querySelector("[data-tree]"), m = el.querySelector("[data-msg]");
      let timer;
      function run() {
        clearInterval(timer); let i = 0; t.innerHTML = ""; m.innerHTML = "";
        timer = setInterval(() => {
          if (i < TREE.length) t.innerHTML += (i ? "\n" : "") + TREE[i];
          else if (i === TREE.length) m.innerHTML = `merry\n<span>christmas</span>\n· 2026 ·<span class="cur">&nbsp;</span>`;
          else clearInterval(timer);
          i++;
        }, 260);
      }
      el.querySelector(".run").onclick = run;
      return run;
    },
  });

  // Logical Fallacies — a tiny case to solve
  const CASES = [
    { a: "“Everyone at my office uses this app, so it must be the best one.”", ok: "Bandwagon", no: "Straw Man" },
    { a: "“You can't trust her view on climate. She drives a car.”", ok: "Ad Hominem", no: "Slippery Slope" },
    { a: "“If we let students redo one quiz, soon nobody will study at all.”", ok: "Slippery Slope", no: "Bandwagon" },
    { a: "“Either you support every new rule, or you don't care about safety.”", ok: "False Dilemma", no: "Ad Hominem" },
    { a: "“He wants shorter meetings? So he thinks teamwork is useless.”", ok: "Straw Man", no: "False Dilemma" },
  ];
  W.push({
    test: (p) => /fallac/i.test(p.name + p.url), cls: "w-case", sticker: ["updated Nov ✧", "green"],
    why: "In my communication classes I kept noticing the same tricks in arguments online. I wanted a notebook where I could catch them, kindly.",
    html: () => `<span class="tab">CASE 0${1 + Math.floor(Math.random() * 9)}</span><span class="stamp">think twice,<br>argue kindly</span><div class="arg"></div><div class="ask">which fallacy is this?</div><div class="opts"></div><div class="res"></div>`,
    init(el) {
      let last;
      function deal() {
        let c; do c = pick(CASES); while (c === last); last = c;
        el.querySelector(".arg").textContent = c.a;
        const o = Math.random() < .5 ? [c.ok, c.no] : [c.no, c.ok];
        el.querySelector(".opts").innerHTML = o.map((x) => `<button type="button">${x}</button>`).join("") + `<button type="button" data-next>↻</button>`;
        el.querySelector(".res").textContent = "";
        el.querySelectorAll(".opts button").forEach((b) => b.onclick = () => {
          if (b.hasAttribute("data-next")) return deal();
          const right = b.textContent === c.ok;
          b.classList.add(right ? "ok" : "no");
          el.querySelector(".res").textContent = right ? "case closed ✓  · 23 more inside" : "not quite, try the other one";
        });
      }
      deal();
    },
  });

  // GRIND.EXE — click a quest, gain XP
  W.push({
    test: (p) => /grind|study.?quest/i.test(p.name + p.url), cls: "w-pix", sticker: ["press start", "ink"],
    why: "I procrastinate less when it feels like a game. So my homework got XP, levels, and little friends who cheer when I finish a quest.",
    html: () => `<div class="screen"><div class="t">STUDY QUEST</div><div class="lv"><span data-lv>LV 1</span><span data-xp>0 / 50 XP</span></div><div class="bar"><i></i></div>
      <div class="quest"><button type="button" data-q="10">READ 1 PAGE</button><button type="button" data-q="20">FINISH QUIZ</button></div><div class="pop"></div></div>`,
    init(el) {
      let xp = 0, lv = 1;
      el.querySelectorAll("[data-q]").forEach((b) => b.onclick = () => {
        xp += +b.dataset.q; let msg = `+${b.dataset.q} XP!`;
        if (xp >= 50) { xp -= 50; lv++; msg = `LEVEL UP! LV ${lv} ✧`; }
        el.querySelector("[data-lv]").textContent = "LV " + lv;
        el.querySelector("[data-xp]").textContent = `${xp} / 50 XP`;
        el.querySelector(".bar i").style.width = (xp / 50) * 100 + "%";
        el.querySelector(".pop").textContent = msg;
      });
    },
  });

  // Novem — a 3×3 under the stars
  W.push({
    test: (p) => /novem|sudoku/i.test(p.name + p.url), cls: "w-novem", sticker: ["new ✧", "pink"],
    why: "My old STarry Sudoku lived on an account I lost. So I rebuilt it under the night sky: always a fresh puzzle, and a constellation cat to keep me company.",
    html: () => `<div class="twk-sky">${Array.from({ length: 22 }, () => `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${(Math.random() * 3).toFixed(1)}s"></i>`).join("")}</div>
      <div class="ttl">Nov<i>em</i></div><div class="sub">fill one to nine, under the stars</div><div class="grid"></div><div class="hint">tap a square ✧</div>`,
    init(el) {
      const given = { 0: 4, 4: 5, 8: 6 }, vals = Array(9).fill(0);
      Object.entries(given).forEach(([i, v]) => (vals[i] = v));
      const g = el.querySelector(".grid");
      g.innerHTML = vals.map((v, i) => `<button type="button" data-i="${i}" class="${given[i] ? "given" : ""}">${v || ""}</button>`).join("");
      g.querySelectorAll("button").forEach((b) => b.onclick = () => {
        const i = +b.dataset.i; if (given[i]) return;
        vals[i] = (vals[i] % 9) + 1; b.textContent = vals[i];
        const seen = {}; vals.forEach((v) => v && (seen[v] = (seen[v] || 0) + 1));
        g.querySelectorAll("button").forEach((x, j) => x.classList.toggle("dupe", vals[j] && seen[vals[j]] > 1));
        const done = vals.every(Boolean) && Object.keys(seen).length === 9;
        el.querySelector(".hint").textContent = done ? "solved ✧ the real ones are 9×9" : Object.values(seen).some((n) => n > 1) ? "each number only once ✧" : "tap a square ✧";
      });
    },
  });

  // Quefory — a question to borrow
  const QS = ["What are you reading right now?", "What's one song you'd play on repeat?", "What made you start this website?", "What would you study if you had one free year?", "What's your comfort drink?"];
  W.push({
    test: (p) => /quefory/i.test(p.name + p.url), cls: "w-que", sticker: ["ask me ✿", "green"],
    why: "Some people want to ask things they'd never type under their own name. Quefory is a soft place for that, with private boxes only the two of us can open.",
    html: (p) => `<div class="logo">Quefory</div><div class="q">${QS[0]}</div><div class="acts"><button class="dice" type="button">🎲 another</button>${p.url ? `<a class="send" href="${p.url}" target="_blank" rel="noopener">ask it ↗</a>` : ""}</div>`,
    init(el) { let i = 0; el.querySelector(".dice").onclick = () => { i = (i + 1) % QS.length; el.querySelector(".q").textContent = QS[i]; }; },
  });

  // (Ta)bula — a ten-second focus session
  W.push({
    test: (p) => /tabula|gardenia/i.test(p.name + p.url), cls: "w-tab", sticker: ["new ✧", ""],
    why: "first built with a slice of gardenia bread ✧ I needed a timer that reminds me to drink water and stretch, not just one that counts down.",
    html: () => `<div class="ttl"><span>(Ta)</span>bula</div><div class="sub">try a ten-second focus</div><div class="clock">00:00:10</div><div class="bloom">🌷</div><div class="stem"></div><button class="go" type="button">start ✿</button>`,
    init(el) {
      let t;
      el.querySelector(".go").onclick = function () {
        clearInterval(t); let s = 10; const c = el.querySelector(".clock"), bl = el.querySelector(".bloom"), st = el.querySelector(".stem");
        bl.classList.remove("on"); st.style.height = "0"; this.textContent = "focus…";
        t = setInterval(() => {
          s--; c.textContent = `00:00:${String(s).padStart(2, "0")}`; st.style.height = (10 - s) * 1.6 + "px";
          if (s <= 0) { clearInterval(t); bl.classList.add("on"); this.textContent = "again ✿"; }
        }, 1000);
      };
    },
  });

  // StarPal — sticky notes (personal tool)
  const NOTES = ["agenda setting → who decides what we talk about?", "drink water ✿", "ch. 3 · framing vs priming", "ask tutor about tugas 3", "you're doing great", "two-step flow!!"];
  const COLORS = ["#FCEBB6", "#F5D3DA", "#D9E7C8", "#D6E4F2", "#E8DAF2"];
  W.push({
    test: (p) => /starpal/i.test(p.name + p.url), cls: "w-pal", sticker: ["personal tool · just for me ✿", "pink"], personal: true,
    why: "Reading course modules on screen, I kept losing my notes in other windows. So I made sticky notes that float on top of everything, with friends who cheer me on.",
    html: () => `<div class="notes"></div><button class="add" type="button">+ jot a note</button>`,
    init(el) {
      const box = el.querySelector(".notes"), spots = [[2, 4], [36, 0], [66, 8], [8, 52], [42, 48]];
      let n = 0;
      function add(anim) {
        if (box.children.length >= spots.length) box.firstElementChild.remove();
        const d = document.createElement("div"), [x, y] = spots[n % spots.length];
        d.className = "note" + (anim ? " pop" : "");
        d.style.cssText = `left:${x}%;top:${y}%;background:${COLORS[n % COLORS.length]};--nr:${(Math.random() * 8 - 4).toFixed(1)}deg`;
        d.textContent = NOTES[n % NOTES.length]; box.appendChild(d); n++;
      }
      for (let i = 0; i < 3; i++) add(false);
      el.querySelector(".add").onclick = () => add(true);
    },
  });

  // Starry · Song of the Day — Starry reads today's mood and hands you a song
  const SOTD = {
    sun: [["A Sky Full of Stars", "Coldplay"], ["Pilihanku", "Maliq & D'Essentials"], ["Loving Is Easy", "Rex Orange County"], ["Monokrom", "Tulus"], ["Blueming", "IU"], ["Banana Pancakes", "Jack Johnson"]],
    moon: [["Space Song", "Beach House"], ["fine today", "Ardhito Pramono"], ["Best Part", "Daniel Caesar ft. H.E.R."], ["Gala Bunga Matahari", "Sal Priadi"], ["Birds of a Feather", "Billie Eilish"], ["Rehat", "Kunto Aji"]],
    rain: [["Bertaut", "Nadin Amizah"], ["Hati-Hati di Jalan", "Tulus"], ["Glimpse of Us", "Joji"], ["Let Down", "Radiohead"], ["Satu Bulan", "Bernadya"], ["Video Games", "Lana Del Rey"]],
  };
  W.push({
    test: (p) => /song.?of.?the.?day|\/song\/?$|starry ?·? ?song/i.test(p.name + " " + p.url), cls: "w-sotd", sticker: ["new ✧", "pink"],
    html: (p) => `<div class="twk-sky">${Array.from({ length: 26 }, () => `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${(Math.random() * 3).toFixed(1)}s"></i>`).join("")}</div>
      <div class="k">✦ SONG ORACLE</div><div class="q">how does today feel?</div>
      <div class="opts"><button type="button" data-m="sun">☀️ bright</button><button type="button" data-m="moon">🌙 quiet</button><button type="button" data-m="rain">🌧 a little blue</button></div>
      <div class="res" aria-live="polite"></div>${p.url ? `<a class="ask" href="${p.url}" target="_blank" rel="noopener">ask Starry properly · 7 questions ↗</a>` : ""}`,
    init(el) {
      const res = el.querySelector(".res");
      el.querySelectorAll("[data-m]").forEach((b) => b.onclick = () => {
        el.querySelectorAll("[data-m]").forEach((x) => x.classList.toggle("on", x === b));
        const [t, a] = pick(SOTD[b.dataset.m]);
        res.classList.remove("show"); void res.offsetWidth;
        res.innerHTML = `<span>today's song ✦</span><b>${t}</b><em>${a}</em>`; res.classList.add("show");
      });
    },
  });

  // where each character sits: [world test, svg, css position]
  const PEEKS = [
    [/tabula|gardenia/i, BUNNY, "right:22px;top:-26px;width:58px;height:58px"],
    [/quefory/i, MATCHA, "right:20px;top:-40px;width:52px;height:62px"],
    [/novem|sudoku/i, STARCAT, "right:18px;top:-22px;width:56px;height:56px"],
    [/grind|study.?quest/i, PIXBUDDY, "right:22px;top:-22px;width:46px;height:40px"],
    [/song.?of.?the.?day|\/song\/?$|starry ?·? ?song/i, STARRY, "right:16px;top:-50px;width:56px;height:76px"],
    [/starpal/i, PIXCAT, "right:24px;top:-18px;width:44px;height:34px"],
  ];
  return {
    find: (p) => W.find((w) => w.test(p)),
    peek: (p) => { const k = PEEKS.find(([re]) => re.test(p.name + " " + p.url)); return k ? `<span class="peek" style="${k[2]}">${k[1]}</span>` : ""; },
  };
})();
