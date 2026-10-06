# L’Abécédaire de Villa Colbert

Guide public de la résidence à Versailles. Première édition pilote du 6 octobre 2026 : 23 fiches, annuaire professionnel, 10 historiques de décisions, index A–Z, filtres par thème et recherche accessible depuis toutes les pages. Illustration des façades et maquette Three.js activable à la demande.

## Contenu éditorial

Les fiches de base se trouvent dans `content/articles.mjs`, les apports des anciennes FAQ dans `content/enrichments.mjs`, les contacts professionnels dans `content/contacts.mjs` et les historiques dans `content/decisions.mjs`. Chaque fiche identifie ses sources et les points restant à confirmer. La publication d’une fiche ne vaut pas approbation du conseil syndical ni autorisation de travaux. Les informations non revalidées sont explicitement signalées.

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

Le générateur produit des pages HTML autonomes dans `dist/`. Esbuild regroupe les styles, polices locales et scripts. Three.js est chargé séparément sur l’accueil ; le contenu reste accessible sans la 3D. Pagefind indexe les fiches, l’annuaire et les synthèses des décisions. Aucun service d’analyse d’audience n’est ajouté.

## Publication

Le workflow GitHub Actions construit, vérifie puis publie `dist/` sur GitHub Pages à chaque modification de `main`. La source de publication GitHub Pages doit être « GitHub Actions ».

Site : https://pont-colbert-4-4bis.github.io/ABCDaire/

## Vérification avant publication

- Vérifier la source, la date et le statut de chaque consigne modifiée.
- Ne pas transformer une annotation historique en règle adoptée.
- Vérifier les liens, la recherche, la navigation clavier et l’affichage mobile.
- Garder les contenus privés hors du HTML, des métadonnées, des scripts et de l’index.

Les composants tiers conservent leurs licences respectives. Les documents d’archives ne sont pas redistribués.

## Illustration

Illustration générée à partir de deux photographies de référence fournies par le porteur du projet. Les photographies originales ne sont pas redistribuées. Il s’agit d’une interprétation graphique sans valeur de plan. `assets/colbert-illustration.jpg.base64` contient le JPEG optimisé ; le générateur le décode pour le site.

## Confidentialité de l’annuaire

Seuls les standards professionnels et les coordonnées de dépannage sont publics. L’espace résidents avec authentification individuelle reste une proposition ; aucun contact privé ne doit être placé dans le dépôt ou un fichier simplement masqué.
