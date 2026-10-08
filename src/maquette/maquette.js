import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STRINGS, VIEW_ORDER } from './strings.mjs';

/* =====================================================================
   Villa Colbert — 4 & 4 bis rue du Pont Colbert, Versailles — procedural 3D model.
   One source for the residents' guide (embedded, French) and the stand-alone page (English).
   Approximate: traced from Street View (Feb 2026), aerial imagery and residents' corrections.
   World frame: origin at the east corner of the slab (street façade x SE gable)
   at pavement level. +x runs along the street façade towards the north-west,
   +z points from the façade towards the street (north-east), +y is up.
   ===================================================================== */

const $ = (s) => document.querySelector(s);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
// the stand-alone copy can set window.__colbertLang before this module runs; otherwise <html lang> decides
const LANG = String(window.__colbertLang || document.documentElement.lang || 'en').slice(0, 2) === 'fr' ? 'fr' : 'en';
const T = STRINGS[LANG];
// ?mode=hero — compact frame on the guide's home page (page scroll kept, no wheel zoom)
// ?mode=explore — the guide's enlarged viewer. No mode: stand-alone page with an opening fly-in.
const MODE = new URLSearchParams(location.search).get('mode');
const HERO = MODE === 'hero';
const EMBED = HERO || MODE === 'explore' || document.documentElement.classList.contains('embed');
if (EMBED) document.documentElement.classList.add('embed');
if (HERO) document.documentElement.classList.add('hero');
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------ randomness
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash3(x, y, z, seed) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1274126177) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function vnoise3(x, y, z, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const h = (a, b, c) => hash3(xi + a, yi + b, zi + c, seed);
  const a0 = lerp(lerp(h(0, 0, 0), h(1, 0, 0), u), lerp(h(0, 1, 0), h(1, 1, 0), u), v);
  const a1 = lerp(lerp(h(0, 0, 1), h(1, 0, 1), u), lerp(h(0, 1, 1), h(1, 1, 1), u), v);
  return lerp(a0, a1, w);
}
function fbm2(x, y, oct = 4, seed = 0) {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { s += a * vnoise3(x * f, y * f, 0.37, seed + i * 31); n += a; f *= 2; a *= 0.5; }
  return s / n;
}
function tnoise(x, y, p, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const m = (a) => ((a % p) + p) % p;
  const h = (a, b) => hash3(m(xi + a), m(yi + b), 7, seed);
  return lerp(lerp(h(0, 0), h(1, 0), u), lerp(h(0, 1), h(1, 1), u), v);
}
function tfbm(x, y, p, oct, seed) {
  let s = 0, a = 0.5, n = 0, f = 1;
  for (let i = 0; i < oct; i++) { s += a * tnoise(x * f, y * f, p * f, seed + i * 13); n += a; a *= 0.5; f *= 2; }
  return s / n;
}

// ------------------------------------------------------------ geometry bag
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const neg = (a) => [-a[0], -a[1], -a[2]];

function puv(p, n) {
  if (Math.abs(n[1]) > 0.7) return [p[0], p[2]];
  const t = nrm([-n[2], 0, n[0]]);
  return [p[0] * t[0] + p[2] * t[2], p[1]];
}

class Bag {
  constructor() { this.p = []; this.n = []; this.uv = []; this.col = null; }
  tri(a, b, c, nd, col) {
    let n = nrm(cross(sub(b, a), sub(c, a)));
    if (nd && dot(n, nd) < 0) { const t = b; b = c; c = t; n = neg(n); }
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    this.n.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
    const ua = puv(a, n), ub = puv(b, n), uc = puv(c, n);
    this.uv.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]);
    if (col) { (this.col ||= []).push(col[0], col[1], col[2], col[0], col[1], col[2], col[0], col[1], col[2]); }
  }
  quad(a, b, c, d, nd, col) {
    let n = nrm(cross(sub(b, a), sub(d, a)));
    if (nd && dot(n, nd) < 0) { const t = b; b = d; d = t; n = neg(n); }
    this.tri(a, b, c, n, col); this.tri(a, c, d, n, col);
  }
  box(cx, cy, cz, sx, sy, sz, ry = 0, skipBottom = false) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2, c = Math.cos(ry), s = Math.sin(ry);
    const P = (x, y, z) => [cx + x * c + z * s, cy + y, cz - x * s + z * c];
    const R = (x, z) => [x * c + z * s, 0, -x * s + z * c];
    const v = [P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, hy, -hz), P(-hx, hy, -hz), P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz)];
    this.quad(v[4], v[5], v[6], v[7], R(0, 1));
    this.quad(v[1], v[0], v[3], v[2], R(0, -1));
    this.quad(v[5], v[1], v[2], v[6], R(1, 0));
    this.quad(v[0], v[4], v[7], v[3], R(-1, 0));
    this.quad(v[3], v[7], v[6], v[2], [0, 1, 0]);
    if (!skipBottom) this.quad(v[0], v[1], v[5], v[4], [0, -1, 0]);
  }
  boxAB(x0, y0, z0, x1, y1, z1, skipBottom = false) {
    this.box((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), 0, skipBottom);
  }
  segBox(x0, z0, x1, z1, ya, yb, t, ext = 0) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
    this.box((x0 + x1) / 2, (ya + yb) / 2, (z0 + z1) / 2, L + 2 * ext, yb - ya, t, Math.atan2(-dz, dx));
  }
  // convex polygon prism, pts = [[x,z],...]
  prism(pts, ya, yb, sides = true, bottom = true) {
    const n = pts.length; let cx = 0, cz = 0;
    for (const p of pts) { cx += p[0] / n; cz += p[1] / n; }
    for (let i = 1; i < n - 1; i++) {
      this.tri([pts[0][0], yb, pts[0][1]], [pts[i][0], yb, pts[i][1]], [pts[i + 1][0], yb, pts[i + 1][1]], [0, 1, 0]);
      if (bottom) this.tri([pts[0][0], ya, pts[0][1]], [pts[i][0], ya, pts[i][1]], [pts[i + 1][0], ya, pts[i + 1][1]], [0, -1, 0]);
    }
    if (sides) for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const mx = (a[0] + b[0]) / 2 - cx, mz = (a[1] + b[1]) / 2 - cz;
      this.quad([a[0], ya, a[1]], [b[0], ya, b[1]], [b[0], yb, b[1]], [a[0], yb, a[1]], [mx, 0, mz]);
    }
  }
  // extrude a polygon given in (z,y) between x0 and x1 (convex)
  extrudeX(x0, x1, poly) {
    const n = poly.length; let cz = 0, cy = 0;
    for (const p of poly) { cz += p[0] / n; cy += p[1] / n; }
    for (let i = 1; i < n - 1; i++) {
      this.tri([x0, poly[0][1], poly[0][0]], [x0, poly[i][1], poly[i][0]], [x0, poly[i + 1][1], poly[i + 1][0]], [-1, 0, 0]);
      this.tri([x1, poly[0][1], poly[0][0]], [x1, poly[i][1], poly[i][0]], [x1, poly[i + 1][1], poly[i + 1][0]], [1, 0, 0]);
    }
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n];
      this.quad([x0, a[1], a[0]], [x1, a[1], a[0]], [x1, b[1], b[0]], [x0, b[1], b[0]], [0, (a[1] + b[1]) / 2 - cy, (a[0] + b[0]) / 2 - cz]);
    }
  }
  cyl(p0, p1, r0, r1, seg = 6, caps = false, col) {
    const ax = nrm(sub(p1, p0));
    const tmp = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = nrm(cross(ax, tmp)), v = cross(ax, u);
    const ring = (p, r, a) => [p[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r, p[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r, p[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r];
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2, am = (a0 + a1) / 2;
      const nd = [u[0] * Math.cos(am) + v[0] * Math.sin(am), u[1] * Math.cos(am) + v[1] * Math.sin(am), u[2] * Math.cos(am) + v[2] * Math.sin(am)];
      this.quad(ring(p0, r0, a0), ring(p0, r0, a1), ring(p1, r1, a1), ring(p1, r1, a0), nd, col);
      if (caps) {
        this.tri(p1, ring(p1, r1, a0), ring(p1, r1, a1), ax, col);
        this.tri(p0, ring(p0, r0, a1), ring(p0, r0, a0), neg(ax), col);
      }
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    if (this.col) g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeBoundingSphere();
    return g;
  }
}

// ------------------------------------------------------------ textures
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function finish(c, { srgb = true, tile = 1, tileY } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / tile, 1 / (tileY || tile));
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}
function pixelTex(size, fn, opts) {
  const c = canvas(size, size), g = c.getContext('2d'), img = g.createImageData(size, size), d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = fn(x / size, y / size, x, y), i = (y * size + x) * 4;
    d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return finish(c, opts);
}

const TEX = {};
function makeTextures() {
  // render (enduit): soft mottling, linear multiplier
  TEX.render = pixelTex(256, (u, v) => {
    const n = tfbm(u * 6, v * 6, 6, 4, 11), f = tnoise(u * 48, v * 48, 48, 5);
    const streak = tnoise(u * 24, v * 1.5, 24, 9);
    const val = 241 + (n - 0.5) * 22 + (f - 0.5) * 9 - Math.max(0, streak - 0.62) * 22;
    return [val, val, val];
  }, { srgb: false, tile: 4 });
  // gravel: the roof and the 6th-floor terrace are covered with rounded river pebbles, beige to brown
  // with a few white and grey stones (photo from the terrace, Oct 2026). Worley cells = pebbles.
  {
    const N = 512, CELL = 8, G = N / CELL, gr = rng(4242), pts = [];
    const PEB = ['#cdb89d', '#b9a185', '#a58c72', '#ddd0bd', '#93806d', '#e9e1d4', '#ae9a85', '#857464', '#c4ad8e', '#9d9184']
      .map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) pts.push([(i + 0.15 + gr() * 0.7) * CELL, (j + 0.15 + gr() * 0.7) * CELL, (gr() * PEB.length) | 0, 0.85 + gr() * 0.3]);
    TEX.gravel = pixelTex(N, (u, v, x, y) => {
      const ci = Math.floor(x / CELL), cj = Math.floor(y / CELL);
      let d1 = 1e9, d2 = 1e9, best = null;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const ii = (ci + di + G) % G, jj = (cj + dj + G) % G, q = pts[jj * G + ii];
        const dx = x - (q[0] + (ci + di - ii) * CELL), dy = y - (q[1] + (cj + dj - jj) * CELL), d = dx * dx + dy * dy;
        if (d < d1) { d2 = d1; d1 = d; best = q; } else if (d < d2) d2 = d;
      }
      const edge = clamp((Math.sqrt(d2) - Math.sqrt(d1)) / 2.2, 0, 1);   // dark gaps between pebbles
      const c = PEB[best[2]], k = best[3] * (0.45 + 0.55 * edge) * (1 - 0.18 * Math.sqrt(d1) / CELL);
      return [c[0] * k, c[1] * k, c[2] * k].map((n) => Math.min(255, n));
    }, { tile: 1.8 });
  }
  // concrete
  TEX.concrete = pixelTex(256, (u, v) => {
    const n = tfbm(u * 8, v * 8, 8, 4, 21), f = tnoise(u * 90, v * 90, 90, 3);
    const val = 232 + (n - 0.5) * 34 + (f - 0.5) * 18;
    return [val, val, val];
  }, { srgb: false, tile: 3 });
  // asphalt
  TEX.asphalt = pixelTex(256, (u, v) => {
    const n = tfbm(u * 5, v * 5, 5, 4, 31), f = tnoise(u * 128, v * 128, 128, 7);
    const val = 218 + (n - 0.5) * 40 + (f - 0.5) * 50;
    return [val, val, val];
  }, { srgb: false, tile: 7 });
  // grass
  TEX.grass = pixelTex(256, (u, v) => {
    const n = tfbm(u * 6, v * 6, 6, 4, 41), f = tnoise(u * 100, v * 100, 100, 8);
    const val = 225 + (n - 0.5) * 50 + (f - 0.5) * 40;
    return [val * 0.98, val, val * 0.95];
  }, { srgb: false, tile: 9 });
  // curtains: vertical folds
  TEX.curtain = pixelTex(128, (u, v) => {
    const fold = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 9 + Math.sin(u * 20) * 0.8);
    const val = 222 + fold * 30 - Math.max(0, v - 0.93) * 120;
    return [val, val, val - 4];
  }, { srgb: false, tile: 1.3 });
  // cobbles
  {
    const c = canvas(256, 256), g = c.getContext('2d'), r = rng(5);
    g.fillStyle = '#6f6a63'; g.fillRect(0, 0, 256, 256);
    const s = 16;
    for (let y = 0; y < 256; y += s) for (let x = -s; x < 256; x += s) {
      const ox = (y / s) % 2 ? s / 2 : 0, l = 120 + r() * 50, h = r() * 12;
      g.fillStyle = `rgb(${l + h},${l + h * 0.6},${l - 6})`;
      const px = x + ox + 1.5, py = y + 1.5, w = s - 3;
      g.beginPath(); g.roundRect ? g.roundRect(px, py, w, w, 4) : g.rect(px, py, w, w); g.fill();
    }
    TEX.cobble = finish(c, { tile: 2.2 });
  }
  // meulière (millstone rubble)
  {
    const c = canvas(512, 512), g = c.getContext('2d'), r = rng(9);
    g.fillStyle = '#8a7a63'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      const x = r() * 512, y = r() * 512, w = 14 + r() * 34, h = 10 + r() * 22;
      const t = r();
      const col = t < 0.4 ? [146 + r() * 30, 112 + r() * 20, 74 + r() * 16] : t < 0.75 ? [170 + r() * 25, 140 + r() * 20, 96 + r() * 18] : [120 + r() * 25, 96 + r() * 18, 70 + r() * 14];
      g.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
      g.beginPath();
      const k = 5 + (r() * 3 | 0);
      for (let j = 0; j < k; j++) { const a = (j / k) * Math.PI * 2; const rr = 0.75 + r() * 0.3; g.lineTo(x + Math.cos(a) * w * 0.5 * rr, y + Math.sin(a) * h * 0.5 * rr); }
      g.closePath(); g.fill();
      for (const dx of [-512, 512]) { g.save(); g.translate(dx, 0); g.fill(); g.restore(); }
    }
    TEX.meuliere = finish(c, { tile: 2.6 });
  }
  // slate
  {
    const c = canvas(256, 256), g = c.getContext('2d'), r = rng(12);
    g.fillStyle = '#3b4148'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 16) for (let x = 0; x < 256; x += 22) {
      const ox = (y / 16) % 2 ? 11 : 0, l = 52 + r() * 18;
      g.fillStyle = `rgb(${l},${l + 5},${l + 12})`; g.fillRect(x + ox, y, 20, 14);
    }
    TEX.slate = finish(c, { tile: 2.5 });
  }
  // garage doors: vertical ventilation slats across the top third, plain panels below
  {
    const c = canvas(256, 160), g = c.getContext('2d');
    g.fillStyle = '#ecebe6'; g.fillRect(0, 0, 256, 160);
    for (let y = 64; y < 160; y += 12) { g.fillStyle = '#cfcdc6'; g.fillRect(0, y, 256, 1.5); }
    g.fillStyle = '#d8d6cf'; g.fillRect(0, 54, 256, 6);
    for (let x = 3; x < 256; x += 9) { g.fillStyle = '#3c4044'; g.fillRect(x, 5, 4, 46); }
    TEX.garageV = finish(c, { tile: 1 }); TEX.garageV.repeat.set(1, 1);
    TEX.garageV.wrapS = TEX.garageV.wrapT = THREE.ClampToEdgeWrapping;
  }
  // chain-link mesh (alpha-tested)
  {
    const c = canvas(64, 64), g = c.getContext('2d');
    g.strokeStyle = '#4a4e52'; g.lineWidth = 3;
    for (let k = -64; k <= 128; k += 32) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 64, 64); g.stroke();
      g.beginPath(); g.moveTo(k, 64); g.lineTo(k + 64, 0); g.stroke();
    }
    TEX.fence = finish(c, { tile: 0.2 });
  }
  // house numbers: the black "4" on the corner planter, No. 6's blue enamel plate
  {
    const c = canvas(128, 128), g = c.getContext('2d');
    g.fillStyle = '#17191b'; g.font = '700 108px "Manrope Variable", Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('4', 64, 70);
    TEX.sign4 = finish(c, { tile: 1 }); TEX.sign4.repeat.set(1, 1);
  }
  {
    const c = canvas(128, 96), g = c.getContext('2d');
    g.fillStyle = '#eef0ee'; g.fillRect(0, 0, 128, 96);
    g.fillStyle = '#1c3e7a'; g.fillRect(5, 5, 118, 86);
    g.strokeStyle = '#eef0ee'; g.lineWidth = 3; g.strokeRect(12, 12, 104, 72);
    g.fillStyle = '#eef0ee'; g.font = '600 60px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('6', 64, 51);
    TEX.plate6 = finish(c, { tile: 1 }); TEX.plate6.repeat.set(1, 1);
  }
  // glass curtain wall (neighbour stair tower)
  {
    const c = canvas(128, 128), g = c.getContext('2d');
    g.fillStyle = '#5d7488'; g.fillRect(0, 0, 128, 128);
    const grd = g.createLinearGradient(0, 0, 128, 128); grd.addColorStop(0, 'rgba(255,255,255,0.20)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#e9ebea'; g.fillRect(0, 0, 128, 5); g.fillRect(0, 0, 5, 128); g.fillRect(62, 0, 4, 128);
    TEX.curtainWall = finish(c, { tile: 2.6, tileY: 3.0 });
  }
  // bus shelter poster + stop name
  {
    const c = canvas(128, 256), g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256); grd.addColorStop(0, '#2c5f8a'); grd.addColorStop(1, '#e7a65a');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 256);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(64, 96, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d2b36'; g.fillRect(16, 180, 96, 10); g.fillRect(16, 198, 70, 8);
    TEX.poster = finish(c, { tile: 1 }); TEX.poster.repeat.set(1, 1);
  }
  {
    const c = canvas(256, 48), g = c.getContext('2d');
    g.fillStyle = '#26352c'; g.fillRect(0, 0, 256, 48);
    g.fillStyle = '#f2f2ee'; g.font = '600 30px "Manrope Variable", Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Sarraut', 128, 26);
    TEX.stopName = finish(c, { tile: 1 }); TEX.stopName.repeat.set(1, 1);
  }
}

