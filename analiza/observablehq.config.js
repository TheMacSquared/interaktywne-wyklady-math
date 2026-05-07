export default {
  title: "Analiza matematyczna",
  theme: "light",

  pages: [
    {
      name: "Część I — Całkowanie",
      pages: [
        {name: "Całka Riemannowska", path: "/01-calka-riemanna/01-calka"}
      ]
    },
    {
      name: "Część II — Różniczkowanie",
      pages: [
        {name: "Pochodna jako granica", path: "/02-pochodna/01-pochodna"}
      ]
    },
    {
      name: "Część III — Aproksymacja",
      pages: [
        {name: "Szeregi Taylora", path: "/03-szeregi-taylora/01-taylor"}
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
