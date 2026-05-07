// Ogólny widget układów równań: n_eqs równań w n_vars zmiennych (1, 2 lub 3).
// Wizualizacja: 1D = oś liczbowa, 2D = proste, 3D = płaszczyzny (projekcja izometryczna).

import * as Plot from "npm:@observablehq/plot";
import * as math from "npm:mathjs";
import {html} from "npm:htl";

const EQ_COLORS = ["#2563eb", "#dc2626", "#16a34a"];

// ── Projekcja skośna gabinetowa: x→prawo, y→góra, z→wgłąb (dolny-prawy, 30°, skala 0.5) ──

function proj(x, y, z) {
  const s = 0.5, a = Math.PI / 6;
  return {
    px:  x + z * Math.cos(a) * s,
    py: -y + z * Math.sin(a) * s
  };
}

// ── Siatka punktów płaszczyzny ax+by+cz=d w promieniu R ──────────────────────

function planeMesh(a, b, c, d, R, eqIdx) {
  const len = Math.hypot(a, b, c);
  if (len < 1e-9) return [];

  // Punkt na płaszczyźnie
  let p;
  if (Math.abs(c) >= 1e-9)      p = [0, 0, d / c];
  else if (Math.abs(b) >= 1e-9) p = [0, d / b, 0];
  else                           p = [d / a, 0, 0];

  // Dwa ortogonalne wektory w płaszczyźnie (Gram-Schmidt)
  const n = [a / len, b / len, c / len];
  let u = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const nd = n[0]*u[0] + n[1]*u[1] + n[2]*u[2];
  u = [u[0]-nd*n[0], u[1]-nd*n[1], u[2]-nd*n[2]];
  const ul = Math.hypot(...u);
  u = u.map(v => v / ul);
  const v = [n[1]*u[2]-n[2]*u[1], n[2]*u[0]-n[0]*u[2], n[0]*u[1]-n[1]*u[0]];

  const G = 5, step = (2 * R) / G, data = [];

  for (let i = 0; i <= G; i++) {
    const s = -R + i * step;
    for (const [along, perp, tag] of [[u, v, "u"], [v, u, "v"]]) {
      for (let j = 0; j <= 20; j++) {
        const t = -R + (2 * R * j) / 20;
        const [x, y, z] = [
          p[0] + s*along[0] + t*perp[0],
          p[1] + s*along[1] + t*perp[1],
          p[2] + s*along[2] + t*perp[2]
        ];
        data.push({...proj(x, y, z), g: `e${eqIdx}${tag}${i}`});
      }
    }
  }
  return data;
}

// ── Solver ────────────────────────────────────────────────────────────────────

export function solveGeneral(A, b) {
  const n_eqs = A.length, n_vars = A[0].length;
  const bFlat = b.map(r => r[0]);

  if (n_vars === 1) {
    const xs = A.map((r, i) => Math.abs(r[0]) < 1e-9 ? null : bFlat[i] / r[0]);
    const valid = xs.filter(v => v !== null);
    if (!valid.length) return {type: "trivial"};
    return valid.every(v => Math.abs(v - valid[0]) < 1e-6)
      ? {type: "unique", x: valid[0]}
      : {type: "none"};
  }

  if (n_eqs === n_vars) {
    try {
      const x = math.lusolve(A, bFlat).flat();
      // Verify (in case of numerically rank-deficient)
      const residual = A.reduce((maxR, row, i) => {
        const r = Math.abs(row.reduce((s, v, j) => s + v * x[j], 0) - bFlat[i]);
        return Math.max(maxR, r);
      }, 0);
      if (residual > 1e-6) return {type: "inconsistent"};
      return {type: "unique", x};
    } catch {
      return {type: "degenerate"};
    }
  }

  return n_eqs < n_vars ? {type: "underdetermined"} : {type: "overdetermined"};
}

// ── Przecięcie dwóch płaszczyzn (linia w 3D) ─────────────────────────────────

