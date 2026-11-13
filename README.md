# Pantry & Plate

[**Open the live app**](https://recipe-book-orpin-zeta.vercel.app/) · [Vercel project](https://vercel.com/mj1112/recipe-book)

A responsive recipe finder and installable web app that helps you cook with the ingredients and equipment you already have. Built with HTML, CSS and vanilla JavaScript, with 100 recipes, real food photography and embedded video tutorials.

## Run locally

Requires Node.js 22 or newer. No dependencies, API keys or environment variables are needed to run the app.

```sh
git clone https://github.com/juinhong05/Recipe-book.git
cd Recipe-book
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). Use an HTTP server instead of opening `index.html` directly so JavaScript modules and the service worker work correctly.

```sh
npm test
```

## Deploy to Vercel

Import [juinhong05/Recipe-book](https://github.com/juinhong05/Recipe-book) into Vercel and deploy the `main` branch. The included `vercel.json` sets:

| Setting | Value |
| --- | --- |
| Root directory | Repository root (`.`) |
| Framework preset | Other |
| Build command | Empty (no build required) |
| Install command | Empty (no dependencies) |
| Output directory | `dist` |
| Environment variables | None |

Vercel serves the static files directly. `server.mjs` is only for local development. With the GitHub repository connected, pushes to `main` produce production deployments and pull requests receive preview deployments.

Alternatively, deploy from this folder with the [Vercel CLI](https://vercel.com/docs/cli):

```sh
npx vercel login
npx vercel link
npx vercel git connect https://github.com/juinhong05/Recipe-book.git
npx vercel --prod
```

The static output can also be served by any HTTPS static host. HTTPS enables service workers and installation where supported by the browser.

## Features

- 100 recipes: 88 community recipes from TheMealDB plus the original 12 recipes, preserving their IDs and saved favourites.
- Real food photos and creator tutorial thumbnails, with attribution. No generated imagery is used by the live app.
- Ingredient matching, equipment filters, total-time and calorie limits, recipe/cuisine search, and 18-at-a-time browsing.
- Video tutorials play inside the recipe dialog using YouTube’s official privacy-enhanced embedded player. Videos load only on request, stay mounted while saving or completing steps, and stop when the dialog closes. Network failures and disabled embeds show an inline explanation and retry option.
- Original recipes retain 1–8 serving adjustment. Imported recipes show source quantities because serving yield is not supplied.
- Pantry, equipment and favourites remain in browser-local storage.
- Service worker caches the app and visited local photos for offline use. Videos require internet access.

## Data and attribution

TheMealDB official API supplies the additional recipes, original ingredient measures, instructions, community photos and initial video references. Ten unavailable videos and three unsuitable or less relevant matches were replaced after checking YouTube metadata. Tutorials can show variations and are labelled accordingly. Provider availability, regional playback restrictions, ads, and future deletions are outside this app’s control.

TheMealDB does not provide nutrition, serving yield or complete preparation times for these records. Imported recipes display “Not listed” and are excluded from time/calorie/high-protein filters requiring those values. Unknown values are never treated as zero. The original 12 nutrition figures remain editorial estimates. Equipment for imported recipes is inferred from their methods and labelled as such; users should read the full method.

Sources: https://www.themealdb.com/api.php and https://www.themealdb.com/terms_of_use.php. The development API permits development projects; review the provider’s subscription requirements before an app-store release. Credits and source links appear in recipe details and the footer.

`dist/catalogue.js` contains the checked snapshot. `scripts/import-recipes.py <official-api-response-json>` rebuilds it from a supplied array of API records and downloads local photos; `scripts/media-overrides.json` preserves checked tutorial replacements and metadata corrections. Run from the project folder. Local media lives in `dist/assets/meals/`.

## Project structure

```text
dist/
  index.html            Page structure
  style.css             Responsive styles
  app.js                Filters, recipe dialogs and saved cookbook
  recipes.js            Original recipes and filtering helpers
  catalogue.js          Imported recipe snapshot
  video.js              Embedded YouTube player lifecycle
  sw.js                 Offline caching
  manifest.webmanifest  Installable app metadata
  assets/               Icon and local food photography
scripts/                Catalogue import and media corrections
tests/                  Node.js filter and catalogue tests
server.mjs              Local development server
vercel.json             Static hosting configuration
```

## Storage and privacy

Pantry ingredients, equipment and saved recipes stay in the current browser's local storage. There is no account system or cross-device sync. Moving to a different domain starts a separate local cookbook. Recipe photos are served locally; embedded YouTube videos load from YouTube only when requested. Clearing site data removes saved preferences and offline content.

## Validation

Eleven automated tests cover filtering, missing metadata, pantry aliases, unique records, media references and preserved ingredient measures. Browser checks cover catalogue loading, filtering, additional results, recipe details, embedded playback, favourites, step progress, player teardown, and desktop/mobile layout. Video availability was checked through YouTube oEmbed metadata; representative playback was verified in-browser. This does not guarantee playback for every viewer or region.
