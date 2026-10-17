import { useState, useMemo } from "react";
import { F1_DATA } from "@/data/f1Data";
import { Gauge, Users, PieChart } from "lucide-react";

const EXP_BANDS = ["0–20", "21–50", "51–100", "101–150", "151–200", "200+"];
const AGE_BANDS = ["≤24", "25–27", "28–30", "31–33", "34–36", "37+"];

const getExpBandIdx = (s: number) => (s <= 20 ? 0 : s <= 50 ? 1 : s <= 100 ? 2 : s <= 150 ? 3 : s <= 200 ? 4 : 5);
const getAgeBandIdx = (a: number) => (a <= 24 ? 0 : a <= 27 ? 1 : a <= 30 ? 2 : a <= 33 ? 3 : a <= 36 ? 4 : 5);

export function CarVsDriverSection() {
  const [age, setAge] = useState<number>(29);
  const [starts, setStarts] = useState<number>(140);

  const V = F1_DATA.variance;

  const ai = getAgeBandIdx(age);
  const ei = getExpBandIdx(starts);

  // Bradley-Terry probability of beating baseline young rookie (age <=24, starts 0-20)
  const prob = useMemo(() => {
    const ageVal = F1_DATA.career.age[AGE_BANDS[ai]] || 0;
    const expVal = F1_DATA.career.exp[EXP_BANDS[ei]] || 0;
    return 1 / (1 + Math.exp(-(ageVal + expVal)));
  }, [ai, ei]);

  const beatPct = Math.round(prob * 100);

  return (
    <section id="driver" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <PieChart className="h-3.5 w-3.5" />
            NESTED ANOVA · BRADLEY–TERRY PAIRED COMPARISON
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Car Machinery <span className="text-[#ff2c2c]">vs Driver Skill</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            How much of a Grand Prix finish comes from the car versus the human in the cockpit?
            By isolating intra-team teammate battles where machinery is held constant, the car cancels out.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: ANOVA Variance Donut */}
          <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#161616] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
              <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/60">
                Finishing Position Variance (2014–2025)
              </span>
              <span className="text-[11px] font-mono-f1 text-[#ff2c2c]">Nested ANOVA</span>
            </div>

            {/* Donut Chart representation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
              <div className="relative h-44 w-44 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  {/* Luck/Strategy (35.2%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="18"
                    strokeDasharray="238.76"
                    strokeDashoffset="0"
                  />
                  {/* Driver (4.5%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f5f5f5"
                    strokeWidth="18"
                    strokeDasharray="238.76"
                    strokeDashoffset={`${238.76 * (1 - V.car - V.driver)}`}
                  />
                  {/* Car (60.4%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#ff2c2c"
                    strokeWidth="18"
                    strokeDasharray="238.76"
                    strokeDashoffset={`${238.76 * (1 - V.car)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono-f1 text-2xl font-black text-[#ff2c2c]">60.4%</span>
                  <span className="font-mono-f1 text-[10px] uppercase text-white/60">Car Impact</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 font-mono-f1 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-[#ff2c2c]" />
                    <span className="text-white/90">Car Machinery</span>
                  </div>
                  <span className="font-bold text-[#ff2c2c]">60.39%</span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-[#f5f5f5]" />
                    <span className="text-white/90">Driver Talent</span>
                  </div>
                  <span className="font-bold text-white">4.45%</span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-white/20" />
                    <span className="text-white/60">Luck & Strategy</span>
                  </div>
                  <span className="font-bold text-white/60">35.16%</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs font-mono-f1 text-white/60 bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
              Statistically, the car explains <strong className="text-white">13.6×</strong> as much variance in finishing position as the driver within that car.
              Because top drivers naturally migrate to dominant constructors, this 60.4% represents an upper bound.
            </p>
          </div>

          {/* Right: Driver Builder & Bradley-Terry Heatmap */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#161616] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
              <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#ff2c2c]" />
                Driver Builder & Career Matrix
              </span>
              <span className="text-[11px] font-mono-f1 text-[#ff2c2c]">Teammate Head-to-Head</span>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <div className="flex justify-between text-xs font-mono-f1 mb-1">
                  <label htmlFor="cb-age" className="text-white/70">Driver Age</label>
                  <span className="font-bold text-white">{age} years</span>
                </div>
                <input
                  id="cb-age"
                  type="range"
                  min="19"
                  max="40"
                  step="1"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-f1 mb-1">
                  <label htmlFor="cb-starts" className="text-white/70">Career Grand Prix Starts</label>
                  <span className="font-bold text-white">{starts} starts</span>
                </div>
                <input
                  id="cb-starts"
                  type="range"
                  min="0"
                  max="320"
                  step="5"
                  value={starts}
                  onChange={(e) => setStarts(parseInt(e.target.value))}
                  className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Live readout banner */}
            <div className="rounded-xl border border-white/10 bg-black/50 p-3 text-center mb-5">
              <span className="text-xs font-mono-f1 text-white/60">
                Against an identically mounted rookie teammate (&le;24 yrs, 0–20 starts):
              </span>
              <div className="font-mono-f1 text-2xl sm:text-3xl font-black text-[#ff2c2c] mt-1">
                {beatPct}% Expected Win Rate
              </div>
            </div>

            {/* 6x6 Heatmap */}
            <div className="overflow-x-auto">
              <span className="text-[11px] font-mono-f1 uppercase tracking-wider text-white/40 block mb-2">
                Career Matrix: Age Bracket (rows) vs Starts (cols)
              </span>
              <div className="min-w-[340px]">
                {/* Header row */}
                <div className="grid grid-cols-7 gap-1 text-[10px] font-mono-f1 text-white/50 text-center pb-1">
                  <span>Age\Starts</span>
                  {EXP_BANDS.map((e) => (
                    <span key={e}>{e}</span>
                  ))}
                </div>

                {/* Heatmap cells */}
                {AGE_BANDS.map((aLabel, rowIdx) => (
                  <div key={aLabel} className="grid grid-cols-7 gap-1 items-center mb-1">
                    <span className="text-[10px] font-mono-f1 text-white/50 text-right pr-2">
                      {aLabel}
                    </span>
                    {EXP_BANDS.map((eLabel, colIdx) => {
                      const aVal = F1_DATA.career.age[aLabel] || 0;
                      const eVal = F1_DATA.career.exp[eLabel] || 0;
                      const p = 1 / (1 + Math.exp(-(aVal + eVal)));
                      const pPct = Math.round(p * 100);
                      const isSelected = rowIdx === ai && colIdx === ei;

                      // Harmonious crimson opacity scale
                      const alpha = Math.max(0.08, Math.min(0.85, (pPct - 25) / 50 * 0.75 + 0.1));
                      const bgColor = `rgba(255, 44, 44, ${alpha})`;

                      return (
                        <div
                          key={eLabel}
                          className={`rounded py-1 text-center font-mono-f1 text-xs font-bold transition ${
                            isSelected ? "ring-2 ring-white scale-105 z-10 font-black text-white shadow-lg" : "text-white/90"
                          }`}
                          style={{ backgroundColor: bgColor }}
                          title={`Age ${aLabel}, ${eLabel} starts: ${pPct}% win probability`}
                        >
                          {pPct}%
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
