# L’Abécédaire de Villa Colbert

Guide public de la résidence à Versailles. Édition pilote actualisée le 7 octobre 2026 : 25 fiches, annuaire professionnel, 17 synthèses de contrats et services, 28 historiques de décisions (98 étapes sourcées, AG 2012–2026), 24 éditions et projets du Petit Colbert (2020–2026), index A–Z, filtres par thème et recherche accessible depuis toutes les pages. Maquette Three.js détaillée affichée automatiquement, avec illustration de secours.

## Contenu éditorial

Les fiches de base se trouvent dans `content/articles.mjs`, les apports des anciennes FAQ dans `content/enrichments.mjs`, les contacts professionnels dans `content/contacts.mjs` les historiques dans `content/decisions.mjs`, les contrats dans `content/maintenance.mjs` et les synthèses du Petit Colbert dans `content/newsletters.mjs`. Chaque fiche identifie ses sources et les points restant à confirmer. La publication d’une fiche ne vaut pas approbation du conseil syndical ni autorisation de travaux. Les informations non revalidées sont explicitement signalées.

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

Le générateur produit des pages HTML autonomes dans `dist/`. Esbuild regroupe les styles, polices locales et scripts. Three.js est chargé séparément sur l’accueil ; le contenu reste accessible sans la 3D. Pagefind indexe les fiches, l’annuaire, les contrats, les synthèses des décisions et les archives du Petit Colbert. Aucun service d’analyse d’audience n’est ajouté.

## Publication

Le workflow GitHub Actions construit, vérifie puis publie `dist/` sur GitHub Pages à chaque modification de `main`. La source de publication GitHub Pages doit être « GitHub Actions ».

Site : https://pont-colbert-4-4bis.github.io/ABCDaire/

## Vérification avant publication

- Vérifier la source, la date et le statut de chaque consigne modifiée.
- Ne pas transformer une annotation historique en règle adoptée.
- Vérifier les liens, la recherche, la navigation clavier et l’affichage mobile.
- Garder les contenus privés hors du HTML, des métadonnées, des scripts et de l’index.

Les composants tiers conservent leurs licences respectives. Les documents d’archives ne sont pas redistribués.

## Maquette et illustration de secours

Illustration générée à partir de deux photographies de référence fournies par le porteur du projet. Les photographies originales ne sont pas redistribuées. Il s’agit d’une interprétation graphique sans valeur de plan. `assets/colbert-illustration.jpg.base64` contient le JPEG optimisé ; le générateur le décode pour le site.

## Confidentialité de l’annuaire

Seuls les standards professionnels et les coordonnées de dépannage sont publics. L’espace résidents avec authentification individuelle reste une proposition ; aucun contact privé ne doit être placé dans le dépôt ou un fichier simplement masqué.

La vue 3D affiche les volumes étagés, balcons de plan triangulaire et garde-corps, fenêtres avec détails de vitrage, deux entrées de parking sur la gauche, pavage et végétation. Les matières et feuillages sont générés localement ; les géométries sont regroupées et les feuilles instanciées pour limiter les appels de dessin. Le rendu utilise un canevas transparent et une résolution adaptée à l’écran (jusqu’à 2,5×, largeur plafonnée à 1 800 pixels).

La scène se tourne par glissement, par les boutons ou avec les flèches du clavier ; « Recentrer la vue » rétablit l’angle initial. Un lent va-et-vient automatique de ±7° effectue un cycle en 28 secondes, avec une cadence plafonnée à 30 images/seconde. Le bouton Pause/Animer permet de le suspendre ; une interaction manuelle suspend le mouvement pendant 6 secondes. La scène s’arrête hors écran ou dans un onglet masqué. La préférence de mouvement réduit désactive la rotation automatique et l’interpolation. L’image reste présente jusqu’au premier rendu et revient si WebGL échoue ; il n’y a plus de sélecteur 2D/3D.

Vérifications de cette évolution : affichage automatique et commandes, largeur mobile 390 px, absence de débordement, mouvement réduit simulé, WebGL indisponible et événement de perte de contexte simulés, compilation et contrôle des 30 pages / 1 202 liens.

## Contrats et groupes WhatsApp

La page `/entretien/` détaille 17 équipements et services, avec rôle, fréquence prévue, couverture, limites, sources et points à confirmer. Les accords historiques sont distingués des confirmations récentes. Les fiches et contacts renvoient aux synthèses. Les contrats complets, prix, signatures et données privées ne sont pas publiés.