// ------------------------------------------------------------ materials
const M = {};
function makeMaterials() {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  M.wall = std({ color: 0xe3ddd0, map: TEX.render, roughness: 0.94 });
  M.orange = std({ color: 0xe0936a, map: TEX.render, roughness: 0.9 });   // soft salmon-orange (photo)
  M.reveal = std({ color: 0xbdb7ac, map: TEX.render, roughness: 0.95 });
  M.sill = std({ color: 0xd2cdc3, roughness: 0.8 });
  M.slab = std({ color: 0xd8d2c6, map: TEX.render, roughness: 0.95 });
  M.soffit = std({ color: 0x8e887d, map: TEX.render, roughness: 0.98 });
  M.frame = std({ color: 0xf3f2ee, roughness: 0.55 });
  M.flashing = std({ color: 0xe1d9c8, map: TEX.concrete, roughness: 0.8 });   // cream stone copings (photo)
  M.glass = std({ color: 0x6f7f8e, roughness: 0.1, metalness: 0.92, envMapIntensity: 1.0 });
  M.glassLit = std({ color: 0x6f7f8e, roughness: 0.1, metalness: 0.92, envMapIntensity: 1.0, emissive: 0xffb76b, emissiveIntensity: 0 });
  M.curtain = std({ color: 0xb4b8b9, map: TEX.curtain, roughness: 0.42, metalness: 0.25, envMapIntensity: 0.6 });
  M.curtainLit = std({ color: 0xb4b8b9, map: TEX.curtain, roughness: 0.42, metalness: 0.25, envMapIntensity: 0.6, emissive: 0xffc98f, emissiveMap: TEX.curtain, emissiveIntensity: 0 });
  M.metal = std({ color: 0x34383c, roughness: 0.45, metalness: 0.55 });
  M.cabinet = std({ color: 0xe6e0d2, roughness: 0.6 });
  M.duct = std({ color: 0xb9bdc0, roughness: 0.4, metalness: 0.6 });   // galvanised VMC ducts and fans
  M.roof = std({ color: 0xffffff, map: TEX.gravel, roughness: 1 });
  M.concrete = std({ color: 0xd3cec4, map: TEX.concrete, roughness: 0.95 });
  M.darkConcrete = std({ color: 0x9d988f, map: TEX.concrete, roughness: 1 });
  M.asphalt = std({ color: 0x4a4c4f, map: TEX.asphalt, roughness: 0.97 });
  M.pavement = std({ color: 0x7f7f7d, map: TEX.asphalt, roughness: 0.96 });
  M.redway = std({ color: 0x8f6355, map: TEX.asphalt, roughness: 0.96 });
  M.curb = std({ color: 0xb5b2ab, map: TEX.concrete, roughness: 0.85 });
  M.cobble = std({ color: 0xffffff, map: TEX.cobble, roughness: 0.92 });
  M.white = std({ color: 0xf1f1ee, roughness: 0.6 });
  M.yellow = std({ color: 0xe5b52c, roughness: 0.6 });
  M.soil = std({ color: 0x5b4d3c, map: TEX.grass, roughness: 1 });
  M.mulch = std({ color: 0xa88a66, map: TEX.gravel, roughness: 1 });
  M.granite = std({ color: 0xc9c6bf, map: TEX.concrete, roughness: 0.85 });
  M.graniteDark = std({ color: 0xaeaba4, map: TEX.concrete, roughness: 0.85 });
  M.grass = std({ color: 0x4f6b3a, roughness: 0.9 });
  M.lawn = std({ color: 0x6c8a4a, map: TEX.grass, roughness: 1 });
  M.ground = std({ vertexColors: true, map: TEX.grass, roughness: 1 });
  M.hedge = std({ vertexColors: true, roughness: 0.95, flatShading: true });
  M.bark = std({ color: 0x5a5047, roughness: 1 });
  M.leaf = std({ color: 0xffffff, vertexColors: true, roughness: 0.9 });
  M.leafDark = std({ color: 0x3a5530, roughness: 0.95, flatShading: true });
  M.garageDoor = std({ color: 0xffffff, map: TEX.garageV, roughness: 0.5, metalness: 0.15 });
  M.garageDoorLow = std({ color: 0xc4c8cb, map: TEX.garageV, roughness: 0.5, metalness: 0.15 });
  M.railLight = std({ color: 0xf0eee8, roughness: 0.5, metalness: 0.1 });   // white-painted railings (photos)
  M.fence = std({ color: 0x8d9296, map: TEX.fence, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 });
  M.ramp = std({ color: 0xa39c92, map: TEX.asphalt, roughness: 0.95 });   // light grey asphalt (photo)
  M.paving = std({ color: 0x9c9890, map: TEX.concrete, roughness: 0.92 });
  M.stone = std({ color: 0xb09a86, map: TEX.concrete, roughness: 0.85 });
  M.bin = std({ color: 0x5e3b27, roughness: 0.7 });
  M.sign4 = std({ color: 0xffffff, map: TEX.sign4, transparent: true, alphaTest: 0.3, roughness: 0.6 });
  M.plate6 = std({ color: 0xffffff, map: TEX.plate6, roughness: 0.35, metalness: 0.1 });
  M.brown = std({ color: 0x5a4434, roughness: 0.55, metalness: 0.35 });
  M.shelter = std({ color: 0x2f3d34, roughness: 0.5, metalness: 0.4 });
  M.shelterGlass = new THREE.MeshPhysicalMaterial({ color: 0xcfe0ea, roughness: 0.05, metalness: 0, transmission: 0, transparent: true, opacity: 0.22, depthWrite: false });
  M.poster = std({ color: 0xffffff, map: TEX.poster, emissive: 0xffffff, emissiveMap: TEX.poster, emissiveIntensity: 0.35, roughness: 0.4 });
  M.stopName = std({ color: 0xffffff, map: TEX.stopName, roughness: 0.6 });
  M.lampHead = std({ color: 0x3c3a36, roughness: 0.5, metalness: 0.4, emissive: 0xffd39a, emissiveIntensity: 0 });
  M.meuliere = std({ color: 0xffffff, map: TEX.meuliere, roughness: 0.95 });
  M.brick = std({ color: 0x9b5440, map: TEX.concrete, roughness: 0.9 });
  M.slate = std({ color: 0xffffff, map: TEX.slate, roughness: 0.75 });
  M.cladding = std({ color: 0xece9e1, map: TEX.concrete, roughness: 0.8 });
  M.curtainWall = std({ color: 0xffffff, map: TEX.curtainWall, roughness: 0.15, metalness: 0.5, envMapIntensity: 1.1 });
  M.bgRoof = std({ color: 0x7c7a76, roughness: 1 });
  M.hydrant = std({ color: 0xd2492c, roughness: 0.55 });
  M.tyre = std({ color: 0x1e1f21, roughness: 0.9 });
  M.carGlass = std({ color: 0x18202a, roughness: 0.1, metalness: 0.7 });
  M.dim = new THREE.LineBasicMaterial({ color: 0xb9592e, depthTest: false, transparent: true, opacity: 0.95 });
  M.dimSoft = new THREE.LineDashedMaterial({ color: 0xb9592e, depthTest: true, transparent: true, opacity: 0.85, dashSize: 0.6, gapSize: 0.4 });
}

// ------------------------------------------------------------ scene setup
const canvasEl = $('#c');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  $('#loadMsg').className = 'err';
  $('#loadMsg').textContent = T.errWebgl;
  document.documentElement.classList.add('is-failed');
  throw e;
}
const SMALL = Math.min(innerWidth, innerHeight) < 700;
renderer.setPixelRatio(Math.min(devicePixelRatio, SMALL ? 1.75 : 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;        // static scene: shadows are redrawn only when the sun or season changes
renderer.shadowMap.needsUpdate = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.4, 3000);
scene.fog = new THREE.Fog(0xd4e1ec, 140, 640);

makeTextures();
makeMaterials();

// bags per material
const BG = {};
const bag = (k) => (BG[k] ||= new Bag());
const SHADOWLESS = new Set(['glass', 'glassLit', 'curtain', 'curtainLit', 'frame', 'yellow', 'white', 'redway', 'poster', 'stopName', 'fence']);
function flushBags(group, receiveOnly = []) {
  for (const [k, b] of Object.entries(BG)) {
    if (!b.p.length) continue;
    const mesh = new THREE.Mesh(b.geometry(), M[k]);
    mesh.castShadow = !SHADOWLESS.has(k) && !receiveOnly.includes(k);
    mesh.receiveShadow = true;
    mesh.name = k;
    group.add(mesh);
    delete BG[k];
  }
}

/* =====================================================================
   BUILDING
   ===================================================================== */
const FH = 2.75;          // floor to floor
const RDC = 1.40;         // raised ground floor above the pavement
const LV = (k) => RDC + FH * k;
const SILL = 0.95, HEAD = 2.12, REV = 0.11;
const TOP_SLAB = LV(6), TOP_WING = LV(7);
// SE end: garage block with two street-facing entrances, roof terrace, 4 bis porch
const GF = -10.5;                 // garage front line (z)
const GX0 = -12.4;                // SE edge of the garage block / retaining wall outer face
const T_TOP = 3.7, T_BOT = 2.45;  // terrace slab top / underside along the front
const UP = 0.35, LOW = -2.45;     // upper / lower parking floor levels
const RAMP0 = 4.84;               // ramps start at the back of the pavement
const PORCH_Y = 0.3;              // 4 bis landing floor (end of the walkway)
const WK0 = -1.45, WK1 = -0.4;    // 4 bis walkway, between the hedge planter and the plant box on the gable
const LAND = -9.3;                // the walkway widens into the covered landing here
// left side of the walkway: a tall planter at the street (the "4"), then a narrow low planter like a big
// step along the wall of the up ramp, up to the landing (residents' photo)
const TALL_Z = 3.6;               // back of the tall street-end planter
const STEP_X = -2.1;              // walkway-side face of the low step planter
const STEP_H = 0.42;              // its height above the walkway
const WALL_H = 1.65;              // top of the wall between the walkway and the up ramp, behind the step
const walkY = (z) => lerp(SW_Y, PORCH_Y, clamp((RAMP0 - z) / (RAMP0 - LAND), 0, 1));

function makeFace(o, n, L) {
  const U = [n[1], -n[0]];
  return {
    o, n, L, U,
    N3: [n[0], 0, n[1]], U3: [U[0], 0, U[1]],
    P(s, y, d = 0) { return [o[0] + U[0] * s + n[0] * d, y, o[1] + U[1] * s + n[1] * d]; },
  };
}

// pattern strings: w=window f=french window o=orange panel d=door p=porch void
function pat(str) {
  const out = [];
  const re = /([wfodp])(-?[\d.]+)-(-?[\d.]+)/g; let m;
  while ((m = re.exec(str))) out.push({ t: m[1], a: +m[2], b: +m[3] });
  return out;
}
function subtractIv(a, b, holes) {
  const out = []; let cur = a;
  for (const [h0, h1] of holes.slice().sort((p, q) => p[0] - q[0])) {
    if (h1 <= cur || h0 >= b) continue;
    if (h0 > cur) out.push([cur, Math.min(h0, b)]);
    cur = Math.max(cur, h1);
    if (cur >= b) break;
  }
  if (cur < b) out.push([cur, b]);
  return out.filter(([x, y]) => y - x > 1e-4);
}
function splitOrange([a, b], oranges) {
  const ins = oranges.map(([o0, o1]) => [Math.max(a, o0), Math.min(b, o1)]).filter(([x, y]) => y - x > 1e-4).sort((p, q) => p[0] - q[0]);
  const res = []; let cur = a;
  for (const [x, y] of ins) { if (x > cur) res.push([cur, x, false]); res.push([x, y, true]); cur = y; }
  if (cur < b) res.push([cur, b, false]);
  return res;
}

function rect(bk, F, s0, s1, ya, yb, d = 0) {
  bag(bk).quad(F.P(s0, ya, d), F.P(s1, ya, d), F.P(s1, yb, d), F.P(s0, yb, d), F.N3);
}
const winRng = rng(1977);
const WINDOWS = [];
function opening(F, a, b, ya, yb, kind) {
  const r = REV;
  bag('reveal').quad(F.P(a, ya, 0), F.P(a, ya, -r), F.P(a, yb, -r), F.P(a, yb, 0), F.U3);
  bag('reveal').quad(F.P(b, ya, 0), F.P(b, ya, -r), F.P(b, yb, -r), F.P(b, yb, 0), neg(F.U3));
  bag('reveal').quad(F.P(a, yb, 0), F.P(b, yb, 0), F.P(b, yb, -r), F.P(a, yb, -r), [0, -1, 0]);
  const lip = kind === 'w' ? 0.035 : 0.0;
  bag('sill').quad(F.P(a - 0.02, ya, lip), F.P(b + 0.02, ya, lip), F.P(b + 0.02, ya, -r), F.P(a - 0.02, ya, -r), [0, 1, 0]);
  if (lip) bag('sill').quad(F.P(a - 0.02, ya - 0.045, lip), F.P(b + 0.02, ya - 0.045, lip), F.P(b + 0.02, ya, lip), F.P(a - 0.02, ya, lip), F.N3);
  const fd = -0.075, fw = 0.06, gd = -0.095;
  if (kind === 'd') {
    // glazed entrance door: aluminium frame
    const fr = 'metal';
    rect(fr, F, a, a + 0.08, ya, yb, fd); rect(fr, F, b - 0.08, b, ya, yb, fd);
    rect(fr, F, a + 0.08, b - 0.08, yb - 0.08, yb, fd); rect(fr, F, a + 0.08, b - 0.08, ya, ya + 0.1, fd);
    rect(fr, F, (a + b) / 2 - 0.04, (a + b) / 2 + 0.04, ya + 0.1, yb - 0.08, fd + 0.004);
    rect('glass', F, a + 0.08, b - 0.08, ya + 0.1, yb - 0.08, gd);
    return;
  }
  rect('frame', F, a, a + fw, ya, yb, fd);
  rect('frame', F, b - fw, b, ya, yb, fd);
  rect('frame', F, a + fw, b - fw, ya, ya + fw, fd);
  rect('frame', F, a + fw, b - fw, yb - fw, yb, fd);
  if (b - a > 0.85) { const m = (a + b) / 2; rect('frame', F, m - 0.035, m + 0.035, ya + fw, yb - fw, fd + 0.004); }
  const curtain = winRng() < 0.6, lit = winRng() < 0.36;
  const key = (curtain ? 'curtain' : 'glass') + (lit ? 'Lit' : '');
  rect(key, F, a + fw, b - fw, ya + fw, yb - fw, gd);
}

function buildLevel(F, k, els, wk = 'wall') {
  // 6th floor: windows only, no French windows (the terrace in front is not a balcony)
  if (k === 6) els = els.map((e) => (e.t === 'f' ? { ...e, t: 'w' } : e));
  const y0 = LV(k), yS = y0 + SILL, yH = y0 + HEAD, yT = y0 + FH;
  const iv = (f) => els.filter(f).map((e) => [e.a, e.b]);
  const holesLow = iv((e) => e.t === 'f' || e.t === 'd' || e.t === 'p');
  const holesBand = iv((e) => e.t !== 'o');
  const holesHigh = iv((e) => e.t === 'p');
  const oranges = iv((e) => e.t === 'o');
  for (const [a, b] of subtractIv(0, F.L, holesLow)) rect(wk, F, a, b, y0, yS);
  for (const seg of subtractIv(0, F.L, holesBand)) for (const [a, b, o] of splitOrange(seg, oranges)) rect(o ? 'orange' : wk, F, a, b, yS, yH);
  for (const [a, b] of subtractIv(0, F.L, holesHigh)) rect(wk, F, a, b, yH, yT);
  // fine drip line along the sill level — the horizontal striation seen in the photos
  for (const [a, b] of subtractIv(0, F.L, holesLow)) {
    const p0 = F.P(a, 0, -0.01), p1 = F.P(b, 0, -0.01);
    bag('sill').segBox(p0[0], p0[2], p1[0], p1[2], yS - 0.05, yS - 0.01, 0.05);
  }
  for (const e of els) {
    if (e.t === 'w') opening(F, e.a, e.b, yS, yH, 'w');
    else if (e.t === 'f') opening(F, e.a, e.b, y0, yH, 'f');
    else if (e.t === 'd') opening(F, e.a, e.b, y0, yH, 'd');
  }
}

function coping(F, yTop, s0 = 0, s1 = F.L) {
  const a = F.P(s0, 0, -0.14), b = F.P(s1, 0, -0.14);
  bag('wall').segBox(a[0], a[2], b[0], b[2], yTop - 0.28, yTop + 0.3, 0.33, 0.0);   // also hides the edge of the roof slab
  bag('flashing').segBox(a[0], a[2], b[0], b[2], yTop + 0.3, yTop + 0.35, 0.38, 0.02);
}

// Wedge ("fin") balcony: triangular in plan — root R on the wall, deep end E on the wall,
// tip T at depth D in front of E. Solid parapet along the angled edge R–T; the slab is flat
// (residents' photos), its underside level with the floor.
function wedge(F, k, sRoot, sDeep, D, side) {
  const y0 = LV(k), yT = y0 + 0.03, yP = y0 + 1.06, yB = y0 - 0.2, yBT = yB, th = 0.12;
  const R3 = F.P(sRoot, 0, 0), E3 = F.P(sDeep, 0, 0), T3 = F.P(sDeep, 0, D);
  const r = [R3[0], R3[2]], e = [E3[0], E3[2]], t = [T3[0], T3[2]];
  const outN = (a, b, ref) => {
    const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]); let n = [d[1] / l, -d[0] / l];
    if (n[0] * (ref[0] - a[0]) + n[1] * (ref[1] - a[1]) > 0) n = [-n[0], -n[1]];
    return n;
  };
  const P3 = (p, y) => [p[0], y, p[1]];
  const off = (p, n, s) => [p[0] - n[0] * s, p[1] - n[1] * s];
  const nh = outN(r, t, e), ns = outN(e, t, r);
  const r2 = off(r, nh, th), t2 = off(t, nh, th);
  const W = bag('wall'), S = bag('slab');
  // angled parapet (outer face runs down to the soffit)
  W.quad(P3(r, yP), P3(t, yP), P3(t, yBT), P3(r, yB), [nh[0], 0, nh[1]]);
  W.quad(P3(r2, yP), P3(t2, yP), P3(t2, yT), P3(r2, yT), [-nh[0], 0, -nh[1]]);
  W.quad(P3(r, yP), P3(t, yP), P3(t2, yP), P3(r2, yP), [0, 1, 0]);
  const m0 = [(r[0] + r2[0]) / 2, (r[1] + r2[1]) / 2], m1 = [(t[0] + t2[0]) / 2, (t[1] + t2[1]) / 2];
  bag('flashing').segBox(m0[0], m0[1], m1[0], m1[1], yP, yP + 0.03, th + 0.03, 0.02);
  // slab top and flat soffit
  S.tri(P3(r, yT), P3(e, yT), P3(t, yT), [0, 1, 0]);
  bag('soffit').tri(P3(r, yB), P3(e, yB), P3(t, yBT), [0, -1, 0]);
  if (side === 'solid') {
    const e2 = off(e, ns, th), t3 = off(t, ns, th);
    W.quad(P3(e, yP), P3(t, yP), P3(t, yBT), P3(e, yB), [ns[0], 0, ns[1]]);
    W.quad(P3(e2, yP), P3(t3, yP), P3(t3, yT), P3(e2, yT), [-ns[0], 0, -ns[1]]);
    W.quad(P3(e, yP), P3(t, yP), P3(t3, yP), P3(e2, yP), [0, 1, 0]);
  } else {
    // slab edge, then a white-painted railing on the short side
    W.quad(P3(e, yT), P3(t, yT), P3(t, yBT), P3(e, yB), [ns[0], 0, ns[1]]);
    const a = off(e, ns, 0.04), b = off(t, ns, 0.04);
    bag('railLight').segBox(a[0], a[1], b[0], b[1], yP - 0.06, yP - 0.01, 0.05);
    bag('railLight').segBox(a[0], a[1], b[0], b[1], yT + 0.08, yT + 0.11, 0.03);
    const n = Math.max(2, Math.round(D / 0.11));
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      bag('railLight').box(lerp(a[0], b[0], u), (yT + yP) / 2 - 0.02, lerp(a[1], b[1], u), 0.018, yP - yT - 0.06, 0.018);
    }
  }
}

