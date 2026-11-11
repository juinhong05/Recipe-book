# Pantry & Plate

A responsive recipe finder and installable web app. Run `npm start`, then open http://127.0.0.1:4173. Run `npm test` for filter and catalogue checks. No build step or dependency installation is needed; deploy `dist/` as a static site.

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

`dist/catalogue.js` contains the checked snapshot. `scripts/import-recipes.py <official-api-response-json>` rebuilds it from a supplied array of API records and downloads local photos; `scripts/media-overrides.json` preserves checked tutorial replacements and metadata corrections. Run from the project folder. Local media lives in `dist/assets/meals/`. The older `design-concept.png` is a design reference, not a live asset.

## Validation

Eleven automated tests cover filtering, missing metadata, pantry aliases, unique records, media references and preserved ingredient measures. Browser checks cover catalogue loading, filtering, additional results, recipe details, embedded playback, favourites, step progress, player teardown, and desktop/mobile layout. Video availability was checked through YouTube oEmbed metadata; representative playback was verified in-browser. This does not guarantee playback for every viewer or region.
