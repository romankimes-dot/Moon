// Progression : contrats du jour, pépites rares + album, vent solaire, prestige « Nouvelle Lune », défi du secteur parfait.
// Tout passe par window.MS (voir features/README.md) ; ce fichier ne touche pas au jeu.
(() => {
  const MS = window.MS; if (!MS || MS.progression) return;              // une seule fois, même si la balise est en double
  MS.progression = true;
  const { S, on, toast, pop, say, sheet, button, chip, modal, addTokens, fmt, RINGS, CH, CELLS, chunks, chunkAt, redirty, markSave, checkBadges, glowFx, player, H, $ } = MS;
  const KEY = 'moonsweeper7', boss = () => (MS.ST.boss && (MS.ST.boss.callsign || MS.ST.boss.name)) || 'Base';
  const rnd = n => Math.floor(Math.random() * n);
  S.quests ??= { day: '', list: [] };
  S.album ??= { or: 0, opale: 0, meteo: 0, diamant: 0 };
  S.prestige ??= 0; S.perfect ??= 0;
  if (!S.wind) S.wind = Date.now();

  // ===== Styles =====
  const st = document.createElement('style');
  st.textContent = `
.pop.opale { color: #63e6ff; text-shadow: 0 2px 0 #000, 0 0 14px rgba(99,230,255,.8), 0 0 28px rgba(226,57,159,.6); }
.pop.meteo { color: #ff6a3d; text-shadow: 0 2px 0 #000, 0 0 16px rgba(255,106,61,.9); font-size: 26px; }
.pop.diamant { color: #fff; text-shadow: 0 2px 0 #000, 0 0 18px #9fdcff, 0 0 36px #fff; font-size: 30px; }
.chip.perfect { color: var(--gold); border-color: rgba(255,197,66,.6); animation: perfectPulse 1.2s ease-in-out infinite; }
@keyframes perfectPulse { 50% { box-shadow: 0 0 14px rgba(255,197,66,.6); } }
.qhint { margin: 0; color: var(--muted); font-size: 13px; }
.quest { position: relative; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,.05); display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; }
.quest b { font: 700 19px/1.1 var(--display); letter-spacing: .03em; }
.quest .rew { grid-row: 1 / span 2; align-self: center; font: 800 20px var(--display); color: var(--gold); white-space: nowrap; }
.quest small { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.quest .bar { grid-column: 1 / -1; margin-top: 6px; }
.quest.done { border-color: rgba(99,224,143,.6); background: rgba(99,224,143,.08); }
.quest.done b { color: var(--good); }
.quest.done .rew { color: var(--good); }
.quest.done .bar i { background: var(--good); width: 100% !important; }
.album { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.rare { padding: 10px 6px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,.04); display: grid; gap: 4px; justify-items: center; text-align: center; min-width: 0; }
.rare i { width: 26px; height: 26px; border-radius: 50%; display: block; background: radial-gradient(circle at 35% 30%, #fff3c0, #ffc542 50%, #b57a00); box-shadow: 0 0 12px rgba(255,197,66,.6); }
.rare.opale i { background: radial-gradient(circle at 35% 30%, #fff, #63e6ff 45%, #e2399f); box-shadow: 0 0 12px rgba(99,230,255,.7); }
.rare.meteo i { background: radial-gradient(circle at 35% 30%, #ffd2a6, #ff6a3d 50%, #3a1208); box-shadow: 0 0 12px rgba(255,106,61,.8); }
.rare.diamant i { background: radial-gradient(circle at 35% 30%, #fff, #cfefff 45%, #5aa8d6); box-shadow: 0 0 14px #9fdcff; }
.rare b { font: 800 24px/1 var(--display); font-variant-numeric: tabular-nums; }
.rare small { color: var(--muted); font-size: 11px; line-height: 1.2; }
.rare.zero { opacity: .5; }
.prestige { padding: 14px; border-radius: 12px; border: 1px solid rgba(255,197,66,.45); background: rgba(255,197,66,.07); display: grid; gap: 10px; }
.prestige p { margin: 0; color: #cfd3dc; font-size: 14px; }
.prestige .btn { justify-self: stretch; justify-content: center; }
.prestige .lvl { font: 800 15px var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }`;
  document.head.appendChild(st);

  // ===== 1. Contrats du jour =====
  // ev : événement compté · n : objectif · rew : jetons ⭐
  const POOL = [
    { id: 'sell3',    txt: 'Vendre 3 sacs',                       ev: 'sell',   n: 3,    rew: 4 },
    { id: 'sell6',    txt: 'Vendre 6 sacs',                       ev: 'sell',   n: 6,    rew: 6 },
    { id: 'sec1',     txt: 'Terminer 1 secteur',                  ev: 'sector', n: 1,    rew: 6 },
    { id: 'sec2',     txt: 'Terminer 2 secteurs',                 ev: 'sector', n: 2,    rew: 8 },
    { id: 'nug10',    txt: 'Ramasser 10 pépites',                 ev: 'nugget', n: 10,   rew: 4 },
    { id: 'nug25',    txt: 'Ramasser 25 pépites',                 ev: 'nugget', n: 25,   rew: 7 },
    { id: 'star1',    txt: 'Attraper 1 éclat d’étoile filante',   ev: 'star',   n: 1,    rew: 5 },
    { id: 'dist300',  txt: 'Parcourir 300 m',                     ev: 'dist',   n: 300,  rew: 3, unit: ' m' },
    { id: 'dist1000', txt: 'Parcourir 1 km',                      ev: 'dist',   n: 1000, rew: 5, unit: ' m' },
    { id: 'combo2',   txt: 'Atteindre un combo × 2',              ev: 'combo',  n: 1,    rew: 5 },
    { id: 'rare1',    txt: 'Trouver une pépite rare',             ev: 'rare',   n: 1,    rew: 6 },
    { id: 'buy1',     txt: 'Acheter quelque chose au garage',     ev: 'buy',    n: 1,    rew: 3 }
  ];
  const DEF = {}; for (const d of POOL) DEF[d.id] = d;
  const dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  // nouveau jour : on garde les contrats en cours, on remplace seulement les finis
  function rollover() {
    const k = dayKey(), Q = S.quests;
    Q.list = Q.list.filter(q => DEF[q.id]);
    if (Q.day === k && Q.list.length === 3) return;
    if (Q.day !== k) Q.list = Q.list.filter(q => !q.done);
    Q.day = k;
    let guard = 40;
    while (Q.list.length < 3 && guard--) {
      const d = POOL[rnd(POOL.length)];
      if (Q.list.some(q => q.id === d.id || DEF[q.id].ev === d.ev)) continue;      // pas deux fois le même type
      Q.list.push({ id: d.id, p: 0, done: false, d0: S.stats.dist || 0 });
    }
    markSave();
  }
  function finish(q, d) {
    q.done = true; q.p = d.n;
    toast('Contrat rempli · ' + d.txt, 'gold'); addTokens(d.rew); markSave();
    if (MS.sfx && MS.sfx.buy) MS.sfx.buy();
  }
  function prog(ev, n) {
    for (const q of S.quests.list) {
      if (q.done) continue; const d = DEF[q.id]; if (!d || d.ev !== ev) continue;
      q.p = Math.min(d.n, q.p + n); if (q.p >= d.n) finish(q, d);
    }
  }
  on('sell', v => { if (v >= 25) prog('sell', 1); });
  on('sector', () => prog('sector', 1));
  on('nugget', () => prog('nugget', 1));
  on('star', () => prog('star', 1));
  on('buy', () => prog('buy', 1));
  // distance et combo : vérifiés toutes les demi-secondes (pas de travail par image)
  const comboEl = $('combo');
  function slowCheck() {
    for (const q of S.quests.list) {
      if (q.done) continue; const d = DEF[q.id]; if (!d) continue;
      if (d.ev === 'dist') { q.p = Math.min(d.n, Math.floor((S.stats.dist || 0) - q.d0)); if (q.p >= d.n) finish(q, d); }
      else if (d.ev === 'combo' && comboEl.classList.contains('on') && parseFloat(comboEl.textContent.slice(8).replace(',', '.')) >= 2) finish(q, d);
    }
  }
  rollover();

  // ===== 2. Pépites rares =====
  const RARE = [
    { id: 'or',      name: 'Or',          mult: 1,  p: .85,  cls: '',        col: null },
    { id: 'opale',   name: 'Opale',       mult: 3,  p: .12,  cls: 'opale',   col: [0x63e6ff, 0xe2399f, 0xffffff] },
    { id: 'meteo',   name: 'Météorique',  mult: 10, p: .025, cls: 'meteo',   col: [0xff6a3d, 0xffc542, 0x3a1208] },
    { id: 'diamant', name: 'Diamant',     mult: 30, p: .005, cls: 'diamant', col: [0xffffff, 0x9fdcff, 0x63e6ff] }
  ];
  const roll = () => { let r = Math.random(), i = RARE.length - 1; for (; i > 0; i--) { if (r < RARE[i].p) return RARE[i]; r -= RARE[i].p; } return RARE[0]; };
  on('nugget', (c, n) => {
    const R = roll(); S.album[R.id] = (S.album[R.id] || 0) + 1;
    if (R.mult === 1) return;
    const extra = Math.round(30 * RINGS[c.ring].mult * (R.mult - 1));             // en plus de la pépite normale
    S.money += extra; prog('rare', 1); markSave();
    glowFx.burst(n.x, H(n.x, n.z) + .6, n.z, 20 + R.mult * 2, 4, 1.4, R.col, 3);
    setTimeout(() => pop(R.name + ' ! +$' + fmt(extra), R.cls), 380);              // décalée pour ne pas couvrir le +$ du jeu
    if (R.mult >= 10) say(boss(), R.mult >= 30 ? 'Un diamant lunaire ! Range-le bien, c’est plus rare que le fromage.' : 'Pépite météorique ! Elle vient d’ailleurs. Comme toi, finalement.');
    checkBadges();
  });
  MS.BADGES.push(
    { id: 'opale1',   name: 'Reflets d’opale',  txt: 'Ramasser une première opale.', ok: () => (S.album.opale || 0) >= 1 },
    { id: 'opale10',  name: 'Collection opale', txt: 'Ramasser 10 opales.', ok: () => (S.album.opale || 0) >= 10 },
    { id: 'meteo1',   name: 'Venue d’ailleurs', txt: 'Ramasser une pépite météorique.', ok: () => (S.album.meteo || 0) >= 1 },
    { id: 'diamant1', name: 'Diamant lunaire',  txt: 'Ramasser un diamant.', ok: () => (S.album.diamant || 0) >= 1 },
    { id: 'perfect',  name: 'Sans lever le doigt', txt: 'Nettoyer un secteur entier d’un seul geste.', ok: () => (S.perfect || 0) >= 1 }
  );

  // ===== 3. Vent solaire : après le dernier chapitre, la poussière retombe un peu (1 % par heure, 8 % max) =====
  function blow(pct) {
    const done = []; for (const c of chunks.values()) if (c.done && (c.cx || c.cz)) done.push(c);
    if (!done.length) return;
    const names = [];
    for (let k = 0; k < 3 && done.length; k++) {
      const c = done.splice(rnd(done.length), 1)[0], area = pct / 100 * CH * CH;
      const r = Math.min(6, Math.max(3, Math.sqrt(area / Math.PI))), n = Math.max(1, Math.round(area / (Math.PI * r * r)));
      for (let i = 0; i < n; i++) redirty(c.cx * CH + (Math.random() - .5) * (CH - 2 * r), c.cz * CH + (Math.random() - .5) * (CH - 2 * r), r);
      names.push(MS.secName(c.cx, c.cz));
    }
    say(boss(), 'Vent solaire cette nuit : de la poussière est retombée sur ' + names.join(', ') + '. Un petit coup de balai ?');
    markSave();
  }
  if (S.chapter >= 6) { const h = (Date.now() - S.wind) / 3600e3; if (h >= 1) { blow(Math.min(8, Math.floor(h))); S.wind = Date.now(); } }
  setInterval(() => { if (S.chapter >= 6) { blow(1); S.wind = Date.now(); } }, 3600e3);
  on('chapter', n => { if (n >= 6) S.wind = Date.now(); });

  // ===== 4. Prestige « Nouvelle Lune » =====
  const TINT = [0xffffff, 0xcfe3ff, 0xffd9c7, 0xd4ffe0, 0xeacfff, 0xfff3c4];
  let groundMat = null, tTint = 0;
  const findGround = o => { if (!groundMat && o.isMesh && o.material && o.material.map && o.material.roughness === .5 && o.material.metalness === .18) groundMat = o.material; };
  function tint() { MS.scene.traverse(findGround); if (groundMat) groundMat.color.setHex(TINT[Math.min(TINT.length - 1, S.prestige)]); }
  on('sell', v => {
    if (!S.prestige) return;
    const b = Math.round(v * .1 * S.prestige); if (b <= 0) return;
    S.money += b; setTimeout(() => pop('Prime Nouvelle Lune +$' + fmt(b), 'gold'), 450);
  });
  function doPrestige() {
    S.prestige++;
    Object.assign(S, { money: 0, dust: 0, hand: 'brosse', hands: ['brosse'], veh: {}, riding: null, bots: [], gear: [], bag: 0, found: [], px: 0, pz: 7, ry: Math.PI, chapter: 0, ringOpen: 0, tuto: 2, intro: false, stats: { sold: 0, stars: 0, nugs: 0, dist: 0, combo: 0 } });
    S.wind = Date.now(); S.quests.list = S.quests.list.filter(q => DEF[q.id].ev !== 'dist');
    for (const c of chunks.values()) c.sv = 0;                                      // rien à réécrire au pagehide
    player.position.set(0, H(0, 7), 7); player.rotation.y = Math.PI;               // save() relit la position
    try { for (const k of Object.keys(localStorage)) if (k.startsWith(KEY + ':')) localStorage.removeItem(k); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    location.reload();
  }

  // ===== 5. Défi du secteur parfait : un secteur affiché à 0 % (moins d'1 % nettoyé, robots compris) fini sans relâcher le doigt =====
  const NC = CELLS * CELLS;
  let pc = null, rel = 0, lcx = 1e9, lcz = 1e9, cur = null, tSlow = 0, tDay = 0;
  const chipEl = chip('Défi parfait', 'perfect'); chipEl.hidden = true;
  const cancel = () => { if (pc) { pc = null; chipEl.hidden = true; } };
  on('frame', (dt, f) => {
    const P = f.P, cx = Math.round(P.x / CH), cz = Math.round(P.z / CH);
    if (cx !== lcx || cz !== lcz) { lcx = cx; lcz = cz; cur = chunkAt(P.x, P.z); if (pc && cur !== pc) cancel(); }
    if (!f.paused) {
      if (pc) { if (f.mag > .08) rel = 0; else { rel += dt; if (rel > .5) cancel(); } }
      else if (cur && !cur.done && cur.clean * 100 < NC && f.mag > .08 && MS.started) { pc = cur; rel = 0; chipEl.hidden = false; }
    }
    tSlow -= dt; if (tSlow <= 0) { tSlow = .5; slowCheck(); if (!groundMat && S.prestige) { tTint -= .5; if (tTint <= 0) { tTint = 2; tint(); } } }
    tDay -= dt; if (tDay <= 0) { tDay = 30; rollover(); }
  });
  on('sector', c => {
    if (pc !== c) return;
    pc = null; chipEl.hidden = true;
    const bonus = Math.round(CH * CH * RINGS[c.ring].mult * .4);
    S.money += bonus; S.perfect++; markSave();
    toast('Secteur parfait · bonus doublé', 'gold');
    setTimeout(() => pop('Parfait ! +$' + fmt(bonus), 'gold'), 450);
    checkBadges();
  });
  if (S.prestige) tint();

  // ===== Feuille « Contrats » =====
  const ui = sheet('quests-sheet', 'Contrats');
  const esc = s => String(s).replace(/</g, '&lt;');
  function draw() {
    const Q = S.quests.list, A = S.album;
    const quest = q => { const d = DEF[q.id], pct = Math.min(100, q.p / d.n * 100);
      return `<div class="quest${q.done ? ' done' : ''}"><b>${esc(d.txt)}</b><span class="rew">${q.done ? '✓' : '+' + d.rew + ' ⭐'}</span><small>${q.done ? 'Rempli' : fmt(q.p) + ' / ' + fmt(d.n) + (d.unit || '')}</small><div class="bar"><i style="width:${pct.toFixed(0)}%"></i></div></div>`; };
    const rare = R => `<div class="rare ${R.cls}${A[R.id] ? '' : ' zero'}"><i></i><b>${fmt(A[R.id] || 0)}</b><small>${R.name}${R.mult > 1 ? ' · ×' + R.mult : ''}</small></div>`;
    let h = `<p class="qhint">Trois petites tâches tirées au sort chaque jour. Pas de date limite : un contrat reste tant qu’il n’est pas rempli. Récompense en jetons ⭐.</p>
<div class="list">${Q.map(quest).join('')}</div>
<p class="qhint">Jetons : ⭐ ${fmt(S.tokens || 0)} · les contrats remplis sont remplacés le lendemain.</p>
<h3>Album <small>pépites rares</small></h3>
<div class="album">${RARE.map(rare).join('')}</div>
<p class="qhint">Chaque pépite peut être une opale (12 %), une météorique (2,5 %) ou un diamant (0,5 %). Elles rapportent plus.</p>`;
    if (S.chapter >= 6 || S.prestige) {
      h += `<h3>Nouvelle Lune <small>prestige</small></h3><div class="prestige">
<span class="lvl">${S.prestige ? 'Nouvelle Lune × ' + S.prestige + ' · prime +' + S.prestige * 10 + ' % sur chaque vente' : 'Première Nouvelle Lune'}</span>
<p>Tu repars au chapitre 1 avec ta brosse à dents : argent, outils, engins, robots, équipement, sac, trouvailles et secteurs sont remis à zéro.</p>
<p>Tu gardes tes badges, tes jetons ⭐ et ton album. Chaque Nouvelle Lune ajoute une prime permanente de +10 % à chaque vente et change la teinte du sol propre.</p>
${S.chapter >= 6 ? '<button class="btn primary" type="button" data-prestige>Nouvelle Lune</button>' : '<p>Termine le dernier chapitre pour recommencer.</p>'}</div>`;
    }
    ui.body.innerHTML = h;
  }
  ui.body.addEventListener('click', e => {
    const b = e.target.closest('[data-prestige]'); if (!b) return;
    if (!b.dataset.sure) {
      b.dataset.sure = 1; b.textContent = 'Toucher encore pour confirmer';
      modal('Nouvelle Lune ' + (S.prestige + 1), 'Tout recommencer ?', `Perdu : argent, outils, engins, robots, équipement, sac, trouvailles, secteurs nettoyés.\n\nGardé : badges, jetons ⭐, album, et une prime permanente de +${(S.prestige + 1) * 10} % sur chaque vente.\n\nTouche encore le bouton pour confirmer.`, null, null, 'Compris');
      return;
    }
    b.disabled = true; b.textContent = 'Nouvelle Lune…'; doPrestige();
  });
  button('<path fill-rule="evenodd" d="M9 2h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1zm1 2v1h4V4h-4zM6 6v14h12V6h-2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6H6zm2 4h8v2H8v-2zm0 4h6v2H8v-2z"/>', 'Contrats', () => { rollover(); draw(); ui.open(); });
})();