// ---------------- façade data (metres along each face; see notes in header comment)
// Street façade, traced from the frontal Street View panorama (0 = east corner).
const ST_ODD = 'f3.1-4.9 w6.1-6.9 o7.1-8.6 f8.7-10 o10.6-11.1 w11.2-11.8 w14-15.3 o15.35-15.9 w15.95-17.35 w19.55-21 f22.5-23.9 o23.95-24.25 w24.3-25.75 w28.5-30 o30.05-30.4 w30.45-31.65 o31.8-33.25 w33.3-34.75 w37.8-38.4 o38.45-38.8 f38.9-40.3 w44.5-45.95 o46.05-47.4 w47.5-48.3 f48.45-49.75 w50.55-51.7';
const ST_EVEN = 'o0-0.75 o2-2.5 f3.1-4.65 o4.75-5.05 w5.1-5.7 o5.8-8.5 f8.6-10 o10.6-12.1 w12.2-12.8 o12.85-13.15 w13.2-14.55 w16.6-17.95 o18.05-19.5 w19.55-21 f22.5-23.9 o23.95-24.25 w24.3-25.75 o25.8-28.55 w28.6-30.05 o30.1-30.4 w30.45-31.6 o31.9-32.75 o34.15-34.9 w34.95-36.2 o36.3-37.8 w37.85-38.5 o38.55-38.85 f38.95-40.3 o41.2-44.6 w44.65-46.1 o46.2-47.7 w47.8-48.6 f48.75-50 w50.55-51.7 o51.8-52.7';
const ST_RDC = 'w2.5-3.9 o4.05-5.5 w5.6-6.3 o6.35-6.7 w7-8.4 w8.9-10.3 o10.4-10.9 w11-12.35 o12.44-12.72 w13.2-14.55 w16.6-17.95 w19.5-20.9 o21-22.2 o23.14-24.31 w24.4-25.75 o26.66-28.84 w28.95-30.3 o30.37-30.74 w30.8-32.2 o33.03-34.35 w34.45-35.3 o35.35-36.5 d36.6-38.25 p38.75-41.2 o41.25-45.25 w46-47.4 w48.4-49.8 w50.5-51.9';

function streetPattern(k) {
  if (k === 0) return pat(ST_RDC);
  let s = k % 2 ? ST_ODD : ST_EVEN;
  // the orange panel beside stack S3 is longer on the lower floors
  s += k === 5 ? ' o21-21.5' : k === 4 ? ' o21-21.5' : ' o21-22.45';
  return pat(s);
}

const FACES = [];
function buildBuilding(group) {
  const STREET = makeFace([0, 0], [0, 1], 52.7);
  const BFACE = makeFace([0, -12.4], [-1, 0], 12.4);
  const GARDEN = makeFace([52.7, -12.4], [0, -1], 39.4);
  const NWG = makeFace([52.7, 0], [1, 0], 12.4);
  const AFACE = makeFace([-1.5, -24.4], [-1, 0], 12.0);
  const RET = makeFace([-1.5, -12.4], [0, 1], 1.5);
  const RET6 = makeFace([-1.5, -12.4], [0, 1], 3.9);
  const WSW = makeFace([13.3, -24.4], [0, -1], 14.8);
  const WNW = makeFace([13.3, -12.4], [1, 0], 12.0);
  const WNW6 = makeFace([13.3, -10.6], [1, 0], 13.8);
  const AT_ST = makeFace([2.4, -2.0], [0, 1], 49.5);
  const AT_SE = makeFace([2.4, -12.4], [-1, 0], 10.4);
  const AT_NW = makeFace([51.9, -2.0], [1, 0], 8.6);
  const AT_GD = makeFace([51.9, -10.6], [0, -1], 38.6);

  const L = (F, levels, fn) => { for (const k of levels) buildLevel(F, k, fn(k)); };
  const R05 = [0, 1, 2, 3, 4, 5], R06 = [0, 1, 2, 3, 4, 5, 6], R15 = [1, 2, 3, 4, 5];

  // --- street façade
  L(STREET, R05, streetPattern);
  for (const k of R15) {
    wedge(STREET, k, 5.1, 2.2, 1.5, 'rail');     // S1 — points SE, railing on the short side
    wedge(STREET, k, 8.35, 10.9, 1.5, 'rail');   // S2 — points NW
    wedge(STREET, k, 24.2, 21.7, 1.5, 'rail');   // S3 — points SE
    wedge(STREET, k, 41.4, 38.75, 1.5, 'rail');  // S4 — points SE
    wedge(STREET, k, 45.3, 50.3, 1.8, 'solid'); // S5 — long solid fin near the NW end
  }
  coping(STREET, TOP_SLAB);
  // the joint between No. 4 bis and No. 4: a thin white vertical line up the whole façade, just NW of the
  // third balcony stack (Street View, Feb 2026); the same on the garden side and the attic
  const JOINT = 26.6;
  const joint = (F, s0, y0, y1) => {
    bag('white').quad(F.P(s0 - 0.05, y0, 0.014), F.P(s0 + 0.05, y0, 0.014), F.P(s0 + 0.05, y1, 0.014), F.P(s0 - 0.05, y1, 0.014), F.N3);
    bag('soffit').quad(F.P(s0 + 0.05, y0, 0.012), F.P(s0 + 0.08, y0, 0.012), F.P(s0 + 0.08, y1, 0.012), F.P(s0 + 0.05, y1, 0.012), F.N3);   // its shadow
  };
  joint(STREET, JOINT, RDC - 0.9, TOP_SLAB + 0.3);
  joint(GARDEN, 52.7 - JOINT, RDC - 0.9, TOP_SLAB + 0.3);
  joint(AT_ST, JOINT - 2.4, TOP_SLAB, TOP_WING + 0.3);
  joint(AT_GD, 51.9 - JOINT, TOP_SLAB, TOP_WING + 0.3);

  // --- SE gable of the slab (face "B"). Its ground floor faces the drive: built in buildDrive()
  L(BFACE, R15, (k) => pat(k % 2 ? 'w1.3-2.5 o2.6-3.6 f5.4-6.8' : 'o0.3-1.2 w1.3-2.5 f5.4-6.8 o8.9-12.4'));
  for (const k of R15) wedge(BFACE, k, 8.4, 4.6, 1.6, 'solid');
  coping(BFACE, TOP_SLAB);

  // --- garden façade (extrapolated: wedge stacks located from the aerial view)
  const G_ODD = 'w1-2.3 o2.45-3.4 w3.55-4.1 f6-7.4 w8.4-9.6 o9.7-10.3 f10.6-12 w14.4-15.7 o15.8-16.5 w16.6-17.9 w18.4-19.6 f21.6-23 o23.1-23.9 w24-25.3 f26.4-27.8 w29.8-31 o31.1-31.5 f33.2-34.6 w35.6-36.9 o36.95-37.5 w37.6-38.6';
  const G_EVEN = 'o0-0.9 w1-2.3 o2.45-4.1 f6-7.4 o7.5-8.3 w8.4-9.6 f10.6-12 o12.1-14.3 w14.4-15.7 w16.6-17.9 o18-18.3 w18.4-19.6 f21.6-23 w24-25.3 o25.4-26.3 f26.4-27.8 o27.9-29.7 w29.8-31 f33.2-34.6 o34.7-35.5 w35.6-36.9 w37.6-38.6 o38.7-39.4';
  const G_RDC = 'w1-2.3 w3.55-4.1 w6-7.4 w8.4-9.6 w10.6-12 w14.4-15.7 w16.6-17.9 d19.7-21.3 w21.6-23 w24-25.3 w26.4-27.8 w29.8-31 w33.2-34.6 w35.6-36.9 w37.6-38.6';
  L(GARDEN, R05, (k) => pat(k === 0 ? G_RDC : k % 2 ? G_ODD : G_EVEN));
  for (const k of R15) {
    wedge(GARDEN, k, 4.2, 7.8, 1.5, 'rail');
    wedge(GARDEN, k, 10.2, 13.6, 1.5, 'solid');  // 2, 3 and 4 point the other way (residents' correction)
    wedge(GARDEN, k, 23.4, 20.0, 1.5, 'rail');
    wedge(GARDEN, k, 26.0, 29.4, 1.5, 'rail');
    wedge(GARDEN, k, 31.6, 35.0, 1.5, 'solid');
  }
  coping(GARDEN, TOP_SLAB);

  // --- NW gable (blind, against the neighbour)
  L(NWG, R05, () => []);
  coping(NWG, TOP_SLAB);

  // --- wing: SE face "A", its NE return, SW end, NW face
  // (the ground floor of face A sits behind the garage block; level 1 opens onto its roof terrace)
  L(AFACE, R06, (k) => pat(k === 0 ? ''
    : k === 6 ? 'w1.1-2.5 o2.7-4.4 w4.6-5.4 w7.4-8.6 o8.7-10.3 w10.4-11.3'
      : k % 2 ? 'f1.1-2.5 w4.6-5.4 o5.5-7.3 w7.4-8.6 w10.4-11.3' : 'f1.1-2.5 o2.7-4.4 w4.6-5.4 w7.4-8.6 o8.7-10.3 w10.4-11.3'));
  for (const k of R15) wedge(AFACE, k, 3.8, 0.5, 1.5, 'solid');
  coping(AFACE, TOP_WING);
  L(RET, R15, (k) => pat(k % 2 === 0 ? 'o0.15-1.35' : ''));
  rect('wall', RET, 0, RET.L, T_TOP - 0.05, LV(1));   // strip above the terrace; below is the 4 bis porch
  buildLevel(RET6, 6, pat('o0.3-2.2 w2.5-3.6'));
  coping(RET6, TOP_WING);

  L(WSW, R06, (k) => pat(k === 0 ? 'w1.5-2.9 w5.2-6.4 w8.4-9.6 w11.9-13.3'
    : k === 6 ? 'w1.5-2.9 o3-4.8 w5.2-6.4 w8.4-9.6 o9.8-11.6 w11.9-13.3'
      : k % 2 ? 'w1.5-2.9 w5.2-6.4 o6.5-8.3 w8.4-9.6 w11.9-13.3' : 'w1.5-2.9 o3-4.6 w5.2-6.4 w8.4-9.6 o9.7-11.6 w11.9-13.3'));
  // the end of the wing, the face furthest out into the woods, has no balconies (residents' correction)
  coping(WSW, TOP_WING);

  L(WNW, R05, (k) => pat(k === 0 ? 'w1.2-2.4 w6.4-7.8 w9.8-11' : k % 2 ? 'w1.2-2.4 o2.5-4.2 f6.4-7.8 w9.8-11' : 'w1.2-2.4 f6.4-7.8 o8.9-9.7 w9.8-11'));
  for (const k of R15) wedge(WNW, k, 5.0, 8.6, 1.5, 'solid');
  buildLevel(WNW6, 6, pat('w3-4.2 o4.4-6 w8.2-9.6 o9.8-11.4 w11.6-12.8'));
  coping(WNW6, TOP_WING);

  // --- attic (6th floor), set back from the street
  buildLevel(AT_ST, 6, pat('o0.2-4.4 w4.55-5.75 o5.9-6.8 w6.95-8.35 o8.5-10.4 f10.6-12.4 o12.6-14.2 w14.35-15.65 o15.8-19.2 w19.35-20.65 o20.8-22 o22.6-24.2 o24.4-25.7 f25.85-27.95 o28.1-31.4 w31.55-32.75 o32.9-35.1 f35.25-37.15 o37.3-41.8 f41.95-43.95 o44.1-45.9 f46.05-47.95 o48.1-49.3'));
  coping(AT_ST, TOP_WING);
  buildLevel(AT_SE, 6, pat('w1.2-2.4 o2.5-4.2 f5.6-7.2 o7.4-8.6'));
  coping(AT_SE, TOP_WING);
  buildLevel(AT_NW, 6, pat('o0.4-1.6 w2.4-3.6 w5.6-6.8'));
  coping(AT_NW, TOP_WING);
  buildLevel(AT_GD, 6, pat('f1.4-2.8 o3-4.6 f5-6.4 f8.6-10 o10.2-11.8 f12.2-13.6 f15.8-17.2 o17.4-19 f19.4-20.8 f23-24.4 o24.6-26.2 f26.6-28 f30.2-31.6 o31.8-33.4 f33.8-35.2'));
  coping(AT_GD, TOP_WING);

  // --- roofs
  const rf = bag('roof');
  rf.boxAB(0, TOP_SLAB - 0.25, -12.4, 52.7, TOP_SLAB + 0.02, 0, true);
  rf.boxAB(2.4, TOP_WING - 0.25, -10.6, 51.9, TOP_WING + 0.02, -2.0, true);
  rf.boxAB(2.4, TOP_WING - 0.25, -12.4, 13.3, TOP_WING + 0.02, -10.6, true);
  rf.boxAB(-1.5, TOP_WING - 0.25, -24.4, 13.3, TOP_WING + 0.02, -12.4, true);
  // rooftop, traced from the aerial view: two lift machine rooms (one near each end), the ventilation (VMC)
  // ducts running on low supports, and the VMC fan boxes along them
  const lift = (x0, z0, x1, z1) => {
    bag('wall').boxAB(x0, TOP_WING, z0, x1, TOP_WING + 2.5, z1, true);
    bag('flashing').boxAB(x0 - 0.1, TOP_WING + 2.5, z0 - 0.1, x1 + 0.1, TOP_WING + 2.6, z1 + 0.1, true);
    bag('metal').boxAB(x0 + 0.6, TOP_WING + 2.6, z0 + 0.6, x0 + 1.4, TOP_WING + 2.95, z0 + 1.2, true);   // vent on its roof
  };
  lift(39.1, -8.1, 42.5, -4.5);   // No. 4, near the NW end, in the middle of the roof's depth
  lift(7.3, -9.4, 11.1, -5.6);    // No. 4 bis, near the wing, in the middle of the roof
  const DY = TOP_WING + 0.15;
  const duct = (pts, w = 0.36) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      bag('duct').segBox(ax, az, bx, bz, DY, DY + w, w + 0.02, 0);
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2));
      for (let k = 0; k <= n; k++) { const u = k / n, x = lerp(ax, bx, u), z = lerp(az, bz, u); bag('darkConcrete').boxAB(x - 0.12, TOP_WING, z - 0.12, x + 0.12, DY, z + 0.12, true); }
    }
  };
  duct([[51.4, -3.4], [48.6, -5.9], [42.5, -5.9]]);                          // NW end into the first lift room
  duct([[39.7, -4.5], [39.7, -2.9], [30.6, -2.9], [30.6, -4.0]]);             // along the street side towards the joint
  duct([[39.1, -6.8], [34.4, -6.8]]);
  duct([[25.2, -6.0], [24.8, -5.0], [17.4, -5.2], [15.3, -6.0], [11.1, -6.6]]); // middle run into the second lift room
  duct([[8.5, -9.4], [8.5, -11.4], [8.2, -19.1]]);                            // down the wing
  duct([[8.3, -16.0], [5.7, -16.0]]);
  const fan = (x, z) => {   // VMC extract fan: galvanised box with a round outlet
    bag('duct').boxAB(x - 0.55, TOP_WING, z - 0.45, x + 0.55, TOP_WING + 0.7, z + 0.45, true);
    bag('duct').cyl([x, TOP_WING + 0.7, z], [x, TOP_WING + 0.95, z], 0.3, 0.3, 12, true);
    bag('metal').cyl([x, TOP_WING + 0.95, z], [x, TOP_WING + 0.98, z], 0.32, 0.32, 12, true);
  };
  for (const [x, z] of [[34.4, -7.6], [30.6, -4.8], [20.5, -6.0], [15.3, -6.9], [48.6, -6.8], [8.2, -19.8], [5.0, -16.0]]) fan(x, z);

  // --- plinths (the SE garage block, ramps and the 4 bis porch are in buildDrive)
  const pl = bag('concrete');
  pl.boxAB(0, -2.45, -12.4, 52.7, RDC, 0, true);
  pl.boxAB(-1.5, -2.45, -24.4, 13.3, RDC, -12.4, true);

  // --- entrance 4: glazed double door at the top of the stair (opening 'd' in the street pattern),
  // a white pier carrying the "4", then an orange recess under the S4 balcony stack, filled by a planter
  const RX0 = 38.75, RX1 = 41.2, RZ = -1.45, RTOP = 3.7;
  const ro = bag('orange');
  ro.quad([RX0, RDC, RZ], [RX1, RDC, RZ], [RX1, RTOP, RZ], [RX0, RTOP, RZ], [0, 0, 1]);
  ro.quad([RX0, RDC, RZ], [RX0, RDC, 0], [RX0, RTOP, 0], [RX0, RTOP, RZ], [1, 0, 0]);
  ro.quad([RX1, RDC, RZ], [RX1, RDC, 0], [RX1, RTOP, 0], [RX1, RTOP, RZ], [-1, 0, 0]);
  bag('wall').quad([RX0, RTOP, RZ], [RX1, RTOP, RZ], [RX1, RTOP, 0], [RX0, RTOP, 0], [0, -1, 0]);
  bag('wall').boxAB(RX0, RTOP, -0.25, RX1, LV(1), 0);                       // lintel over the recess
  // small window from the entrance hall into the recess
  bag('glass').quad([38.9, 2.2, RZ + 0.01], [39.45, 2.2, RZ + 0.01], [39.45, 3.35, RZ + 0.01], [38.9, 3.35, RZ + 0.01], [0, 0, 1]);
  for (const [x0, y0, x1, y1] of [[38.86, 2.16, 39.49, 2.22], [38.86, 3.33, 39.49, 3.39], [38.86, 2.16, 38.92, 3.39], [39.43, 2.16, 39.49, 3.39]]) bag('metal').boxAB(x0, y0, RZ + 0.005, x1, y1, RZ + 0.05);
  planeMesh(group, M.sign4, 0.2, 0.2, 38.52, 3.2, 0.012);                    // the "4" on the pier

  flushBags(group);
}

// wall standing on the ground along a plan line, its top sloping from top0 to top1
function slopedWall(bk, [x0, z0, top0], [x1, z1, top1], w, bottom = -0.05) {
  const d = nrm([x1 - x0, 0, z1 - z0]), n = [-d[2] * w / 2, 0, d[0] * w / 2];
  const P = (x, z, y, sgn) => [x + n[0] * sgn, y, z + n[2] * sgn];
  const a0 = P(x0, z0, bottom, 1), a1 = P(x1, z1, bottom, 1), b0 = P(x0, z0, bottom, -1), b1 = P(x1, z1, bottom, -1);
  const A0 = P(x0, z0, top0, 1), A1 = P(x1, z1, top1, 1), B0 = P(x0, z0, top0, -1), B1 = P(x1, z1, top1, -1);
  const b = bag(bk);
  b.quad(A0, A1, B1, B0, [0, 1, 0]);
  b.quad(a0, a1, A1, A0, n); b.quad(b0, b1, B1, B0, neg(n));
  b.quad(a0, b0, B0, A0, neg(d)); b.quad(a1, b1, B1, A1, d);
}
// convex polygon shrunk towards its centroid by about d metres
function insetPoly(pts, d) {
  const c = pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]);
  return pts.map(([x, z]) => { const l = Math.hypot(x - c[0], z - c[1]) || 1, k = Math.max(0, 1 - d / l); return [c[0] + (x - c[0]) * k, c[1] + (z - c[1]) * k]; });
}
function railingRun(pts, y0, h = 1.0, mk = 'metal', spacing = 0.12) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    bag(mk).segBox(x0, z0, x1, z1, y0 + h - 0.04, y0 + h, 0.05);
    bag(mk).segBox(x0, z0, x1, z1, y0 + 0.08, y0 + 0.11, 0.035);
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / spacing));
    for (let j = 0; j <= n; j++) {
      const t = j / n;
      bag(mk).box(lerp(x0, x1, t), y0 + h / 2, lerp(z0, z1, t), 0.018, h - 0.06, 0.018);
    }
  }
}

/* =====================================================================
   SITE: front gardens, entrance steps, ramp, pavements, street, furniture
   ===================================================================== */
