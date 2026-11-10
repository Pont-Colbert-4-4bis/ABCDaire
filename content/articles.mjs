// Fiches du guide, relues le 10 novembre 2026.
// Une fiche dit ce qu’il faut savoir et quoi faire. Pas de note d’auteur, pas de renvoi « à vérifier ».
// Les règles citées viennent du règlement de copropriété de 1977 (pages de la copie publique).
const reg = ref => `Règlement de copropriété de 1977, ${ref}.`;
const cs = 'Conseil syndical, novembre 2026.';
const f = (slug, title, category, icon, intro, keywords, sections, source, related, extra = {}) =>
  ({slug, title, letter: title[0].normalize('NFD')[0].toUpperCase(), category, icon, intro, keywords, sections, source, related, ...extra});

export const articles = [
f('absences-et-securite', 'Absences et sécurité', 'Vie quotidienne', 'home',
  'Partir l’esprit tranquille : clés, courrier, portes et badges.',
  'absence vacances courrier clés porte badge perte sécurité voisin serrurier',
  [
    ['Avant une absence prolongée', [
      'Laissez vos clés à une personne de confiance qui habite la région et indiquez son nom à Homeland. Le règlement le demande : en cas d’urgence, une fuite par exemple, il faut pouvoir entrer dans le logement.',
      'À défaut, le syndic peut faire ouvrir la porte par un serrurier, en présence de la police.',
      'Demandez à un voisin de relever votre courrier.'
    ]],
    ['Portes et badges', [
      'Vérifiez que la porte du hall et celle du parking se referment derrière vous. Si une porte ferme mal, prévenez Homeland.',
      'Badge perdu ou volé : prévenez Homeland, qui commande un nouveau badge et fait désactiver l’ancien si c’est possible.'
    ]]
  ],
  reg('art. 7 § 9, p. 48'),
  ['arriver-et-demenager', 'boites-aux-lettres', 'urgences']),

f('arriver-et-demenager', 'Arriver et déménager', 'Vie quotidienne', 'home',
  'Ce qu’il faut savoir en arrivant, et comment organiser un déménagement.',
  'emménagement nouvel arrivant locataire propriétaire bienvenue cartons déménagement bail location',
  [
    ['En arrivant', [
      'Votre propriétaire ou votre agence vous remet les clés, le badge et le code d’entrée.',
      'Repérez votre entrée (4 ou 4 bis), votre boîte aux lettres, le local poubelles et le local vélos.',
      'La fiche Boîtes aux lettres explique comment obtenir votre plaque ; la fiche WhatsApp, comment rejoindre le groupe des résidents.',
      'La fiche Règles de vie résume l’essentiel du règlement de copropriété.'
    ]],
    ['Le jour du déménagement', [
      'Prévenez vos voisins quelques jours avant.',
      'Avant de commencer, faites constater l’état de la cabine d’ascenseur par un membre du conseil syndical. Les dégâts causés pendant le déménagement sont à la charge de celui qui déménage.',
      'Protégez les parois et le sol de la cabine avec des cartons. Respectez la charge de 300 kg et ne bloquez pas les portes.',
      'Ne laissez rien dans les halls et les couloirs. Les cartons vides se plient et vont dans les bacs de tri ; les encombrants sortent le mercredi soir.'
    ]],
    ['Si vous louez votre logement', [
      'Le bail doit imposer au locataire le respect du règlement de copropriété. Le propriétaire en adresse une copie au syndic dans les quinze jours.',
      'La location meublée d’un appartement entier est autorisée ; la location à la chambre ne l’est pas.'
    ]]
  ],
  'Règlement de copropriété de 1977, art. 7 § 2.4 et 14, p. 45 et 49 ; pratique du conseil syndical.',
  ['ascenseurs', 'boites-aux-lettres', 'dechets-et-encombrants', 'whatsapp', 'regles-de-vie'],
  {links: [['Affiche de la résidence — 2 QR codes', '/ABCDaire/assets/partage/affiche-hall-abcdaire-et-whatsapp.pdf'], ['Affiche et QR codes', '/ABCDaire/partager/']]}),

f('ascenseurs', 'Ascenseurs', 'Équipements', 'lift',
  'Un ascenseur par entrée. Que faire en cas de panne, et comment éviter d’en provoquer une.',
  'ascenseur cabine panne bloqué alarme déménagement charge 300 kg fosse clés',
  [
    ['Au quotidien', [
      'Charge maximale : 300 kg.',
      'Attendez l’ouverture complète des portes. Ne les forcez pas et ne surchargez pas la cabine : ce sont les causes de panne les plus fréquentes.',
      'Pour un objet volumineux, protégez les parois et le sol de la cabine.'
    ]],
    ['En cas de panne', [
      'Vous êtes bloqué : appuyez sur le bouton d’alarme de la cabine. Il vous met en relation avec TK Elevator, 24 h/24. Le contrat prévoit l’arrivée d’un technicien dans l’heure.',
      'L’ascenseur est à l’arrêt : appelez le dépannage TK Elevator au 0 800 24 00 20, puis prévenez Homeland en indiquant l’entrée et l’heure.',
      'Une personne est en danger : appelez le 18 ou le 112.'
    ]],
    ['Un objet tombé dans la fosse', [
      'Ne tentez pas de le récupérer et n’ouvrez pas les portes palières. Demandez l’intervention à Homeland ; elle peut être facturée.'
    ]]
  ],
  'Contrat de maintenance TK Elevator de 2025.',
  ['urgences', 'signaler-un-probleme', 'arriver-et-demenager']),

f('balcons-et-fenetres', 'Balcons et fenêtres', 'Travaux & logement', 'window',
  'La façade est commune : ce qui se voit de l’extérieur ne se modifie pas sans vote de l’assemblée générale.',
  'façade fenêtre balcon peinture garde-corps canisse store volets climatisation linge antenne parabole',
  [
    ['Ce que dit le règlement', [
      'Pas de linge visible de l’extérieur, aucun objet posé sur le rebord des fenêtres et des balcons, rien jeté par les fenêtres.',
      'Les balcons ne servent pas de débarras.',
      'Canisses et autres habillages le long des garde-corps : interdits.',
      'Protection supplémentaire pour de jeunes enfants : autorisation préalable du syndic.',
      'Antenne ou parabole individuelle à l’extérieur : interdite.'
    ]],
    ['Fenêtres, garde-corps, peinture', [
      'Les fenêtres, les portes palières, les garde-corps et leur peinture ne peuvent être modifiés qu’avec l’accord de l’assemblée générale.',
      'Avant de remplacer vos fenêtres ou de repeindre, écrivez à Homeland avec le descriptif : modèle, matériau, couleur.',
      'La référence de peinture des garde-corps est en cours de vérification par le conseil syndical.'
    ]],
    ['Stores et climatisation', [
      'Le règlement autorise les stores si leur fixation, leur teinte et leur forme sont celles adoptées en assemblée générale. Aucun modèle n’est adopté à ce jour : le conseil syndical étudie la question.',
      'Il n’existe pas encore de règle pour la climatisation. Ne posez pas d’unité extérieure sans accord de l’assemblée générale.'
    ]]
  ],
  reg('art. 7 § 1.1.4, 4, 5 et 6, p. 42, 46 et 47'),
  ['travaux-privatifs', 'bruit-et-voisinage']),

f('boites-aux-lettres', 'Boîtes aux lettres', 'Vie quotidienne', 'mail',
  'Plaque à votre nom, publicité, courrier pendant vos absences.',
  'boîte aux lettres plaque nom étiquette gravure stop pub courrier',
  [
    ['Votre plaque', [
      'Toutes les plaques suivent le même modèle. Ce modèle et le graveur sont en cours de confirmation par le conseil syndical : demandez-lui avant de commander.',
      'Donnez l’orthographe exacte du nom à graver.'
    ]],
    ['Courrier et publicité', [
      'Un autocollant « Stop Pub » évite les imprimés publicitaires.',
      'Pendant une absence, demandez à un voisin de relever votre courrier.',
      'Aucune boîte aux lettres supplémentaire ne peut être posée sans accord de l’assemblée générale.'
    ]]
  ],
  'Conseil syndical, novembre 2026 ; règlement de copropriété de 1977, art. 8 § 3, p. 50.',
  ['arriver-et-demenager', 'conseil-syndical-et-syndic']),

f('bruit-et-voisinage', 'Bruit et voisinage', 'Vie quotidienne', 'sound',
  'Les horaires à respecter pour les travaux bruyants et les bons réflexes entre voisins.',
  'bruit musique tapage nocturne perceuse bricolage machine à laver fêtes horaires travaux',
  [
    ['Travaux bruyants : les horaires', [
      'Jours ouvrables : 8 h 30 – 12 h et 14 h – 19 h 30. Samedi : 9 h – 12 h et 15 h – 19 h. Dimanche et jours fériés : 10 h – 12 h.',
      'Horaires fixés par arrêté préfectoral : rappelez-les à vos entreprises.'
    ]],
    ['Au quotidien', [
      'Tout bruit qui trouble la tranquillité des voisins est interdit, de jour comme de nuit, même chez soi.',
      'Les sols transmettent les bruits : patins de feutre sous les chaises, chaussons, lave-linge posé sur un support anti-vibrations.',
      'Prévenez vos voisins avant une fête ou des travaux.'
    ]],
    ['Si la gêne persiste', [
      'Parlez-en d’abord à votre voisin.',
      'Si rien ne change, écrivez à Homeland en indiquant les dates et les heures. Le règlement ne retient pas les plaintes verbales ou anonymes.'
    ]]
  ],
  'Arrêté préfectoral des Yvelines n° 2012346-0003 ; règlement de copropriété de 1977, art. 7 § 2 et 3, p. 41, 45 et 46.',
  ['travaux-privatifs', 'signaler-un-probleme'],
  {links: [['Bruit : informations de la Ville de Versailles', 'https://www.versailles.fr/156/mairie/prevention-et-securite/hygiene.htm']]}),

f('chauffage-et-trames', 'Chauffage et trames', 'Équipements', 'heat',
  'Le chauffage collectif réchauffe les logements par les planchers et les plafonds. Vos convecteurs apportent le complément.',
  'chauffage trames plafond plancher percer convecteur froid température période de chauffe thermostat',
  [
    ['Comment votre logement est chauffé', [
      'Des résistances électriques, appelées « trames », sont noyées dans les planchers et les plafonds. Elles fournissent une température de base d’environ 13 °C.',
      'Vos convecteurs électriques apportent le complément. Leur consommation est comptée sur le compteur électrique de votre logement.',
      'Les trames chauffent la structure du bâtiment : la température monte et descend lentement.'
    ]],
    ['La période de chauffe', [
      'Le chauffage collectif fonctionne du 1er octobre au 15 mai.',
      'Pendant cette période, un thermostat le déclenche dès que la température mesurée sur le toit passe sous 13 °C. Plus il fait froid, plus la durée de chauffe s’allonge dans la journée.',
      'Les charges du chauffage de base sont dues par tous, même en cas d’absence.'
    ]],
    ['Ne percez ni les plafonds ni les sols', [
      'Aucun trou ni saignée dans les plafonds et les planchers sans l’autorisation du syndic : une trame percée est hors service.',
      'Sa réparation coûte environ 4 000 €, hors remise en état du plafond, à la charge de celui qui l’a percée.',
      'Pour fixer un luminaire, utilisez uniquement le point lumineux existant.'
    ]],
    ['En cas de froid anormal', [
      'Relevez la température matin et soir, dans la même pièce, pendant quelques jours.',
      'Transmettez ces relevés à Homeland en précisant les pièces concernées.'
    ]]
  ],
  'Règlement de copropriété de 1977, art. 7 § 1.1.1, p. 41, et art. 19, p. 64 ; AG du 10 mai 2012 ; conseil syndical, octobre et novembre 2026.',
  ['travaux-privatifs', 'signaler-un-probleme', 'eau-chaude-et-compteurs'],
  {links: [['Règlement : article 19, page 64', '/ABCDaire/reglement/#reg-page-64']]}),

f('conseil-syndical-et-syndic', 'Conseil syndical et syndic', 'Démarches', 'people',
  'Qui fait quoi dans la copropriété, et à qui s’adresser.',
  'CS copropriété AG assemblée générale gestionnaire syndic Homeland extranet charges',
  [
    ['Le syndic : Homeland', [
      'Homeland gère la copropriété : charges, contrats, travaux, sinistres. C’est Homeland qui commande les interventions des entreprises.',
      'Pour toute demande sur les parties communes, écrivez-lui depuis l’extranet ou à assistance@homeland.immo.',
      'Chaque intervention commandée est payée par la copropriété, donc par tous : sollicitez Homeland à bon escient.',
      'Les PV d’assemblée générale, les comptes et les contrats sont dans l’extranet Homeland.'
    ]],
    ['Le conseil syndical', [
      'Le conseil syndical (CS) est composé de copropriétaires bénévoles élus en assemblée générale. Il contrôle la gestion du syndic et l’assiste.',
      'Il ne commande pas les travaux à la place du syndic. Vous pouvez lui signaler un problème ou lui proposer une idée, par exemple sur le groupe WhatsApp des résidents.'
    ]],
    ['L’assemblée générale', [
      'Elle réunit les copropriétaires une fois par an et vote le budget, les travaux et les contrats.',
      'Pour faire inscrire une question à l’ordre du jour, adressez-la à Homeland. Le conseil syndical peut vous aider à la formuler.'
    ]]
  ],
  'AG du 13 avril 2026 ; conseil syndical, novembre 2026.',
  ['signaler-un-probleme', 'travaux-privatifs', 'whatsapp'],
  {links: [['Extranet Homeland', 'https://extranet.homeland.immo/']]}),

f('dechets-et-encombrants', 'Déchets et encombrants', 'Vie quotidienne', 'leaf',
  'Où jeter quoi, et quand sortir les encombrants.',
  'déchet tri poubelle ordures verre carton encombrants gravats peinture batterie électroménager recyclage déchèterie',
  [
    ['Tous les jours', [
      'Les ordures ménagères et le tri se déposent dans les bacs des locaux poubelles. Les consignes de tri sont affichées dans ces locaux et à l’entrée du garage.',
      'Le tri se dépose en vrac, sans sac. Pliez les cartons.',
      'Le verre va dans les conteneurs de la rue.',
      'Ne laissez rien dans les couloirs ni dans les halls.'
    ]],
    ['Encombrants', [
      'Sortez-les vous-même le mercredi soir, pour la collecte du jeudi. Ce n’est pas le rôle de l’agent d’entretien.',
      'Acceptés : literie, fauteuils, tapis et moquette, ferraille, jouets non électriques, miroirs et vitres bien emballés.',
      'Refusés : gravats, appareils électriques, textiles, pièces automobiles, déchets dangereux.'
    ]],
    ['Le reste', [
      'Appareils électriques, peintures, solvants, piles : déchèterie ou collecte spécialisée de Versailles Grand Parc.',
      'Gravats : l’entreprise qui fait vos travaux les emporte.',
      'Un objet encore utilisable ? Pensez au don avant de jeter.'
    ]]
  ],
  'Le Petit Colbert d’octobre 2026 ; Versailles Grand Parc.',
  ['vide-ordures', 'espaces-communs', 'travaux-privatifs', 'reemploi-et-compost'],
  {links: [['Jours et points de collecte', 'https://www.versaillesgrandparc.fr/927.htm'], ['Consignes de tri de Versailles Grand Parc', 'https://www.versaillesgrandparc.fr/310/au-quotidien/gestion-des-dechets/trier-jeter-valoriser/tri-selectif-et-consignes.htm']]}),

f('eau-chaude-et-compteurs', 'Eau chaude et compteurs', 'Équipements', 'drop',
  'L’eau chaude est produite collectivement et facturée selon votre consommation.',
  'eau chaude froide compteur relevé consommation ballon tarif m3 OCEA portail',
  [
    ['Comment ça marche', [
      'L’eau chaude est produite au sous-sol, dans des ballons communs entretenus par Tournois. Des travaux sur ces ballons ont été réalisés à l’automne 2026.',
      'Chaque logement a un compteur d’eau chaude, relevé à distance par OCEA : personne ne passe chez vous.',
      'Tarif voté à l’AG du 13 avril 2026 : 34 € le m³ depuis le 1er janvier 2026.'
    ]],
    ['Consulter votre consommation', [
      'Le portail résident OCEA affiche vos consommations. Pour créer votre accès, demandez le code de la résidence à Homeland.',
      'Compteur en panne, consommation anormale, accès impossible : adressez-vous à Homeland, qui contacte OCEA.'
    ]],
    ['En cas de problème', [
      'Plus d’eau chaude, ou eau tiède : vérifiez auprès d’un voisin si l’immeuble est touché, puis prévenez Homeland.',
      'Température qui varie sous la douche : signalez-le à Homeland en indiquant votre entrée, votre étage et la pièce concernée.',
      'Pour une fuite, voyez la fiche Fuites et dégâts des eaux.'
    ]]
  ],
  'Règlement de copropriété de 1977, art. 20, p. 64 ; contrats OCEA de 2023 et Tournois de 2024 ; AG du 13 avril 2026.',
  ['fuites-et-degats-des-eaux', 'signaler-un-probleme'],
  {
    links: [['Consulter ma consommation d’eau — portail résident OCEA', 'https://espace-resident.ocea-sb.com/'], ['Créer mon accès au portail résident OCEA', 'https://espace-resident-inscription.ocea-sb.com/']],
    sectionLinks: {'Consulter votre consommation': [['Consulter ma consommation d’eau — portail résident OCEA', 'https://espace-resident.ocea-sb.com/'], ['Créer mon accès au portail résident OCEA', 'https://espace-resident-inscription.ocea-sb.com/']]}
  }),

f('eclairage', 'Éclairage', 'Équipements', 'light',
  'Une ampoule grillée dans un couloir, un parking ou une cave : à qui le dire.',
  'lampe ampoule lumière néon parking cave palier escalier éclairage',
  [
    ['Signaler une panne', [
      'Prévenez Homeland en indiquant l’entrée, l’étage et l’endroit précis. Joignez une photo si possible.',
      'Si toute une zone est dans le noir, précisez-le : la panne ne vient pas d’une ampoule.'
    ]],
    ['Qui remplace quoi', [
      'L’entreprise de ménage remplace les ampoules des parties communes à la demande de Homeland.',
      'Un luminaire ou un circuit défectueux demande un électricien, mandaté par Homeland.',
      'Ne démontez pas vous-même un luminaire commun.'
    ]]
  ],
  'Contrat de nettoyage ANET & Services de 2023.',
  ['signaler-un-probleme', 'espaces-communs']),

f('espaces-communs', 'Espaces communs', 'Vie quotidienne', 'stairs',
  'Halls, paliers, couloirs, caves : des lieux à garder libres et propres.',
  'couloir cave poussette vélo objets encombrement palier circulation escalier propreté paillasson local vélos',
  [
    ['Rien dans les passages', [
      'Le règlement interdit de laisser quoi que ce soit dans les halls, les escaliers, les paliers, les couloirs des caves et les voies de circulation des parkings.',
      'Les halls ne servent pas de garage à vélos, à poussettes ou à motos.',
      'Le syndic peut faire enlever un objet 48 heures après une mise en demeure, aux frais de son propriétaire.',
      'Les abords des portes d’appartement restent dégagés pour le nettoyage des paliers et des moquettes.'
    ]],
    ['Les locaux vélos', [
      'Au 4 : juste après la porte d’entrée, à droite.',
      'Au 4 bis : dans le parking du rez-de-chaussée, près de l’entrée du 4 bis.'
    ]],
    ['Portes et paillassons', [
      'L’aspect des portes d’appartement côté couloir est commun : pas de changement de couleur sans accord de l’assemblée générale.',
      'Le paillasson doit être d’un modèle autorisé par le syndic.'
    ]],
    ['Signaler une dégradation', [
      'Prévenez Homeland en précisant l’entrée, l’étage et l’endroit. La fiche Signaler un problème explique comment.'
    ]]
  ],
  reg('art. 7 § 5, p. 46, et art. 8, p. 49 et 50'),
  ['arriver-et-demenager', 'dechets-et-encombrants', 'eclairage', 'signaler-un-probleme']),

f('fuites-et-degats-des-eaux', 'Fuites et dégâts des eaux', 'Démarches', 'drop',
  'Les premiers gestes, puis qui prévenir et qui paie.',
  'fuite eau inondation dégât sinistre assurance plombier robinet arrêt constat',
  [
    ['Tout de suite', [
      'Coupez l’eau au robinet d’arrêt de votre logement.',
      'Prévenez le voisin du dessous, ou celui du dessus si l’eau vient de chez lui.',
      'Appelez Homeland au 01 86 76 07 60.',
      'Eau près d’une installation électrique ou danger pour une personne : appelez le 18 ou le 112.'
    ]],
    ['Qui fait réparer, qui paie', [
      'La recherche de fuite et la réparation se demandent par écrit à Homeland, par le propriétaire du logement.',
      'Fuite sur une partie privative : la facture est à la charge du propriétaire.',
      'Fuite sur une partie commune : elle est à la charge de la copropriété.',
      'Le règlement oblige à laisser l’accès au logement pour rechercher l’origine d’une fuite.'
    ]],
    ['Assurance', [
      'Déclarez le sinistre à votre assurance habitation et remplissez un constat amiable avec le voisin concerné.',
      'Locataire : prévenez aussi votre propriétaire.',
      'Gardez les photos et les références des interventions.'
    ]]
  ],
  'Procédure arrêtée par le conseil syndical en octobre 2026 ; règlement de copropriété de 1977, art. 7 § 8, p. 47 et 48.',
  ['urgences', 'eau-chaude-et-compteurs', 'signaler-un-probleme']),

f('interphone', 'Interphone', 'Équipements', 'phone',
  'L’interphone ne sonne pas ou grésille : que vérifier, qui prévenir.',
  'interphone sonnette combiné grésillement entrée fibre câble',
  [
    ['Avant de signaler', [
      'Vérifiez que votre combiné est bien raccroché.',
      'Notez ce qui ne marche pas : la sonnerie, le son ou l’ouverture de la porte.'
    ]],
    ['Signaler la panne', [
      'Prévenez Homeland en indiquant l’entrée et l’étage. Homeland fait intervenir l’entreprise.',
      'Ne démontez pas votre combiné.',
      'Si vous faites poser la fibre ou d’autres câbles, demandez à l’installateur d’utiliser les goulottes existantes : des fils d’interphone ont déjà été coupés par des perçages.'
    ]]
  ],
  cs,
  ['signaler-un-probleme', 'arriver-et-demenager']),

f('jardins-et-vie-de-residence', 'Jardins et vie de résidence', 'Vie quotidienne', 'leaf',
  'Qui entretient les espaces verts, et comment participer à la vie de la résidence.',
  'jardin arrosage plantes rosiers fête pique-nique voisins bénévoles haies pelouse',
  [
    ['Les espaces verts', [
      'Concept du Paysage entretient les pelouses, les massifs et les haies : au moins seize passages par an et deux tailles de haies.',
      'Respectez les plantations. Le règlement interdit de couper les fleurs des espaces communs.',
      'Une idée de plantation ou un problème ? Parlez-en au conseil syndical.'
    ]],
    ['Les cuves fleuries des entrées', [
      'Des résidents bénévoles entretiennent toute l’année les cuves de plantes et d’arbustes devant le 4 et le 4 bis.',
      'Ils s’organisent dans un groupe WhatsApp de jardinage. Pour les rejoindre, demandez sur le groupe des résidents.'
    ]],
    ['Moments conviviaux', [
      'Le conseil syndical organise des rendez-vous entre voisins, comme le pique-nique de rentrée. Ils sont annoncés dans Le Petit Colbert et sur le groupe WhatsApp.',
      'Vous avez une idée ? Proposez-la au conseil syndical.'
    ]]
  ],
  'Contrat Concept du Paysage de 2022 ; règlement de copropriété de 1977, art. 8 § 2, p. 50.',
  ['espaces-communs', 'conseil-syndical-et-syndic', 'whatsapp']),

f('parking-et-stationnement', 'Parking et stationnement', 'Vie quotidienne', 'car',
  'Deux parkings, au rez-de-chaussée et au sous-sol, et quelques règles pour circuler sans gêner.',
  'parking garage voiture place stationnement porte accès priorité entrant sortant rampe sous-sol moto',
  [
    ['Les règles', [
      'Garez-vous uniquement sur votre emplacement. Une place vide n’est pas une place libre.',
      'Un emplacement sert à garer un véhicule, jamais de débarras.',
      'Aucun carburant ni produit inflammable dans les garages et les caves.',
      'Ne stationnez pas sur les voies de circulation ni sur les rampes. Roulez au pas.'
    ]],
    ['Priorité au véhicule qui entre', [
      'À la sortie, laissez passer le véhicule qui entre s’il est déjà engagé dans l’accès.',
      'Sinon il devrait reculer vers la rue en retraversant le trottoir et, pour le sous-sol, remonter la rampe en marche arrière.'
    ]],
    ['Porte en panne', [
      'Prévenez Homeland, qui fait intervenir l’entreprise de maintenance.',
      'Ne manœuvrez pas la porte vous-même.'
    ]]
  ],
  reg('art. 7 § 2.3 et 2.5, p. 45, et art. 8 § 1, p. 49'),
  ['arriver-et-demenager', 'signaler-un-probleme', 'recharge-vehicules-electriques']),

f('recharge-vehicules-electriques', 'Recharge des véhicules électriques', 'Équipements', 'car',
  'L’infrastructure de recharge est en service depuis janvier 2025. Chaque propriétaire peut faire équiper sa place.',
  'borne recharge IRVE voiture électrique parking Electro-Mob devis',
  [
    ['Faire installer une borne', [
      'Demandez un devis à Electro-Mob, qui a installé l’infrastructure commune.',
      'La borne, sa pose et l’électricité consommée sont à votre charge. La consommation est comptée individuellement.',
      'Demandez que le devis détaille le raccordement, la borne, la pose, l’abonnement éventuel et la garantie.'
    ]],
    ['En cas de panne', [
      'Votre borne : contactez le service après-vente d’Electro-Mob.',
      'Plusieurs bornes touchées : prévenez aussi Homeland.'
    ]]
  ],
  'AG du 27 juin 2023 (résolution 26) et du 28 juin 2024 (résolution 16).',
  ['parking-et-stationnement', 'travaux-privatifs', 'conseil-syndical-et-syndic'],
  {links: [['Electro-Mob : devis, installation et contact', 'https://www.electro-mob.com/']]}),

f('reemploi-et-compost', 'Réemploi et compost', 'Vie quotidienne', 'leaf',
  'Donner plutôt que jeter, et composter près de chez soi.',
  'compost biodéchet don réparation réemploi maison de quartier Porchefontaine Chantiers',
  [
    ['Donner', [
      'Avant de sortir un objet aux encombrants, proposez-le autour de vous, par exemple sur le groupe WhatsApp des résidents.'
    ]],
    ['Composter', [
      'Il n’y a pas de composteur dans la résidence. Des résidents utilisent le compost partagé de la maison de quartier de Porchefontaine, 86 rue Yves-Le-Coz.',
      'Un autre site existe à la maison de quartier des Chantiers, 53 rue des Chantiers.',
      'Inscription et consignes : auprès de Versailles Grand Parc ou de la maison de quartier. Un résident référent peut vous guider : demandez sur le groupe WhatsApp.'
    ]]
  ],
  'Versailles Grand Parc ; AG de 2015, 2016 et 2020.',
  ['dechets-et-encombrants', 'jardins-et-vie-de-residence'],
  {links: [['Compostage partagé : sites et modalités VGP', 'https://www.versaillesgrandparc.fr/1696/au-quotidien/en-route-vers-le-zero-dechet/composter-ses-biodechets/le-compostage-partage.htm']]}),

f('regles-de-vie', 'Règles de vie', 'Vie quotidienne', 'people',
  'L’essentiel du règlement de copropriété, en une page.',
  'règlement règles vie bon voisinage accueil respect bruit déchets parking balcon travaux',
  [
    ['Bruit', [
      'Tout bruit gênant pour les voisins est interdit, de jour comme de nuit.',
      'Travaux bruyants : en semaine 8 h 30 – 12 h et 14 h – 19 h 30 ; samedi 9 h – 12 h et 15 h – 19 h ; dimanche et jours fériés 10 h – 12 h.'
    ]],
    ['Parties communes', [
      'Rien ne reste dans les halls, les escaliers, les paliers et les couloirs.',
      'Les vélos vont au local vélos, pas dans les halls.',
      'Les déchets vont dans les locaux poubelles ; les encombrants sortent le mercredi soir.'
    ]],
    ['Façade et balcons', [
      'Pas de linge visible, pas d’objet sur les rebords, pas de canisses.',
      'Fenêtres, garde-corps, portes palières : aucun changement sans vote de l’assemblée générale.'
    ]],
    ['Travaux', [
      'Autorisation du syndic avant de percer un plafond ou un plancher, de modifier la distribution du logement ou de toucher aux canalisations communes.',
      'Le propriétaire répond des dégâts causés par ses travaux.'
    ]],
    ['Parkings', [
      'Chacun sur sa place, aucun dépôt, priorité au véhicule qui entre.'
    ]],
    ['En cas de problème', [
      'Parties communes : prévenez Homeland. Urgence : 18 ou 112.'
    ]]
  ],
  reg('art. 7 et 8, p. 41 à 50'),
  ['arriver-et-demenager', 'espaces-communs', 'bruit-et-voisinage', 'dechets-et-encombrants', 'signaler-un-probleme'],
  {links: [['Lire le règlement de copropriété', '/ABCDaire/reglement/'], ['Affiche de la résidence — 2 QR codes', '/ABCDaire/assets/partage/affiche-hall-abcdaire-et-whatsapp.pdf']]}),

f('signaler-un-probleme', 'Signaler un problème', 'Démarches', 'message',
  'Pour les parties communes, c’est Homeland qu’il faut prévenir. Voici comment être efficace.',
  'contact syndic panne incident réclamation signalement prestataire entretien Homeland extranet',
  [
    ['Qui prévenir', [
      'Danger pour une personne : 18 ou 112.',
      'Ascenseur bloqué : bouton d’alarme de la cabine.',
      'Tout le reste dans les parties communes : Homeland, par l’extranet, à assistance@homeland.immo ou au 01 86 76 07 60.',
      'Dans votre logement : votre propriétaire si vous êtes locataire, sinon l’artisan de votre choix.'
    ]],
    ['Ce qu’il faut dire', [
      'Où : entrée, étage, endroit précis.',
      'Quoi : ce que vous constatez, et depuis quand.',
      'Une photo aide beaucoup.'
    ]],
    ['Bon à savoir', [
      'C’est Homeland qui mandate les entreprises : n’appelez pas directement un prestataire de la résidence.',
      'Chaque intervention est payée par la copropriété. Signalez ce qui le mérite, une seule fois, et répondez dans le même message pour le suivi.',
      'Vous pouvez aussi en parler sur le groupe WhatsApp des résidents ou à un membre du conseil syndical. Évitez d’y citer un voisin ou un numéro d’appartement.'
    ]]
  ],
  cs,
  ['urgences', 'conseil-syndical-et-syndic', 'whatsapp'],
  {links: [['Extranet Homeland', 'https://extranet.homeland.immo/']]}),

f('toiture-et-projets', 'Toiture et projets collectifs', 'Travaux & logement', 'tool',
  'Où en est le projet de réfection de la toiture.',
  'toiture terrasse étanchéité architecte diagnostic amiante DTG DPE PPPT plan pluriannuel infiltration',
  [
    ['Le projet', [
      'L’AG du 13 avril 2026 a confié au cabinet Minne l’étude de la réfection de la toiture et la consultation des entreprises.',
      'Un diagnostic amiante de la toiture, obligatoire avant les travaux, est engagé à l’automne 2026.',
      'Le projet chiffré sera soumis au vote d’une prochaine assemblée générale.'
    ]],
    ['Diagnostics du bâtiment', [
      'Les offres de diagnostic technique global (DTG), de diagnostic de performance énergétique collectif (DPE) et de plan pluriannuel de travaux (PPPT) ont été rejetées par l’AG du 13 avril 2026.'
    ]],
    ['Infiltration par la toiture', [
      'Prévenez Homeland en indiquant l’endroit, la date et les dégâts, puis votre assurance.'
    ]]
  ],
  'AG du 13 avril 2026, résolutions 13 à 15 ; conseil syndical, novembre 2026.',
  ['fuites-et-degats-des-eaux', 'conseil-syndical-et-syndic', 'travaux-privatifs']),

f('travaux-privatifs', 'Travaux privatifs', 'Travaux & logement', 'tool',
  'Ce que vous pouvez faire librement chez vous, et ce qui demande une autorisation.',
  'travaux rénovation autorisation AG syndic plafond percement sol acoustique plomberie façade gravats',
  [
    ['Autorisation du syndic obligatoire', [
      'Percer ou faire une saignée dans un plafond ou un plancher : des résistances de chauffage y sont noyées.',
      'Modifier la disposition intérieure du logement.',
      'Se raccorder à une canalisation commune.',
      'Remplacer ou ajouter un élément de chauffage.'
    ]],
    ['Vote de l’assemblée générale', [
      'Tout ce qui se voit de l’extérieur : fenêtres, portes palières, garde-corps, stores.'
    ]],
    ['Les règles techniques', [
      'Nouveau revêtement de sol : isolation phonique au moins égale à celle d’origine.',
      'Câbles (fibre, électricité) : dans les goulottes existantes.',
      'Le propriétaire est responsable des dégâts causés par ses travaux ; le syndic peut demander une attestation d’assurance.'
    ]],
    ['Pendant le chantier', [
      'Respectez les horaires des travaux bruyants (fiche Bruit et voisinage) et prévenez vos voisins.',
      'Protégez l’ascenseur et les parties communes, et nettoyez après le passage des ouvriers.',
      'Les gravats sont emportés par l’entreprise, jamais déposés dans les locaux poubelles ni aux encombrants.'
    ]]
  ],
  reg('art. 7 § 1.1.1 à 1.1.7, p. 41 à 43'),
  ['balcons-et-fenetres', 'chauffage-et-trames', 'bruit-et-voisinage', 'dechets-et-encombrants']),

f('urgences', 'Urgences et pannes', 'Démarches', 'alert',
  'Les numéros à connaître.',
  'urgence secours 112 18 15 17 114 danger incendie malaise panne extincteur électricité',
  [
    ['Secours', [
      '112 : numéro d’urgence européen.',
      '18 : pompiers. 15 : Samu. 17 : police.',
      '114 : par SMS, pour les personnes sourdes ou malentendantes.'
    ]],
    ['Dans la résidence', [
      'Ascenseur bloqué : bouton d’alarme de la cabine, ou TK Elevator au 0 800 24 00 20.',
      'Fuite d’eau ou panne dans les parties communes : Homeland au 01 86 76 07 60, 24 h/24.',
      'Coupure d’électricité dans tout l’immeuble : Enedis au 09 72 67 50 78.'
    ]],
    ['Extincteurs', [
      'Un dans chaque hall, trois dans le parking du rez-de-chaussée, sept dans le parking du sous-sol.',
      'En cas d’incendie, appelez d’abord le 18.'
    ]]
  ],
  'Service-public.fr ; inventaire des extincteurs de juin 2023.',
  ['ascenseurs', 'fuites-et-degats-des-eaux', 'signaler-un-probleme'],
  {links: [['Numéros d’urgence : Service Public', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F33954'], ['Urgence 114', 'https://www.urgence114.fr/']]}),

f('ventilation-vmc', 'Ventilation et VMC', 'Équipements', 'wind',
  'La ventilation est collective : les bouches de votre logement doivent rester propres et dégagées.',
  'ventilation VMC bouche extraction air humidité odeur',
  [
    ['Chez vous', [
      'Ne bouchez ni les entrées d’air ni les bouches d’extraction.',
      'Nettoyez les bouches régulièrement.',
      'Ne raccordez rien à la ventilation sans l’accord du syndic.'
    ]],
    ['En cas d’anomalie', [
      'Bruit inhabituel, odeurs, bouche qui n’aspire plus : prévenez Homeland en indiquant la pièce et depuis quand.',
      'Le moteur de ventilation a été réparé à l’automne 2026.'
    ]]
  ],
  cs,
  ['signaler-un-probleme', 'travaux-privatifs', 'balcons-et-fenetres']),

f('vide-ordures', 'Vide-ordures', 'Équipements', 'bin',
  'Les vide-ordures restent en service, mais le conseil syndical déconseille leur utilisation : préférez les bacs des locaux poubelles.',
  'vide ordures sac déchet palier hygiène tri poubelle colonne',
  [
    ['Toujours en service, mais déconseillés', [
      'L’assemblée générale a refusé leur fermeture, la dernière fois le 28 juin 2024.',
      'Le conseil syndical recommande d’utiliser les bacs des locaux poubelles, qui permettent le tri.'
    ]],
    ['Si vous les utilisez', [
      'Petits sacs bien fermés uniquement.',
      'Jamais de verre, de carton, d’objet encombrant, de liquide ni de déchet dangereux.',
      'Odeur ou colonne bouchée : prévenez Homeland en indiquant l’entrée et l’étage. Ne tentez pas de déboucher vous-même.',
      'Les colonnes sont nettoyées et désinfectées deux fois par an.'
    ]]
  ],
  'AG du 28 juin 2024, résolutions 13.1 à 13.4 ; contrat d’entretien des colonnes.',
  ['dechets-et-encombrants', 'signaler-un-probleme']),

f('whatsapp', 'WhatsApp : résidents et conseil syndical', 'Vie quotidienne', 'message',
  'Un groupe pour les résidents, ouvert sur demande ; un autre réservé au conseil syndical.',
  'whatsapp groupe résident conseil syndical CS QR code rejoindre invitation administrateur',
  [
    ['Le groupe des résidents', [
      '« Residents Pont Colbert 4&4bis » sert à l’entraide et aux informations pratiques.',
      'Pour le rejoindre, utilisez le bouton ou le QR code de cette page. Un administrateur du conseil syndical valide votre demande.',
      'Vous rejoignez en même temps la communauté « Pont Colbert 4&4bis » et son groupe d’annonces.'
    ]],
    ['Les autres groupes', [
      'Le groupe du conseil syndical est réservé à ses membres.',
      'Un groupe de jardinage réunit les bénévoles des cuves fleuries : demandez à le rejoindre sur le groupe des résidents.'
    ]],
    ['Bon usage', [
      'Restez courtois et utile à tous.',
      'Un message WhatsApp ne remplace pas une demande à Homeland.',
      'Ne citez ni un voisin ni un numéro d’appartement.'
    ]]
  ],
  'Conseil syndical, octobre 2026.',
  ['conseil-syndical-et-syndic', 'signaler-un-probleme', 'jardins-et-vie-de-residence'],
  {links: [['Fonctionnement de l’approbation WhatsApp', 'https://faq.whatsapp.com/526742385997912/?cms_platform=web']]})
];
