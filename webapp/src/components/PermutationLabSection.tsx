import { useState, useMemo, useRef } from "react";
import { F1_DATA } from "@/data/f1Data";
import { Play, RotateCcw, Activity, BarChart2 } from "lucide-react";

interface Experiment {
  key: string;
  name: string;
  a: number[];
  b: number[];
  aLab: string;
  bLab: string;
  metric: string;
  h0: string;
  fmt: (v: number) => string;
  ref: string;
  span: number;
}

const binaryArray = (k: number, n: number) =>
  Array.from({ length: n }, (_, i) => (i < k ? 1 : 0));

export function PermutationLabSection() {
  const [activeExpKey, setActiveExpKey] = useState<"order" | "pole">("order");
  const [shuffles, setShuffles] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const experiments: Record<"order" | "pole", Experiment> = useMemo(() => ({
    order: {
      key: "order",
      name: "2022 Rules vs Overtaking Reshuffle",
      a: F1_DATA.abOrder.A,
      b: F1_DATA.abOrder.B,
      aLab: "Group A · 2017–21 Regulations",
      bLab: "Group B · 2022–25 Ground Effect",
      metric: "Order change per race (places reshuffled)",
      h0: "The 2022 ground-effect regulations did not change the mean order change per race.",
      fmt: (v: number) => v.toFixed(3),
      ref: "Notebook: Welch t-test p = 0.023, Mann–Whitney U p = 0.024, Cohen's d = 0.33 (moderate effect).",
      span: 0.6,
    },
    pole: {
      key: "pole",
      name: "Hybrid Era vs Pole Conversion",
      a: binaryArray(F1_DATA.abPole.A[0], F1_DATA.abPole.A[1]),
      b: binaryArray(F1_DATA.abPole.B[0], F1_DATA.abPole.B[1]),
      aLab: "Group A · 2000–13 V10/V8 Poles",
      bLab: "Group B · 2014–25 Hybrid Poles",
      metric: "Share of pole positions converted to victory",
      h0: "Pole position converts to victory at equal rates across both eras.",
      fmt: (v: number) => (v * 100).toFixed(1) + "%",
      ref: "Notebook: Two-proportion z-test p = 0.35, Cohen's h = 0.08 (statistically indistinguishable).",
      span: 0.16,
    },
  }), []);

  const exp = experiments[activeExpKey];

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const meanA = useMemo(() => mean(exp.a), [exp.a]);
  const meanB = useMemo(() => mean(exp.b), [exp.b]);
  const obsDiff = useMemo(() => meanB - meanA, [meanA, meanB]);

  // Empirical p-value
  const extremeCount = useMemo(() => {
    if (shuffles.length === 0) return 0;
    return shuffles.filter((d) => Math.abs(d) >= Math.abs(obsDiff) - 1e-12).length;
  }, [shuffles, obsDiff]);

  const pVal = shuffles.length > 0 ? extremeCount / shuffles.length : null;

  // Run 4,000 shuffles using non-blocking batches
  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setShuffles([]);
    setProgress(0);

    const pool = exp.a.concat(exp.b);
    const nA = exp.a.length;
    const nTotal = pool.length;
    const nB = nTotal - nA;
    const TOTAL = 4000;
    const BATCH = 200;

    const diffs: number[] = [];

    const step = () => {
      for (let k = 0; k < BATCH && diffs.length < TOTAL; k++) {
        // Fisher-Yates partial shuffle
        for (let i = nTotal - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = pool[i];
          pool[i] = pool[j];
          pool[j] = t;
        }
        let sA = 0;
        let sB = 0;
        for (let i = 0; i < nTotal; i++) {
          if (i < nA) sA += pool[i];
          else sB += pool[i];
        }
        diffs.push(sB / nB - sA / nA);
      }

      setShuffles([...diffs]);
      setProgress(Math.round((diffs.length / TOTAL) * 100));

      if (diffs.length < TOTAL) {
        requestAnimationFrame(step);
      } else {
        setIsRunning(false);
      }
    };

    requestAnimationFrame(step);
  };

  // Histogram bins calculation
  const histBins = useMemo(() => {
    if (shuffles.length === 0) return [];
    const span = exp.span;
    const binCount = 36;
    const min = -span;
    const max = span;
    const step = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      x0: min + i * step,
      x1: min + (i + 1) * step,
      count: 0,
    }));

    for (const d of shuffles) {
      const idx = Math.min(binCount - 1, Math.max(0, Math.floor((d - min) / step)));
      bins[idx].count++;
    }

    const maxCount = Math.max(1, ...bins.map((b) => b.count));
    return bins.map((b) => ({
      ...b,
      heightPct: (b.count / maxCount) * 100,
      isExtreme: Math.abs((b.x0 + b.x1) / 2) >= Math.abs(obsDiff),
    }));
  }, [shuffles, exp.span, obsDiff]);

  return (
    <section id="lab" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <Activity className="h-3.5 w-3.5" />
            RESAMPLING STATISTICS · PERMUTATION INFERENCE
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            A/B Permutation <span className="text-[#ff2c2c]">Test Lab</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            If the treatment had zero effect, group assignments are arbitrary. By shuffling the empirical observations 4,000 times,
            we generate the exact empirical null distribution without parametric normality assumptions.
          </p>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["order", "pole"] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                if (isRunning) return;
                setActiveExpKey(key);
                setShuffles([]);
                setProgress(0);
              }}
              className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition ${
                activeExpKey === key
                  ? "bg-[#ff2c2c] text-white shadow-lg shadow-[#ff2c2c]/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {experiments[key].name}
            </button>
          ))}
        </div>

        {/* 2-Column Lab Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Experimental Hypothesis & Empirical Samples */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#161616] p-5 sm:p-6 shadow-xl">
            <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/50 block mb-2">
              Hypothesis Formulation (H0)
            </span>
            <p className="text-sm font-semibold text-white mb-4 bg-black/40 p-3 rounded-lg border border-white/5">
              {exp.h0}
            </p>

            <div className="space-y-4 font-mono-f1 text-xs border-t border-white/5 pt-4">
              <div>
                <div className="flex justify-between text-white/60 mb-1">
                  <span>{exp.aLab}</span>
                  <span className="text-white/90 font-bold">μ_A = {exp.fmt(meanA)} (n = {exp.a.length})</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 rounded-full" style={{ width: activeExpKey === "pole" ? `${meanA * 100}%` : `${(meanA / 5.5) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-white/60 mb-1">
                  <span>{exp.bLab}</span>
                  <span className="text-[#ff2c2c] font-bold">μ_B = {exp.fmt(meanB)} (n = {exp.b.length})</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff2c2c] rounded-full" style={{ width: activeExpKey === "pole" ? `${meanB * 100}%` : `${(meanB / 5.5) * 100}%` }} />
                </div>
              </div>

              <div className="rounded-lg bg-black/40 p-3 border border-white/5 space-y-1">
                <div className="flex justify-between text-white/60">
                  <span>Observed Test Statistic (B − A):</span>
                  <span className="text-[#ff2c2c] font-bold">
                    {obsDiff > 0 ? "+" : ""}{activeExpKey === "pole" ? `${(obsDiff * 100).toFixed(1)} pp` : obsDiff.toFixed(3)}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 pt-1 border-t border-white/5">
                  {exp.ref}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Resampling Monte Carlo Engine */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#161616] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
              <div>
                <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/50 block">
                  Permutation Empirical P-Value
                </span>
                <div className="font-mono-f1 text-4xl sm:text-5xl font-black text-white">
                  {pVal === null ? (
                    <span className="text-white/30">–</span>
                  ) : pVal < 0.001 ? (
                    <span className="text-[#ff2c2c]">&lt; 0.001</span>
                  ) : (
                    <span className={pVal < 0.05 ? "text-[#ff2c2c]" : "text-white"}>
                      {pVal.toFixed(3)}
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono-f1 mt-1">
                  {pVal === null ? (
                    <span className="text-white/50">Run shuffles to compute exact p-value</span>
                  ) : pVal < 0.05 ? (
                    <span className="text-[#ff2c2c] font-bold">p &lt; 0.05 · Reject H0: Difference unlikely due to random chance</span>
                  ) : (
                    <span className="text-white/70 font-bold">p ≥ 0.05 · Fail to reject H0: Consistent with chance sampling</span>
                  )}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg transition ${
                    isRunning
                      ? "bg-white/20 cursor-not-allowed"
                      : "bg-[#ff2c2c] hover:bg-[#ff4545] shadow-[#ff2c2c]/30 hover:scale-[1.02]"
                  }`}
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  {isRunning ? `Shuffling (${progress}%)` : "Run 4,000 Shuffles"}
                </button>
                <span className="font-mono-f1 text-xs text-white/50">
                  {shuffles.length.toLocaleString()} shuffles · {extremeCount} as extreme
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-[#ff2c2c] transition-all duration-75 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Custom SVG/Bar Histogram of Reshuffled Diff Distribution */}
            <div className="relative">
              <div className="flex items-center justify-between text-xs font-mono-f1 text-white/40 mb-2">
                <span>Distribution of Shuffled Differences under H0</span>
                <span>Observed Diff marked in Crimson</span>
              </div>

              <div className="h-44 w-full flex items-end gap-[2px] bg-black/40 rounded-xl p-3 border border-white/5 relative overflow-hidden">
                {/* Center 0 line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20 z-0" />

                {histBins.map((bin, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-100 ${
                      bin.isExtreme ? "bg-[#ff2c2c]" : "bg-white/25"
                    }`}
                    style={{ height: `${Math.max(2, bin.heightPct)}%` }}
                    title={`Bin [${bin.x0.toFixed(2)}, ${bin.x1.toFixed(2)}]: ${bin.count} shuffles`}
                  />
                ))}

                {/* Empty State placeholder */}
                {shuffles.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40 font-mono-f1 text-xs">
                    Press "Run 4,000 Shuffles" to simulate empirical null distribution
                  </div>
                )}
              </div>

              <div className="flex justify-between text-[10px] font-mono-f1 text-white/40 mt-1.5">
                <span>−{activeExpKey === "pole" ? "16%" : "0.6"}</span>
                <span>0.0 (Null Hypothesis)</span>
                <span>+{activeExpKey === "pole" ? "16%" : "0.6"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