const SW_Y = 0.15;   // pavement top
function buildSite(group) {
  // front garden soil (raised planters behind the low wall); the strip along the SE gable is in buildDrive
  // the corner of the front garden at the 4 bis walkway is cut on a slant, so the walkway opens as a
  // cobbled funnel onto the pavement (Street View + aerial view)
  bag('soil').boxAB(WK1 + 0.12, 0, 0.0, 36.3, 0.95, 2.3, true);
  bag('soil').prism([[WK1 + 0.12, 2.3], [36.3, 2.3], [36.3, 2.84], [0.17, 2.84]], 0, 0.95);
  bag('soil').prism([[0.17, 2.84], [35.6, 2.84], [35.6, 4.6], [1.62, 4.6]], 0, 0.95);
  bag('soil').boxAB(40.6, 0, 0.0, 44.65, 0.95, 4.6, true);
  bag('soil').boxAB(44.75, 0, 0.0, 52.9, 1.25, 4.6, true);
  // low white wall along the pavement, gap at the entrance; starts at the drive
  const lw = bag('concrete');
  lw.boxAB(-3.0, 0, 4.6, WK0, 1.0, 4.84, true);               // beside the "4" (walkway opening follows)
  lw.boxAB(1.7, 0, 4.6, 35.6, 1.0, 4.84, true);
  lw.boxAB(40.6, 0, 4.6, 44.65, 1.0, 4.84, true);
  lw.boxAB(44.65, 0, 0, 44.75, 1.32, 4.6, true);                // end of the raised planter with the railing
  lw.boxAB(WK1, -0.3, 0, WK1 + 0.12, 1.0, 2.3, true);           // front garden edge along the walkway
  lw.segBox(WK1 + 0.06, 2.3, 1.7, 4.72, -0.3, 1.0, 0.14, 0.07);   // ... then on the slant to the pavement
  bag('cobble').prism([[WK1, 4.84], [1.72, 4.84], [WK1, 2.3]], -0.3, SW_Y + 0.012);   // cobbled mouth of the walkway
  lw.boxAB(44.65, 0, 4.6, 53.1, 1.32, 4.84, true);
  bag('frame').boxAB(46.6, 0.18, 4.845, 47.55, 1.12, 4.86); // utility hatch in the raised wall
  railingRun([[44.75, 4.72], [53.0, 4.72]], 1.32, 0.95, 'metal', 0.13);

  // entrance 4: eight risers from the pavement to the door. The upper flight is narrow, with a sloped
  // tiled cheek on its right against the raised planter; the lower flight fans out to the pavement.
  const RISE = (RDC - SW_Y) / 8, TZ = 1.34, TREAD = 0.5;
  const stp = bag('stone');
  stp.boxAB(36.45, 0, -0.02, 38.4, RDC, TZ, true);                          // landing at the door
  const diag = (z) => 38.4 + (z - TZ) * 0.6;                                 // right edge of the upper flight
  for (let k = 1; k <= 7; k++) {
    const zb = TZ + (k - 1) * TREAD, zf = zb + TREAD, top = RDC - k * RISE;
    const x0 = k <= 4 ? 36.45 : 36.45 - (k - 4) * 0.25, x1 = k <= 4 ? diag(zb) : 40.4;
    stp.boxAB(x0, 0, zb, x1, top, zf, true);
    bag('darkConcrete').boxAB(x0, top - 0.035, zf - 0.03, x1, top + 0.004, zf + 0.005);   // nosing
  }
  slopedWall('stone', [38.42, TZ, RDC + 0.12], [39.62, TZ + 4 * TREAD, RDC - 4 * RISE + 0.12], 0.24);   // tiled cheek
  slopedWall('stone', [40.5, TZ + 4 * TREAD, RDC - 4 * RISE + 0.12], [40.5, 4.84, SW_Y + 0.12], 0.2);
  slopedWall('concrete', [36.42, TZ + 3 * TREAD, 1.0], [35.67, 4.84, 0.45], 0.16);                     // left cheek of the fan
  bag('concrete').boxAB(36.3, 0, 0, 36.45, 1.0, TZ + 3 * TREAD, true);
  // raised planter in the recess and in front of it (as high as the door's handles), with a post light
  const PT = 2.07;
  const pA = [[38.75, -1.45], [41.2, -1.45], [41.2, 0], [38.75, 0]];
  const pB = [[38.4, 0], [41.2, 0], [41.2, TZ + 4 * TREAD], [39.6, TZ + 4 * TREAD], [38.4, TZ]];
  bag('concrete').prism(pA, RDC, PT); bag('concrete').prism(pB, 0, PT);
  bag('soil').prism(insetPoly(pA, 0.12), PT, PT + 0.012, false, false); bag('soil').prism(insetPoly(pB, 0.12), PT, PT + 0.012, false, false);
  bag('metal').cyl([40.35, PT, 1.1], [40.35, PT + 0.5, 1.1], 0.065, 0.065, 10, true);
  bag('lampHead').cyl([40.35, PT + 0.5, 1.1], [40.35, PT + 0.56, 1.1], 0.08, 0.08, 10, true);
  // second, longer planter along the orange wall to the right, at the same height
  bag('concrete').boxAB(41.2, 0, 0, 44.65, 2.0, 1.3, true);
  bag('soil').boxAB(41.3, 2.0, 0.05, 44.55, 2.012, 1.2);

  // pavement on our side (grey) with the red-brown walkway band
  const pv = bag('pavement');
  pv.boxAB(-3.0, 0, 4.84, 220, SW_Y, 9.85, true);
  pv.boxAB(-160, 0, 4.84, -15.8, SW_Y, 9.85, true);
  // red-brown paving around each street tree, from the kerb to the garden wall, narrowing towards the wall,
  // edged by a strip of cobbles; the rest of the pavement is grey (Street View, Feb 2026)
  const ry = SW_Y + 0.004;
  for (const [k0, w0, w1, k1] of [[11.2, 12.3, 15.5, 16.6], [39.6, 40.5, 44.3, 45.2]]) {
    bag('redway').quad([k0, ry, 9.85], [k1, ry, 9.85], [w1, ry, 4.84], [w0, ry, 4.84], [0, 1, 0]);
    bag('cobble').segBox(k0, 9.85, w0, 4.84, ry, ry + 0.004, 0.32);
    bag('cobble').segBox(k1, 9.85, w1, 4.84, ry, ry + 0.004, 0.32);
  }
  // cobbled gutter along the kerb
  bag('cobble').boxAB(-160, 0, 10.05, 220, 0.012, 10.35, true);
  // cobbled vehicle crossing in front of the two ramps (between No. 6's gate and our corner planter)
  bag('cobble').boxAB(-15.8, 0, RAMP0, -3.0, SW_Y - 0.03, 9.85, true);
  // kerbs
  bag('curb').boxAB(-160, 0, 9.85, 220, SW_Y + 0.01, 10.05, true);
  bag('curb').boxAB(-160, 0, 19.95, 220, SW_Y + 0.01, 20.15, true);
  // road
  bag('asphalt').quad([-200, 0, 10.05], [260, 0, 10.05], [260, 0, 19.95], [-200, 0, 19.95], [0, 1, 0]);
  // far pavement
  bag('pavement').boxAB(-160, 0, 20.15, 220, SW_Y, 24.2, true);
  // markings: centre dashes, parking line, bus-stop zigzag
  const wm = bag('white');
  for (let x = -196; x < 256; x += 6.5) wm.quad([x, 0.006, 14.94], [x + 3, 0.006, 14.94], [x + 3, 0.006, 15.08], [x, 0.006, 15.08], [0, 1, 0]);
  wm.quad([-200, 0.006, 17.62], [260, 0.006, 17.62], [260, 0.006, 17.74], [-200, 0.006, 17.74], [0, 1, 0]);
  const yz = bag('yellow');
  const zig = [10.35, 11.9];
  for (let x = 11.5, i = 0; x < 26.5; x += 2.5, i++) {
    const za = zig[i % 2], zc = zig[(i + 1) % 2];
    yz.segBox(x, za, x + 2.5, zc, 0.004, 0.009, 0.12, 0.05);
  }
  yz.segBox(11.5, 10.35, 26.5, 10.35, 0.004, 0.009, 0.12);
  // parking bay on the pavement, between the vehicle crossing and the bus stop: a trapezoid, long side
  // on the kerb, slanted ends; cobbled like the crossing, two places, two bollards on it (residents' photos)
  const BAY = { x0: -2.4, x1: 11.2, i0: 0.4, i1: 8.6, zi: 7.05, zo: 9.85 };
  const by = SW_Y + 0.006;
  bag('cobble').quad([BAY.x0, by, BAY.zo], [BAY.x1, by, BAY.zo], [BAY.i1, by, BAY.zi], [BAY.i0, by, BAY.zi], [0, 1, 0]);
  for (const [a0, a1, b0, b1] of [[BAY.x0, BAY.zo, BAY.i0, BAY.zi], [BAY.i0, BAY.zi, BAY.i1, BAY.zi], [BAY.i1, BAY.zi, BAY.x1, BAY.zo]]) bag('curb').segBox(a0, a1, b0, b1, SW_Y - 0.02, SW_Y + 0.07, 0.16);
  // the two bollards: a tall grey post at the back of the bay, a low cast-iron one in front of it
  bag('darkConcrete').cyl([1.2, SW_Y, 7.45], [1.2, SW_Y + 0.75, 7.45], 0.13, 0.12, 12, true);
  bag('metal').cyl([2.6, SW_Y, 8.3], [2.6, SW_Y + 0.42, 8.3], 0.13, 0.11, 12, true);
  bag('metal').cyl([2.6, SW_Y + 0.42, 8.3], [2.6, SW_Y + 0.5, 8.3], 0.17, 0.08, 12, true);

  // street furniture ------------------------------------------------
  // bus shelter "Sarraut"
  const sx = 18.8, sz0 = 7.25, sz1 = 8.75, sw = 2.3, roofY = 2.55;
  for (const [x, z] of [[sx - sw, sz0], [sx + sw, sz0], [sx - sw, sz1], [sx + sw, sz1]]) bag('shelter').boxAB(x - 0.04, SW_Y, z - 0.04, x + 0.04, roofY, z + 0.04, true);
  bag('shelter').boxAB(sx - sw - 0.1, roofY, sz0 - 0.25, sx + sw + 0.1, roofY + 0.09, sz1 + 0.15);
  bag('stopName').quad([sx + 0.6, roofY + 0.1, sz1 + 0.16], [sx + sw, roofY + 0.1, sz1 + 0.16], [sx + sw, roofY + 0.36, sz1 + 0.16], [sx + 0.6, roofY + 0.36, sz1 + 0.16], [0, 0, 1]);
  bag('shelter').boxAB(sx + 0.6, roofY + 0.09, sz1 + 0.1, sx + sw, roofY + 0.37, sz1 + 0.15);
  bag('shelterGlass').quad([sx - sw, SW_Y + 0.1, sz0], [sx + sw, SW_Y + 0.1, sz0], [sx + sw, roofY - 0.05, sz0], [sx - sw, roofY - 0.05, sz0], [0, 0, 1]);
  bag('shelterGlass').quad([sx + sw, SW_Y + 0.1, sz0], [sx + sw, SW_Y + 0.1, sz1 - 0.5], [sx + sw, roofY - 0.05, sz1 - 0.5], [sx + sw, roofY - 0.05, sz0], [1, 0, 0]);
  bag('shelter').boxAB(sx - sw - 0.06, SW_Y + 0.15, sz0 + 0.05, sx - sw + 0.06, SW_Y + 2.15, sz1 - 0.1);
  bag('poster').quad([sx - sw - 0.07, SW_Y + 0.3, sz0 + 0.12], [sx - sw - 0.07, SW_Y + 0.3, sz1 - 0.17], [sx - sw - 0.07, SW_Y + 2.05, sz1 - 0.17], [sx - sw - 0.07, SW_Y + 2.05, sz0 + 0.12], [-1, 0, 0]);
  bag('poster').quad([sx - sw + 0.07, SW_Y + 0.3, sz0 + 0.12], [sx - sw + 0.07, SW_Y + 0.3, sz1 - 0.17], [sx - sw + 0.07, SW_Y + 2.05, sz1 - 0.17], [sx - sw + 0.07, SW_Y + 2.05, sz0 + 0.12], [1, 0, 0]);
  bag('shelter').boxAB(sx - 1.4, SW_Y + 0.45, sz0 + 0.1, sx + 1.4, SW_Y + 0.5, sz0 + 0.5);
  bag('metal').boxAB(sx + 2.9, SW_Y, sz0 + 0.3, sx + 3.25, SW_Y + 0.75, sz0 + 0.62); // litter bin

  // lamp posts (brown, curved arm towards the road)
  const lamps = [[12.6, 9.2], [34.5, 9.25], [-14.5, 9.25], [63, 9.25]];   // the first between the parking bay and the tree
  for (const [x, z] of lamps) {
    bag('brown').cyl([x, SW_Y, z], [x, 7.9, z], 0.09, 0.055, 8);
    bag('brown').cyl([x, 7.9, z], [x, 8.25, z + 0.35], 0.055, 0.05, 6);
    bag('brown').cyl([x, 8.25, z + 0.35], [x, 8.3, z + 1.3], 0.05, 0.045, 6);
    bag('lampHead').cyl([x, 8.12, z + 1.45], [x, 8.32, z + 1.45], 0.32, 0.12, 12, true);
  }
  // bollards along the kerb
  for (const x of [27.2, 29.8, 32.4, 37, 39.2, 45.8, 48.4, 51, 55]) {
    bag('brown').cyl([x, SW_Y, 9.6], [x, SW_Y + 0.82, 9.6], 0.065, 0.06, 8, true);
  }
  // tree beds: low raised beds of granite blocks (two courses), elongated hexagons, wood-chip mulch and
  // tufts of grass (Street View, Feb 2026)
  const treeBed = (cx, cz, rx, rz, seed) => {
    const pts = [];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; pts.push([cx + Math.cos(a) * rx, cz + Math.sin(a) * rz]); }
    const H = 0.36, T = 0.3, br = rng(seed);
    for (let i = 0; i < 6; i++) {
      const a = pts[i], b = pts[(i + 1) % 6], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 0.5));
      for (let c = 0; c < 2; c++) for (let j = 0; j < n; j++) {
        const u0 = (j + (c ? 0.5 : 0)) / n, u1 = Math.min(1, (j + 1 + (c ? 0.5 : 0)) / n); if (u0 >= 1) continue;
        const x0 = lerp(a[0], b[0], u0), z0 = lerp(a[1], b[1], u0), x1 = lerp(a[0], b[0], u1 - 0.012), z1 = lerp(a[1], b[1], u1 - 0.012);
        bag(br() < 0.5 ? 'granite' : 'graniteDark').segBox(x0, z0, x1, z1, SW_Y + c * H / 2, SW_Y + (c + 1) * H / 2 - 0.012, T, 0.1);
      }
    }
    bag('mulch').prism(pts, SW_Y, SW_Y + H - 0.06, false, false);
    for (let i = 0; i < 14; i++) {
      const ang = br() * Math.PI * 2, rr = 0.25 + br() * 0.65, x = cx + Math.cos(ang) * rx * rr * 0.85, z = cz + Math.sin(ang) * rz * rr * 0.8;
      for (let k = 0; k < 5; k++) { const t = br() * Math.PI * 2; bag('grass').cyl([x, SW_Y + H - 0.06, z], [x + Math.cos(t) * 0.12, SW_Y + H + 0.25 + br() * 0.15, z + Math.sin(t) * 0.12], 0.035, 0.004, 4); }
    }
  };
  treeBed(14.1, 8.35, 1.45, 0.82, 71);
  treeBed(42.4, 8.35, 1.3, 0.85, 73);
  // cast-iron grate in the red paving, beside the lamp post
  bag('metal').boxAB(11.75, SW_Y, 8.55, 12.45, SW_Y + 0.012, 9.2, true);
  // parking meter + red fire hydrant in front of the SE end of the front garden
  bag('shelter').boxAB(-0.15, SW_Y, 6.75, 0.2, SW_Y + 1.55, 7.07, true);   // at the SE end of the parking bay
  bag('hydrant').cyl([2.5, SW_Y, 5.1], [2.5, SW_Y + 0.95, 5.1], 0.13, 0.13, 10, true);   // against the planter, beside the walkway
  bag('hydrant').cyl([2.5, SW_Y + 0.95, 5.1], [2.5, SW_Y + 1.1, 5.1], 0.13, 0.05, 10, true);
  // beige electrical cabinet against the garden wall, a few metres NW of the hydrant (Street View)
  bag('cabinet').boxAB(6.3, SW_Y, 4.86, 7.05, SW_Y + 0.98, 5.22, true);
  bag('cabinet').boxAB(6.27, SW_Y + 0.98, 4.86, 7.08, SW_Y + 1.02, 5.25, true);
  bag('darkConcrete').boxAB(6.67, SW_Y + 0.1, 5.22, 6.68, SW_Y + 0.9, 5.225);   // the line between its two doors
  // bollard at the NW edge of the crossing
  bag('brown').cyl([-1.6, SW_Y, 8.9], [-1.6, SW_Y + 0.82, 8.9], 0.065, 0.06, 8, true);

  // no cars: the street is shown empty (residents' request)

  flushBags(group, ['yellow', 'white', 'redway']);
}

/* =====================================================================
   SE END — read from the Street View close-ups of the drive:
   two ramps side by side from the cobbled crossing, the left one DOWN to
   the lower parking door, the right one gently UP to the upper door; both
   doors face the street under a roof terrace with a light railing. The
   4 bis entrance is a recessed porch between the upper door and the side
   of the building. Corner planter with the "4"; No. 6's gate, steps and
   fenced path climb beside the sloping retaining wall.
   ===================================================================== */
const DW = { rw: [-12.4, -12.0], down: [-12.0, -7.6], sep: [-7.6, -7.2], up: [-7.2, -3.0], nw: [-3.0, -2.6], porch: [-2.6, 0] };
const DOOR_LOW = [-11.5, -8.1], DOOR_UP = [-6.8, -3.4];
const LOW_TOP = LOW + 2.1;
const DOWN_END = -6.8;             // the down ramp reaches the lower floor here
const RAMP_Y0 = SW_Y - 0.03;       // cobble level where both ramps start
const upY = (z) => lerp(RAMP_Y0, UP, clamp((RAMP0 - z) / (RAMP0 - GF), 0, 1));
const downY = (z) => lerp(RAMP_Y0, LOW, clamp((RAMP0 - z) / (RAMP0 - DOWN_END), 0, 1));
const pathY = (z) => z >= 4.6 ? SW_Y : z >= 3.2 ? lerp(SW_Y, 1.0, (4.6 - z) / 1.4)
  : z >= GF ? lerp(1.0, 3.0, (3.2 - z) / (3.2 - GF)) : 3.0 + Math.min(0.4, (GF - z) * 0.05);
const wallTopY = (z) => lerp(0.9, T_TOP, clamp((RAMP0 - z) / (RAMP0 - GF), 0, 1));

function planeMesh(group, mat, w, h, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
  group.add(m); return m;
}

