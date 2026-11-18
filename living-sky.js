// ---------- living sky v2: depth + a constellation that wakes up ----------
(function () {
  const cfg = window.STARLIGHT || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement.style;
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  // 1 · depth: a far layer and a near layer around the existing twinkles (#bg)
  const bg = document.getElementById("bg");
  function layer(cls, n, size, op) {
    const el = document.createElement("div");
    el.className = "stars-bg " + cls; el.setAttribute("aria-hidden", "true");
    for (let i = 0; i < n; i++) {
      const d = document.createElement("i"), s = size[0] + Math.random() * (size[1] - size[0]);
      d.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;opacity:${(op[0] + Math.random() * (op[1] - op[0])).toFixed(2)};animation-delay:${(Math.random() * 6).toFixed(2)}s`;
      el.appendChild(d);
    }
    return el;
  }
  bg.before(layer("far", 110, [1, 1.6], [.12, .45]));
  bg.after(layer("near", 14, [3, 4], [.5, .9]));

  if (!reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, last = -1e9;
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      tx = clamp((e.clientX / innerWidth - .5) * 2); ty = clamp((e.clientY / innerHeight - .5) * 2); last = performance.now();
    });
    const orient = (e) => {
      if (e.gamma == null) return;
      tx = clamp(e.gamma / 22); ty = clamp((e.beta - 40) / 22); last = performance.now();
    };
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      // iPhone asks once, on the first tap
      addEventListener("pointerdown", function ask() {
        DOE.requestPermission().then((r) => r === "granted" && addEventListener("deviceorientation", orient)).catch(() => {});
        removeEventListener("pointerdown", ask);
      });
    } else if (DOE) addEventListener("deviceorientation", orient);

    (function tick(t) {
      // when nobody moves, the sky drifts on its own, very slowly
      const idle = Math.min(1, Math.max(0, (t - last - 2500) / 3000));
      const gx = tx * (1 - idle) + Math.sin(t / 7000) * .45 * idle;
      const gy = ty * (1 - idle) + Math.cos(t / 9500) * .3 * idle;
      cx += (gx - cx) * .05; cy += (gy - cy) * .05;
      root.setProperty("--px", cx.toFixed(3)); root.setProperty("--py", cy.toFixed(3));
      requestAnimationFrame(tick);
    })(0);
  }

  // 2 · the constellation wakes up
  const P = {};
  (cfg.stars || []).forEach((s) => (P[s.key] = s));
  P.quefory = { key: "quefory", x: 57, y: 85 };
  const LOOP = ["lecto", "florilegium", "nocturnes", "lieux", "lab", "lecto"];
  const EDGES = [];
  for (let i = 0; i < LOOP.length - 1; i++) EDGES.push([LOOP[i], LOOP[i + 1]]);
  EDGES.push(["lieux", "quefory"]);

  const NS = "http://www.w3.org/2000/svg";
  const lit = document.createElementNS(NS, "g");
  lit.setAttribute("class", "lit");
  lit.setAttribute("stroke", "#FFF1EE"); lit.setAttribute("stroke-opacity", ".75"); lit.setAttribute("stroke-width", "1.3"); lit.setAttribute("stroke-linecap", "round");
  document.getElementById("lines").appendChild(lit);
  const starEl = (k) => document.querySelector(`.star[data-key="${k}"]`);
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function draw(a, b, ms) {
    const l = document.createElementNS(NS, "line");
    l.setAttribute("vector-effect", "non-scaling-stroke");
    ["x1", "x2"].forEach((k) => l.setAttribute(k, a.x)); ["y1", "y2"].forEach((k) => l.setAttribute(k, a.y));
    lit.appendChild(l);
    return new Promise((done) => {
      const t0 = performance.now();
      (function step(t) {
        const p = ease(Math.min(1, (t - t0) / ms));
        l.setAttribute("x2", a.x + (b.x - a.x) * p); l.setAttribute("y2", a.y + (b.y - a.y) * p);
        p < 1 ? requestAnimationFrame(step) : done(l);
      })(t0);
    });
  }
  function fade(lines) {
    lines.forEach((l) => { l.classList.add("out"); setTimeout(() => l.remove(), 1500); });
  }
  const wake = (k) => { const s = starEl(k); if (s) { s.classList.remove("woke"); void s.offsetWidth; s.classList.add("woke"); } };

  // first visit of the page: the stars light up one by one and the lines draw themselves
  async function intro() {
    document.body.classList.add("waking");
    await new Promise((r) => setTimeout(r, 500));
    const drawn = [];
    wake("lecto");
    for (let i = 0; i < LOOP.length - 1; i++) {
      drawn.push(await draw(P[LOOP[i]], P[LOOP[i + 1]], 420));
      wake(LOOP[i + 1]);
    }
    drawn.push(await draw(P.lieux, P.quefory, 380));
    wake("quefory");
    setTimeout(() => { fade(drawn); document.body.classList.remove("waking"); }, 700);
  }
  if (reduce) return;
  intro();

  // touch or hover a star: its lines light up, its neighbours glow
  let held = [];
  function light(k) {
    unlight();
    EDGES.filter((e) => e.includes(k)).forEach(([a, b]) => {
      const other = a === k ? b : a;
      draw(P[k], P[other], 380).then((l) => held.push(l));
      const n = starEl(other); n && n.classList.add("near");
    });
  }
  function unlight() {
    fade(held.splice(0)); lit.querySelectorAll("line:not(.out)").forEach((l) => fade([l]));
    document.querySelectorAll(".star.near").forEach((s) => s.classList.remove("near"));
  }
  document.querySelectorAll(".star").forEach((s) => {
    s.addEventListener("pointerenter", () => light(s.dataset.key));
    s.addEventListener("pointerleave", unlight);
    s.addEventListener("pointerdown", () => light(s.dataset.key));
  });

  // now and then a little light walks the whole constellation
  const spark = document.createElement("span");
  spark.className = "spark"; spark.setAttribute("aria-hidden", "true");
  document.getElementById("sky").appendChild(spark);
  function walk() {
    if (document.hidden) return;
    const path = LOOP.map((k) => P[k]), per = 1100, t0 = performance.now();
    spark.classList.add("on");
    (function step(t) {
      const f = (t - t0) / per, i = Math.floor(f);
      if (i >= path.length - 1) { spark.classList.remove("on"); return; }
      const a = path[i], b = path[i + 1], p = f - i;
      spark.style.left = a.x + (b.x - a.x) * p + "%"; spark.style.top = a.y + (b.y - a.y) * p + "%";
      requestAnimationFrame(step);
    })(t0);
  }
  setTimeout(() => { walk(); setInterval(walk, 25000); }, 13000);
})();
