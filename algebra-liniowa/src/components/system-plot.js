// Wizualizacja układu dwóch równań liniowych jako dwóch prostych na płaszczyźnie.

import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";

const RANGE = 4;

// Dwa punkty definiujące prostą ax+by=c w obrębie [-R,R]×[-R,R].
function linePts(a, b, c, R = RANGE) {
  if (Math.abs(a) + Math.abs(b) < 1e-9) return [];
  if (Math.abs(b) > 1e-9) {
    return [
      {x: -R, y: (c + a * R) / b},
      {x:  R, y: (c - a * R) / b}
    ];
  }
  // Pionowa prosta x = c/a
  const x = c / a;
  return [{x, y: -R}, {x, y: R}];
}

export function solveSystem(a1, b1, c1, a2, b2, c2) {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-9) {
    // Sprawdź czy proste są identyczne (punkt z prostej 1 leży na prostej 2)
    const [testX, testY] = Math.abs(b1) > 1e-9
      ? [0, c1 / b1]
      : [c1 / a1, 0];
    return Math.abs(a2 * testX + b2 * testY - c2) < 1e-9
      ? {type: "infinite"}
      : {type: "none"};
  }
  return {
    type: "unique",
    x: (c1 * b2 - c2 * b1) / det,
    y: (a1 * c2 - a2 * c1) / det
  };
}

export function systemPlot({a1 = 1, b1 = 0, c1 = 1, a2 = 0, b2 = 1, c2 = 2} = {}, {width = 420} = {}) {
  const pts1 = linePts(a1, b1, c1);
  const pts2 = linePts(a2, b2, c2);
  const sol  = solveSystem(a1, b1, c1, a2, b2, c2);
  const fmt  = z => parseFloat(z.toFixed(3)).toString();

  let captionText;
  if (sol.type === "unique") {
    captionText = `Przecięcie: x = ${fmt(sol.x)}, y = ${fmt(sol.y)} — jedno rozwiązanie.`;
  } else if (sol.type === "none") {
    captionText = "Proste równoległe — układ sprzeczny, brak rozwiązania.";
  } else {
    captionText = "Proste identyczne — układ nieoznaczony, nieskończenie wiele rozwiązań.";
  }

  const marks = [
    Plot.gridX({stroke: "#e2e8f0"}),
    Plot.gridY({stroke: "#e2e8f0"}),
    Plot.ruleX([0], {stroke: "#94a3b8"}),
    Plot.ruleY([0], {stroke: "#94a3b8"}),
    Plot.line(pts1, {x: "x", y: "y", stroke: "#2563eb", strokeWidth: 2.2}),
    Plot.line(pts2, {x: "x", y: "y", stroke: "#dc2626", strokeWidth: 2.2})
  ];

  if (sol.type === "unique") {
    marks.push(Plot.dot([sol], {
      x: "x", y: "y", fill: "#16a34a", r: 5, stroke: "#fff", strokeWidth: 1.5
    }));
    marks.push(Plot.text([{...sol, label: `(${fmt(sol.x)}, ${fmt(sol.y)})`}], {
      x: "x", y: "y", text: "label",
      fill: "#16a34a", fontSize: 11, fontWeight: 600, dx: 8, dy: -8
    }));
  }

  return html`<div>
    ${Plot.plot({
      width,
      height: width,
      aspectRatio: 1,
      x: {domain: [-RANGE, RANGE], label: "x"},
      y: {domain: [-RANGE, RANGE], label: "y"},
      marks
    })}
    <p style="color:#475569; font-style:italic; margin:.4rem 0 0; font-size:.875rem;">${captionText}</p>
  </div>`;
}

// Widget do wpisywania układu: dwa równania ax+by=c w formie inline.
export function systemInput({
  initial = {a1: 1, b1: -1, c1: 0, a2: 1, b2: 1, c2: 2}
} = {}) {
  const iStyle = "width:3.5rem; padding:.2rem .3rem; border:1px solid #cbd5e1; border-radius:.25rem; font-size:.9rem; text-align:center; background:#fff; box-sizing:border-box;";
  const symStyle = "color:#475569; font-size:.95rem; user-select:none;";
  const rowStyle = "display:flex; align-items:center; gap:.35rem; padding:.35rem 0; font-family:serif; font-size:1rem;";

  const wrapper = html`<div>
    <div style="${rowStyle}">
      <input type="number" name="a1" value="${initial.a1}" step="0.5" onfocus="this.select()" style="${iStyle}">
      <span style="${symStyle}">x +</span>
      <input type="number" name="b1" value="${initial.b1}" step="0.5" onfocus="this.select()" style="${iStyle}">
      <span style="${symStyle}">y =</span>
      <input type="number" name="c1" value="${initial.c1}" step="0.5" onfocus="this.select()" style="${iStyle}">
    </div>
    <div style="${rowStyle}">
      <input type="number" name="a2" value="${initial.a2}" step="0.5" onfocus="this.select()" style="${iStyle}">
      <span style="${symStyle}">x +</span>
      <input type="number" name="b2" value="${initial.b2}" step="0.5" onfocus="this.select()" style="${iStyle}">
      <span style="${symStyle}">y =</span>
      <input type="number" name="c2" value="${initial.c2}" step="0.5" onfocus="this.select()" style="${iStyle}">
    </div>
  </div>`;

  const g = name => +(wrapper.querySelector(`input[name="${name}"]`).value);
  Object.defineProperty(wrapper, "value", {
    get: () => ({a1: g("a1"), b1: g("b1"), c1: g("c1"), a2: g("a2"), b2: g("b2"), c2: g("c2")})
  });

  return wrapper;
}