function buildDrive(group) {
  const C = 'concrete';
  const [ux0, ux1] = DW.up, [dx0, dx1] = DW.down;

  // ---- ramp surfaces
  bag('ramp').quad([ux0, RAMP_Y0, RAMP0], [ux1, RAMP_Y0, RAMP0], [ux1, UP, GF], [ux0, UP, GF], [0, 1, 0]);
  bag('ramp').quad([dx0, RAMP_Y0, RAMP0], [dx1, RAMP_Y0, RAMP0], [dx1, LOW, DOWN_END], [dx0, LOW, DOWN_END], [0, 1, 0]);
  bag('ramp').quad([dx0, LOW, DOWN_END], [dx1, LOW, DOWN_END], [dx1, LOW, GF], [dx0, LOW, GF], [0, 1, 0]);
  bag('metal').boxAB(dx0 + 0.45, LOW - 0.02, GF + 0.3, dx1 - 0.45, LOW + 0.012, GF + 0.6); // drain, at the lowest point just in front of the door
  // mossy kerbs along both sides of the up ramp
  const kerb = (x0, x1, zEnd) => bag('darkConcrete').extrudeX(x0, x1,
    [[RAMP0, RAMP_Y0 - 0.02], [RAMP0, RAMP_Y0 + 0.16], [zEnd, upY(zEnd) + 0.16], [zEnd, upY(zEnd) - 0.02]]);
  kerb(ux0, ux0 + 0.24, GF);
  kerb(ux1 - 0.24, ux1, -9.2);
  // narrow raised walkways along both walls of the down ramp, down to the lower garage door (photo)
  const ledge = (x0, x1) => bag('darkConcrete').extrudeX(x0, x1,
    [[RAMP0, RAMP_Y0 - 0.02], [RAMP0, RAMP_Y0 + 0.16], [DOWN_END, LOW + 0.16], [GF, LOW + 0.16], [GF, LOW - 0.02], [DOWN_END, LOW - 0.02]]);
  ledge(dx0, dx0 + 0.45);
  ledge(dx1 - 0.45, dx1);

  // ---- walls along the ramps
  bag(C).boxAB(DW.sep[0], LOW - 0.1, GF, DW.sep[1], 1.25, 2.4);          // separating wall
  bag(C).boxAB(DW.sep[0], LOW - 0.1, 2.4, DW.sep[1], 0.78, RAMP0);       // its lower pier at the street end
  bag(C).boxAB(DW.nw[0], -0.3, TALL_Z, DW.nw[1], 1.25, RAMP0);           // up ramp / planter wall beside the tall planter
  bag(C).boxAB(DW.nw[0], -0.3, -9.2, DW.nw[1], WALL_H, TALL_Z);           // ... higher behind the step planter
  bag('flashing').boxAB(DW.nw[0] - 0.02, WALL_H, -9.2, DW.nw[1] + 0.02, WALL_H + 0.04, TALL_Z);
  bag(C).extrudeX(DW.rw[0], DW.rw[1], [[RAMP0, LOW - 0.1], [RAMP0, 0.9], [GF, T_TOP], [GF, LOW - 0.1]]); // retaining wall

  // ---- garage front (orange render) with the two doors
  const FR = makeFace([GX0, GF], [0, 1], -2.6 - GX0);
  const sx = (x) => x - GX0;
  rect('orange', FR, sx(dx0), sx(DOOR_LOW[0]), LOW, T_BOT);
  rect('orange', FR, sx(DOOR_LOW[1]), sx(DW.sep[0]), LOW, T_BOT);
  rect('orange', FR, sx(DOOR_LOW[0]), sx(DOOR_LOW[1]), LOW_TOP, T_BOT);
  rect('orange', FR, sx(DW.sep[0]), sx(DOOR_UP[0]), UP - 0.3, T_BOT);
  rect('orange', FR, sx(DOOR_UP[1]), sx(-2.6), UP - 0.3, T_BOT);
  const door = (x0, x1, y0, y1, mat) => {
    const r = 0.25;
    bag('reveal').quad([x0, y0, GF], [x0, y0, GF - r], [x0, y1, GF - r], [x0, y1, GF], [1, 0, 0]);
    bag('reveal').quad([x1, y0, GF], [x1, y0, GF - r], [x1, y1, GF - r], [x1, y1, GF], [-1, 0, 0]);
    bag('reveal').quad([x0, y1, GF], [x1, y1, GF], [x1, y1, GF - r], [x0, y1, GF - r], [0, -1, 0]);
    planeMesh(group, mat, x1 - x0, y1 - y0, (x0 + x1) / 2, (y0 + y1) / 2, GF - r);
    bag('darkConcrete').boxAB(x0, y0 - 0.03, GF - r, x1, y0 + 0.015, GF);
  };
  door(DOOR_LOW[0], DOOR_LOW[1], LOW, LOW_TOP, M.garageDoorLow);
  door(DOOR_UP[0], DOOR_UP[1], UP, T_BOT, M.garageDoor);

  // ---- roof terrace over the parking, in front of the wing
  bag('wall').boxAB(GX0, T_BOT, -12.4, 0, T_TOP, GF + 0.06);             // front slab (edge band, porch ceiling)
  const B = bag(C);
  B.quad([GX0, T_TOP, -24.4], [-1.5, T_TOP, -24.4], [-1.5, T_TOP, -12.4], [GX0, T_TOP, -12.4], [0, 1, 0]);
  B.quad([GX0, LOW - 0.1, -24.4], [GX0, LOW - 0.1, -12.4], [GX0, T_TOP, -12.4], [GX0, T_TOP, -24.4], [-1, 0, 0]);
  B.quad([GX0, LOW - 0.1, -24.4], [-1.5, LOW - 0.1, -24.4], [-1.5, T_TOP, -24.4], [GX0, T_TOP, -24.4], [0, 0, -1]);
  bag('wall').boxAB(GX0 - 0.05, T_TOP - 0.7, -24.45, GX0, T_TOP + 0.02, GF);
  bag('wall').boxAB(GX0, T_TOP - 0.7, -24.45, -1.5, T_TOP + 0.02, -24.4);
  railingRun([[GX0 + 0.12, GF - 0.1], [-0.45, GF - 0.1]], T_TOP, 1.05, 'railLight', 0.13);
  railingRun([[GX0 + 0.12, -24.3], [GX0 + 0.12, GF - 0.1]], T_TOP, 1.05, 'railLight', 0.13);
  railingRun([[GX0 + 0.12, -24.3], [-1.6, -24.3]], T_TOP, 1.05, 'railLight', 0.13);
  bag('wall').boxAB(-10.6, T_TOP, -15.2, -7.8, T_TOP + 0.85, -13.5, true); // vent / stair housing on the terrace
  bag('flashing').boxAB(-10.65, T_TOP + 0.85, -15.25, -7.75, T_TOP + 0.9, -13.45);

  // ---- 4 bis: a narrow walkway runs from the street along the SE gable, between the hedge planter
  //      (behind the up ramp's wall) and a small plant box against the building. It ends in a covered
  //      landing under the terrace; the 4 bis door is in the gable wall on the right, not facing the walkway.
  const [px0, px1] = DW.porch;
  bag('cobble').extrudeX(WK0, WK1, [[RAMP0, -0.3], [RAMP0, walkY(RAMP0)], [LAND, PORCH_Y], [LAND, -0.3]]);   // cobbled, like the drive
  bag('cobble').extrudeX(STEP_X, WK0, [[TALL_Z, -0.3], [TALL_Z, walkY(TALL_Z)], [LAND, PORCH_Y], [LAND, -0.3]]);   // wider beside the step
  bag('paving').boxAB(px0, -0.3, -12.4, px1, PORCH_Y, LAND);                  // covered landing
  // small plant box against the gable, all along the walkway
  const BAC = 0.5;
  bag(C).extrudeX(WK1, WK1 + 0.1, [[0, -0.3], [0, walkY(0) + BAC], [LAND, PORCH_Y + BAC], [LAND, -0.3]]);
  bag('soil').extrudeX(WK1 + 0.1, -0.01, [[0, -0.3], [0, walkY(0) + BAC - 0.06], [LAND + 0.1, walkY(LAND + 0.1) + BAC - 0.06], [LAND + 0.1, -0.3]]);
  bag(C).boxAB(WK1, -0.3, LAND, -0.01, PORCH_Y + BAC, LAND + 0.1);
  // landing walls: blank end wall, garage block on the left, the gable with the door on the right
  const po = bag('orange'), bz = -12.39;
  po.quad([px0, PORCH_Y, bz], [px1, PORCH_Y, bz], [px1, T_BOT, bz], [px0, T_BOT, bz], [0, 0, 1]);
  po.quad([px0 + 0.002, PORCH_Y, -12.4], [px0 + 0.002, PORCH_Y, GF], [px0 + 0.002, T_BOT, GF], [px0 + 0.002, T_BOT, -12.4], [1, 0, 0]);
  const DZ0 = -12.15, DZ1 = -10.95, DTOP = PORCH_Y + 2.05, gx = -0.012;
  const gq = (z0, z1, y0, y1) => po.quad([gx, y0, z0], [gx, y0, z1], [gx, y1, z1], [gx, y1, z0], [-1, 0, 0]);
  gq(-12.4, DZ0, PORCH_Y, T_BOT); gq(DZ1, GF, PORCH_Y, T_BOT); gq(DZ0, DZ1, DTOP, T_BOT);
  // glazed 4 bis door, aluminium frame, facing the walkway
  const mt = bag('metal'), fx0 = -0.07, fx1 = -0.008;
  mt.boxAB(fx0, PORCH_Y, DZ0, fx1, DTOP, DZ0 + 0.08);
  mt.boxAB(fx0, PORCH_Y, DZ1 - 0.08, fx1, DTOP, DZ1);
  mt.boxAB(fx0, DTOP - 0.09, DZ0, fx1, DTOP, DZ1);
  mt.boxAB(fx0, PORCH_Y, DZ0, fx1, PORCH_Y + 0.12, DZ1);
  bag('glassLit').quad([-0.035, PORCH_Y + 0.12, DZ0 + 0.08], [-0.035, PORCH_Y + 0.12, DZ1 - 0.08], [-0.035, DTOP - 0.09, DZ1 - 0.08], [-0.035, DTOP - 0.09, DZ0 + 0.08], [-1, 0, 0]);
  bag('frame').boxAB(-0.13, PORCH_Y + 1.0, DZ0 + 0.2, -0.07, PORCH_Y + 1.05, DZ1 - 0.2);   // push bar
  bag(C).boxAB(-0.5, PORCH_Y, DZ0 - 0.05, -0.008, PORCH_Y + 0.04, DZ1 + 0.05);            // threshold
  // planter against the end wall: the plants seen at the back of the walkway from the street
  bag(C).boxAB(-2.5, PORCH_Y, -12.36, -1.0, PORCH_Y + 0.5, -11.8);
  bag('soil').boxAB(-2.44, PORCH_Y + 0.45, -12.3, -1.06, PORCH_Y + 0.51, -11.86);
  bag('lampHead').cyl([-1.2, T_BOT - 0.07, -11.3], [-1.2, T_BOT, -11.3], 0.17, 0.17, 10, true);

  // ---- ground floor of the SE gable along the drive: white pier + barred window, orange behind the hedge
  const BF = makeFace([0, -12.4], [-1, 0], 12.4);       // s = z + 12.4
  const s0 = GF + 12.4;
  rect('wall', BF, 0, s0, T_TOP - 0.05, LV(1));          // above the terrace slab
  rect('wall', BF, s0, 3.3, PORCH_Y, T_BOT, 0.012);
  rect('orange', BF, 3.3, 12.4, 0.2, T_BOT, 0.012);
  const wa = 2.15, wb = 2.95, wy0 = 0.95, wy1 = 2.3;
  rect('glass', BF, wa + 0.06, wb - 0.06, wy0 + 0.06, wy1 - 0.06, 0.02);
  rect('frame', BF, wa, wb, wy0, wy0 + 0.06, 0.03); rect('frame', BF, wa, wb, wy1 - 0.06, wy1, 0.03);
  rect('frame', BF, wa, wa + 0.06, wy0, wy1, 0.03); rect('frame', BF, wb - 0.06, wb, wy0, wy1, 0.03);
  for (let s = wa + 0.13; s < wb - 0.08; s += 0.1) { const p = BF.P(s, 0, 0.075); bag('frame').box(p[0], (wy0 + wy1) / 2, p[2], 0.022, wy1 - wy0 - 0.04, 0.022); }
  for (const y of [wy0 + 0.35, wy1 - 0.35]) { const a = BF.P(wa + 0.05, 0, 0.075), b = BF.P(wb - 0.05, 0, 0.075); bag('frame').segBox(a[0], a[2], b[0], b[2], y - 0.015, y + 0.015, 0.02); }
  bag('sill').boxAB(-0.09, wy0 - 0.05, wa - 12.43, 0, wy0, wb - 12.37);
  // white band at first-floor level along the gable, with darker soffits so it reads as a projection
  bag('wall').boxAB(-0.3, T_BOT, GF, 0, LV(1), 0);
  bag('soffit').quad([-0.3, T_BOT - 0.004, GF], [0, T_BOT - 0.004, GF], [0, T_BOT - 0.004, 0], [-0.3, T_BOT - 0.004, 0], [0, -1, 0]);
  bag('soffit').quad([GX0, T_BOT - 0.004, -12.4], [0, T_BOT - 0.004, -12.4], [0, T_BOT - 0.004, GF + 0.06], [GX0, T_BOT - 0.004, GF + 0.06], [0, -1, 0]);

  // ---- planter strip along the gable + the corner post with the house number
  // left side of the 4 bis walkway: the tall planter at the street, with the "4" ...
  bag('soil').boxAB(-2.6, 0, TALL_Z + 0.12, WK0 - 0.12, 0.95, 4.6, true);
  bag(C).boxAB(WK0 - 0.12, -0.3, TALL_Z, WK0, 1.05, 4.6);                 // its side along the walkway
  bag(C).boxAB(STEP_X, -0.3, TALL_Z, WK0 - 0.12, 1.05, TALL_Z + 0.12);    // its back, above the step
  // ... then, as you enter, a narrow low planter like a big step against the wall, still planted, up to the landing
  const stepTop = (z) => walkY(z) + STEP_H;
  bag(C).extrudeX(STEP_X - 0.1, STEP_X, [[TALL_Z, -0.3], [TALL_Z, stepTop(TALL_Z)], [-9.4, stepTop(-9.4)], [-9.4, -0.3]]);
  bag('soil').extrudeX(-2.6, STEP_X - 0.1, [[TALL_Z + 0.12, -0.3], [TALL_Z + 0.12, stepTop(TALL_Z) - 0.05], [-9.2, stepTop(-9.2) - 0.05], [-9.2, -0.3]]);
  bag(C).boxAB(-2.6, -0.3, -9.4, STEP_X - 0.1, stepTop(-9.4), -9.2);     // its end at the landing
  // beige electrical cabinet in front of the planter end, beside the "4"
  bag('cabinet').boxAB(-2.62, SW_Y - 0.1, 4.84, -2.05, SW_Y + 1.25, 5.22, true);
  bag('cabinet').boxAB(-2.65, SW_Y + 1.25, 4.82, -2.02, SW_Y + 1.29, 5.25, true);
  bag('darkConcrete').boxAB(-2.48, SW_Y + 1.02, 5.22, -2.38, SW_Y + 1.06, 5.225);
  bag('darkConcrete').boxAB(-2.55, SW_Y + 0.28, 5.22, -2.12, SW_Y + 0.3, 5.225);
  planeMesh(group, M.sign4, 0.24, 0.24, -1.8, 0.62, 4.846);               // the "4" beside the walkway opening

  // ---- No. 6 side: corner pier, iron gate, steps and the path climbing beside the retaining wall
  const nx0 = -15.2, nx1 = DW.rw[0];
  bag('brick').boxAB(-15.85, 0, 4.45, nx0, 2.35, 5.0, true);
  bag('flashing').boxAB(-15.9, 2.35, 4.4, nx0 + 0.05, 2.42, 5.05);
  planeMesh(group, M.plate6, 0.3, 0.22, -15.52, 2.0, 5.006);
  for (let i = 1; i <= 5; i++) bag(C).boxAB(nx0, 0, 4.6 - i * 0.28, nx1, SW_Y + i * 0.17, 4.6 - (i - 1) * 0.28, true);
  bag(C).quad([nx0, 1.0, 3.2], [nx1, 1.0, 3.2], [nx1, 3.0, GF], [nx0, 3.0, GF], [0, 1, 0]);
  railingRun([[nx0 + 0.04, 4.72], [nx1 - 0.04, 4.72]], RAMP_Y0, 1.85, 'metal', 0.11);
  bag('metal').boxAB(nx1 - 0.1, 0, 4.66, nx1, 2.0, 4.8);
  // chain-link fence on top of the retaining wall
  const fx = (DW.rw[0] + DW.rw[1]) / 2, fz0 = RAMP0 - 0.25, fz1 = GF + 0.25;
  for (let z = fz0; z > fz1 - 0.01; z -= (fz0 - fz1) / 6) bag('metal').cyl([fx, wallTopY(z) - 0.05, z], [fx, wallTopY(z) + 1.25, z], 0.025, 0.025, 6, true);
  bag('metal').cyl([fx, wallTopY(fz0) + 1.2, fz0], [fx, wallTopY(fz1) + 1.2, fz1], 0.012, 0.012, 4);
  bag('fence').quad([fx, wallTopY(fz0) + 0.05, fz0], [fx, wallTopY(fz1) + 0.05, fz1], [fx, wallTopY(fz1) + 1.2, fz1], [fx, wallTopY(fz0) + 1.2, fz0], [1, 0, 0]);
  // two brown wheelie bins inside the gate
  for (const [x0, x1] of [[-15.05, -14.45], [-14.35, -13.75]]) {
    bag('bin').boxAB(x0, pathY(2.3) - 0.05, 2.3, x1, pathY(2.3) + 1.0, 3.0, true);
    bag('bin').boxAB(x0 - 0.03, pathY(2.3) + 1.0, 2.27, x1 + 0.03, pathY(2.3) + 1.06, 3.03);
  }

  flushBags(group);
}

const carMats = {};

