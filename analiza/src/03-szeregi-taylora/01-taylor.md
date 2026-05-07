---
title: Szeregi Taylora
---

# Szereg Taylora — aproksymacja funkcji wielomianem

Każdą funkcję różniczkowalną wielokrotnie możemy przybliżyć wielomianem, który w danym punkcie ${tex`x_0`} ma takie same wartości wszystkich pochodnych co oryginalna funkcja. To właśnie **wielomian Taylora** stopnia ${tex`n`}:

```tex
P_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(x_0)}{k!}(x - x_0)^k
```

Przesuń ${tex`x_0`}, zwiększaj stopień ${tex`n`} — obserwuj jak wielomian coraz lepiej przybliża funkcję w otoczeniu punktu rozwinięcia.

```js
import {taylorPlot, taylorCoeffs, taylorTermsDisplay} from "../components/taylor-plot.js";
```

```js
const exprView = Inputs.text({
  label: "Funkcja f(x)",
  value: "sin(x)",
  placeholder: "np. exp(x), cos(x), ln(1+x), 1/(1-x)"
});
const expr = Generators.input(exprView);
```

```js
const x0View = Inputs.range([-3, 3], {value: 0, step: 0.1, label: "x₀ (punkt rozwinięcia)"});
const x0 = Generators.input(x0View);
```

```js
const nView = Inputs.range([0, 12], {value: 3, step: 1, label: "n (stopień wielomianu)"});
const n = Generators.input(nView);
```

```js
const presetView = Inputs.select(
  ["własna", "sin(x) w x₀=0", "cos(x) w x₀=0", "exp(x) w x₀=0", "ln(1+x) w x₀=0", "1/(1-x) w x₀=0", "sin(x) w x₀=π/2"],
  {label: "Przykład"}
);
const preset = Generators.input(presetView);
```

```js
{
  const presets = {
    "sin(x) w x₀=0":    {expr: "sin(x)",   x0: 0,              n: 5},
    "cos(x) w x₀=0":    {expr: "cos(x)",   x0: 0,              n: 6},
    "exp(x) w x₀=0":    {expr: "exp(x)",   x0: 0,              n: 4},
    "ln(1+x) w x₀=0":   {expr: "log(1+x)", x0: 0,              n: 5},
    "1/(1-x) w x₀=0":   {expr: "1/(1-x)",  x0: 0,              n: 5},
    "sin(x) w x₀=π/2":  {expr: "sin(x)",   x0: Math.PI / 2,    n: 4}
  };
  if (preset !== "własna" && presets[preset]) {
    const p = presets[preset];
    exprView.value = p.expr; exprView.dispatchEvent(new Event("input", {bubbles:true}));
    x0View.value = p.x0;    x0View.dispatchEvent(new Event("input", {bubbles:true}));
    nView.value = p.n;      nView.dispatchEvent(new Event("input", {bubbles:true}));
  }
}
```

<div class="grid grid-cols-2">
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Sterowanie</h3>
    <div style="margin-bottom:.6rem;">${exprView}</div>
    <div style="margin-bottom:.5rem;">${x0View}</div>
    <div style="margin-bottom:.5rem;">${nView}</div>
    <div style="margin-top:.6rem;">${presetView}</div>
    <div style="margin-top:1rem;">${display(termsDisplay(expr, x0, n))}</div>
  </div>
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Wielomian Taylora</h3>
    ${display(resize((width) => taylorPlot(expr, x0, n, {width})))}
  </div>
</div>

```js
function termsDisplay(expr, x0, n) {
  const terms = taylorTermsDisplay(expr, x0, n);
  const parts = terms.map(({k, coeff, display}) => {
    if (Math.abs(coeff) < 1e-10) return null;
    const sign = coeff >= 0 ? "+" : "";
    if (k === 0) return `${display}`;
    if (k === 1) return `${sign}${display}(x${x0 !== 0 ? (x0 > 0 ? `−${x0}` : `+${Math.abs(x0)}`) : ""})`;
    const xpart = x0 !== 0
      ? `(x${x0 > 0 ? `−${x0}` : `+${Math.abs(x0)}`})^{${k}}`
      : `x^{${k}}`;
    return `${sign}${display}${xpart}`;
  }).filter(Boolean);

  const polyStr = parts.length ? parts.join("") : "0";
  return html`<div>
    ${tex.block`P_{${n}}(x) = ${polyStr}`}
    <p style="color:#475569; font-size:.875rem; margin:.3rem 0 0;">
      Liczba wyrazów: <strong>${terms.filter(t => Math.abs(t.coeff) > 1e-10).length}</strong>
    </p>
  </div>`;
}
```

## Jak to czytać

**Czarna linia** to oryginalna funkcja ${tex`f(x)`}. **Fioletowa linia** to wielomian Taylora ${tex`P_n(x)`}. **Żółta kropka** zaznacza punkt rozwinięcia ${tex`x_0`} — tu wielomian zgadza się z funkcją dokładnie.

Wielomian jest dobry w okolicach ${tex`x_0`} i odstaje dalej — szerokość strefy dobrej aproksymacji zależy od funkcji i stopnia ${tex`n`}. Dla funkcji analitycznych (${tex`\sin, \cos, e^x`}) wielomian zbiega do funkcji na całej osi gdy ${tex`n \to \infty`}.

## Wzór

Współczynniki wyznaczamy z warunku ${tex`P_n^{(k)}(x_0) = f^{(k)}(x_0)`}:

```tex
c_k = \frac{f^{(k)}(x_0)}{k!}
```

Wielomian Taylora stopnia ${tex`n`} wokół ${tex`x_0`}:

```tex
P_n(x) = f(x_0) + f'(x_0)(x-x_0) + \frac{f''(x_0)}{2!}(x-x_0)^2 + \cdots + \frac{f^{(n)}(x_0)}{n!}(x-x_0)^n
```

Gdy ${tex`x_0 = 0`} mówimy o **szeregu Maclaurina**.

## Klasyczne przykłady (Maclaurin)

| Funkcja | Szereg | Zbieżność |
|---|---|---|
| ${tex`e^x`} | ${tex`1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots`} | cała oś |
| ${tex`\sin x`} | ${tex`x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots`} | cała oś |
| ${tex`\cos x`} | ${tex`1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots`} | cała oś |
| ${tex`\ln(1+x)`} | ${tex`x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots`} | ${tex`(-1, 1]`} |
| ${tex`\frac{1}{1-x}`} | ${tex`1 + x + x^2 + x^3 + \cdots`} | ${tex`(-1, 1)`} |

## Przypadki warte uwagi

- **${tex`\sin(x)`} wokół ${tex`x_0=0`}.** Nieparzyste potęgi — wyrazy parzyste zerują się. Dla ${tex`n=5`} aproksymacja dobra na ${tex`[-\pi, \pi]`}.
- **${tex`\exp(x)`} wokół ${tex`x_0=0`}.** Współczynniki ${tex`1/k!`} szybko maleją — dlatego zbieżność na całej osi.
- **${tex`\ln(1+x)`} wokół ${tex`x_0=0`}.** Promień zbieżności = 1. Sprawdź jak wielomian "ucieka" dla ${tex`|x| > 1`}.
- **${tex`1/(1-x)`} wokół ${tex`x_0=0`}.** Wszystkie współczynniki równe 1 — klasyczny szereg geometryczny. Rozbieżność przy ${tex`x = \pm 1`} widoczna gołym okiem.
