# Le Grimoire GT

Prototype de documentation communautaire pour référencer des scripts Guerre Tribale.

## Lancer le site

Le projet est entièrement statique. Ouvrez `index.html` dans un navigateur ou lancez un petit serveur local :

```bash
python3 -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

## Structure

- `index.html` : contenu et fiches des scripts
- `styles.css` : direction artistique médiévale et responsive
- `app.js` : chargement du JSON, filtres, recherche, navigation et copie
- `data/scripts.json` : catégories et contenu de toute la bibliothèque
- `data/scripts-data.js` : copie de secours pour une ouverture directe sans serveur
- `scripts/*.html` : une page statique dédiée par script
- `script-page.js` : rendu partagé des fiches depuis les données
- `site-sidebar.js` : menu partagé et identique sur toutes les pages internes
- `gt-launcher.js` : lanceur unique à utiliser depuis la barre de raccourcis GT
- `tutoriels/index.html` : page d’entrée des futurs tutoriels

## Ajouter un script

Ajoutez une entrée dans le tableau `scripts` de `data/scripts.json`. Sa carte, sa fiche détaillée et son lien dans la navigation seront générés automatiquement. Les catégories sont déclarées dans le tableau `categories` du même fichier.

Pour conserver la compatibilité avec l’ouverture directe de `index.html`, reportez aussi la nouvelle entrée dans `data/scripts-data.js`. Sur un hébergement normal, le site charge toujours le JSON en priorité.

## Prudence

Les scripts documentés sont chargés depuis des domaines tiers. Vérifiez toujours leur source et les règles de votre serveur avant utilisation.

Le rendu échappe les données avant insertion, valide les identifiants utilisés dans les chemins et applique une Content Security Policy. Les bookmarklets sont affichés comme texte et ne sont jamais exécutés par le site.

Le fichier `_headers` ajoute également les en-têtes CSP, anti-iframe, anti-MIME-sniffing et Permissions Policy sur les hébergeurs compatibles, notamment Netlify et Cloudflare Pages. Sur un autre hébergeur, reportez ces valeurs dans sa configuration HTTP.
# Le-Grimoire-GT
