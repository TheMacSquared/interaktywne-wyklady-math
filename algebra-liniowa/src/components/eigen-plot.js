// Komponenty rysujące: panel transformacji siatki i panel wektorów własnych.
// Używamy @observablehq/plot — to D3 owinięte w API deklaratywne, więc nie piszemy SVG ręcznie.

import * as Plot from "npm:@observablehq/plot";
import * as math from "npm:mathjs";
import {html} from "npm:htl";

const RANGE = 3;        // ile jednostek pokazujemy w każdą stronę
const GRID_LINES = 7;   // ile linii pionowych/poziomych w siatce (po obu stronach 0)

// ──────────────────────────────────────────────────────────────────────────────
// Pomocnicze: liczenie wartości i wektorów własnych z separacją re/im.

export function computeEigen(A) {
  // math.eigs zwraca obiekt z polami values i eigenvectors.
  // Wartości mogą być Complex; rozdzielamy.
  const result = math.eigs(A);
  const values = result.values.toArray ? result.values.toArray() : result.values;

  const decoded = values.map((v, i) => {
    const re = math.re(v);
    const im = math.im(v);
    const isReal = Math.abs(im) < 1e-9;
    let vector = null;
    if (isReal && result.eigenvectors && result.eigenvectors[i]) {
      const raw = result.eigenvectors[i].vector;
      const arr = raw.toArray ? raw.toArray() : raw;
      vector = arr.map(x => math.re(x));
    }
    return {re, im, isReal, vector};
  });

  return {
    values: decoded,
    allReal: decoded.every(d => d.isReal)
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Interpolacja macierzy: A(t) = (1-t)·I + t·A.
// Pozwala animować od tożsamości do macierzy docelowej.

export function interpolate(A, t) {
  const I = [[1, 0], [0, 1]];
  return [
    [(1 - t) * I[0][0] + t * A[0][0], (1 - t) * I[0][1] + t * A[0][1]],
    [(1 - t) * I[1][0] + t * A[1][0], (1 - t) * I[1][1] + t * A[1][1]]
  ];
}

// Pomocnicze: pomnóż macierz 2x2 przez wektor 2.
const apply = (M, v) => [M[0][0]*v[0] + M[0][1]*v[1], M[1][0]*v[0] + M[1][1]*v[1]];

// ──────────────────────────────────────────────────────────────────────────────
// LEWY PANEL: siatka jednostkowa + jej obraz pod transformacją + okrąg jednostkowy
// + jego obraz (elipsa).

export function transformPlot(A, t = 1, {width = 420} = {}) {
  const M = interpolate(A, t);

  // Linie siatki: pionowe x=k i poziome y=k dla k ∈ [-G..G] przez Δ kroków.
  const G = GRID_LINES;
  const samplesPerLine = 25;
  const lines = []; // {x, y, kind, k}

  for (let k = -G; k <= G; k++) {
    // Pionowa x = k, y od -G do G
    for (let j = 0; j <= samplesPerLine; j++) {
      const y = -G + (2 * G * j) / samplesPerLine;
      lines.push({x0: k, y0: y, kind: "v", k});
    }
    // Pozioma y = k
    for (let j = 0; j <= samplesPerLine; j++) {
      const x = -G + (2 * G * j) / samplesPerLine;
      lines.push({x0: x, y0: k, kind: "h", k});
    }
  }

  // Obraz pod transformacją M.
  const transformed = lines.map(p => {
    const [x, y] = apply(M, [p.x0, p.y0]);
    return {x, y, kind: p.kind, k: p.k};
  });

  // Okrąg jednostkowy → elipsa (obraz okręgu pod M).
  const N = 96;
  const circleBefore = Array.from({length: N + 1}, (_, i) => {
    const θ = (2 * Math.PI * i) / N;
    return {x: Math.cos(θ), y: Math.sin(θ), set: "before"};
  });
  const circleAfter = circleBefore.map(p => {
    const [x, y] = apply(M, [p.x, p.y]);
    return {x, y, set: "after"};
  });

  return Plot.plot({
    width,
    height: width,
    aspectRatio: 1,
    x: {domain: [-RANGE, RANGE], grid: false, label: "x"},
    y: {domain: [-RANGE, RANGE], grid: false, label: "y"},
    marks: [
      // Tło: oryginalna siatka, jasnoszara
      Plot.line(lines.filter(d => d.kind === "v"), {
        x: "x0", y: "y0", z: "k",
        stroke: "#cbd5e1", strokeWidth: 0.6, strokeOpacity: 0.8
      }),
      Plot.line(lines.filter(d => d.kind === "h"), {
        x: "x0", y: "y0", z: "k",
        stroke: "#cbd5e1", strokeWidth: 0.6, strokeOpacity: 0.8
      }),
      // Osie x=0, y=0 wyróżnione
      Plot.ruleX([0], {stroke: "#94a3b8", strokeWidth: 1}),
      Plot.ruleY([0], {stroke: "#94a3b8", strokeWidth: 1}),
      // Siatka po transformacji — niebieska, półprzezroczysta
      Plot.line(transformed.filter(d => d.kind === "v"), {
        x: "x", y: "y", z: "k",
        stroke: "#2563eb", strokeWidth: 1.1, strokeOpacity: 0.75
      }),
      Plot.line(transformed.filter(d => d.kind === "h"), {
        x: "x", y: "y", z: "k",
        stroke: "#2563eb", strokeWidth: 1.1, strokeOpacity: 0.75
      }),
      // Okrąg jednostkowy (przed) — szary przerywany
      Plot.line(circleBefore, {
        x: "x", y: "y",
        stroke: "#475569", strokeDasharray: "3,3", strokeWidth: 1.2
      }),
      // Elipsa (po) — pomarańczowa pełna
      Plot.line(circleAfter, {
        x: "x", y: "y",
        stroke: "#ea580c", strokeWidth: 1.8
      })
    ]
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// PRAWY PANEL: wektory własne (jeśli rzeczywiste) i ich obrazy.

export function eigenPlot(A, {width = 420} = {}) {
  const {values, allReal} = computeEigen(A);

  if (!allReal) {
    // Brak rzeczywistych wektorów własnych — rysujemy łuk obrotu.
    return rotationHint(A, values, width);
  }

  // Rzeczywiste wektory własne. Skalujemy je dla widoczności.
  const arrows = [];
  const labels = [];
  values.forEach((d, i) => {
    if (!d.vector) return;
    const v = d.vector;
    const norm = Math.hypot(v[0], v[1]) || 1;
    const u = [v[0] / norm * 1.4, v[1] / norm * 1.4]; // wersor × 1.4 dla widoczności
    const Av = [u[0] * d.re, u[1] * d.re];

    arrows.push({x1: 0, y1: 0, x2: u[0], y2: u[1], kind: "v", i});
    arrows.push({x1: 0, y1: 0, x2: Av[0], y2: Av[1], kind: "Av", i});

    labels.push({x: u[0] * 1.08, y: u[1] * 1.08, text: `v${subscript(i + 1)}`, color: "#000"});
    labels.push({
      x: Av[0] * 1.08, y: Av[1] * 1.08,
      text: `λ${subscript(i + 1)}·v${subscript(i + 1)}`,
      color: arrowColor(d.re)
    });
  });

  const plot = Plot.plot({
    width,
    height: width,
    aspectRatio: 1,
    x: {domain: [-RANGE, RANGE], label: "x"},
    y: {domain: [-RANGE, RANGE], label: "y"},
    marks: [
      Plot.gridX({stroke: "#e2e8f0"}),
      Plot.gridY({stroke: "#e2e8f0"}),
      Plot.ruleX([0], {stroke: "#94a3b8"}),
      Plot.ruleY([0], {stroke: "#94a3b8"}),
      Plot.arrow(arrows.filter(a => a.kind === "v"), {
        x1: "x1", y1: "y1", x2: "x2", y2: "y2",
        stroke: "#0f172a", strokeWidth: 2, headLength: 10
      }),
      Plot.arrow(arrows.filter(a => a.kind === "Av"), {
        x1: "x1", y1: "y1", x2: "x2", y2: "y2",
        stroke: d => arrowColor(values[d.i].re),
        strokeWidth: 2.4, headLength: 12
      }),
      Plot.text(labels, {
        x: "x", y: "y", text: "text", fill: "color",
        fontSize: 13, fontWeight: 600, dx: 4, dy: -4
      })
    ]
  });

  // Wykryj przypadek gdy oba wektory własne leżą na tym samym kierunku.
  const vecs = values.filter(d => d.vector);
  let caption = "Czarne strzałki (v₁, v₂): wektory własne. Kolorowe (λ·v): obrazy po transformacji.";
  if (vecs.length === 2) {
    const [v1, v2] = vecs.map(d => d.vector);
    const cross = v1[0] * v2[1] - v1[1] * v2[0];
    if (Math.abs(cross) < 1e-6) {
      const λ = vecs[0].re.toFixed(3).replace(/\.?0+$/, "");
      caption = `Widzimy tylko jeden kierunek własny — obie strzałki leżą na tej samej prostej (λ₁ = λ₂ = ${λ}).`;
    }
  }

  return html`<div>
    ${plot}
    <p style="color:#475569; font-style:italic; margin:.4rem 0 0; font-size:.875rem;">${caption}</p>
  </div>`;
}

function arrowColor(λ) {
  if (λ < 0) return "#7c3aed";   // odbicie + skalowanie — fiolet
  if (λ > 1) return "#dc2626";   // wydłużenie — czerwony
  return "#2563eb";              // skrócenie (0<λ<1) — niebieski
}

function subscript(n) {
  return ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"][n] || String(n);
}

function rotationHint(A, values, width) {
  // Kąt obrotu = arg(λ), moduł skalowania = |λ|.
  const θ = Math.atan2(values[0].im, values[0].re);
  const θdeg = (θ * 180 / Math.PI).toFixed(1);
  const modulus = Math.hypot(values[0].re, values[0].im);

  const r = 1.4;                        // długość wektora wyjściowego
  const rEnd = r * modulus;             // długość wektora po transformacji
  const plotRange = Math.max(RANGE, rEnd + 0.5);

  // Łuk kąta obrotu (przy stałym promieniu r — pokazuje sam kąt).
  const N = 64;
  const arc = Array.from({length: N + 1}, (_, i) => {
    const t = (θ * i) / N;
    return {x: r * Math.cos(t), y: r * Math.sin(t)};
  });

  // Okrąg przy promieniu r (oryginalna długość wektora).
  const circle = Array.from({length: 97}, (_, i) => {
    const φ = (2 * Math.PI * i) / 96;
    return {x: r * Math.cos(φ), y: r * Math.sin(φ)};
  });

  const scalesLabel = Math.abs(modulus - 1) > 0.01
    ? `,  |λ| ≈ ${modulus.toFixed(2)}`
    : "";

  const marks = [
    Plot.gridX({stroke: "#e2e8f0"}),
    Plot.gridY({stroke: "#e2e8f0"}),
    Plot.ruleX([0], {stroke: "#94a3b8"}),
    Plot.ruleY([0], {stroke: "#94a3b8"}),
    // Okrąg oryginalnej długości wektora (szary przerywany)
    Plot.line(circle, {x: "x", y: "y", stroke: "#cbd5e1", strokeDasharray: "3,3", strokeWidth: 1.2}),
    // Łuk kąta obrotu przy promieniu r (szary)
    Plot.line(arc, {x: "x", y: "y", stroke: "#94a3b8", strokeDasharray: "4,2", strokeWidth: 1.5}),
    // Wektor wyjściowy (szary)
    Plot.arrow([{x1: 0, y1: 0, x2: r, y2: 0}], {
      x1: "x1", y1: "y1", x2: "x2", y2: "y2",
      stroke: "#475569", strokeWidth: 1.5, headLength: 8
    }),
    // Wektor po transformacji: obrót o θ + skalowanie o |λ| (pomarańczowy)
    Plot.arrow([{x1: 0, y1: 0, x2: rEnd * Math.cos(θ), y2: rEnd * Math.sin(θ)}], {
      x1: "x1", y1: "y1", x2: "x2", y2: "y2",
      stroke: "#ea580c", strokeWidth: 2, headLength: 10
    }),
    Plot.text([{x: 0, y: -plotRange + 0.4, text: `obrót ≈ ${θdeg}°${scalesLabel}`}], {
      x: "x", y: "y", text: "text",
      fontSize: 14, fontWeight: 600, fill: "#ea580c"
    })
  ];

  // Gdy |λ| ≠ 1: dodaj pomarańczowy okrąg na nowej długości
  if (Math.abs(modulus - 1) > 0.01) {
    const circleEnd = Array.from({length: 97}, (_, i) => {
      const φ = (2 * Math.PI * i) / 96;
      return {x: rEnd * Math.cos(φ), y: rEnd * Math.sin(φ)};
    });
    marks.push(Plot.line(circleEnd, {
      x: "x", y: "y",
      stroke: "#ea580c", strokeDasharray: "3,3", strokeWidth: 1.2, strokeOpacity: 0.6
    }));
  }

  return html`<div>
    ${Plot.plot({
      width,
      height: width,
      aspectRatio: 1,
      x: {domain: [-plotRange, plotRange], label: "x"},
      y: {domain: [-plotRange, plotRange], label: "y"},
      marks
    })}
    <p style="color:#475569; font-style:italic; margin:.4rem 0 0; font-size:.875rem;">
      Brak rzeczywistych wektorów własnych — macierz obraca przestrzeń${Math.abs(modulus - 1) > 0.01 ? " i skaluje wektory" : ""}.
      Szara strzałka: wektor przed transformacją. Pomarańczowa: ten sam wektor po.
    </p>
  </div>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// PANEL FIGURY: wybrana figura geometryczna przed transformacją i po.

function getShapeData(shape) {
  switch (shape) {
    case "square":
      return {
        line: [[1,1],[-1,1],[-1,-1],[1,-1],[1,1]],
        verts: [[1,1],[-1,1],[-1,-1],[1,-1]]
      };
    case "triangle":
      return {
        line: [[0,0],[1,0],[0,1],[0,0]],
        verts: [[0,0],[1,0],[0,1]]
      };
    case "segment":
      return {
        line: [[-1,0],[1,0]],
        verts: [[-1,0],[1,0]]
      };
    case "circle": {
      const N = 96;
      return {
        line: Array.from({length: N + 1}, (_, i) => {
          const θ = (2 * Math.PI * i) / N;
          return [Math.cos(θ), Math.sin(θ)];
        }),
        verts: []
      };
    }
    default:
      return {line: [], verts: []};
  }
}

export function shapePlot(A, t = 1, shape = "square", {width = 420} = {}) {
  const M = interpolate(A, t);
  const {line, verts} = getShapeData(shape);

  const origLine  = line.map(([x, y]) => ({x, y}));
  const transLine = line.map(([x, y]) => { const [tx, ty] = apply(M, [x, y]); return {x: tx, y: ty}; });
  const origVerts  = verts.map(([x, y]) => ({x, y}));
  const transVerts = verts.map(([x, y]) => { const [tx, ty] = apply(M, [x, y]); return {x: tx, y: ty}; });

  const marks = [
    Plot.gridX({stroke: "#e2e8f0"}),
    Plot.gridY({stroke: "#e2e8f0"}),
    Plot.ruleX([0], {stroke: "#94a3b8"}),
    Plot.ruleY([0], {stroke: "#94a3b8"}),
    // Oryginalna figura — szara przerywana
    Plot.line(origLine, {x: "x", y: "y", stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "5,3"}),
    // Figura po transformacji — niebieska
    Plot.line(transLine, {x: "x", y: "y", stroke: "#2563eb", strokeWidth: 2.2})
  ];

  if (origVerts.length > 0) {
    marks.push(Plot.dot(origVerts,  {x: "x", y: "y", fill: "#94a3b8", r: 3}));
    marks.push(Plot.dot(transVerts, {x: "x", y: "y", fill: "#2563eb", r: 4}));
  }

  return Plot.plot({
    width,
    height: width,
    aspectRatio: 1,
    x: {domain: [-RANGE, RANGE], label: "x"},
    y: {domain: [-RANGE, RANGE], label: "y"},
    marks
  });
}
