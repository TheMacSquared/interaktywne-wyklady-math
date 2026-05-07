---
title: Pochodna jako granica
---

# Pochodna jako granica ilorazu różnicowego

Pochodna funkcji ${tex`f`} w punkcie ${tex`x_0`} to tempo zmiany funkcji w tym miejscu. Formalnie definiujemy ją jako granicę **ilorazu różnicowego**:

```tex
f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}
```

Geometrycznie — to nachylenie **stycznej** do wykresu funkcji w punkcie ${tex`x_0`}. Przesuń ${tex`h`} ku zeru i obserwuj, jak sieczna (niebieska) obraca się w styczną (pomarańczowa).

```js
import {derivativePlot, slopeInfo, symbolicDeriv} from "../components/derivative-plot.js";
```

```js
const exprView = Inputs.text({
  label: "Funkcja f(x)",
  value: "x^2",
  placeholder: "np. sin(x), exp(x), x^3 - x"
});
const expr = Generators.input(exprView);
```

```js
const x0View = Inputs.range([-4, 4], {value: 1, step: 0.1, label: "x₀ (punkt)"});
const x0 = Generators.input(x0View);
```

```js
const hView = Inputs.range([-3, 3], {value: 1, step: 0.05, label: "h (krok)"});
const h = Generators.input(hView);
```

```js
const presetView = Inputs.select(
  ["własna", "x² w x₀=1", "sin(x) w x₀=0", "exp(x) w x₀=0", "√x w x₀=1", "x³−x w x₀=0.5"],
  {label: "Przykład"}
);
const preset = Generators.input(presetView);
```

```js
{
  const presets = {
    "x² w x₀=1":       {expr: "x^2",    x0: 1,   h: 1},
    "sin(x) w x₀=0":   {expr: "sin(x)", x0: 0,   h: 1},
    "exp(x) w x₀=0":   {expr: "exp(x)", x0: 0,   h: 0.5},
    "√x w x₀=1":       {expr: "sqrt(x)",x0: 1,   h: 0.8},
    "x³−x w x₀=0.5":   {expr: "x^3 - x",x0: 0.5, h: 0.8}
  };
  if (preset !== "własna" && presets[preset]) {
    const p = presets[preset];
    exprView.value = p.expr; exprView.dispatchEvent(new Event("input", {bubbles:true}));
    x0View.value = p.x0;    x0View.dispatchEvent(new Event("input", {bubbles:true}));
    hView.value = p.h;      hView.dispatchEvent(new Event("input", {bubbles:true}));
  }
}
```

<div class="grid grid-cols-2">
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Sterowanie</h3>
    <div style="margin-bottom:.6rem;">${exprView}</div>
    <div style="margin-bottom:.5rem;">${x0View}</div>
    <div style="margin-bottom:.5rem;">${hView}</div>
    <div style="margin-top:.6rem;">${presetView}</div>
    <div style="margin-top:1rem;">${display(slopeDisplay(expr, x0, h))}</div>
  </div>
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Sieczna → Styczna</h3>
    ${display(resize((width) => derivativePlot(expr, x0, h, {width})))}
  </div>
</div>

```js
function slopeDisplay(expr, x0, h) {
  const info = slopeInfo(expr, x0, h);
  const fmt = v => isNaN(v) ? "—" : parseFloat(v.toFixed(5)).toString();
  const symD = symbolicDeriv(expr);
  const diffRatio = Math.abs(info.secant - info.tangent);
  return html`<div>
    ${tex.block`\frac{f(x_0+h)-f(x_0)}{h} \approx ${fmt(info.secant)}`}
    <p style="color:#475569; font-size:.875rem; margin:.4rem 0 0;">
      Nachylenie stycznej: <strong>${fmt(info.tangent)}</strong><br>
      Błąd: <strong>${fmt(diffRatio)}</strong>
      ${diffRatio < 0.01 ? " ✓" : ""}
    </p>
    ${symD ? html`<p style="color:#475569; font-size:.875rem; margin:.3rem 0 0;">
      Pochodna symboliczna: <strong>${symD}</strong>
    </p>` : ""}
  </div>`;
}
```

## Jak to czytać

**Niebieska linia** to sieczna — prosta przechodząca przez ${tex`(x_0,\,f(x_0))`} i ${tex`(x_0+h,\,f(x_0+h))`}. Jej nachylenie to właśnie iloraz różnicowy.

**Pomarańczowa przerywana** to styczna — granica siecznej gdy ${tex`h \to 0`}. Jej nachylenie to pochodna ${tex`f'(x_0)`}.

**Ramiona** (szare przerywane segmenty) przy siecznej zaznaczają ${tex`\Delta x = h`} i ${tex`\Delta y = f(x_0+h) - f(x_0)`} — licznik i mianownik ilorazu.

Zmniejsz ${tex`|h|`} do zera — sieczna obraca się i pokrywa ze styczną.

## Definicja

Iloraz różnicowy:

```tex
\frac{f(x_0+h)-f(x_0)}{h}
```

jest nachyleniem siecznej. Pochodna to jego granica:

```tex
f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}
```

Jeśli granica istnieje, mówimy że ${tex`f`} jest **różniczkowalna** w ${tex`x_0`}.

## Interpretacja geometryczna

Nachylenie siecznej przez ${tex`(x_0, f(x_0))`} i ${tex`(x_0+h, f(x_0+h))`} to:

```tex
\tan\alpha = \frac{f(x_0+h) - f(x_0)}{h}
```

Gdy ${tex`h \to 0`}, punkt ${tex`(x_0+h, f(x_0+h))`} przesuwa się po wykresie ku ${tex`(x_0, f(x_0))`} — sieczna dąży do stycznej. Kąt ${tex`\alpha`} dąży do kąta nachylenia stycznej.

## Przykłady warte uwagi

- **${tex`x^2`} w ${tex`x_0=1`}.** Pochodna to ${tex`2x`}, więc ${tex`f'(1) = 2`}. Sprawdź jak szybko sieczna zbiega do nachylenia 2.
- **${tex`\sin(x)`} w ${tex`x_0=0`}.** Pochodna to ${tex`\cos(x)`}, wartość w 0 to 1. Styczna to prosta ${tex`y = x`}.
- **${tex`\sqrt{x}`} w ${tex`x_0=1`}.** Pochodna ${tex`\frac{1}{2\sqrt{x}}`} = 0.5 — styczna nachylona pod 26.6°.
- **${tex`x^3 - x`} w ${tex`x_0=\pm 1/\sqrt{3}`}.** To lokalne ekstrema — styczna pozioma, pochodna = 0.
