# Le Grimoire GT

Wiki communautaire francophone consacré à Guerre Tribale : documentation de scripts, catégories, mini-tutoriels et guides pratiques.

> Projet non officiel, indépendant d’InnoGames et de l’équipe de Guerre Tribale. Guerre Tribale et les éléments associés appartiennent à leurs propriétaires respectifs.

## Objectif du projet

Le Grimoire GT sert à référencer et documenter des outils communautaires dans une interface simple. Le site est entièrement statique : il ne possède ni compte utilisateur, ni base de données, ni serveur applicatif.

Le dépôt contient notamment :

- une bibliothèque de scripts classés par catégorie ;
- une page documentaire par script ;
- des instructions d’installation ;
- un lanceur facultatif permettant d’accéder aux entrées du Grimoire depuis un unique raccourci GT ;
- une future section de tutoriels généraux.

## Avertissement important

Les scripts référencés sont des créations tierces. Sauf mention explicite, ils ne sont ni développés, ni hébergés, ni maintenus, ni audités par les responsables du Grimoire GT.

Le référencement d’un script ne signifie pas qu’il est :

- officiellement approuvé par Guerre Tribale ou InnoGames ;
- autorisé sur tous les marchés, mondes ou serveurs ;
- exempt de défaut, de code malveillant ou de vulnérabilité ;
- compatible avec la version actuelle du jeu ;
- utilisable sans risque pour un compte ou des données de jeu.

Les fichiers distants peuvent être modifiés par leurs propriétaires après leur référencement. Leur comportement peut donc changer sans modification de ce dépôt.

Chaque utilisateur reste responsable de vérifier la source, le fonctionnement et l’autorisation d’un script avant de l’utiliser. En cas de doute, ne l’exécutez pas et consultez le support officiel de votre marché.

## Règles de Guerre Tribale

La méthode recommandée est la bibliothèque officielle accessible dans le jeu :

`Réglages → Bibliothèque de scripts`

La disponibilité et la légalité des scripts peuvent varier selon le marché, le monde et la période concernée. Les codes externes présents dans ce projet sont conservés principalement à des fins documentaires et historiques.

Ce projet ne doit pas être utilisé pour contourner les règles du jeu, automatiser des actions interdites ou obtenir un avantage non autorisé. Une suspension, une perte de données ou toute autre sanction résultant de l’utilisation d’un outil externe relève de la décision de l’utilisateur et des règles applicables à son compte.

## Le lanceur GT

Le fichier `gt-launcher.js` fournit un menu unique permettant de sélectionner un script depuis Guerre Tribale. Il ne charge et n’installe aucun script automatiquement à l’ouverture : une action explicite de l’utilisateur est nécessaire.

Le lanceur récupère sa liste depuis les données publiques du Grimoire, puis propose deux actions par script :

- **Lancer** : charge la source HTTPS du script pour la session en cours uniquement. Rien n’est conservé après la fermeture de la page.
- **Copier + ouvrir** : copie le code du script dans le presse-papiers et ouvre la page « Réglages → Barre de raccourcis » dans un nouvel onglet. C’est l’utilisateur qui colle le code dans le champ « URL cible », nomme l’entrée et l’enregistre lui-même. Le lanceur ne remplit ni ne soumet le formulaire de réglages du compte à sa place : l’ajout d’une entrée permanente reste une action délibérée, effectuée dans l’interface officielle du jeu.

Dans les deux cas, le code tiers s’exécute dans la page de jeu et dispose potentiellement des mêmes accès que tout JavaScript exécuté dans cette page. Un script installé s’exécute à chaque fois que l’entrée correspondante est utilisée, sans repasser par le Grimoire.

Conséquences importantes :

- n’installez le lanceur que depuis l’adresse officielle du Grimoire ;
- vérifiez l’adresse générée avant de la coller dans GT ;
- n’utilisez que des scripts autorisés sur votre marché et votre monde ;
- retirez le raccourci si l’hébergement ou le dépôt semble compromis ;
- ne saisissez jamais votre mot de passe dans une interface ajoutée par un script.

## Installation du site

Le projet peut être publié sur un hébergement statique compatible HTTPS.

Pour le consulter localement :

