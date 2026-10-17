import { useState, useMemo } from "react";
import { F1_DATA, type CircuitData } from "@/data/f1Data";
import { MapPin, Search, Compass, Flag, Gauge, ShieldAlert, Award, ChevronRight } from "lucide-react";

export function CircuitsSection() {
  const [filterRegion, setFilterRegion] = useState<"all" | "europe" | "americas" | "asia" | "mideast">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "historic">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitData>(F1_DATA.circuits[0]);

  // Helper to determine region based on lat/lon and country
  const getCircuitRegion = (c: CircuitData): "europe" | "americas" | "asia" | "mideast" => {
    const mideastCountries = ["Bahrain", "UAE", "Saudi Arabia", "Qatar", "Turkey", "Azerbaijan"];
    if (mideastCountries.includes(c.country)) return "mideast";
    if (c.lon < -30) return "americas";
    if (c.lon >= 60 || c.country === "Australia" || c.country === "Japan" || c.country === "China" || c.country === "Malaysia" || c.country === "Singapore" || c.country === "India" || c.country === "South Korea") return "asia";
    return "europe";
  };

  const filteredCircuits = useMemo(() => {
    return F1_DATA.circuits.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "active" && c.last < 2025) return false;
      if (filterStatus === "historic" && c.last >= 2025) return false;

      if (filterRegion !== "all") {
        const region = getCircuitRegion(c);
        if (region !== filterRegion) return false;
      }

      return true;
    });
  }, [filterRegion, filterStatus, searchQuery]);

  const activeCount = F1_DATA.circuits.filter((c) => c.last >= 2025).length;
  const historicCount = F1_DATA.circuits.length - activeCount;

  // Selected circuit classification
  const isSelectedActive = selectedCircuit.last >= 2025;
  const poleRate = selectedCircuit.poleConv !== null ? Math.round(selectedCircuit.poleConv * 100) : null;
  const poleDiffFromBaseline = poleRate !== null ? poleRate - 41 : 0;

  return (
    <section id="circuits" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <MapPin className="h-3.5 w-3.5" />
            GEOSPATIAL INTELLIGENCE · 77 WORLD CHAMPIONSHIP CIRCUITS
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Grand Prix Circuit <span className="text-[#ff2c2c]">Command Console</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            From the high-speed slipstream sanctuary of Monza to the razor-thin armco barriers of Monaco.
            Select any circuit from 76 seasons of World Championship racing to inspect its historical lifespan, race frequency, and empirical qualifying conversion rate.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#161616] p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setFilterRegion("all")}
              className={`rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                filterRegion === "all"
                  ? "bg-[#ff2c2c] text-white shadow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              All ({F1_DATA.circuits.length})
            </button>
            <button
              onClick={() => setFilterRegion("europe")}
              className={`rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                filterRegion === "europe"
                  ? "bg-[#ff2c2c] text-white shadow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Europe
            </button>
            <button
              onClick={() => setFilterRegion("americas")}
              className={`rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                filterRegion === "americas"
                  ? "bg-[#ff2c2c] text-white shadow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Americas
            </button>
            <button
              onClick={() => setFilterRegion("asia")}
              className={`rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                filterRegion === "asia"
                  ? "bg-[#ff2c2c] text-white shadow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Asia & Pacific
            </button>
            <button
              onClick={() => setFilterRegion("mideast")}
              className={`rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                filterRegion === "mideast"
                  ? "bg-[#ff2c2c] text-white shadow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Middle East
            </button>
          </div>

          {/* Status & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setFilterStatus("all")}
                className={`rounded-lg px-3 py-1 font-mono-f1 text-xs transition ${
                  filterStatus === "all" ? "bg-white/15 text-white font-bold" : "text-white/50 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`rounded-lg px-3 py-1 font-mono-f1 text-xs transition ${
                  filterStatus === "active" ? "bg-[#ff2c2c] text-white font-bold" : "text-white/50 hover:text-white"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus("historic")}
                className={`rounded-lg px-3 py-1 font-mono-f1 text-xs transition ${
                  filterStatus === "historic" ? "bg-white/15 text-white font-bold" : "text-white/50 hover:text-white"
                }`}
              >
                Historic ({historicCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search circuit or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161616] pl-9 pr-3 py-2 text-xs font-mono-f1 text-white placeholder-white/40 focus:border-[#ff2c2c] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Master Console Grid: Directory List on Left, Telemetry Stage on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Structured Circuit Directory (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#161616] p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
              <span className="font-mono-f1 text-xs uppercase tracking-wider text-white/60">
                Found {filteredCircuits.length} Circuits
              </span>
              <span className="font-mono-f1 text-[11px] text-white/40">Select track to inspect</span>
            </div>

            <div className="max-h-[580px] overflow-y-auto space-y-2 pr-1">
              {filteredCircuits.map((c) => {
                const isSelected = selectedCircuit.name === c.name;
                const isActive = c.last >= 2025;

                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCircuit(c)}
                    className={`w-full text-left rounded-xl p-3 border transition-all duration-150 flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-[#ff2c2c] bg-black/60 shadow-md shadow-[#ff2c2c]/10"
                        : "border-white/5 bg-black/20 hover:border-white/15 hover:bg-black/40"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white truncate block">
                          {c.name}
                        </span>
                        {isActive && (
                          <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#ff2c2c]" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono-f1 text-white/50 mt-1">
                        <span className="flex items-center gap-1 text-white/70">
                          <MapPin className="h-3 w-3 text-[#ff2c2c]" />
                          {c.country}
                        </span>
                        <span>•</span>
                        <span>{c.races} GPs</span>
                        <span>•</span>
                        <span>{c.first}–{c.last}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono-f1 text-xs font-bold text-white block">
                        {c.poleConv !== null ? `${Math.round(c.poleConv * 100)}%` : "N/A"}
                      </span>
                      <span className="text-[10px] font-mono-f1 text-white/40">Pole Win</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition ${
                        isSelected ? "text-[#ff2c2c] translate-x-0.5" : "text-white/20"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Circuit Telemetry Console (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-xl">
            {/* Header of Selected Circuit */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono-f1 font-bold uppercase tracking-wider ${
                      isSelectedActive
                        ? "bg-[#ff2c2c]/20 text-[#ff2c2c] border border-[#ff2c2c]/40"
                        : "bg-white/10 text-white/60 border border-white/10"
                    }`}
                  >
                    {isSelectedActive ? "Active FIA 2025 Calendar" : "Historic World Championship Track"}
                  </span>
                  <span className="font-mono-f1 text-xs text-white/40">
                    GPS: {selectedCircuit.lat.toFixed(3)}°N, {selectedCircuit.lon.toFixed(3)}°E
                  </span>
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {selectedCircuit.name}
                </h3>
                <p className="font-mono-f1 text-xs text-white/60 mt-1 flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 text-[#ff2c2c]" />
                  Host Nation: <strong className="text-white">{selectedCircuit.country}</strong>
                  <span className="text-white/20">|</span>
                  Operational: <strong className="text-white">{selectedCircuit.first} – {selectedCircuit.last}</strong>
                </p>
              </div>

              {/* Race Count Pill */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center min-w-[90px]">
                <span className="font-mono-f1 text-2xl font-black text-white block">
                  {selectedCircuit.races}
                </span>
                <span className="font-mono-f1 text-[10px] uppercase text-white/50 tracking-wider">
                  Grands Prix
                </span>
              </div>
            </div>

            {/* Stylized Track Vector Telemetry Blueprint */}
            <div className="relative mb-6 rounded-xl border border-white/5 bg-black/50 p-6 overflow-hidden">
              <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono-f1 text-white/40">
                <Compass className="h-3 w-3 text-[#ff2c2c]" />
                TRACK SCHEMATIC & SECTOR TOPOLOGY
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff2c2c] animate-pulse" />
                <span className="font-mono-f1 text-[10px] uppercase text-white/60">SECTOR 1 / 2 / 3</span>
              </div>

              {/* Dynamic Stylized Circuit Graphic */}
              <div className="h-44 sm:h-52 w-full flex items-center justify-center pt-4">
                <svg viewBox="0 0 400 180" className="w-full h-full max-h-48">
                  <defs>
                    <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff2c2c" />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#ff2c2c" />
                    </linearGradient>
                  </defs>

                  {/* Ambient Grid Lines */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line
                      key={i}
                      x1={i * 50}
                      y1="0"
                      x2={i * 50}
                      y2="180"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Stylized Circuit Silhouette based on track coordinates */}
                  <path
                    d={`M 60 140 
                        C 60 100, 90 40, 150 40 
                        L 250 40 
                        C 310 40, 350 70, 350 110 
                        C 350 140, 320 150, 290 130 
                        L 240 100 
                        C 210 80, 180 120, 150 140 
                        Z`}
                    fill="none"
                    stroke="#ff2c2c"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_12px_rgba(255,44,44,0.4)]"
                  />

                  {/* Start/Finish Line */}
                  <line x1="190" y1="32" x2="190" y2="48" stroke="#ffffff" strokeWidth="3" />
                  <text x="190" y="24" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    START / FINISH
                  </text>

                  {/* DRS Zone 1 */}
                  <path
                    d="M 150 40 L 250 40"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="5"
                    strokeDasharray="4 2"
                  />
                  <text x="200" y="55" fill="#f5f5f5" fontSize="7" fontFamily="monospace" textAnchor="middle">
                    DRS DETECTION ZONE
                  </text>

                  {/* Apex telemetry pins */}
                  <circle cx="350" cy="110" r="4" fill="#ff2c2c" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="350" y="125" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="monospace" textAnchor="middle">
                    HAIRPIN APEX
                  </text>

                  <circle cx="60" cy="140" r="4" fill="#ff2c2c" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="60" y="155" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="monospace" textAnchor="middle">
                    MAIN STRAIGHT
                  </text>
                </svg>
              </div>
            </div>

            {/* Circuit Telemetry KPI Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono-f1">
              <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                <span className="text-[10px] text-white/40 uppercase block mb-1">Pole Win Rate</span>
                <span className="text-xl font-black text-[#ff2c2c] block">
                  {poleRate !== null ? `${poleRate}%` : "N/A"}
                </span>
                <span className="text-[10px] text-white/50">
                  {poleDiffFromBaseline >= 0 ? `+${poleDiffFromBaseline}% vs F1 avg` : `${poleDiffFromBaseline}% vs F1 avg`}
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                <span className="text-[10px] text-white/40 uppercase block mb-1">Historic Tenure</span>
                <span className="text-xl font-black text-white block">
                  {selectedCircuit.last - selectedCircuit.first + 1} Yrs
                </span>
                <span className="text-[10px] text-white/50">
                  {selectedCircuit.first} Debut
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                <span className="text-[10px] text-white/40 uppercase block mb-1">Overtaking Delta</span>
                <span className="text-xl font-black text-white block">
                  {poleRate && poleRate > 55 ? "CRITICAL" : poleRate && poleRate < 35 ? "HIGH" : "BALANCED"}
                </span>
                <span className="text-[10px] text-white/50">Quali Dependence</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                <span className="text-[10px] text-white/40 uppercase block mb-1">FIA Circuit Grade</span>
                <span className="text-xl font-black text-[#ff2c2c] block">GRADE 1</span>
                <span className="text-[10px] text-white/50">Full Homologation</span>
              </div>
            </div>

            {/* Academic Paddock Insights Box */}
            <div className="rounded-xl border border-white/5 bg-black/30 p-4 text-xs font-mono-f1 leading-relaxed">
              <div className="flex items-center gap-2 text-white font-bold mb-1">
                <Award className="h-3.5 w-3.5 text-[#ff2c2c]" />
                Statistical Takeaway · {selectedCircuit.name}
              </div>
              <p className="text-white/70">
                {selectedCircuit.name.includes("Monza") &&
                  "Monza's slipstreaming physics and DRS straights lower the pole conversion rate to 34.7%, allowing slipstream towing and Turn 1 out-braking maneuvers."}
                {selectedCircuit.name.includes("Monaco") &&
                  "Monaco exhibits an overwhelming qualifying sensitivity; aerodynamic turbulence and narrow streets make track position near-irreversible once secured on Saturday."}
                {selectedCircuit.name.includes("Silverstone") &&
                  "Silverstone's high-speed Maggotts-Becketts-Chapel complex stresses tyre thermal degradation, rewarding aerodynamic downforce over pure qualifying drag reduction."}
                {selectedCircuit.name.includes("Barcelona") &&
                  "Circuit de Barcelona-Catalunya records one of the highest pole-to-win rates (71.4%) in modern history due to long dirty-air turbulence zones through the final sector."}
                {selectedCircuit.name.includes("Spa") &&
                  "Spa-Francorchamps combines the Kemmel Straight DRS passing zone with micro-climate rainfall variations, generating significant race position volatility."}
                {!selectedCircuit.name.includes("Monza") &&
                  !selectedCircuit.name.includes("Monaco") &&
                  !selectedCircuit.name.includes("Silverstone") &&
                  !selectedCircuit.name.includes("Barcelona") &&
                  !selectedCircuit.name.includes("Spa") &&
                  `Over ${selectedCircuit.races} World Championship editions, this circuit has tested chassis aerodynamic balance with a ${
                    poleRate !== null ? `${poleRate}% pole-to-victory conversion rate` : "distinct technical demand profile"
                  }.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
