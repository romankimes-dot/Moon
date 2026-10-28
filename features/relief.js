// Relief et mémoire : sites historiques réels, crevasses, dunes de rochers, traces de pas et de roues, cratères à récolter.
(() => {
  const { S, on, THREE, scene, H, CH, CELLS, CS, RINGS, ringOf, chunks, views, OBST, MAT, M, LIT, put, rod, box, cyl, sph, tex, modal, pop, sfx, player, mulberry, fmt, glowFx } = MS;
  S.sites ??= {}; S.craters ??= {};
  const n0 = scene.children.length;   // repère : tout ce que l'extension ajoute à la scène est marqué userData.relief
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z), ring = (x, z) => ringOf(Math.round(x / CH), Math.round(z / CH));
  const rockMat = M(0x8a867e, { roughness: 1, flatShading: true }), printMat = new THREE.MeshBasicMaterial({ color: 0x3a3630, transparent: true, opacity: .85, depthWrite: false });

  // ===== Poussière : nettoie les cases dont le centre passe `test`, et repeint la texture du secteur si elle existe =====
  function clearCells(x0, z0, x1, z1, test) {
    for (let cx = Math.round(x0 / CH); cx <= Math.round(x1 / CH); cx++) for (let cz = Math.round(z0 / CH); cz <= Math.round(z1 / CH); cz++) {
      const c = chunks.get(cx + ',' + cz); if (!c || c.done) continue;
      const ox = cx * CH - CH / 2, oz = cz * CH - CH / 2, v = views.get(c.k), g = v && v.ctx, s = g ? v.tex.image.width / CELLS : 0;
      if (g) { g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; }
      let n = 0;
      for (let gz = Math.max(0, Math.floor((z0 - oz) / CS)); gz <= Math.min(CELLS - 1, Math.floor((z1 - oz) / CS)); gz++)
        for (let gx = Math.max(0, Math.floor((x0 - ox) / CS)); gx <= Math.min(CELLS - 1, Math.floor((x1 - ox) / CS)); gx++) {
          const i = gz * CELLS + gx; if (!c.h[i] || !test(ox + (gx + .5) * CS, oz + (gz + .5) * CS)) continue;
          c.h[i] = 0; n++; if (g) g.fillRect(gx * s, gz * s, s, s);
        }
      if (n) { c.clean += n; c.sv = 1; if (g) v.dirty = true; }
    }
  }
  const clearDisc = (x, z, r) => clearCells(x - r, z - r, x + r, z + r, (wx, wz) => (wx - x) ** 2 + (wz - z) ** 2 < r * r);
  const clearRect = (x, z, hw, hd) => clearCells(x - hw, z - hd, x + hw, z + hd, () => true);

  // ===== Plaque commémorative : poteau, panneau, texte =====
  const plaque = (par, l1, l2, x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); par.add(g);
    put(g, cyl(.03, .035, .7, 8), MAT.steel, 0, .35, 0);
    const p = put(g, box(.96, .5, .04), MAT.steel, 0, .9, 0); p.rotation.x = -.35;
    const t = tex(256, 128, c => { c.fillStyle = '#1b1d24'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#ff8a2a'; c.lineWidth = 4; c.strokeRect(8, 8, 240, 112);
      c.fillStyle = '#f2ede2'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 40px Barlow Condensed, Arial Narrow, sans-serif'; c.fillText(l1, 128, 46); c.font = '500 30px Barlow Condensed, Arial Narrow, sans-serif'; c.fillStyle = '#ffc542'; c.fillText(l2, 128, 90); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, .45), new THREE.MeshBasicMaterial({ map: t })); m.position.set(0, 0, .025); p.add(m);
    OBST.push({ x: par.position.x + x, z: par.position.z + z, r: .35 });
  };
  // ===== Sites historiques (anecdotes vérifiées) =====
  const SITES = [
    { id: 'a11', x: 28, z: 35, name: 'Apollo 11', when: 'Mer de la Tranquillité · 20 juillet 1969', l2: '20 juillet 1969', prints: 36,
      txt: 'Le 20 juillet 1969, Neil Armstrong et Buzz Aldrin ont passé environ deux heures et demie hors du module Eagle, premiers humains à marcher sur la Lune. Sans vent ni pluie, leurs empreintes sont toujours intactes aujourd’hui.',
      build(g) {   // sismomètre passif (PSEP) laissé sur place, avec ses deux panneaux solaires
        put(g, box(.5, .26, .5), MAT.white, 0, .13, 0); put(g, cyl(.02, .02, .8, 6), MAT.steel, 0, .6, 0);
        for (const s of [-1, 1]) put(g, box(.62, .02, .5), MAT.navy, s * .62, .3, 0).rotation.z = -s * .35;
        OBST.push({ x: this.x, z: this.z, r: .9 });
      } },
    { id: 'a12', x: -63, z: -10, name: 'Apollo 12 · Surveyor 3', when: 'Océan des Tempêtes · 19 novembre 1969', l2: 'Surveyor 3 · 1967-1969', prints: 14,
      txt: 'Le 19 novembre 1969, Pete Conrad et Alan Bean ont posé Intrepid à moins de 200 m de la sonde Surveyor 3, arrivée en 1967. Ils en ont rapporté la caméra pour étudier deux ans et demi d’exposition à l’espace.',
      build(g) {   // Surveyor 3 : tripode, mât et panneau solaire
        put(g, box(.45, .25, .45), MAT.white, 0, .75, 0); put(g, cyl(.025, .025, 1.2, 8), MAT.steel, 0, 1.4, 0);
        put(g, box(.55, .02, .6), MAT.navy, 0, 2, 0).rotation.x = .5; put(g, cyl(.06, .06, .14, 10), MAT.dark, .2, 1.05, .1);
        for (let i = 0; i < 3; i++) { const a = i * 2.094 + .5, fx = Math.cos(a) * 1.1, fz = Math.sin(a) * 1.1; rod(g, V3(Math.cos(a) * .2, .7, Math.sin(a) * .2), V3(fx, .05, fz), .025, MAT.steel); put(g, sph(.09, 10, 6), MAT.grey, fx, .05, fz); }
        OBST.push({ x: this.x, z: this.z, r: 1.2 });
      } },
    { id: 'a15', x: 77, z: -45, name: 'Apollo 15', when: 'Hadley-Apennins · 2 août 1971', l2: 'Marteau et plume · 1971', prints: 10,
      txt: 'Le 2 août 1971, Dave Scott a lâché en même temps un marteau et une plume de faucon devant la caméra : sans air, les deux ont touché le sol ensemble, comme Galilée l’avait prédit. Ils sont restés là.',
      build(g) {   // le marteau et la plume, au sol
        put(g, cyl(.022, .022, .4, 8), MAT.orange, -.3, .03, .2).rotation.set(1.571, 0, .4); put(g, box(.13, .07, .06), MAT.steel, -.46, .04, .36);
        put(g, box(.05, .006, .24), MAT.white, .3, .01, .1).rotation.y = .6; put(g, cyl(.005, .005, .28, 5), MAT.dark, .3, .012, .1).rotation.set(1.571, 0, .6);
      } },
    { id: 'a17', x: -106, z: 69, name: 'Apollo 17', when: 'Taurus-Littrow · 14 décembre 1972', l2: 'Dernier pas · 1972', prints: 18,
      txt: 'Le 14 décembre 1972, Gene Cernan a été le dernier homme à marcher sur la Lune. Avant de remonter dans Challenger, il a tracé dans la poussière les initiales de sa fille Tracy, « TDC ».',
      build(g) {   // les initiales tracées au sol
        const t = tex(256, 128, c => { c.fillStyle = '#3a3630'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 96px Barlow Condensed, Arial Narrow, sans-serif'; c.fillText('TDC', 128, 64); });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.rotation.set(-1.571, 0, .3); m.position.set(0, .03, 0); m.renderOrder = 2; g.add(m);
      } },
    { id: 'l9', x: 104, z: -24, name: 'Luna 9', when: 'Océan des Tempêtes · 3 février 1966', l2: 'Luna 9 · 1966', prints: 0,
      txt: 'Le 3 février 1966, la sonde soviétique Luna 9 a réussi le premier atterrissage en douceur sur la Lune. Ses quatre pétales se sont ouverts et elle a transmis les premières photos prises depuis le sol lunaire.',
      build(g) {   // la sonde : œuf central, quatre pétales ouverts, quatre antennes
        put(g, sph(.3, 20, 14), MAT.steel, 0, .38, 0).scale.y = 1.25; put(g, cyl(.08, .1, .12, 12), MAT.dark, 0, .78, 0);
        for (let i = 0; i < 4; i++) { const a = i * 1.571 + .785, p = put(g, box(.42, .03, .5), MAT.suitGrey, Math.cos(a) * .5, .12, Math.sin(a) * .5); p.rotation.set(0, -a + 1.571, 0); p.rotateX(-.35);
          const an = put(g, cyl(.008, .008, .9, 5), MAT.steel, Math.cos(a + .785) * .45, .55, Math.sin(a + .785) * .45); an.rotation.set(0, -a - .785, 0); an.rotateZ(-.6); }
        OBST.push({ x: this.x, z: this.z, r: .9 });
      } },
    { id: 'ce4', x: -122, z: -92, name: 'Chang’e 4 · Yutu-2', when: 'Face cachée, cratère Von Kármán · 3 janvier 2019', l2: 'Face cachée · 2019', prints: 0,
      txt: 'Le 3 janvier 2019, Chang’e 4 a réussi le premier atterrissage sur la face cachée de la Lune, dans le cratère Von Kármán. Son rover Yutu-2, le plus endurant jamais envoyé sur la Lune, communique avec la Terre grâce au satellite relais Queqiao.',
      build(g) {   // l'atterrisseur et, à côté, le petit rover à six roues
        put(g, box(1.5, .8, 1.5), MAT.gold, 0, 1, 0); put(g, cyl(.28, .28, .3, 16), MAT.white, 0, 1.55, 0);
        for (const s of [-1, 1]) put(g, box(.9, .02, 1.3), MAT.navy, s * 1.25, 1.1, 0).rotation.z = s * .2;
        for (let i = 0; i < 4; i++) { const a = i * 1.571 + .785; rod(g, V3(Math.cos(a) * .7, .7, Math.sin(a) * .7), V3(Math.cos(a) * 1.5, .05, Math.sin(a) * 1.5), .035, MAT.steel); }
        const r = new THREE.Group(); r.position.set(3, 0, 1.2); r.rotation.y = .8; g.add(r);
        put(r, box(.9, .32, .6), MAT.gold, 0, .5, 0); put(r, cyl(.02, .02, .7, 6), MAT.steel, .2, 1, 0); put(r, box(.22, .1, .08), MAT.dark, .2, 1.35, 0);
        for (const s of [-1, 1]) put(r, box(.5, .02, .7), MAT.navy, 0, .68, s * .62).rotation.x = s * .4;
        for (let i = 0; i < 6; i++) put(r, cyl(.13, .13, .1, 12), MAT.tire, (i % 3 - 1) * .4, .14, (i < 3 ? -1 : 1) * .42).rotation.x = 1.571;
        OBST.push({ x: this.x, z: this.z, r: 1.6 }, { x: this.x + 2.6, z: this.z + 2, r: .8 });
      } }
  ];
  let printsStatic = null;   // empreintes figées autour des sites (une seule InstancedMesh)
  const SITE_R = 3.6;
  function buildSites() {
    const total = SITES.reduce((a, s) => a + s.prints, 0), geo = new THREE.BoxGeometry(.12, .012, .28), m4 = new THREE.Matrix4();
    printsStatic = new THREE.InstancedMesh(geo, printMat, Math.max(1, total)); printsStatic.frustumCulled = false; printsStatic.renderOrder = 2; let n = 0;
    for (const s of SITES) {
      s.ring = ring(s.x, s.z); s.mult = RINGS[s.ring].mult;
      const g = new THREE.Group(); g.position.set(s.x, H(s.x, s.z), s.z); scene.add(g); s.g = g;
      s.build(g); plaque(g, s.name, s.l2, 0, 2.2);
      const r = mulberry(s.x * 31 + s.z * 7);
      for (let i = 0; i < s.prints; i++) { const a = r() * 6.283, d = 1.3 + r() * 2, x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d;
        m4.makeRotationY(r() * 6.283); m4.setPosition(x, H(x, z) + .03, z); printsStatic.setMatrixAt(n++, m4); }
      clearDisc(s.x, s.z, SITE_R);
    }
    if (!total) printsStatic.setMatrixAt(0, m4.makeScale(0, 0, 0));
    printsStatic.instanceMatrix.needsUpdate = true; scene.add(printsStatic);
  }
  function visitSite(s) {
    S.sites[s.id] = true; const bonus = Math.round(200 * s.mult); S.money += bonus; sfx.find(); MS.markSave();
    glowFx.burst(s.x, H(s.x, s.z) + 1, s.z, 80, 5, 1.5, [0xffc542, 0xffffff, 0xff8a2a], 3); pop('+$' + fmt(bonus), 'gold');
    modal('Site historique · ' + s.when.split(' · ').pop(), s.name, s.txt, '+$' + fmt(bonus), null, 'Respect');
  }

  // ===== Crevasses : fentes sombres plates qui suivent le sol, obstacle rectangulaire infranchissable =====
  const CREV = [[31, -44, 'x', 16], [-54, 56, 'z', 14], [61, -62, 'z', 12], [-89, -58, 'x', 18], [110, 30, 'x', 12], [-30, 120, 'z', 15]];
  function strip(list, wk, lift) {   // ruban (x, z, demi-largeur) → une géométrie fusionnée pour toutes les crevasses
    const pos = [], idx = []; let b = 0;
    for (const [x, z, ax, L] of list) {
      const N = 14, r = mulberry(x * 3 + z);
      for (let i = 0; i <= N; i++) { const t = i / N, u = (t - .5) * L, w = wk * (.25 + .75 * Math.sin(t * 3.1416)) * (.8 + .4 * r()), off = Math.sin(t * 9 + x) * .35;
        const cx = ax === 'x' ? x + u : x + off, cz = ax === 'x' ? z + off : z + u, nx = ax === 'x' ? 0 : w, nz = ax === 'x' ? w : 0;
        pos.push(cx - nx, H(cx - nx, cz - nz) + lift, cz - nz, cx + nx, H(cx + nx, cz + nz) + lift, cz + nz);
        if (i) idx.push(b - 2, b - 1, b, b - 1, b + 1, b); b += 2; }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: lift > .05 ? 0x04050a : 0x2c2b30, side: THREE.DoubleSide, transparent: true, depthWrite: false })); m.renderOrder = 2; m.frustumCulled = false; scene.add(m);
  }
  function buildCrevasses() {
    strip(CREV, 1.15, .05); strip(CREV, .8, .06);
    for (const [x, z, ax, L] of CREV) { const hw = ax === 'x' ? L / 2 : 1, hd = ax === 'x' ? 1 : L / 2; OBST.push({ x, z, hw, hd }); clearRect(x, z, hw + .4, hd + .4); }
  }

  // ===== Dunes : crêtes signalées par des arcs de rochers ronds =====
  const DUNES = [[-34, -14], [26, 60], [-72, -38], [62, 81], [-110, 20], [36, -104], [124, -70], [-65, -120]];
  function buildDunes() {
    const N = 9, mesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 1), rockMat, DUNES.length * N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    mesh.castShadow = true; mesh.frustumCulled = false; let n = 0;
    DUNES.forEach(([x, z], d) => { const r = mulberry(d * 97 + 5), a0 = r() * 6.283, R = 6 + r() * 3;
      for (let i = 0; i < N; i++) { const a = a0 + (i / (N - 1) - .5) * 2.2, s = .45 + .6 * Math.sin(i / (N - 1) * 3.1416) + r() * .2, px = x + Math.cos(a) * R, pz = z + Math.sin(a) * R;
        p.set(px, H(px, pz) + s * .2, pz); e.set(r() * 3, r() * 3, 0); q.setFromEuler(e); sc.set(s, s * .55, s); m4.compose(p, q, sc); mesh.setMatrixAt(n++, m4); } });
    mesh.instanceMatrix.needsUpdate = true; scene.add(mesh);
  }

  // ===== Cratères à récolter : mêmes cratères que le jeu (mulberry(42)), les 10 plus gros, un éclat au fond =====
  const CR = []; { const r = mulberry(42);
    for (let i = 0; i < 300; i++) { const x = (r() * 2 - 1) * 200, z = (r() * 2 - 1) * 200, R = r() < .12 ? 8 + r() * 12 : 2 + r() * 5; if (Math.hypot(x, z) < R + 13) continue; CR.push({ x, z, R }); } }
  const BIG = [];
  for (const c of CR.slice().sort((a, b) => b.R - a.R)) {
    if (Math.max(Math.abs(c.x), Math.abs(c.z)) > 141 - c.R || Math.min(Math.abs(c.x), Math.abs(c.z)) < c.R + 6 || BIG.some(b => Math.hypot(b.x - c.x, b.z - c.z) < b.R + c.R + 4)) continue;
    BIG.push(c); if (BIG.length === 10) break;
  }
  let glints = null; const ringMat = LIT(0xff8a2a, 1.6);
  function buildCraters() {
    glints = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.55, 0), LIT(0xffe08a, 3), BIG.length); glints.frustumCulled = false;
    BIG.forEach((c, i) => {
      c.y = H(c.x, c.z) + .7; c.mult = RINGS[Math.min(4, ring(c.x, c.z))].mult;
      // anneau orange au bord, ruban qui épouse le relief
      const pos = [], idx = [], N = 64;
      for (let k = 0; k <= N; k++) { const a = k / N * 6.283, ca = Math.cos(a), sa = Math.sin(a);
        for (const rr of [c.R * .98, c.R * 1.04]) { const x = c.x + ca * rr, z = c.z + sa * rr; pos.push(x, H(x, z) + .12, z); }
        if (k) { const b = k * 2; idx.push(b - 2, b - 1, b, b - 1, b + 1, b); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      c.ring = new THREE.Mesh(g, ringMat); c.ring.visible = !S.craters[i]; scene.add(c.ring); glints.setMatrixAt(i, ZERO);
    });
    scene.add(glints);
  }

  // ===== Traces : empreintes (à pied) et sillons (en engin), instances recyclées, effacées après 60 s =====
  const FOOT = 200, RUT = 400, LIFE = 60, ZERO = new THREE.Matrix4().makeScale(0, 0, 0), m4 = new THREE.Matrix4();
  const mkTrail = (geo, n) => { const m = new THREE.InstancedMesh(geo, printMat, n); m.frustumCulled = false; m.renderOrder = 2; for (let i = 0; i < n; i++) m.setMatrixAt(i, ZERO); scene.add(m); return { m, born: new Float32Array(n).fill(-1e9), i: 0, d: 0, side: 1 }; };
  const foot = mkTrail(new THREE.BoxGeometry(.13, .012, .3), FOOT), rut = mkTrail(new THREE.BoxGeometry(.14, .012, .8), RUT);
  function stamp(tr, x, z, ry, time) { m4.makeRotationY(ry); m4.setPosition(x, H(x, z) + .03, z); tr.m.setMatrixAt(tr.i, m4); tr.born[tr.i] = time; tr.i = (tr.i + 1) % tr.born.length; tr.m.instanceMatrix.needsUpdate = true; }
  function expire(tr, time) { const b = tr.born; let u = false; for (let i = 0; i < b.length; i++) if (b[i] > -1e8 && time - b[i] > LIFE) { b[i] = -1e9; tr.m.setMatrixAt(i, ZERO); u = true; } if (u) tr.m.instanceMatrix.needsUpdate = true; }

  // construction : tout de suite (MS est complet quand l'extension se charge) ; « load » reste là si l'ordre de chargement change
  let built = false; const build = () => { if (built) return; built = true; buildSites(); buildCrevasses(); buildDunes(); buildCraters(); for (let i = n0; i < scene.children.length; i++) scene.children[i].userData.relief = 1; };
  on('load', build); build();

  on('frame', (dt, f) => {
    const P = f.P, time = f.time, ry = player.rotation.y, sx = Math.sin(ry), cx = Math.cos(ry);
    // traces derrière le joueur
    if (f.moved > 0) {
      if (f.riding) { rut.d += f.moved; if (rut.d >= .75) { rut.d = 0; const w = Math.min(3, Math.max(.9, f.t.w * .28)); stamp(rut, P.x - sx * .5 + cx * w, P.z - cx * .5 - sx * w, ry, time); stamp(rut, P.x - sx * .5 - cx * w, P.z - cx * .5 + sx * w, ry, time); } }
      else { foot.d += f.moved; if (foot.d >= .7) { foot.d = 0; foot.side = -foot.side; stamp(foot, P.x - sx * .25 + cx * foot.side * .17, P.z - cx * .25 - sx * foot.side * .17, ry, time); } }
    }
    expire(foot, time); expire(rut, time);
    if (!glints) return;
    // éclats des cratères : tournent, se ramassent une fois
    let u = false;
    for (let i = 0; i < BIG.length; i++) {
      const c = BIG[i]; if (S.craters[i]) continue;
      m4.makeRotationY(time * 1.5 + i); m4.setPosition(c.x, c.y + Math.sin(time * 3 + i) * .12, c.z); glints.setMatrixAt(i, m4); u = true;
      if (!f.paused && Math.hypot(c.x - P.x, c.z - P.z) < 1.5 + f.t.w * .4) {
        S.craters[i] = true; c.ring.visible = false; glints.setMatrixAt(i, ZERO); const v = Math.round(300 * c.mult); S.money += v; sfx.cash(); sfx.pop(); pop('Fond de cratère +$' + fmt(v), 'gold'); MS.markSave();
        glowFx.burst(c.x, c.y, c.z, 70, 5, 1.2, [0xffe08a, 0xff8a2a, 0xffffff], 4);
      }
    }
    if (u) glints.instanceMatrix.needsUpdate = true;
    // sites historiques : première visite à moins de 4 m
    if (!f.paused) for (let i = 0; i < SITES.length; i++) { const s = SITES[i]; if (!S.sites[s.id] && Math.abs(s.x - P.x) < 4 && Math.abs(s.z - P.z) < 4 && Math.hypot(s.x - P.x, s.z - P.z) < 4) visitSite(s); }
  });
})();
