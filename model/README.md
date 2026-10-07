# Villa Colbert — modèle autonome

Révision du 7 octobre 2026. Source : six photographies Street View et une vue aérienne fournies par Philippe. La position des deux entrées est confirmée directement par Philippe. Les photographies sources ne sont pas redistribuées et ne servent pas de textures.

## Fichiers et format

- `build_colbert.py` : source paramétrique pour Blender 5.1, sans extension à installer.
- `reference.json` : provenance, observations, dimensions estimées et limites.
- `../assets/models/villa-colbert.glb` : modèle web binaire glTF 2.0 compressé avec Draco, sans fichier externe.
- `../assets/models/villa-colbert.json` : statistiques et coordonnées des repères.
- `../assets/models/villa-colbert.webp` : rendu transparent de ce même modèle pour le chargement et le secours.

[glTF](https://www.khronos.org/gltf/) est destiné à la transmission et au chargement de scènes 3D. Le GLB regroupe géométrie et matériaux dans un seul fichier. [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) charge le modèle et [DRACOLoader](https://threejs.org/docs/pages/DRACOLoader.html) décompresse sa géométrie. Le fichier Blender est le maître éditable ; le site présente le GLB, sans reconstruire le bâtiment dans son code d’affichage.

## Reconstruire

Depuis la racine du dépôt :

```sh
blender --background --factory-startup --python model/build_colbert.py -- /chemin/vers/livrables
```

La commande produit dans ce répertoire :

1. `Villa-Colbert.blend`, maître avec composants nommés, matériaux, lumières, quatre caméras et script source intégré.
2. `Villa-Colbert.glb`, export portable non compressé, compatible avec les outils sans décodeur Draco.
3. Quatre PNG transparents : perspective, élévation de rue, parkings et toiture.
4. `model-info.json`, statistiques de l’export.

Elle actualise le GLB web et son JSON dans le dépôt. Le WebP de secours se régénère depuis `Perspective_rue.png`, en conservant sa transparence. Blender est nécessaire seulement pour modifier la géométrie ; la compilation du site utilise les fichiers exportés déjà présents.

```sh
npm run build
npm run check
node scripts/check-model.mjs /chemin/vers/livrables/Villa-Colbert.glb
```

## Organisation et fidélité

Les coordonnées glTF sont Y vers le haut, X vers la droite depuis la rue et Z vers la rue. Les quatre points nommés sont `entree-4bis`, `entree-4`, `parking-bas`, `parking-haut`.

Le maître conserve séparément les parties du bâtiment, panneaux, menuiseries, balcons, garages, entrées, toiture et mobilier. Le fichier web regroupe les surfaces par matériau pour réduire les appels de dessin. Les noms des composants restent dans le maître et les quatre repères restent dans les deux GLB.

La façade sur rue et les deux plans du retour gauche comportent 30 balcons triangulaires. 20 autres balcons servent à restituer la silhouette arrière partiellement visible depuis le ciel : leur nombre, position et alternance sont **estimés**, pas vérifiés depuis une vue arrière. Les 93 menuiseries sont des éléments de modélisation, pas un inventaire certifié des ouvertures de l’immeuble. Les états des rideaux/volets sont illustratifs.

Les dimensions de travail — façade 44,4 m, profondeur principale 10,9 m, retour 18 m, étage courant 2,62 m — sont des estimations pour maintenir les proportions. Elles ne doivent pas être utilisées pour des travaux, des surfaces ou une commande. La pente des rampes, les marches et les équipements de toiture nécessitent des plans ou un relevé pour être confirmés. L’arrière est simplifié et ses fenêtres ne sont pas inventoriées.

La géométrie est détaillée, mais une modélisation complète et mesurée de toutes les faces ne peut pas être attestée avec les seules images fournies. Prochaine amélioration de fidélité : dimensions de référence, plan de masse et vues arrière/entrées rapprochées.

## Vérification

Le GLB maître passe le validateur Khronos sans erreur ni avertissement. Le GLB web passe les contrôles structurels sans erreur ni avertissement ; le validateur signale en information que Draco n’est pas décompressé par lui. Le rendu et les commandes sont donc également contrôlés dans le navigateur.

Le fichier web contient 29 maillages et 137 656 triangles pour 482 632 octets. Les matériaux sont PBR sans texture photographique. Les personnes, véhicules, plaques, contenu des affiches et informations personnelles sont exclus.
