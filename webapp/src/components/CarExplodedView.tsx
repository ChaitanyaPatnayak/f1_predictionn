import { useState, useMemo } from "react";
import { Cpu, Zap, Activity, Shield, Wind, Disc, Layers, Eye, Gauge, Compass } from "lucide-react";
import { audioEngine } from "@/utils/audioEngine";

interface PartDetail {
  id: string;
  name: string;
  system: string;
  fodsWeight: string;
  betaImpact: string;
  statCorrelation: string;
  specs: { label: string; value: string }[];
  description: string;
  coordinates: { x: number; y: number }; // Percentage position on the schematic
  icon: typeof Cpu;
}

const CAR_COMPONENTS: PartDetail[] = [
  {
    id: "power_unit",
    name: "1.6L Turbo-Hybrid V6 (PU) + MGU-K / MGU-H",
    system: "Kinetic & Thermal Propulsion",
    fodsWeight: "34.1% of Model Beta",
    betaImpact: "β_form = +0.409",
    statCorrelation: "Direct determinant of straight-line recovery potential and qualifying delta",
    specs: [
      { label: "Peak Power Output", value: "1,035+ BHP (772 kW)" },
      { label: "Max ICE RPM", value: "15,000 RPM (FIA fuel-flow limited)" },
      { label: "Thermal Efficiency", value: ">52.4% (Highest ICE on Earth)" },
      { label: "Energy Recovery", value: "120 kW (160 BHP) via MGU-K" },
    ],
    description:
      "The hybrid power unit explains the massive constructor eras analyzed in our study (Mercedes 2014–2020: 74% win share; Red Bull RBPT 2022–2023: 86% win share). Without competitive thermal efficiency and deployment curves, grid recovery drops by an average of 4.2 places.",
    coordinates: { x: 54, y: 48 },
    icon: Zap,
  },
  {
    id: "venturi_floor",
    name: "Ground-Effect Venturi Tunnels & Diffuser",
    system: "Underbody Aerodynamics",
    fodsWeight: "60% of Total Downforce",
    betaImpact: "t(174) = 2.30, p = 0.023",
    statCorrelation: "Core mechanism driving 2022 regulation order change (+13% reshuffle)",
    specs: [
      { label: "Downforce Generation", value: "~1,800 kg at 250 km/h" },
      { label: "Suction Pressure Peak", value: "-14.2 kPa under sidepod throat" },
      { label: "Diffuser Expansion Angle", value: "11.5° progressive" },
      { label: "Ride Height Sensitivity", value: "<1 mm variation shifts COP" },
    ],
    description:
      "Reintroduced in 2022 to replace over-body vortex downforce. Our permutation tests prove ground-effect tunnels increased mean order reshuffle from 2.26 to 2.55 places per race by dramatically cutting turbulent dirty air wake in following distances.",
    coordinates: { x: 50, y: 70 },
    icon: Wind,
  },
  {
    id: "carbon_monocoque",
    name: "Carbon-Fiber Monocoque & Titanium Halo",
    system: "Safety Cell & Structural Rigidity",
    fodsWeight: "Driver Safety Attenuation",
    betaImpact: "Crash DNF = -76% vs 1970s",
    statCorrelation: "Enables finish rate surge from 45.4% (1950) to 88.7% (2024)",
    specs: [
      { label: "Halo Static Load", value: "120 kN (Weight of 2 London buses)" },
      { label: "Chassis Tensile Strength", value: "Carbon-composite honeycomb" },
      { label: "Min Vehicle Weight", value: "798 kg (with driver)" },
      { label: "Frontal Crash Decel", value: "Survives 54G peak impact" },
    ],
    description:
      "The survival cell isolates the driver from chassis torsional twist. Reliability and safety evolution documented in our Time Machine reveals that mechanical and fatal retirements fell from 55% in the Pioneer era to under 11% today.",
    coordinates: { x: 42, y: 38 },
    icon: Shield,
  },
  {
    id: "wings_drs",
    name: "Front Cascade & Rear Wing with DRS Actuator",
    system: "Aerodynamic Trimming & Overtaking",
    fodsWeight: "Lap Delta Modulator",
    betaImpact: "+20 km/h Delta on Straights",
    statCorrelation: "Explains high pole conversion in Monaco (46.5%) vs low in Monza (34.7%)",
    specs: [
      { label: "DRS Flap Opening", value: "85 mm hydraulic flap lift" },
      { label: "Drag Reduction", value: "~22% total drag shed" },
      { label: "Front Wing Elements", value: "4-element FIA regulated cascade" },
      { label: "Y250 Vortex Energy", value: "Seals underfloor lateral edge" },
    ],
    description:
      "Front wing endplates direct outwash around front wheels, while the DRS slot reduces boundary separation on straights. Low-drag efficiency explains why tracks with long DRS zones (Spa, Monza) show 38% more positional changes than downforce-dominated street tracks.",
    coordinates: { x: 82, y: 30 },
    icon: Layers,
  },
  {
    id: "carbon_brakes",
    name: "Carbon-Carbon Discs & Inerter Suspension",
    system: "Deceleration & Mechanical Grip",
    fodsWeight: "5.5G Peak Braking",
    betaImpact: "Street Circuit Chi-Square χ²=18.3",
    statCorrelation: "Drives street circuit crash surge (10.2% DNF vs 7.2% permanent)",
    specs: [
      { label: "Operating Window", value: "400°C – 1,150°C glowing carbon" },
      { label: "Braking Distance (300-0)", value: "62 meters in 2.1 seconds" },
      { label: "Deceleration Force", value: "Up to 5.8G lateral & longitudinal" },
      { label: "Cooling Hole Count", value: "Over 1,400 drilled radial holes" },
    ],
    description:
      "Carbon brake rotors convert immense kinetic energy into incandescent heat within milliseconds. Overheating and lockups on bumpy street venues (Baku, Monaco, Singapore) drive the 41.7% relative crash surge verified in our hypothesis test.",
    coordinates: { x: 22, y: 58 },
    icon: Disc,
  },
  {
    id: "telemetry_sensors",
    name: "ECU Hub & 300+ Trackside Telemetry Sensors",
    system: "Data Acquisition & Pit Wall Telemetry",
    fodsWeight: "2.5 GB / Lap Transmitted",
    betaImpact: "Strategy Optimization Delta",
    statCorrelation: "Underpins race simulation algorithms and live OLS predictive modeling",
    specs: [
      { label: "Sampling Rate", value: "Up to 1,000 Hz per channel" },
      { label: "Active Sensor Count", value: "300+ strain, temp, optical & pressure" },
      { label: "Telemetry Bandwidth", value: "Encrypted wireless CAN-bus link" },
      { label: "Tyre Surface Optical", value: "Infrared 16-zone carcass mapping" },
    ],
    description:
      "The sensor network streams real-time G-forces, suspension travel, fuel mass flow, and tyre degradation directly to the pit wall engineer screens. This telemetry forms the exact mathematical foundation of our case study database.",
    coordinates: { x: 62, y: 26 },
    icon: Activity,
  },
];

