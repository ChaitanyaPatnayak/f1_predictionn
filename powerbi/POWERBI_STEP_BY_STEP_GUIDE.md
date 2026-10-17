# Power BI Dashboard Implementation Guide
### 23CSE351: Foundations of Data Science · Formula 1 Statistical Intelligence

This guide walks you through building the interactive **Power BI Desktop Dashboard** step by step without touching or modifying any source code. Everything is performed directly within the Power BI Desktop user interface using the pre-processed datasets and assets in this repository.

---

## 📁 Source Assets Reference

All necessary assets are already organized inside the [`powerbi/`](./) folder:

| Asset | Location | Description |
| :--- | :--- | :--- |
| **Fact Table** | [`data/Results.csv`](./data/Results.csv) | 25,387 race finishes (1950–2025): driver, team, grid, finish, outcome |
| **Dimension 1** | [`data/Races.csv`](./data/Races.csv) | 1,138 Grand Prix events: date, circuit, regulation era, order reshuffle |
| **Dimension 2** | [`data/Drivers.csv`](./data/Drivers.csv) | 711 World Championship drivers: nationality, career starts, wins |
| **Dimension 3** | [`data/Circuits.csv`](./data/Circuits.csv) | 77 circuits across 34 nations: GPS coordinates, calendar status |
| **Dimension 4** | [`data/Seasons.csv`](./data/Seasons.csv) | 76 seasons: champion, dominant constructor, finish rate, HHI parity |
| **Validation** | [`data/Predictions.csv`](./data/Predictions.csv) | Holdout test set (2024–2025): Actual vs Predicted finishing positions |
| **Hypotheses** | [`data/HypothesisTests.csv`](./data/HypothesisTests.csv) | Summary of all formal statistical tests, p-values, and decisions |
| **Color Theme** | [`PitWall_theme.json`](./PitWall_theme.json) | High-contrast dark mode palette matching the web application |
| **DAX Measures** | [`measures.dax`](./measures.dax) | All analytical DAX expressions ready to copy and paste |

---

## 🚀 Step-by-Step Implementation

### Step 1 · Load Data into Power BI (3–4 minutes)

1. Launch **Power BI Desktop** and choose **Blank report**.
2. On the **Home** tab ribbon, click **Get data** → **Text/CSV**.
3. Navigate to your project folder:
   ```
   powerbi\data
   ```
4. Select `Results.csv` and click **Load**.
5. Repeat this process for the other 6 CSV files:
   - `Races.csv`
   - `Drivers.csv`
   - `Circuits.csv`
   - `Seasons.csv`
   - `Predictions.csv`
   - `HypothesisTests.csv`
6. **Data Type Check:** Click **Table view** (left sidebar icon). Select the `Results` table and confirm that boolean columns (`won`, `podium`, `pole`, `classified`, `home`, `street`) display as **True / False**. If any shows as text, click the column header → **Column tools** → **Data type** → **True/False**.

---

### Step 2 · Apply the Pit Wall Dark Theme (1 minute)

1. In the top ribbon, click the **View** tab.
2. In the **Themes** section, click the dropdown arrow.
3. Click **Browse for themes...** at the bottom.
4. Select [`PitWall_theme.json`](./PitWall_theme.json).
5. A popup will confirm: *"Theme imported successfully"*. Visualizations, canvas elements, and cards will now automatically use the official black, dark-charcoal, and crimson-accented palette.

---

### Step 3 · Set Up Star Schema Relationships (2–3 minutes)

1. Switch to **Model view** (the relationship icon on the left sidebar).
2. Establish the relationships by dragging columns from `Results` onto each corresponding dimension table. All relationships are **Many-to-One (*:1)** with **Single** cross-filter direction:

| From Table (Many) | Column | Drag To Table (One) | Column |
| :--- | :--- | :--- | :--- |
| **Results** | `race_id` | **Races** | `race_id` |
| **Results** | `driver_id` | **Drivers** | `driver_id` |
| **Results** | `year` | **Seasons** | `year` |
| **Results** | `circuit` | **Circuits** | `circuit` |

> [!IMPORTANT]
> - **`Predictions`** and **`HypothesisTests`** remain standalone (unconnected) tables.
> - If Power BI auto-generated any extra line between `Races` and `Circuits`, right-click that line and select **Delete** to prevent ambiguity.

