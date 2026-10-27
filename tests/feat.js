// Lance le jeu dans Chromium (rendu logiciel) avec UNE extension, prend des captures et liste les erreurs.
// Usage : node tests/feat.js features/<nom>.js [fresh|rich] [script.js]
//   script.js (optionnel) : module exportant async (page, helpers) => {} pour des actions supplémentaires.
// Captures dans tests/out/<nom>-*.png. three.js est servi depuis /tmp/claude-0/t/package (hors ligne).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const feature = process.argv[2], mode = process.argv[3] || 'rich', extra = process.argv[4];
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(__dirname, 'out'), T = '/tmp/claude-0/t/package';
fs.mkdirSync(OUT, { recursive: true });
const RICH = { money: 90000, dust: 0, hand: 'blower', hands: ['brosse', 'blower'], veh: {}, riding: null, bots: ['roomba'], gear: ['lamp', 'boots', 'detector'], bag: 2, found: ['golf'], mute: true, zen: false, zoom: 12, px: 10, pz: 24, ry: 3, chapter: 2, ringOpen: 2, stats: { sold: 5, stars: 1, nugs: 3, dist: 400, combo: 2 }, badges: ['sale1'], seen: Date.now() - 3600e3, tuto: 2, intro: true, tokens: 12 };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ path: path.join(T, 'build/three.min.js'), contentType: 'text/javascript' });
    const m = u.match(/three@0\.128\.0\/(examples\/js\/.*)$/);
    if (m) return r.fulfill({ path: path.join(T, m[1]), contentType: 'text/javascript' });
    const f = u.match(/features\/([^/?]+\.js)$/);
    if (f) return feature && f[1] === path.basename(feature) ? r.fulfill({ path: path.resolve(ROOT, feature), contentType: 'text/javascript' }) : r.fulfill({ status: 200, body: '', contentType: 'text/javascript' });
    if (u.startsWith('file:')) return r.continue();
    return r.fulfill({ status: 200, body: '' });
  });
  if (mode === 'rich') await p.addInitScript(st => { localStorage.setItem('moonsweeper7', JSON.stringify(st)); }, RICH);
  await p.goto('file://' + path.join(ROOT, 'index.html'));
  await p.waitForTimeout(2500);
  const tag = (feature ? path.basename(feature, '.js') : 'base') + '-' + mode;
  const shot = n => p.screenshot({ path: path.join(OUT, `${tag}-${n}.png`) });
  const drag = async (pts, n) => { await p.mouse.move(195, 600); await p.mouse.down(); for (const [x, y] of pts) for (let i = 0; i < n; i++) { await p.mouse.move(x, y); await p.waitForTimeout(40); } await p.mouse.up(); };
  await shot(0);
  if (!(await p.$eval('#modal', e => e.hidden))) await p.click('#mok');
  await drag([[195, 540], [255, 600], [195, 660]], 18); await p.waitForTimeout(600); await shot(1);
  if (extra) await require(path.resolve(extra))(p, { shot, drag, OUT });
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('moonsweeper7')));
  console.log('state', JSON.stringify({ money: st.money, dust: Math.round(st.dust), chapter: st.chapter, tokens: st.tokens, badges: (st.badges || []).length }));
  const fps = await p.evaluate(() => new Promise(r => { let n = 0; const t = performance.now(); (function f() { n++; if (performance.now() - t < 2000) requestAnimationFrame(f); else r(n / 2); })(); }));
  console.log('fps (rendu logiciel, relatif)', fps.toFixed(1));
  console.log(errs.length ? 'ERREURS:\n' + errs.slice(0, 20).join('\n') : 'aucune erreur console');
  await b.close();
})();
