// Fiches de synthèse A5. Depuis la relecture du 10 novembre 2026, elles reprennent le texte des
// fiches du guide (articles.mjs) : une seule rédaction à tenir à jour.
import {articles} from './articles.mjs';
export const printEdition = '10 novembre 2026';
const printContacts = {
  'ascenseurs': ['ascenseurs', 'syndic'],
  'urgences': ['syndic', 'ascenseurs'],
  'recharge-vehicules-electriques': ['recharge', 'syndic'],
  'dechets-et-encombrants': ['dechets', 'syndic']
};
// Nombre de rubriques et de points repris par fiche, réglé pour tenir sur une page A5.
const caps = {"arriver-et-demenager": [2, 2], "ascenseurs": [4, 2], "balcons-et-fenetres": [2, 2], "bruit-et-voisinage": [4, 2], "chauffage-et-trames": [2, 2], "conseil-syndical-et-syndic": [2, 2], "dechets-et-encombrants": [4, 2], "eau-chaude-et-compteurs": [4, 2], "espaces-communs": [3, 3], "fuites-et-degats-des-eaux": [4, 2], "jardins-et-vie-de-residence": [4, 2], "regles-de-vie": [3, 3], "signaler-un-probleme": [4, 2], "travaux-privatifs": [3, 3], "urgences": [4, 2], "whatsapp": [4, 2]};
export const printSummaries = Object.fromEntries(articles.map(a => {
  const [maxSections, maxItems] = caps[a.slug] || [4, 3];
  return [a.slug, {
    contacts: printContacts[a.slug] || ['syndic'],
    sections: a.sections.slice(0, maxSections).map(([heading, items]) => [heading, items.slice(0, maxItems)])
  }];
}));