```bash
python3 -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

L’ouverture directe de `index.html` reste possible grâce au fichier de secours `data/scripts-data.js`, mais le lanceur GT nécessite une adresse HTTPS publique et stable.

## Installer le lanceur dans GT

Une fois le site déployé :

1. Ouvrez la section « Lanceur GT » du Grimoire.
2. Cliquez sur « Copier le lanceur ».
3. Dans le jeu, ouvrez `Réglages → Barre de raccourcis`.
4. Cliquez sur « Ajouter une nouvelle entrée ».
5. Utilisez `Grimoire GT` comme nom et collez le code copié dans le champ du lien.
6. Enregistrez l’entrée.

Le raccourci récupère automatiquement la bibliothèque publiée lors de chaque ouverture. Il n’est donc pas nécessaire de le réinstaller après l’ajout d’une nouvelle fiche.

## Structure du dépôt

- `index.html` : accueil et contenu principal ;
- `styles.css` : direction artistique et responsive ;
- `app.js` : bibliothèque, filtres, recherche, menus et génération du lanceur ;
- `data/scripts.json` : données principales de la bibliothèque ;
- `data/scripts-data.js` : copie compatible avec l’ouverture locale et le lanceur GT ;
- `scripts/*.html` : pages statiques individuelles ;
- `script-page.js` : rendu partagé des fiches ;
- `site-sidebar.js` : navigation partagée des pages internes ;
- `gt-launcher.js` : interface injectée volontairement depuis le raccourci GT ;
- `tutoriels/index.html` : section des futurs guides ;
- `_headers` : proposition d’en-têtes de sécurité pour les hébergeurs compatibles.

## Ajouter ou modifier une fiche

1. Modifiez les catégories ou les entrées de `data/scripts.json`.
2. Reportez les mêmes données dans `data/scripts-data.js` pour conserver le mode local et le lanceur.
3. Ajoutez la page `scripts/<identifiant>.html` correspondante.
4. Vérifiez que l’identifiant contient uniquement des lettres minuscules, chiffres et tirets.
5. Contrôlez la source du script sans l’exécuter depuis un compte sensible.

Les données sont échappées avant leur insertion dans l’interface. Les identifiants sont validés et le lanceur refuse les sources qui ne sont pas en HTTPS. Le projet n’utilise ni `eval()` ni `new Function()`.

## Sécurité et confidentialité

Le dépôt ne doit jamais contenir :

- mot de passe ou cookie de session ;
- jeton CSRF, clé API ou clé privée ;
- export de page GT contenant des informations de compte ;
- identifiants confidentiels de joueur, de tribu ou de serveur ;
- données personnelles qui ne sont pas destinées à être publiques.

Avant chaque publication, vérifiez également les métadonnées Git : le nom et l’adresse e-mail de l’auteur des commits peuvent être visibles publiquement.

Le fichier `_headers` propose une Content Security Policy et plusieurs en-têtes défensifs. Tous les hébergeurs statiques ne prennent pas automatiquement ce fichier en charge ; reproduisez ces en-têtes dans la configuration de la plateforme lorsque cela est possible.

## Responsabilité

Le Grimoire GT est fourni « en l’état », sans garantie de disponibilité, de compatibilité, de sécurité ou d’adéquation à un usage particulier. Les mainteneurs ne contrôlent pas les services tiers référencés et ne peuvent garantir leur contenu futur.

Dans les limites permises par la loi applicable, les auteurs et contributeurs ne sauraient être tenus responsables des dommages, pertes de données, sanctions de compte ou autres conséquences résultant de l’installation ou de l’utilisation d’un script référencé.

Cet avertissement informe les utilisateurs des risques et responsabilités, mais ne remplace pas des conditions d’utilisation, une licence adaptée ni un avis juridique professionnel.

## Contribution

Toute contribution ajoutant un script devrait préciser :

- son nom et sa catégorie ;
- sa finalité ;
- son auteur ou sa source connue ;
- son URL HTTPS ;
- son statut d’approbation lorsqu’il est vérifiable ;
- les écrans de jeu concernés ;
- les risques ou limitations connus.

N’ajoutez aucun secret, donnée de compte ou contenu privé dans une issue, un commit ou une pull request.

## Crédits

Powered by **DEADLY/NOPNUT**.
