# Pantry & Plate

[Open the live app](https://recipe-book-orpin-zeta.vercel.app/) · [Vercel project](https://vercel.com/mj1112/recipe-book)

A responsive recipe finder and installable web app for cooking with the ingredients and equipment you already have. Built with HTML, CSS and vanilla JavaScript.

## Reviewed collection

The collection now contains **40 checked recipes, including 32 easy meals and 16 Asian recipes**. Easy meals are shown by default; choose All recipes to include the eight dishes that need more time or steps. Quick & easy means an easy method and no more than 30 minutes total, including any waiting time.

Every recipe includes:

- Separate preparation and cooking times, plus soaking or marinating where needed.
- Calories and protein **per serving**, a serving count, and whole-recipe ingredient quantities.
- A real, visually reviewed food photograph. No generated images, people, text overlays or video screenshots are used as recipe photos.
- Ingredient and equipment matching, a step checklist, and an embedded cooking tutorial.

The November 2026 review replaces the previous 116-recipe collection with a smaller, checked selection. Complicated dishes and the 12 recipes using tutorial-thumbnail photos were removed from the live catalogue. Existing IDs are preserved for retained recipes. Saved IDs for retired recipes remain in browser storage but are not displayed; the previous catalogue is recoverable from Git history.

Asian options include egg drop soup, laksa, yaki udon, pad see ew, congee, mapo tofu, kung po prawns, kung pao chicken, Thai green curry, matar paneer, kidney bean curry, dal and more.

## Run locally

Requires Node.js 22 or newer. No dependencies, API keys or environment variables are needed.

```sh
git clone https://github.com/juinhong05/Recipe-book.git
cd Recipe-book
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). Use an HTTP server rather than opening the HTML file directly.

```sh
npm test
```

## Recipe and nutrition review

Nutrition is an **estimate**, not a laboratory analysis or a personalised diet recommendation. Brands, edible weights, cooking losses and portion sizes change the result.

- 27 recipes use per-serving calorie and protein figures and serving yields from the linked Good Food publisher pages. Transcribed ingredients were checked and corrected against those pages. Timing was adjusted where a stage was omitted or too short, and those changes are labelled.
- 13 recipes use explicit editorial portions calculated from generic USDA SR Legacy food composition data. The calculation sums ingredient grams × nutrients per 100 g, divides by the batch serving count, then rounds calories to the nearest 10 kcal and protein to the nearest gram. Small seasoning amounts are omitted; ingredient substitutions and approximations are documented.
- Included oil and toppings are counted. Optional rice, bread and other sides are excluded unless listed in the recipe itself. Light meals and side portions are identified in their methods or notes.
- Ingredient quantities are for the **whole batch**, not one serving. Nutrition is for one equal share of that batch. The app does not scale free-text measurements.
- Timing includes preparation, cooking and any separately displayed waiting period. Equipment requirements were checked against the written method.

Corrections include peas in egg drop soup, sundried tomatoes in tuna Niçoise, cooked prawns and reduced-fat coconut milk in laksa, canned/cooked legumes, and explicit weights for estimated portions. Tutorials may show a variation; follow the written quantities and method.

The authoritative reviewed data is `scripts/reviewed-recipes.json`. The saved USDA food IDs, descriptions and per-100-g values are in `scripts/nutrition-profiles.json`. To regenerate the browser snapshot after a reviewed edit (Python 3 required):

```sh
python scripts/build-catalogue.py
npm test
```

The builder validates required facts and local photos before writing `dist/catalogue.js`. Vercel serves the committed snapshot; Python is not required for deployment.

Raw TheMealDB imports are **staged for review**, not published directly:

```sh
python scripts/import-recipes.py scripts/asian-recipes.json --append
```

This writes ignored `scripts/imported-recipes.json` and `scripts/imported-photos/`. Review ingredients, servings, nutrition, timing, equipment and photographs before adding entries to the reviewed data. The older API snapshot and media corrections remain available as reference.

## Photos, videos and attribution

[TheMealDB](https://www.themealdb.com/api.php) supplies the community recipe references and real photographs. Photo credits and original recipe links appear in each recipe. [Good Food](https://www.bbcgoodfood.com/) nutrition pages are linked individually. The calculated recipes use the public-domain [USDA FoodData Central SR Legacy dataset](https://fdc.nal.usda.gov/download-datasets/), April 2018 release.

Recipe cards, detail photos and video posters all use food photographs served locally. YouTube's privacy-enhanced embedded player loads only after pressing play. Videos remain inside the recipe dialog and stop when it closes. Tutorial content itself can naturally include presenters, captions or YouTube controls. Playback depends on the provider, region and network; an inline retry is available for failures.

See [TheMealDB terms](https://www.themealdb.com/terms_of_use.php) for provider usage requirements. No AI-generated photography is used in the live app.

## Deploy to Vercel

The repository is connected to Vercel; pushes to `main` create production deployments. `vercel.json` specifies:

| Setting | Value |
| --- | --- |
| Framework | Other / static |
| Root directory | Repository root |
| Build and install commands | Empty |
| Output directory | `dist` |
| Environment variables | None |

`server.mjs` is for local development only. HTTPS enables the service worker and app installation where supported.

## Storage and offline use

Pantry ingredients, equipment and favourites stay in this browser's local storage. There are no accounts or cross-device sync. The service worker caches the app and visited local photos. Videos require internet access. Clearing site data removes preferences and cached content.

## Project structure

```text
dist/
  index.html            Page structure
  style.css             Responsive layout
  app.js                Cards, dialogs and saved cookbook
  recipes.js            Ingredient, equipment and category filters
  catalogue.js          Generated reviewed recipe data
  video.js              Embedded video lifecycle
  sw.js                 Offline cache
  assets/               Icon and food photographs
scripts/
  reviewed-recipes.json  Reviewed methods, facts and calculation weights
  nutrition-profiles.json USDA values and food IDs
  build-catalogue.py     Reproducible catalogue generator
  import-recipes.py      Stages API records for review
tests/                  Node.js data and filter checks
server.mjs              Local development server
vercel.json             Static hosting configuration
```

## Validation

14 automated tests cover complete metadata, reproducible nutrition calculations, photo references, pantry/equipment matching, time/calorie filters, waiting periods, Asian search and corrected ingredients. All 40 food photos were visually reviewed. Browser checks at desktop and 390 × 844 cover visible recipe facts, responsive layout, combined filters, step progress, embedded playback and player teardown. These checks do not guarantee future availability of every third-party video.
