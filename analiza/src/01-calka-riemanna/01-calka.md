---
title: Całka Riemannowska
---

# Całka oznaczona jako pole pod krzywą

Wyobraź sobie, że chcesz obliczyć pole obszaru między wykresem funkcji ${tex`f(x)`} a osią ${tex`x`} na przedziale ${tex`[a,b]`}. Idea jest prosta: podziel przedział na ${tex`N`} równych kawałków i na każdym kawałku postaw prostokąt, którego wysokość to wartość funkcji w wybranym punkcie. Pole sumy wszystkich prostokątów to **suma Riemannowska** — i w granicy gdy ${tex`N \to \infty`}, zbiega ona do **całki oznaczonej** ${tex`\int_a^b f(x)\,\mathrm{d}x`}.

Pobaw się liczbą prostokątów i metodą — obserwuj jak suma zbliża się do dokładnej wartości.

```js
import {riemannPlot, riemannSum, refIntegral} from "../components/riemann-plot.js";
```

```js
const exprView = Inputs.text({
  label: "Funkcja f(x)",
  value: "x^2",
  placeholder: "np. sin(x), sqrt(x), x^2 - x"
});
const expr = Generators.input(exprView);
```

```js
const aView = Inputs.range([-5, 5], {value: 0, step: 0.1, label: "a (lewa granica)"});
const a = Generators.input(aView);
const bView = Inputs.range([-5, 5], {value: 1, step: 0.1, label: "b (prawa granica)"});
const b = Generators.input(bView);
```

```js
const NView = Inputs.range([1, 100], {value: 8, step: 1, label: "N (liczba prostokątów)"});
const N = Generators.input(NView);
```

```js
const methodView = Inputs.select(
  ["left", "right", "midpoint", "trapezoid"],
  {
    label: "Metoda",
    format: x => ({left:"lewy koniec", right:"prawy koniec", midpoint:"punkt środkowy", trapezoid:"metoda trapezów"})[x]
  }
);
const method = Generators.input(methodView);
```

```js
const fixedXView = Inputs.toggle({label: "Stały zakres osi X (−5 do 5)", value: true});
const fixedX = Generators.input(fixedXView);
```

```js
const presetView = Inputs.select(
  ["własna", "x² na [0,1]", "sin(x) na [0,π]", "√x na [0,4]", "1/x na [1,e]", "x²−x na [−1,2]"],
  {label: "Przykład"}
);
const preset = Generators.input(presetView);
```

```js
{
  const presets = {
    "x² na [0,1]":      {expr:"x^2",    a:0,            b:1},
    "sin(x) na [0,π]":  {expr:"sin(x)", a:0,            b:Math.PI},
    "√x na [0,4]":      {expr:"sqrt(x)",a:0,            b:4},
    "1/x na [1,e]":     {expr:"1/x",    a:1,            b:Math.E},
    "x²−x na [−1,2]":  {expr:"x^2 - x",a:-1,           b:2}
  };
  if (preset !== "własna" && presets[preset]) {
    const p = presets[preset];
    exprView.value = p.expr; exprView.dispatchEvent(new Event("input", {bubbles:true}));
    aView.value = p.a;       aView.dispatchEvent(new Event("input", {bubbles:true}));
    bView.value = p.b;       bView.dispatchEvent(new Event("input", {bubbles:true}));
  }
}
```

<div class="grid grid-cols-2">
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Sterowanie</h3>
    <div style="margin-bottom:.6rem;">${exprView}</div>
    <div style="margin-bottom:.5rem;">${aView}</div>
    <div style="margin-bottom:.5rem;">${bView}</div>
    <div style="margin-bottom:.5rem;">${NView}</div>
    <div style="margin-bottom:.5rem;">${methodView}</div>
    <div style="margin-bottom:.5rem;">${fixedXView}</div>
    <div style="margin-top:.6rem;">${presetView}</div>
    <div style="margin-top:1rem;">${display(riemannSummary(expr, a, b, N, method))}</div>
  </div>
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Suma Riemannowska</h3>
    ${display(resize((width) => riemannPlot(expr, a, b, N, method, {width, fixedX})))}
  </div>
