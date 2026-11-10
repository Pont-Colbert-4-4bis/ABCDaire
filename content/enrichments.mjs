// Depuis la relecture du 10 novembre 2026, tout le texte des fiches est dans articles.mjs.
// Cette fonction ne fait plus que classer les fiches par ordre alphabétique.
import {applyResidentReview} from './resident-review.mjs';
export function enrich(articles) {
  applyResidentReview(articles);
  articles.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
}
