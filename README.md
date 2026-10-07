# L’Abécédaire de Villa Colbert

Guide public de la résidence à Versailles. Édition pilote actualisée le 7 octobre 2026 : 25 fiches, annuaire professionnel, 17 synthèses de contrats et services, 28 historiques de décisions (98 étapes sourcées, AG 2012–2026), 24 éditions et projets du Petit Colbert (2020–2026), index A–Z, filtres par thème et recherche accessible depuis toutes les pages. Maquette GLB autonome affichée avec Three.js sur l’accueil et dans la page « La résidence en 3D ».

## Contenu éditorial

Les fiches de base se trouvent dans `content/articles.mjs`, les apports des anciennes FAQ dans `content/enrichments.mjs`, les contacts professionnels dans `content/contacts.mjs` les historiques dans `content/decisions.mjs`, les contrats dans `content/maintenance.mjs` et le catalogue du Petit Colbert dans `content/newsletters.mjs` et ses pages publiques dans `content/facsimiles.json`. Chaque fiche identifie ses sources et les points restant à confirmer. La publication d’une fiche ne vaut pas approbation du conseil syndical ni autorisation de travaux. Les informations non revalidées sont explicitement signalées.

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

Les composants tiers conservent leurs licences respectives. Seules les copies publiques contrôlées du Petit Colbert sont distribuées ; les originaux restent privés.

## Maquette 3D autonome

La géométrie est créée et revue indépendamment du site dans Blender, puis exportée en glTF 2.0 binaire (GLB). `model/build_colbert.py` conserve une source reproductible et `model/reference.json` distingue observations et estimations. Voir [la documentation de la maquette](model/README.md).

Le modèle web `assets/models/villa-colbert.glb` est compressé avec Draco, regroupé par matériau (29 maillages, 137 656 triangles, 482 632 octets). L’accueil et `/residence/` chargent le même fichier, avec décodeurs locaux et cache versionné. Aucun appel à un CDN ni texture photographique. Le fichier WebP de secours est un rendu du même modèle, visible pendant le chargement et en cas d’échec de WebGL ; l’ancienne illustration indépendante n’est plus utilisée.

Entrée **4 bis à gauche près des parkings**, entrée **4 à droite depuis la rue**. Deux garages à des niveaux différents, rampes, retour de façade, balcons de plan triangulaire, fenêtres/volets, attique, toiture et mobilier de rue sont représentés. Les cotes sont estimées d’après six vues de rue et une vue aérienne fournies le 7 octobre 2026. Les façades cachées ne sont pas complètement documentées : ce modèle n’est pas un relevé géométrique ni un plan d’architecte.

La page agrandie propose les vues Ensemble, Façade, Parkings et Toiture, des repères d’entrée cliquables, le zoom et un téléchargement GLB. L’accueil démarre un lent va-et-vient de ±4,9° sur 32 secondes ; la page de détail démarre en pause. Les interactions restent possibles au clavier. Le rendu est plafonné à 30 images/s, à une densité de 2× et 2 300 pixels de largeur. Les ombres sont calculées une fois pour cette scène statique. Le rendu s’arrête hors écran ou dans un onglet masqué. La préférence de mouvement réduit désactive le mouvement automatique et les transitions de caméra.

`npm run check` contrôle aussi le modèle : validation Khronos glTF, présence et ordre des quatre repères, intégrité binaire, absence de fichiers externes, compte de triangles et budget de poids/maillages. Le validateur ne décompresse pas Draco : le GLB maître non compressé est validé séparément, et le modèle compressé est chargé dans le navigateur.

## Confidentialité de l’annuaire

Seuls les standards professionnels et les coordonnées de dépannage sont publics. L’espace résidents avec authentification individuelle reste une proposition ; aucun contact privé ne doit être placé dans le dépôt ou un fichier simplement masqué.

## Contrats et groupes WhatsApp

La page `/entretien/` détaille 17 équipements et services, avec rôle, fréquence prévue, couverture, limites, sources et points à confirmer. Les accords historiques sont distingués des confirmations récentes. Les fiches et contacts renvoient aux synthèses. Les contrats complets, prix, signatures et données privées ne sont pas publiés.

La fiche WhatsApp distingue le groupe des résidents et celui réservé aux membres du CS. Un QR d’invitation historique a été retrouvé dans deux variantes d’octobre 2025. Sa validité et le contrôle des admissions restent à vérifier ; il n’est pas publié. Aucun faux QR code ou lien d’invitation ouvert n’est publié.

Validation de l’ajout contrats et WhatsApp : compilation, contrôle de 32 pages et 1 413 liens locaux, correspondances des 17 synthèses avec les fiches et contacts, recherche « ampoule », ouverture des détails du contrat et lecture mobile à 390 px sans débordement. Les QR codes restent en attente des liens vérifiés.

## Historique des AG et contacts contextuels

