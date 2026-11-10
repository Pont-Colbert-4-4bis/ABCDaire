// Décisions d’assemblée générale par sujet, relues le 10 novembre 2026.
// Une phrase par étape : ce qui a été voté, le montant, le résultat. Les PV complets sont dans l’extranet Homeland.
// `page` rattache un sujet à une fiche ; un sujet sans fiche n’apparaît que sur la page Décisions.
const A = 'Adoptée', R = 'Rejetée', SV = 'Sans vote';
const d = (id, title, page, current, status, steps, limit = '') => ({id, title, page, current, status, steps, limit});

export const decisions = [
d('prix-eau', 'Prix de l’eau chaude', 'eau-chaude-et-compteurs', '34 € le m³ depuis le 1er janvier 2026', 'En vigueur', [
  ['10 mai 2012 · résolution 17', A, 'Tarif de l’eau chaude fixé à 15 € le m³.'],
  ['13 avril 2016 · résolution 14', R, 'Proposition de calculer le tarif d’après les coûts des trois dernières années.'],
  ['15 avril 2019 · résolution 16', A, 'Tarif porté à 25 € le m³.'],
  ['27 juin 2023 · résolution 22', A, 'Tarif porté à 37 € le m³.'],
  ['13 avril 2026 · résolution 6', A, 'Tarif ramené à 34 € le m³, avec effet au 1er janvier 2026 ; le syndic régularise les décomptes.']
], 'Pour une question sur votre décompte, adressez-vous à Homeland.'),

d('ballons', 'Ballons d’eau chaude', 'eau-chaude-et-compteurs', 'Travaux réalisés à l’automne 2026', 'Réalisé', [
  ['27 juin 2023 · résolutions 24.1 à 24.3', R, 'Remplacement d’un ballon par Tournois pour 12 929,40 € TTC.'],
  ['13 avril 2026 · résolutions 17.1 et 17.4', A, 'Remplacement des deux ballons par Tournois pour 24 431 € TTC.'],
  ['13 avril 2026 · résolutions 17.7 et 17.8', A, 'Honoraires du syndic de 5 % HT et appels de fonds au 1er juillet et au 1er octobre 2026.']
]),

d('etude-ecs', 'Modernisation de l’eau chaude', 'eau-chaude-et-compteurs', 'Étude confiée à KEVEMA', 'Étude en cours', [
  ['13 avril 2026 · résolutions 16 et 16.1', A, 'Principe d’une étude pour moderniser la production d’eau chaude, avant un éventuel renouvellement après 2027.'],
  ['13 avril 2026 · résolution 16.2', A, 'Étude confiée à KEVEMA pour 5 280 € TTC, au second vote.'],
  ['13 avril 2026 · résolutions 16.5 et 16.6', A, 'Financement de l’étude par deux appels de fonds, au 1er juillet et au 1er octobre 2026.']
]),

d('toiture', 'Réfection de la toiture', 'toiture-et-projets', 'Étude confiée au cabinet Minne', 'Étude en cours', [
  ['27 juin 2023 · résolution 23', A, 'Mission d’étude confiée à TABIAI pour 1 200 € TTC.'],
  ['8 avril 2025 · résolution 16', A, 'Mission TABIAI annulée ; le conseil syndical choisira un architecte dans la limite de 2 000 € TTC.'],
  ['13 avril 2026 · résolution 15.2', A, 'Étude et consultation des entreprises confiées au cabinet Minne pour 2 250 € TTC.']
], 'Les travaux eux-mêmes seront soumis au vote d’une prochaine assemblée générale.'),

d('diagnostics', 'Diagnostics du bâtiment (DTG, DPE, plan de travaux)', 'toiture-et-projets', 'Les offres de 2026 ont été rejetées', 'Rejeté', [
  ['16 avril 2015 · résolution 13', 'Reportée', 'Audit énergétique : décision reportée à l’assemblée suivante.'],
  ['13 avril 2016 · résolution 17.1', A, 'Audit énergétique confié à CITAE pour 3 110 € TTC.'],
  ['17 mai 2022 · résolution 23', R, 'Diagnostic de performance énergétique (DPE) proposé par DE.P pour 3 966 € TTC.'],
  ['27 juin 2023 · résolution 8', A, 'Diagnostic technique global (DTG) confié à MEV pour 9 120 € TTC.'],
  ['8 avril 2025 · résolution 14', A, 'Retour sur le DTG voté en 2023, resté sans subvention.'],
  ['8 avril 2025 · résolution 15', R, 'Audit technique complet avec plan pluriannuel de travaux.'],
  ['13 avril 2026 · résolutions 13, 13.1, 14 et 14.1', R, 'Offres de MEV et de l’Atelier du Bel Air pour un DTG, un DPE collectif et un plan pluriannuel de travaux.']
]),

d('gouvernance', 'Qui décide, et à partir de quel montant', 'conseil-syndical-et-syndic', 'Seuils fixés par l’AG du 13 avril 2026', 'En vigueur', [
  ['13 avril 2016 · résolutions 12 et 13', A, 'Consultation du conseil syndical au-delà de 500 € TTC ; mise en concurrence à partir de 2 000 € TTC.'],
  ['28 juin 2024 · résolutions 8 à 10', A, 'Consultation du conseil syndical au-delà de 1 500 € TTC ; délégation de décision de 1 000 € pendant douze mois.'],
  ['13 avril 2026 · résolution 8', A, 'Homeland désigné syndic jusqu’au 30 septembre 2027.'],
  ['13 avril 2026 · résolution 10', A, 'Le syndic consulte le conseil syndical avant toute dépense de plus de 1 500 € TTC.'],
  ['13 avril 2026 · résolution 11', A, 'Mise en concurrence des contrats et marchés à partir de 2 000 € TTC.'],
  ['13 avril 2026 · résolution 12', A, 'Délégation au conseil syndical, pendant douze mois, pour des décisions de 1 000 € au plus.']
]),

d('recharge', 'Recharge des véhicules électriques', 'recharge-vehicules-electriques', 'Infrastructure en service depuis janvier 2025', 'Réalisé', [
  ['28 septembre 2020 · résolution 27', A, 'Principe d’une étude ENEDIS, si elle est gratuite.'],
  ['23 juin 2021 · résolution 34', R, 'Étude de marché confiée au syndic.'],
  ['17 mai 2022 · résolution 25', SV, 'Offre WAAT présentée, sans vote.'],
  ['27 juin 2023 · résolution 26', A, 'Borne individuelle autorisée, aux frais du propriétaire, avec comptage individuel.'],
  ['27 juin 2023 · résolutions 26.1 et 26.2', A, 'Propositions de WAAT et de Zeplug adoptées toutes les deux ; choix renvoyé au conseil syndical.'],
  ['28 juin 2024 · résolution 16', A, 'Infrastructure confiée à Electro-Mob pour 7 950,17 € TTC, financée par le fonds de travaux.']
]),

d('vide-ordures', 'Fermeture des vide-ordures', 'vide-ordures', 'Fermeture refusée ; usage déconseillé par le conseil syndical', 'Rejeté', [
  ['29 avril 2014 · résolution 12.1', R, 'Fermeture définitive des vide-ordures.'],
  ['13 avril 2016 · résolutions 27.1 et 29.1', R, 'Fermeture au 4 et au 4 bis, votée séparément.'],
  ['28 juin 2024 · résolutions 13.1 à 13.4', R, 'Suppression des vide-ordures, sur une proposition de Sicre.']
]),

d('periode-chauffe', 'Période de chauffe', 'chauffage-et-trames', 'Du 1er octobre au 15 mai', 'En vigueur', [
  ['10 mai 2012 · résolutions 19 et 20', A, 'Chauffage collectif en service du 1er octobre au 15 mai.'],
  ['14 mai 2013 · résolution 18', SV, 'Rappel de la période du 1er octobre au 15 mai.'],
  ['13 avril 2016 · résolution 37', SV, 'Nouveau rappel de la période du 1er octobre au 15 mai.'],
  ['28 septembre 2020 · résolution 33', R, 'Proposition de laisser le chauffage collectif fonctionner toute l’année.']
]),

d('indemnisation-trames', 'Indemnisation des trames en panne', '', 'Dispositif supprimé en 2014', 'Historique', [
  ['10 mai 2012 · résolution 22', A, 'Indemnisation des logements dont une trame de chauffage est en panne.'],
  ['14 mai 2013 · résolution 25', R, 'Proposition de supprimer cette indemnisation.'],
  ['29 avril 2014 · résolution 17', A, 'Indemnisation supprimée à partir de l’exercice 2014.'],
  ['29 avril 2014 · résolution 19', A, 'Répartition de l’électricité consommée entre l’eau chaude et le chauffage.']
]),

d('etudes-chauffage', 'Études sur le chauffage collectif', '', 'Aucun changement de système décidé', 'Historique', [
  ['10 mai 2012 · résolution 23', A, 'Étude comparant chauffage individuel et chauffage collectif.'],
  ['14 mai 2013 · résolution 13', A, 'Étude du chauffage avec mesures, dans la limite de 5 000 €.'],
  ['26 mars 2018 · résolution 21', A, 'Le conseil syndical poursuit les recherches sur la ventilation, les pompes à chaleur et l’éclairage LED.'],
  ['28 septembre 2020 · résolution 31', A, 'Groupe de travail du conseil syndical sur le chauffage collectif ou individuel.'],
  ['27 juin 2023 · résolution 13', A, 'Compte de l’étude de 2013 approuvé.']
]),

d('armoire-chauffage', 'Armoire et disjoncteur de chauffage', '', 'Travaux soldés en 2025', 'Historique', [
  ['28 septembre 2020 · résolution 23', A, 'Remplacement du disjoncteur de chauffage du 4 bis par SETEMI pour 5 370,53 € TTC.'],
  ['27 juin 2023 · résolution 18', A, 'Compte de ce remplacement approuvé.'],
  ['27 juin 2023 · résolutions 20.1 à 20.5', A, 'Dépose de l’ancienne armoire de chauffage confiée à JEANDEPANNE pour 7 843 € TTC.'],
  ['8 avril 2025 · résolution 12', A, 'Compte de cette dépose approuvé.']
]),

d('interphones', 'Remplacement des interphones', '', 'Remplacement refusé en 2025', 'Rejeté', [
  ['8 avril 2025 · résolutions 17.1 à 17.6 et 18.1 à 18.6', R, 'Remplacement des interphones du 4 et du 4 bis.']
]),

d('information', 'Plaques de boîtes aux lettres et affichages', '', 'Modèle de plaque en cours de confirmation', 'En cours', [
  ['13 avril 2016 · résolution 31', A, 'Plaques harmonisées : texte noir sur fond blanc, en majuscules.'],
  ['25 avril 2017 · résolution 17.5', A, 'Mise en conformité des plaques demandée pour le 30 juin 2017.'],
  ['8 avril 2025 · résolution 19', A, 'Remise en état des parties communes, mise à jour des affichages et solution durable pour les étiquettes de boîtes aux lettres.']
]),

d('budgets', 'Budgets et fonds de travaux', '', 'Budget 2026 : 210 000 € ; budget 2027 : 198 000 €', 'En vigueur', [
  ['17 mai 2022 · résolutions 12 à 15', A, 'Budget 2022 de 176 233 € ; budget 2023 de 188 537 € ; fonds de travaux à 5 %.'],
  ['27 juin 2023 · résolutions 5 à 7', A, 'Budget 2023 relevé à 233 000 € ; même montant pour 2024 ; fonds de travaux à 5 %.'],
  ['28 juin 2024 · résolutions 5 et 6', A, 'Budget 2025 de 221 000 € ; fonds de travaux à 5 %.'],
  ['8 avril 2025 · résolution 5', A, 'Budget 2026 de 222 000 €.'],
  ['8 avril 2025 · résolution 7', A, 'Fonds de travaux porté à 7 %.'],
  ['13 avril 2026 · résolutions 4 et 5', A, 'Budget 2026 ramené à 210 000 € ; budget 2027 de 198 000 €.'],
  ['13 avril 2026 · résolution 7', A, 'Fonds de travaux ramené à 5 %.']
], 'Vos appels de fonds et vos décomptes sont dans l’extranet Homeland.'),

d('anciens-travaux', 'Moteur de porte de garage', '', 'Travaux soldés en 2025', 'Historique', [
  ['27 juin 2023 · résolution 19', A, 'Remplacement en urgence du moteur d’une porte de garage ratifié : 2 282,28 € TTC.'],
  ['8 avril 2025 · résolution 13', A, 'Compte de ce remplacement approuvé.']
]),

d('cameras', 'Caméras', '', 'Projets refusés', 'Rejeté', [
  ['10 mai 2012 · résolution 16', R, 'Consultation d’entreprises pour une vidéosurveillance du parking.'],
  ['28 juin 2024 · résolutions 12.1 à 12.7', R, 'Projet d’installation de caméras.']
]),

d('antenne-toiture', 'Antenne en toiture', '', 'Projet refusé', 'Rejeté', [
  ['28 juin 2024 · résolution 11', R, 'Installation d’une antenne de téléphonie Free sur la toiture.']
]),

d('cloture', 'Clôture côté forêt', '', 'Réfection refusée en 2024', 'Rejeté', [
  ['16 avril 2015 · résolution 17', SV, 'Clôture côté forêt inscrite parmi les travaux à étudier.'],
  ['28 juin 2024 · résolutions 14.1 à 14.5', R, 'Réfection de la clôture, sur des propositions de SERFA et de Concept du Paysage.']
]),

d('compost', 'Compost dans la résidence', '', 'Projets refusés', 'Rejeté', [
  ['16 avril 2015 · résolution 15', R, 'Installation d’un compost collectif dans la résidence.'],
  ['13 avril 2016 · résolution 19.1', R, 'Essai d’un an de compost collectif.'],
  ['28 septembre 2020 · résolution 34', R, 'Nouvel essai, avec un financement de Versailles Grand Parc.']
]),

d('jardins', 'Jardin partagé et végétalisation', '', 'Végétalisation des abords approuvée en 2022', 'Historique', [
  ['28 septembre 2020 · résolution 29', R, 'Création d’un jardin partagé.'],
  ['17 mai 2022 · résolution 28', A, 'Principe d’une végétalisation des abords avec la Mairie, sans coût pour la résidence.']
]),

d('haies', 'Haies des jardins privatifs', '', 'Entretien à la charge des occupants', 'En vigueur', [
  ['23 juin 2021 · résolution 35', SV, 'Rappel : haies entretenues par leurs occupants, hautes de 2 mètres au plus.'],
  ['23 juin 2021 · résolutions 36 et 37', A, 'Entretien possible par l’entreprise de jardinage, aux frais des propriétaires ; thuyas morts à remplacer dans les six mois.'],
  ['17 mai 2022 · résolution 26', SV, 'Information : devis en cours pour les haies et les entrées.']
]),

d('halls', 'Peinture des halls et des cages d’escalier', '', 'Travaux soldés en 2022', 'Historique', [
  ['15 avril 2019 · résolution 15.1', R, 'Pose de carrelage dans les deux entrées.'],
  ['28 septembre 2020 · résolutions 15 et 19', A, 'Peinture des halls du 4 et du 4 bis.'],
  ['23 juin 2021 · résolutions 16 et 20', A, 'Peinture du rez-de-chaussée des cages d’escalier par Prigent.'],
  ['17 mai 2022 · résolutions 17 à 20', A, 'Comptes de ces travaux de peinture approuvés.'],
  ['17 mai 2022 · résolution 27', SV, 'Information : devis en préparation pour la peinture des paliers.']
]),

d('allees', 'Sols des entrées et allée du 4 bis', '', 'Mandat voté en 2023 pour l’allée du 4 bis', 'Historique', [
  ['23 juin 2021 · résolutions 24, 28, 29 et 33', A, 'Réfection des sols extérieurs des entrées : 6 000 € pour le 4, 9 000 € pour le 4 bis.'],
  ['27 juin 2023 · résolutions 15 et 16', A, 'Comptes de ces travaux approuvés.'],
  ['27 juin 2023 · résolutions 21.1 et 21.2', A, 'Mandat au conseil syndical pour refaire l’allée du 4 bis, dans la limite de 15 000 €.']
]),

d('electricite', 'Tableaux électriques et éclairage', '', 'Travaux soldés en 2023', 'Historique', [
  ['14 mai 2013 · résolutions 14 à 16', A, 'Travaux sur le tableau des parties communes et l’éclairage extérieur ; rénovation du tableau d’eau chaude écartée.'],
  ['26 mars 2018 · résolutions 13 et 16', A, 'Réfection de l’éclairage des parkings.'],
  ['28 septembre 2020 · résolution 28', A, 'Le syndic notifie à ENEDIS le transfert des colonnes électriques.'],
  ['27 juin 2023 · résolution 17', A, 'Compte des travaux du tableau électrique approuvé.']
]),

d('ascenseurs', 'Travaux des ascenseurs', '', 'Remplacement des treuils voté en 2012', 'Historique', [
  ['10 mai 2012 · résolutions 25.1 et 25.2', A, 'Remplacement des treuils des deux ascenseurs par Thyssenkrupp.'],
  ['13 avril 2016 · résolutions 15.1 et 16.1', R, 'Remplacement des hublots des portes d’ascenseur.']
]),

d('extincteurs', 'Extincteurs', '', 'Remplacement global refusé en 2023', 'Rejeté', [
  ['27 juin 2023 · résolution 25', R, 'Remplacement de tous les extincteurs pour 3 094,25 € TTC ; les appareils sont remplacés au cas par cas.']
]),

d('origine-guide', 'L’Abécédaire', '', 'Demandé par l’assemblée générale dès 2013', 'Historique', [
  ['10 mai 2012 · résolutions 26 et 27', A, 'Examen des projets de mise à jour du règlement de copropriété et du règlement intérieur datant de 2008.'],
  ['14 mai 2013 · résolution 23', A, 'Projet de mise à jour du règlement de copropriété abandonné.'],
  ['14 mai 2013 · résolution 24', A, 'Projet de règlement intérieur abandonné ; l’assemblée demande d’enrichir l’Abécédaire à la place.']
])
];
