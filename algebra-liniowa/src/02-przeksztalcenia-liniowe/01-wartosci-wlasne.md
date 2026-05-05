---
title: Wartości i wektory własne (2×2)
---

# Wartości i wektory własne macierzy 2×2

Wyobraź sobie, że macierz ${tex`A`} pcha każdy wektor płaszczyzny w nowe miejsce. Większość wektorów po drodze obraca się i zmienia długość. Ale dla niektórych macierzy istnieją kierunki specjalne: wektor leżący na takim kierunku po pomnożeniu przez ${tex`A`} **zostaje na swojej prostej** — może się skrócić, wydłużyć albo odbić, ale nie skręca w bok. To są **wektory własne**, a liczba mówiąca o ile się skrócił lub wydłużył to **wartość własna** ${tex`\lambda`}.

Formalnie: wektor ${tex`\mathbf{v} \neq 0`} jest wektorem własnym macierzy ${tex`A`} z wartością własną ${tex`\lambda`}, gdy

```tex
A\mathbf{v} = \lambda\,\mathbf{v}.
```

Pobaw się wpisami macierzy poniżej i zobacz, jak transformacja siatki (lewy panel) wiąże się z wektorami własnymi (prawy panel).

```js
import {matrixInput, examples} from "../components/matrix-input.js";
import {transformPlot, eigenPlot, computeEigen} from "../components/eigen-plot.js";
import * as math from "npm:mathjs";
```

## Sterowanie

```js
const matrixView = matrixInput({label: "Macierz A (2×2)", initial: examples.symmetric});
const A = Generators.input(matrixView);
```

```js
const tView = Inputs.range([0, 1], {value: 1, step: 0.01, label: "Stopień transformacji t"});
const t = Generators.input(tView);
```

```js
const animateBtn = Inputs.button("Uruchom animację", {
  reduce: () => {
    let start = null;
    const duration = 1500;
    function step(ts) {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      tView.value = p;
      tView.dispatchEvent(new Event("input", {bubbles: true}));
      if (p < 1) requestAnimationFrame(step);
    }
    tView.value = 0;
    tView.dispatchEvent(new Event("input", {bubbles: true}));
    requestAnimationFrame(step);
    return Date.now();
  }
});
```

```js
const presetView = Inputs.select(
  ["własny wybór", "tożsamość", "skalowanie 2×, 0.5×", "ścinanie", "obrót 30°", "odbicie", "symetryczna", "wadliwa"],
  {label: "Przykład"}
);
const preset = Generators.input(presetView);
```

```js
// Reakcja na zmianę presetu — programatyczne ustawienie suwaków macierzy.
{
  const map = {
    "tożsamość": examples.identity,
    "skalowanie 2×, 0.5×": examples.scaling,
    "ścinanie": examples.shear,
    "obrót 30°": examples.rotation30,
    "odbicie": examples.reflection,
    "symetryczna": examples.symmetric,
    "wadliwa": examples.defective
  };
  if (preset !== "własny wybór" && map[preset]) {
    const M = map[preset];
    const sliders = matrixView.querySelectorAll('input[type="range"]');
    if (sliders.length === 4) {
      sliders[0].value = M[0][0]; sliders[1].value = M[0][1];
      sliders[2].value = M[1][0]; sliders[3].value = M[1][1];
      sliders.forEach(s => s.dispatchEvent(new Event("input", {bubbles: true})));
    }
  }
}
```

<div class="card">
  <h3>Sterowanie</h3>
  ${matrixView}
  <div style="margin-top:.6rem;">${tView}</div>
  <div style="margin-top:.4rem;">${animateBtn}</div>
  <div style="margin-top:.6rem;">${presetView}</div>
</div>

<div class="card" style="margin-top: 1rem;">
  <h3>Transformacja siatki</h3>
  ${display(transformPlot(A, t))}
</div>

<div class="card" style="margin-top: 1rem;">
  <h3>Wektory własne</h3>
  ${display(eigenPlot(A))}
</div>

<div class="card" style="margin-top: 1rem;">
  <h3>Wartości własne — liczby</h3>
  ${eigenSummary(A)}
</div>

