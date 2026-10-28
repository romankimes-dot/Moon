// features/style.js — Garde-robe (cosmétiques contre des jetons ⭐), compagnon flottant, Atelier (améliorations d'engins) et remorque.
(() => {
  const { S, on, THREE, MAT, M, P, LIT, put, rod, rbox, cyl, sph, tex, toast, say, thumb, shopSection, fmt, $ } = MS;
  S.style ??= { own: [], suit: 'blanc', ring: 'bleu', helm: 'bulle', sticker: 'aucun', trail: 'aucune', pet: 'robot' };
  S.upg ??= {}; S.trailer ??= false; S.trailerOn ??= true; S.petOff ??= false;
  const DEF = { suit: 'blanc', ring: 'bleu', helm: 'bulle', sticker: 'aucun', trail: 'aucune', pet: 'robot' };

  // ===== Styles =====
  document.head.insertAdjacentHTML('beforeend', `<style>
    .witem { display:grid; grid-template-columns:76px 1fr auto; gap:2px 12px; align-items:center; text-align:left; width:100%; color:var(--fg); background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.03)); border:1px solid var(--line); border-radius:10px; padding:8px 12px 8px 8px; cursor:pointer; transition:transform .08s }
    .witem:not(:disabled):active { transform:scale(.98) }
    .witem .th { grid-row:1/span 2; width:76px; height:76px; border-radius:8px; background:radial-gradient(circle at 50% 35%,#2a3040,#12141a 75%); display:block; object-fit:contain }
    .witem .n { font:700 20px/1.1 var(--display); letter-spacing:.03em; min-width:0 } .witem .d { grid-column:2; color:var(--muted); font-size:13px; min-width:0 }
    .witem .p { grid-row:1/span 2; grid-column:3; font:800 20px var(--display); color:var(--gold); font-variant-numeric:tabular-nums; white-space:nowrap; text-align:right }
    .witem .p.m { color:var(--good) } .witem .p small { display:block; font:500 11px var(--body); color:var(--muted); letter-spacing:0; text-transform:none }
    .witem:disabled { opacity:.45; cursor:default } .witem.locked { opacity:.35 } .witem.locked .p { color:var(--muted); font-size:14px; letter-spacing:.08em; text-transform:uppercase }
    .witem.owned { border-color:rgba(255,138,42,.6); opacity:1 } .witem.owned .p { color:var(--accent); font-size:15px; letter-spacing:.1em; text-transform:uppercase }
    .witem.cur { border-color:var(--cyan); box-shadow:0 0 0 1px var(--cyan) inset } .witem.cur .p { color:var(--cyan); font-size:15px; letter-spacing:.1em; text-transform:uppercase }
    .witem.ask { border-color:var(--good); box-shadow:0 0 0 1px var(--good) inset } .witem.ask .p { color:var(--good); font-size:16px; letter-spacing:.08em; text-transform:uppercase }
    .wgrp { font:700 13px var(--display); letter-spacing:.16em; text-transform:uppercase; color:var(--muted); margin:6px 0 -2px }
    .wk { background:rgba(255,255,255,.05); border:1px solid var(--line); border-radius:10px; padding:10px 12px; display:grid; gap:8px }
    .wk b { font:700 20px var(--display); letter-spacing:.03em } .wk b small { color:var(--muted); font:500 13px var(--body); margin-left:8px }
    .wrow { display:grid; grid-template-columns:1fr 1fr; gap:8px }
    .wbtn { display:grid; gap:2px; text-align:left; color:var(--fg); background:rgba(255,255,255,.06); border:1px solid var(--line); border-radius:8px; padding:8px 10px; cursor:pointer }
    .wbtn span { font:700 15px var(--display); letter-spacing:.06em; text-transform:uppercase } .wbtn i { font-style:normal; color:var(--accent); letter-spacing:.2em; font-size:12px }
    .wbtn em { font:800 16px var(--display); color:var(--good); font-style:normal } .wbtn:disabled { opacity:.45; cursor:default }
    .wbtn.max em, .wbtn.no em { color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.08em } .wbtn.on { border-color:var(--cyan) } .wbtn.on em { color:var(--cyan) }
    .wnote { color:var(--muted); font-size:13px; padding:4px 2px }
  </style>`);

  // ===== Matériaux cosmétiques (créés une seule fois) =====
  const suit = (c, o) => P(c, Object.assign({ clearcoat: .4, envMapIntensity: .7 }, o));
  const SUITS = { blanc: null, orange: suit(0xff7d1f), menthe: suit(0x8ae8c4), noir: suit(0x1d2026, { roughness: .45, clearcoat: .7 }), rose: suit(0xff7ab8) };
  const RINGS = { bleu: null, or: MAT.gold, cyan: P(0x37e0ff, { emissive: 0x073038 }), rouge: P(0xff3b3b, { emissive: 0x3a0606 }) };
  const rainbow = tex(256, 64, c => { const g = c.createLinearGradient(0, 0, 256, 0); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, `hsl(${i * 45},100%,55%)`); c.fillStyle = g; c.fillRect(0, 0, 256, 64); });
  const HELMS = { bulle: null, miroir: P(0xffd37a, { metalness: 1, roughness: .06, clearcoat: 1, emissive: 0x2a1a00 }), arc: new THREE.MeshPhysicalMaterial({ map: rainbow, metalness: .55, roughness: .12, clearcoat: 1 }) };
  const sticker = draw => new THREE.MeshBasicMaterial({ map: tex(128, 128, draw), transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
  const STK = {
    aucun: null,
    etoile: sticker(c => { c.fillStyle = '#ffc542'; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 24 : 58, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } c.fill(); }),
    drapeau: sticker(c => { ['#2a56c6', '#ffffff', '#e23b3b'].forEach((k, i) => { c.fillStyle = k; c.fillRect(8 + i * 37, 22, 38, 84); }); c.strokeStyle = '#1b1c20'; c.lineWidth = 4; c.strokeRect(8, 22, 112, 84); }),
    lunaclean: sticker(c => { c.fillStyle = '#ff8a2a'; c.beginPath(); if (c.roundRect) c.roundRect(4, 34, 120, 60, 14); else c.rect(4, 34, 120, 60); c.fill(); c.fillStyle = '#1b1206'; c.font = '800 28px Barlow Condensed, Arial Narrow, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LUNACLEAN', 64, 64); })
  };
  const STK_GEO = new THREE.PlaneGeometry(.34, .34);
  const ARC = [0xff3b3b, 0xff8a2a, 0xffc542, 0x63e08f, 0x63e6ff, 0x2f7bff, 0xb04dff, 0xff5ac8];
  const TRAIL = { aucune: null, bleue: [0x63e6ff, 0x2f7bff, 0x9ff2ff], doree: [0xffc542, 0xffe9a0, 0xff8a2a], arc: ARC };
  const TLIT = {}; for (const k in TRAIL) if (TRAIL[k]) TLIT[k] = TRAIL[k].map(c => LIT(c, 2));

  // ===== Catalogue de la garde-robe =====
  const WARD = [
    { cat: 'suit', val: 'blanc', name: 'Combinaison blanche', desc: 'La tenue réglementaire.', price: 0 },
    { cat: 'suit', val: 'orange', name: 'Orange chantier', desc: 'On te voit depuis la Terre.', price: 10 },
    { cat: 'suit', val: 'menthe', name: 'Vert menthe', desc: 'Fraîcheur garantie sous vide.', price: 10 },
    { cat: 'suit', val: 'noir', name: 'Noir furtif', desc: 'La poussière ne te verra pas venir.', price: 15 },
    { cat: 'suit', val: 'rose', name: 'Rose bonbon', desc: 'Parce que la Lune manque de couleurs.', price: 10 },
    { cat: 'ring', val: 'bleu', name: 'Anneaux bleus', desc: 'Le bleu d’origine.', price: 0 },
    { cat: 'ring', val: 'or', name: 'Anneaux dorés', desc: 'Bling lunaire.', price: 15 },
    { cat: 'ring', val: 'cyan', name: 'Anneaux cyan', desc: 'Ils brillent un peu la nuit.', price: 10 },
    { cat: 'ring', val: 'rouge', name: 'Anneaux rouges', desc: 'Rouge comme Mars, la voisine.', price: 10 },
    { cat: 'helm', val: 'bulle', name: 'Bulle classique', desc: 'Visière sombre, regard mystérieux.', price: 0 },
    { cat: 'helm', val: 'miroir', name: 'Visière miroir dorée', desc: 'Comme sur les vraies photos Apollo.', price: 25 },
    { cat: 'helm', val: 'arc', name: 'Visière arc-en-ciel', desc: 'Traitement optique très officiel.', price: 40 },
    { cat: 'sticker', val: 'aucun', name: 'Sac nu', desc: 'Sans autocollant.', price: 0 },
    { cat: 'sticker', val: 'etoile', name: 'Autocollant étoile', desc: 'Collé sur le sac à dos.', price: 5 },
    { cat: 'sticker', val: 'drapeau', name: 'Autocollant drapeau', desc: 'Un drapeau de quelque part.', price: 5 },
    { cat: 'sticker', val: 'lunaclean', name: 'Autocollant Lunaclean', desc: 'Fier de l’entreprise.', price: 8 },
    { cat: 'trail', val: 'aucune', name: 'Sans traînée', desc: 'Des pas, rien d’autre.', price: 0 },
    { cat: 'trail', val: 'bleue', name: 'Traînée bleue', desc: 'Des étincelles derrière chaque pas.', price: 15 },
    { cat: 'trail', val: 'doree', name: 'Traînée dorée', desc: 'Tu marches sur de l’or.', price: 20 },
    { cat: 'trail', val: 'arc', name: 'Traînée arc-en-ciel', desc: 'Toutes les couleurs, à chaque pas.', price: 30 },
    { cat: 'pet', val: 'robot', name: 'Compagnon robot', desc: 'Un petit robot rond qui te suit et commente.', price: 0, ch: 2 },
    { cat: 'pet', val: 'canard', name: 'Compagnon canard', desc: 'Le canard en plastique, en lévitation.', price: 0, ch: 2, need: 'duck' }
  ];
  for (const it of WARD) it.id = it.cat + ':' + it.val;
  const GRP = { suit: 'Combinaisons', ring: 'Anneaux', helm: 'Casques', sticker: 'Sac à dos', trail: 'Traînée lumineuse', pet: 'Compagnon' };
  const owned = it => !it.price || S.style.own.includes(it.id);

  // ===== Habillage : remplace les matériaux par identité (l'original est gardé dans userData.m0) =====
  const tmpL = [];
  function dress(g, st) {
    const su = SUITS[st.suit], ri = RINGS[st.ring], he = HELMS[st.helm]; tmpL.length = 0;
    g.traverse(o => {
      if (o.userData.sticker) { tmpL.push(o); return; }
      if (o.isGroup && o.position.y === 1.22 && o.position.z === -.44) { tmpL.push(o); return; }   // sac à dos
      if (!o.isMesh) return;
      const m0 = o.userData.m0 || (o.userData.m0 = o.material);
      if (m0 === MAT.suit) o.material = su || m0; else if (m0 === MAT.blue) o.material = ri || m0; else if (m0 === MAT.visor) o.material = he || m0;
    });
    for (const o of tmpL) {
      if (o.userData.sticker) { o.parent.remove(o); continue; }
      const mat = STK[st.sticker]; if (!mat) continue;
      const m = new THREE.Mesh(STK_GEO, mat); m.position.set(0, -.05, -.275); m.rotation.y = Math.PI; m.scale.set(1, 1 / o.scale.y, 1 / o.scale.z); m.userData.sticker = 1; o.add(m);
    }
    tmpL.length = 0;
  }
  let rigG = null, dirty = true;
  function applyRig() { const r = MS.rig; if (!r) return; rigG = r.g; dirty = false; dress(r.g, S.style); if (pet) dress(pet, S.style); }
  const oSet = MS.setRig; MS.setRig = () => { oSet(); applyRig(); };
  on('load', applyRig); on('buy', applyRig); on('ride', applyRig); on('dismount', applyRig);

  // ===== Compagnon =====
  function robotModel() {
    const g = new THREE.Group();
    put(g, sph(.32, 32, 22), MAT.suit, 0, 0, 0);
    put(g, sph(.25, 24, 16), MAT.visor, 0, .04, .18).scale.set(1.1, .62, .6);
    put(g, sph(.06, 12, 8), MAT.led, -.08, .06, .39); put(g, sph(.06, 12, 8), MAT.led, .08, .06, .39);
    put(g, new THREE.TorusGeometry(.35, .03, 10, 40), MAT.blue, 0, -.08, 0).rotation.x = Math.PI / 2;
    put(g, cyl(.015, .015, .22, 6), MAT.steel, 0, .4, 0); put(g, sph(.04, 10, 8), MAT.red, 0, .52, 0);
    for (const s of [-1, 1]) put(g, sph(.07, 12, 8), MAT.suitGrey, s * .35, -.06, .05);
    put(g, cyl(.09, .13, .08, 14), MAT.dark, 0, -.33, 0); put(g, sph(.06, 10, 8), LIT(0x8ff6ff, 2.2), 0, -.4, 0).scale.y = 1.6;
    g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
  }
  function duckModel() { const w = new THREE.Group(), d = MS.findModel('duck'); d.scale.setScalar(.6); d.position.y = -.4; w.add(d); return w; }
  let pet = null, petKind = '', petCool = 8, idleT = 0;
  function syncPet() {
    const want = S.chapter >= 1 && !S.petOff ? S.style.pet : '';
    if (want === petKind) return;
    if (pet) { MS.scene.remove(pet); pet = null; }
    petKind = want; if (!want) return;
    pet = want === 'canard' ? duckModel() : robotModel(); dress(pet, S.style);
    pet.position.copy(MS.player.position); pet.position.y += 1.2; MS.scene.add(pet);
  }
  const QUIPS = {
    sell: ['Bip-bip-bîîp. Traduction : joli chèque.', 'J’ai calculé : à ce rythme, la Lune brille avant Noël. Lequel, je ne sais pas.', 'Encore un sac vendu. Je garde le reçu, on ne sait jamais.',
      'Un autre robot en aurait fait un petit cube. Toi, tu en fais des dollars.', 'Je suis désolé, je ne peux pas te laisser repartir sans dire : bravo.', 'Réglage humour : 75 %. Donc : excellente vente, patron.',
      'La poussière lunaire sent la poudre à canon. Toi, tu sens la réussite.', 'Les comptes sont bons. Enfin je crois : je compte en binaire.'],
    sector: ['Secteur propre ! Je mets une étoile dans mon registre. Avec mon unique doigt.', 'Depuis l’orbite, on voit ton travail. Enfin non, mais ça fait plaisir à dire.', 'Un secteur de moins. Houston demande si tu passes aussi chez lui.',
      'Impeccable. Je garderais bien ce rectangle en fond d’écran.', 'Ce secteur brille tellement que mes capteurs clignent des yeux.', 'Ma mémoire est pleine de poussière. Celle-là, c’est la bonne.',
      'Carré propre, cœur léger. Les robots aussi ont un cœur. Enfin, une pile.', 'Fin de secteur. Bip joyeux.'],
    idle: ['Tu fais une pause ? Moi je flotte. C’est tout ce que je sais faire, mais je le fais bien.', 'Je peux chanter, si tu veux. Daisy, Daisy… Non ? D’accord.', 'La Terre, là-haut. Tout le monde y est, sauf nous deux. Sympa, non ?',
      'Mon fabricant m’a équipé d’une patience infinie. Je la teste.', 'Ici, un jour dure 29 jours. Donc techniquement, tu es en avance.', 'Si on reste immobiles assez longtemps, on devient une découverte.',
      'Je compte les étoiles pour passer le temps. 4 012… 4 013…', 'Pas de pression. La poussière attend depuis quatre milliards d’années.', 'Je rêvais d’être un robot de cinéma. Suivre un balayeur, finalement, c’est pas mal.']
  };
  const lastQ = { sell: -1, sector: -1, idle: -1 };
  function quip(pool) {
    if (!pet || petCool > 0) return;
    const l = QUIPS[pool]; let i = (Math.random() * l.length) | 0; if (i === lastQ[pool]) i = (i + 1) % l.length; lastQ[pool] = i;
    say(petKind === 'canard' ? 'Canard' : 'Compagnon', l[i]); petCool = 20;
  }
  on('sell', v => { if (v >= 25 && Math.random() < .7) quip('sell'); });
  on('sector', () => quip('sector'));
  on('chapter', n => { syncPet(); if (n === 1) toast('Un compagnon te rejoint : vois la garde-robe', 'gold'); });
  MS.toggle('Compagnon', 'Le petit robot qui te suit et commente (dès le chapitre 2).', () => !S.petOff, v => { S.petOff = !v; syncPet(); });

  // ===== Atelier : améliorations par engin (valeurs de base copiées avant toute modification) =====
  const BASEV = {}; for (const v of MS.VEHS) BASEV[v.id] = { w: v.w, sp: v.sp };
  const BASEB = MS.BAGS.map(b => b.cap);
  const Z = { b: 0, m: 0 }, RATE = [.15, .25, .4], REAR = { ride: 1.3, quad: 1.2, truck: 2.5, mega: 3.4, dozer: 2.3, harv: 3.4 };
  const trailerOn = () => S.trailer && S.trailerOn;
  function applyUpg() {
    for (const v of MS.VEHS) { const u = S.upg[v.id] || Z, b = BASEV[v.id]; v.w = +(b.w * (1 + .15 * u.b)).toFixed(2); v.sp = +(b.sp * (1 + .15 * u.m) * (trailerOn() ? .9 : 1)).toFixed(2); }
    MS.BAGS.forEach((b, i) => { b.cap = Math.round(BASEB[i] * (trailerOn() ? 1.5 : 1)); });
  }
  applyUpg();
  function refreshVeh(id) {
    if (S.riding === id) MS.setRig();
    else { const m = MS.parked.get(id); if (m) { MS.scene.remove(m.g); MS.parked.delete(id); MS.syncParked(); } }
  }

  // ===== Remorque : petit chariot (2 roues + caisse) qui suit derrière =====
  function trailerModel() {
    const g = new THREE.Group(), wheels = [];
    put(g, rbox(1.2, .55, 1.4, .1), MAT.orange, 0, .62, 0); put(g, rbox(1.08, .3, 1.28, .05), MAT.dark, 0, .76, 0);
    const mound = put(g, sph(.5, 16, 10), M(0xb7b2a8, { roughness: 1 }), 0, .86, 0); mound.scale.set(1, .3, 1.2);
    put(g, rbox(1.3, .08, 1.5, .03), MAT.frame, 0, .34, 0); put(g, cyl(.04, .04, 1.5, 8), MAT.steel, 0, .3, 0).rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * .72, .3, 0); g.add(w); put(w, new THREE.TorusGeometry(.2, .1, 12, 24), MAT.tire).rotation.y = Math.PI / 2; put(w, cyl(.15, .15, .14, 16), MAT.chrome).rotation.z = Math.PI / 2; wheels.push(w); }
    rod(g, new THREE.Vector3(0, .42, .7), new THREE.Vector3(0, .5, 1.7), .035, MAT.frame); put(g, sph(.07, 10, 8), MAT.steel, 0, .5, 1.7);
    for (const s of [-1, 1]) put(g, sph(.05, 8, 6), MAT.tail, s * .5, .6, -.72);
    put(g, rbox(.8, .1, .04, .02), MAT.hazard, 0, .45, -.72);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { g, wheels, mound };
  }
  let trailer = null;
  function syncTrailer() {
    if (trailerOn() === !!trailer) return;
    if (trailer) { MS.scene.remove(trailer.g); trailer = null; return; }
    trailer = trailerModel(); const p = MS.player; trailer.g.position.set(p.position.x - Math.sin(p.rotation.y) * 2.2, p.position.y, p.position.z - Math.cos(p.rotation.y) * 2.2); trailer.g.rotation.y = p.rotation.y; MS.scene.add(trailer.g);
  }

  // ===== Boucle : zéro allocation =====
  on('frame', (dt, f) => {
    const r = MS.rig; if (r && (r.g !== rigG || dirty)) applyRig();
    const pl = MS.player, Pp = pl.position, sy = Math.sin(pl.rotation.y), cy = Math.cos(pl.rotation.y);
    // traînée lumineuse à pied
    const tr = TRAIL[S.style.trail];
    if (tr && !f.paused && !f.riding && f.moved > 0) for (let i = 0; i < 2; i++) {
      const c = tr.length > 3 ? tr[((f.time * 6) | 0) % tr.length] : tr[(Math.random() * tr.length) | 0];
      MS.glowFx.add(Pp.x - sy * .5 + (Math.random() - .5) * .5, Pp.y + .15, Pp.z - cy * .5 + (Math.random() - .5) * .5, (Math.random() - .5) * .3, .4 + Math.random() * .5, (Math.random() - .5) * .3, .7, c, 0);
    }
    // compagnon : 2 m derrière, un peu sur le côté, flotte à 1,2 m, se tourne vers le joueur
    if (pet) {
      petCool -= dt;
      const back = f.riding ? 0 : 2, side = f.riding ? -(f.t.w / 2 + 1.5) : (trailer ? -1.5 : -1);
      const tx = Pp.x - sy * back + cy * side, tz = Pp.z - cy * back - sy * side, k = Math.min(1, dt * 2.5), p = pet.position;
      p.x += (tx - p.x) * k; p.z += (tz - p.z) * k;
      p.y += (MS.H(p.x, p.z) + 1.2 + Math.sin(f.time * 2.2) * .12 - p.y) * Math.min(1, dt * 4);
      pet.rotation.y = Math.atan2(Pp.x - p.x, Pp.z - p.z); pet.rotation.z = Math.sin(f.time * 1.3) * .06;
      idleT = f.mag > .08 || f.paused ? 0 : idleT + dt;
      if (idleT > 90) { idleT = -60; quip('idle'); }
    }
    // remorque : joueur − direction × (2,2 + arrière de l'engin), orientation suivie avec retard
    if (trailer) {
      const d = 2.2 + (f.riding ? REAR[MS.curVeh().kind] || 0 : 0), g = trailer.g, p = g.position, k = Math.min(1, dt * 4);
      const px = p.x, pz = p.z; p.x += (Pp.x - sy * d - p.x) * k; p.z += (Pp.z - cy * d - p.z) * k; p.y = MS.H(p.x, p.z);
      let dr = Math.atan2(Pp.x - p.x, Pp.z - p.z) - g.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); g.rotation.y += dr * Math.min(1, dt * 5);
      const mv = Math.hypot(p.x - px, p.z - pz) / .3; for (const w of trailer.wheels) w.rotation.x += mv;
      trailer.mound.scale.y = .05 + .5 * Math.min(1, S.dust / MS.bagCap()); trailer.mound.visible = S.dust > 1;
    }
  });

  // ===== Interface du garage : Garde-robe et Atelier =====
  const ward = shopSection('Garde-robe', 'cosmétiques contre des jetons ⭐'), atel = shopSection('Atelier', 'améliore tes engins, attelle la remorque');
  const wardH = ward.previousElementSibling.querySelector('small');
  const preview = it => () => {
    if (it.cat === 'pet') { const g = it.val === 'canard' ? duckModel() : robotModel(); dress(g, DEF); g.rotation.y = .4; return g; }
    const st = Object.assign({}, DEF); st[it.cat] = it.val;
    const a = MS.astronaut('none', [], it.cat === 'sticker' ? 2 : 0); dress(a.g, st); a.g.rotation.y = .5;
    if (it.cat === 'helm') { const h = new THREE.Group(); for (const o of a.g.children.slice()) if (o.position.y >= 1.9) h.add(o); h.rotation.y = .4; return h; }
    if (it.cat === 'sticker') { const b = a.g.children.find(o => o.isGroup && o.position.y === 1.22); b.position.set(0, 0, 0); b.rotation.y = Math.PI + .4; return b; }
    if (it.cat === 'trail' && TLIT[it.val]) for (let i = 0; i < 6; i++) put(a.g, sph(.13 - i * .012, 10, 8), TLIT[it.val][i % TLIT[it.val].length], (i % 2 - .5) * .3, .2 + i * .06, -.5 - i * .32);
    return a.g;
  };
  const price = it => it.price ? it.price + ' ⭐' : 'Offert';
  let thumbQ = [];
  function pump() { const el = thumbQ.shift(); if (!el) return; el.src = thumb(el.dataset.sth, el._build) || ''; el._build = null; setTimeout(pump, 0); }
  function wardUi() {
    wardH.textContent = `cosmétiques · ${S.tokens || 0} ⭐ en poche`;
    let html = '', cat = '';
    for (const it of WARD) {
      if (it.cat !== cat) { cat = it.cat; html += `<div class="wgrp">${GRP[cat]}</div>`; }
      const own = owned(it) && !(it.need && !S.found.includes(it.need)), cur = own && S.style[it.cat] === it.val, lock = it.ch && it.ch > S.chapter + 1;
      let label = cur ? 'Porté' : own ? 'Mettre' : price(it), sub = '', dis = cur;
      if (it.cat === 'pet') label = cur ? 'Avec toi' : own ? 'Choisir' : 'Trouve le canard';
      if (lock) { label = 'Chapitre ' + it.ch; dis = true; } else if (!own && it.need) dis = true; else if (!own && (S.tokens || 0) < it.price) { dis = true; sub = `il manque ${it.price - (S.tokens || 0)} ⭐`; }
      html += `<button class="witem${cur ? ' cur' : own ? ' owned' : ''}${lock ? ' locked' : ''}" type="button" data-w="${it.id}"${dis ? ' disabled' : ''}><img class="th" data-sth="style:${it.id}" alt=""><span class="n">${it.name}</span><span class="p">${label}${sub ? '<small>' + sub + '</small>' : ''}</span><span class="d">${it.desc}</span></button>`;
    }
    ward.innerHTML = html;
    for (const img of ward.querySelectorAll('img[data-sth]')) { img._build = preview(WARD.find(it => 'style:' + it.id === img.dataset.sth)); thumbQ.push(img); }
    pump();
  }
  const dots = n => '●'.repeat(n) + '○'.repeat(3 - n);
  const num = v => String(v).replace('.', ',');
  function atelUi() {
    let html = '';
    const ownedV = MS.VEHS.filter(v => S.veh[v.id]);
    if (!ownedV.length) html += `<div class="wnote">Achète un engin : tu pourras ensuite améliorer ses brosses et son moteur ici.</div>`;
    for (const v of ownedV) {
      const u = S.upg[v.id] || Z;
      const btn = (k, lbl, lvl) => { const max = lvl >= 3, pr = max ? 0 : Math.round(v.price * RATE[lvl]), no = !max && S.money < pr; return `<button class="wbtn${max ? ' max' : no ? ' no' : ''}" type="button" data-u="${k}:${v.id}"${max || no ? ' disabled' : ''}><span>${lbl}</span><i>${dots(lvl)}</i><em>${max ? 'Au maximum' : no ? 'il manque $' + fmt(pr - S.money) : '$' + fmt(pr)}</em></button>`; };
      html += `<div class="wk"><b>${v.name}<small>${num(v.w)} m de large · ${num(v.sp)} m/s</small></b><div class="wrow">${btn('b', 'Brosses +15 %', u.b)}${btn('m', 'Moteur +15 %', u.m)}</div></div>`;
    }
    const lock = 3 > S.chapter + 1, no = !S.trailer && S.money < 8000;
    const label = S.trailer ? (S.trailerOn ? 'Attelée' : 'Dételée') : lock ? 'Chapitre 3' : '$' + fmt(8000);
    html += `<button class="witem${S.trailer ? ' cur' : ''}${lock ? ' locked' : ''}" type="button" data-tr="1"${lock || no ? ' disabled' : ''}><img class="th" data-sth="style:trailer" alt=""><span class="n">Remorque</span><span class="p${S.trailer ? '' : ' m'}">${label}${no && !lock ? '<small>il manque $' + fmt(8000 - S.money) + '</small>' : ''}</span><span class="d">+50 % de contenance du sac, −10 % de vitesse en engin. ${S.trailer ? 'Toucher pour atteler ou dételer.' : 'Elle te suit partout.'}</span></button>`;
    atel.innerHTML = html;
    const img = atel.querySelector('img[data-sth]'); img._build = () => { const m = trailerModel(); m.g.rotation.y = .6; return m.g; }; thumbQ.push(img); pump();
  }
  const ask = b => { if (b.dataset.sure) return false; b.dataset.sure = 1; const p = b.querySelector('.p'); p.dataset.old = p.innerHTML; p.textContent = 'Acheter ?'; b.classList.add('ask'); setTimeout(() => { if (b.dataset.sure) { delete b.dataset.sure; p.innerHTML = p.dataset.old; b.classList.remove('ask'); } }, 2500); return true; };
  ward.addEventListener('click', e => {
    const b = e.target.closest('.witem'); if (!b || b.disabled) return;
    const it = WARD.find(x => x.id === b.dataset.w); if (!it) return;
    if (!owned(it)) {
      if (ask(b)) return;
      if ((S.tokens || 0) < it.price) return;
      S.tokens -= it.price; S.style.own.push(it.id); MS.sfx.buy(); toast(it.name + ' · −' + it.price + ' ⭐', 'gold');
    }
    S.style[it.cat] = it.val; dirty = true; syncPet(); MS.markSave(); wardUi(); MS.emit('tokens', S.tokens);
  });
  atel.addEventListener('click', e => {
    const u = e.target.closest('.wbtn[data-u]'), t = e.target.closest('.witem[data-tr]');
    if (u && !u.disabled) {
      const [k, id] = u.dataset.u.split(':'), v = MS.VEHS.find(x => x.id === id), lv = (S.upg[id] ||= { b: 0, m: 0 });
      if (lv[k] >= 3) return; const pr = Math.round(v.price * RATE[lv[k]]); if (S.money < pr) return;
      S.money -= pr; lv[k]++; applyUpg(); refreshVeh(id); MS.sfx.buy(); toast(`${v.name} · ${k === 'b' ? 'brosses' : 'moteur'} niveau ${lv[k]}`, 'gold');
    } else if (t && !t.disabled) {
      if (!S.trailer) { if (ask(t)) return; if (S.money < 8000) return; S.money -= 8000; S.trailer = true; S.trailerOn = true; MS.sfx.buy(); toast('Remorque livrée', 'gold'); }
      else { S.trailerOn = !S.trailerOn; toast(S.trailerOn ? 'Remorque attelée' : 'Remorque dételée'); }
      applyUpg(); syncTrailer(); if (S.riding) MS.setRig();
    } else return;
    MS.markSave(); MS.shopUi(); atelUi(); MS.hud(true);
  });
  $('open').addEventListener('click', () => { wardUi(); atelUi(); });
  on('buy', (type) => { if (type === 'veh') atelUi(); });
  on('tokens', () => { if (!$('garage').hidden) wardUi(); });
  on('load', () => { syncPet(); syncTrailer(); });
})();
