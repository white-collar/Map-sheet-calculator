# Map sheet calculator

A single-page web app that finds the topographic map sheets covering a point. You enter latitude and longitude in WGS 84, and it gives the sheet names at every scale from 1:1 000 000 down to 1:10 000 in the Soviet (Gauss–Krüger) naming system, for example `M-36-50-В-а-3`.

It is a rewrite of the Android app *Mobile Range Maps Finder 1.1*.

## Use

Open `index.html` in any browser. It has no dependencies and no build step, and it works offline.

- Enter degrees, minutes and seconds separated by spaces (`50 27 15`), or decimal degrees (`50.454`).
- **Use my location** fills in the browser's location.
- A link like `index.html#50.45,30.516667` opens with that point already calculated.
- Letters can be Latin (A B C D) or Cyrillic (А Б В Г).

## Sheet rules

| Scale | Splits its parent into | Labels | Size |
|---|---|---|---|
| 1:1 000 000 | 4° bands A–V from the equator, 6° columns 1–60 from 180° | `N-37` | 4° × 6° |
| 1:500 000 | 2 × 2 | А Б В Г | 2° × 3° |
| 1:200 000 | 6 × 6 | I – XXXVI | 40′ × 1° |
| 1:100 000 | 12 × 12 | 1 – 144 | 20′ × 30′ |
| 1:50 000 | 2 × 2 of 1:100 000 | А Б В Г | 10′ × 15′ |
| 1:25 000 | 2 × 2 of 1:50 000 | а б в г | 5′ × 7′30″ |
| 1:10 000 | 2 × 2 of 1:25 000 | 1 – 4 | 2′30″ × 3′45″ |

- Sheets are numbered row by row from the north-west corner.
- Beyond 60° latitude, sheets are published joined along longitude. They are doubled up to 76° and quadrupled beyond it, except 1:200 000, which is tripled, and 1:500 000, which stays doubled. Examples: `R-35,36` and `T-35-133-В,Г,134-В,Г`. The app also shows the single grid cell that contains the point.
- Southern-hemisphere sheets are marked `(Ю. П.)` with Cyrillic letters on, and `(S)` otherwise.
- A point exactly on a sheet edge belongs to the sheet farther from the equator and farther east.
- All grid math uses whole numbers of milli-arc-seconds, so points on an edge are never misplaced by floating-point rounding.

## Tests

```sh
tests/run.sh
```

The tests need `node` and `python3`. They run three groups of checks:

- **Exact reference:** compares the page with a separately written Python implementation that uses exact fractions, on 360,000 points. About half of those points lie exactly on sheet edges.
- **Property checks:** every reported sheet contains the point, has the right size and sits inside its parent. These checks also cover input parsing and the extreme coordinates.
- **Published examples:** sheet names from Wikipedia, Soviet map-symbol references and textbooks, such as Ryazan `N-37-56`, Murmansk `R-35,36` and `T-35-133-В,Г,134-В,Г`.

No published source gives examples of joined 1:25 000 or 1:10 000 sheets, or of joined sheets in the southern hemisphere. Those follow the same rule as the published 1:50 000 examples.
