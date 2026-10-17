import { useState, useEffect, useRef, useMemo } from "react";
import { F1_DATA, type SeasonData } from "@/data/f1Data";
import { Play, Pause, FastForward, Clock, History, Award, TrendingUp } from "lucide-react";

export function TimeMachineSection() {
  const [selectedYear, setSelectedYear] = useState<number>(1988);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<number | null>(null);

  const seasonsByYear = useMemo(() => {
    const map = new Map<number, SeasonData>();
    F1_DATA.seasons.forEach((s) => map.set(s.year, s));
    return map;
  }, []);

  const currentSeason = seasonsByYear.get(selectedYear) || F1_DATA.seasons[38];

  const eraOf = (year: number) => {
    if (year < 1980) return "1950–79 Pioneer Era";
    if (year < 2000) return "1980–99 Turbo & Aero Era";
    if (year < 2014) return "2000–13 V10/V8 Golden Era";
    if (year < 2022) return "2014–21 Turbo-Hybrid Era";
    return "2022–25 Ground-Effect Aero Era";
  };

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = window.setInterval(() => {
        setSelectedYear((prev) => {
          if (prev >= 2025) {
            setIsPlaying(false);
            return 1950;
          }
          return prev + 1;
        });
      }, 240);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  const sparkMetrics = [
    {
      key: "eff" as const,
      label: "Effective Winning Teams",
      value: currentSeason.eff.toFixed(1),
      unit: "constructors",
      note: "HHI reciprocal (higher = competitive)",
      color: "#f5f5f5",
      min: 1.0,
      max: 5.5,
    },
    {
      key: "finish" as const,
      label: "Mechanical Reliability",
      value: (currentSeason.finish * 100).toFixed(1) + "%",
      unit: "finish rate",
      note: "Starters classified at checkered flag",
      color: "#ff2c2c",
      min: 0.35,
      max: 0.95,
    },
    {
      key: "pole" as const,
      label: "Pole-to-Win Conversion",
      value: (currentSeason.pole * 100).toFixed(1) + "%",
      unit: "conversion",
      note: "Share of pole positions won",
      color: "#f5f5f5",
      min: 0.1,
      max: 0.8,
    },
    {
      key: "order" as const,
      label: "Order Change Per Race",
      value: currentSeason.order.toFixed(2),
      unit: "places reshuffled",
      note: "Average grid-to-finish position change",
      color: "#ff2c2c",
      min: 0.8,
      max: 3.0,
    },
  ];

  return (
    <section id="time" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <Clock className="h-3.5 w-3.5" />
            76 SEASONS CHRONOLOGY · 1950 – 2025
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Historical <span className="text-[#ff2c2c]">Time Machine</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            Drag through 76 World Championship seasons or press play to watch reliability surge from 45% to 88%,
            constructor dominance peak during 1988 and 2023, and regulation resets reshape overtaking.
          </p>
        </div>

        {/* Big Dashboard Panel */}
        <div className="rounded-2xl border border-white/5 bg-[#161616] p-5 sm:p-8 shadow-xl">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-white/5 pb-6 mb-8">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 rounded-lg bg-[#ff2c2c] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ff2c2c]/30 transition hover:bg-[#ff4545] hover:scale-105 shrink-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
              {isPlaying ? "Pause Timeline" : "Play Timeline"}
            </button>

            <div className="flex-1 w-full flex items-center gap-4">
              <span className="font-mono-f1 text-xs text-white/50 shrink-0">1950</span>
              <input
                id="timeline-slider"
                type="range"
                min="1950"
                max="2025"
                step="1"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full accent-[#ff2c2c] h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <span className="font-mono-f1 text-xs text-white/50 shrink-0">2025</span>
            </div>
          </div>

          {/* Season Focal Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-8">
            <div className="lg:col-span-4 text-center lg:text-left">
              <span className="font-mono-f1 text-7xl sm:text-8xl font-black text-white tracking-tighter leading-none block">
                {currentSeason.year}
              </span>
              <span className="inline-block mt-2 font-mono-f1 text-xs uppercase tracking-widest text-[#ff2c2c] border border-[#ff2c2c]/30 bg-[#ff2c2c]/10 px-3 py-1 rounded-full">
                {eraOf(currentSeason.year)}
              </span>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="font-mono-f1 text-[11px] uppercase tracking-wider text-white/50 block">
                  World Drivers' Champion
                </span>
                <span className="font-display text-lg font-bold text-white mt-1 block">
                  {currentSeason.champion || "–"}
                </span>
                <span className="text-xs text-[#ff2c2c] font-mono-f1">WDC Winner</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="font-mono-f1 text-[11px] uppercase tracking-wider text-white/50 block">
                  Dominant Constructor
                </span>
                <span className="font-display text-lg font-bold text-white mt-1 block truncate">
                  {currentSeason.topTeam}
                </span>
                <span className="text-xs text-white/60 font-mono-f1">
                  {(currentSeason.topShare * 100).toFixed(0)}% season win share
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="font-mono-f1 text-[11px] uppercase tracking-wider text-white/50 block">
                  Grands Prix & Winners
                </span>
                <span className="font-display text-lg font-bold text-white mt-1 block">
                  {currentSeason.races} Races · {currentSeason.winners} Winners
                </span>
                <span className="text-xs text-white/70 font-mono-f1">
                  Top driver: {currentSeason.topDriver}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Sparkline / Metric Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sparkMetrics.map((m, idx) => {
              // Build lightweight SVG path for sparkline across 1950-2025
              const points = F1_DATA.seasons.map((s, i) => {
                const x = (i / (F1_DATA.seasons.length - 1)) * 200;
                const val = s[m.key] as number;
                const norm = Math.max(0, Math.min(1, (val - m.min) / (m.max - m.min)));
                const y = 50 - norm * 42;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              const polylineStr = points.join(" ");

              // Current marker position
              const currentIndex = selectedYear - 1950;
              const currentX = (currentIndex / (F1_DATA.seasons.length - 1)) * 200;
              const curVal = currentSeason[m.key] as number;
              const curNorm = Math.max(0, Math.min(1, (curVal - m.min) / (m.max - m.min)));
              const currentY = 50 - curNorm * 42;

              return (
                <div key={idx} className="rounded-xl border border-white/5 bg-black/40 p-4">
                  <span className="font-mono-f1 text-[11px] uppercase tracking-wider text-white/60 block">
                    {m.label}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono-f1 text-2xl font-bold text-white" style={{ color: m.color }}>
                      {m.value}
                    </span>
                    <span className="text-[11px] font-mono-f1 text-white/40">{m.unit}</span>
                  </div>

                  {/* Sparkline SVG */}
                  <div className="mt-3 relative h-14 w-full">
                    <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                      <polyline
                        fill="none"
                        stroke={m.color}
                        strokeWidth="2"
                        strokeOpacity="0.8"
                        points={polylineStr}
                      />
                      {/* Current year vertical line */}
                      <line
                        x1={currentX}
                        x2={currentX}
                        y1="0"
                        y2="50"
                        stroke="rgba(255,255,255,0.4)"
                        strokeDasharray="2 2"
                      />
                      {/* Current point circle */}
                      <circle cx={currentX} cy={currentY} r="4" fill={m.color} stroke="#fff" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono-f1 text-white/40 block mt-1">
                    {m.note}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