---

### Step 4 · Add DAX Analytical Measures (5 minutes)

All measures are located in [`measures.dax`](./measures.dax). To add a measure:
1. In the right-hand **Data** pane, click on the **Results** table.
2. On the ribbon, click **Modeling** → **New measure**.
3. Copy and paste the formula from [`measures.dax`](./measures.dax) into the formula bar and press **Enter**.
4. Set the formatting using the **Measure tools** tab on the ribbon.

#### Summary of Key Measures to Create:

1. **Races** (Total Grands Prix):
   ```dax
   Races = DISTINCTCOUNT ( Results[race_id] )
   ```
   *Format: Whole number*

2. **Wins**:
   ```dax
   Wins = CALCULATE ( COUNTROWS ( Results ), Results[won] = TRUE () )
   ```
   *Format: Whole number*

3. **Finish Rate** (Mechanical Reliability):
   ```dax
   Finish Rate = DIVIDE ( CALCULATE ( COUNTROWS ( Results ), Results[outcome] = "Running at finish" ), COUNTROWS ( Results ) )
   ```
   *Format: Percentage (%) with 1 decimal*

4. **Pole Conversion Rate**:
   ```dax
   Pole Conversion = DIVIDE ( CALCULATE ( COUNTROWS ( Results ), Results[pole] = TRUE (), Results[won] = TRUE () ), CALCULATE ( COUNTROWS ( Results ), Results[pole] = TRUE () ) )
   ```
   *Format: Percentage (%) with 1 decimal*

5. **Competitive Parity Index (HHI)**:
   ```dax
   HHI = SUMX ( VALUES ( Results[team] ), ( 100 * DIVIDE ( CALCULATE ( [Wins] ), CALCULATE ( [Wins], ALL ( Results[team] ) ) ) ) ^ 2 )
   ```

6. **Effective Winning Teams**:
   ```dax
   Effective Winning Teams = DIVIDE ( 10000, [HHI] )
   ```
   *Format: Decimal with 2 places*

7. **Machine Learning Model MAE**:
   ```dax
   Model MAE = AVERAGE ( Predictions[abs_error] )
   ```
   *Format: Decimal with 2 places (should evaluate to **2.50**)*

8. **Model R² (Variance Explained)**:
   ```dax
   Model R2 =
   VAR m = AVERAGE ( Predictions[actual_position] )
   RETURN
   1 - DIVIDE (
       SUMX ( Predictions, ( Predictions[actual_position] - Predictions[predicted_position] ) ^ 2 ),
       SUMX ( Predictions, ( Predictions[actual_position] - m ) ^ 2 )
   )
   ```
   *Format: Decimal with 2 places (should evaluate to **0.60**)*

9. **Model Improvement vs Raw Starting Grid**:
   ```dax
   Model Improvement vs Grid = 1 - DIVIDE ( [Model MAE], AVERAGE ( Predictions[grid_baseline_error] ) )
   ```
   *Format: Percentage (%) with 1 decimal (evaluates to **8.1%**)*

---

### Step 5 · Build the 3 Dashboard Pages (12–15 minutes)

Set canvas aspect ratio on each page: **Format** pane → **Canvas settings** → **16:9**.

---

### Page 1 · Race Control (Historical Overview)
*Rename the page tab to **"Race Control"**.*

1. **Title Banner:**
   - Insert **Text Box**: `"Formula 1 Statistical Intelligence (1950 – 2025)"` (Font size: 22pt, Bold, White).
2. **KPI Summary Cards (Top Row of 4 Cards):**
   - Card 1: `[Races]` → Displays **1,138**
   - Card 2: `[Wins]` → Displays **1,138**
   - Card 3: `[Finish Rate]` → Displays **64.2%** (Historical average)
   - Card 4: `[Pole Conversion]` → Displays **41.2%** (Global baseline)
3. **Reliability Evolution (Line Chart):**
   - **X-axis:** `Seasons[year]`
   - **Y-axis:** `[Finish Rate]`, `[Pole Conversion]`
   - *Visual Takeaway:* Clearly depicts the steep rise in finishing reliability from ~45% in the 1960s to over 85% in modern hybrid eras.
4. **Circuits Worldwide (Map Visual):**
   - **Latitude:** `Circuits[latitude]`
   - **Longitude:** `Circuits[longitude]`
   - **Bubble size:** `Circuits[races]`
   - **Legend:** `Circuits[on_2025_calendar]`
