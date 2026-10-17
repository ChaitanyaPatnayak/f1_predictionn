import { useState, useMemo } from "react";
import { F1_DATA, PREDICTOR_PRESETS } from "@/data/f1Data";
import { Sparkles, Sliders, Layers, TrendingUp, Trophy, HelpCircle } from "lucide-react";

interface PredictorState {
  grid: number;
  form: number;
  starts: number;
  age: number;
  street: number;
  home: number;
  ge: number;
}

const LABELS = [
  "Grid position",
  "Team form",
  "Experience",
  "Age",
  "Street circuit",
  "Home race",
  "2022+ rules",
];

const REF = [1, 10, 11, Math.log1p(106), 27, 0, 0, 0];

export function PredictorSection() {
  const [state, setState] = useState<PredictorState>({
    grid: 5,
    form: 3.0,
    starts: 150,
    age: 27,
    street: 0,
    home: 0,
    ge: 1,
  });

  const M = F1_DATA.model;

  // Compute prediction with true OLS 95% prediction interval
  const result = useMemo(() => {
    const x = [
      1,
      state.grid,
      state.form,
      Math.log1p(state.starts),
      state.age,
      state.street,
      state.home,
      state.ge,
    ];

    let y = 0;
    for (let i = 0; i < x.length; i++) {
      y += M.params[i] * x[i];
    }

    let q = 0;
    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < x.length; j++) {
        q += x[i] * M.xtxInv[i][j] * x[j];
      }
    }

    const half = M.t975 * Math.sqrt(M.scale * (1 + q));
    const lo = Math.max(1, y - half);
    const hi = Math.min(20, y + half);
    const pos = Math.min(20, Math.max(1, Math.round(y)));
    const delta = state.grid - y;

    // Contributions vs baseline
    const contribs = x.slice(1).map((v, i) => M.params[i + 1] * (v - REF[i + 1]));

    return { y, lo, hi, pos, delta, contribs };
  }, [state, M]);

  const winRate = F1_DATA.winByGrid[state.grid] ? (F1_DATA.winByGrid[state.grid] * 100).toFixed(1) : "0.0";
  const podRate = F1_DATA.podiumByGrid[state.grid] ? (F1_DATA.podiumByGrid[state.grid] * 100).toFixed(1) : "0.0";

  return (
    <section id="predict" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff2c2c] animate-pulse" />
            ORDINARY LEAST SQUARES REGRESSION · INFERENCE ENGINE
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Race Predictor & <span className="text-[#ff2c2c]">Timing Tower</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            Trained on 3,400 Grand Prix entries (2014–2023) using multiple linear regression with variance-covariance matrix inference.
            Predicts the expected finishing position with a rigorous 95% prediction interval (Test R² 0.60, MAE 2.50 places).
          </p>
        </div>

        {/* Presets Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono-f1 uppercase tracking-wider text-white/50 mr-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#ff2c2c]" />
            Paddock Scenarios:
          </span>
          {PREDICTOR_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setState(p.config)}
              className="rounded-lg border border-white/10 bg-[#161616] px-3 py-1.5 font-display text-xs font-semibold text-white/80 transition hover:border-[#ff2c2c] hover:bg-white/10 hover:text-white"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* 3-Column Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Col 1: Parameter Sliders (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#161616] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
              <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-[#ff2c2c]" />
                Independent Variables (X)
              </span>
              <span className="text-[11px] font-mono-f1 text-white/40">7 Features</span>
            </div>

            {/* Sliders */}
            <div className="space-y-5">
              {/* Grid Position */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="in-grid" className="font-semibold text-white">Starting Grid Position</label>
                  <span className="font-mono-f1 text-base font-bold text-[#ff2c2c]">P{state.grid}</span>
                </div>
                <input
                  id="in-grid"
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={state.grid}
                  onChange={(e) => setState({ ...state, grid: parseInt(e.target.value) })}
                  className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-f1 text-white/40 mt-1">
                  <span>P1 (Pole)</span>
                  <span>P10 (Midfield)</span>
                  <span>P20 (Back)</span>
                </div>
              </div>

              {/* Team Form */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="in-form" className="font-semibold text-white">Team Machinery Form</label>
                  <span className="font-mono-f1 text-base font-bold text-white">{state.form.toFixed(1)}</span>
                </div>
                <input
                  id="in-form"
                  type="range"
                  min="1.5"
                  max="18"
                  step="0.5"
                  value={state.form}
                  onChange={(e) => setState({ ...state, form: parseFloat(e.target.value) })}
                  className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-f1 text-white/40 mt-1">
                  <span>~2.5 (Red Bull/McLaren)</span>
                  <span>~10 (Midfield)</span>
                  <span>~16 (Back-marker)</span>
                </div>
              </div>

              {/* Career Starts */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="in-starts" className="font-semibold text-white">Career Grand Prix Starts</label>
                  <span className="font-mono-f1 text-base font-bold text-white">{state.starts}</span>
                </div>
                <input
                  id="in-starts"
                  type="range"
                  min="0"
                  max="350"
                  step="5"
                  value={state.starts}
                  onChange={(e) => setState({ ...state, starts: parseInt(e.target.value) })}
                  className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-f1 text-white/40 mt-1">
                  <span>0 (Rookie debut)</span>
                  <span>106 (Average)</span>
                  <span>350+ (Alonso/Hamilton)</span>
                </div>
              </div>

              {/* Driver Age */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label htmlFor="in-age" className="font-semibold text-white">Driver Age</label>
                  <span className="font-mono-f1 text-base font-bold text-white">{state.age} yrs</span>
                </div>
                <input
                  id="in-age"
                  type="range"
                  min="18"
                  max="43"
                  step="1"
                  value={state.age}
                  onChange={(e) => setState({ ...state, age: parseInt(e.target.value) })}
                  className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Qualitative Context Toggles */}
              <div className="pt-2 border-t border-white/5">
                <span className="block text-xs font-mono-f1 uppercase tracking-wider text-white/50 mb-2">
                  Circuit & Regulation Modifiers
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setState({ ...state, street: state.street ? 0 : 1 })}
                    className={`rounded-lg border p-2 text-xs font-display font-bold transition text-center ${
                      state.street
                        ? "border-[#ff2c2c] bg-[#ff2c2c]/15 text-[#ff2c2c]"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    Street Circuit
                  </button>

                  <button
                    type="button"
                    onClick={() => setState({ ...state, home: state.home ? 0 : 1 })}
                    className={`rounded-lg border p-2 text-xs font-display font-bold transition text-center ${
                      state.home
                        ? "border-[#ff2c2c] bg-[#ff2c2c]/15 text-[#ff2c2c]"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    Home Race
                  </button>

                  <button
                    type="button"
                    onClick={() => setState({ ...state, ge: state.ge ? 0 : 1 })}
                    className={`rounded-lg border p-2 text-xs font-display font-bold transition text-center ${
                      state.ge
                        ? "border-[#ff2c2c] bg-[#ff2c2c]/15 text-[#ff2c2c]"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    2022+ Ground Effect
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Readout & Factor Contributions (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-white/5 bg-[#161616] p-5 sm:p-6 shadow-xl">
            <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/60 block mb-1">
              Predicted Finishing Position
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-mono-f1 text-6xl sm:text-7xl font-black text-[#ff2c2c] leading-none">
                P{result.pos}
              </span>
              <div className="text-sm font-mono-f1 text-white/70">
                <span>Model value: {result.y.toFixed(2)}</span>
                <span className="block text-xs text-emerald-400">
                  95% PI: P{Math.round(result.lo)} – P{Math.round(result.hi)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-white/70 font-mono-f1 bg-white/5 p-2.5 rounded-lg border border-white/5">
              {result.delta > 0.4
                ? `⚡ Expected to GAIN +${result.delta.toFixed(1)} places from the starting grid.`
                : result.delta < -0.4
                ? `⚠️ Expected to LOSE ${Math.abs(result.delta).toFixed(1)} places from the starting grid.`
                : "⚖️ Expected to finish approximately where it started."}
            </p>

            {/* Historical Win / Podium odds from Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                <div className="font-mono-f1 text-2xl font-bold text-[#ff2c2c] flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {winRate}%
                </div>
                <span className="text-[11px] font-mono-f1 text-white/50 block mt-0.5">
                  P{state.grid} historical win rate
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                <div className="font-mono-f1 text-2xl font-bold text-white flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-[#ff2c2c]" />
                  {podRate}%
                </div>
                <span className="text-[11px] font-mono-f1 text-white/50 block mt-0.5">
                  P{state.grid} podium rate
                </span>
              </div>
            </div>

            {/* Factor Contribution Waterfall */}
            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono-f1 uppercase tracking-wider text-white/60">
                  Feature Deltas vs Midfield Baseline
                </span>
                <span className="text-[10px] font-mono-f1 text-white/40">Places (+/-)</span>
              </div>

              <div className="space-y-2 font-mono-f1 text-xs">
                {result.contribs.map((c, i) => {
                  const maxVal = 6.0;
                  const pctWidth = Math.min(50, (Math.abs(c) / maxVal) * 50);
                  const isGain = c < 0; // negative delta in finish pos means better place!
                  return (
                    <div key={i} className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 truncate text-white/70 text-[11px]">
                        {LABELS[i]}
                      </span>
                      <div className="col-span-6 relative h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20" />
                        <div
                          className={`absolute top-0 bottom-0 rounded-full ${
                            isGain ? "bg-white" : "bg-[#ff2c2c]"
                          }`}
                          style={{
                            left: isGain ? `${50 - pctWidth}%` : "50%",
                            width: `${pctWidth}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`col-span-2 text-right text-[11px] font-bold ${
                          isGain ? "text-white" : "text-[#ff2c2c]"
                        }`}
                      >
                        {isGain ? "−" : "+"}{Math.abs(c).toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] font-mono-f1 text-white/40 mt-2 text-center">
                White = positions gained · Crimson = positions lost vs average P10 midfield driver
              </p>
            </div>
          </div>

          {/* Col 3: Live Timing Tower (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-[#161616] p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#ff2c2c]" />
                Timing Tower
              </span>
              <span className="text-[10px] font-mono-f1 text-[#ff2c2c]">95% CI Range</span>
            </div>

            <div className="space-y-1 font-mono-f1 text-xs">
              {Array.from({ length: 20 }, (_, idx) => {
                const p = idx + 1;
                const isBand = p >= Math.round(result.lo) && p <= Math.round(result.hi);
                const isHit = p === result.pos;
                const isStart = p === state.grid;

                return (
                  <div
                    key={p}
                    className={`flex items-center justify-between px-2.5 py-1 rounded transition-colors ${
                      isHit
                        ? "bg-[#ff2c2c] text-white font-bold shadow-md shadow-[#ff2c2c]/40"
                        : isBand
                        ? "bg-[#ff2c2c]/15 text-white border border-[#ff2c2c]/30"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <span className="w-8 font-bold">P{p}</span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {isHit && <span className="bg-black text-[#ff2c2c] px-1 rounded uppercase tracking-wider text-[9px] font-bold">PRED</span>}
                      {isStart && <span className="bg-white/20 text-white px-1 rounded font-bold uppercase tracking-wider text-[9px]">GRID</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Model Benchmark Card */}
        <div className="mt-8 rounded-xl border border-white/5 bg-[#161616] p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3 mb-4">
            <div>
              <span className="font-display font-bold text-white text-base">Model Benchmark & OLS Diagnostics</span>
              <p className="text-xs text-white/60">Cross-validated against ensemble methods on Jolpica F1 holdout dataset (n = 849 test races)</p>
            </div>
            <div className="flex items-center gap-2 font-mono-f1 text-xs">
              <span className="text-emerald-400 font-bold">OLS R² = 0.600</span>
              <span className="text-white/30">•</span>
              <span className="text-white/70">Random Forest R² = 0.598</span>
              <span className="text-white/30">•</span>
              <span className="text-white/70">GradBoost R² = 0.571</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-f1">
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-white/40 block">Equation Spec</span>
              <span className="text-white font-semibold">Finish ~ Grid + Form + ln(Exp) + Age + Venue</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-white/40 block">Training MAE</span>
              <span className="text-white font-semibold">2.50 places (Mean absolute error)</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-white/40 block">Grid Elasticity</span>
              <span className="text-white font-semibold">β_grid = +0.394 (Std β = 0.456)</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-white/40 block">Car Machinery Beta</span>
              <span className="text-white font-semibold">β_form = +0.409 (Std β = 0.341)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