</div>

```js
function riemannSummary(expr, a, b, N, method) {
  if (a >= b) return html`<p style="color:#dc2626;">Wymagane a &lt; b.</p>`;
  const sum = riemannSum(expr, a, b, N, method);
  const ref = refIntegral(expr, a, b);
  const err = Math.abs(sum - ref);
  const fmt = v => isNaN(v) ? "—" : parseFloat(v.toFixed(6)).toString();
  const methodName = {left:"Lewa",right:"Prawa",midpoint:"Środkowa",trapezoid:"Trapezów"}[method];
  return html`<div>
    ${tex.block`S_N \approx ${fmt(sum)}`}
    <p style="color:#475569; font-size:.875rem; margin:.3rem 0 0;">
      Wartość referencyjna: <strong>${fmt(ref)}</strong><br>
      Błąd: <strong>${fmt(err)}</strong>
      ${err < 0.001 ? " ✓" : ""}
    </p>
  </div>`;
}
```

## Jak to czytać

**Niebieskie prostokąty** (lub trapezowy obszar) to aproksymacja pola. Kolor mówi o znaku:
- niebieski — prostokąt powyżej osi ${tex`x`} (contributes dodatnio)
- czerwony — prostokąt poniżej osi ${tex`x`} (contributes ujemnie)

**Pionowe przerywane linie** zaznaczają granice całkowania ${tex`a`} i ${tex`b`}. **Kropki** pokazują gdzie dokładnie ewaluowana jest funkcja (dla metody lewego/prawego/środkowego końca).

Przy metodzie trapezów zamiast prostokątów widzisz odcinki łączące kolejne wartości funkcji — pole pod nimi to suma pól trapezów.

## Cztery metody

Dla N podziałów każdy podprzedział ma długość ${tex`\Delta x = \frac{b-a}{N}`}. Metody różnią się wyborem punktu ewaluacji na ${tex`[x_i, x_{i+1}]`}:

| Metoda | Punkt ewaluacji | Błąd |
|---|---|---|
| Lewy koniec | ${tex`x_i`} | ${tex`O(\Delta x)`} |
| Prawy koniec | ${tex`x_{i+1}`} | ${tex`O(\Delta x)`} |
| Środkowy | ${tex`\frac{x_i+x_{i+1}}{2}`} | ${tex`O(\Delta x^2)`} |
| Trapezów | średnia: ${tex`\frac{f(x_i)+f(x_{i+1})}{2}`} | ${tex`O(\Delta x^2)`} |

Metody środkowa i trapezów są dokładniejsze — dlatego błąd spada szybciej wraz ze wzrostem ${tex`N`}.

## Wzór

Suma Riemannowska (dla metody lewego końca):

```tex
S_N = \sum_{i=0}^{N-1} f(x_i)\,\Delta x, \qquad x_i = a + i\,\Delta x.
```

Całka oznaczona to granica tej sumy:

```tex
\int_a^b f(x)\,\mathrm{d}x = \lim_{N\to\infty} S_N.
```

## Przypadki warte uwagi

- **${tex`x^2`} na ${tex`[0,1]`}.** Wynik analityczny: ${tex`\frac{1}{3}`}. Sprawdź jak szybko suma zbiega dla różnych metod.
- **${tex`\sin(x)`} na ${tex`[0,\pi]`}.** Wynik: 2. Symetria funkcji — metoda środkowa jest bardzo dokładna.
- **${tex`x^2 - x`} na ${tex`[-1, 2]`}.** Funkcja zmienia znak — uważaj na pole ze znakiem (dodatkowe wyjaśnienie przy presecie).
- **${tex`1/x`} na ${tex`[1, e]`}.** Wynik: 1. To definicja logarytmu naturalnego: ${tex`\ln(e) - \ln(1) = 1`}.
