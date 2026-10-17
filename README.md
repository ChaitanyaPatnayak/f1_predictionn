# Formula 1 Race Analytics (1950–2025): FODS Case Study

**What really decides a Grand Prix?** This project is a statistical and predictive study of every Formula 1 World
Championship race from 1950 to 2025.

Course: **23CSE351 Foundations of Data Science (FODS)**  
Department: **Department of Computer Science and Engineering, Amrita Vishwa Vidyapeetham**

### Research Authors
- **R. Meghapranay** (CB.SC.U4CSE24440) — Statistical Modeling & OLS Regression
- **P. Krishna Chaitanya** (CB.SC.U4CSES24436) — Hypothesis Testing & Permutation Lab
- **M. Rishit Kumar** (CB.SC.U4CSE24428) — Variance Decomposition & Bradley–Terry Model
- **K. Aditya** (CB.SC.U4CSE24423) — Exploratory Data Analysis & Spatial Pipeline

---

## Contents

| Path | What it is |
|---|---|
| `F1_Case_Study.ipynb` | Main research notebook: problem formulation, data cleaning, EDA, 15 research questions, regression models, variance decomposition, conclusion |
| `F1_Case_Study.html` | Exported Jupyter notebook formatted for immediate browser review |
| `data/` | Raw Jolpica F1 database tables (11 CSV source files) |
| `figures/` | All 22 statistical charts as high-resolution PNG files |
| `outputs/` | Cleaned analytical tables for Power BI and Tableau dashboards |
| `webapp/` | **Pit Wall Statistical Intelligence Platform**: Next-generation React 19 + TypeScript + Tailwind CSS + GSAP interactive dashboard |
| `powerbi/` | Power BI kit: model-ready CSV tables, Pit Wall theme, DAX measures and a step-by-step dashboard guide (`powerbi/README.md`) |

---

## How to Run the Pit Wall Web Application

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Launching Locally
```bash
cd webapp
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### Building for Production
```bash
cd webapp
npm run build
```
Production assets are generated in `webapp/dist/`.

---

## Interactive Pit Wall Modules

1. **FIA Starting Sequence & Reaction Tester**: 5-light FIA starting gantry with millisecond reaction timer.
2. **Scuderia Ferrari 300-Frame Hero Scrub**: Cinematic scroll-scrubbed 3D canvas powered by GSAP ScrollTrigger.
3. **Live OLS Race Predictor & Timing Tower**: Multiple linear regression model with true $X(X^TX)^{-1}X^T$ 95% prediction intervals, factor contribution waterfalls, and real-time timing tower.
4. **Paddock Myth Buster**: 10 formal hypothesis tests (Two-sample t, Mann-Whitney U, Welch t, Chi-square, Nested ANOVA).
5. **Monte Carlo Permutation Lab**: In-browser 4,000-shuffle resampling simulation with live histogram rendering and exact empirical $p$-value computation.
6. **76-Season Time Machine (1950–2025)**: Autoplay historical scrubber tracking constructor dominance, mechanical reliability, and overtaking index.
7. **Nested ANOVA & Bradley–Terry Driver Builder**: Variance decomposition donut (Car: 60.4%, Driver: 4.5%, Luck: 35.2%) with 6x6 career probability matrix.
8. **Nations Multiple Testing Lab**: Holm-Bonferroni step-down correction demonstrating familywise error rate control across 11 nations.
9. **Championship Title Fight**: Binomial proportions with Wilson score 95% confidence intervals across season progression.
10. **77-Circuit Global Directory**: Filterable database of every Grand Prix venue with pole conversion and race frequencies.
11. **Telemetry Stream Theater**: Synchronized onboard video and vehicle dynamics HUD with dual camera switching.
12. **Academic Exemption, Privacy Policy & Terms of Use Modals**: Built to academic standards with complete citation blocks.

---

## Dataset Source
Jolpica F1 open database (official successor to Ergast Developer API): https://github.com/jolpica/jolpica-f1
