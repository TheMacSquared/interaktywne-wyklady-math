---
title: Układy równań — ogólny widget
---

# Układy równań liniowych — 1D, 2D, 3D

Wybierz liczbę zmiennych i równań — wizualizacja zmieni się automatycznie: punkty na osi (1D), proste na płaszczyźnie (2D) lub płaszczyzny w przestrzeni (3D).

```js
import {generalSystemInput, generalSystemPlot, solveGeneral} from "../components/system-general-plot.js";
import {threeJSPlot} from "../components/system-3d-threejs.js";
```

```js
const nVarsView = Inputs.range([1, 3], {value: 2, step: 1, label: "Liczba zmiennych (wymiar)"});
const n_vars = Generators.input(nVarsView);
```

```js
const nEqsView = Inputs.range([1, 3], {value: 2, step: 1, label: "Liczba równań"});
const n_eqs = Generators.input(nEqsView);
```

```js
const inputView = generalSystemInput(n_eqs, n_vars);
const sys = Generators.input(inputView);
```

<div class="grid grid-cols-2">
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Sterowanie</h3>
    <div style="margin-bottom:.8rem;">${nVarsView}</div>
    <div style="margin-bottom:.8rem;">${nEqsView}</div>
    <div style="font-size:.875rem; color:#475569; margin-bottom:.4rem;">Współczynniki i prawa strona:</div>
    ${inputView}
    <div style="margin-top:1rem;">${display(solutionSummary(sys, n_eqs, n_vars))}</div>
  </div>
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>${n_vars === 1 ? "Oś liczbowa" : n_vars === 2 ? "Płaszczyzna (x, y)" : "Przestrzeń 3D — obracalna"}</h3>
    ${n_vars === 3
      ? display(threeJSPlot(sys.A, sys.b, {width: 450, invalidation}))
      : display(resize((width) => generalSystemPlot(sys.A, sys.b, n_vars, {width})))}
  </div>
</div>

```js
function solutionSummary({A, b}, n_eqs, n_vars) {
  const sol = solveGeneral(A, b);
  const fmt = v => parseFloat((+v).toFixed(4)).toString();
  const varNames = ["x", "y", "z"].slice(0, n_vars);

  let msg, color;
  if (sol.type === "unique") {
    const vals = Array.isArray(sol.x) ? sol.x : [sol.x];
    msg = `Rozwiązanie: ${varNames.map((v, i) => `${v} = ${fmt(vals[i])}`).join(", ")}`;
    color = "#16a34a";
  } else if (sol.type === "none" || sol.type === "inconsistent") {
    msg = "Układ sprzeczny — brak rozwiązania.";
    color = "#dc2626";
  } else if (sol.type === "underdetermined") {
    msg = n_vars - n_eqs === 1
      ? `Układ nieoznaczony — ${n_vars - n_eqs} stopień swobody (∞ rozwiązań).`
      : `Układ nieoznaczony — ${n_vars - n_eqs} stopnie swobody.`;
    color = "#d97706";
  } else if (sol.type === "overdetermined") {
    msg = "Układ nadokreślony — sprawdź spójność powyżej.";
    color = "#d97706";
  } else if (sol.type === "degenerate") {
    msg = "Macierz osobliwa — brak jedynego rozwiązania.";
    color = "#dc2626";
  } else {
    msg = "Spełnione dla każdej wartości.";
    color = "#d97706";
  }

  return html`<div style="padding:.5rem .75rem; border-radius:.375rem; background:${color}18; border-left:3px solid ${color};">
    <span style="color:${color}; font-weight:600; font-size:.875rem;">${msg}</span>
  </div>`;
}
```

## Co widzisz w zależności od wymiarów

**Wymiar 1** (jedna zmienna x): każde równanie ${tex`ax = b`} wyznacza punkt na osi. Kolorowe kropki to rozwiązania poszczególnych równań. Gdy wszystkie kropki się nakrywają — układ zgodny.

**Wymiar 2** (zmienne x, y): każde równanie ${tex`ax + by = c`} to prosta na płaszczyźnie. Rozwiązaniem jest punkt przecięcia.

**Wymiar 3** (zmienne x, y, z): każde równanie ${tex`ax + by + cz = d`} to płaszczyzna w przestrzeni. Kolory: niebieska, czerwona, zielona. Fioletowa linia to przecięcie dwóch pierwszych płaszczyzn.

## Trzy przypadki (niezależnie od wymiaru)

| Sytuacja | Geometria | Rozwiązanie |
|---|---|---|
| det(A) ≠ 0, kwadratowy | obiekty przecinają się w punkcie | jedno |
| Mniej równań niż zmiennych | obiekty przecinają się w prostej / płaszczyźnie | ∞ wiele |
| Równania sprzeczne | obiekty równoległe / brak wspólnego punktu | brak |

## Przykłady do zbadania

- **1 zm., 3 równania:** czy trzy różne równania mogą mieć wspólne rozwiązanie? (spróbuj r1: `2x=4`, r2: `3x=6`, r3: `x=2`)
- **2 zm., 1 równanie:** jedna prosta = nieskończenie wiele rozwiązań — cała prosta to rozwiązanie
- **3 zm., 2 równania:** dwie płaszczyzny przecinają się wzdłuż prostej (fioletowej)
- **3 zm., 3 równania — osobliwe:** ustaw macierz tak by det = 0 i obserwuj czy płaszczyzny się przecinają
