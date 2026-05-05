# TODO — następne kroki

## Po przesiadce na drugi komputer

```bash
git clone https://github.com/TheMacSquared/interaktywne-wyklady-math.git
cd interaktywne-wyklady-math/algebra-liniowa
npm install
npm run dev
```

Otwórz http://127.0.0.1:3000/ — powinieneś zobaczyć spis treści; rozdział pod
http://127.0.0.1:3000/02-przeksztalcenia-liniowe/01-wartosci-wlasne.

## Test prototypu (priorytet 1)

- [ ] Przejść przez rozdział sam, jak student
- [ ] Sprawdzić wszystkie presety (tożsamość, skalowanie, ścinanie, obrót 30°, odbicie, symetryczna, wadliwa)
- [ ] Sprawdzić edge case: obrót → wartości zespolone → łuk obrotu zamiast wektorów
- [ ] Sprawdzić animację (przycisk "Uruchom animację")
- [ ] Pokazać studentowi / koledze z katedry, zebrać reakcję
- [ ] Zdecydować: stack OK → rozbudowa, czy coś trzeba poprawić

## Drobne rzeczy do rozważenia (po teście)

Te punkty NIE są zobowiązaniem — tylko notatki z rzeczy które nasunęły się przy budowie:

- W `eigen-plot.js` w `eigenPlot` używamy `vector` z `math.eigs` bez sprawdzania normalizacji — działa, ale gdy macierz wadliwa to oba wektory własne są liniowo zależne i rysunek pokazuje jeden. Czy dodawać komunikat "macierz wadliwa, jeden kierunek własny"?
- Suwaki macierzy mają zakres [-3, 3] krok 0.1 — czy to ergonomicznie wystarcza, czy chcemy edytowalne pola tekstowe (większy zakres)?
- Łuk obrotu dla zespolonych λ rysuje kąt arg(λ), ale nie pokazuje skalowania |λ| (gdy macierz to obrót *plus* skalowanie). Czy dodawać?

## Gdy zdecydujemy się iść dalej

Patrz `plan.md` — lista możliwych następnych rozdziałów. Każdy zaczynamy od rozmowy: "robimy ten? jaki ma być scenariusz interakcji?", potem plan, potem implementacja.

## Co NIE jest TODO (świadomie)

- README projektu — user explicit powiedział "nie piszemy README ani dokumentacji, później jeśli prototyp przejdzie"
- Deploy — tylko dev server lokalnie do czasu decyzji
- Testy / CI — prototyp, niepotrzebne
- Drugi rozdział, drugi wykład — wymaga rozmowy
