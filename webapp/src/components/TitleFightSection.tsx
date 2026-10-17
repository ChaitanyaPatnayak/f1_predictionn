import { useState, useMemo } from "react";
import { F1_DATA } from "@/data/f1Data";
import { Award, Percent } from "lucide-react";

export function TitleFightSection() {
  const [seasonPct, setSeasonPct] = useState<number>(50);

  const T = F1_DATA.title;

  const currentPoint = useMemo(() => {
    return T.find((t) => Math.round(t.f * 100) === seasonPct) || T[4];
  }, [seasonPct, T]);

  // Compute SVG coordinates for the area chart and line
  const chartPoints = useMemo(() => {
    const W = 500;
    const H = 220;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };

    const innerW = W - padding.left - padding.right;
    const innerH = H - padding.top - padding.bottom;

    const getX = (f: number) => padding.left + ((f - 0.1) / (1.0 - 0.1)) * innerW;
    const getY = (rate: number) => H - padding.bottom - rate * innerH;

    // Line path
    const linePath = T.map((t, idx) => `${idx === 0 ? "M" : "L"} ${getX(t.f)} ${getY(t.rate)}`).join(" ");

    // Upper and lower area envelope
    const upper = T.map((t) => `${getX(t.f)} ${getY(t.hi)}`);
    const lower = [...T].reverse().map((t) => `${getX(t.f)} ${getY(t.lo)}`);
    const areaPath = `M ${upper.join(" L ")} L ${lower.join(" L ")} Z`;

    const activeX = getX(currentPoint.f);
    const activeY = getY(currentPoint.rate);

    return { linePath, areaPath, activeX, activeY, getX, getY, W, H, padding };
  }, [T, currentPoint]);

  return (
    <section id="title" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <Percent className="h-3.5 w-3.5" />
            BINOMIAL PROPORTIONS · WILSON SCORE INTERVALS
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Championship <span className="text-[#ff2c2c]">Title Fight</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            How often does the points leader go on to clinch the World Drivers' Championship?
            Slide across season completion rounds (10% to 100%) to observe empirical conversion rates with asymmetric Wilson 95% confidence intervals.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Interactive Slider & Big Readout */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#161616] p-5 sm:p-8 shadow-xl">
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs font-mono-f1 mb-2">
                <label htmlFor="season-round-slider" className="text-white/70 uppercase tracking-wider">Share of Season Completed</label>
                <span className="font-bold text-white text-base">{seasonPct}%</span>
              </div>
              <input
                id="season-round-slider"
                type="range"
                min="10"
                max="100"
                step="10"
                value={seasonPct}
                onChange={(e) => setSeasonPct(parseInt(e.target.value))}
                className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-f1 text-white/40 mt-1">
                <span>Round 2 (10%)</span>
                <span>Mid-Season (50%)</span>
                <span>Finale (100%)</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5">
              <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/50 block mb-1">
                Historical Conversion Probability
              </span>
              <div className="font-mono-f1 text-5xl sm:text-6xl font-black text-[#ff2c2c] leading-tight">
                {(currentPoint.rate * 100).toFixed(0)}%
              </div>
              <div className="mt-2 text-xs font-mono-f1 text-white/70">
                <span>Wilson 95% CI: </span>
                <strong className="text-white">
                  {(currentPoint.lo * 100).toFixed(1)}% – {(currentPoint.hi * 100).toFixed(1)}%
                </strong>
                <span className="block text-white/40 mt-0.5">Empirically validated over 76 seasons</span>
              </div>

              <p className="mt-4 text-xs font-mono-f1 text-white/60 bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                {seasonPct === 100
                  ? "At 100% completion, the championship leader is mathematically crowned World Champion by definition."
                  : `Even at ${seasonPct}% of the season completed, roughly ${Math.round(
                      (1 - currentPoint.rate) * 10
                    )} in 10 championship leaders lose the title in the second half.`}
              </p>
            </div>
          </div>

          {/* Right: SVG Confidence Interval Envelope */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#161616] p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center text-xs font-mono-f1 text-white/60 mb-2">
              <span>Wilson 95% CI Envelope (Crimson Shading)</span>
              <span>Conversion Rate vs Rounds (%)</span>
            </div>

            <div className="w-full overflow-hidden bg-black/40 rounded-xl p-3 border border-white/5">
              <svg viewBox={`0 0 ${chartPoints.W} ${chartPoints.H}`} className="w-full h-auto">
                {/* Horizontal grid lines */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((tick) => {
                  const y = chartPoints.getY(tick);
                  return (
                    <g key={tick}>
                      <line
                        x1={chartPoints.padding.left}
                        x2={chartPoints.W - chartPoints.padding.right}
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={chartPoints.padding.left - 6}
                        y={y + 3}
                        fill="rgba(255,255,255,0.4)"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {(tick * 100).toFixed(0)}%
                      </text>
                    </g>
                  );
                })}

                {/* X axis labels */}
                {T.map((t) => {
                  const x = chartPoints.getX(t.f);
                  return (
                    <text
                      key={t.f}
                      x={x}
                      y={chartPoints.H - 10}
                      fill="rgba(255,255,255,0.4)"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {(t.f * 100).toFixed(0)}%
                    </text>
                  );
                })}

                {/* Shaded Wilson 95% CI Envelope */}
                <path d={chartPoints.areaPath} fill="rgba(255, 44, 44, 0.15)" />

                {/* Conversion Rate Line */}
                <path d={chartPoints.linePath} fill="none" stroke="#ff2c2c" strokeWidth="2.5" />

                {/* Data points */}
                {T.map((t) => (
                  <circle
                    key={t.f}
                    cx={chartPoints.getX(t.f)}
                    cy={chartPoints.getY(t.rate)}
                    r="3.5"
                    fill="#ff2c2c"
                  />
                ))}

                {/* Active Slider Indicator */}
                <line
                  x1={chartPoints.activeX}
                  x2={chartPoints.activeX}
                  y1={chartPoints.padding.top}
                  y2={chartPoints.H - chartPoints.padding.bottom}
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={chartPoints.activeX}
                  cy={chartPoints.activeY}
                  r="6"
                  fill="#ff2c2c"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono-f1 text-white/50">
              <span>Notice narrowing confidence bounds as degrees of freedom exhaust.</span>
              <span className="text-[#ff2c2c]">Wilson CI Method</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
