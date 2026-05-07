// Wizualizacja sum Riemannowskich i całki oznaczonej.

import * as Plot from "npm:@observablehq/plot";
import * as math from "npm:mathjs";
import {html} from "npm:htl";

function safeEval(expr, x) {
  try {
    const v = math.evaluate(expr, {x});
    return isFinite(v) ? +v : NaN;
  } catch { return NaN; }
}

// Punkty ewaluacji dla każdej metody
function evalPoint(method, left, right) {
  if (method === "left")     return left;
  if (method === "right")    return right;
  if (method === "midpoint") return (left + right) / 2;
  return left; // trapezoid handled separately
}

export function riemannSum(expr, a, b, N, method) {
  const dx = (b - a) / N;
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const left = a + i * dx, right = left + dx;
    if (method === "trapezoid") {
      sum += (safeEval(expr, left) + safeEval(expr, right)) / 2 * dx;
    } else {
      sum += safeEval(expr, evalPoint(method, left, right)) * dx;
    }
  }
  return sum;
}

// Wartość referencyjna — midpoint z dużym N
export function refIntegral(expr, a, b) {
  return riemannSum(expr, a, b, 2000, "midpoint");
}

export function riemannPlot(expr, a, b, N, method, {width = 480} = {}) {
  const dx = (b - a) / N;
  const pad = (b - a) * 0.15;
  const xMin = a - pad, xMax = b + pad;

  // Próbkowanie krzywej
  const M = 400;
  const curve = Array.from({length: M}, (_, i) => {
    const x = xMin + (xMax - xMin) * i / (M - 1);
    return {x, y: safeEval(expr, x)};
  }).filter(p => !isNaN(p.y));

  const yVals = curve.map(p => p.y).filter(isFinite);
  const yMin = Math.min(0, ...yVals);
  const yMax = Math.max(0, ...yVals);
  const yPad = Math.max((yMax - yMin) * 0.15, 0.3);

  const marks = [
    Plot.gridX({stroke: "#e2e8f0"}),
    Plot.gridY({stroke: "#e2e8f0"}),
    Plot.ruleX([0], {stroke: "#94a3b8"}),
    Plot.ruleY([0], {stroke: "#64748b", strokeWidth: 1.5})
  ];

  if (method === "trapezoid") {
    // Trapezy: pole między odcinkami łączącymi wartości funkcji a osią X
    const trapPts = Array.from({length: N + 1}, (_, i) => ({
      x: a + i * dx,
      y: safeEval(expr, a + i * dx)
    }));
    marks.push(Plot.area(trapPts, {
      x: "x", y: "y", y2: 0,
      fill: "#2563eb", fillOpacity: 0.25
    }));
    marks.push(Plot.line(trapPts, {
      x: "x", y: "y",
      stroke: "#2563eb", strokeWidth: 1.2
    }));
  } else {
    // Prostokąty
    const rects = Array.from({length: N}, (_, i) => {
      const left = a + i * dx, right = left + dx;
      const h = safeEval(expr, evalPoint(method, left, right));
      return {x1: left, x2: right, y1: 0, y2: isNaN(h) ? 0 : h};
    });
    marks.push(Plot.rect(rects, {
      x1: "x1", x2: "x2", y1: "y1", y2: "y2",
      fill: d => d.y2 >= 0 ? "#2563eb" : "#dc2626",
      fillOpacity: 0.3,
      stroke: d => d.y2 >= 0 ? "#2563eb" : "#dc2626",
      strokeWidth: 0.8
    }));
    // Punkty ewaluacji
    const pts = Array.from({length: N}, (_, i) => {
      const left = a + i * dx, right = left + dx;
      const x = evalPoint(method, left, right);
      return {x, y: safeEval(expr, x)};
    }).filter(p => !isNaN(p.y));
    marks.push(Plot.dot(pts, {x: "x", y: "y", fill: "#2563eb", r: 2.5, strokeWidth: 0}));
  }

  // Krzywa funkcji
  marks.push(Plot.line(curve, {
    x: "x", y: "y", stroke: "#0f172a", strokeWidth: 2
  }));

  // Zaznaczenie granic całkowania
  marks.push(Plot.ruleX([a, b], {stroke: "#64748b", strokeDasharray: "4,3", strokeWidth: 1}));

  return Plot.plot({
    width, height: Math.round(width * 0.7),
    x: {domain: [xMin, xMax], label: "x"},
    y: {domain: [yMin - yPad, yMax + yPad], label: "y"},
    marks
  });
}
