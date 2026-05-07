---
title: Układy równań liniowych
---

# Układy równań liniowych

Dwa równania liniowe z dwiema niewiadomymi to geometrycznie dwie **proste na płaszczyźnie**. Rozwiązanie układu to punkt, w którym się przecinają. Ale proste mogą też być równoległe (brak rozwiązania) albo identyczne (nieskończenie wiele rozwiązań) — każdy z tych przypadków ma swoją interpretację w języku macierzy.

Wpisz współczynniki równań poniżej i obserwuj co dzieje się z prostymi.

```js
import {systemInput, systemPlot, solveSystem} from "../components/system-plot.js";
```

```js
const eqView = systemInput({initial: {a1: 1, b1: -1, c1: 0, a2: 1, b2: 1, c2: 2}});
const eq = Generators.input(eqView);
```

```js
const presetView = Inputs.select(
  ["własny wybór", "przecięcie", "równoległe", "identyczne", "prosty przykład"],
  {label: "Przykład"}
);
const preset = Generators.input(presetView);
```

```js
{
  const presets = {
    "przecięcie":     {a1:2, b1:-1, c1:1, a2:1, b2:2,  c2:7},
    "równoległe":     {a1:2, b1: 1, c1:1, a2:2, b2:1,  c2:4},
    "identyczne":     {a1:1, b1: 2, c1:4, a2:2, b2:4,  c2:8},
    "prosty przykład":{a1:1, b1:-1, c1:0, a2:1, b2:1,  c2:2}
  };
  if (preset !== "własny wybór" && presets[preset]) {
    const p = presets[preset];
    ["a1","b1","c1","a2","b2","c2"].forEach(name => {
      const el = eqView.querySelector(`input[name="${name}"]`);
      el.value = p[name];
      el.dispatchEvent(new Event("input", {bubbles: true}));
    });
  }
}
```

<div class="grid grid-cols-2">
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Układ równań</h3>
    <div style="margin-bottom:.5rem; font-size:.875rem; color:#475569;">Wpisz współczynniki — równania aktualizują się na żywo:</div>
    ${eqView}
    <div style="margin-top:.8rem;">${presetView}</div>
    <div style="margin-top:1rem;">
      ${display(eqSummary(eq))}
    </div>
  </div>
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Wykres</h3>
    ${display(resize((width) => systemPlot(eq, {width})))}
  </div>
</div>

```js
function eqSummary({a1, b1, c1, a2, b2, c2}) {
  const fmt = z => {
    const s = parseFloat(z.toFixed(4)).toString();
    return s;
  };
  const sol = solveSystem(a1, b1, c1, a2, b2, c2);
  const detA = a1*b2 - a2*b1;

  const eq1 = `${fmt(a1)}x + ${fmt(b1)}y = ${fmt(c1)}`;
  const eq2 = `${fmt(a2)}x + ${fmt(b2)}y = ${fmt(c2)}`;

  let solText;
  if (sol.type === "unique") {
    solText = tex.block`x = ${fmt(sol.x)}, \quad y = ${fmt(sol.y)}`;
  } else if (sol.type === "none") {
    solText = tex.block`\text{brak rozwiązania}`;
  } else {
    solText = tex.block`\text{nieskończenie wiele rozwiązań}`;
  }

  return html`<div>
    ${tex.block`\begin{cases} ${fmt(a1)}x + ${fmt(b1)}y = ${fmt(c1)} \\ ${fmt(a2)}x + ${fmt(b2)}y = ${fmt(c2)} \end{cases}`}
    ${tex.block`\det(A) = ${fmt(detA)}`}
    ${solText}
  </div>`;
}
```

## Jak to czytać

**Niebieska prosta** to pierwsze równanie, **czerwona** — drugie. Każda para wartości ${tex`(x, y)`} leżących na prostej spełnia odpowiednie równanie. Rozwiązanie układu to para ${tex`(x, y)`} spełniająca oba naraz — geometrycznie: punkt przecięcia.

**Zielony punkt** oznacza znalezione rozwiązanie. Gdy prostych nie widać (ukryte poza ramką) — zmień współczynniki lub wybierz inny przykład.

## Trzy przypadki

- **Jedno rozwiązanie** (${tex`\det(A) \neq 0`}): proste przecinają się w dokładnie jednym punkcie. Macierz układu jest odwracalna — istnieje ${tex`A^{-1}`} i rozwiązanie to ${tex`\mathbf{x} = A^{-1}\mathbf{b}`}.

- **Brak rozwiązania** (${tex`\det(A) = 0`}, proste równoległe): równania sprzeczne. Macierz osobliwa — nie istnieje ${tex`A^{-1}`}.

- **Nieskończenie wiele rozwiązań** (${tex`\det(A) = 0`}, proste identyczne): jedno równanie jest wielokrotnością drugiego. Macierz osobliwa — cała prosta jest rozwiązaniem.

## Postać macierzowa i wzór Cramera

Układ ${tex`a_1 x + b_1 y = c_1`}, ${tex`a_2 x + b_2 y = c_2`} można zapisać jako

```tex
A\mathbf{x} = \mathbf{b}, \qquad
A = \begin{bmatrix} a_1 & b_1 \\ a_2 & b_2 \end{bmatrix}, \quad
\mathbf{x} = \begin{bmatrix} x \\ y \end{bmatrix}, \quad
\mathbf{b} = \begin{bmatrix} c_1 \\ c_2 \end{bmatrix}.
```

Gdy ${tex`\det(A) \neq 0`}, wzór Cramera daje rozwiązanie wprost z wyznaczników:

```tex
x = \frac{\det\begin{bmatrix}c_1 & b_1\\ c_2 & b_2\end{bmatrix}}{\det(A)}, \qquad
y = \frac{\det\begin{bmatrix}a_1 & c_1\\ a_2 & c_2\end{bmatrix}}{\det(A)}.
```

Wyznacznik w mianowniku to dokładnie ta sama liczba, co w rozdziale o wyznacznikach — zero wyznacznika oznacza brak lub nieskończoność rozwiązań.
