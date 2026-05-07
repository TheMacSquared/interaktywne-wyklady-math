// Wizualizacja szeregu Taylora — wielomian aproksymujący funkcję wokół x₀.

import * as Plot from "npm:@observablehq/plot";
import * as math from "npm:mathjs";
import {html} from "npm:htl";

function safeEval(expr, x) {
  try {
    const v = math.evaluate(expr, {x});
    return isFinite(v) && Math.abs(v) < 1e6 ? +v : NaN;
  } catch { return NaN; }
}

// Kolejne pochodne symboliczne; zwraca tablicę wyrażeń [f, f', f'', ...]
function derivativeChain(expr, maxOrder) {
  const chain = [expr];
  for (let k = 1; k <= maxOrder; k++) {
    try {
      chain.push(math.derivative(chain[k - 1], "x").toString());
    } catch {
      break;
    }
  }
  return chain;
}

// Współczynniki Taylora: c_k = f^(k)(x0) / k!
export function taylorCoeffs(expr, x0, maxOrder) {
  const chain = derivativeChain(expr, maxOrder);
  return chain.map((d, k) => {
    const val = safeEval(d, x0);
    return isNaN(val) ? 0 : val / math.factorial(k);
  });
}

// Wartość wielomianu Taylora stopnia n w punkcie x
export function taylorValue(coeffs, x0, x) {
  let sum = 0;
  for (let k = 0; k < coeffs.length; k++) {
    sum += coeffs[k] * Math.pow(x - x0, k);
  }
  return isFinite(sum) ? sum : NaN;
}

export function taylorPlot(expr, x0, n, {width = 480} = {}) {
  const viewR = 4;
  const xMin = x0 - viewR, xMax = x0 + viewR;
  const coeffs = taylorCoeffs(expr, x0, n);

  const M = 400;
  const pts = Array.from({length: M}, (_, i) => {
    const x = xMin + (xMax - xMin) * i / (M - 1);
    return {x, f: safeEval(expr, x), p: taylorValue(coeffs, x0, x)};
  });

  const curve  = pts.filter(p => !isNaN(p.f)).map(p => ({x: p.x, y: p.f}));
  const taylor = pts.filter(p => !isNaN(p.p) && Math.abs(p.p) < 20).map(p => ({x: p.x, y: p.p}));

  const yVals = [...curve.map(p => p.y), ...taylor.map(p => p.y)].filter(isFinite);
  const yMin  = Math.min(...yVals), yMax = Math.max(...yVals);
  const yPad  = Math.max((yMax - yMin) * 0.15, 0.5);

  // Kolorystyka wielomianu zależy od rzędu (niebieski dla niskich, bardziej fioletowy dla wyższych)
  const polyColor = "#7c3aed";

  return Plot.plot({
    width, height: Math.round(width * 0.75),
    x: {domain: [xMin, xMax], label: "x"},
    y: {domain: [yMin - yPad, yMax + yPad], label: "y"},
    marks: [
      Plot.gridX({stroke: "#e2e8f0"}),
      Plot.gridY({stroke: "#e2e8f0"}),
      Plot.ruleX([0], {stroke: "#94a3b8"}),
      Plot.ruleY([0], {stroke: "#94a3b8"}),

      // Wielomian Taylora
      Plot.line(taylor, {x: "x", y: "y", stroke: polyColor, strokeWidth: 2.2}),

      // Funkcja oryginalna
      Plot.line(curve, {x: "x", y: "y", stroke: "#0f172a", strokeWidth: 2.2}),

      // Punkt rozwinięcia x₀
      Plot.dot([{x: x0, y: safeEval(expr, x0)}], {
        x: "x", y: "y", fill: "#f59e0b", r: 5, stroke: "#fff", strokeWidth: 1.5
      }),

      // Pionowa przerywana przy x₀
      Plot.ruleX([x0], {stroke: "#f59e0b", strokeDasharray: "4,3", strokeWidth: 1.2})
    ]
  });
}

// Czytelne wyrazy szeregu do wyświetlenia w KaTeX
export function taylorTermsDisplay(expr, x0, n) {
  const coeffs = taylorCoeffs(expr, x0, n);
  const fmt = v => {
    const s = parseFloat(v.toFixed(4)).toString();
    return s;
  };
  return coeffs.map((c, k) => ({k, coeff: c, display: fmt(c)}));
}