Les PV de 2012 à 2026 ont été rapprochés par sujet. Chaque étape distingue le vote, le rejet, le report, l’information et l’approbation des comptes, avec la référence de résolution ; les nouvelles lectures indiquent aussi la page du PDF. L’archive 2017 consultée est incomplète et seules les décisions entièrement lisibles sont reprises. Un document classé dans les archives mais concernant une autre copropriété a été écarté. Cette sélection éditoriale ne prétend pas restituer toutes les résolutions.

Une fiche Recharge des véhicules électriques retrace les projets successifs. Le Petit Colbert de février 2025 (V5) rapporte l’installation de huit bornes par Electromob le 20 janvier 2025. Cette réalisation rapportée est distinguée de la réception technique et de la vérification de l’exploitation actuelle. L’ambiguïté du DTG 2025 et la divergence avec la formulation de 2023 restent visibles.

Les interlocuteurs de chaque fiche sont affichés à droite sur grand écran et avant le contenu sur mobile. Leurs coordonnées proviennent du même annuaire, pour éviter les copies divergentes. Le logo vectoriel et le favicon partagent une silhouette architecturale simplifiée.

Validation du 7 octobre : compilation et contrôle de 33 pages / 1 599 liens locaux, 28 historiques rattachés à une fiche et 97 références présentes, contacts visibles sur ordinateur et au début des fiches à 390 px sans débordement, recherche « indemnisation » retrouvant la fiche chauffage et l’historique général.

## Archives du Petit Colbert

La rubrique `/petit-colbert/` rassemble 24 éditions ou projets retrouvés, de février 2020 à octobre 2026, du plus récent au plus ancien. Les synthèses ont été remplacées par les pages des documents, avec leur mise en page et leurs illustrations, avec remplacement des noms par une désignation générique, sans suppression des sections. Les 30 PDF (variantes comprises) et 36 images WebP se trouvent dans `assets/petit-colbert/`. Chaque édition propose la lecture des pages, leur agrandissement, le téléchargement du PDF, les autres variantes, le texte intégral de la copie publique pour la recherche et des liens vers les fiches actuelles.

Les identités sont remplacées dans les PDF eux-mêmes : « membre du CS » pour les membres du conseil syndical, fonction ou mention anonyme pour les autres personnes. Les sections, les phrases et les consignes sont conservées. Les coordonnées privées et l’immatriculation sont masquées ; les QR d’invitation privés sont retirés. Les métadonnées nominatives, commentaires et pièces jointes ne sont pas conservés. Les images sont produites à partir des PDF anonymisés. Les transcriptions conservent l’ordre de lecture du texte d’origine et appliquent exactement les mêmes substitutions ; elles sont contrôlées avant publication. Les originaux et la liste privée des passages retirés restent hors Git. Les noms des entreprises sont conservés. Hors substitutions d’identités et de coordonnées, les formulations, coquilles et constats historiques ne sont pas réécrits.

Les documents Word sont convertis en PDF. Les variations de rendu liées aux polices et les défauts de présentation des sources sont possibles ; les pages et les transcriptions se complètent. Le fichier de juin 2023 comprend des notes préparatoires en pages 2–3, clairement signalées. Mai 2026 contient une illustration superposée à du texte dans le document Word révisé : ce défaut est signalé et le texte reste disponible. Les variantes d’octobre 2025 et décembre 2025 sont présentées séparément. Aucune version finale ou diffusion effective n’est inférée.

Juin 2025, février 2025 V5 et octobre 2026 V8 restent signalés comme versions de travail. Décembre 2024 reste à retrouver. La coquille « janvier 2024 » de l’affiche classée janvier 2025 est conservée et expliquée. Mai 2026 diverge entre 4 et 4 bis pour le remplacement d’un variateur. Les annonces ne sont pas transformées en réalisations ou consignes actuelles.

À la demande de Philippe, les étapes de chaque historique d’AG sont désormais présentées par date décroissante, dans la page générale et les fiches. Les résolutions d’une même date conservent leur ordre de lecture.

Vérification de cette évolution : compilation et contrôle des 58 pages et 2 539 liens locaux ; recherche « Electromob » retrouvant les numéros et les fiches associées ; lecture à 390 px sans débordement ; ordre des étapes du prix de l’eau contrôlé de 2026 à 2012. Les 24 numéros ont des pages distinctes et des références de source.

Contrôle de cette archive : 30 PDF, 36 pages, retrait réel des identités dans les PDF et leurs métadonnées, comparaison visuelle en dehors des remplacements et recherche dans les transcriptions anonymisées. La conversion Word peut conserver les défauts présents dans les sources.

Validation de la maquette autonome du 7 octobre : 59 pages HTML et 2 833 liens locaux contrôlés ; modèle maître et modèle web validés ; rendu Chrome avec 30 appels de dessin, presets et repères d’entrée ; rotation et pause ; vue mobile 390 px sans débordement ; simulations de mouvement réduit, WebGL indisponible et perte de contexte avec secours visible. Les valeurs de fidélité restent estimées d’après les photographies.
