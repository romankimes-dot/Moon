// Méta : code de sauvegarde (changer de téléphone), score partagé par texte, capture du score,
// persistance iOS et feuille d'aide. Tout passe par l'API window.MS, index.html n'est pas touché.
(() => {
  const { S, $, toast, sheet, drawMap, sectorsAll, FINDS, BADGES, chunks, fmt } = MS;
  const KEY = 'moonsweeper7', LINK = 'https://romankimes-dot.github.io/Moon/';
  const st = document.createElement('style');
  st.textContent = `
.meta-sec { display: grid; gap: 8px; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,.04); }
.meta-sec p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.4; }
.meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
.meta-row .btn { padding: 10px 16px; font-size: 18px; }
.btn.meta-ghost { background: rgba(255,255,255,.08); color: var(--fg); border: 1px solid var(--line); }
.meta-ta { width: 100%; min-height: 96px; resize: vertical; box-sizing: border-box; border-radius: 10px; border: 1px solid var(--line); background: #090a0f; color: var(--fg); font: 12px/1.4 ui-monospace, Menlo, monospace; padding: 10px; word-break: break-all; }
.meta-hint { font-size: 12px; color: var(--muted); }
.meta-img { width: 100%; border-radius: 12px; border: 1px solid var(--line); display: block; }
.meta-help { display: grid; gap: 8px; margin: 0; padding: 0 0 0 20px; color: var(--fg); font-size: 14px; line-height: 1.45; }
.meta-help b { font: 700 16px var(--display); letter-spacing: .04em; }
.meta-go { justify-self: start; margin-top: 4px; }`;
  document.head.appendChild(st);

  // ---- outils ----
  const h = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const btn = (label, fn, primary) => { const b = h('button', 'btn ' + (primary ? 'primary' : 'meta-ghost'), label); b.type = 'button'; b.addEventListener('click', fn); return b; };
  const ko = n => n < 1024 ? n + ' o' : (n / 1024).toFixed(1).replace('.', ',') + ' ko';
  const dateFr = t => t ? new Date(t).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  // copie dans le presse-papiers depuis un geste utilisateur ; sinon sélectionne le texte
  const copy = (ta, txt) => navigator.clipboard.writeText(txt).then(() => toast('Copié'), () => { ta.focus(); ta.select(); toast('Sélectionné : copie manuelle'); });
  // base64url ↔ octets
  const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const pipe = async (u8, St) => { const r = new Blob([u8]).stream().pipeThrough(St); return new Uint8Array(await new Response(r).arrayBuffer()); };
  // chiffres du score : % propre, secteurs, trouvailles, badges, chapitre
  const score = () => { let cl = 0, n = 0; for (const c of chunks.values()) { cl += c.clean / c.h.length; n++; } return { pct: n ? cl / n * 100 : 0, sec: sectorsAll(), finds: S.found.length, badges: (S.badges || []).length, ch: S.chapter }; };
  const shareText = () => { const s = score(); return `🌕 Moon Sweeper · Lune propre à ${s.pct.toFixed(1).replace('.', ',')} % · ${s.sec} secteurs · ${s.finds} trouvailles · ${s.badges} badges · chapitre ${s.ch} · ${LINK}`; };

  // ---- 3. persistance iOS ----
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => {}); } catch (e) {}

  // ---- 1. export / import ----
  async function exportCode() {
    MS.save();
    const all = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(KEY)) all[k] = localStorage.getItem(k); }
    const raw = new TextEncoder().encode(JSON.stringify(all));
    if (typeof CompressionStream === 'function') { try { return 'MS1.' + b64u(await pipe(raw, new CompressionStream('deflate-raw'))); } catch (e) {} }
    return 'MS0.' + b64u(raw);
  }
  async function decodeCode(code) {
    code = (code || '').trim(); const m = code.match(/^MS([01])\.([A-Za-z0-9_-]+)$/); if (!m) throw new Error('format');
    let u8 = unb64u(m[2]); if (m[1] === '1') u8 = await pipe(u8, new DecompressionStream('deflate-raw'));
    const all = JSON.parse(new TextDecoder().decode(u8)), s = JSON.parse(all[KEY] || 'null');
    if (!s || typeof s !== 'object' || !Array.isArray(s.hands) || typeof s.chapter !== 'number' || !Array.isArray(s.found)) throw new Error('contenu');
    for (const k in all) if (!k.startsWith(KEY) || typeof all[k] !== 'string') throw new Error('clé');
    return all;
  }
  // écriture des clés : aussi au pagehide, après la sauvegarde du jeu (qui écraserait sinon S lors du rechargement)
  let pending = null;
  const writeAll = all => { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k && k.startsWith(KEY)) localStorage.removeItem(k); } for (const k in all) localStorage.setItem(k, all[k]); };
  addEventListener('pagehide', () => { if (pending) writeAll(pending); });
  function importCode(all) { pending = all; writeAll(all); location.reload(); }

  // ---- 2. texte de partage ----
  function shareBox(parent) {
    const sec = h('div', 'meta-sec'); sec.append(h('span', 'label', 'Partager mon score'));
    const ta = h('textarea', 'meta-ta'); ta.readOnly = true; ta.value = shareText(); ta.rows = 3;
    const row = h('div', 'meta-row'); row.append(btn('Copier', () => copy(ta, ta.value), true));
    if (navigator.share) row.append(btn('Partager…', () => { navigator.share({ text: ta.value }).catch(() => {}); }));
    sec.append(ta, row); parent.append(sec); return sec;
  }

  // ---- 5. capture du score (canvas 1080×1080) ----
  function capture() {
    const W = 1080, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, W); bg.addColorStop(0, '#0b1230'); bg.addColorStop(1, '#05070f'); g.fillStyle = bg; g.fillRect(0, 0, W, W);
    g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 140; i++) { const x = (i * 733) % W, y = (i * 419) % W, r = .6 + (i % 3) * .5; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.fillStyle = '#ff8a2a'; g.font = `700 34px Barlow Condensed, sans-serif`; g.textAlign = 'center'; g.fillText('MOON SWEEPER', W / 2, 90);
    const s = score();
    g.fillStyle = '#fff'; g.font = `800 92px Barlow Condensed, sans-serif`; g.fillText(`Lune propre à ${s.pct.toFixed(1).replace('.', ',')} %`, W / 2, 190);
    const map = document.createElement('canvas'), ms = 560; map.width = map.height = ms; drawMap(map.getContext('2d'), ms, true);
    g.save(); g.beginPath(); g.roundRect ? g.roundRect((W - ms) / 2, 240, ms, ms, 24) : g.rect((W - ms) / 2, 240, ms, ms); g.clip(); g.drawImage(map, (W - ms) / 2, 240); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 3; g.strokeRect((W - ms) / 2, 240, ms, ms);
    const cols = [[s.sec, 'secteurs'], [s.finds, 'trouvailles'], [s.badges, 'badges'], ['Ch. ' + s.ch, 'chapitre']];
    cols.forEach(([v, l], i) => { const x = W / 8 + i * W / 4; g.fillStyle = '#ffc542'; g.font = `800 72px Barlow Condensed, sans-serif`; g.fillText(String(v), x, 920); g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `700 26px Barlow Condensed, sans-serif`; g.fillText(l.toUpperCase(), x, 960); });
    g.fillStyle = 'rgba(255,255,255,.45)'; g.font = `600 26px Barlow Condensed, sans-serif`; g.fillText(LINK.replace('https://', '') + ' · ' + dateFr(Date.now()), W / 2, 1035);
    return c.toDataURL('image/png');
  }

  // ---- feuille Sauvegarde ----
  const save = sheet('meta-save', 'Sauvegarde');
  function saveUi() {
    const b = save.body; b.innerHTML = '';
    // état du stockage
    const info = h('div', 'meta-sec'); info.append(h('span', 'label', 'Sur cet appareil'));
    const pInfo = h('p', null, `Dernière sauvegarde : ${dateFr(S.seen)}. Les données restent dans Safari : pensez à exporter un code de temps en temps.`); info.append(pInfo);
    const pEst = h('p', null, 'Espace : estimation en cours…'); info.append(pEst);
    try { navigator.storage && navigator.storage.estimate ? navigator.storage.estimate().then(e => { pEst.textContent = `Espace : ${ko(e.usage || 0)} utilisés sur ${ko(e.quota || 0)} disponibles.`; }).catch(() => { pEst.textContent = 'Espace : inconnu.'; }) : (pEst.textContent = 'Espace : inconnu.'); } catch (e) { pEst.textContent = 'Espace : inconnu.'; }
    b.append(info);
    // export
    const ex = h('div', 'meta-sec'); ex.append(h('span', 'label', 'Changer de téléphone'), h('p', null, 'Exportez un code, envoyez-le-vous (Notes, message) puis chargez-le sur l’autre appareil. Aucun serveur, tout reste chez vous.'));
    const exTa = h('textarea', 'meta-ta'); exTa.readOnly = true; exTa.hidden = true; exTa.placeholder = 'Le code apparaîtra ici'; exTa.rows = 5;
    const exSz = h('span', 'meta-hint', ''); const exRow = h('div', 'meta-row');
    const bCopy = btn('Copier', () => copy(exTa, exTa.value)); bCopy.hidden = true;
    exRow.append(btn('Exporter', async () => { try { const code = await exportCode(); exTa.value = code; exTa.hidden = false; bCopy.hidden = false; exSz.textContent = `Code de ${ko(code.length)} · ${Object.keys(localStorage).filter(k => k.startsWith(KEY)).length - 1} secteurs`; } catch (e) { toast('Export impossible', 'bad'); } }, true), bCopy, exSz);
    ex.append(exRow, exTa); b.append(ex);
    // import
    const im = h('div', 'meta-sec'); im.append(h('span', 'label', 'Charger un code'), h('p', null, 'Collez un code exporté ailleurs. La partie de cet appareil sera remplacée.'));
    const imTa = h('textarea', 'meta-ta'); imTa.placeholder = 'Collez le code ici'; imTa.rows = 4; imTa.id = 'meta-import';
    const imHint = h('span', 'meta-hint', ''); let armed = null;
    const bLoad = btn('Charger', async () => {
      if (armed) { importCode(armed); return; }
      try { armed = await decodeCode(imTa.value); } catch (e) { toast('Code illisible', 'bad'); imHint.textContent = 'Ce code n’est pas reconnu : vérifiez qu’il est complet.'; return; }
      const s = JSON.parse(armed[KEY]); bLoad.textContent = 'Confirmer le remplacement'; bLoad.classList.add('primary'); bLoad.classList.remove('meta-ghost');
      imHint.textContent = `Partie trouvée : chapitre ${s.chapter}, ${fmt(s.money || 0)} $, ${(s.found || []).length} trouvailles. Touchez encore pour remplacer la partie actuelle.`;
    });
    imTa.addEventListener('input', () => { armed = null; bLoad.textContent = 'Charger'; bLoad.classList.remove('primary'); bLoad.classList.add('meta-ghost'); imHint.textContent = ''; });
    const imRow = h('div', 'meta-row'); imRow.append(bLoad, imHint); im.append(imTa, imRow); b.append(im);
    // score
    shareBox(b);
    // capture
    const cp = h('div', 'meta-sec'); cp.append(h('span', 'label', 'Capture du score'));
    const img = h('img', 'meta-img'); img.alt = 'Capture du score'; img.hidden = true; const cpHint = h('p', null, ''); cpHint.hidden = true;
    const cpRow = h('div', 'meta-row'); cpRow.append(btn('Générer la capture', () => { try { img.src = capture(); img.hidden = false; cpHint.textContent = 'Appui long sur l’image pour l’enregistrer dans Photos.'; cpHint.hidden = false; } catch (e) { toast('Capture impossible', 'bad'); } }, true));
    cp.append(cpRow, img, cpHint); b.append(cp);
  }

  // ---- 4. feuille Aide ----
  const help = sheet('meta-help', 'Comment jouer');
  help.body.innerHTML = `<div class="meta-sec"><ol class="meta-help">
<li><b>Se déplacer</b> · glissez le doigt sur l’écran pour avancer ; pincez pour zoomer ou dézoomer.</li>
<li><b>Vendre</b> · revenez à la base (le point orange) quand le sac est plein : la poussière devient des dollars.</li>
<li><b>Garage</b> · à la base, achetez outils, engins, robots et sacs plus grands.</li>
<li><b>Monter et descendre</b> · appui long sur un engin pour monter dessus ; appui long encore pour en descendre.</li>
<li><b>Chapitres et régions</b> · chaque chapitre ouvre une région plus lointaine, à la poussière plus chère.</li>
<li><b>Étoiles filantes</b> · elles tombent près de vous : courez ramasser la pépite avant qu’elle refroidisse.</li>
<li><b>Badges</b> · des défis à long terme ; la liste est dans l’icône ★ du HUD.</li>
<li><b>Hors-ligne et iPhone</b> · le jeu marche sans réseau. Dans Safari : Partager → « Sur l’écran d’accueil » pour l’installer.</li>
</ol></div>`;

  // ---- entrées dans les réglages (avant « Recommencer ») et dans les badges ----
  const entry = (label, sub, fn) => { const b = h('button', 'toggle'); b.type = 'button'; b.innerHTML = `<span>${label}${sub ? '<small>' + sub + '</small>' : ''}</span><b>›</b>`; b.addEventListener('click', fn); $('reset').before(b); return b; };
  entry('Sauvegarde', 'Code pour changer de téléphone, score à partager, capture.', () => { saveUi(); $('settings-sheet').hidden = true; save.open(); }).id = 'meta-save-btn';
  entry('Comment jouer', 'Gestes, base, garage, chapitres…', () => { $('settings-sheet').hidden = true; help.open(); }).id = 'meta-help-btn';
  const badges = $('badges');
  if (badges) {
    const wrap = h('div', 'meta-sec'); wrap.id = 'meta-badge-share'; wrap.hidden = true; badges.after(wrap);
    const b = btn('Partager mon score', () => { if (wrap.hidden) { wrap.innerHTML = ''; shareBox(wrap); wrap.hidden = false; } else wrap.hidden = true; }, true); b.classList.add('meta-go'); b.id = 'meta-badge-btn'; badges.after(b);
  }
})();
