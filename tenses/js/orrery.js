/* Orrery 3D (Three.js r159, versi global window.THREE).
   API: const o = new JK.Orrery(canvas, { planets, onPick, onHover });
        o.setLever(i, planetId) · o.setDay(bool) · o.setLabels({past, now, future})
        o.focus(id) · o.back() · o.pause() · o.resume() · o.dispose()  */
(function () {
  function Orrery(canvas, opts) {
    const THREE = window.THREE;
    if (!THREE) throw new Error('THREE missing');
    this.THREE = THREE;
    this.cv = canvas;
    this.opts = opts;
    this.lever = 4; this.lv = 4; this.litId = 'mercury';
    this.sel = null; this.day = false; this.running = true;
    this.labelText = { past: 'MASA LALU', now: 'SEKARANG', future: 'MASA DEPAN' };
    this._build();
    this._bind();
    this._loop = this._loop.bind(this);
    this.last = performance.now(); this.t = 0;
    this.raf = requestAnimationFrame(this._loop);
  }

  Orrery.prototype._tex = function (kind) {
    const THREE = this.THREE;
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    const rnd = (a, b) => a + Math.random() * (b - a);
    if (kind[0] === 'bands') {
      let y = 0, i = 0;
      while (y < 256) { const h = rnd(10, 34); g.fillStyle = kind[1][i % kind[1].length]; g.fillRect(0, y, 512, h + 1); y += h; i++; }
      g.globalAlpha = 0.15; for (let k = 0; k < 40; k++) { g.fillStyle = k % 2 ? '#fff' : '#000'; g.fillRect(0, rnd(0, 256), 512, rnd(1, 3)); }
      if (kind[1].length > 5) { g.globalAlpha = 0.9; g.fillStyle = '#B5543A'; g.beginPath(); g.ellipse(330, 165, 34, 16, 0, 0, Math.PI * 2); g.fill(); }
    } else if (kind[0] === 'earth') {
      g.fillStyle = '#2F6FC0'; g.fillRect(0, 0, 512, 256);
      g.fillStyle = '#5FA85A'; for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(rnd(0, 512), rnd(50, 210), rnd(20, 60), rnd(12, 36), rnd(0, 3), 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#F4F7FF'; g.fillRect(0, 0, 512, 16); g.fillRect(0, 240, 512, 16);
      g.globalAlpha = 0.6; for (let k = 0; k < 18; k++) { g.beginPath(); g.ellipse(rnd(0, 512), rnd(20, 236), rnd(20, 70), rnd(3, 7), 0, 0, Math.PI * 2); g.fill(); }
    } else if (kind[0] === 'mars') {
      g.fillStyle = '#C2583A'; g.fillRect(0, 0, 512, 256);
      g.fillStyle = '#8E3420'; for (let k = 0; k < 30; k++) { g.globalAlpha = rnd(0.2, 0.6); g.beginPath(); g.arc(rnd(0, 512), rnd(20, 236), rnd(4, 22), 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1; g.fillStyle = '#FFF5EE'; g.fillRect(0, 0, 512, 14);
    } else {
      const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, kind[1]); gr.addColorStop(0.5, kind[2]); gr.addColorStop(1, kind[1]);
      g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
      g.globalAlpha = 0.12; for (let k = 0; k < 30; k++) { g.fillStyle = k % 2 ? '#fff' : '#000'; g.fillRect(0, rnd(0, 256), 512, rnd(2, 6)); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };

  Orrery.prototype._glow = function (rgb) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(' + rgb + ',1)'); gr.addColorStop(0.35, 'rgba(' + rgb + ',0.35)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new this.THREE.CanvasTexture(c);
  };

  Orrery.prototype._labelTex = function (text) {
    const THREE = this.THREE;
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    const g = c.getContext('2d');
    g.font = '700 42px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = this.day ? '#8A4524' : '#F1D58A';
    g.fillText(String(text).toUpperCase(), 256, 50);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };

  Orrery.prototype._gearGeo = function (teeth, R, depth) {
    const THREE = this.THREE;
    const sh = new THREE.Shape();
    const r1 = R - 0.09, step = Math.PI * 2 / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      [[r1, a], [R, a + step * 0.2], [R, a + step * 0.5], [r1, a + step * 0.7]].forEach((p, k) => {
        const x = Math.cos(p[1]) * p[0], y = Math.sin(p[1]) * p[0];
        if (i === 0 && k === 0) sh.moveTo(x, y); else sh.lineTo(x, y);
      });
    }
    sh.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, R * 0.22, 0, Math.PI * 2, true); sh.holes.push(hole);
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; const w = new THREE.Path(); w.absarc(Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55, R * 0.17, 0, Math.PI * 2, true); sh.holes.push(w); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 16 });
    geo.rotateX(-Math.PI / 2);
    return geo;
  };

  Orrery.prototype._build = function () {
    const THREE = this.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas: this.cv, antialias: true, alpha: true });
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    this.scene = scene;

    // lingkungan pantulan untuk logam
    const pm = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    const eg = new THREE.SphereGeometry(20, 32, 16);
    const ec = [], ep = eg.attributes.position;
    for (let i = 0; i < ep.count; i++) { const y = ep.getY(i) / 20; const k = Math.max(0, Math.min(1, (y + 0.2) / 1.1)); ec.push(0.04 + 0.9 * k, 0.05 + 0.72 * k, 0.12 + 0.45 * k); }
    eg.setAttribute('color', new THREE.Float32BufferAttribute(ec, 3));
    env.add(new THREE.Mesh(eg, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
    const bright = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [[6, 8, 4, 4, 2], [-7, 5, -3, 3, 3], [0, 10, -6, 6, 1]].forEach((b) => { const m = new THREE.Mesh(new THREE.BoxGeometry(b[3], b[4], 0.2), bright); m.position.set(b[0], b[1], b[2]); m.lookAt(0, 0, 0); env.add(m); });
    scene.environment = pm.fromScene(env, 0.04).texture;
    pm.dispose();

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

    const amb = new THREE.AmbientLight(0x4a5590, 0.5); scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff1d6, 1.8); key.position.set(6, 10, 6); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7f9bff, 0.7); rim.position.set(-8, 4, -7); scene.add(rim);
    const sunLight = new THREE.PointLight(0xffc56b, 18, 14, 1.6); scene.add(sunLight);

    const brass = new THREE.MeshStandardMaterial({ color: 0xC9A45C, metalness: 1, roughness: 0.3 });
    const brassDk = new THREE.MeshStandardMaterial({ color: 0x8A6A2E, metalness: 1, roughness: 0.42 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x2B1A12, metalness: 0.1, roughness: 0.55 });
    const rod = (a, b, rad, mat) => {
      const v = new THREE.Vector3().subVectors(b, a); const len = v.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, 12), mat);
      m.position.copy(a).addScaledVector(v, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
      m.castShadow = true; return m;
    };

    const orrery = new THREE.Group(); scene.add(orrery);
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.75, 0.28, 64), wood); plinth.position.y = -2.08; plinth.receiveShadow = true; orrery.add(plinth);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.0, 0.6, 64), brassDk); base.position.y = -1.65; base.receiveShadow = true; base.castShadow = true; orrery.add(base);
    const baseRim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 12, 64), brass); baseRim.rotation.x = Math.PI / 2; baseRim.position.y = -1.35; orrery.add(baseRim);
    orrery.add(rod(new THREE.Vector3(0, -1.35, 0), new THREE.Vector3(0, 1.0, 0), 0.07, brass));

    const dialY = -0.05;
    const dial = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.07, 16, 160), brass); dial.rotation.x = Math.PI / 2; dial.position.y = dialY; dial.castShadow = true; orrery.add(dial);
    const dial2 = new THREE.Mesh(new THREE.TorusGeometry(5.68, 0.035, 12, 160), brass); dial2.rotation.x = Math.PI / 2; dial2.position.y = dialY; orrery.add(dial2);
    const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.025, 1), brass, 120);
    const dm = new THREE.Object3D();
    for (let i = 0; i < 120; i++) {
      const a = i / 120 * Math.PI * 2, big = i % 15 === 0;
      dm.position.set(Math.cos(a) * 5.54, dialY, Math.sin(a) * 5.54); dm.rotation.set(0, -a + Math.PI / 2, 0); dm.scale.set(big ? 2 : 1, 1, big ? 0.3 : 0.16); dm.updateMatrix(); ticks.setMatrixAt(i, dm.matrix);
    }
    orrery.add(ticks);
    [0.25, 0.75, 1.25, 1.75].forEach((f) => { const a = f * Math.PI; orrery.add(rod(new THREE.Vector3(Math.cos(a) * 1.85, -1.4, Math.sin(a) * 1.85), new THREE.Vector3(Math.cos(a) * 5.4, dialY, Math.sin(a) * 5.4), 0.03, brassDk)); });

    this.labels = [['past', -6.5, 0], ['now', 0, -6.5], ['future', 6.5, 0]].map((l) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this._labelTex(this.labelText[l[0]]), transparent: true, depthWrite: false }));
      sp.scale.set(2.6, 0.49, 1); sp.position.set(l[1], 0.15, l[2]); orrery.add(sp);
      return { sp, k: l[0] };
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this._relabel());

    const needle = new THREE.Group(); needle.position.y = dialY + 0.06; orrery.add(needle);
    const nmat = new THREE.MeshStandardMaterial({ color: 0xF1D58A, metalness: 1, roughness: 0.2 });
    const nb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 4.9), nmat); nb.position.z = -2.45; needle.add(nb);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 16), nmat); tip.rotation.x = -Math.PI / 2; tip.position.z = -5.05; needle.add(tip);
    this.needle = needle;

    const gearY = -1.12;
    this.g1 = new THREE.Mesh(this._gearGeo(24, 1.0, 0.1), brass); this.g1.position.set(0, gearY, 0);
    this.g2 = new THREE.Mesh(this._gearGeo(12, 0.55, 0.1), brassDk); this.g2.position.set(1.47, gearY, 0);
    this.g3 = new THREE.Mesh(this._gearGeo(16, 0.7, 0.1), brassDk); this.g3.position.set(-1.04, gearY, 1.24);
    [this.g1, this.g2, this.g3].forEach((g) => { g.castShadow = true; orrery.add(g); });

    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), new THREE.MeshStandardMaterial({ color: 0xFFD27A, emissive: 0xFF9A1F, emissiveIntensity: 1.6, roughness: 0.5 }));
    sun.position.y = 1.62; orrery.add(sun); this.sun = sun;
    const sunCup = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 12, 48), brass); sunCup.rotation.x = Math.PI / 2; sunCup.position.y = 1.08; orrery.add(sunCup);
    orrery.add(rod(new THREE.Vector3(0, 0.95, 0), new THREE.Vector3(0, 1.1, 0), 0.12, brass));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this._glow('255,190,90'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.set(3.6, 3.6, 1); glow.position.copy(sun.position); orrery.add(glow); this.glow = glow;
    sunLight.position.copy(sun.position);

    this.planets = this.opts.planets.map((p) => {
      const cy = p.h + 0.22 + p.s;
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 24), brass); collar.position.y = p.h; orrery.add(collar);
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(p.r, 0.008, 6, 160), new THREE.MeshBasicMaterial({ color: 0xC9A45C, transparent: true, opacity: 0.22 }));
      orbit.rotation.x = Math.PI / 2; orbit.position.y = cy; orrery.add(orbit);
      const pivot = new THREE.Group(); orrery.add(pivot);
      pivot.add(rod(new THREE.Vector3(0, p.h, 0), new THREE.Vector3(p.r, p.h, 0), 0.022, brass));
      pivot.add(rod(new THREE.Vector3(-0.35, p.h, 0), new THREE.Vector3(0, p.h, 0), 0.03, brassDk));
      const cw = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), brassDk); cw.position.set(-0.38, p.h, 0); pivot.add(cw);
      pivot.add(rod(new THREE.Vector3(p.r, p.h, 0), new THREE.Vector3(p.r, cy - p.s * 0.9, 0), 0.016, brass));
      const cup = new THREE.Mesh(new THREE.TorusGeometry(Math.max(0.05, p.s * 0.45), 0.012, 8, 24), brass); cup.rotation.x = Math.PI / 2; cup.position.set(p.r, cy - p.s * 0.85, 0); pivot.add(cup);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.s, 48, 32), new THREE.MeshStandardMaterial({ map: this._tex(p.tex), roughness: 0.75, metalness: 0 }));
      mesh.position.set(p.r, cy, 0); mesh.castShadow = true; mesh.userData.id = p.id; pivot.add(mesh);
      if (p.ring) {
        const rg = new THREE.Mesh(new THREE.RingGeometry(p.s * 1.35, p.s * 2.15, 96), new THREE.MeshStandardMaterial({ color: 0xE8D3A0, side: THREE.DoubleSide, transparent: true, opacity: 0.85, roughness: 0.6 }));
        rg.rotation.x = -Math.PI / 2 + 0.45; rg.position.copy(mesh.position); pivot.add(rg);
      }
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this._glow('241,213,138'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
      halo.scale.set(p.s * 6, p.s * 6, 1); halo.position.copy(mesh.position); pivot.add(halo);
      return { p, pivot, mesh, orbit, halo };
    });

    const sg = new THREE.BufferGeometry(), spos = [];
    for (let i = 0; i < 1600; i++) { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr = 35 + Math.random() * 15, q = Math.sqrt(1 - u * u); spos.push(rr * q * Math.cos(th), rr * u, rr * q * Math.sin(th)); }
    sg.setAttribute('position', new THREE.Float32BufferAttribute(spos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xEFE6CF, size: 0.09, transparent: true, opacity: 0.8 }));
    scene.add(stars);

    this.mode = { amb, rim, stars, brass };
    this.home = { d: 17.5, y: -0.7 };
    this.cam = { yaw: 0.35, pitch: 0.5, d: 17.5, gyaw: 0.35, gpitch: 0.5, gd: 17.5, target: new THREE.Vector3(0, -0.7, 0), gtarget: new THREE.Vector3(0, -0.7, 0) };
    this.tmp = new THREE.Vector3();
    this.resize();
  };

  Orrery.prototype.resize = function () {
    const w = this.cv.clientWidth || window.innerWidth, h = this.cv.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // layar lebih sempit: mundurkan kamera supaya piringan jam tetap muat
    this.fit = Math.max(1, 1.6 / (w / h));
    this.camera.updateProjectionMatrix();
  };

  Orrery.prototype._bind = function () {
    const THREE = this.THREE, cam = this.cam, cv = this.cv;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const meshes = this.planets.map((x) => x.mesh);
    const pick = (e) => {
      const r = cv.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, this.camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      return hit ? hit.object.userData.id : null;
    };
    let drag = null;
    this.idle = 0;
    const down = (e) => { drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }; this.idle = 0; if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; };
    const move = (e) => {
      if (drag) {
        cam.gyaw -= (e.clientX - drag.x) * 0.006;
        cam.gpitch = Math.max(0.12, Math.min(1.25, cam.gpitch + (e.clientY - drag.y) * 0.004));
        drag.x = e.clientX; drag.y = e.clientY; this.idle = 0; return;
      }
      const id = pick(e);
      cv.style.cursor = id ? 'pointer' : 'grab';
      if (this.opts.onHover) this.opts.onHover(id, e.clientX, e.clientY);
    };
    const up = (e) => {
      if (drag && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 5) { const id = pick(e); if (id) this.focus(id); }
      drag = null; cv.style.cursor = 'grab';
    };
    const leave = () => { if (this.opts.onHover) this.opts.onHover(null); };
    const wheel = (e) => { e.preventDefault(); cam.gd = Math.max(5, Math.min(24, cam.gd * (1 + e.deltaY * 0.001))); this.idle = 0; };
    const onResize = () => this.resize();
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointerleave', leave);
    cv.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('resize', onResize);
    cv.style.cursor = 'grab';
    this._unbind = () => {
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointerleave', leave);
      cv.removeEventListener('wheel', wheel); window.removeEventListener('resize', onResize);
    };
  };

  Orrery.prototype._relabel = function () {
    this.labels.forEach((l) => {
      const old = l.sp.material.map;
      l.sp.material.map = this._labelTex(this.labelText[l.k]);
      l.sp.material.needsUpdate = true;
      if (old) old.dispose();
    });
  };

  Orrery.prototype.setLabels = function (txt) { this.labelText = txt; this._relabel(); };

  Orrery.prototype.setDay = function (d) {
    this.day = !!d;
    const m = this.mode;
    this.renderer.toneMappingExposure = d ? 1.2 : 1.05;
    m.amb.intensity = d ? 1.1 : 0.5;
    m.amb.color.setHex(d ? 0xFFE8D6 : 0x4A5590);
    m.stars.material.opacity = d ? 0 : 0.8;
    m.brass.color.setHex(d ? 0xC08A5A : 0xC9A45C);
    this.glow.material.opacity = d ? 0.45 : 1;
    m.rim.color.setHex(d ? 0xFFC9A8 : 0x7F9BFF);
    this._relabel();
  };

  Orrery.prototype.setLever = function (i, planetId) { this.lever = i; this.litId = planetId; };

  Orrery.prototype.focus = function (id) {
    const p = this.planets.find((x) => x.p.id === id);
    if (!p) return;
    this.sel = id;
    this.cam.gd = 1.4 + p.p.s * 7; this.cam.gpitch = 0.32;
    if (this.opts.onPick) this.opts.onPick(id);
  };

  Orrery.prototype.back = function () {
    this.sel = null;
    this.cam.gtarget.set(0, this.home.y, 0); this.cam.gd = this.home.d; this.cam.gpitch = 0.5;
  };

  Orrery.prototype.pause = function () { this.running = false; };
  Orrery.prototype.resume = function () {
    if (this.running) return;
    this.running = true; this.last = performance.now(); this.resize();
    this.raf = requestAnimationFrame(this._loop);
  };

  Orrery.prototype._loop = function (now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.t += dt; this.idle += dt;
    const t = this.t, cam = this.cam;
    this.lv += (this.lever - this.lv) * 0.1;
    const off = this.lv - 4;
    this.planets.forEach((x) => {
      x.pivot.rotation.y = -(x.p.a0 + t * 2 * Math.PI / x.p.T + off * 9 / x.p.T);
      x.mesh.rotation.y += dt * 0.6;
      const lit = x.p.id === this.litId, sel = x.p.id === this.sel;
      x.orbit.material.opacity += ((lit ? 0.85 : 0.2) - x.orbit.material.opacity) * 0.1;
      x.orbit.material.color.setHex(lit ? 0xF1D58A : 0xC9A45C);
      x.halo.material.opacity += (((lit || sel) ? 0.75 : 0) - x.halo.material.opacity) * 0.1;
    });
    this.needle.rotation.y = -(off * 22.5) * Math.PI / 180;
    this.g1.rotation.y = t * 0.25; this.g2.rotation.y = -t * 0.5 + 0.13; this.g3.rotation.y = -t * 0.375;
    this.sun.material.emissiveIntensity = 1.5 + Math.sin(t * 1.6) * 0.25;
    this.glow.scale.setScalar(3.4 + Math.sin(t * 1.6) * 0.25);
    if (this.sel) {
      const f = this.planets.find((x) => x.p.id === this.sel);
      f.mesh.getWorldPosition(this.tmp); cam.gtarget.copy(this.tmp);
    } else if (this.idle > 4) { cam.gyaw += dt * 0.04; }
    cam.yaw += (cam.gyaw - cam.yaw) * 0.08; cam.pitch += (cam.gpitch - cam.pitch) * 0.08; cam.d += (cam.gd - cam.d) * 0.06;
    cam.target.lerp(cam.gtarget, 0.07);
    const d = cam.d * (this.sel ? 1 : this.fit);
    this.camera.position.set(cam.target.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * d, cam.target.y + Math.sin(cam.pitch) * d, cam.target.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * d);
    this.camera.lookAt(cam.target);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this._loop);
  };

  Orrery.prototype.dispose = function () {
    this.running = false;
    cancelAnimationFrame(this.raf);
    if (this._unbind) this._unbind();
    this.renderer.dispose();
  };

  window.JK = window.JK || {};
  window.JK.Orrery = Orrery;
})();