export function CarExplodedView() {
  const [explosionLevel, setExplosionLevel] = useState<number>(45); // 0 = assembled, 100 = fully exploded
  const [activePartId, setActivePartId] = useState<string>("power_unit");
  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);

  const activePart = useMemo(() => {
    return CAR_COMPONENTS.find((c) => c.id === activePartId) || CAR_COMPONENTS[0];
  }, [activePartId]);

  const selectPart = (id: string) => {
    audioEngine.playRadioBeep();
    setActivePartId(id);
  };

  const handleSliderChange = (val: number) => {
    setExplosionLevel(val);
  };

  return (
    <section id="dissection" className="relative overflow-hidden border-b border-white/10 bg-[#06070a] py-20">
      {/* High-tech grid background & laser lines */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(225,6,0,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute inset-0 z-0 carbon-grid opacity-20" />

      {/* Cybernetic telemetry lines */}
      <div className="pointer-events-none absolute left-0 right-0 top-12 h-[1px] bg-gradient-to-r from-transparent via-[#e10600]/40 to-transparent" />
      <div className="pointer-events-none absolute left-0 right-0 bottom-12 h-[1px] bg-gradient-to-r from-transparent via-[#39d98a]/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e10600]/40 bg-[#e10600]/10 px-3.5 py-1 font-mono-f1 text-xs text-[#ff433d] mb-3">
              <Cpu className="h-3.5 w-3.5" />
              VEHICLE ANATOMY DISSECTION · THE 60.39% VARIANCE MACHINE
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              Car Dissection & <span className="text-[#e10600]">Exploded Blueprint</span>
            </h2>
            <p className="mt-3 text-base text-white/70 leading-relaxed">
              Why does the car account for <strong>13.6×</strong> more variance than the driver?
              Deconstruct the Formula 1 machine: explode the aerodynamic fairings to inspect the turbo-hybrid power unit,
              ground-effect Venturi channels, and telemetry sensor array.
            </p>
          </div>

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                audioEngine.playRadioBeep();
                setIsXRayMode(!isXRayMode);
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition ${
                isXRayMode
                  ? "bg-[#39d98a] text-black shadow-lg shadow-[#39d98a]/30"
                  : "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              <Eye className="h-4 w-4" />
              {isXRayMode ? "X-Ray Telemetry: ON" : "Toggle X-Ray Wireframe"}
            </button>

            <button
              onClick={() => {
                audioEngine.playThrottleBurst(13500);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#e10600] px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#e10600]/30 transition hover:bg-[#ff201a]"
            >
              <Gauge className="h-4 w-4" />
              Dyno Throttle Spool (13,500 RPM)
            </button>
          </div>
        </div>

        {/* Explosion Scrub Slider & Presets */}
        <div className="mb-10 rounded-2xl border border-white/15 bg-[#111318]/90 p-5 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e10600]/20 font-mono-f1 text-base font-bold text-[#ff433d] border border-[#e10600]/30 shadow-lg shadow-[#e10600]/20">
                {explosionLevel}%
              </span>
              <div>
                <span className="font-display text-base font-bold text-white block">
                  Interactive Vehicle Explosion & Sub-Assembly Split
                </span>
                <span className="font-mono-f1 text-xs text-white/50">
                  {explosionLevel < 20
                    ? "Race Ready Configuration (Fully Assembled Carbon Fairings)"
                    : explosionLevel < 55
                    ? "Sub-Assembly Separation (Aero Skin Peeling, Cockpit & Floor Revealed)"
                    : explosionLevel < 85
                    ? "Powertrain & Venturi Tunnels Separated (V6 ICE, MGU-K & Monocoque Exposed)"
                    : "Full Factory CAD Technical Dissection (Exploded Mechanical Core & CAN-Bus Electronics)"}
                </span>
              </div>
            </div>

            {/* Presets & Slider */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Presets */}
              <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
                {[
                  { label: "0% Assembled", val: 0 },
                  { label: "35% Aero", val: 35 },
                  { label: "70% Power", val: 70 },
                  { label: "100% Split", val: 100 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    onClick={() => {
                      audioEngine.playRadioBeep();
                      setExplosionLevel(preset.val);
                    }}
                    className={`rounded-lg px-2.5 py-1 font-mono-f1 text-[11px] font-bold transition ${
                      explosionLevel === preset.val
                        ? "bg-[#e10600] text-white shadow"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div className="w-full sm:w-64 flex items-center gap-3">
                <span className="font-mono-f1 text-xs text-white/40">0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={explosionLevel}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="w-full accent-[#e10600] h-2.5 bg-white/10 rounded-lg cursor-pointer"
                />
                <span className="font-mono-f1 text-xs text-[#e10600] font-bold">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Stage: The Schematic Dissection Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left/Center: Visual Exploded Canvas & Interactive Hotspot Matrix (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-gradient-to-b from-[#111318] to-[#090a0d] p-6 shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col justify-between">
            {/* Top schematic HUD labels */}
            <div className="flex items-center justify-between font-mono-f1 text-xs text-white/50 border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-white/80">
                <Compass className="h-3.5 w-3.5 text-[#39d98a]" />
                SCUDERIA SF-24 CAD ANATOMY // 1:1 RATIO
              </span>
              <span className="text-[#ffd23f]">DRY WEIGHT: 798 KG</span>
            </div>

            {/* Central Visual Stage: Layered Exploded Visualization */}
            <div className="relative my-6 h-80 sm:h-96 w-full flex items-center justify-center">
              {/* Dynamic SVG Blueprint with Layers Shifting by explosionLevel */}
              <svg
                viewBox="0 0 820 420"
                className={`w-full h-full transition-all duration-300 select-none ${isXRayMode ? "filter hue-rotate-90 invert-[0.1]" : ""}`}
              >
                <defs>
                  <linearGradient id="carbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e222b" />
                    <stop offset="50%" stopColor="#12141a" />
                    <stop offset="100%" stopColor="#08090d" />
                  </linearGradient>
                  <linearGradient id="redAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#b30500" />
                    <stop offset="50%" stopColor="#e10600" />
                    <stop offset="100%" stopColor="#ff433d" />
                  </linearGradient>
                  <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1a1e28" />
                    <stop offset="100%" stopColor="#090b0e" />
                  </linearGradient>
                  <linearGradient id="brakeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff8a00" />
                    <stop offset="60%" stopColor="#e10600" />
                    <stop offset="100%" stopColor="#550000" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Circuit Grid Backdrop */}
                <g opacity="0.12">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 50} x2="820" y2={i * 50} stroke="#fff" strokeWidth="0.5" strokeDasharray="3 3" />
                  ))}
                  {Array.from({ length: 17 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="420" stroke="#fff" strokeWidth="0.5" strokeDasharray="3 3" />
                  ))}
                </g>

                {/* AERODYNAMIC CFD STREAMLINES (Background Airflow) */}
                <g opacity={explosionLevel < 40 ? 0.35 : 0.15}>
                  <path d="M 40 230 Q 150 210, 320 180 T 640 140 T 780 130" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 40 245 Q 180 230, 420 220 T 780 180" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 40 260 Q 220 280, 520 285 T 780 260" fill="none" stroke="#39d98a" strokeWidth="1.5" strokeDasharray="6 4" />
                </g>

                {/* LAYER 1: Underbody Floor & Venturi Tunnels (Translates Downward) */}
                <g
                  onClick={() => selectPart("venturi_floor")}
                  className="cursor-pointer transition-transform duration-300"
                  style={{
                    transform: `translateY(${explosionLevel * 0.95}px)`,
                  }}
                  opacity={activePartId === "venturi_floor" ? 1 : 0.75}
                >
                  {/* Underfloor plate */}
                  <path
                    d="M 150 270 L 630 270 L 690 305 L 130 305 Z"
                    fill="url(#floorGrad)"
                    stroke={activePartId === "venturi_floor" ? "#39d98a" : "#2a2f3d"}
                    strokeWidth={activePartId === "venturi_floor" ? "2.5" : "1.5"}
                    filter={activePartId === "venturi_floor" ? "url(#glow)" : undefined}
                  />
                  {/* Venturi vertical fences/strakes */}
                  <line x1="220" y1="270" x2="220" y2="305" stroke="#39d98a" strokeWidth="2" strokeDasharray="3 2" />
                  <line x1="290" y1="270" x2="290" y2="305" stroke="#39d98a" strokeWidth="2" strokeDasharray="3 2" />
                  <line x1="490" y1="270" x2="490" y2="305" stroke="#39d98a" strokeWidth="2" strokeDasharray="3 2" />
                  <line x1="560" y1="270" x2="560" y2="305" stroke="#39d98a" strokeWidth="2" strokeDasharray="3 2" />

                  {/* Diffuser kick-up ramp */}
                  <path d="M 580 270 L 690 245 L 690 305 Z" fill="#131722" stroke="#39d98a" strokeWidth="1.5" />
                  <text x="340" y="293" fill="#39d98a" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    VENTURI GROUND EFFECT [-14.2 kPa]
                  </text>
                  {activePartId === "venturi_floor" && (
                    <circle cx="390" cy="288" r="18" fill="#39d98a" opacity="0.2" className="animate-ping" />
                  )}
                </g>

                {/* LAYER 2: Chassis Monocoque & Internal Power Unit (Center Hub) */}
                <g>
                  {/* Monocoque core structure */}
                  <g
                    onClick={() => selectPart("carbon_monocoque")}
                    className="cursor-pointer"
                    opacity={activePartId === "carbon_monocoque" ? 1 : 0.85}
                  >
                    <path
                      d="M 210 210 L 330 170 L 520 170 L 600 200 L 570 255 L 230 255 Z"
                      fill="url(#carbonGrad)"
                      stroke={activePartId === "carbon_monocoque" ? "#ffd23f" : "#e10600"}
                      strokeWidth={activePartId === "carbon_monocoque" ? "3" : "2"}
                      filter={activePartId === "carbon_monocoque" ? "url(#laserGlow)" : undefined}
                    />
                    {/* Cockpit opening */}
                    <ellipse cx="370" cy="185" rx="35" ry="14" fill="#08090c" stroke="#fff" strokeWidth="1.5" />
                    {/* Titanium Halo Ring */}
                    <path
                      d="M 335 175 C 335 125, 415 125, 415 175"
                      fill="none"
                      stroke={activePartId === "carbon_monocoque" ? "#ffd23f" : "#ffffff"}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      filter="url(#glow)"
                    />
                    <line x1="375" y1="125" x2="375" y2="175" stroke="#fff" strokeWidth="3" />
                    <text x="345" y="115" fill="#ffd23f" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      TITANIUM HALO [120 kN]
                    </text>
                  </g>

                  {/* V6 Turbo Hybrid Engine Block (Centered behind driver) */}
                  <g
                    onClick={() => selectPart("power_unit")}
                    className="cursor-pointer"
                    opacity={activePartId === "power_unit" ? 1 : 0.85}
                  >
                    <rect
                      x="425"
                      y="180"
                      width="125"
                      height="65"
                      rx="8"
                      fill={activePartId === "power_unit" ? "#e10600" : "#1a1f2b"}
                      stroke="#ff433d"
                      strokeWidth={activePartId === "power_unit" ? "3" : "1.5"}
                      filter={activePartId === "power_unit" ? "url(#laserGlow)" : undefined}
                    />
                    {/* Engine cylinders V-bank indication */}
                    <line x1="445" y1="190" x2="445" y2="235" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="475" y1="190" x2="475" y2="235" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="505" y1="190" x2="505" y2="235" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
                    <text x="445" y="212" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      1.6L V6 TURBO
                    </text>
                    <text x="448" y="228" fill="#ffd23f" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      1,035 BHP · MGU-K
                    </text>
                  </g>
                </g>

                {/* LAYER 3: Outer Aero Fairings (Translates Upward) */}
                <g
                  style={{
                    transform: `translateY(-${explosionLevel * 0.9}px)`,
                  }}
                  className="transition-transform duration-300"
                >
                  {/* Engine Cover & Shark Fin */}
                  <g onClick={() => selectPart("wings_drs")} className="cursor-pointer">
                    <path
                      d="M 420 170 L 590 100 L 610 200 Z"
                      fill="url(#redAccent)"
                      opacity="0.9"
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                    <text x="480" y="145" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      SHARK FIN
                    </text>
                  </g>

                  {/* Front Wing Cascade */}
                  <g
                    onClick={() => selectPart("wings_drs")}
                    className="cursor-pointer"
                    opacity={activePartId === "wings_drs" ? 1 : 0.85}
                  >
                    <path
                      d="M 70 230 L 170 230 L 160 265 L 60 265 Z"
                      fill="#141720"
                      stroke={activePartId === "wings_drs" ? "#39d98a" : "#ff433d"}
                      strokeWidth="2.5"
                    />
                    <line x1="75" y1="242" x2="165" y2="242" stroke="#ff433d" strokeWidth="1.5" />
                    <line x1="70" y1="252" x2="160" y2="252" stroke="#ff433d" strokeWidth="1.5" />
                    <text x="65" y="220" fill="#ff433d" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      FRONT WING CASCADE
                    </text>
                  </g>

                  {/* Rear Wing & DRS Actuator */}
                  <g
                    onClick={() => selectPart("wings_drs")}
                    className="cursor-pointer"
                    opacity={activePartId === "wings_drs" ? 1 : 0.85}
                  >
                    <rect
                      x="640"
                      y="120"
                      width="80"
                      height="40"
                      rx="4"
                      fill="#141720"
                      stroke={activePartId === "wings_drs" ? "#39d98a" : "#ff433d"}
                      strokeWidth="2.5"
                    />
                    <line x1="640" y1="138" x2="720" y2="138" stroke="#39d98a" strokeWidth="2.5" />
                    <text x="645" y="112" fill="#39d98a" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      DRS ACTUATOR
                    </text>
                  </g>
                </g>

                {/* Wheels & Brakes (Translate Outwards Left & Right) */}
                {/* Front Wheel */}
                <g
                  onClick={() => selectPart("carbon_brakes")}
                  className="cursor-pointer transition-transform duration-300"
                  style={{
                    transform: `translateX(-${explosionLevel * 0.45}px)`,
                  }}
                  opacity={activePartId === "carbon_brakes" ? 1 : 0.85}
                >
                  <rect x="145" y="185" width="48" height="95" rx="12" fill="#0b0c10" stroke="#e10600" strokeWidth="2.5" />
                  <circle
                    cx="169"
                    cy="232"
                    r="16"
                    fill={activePartId === "carbon_brakes" ? "url(#brakeGlow)" : "#ffd23f"}
                    filter={activePartId === "carbon_brakes" ? "url(#glow)" : undefined}
                  />
                  <circle cx="169" cy="232" r="6" fill="#000" />
                  <text x="130" y="295" fill="#fff" fontSize="10" fontFamily="monospace">
                    PIRELLI C3 (18")
                  </text>
                </g>

                {/* Rear Wheel */}
                <g
                  onClick={() => selectPart("carbon_brakes")}
                  className="cursor-pointer transition-transform duration-300"
                  style={{
                    transform: `translateX(${explosionLevel * 0.45}px)`,
                  }}
                  opacity={activePartId === "carbon_brakes" ? 1 : 0.85}
                >
                  <rect x="585" y="185" width="58" height="100" rx="12" fill="#0b0c10" stroke="#e10600" strokeWidth="2.5" />
                  <circle
                    cx="614"
                    cy="235"
                    r="18"
                    fill={activePartId === "carbon_brakes" ? "url(#brakeGlow)" : "#ffd23f"}
                    filter={activePartId === "carbon_brakes" ? "url(#glow)" : undefined}
                  />
                  <circle cx="614" cy="235" r="7" fill="#000" />
                  <text x="580" y="300" fill="#ff8a00" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    CARBON ROTOR (1,050°C)
                  </text>
                </g>

                {/* Telemetry Sensor Matrix Pulsing Nodes */}
                <g onClick={() => selectPart("telemetry_sensors")} className="cursor-pointer">
                  <circle cx="490" cy="160" r="5" fill="#39d98a" className="animate-ping" />
                  <circle cx="490" cy="160" r="4" fill="#39d98a" />
                  <circle cx="210" cy="225" r="5" fill="#39d98a" className="animate-ping" />
                  <circle cx="210" cy="225" r="4" fill="#39d98a" />
                  <circle cx="630" cy="210" r="5" fill="#39d98a" className="animate-ping" />
                  <circle cx="630" cy="210" r="4" fill="#39d98a" />
                  <text x="495" y="155" fill="#39d98a" fontSize="9" fontFamily="monospace">
                    ECU SENSOR HUB
                  </text>
                </g>
              </svg>
            </div>

            {/* Component Quick Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              {CAR_COMPONENTS.map((part) => {
                const isSelected = part.id === activePartId;
                const Icon = part.icon;
                return (
                  <button
                    key={part.id}
                    onClick={() => selectPart(part.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition ${
                      isSelected
                        ? "bg-[#e10600] text-white shadow-lg shadow-[#e10600]/40 scale-105"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{part.system.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Technical Telemetry & Statistical Regression Impact (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-[#111318]/95 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="font-mono-f1 text-[11px] uppercase tracking-wider text-[#39d98a] block">
                    {activePart.system}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-white mt-0.5">
                    {activePart.name}
                  </h3>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                  <activePart.icon className="h-5 w-5 text-[#e10600]" />
                </div>
              </div>

              {/* Data Science / FODS Correlation Pill */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-3.5 mb-5 space-y-1.5">
                <div className="flex items-center justify-between font-mono-f1 text-xs">
                  <span className="text-white/50">Regression Beta Weight:</span>
                  <span className="font-bold text-[#ffd23f]">{activePart.betaImpact}</span>
                </div>
                <div className="flex items-center justify-between font-mono-f1 text-xs">
                  <span className="text-white/50">Variance Attribution:</span>
                  <span className="font-bold text-[#39d98a]">{activePart.fodsWeight}</span>
                </div>
                <p className="font-mono-f1 text-[11px] text-white/70 pt-1 border-t border-white/5">
                  {activePart.statCorrelation}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                {activePart.description}
              </p>

              {/* Technical Specifications Grid */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <span className="font-mono-f1 text-[11px] uppercase tracking-wider text-white/40 block mb-2">
                  Engineering Telemetry Benchmarks
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {activePart.specs.map((spec, i) => (
                    <div key={i} className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                      <span className="text-[10px] font-mono-f1 text-white/40 block">{spec.label}</span>
                      <strong className="text-xs font-mono-f1 text-white block mt-0.5 truncate">
                        {spec.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Insight Footer */}
            <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between font-mono-f1 text-xs text-white/40">
              <span>CAN-Bus Telemetry Channel: CH-08</span>
              <span className="text-[#39d98a]">Telemetry Verified ✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