function intersectionLine(row1, d1, row2, d2) {
  const [a1,b1,c1] = row1, [a2,b2,c2] = row2;
  const dir = [b1*c2-c1*b2, c1*a2-a1*c2, a1*b2-b1*a2];
  const dlen = Math.hypot(...dir);
  if (dlen < 1e-9) return null; // równoległe

  // Znajdź punkt na przecięciu — ustal jedną współrzędną = 0
  const systems = [
    {fix: [2, 0], m: [[a1,b1],[a2,b2]], rhs: [d1,d2], assemble: (x,y) => [x,y,0]},
    {fix: [0, 0], m: [[b1,c1],[b2,c2]], rhs: [d1,d2], assemble: (y,z) => [0,y,z]},
    {fix: [0, 0], m: [[a1,c1],[a2,c2]], rhs: [d1,d2], assemble: (x,z) => [x,0,z]}
  ];
  for (const {m, rhs, assemble} of systems) {
    const det = m[0][0]*m[1][1] - m[0][1]*m[1][0];
    if (Math.abs(det) > 1e-9) {
      const u = (rhs[0]*m[1][1] - rhs[1]*m[0][1]) / det;
      const w = (m[0][0]*rhs[1] - m[1][0]*rhs[0]) / det;
      return {pt: assemble(u, w), dir: dir.map(v => v / dlen)};
    }
  }
  return null;
}

// ── 1D: oś liczbowa ───────────────────────────────────────────────────────────

function plot1D(A, b, {width = 420} = {}) {
  const R = 6;
  const bFlat = b.map(r => r[0]);
  const sol = solveGeneral(A, b);

  const dots = A
    .map((row, i) => Math.abs(row[0]) > 1e-9 ? {x: bFlat[i] / row[0], color: EQ_COLORS[i], i} : null)
    .filter(Boolean);

  const ticks = Array.from({length: 2*R+1}, (_, k) => ({x: k - R, y: 0}));

  let caption;
  if (sol.type === "unique") caption = `Rozwiązanie: x = ${+sol.x.toFixed(4)}`;
  else if (sol.type === "none") caption = "Układ sprzeczny — brak rozwiązania.";
  else caption = "Spełnione przez każde x (równanie trywialne).";

  return html`<div>
    ${Plot.plot({
      width, height: 100,
      x: {domain: [-R, R], label: "x"},
      y: {domain: [-0.8, 0.8], axis: null},
      marks: [
        Plot.ruleY([0], {stroke: "#94a3b8", strokeWidth: 1.5}),
        Plot.tickX(ticks, {x: "x", stroke: "#94a3b8", strokeWidth: 1}),
        Plot.text(ticks.filter(t => Number.isInteger(t.x)), {
          x: "x", y: 0, text: d => String(d.x), dy: 14, fontSize: 10, fill: "#94a3b8"
        }),
        Plot.dot(dots, {x: "x", y: 0, fill: d => d.color, r: 7, stroke: "#fff", strokeWidth: 2}),
        Plot.text(dots, {
          x: "x", y: 0, text: d => `r${d.i+1}`, fill: d => d.color,
          fontSize: 9, fontWeight: 700, dy: -14
        })
      ]
    })}
    <p style="color:#475569; font-style:italic; margin:.4rem 0 0; font-size:.875rem;">${caption}</p>
  </div>`;
}

// ── 2D: proste na płaszczyźnie ────────────────────────────────────────────────

function linePts(a, b, c, R = 4) {
  if (Math.abs(a) + Math.abs(b) < 1e-9) return [];
  if (Math.abs(b) > 1e-9) return [{x: -R, y: (c + a*R)/b}, {x: R, y: (c - a*R)/b}];
  return [{x: c/a, y: -R}, {x: c/a, y: R}];
}

function plot2D(A, b, {width = 420} = {}) {
  const n_eqs = A.length, R = 4, bFlat = b.map(r => r[0]);
  const sol = solveGeneral(A, b);
  const fmt = z => parseFloat(z.toFixed(3)).toString();

  const marks = [
    Plot.gridX({stroke: "#e2e8f0"}), Plot.gridY({stroke: "#e2e8f0"}),
    Plot.ruleX([0], {stroke: "#94a3b8"}), Plot.ruleY([0], {stroke: "#94a3b8"}),
    ...A.map((row, i) => Plot.line(linePts(row[0], row[1], bFlat[i]), {
      x: "x", y: "y", stroke: EQ_COLORS[i], strokeWidth: 2
    }))
  ];

  if (sol.type === "unique" && sol.x.length === 2) {
    const [sx, sy] = sol.x;
    marks.push(Plot.dot([{x: sx, y: sy}], {x: "x", y: "y", fill: "#16a34a", r: 5, stroke: "#fff", strokeWidth: 1.5}));
    marks.push(Plot.text([{x: sx, y: sy, t: `(${fmt(sx)}, ${fmt(sy)})`}], {
      x: "x", y: "y", text: "t", fill: "#16a34a", fontSize: 11, fontWeight: 600, dx: 8, dy: -8
    }));
  }

  let caption = "";
  if (n_eqs === 1) caption = "Jedno równanie — nieskończenie wiele rozwiązań (cała prosta).";
  else if (sol.type === "unique") caption = `Przecięcie: (${sol.x.map(v => fmt(v)).join(", ")})`;
  else if (sol.type === "degenerate" || sol.type === "none") caption = "Brak wspólnego punktu.";
  else if (sol.type === "inconsistent") caption = "Układ sprzeczny — proste nie przecinają się w jednym punkcie.";

  return html`<div>
    ${Plot.plot({
      width, height: width, aspectRatio: 1,
      x: {domain: [-R, R], label: "x"}, y: {domain: [-R, R], label: "y"}, marks
    })}
    <p style="color:#475569; font-style:italic; margin:.4rem 0 0; font-size:.875rem;">${caption}</p>
  </div>`;
}

