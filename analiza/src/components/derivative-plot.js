// Wizualizacja pochodnej jako granicy ilorazu różnicowego.

import * as Plot from "npm:@observablehq/plot";
import * as math from "npm:mathjs";
import {html} from "npm:htl";

function safeEval(expr, x) {
  try {
    const v = math.evaluate(expr, {x});
    return isFinite(v) ? +v : NaN;
  } catch { return NaN; }
}

// Numeryczna pochodna (centralny iloraz różnicowy, bardzo małe h)
function numDeriv(expr, x) {
  const eps = 1e-7;
  return (safeEval(expr, x + eps) - safeEval(expr, x - eps)) / (2 * eps);
}

// Symboliczna pochodna przez mathjs (zwraca string lub null)
export function symbolicDeriv(expr) {
  try {
    return math.derivative(expr, "x").toString();
  } catch { return null; }
}

// Prosta przez dwa punkty, przycięta do [xMin, xMax]
function lineThrough(x1, y1, x2, y2, xMin, xMax) {
  if (Math.abs(x2 - x1) < 1e-12) return [];
  const slope = (y2 - y1) / (x2 - x1);
  return [
    {x: xMin, y: y1 + slope * (xMin - x1)},
    {x: xMax, y: y1 + slope * (xMax - x1)}
  ];
}

export function derivativePlot(expr, x0, h, {width = 480} = {}) {
  const viewR = 3.5;
  const xMin = x0 - viewR, xMax = x0 + viewR;

  const curve = Array.from({length: 400}, (_, i) => {
    const x = xMin + (xMax - xMin) * i / 399;
    return {x, y: safeEval(expr, x)};
  }).filter(p => !isNaN(p.y));

  const yVals = curve.map(p => p.y).filter(isFinite);
  const yMin = Math.min(...yVals), yMax = Math.max(...yVals);
  const yPad = Math.max((yMax - yMin) * 0.25, 0.5);

  const f0  = safeEval(expr, x0);
  const fh  = safeEval(expr, x0 + h);
  const secSlope = isNaN(f0) || isNaN(fh) ? NaN : (fh - f0) / h;
  const tanSlope = numDeriv(expr, x0);

  const secLine = isNaN(secSlope) ? [] : lineThrough(x0, f0, x0 + h, fh, xMin, xMax);
  const tanLine = isNaN(tanSlope) ? [] : lineThrough(x0, f0, x0 + 1, f0 + tanSlope, xMin, xMax);

  const marks = [
    Plot.gridX({stroke: "#e2e8f0"}),
    Plot.gridY({stroke: "#e2e8f0"}),
    Plot.ruleX([0], {stroke: "#94a3b8"}),
    Plot.ruleY([0], {stroke: "#94a3b8"}),

    // Styczna (pomarańczowa)
    Plot.line(tanLine, {x: "x", y: "y", stroke: "#ea580c", strokeWidth: 2, strokeDasharray: "6,3"}),

    // Sieczna (niebieska)
    Plot.line(secLine, {x: "x", y: "y", stroke: "#2563eb", strokeWidth: 2}),

    // Krzywa funkcji
    Plot.line(curve, {x: "x", y: "y", stroke: "#0f172a", strokeWidth: 2.2}),

    // Punkt x0
    Plot.dot([{x: x0, y: f0}], {x: "x", y: "y", fill: "#0f172a", r: 5, stroke: "#fff", strokeWidth: 1.5}),

    // Punkt x0+h (tylko gdy h jest widoczne)
    ...(!isNaN(fh) && Math.abs(h) > 0.02 ? [
      Plot.dot([{x: x0 + h, y: fh}], {x: "x", y: "y", fill: "#2563eb", r: 4, stroke: "#fff", strokeWidth: 1.5}),
      // Ramiona ilorazu różnicowego (pomocnicze linie)
      Plot.link([{x1: x0, y1: f0, x2: x0 + h, y2: f0}], {
        x1: "x1", y1: "y1", x2: "x2", y2: "y2",
        stroke: "#94a3b8", strokeDasharray: "3,2", strokeWidth: 1
      }),
      Plot.link([{x1: x0 + h, y1: f0, x2: x0 + h, y2: fh}], {
        x1: "x1", y1: "y1", x2: "x2", y2: "y2",
        stroke: "#94a3b8", strokeDasharray: "3,2", strokeWidth: 1
      })
    ] : [])
  ];

  return Plot.plot({
    width, height: Math.round(width * 0.75),
    x: {domain: [xMin, xMax], label: "x"},
    y: {domain: [yMin - yPad, yMax + yPad], label: "y"},
    marks
  });
}

export function slopeInfo(expr, x0, h) {
  const f0  = safeEval(expr, x0);
  const fh  = safeEval(expr, x0 + h);
  const sec = (fh - f0) / h;
  const tan = numDeriv(expr, x0);
  return {secant: sec, tangent: tan, f0, fh};
}