5. **Interactive Slicers:**
   - Slicer 1: `Results[era]` (Visual style: Tile / Buttons across top or left).
   - Slicer 2: `Seasons[year]` (Visual style: Between slider).

---

### Page 2 · Dynasties & Competitive Balance
*Rename the page tab to **"Dynasties"**.*

1. **Constructor Era Dominance (Stacked Area Chart):**
   - **X-axis:** `Results[year]`
   - **Y-axis:** `[Wins]`
   - **Legend:** `Results[team]`
   - In the **Filters pane**, filter `team` by **Top N = 8** by measure `[Wins]`.
2. **Parity Metric Over Time (Line Chart):**
   - **X-axis:** `Seasons[year]`
   - **Y-axis:** `[Effective Winning Teams]`
   - *Visual Takeaway:* Illustrates how competitive balance peaked in the late 1970s and dropped significantly during dominant multi-year dynasties (Ferrari 2000–2004, Mercedes 2014–2020, Red Bull 2022–2023).
3. **All-Time Constructor Victories (Clustered Bar Chart):**
   - **Y-axis:** `Results[team]`
   - **X-axis:** `[Wins]`
   - In Filters, set `team` to **Top N = 10** by `[Wins]`.
4. **Season Championship Table (Table Visual):**
   - Columns: `Seasons[year]`, `champion`, `most_wins_team`, `races`
   - Sort descending by `year`.

---

### Page 3 · Drivers, Hypotheses & Predictive Model
*Rename the page tab to **"Drivers & Validation"**.*

1. **Top Drivers (Clustered Bar Chart):**
   - **Y-axis:** `Drivers[driver]`
   - **X-axis:** `[Wins]`
   - Filter `driver` to **Top N = 10** by `[Wins]` (Hamilton, Schumacher, Verstappen, etc.).
2. **Predictive Model Holdout Validation (Scatter Chart):**
   - **X-axis:** `Predictions[actual_position]`
   - **Y-axis:** `Predictions[predicted_position]`
   - **Values:** `Predictions[entry_id]`
   - Open **Analytics** tab on the right side of the chart and toggle **Trend line** to **ON**.
   - *Visual Takeaway:* Evaluates our Multiple Linear Regression model on 849 unseen race entries from 2024–2025.
3. **Model Metrics (Row of 3 Cards):**
   - Card 1: `[Model MAE]` → **2.50 places**
   - Card 2: `[Model R2]` → **0.60**
   - Card 3: `[Model Improvement vs Grid]` → **8.1% gain**
4. **13 Formal Paddock Hypotheses Table (Table Visual):**
   - Columns: `HypothesisTests[question]`, `hypothesis`, `test`, `p_value`, `decision`, `key_result`.
   - In formatting, enable conditional background coloring on `decision` to highlight `"Reject H0"` in subtle crimson.

---

## 💾 Step 6 · Save and Export

1. **Save Project File:**
   - Click **File** → **Save As** → choose:
     ```
     powerbi\F1_Dashboard.pbix
     ```
2. **Export Static PDF for Report:**
   - Click **File** → **Export** → **Export to PDF**.
   - This creates publication-ready slides for your written report and viva slides.

---

## 🎙️ Key Talking Points for Faculty Review

When presenting your dashboard to examiners or faculty:

1. **Star Schema Data Engineering:**
   > *"The Power BI model follows an industry-standard star schema. The central `Results` fact table (25,387 records) is filtered through four dimension tables (`Races`, `Drivers`, `Circuits`, `Seasons`), which eliminates redundant data and guarantees sub-second cross-filtering."*

2. **Fully Dynamic DAX Calculations:**
   > *"All advanced statistical indicators—such as the Herfindahl-Hirschman Index (HHI) for parity, Pole Conversion, and Finishing Reliability—are calculated dynamically in DAX. Selecting any specific regulation era or circuit instantly recalculates the underlying metrics on the fly."*

3. **Machine Learning Model Holdout Validation:**
   > *"Page 3 includes the holdout evaluation of our OLS Regression model on unseen 2024–2025 races. The test $R^2 = 0.60$ and $MAE = 2.50$ places match the notebook's outputs exactly, proving that starting grid and constructor performance explain 60% of race outcome variance."*