/* ---------------------------------------------------------- hedges */
function hedgeGeo(x0, x1, z0, z1, y0, y1, palette, seed, round = 0.35) {
  const w = x1 - x0, d = z1 - z0, h = y1 - y0;
  const g = new THREE.BoxGeometry(w, h, d, Math.max(2, Math.round(w / 0.32)), Math.max(2, Math.round(h / 0.3)), Math.max(2, Math.round(d / 0.3)));
  const pos = g.attributes.position;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), zz = pos.getZ(i);
    // round the top edges
    const ty = (y + h / 2) / h;
    if (ty > 0.6) {
      const k = (ty - 0.6) / 0.4, ex = Math.abs(zz) / (d / 2);
      zz *= 1 - round * k * k * ex;
      y -= h * 0.12 * k * k * ex;
    }
    const wx = x + cx, wy = y + cy, wz = zz + cz;
    const n1 = vnoise3(wx * 1.6, wy * 1.6, wz * 1.6, seed) - 0.5, n2 = vnoise3(wx * 1.6 + 9, wy * 1.6, wz * 1.6, seed) - 0.5, n3 = vnoise3(wx * 1.6, wy * 1.6 + 5, wz * 1.6, seed) - 0.5;
    const f = vnoise3(wx * 4.5, wy * 4.5, wz * 4.5, seed + 3) - 0.5;
    pos.setXYZ(i, wx + n1 * 0.32 + f * 0.1, Math.max(y0, wy + n3 * 0.22), wz + n2 * 0.32 + f * 0.1);
  }
  const ng = g.toNonIndexed(); g.dispose();
  ng.computeVertexNormals();
  const p2 = ng.attributes.position, cols = new Float32Array(p2.count * 3), c = new THREE.Color();
  for (let i = 0; i < p2.count; i += 3) {
    const yy = (p2.getY(i) + p2.getY(i + 1) + p2.getY(i + 2)) / 3, xx = p2.getX(i), zz = p2.getZ(i);
    const t = (yy - y0) / h, n = vnoise3(xx * 2.2, yy * 2.2, zz * 2.2, seed + 7);
    const base = palette.base[(n * palette.base.length) | 0] || palette.base[0];
    c.set(base);
    if (palette.tip && t > 0.62 && n > 0.45) c.lerp(new THREE.Color(palette.tip), smooth(0.62, 1.0, t) * 0.85);
    c.multiplyScalar(0.75 + 0.4 * t);
    for (let j = 0; j < 3; j++) { cols[(i + j) * 3] = c.r; cols[(i + j) * 3 + 1] = c.g; cols[(i + j) * 3 + 2] = c.b; }
  }
  ng.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  ng.deleteAttribute('uv');
  return ng;
}
const PHOTINIA = { base: ['#3f5a31', '#4b6a36', '#365029', '#56733c'], tip: '#8a3528' };
const THUJA = { base: ['#27412a', '#2f4d30', '#223823'] };
const BOX = { base: ['#45602f', '#3b5529', '#52703a'] };
const VARIEG = { base: ['#8e9a4f', '#a6ad5c', '#77853f', '#b5b46c'] };
function buildHedges(group) {
  const geos = [];
  // photinia hedge on the street planter, a few segments with natural breaks
  const segs = [[1.7, 7.5], [7.7, 16.2], [16.5, 25.5], [25.8, 33.4], [33.6, 35.5]];
  segs.forEach(([a, b], i) => geos.push(hedgeGeo(a, b, 3.35, 4.5, 0.95, 2.62 + (i % 2) * 0.12, PHOTINIA, 10 + i)));
  geos.push(hedgeGeo(45.0, 52.8, 3.2, 4.45, 1.25, 3.5, THUJA, 31, 0.15));
  // around the entrance of the 4: tall photinia beside the stair, planted recess, shrubs to the right
  geos.push(hedgeGeo(34.9, 36.25, 0.4, 2.7, 0.95, 2.75, PHOTINIA, 150, 0.45));
  geos.push(hedgeGeo(38.95, 39.85, -1.25, -0.3, 2.07, 2.95, VARIEG, 151, 0.55));
  geos.push(hedgeGeo(40.2, 41.1, -1.3, -0.45, 2.07, 3.15, BOX, 152, 0.5));
  geos.push(hedgeGeo(39.6, 40.15, 0.4, 1.5, 2.07, 2.45, BOX, 153, 0.6));
  geos.push(hedgeGeo(41.35, 42.9, 1.45, 3.3, 0.95, 2.7, BOX, 154, 0.5));
  geos.push(hedgeGeo(42.9, 44.5, 0.15, 1.15, 2.0, 2.9, PHOTINIA, 155, 0.5));
  // shrubs near the façade and on the ramp-side terrace
  const r = rng(77);
  for (let i = 0; i < 16; i++) {
    const x = 1 + r() * 37;
    const s = 0.7 + r() * 0.8;
    if (x + s * 1.3 > 34.9) continue;          // keep clear of the stair of the 4
    geos.push(hedgeGeo(x, x + s * 1.3, 0.5, 0.5 + s, 0.95, 0.95 + s * 1.1, BOX, 50 + i, 0.5));
  }
  // planter strip along the SE gable, between the up ramp and the building (photinia + box, big corner shrub)
  // kept low near the porch so the 4 bis entrance and the barred window stay visible from the street
  geos.push(hedgeGeo(-2.55, WK0 - 0.1, TALL_Z + 0.2, 4.45, 0.95, 2.45, BOX, 90, 0.35));   // big shrub on the tall planter
  {   // the low step planter: a narrow line of low green, with a few small box balls
    const sy = (z) => walkY(z) + STEP_H - 0.05, r = rng(424);
    for (let z = TALL_Z - 0.15; z > -9.0; z -= 1.3 + r() * 0.7) {
      const z0 = Math.max(-9.1, z - 1.0 - r() * 0.7), big = r() < 0.3;
      geos.push(hedgeGeo(-2.55, STEP_X - 0.14, z0, z, sy(z), sy(z) + (big ? 0.42 : 0.18 + r() * 0.12), BOX, 600 + Math.round(z * 10), 0.5));
    }
  }
  // low plants in the small box against the gable, along the 4 bis walkway
  [[-1.7, -0.3], [-3.8, -2.4], [-5.9, -4.5], [-8.0, -6.6], [-9.15, -8.4]]
    .forEach(([z0, z1], i) => geos.push(hedgeGeo(WK1 + 0.1, -0.04, z0, z1, walkY(z1) + 0.44, walkY(z1) + 0.95 + (i % 2) * 0.2, i % 2 ? PHOTINIA : BOX, 110 + i, 0.5)));
  geos.push(hedgeGeo(-2.42, -1.1, -12.28, -11.9, PORCH_Y + 0.5, PORCH_Y + 1.3, BOX, 97, 0.5));      // planter at the end of the walkway
  geos.push(hedgeGeo(-12.0, -10.6, -11.9, -11.0, T_TOP, T_TOP + 1.05, BOX, 98, 0.5));               // terrace shrubs
  geos.push(hedgeGeo(-9.8, -8.6, -12.0, -11.1, T_TOP, T_TOP + 0.8, PHOTINIA, 99, 0.5));
  // garden-side shrub beds
  for (let i = 0; i < 10; i++) {
    const x = 15 + r() * 36, s = 0.9 + r() * 1.1;
    geos.push(hedgeGeo(x, x + s * 1.4, -14.6 - s, -13.4, 1.0, 1.0 + s, BOX, 120 + i, 0.5));
  }
  // neighbours' front hedges
  geos.push(hedgeGeo(53.4, 82, 2.8, 4.2, 0.0, 2.4, THUJA, 140, 0.15));
  geos.push(hedgeGeo(-37, -16.2, 1.2, 2.4, 0.0, 1.9, BOX, 141, 0.3));
  const merged = mergeGeos(geos);
  const mesh = new THREE.Mesh(merged, M.hedge);
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
}
function mergeGeos(geos) {
  let n = 0; for (const g of geos) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.color) col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}

/* =====================================================================
   NEIGHBOURS
   ===================================================================== */
function buildNeighbours(group) {
  // --- SE: meulière apartment building (millstone, brick trims, iron balconies, hipped slate roof)
  {
    const x0 = -36.4, x1 = -15.2, z0 = -14.2, z1 = -2.6, top = 15.6;
    const b = bag('meuliere');
    b.quad([x0, 0, z1], [x1, 0, z1], [x1, top, z1], [x0, top, z1], [0, 0, 1]);
    b.quad([x1, 0, z0], [x1, 0, z1], [x1, top, z1], [x1, top, z0], [1, 0, 0]);
    b.quad([x0, 0, z0], [x0, 0, z1], [x0, top, z1], [x0, top, z0], [-1, 0, 0]);
    b.quad([x0, 0, z0], [x1, 0, z0], [x1, top, z0], [x0, top, z0], [0, 0, -1]);
    // floor bands in stone
    for (let f = 1; f <= 5; f++) {
      const y = 0.6 + f * 3.0;
      bag('concrete').boxAB(x0 - 0.06, y - 0.18, z1 - 0.02, x1 + 0.06, y, z1 + 0.08);
      bag('concrete').boxAB(x1 - 0.02, y - 0.18, z0 - 0.06, x1 + 0.08, y, z1 + 0.06);
    }
    bag('concrete').boxAB(x0 - 0.25, top - 0.1, z0 - 0.25, x1 + 0.25, top + 0.25, z1 + 0.25);
    // windows with brick surrounds, balconies with black railings
    for (let f = 0; f < 5; f++) {
      const y = 0.6 + f * 3.0 + 0.55;
      for (let i = 0; i < 6; i++) {
        const cx = x0 + 1.9 + i * 3.45;
        bag('brick').boxAB(cx - 0.78, y - 0.12, z1 - 0.02, cx + 0.78, y + 2.18, z1 + 0.05);
        bag('glass').quad([cx - 0.58, y, z1 + 0.055], [cx + 0.58, y, z1 + 0.055], [cx + 0.58, y + 2.0, z1 + 0.055], [cx - 0.58, y + 2.0, z1 + 0.055], [0, 0, 1]);
        bag('frame').boxAB(cx - 0.03, y, z1 + 0.05, cx + 0.03, y + 2.0, z1 + 0.07);
        if (f >= 1 && (i % 2 === 0 || f === 2)) {
          bag('concrete').boxAB(cx - 1.05, y - 0.2, z1, cx + 1.05, y - 0.05, z1 + 0.75);
          railingRun([[cx - 1.0, z1 + 0.72], [cx + 1.0, z1 + 0.72]], y - 0.05, 0.95, 'metal', 0.14);
          railingRun([[cx - 1.0, z1], [cx - 1.0, z1 + 0.72]], y - 0.05, 0.95, 'metal', 0.14);
          railingRun([[cx + 1.0, z1], [cx + 1.0, z1 + 0.72]], y - 0.05, 0.95, 'metal', 0.14);
        }
      }
      for (let i = 0; i < 3; i++) {
        const cz = z0 + 2.2 + i * 3.6;
        bag('brick').boxAB(x1 - 0.05, y - 0.12, cz - 0.7, x1 + 0.02, y + 2.18, cz + 0.7);
        bag('glass').quad([x1 + 0.025, y, cz - 0.52], [x1 + 0.025, y, cz + 0.52], [x1 + 0.025, y + 2.0, cz + 0.52], [x1 + 0.025, y + 2.0, cz - 0.52], [1, 0, 0]);
        // iron balconies on the side facing our drive
        if (f >= 1 && i !== 1) {
          bag('concrete').boxAB(x1, y - 0.2, cz - 1.0, x1 + 0.72, y - 0.05, cz + 1.0);
          railingRun([[x1 + 0.7, cz - 0.98], [x1 + 0.7, cz + 0.98]], y - 0.05, 0.95, 'metal', 0.14);
          railingRun([[x1, cz - 0.98], [x1 + 0.7, cz - 0.98]], y - 0.05, 0.95, 'metal', 0.14);
          railingRun([[x1, cz + 0.98], [x1 + 0.7, cz + 0.98]], y - 0.05, 0.95, 'metal', 0.14);
        }
      }
    }
    hipRoof('slate', x0 - 0.25, z0 - 0.25, x1 + 0.25, z1 + 0.25, top + 0.25, 4.2);
    // chimneys
    bag('brick').boxAB(-31, top + 2, -9.5, -30.2, top + 5.2, -8.6);
    bag('brick').boxAB(-20, top + 2, -9.5, -19.2, top + 5.0, -8.6);
    // low front wall (the corner pier with the "6" and the gate are built with the drive)
    bag('concrete').boxAB(-37, 0, 4.6, -15.85, 0.9, 4.84);
  }
  // --- NW: modern white clinic building with glazed stair tower and slate mansard
  {
    const x0 = 57.6, x1 = 84, z0 = -14, z1 = -0.9, top = 15.2;
    const cl = bag('cladding');
    cl.quad([x0, 0, z1], [x1, 0, z1], [x1, top, z1], [x0, top, z1], [0, 0, 1]);
    cl.quad([x1, 0, z0], [x1, 0, z1], [x1, top, z1], [x1, top, z0], [1, 0, 0]);
    cl.quad([x0, 0, z0], [x1, 0, z0], [x1, top, z0], [x0, top, z0], [0, 0, -1]);
    cl.quad([x0, 0, z0], [x0, 0, z1], [x0, top, z1], [x0, top, z0], [-1, 0, 0]);
    for (let f = 0; f < 5; f++) {
      const y = 0.5 + f * 3.0;
      bag('cladding').boxAB(x0, y + 2.4, z1, x1, y + 2.75, z1 + 0.18);
      for (let i = 0; i < 8; i++) {
        const cx = x0 + 1.7 + i * 3.2;
        bag('glass').quad([cx - 0.9, y + 0.5, z1 + 0.02], [cx + 0.9, y + 0.5, z1 + 0.02], [cx + 0.9, y + 2.3, z1 + 0.02], [cx - 0.9, y + 2.3, z1 + 0.02], [0, 0, 1]);
        bag('frame').boxAB(cx - 0.03, y + 0.5, z1 + 0.02, cx + 0.03, y + 2.3, z1 + 0.06);
      }
    }
    // stair tower (curtain wall) against our NW gable
    const t0 = 53.2, t1 = 57.6, tz0 = -7.8, tz1 = -0.4, ttop = 16.6;
    const cw = bag('curtainWall');
    cw.quad([t0, 0, tz1], [t1, 0, tz1], [t1, ttop, tz1], [t0, ttop, tz1], [0, 0, 1]);
    cw.quad([t1, 0, tz0], [t1, 0, tz1], [t1, ttop, tz1], [t1, ttop, tz0], [1, 0, 0]);
    bag('cladding').boxAB(t0, ttop, tz0, t1, ttop + 0.35, tz1);
    bag('cladding').boxAB(t0 - 0.05, 0, tz1 - 0.1, t0 + 0.35, ttop + 0.35, tz1 + 0.05);
    // mansard
    mansard('slate', x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2, top, 3.2, 2.2);
    for (let i = 0; i < 6; i++) {
      const cx = x0 + 3 + i * 4;
      bag('cladding').boxAB(cx - 0.8, top + 0.6, z1 - 1.3, cx + 0.8, top + 2.4, z1 - 0.4);
      bag('glass').quad([cx - 0.55, top + 0.8, z1 - 0.39], [cx + 0.55, top + 0.8, z1 - 0.39], [cx + 0.55, top + 2.1, z1 - 0.39], [cx - 0.55, top + 2.1, z1 - 0.39], [0, 0, 1]);
    }
  }
  // across the street: kept as plain lawn beyond the far pavement (terrain), no buildings or parking
  flushBags(group);
}
function hipRoof(mk, x0, z0, x1, z1, y, h) {
  const zm = (z0 + z1) / 2, dz = (z1 - z0) / 2;
  const a = [x0 + dz, y + h, zm], b = [x1 - dz, y + h, zm];
  const r = bag(mk);
  r.quad([x0, y, z1], [x1, y, z1], b, a, [0, 1, 1]);
  r.quad([x1, y, z0], [x0, y, z0], a, b, [0, 1, -1]);
  r.tri([x0, y, z0], [x0, y, z1], a, [-1, 1, 0]);
  r.tri([x1, y, z1], [x1, y, z0], b, [1, 1, 0]);
}
function mansard(mk, x0, z0, x1, z1, y, h, inset) {
  const r = bag(mk);
  const X0 = x0 + inset, X1 = x1 - inset, Z0 = z0 + inset, Z1 = z1 - inset, Y = y + h;
  r.quad([x0, y, z1], [x1, y, z1], [X1, Y, Z1], [X0, Y, Z1], [0, 1, 1]);
  r.quad([x1, y, z0], [x0, y, z0], [X0, Y, Z0], [X1, Y, Z0], [0, 1, -1]);
  r.quad([x0, y, z0], [x0, y, z1], [X0, Y, Z1], [X0, Y, Z0], [-1, 1, 0]);
  r.quad([x1, y, z1], [x1, y, z0], [X1, Y, Z0], [X1, Y, Z1], [1, 1, 0]);
  bag('bgRoof').quad([X0, Y, Z0], [X1, Y, Z0], [X1, Y, Z1], [X0, Y, Z1], [0, 1, 0]);
}

/* =====================================================================
   TERRAIN + VEGETATION
   ===================================================================== */
function inRect(x, z, x0, z0, x1, z1) { return x >= x0 && x <= x1 && z >= z0 && z <= z1; }
// The whole site rises evenly behind the building towards the woods: one slope across the full
// width, no valley. Neighbouring plots sit near pavement level at the front and join the same slope.
const hill = (z) => 1.05 + 0.15 * Math.max(0, -z - 26);
function groundH(x, z) {
  const onPath = x >= -15.4 && x <= -11.9 && z <= RAMP0;   // No. 6's side path beside our retaining wall
  if (z > -0.4 && !onPath) return z > 24.3 ? 0.12 + (fbm2(x * 0.05, z * 0.05, 2, 3) - 0.5) * 0.15 : -0.05;
  const ours = smooth(-17.5, -14.5, x) * (1 - smooth(52, 56, x));    // 1 on our plot, 0 on No. 6 / the clinic
  let h = lerp(lerp(0.15, 1.05, ours), hill(z), Math.max(ours, smooth(-12, -40, z)));
  h += (fbm2(x * 0.03, z * 0.03, 3, 5) - 0.5) * 1.4 * smooth(0, 30, Math.max(0, -z - 29));   // gentle undulation
  if (onPath) h = lerp(pathY(z) - 0.08, h, smooth(-24, -34, z));   // just under the paved path, then into the slope
  return h;
}
function buildTerrain(group) {
  const W = 420, D = 360, nx = 210, nz = 180, X0 = -160, Z0 = -275;
  const g = new THREE.PlaneGeometry(W, D, nx, nz);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, uv = g.attributes.uv, cols = new Float32Array(pos.count * 3), c = new THREE.Color();
  const lawn = new THREE.Color('#6f8c4c'), forest = new THREE.Color('#4d5a35'), dry = new THREE.Color('#7a7a55');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + X0 + W / 2, z = pos.getZ(i) + Z0 + D / 2;
    const h = groundH(x, z);
    pos.setXYZ(i, x, h, z);
    uv.setXY(i, x, z);
    const f = smooth(-22, -40, z) * (x > -20 && x < 90 ? 1 : 0.7);
    const n = fbm2(x * 0.08, z * 0.08, 3, 9);
    c.copy(lawn).lerp(forest, clamp(f + (n - 0.5) * 0.6, 0, 1)).lerp(dry, clamp((n - 0.6) * 1.2, 0, 0.35));
    cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  // drop the grid cells covered by the drive, garage block, 4 bis porch and gable planter (modelled
  // explicitly). The cut follows the 2 m grid (x even, z odd) so no gaps open at its edges.
  const idx = g.index.array, keep = [];
  for (let i = 0; i < idx.length; i += 3) {
    let cx = 0, cz = 0;
    for (let j = 0; j < 3; j++) { cx += pos.getX(idx[i + j]) / 3; cz += pos.getZ(idx[i + j]) / 3; }
    if (cx > -12 && cx < 0 && cz > -23 && cz < 5) continue;
    keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  g.setIndex(keep);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, M.ground);
  mesh.receiveShadow = true;
  group.add(mesh);
}

