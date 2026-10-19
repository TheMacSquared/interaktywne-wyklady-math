# CLAUDE.md — interaktywne wykłady (matematyka)

Ten plik daje świeżej sesji Claude kontekst potrzebny do dalszej pracy. Jeśli zaczynasz pracę z tym repo: przeczytaj ten plik, potem `plan.md` i `todo.md`.

## Czym to jest

Repozytorium interaktywnych wykładów matematycznych dla studentów kierunków niematematycznych. Każdy podkatalog na poziomie głównym to osobny wykład = osobny projekt Observable Framework. Aktualnie zawiera tylko prototyp wykładu z algebry liniowej; wykład z analizy matematycznej dojdzie później jako siostrzany projekt.

Stan: prototyp jednego rozdziału. Walidujemy stack zanim rozbudujemy.

## Kim jest user

Maciek Karczewski. Wykładowca, prowadzi zajęcia z algebry liniowej i analizy matematycznej na kierunkach niematematycznych. Ma równolegle ekosystem interaktywnych wykładów ze statystyki w R Shiny (`/home/maciek/praca/dydaktyka/narzedzia/interaktywne-wyklady`) — ale tamto repo to inny stack i nie miesza się z tym.

Email git: `maciej.karczewski@upwr.edu.pl`. GitHub: TheMacSquared.

## Stack technologiczny (wybrany świadomie, nie do zmiany bez rozmowy)

- **Observable Framework 1.13.x** — generator statycznych stron z reaktywnymi komórkami JS w Markdown
- **mathjs** — symbolika i algebra liniowa (`math.eigs`, complex numbers itd.)
- **@observablehq/plot** — deklaratywne wykresy (D3 pod spodem); używaj zamiast pisania D3 ręcznie
- **KaTeX** — wbudowany w Framework przez `tex\`...\`` i `tex.block\`...\``
- **htl** — `html\`...\`` do JSX-podobnych szablonów

**Nie ma i nie ma być (na tym etapie):** Pyodide, SymPy, Pythona w żadnej formie. Dokładamy je tylko jeśli konkretny rozdział uderzy w sufit mathjs (np. całkowanie symboliczne dowolnej funkcji wpisanej przez studenta).

## Struktura repo

```
interaktywne-wyklady-math/
├── CLAUDE.md           ← ten plik
├── plan.md             ← co dalej
├── todo.md             ← następne kroki na drugim komputerze
├── .gitignore
└── algebra-liniowa/    ← projekt 1 (Observable Framework)
    ├── package.json
    ├── observablehq.config.js
    ├── src/
    │   ├── index.md                              # spis treści wykładu
    │   ├── 02-przeksztalcenia-liniowe/           # sekcja "Część II"
    │   │   └── 01-wartosci-wlasne.md             # rozdział-prototyp
    │   └── components/
    │       ├── matrix-input.js                   # widget macierzy 2×2 + presets
    │       └── eigen-plot.js                     # transformPlot, eigenPlot, computeEigen
    └── README.md
```

Numerowanie sekcji zaczyna się od `02-` celowo — `01-przestrzenie-liniowe/` zostawione na przyszłość, żeby kolejność w sidebarze pasowała do sylabusa. Nie zmieniaj tego bez rozmowy.

## Konwencje (przeniesione z świata Shiny usera)

- **UI po polsku, kod po angielsku**, komentarze po polsku LUB angielsku konsekwentnie w pliku
- **Polskie znaki UTF-8 bezpośrednio** (`ą ę ó ł ż ź ć ń`, `≥ — × μ σ`), nie escape `\uXXXX`
- **Bold oszczędnie** — tylko etykiety z dwukropkiem (`**Wskazówka:**`), markery list, krótkie werdykty. Nigdy dla emfazy w środku zdania
- **Konkret w wyjaśnieniach** — "macierz obraca przestrzeń o 30°" zamiast "transformacja ma określoną geometrię". Brzmi jak konspekt do wykładu, nie podręcznik akademicki
- **Nie wymyślaj koła** — Observable Inputs / Plot / mathjs mają gotowe; pisz custom D3 tylko tam gdzie nic nie pasuje
- **Komponenty reużywalne** w `src/components/` (matrix-input pasuje też do rozdziałów o transformacjach, wyznaczniku, normach)

## Reguły współpracy z userem (KRYTYCZNE)

User ma globalny CLAUDE.md który mówi wprost:

> Jesteś **wykonawcą kodu**. Nie podejmuj decyzji metodologicznych ani architektonicznych samodzielnie — przy rozwidleniach pokazuj opcje (A/B/C z plusami/minusami) i czekaj na wybór. Nie interpretuj wyników bez prośby. Nie sugeruj "co dalej" bez pytania. Gdy coś nie działa: zdiagnozuj → zaproponuj opcje → poczekaj. **Nie porzucaj** pakietu/podejścia na rzecz "prostszego" bez zgody usera.

Stosuj to dosłownie. To nie jest preferencja stylistyczna — to twarde wymaganie współpracy.

Konkretnie w tym projekcie spotkaliśmy już:
- Wybór struktury katalogów (Opcja A/B/C z trade-offami) → user wybrał C
- Wybór struktury repo (parent vs algebra-liniowa) → user wybrał A
- Kiedy layout grid rozjechał się wizualnie → diagnoza + Opcje A/B → user wybrał A (układ pionowy)

## Jak to uruchomić

```bash
cd algebra-liniowa
npm install                 # raz, po klonie
npm run dev                 # http://127.0.0.1:3000/
```

Strona rozdziału: http://127.0.0.1:3000/02-przeksztalcenia-liniowe/01-wartosci-wlasne

## Co już działa (prototyp rozdziału "Wartości własne 2×2")

Cztery suwaki dla wpisów macierzy + suwak `t` interpolujący od `I` do `A` + przycisk animacji + dropdown z presetami (tożsamość, skalowanie, ścinanie, obrót 30°, odbicie, symetryczna, wadliwa). Cztery panele (jeden pod drugim, nie grid — grid rozlewał `Plot` poza kartę): sterowanie → transformacja siatki + okrąg→elipsa → wektory własne (kolor zależy od λ) → liczby (A, tr, det, λ₁, λ₂ w KaTeX). Obsługa zespolonych wartości własnych: zamiast wektorów rysujemy łuk obrotu z kątem.

## Co świadomie odrzucone w prototypie

- Layout dwukolumnowy (`<div class="grid grid-cols-2">`) — `Plot` z `aspectRatio: 1` rozlewał się poza kartę i pokrywał całą stronę. Wybraliśmy układ pionowy. Jeśli wracasz do dwukolumnowego — najpierw zdiagnozuj `aspectRatio` i `overflow` na `.card`, nie idź na ślepo
- Drugi rozdział, deploy, README, testy — nic z tego, dopóki user nie powie

## Plik planu

`/home/maciek/.claude/plans/prototyp-interaktywnego-wyk-adu-lucky-honey.md` zawiera oryginalny plan (z promptem startowym) — referencja historyczna.
