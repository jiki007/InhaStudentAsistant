# InhaAssist

Mobile-first English campus directory for international students at Inha University.
ISE4133 Software Engineering, Team 10 (Zikrilloh, Tuymurod).

Search a building in English or Korean, see it pinned on the campus map (S1), then open its
floor-by-floor English room directory and filter by room number (S2).

> **Temporary data.** Building pin positions are *approximate* and room lists are *sample data*
> (see `data/buildings.js`). Checking pins on the real campus is planned for Week 10.

## Run

No build step and no API key.

- **Quickest:** open `index.html` in a browser (double-click). Use your phone's width
  in DevTools (e.g. 390 px) to see the mobile layout.
- **On a phone over Wi-Fi:** `npm start` (or `python3 -m http.server 8080`), then open
  `http://<your-computer-IP>:8080` on the phone.

The map uses Leaflet with Esri satellite imagery (no API key, no Korean text) and its own English labels, plus an
OpenStreetMap street layer (Korean labels). If one map service blocks the page, the app switches to the next one.
Some services (OpenStreetMap) refuse pages opened directly from a file (`file://`), so the
most reliable way to run it is a local server: `python3 -m http.server 8080`, then open
http://localhost:8080. Without internet, the app draws a simple offline sketch so search
and pins still work.

## Test

Requires Node.js 18+.

```bash
npm test                     # 19 unit tests for search, directory filter and data checks
npm install                  # once, installs Playwright for the browser test
npx playwright install chromium
npm run e2e                  # acceptance criteria in a phone-sized browser, saves screenshots
npm run e2e:offline          # same, with internet blocked (tests the fallback map)
```

Latest results and screenshots: `docs/evidence/`.

## Adding exact building positions

`data/buildings.js` lists the 23 named buildings of the official campus map (numbers = `mapNo`). Buildings
without a position yet show "Map position not added yet" and no pin.

1. Open `tools/pick-coordinates.html` in a browser (internet needed for the map).
2. Click a building in the list, switch the map to **Satellite**, click the middle of its roof.
   Drag a pin to adjust. Progress is saved in the browser.
3. Press **Download buildings.js** and replace `data/buildings.js` with the downloaded file.
4. Run `npm test`. Positions are marked `coordStatus: "map"`; change to `"verified"` after
   checking a building on campus.

## Structure

| File | Role |
|---|---|
| `index.html`, `styles.css` | Mobile page layout |
| `src/app.js` | UI: search form, map pin, directory view (browser only) |
| `src/search.js` | Core logic with no DOM: `searchBuildings`, `filterDirectory`, `hasDirectory` |
| `data/buildings.js` | Building records: names (EN/KO), aliases, coordinates, floors and rooms |
| `test/search.test.js` | Unit tests (Node built-in test runner) |
| `test/e2e.mjs` | Browser acceptance checks (Playwright) |

## Requirements covered

| ID | Criterion | Status |
|---|---|---|
| S1-AC1 | "60th Anniversary" → pin on correct building (also Korean "60주년기념관") | Done, tested |
| S1-AC2 | "XYZ99" → "Unrecognized building code" | Done, tested |
| S2-AC1 | View Directory → floor-by-floor English list | Done, tested (sample rooms) |
| S2-AC2 | Filter "302" → only room 302 and its floor | Done, tested |
| M2 open rule | No floor data → disabled button "Data unavailable for this building" | Decided and done |

See `AI_USAGE.md` for how AI assistance was used and checked.