```js
function eigenSummary(A) {
  const {values, allReal} = computeEigen(A);
  const trA = A[0][0] + A[1][1];
  const detA = A[0][0]*A[1][1] - A[0][1]*A[1][0];

  const fmt = z => Math.abs(z) < 1e-9 ? "0" : z.toFixed(3);
  const lambdaList = values.map((v, i) => {
    if (v.isReal) return `\\lambda_${i+1} = ${fmt(v.re)}`;
    const sign = v.im >= 0 ? "+" : "-";
    return `\\lambda_${i+1} = ${fmt(v.re)} ${sign} ${fmt(Math.abs(v.im))}\\,i`;
  }).join(", \\quad ");

  return html`<div>
    ${tex.block`A = \begin{bmatrix} ${fmt(A[0][0])} & ${fmt(A[0][1])} \\ ${fmt(A[1][0])} & ${fmt(A[1][1])} \end{bmatrix}`}
    ${tex.block`\operatorname{tr}(A) = ${fmt(trA)}, \quad \det(A) = ${fmt(detA)}`}
    ${tex.block`${lambdaList}`}
    <p style="color:#475569; font-style: italic;">
      ${allReal
        ? "Obie wartości własne są rzeczywiste — macierz ma dwa kierunki niezmienne (wektory własne)."
        : "Wartości własne są zespolone sprzężone — macierz obraca przestrzeń, brak rzeczywistych wektorów własnych."}
    </p>
  </div>`;
}
```

## Jak to czytać

**Lewy panel** pokazuje, co macierz ${tex`A`} robi z całą płaszczyzną. Szare linie to oryginalna siatka jednostkowa, niebieskie — ta sama siatka po pomnożeniu każdego punktu przez ${tex`A`}. Przerywany szary okrąg to okrąg jednostkowy, pomarańczowa krzywa to jego obraz — w ogólnym przypadku elipsa, której półosie pokrywają się z kierunkami wektorów własnych (gdy macierz jest symetryczna).

Suwak ${tex`t`} interpoluje między tożsamością ${tex`I`} a docelową macierzą ${tex`A`}: w ${tex`t=0`} obie siatki się pokrywają, w ${tex`t=1`} widzisz pełną transformację. Pośrednie wartości pomagają zobaczyć ruch.

**Prawy panel** rysuje wektory własne (czarne strzałki) i ich obrazy ${tex`A\mathbf{v} = \lambda\mathbf{v}`} (kolorowe). Kolor obrazu mówi o ${tex`\lambda`}: czerwony — wydłużenie ${tex`(\lambda > 1)`}, niebieski — skrócenie ${tex`(0 < \lambda < 1)`}, fioletowy — odbicie ${tex`(\lambda < 0)`}. Gdy ${tex`\lambda`} jest zespolona, panel pokazuje łuk obrotu zamiast wektorów.

## Przypadki, na które warto patrzeć

- **Tożsamość.** ${tex`A = I`} — siatka się nie zmienia, każdy wektor jest własny z ${tex`\lambda = 1`}.
- **Skalowanie 2×, 0.5×.** Diagonalna macierz ${tex`\operatorname{diag}(2, 0{,}5)`} rozciąga oś ${tex`x`} dwukrotnie i ściska oś ${tex`y`} o połowę. Wektory własne to po prostu osie układu.
- **Ścinanie.** ${tex`\begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}`} ma podwójną wartość własną ${tex`\lambda = 1`}, ale tylko jeden kierunek własny (oś ${tex`x`}). Mówimy, że macierz jest **wadliwa** — nie da się jej zdiagonalizować.
- **Obrót 30°.** Czysty obrót nie ma rzeczywistych wektorów własnych — żaden wektor nie pozostaje na swojej prostej. Wartości własne są zespolone: ${tex`\lambda = \cos\theta \pm i\sin\theta`}.
- **Macierz symetryczna.** ${tex`\begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}`} ma dwie rzeczywiste wartości własne i wektory własne **ortogonalne** — to ogólna własność macierzy symetrycznych (twierdzenie spektralne).

## Wzór, który stoi za rysunkiem

Wartości własne macierzy 2×2 znajdujemy z **równania charakterystycznego**:

```tex
\det(A - \lambda I) = 0 \quad\Longleftrightarrow\quad \lambda^2 - \operatorname{tr}(A)\,\lambda + \det(A) = 0,
```

skąd

```tex
\lambda_{1,2} = \frac{\operatorname{tr}(A) \pm \sqrt{\operatorname{tr}(A)^2 - 4\det(A)}}{2}.
```

Wartości są zespolone dokładnie wtedy, gdy ${tex`\operatorname{tr}(A)^2 < 4\det(A)`} — temu warunkowi odpowiadają macierze, które obracają przestrzeń.
