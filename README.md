# The Corner — Site web

Site vitrine **multi-pages** professionnel, orienté B2B (cible : écoles & campus), 100 % fidèle à la charte graphique (couleurs, Poppins + Newsreader Italic, dégradés, illustrations des fondateurs). 100 % statique (HTML/CSS/JS), aucun build.

## Voir le site en local

Double-cliquez sur `index.html`, ou lancez un serveur local :

```bash
npx http-server -p 4173 -c-1 .
# puis http://localhost:4173
```

(ou via `.claude/launch.json` si vous utilisez Claude Code.)

## Arborescence

| Page | Fichier | Contenu |
|------|---------|---------|
| Accueil | `index.html` | Hero, carrousel des écoles, le constat, le modèle (0 €/10 %), témoignages, comment ça marche, CTA |
| Références | `references.html` | Logos écoles filtrables, cas UCLy, IHECF, Tunon |
| Notre histoire | `histoire.html` | La genèse, les fondateurs, le torréfacteur, la mission |
| Contact | `contact.html` | Formulaire de demande (Formspree), coordonnées, prise de rendez-vous (Calendly), FAQ |
| Mentions légales | `mentions-legales.html` | Infos légales (ALFRED SAS), hébergeur |
| Politique de cookies | `politique-cookies.html` | Politique cookies |
| Politique de confidentialité | `politique-confidentialite.html` | RGPD : données, finalités, sous-traitants, droits |
| CGU | `cgu.html` | Conditions générales d'utilisation |
| 404 | `404.html` | Page introuvable personnalisée |

Header et footer identiques sur toutes les pages, avec un bouton « Parlons-en » partout.

## Fichiers encore à compléter

- **Photos d'installation UCLy** → déposer `install-1.jpg`, `install-2.jpg`, `install-3.jpg` dans
  `assets/img/photos/` (s'affichent automatiquement sur `reference-ucly.html` ; sinon « Photo à venir »).

## Personnalisation rapide

- Couleurs : variables tout en haut de `assets/css/style.css`.
- Textes : directement dans chaque fichier `.html`.
- Email du formulaire : `antoine@cafethecorner.fr` (modifiable dans `assets/js/main.js` et les pieds de page).
- Formulaire de contact : envoi via **Formspree** (`assets/js/main.js`, `FORMSPREE_ENDPOINT`), avec repli `mailto:` automatique en cas d'échec.

## SEO / technique

- `sitemap.xml` et `robots.txt` à la racine — penser à mettre à jour le sitemap si des pages sont ajoutées/retirées.
- Format d'URL officiel : avec slash final (`/histoire/`). Les fichiers `histoire.html`, `contact.html`, etc. à la racine
  ne sont que des redirections des anciennes adresses : ne pas les supprimer.
- Domaine : `cafethecorner.fr`.

## Mise en ligne

Hébergé sur **GitHub Pages** (dépôt `Cafethecorner/the-corner-site`), mise en ligne automatique à chaque push sur `main`.
HTTPS forcé dans Settings → Pages (« Enforce HTTPS »).
