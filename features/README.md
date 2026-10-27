# Extensions (features/*.js)

Chaque fichier `features/<nom>.js` est chargé après le jeu (balise générée par build.py, ordre alphabétique) et
reçoit l'API `window.MS`. **Ne jamais modifier index.html** : tout passe par `MS`.

```js
// features/exemple.js
(() => {
  const { S, on, toast, pop, sheet, button, toggle, chip } = MS;
  S.exemple ??= { compteur: 0 };                     // état propre à l'extension : S est sauvegardé tel quel (JSON)
  const ui = sheet('exemple-sheet', 'Exemple');      // feuille plein écran : ui.body (conteneur), ui.open(), ui.close()
  button('<circle cx="12" cy="12" r="9"/>', 'Exemple', () => { ui.body.innerHTML = '…'; ui.open(); });
  on('sell', v => { S.exemple.compteur++; });        // événements
  on('frame', (dt, f) => { /* f = { paused, mag, riding, boostOn, moved, time, P, tp, t } */ });
})();
```

## Événements (`MS.on(nom, fn)`)
`load` · `frame(dt, f)` · `sell(v)` · `sector(chunk)` · `find(f)` · `nugget(chunk, n)` · `star(val)` · `chapter(n)` ·
`badge(b)` · `buy(type, item)` (type : hand/veh/bot/gear/bag) · `ride(veh)` · `dismount(veh)` · `tokens(total)`.
`MS.emit(nom, …)` pour en déclencher (autres extensions).

## État et sauvegarde
`MS.S` est l'objet sauvegardé (localStorage, toutes les 4 s et au `pagehide`). Ajouter ses champs dessus avec `??=`.
`MS.markSave()` force une sauvegarde proche. Jetons ⭐ : `S.tokens`, `MS.addTokens(n)`.

## Interface
`toast(txt, 'gold'|'bad')`, `pop(txt, 'gold')` (bulle +$ près du joueur), `say(qui, txt)` (bulle radio, file d'attente),
`radio(when)` (ligne du patron ; ajouter des lignes avec `MS.ST.radio.push({ when, text })`),
`modal(kicker, titre, texte, récompense, img, bouton)`, `sheet(id, titre)`, `button(svg, label, fn)` (barre d'outils du HUD),
`toggle(label, sous-titre, get, set)` (réglages), `chip(txt, cls)` (HUD), `shopSection(titre, sous-titre)` (section du garage,
remplir avec `MS.itemHtml(id, thumbKey, nom, desc)` ou son propre HTML), `hud()`, `shopUi()`, `badgesUi()`.
Styles : injecter une balise `<style>` ; variables CSS disponibles : `--accent` (orange), `--good`, `--gold`, `--cyan`, `--muted`, `--fg`, `--glass`, `--line`, `--display` (Barlow Condensed), `--body`.
Classes réutilisables : `.glass`, `.btn.primary`, `.round.small`, `.item`, `.list`, `.find`, `.badge`, `.toggle`, `.label`, `.sheet-in`.

## Monde
`H(x, z)` hauteur du sol · `chunks` (Map « cx,cz » → { h: Uint8Array 128² (1 = poussière), clean, done, ring }) · `chunkAt(x, z)` ·
`dusty(x, z)` · `sweep(ax, az, bx, bz, rayon, fx)` nettoie un segment, renvoie les kg · `redirty(x, z, r)` remet de la poussière ·
`RINGS` (5 régions, `mult`), `S.ringOpen`, `lim()` (limite de déplacement), `OBST` (obstacles {x,z,r} ou {x,z,hw,hd}), `collide(P, r)` ·
`FINDS`, `findObjs`, `placeFind` · `BASE`, `PAD_R` · `player` (Group three.js ; `player.position`, `rotation.y`), `rig` (modèle courant),
`curTool()` ({ w, sp }), `curVeh()`, `setRig()` · `parked` (Map engins garés), `bots` ·
`scene`, `camera`, `renderer`, `sun`, `sky`, `MS.D` (zoom, 6..80), `MS.cam = (camPos, camLook, dt) => {}` pour piloter la caméra
(remettre `null` pour rendre la main), `MS.shake(v)`, `MS.time`.

## 3D
Matériaux `MAT` (suit, suitGrey, blue, navy, orange, yellow, white, dark, grey, steel, chrome, glass, glassT, tire, bristle, led, red, beacon, lampOn, gold, hazard) ;
`M(couleur, opts)` standard, `P(couleur, opts)` physique lisse, `LIT(couleur, k)` lumineux (hors tone mapping, passe dans le halo) ;
pièces : `put(parent, geo, mat, x, y, z)`, `box(w,h,d)` (arrondie), `rbox(w,h,d,r)`, `cyl(a,b,h,seg)`, `sph(r)`, `capsule(r, len)`, `rod(parent, a, b, r, mat)` ;
modèles : `astronaut(tool, gear, bag)` → { g, legL, legR, armL, armR }, `vehicle(kind, w)`, `botModel(id)`, `findModel(id)` ;
`tex(w, h, draw, repeat)` texture canvas, `glow(in, out)` sprite lumineux, `thumb(key, build)` vignette PNG ;
particules : `dustFx.add(x,y,z,vx,vy,vz,vie,couleur,gravité)`, `glowFx.burst(x,y,z,n,vitesse,vie,[couleurs],gravité)`.
Son : `sfx.pop/cash/find/sector/beep/buy/engine/full`, `tone(f, durée, type, vol, f2)`, `MS.AC` (AudioContext, après un geste), `audio()`.

## Tester
`node tests/feat.js features/<nom>.js rich` (ou `fresh`) : lance Chromium en rendu logiciel, charge SEULEMENT cette extension,
bouge le joueur, écrit tests/out/<nom>-rich-*.png et liste les erreurs console. Un 4ᵉ argument = script d'actions
(`module.exports = async (page, { shot, drag }) => {}`) pour ouvrir ses feuilles, cliquer ses boutons et capturer.
Lire les captures (elles valident le rendu), ne pas se fier au seul code. Performance : viser zéro allocation par image
dans `on('frame')`, pas de `querySelector` par image, pas de nouvelle géométrie par image.
