// Current guidance approved by the project owner after the residents' review, 13 October 2026.
// Archival newsletter transcriptions remain unchanged.
export function applyResidentReview(articles) {
  const get = slug => articles.find(a => a.slug === slug);
  const add = (slug, title, items) => {
    const article = get(slug);
    const section = article.sections.find(([heading]) => heading === title);
    if (section) section[1].push(...items);
    else article.sections.push([title, items]);
  };
  const reported = ' Informations des résidents du 13 octobre 2026.';
  add('arriver-et-demenager', 'Avant votre arrivée', [
    'L’ABCDaire est accessible sans compte. Le propriétaire ou l’agence peut transmettre le lien du guide et l’affiche avec les deux QR codes avant la remise des clés.',
    'Les informations d’accès et les coordonnées personnelles sont transmises séparément, par les canaux privés. Pour les repères essentiels, consultez aussi la page Règles de vie.'
  ]);
  get('arriver-et-demenager').related.push('regles-de-vie');
  get('arriver-et-demenager').links = [['Affiche de la résidence — 2 QR codes', '/ABCDaire/assets/partage/affiche-hall-abcdaire-et-whatsapp.pdf'], ['Affiche et QR codes', '/ABCDaire/partager/']];
  get('balcons-et-fenetres').sections.find(([h])=>h==='Peintures, stores et protections')[1][0] = 'Avant de repeindre, demandez au syndic les références de peinture et les autorisations nécessaires pour préserver l’harmonie de la façade.';
  add('espaces-communs', 'Portes d’appartement et nettoyage des paliers', [
    'Préservez l’harmonie des portes d’appartement côté couloir. Avant de les repeindre ou de modifier leur aspect, faites préciser la teinte et les démarches applicables par le syndic, avec l’appui du CS.',
    'Les abords des portes d’appartement doivent rester dégagés pour permettre le nettoyage régulier des paliers et des moquettes.',
    'Le dossier PH Vision concerne uniquement la peinture des portes de garages du 4 bis. Il ne définit pas une référence de peinture pour les portes d’appartement.'
  ]);
  const reporting = [
    'Signalez le problème à Homeland depuis l’extranet. Vous pouvez aussi le signaler sur le groupe WhatsApp des résidents, avec une photo utile, ou à un membre du conseil syndical par WhatsApp.',
    'Indiquez le bâtiment, l’étage, l’emplacement précis, la date, les faits constatés et leur évolution. Évitez les photos montrant des personnes, des noms ou des documents privés ; transmettez les éléments personnels directement au destinataire concerné.',
    'Homeland organise le suivi et, si nécessaire, l’intervention sur les parties communes. Un signalement WhatsApp n’est pas une commande de travaux et ne garantit pas une prise en charge. Pour une urgence, utilisez les secours ou le dépannage adapté.'
  ];
  get('espaces-communs').sections.find(([h])=>h==='Signaler une dégradation')[1] = reporting;
  get('signaler-un-probleme').sections.find(([h])=>h==='Envoyer et suivre')[1] = [...reporting, 'Conservez la référence de la demande et complétez le même échange pour garder le suivi. Si vous êtes locataire, informez aussi votre propriétaire ou gestionnaire lorsque nécessaire.'];
  get('signaler-un-probleme').links = [['Extranet Homeland', 'https://extranet.homeland.immo/']];
  get('signaler-un-probleme').related.push('whatsapp');
  get('parking-et-stationnement').sections.splice(1, 0, ['Priorité au véhicule entrant', [
    'Le véhicule qui sort doit laisser la priorité au véhicule entrant déjà engagé dans l’accès. Attendez qu’il ait dégagé le passage avant de vous engager.',
    'Cette consigne évite d’obliger le véhicule entrant à reculer vers la rue en retraversant le trottoir, avec un risque pour les piétons. Pour le parking en sous-sol, un tel recul l’obligerait en plus à remonter la rampe en marche arrière.'
  ]]);
  get('parking-et-stationnement').keywords += ' priorité entrant sortant rampe sous-sol marche arrière';
  add('parking-et-stationnement', 'Peinture des portes de garages du 4 bis', ['Le dossier PH Vision porte uniquement sur la peinture des portes de garages du 4 bis. Pour le périmètre et le suivi de ces travaux, contactez Homeland. Ce dossier ne concerne pas les portes d’appartement.']);
  add('boites-aux-lettres', 'Commander une plaque aujourd’hui', [
    'L’ancien fournisseur TAN n’est plus disponible. Aucun nouveau prestataire n’est retenu à ce jour.',
    'Le PV du 13 avril 2016, résolution 31, indique une gravure noire sur fond blanc, en majuscules et, dans la mesure du possible, en Copperplate Gothic. Il mentionne « 10,5 × 2,8 × 0,8 cm ».',
    'Ces indications sont historiques : des échanges du CS de février 2025 contestent les mesures et la typographie diffusées. Elles ne constituent donc pas un modèle actuel de fabrication.'
  ]);
  get('boites-aux-lettres').source += ' PV du 13 avril 2016, résolution 31 ; échanges du CS de février 2025 ; situation du fournisseur précisée le 13 octobre 2026.';
  add('fuites-et-degats-des-eaux', 'Quel professionnel pour quelle fuite ?', [
    'Pour une fuite concernant les parties communes, contactez Homeland afin d’organiser le diagnostic et l’intervention.',
    'Tournois entretient la production collective d’eau chaude et le traitement d’eau. Ce rôle ne couvre pas automatiquement toute fuite privative ou tout dépannage de plomberie ; les réparations de fuite sont exclues du forfait d’entretien consulté.',
    'Pour une fuite dans votre logement, faites préciser le circuit avec votre assurance, votre propriétaire si vous êtes locataire, et le syndic si une partie commune peut être concernée.'
  ]);
  get('jardins-et-vie-de-residence').sections[0][1][1] = 'L’entretien professionnel des espaces verts est documenté au nom de Concept du Paysage : contrat de juin 2022 et suivi Homeland en 2026. Le détail des visites prévues figure dans la fiche de contrat.';
  add('jardins-et-vie-de-residence', 'Les bénévoles des cuves fleuries', [
    'Des résidents bénévoles entretiennent toute l’année les cuves de plantes et d’arbustes devant les entrées du 4 et du 4 bis.',
    'Ils se coordonnent dans un groupe WhatsApp de jardinage, signalent au conseil syndical les difficultés et proposent des améliorations. Pour participer, demandez une mise en relation par les canaux privés de la résidence.'
  ]);
  get('jardins-et-vie-de-residence').related.push('whatsapp');
  Object.assign(get('recharge-vehicules-electriques'), {
    intro: 'L’installation de recharge est en service. Pour équiper votre place, demandez un devis et une installation à Electro-Mob.',
    sections: [
      ['Une installation achevée et utilisée', ['L’installation est terminée et des propriétaires utilisent déjà leurs bornes.', 'Le Petit Colbert de février 2025 rapportait l’installation de huit bornes, terminée le 20 janvier 2025.']],
      ['Faire installer une borne sur sa place', ['Contactez directement Electro-Mob pour obtenir un devis et organiser la pose. Précisez la résidence, votre emplacement et vos besoins de recharge.', 'Demandez que le devis distingue le raccordement, la borne, la pose, les modalités de comptage et de paiement de l’électricité, les éventuels abonnements et les garanties. Pour les formalités concernant les parties communes, rapprochez-vous de Homeland.']],
      ['En cas de problème', ['Pour votre borne individuelle, contactez le SAV Electro-Mob en décrivant les symptômes et la référence de l’équipement. N’intervenez pas sur l’installation électrique.', 'Si plusieurs bornes sont touchées ou si le problème concerne l’infrastructure commune, informez également Homeland.']],
      ['Entretien et garanties', ['Les conditions de garantie et de SAV doivent être vérifiées dans votre devis ou contrat individuel.']]
    ],
    source: 'PV d’AG et Petit Colbert de février 2025, détaillés dans l’historique ; échanges de suivi Electro-Mob de janvier 2026 ; fonctionnement confirmé par un propriétaire équipé le 13 octobre 2026.',
    links: [['Electro-Mob : devis, installation et contact', 'https://www.electro-mob.com/']]
  });
  Object.assign(get('whatsapp'), {
    intro: 'Rejoignez le groupe des résidents après validation du conseil syndical. Le groupe de travail du CS reste réservé à ses membres.',
    sections: [
      ['Le groupe des résidents', ['« Residents Pont Colbert 4&4bis » rassemble les informations pratiques, l’entraide et la vie de la résidence. Utilisez le lien ou le QR code ci-dessous pour demander à le rejoindre.', 'L’approbation des nouveaux membres est activée pour les demandes envoyées par lien ou QR code. Les administrateurs du CS approuvent l’adhésion des résidents.', 'WhatsApp indique que rejoindre ce groupe vous ajoute aussi à la communauté « Pont Colbert 4&4bis » et à son groupe d’annonces. Cela ne donne pas accès au groupe réservé au conseil syndical.']],
      ['Le groupe du conseil syndical', ['Ce groupe de travail est réservé aux membres du conseil syndical en fonction. Il sert à coordonner les sujets et leur suivi.', 'Son invitation n’est pas publiée. L’accès est organisé en privé par les administrateurs du groupe.']],
      ['Jardinage et initiatives', ['Des résidents bénévoles se coordonnent aussi dans un groupe WhatsApp pour entretenir les cuves fleuries des deux entrées. Demandez une mise en relation par les canaux privés si vous souhaitez participer.']],
      ['Signaler et échanger avec attention', ['Vous pouvez signaler un problème sur le groupe des résidents, avec une photo utile, ou à un membre du CS par WhatsApp. Homeland reste responsable de l’organisation des interventions communes ; pour une urgence, utilisez le dépannage adapté ou les secours.', 'Gardez les échanges courtois et utiles. Demandez l’accord des personnes avant de diffuser leurs coordonnées ou leurs messages. Les documents personnels, informations d’accès et dossiers individuels se transmettent en privé.']]
    ],
    source: 'QR code du groupe fourni par un administrateur et destination vérifiée le 13 octobre 2026 ; approbation des nouveaux membres confirmée par l’administrateur à cette date ; aide officielle WhatsApp.',
    links: [['Fonctionnement de l’approbation WhatsApp', 'https://faq.whatsapp.com/526742385997912/?cms_platform=web']],
    related: ['conseil-syndical-et-syndic', 'signaler-un-probleme', 'jardins-et-vie-de-residence']
  });
  get('reemploi-et-compost').sections.find(([h])=>h==='Composter et participer')[1] = [
    'Deux lieux de compostage partagé sont mentionnés dans le magazine municipal de février–avril 2026 : la maison de quartier des Chantiers, 53 rue des Chantiers, et celle de Porchefontaine, 86 rue Yves-Le-Coz.',
    'Consultez Versailles Grand Parc et la maison de quartier pour les modalités d’inscription, les déchets acceptés et les horaires. Ces repères n’impliquent pas un accès libre permanent.',
    'Un référent résident peut vous aider à vous orienter. Demandez une mise en relation par les canaux privés de la résidence.'
  ];
  get('reemploi-et-compost').links = [['Compostage partagé : sites et modalités VGP', 'https://www.versaillesgrandparc.fr/1696/au-quotidien/en-route-vers-le-zero-dechet/composter-ses-biodechets/le-compostage-partage.htm'], ['Magazine de Versailles, février–avril 2026 : compostage page 31', 'https://www.versailles.fr/Statics/Kiosque/Magazines_de_la_Ville/2026/Magazine_fevrier_mars_avril_2026_complet.pdf']];
  get('reemploi-et-compost').source += ' Magazine municipal de février–avril 2026, p. 31 ; adresses des maisons de quartier vérifiées sur les sites municipaux en octobre 2026.';
  add('urgences', 'Extincteurs : inventaire de juin 2023', [
    'Le relevé Bouvier du 26 juin 2023 recense 16 appareils : un dans chacun des halls du 4 et du 4 bis, trois dans le parking désigné « 44 places » au niveau RC, sept dans le parking souterrain désigné « 50 places » au niveau −1, et quatre dans des locaux techniques.',
    'Les quatre appareils techniques sont repérés dans les machineries d’ascenseur au niveau +6 de chaque bâtiment, un local technique du 4 bis au −1 et un local électrique du parking souterrain. Ces locaux ne sont pas des accès ordinaires pour les résidents.',
    'Cet inventaire décrit la situation relevée en juin 2023. Pour trouver un appareil, suivez la signalétique et les consignes affichées sur place.',
    'En cas d’incendie, appelez le 18 ou le 112 et suivez les consignes des secours et de l’immeuble. Ne retardez pas l’alerte pour chercher un appareil.'
  ]);
  get('urgences').source += ' Inventaire Bouvier, intervention du 26 juin 2023, 16 extincteurs ; contrat accepté le 24 octobre 2023.';
  Object.assign(get('vide-ordures'), {
    intro: 'Les vide-ordures restent en service, mais le conseil syndical déconseille leur utilisation et invite à privilégier les bacs des locaux poubelles.',
    sections: [
      ['Un maintien après le rejet de la fermeture', ['L’AG du 28 juin 2024 a rejeté la suppression des vide-ordures et les résolutions associées 13.1 à 13.4. Les propositions antérieures figurent dans l’historique.', 'Les vide-ordures restent en service. Le conseil syndical recommande de privilégier les bacs des locaux poubelles.']],
      ['Hygiène et entretien', ['Sicre Lemaire assure le nettoyage et la désinfection des colonnes. Le contrat archivé prévoit deux interventions par an ; le suivi Homeland comporte un passage contractuel en novembre 2025 et un rapport de mai 2026.', 'Privilégiez les bacs de déchets adaptés et le tri. En cas d’utilisation du vide-ordures, respectez l’affichage et utilisez de petits sacs fermés : pas de verre, d’objet encombrant, de gravats ni de déchet dangereux.']],
      ['Repérage et signalement', ['Le rapport de contrôle des portes de juillet 2025 mentionne des locaux vide-ordures du rez-de-chaussée au 6e étage dans les deux bâtiments.', 'En cas d’odeur, de blocage ou de défaut, signalez le bâtiment et l’étage à Homeland, éventuellement avec le relais du CS par WhatsApp. Ne tentez pas de déboucher la colonne vous-même.']]
    ],
    source: 'PV AG du 28 juin 2024, résolutions 13.1 à 13.4 ; contrat Sicre Lemaire de 2012 ; suivi Homeland de novembre 2025 et mai 2026 ; rapport de contrôle des portes de juillet 2025 ; état de service et recommandation du CS rapportés le 13 octobre 2026.'
  });
  articles.push({
    slug: 'regles-de-vie', title: 'Règles de vie', letter: 'R', category: 'Vie quotidienne', icon: 'people',
    intro: 'Les repères du quotidien pour prendre soin des espaces communs et bien vivre entre voisins.',
    keywords: 'règlement règles vie bon voisinage accueil respect porte moquette bruit déchets',
    sections: [
      ['Circulations, portes et propreté', ['Laissez libres les halls, escaliers, paliers, accès et abords des portes d’appartement, notamment pour le nettoyage des moquettes. Ne stockez pas d’objets dans les passages.', 'Préservez l’aspect commun des portes côté couloir. Demandez la teinte et les démarches applicables avant une modification. Ne bloquez pas les portes coupe-feu ni les fermetures des accès.']],
      ['Bruit et voisinage', ['Limitez les bruits transmis : patins sous les meubles, déplacements discrets et attention aux appareils sonores. Prévenez les voisins avant une fête ou des travaux bruyants.', 'Pour les horaires de travaux, vérifiez les règles actuelles de la Ville et de la copropriété.']],
      ['Déménagements et travaux', ['Protégez les sols et l’ascenseur, respectez la charge affichée, gardez les passages libres et nettoyez après votre intervention.', 'Avant un projet touchant aux parties communes ou à l’aspect extérieur, demandez au syndic les démarches et autorisations nécessaires. Les informations d’accès se transmettent en privé.']],
      ['Déchets, tri et vide-ordures', ['Utilisez les bacs et filières adaptés. Vérifiez le calendrier de collecte et les modalités des encombrants avant de déposer un objet ; ne laissez rien dans les circulations.', 'Le CS déconseille l’utilisation des vide-ordures. Leur fermeture ayant été rejetée en AG, ils restent entretenus ; privilégiez les locaux poubelles et le tri.']],
      ['Parkings et espaces verts', ['Gardez libres les accès et les circulations, utilisez les emplacements prévus et ne manipulez pas les mécanismes des portes de parking. À la sortie, laissez la priorité au véhicule entrant déjà engagé dans l’accès : il ne doit pas être contraint de retraverser le trottoir en marche arrière pour revenir sur la rue, avec un risque pour les piétons, ni, pour le sous-sol, de remonter la rampe à reculons.', 'Respectez les plantations. Les bénévoles des cuves fleuries se coordonnent en privé ; présentez au CS les idées de modification ou d’animation des espaces communs.']],
      ['Signaler et prendre soin des informations', ['Pour une anomalie, précisez le bâtiment, l’étage, le lieu, la date et les faits à Homeland. WhatsApp, avec une photo utile, ou un membre du CS peut aussi relayer le signalement.', 'Un signalement ne vaut pas commande aux frais de la copropriété. En cas de danger immédiat, appelez les secours.', 'Ne publiez pas de coordonnées personnelles, de codes d’accès, de documents individuels ou de photos identifiantes sans accord.']]
    ],
    source: 'Fiches de l’ABCDaire et informations des résidents du 13 octobre 2026 ; AG du 14 mai 2013, résolution 24. Les documents de copropriété et les décisions d’AG font référence.',
    related: ['arriver-et-demenager', 'espaces-communs', 'bruit-et-voisinage', 'dechets-et-encombrants', 'signaler-un-probleme'],
    links: [['Affiche de la résidence — 2 QR codes', '/ABCDaire/assets/partage/affiche-hall-abcdaire-et-whatsapp.pdf']]
  });
  for (const slug of ['arriver-et-demenager','balcons-et-fenetres','espaces-communs','signaler-un-probleme','parking-et-stationnement','fuites-et-degats-des-eaux','jardins-et-vie-de-residence']) get(slug).source += reported;
  articles.sort((a,b)=>a.title.localeCompare(b.title,'fr'));
}
