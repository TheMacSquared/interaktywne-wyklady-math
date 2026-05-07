// See https://observablehq.com/framework/config for documentation.
export default {
  title: "Algebra liniowa",
  theme: "light",

  pages: [
    {
      name: "Część II — Przekształcenia liniowe",
      pages: [
        {name: "Wartości i wektory własne (2×2)", path: "/02-przeksztalcenia-liniowe/01-wartosci-wlasne"},
        {name: "Wyznacznik macierzy",               path: "/02-przeksztalcenia-liniowe/02-wyznacznik"},
        {name: "Układy równań liniowych",          path: "/02-przeksztalcenia-liniowe/03-uklady-rownan"},
        {name: "Układy równań — 1D/2D/3D",         path: "/02-przeksztalcenia-liniowe/04-uklady-ogolne"}
      ]
    }
  ],

  head: `
    <html lang="pl">
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
  `,

  root: "src",

  footer: "Interaktywny wykład — prototyp.",
  pager: false,
  toc: true
};