La fiche WhatsApp distingue le groupe des résidents et celui réservé aux membres du CS. Les liens d’adhésion n’ont pas été retrouvés dans les sources consultées : les QR codes restent à ajouter après réception des liens et confirmation du contrôle des admissions par les administrateurs. Aucun faux QR code ou lien d’invitation ouvert n’est publié.

La maquette a été rapprochée des photographies de rue : proportions de la longue façade, teintes ivoire et saumon, balcons triangulaires, deux entrées de parking à des niveaux différents, abri de bus, lampadaire et bornes. Les éléments non mesurables sur les deux vues restent une interprétation.

Validation de l’ajout contrats et WhatsApp : compilation, contrôle de 32 pages et 1 413 liens locaux, correspondances des 17 synthèses avec les fiches et contacts, recherche « ampoule », ouverture des détails du contrat et lecture mobile à 390 px sans débordement. Les QR codes restent en attente des liens vérifiés.

## Historique des AG et contacts contextuels

Les PV de 2012 à 2026 ont été rapprochés par sujet. Chaque étape distingue le vote, le rejet, le report, l’information et l’approbation des comptes, avec la référence de résolution ; les nouvelles lectures indiquent aussi la page du PDF. L’archive 2017 consultée est incomplète et seules les décisions entièrement lisibles sont reprises. Un document classé dans les archives mais concernant une autre copropriété a été écarté. Cette sélection éditoriale ne prétend pas restituer toutes les résolutions.

Une fiche Recharge des véhicules électriques retrace les projets successifs. Le Petit Colbert de février 2025 (V5) rapporte l’installation de huit bornes par Electromob le 20 janvier 2025. Cette réalisation rapportée est distinguée de la réception technique et de la vérification de l’exploitation actuelle. L’ambiguïté du DTG 2025 et la divergence avec la formulation de 2023 restent visibles.

Les interlocuteurs de chaque fiche sont affichés à droite sur grand écran et avant le contenu sur mobile. Leurs coordonnées proviennent du même annuaire, pour éviter les copies divergentes. Le logo vectoriel et le favicon partagent une silhouette architecturale simplifiée.

Validation du 7 octobre : compilation et contrôle de 33 pages / 1 599 liens locaux, 28 historiques rattachés à une fiche et 97 références présentes, contacts visibles sur ordinateur et au début des fiches à 390 px sans débordement, recherche « indemnisation » retrouvant la fiche chauffage et l’historique général.

## Archives du Petit Colbert

La rubrique `/petit-colbert/` rassemble 24 éditions ou projets retrouvés, de février 2020 à octobre 2026, du plus récent au plus ancien. Chaque numéro dispose d’une synthèse HTML recherchable, d’une indication de source/version, de liens vers les fiches actuelles et d’une navigation vers les numéros voisins. Les fiches renvoient aux numéros qui les concernent. Le menu global, l’accueil et le pied de page donnent accès aux archives.

Les originaux ne sont pas redistribués. Les coordonnées personnelles, situations individuelles, plaques d’immatriculation et procédures d’accès restent privées. Les annonces ne sont pas transformées en réalisations, et la présence d’un document n’atteste pas son affichage. Juin 2025, février 2025 V5 et octobre 2026 V8 restent signalés comme versions de travail. Décembre 2024 est évoqué par les échanges, mais le document reste à retrouver.

Corrections conservées : janvier 2025 comporte une coquille « 2024 » dans l’affiche source ; mai 2026 diverge entre 4 et 4 bis pour le remplacement d’un variateur d’ascenseur ; octobre 2025 comporte plusieurs variantes non départagées. Le journal de février 2025 complète l’historique de recharge avec une installation rapportée le 20 janvier 2025.

À la demande de Philippe, les étapes de chaque historique d’AG sont désormais présentées par date décroissante, dans la page générale et les fiches. Les résolutions d’une même date conservent leur ordre de lecture.

Vérification de cette évolution : compilation et contrôle des 58 pages et 2 539 liens locaux ; recherche « Electromob » retrouvant les numéros et les fiches associées ; lecture à 390 px sans débordement ; ordre des étapes du prix de l’eau contrôlé de 2026 à 2012. Les 24 numéros ont des pages distinctes et des références de source.
