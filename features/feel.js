// Game feel : retours haptiques/visuels, ambiance sonore ASMR, dernier mètre d'un secteur, mode photo et avant/après.
(() => {
  const { S, on, sheet, button, toggle, say, chunkAt, RINGS, secName, glowFx, player, renderer, scene, camera, THREE, CELLS, clamp } = MS;
  S.feel ??= { haptic: true, ambiance: true };
  const NC = CELLS * CELLS, P = player.position;
  const style = document.createElement('style');
  style.textContent = `
.feel-flash { position: fixed; inset: 0; pointer-events: none; z-index: 5; opacity: 0; box-shadow: inset 0 0 70px 18px #fff; }
.feel-flash.gold { box-shadow: inset 0 0 110px 30px var(--gold); }
.feel-flash.on { animation: feelflash .22s ease-out; }
@keyframes feelflash { 0% { opacity: .9; } 100% { opacity: 0; } }
body.photo .hud, body.photo .dock, body.photo .msgs, body.photo .joy, body.photo .hint { display: none !important; }
#photo.live { background: transparent; pointer-events: none; overflow: hidden; }
#photo.live .sheet-top, #photo.live .sheet-bottom, #photo.live .feat { display: none; }
#photo .orbit { position: fixed; inset: 0; touch-action: none; pointer-events: auto; display: none; }
#photo.live .orbit { display: block; }
#photo .pbar { position: fixed; left: 16px; right: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 22px); display: none; gap: 10px; justify-content: center; pointer-events: auto; }
#photo.live .pbar { display: flex; }
#photo .pbar .btn { flex: 1; max-width: 220px; padding: 14px; font: 800 18px var(--display); letter-spacing: .1em; text-transform: uppercase; }
#photo .ptip { position: fixed; left: 16px; right: 16px; top: calc(env(safe-area-inset-top, 0px) + 16px); text-align: center; display: none; pointer-events: none; }
#photo.live .ptip { display: block; }
#photo .feat, #photo .shot, #photo .shot > *, #photo .ba { min-width: 0; max-width: 100%; }
#photo .shot { display: grid; gap: 10px; }
#photo .shot img { width: 100%; max-height: 60vh; object-fit: cover; border-radius: 10px; display: block; }
#photo .band { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 14px; }
#photo .band b { font: 800 20px var(--display); letter-spacing: .1em; text-transform: uppercase; }
#photo .ba { display: grid; gap: 6px; }
#photo .ba canvas { width: 100%; border-radius: 10px; image-rendering: pixelated; display: block; }
#photo .ba .row { display: flex; justify-content: space-between; }
#photo .big { position: fixed; inset: 0; background: #000; z-index: 2; display: grid; grid-template-rows: 1fr auto; place-items: center; gap: 12px; padding: 16px; }
#photo .big img { max-width: 100%; max-height: 100%; object-fit: contain; }
#photo .big .btn { margin-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px); }
#photo .acts { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
#photo .acts .btn { min-width: 0; padding: 12px 8px; font-size: 17px; white-space: nowrap; }
.tools { flex-wrap: wrap; justify-content: flex-end; }`;
  document.head.appendChild(style);

  // ===== 1. Retours : vibration (Android) ou flash de bord + micro-secousse (iOS) =====
  const flashEl = document.createElement('div'); flashEl.className = 'feel-flash'; document.body.appendChild(flashEl);
  const canVib = !!(navigator.vibrate && /Android/i.test(navigator.userAgent));
  function flash(gold) { flashEl.classList.remove('on'); flashEl.classList.toggle('gold', !!gold); void flashEl.offsetWidth; flashEl.classList.add('on'); }
  function vib(pattern, k, gold) {
    if (!S.feel.haptic) return;
    if (canVib) { try { navigator.vibrate(pattern); } catch (e) {} return; }
    flash(gold); MS.shake(k || .15);
  }
  on('sell', () => vib([18, 30, 18], .12));
  on('sector', () => vib([30, 40, 30, 40, 60], .25, true));
  on('badge', () => vib([20, 50, 40], .15, true));
  on('find', () => vib([15, 30, 15, 30, 45], .2, true));
  on('star', () => vib(12, .1));
  toggle('Retours', 'Vibration (Android) ou flash et petite secousse (iPhone)', () => S.feel.haptic, v => { S.feel.haptic = v; if (v) vib(20, .15); });

  // ===== 2. Ambiance sonore : synthèse Web Audio uniquement =====
  let A = null, own = null, ambG, whooshG, whooshF, motorO, motorF, motorG, noiseBuf, ambOn = -1, tAud = 0;
  const ctx = () => { if (A) return A; const c = MS.AC || own; if (c) setup(c); return A; };
  function setup(c) {
    A = c;
    try {
      // bruit rose (filtre de Paul Kellet) sur 2 s, bouclé
      const n = A.sampleRate * 2; noiseBuf = A.createBuffer(1, n, A.sampleRate); const d = noiseBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; }
      ambG = A.createGain(); ambG.gain.value = 0; ambG.connect(A.destination);
      // fond : rose filtré très bas
      const ns = A.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true; const nf = A.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 180; nf.Q.value = .4;
      const ng = A.createGain(); ng.gain.value = .9; ns.connect(nf).connect(ng).connect(ambG); ns.start();
      // nappe : deux oscillateurs détunés, très doux, légère respiration
      const pf = A.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.value = 420; const pg = A.createGain(); pg.gain.value = .55; pf.connect(pg).connect(ambG);
      for (const f of [110, 110.7]) { const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.connect(pf); o.start(); }
      const lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = .07; lg.gain.value = .2; lfo.connect(lg).connect(pg.gain); lfo.start();
      // whoosh d'aspiration (bruit passe-bande modulé)
      const ws = A.createBufferSource(); ws.buffer = noiseBuf; ws.loop = true; whooshF = A.createBiquadFilter(); whooshF.type = 'bandpass'; whooshF.frequency.value = 700; whooshF.Q.value = 1.2;
      whooshG = A.createGain(); whooshG.gain.value = 0; ws.connect(whooshF).connect(whooshG).connect(A.destination); ws.start();
      // moteur grave en engin
      motorO = A.createOscillator(); motorO.type = 'sawtooth'; motorO.frequency.value = 50; motorF = A.createBiquadFilter(); motorF.type = 'lowpass'; motorF.frequency.value = 160;
      motorG = A.createGain(); motorG.gain.value = 0; motorO.connect(motorF).connect(motorG).connect(A.destination); motorO.start();
    } catch (e) { A = null; }
  }
  // contexte de secours si MS.AC n'existe pas encore au premier geste
  document.addEventListener('pointerup', () => { if (!MS.AC && !own) try { own = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} if (own && own.state === 'suspended') own.resume(); ctx(); }, { passive: true });
  const live = () => A && S.feel.ambiance && !S.mute;
  function ting() {                                          // cliquetis cristallin : deux partiels inharmoniques + étincelle
    const a = ctx(); if (!live()) return; const t = a.currentTime, f = 1800 + Math.random() * 500;
    for (const [m, v, d] of [[1, .07, .5], [2.76, .03, .3], [5.4, .012, .18]]) {
      const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02);
    }
  }
  function statique() {                                      // radio : grésillement court avant la bulle
    const a = ctx(); if (!live()) return; const t = a.currentTime, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = .8;
    g.gain.setValueAtTime(.05, t); g.gain.setValueAtTime(.012, t + .05); g.gain.setValueAtTime(.045, t + .09); g.gain.exponentialRampToValueAtTime(.0005, t + .2);
    s.connect(f).connect(g).connect(a.destination); s.start(t); s.stop(t + .22);
  }
  on('nugget', ting); on('star', ting);
  const radioEl = document.getElementById('radio');
  if (radioEl) new MutationObserver(() => { if (radioEl.classList.contains('on')) statique(); }).observe(radioEl, { attributes: true, attributeFilter: ['class'] });
  toggle('Ambiance sonore', 'Nappe douce, souffle de l’aspirateur, moteur, radio', () => S.feel.ambiance, v => { S.feel.ambiance = v; });

  // ===== 3. Dernier mètre : zoom lent puis salve blanche au secteur fini =====
  let fin = null, finT = 0;
  const closeV = new THREE.Vector3(), tmpV = new THREE.Vector3();
  const finCam = (camPos, camLook, dt) => {
    finT += dt; const k = Math.min(1, finT / 2), e = k * k * (3 - 2 * k);
    closeV.set(P.x + 1.5, P.y + 4.5, P.z + 6);
    camera.position.lerpVectors(camPos, closeV, e * .7); camera.lookAt(camLook);
  };
  on('sector', c => {
    if (fin && fin === c) { fin = null; if (MS.cam === finCam) MS.cam = null; }
    glowFx.burst(P.x, P.y + 1.2, P.z, 70, 7, 1.4, [0xffffff, 0xfff6d6, 0xffe9a0], 2.5);
    flash(true);
  });

  // ===== 4. Mode photo et avant/après =====
  const ui = sheet('photo', 'Photo');
  const orbit = document.createElement('div'); orbit.className = 'orbit';
  const tip = document.createElement('div'); tip.className = 'ptip label'; tip.textContent = 'Glisse pour tourner autour du joueur';
  const bar = document.createElement('div'); bar.className = 'pbar';
  bar.innerHTML = '<button class="btn primary" type="button" data-cap>Capturer</button><button class="btn" type="button" data-quit>Quitter</button>';
  ui.el.append(orbit, tip, bar);
  let photo = false, ang = 0, elev = .55, dist = 14, drag = null;
  const orbCam = (camPos, camLook) => {
    const ce = Math.cos(elev);
    camera.position.set(P.x + Math.sin(ang) * ce * dist, P.y + Math.sin(elev) * dist + .6, P.z + Math.cos(ang) * ce * dist);
    tmpV.set(P.x, P.y + 1, P.z); camera.lookAt(tmpV);
  };
  function enter() {
    photo = true; ang = Math.atan2(camera.position.x - P.x, camera.position.z - P.z); elev = .55; dist = clamp(MS.D, 8, 30);
    ui.el.classList.add('live'); document.body.classList.add('photo'); ui.body.innerHTML = ''; fin = null; MS.cam = orbCam; ui.open();
  }
  function leave() { photo = false; document.body.classList.remove('photo'); ui.el.classList.remove('live'); if (MS.cam === orbCam) MS.cam = null; drag = null; ui.close(); }
  orbit.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; orbit.setPointerCapture(e.pointerId); });
  orbit.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    ang -= (e.clientX - drag.x) * .012; elev = clamp(elev - (e.clientY - drag.y) * .006, .08, 1.35); drag.x = e.clientX; drag.y = e.clientY;
  });
  orbit.addEventListener('pointerup', () => { drag = null; }); orbit.addEventListener('pointercancel', () => { drag = null; });
  orbit.addEventListener('wheel', e => { e.preventDefault(); dist = clamp(dist * (1 + e.deltaY * .0012), 5, 40); }, { passive: false });
  function capture() {
    if (MS.composer) MS.composer.render(); else renderer.render(scene, camera);
    let url = ''; try { url = renderer.domElement.toDataURL('image/jpeg', .92); } catch (e) {}
    const c = chunkAt(P.x, P.z), pct = c ? Math.round(c.clean / NC * 100) : 0, nom = c ? secName(c.cx, c.cz) : '—';
    ui.el.classList.remove('live'); document.body.classList.remove('photo'); if (MS.cam === orbCam) MS.cam = null;
    ui.body.innerHTML = `<div class="shot"><img alt="Capture du chantier"><div class="glass band"><b>Moon Sweeper</b><span>Secteur ${nom} · ${pct} % propre</span></div>
      <div class="acts"><button class="btn primary" type="button" data-save>Enregistrer</button><button class="btn" type="button" data-again>Autre photo</button></div>
      <h3>Avant / après <small>secteur ${nom}</small></h3><div class="ba"><canvas width="256" height="128"></canvas><div class="row"><span class="label">À l’arrivée</span><span class="label">Aujourd’hui · ${pct} %</span></div></div></div>`;
    ui.body.querySelector('img').src = url;
    if (c) beforeAfter(ui.body.querySelector('canvas'), c);
    ui.body.querySelector('[data-save]').addEventListener('click', () => {
      const big = document.createElement('div'); big.className = 'big';
      big.innerHTML = `<img alt="Capture"><div style="text-align:center;display:grid;gap:8px"><span class="label">Appui long sur l’image pour l’enregistrer</span><button class="btn" type="button">Fermer</button></div>`;
      big.querySelector('img').src = url; big.querySelector('button').addEventListener('click', () => big.remove()); ui.el.appendChild(big);
    });
    ui.body.querySelector('[data-again]').addEventListener('click', enter);
  }
  // avant/après : à gauche la poussière d'origine (couleur unie de la région), à droite l'état actuel lu dans c.h (1 = poussière)
  function beforeAfter(cv, c) {
    const g = cv.getContext('2d'), d = RINGS[Math.min(4, c.ring)].dust, img = g.createImageData(256, 128), p = img.data, h = c.h;
    const dr = d[0], dg = d[1], db = d[2], cr = dr * .42 | 0, cg = dg * .42 | 0, cb = (db * .42 + 10) | 0;
    for (let y = 0; y < 128; y++) for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4, dust = x < 128 ? 1 : h[y * 128 + x - 128], v = ((x * 7 + y * 13) % 9) - 4;
      p[i] = (dust ? dr : cr) + v; p[i + 1] = (dust ? dg : cg) + v; p[i + 2] = (dust ? db : cb) + v; p[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(127, 0, 2, 128);
  }
  bar.addEventListener('click', e => { if (e.target.closest('[data-cap]')) capture(); else if (e.target.closest('[data-quit]')) leave(); });
  ui.el.addEventListener('click', e => { if (e.target.closest('[data-close]')) leave(); });
  button('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm8 2.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>', 'Photo', () => { if (!photo) enter(); });

  // ===== boucle : zéro allocation =====
  on('frame', (dt, f) => {
    if (photo && ui.el.hidden) leave();                      // feuille fermée autrement (bouton Retour, etc.)
    // dernier mètre du secteur courant
    if (!photo && !f.paused) {
      const c = chunkAt(P.x, P.z);
      if (fin && (c !== fin || fin.done || finT > 10)) { fin = null; if (MS.cam === finCam) MS.cam = null; }
      if (!fin && c && !c.done && c.clean >= NC * .97 && c.clean < NC && !MS.cam) { fin = c; finT = 0; MS.cam = finCam; say('Radio', 'Dernier mètre…'); }
    }
    // ambiance (mise à jour 10 fois par seconde)
    if (!A) return;
    tAud -= dt; if (tAud > 0) return; tAud = .1;
    const t = A.currentTime, ok = S.feel.ambiance && !S.mute;
    const want = ok ? 1 : 0; if (want !== ambOn) { ambOn = want; ambG.gain.setTargetAtTime(want ? .03 : 0, t, .8); }
    const id = f.t.id, suck = ok && !f.paused && !f.riding && (id === 'vac' || id === 'blower') && f.mag > .05;
    whooshG.gain.setTargetAtTime(suck ? .03 + f.mag * .04 : 0, t, .12);
    if (suck) whooshF.frequency.setTargetAtTime((id === 'blower' ? 900 : 500) + f.mag * 600, t, .15);
    const motor = ok && !f.paused && f.riding;
    motorG.gain.setTargetAtTime(motor ? .035 : 0, t, .15);
    if (motor) motorO.frequency.setTargetAtTime(40 + f.mag * 50 + (f.boostOn ? 12 : 0), t, .2);
  });
})();