// procedural trees: branching skeleton + leaf clusters
const ICO = [0, 1].map((d) => Array.from(new THREE.IcosahedronGeometry(1, d).attributes.position.array));
const LEAF_COLS = ['#4a6a33', '#557538', '#3f5e2d', '#5d7c3e', '#4d6f35', '#68833f'].map((h) => new THREE.Color(h));
function leafBlob(b, c, r, rr, flat = 1, detail = 0) {
  const ico = ICO[detail];
  const seed = (c[0] * 13.7 + c[1] * 7.1 + c[2] * 3.3) | 0;
  const col = LEAF_COLS[(rr() * LEAF_COLS.length) | 0].clone().multiplyScalar(0.85 + rr() * 0.3);
  for (let i = 0; i < ico.length; i += 9) {
    const v = [], n = [], cs = [];
    for (let j = 0; j < 3; j++) {
      const x = ico[i + j * 3], y = ico[i + j * 3 + 1], z = ico[i + j * 3 + 2];
      const k = (0.82 + 0.36 * hash3(Math.round(x * 40), Math.round(y * 40), Math.round(z * 40), seed)) * r;
      v.push([c[0] + x * k, c[1] + y * k * flat, c[2] + z * k]);
      n.push(nrm([x, y * 0.8 + 0.25, z]));
      const sh = (0.72 + 0.34 * (y * 0.5 + 0.5)) * (0.86 + 0.28 * hash3(Math.round(x * 40) + 3, Math.round(y * 40), Math.round(z * 40), seed + 11));
      cs.push([col.r * sh, col.g * sh, col.b * sh]);
    }
    b.p.push(...v[0], ...v[1], ...v[2]); b.n.push(...n[0], ...n[1], ...n[2]);
    b.uv.push(0, 0, 0, 0, 0, 0);
    (b.col ||= []).push(...cs[0], ...cs[1], ...cs[2]);
  }
}
function perturb(dir, ang, r) {
  const tmp = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = nrm(cross(dir, tmp)), v = cross(dir, u), phi = r() * Math.PI * 2;
  const s = Math.sin(ang), c = Math.cos(ang);
  const d = [dir[0] * c + (u[0] * Math.cos(phi) + v[0] * Math.sin(phi)) * s, dir[1] * c + (u[1] * Math.cos(phi) + v[1] * Math.sin(phi)) * s + 0.12, dir[2] * c + (u[2] * Math.cos(phi) + v[2] * Math.sin(phi)) * s];
  return nrm(d);
}
function deciduous(seed, h, depth = 4, leafR = 1.3, detail = 0, keep = 1) {
  const r = rng(seed), bark = new Bag(), leaf = new Bag();
  const grow = (p, dir, len, rad, d) => {
    const q = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len];
    bark.cyl(p, q, rad, rad * 0.7, d >= depth - 1 ? 7 : d >= 2 ? 5 : 3);
    if (d === 0) { if (r() < keep) leafBlob(leaf, q, leafR * (0.75 + r() * 0.5), r, 0.8, detail); return; }
    const nb = d >= depth - 1 ? 3 + (r() < 0.5 ? 1 : 0) : 2 + (r() < 0.45 ? 1 : 0);
    for (let i = 0; i < nb; i++) {
      const t = i === 0 ? 1 : 0.5 + r() * 0.45;
      const s = [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];
      grow(s, perturb(dir, i === 0 ? 0.25 + r() * 0.2 : 0.55 + r() * 0.45, r), len * (0.66 + r() * 0.16), rad * 0.62, d - 1);
    }
    if (d <= 2 && r() < 0.5) leafBlob(leaf, q, leafR * 0.8, r, 0.8, detail);
  };
  grow([0, 0, 0], [0, 1, 0], h * 0.34, h * 0.024, depth);
  return { bark: bark.geometry(), leaf: leaf.geometry() };
}
function conifer(seed, h) {
  const r = rng(seed), bark = new Bag(), leaf = new Bag();
  bark.cyl([0, 0, 0], [0, h * 0.96, 0], h * 0.018, h * 0.005, 6);
  const tiers = 7;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers, y = h * (0.22 + t * 0.7), rad = h * 0.2 * (1 - t * 0.85) * (0.9 + r() * 0.2), ch = h * 0.24;
    const seg = 8, top = [0, y + ch, 0];
    for (let j = 0; j < seg; j++) {
      const a0 = (j / seg) * Math.PI * 2, a1 = ((j + 1) / seg) * Math.PI * 2;
      const j0 = 0.85 + 0.3 * hash3(i, j, seed, 1), j1 = 0.85 + 0.3 * hash3(i, (j + 1) % seg, seed, 1);
      const p0 = [Math.cos(a0) * rad * j0, y - 0.25 * j0, Math.sin(a0) * rad * j0], p1 = [Math.cos(a1) * rad * j1, y - 0.25 * j1, Math.sin(a1) * rad * j1];
      leaf.tri(p0, p1, top, [Math.cos((a0 + a1) / 2), 0.5, Math.sin((a0 + a1) / 2)]);
      leaf.tri(p0, [0, y + 0.2, 0], p1, [0, -1, 0]);
    }
  }
  return { bark: bark.geometry(), leaf: leaf.geometry() };
}

const FOLIAGE = [];   // deciduous leaf meshes (hidden in winter)
function buildVegetation(group) {
  const variants = [deciduous(11, 14, 3, 2.3), deciduous(23, 16, 3, 2.6), deciduous(37, 12, 3, 2.1)];
  const conifers = [conifer(5, 18), conifer(8, 15)];
  const spots = { d: [[], [], []], c: [[], []] };
  const r = rng(2024);
  const blocked = (x, z) =>
    inRect(x, z, -17, -34, 24, 6) || inRect(x, z, 10, -24, 56, 2) || inRect(x, z, -40, -18, -14, 26) ||
    inRect(x, z, 51, -18, 88, 26) || z > -1;
  const STEP = SMALL ? 12.5 : 10.2;
  for (let gx = -90; gx < 175; gx += STEP) for (let gz = -200; gz < 0; gz += STEP) {
    const x = gx + (r() - 0.5) * STEP * 0.8, z = gz + (r() - 0.5) * STEP * 0.8;
    if (blocked(x, z) || r() < (gz < -120 || gx < -60 || gx > 140 ? 0.45 : 0.1)) continue;
    const y = groundH(x, z);
    const s = 0.8 + r() * 0.5, rot = r() * Math.PI * 2;
    if (r() < 0.27) spots.c[(r() * 2) | 0].push([x, y, z, s, rot]);
    else spots.d[(r() * 3) | 0].push([x, y, z, s, rot]);
  }
  // street trees across the road, beyond the stretch opposite the residence (that side stays open lawn)
  for (let x = -70; x < 140; x += 11) { if (x > -50 && x < 96) continue; spots.d[(Math.abs(x) / 11 | 0) % 3].push([x + (r() - 0.5) * 2, 0.12, 27 + r() * 3, 0.55 + r() * 0.15, r() * 6]); }
  const near = (it) => Math.hypot(it[0] - 24, it[2] + 10) < 95;
  const inst = (geo, mat, all, shadow = true, reg = null) => {
    for (const [list, sh] of [[all.filter(near), shadow], [all.filter((i) => !near(i)), false]]) if (list.length) { const m = instOne(geo, mat, list, sh); if (reg) reg.push(m); }
  };
  const instOne = (geo, mat, list, shadow) => {
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    const o = new THREE.Object3D();
    list.forEach(([x, y, z, s, rot], i) => { o.position.set(x, y - 0.1, z); o.rotation.set(0, rot, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.castShadow = shadow; m.receiveShadow = true; m.frustumCulled = false;
    group.add(m); return m;
  };
  variants.forEach((v, i) => { inst(v.bark, M.bark, spots.d[i]); inst(v.leaf, M.leaf, spots.d[i], true, FOLIAGE); });
  conifers.forEach((v, i) => { inst(v.bark, M.bark, spots.c[i]); inst(v.leaf, M.leafDark, spots.c[i]); });
  // the two pavement trees from the photos (finer twigs)
  const t1 = deciduous(101, 9.5, 5, 0.6, 1, 0.55), t2 = deciduous(202, 8.5, 5, 0.56, 1, 0.55);
  for (const [t, x, z] of [[t1, 14.1, 8.35], [t2, 42.4, 8.35]]) {   // in the granite beds
    const b = new THREE.Mesh(t.bark, M.bark); b.name = 'streetTreeBark'; b.position.set(x, SW_Y + 0.3, z); b.castShadow = b.receiveShadow = true; group.add(b);
    const l = new THREE.Mesh(t.leaf, M.leaf); l.name = 'streetTreeLeaf'; l.position.copy(b.position); l.castShadow = true; l.receiveShadow = true; group.add(l); FOLIAGE.push(l);
  }
}

/* =====================================================================
   SKY, SUN, LIGHTS
   ===================================================================== */
const SITE = { lat: 48.7913, lon: 2.1464 };   // 4 rue du Pont Colbert (OpenStreetMap)
const FACADE_N = 41;     // bearing of the street façade normal (+z): long sides at 131° in the OpenStreetMap footprint
const bearingDir = (b) => { const a = (b - (FACADE_N + 180)) * D2R; return [Math.sin(a), 0, -Math.cos(a)]; };
function sunPosition(doy, hour, tz) {
  const B = (2 * Math.PI * (doy - 81)) / 365;
  const decl = 23.44 * D2R * Math.sin(B);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const solar = hour - tz + SITE.lon / 15 + eot / 60;
  const H = (solar - 12) * 15 * D2R, phi = SITE.lat * D2R;
  const sinEl = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H);
  const el = Math.asin(sinEl);
  let cosAz = (Math.sin(decl) - sinEl * Math.sin(phi)) / (Math.cos(el) * Math.cos(phi));
  let az = Math.acos(clamp(cosAz, -1, 1));
  if (H > 0) az = 2 * Math.PI - az;
  return { az: az * R2D, el: el * R2D };
}
const SEASONS = { winter: { doy: 355, tz: 1 }, equinox: { doy: 79, tz: 1 }, summer: { doy: 172, tz: 2 } };

const skyUniforms = {
  sunDir: { value: new THREE.Vector3(0, 1, 0) },
  zenith: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, groundCol: { value: new THREE.Color() },
  sunCol: { value: new THREE.Color() }, sunVis: { value: 1 },
};
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyUniforms, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`,
  fragmentShader: `uniform vec3 sunDir; uniform vec3 zenith; uniform vec3 horizon; uniform vec3 groundCol; uniform vec3 sunCol; uniform float sunVis; varying vec3 vDir;
    void main(){ vec3 d = normalize(vDir); float h = d.y;
      vec3 col = mix(horizon, zenith, pow(clamp(h,0.0,1.0), 0.55));
      col = mix(col, groundCol, smoothstep(0.0, -0.12, h));
      float s = max(dot(d, normalize(sunDir)), 0.0);
      col += sunCol * (pow(s, 900.0) * 14.0 + pow(s, 24.0) * 0.32 + pow(s, 4.0) * 0.08) * sunVis;
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), skyMat);
sky.frustumCulled = false;
scene.add(sky);
const envScene = new THREE.Scene();
const envSky = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat);
envScene.add(envSky);
const pmrem = new THREE.PMREMGenerator(renderer);
let envRT = null;

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(SMALL ? 2048 : 4096, SMALL ? 2048 : 4096);
const sc = sun.shadow.camera; sc.left = -78; sc.right = 78; sc.top = 78; sc.bottom = -78; sc.near = 20; sc.far = 420;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.045; sun.shadow.radius = 2.5;
const SUN_TARGET = new THREE.Vector3(22, 0, -12);
sun.target.position.copy(SUN_TARGET);
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xc3d7ee, 0x6e6658, 1.0);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0x8fa6d6, 0);
moon.position.set(-60, 120, 80);
scene.add(moon);
const lampLights = [];
for (const [x, z] of [[6.3, 10.7], [34.5, 10.7], [-14.5, 10.7]]) {
  const l = new THREE.PointLight(0xffc98a, 0, 26, 1.6); l.position.set(x, 7.6, z); scene.add(l); lampLights.push(l);
}

// key frames by solar altitude (deg)
const SKY_KEYS = [
  { e: -14, z: '#050a14', h: '#0d1626', s: '#000000', si: 0, hs: '#1c2840', hg: '#0a0b0e', hi: 0.22, ex: 1.05 },
  { e: -5, z: '#16243f', h: '#3c4664', s: '#ff7a40', si: 0, hs: '#3f4d6c', hg: '#18191d', hi: 0.4, ex: 1.0 },
  { e: 0, z: '#2f4a7e', h: '#e0936a', s: '#ff9550', si: 0.5, hs: '#7a8cb0', hg: '#38322c', hi: 0.6, ex: 1.0 },
  { e: 6, z: '#3b65a3', h: '#efbf90', s: '#ffbe80', si: 1.8, hs: '#a4b8d4', hg: '#574e43', hi: 0.85, ex: 1.0 },
  { e: 16, z: '#3c72b8', h: '#d3e0ea', s: '#fff0da', si: 2.9, hs: '#bad0e8', hg: '#6a6152', hi: 1.0, ex: 0.92 },
  { e: 45, z: '#3871bd', h: '#d0e1ef', s: '#fff7ec', si: 3.3, hs: '#c4d8ee', hg: '#706858', hi: 1.05, ex: 0.88 },
];
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function keyLerp(e, field, out) {
  const K = SKY_KEYS;
  if (e <= K[0].e) return typeof K[0][field] === 'number' ? K[0][field] : out.set(K[0][field]);
  for (let i = 0; i < K.length - 1; i++) {
    if (e <= K[i + 1].e) {
      const t = (e - K[i].e) / (K[i + 1].e - K[i].e);
      if (typeof K[i][field] === 'number') return lerp(K[i][field], K[i + 1][field], t);
      _c1.set(K[i][field]); _c2.set(K[i + 1][field]);
      return out.copy(_c1).lerp(_c2, t);
    }
  }
  const L = K[K.length - 1];
  return typeof L[field] === 'number' ? L[field] : out.set(L[field]);
}

