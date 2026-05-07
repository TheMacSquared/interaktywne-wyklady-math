// Widget: cztery pola liczbowe dla wpisów macierzy 2x2.
// Zwraca element DOM, którego wartością jest [[a,b],[c,d]].
// Pola nie mają ograniczenia zakresu — można wpisać dowolną liczbę.

import {html} from "npm:htl";

export function matrixInput({
  label = "Macierz A",
  initial = [[1, 0], [0, 1]],
  step = 0.1
} = {}) {
  const entries = [
    {name: "a", label: "a₁₁", value: initial[0][0]},
    {name: "b", label: "a₁₂", value: initial[0][1]},
    {name: "c", label: "a₂₁", value: initial[1][0]},
    {name: "d", label: "a₂₂", value: initial[1][1]}
  ];

  const cellStyle = "display:flex; flex-direction:column; gap:.2rem; font-size:.8125rem; color:#475569;";
  const inputStyle = "width:100%; padding:.25rem .4rem; border:1px solid #cbd5e1; border-radius:.25rem; font-size:.875rem; background:#fff; box-sizing:border-box;";

  const wrapper = html`<div class="matrix-input">
    <div style="font-weight:600; margin-bottom:.5rem;">${label}</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:.4rem .75rem; max-width:14rem;">
      ${entries.map(e => html`<label style="${cellStyle}">
        ${e.label}
        <input type="number" name="${e.name}" value="${e.value}" step="${step}" style="${inputStyle}" onfocus="this.select()">
      </label>`)}
    </div>
  </div>`;

  Object.defineProperty(wrapper, "value", {
    get() {
      const g = name => +(wrapper.querySelector(`input[name="${name}"]`).value);
      return [[g("a"), g("b")], [g("c"), g("d")]];
    }
  });

  return wrapper;
}

// Widget 3×3 — analogiczny do matrixInput, ale dla 9 wpisów.
export function matrixInput3({
  label = "Macierz A",
  initial = [[1,0,0],[0,1,0],[0,0,1]],
  step = 0.1
} = {}) {
  const names  = ["a11","a12","a13","a21","a22","a23","a31","a32","a33"];
  const labels = ["a₁₁","a₁₂","a₁₃","a₂₁","a₂₂","a₂₃","a₃₁","a₃₂","a₃₃"];
  const values = initial.flat();

  const cellStyle  = "display:flex; flex-direction:column; gap:.15rem; font-size:.75rem; color:#475569;";
  const inputStyle = "width:100%; padding:.2rem .3rem; border:1px solid #cbd5e1; border-radius:.25rem; font-size:.8rem; text-align:center; background:#fff; box-sizing:border-box;";

  const wrapper = html`<div class="matrix-input">
    <div style="font-weight:600; margin-bottom:.5rem;">${label}</div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:.35rem; max-width:16rem;">
      ${names.map((name, i) => html`<label style="${cellStyle}">
        ${labels[i]}
        <input type="number" name="${name}" value="${values[i]}" step="${step}" onfocus="this.select()" style="${inputStyle}">
      </label>`)}
    </div>
  </div>`;

  Object.defineProperty(wrapper, "value", {
    get() {
      const g = n => +(wrapper.querySelector(`input[name="${n}"]`).value);
      return [
        [g("a11"), g("a12"), g("a13")],
        [g("a21"), g("a22"), g("a23")],
        [g("a31"), g("a32"), g("a33")]
      ];
    }
  });

  return wrapper;
}

// Predefiniowane przykłady 3×3.
export const examples3 = {
  identity3:   [[1,0,0],[0,1,0],[0,0,1]],
  diagonal:    [[2,0,0],[0,3,0],[0,0,-1]],
  scaling3:    [[2,0,0],[0,3,0],[0,0,5]],
  upper:       [[2,1,3],[0,4,2],[0,0,5]],
  singular:    [[1,2,3],[4,5,6],[7,8,9]],
  general:     [[1,2,3],[0,1,4],[5,6,0]]
};

// Predefiniowane przykłady — ułatwiają rozmowę o przypadkach.
export const examples = {
  identity: [[1, 0], [0, 1]],
  scaling: [[2, 0], [0, 0.5]],
  shear: [[1, 1], [0, 1]],
  rotation30: [
    [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)],
    [Math.sin(Math.PI / 6),  Math.cos(Math.PI / 6)]
  ],
  reflection: [[1, 0], [0, -1]],
  symmetric: [[2, 1], [1, 2]],
  defective: [[2, 1], [0, 2]] // jedna wartość własna podwójna, niediagonalizowalna
};
