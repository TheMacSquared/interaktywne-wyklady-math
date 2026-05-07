// Panel wyznacznika: kolumny macierzy jako wektory + równoległobok przez nie rozpięty.
// det = pole orientowane; kolor zależy od znaku.

import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";

const RANGE = 3;

export function detPlot(A, {width = 420} = {}) {
  const v1 = [A[0][0], A[1][0]]; // pierwsza kolumna
  const v2 = [A[0][1], A[1][1]]; // druga kolumna
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];

  const fmt = z => Math.abs(z) < 1e-9 ? "0" : parseFloat(z.toFixed(4)).toString();

  const color = Math.abs(det) < 1e-9 ? "#94a3b8" : det > 0 ? "#16a34a" : "#dc2626";
  const statusMsg = Math.abs(det) < 1e-9
    ? "det = 0 — macierz osobliwa, kolumny liniowo zależne"
    : det > 0
    ? `det = ${fmt(det)} — orientacja zachowana`
    : `det = ${fmt(det)} — orientacja odwrócona`;

  // Wierzchołki równoległoboku: 0, v1, v1+v2, v2, (zamknięcie)
  const parallelogram = [
    {x: 0,           y: 0},
    {x: v1[0],       y: v1[1]},
    {x: v1[0]+v2[0], y: v1[1]+v2[1]},
    {x: v2[0],       y: v2[1]},
    {x: 0,           y: 0}
  ];

  // Przerywane boki równoległe do v1 i v2 (od końców wektorów do wspólnego wierzchołka)
  const side1 = [{x: v2[0], y: v2[1]}, {x: v1[0]+v2[0], y: v1[1]+v2[1]}];
  const side2 = [{x: v1[0], y: v1[1]}, {x: v1[0]+v2[0], y: v1[1]+v2[1]}];

  return html`<div>
    ${Plot.plot({
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
        // Obrys równoległoboku
        Plot.line(parallelogram, {x: "x", y: "y", stroke: color, strokeWidth: 1.5, strokeOpacity: 0.7}),
        // Przerywane boki dopełniające (od końców wektorów)
        Plot.line(side1, {x: "x", y: "y", stroke: color, strokeWidth: 1.2, strokeDasharray: "4,3", strokeOpacity: 0.6}),
        Plot.line(side2, {x: "x", y: "y", stroke: color, strokeWidth: 1.2, strokeDasharray: "4,3", strokeOpacity: 0.6}),
        // Wektory kolumnowe
        Plot.arrow([{x1: 0, y1: 0, x2: v1[0], y2: v1[1]}], {
          x1: "x1", y1: "y1", x2: "x2", y2: "y2",
          stroke: "#0f172a", strokeWidth: 2.5, headLength: 10
        }),
        Plot.arrow([{x1: 0, y1: 0, x2: v2[0], y2: v2[1]}], {
          x1: "x1", y1: "y1", x2: "x2", y2: "y2",
          stroke: "#475569", strokeWidth: 2.5, headLength: 10
        }),
        // Etykiety wektorów
        Plot.text([
          {x: v1[0] * 0.52, y: v1[1] * 0.52, text: "v₁"},
          {x: v2[0] * 0.52, y: v2[1] * 0.52, text: "v₂"}
        ], {x: "x", y: "y", text: "text", fontSize: 13, fontWeight: 600, fill: "#0f172a", dx: 5, dy: -5})
      ]
    })}
    <p style="color:${color}; font-weight:600; margin:.4rem 0 0; font-size:.9rem;">${statusMsg}</p>
  </div>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Wyznacznik 3×3: reguła Sarrusa — 6 iloczynów przekątnych z podziałem +/−.

export function sarrusDisplay(A) {
  const fmt = z => Math.abs(z) < 1e-9 ? "0" : parseFloat(z.toFixed(4)).toString();

  // 6 iloczynów: 3 pozytywne (↘), 3 negatywne (↗)
  const terms = [
    {sign: "+", colors: ["#15803d","#15803d","#15803d"], cells: [[0,0],[1,1],[2,2]]},
    {sign: "+", colors: ["#16a34a","#16a34a","#16a34a"], cells: [[0,1],[1,2],[2,0]]},
    {sign: "+", colors: ["#4ade80","#166534","#166534"], cells: [[0,2],[1,0],[2,1]]},
    {sign: "−", colors: ["#b91c1c","#b91c1c","#b91c1c"], cells: [[0,2],[1,1],[2,0]]},
    {sign: "−", colors: ["#dc2626","#dc2626","#dc2626"], cells: [[0,0],[1,2],[2,1]]},
    {sign: "−", colors: ["#ef4444","#ef4444","#ef4444"], cells: [[0,1],[1,0],[2,2]]},
  ];

  const posColors = ["#15803d", "#16a34a", "#166534"];
  const negColors = ["#b91c1c", "#dc2626", "#ef4444"];

  const det = terms.slice(0,3).reduce((s,t) => s + t.cells.reduce((p,[r,c]) => p*A[r][c], 1), 0)
            - terms.slice(3).reduce((s,t) => s + t.cells.reduce((p,[r,c]) => p*A[r][c], 1), 0);

  const detColor = Math.abs(det) < 1e-9 ? "#94a3b8" : det > 0 ? "#16a34a" : "#dc2626";
  const statusMsg = Math.abs(det) < 1e-9
    ? "det = 0 — macierz osobliwa, wiersze (kolumny) liniowo zależne"
    : `det = ${fmt(det)}${det > 0 ? " — orientacja zachowana" : " — orientacja odwrócona"}`;

  const rowStyle = "display:flex; align-items:baseline; gap:.35rem; font-family:monospace; font-size:.85rem; padding:.18rem 0;";

  return html`<div>
    <div style="font-size:.8125rem; color:#475569; margin-bottom:.6rem;">
      Reguła Sarrusa — suma 3 iloczynów ↘ minus suma 3 iloczynów ↗:
    </div>
    ${terms.map((t, ti) => {
      const color = ti < 3 ? posColors[ti] : negColors[ti - 3];
      const product = t.cells.reduce((p,[r,c]) => p*A[r][c], 1);
      const [r0,c0] = t.cells[0], [r1,c1] = t.cells[1], [r2,c2] = t.cells[2];
      return html`<div style="${rowStyle}">
        <span style="color:${color}; font-weight:700; width:1rem;">${t.sign}</span>
        <span style="color:${color};">
          ${fmt(A[r0][c0])} · ${fmt(A[r1][c1])} · ${fmt(A[r2][c2])}
        </span>
        <span style="color:#94a3b8; font-size:.8rem;">= ${fmt(product)}</span>
      </div>`;
    })}
    <div style="border-top:1px solid #e2e8f0; margin-top:.5rem; padding-top:.5rem;">
      <span style="font-weight:700; color:${detColor}; font-size:.9rem;">${statusMsg}</span>
    </div>
  </div>`;
}