const STATE = { season: 'summer', hour: 9.5, orbit: !REDUCED, floors: false, playingDay: false };
let lastEnvAt = 0, envDirty = true, nightF = 0, needsRender = true;
const invalidate = () => { needsRender = true; };
function applySun() {
  const S = SEASONS[STATE.season];
  const { az, el } = sunPosition(S.doy, STATE.hour, S.tz);
  const bd = bearingDir(az), ce = Math.cos(el * D2R), se = Math.sin(el * D2R);
  const dir = new THREE.Vector3(bd[0] * ce, se, bd[2] * ce).normalize();
  skyUniforms.sunDir.value.copy(dir);
  keyLerp(el, 'z', skyUniforms.zenith.value);
  keyLerp(el, 'h', skyUniforms.horizon.value);
  skyUniforms.groundCol.value.set(0x3d3b33).lerp(skyUniforms.horizon.value, 0.12).multiplyScalar(0.35 + 0.65 * smooth(-8, 12, el));
  keyLerp(el, 's', skyUniforms.sunCol.value);
  skyUniforms.sunVis.value = smooth(-3, 1, el);
  const lit = Math.max(el, 0.5);
  const ld = new THREE.Vector3(bd[0] * Math.cos(lit * D2R), Math.sin(lit * D2R), bd[2] * Math.cos(lit * D2R));
  sun.position.copy(SUN_TARGET).addScaledVector(ld, 220);
  keyLerp(el, 's', sun.color);
  sun.intensity = keyLerp(el, 'si') * smooth(-1.5, 2, el);
  sun.castShadow = el > -1.5;
  keyLerp(el, 'hs', hemi.color);
  keyLerp(el, 'hg', hemi.groundColor);
  hemi.intensity = keyLerp(el, 'hi');
  scene.fog.color.copy(skyUniforms.horizon.value);
  renderer.toneMappingExposure = keyLerp(el, 'ex');
  nightF = smooth(3, -7, el);
  moon.intensity = 0.35 * nightF;
  M.glassLit.emissiveIntensity = 2.4 * nightF;
  M.curtainLit.emissiveIntensity = 1.6 * nightF;
  M.lampHead.emissiveIntensity = 3.0 * nightF;
  M.poster.emissiveIntensity = 0.35 + 1.1 * nightF;
  for (const l of lampLights) l.intensity = 60 * nightF;
  envDirty = true;
  renderer.shadowMap.needsUpdate = true;
  invalidate();
  // read-outs
  const hh = Math.floor(STATE.hour + 1e-6), mm = Math.round((STATE.hour - hh) * 60);
  const hhmm = `${String(hh + (mm === 60 ? 1 : 0)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
  $('#timeOut').textContent = hhmm;
  $('#time').setAttribute('aria-valuetext', `${hhmm} ${T.localTime}`);
  $('#sunRead').textContent = el > -0.5 ? T.sunRead(Math.round(az), Math.round(el)) : T.sunDown;
}
function refreshEnv(force = false) {
  const now = performance.now();
  if (!envDirty || (!force && now - lastEnvAt < 180)) return;
  const old = envRT;
  envRT = pmrem.fromScene(envScene, 0, 0.1, 200);
  scene.environment = envRT.texture;
  if (old) old.dispose();
  lastEnvAt = now; envDirty = false;
  invalidate();
}

/* =====================================================================
   FLOOR LABELS + DIMENSIONS, ENTRANCE MARKERS
   ===================================================================== */
const overlay = new THREE.Group(); overlay.visible = false; scene.add(overlay);
const labelLayer = $('#labels');
const LABELS = [];
function addLabel(text, p, cls) {
  const el = document.createElement('div'); el.className = 'lab ' + cls; el.textContent = text; el.hidden = true;
  labelLayer.appendChild(el); LABELS.push({ el, p: new THREE.Vector3(...p), cls });
}
function line(pts, mat = M.dim) {
  const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
  const l = new THREE.LineSegments(g, mat); l.renderOrder = 10; overlay.add(l); return l;
}
function buildOverlay() {
  const seg = [];
  for (let k = 0; k <= 7; k++) {
    const y = LV(k);
    seg.push([-0.05, y, 0.06], [52.75, y, 0.06]);
    seg.push([-0.06, y, 0.05], [-0.06, y, -12.45]);
  }
  const dl = line(seg, M.dimSoft); dl.computeLineDistances();
  for (let k = 0; k < 7; k++) addLabel(T.floorNames[k], [-0.9, LV(k) + FH / 2, 0.9], 'floor');
  // overall dimensions
  const H = TOP_WING, X = -4.2, Z = 3.2;
  line([[X, 0, Z], [X, H, Z], [X - 0.5, 0, Z], [X + 0.5, 0, Z], [X - 0.5, H, Z], [X + 0.5, H, Z]]);
  addLabel(T.dimHeight(Math.round(H)), [X, H / 2, Z], 'dim');
  const yL = TOP_WING + 2.0;
  line([[0, yL, 0.4], [52.7, yL, 0.4], [0, yL - 0.5, 0.4], [0, yL + 0.5, 0.4], [52.7, yL - 0.5, 0.4], [52.7, yL + 0.5, 0.4]]);
  addLabel(T.dimLength, [26.35, yL, 0.4], 'dim');
  const xD = -3.0;
  line([[xD, yL, 0], [xD, yL, -24.4], [xD, yL - 0.5, 0], [xD, yL + 0.5, 0], [xD, yL - 0.5, -24.4], [xD, yL + 0.5, -24.4]]);
  addLabel(T.dimDepth, [xD, yL, -12.2], 'dim');
}
const _v = new THREE.Vector3();
function project(p) {
  _v.copy(p).project(camera);
  const vis = _v.z > -1 && _v.z < 1 && Math.abs(_v.x) < 1.05 && Math.abs(_v.y) < 1.05;
  return vis ? [(_v.x * 0.5 + 0.5) * renderer.domElement.clientWidth, (-_v.y * 0.5 + 0.5) * renderer.domElement.clientHeight] : null;
}
function updateLabels() {
  if (!STATE.floors) return;
  for (const L of LABELS) {
    const s = project(L.p);
    L.el.hidden = !s;
    if (s) L.el.style.transform = `translate(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px) translate(${L.cls === 'floor' ? '-100%' : '-50%'}, -50%)`;
  }
}
// entrance markers: 4 bis (door on the gable, at the end of the walkway) and 4 (porch on the street front)
const MARKERS = [
  { n: '4 bis', view: 'bis', p: new THREE.Vector3(-0.35, PORCH_Y + 1.4, (-12.15 + -10.95) / 2) },
  { n: '4', view: 'quatre', p: new THREE.Vector3(37.43, RDC + 2.5, 0.2) },
];
function buildMarkers() {
  const layer = $('#landmarks');
  if (!layer) return;
  for (const m of MARKERS) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'landmark'; b.textContent = m.n; b.hidden = true;
    b.setAttribute('aria-label', T.landmark(m.n));
    b.addEventListener('click', () => goTo(m.view));
    layer.appendChild(b); m.el = b;
  }
}
function updateMarkers() {
  const dock = $('.dock')?.getBoundingClientRect();
  for (const m of MARKERS) {
    if (!m.el) continue;
    const s = project(m.p);
    const hide = !s || (dock && s[1] > dock.top - 8 && s[0] > dock.left && s[0] < dock.right);
    m.el.hidden = !!hide;
    if (!hide) m.el.style.transform = `translate(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px) translate(-50%, -50%)`;
  }
}

/* =====================================================================
   CAMERA, CONTROLS, VIEWS
   ===================================================================== */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 5;
controls.maxDistance = 340;
controls.maxPolarAngle = Math.PI * 0.497;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
// on the guide's home page the frame must not trap the page scroll: no wheel zoom, vertical swipes scroll
controls.enableZoom = !HERO;
renderer.domElement.style.touchAction = HERO ? 'pan-y' : 'none';
controls.addEventListener('change', invalidate);

const VIEWS = {
  street: { p: [26.4, 2.6, 30.5], t: [26.4, 9.2, -4], fov: 57, eye: true },
  nw: { p: [63, 2.6, 27], t: [31, 9.2, -2], fov: 54, eye: true },
  se: { p: [-15.5, 2.4, 16], t: [8, 9.5, -6], fov: 56, eye: true },
  garage: { p: [-6.6, 2.75, 14.0], t: [-4.9, 1.6, -10.5], fov: 52, eye: true },
  garden: { p: [31, 54, -76], t: [25, 6, -15], fov: 44 },
  aerial: { p: [24.5, 135, 18], t: [24.5, 0, -10], fov: 40 },
  // entrance close-ups, reached from the markers
  bis: { p: [-0.95, 1.8, 9.6], t: [-0.6, 1.4, -12], fov: 55, eye: true },
  quatre: { p: [37.9, 1.8, 13.2], t: [38.7, 2.4, -0.6], fov: 52, eye: true },
};
function aspectScale() { const a = camera.aspect; return a < 1 ? Math.min(2.3, Math.pow(1 / a, 0.85)) : a < 1.35 ? 1.12 : 1; }

// Centred framing: from any heading, the camera fits the whole residence — slab, wing, garage block
// and the 4 bis walk — and aims slightly below its centre so that it sits in the area above the dock.
const FOCUS = { c: new THREE.Vector3(21, 9.5, -8.5), R: 34, h: 22 };
const HOME = { az: -0.45, el: 0.32, fov: 40 };
function dockOverlap() {
  const d = $('.dock'); if (!d) return 0;
  const H = renderer.domElement.clientHeight, top = d.getBoundingClientRect().top;
  return clamp(H - top + 10, 0, H * 0.55);
}
// Key points of the residence — slab, attic, rooftop rooms, wing, garage block and ramps: what a framing must show.
const FRAME_PTS = [[0, 0, 0], [52.7, 0, 0], [0, 17.9, 0], [52.7, 17.9, 0], [52.7, 0, -12.4], [52.7, 17.9, -12.4],
  [2.4, 20.65, -2], [51.9, 20.65, -2], [42, 23.2, -5.6], [9.6, 23, -8], [-1.5, 20.65, -24.4], [13.3, 20.65, -24.4],
  [-1.5, 0, -24.4], [-12.4, 0, 4.8], [0, 0, 4.8], [-12.4, 3.7, -10.5]].map((a) => new THREE.Vector3(...a));
const _fc = new THREE.PerspectiveCamera(), _fv = new THREE.Vector3();
// Distance and aim point that keep every key point in the picture, above the dock, for each heading in
// `azs` (radians from +z, the street, towards +x, north-west) at elevation `el`: one radius for all headings.
function fitAt(azs, el, fov) {
  const W = renderer.domElement.clientWidth || innerWidth, H = renderer.domElement.clientHeight || innerHeight;
  const free = Math.max(0.4, (H - dockOverlap()) / H);
  const yFloor = 1 - 2 * free + 0.05, tv = Math.tan((fov * D2R) / 2);
  _fc.fov = fov; _fc.aspect = W / H; _fc.near = 0.5; _fc.far = 3000; _fc.updateProjectionMatrix();
  const aim = (d) => { const t = FOCUS.c.clone(); t.y -= ((1 - free) * d * tv) / Math.cos(el); return t; };
  const fits = (d) => {
    const t = aim(d);
    for (const az of azs) {
      _fc.position.copy(t).add(_fv.setFromSphericalCoords(d, Math.PI / 2 - el, az)); _fc.lookAt(t); _fc.updateMatrixWorld();
      for (const q of FRAME_PTS) { _fv.copy(q).project(_fc); if (_fv.z > 1 || Math.abs(_fv.x) > 0.93 || _fv.y > 0.9 || _fv.y < yFloor) return false; }
    }
    return true;
  };
  let lo = 15, hi = 330;
  for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  // then settle the residence just above the dock: the woods behind it fill the picture, not the lawn in front
  const t = aim(hi);
  let drop = Infinity;
  for (const az of azs) {
    _fc.position.copy(t).add(_fv.setFromSphericalCoords(hi, Math.PI / 2 - el, az)); _fc.lookAt(t); _fc.updateMatrixWorld();
    for (const q of FRAME_PTS) {
      const depth = _fv.copy(q).applyMatrix4(_fc.matrixWorldInverse).z;
      _fv.copy(q).project(_fc);
      drop = Math.min(drop, (_fv.y - (yFloor + 0.04)) * -depth * tv);
    }
  }
  if (drop > 0 && drop < Infinity) t.y += drop * Math.cos(el);
  return { t, d: hi };
}
function fitPose(az, el, fov) {
  const { t, d } = fitAt([az], el, fov);
  return { p: t.clone().add(new THREE.Vector3().setFromSphericalCoords(d, Math.PI / 2 - el, az)), t, fov };
}
const homePose = () => fitPose(HOME.az, HOME.el, HOME.fov);

function viewPose(name) {
  if (name === 'home') return homePose();
  const v = VIEWS[name]; if (!v) return null;
  const t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  const k = aspectScale();
  let fov = v.fov;
  // narrow screens: street-level views widen the lens (backing away would put the road in front);
  // overview views step back instead
  if (v.eye) fov = Math.min(88, 2 * Math.atan(Math.tan((v.fov * D2R) / 2) * k) * R2D);
  else if (k !== 1) p.sub(t).multiplyScalar(k).add(t);
  if (p.y < 1.2) p.y = 1.2;
  return { p, t, fov };
}
const pressChip = (name) => document.querySelectorAll('.chip[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === name)));

let tween = null;
function glideTo(pose, dur, then = null) {
  tween = { t0: performance.now(), dur: (REDUCED ? 0.01 : dur) * 1000, p0: camera.position.clone(), q0: controls.target.clone(), f0: camera.fov,
    p1: pose.p.clone(), q1: pose.t.clone(), f1: pose.fov, then };
  invalidate();
}
function goTo(name, dur = 1.7) {
  const pose = viewPose(name); if (!pose) return;
  glideTo(pose, dur);
  holdMotion();
  atHome = name === 'home';
  pressChip(name);
  invalidate();
}
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function stepTween(now) {
  if (!tween) return;
  const x = clamp((now - tween.t0) / tween.dur, 0, 1), e = ease(x);
  camera.position.lerpVectors(tween.p0, tween.p1, e);
  // lift the path a little so long moves arc over the building
  const lift = Math.sin(Math.PI * e) * Math.min(25, tween.p0.distanceTo(tween.p1) * 0.12);
  camera.position.y += lift;
  controls.target.lerpVectors(tween.q0, tween.q1, e);
  camera.fov = lerp(tween.f0, tween.f1, e); camera.updateProjectionMatrix();
  if (x >= 1) tween = null;
}
// Motion: a slow back-and-forth across the street front — from the NW angle (view 2) to the front (view 1),
// on to the SE corner (view 3), back to the front, to the NW angle, and so on — with the whole residence
// framed and centred, while the day plays. Any move by the visitor (drag, zoom, a view, an entrance, the
// sun slider) holds it for a minute; it then glides back to the nearest of these three headings and carries on.
const TOUR_AZ = ['nw', 'street', 'se'].map((n) => { const v = VIEWS[n]; return Math.atan2(v.p[0] - v.t[0], v.p[2] - v.t[2]); });
const TOUR_SEQ = [0, 1, 2, 1];                // the cycle visits views 2, 1, 3, 1, then 2 again
const TOUR_SEG = 18;                          // seconds from one heading to the next
const TOUR_EL = 0.11, TOUR_FOV = 45;          // a low line of sight, a little above the street
const HOLD_MS = 60000;
const DAY_RATE = EMBED ? 0.22 : 0.36;         // hours of sun per second
const motion = { on: false, heldUntil: 0, c: 1 };   // c: position in the cycle, 0–4 (1 = front, heading SE)
// distance and aim height that fit the residence, sampled along the sweep (they depend on the frame)
let tourFit = null;
const refreshTourPoses = () => {
  const lo = Math.min(...TOUR_AZ), hi = Math.max(...TOUR_AZ), n = 9;
  tourFit = Array.from({ length: n }, (_, i) => {
    const az = lo + ((hi - lo) * i) / (n - 1), f = fitAt([az], TOUR_EL, TOUR_FOV);
    return { az, d: f.d * 1.03, ty: f.t.y };
  });
};
const _tp = { p: new THREE.Vector3(), t: new THREE.Vector3(), fov: TOUR_FOV }, _v3 = new THREE.Vector3();
function tourPose(c) {
  const seg = Math.floor(c) % 4, u = c - Math.floor(c);
  const e = 0.5 - 0.5 * Math.cos(Math.PI * u);      // eases into and out of every view
  const az = lerp(TOUR_AZ[TOUR_SEQ[seg]], TOUR_AZ[TOUR_SEQ[(seg + 1) % 4]], e);
  const k = clamp(((az - tourFit[0].az) / (tourFit[tourFit.length - 1].az - tourFit[0].az)) * (tourFit.length - 1), 0, tourFit.length - 1.0001);
  const A = tourFit[Math.floor(k)], B = tourFit[Math.floor(k) + 1], f = k - Math.floor(k);
  _tp.t.set(FOCUS.c.x, lerp(A.ty, B.ty, f), FOCUS.c.z);
  _tp.p.copy(_tp.t).add(_v3.setFromSphericalCoords(lerp(A.d, B.d, f), Math.PI / 2 - TOUR_EL, az));
  return _tp;
}
let dragging = false, atHome = false;
function playDay(on) {
  STATE.playingDay = on;
  if (on && STATE.hour >= 22.4) STATE.hour = 5;
  $('#dayBtn').setAttribute('aria-pressed', String(on));
  invalidate();
}
// (re)start: glide to the heading of the cycle nearest to where the tour stopped, then carry on, with the day
function rejoinTour() {
  motion.c = Math.round(motion.c) % 4;
  motion.heldUntil = 0;
  const pose = tourPose(motion.c);
  const far = camera.position.distanceTo(pose.p) + controls.target.distanceTo(pose.t);
  glideTo(pose, clamp(far / 30, 0.8, 2.8), () => pressChip(null));
  atHome = false;
  $('#orbitBtn').setAttribute('aria-pressed', 'true');
  playDay(true);
}
function setOrbit(on) {
  motion.on = on; motion.heldUntil = 0; STATE.orbit = on;
  $('#orbitBtn').setAttribute('aria-pressed', String(on));
  if (on) rejoinTour();
  invalidate();
}
function holdMotion() {
  atHome = false;
  if (!motion.on) return;
  motion.heldUntil = performance.now() + HOLD_MS;
  $('#orbitBtn').setAttribute('aria-pressed', 'false');
}
const motionRunning = (now) => motion.on && !tween && !dragging && now >= motion.heldUntil;
// end of the hold, or the Tour button pressed during it
function resumeMotion() { rejoinTour(); invalidate(); }

/* =====================================================================
   UI WIRING
   ===================================================================== */
function wireUI() {
  document.querySelectorAll('.chip[data-view]').forEach((b) => b.addEventListener('click', () => goTo(b.dataset.view)));
  $('#orbitBtn').addEventListener('click', () => {
    if (motion.on && motion.heldUntil > performance.now()) { resumeMotion(); return; }   // held: resume now
    tween = null;
    setOrbit(!motion.on);
  });
  $('#floorsBtn').addEventListener('click', () => {
    STATE.floors = !STATE.floors; overlay.visible = STATE.floors;
    $('#floorsBtn').setAttribute('aria-pressed', String(STATE.floors));
    for (const L of LABELS) L.el.hidden = !STATE.floors;
    invalidate();
  });
  document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
    STATE.season = b.dataset.season;
    document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    for (const f of FOLIAGE) f.visible = STATE.season !== 'winter';
    M.ground.color.set(STATE.season === 'winter' ? 0xb8b39a : 0xffffff);
    applySun();
  }));
  const tr = $('#time');
  // setting the hour by hand pauses the day (and holds the tour); both resume together a minute later
  tr.addEventListener('input', () => { STATE.hour = +tr.value; if (STATE.playingDay) playDay(false); holdMotion(); applySun(); });
  $('#dayBtn').addEventListener('click', () => playDay(!STATE.playingDay));
  const hint = $('#hint');
  const hideHint = () => hint.classList.add('gone');
  controls.addEventListener('start', () => {
    // a drag cuts a camera move short; what was due at its end (starting the motion) still happens, then holds
    const then = tween && tween.then; tween = null; if (then) then();
    dragging = true; holdMotion(); hideHint();
    document.querySelectorAll('.chip[data-view]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  });
  controls.addEventListener('end', () => { dragging = false; holdMotion(); });
  setTimeout(hideHint, 9000);
  hint.textContent = HERO ? T.hintHero : matchMedia('(pointer: coarse)').matches ? T.hintTouch : T.hint;
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key >= '1' && e.key <= '6') { goTo(VIEW_ORDER[+e.key - 1]); }
    else if (e.key === ' ' && document.activeElement === renderer.domElement) { e.preventDefault(); $('#orbitBtn').click(); }
    else if (e.key === 'f' || e.key === 'F') $('#floorsBtn').click();
  });
}

// compass: bearing the camera looks towards
const dial = $('#dial');
function updateCompass() {
  const dx = controls.target.x - camera.position.x, dz = controls.target.z - camera.position.z;
  if (Math.hypot(dx, dz) < 1e-3) return;
  // invert bearingDir: dir = (sin a, -cos a), a = b - (FACADE_N + 180)
  const a = Math.atan2(dx, -dz) * R2D;
  const bearing = (a + FACADE_N + 180 + 360) % 360;
  dial.setAttribute('transform', `rotate(${(-bearing).toFixed(1)})`);
}

/* =====================================================================
   BOOT
   ===================================================================== */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  refreshTourPoses();             // the tour's views adapt their lens to the frame
  // on the centred view (reduced motion), keep the building fitted when the frame changes size
  if (atHome && !tween && window.__colbertReady) {
    const pose = homePose();
    camera.position.copy(pose.p); controls.target.copy(pose.t);
  }
  invalidate();
}
addEventListener('resize', resize);
// the dock settles once its font has loaded: refit the tour to the room it leaves
if (document.fonts) document.fonts.ready.then(() => { if (tourFit) { refreshTourPoses(); invalidate(); } });

let visible = true;
function boot() {
  const world = new THREE.Group(); world.name = 'world'; scene.add(world);
  const part = (name) => { const g = new THREE.Group(); g.name = name; world.add(g); return g; };
  buildBuilding(part('building'));
  buildSite(part('site'));
  buildDrive(part('drive'));
  buildNeighbours(part('neighbours'));
  buildHedges(part('hedges'));
  buildTerrain(part('terrain'));
  buildVegetation(part('vegetation'));
  buildOverlay();
  buildMarkers();
  wireUI();
  applySun();
  refreshEnv(true);
  resize();

  // The tour and the day start together, facing the street front (view 1) and heading for the SE corner.
  // Embedded: from the first image. Stand-alone page: after a fly-in from high above.
  // Reduced motion: the centred overview, still.
  const startTour = () => {
    motion.on = true; motion.heldUntil = 0; motion.c = 1; STATE.orbit = true;
    $('#orbitBtn').setAttribute('aria-pressed', 'true');
    pressChip(null); playDay(true);
  };
  const start = REDUCED ? homePose() : tourPose(1);
  controls.target.copy(start.t);
  camera.fov = start.fov;
  if (REDUCED) {
    camera.position.copy(start.p); camera.updateProjectionMatrix();
    atHome = true;
    setOrbit(false);
  } else if (EMBED) {
    camera.position.copy(start.p); camera.updateProjectionMatrix();
    startTour();
  } else {
    camera.position.set(24, 190, 60); camera.updateProjectionMatrix();
    controls.target.set(24, 0, -10);
    tween = { t0: performance.now() + 250, dur: 3600, p0: camera.position.clone(), q0: controls.target.clone(), f0: start.fov, p1: start.p.clone(), q1: start.t.clone(), f1: start.fov, then: startTour };
  }
  controls.update();

  // only draw while something moves; pause when the frame is scrolled out of view
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) invalidate(); }).observe(renderer.domElement);
  }
  let last = performance.now(), lastDraw = 0, lastSun = 0, first = true;
  renderer.setAnimationLoop((now) => {
    if (window.__colbertPaused || !visible) { last = now; return; }
    // embedded, nothing but the slow ambient motion: 30 images per second are plenty
    if (EMBED && !tween && !dragging && now - lastDraw < 1000 / 31) return;
    frame(now);
  });
  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.1); last = now;
    let active = false;
    if (tween) { const done = tween.then; stepTween(now); active = true; if (!tween && done) done(); }
    // a minute after the visitor's last move, the tour glides back to its nearest view and carries on
    if (motion.on && motion.heldUntil && now >= motion.heldUntil && !tween && !dragging) resumeMotion();
    if (motionRunning(now)) {
      motion.c = (motion.c + dt / TOUR_SEG) % 4;
      const tp = tourPose(motion.c);
      camera.position.copy(tp.p); controls.target.copy(tp.t);
      if (Math.abs(camera.fov - tp.fov) > 1e-4) { camera.fov = tp.fov; camera.updateProjectionMatrix(); }
      active = true;
    }
    if (STATE.playingDay) {
      STATE.hour += dt * DAY_RATE; if (STATE.hour > 22.5) STATE.hour = 5;
      $('#time').value = STATE.hour;
      // the sun moves slowly: relight (and redraw shadows) about ten times a second
      if (!EMBED || now - lastSun > 95) { applySun(); lastSun = now; }
      active = true;
    }
    refreshEnv();
    controls.update(dt);
    // keep the target near the site
    controls.target.x = clamp(controls.target.x, -70, 120); controls.target.z = clamp(controls.target.z, -110, 70); controls.target.y = clamp(controls.target.y, -2, 40);
    // never let the camera dip into the slope behind the building
    const gy = groundH(camera.position.x, camera.position.z) + 1.5;
    if (camera.position.y < gy) camera.position.y = gy;
    if (!needsRender && !active) return;
    needsRender = false; lastDraw = now;
    renderer.render(scene, camera);
    updateLabels();
    updateMarkers();
    updateCompass();
    if (first) { first = false; document.documentElement.classList.add('is-ready'); }
  }
  window.__colbert = { goTo, VIEWS, camera, controls, STATE, applySun, setOrbit, motion, renderer, scene, refreshEnv, frame, world, M, TEX, homePose, invalidate,
    marks: { WK0, WK1, LAND, GF, GX0, LOW, UP, T_TOP, T_BOT, RDC, DOOR_LOW, DOOR_UP, PORCH_Y }, finishTween: () => { if (tween) { tween.t0 = -1e9; } } };
  window.__colbertReady = true;
  const ld = $('#loader'); ld.classList.add('gone'); setTimeout(() => ld.remove(), 700);
}

requestAnimationFrame(() => setTimeout(() => {
  try { boot(); }
  catch (e) {
    console.error(e);
    document.documentElement.classList.add('is-failed');
    $('#loadMsg').className = 'err';
    $('#loadMsg').textContent = T.errBuild + e.message;
  }
}, 30));
