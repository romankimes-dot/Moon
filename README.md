# Moon Sweeper

Nettoie la Lune, vends la poussière, achète des engins, découvre ses secrets.
Jeu 3D en HTML (three.js), installable sur iPhone : ouvrir le site dans Safari → Partager → « Sur l'écran d'accueil ».

## Hébergement : Cloudflare Pages (adresse à part, stockage à part)

Le site est statique, sans étape de construction : Cloudflare sert le dépôt tel quel.

1. https://dash.cloudflare.com → créer un compte gratuit.
2. **Workers & Pages** → **Create** → onglet **Pages** → **Connect to Git** → autoriser GitHub → choisir le dépôt **Moon**.
3. Réglages de construction :
   - Project name : `moon-sweeper` (donne l'adresse `https://moon-sweeper.pages.dev`)
   - Production branch : `main`
   - Framework preset : **None**
   - Build command : *(vide)*
   - Build output directory : `/`
4. **Save and Deploy**. Chaque `git push` sur `main` republie automatiquement (≈ 30 s).

`_headers` règle le cache (la page et le service worker sont toujours revalidés).

### Transférer sa partie depuis l'ancienne adresse
Les données du navigateur sont liées à l'adresse du site : la partie de `romankimes-dot.github.io/Moon` n'apparaît pas
toute seule sur `moon-sweeper.pages.dev`.
1. Sur l'ancienne adresse : ☰ → ⚙️ Réglages → **Sauvegarde** → **Exporter** → **Copier**.
2. Sur la nouvelle : ☰ → ⚙️ Réglages → **Sauvegarde** → coller dans **Importer** → **Charger** (deux touchers).
3. Supprimer l'ancien raccourci de l'écran d'accueil, ajouter le nouveau depuis Safari.

GitHub Pages peut rester actif en parallèle (ou être désactivé dans Settings → Pages).

## Développement
- `index.html` est généré à partir de la source du jeu ; les extensions sont dans `features/` (voir `features/README.md`).
- Tests : `node tests/all.js "" rich [script]` (Chromium, rendu logiciel), captures dans `tests/out/`.
