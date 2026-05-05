// See https://observablehq.com/framework/config for documentation.
export default {
  title: "Algebra liniowa",

  pages: [
    {
      name: "Część II — Przekształcenia liniowe",
      pages: [
        {name: "Wartości i wektory własne (2×2)", path: "/02-przeksztalcenia-liniowe/01-wartosci-wlasne"}
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
