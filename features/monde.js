// features/monde.js — le monde vit : cycle jour/nuit lunaire, événements aléatoires (éclipse, pluie d'étoiles, touriste)
// et faune absurde (taupe lunaire, chat astronaute). Tout passe par MS ; zéro allocation par image dans 'frame'.
(() => {
  const { S, on, THREE, scene, sun, sky, player, toast, pop, say, radio, fmt, sfx, tone, LIT, M, P, put, sph, cyl, box, glow, tex, glowFx, dustFx,
    astronaut, collide, inObst, OBST, BASE, PAD_R, RINGS, chunkAt, H, lim, dusty, has, BADGES, toggle, chip, markSave, clamp, MAT, ST, CELLS, capsule, rbox, rod } = MS;
  const JOUR = 20 * 60e3, NC = CELLS * CELLS, TAU = 6.2832;
  S.monde ??= { cycle: true, t0: Date.now() - 150e3, evT: 240 + Math.random() * 240, nuit: -1, taupe: 0, chat: 0 };
  const W = S.monde; if (W.cycle == null) W.cycle = true;

  // ----- lignes radio propres aux événements -----
  ST.radio.push(
    { when: 'eclipse', text: 'Éclipse ! La Terre passe devant le Soleil. Profites-en : la poussière se vend double, c’est l’effet ombre.' },
    { when: 'eclipse', text: 'Tout s’éteint… Pas de panique, c’est la Terre qui fait de l’ombre. Prime ×2 le temps que ça dure !' },
    { when: 'pluie', text: 'Pluie d’étoiles ! Ramasse les éclats avant qu’ils refroidissent. Enfin, ils sont déjà à -170 °C.' },
    { when: 'pluie', text: 'Ça scintille partout ! Chaque éclat vaut des sous. Ramassoux n’a jamais vu ça. Ramassoux n’a jamais rien vu.' },
    { when: 'touriste', text: 'Un touriste s’est perdu près de toi. Ramène-le à la base, l’agence paie bien. Et il a l’air de paniquer.' },
    { when: 'touriste', text: 'Visiteur égaré en vue ! Guide-le jusqu’à la base. Non, on ne le laisse pas là. Même s’il parle beaucoup.' },
    { when: 'touristeOk', text: 'Touriste livré ! Il a laissé 5 étoiles et une photo de ses pieds. On encaisse.' },
    { when: 'touristeOk', text: 'Sauvetage réussi ! Il voulait un selfie avec toi. Je lui ai dit que tu étais timide.' },
    { when: 'touristeKo', text: 'Le touriste est reparti seul. Il dit qu’il connaît un raccourci. Il n’y a pas de raccourci.' }
  );

  // ===== 1. Cycle jour/nuit =====
  let hemi = null, rim = null; for (const o of scene.children) { if (o.isHemisphereLight) hemi = o; else if (o.isDirectionalLight && o !== sun) rim = o; }
  const dome = sky.children[0], sunSpr = sky.children.find(o => o.isSprite && o.scale.x === 260), earth = sky.userData.earth;
  const lamp = player.children.find(o => o.isSpotLight);
  const C = (h) => new THREE.Color(h);
  const SUN_J = C(0xfff1dc), SUN_C = C(0xff9348), SUN_N = C(0x9fb8ff), FOG_J = C(0x12172a), FOG_N = C(0x060a16), FOG_C = C(0x2a1a14), BG_J = C(0x03040a), BG_N = C(0x060a16),
    HE_J = C(0xb8c6ff), HE_N = C(0x7d9cff), HG_J = C(0x6b5f50), HG_N = C(0x1a2240), DOME_N = C(0x7080c0), DOME_C = C(0xffb080), EM_J = C(0x0a1a33), EM_N = C(0x24498a), BLANC = C(0xffffff);
  const DIR = new THREE.Vector3(), SOL = new THREE.Vector3(), TERRE = new THREE.Vector3(260, 230, -620).normalize(), PERP = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  let jour = 1, crep = 0, elev = 1, ecl = 1, envK = 1, envT = 0;
  // l'éclairage d'ambiance (scene.environment) ne dépend d'aucune lampe : on module envMapIntensity de tous les matériaux, au plus 2 fois par seconde
  const envApply = o => { const m = o.material; if (m && m.envMapIntensity !== undefined) { if (m.userData.envI === undefined) m.userData.envI = m.envMapIntensity; m.envMapIntensity = m.userData.envI * envK; } };
  function ambiance(dt) {
    envT -= dt; if (envT > 0) return; envT = .5;
    const k = (.15 + .85 * jour) * (.12 + .88 * ecl); if (Math.abs(k - envK) < .02 && k !== 1) return; if (k === envK) return;
    envK = k; scene.traverse(envApply);
  }   // facteur de jour (0 nuit, 1 jour), crépuscule (pic à mi-chemin), hauteur du Soleil, assombrissement d'éclipse
  const phase = () => W.cycle ? (((Date.now() - W.t0) / JOUR) % 1 + 1) % 1 : .25;
  function ciel(dt, f) {
    const a = phase() * TAU; elev = Math.sin(a);
    SOL.set(-Math.cos(a), elev, .45).normalize();
    const d = clamp((elev + .08) / .3, 0, 1); jour = d * d * (3 - 2 * d); crep = 1 - Math.abs(2 * jour - 1);
    // la nuit, c'est la Terre qui éclaire : la lumière directionnelle glisse vers elle, en bleu doux
    DIR.copy(SOL).setY(Math.max(SOL.y, .08)).lerp(TERRE, 1 - jour).normalize();
    sun.position.copy(sun.target.position).addScaledVector(DIR, 90);
    sun.intensity = (1.15 * jour + .22 * (1 - jour)) * ecl;
    sun.color.copy(SUN_J).lerp(SUN_C, crep * .85).lerp(SUN_N, 1 - jour);
    hemi.intensity = (.4 + .14 * (1 - jour)) * (.45 + .55 * ecl);
    hemi.color.copy(HE_J).lerp(HE_N, 1 - jour); hemi.groundColor.copy(HG_J).lerp(HG_N, 1 - jour);
    rim.intensity = .45 + .3 * (1 - jour);
    scene.fog.color.copy(FOG_J).lerp(FOG_C, crep * .5).lerp(FOG_N, 1 - jour).multiplyScalar(.35 + .65 * ecl);
    scene.background.copy(BG_J).lerp(BG_N, 1 - jour);
    dome.material.color.copy(BLANC).lerp(DOME_C, crep * .6).lerp(DOME_N, 1 - jour).multiplyScalar(.35 + .65 * ecl);
    sunSpr.position.copy(SOL).multiplyScalar(850); sunSpr.material.opacity = clamp((elev + .12) * 5, 0, 1);
    sunSpr.material.color.copy(BLANC).lerp(SUN_C, crep * .7);
    earth.material.emissive.copy(EM_J).lerp(EM_N, 1 - jour);
    // lampe frontale : indispensable la nuit si on l'a (ou en engin)
    const nuitK = (1 - jour) + (1 - ecl) * .6;
    lamp.intensity = f.riding || has('lamp') ? 2.2 + 5 * nuitK : 0; lamp.distance = 28 + 16 * nuitK;
    ambiance(dt);
    // message radio une fois par nuit
    if (W.cycle && jour < .02) { const n = Math.floor((Date.now() - W.t0) / JOUR); if (W.nuit !== n) { W.nuit = n; radio('night'); markSave(); } }
  }
  toggle('Cycle jour/nuit', 'Un jour lunaire = 20 min. Désactivé : jour permanent.', () => !!W.cycle, v => { W.cycle = v; });

  // ===== 2. Événements aléatoires =====
  const evChip = chip('', 'ev'); evChip.hidden = true; let chipT = 0;
  const EV = { nom: null, t: 0, dur: 0 };
  const chipTxt = (s) => { if (evChip.textContent !== s) evChip.textContent = s; };

  // --- éclipse : la Terre passe devant le Soleil ---
  const discT = tex(64, 64, g => { const r = g.createRadialGradient(32, 32, 24, 32, 32, 31); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discT, color: 0x000000, transparent: true, depthWrite: false, fog: false })); disc.scale.set(120, 120, 1); disc.renderOrder = 1; disc.visible = false; sky.add(disc);
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow('rgba(255,250,230,0)', 'rgba(255,235,190,.85)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, toneMapped: false })); corona.scale.set(420, 420, 1); corona.renderOrder = 2; corona.visible = false; sky.add(corona);
  const bell = (t, dur) => { const k = t < 12 ? t / 12 : t > dur - 12 ? (dur - t) / 12 : 1; return clamp(k, 0, 1); };
  function eclipse(dt) {
    const b = bell(EV.t, EV.dur), bb = b * b * (3 - 2 * b); ecl = 1 - .9 * bb;
    PERP.crossVectors(SOL, UP).normalize();
    disc.position.copy(SOL).multiplyScalar(830).addScaledVector(PERP, (EV.dur / 2 - EV.t) / (EV.dur / 2) * 150);
    corona.position.copy(SOL).multiplyScalar(840); corona.material.opacity = bb * .9;
  }
  const eclOn = () => EV.nom === 'eclipse' && ecl < .7;
  on('sell', v => { if (eclOn() && v > 0) { S.money += v; pop('Éclipse ×2 · +$' + fmt(v), 'gold'); } });
  on('nugget', c => { if (eclOn()) { const v = Math.round(30 * RINGS[c.ring].mult * (1 + S.found.length * .1)); S.money += v; pop('Éclipse ×2 · +$' + fmt(v), 'gold'); } });

  // --- pluie d'étoiles : des éclats tombent et se ramassent ---
  const ECL = []; const eclGeo = sph(.3, 12, 8), eclMat = LIT(0xfff1c0, 3);
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(eclGeo, eclMat); m.visible = false; scene.add(m); ECL.push({ m, on: false, t: 0, x: 0, z: 0, y: 0, val: 0, fx: 0, fz: 0 }); }
  const PL = { n: 0, i: 0, next: 0 };
  function ecart(out, r0, r1) { // point libre autour du joueur (hors obstacles, hors plateforme, dans la zone)
    const P = player.position;
    for (let k = 0; k < 10; k++) {
      const a = Math.random() * TAU, d = r0 + Math.random() * (r1 - r0);
      out.x = clamp(P.x + Math.cos(a) * d, -lim() + 2, lim() - 2); out.z = clamp(P.z + Math.sin(a) * d, -lim() + 2, lim() - 2);
      let ok = Math.hypot(out.x - BASE.x, out.z - BASE.z) > PAD_R + 1.5;
      for (let j = 0; ok && j < OBST.length; j++) if (!OBST[j].pass && inObst(OBST[j], out.x, out.z, .8)) ok = false;
      if (ok) return;
    }
  }
  const TMP = { x: 0, z: 0 };
  function pluie(dt) {
    const P = player.position;
    if (PL.i < PL.n && EV.t >= PL.next) { // un éclat de plus
      const e = ECL[PL.i++]; PL.next = EV.t + 1.4 + Math.random() * 1.2;
      ecart(TMP, 4, 15); e.x = TMP.x; e.z = TMP.z; e.y = H(e.x, e.z); e.t = 0; e.on = true; e.m.visible = true; e.fx = e.x + 40; e.fz = e.z - 25;
      const c = chunkAt(e.x, e.z); e.val = Math.round(40 * (c ? RINGS[c.ring].mult : 1) * (1 + S.chapter)); tone(1600 + Math.random() * 400, .9, 'sine', .04, 500);
    }
  }
  function eclats(dt, f) {
    const P = player.position;
    for (let i = 0; i < 8; i++) { const e = ECL[i]; if (!e.on) continue;
      e.t += dt;
      if (e.t < 1.6) { const k = Math.min(1, e.t / 1.6), kk = k * k; e.m.position.set(e.fx + (e.x - e.fx) * kk, 70 + (e.y - 70) * kk, e.fz + (e.z - e.fz) * kk);
        for (let j = 0; j < 2; j++) glowFx.add(e.m.position.x + (Math.random() - .5) * .3, e.m.position.y, e.m.position.z + (Math.random() - .5) * .3, 0, 0, 0, .7, j ? 0xffc542 : 0xffffff, 0);
        if (k >= 1) { glowFx.burst(e.x, e.y + .4, e.z, 40, 5, 1, [0xffc542, 0xffffff], 5); dustFx.burst(e.x, e.y + .2, e.z, 30, 4, .9, [0xb7b2a8], 6); tone(520, .3, 'triangle', .06, 900); } }
      else { e.m.position.set(e.x, e.y + .3 + Math.sin(f.time * 3 + i) * .08, e.z); e.m.rotation.y += dt * 2;
        if (Math.random() < .15) glowFx.add(e.x + (Math.random() - .5), e.y + .4, e.z + (Math.random() - .5), 0, 1.2, 0, .5, 0xffc542, 0);
        if (!f.paused && Math.hypot(P.x - e.x, P.z - e.z) < 1.5 + (f.riding ? f.t.w * .3 : 0)) {
          e.on = false; e.m.visible = false; S.money += e.val; sfx.cash(); pop('Éclat +$' + fmt(e.val), 'gold'); glowFx.burst(e.x, e.y + .5, e.z, 50, 4, 1, [0xff7a1a, 0xffc542], 4); markSave(); }
        else if (e.t > 150) { e.on = false; e.m.visible = false; } }
    }
  }

  // --- touriste : un visiteur rose égaré qui suit le joueur jusqu'à la base ---
  const ROSE = P(0xff5fa8, { emissive: 0x3a0a22 }), ROSE2 = P(0x8a1f55, { roughness: .4 });
  let tour = null; const TR = { on: false, fuite: 0, t: 0, x: 0, z: 0, walk: 0, dir: 0, said: false };
  function touristeModel() {
    const a = astronaut('none', [], 0); a.g.scale.setScalar(.85);
    a.g.traverse(o => { if (o.isMesh) { if (o.material === MAT.blue) o.material = ROSE; else if (o.material === MAT.navy) o.material = ROSE2; } });
    a.g.visible = false; scene.add(a.g); return a;
  }
  const LIGNES_OK = ['« Merci ! Je mets 5 étoiles. Et une photo de mes pieds. »', '« C’était magique ! Vous faites aussi les anniversaires ? »', '« Enfin la base ! J’ai cru qu’on allait sur Mars. »'];
  const LIGNES_KO = ['« Bon, je connais un raccourci. Salut ! »', '« Trop lent. J’ai un vol pour la Terre à 17 h. »'];
  function touriste(dt, f) {
    const P = player.position;
    if (!TR.on) return;
    if (!tour) tour = touristeModel();
    if (f.paused && !TR.fuite) return;
    const dx = P.x - TR.x, dz = P.z - TR.z, d = Math.hypot(dx, dz); let vit = 0;
    if (TR.fuite > 0) { TR.fuite -= dt; vit = 4; TR.x += Math.cos(TR.dir) * vit * dt; TR.z += Math.sin(TR.dir) * vit * dt; if (TR.fuite <= 0) { TR.on = false; tour.g.visible = false; return; } }
    else if (d > 3) { vit = Math.min(6, 2 + (d - 3) * 1.5); TR.x += dx / d * vit * dt; TR.z += dz / d * vit * dt; TR.dir = Math.atan2(dz, dx); }
    else TR.dir = Math.atan2(dz, dx);
    TMP.x = TR.x; TMP.z = TR.z; collide(TMP, .5); TR.x = clamp(TMP.x, -lim(), lim()); TR.z = clamp(TMP.z, -lim(), lim());
    tour.g.position.set(TR.x, H(TR.x, TR.z), TR.z); tour.g.rotation.y = Math.PI / 2 - TR.dir;
    TR.walk += dt * vit * 2.2; const sw = vit > .1 ? Math.sin(TR.walk) * .6 : 0;
    tour.legL.rotation.x = sw; tour.legR.rotation.x = -sw; tour.armL.rotation.x = -sw * .7; tour.armR.rotation.x = -.9 + Math.sin(f.time * 6) * .25 - sw * .5;
    if (TR.fuite > 0) return;
    if (EV.nom === 'touriste' && EV.t > 20 && !TR.said && d < 8) { TR.said = true; say('Touriste', '« C’est encore loin, la base ? J’ai pris que des tongs. »'); }
    const db = Math.hypot(TR.x - BASE.x, TR.z - BASE.z);
    if (db < PAD_R + 2.5 && Math.hypot(P.x - BASE.x, P.z - BASE.z) < PAD_R + 1) { // livré !
      const c = chunkAt(P.x, P.z), v = Math.round(100 * (c ? RINGS[c.ring].mult : 1) * (1 + S.chapter));
      S.money += v; sfx.cash(); sfx.find(); pop('Touriste livré +$' + fmt(v), 'gold'); toast('Touriste livré · +$' + fmt(v), 'gold');
      say('Touriste', LIGNES_OK[Math.floor(Math.random() * LIGNES_OK.length)]); radio('touristeOk');
      glowFx.burst(TR.x, H(TR.x, TR.z) + 1.5, TR.z, 80, 5, 1.4, [0xff5fa8, 0xffc542, 0xffffff], 5); markSave();
      TR.fuite = 5; TR.dir = Math.atan2(TR.z - P.z, TR.x - P.x); finEv();
    }
    else if (EV.nom !== 'touriste' || d > 45) { say('Touriste', LIGNES_KO[Math.floor(Math.random() * LIGNES_KO.length)]); radio('touristeKo'); TR.fuite = 6; TR.dir = Math.atan2(TR.z - P.z, TR.x - P.x) + (Math.random() - .5); if (EV.nom === 'touriste') finEv(); }
  }

  const DUREE = { eclipse: 40, pluie: 30, touriste: 60 }; let dernier = '';
  function lancer(nom) {
    if (EV.nom) return;
    EV.nom = nom; EV.t = 0; EV.dur = DUREE[nom]; dernier = nom; evChip.hidden = false; chipT = 0;
    if (nom === 'eclipse') { disc.visible = corona.visible = true; toast('Éclipse de Soleil par la Terre · gains ×2', 'gold'); tone(220, 1.6, 'sine', .08, 60); radio('eclipse'); }
    if (nom === 'pluie') { PL.n = 6 + Math.floor(Math.random() * 3); PL.i = 0; PL.next = 1; toast('Pluie d’étoiles !', 'gold'); tone(1800, 1.2, 'sine', .05, 700); radio('pluie'); }
    if (nom === 'touriste') { if (!tour) tour = touristeModel(); ecart(TMP, 11, 13); TR.x = TMP.x; TR.z = TMP.z; TR.on = true; TR.fuite = 0; TR.t = 0; TR.said = false; tour.g.visible = true;
      say('Touriste', '« Hé ! Emmène-moi à la base, je suis perdu ! »'); radio('touriste'); tone(660, .2, 'square', .05); dustFx.burst(TR.x, H(TR.x, TR.z) + .2, TR.z, 40, 3, .8, [0xb7b2a8], 6); }
  }
  function finEv() {
    if (EV.nom === 'eclipse') { disc.visible = corona.visible = false; ecl = 1; }
    EV.nom = null; evChip.hidden = true; W.evT = 240 + Math.random() * 240; markSave();
  }
  function evenements(dt, f) {
    const actif = !f.paused && !S.zen && MS.started;
    if (!EV.nom) { if (actif) { W.evT -= dt; if (W.evT <= 0) { const choix = ['eclipse', 'pluie', 'touriste'].filter(n => n !== dernier); lancer(choix[Math.floor(Math.random() * choix.length)]); } } }
    else {
      if (!f.paused) EV.t += dt;
      if (EV.nom === 'eclipse') eclipse(dt); else if (EV.nom === 'pluie') pluie(dt);
      chipT -= dt; if (chipT <= 0) { chipT = .5; chipTxt((EV.nom === 'eclipse' ? 'Éclipse ×2 · ' : EV.nom === 'pluie' ? 'Pluie d’étoiles · ' : 'Touriste · ') + Math.max(0, Math.ceil(EV.dur - EV.t)) + ' s'); }
      if (EV.t >= EV.dur) { if (EV.nom === 'touriste' && TR.on && !TR.fuite) { say('Touriste', LIGNES_KO[0]); radio('touristeKo'); TR.fuite = 6; TR.dir = Math.random() * TAU; } finEv(); }
    }
    eclats(dt, f); touriste(dt, f);
  }

  // ===== 3. Faune absurde =====
  // --- taupe lunaire : sort de la poussière quand on nettoie, regarde, replonge ---
  const taupe = new THREE.Group(); taupe.visible = false; scene.add(taupe);
  { const gris = M(0x8a8a92, { roughness: .9 }), rose = M(0xe8a0a0, { roughness: .8 }), noir = M(0x101014, { roughness: .4 });
    put(taupe, sph(.38, 20, 14), gris, 0, .3, 0).scale.set(1, .85, 1.1); put(taupe, sph(.15, 14, 10), rose, 0, .3, .38); put(taupe, sph(.06, 10, 8), noir, 0, .34, .5);
    put(taupe, sph(.06, 10, 8), noir, -.15, .5, .3); put(taupe, sph(.06, 10, 8), noir, .15, .5, .3);
    for (const s of [-1, 1]) put(taupe, box(.16, .08, .2), rose, s * .36, .12, .15); }
  const TP = { on: false, t: 0, x: 0, z: 0, y: 0 }; const etape = new Map();
  function taupeSpawn() {
    for (let k = 0; k < 8; k++) { ecart(TMP, 6, 10); if (dusty(TMP.x, TMP.z) || k === 7) break; }
    TP.x = TMP.x; TP.z = TMP.z; TP.y = H(TP.x, TP.z); TP.t = 0; TP.on = true; taupe.visible = true; taupe.position.set(TP.x, TP.y - 1, TP.z); taupe.rotation.y = Math.random() * TAU;
    if (!W.taupe) { W.taupe = 1; markSave(); } toast('Une taupe lunaire !');
    tone(300, .15, 'square', .04, 500); setTimeout(() => tone(380, .15, 'square', .04, 600), 160);
  }
  function taupeTick(dt, f) {
    if (!TP.on) {
      if (f.paused) return;
      const c = chunkAt(f.P.x, f.P.z); if (!c) return;
      const st = Math.floor(c.clean / NC * 10), prev = etape.get(c.k);
      if (prev === undefined) etape.set(c.k, st);
      else if (st > prev) { etape.set(c.k, st); if (Math.random() < 1 / 40) taupeSpawn(); }
      return;
    }
    if (f.paused) return;
    TP.t += dt; const t = TP.t;
    if (t < .5) { taupe.position.y = TP.y - 1 + t / .5; if (Math.random() < .7) dustFx.add(TP.x + (Math.random() - .5) * .8, TP.y + .1, TP.z + (Math.random() - .5) * .8, (Math.random() - .5) * 2, 2 + Math.random() * 2, (Math.random() - .5) * 2, .6, 0xb0aba2, 5); }
    else if (t < 3.5) { taupe.position.y = TP.y + Math.sin((t - .5) * 2) * .05; taupe.rotation.y += Math.sin(t * 3) * dt * 1.6; }
    else if (t < 4) { taupe.position.y = TP.y - (t - 3.5) / .5; if (Math.random() < .7) dustFx.add(TP.x + (Math.random() - .5) * .8, TP.y + .1, TP.z + (Math.random() - .5) * .8, (Math.random() - .5) * 2, 1.5 + Math.random() * 2, (Math.random() - .5) * 2, .6, 0xb0aba2, 5); }
    else { TP.on = false; taupe.visible = false; }
  }

  // --- chat astronaute : assis sur la plateforme, se lève et miaule quand on passe ---
  const chat = new THREE.Group(); chat.position.set(2.7, .25, 2.5); chat.rotation.y = -2.2; scene.add(chat);
  const corps = new THREE.Group(), tete = new THREE.Group(), queue = [], pattes = []; chat.add(corps); corps.add(tete);
  const paupieres = [], oreilles = [], coeurs = { t: 0 };
  { const roux = P(0xe0742a, { roughness: .6, clearcoat: .3, envMapIntensity: .5 }), raye = P(0xb4531a, { roughness: .6, envMapIntensity: .5 }), clair = P(0xfbe6cc, { roughness: .6, envMapIntensity: .5 }),
      rose = P(0xff9fb4, { roughness: .5 }), oeil = P(0x16181f, { roughness: .1, clearcoat: 1 }), blanc = LIT(0xffffff, 1.6),
      verre = P(0xcfeaff, { transparent: true, opacity: .22, roughness: .02, clearcoat: 1, envMapIntensity: 1.2 }), suit = MAT.suit, bleu = MAT.blue;
    // corps : capsule assise + petite combinaison
    const c = put(corps, capsule(.17, .18, 24), roux, 0, .25, 0); c.rotation.x = .35;
    put(corps, sph(.15, 20, 14), clair, 0, .24, .1).scale.set(.85, 1.05, .6);
    put(corps, new THREE.TorusGeometry(.17, .03, 10, 28), bleu, 0, .44, 0).rotation.x = Math.PI / 2 - .35;
    put(corps, rbox(.2, .2, .1, .04), suit, 0, .3, -.18);
    for (const s of [-1, 1]) for (const z of [.12, -.08]) { const pa = new THREE.Group(); pa.position.set(s * .1, .1, z); corps.add(pa); put(pa, capsule(.05, .08, 12), z > 0 ? clair : roux, 0, -.04, 0); put(pa, sph(.055, 12, 8), clair, 0, -.1, .02).scale.set(1, .6, 1.2); pattes.push(pa); }
    // tête : ronde, joues, museau, grands yeux brillants
    tete.position.set(0, .56, .1);
    put(tete, sph(.19, 28, 20), roux, 0, 0, 0).scale.set(1.08, .95, 1);
    for (const s of [-1, 1]) { put(tete, sph(.09, 16, 12), clair, s * .08, -.07, .11); put(tete, rbox(.05, .012, .1, .005), raye, s * .09, .14, -.03).rotation.z = s * .3; }
    put(tete, rbox(.03, .012, .12, .005), raye, 0, .17, -.02);
    put(tete, sph(.025, 12, 8), rose, 0, -.03, .19).scale.set(1.3, .8, 1);
    for (const s of [-1, 1]) {
      const o = new THREE.Group(); o.position.set(s * .11, .14, -.01); o.rotation.z = -s * .35; tete.add(o); oreilles.push(o);
      put(o, new THREE.ConeGeometry(.07, .14, 16), roux, 0, .05, 0); put(o, new THREE.ConeGeometry(.04, .09, 12), rose, 0, .04, .025);
      put(tete, sph(.045, 16, 12), oeil, s * .072, .02, .155).scale.set(1, 1.15, .6);
      put(tete, sph(.013, 8, 6), blanc, s * .072 - .012, .04, .18);
      const pp = put(tete, sph(.048, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), roux, s * .072, .02, .152); pp.scale.set(1.02, 1.2, .65); pp.visible = false; paupieres.push(pp);
      for (const k of [-1, 1]) rod(tete, new THREE.Vector3(s * .06, -.06 + k * .012, .17), new THREE.Vector3(s * .2, -.05 + k * .03, .15), .003, MAT.white);
    }
    const casque = put(tete, sph(.3, 32, 24), verre, 0, .02, 0); casque.castShadow = false;
    put(tete, new THREE.TorusGeometry(.22, .035, 12, 32), MAT.suitGrey, 0, -.2, 0).rotation.x = Math.PI / 2;
    put(tete, sph(.03, 10, 8), LIT(0x63e6ff, 2.4), 0, .33, 0); rod(tete, new THREE.Vector3(0, .28, 0), new THREE.Vector3(0, .33, 0), .008, MAT.steel);
    // queue : chaîne de boules rayées qui ondule
    let par = corps; const q0 = new THREE.Group(); q0.position.set(0, .14, -.2); q0.rotation.x = -.9; corps.add(q0); par = q0;
    for (let k = 0; k < 7; k++) { const seg = new THREE.Group(); seg.position.set(0, k ? .06 : 0, k ? -.02 : 0); par.add(seg); put(seg, sph(.04 - k * .002, 12, 8), k % 2 ? raye : roux); queue.push(seg); par = seg; }
  }
  const CH = { lev: 0, miaou: 0, cligne: 2, oreille: 3, ronron: 0 };
  function chatTick(dt, f) {
    const dx = f.P.x - chat.position.x, dz = f.P.z - chat.position.z, d = Math.hypot(dx, dz), pres = d < 2.2, t = f.time;
    CH.lev += ((pres ? 1 : 0) - CH.lev) * Math.min(1, dt * 5);
    // respiration, assis → debout, tête qui suit le joueur
    corps.position.y = CH.lev * .08; corps.scale.set(1, 1 + Math.sin(t * 2.2) * .02 + CH.lev * .08, 1);
    tete.rotation.z = Math.sin(t * .7) * .08 * (1 - CH.lev) + Math.sin(t * 6) * .05 * CH.lev; tete.rotation.x = -.15 * CH.lev;
    for (let i = 0; i < pattes.length; i++) pattes[i].rotation.x = CH.lev * Math.sin(t * 8 + i * 1.6) * .25;
    // queue : vague douce, rapide quand il est content
    for (let k = 0; k < queue.length; k++) { queue[k].rotation.x = -.16 + Math.sin(t * (pres ? 5 : 1.6) - k * .6) * .06; queue[k].rotation.z = Math.sin(t * (pres ? 6 : 1.2) - k * .5) * (.15 + CH.lev * .2); }
    // clignement et oreille qui frémit
    CH.cligne -= dt; const ferme = CH.cligne < .12; for (const p of paupieres) p.visible = ferme; if (CH.cligne < 0) CH.cligne = 2 + Math.random() * 3;
    CH.oreille -= dt; oreilles[0].rotation.x = CH.oreille < .25 ? Math.sin(CH.oreille * 60) * .3 : 0; if (CH.oreille < 0) CH.oreille = 3 + Math.random() * 5;
    if (d < 8) chat.rotation.y += (((Math.atan2(dx, dz) - chat.rotation.y + Math.PI) % TAU + TAU) % TAU - Math.PI) * Math.min(1, dt * 3);
    // près de lui : petits cœurs et ronronnement
    if (pres) { coeurs.t -= dt; if (coeurs.t <= 0) { coeurs.t = .5; MS.glowFx.add(chat.position.x + (Math.random() - .5) * .3, .9, chat.position.z + (Math.random() - .5) * .3, 0, .8, 0, 1.2, 0xff6fa0, -.3); } }
    CH.miaou -= dt;
    if (pres && CH.miaou <= 0) { CH.miaou = 5; tone(900, .12, 'sine', .08, 1400); setTimeout(() => tone(1300, .2, 'sine', .07, 700), 120); setTimeout(() => tone(55, .9, 'sine', .05, 50), 400);
      if (!W.chat) { W.chat = 1; markSave(); toast('Miaou. (Le chat t’aime bien.)'); } }
  }
  BADGES.push({ id: 'taupe', name: 'Taupe repérée', txt: 'Voir une taupe lunaire sortir de la poussière.', ok: () => !!W.taupe },
    { id: 'chat', name: 'Chat caressé', txt: 'Rendre visite au chat astronaute de la base.', ok: () => !!W.chat });

  // ===== boucle =====
  on('frame', (dt, f) => { evenements(dt, f); ciel(dt, f); taupeTick(dt, f); chatTick(dt, f); });

  // ===== accès pour les tests : MONDE.force(nom) =====
  window.MONDE = { force(nom, arg) {
    if (nom === 'jour') { W.cycle = true; W.t0 = Date.now() - JOUR * .25; envT = 0; }
    if (nom === 'crepuscule') { W.cycle = true; W.t0 = Date.now() - JOUR * .49; envT = 0; }
    if (nom === 'nuit') { W.cycle = true; W.t0 = Date.now() - JOUR * .75; envT = 0; }
    if (nom === 'touristePres' && TR.on) { TR.x = player.position.x + 2.5; TR.z = player.position.z + 1.5; }
    if (nom === 'eclipse' || nom === 'pluie' || nom === 'touriste') { if (EV.nom) finEv(); W.evT = 0; lancer(nom); }
    if (nom === 'eclipseTot') EV.t = EV.dur / 2;
    if (nom === 'pluieTout') { while (PL.i < PL.n) { PL.next = 0; pluie(0); } for (const e of ECL) if (e.on) e.t = 1.7; }
    if (nom === 'fin') { if (EV.nom) finEv(); }
    if (nom === 'taupe') { taupeSpawn(); TP.t = .6; MS.cam = () => { MS.camera.position.set(TP.x + 1.6, TP.y + 1.6, TP.z + 2.4); MS.camera.lookAt(TP.x, TP.y + .3, TP.z); }; }
    if (nom === 'chat') { player.position.set(chat.position.x - 1.3, 0, chat.position.z - .6); MS.cam = (cp) => { MS.camera.position.set(chat.position.x + 1.6, 1.4, chat.position.z + 1.6); MS.camera.lookAt(chat.position.x, .5, chat.position.z); }; }
    if (nom === 'ciel') MS.cam = (cp, cl) => { MS.camera.position.copy(cp); MS.camera.position.y += 1; MS.camera.lookAt(cp.x + SOL.x * 50, cp.y + SOL.y * 50, cp.z + SOL.z * 50); };
    if (nom === 'sol') MS.cam = null;
    return { phase: phase(), jour, envK, chat: [chat.visible, chat.children.length], ecl, ev: EV.nom, t: EV.t, touriste: TR.on ? [TR.x, TR.z] : null, eclats: ECL.filter(e => e.on).length, taupe: TP.on, lampe: lamp.intensity };
  } };
})();