// ── 3D: płaszczyzny w projekcji izometrycznej ─────────────────────────────────

function plot3D(A, b, {width = 420} = {}) {
  const n_eqs = A.length, R = 2.5, bFlat = b.map(r => r[0]);
  const sol = solveGeneral(A, b);

  const meshData = A.flatMap((row, i) => planeMesh(row[0], row[1], row[2], bFlat[i], R, i));

  const boxRange = R * 1.1;
  const axisLen  = R * 0.85;
  const axesData = [
    {x: 0, y: 0, z: 0, ax: "x"}, {x: axisLen, y: 0, z: 0, ax: "x"},
    {x: 0, y: 0, z: 0, ax: "y"}, {x: 0, y: axisLen, z: 0, ax: "y"},
    {x: 0, y: 0, z: 0, ax: "z"}, {x: 0, y: 0, z: axisLen, ax: "z"}
  ].map(p => ({...proj(p.x, p.y, p.z), ax: p.ax}));

  const axisLabels = [
    {...proj(axisLen * 1.15, 0, 0),        label: "x"},
    {...proj(0, axisLen * 1.15, 0),        label: "y"},
    {...proj(0, 0, axisLen * 1.15),        label: "z"}
  ];

  const marks = [
    Plot.line(axesData, {x: "px", y: "py", z: "ax", stroke: "#94a3b8", strokeWidth: 1.2}),
    Plot.text(axisLabels, {x: "px", y: "py", text: "label", fill: "#94a3b8", fontSize: 12, fontWeight: 600}),
    ...EQ_COLORS.slice(0, n_eqs).map((color, i) => {
      const pts = meshData.filter(p => p.g.startsWith(`e${i}`));
      return Plot.line(pts, {x: "px", y: "py", z: "g", stroke: color, strokeWidth: 0.7, strokeOpacity: 0.55});
    })
  ];

  // Przecięcie dwóch płaszczyzn → linia
  if (n_eqs >= 2) {
    const line = intersectionLine(A[0], bFlat[0], A[1], bFlat[1]);
    if (line) {
      const {pt, dir} = line;
      const ptA = proj(pt[0]-dir[0]*R, pt[1]-dir[1]*R, pt[2]-dir[2]*R);
      const ptB = proj(pt[0]+dir[0]*R, pt[1]+dir[1]*R, pt[2]+dir[2]*R);
      marks.push(Plot.line([ptA, ptB], {x: "px", y: "py", stroke: "#7c3aed", strokeWidth: 2.5}));
    }
  }

  // Punkt przecięcia trzech płaszczyzn
  if (sol.type === "unique" && n_eqs === 3 && sol.x.length === 3) {
    const [x, y, z] = sol.x;
    const fmt = v => parseFloat(v.toFixed(2)).toString();
    const ptProj = proj(x, y, z);
    marks.push(Plot.dot([ptProj], {x: "px", y: "py", fill: "#16a34a", r: 6, stroke: "#fff", strokeWidth: 2}));
    marks.push(Plot.text([{...ptProj, t: `(${[x,y,z].map(fmt).join(", ")})`}], {
      x: "px", y: "py", text: "t", fill: "#16a34a", fontSize: 11, fontWeight: 600, dx: 8, dy: -8
    }));
  }

  let caption = "";
  if (n_eqs === 1) caption = "Jedna płaszczyzna — nieskończenie wiele rozwiązań.";
  else if (n_eqs === 2) caption = "Dwie płaszczyzny — przecięcie to prosta (fioletowa) lub brak rozwiązania.";
  else if (sol.type === "unique") caption = `Trzy płaszczyzny — punkt przecięcia zaznaczony zielonym.`;
  else if (sol.type === "degenerate" || sol.type === "inconsistent") caption = "Trzy płaszczyzny — brak wspólnego punktu.";

  const PAD = 0.7;
  const allPx = meshData.map(p => p.px).filter(isFinite);
  const allPy = meshData.map(p => p.py).filter(isFinite);
  const xd = allPx.length ? [Math.min(...allPx)-PAD, Math.max(...allPx)+PAD] : [-5, 5];
  const yd = allPy.length ? [Math.min(...allPy)-PAD, Math.max(...allPy)+PAD] : [-5, 5];

  return html`<div>
    ${Plot.plot({
      width, height: width,
      x: {domain: xd, axis: null},
      y: {domain: yd, axis: null},
      marks
    })}
    <p style="color:#475569; font-style:italic; margin:.4rem 0 0; font-size:.875rem;">${caption}</p>
  </div>`;
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function generalSystemPlot(A, b, n_vars, {width = 420} = {}) {
  if (n_vars === 1) return plot1D(A, b, {width});
  if (n_vars === 2) return plot2D(A, b, {width});
  return plot3D(A, b, {width});
}

// ── Dynamiczny widget wejścia ─────────────────────────────────────────────────

const DEFAULTS = {
  "1_1": {A:[[2]],              b:[4]},
  "2_1": {A:[[1],[2]],          b:[3, 3]},
  "3_1": {A:[[1],[2],[3]],      b:[2, 4, 6]},
  "1_2": {A:[[1,1]],            b:[3]},
  "2_2": {A:[[1,-1],[1,1]],     b:[0, 2]},
  "3_2": {A:[[1,1],[2,-1],[1,2]],b:[3, 0, 4]},
  "1_3": {A:[[1,1,1]],          b:[3]},
  "2_3": {A:[[1,0,1],[0,1,1]],  b:[2, 2]},
  "3_3": {A:[[1,0,1],[0,2,1],[1,1,0]], b:[2, 3, 2]}
};

export function generalSystemInput(n_eqs, n_vars) {
  const varNames = ["x", "y", "z"].slice(0, n_vars);
  const def = DEFAULTS[`${n_eqs}_${n_vars}`] || {A: Array.from({length:n_eqs},()=>Array(n_vars).fill(0)), b: Array(n_eqs).fill(0)};

  const iStyle = "width:3rem; padding:.15rem .25rem; border:1px solid #cbd5e1; border-radius:.2rem; font-size:.85rem; text-align:center; background:#fff; box-sizing:border-box;";
  const rhsStyle = iStyle.replace("#cbd5e1", "#94a3b8");
  const symStyle = "color:#94a3b8; font-size:.9rem; user-select:none; padding:0 .1rem;";
  const rowStyle = "display:flex; align-items:center; gap:.25rem; padding:.25rem 0;";

  const wrapper = html`<div>
    <div style="display:flex; align-items:center; gap:.25rem; margin-bottom:.35rem; margin-left:1.6rem; font-size:.75rem; color:#94a3b8;">
      ${varNames.map(v => html`<span style="width:3rem; text-align:center;">${v}</span><span style="width:.5rem;"></span>`)}
      <span style="width:.5rem;"></span><span style="width:3rem; text-align:center;">=</span>
    </div>
    ${Array.from({length: n_eqs}, (_, ei) => html`<div style="${rowStyle}">
      <span style="font-size:.8rem; color:${EQ_COLORS[ei]}; font-weight:700; min-width:1.4rem;">r${ei+1}</span>
      ${varNames.map((_, vi) => html`<input type="number" name="a${ei}${vi}"
          value="${def.A[ei][vi]}" step="0.5" onfocus="this.select()" style="${iStyle}">
        ${vi < n_vars - 1 ? html`<span style="${symStyle}">·${varNames[vi]}  +</span>` : html`<span style="${symStyle}">·${varNames[vi]}</span>`}`)}
      <span style="${symStyle}">=</span>
      <input type="number" name="b${ei}" value="${def.b[ei]}" step="0.5" onfocus="this.select()" style="${rhsStyle}">
    </div>`)}
  </div>`;

  Object.defineProperty(wrapper, "value", {
    get() {
      const g = n => +(wrapper.querySelector(`input[name="${n}"]`).value);
      return {
        A: Array.from({length: n_eqs}, (_, ei) => Array.from({length: n_vars}, (_, vi) => g(`a${ei}${vi}`))),
        b: Array.from({length: n_eqs}, (_, ei) => [g(`b${ei}`)])
      };
    }
  });

  return wrapper;
}
