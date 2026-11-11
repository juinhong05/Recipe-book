# Pantry & Plate

A responsive recipe finder and installable web app. Run `npm start`, then open http://127.0.0.1:4173. Run `npm test` for filter and recipe-data checks. No build step or package installation is needed; deploy `dist/` as a static site.

## Features

- 12 original recipes with ingredient quantities and detailed cooking steps.
- Pantry matching, equipment selection, total-time and calorie limits, dietary categories, text search, and sorting.
- Strict “make now” filtering; salt, pepper, water and oil are assumed pantry basics.
- Servings from 1–8, ingredient checklists, step completion, and saved favourites.
- Browser-local storage for pantry, equipment and favourites; no accounts or cross-device sync.
- Video tutorial search links to YouTube (not individually curated or embedded videos).
- Web app manifest and service worker for an app-style home-screen experience and cached offline use after the first successful visit. Browser installation support varies.

## Content and scope

Nutrition figures are approximate editorial estimates, not a nutrition database calculation. Generated food photos are illustrative. The catalogue is maintained in `dist/recipes.js`; no external recipe API is configured. This is a working first version of a responsive web app, not an App Store/Play Store native application.

Design tokens: warm ivory #faf9f5, forest #243d2d, sage #e0e6d2, orange #d87538. Georgia headings with DM Sans controls. Desktop pantry sidebar and three-column recipe grid; stacked filters and adaptive recipe cards on mobile.

## Image assets

Generated with the built-in image generation tool. `design-concept.png` is the initial UI reference. `dist/assets/food-atlas.png` contains 12 recipe photographs in a 3 × 4 grid, displayed with CSS background positions.

Asset prompt: “A production food photography sprite atlas, exact 3 columns by 4 rows of equally sized rectangular photos edge-to-edge, no gaps borders labels or text. Overhead meals on warm ivory tabletop, natural daylight, rustic pale ceramic plates. Row 1: chicken rice bowl, tomato basil penne, vegetable egg fried rice. Row 2: chickpea salad, spinach mushroom omelette, salmon broccoli. Row 3: peanut tofu noodles, white bean tomato stew, avocado egg toast. Row 4: loaded sweet potato, chicken broccoli rice, banana overnight oats.”
