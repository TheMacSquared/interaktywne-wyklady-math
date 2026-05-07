---
title: Wyznacznik macierzy
---

# Wyznacznik macierzy

Wyznacznik macierzy ${tex`A`} to jedna liczba, która mówi dwie rzeczy naraz: **ile razy** transformacja opisana przez ${tex`A`} zmienia pole figur i **czy odwraca orientację** (czy "obraca płaszczyznę na drugą stronę"). Geometrycznie: to pole orientowanego równoległoboku rozpiętego przez kolumny macierzy.

Pobaw się wpisami — patrz jak zmienia się równoległobok i jego pole.

```js
import {matrixInput, examples, matrixInput3, examples3} from "../components/matrix-input.js";
import {detPlot, sarrusDisplay} from "../components/det-plot.js";
```

```js
const matrixView = matrixInput({label: "Macierz A (2×2)", initial: examples.identity});
const A = Generators.input(matrixView);
```

```js
const presetView = Inputs.select(
  ["własny wybór", "tożsamość", "skalowanie 2×, 0.5×", "ścinanie", "obrót 30°", "odbicie", "symetryczna", "wadliwa"],
  {label: "Przykład"}
);
const preset = Generators.input(presetView);
```

```js
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
    const fields = matrixView.querySelectorAll('input[type="number"]');
    if (fields.length === 4) {
      fields[0].value = M[0][0]; fields[1].value = M[0][1];
      fields[2].value = M[1][0]; fields[3].value = M[1][1];
      fields.forEach(f => f.dispatchEvent(new Event("input", {bubbles: true})));
    }
  }
}
```

<div class="grid grid-cols-2">
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Sterowanie</h3>
    ${matrixView}
    <div style="margin-top:.6rem;">${presetView}</div>
  </div>
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Równoległobok kolumn</h3>
    ${display(resize((width) => detPlot(A, {width})))}
  </div>
</div>

## Jak to czytać

**Ciemna strzałka** to pierwsza kolumna macierzy ${tex`A`} — wektor ${tex`\mathbf{v}_1 = [a_{11}, a_{21}]^\top`}. **Szara strzałka** to druga kolumna — wektor ${tex`\mathbf{v}_2 = [a_{12}, a_{22}]^\top`}. Kontur pokazuje równoległobok przez nie rozpięty.

Kolor mówi o znaku wyznacznika:
- **Zielony** (det > 0): transformacja zachowuje orientację — "prawa" strona zostaje "prawą".
- **Czerwony** (det < 0): transformacja odwraca orientację — jak w lustrze.
- **Szary** (det = 0): równoległobok zwija się do odcinka lub punktu — macierz osobliwa.

## Przypadki warte uwagi

- **Tożsamość.** Kolumny to wektory jednostkowe osi. Równoległobok = kwadrat jednostkowy, pole = 1.
- **Skalowanie 2×, 0.5×.** ${tex`\det = 2 \cdot 0{,}5 = 1`} — skalowanie wzdłuż osi znosi się, pole zachowane.
- **Ścinanie** ${tex`\bigl[\begin{smallmatrix}1&1\\0&1\end{smallmatrix}\bigr]`}. Pole = 1 — ścinanie zachowuje pole! Równoległobok pochyla się, ale jego wysokość × podstawa zostaje stała.
- **Obrót 30°.** ${tex`\det = \cos^2\theta + \sin^2\theta = 1`} — obrót zawsze zachowuje pole i orientację.
- **Odbicie** ${tex`\bigl[\begin{smallmatrix}1&0\\0&-1\end{smallmatrix}\bigr]`}. ${tex`\det = -1`} — pole zachowane, ale orientacja odwrócona.
- **Wadliwa** ${tex`\bigl[\begin{smallmatrix}2&1\\0&2\end{smallmatrix}\bigr]`}. ${tex`\det = 4`} — oba własne wektory w tym samym kierunku, ale det ≠ 0. Transformacja niediagonalizowalna, ale odwracalna.

## Wzór i związek z wartościami własnymi

Dla macierzy ${tex`A = \begin{bmatrix} a & b \\ c & d \end{bmatrix}`} wzór jest prosty:

```tex
\det(A) = ad - bc.
```

Związek z wartościami własnymi (z poprzedniego rozdziału): wartości własne ${tex`\lambda_1, \lambda_2`} spełniają

```tex
\det(A) = \lambda_1 \cdot \lambda_2, \qquad \operatorname{tr}(A) = \lambda_1 + \lambda_2.
```

Macierz jest osobliwa (nieodwracalna) dokładnie wtedy, gdy ${tex`\det(A) = 0`} — czyli gdy co najmniej jedna wartość własna wynosi 0.

---

## Wyznacznik macierzy 3×3 — reguła Sarrusa

Dla macierzy 3×3 wzór rozszerza się do sześciu iloczynów: trzy "po przekątnych w prawo" (↘, dodajemy) i trzy "po przekątnych w lewo" (↗, odejmujemy):

```tex
\det(A) = a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32}
        - a_{13}a_{22}a_{31} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33}.
```

```js
const m3View = matrixInput3({label: "Macierz A (3×3)", initial: examples3.identity3});
const A3 = Generators.input(m3View);
```

```js
const preset3View = Inputs.select(
  ["własny wybór", "tożsamość", "diagonalna (det < 0)", "skalowanie", "górnotrójkątna", "osobliwa (1,2,3...)", "ogólna"],
  {label: "Przykład"}
);
const preset3 = Generators.input(preset3View);
```

```js
{
  const map = {
    "tożsamość":            examples3.identity3,
    "diagonalna (det < 0)": examples3.diagonal,
    "skalowanie":           examples3.scaling3,
    "górnotrójkątna":       examples3.upper,
    "osobliwa (1,2,3...)":  examples3.singular,
    "ogólna":               examples3.general
  };
  if (preset3 !== "własny wybór" && map[preset3]) {
    const M = map[preset3];
    const names = ["a11","a12","a13","a21","a22","a23","a31","a32","a33"];
    const vals  = M.flat();
    names.forEach((name, i) => {
      const el = m3View.querySelector(`input[name="${name}"]`);
      el.value = vals[i];
      el.dispatchEvent(new Event("input", {bubbles: true}));
    });
  }
}
```

<div class="grid grid-cols-2">
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Sterowanie</h3>
    ${m3View}
    <div style="margin-top:.6rem;">${preset3View}</div>
  </div>
  <div class="card" style="min-width:0; overflow:hidden;">
    <h3>Reguła Sarrusa</h3>
    ${display(sarrusDisplay(A3))}
  </div>
</div>

**Wskazówka:** dla macierzy trójkątnej (górno- lub dolnotrójkątnej) wyznacznik to po prostu iloczyn elementów na przekątnej. Sprawdź preset "górnotrójkątna": det = 2·4·5 = 40.
