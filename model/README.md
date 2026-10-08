# Villa Colbert — maquette 3D

Révision du 8 octobre 2026. Sources : photographies Street View (février 2026) et vue aérienne fournies par Philippe, complétées par les précisions de résidents : deux accès distincts aux parkings, allée et porte du 4 bis, escalier de l’entrée 4, terrain qui monte derrière l’immeuble. Les photographies ne sont pas redistribuées et ne servent pas de textures.

## Fichiers

- `../src/maquette/maquette.js` : construction de la scène avec Three.js (bâtiment, parkings, entrées, abords, bâtiments voisins, terrain, végétation, ciel et soleil) et commandes de la maquette.
- `../src/maquette/strings.mjs` : textes de l’interface, en français pour le guide et en anglais pour la copie autonome.
- `../src/maquette/markup.mjs` et `../src/maquette/maquette.css` : interface (points de vue, rotation, étages, saisons, soleil, repères d’entrée).
- `../src/maquette/entry.js` : point d’entrée compilé pour le guide, avec la police Manrope locale.
- `reference.json` : provenance, observations, dimensions estimées et limites.

La scène est construite par le code dans le navigateur, à chaque chargement. Il n’y a plus de fichier de modèle (GLB), d’export Blender ni d’image de secours à tenir à jour : une correction se fait directement dans `maquette.js`. Les matières (enduit, pavés, herbe, toiture) sont dessinées par le code ; aucune photographie n’est utilisée.

## Compiler et prévisualiser

Depuis la racine du dépôt :

```sh
npm run build
npm run preview
```

Puis ouvrir http://127.0.0.1:4173/ABCDaire/maquette/?mode=explore pour la maquette seule, ou `?mode=hero` pour le cadre de l’accueil. `scripts/build.mjs` compile la maquette avec esbuild dans `dist/maquette/` : Three.js et la police sont regroupés localement, sans appel à un CDN.

## Repère et organisation

Origine : angle est de la barre (façade sur rue × pignon sud-est), au niveau du trottoir. X suit la façade sur rue vers le nord-ouest, Z pointe vers la rue (nord-est), Y vers le haut. Unité : le mètre, à une échelle estimée.

Chaque façade est décrite niveau par niveau par un motif d’ouvertures (fenêtres, portes-fenêtres, panneaux orange, porte), en mètres le long de la face. Les surfaces sont regroupées par matière pour limiter les appels de dessin ; arbres et arbustes sont instanciés.

Éléments représentés :

- la barre (rez-de-chaussée surélevé et cinq niveaux), l’attique en retrait au 6e et l’aile en retour côté jardin, au sud-est ;
- au sud-est, le bloc des parkings avec ses deux portes sur rue : la rampe qui descend vers le niveau bas et la rampe qui monte vers le niveau haut, sous une terrasse ;
- l’allée du 4 bis, entre la rampe montante et le pignon, avec une jardinière le long du mur ; la porte s’ouvre sur la droite, au bout de l’allée, sous la terrasse ;
- l’entrée du 4 : escalier de huit marches, porte vitrée, renfoncement orange planté sous les balcons, jardinières surélevées ;
- haies, arbres de rue, abri de bus et mobilier ; les bâtiments voisins (immeuble en meulière au sud-est, bâtiment blanc avec cage vitrée au nord-ouest) ;
- devant le n° 2, le passage piéton à feux : îlot central avec son feu et ses balises, potence à deux feux de l’autre côté, marquage au sol (voies, flèches, lignes d’effet des feux, ligne de rive) ;
- le terrain qui monte régulièrement derrière l’immeuble jusqu’aux bois ; de l’autre côté de la rue, une pelouse, traversée en face du n° 2 par le début de la rue Albert Sarraut (chaussée, trottoirs, angles arrondis, passage piéton).

## Dimensions estimées

- Façade sur rue ≈ 52,7 m ; profondeur de la barre ≈ 12,4 m ; aile ≈ 14,8 × 12 m, soit ≈ 24,4 m de profondeur avec l’aile.
- Rez-de-chaussée surélevé à + 1,40 m ; hauteur d’étage 2,75 m ; dessus de la barre ≈ 17,9 m ; attique, en retrait d’environ 2 m côté rue, ≈ 20,7 m.
- Entrée 4 : huit marches d’environ 16 cm depuis le trottoir.
- Allée du 4 bis : environ 1 m de large, en légère montée jusqu’au palier (+ 0,30 m).
- Parkings : niveau bas ≈ − 2,45 m, niveau haut ≈ + 0,35 m ; dessus de la terrasse ≈ + 3,70 m.

Ces valeurs servent à garder les proportions. Elles ne doivent pas être utilisées pour des travaux, des surfaces ou une commande.

## Fidélité et limites

La façade sur rue, le pignon sud-est et les abords des entrées sont relevés sur les photographies. Côté rue et pignon sud-est, 30 balcons triangulaires sont représentés ; côté jardin et sur l’aile, leur nombre, leur position et les ouvertures sont extrapolés de la vue aérienne. Les ouvertures sont des éléments de modélisation, pas un inventaire. La toiture, la profondeur des balcons, les pentes des rampes et du terrain sont estimées. Arbres, haies et voisins sont simplifiés ; aucune personne, plaque ou affiche n’est représentée.

La course du soleil est calculée pour Versailles (48,791° N, 2,146° E), avec une façade sur rue orientée au nord-est (41°, d’après l’emprise OpenStreetMap), aux dates du 21 décembre, du 20 mars / 22 septembre et du 21 juin. Les ombres sont indicatives ; les fenêtres ne laissent pas passer le soleil, chaque bâtiment porte une ombre pleine.

Prochaine amélioration de fidélité : dimensions de référence, plan de masse et vues du côté jardin.

## Vérification

Le rendu et les commandes sont contrôlés dans Chromium (WebGL logiciel) : accueil, page `/residence/`, vues rapprochées des entrées 4 et 4 bis, affichage à 390 px, arrêt du mouvement après un geste et reprise une minute plus tard.
