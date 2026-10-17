# Power BI dashboard · build guide

The case-study instructions ask for a "Tableau/Power BI/Python visualization" and list the dashboard as "(if used)". The Python dashboards in the notebook already meet the requirement. This Power BI version adds an interactive dashboard for the review and the report. Building it takes about 20–30 minutes.

## What is in this folder

| File | Purpose |
|---|---|
| `data/Results.csv` | Fact table: one row per driver per race (25,387 rows) |
| `data/Races.csv` | One row per race (1,138): circuit, date, era, order change, pole won |
| `data/Drivers.csv` | One row per driver (711): nationality, starts, wins, podiums |
| `data/Circuits.csv` | One row per circuit (77): country, latitude, longitude, races hosted |
| `data/Seasons.csv` | One row per season (76): champion, dominant team, HHI, finish rate, pole conversion |
| `data/Predictions.csv` | Regression test set (2024–2025, 849 rows): actual vs predicted position |
| `data/HypothesisTests.csv` | The 13 hypothesis tests: test used, p-value, decision, key result |
| `PitWall_theme.json` | Colour theme matching the website (black, white, red) |
| `measures.dax` | All DAX measures, ready to paste |

All numbers come from the project notebook. The model error in `Predictions.csv` is 2.50 places (grid baseline 2.72), exactly as reported in Q14.

---

## Step 1 · Load the data (3 min)

1. Open **Power BI Desktop** → **Blank report**.
2. **Home → Get data → Text/CSV**, open `data/Results.csv`, click **Load**.
3. Repeat for the other six CSV files.
4. Open **Table view** (left sidebar) and check that `won`, `podium`, `pole`, `classified`, `home` and `street` show **True/False**. If one shows as text, select the column → **Column tools → Data type → True/False**.

## Step 2 · Apply the theme (1 min)

**View → Themes → Browse for themes** → choose `PitWall_theme.json`.

## Step 3 · Relationships (3 min)

Open **Model view** and drag these fields onto each other. All are *many-to-one*, single direction:

| From (many) | To (one) |
|---|---|
| `Results[race_id]` | `Races[race_id]` |
| `Results[driver_id]` | `Drivers[driver_id]` |
| `Results[year]` | `Seasons[year]` |
| `Results[circuit]` | `Circuits[circuit]` |

Leave `Predictions` and `HypothesisTests` unconnected. They are standalone tables. If Power BI auto-created any other relationship (for example `Races` ↔ `Circuits`), delete it to avoid ambiguous paths.

## Step 4 · Measures (5 min)

Select the **Results** table → **Modeling → New measure**, and paste each measure from `measures.dax` one at a time. Then format them:
- **Percent:** Win Rate, Finish Rate, Mechanical Failure Rate, Accident Rate, Pole Conversion, Win Share, Model Improvement vs Grid.
- **Decimal (2 places):** Effective Winning Teams, Model MAE, Grid Baseline MAE, Model R2, Avg Positions Gained.

**Check:** a card with `Model R2` should show **0.60** and `Model MAE` **2.50**.

---

## Step 5 · Build three pages (15 min)

Canvas: **Format → Canvas settings → 16:9**. Use the same layout grid on every page: title across the top, KPI cards below it, charts underneath.

### Page 1 · Race Control (overview)

| Visual | Fields | Notes |
|---|---|---|
| Text box | "Formula 1 Race Analytics, 1950–2025" | Title, 24 pt |
| 5 × Card | `Races`, `Wins` (or `Entries`), `Finish Rate`, `Pole Conversion`, `Effective Winning Teams` | One row of KPIs |
| Line chart | X: `Seasons[year]` · Y: `Finish Rate`, `Pole Conversion` | The reliability revolution: 50% → 86% |
| Map | Latitude/Longitude: `Circuits[latitude]`, `Circuits[longitude]` · Bubble size: `Circuits[races]` · Legend: `Circuits[on_2025_calendar]` | Where F1 has raced |
| Slicer | `Results[era]` | Tile style, filters the whole page |
| Slicer | `Results[year]` | "Between" slider |

### Page 2 · Dynasties (competitive balance)

| Visual | Fields | Notes |
|---|---|---|
| Stacked area chart | X: `Results[year]` · Y: `Wins` · Legend: `Results[team]` | Filters pane: `team` → Top N = 8 by `Wins` |
| Line chart | X: `Seasons[year]` · Y: `Effective Winning Teams` | Dominance fell to the 1970s, rising since 1980 (Q4) |
| Clustered bar | Y: `Results[team]` · X: `Wins` | Top N = 10 by `Wins` |
| Table | `Seasons[year]`, `champion`, `most_wins_team`, `races` | Sort by year, descending |

### Page 3 · Drivers, Tests & Model

| Visual | Fields | Notes |
|---|---|---|
| Clustered bar | Y: `Drivers[driver]` · X: `Wins` | Top N = 10 by `Wins` |
| Scatter chart | X: `Predictions[actual_position]` · Y: `Predictions[predicted_position]` · Values: `Predictions[entry_id]` | Add a trend line (Analytics pane). Shows the Q14 model on unseen seasons |
| 3 × Card | `Model MAE`, `Grid Baseline MAE`, `Model R2` | The model beats the grid baseline by 8% |
| Table | `HypothesisTests[question]`, `hypothesis`, `test`, `p_value`, `decision`, `key_result` | Conditional formatting on `decision`: background red when it contains "Reject" |
| Slicer | `Results[era]` | Optional |

Click any bar, era or year and the whole page cross-filters. That interactivity is the main thing to show faculty.

## Step 6 · Save and export

- **File → Save as** → `F1_Dashboard.pbix` in this folder.
- **File → Export → Export to PDF** gives static pages for the report and PPT.
- Publishing to the web needs a work or school Power BI account. For the review, present directly from Power BI Desktop.

## Talking points for the review

1. "Same data as the notebook, modelled as a star schema: one fact table (Results) with four dimensions."
2. "HHI and Pole Conversion are DAX measures, so they recompute for any era or year selected."
3. "The model page shows the regression's test-set predictions; R² 0.60 and MAE 2.50 match the notebook."
