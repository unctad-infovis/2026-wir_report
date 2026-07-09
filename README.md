# 2026-wir_report

**Live demo** https://unctad-infovis.github.io/2026-wir_report/

## About

The World Investment Report 2026 is an annual UNCTAD flagship publication tracking global foreign direct investment (FDI) trends and policy developments. This project is the interactive web publication page for the 2026 edition, presenting the report's key findings through a scrollytelling minisite with narrative text, data visualisations, and chapter navigation.

The page features an FDI Explorer — an interactive chart allowing users to explore inflow and outflow data by region and economy from 1990 to 2025 — alongside a strategic investment focus section with scroll-driven animated charts. Content is authored in MDX and rendered as a standalone React application embeddable within UNCTAD's Drupal platform.

## Embedding

### Full publication page

```html
<script type="module" crossorigin="" src="https://storage.unctad.org/2026-wir_report/js/2026-wir_report.min.js"></script>
<link rel="modulepreload" crossorigin="" href="https://storage.unctad.org/2026-wir_report/js/2026-wir_report.styles.js">
<link rel="stylesheet" crossorigin="" href="https://storage.unctad.org/2026-wir_report/css/2026-wir_report_fdi_explorer.min.css">
<link rel="stylesheet" crossorigin="" href="https://storage.unctad.org/2026-wir_report/css/2026-wir_report.min.css">
<div class="app-root-2026-wir_report" id="app-root-2026-wir_report">
  Loading...
</div>
```

### Standalone FDI Explorer

```html
<div class="my-5">
  <script type="module" crossorigin="" src="https://storage.unctad.org/2026-wir_report/js/2026-wir_report.fdi-explorer.min.js"></script>
  <link rel="stylesheet" crossorigin="" href="https://storage.unctad.org/2026-wir_report/css/2026-wir_report_fdi_explorer.min.css">
  <div class="app-root-2026-wir_report" id="app-root-2026-wir_report">
    Loading...
  </div>
  <noscript>Your browser does not support Javascript!</noscript>
</div>
```

Update the `?v=` query parameter to match the current build version to bust the cache.

## Rights of usage

Contact Teemo Tebest.

## How to build and develop

This is a Vite + React project.

* `npm run install`
* `npm run start`

Project should start at: http://localhost:8080

For developing please refer to `package.json`

## Files and folders

All public assets go to folder `public`.

All source code goes to folder `src`.

### Data files

`public/assets/data/2026-fdi_explorer.json` powers the FDI Explorer chart. It is created manually from Excel files provided by Astrit Sulstarova (<astrit.sulstarova@unctad.org>) and must be updated each year when new data becomes available.

#### Structure

The file is a JSON object with two top-level keys — `fdi_inflows` and `fdi_outflows` — each containing an array of region/economy entries in a specific order.

```json
{
  "fdi_inflows": [ ],
  "fdi_outflows": [ ]
}
```

Each entry in the array has the following fields:

| Field | Type | Description |
|---|---|---|
| `Region/economy` | string | Name of the region or economy |
| `type` | string | Either `"region"` or `"country"` |
| `level` | integer | Hierarchy depth (1 = World, 2 = major group, …, 6 = individual economy) |
| `1990` … `2025` | number | FDI value in millions of US dollars for that year; may be negative |

#### Hierarchy

The entries are **ordered** and the hierarchy is **implicit** — a child entry always follows its parent and has a higher `level` value. There are no explicit parent references. The application reconstructs the tree by tracking the current level as it iterates through the array.

```
level 1 → World
level 2 → Developed economies, Developing economies, …
level 3 → Europe, North America, Asia, …
level 4 → Sub-regions (e.g. Western Europe) or large economies
level 5 → Individual countries or smaller sub-regions
level 6 → Individual countries within a sub-region
```

#### Updating the data

1. Obtain the updated Excel file from Astrit Sulstarova.
2. Convert the relevant sheets to match the JSON structure above, maintaining the existing row order and hierarchy.
3. Replace `public/assets/data/2026-fdi_explorer.json` with the new file.
4. Run `npm run build` and deploy.

## Packages

The following packages are used in this project by default.

### Project specific

* **highcharts** - used to create the FDI Explorer 
* **react-is-visible** - used to check if an element is in the viewport
* **uuid4** - used to create unique IDs

### Build & Dev Server

* **vite** — development server with hot module replacement and production bundler, replaces webpack
* **@vitejs/plugin-react** — adds React and JSX support to Vite

### React

* **react** — UI component library
* **react-dom** — renders React components to the DOM

### Formatter & Linter

* **@biomejs/biome** — formats and lints JS, JSX and CSS files on save, replaces ESLint + Prettier

### Minification

* **terser** — minifies the production JavaScript bundle, removes console.logs in production builds

### MDX

* **@mdx-js/rollup** — Vite/Rollup plugin that compiles MDX files into React components
* **@mdx-js/react** — provides React context for MDX components