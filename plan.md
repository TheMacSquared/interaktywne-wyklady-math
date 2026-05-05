# Plan dalszej pracy

## Status

Prototyp **jednego rozdziału** algebry liniowej (wartości i wektory własne 2×2) jest gotowy i działa lokalnie. Walidujemy: czy stack (Observable Framework + mathjs + Plot) jest komfortowy w pisaniu i czytelny dla studenta. Decyzja o rozbudowie zapada **dopiero po przetestowaniu prototypu na żywo** — najlepiej z prawdziwym studentem albo na zajęciach.

## Następny krok decyzyjny (po teście prototypu)

Jeśli stack przejdzie test:
- rozszerzyć algebrę liniową o kolejne rozdziały
- równolegle (lub później) postawić siostrzany projekt `analiza/` w tym samym repo

Jeśli stack zawiedzie w jakimś konkretnym aspekcie:
- diagnoza co konkretnie nie działa, opcje, decyzja usera. **Nie porzucamy stacku** bez rozmowy.

## Otwarte pytania architektoniczne (do rozmowy gdy będzie potrzeba)

- Czy reużywalne komponenty (`matrix-input`, `eigen-plot`) zostają per-projekt, czy wyciągamy je do współdzielonej paczki gdy `analiza/` dojdzie? Dziś per-projekt — przedwczesna abstrakcja niepotrzebna.
- Czy deploy (gdy przyjdzie czas): GitHub Pages, Observable Cloud, czy własny serwer uczelni? Dziś tylko dev local.
- Czy potrzebujemy ewaluacji studenta (quizy, zadania z odpowiedziami)? Framework ma reaktywność — dałoby się, ale to inny rozdział designu.

## Możliwe kolejne rozdziały algebry liniowej (lista, nie zobowiązanie)

Numerowanie wg sylabusa, pasuje do struktury katalogów `0X-...`:

**Część I — Przestrzenie liniowe** (`01-przestrzenie-liniowe/`)
- wektory w R², R³ — operacje, długość, kąt
- liniowa niezależność, baza, wymiar
- iloczyn skalarny, ortogonalność, ortonormalizacja Grama-Schmidta

**Część II — Przekształcenia liniowe** (`02-przeksztalcenia-liniowe/`)
- ✅ wartości i wektory własne 2×2 — **gotowe**
- macierz przekształcenia w bazach (zmiana bazy)
- diagonalizacja: A = PDP⁻¹
- rzut ortogonalny, odbicie, obrót — jako konkretne macierze

**Część III — Formy kwadratowe** (`03-formy-kwadratowe/`)
- macierz formy, definitność (warunki Sylvestera)
- redukcja do postaci kanonicznej (przez wartości własne)
- elipsy/hiperbole/paraboliki jako poziomice formy

To tylko szkic — nie planuj implementacji bez akceptacji usera.

## Możliwe kolejne wykłady (siostrzane projekty)

`analiza/` — wykład z analizy matematycznej. Te same konwencje, ten sam stack, osobny katalog na poziomie głównym repo.

## Zasada na decyzje

Cokolwiek z powyższego — **najpierw rozmowa z userem**, potem plan, potem implementacja. Nie startuj implementacji "kolejnego rozdziału" tylko dlatego, że jest na liście.
