import { STRINGS, VIEW_ORDER } from './strings.mjs';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  tour: '<path fill="currentColor" d="M4.6 4.2 1 8l3.6 3.8V9.2h6.8v2.6L15 8l-3.6-3.8v2.6H4.6Z"/>',
  floors: '<path fill="currentColor" d="M8 1.5 15 5 8 8.5 1 5Zm-5.3 6L8 10.2l5.3-2.7L15 8.4 8 12 1 8.4Zm0 3.3L8 13.5l5.3-2.7 1.7.9L8 15.3 1 11.7Z"/>',
  play: '<path fill="currentColor" d="M4 2.5v11l9-5.5Z"/>',
};
const svg = (name) => `<svg viewBox="0 0 16 16" aria-hidden="true">${ICONS[name]}</svg>`;

/**
 * Body markup of the 3D model.
 * mode 'page'  — stand-alone page: title card, note and dock over a full-window stage.
 * mode 'embed' — inside the residents' guide: same stage, dock and compass, without the
 *                title card and note (the page around it already carries them).
 */
export function maquetteMarkup(lang = 'fr', mode = 'page') {
  const T = STRINGS[lang] || STRINGS.fr;
  const embed = mode === 'embed';
  const title = `<header class="card title-card">
  <div class="eyebrow">${esc(T.eyebrow)}</div>
  <h1>4 &amp; 4<span class="bis">&#8239;bis</span> rue du Pont Colbert</h1>
  <div class="facts">
    <span>${esc(T.factLevels)}</span>
    <span>${esc(T.factFacade)} <b>≈ 53 m</b></span>
    <span class="opt">${esc(T.factFaces)} <b>NE 41°</b></span>
  </div>
</header>`;
  const note = `<p class="card note"><strong>${esc(T.noteStrong)}</strong> ${esc(T.note)}</p>`;
  const chips = VIEW_ORDER.map((v, i) => `<button class="chip" data-view="${v}" aria-pressed="false">${esc(T.views[v])} <span class="k">${i + 1}</span></button>`).join('\n    ');
  const seasons = ['winter', 'equinox', 'summer'].map((s) =>
    `<button role="radio" aria-checked="${s === 'summer'}" data-season="${s}" title="${esc(T.seasonTitles[s])}">${esc(T.seasons[s])}</button>`).join('\n      ');
  return `<div id="stage"><canvas id="c" tabindex="0" aria-label="${esc(T.canvas)}"></canvas><div id="labels"></div></div>

${embed ? `<h1 class="sr-only">${esc(T.srTitle)}</h1>` : title}

<div class="card compass" title="${esc(T.north)}">
  <svg viewBox="-30 -30 60 60" aria-hidden="true">
    <g class="dial" id="dial">
      <circle class="ring" r="25"></circle>
      <path class="needle-n" d="M0,-17 L4.5,0 L-4.5,0 Z"></path>
      <path class="needle-s" d="M0,17 L4.5,0 L-4.5,0 Z"></path>
      <text class="n" x="0" y="-19.5" text-anchor="middle">N</text>
      <text x="0" y="26.5" text-anchor="middle">S</text>
      <text x="23" y="3" text-anchor="middle">E</text>
      <text x="-23" y="3" text-anchor="middle">${lang === 'fr' ? 'O' : 'W'}</text>
    </g>
  </svg>
</div>

${embed ? '' : note}

<div id="landmarks"></div>

<nav class="card dock" aria-label="${esc(T.dock)}">
  <div class="row views" role="group" aria-label="${esc(T.viewGroup)}">
    <span class="row-label">${esc(T.viewLabel)}</span>
    ${chips}
  </div>
  <div class="row sun">
    <button class="tbtn" id="orbitBtn" aria-pressed="true" title="${esc(T.orbitTitle)}">
      ${svg('tour')}
      <span class="t">${esc(T.orbit)}</span>
    </button>
    <button class="tbtn" id="floorsBtn" aria-pressed="false" title="${esc(T.floorsTitle)}">
      ${svg('floors')}
      <span class="t">${esc(T.floors)}</span>
    </button>
    <span class="sep" aria-hidden="true"></span>
    <div class="seg" role="radiogroup" aria-label="${esc(T.seasonGroup)}">
      ${seasons}
    </div>
    <label class="time" for="time">
      <span class="row-label">${esc(T.sunLabel)}</span>
      <input type="range" id="time" min="5" max="22.5" step="0.0833" value="9.5" aria-label="${esc(T.sunSlider)}">
      <output id="timeOut" for="time">09:30</output>
    </label>
    <button class="tbtn" id="dayBtn" aria-pressed="false" title="${esc(T.dayTitle)}">
      ${svg('play')}
      <span class="t">${esc(T.day)}</span>
    </button>
    <span class="sunread" id="sunRead">—</span>
  </div>
</nav>

<div class="card hint" id="hint">${esc(T.hint)}</div>

<div class="loader" id="loader"><div class="inner"><div class="bar"><i></i></div><p id="loadMsg">${esc(T.loading)}</p></div></div>`;
}
