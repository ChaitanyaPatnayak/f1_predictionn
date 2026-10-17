# Pit Wall

Interactive demo site for the FODS Formula 1 case study. Every figure comes from the project notebook (`../F1_Case_Study.ipynb`).

## Run it

```bash
npm install          # first time only
npm run dev          # opens on http://localhost:5173
```

For the review, run the production build, which is smoother:

```bash
npm run build
npm run preview      # http://localhost:4173
```

An internet connection is needed for the fonts and the two embedded FrameRate videos.

## Stack

React 19 + TypeScript + Vite · Tailwind CSS 4 · shadcn/ui (`src/components/ui`) · GSAP 3.13 with ScrollTrigger, SplitText and ScrambleText · d3 for charts.

## Structure

| Path | Contents |
|---|---|
| `src/components/ui/hero-scrub.tsx` | Scroll-scrubbed hero (frames or any media in the card) |
| `src/components/sections/` | One file per chapter: predictor, myths, A/B lab, history, drivers, nations, title fight, circuits |
| `src/lib/model.ts` | The regression model (coefficients and 95% prediction interval) |
| `src/data/f1.json` | Numbers exported from the notebook |
| `scripts/make-dots.mjs` | Builds the dot-matrix world map (`src/data/dots.json`) |
