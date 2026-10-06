# L’Abécédaire de Villa Colbert

Guide public de la résidence à Versailles. Première édition pilote du 6 octobre 2026 : 20 fiches, index A–Z, filtres par thème, recherche locale et illustration Three.js avec repli SVG.

## Contenu éditorial

Les fiches se trouvent dans `content/articles.mjs`. Chaque fiche identifie ses sources et les points restant à confirmer. La publication d’une fiche ne vaut pas approbation du conseil syndical ni autorisation de travaux. Les informations non revalidées sont explicitement signalées.

Aucun email, compte rendu brut, contrat privé, donnée personnelle, code d’accès ou plan technique ne doit être ajouté au dépôt, aux tickets publics ou à l’index de recherche. Les sources privées restent dans leur stockage d’origine. Une correction concernant un dossier individuel se transmet par un canal privé.

## Développement

Node.js 22 ou supérieur.

```sh
npm ci
npm run build
npm run check
npm run preview
```

Aperçu : http://127.0.0.1:4173/ABCDaire/

Le générateur produit des pages HTML autonomes dans `dist/`. Esbuild regroupe les styles, polices locales et scripts. Three.js est chargé séparément sur l’accueil ; le contenu reste accessible sans la 3D. Pagefind indexe uniquement les fiches. Aucun service d’analyse d’audience n’est ajouté.

## Publication

Le workflow GitHub Actions construit, vérifie puis publie `dist/` sur GitHub Pages à chaque modification de `main`. La source de publication GitHub Pages doit être « GitHub Actions ».

Site : https://pont-colbert-4-4bis.github.io/ABCDaire/

## Vérification avant publication

- Vérifier la source, la date et le statut de chaque consigne modifiée.
- Ne pas transformer une annotation historique en règle adoptée.
- Vérifier les liens, la recherche, la navigation clavier et l’affichage mobile.
- Garder les contenus privés hors du HTML, des métadonnées, des scripts et de l’index.

Les composants tiers conservent leurs licences respectives. Les documents d’archives ne sont pas redistribués.
