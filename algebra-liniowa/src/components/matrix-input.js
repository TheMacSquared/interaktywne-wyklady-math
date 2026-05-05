// Widget: cztery suwaki dla wpisów macierzy 2x2.
// Zwraca element DOM (formularz Observable Inputs), którego wartością jest [[a,b],[c,d]].

import * as Inputs from "npm:@observablehq/inputs";
import {html} from "npm:htl";

export function matrixInput({
  label = "Macierz A",
  initial = [[1, 0], [0, 1]],
  min = -3,
  max = 3,
  step = 0.1
} = {}) {
  const opts = {min, max, step};
  const inputs = {
    a: Inputs.range([min, max], {...opts, value: initial[0][0], label: "a (1,1)"}),
    b: Inputs.range([min, max], {...opts, value: initial[0][1], label: "b (1,2)"}),
    c: Inputs.range([min, max], {...opts, value: initial[1][0], label: "c (2,1)"}),
    d: Inputs.range([min, max], {...opts, value: initial[1][1], label: "d (2,2)"})
  };

  const form = Inputs.form(inputs);

  // Mapuj {a,b,c,d} -> [[a,b],[c,d]]
  const wrapper = html`<div class="matrix-input">
    <div style="font-weight:600; margin-bottom:.4rem;">${label}</div>
    ${form}
  </div>`;

  // Forward value getter/setter (reaktywność Observable)
  Object.defineProperty(wrapper, "value", {
    get() {
      const v = form.value;
      return [[v.a, v.b], [v.c, v.d]];
    }
  });

  form.addEventListener("input", () => wrapper.dispatchEvent(new Event("input", {bubbles: true})));

  return wrapper;
}

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
