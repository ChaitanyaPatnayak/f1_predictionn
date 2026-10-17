import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Activity, Award, BarChart3, Binary, Zap, ArrowDown, Video, Volume2, VolumeX, Sparkles } from "lucide-react";
import { F1_DATA } from "@/data/f1Data";
import { audioEngine } from "@/utils/audioEngine";

export function HeroSection() {
  const [activeView, setActiveView] = useState<"cam1" | "cam2" | "dual">("cam1");
  const [lights, setLights] = useState<boolean[]>([false, false, false, false, false]);
  const [lightsActive, setLightsActive] = useState(false);
  const [lightsOutTime, setLightsOutTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [jumpStart, setJumpStart] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const timerRefs = useRef<number[]>([]);

  const startLightsSequence = () => {
    timerRefs.current.forEach((id) => clearTimeout(id));
    timerRefs.current = [];
    setReactionTime(null);
    setJumpStart(false);
    setLightsOutTime(null);
    setLights([false, false, false, false, false]);
    setLightsActive(true);

    for (let i = 0; i < 5; i++) {
      const id = window.setTimeout(() => {
        setLights((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        audioEngine.playLightBeep(false);
      }, 500 + i * 800);
      timerRefs.current.push(id);
    }

    const randomDelay = 4500 + Math.random() * 1500;
    const lightsOutId = window.setTimeout(() => {
      setLights([false, false, false, false, false]);
      setLightsOutTime(performance.now());
      setLightsActive(false);
      audioEngine.playLightBeep(true);
    }, randomDelay);
    timerRefs.current.push(lightsOutId);
  };

  const handleReactionClick = () => {
    if (lightsActive) {
      setJumpStart(true);
      timerRefs.current.forEach((id) => clearTimeout(id));
      setLightsActive(false);
      setLights([false, false, false, false, false]);
      audioEngine.playRadioBeep();
    } else if (lightsOutTime && reactionTime === null) {
      const delta = Math.round(performance.now() - lightsOutTime);
      setReactionTime(delta);
      audioEngine.playThrottleBurst(13500);
    }
  };

  useEffect(() => {
    startLightsSequence();
    return () => {
      timerRefs.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  const toggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsAudioMuted(muted);
  };

  const kpis = [
    { label: "Grand Prix Races", value: F1_DATA.kpi.races.toLocaleString(), icon: Award, sub: "1950 – 2025 (76 Seasons)" },
    { label: "Driver Entries", value: F1_DATA.kpi.entries.toLocaleString(), icon: Activity, sub: "Full Historical Dataset" },
    { label: "Car Variance", value: "60.4%", icon: Zap, sub: "vs 4.5% Driver (ANOVA)" },
    { label: "OLS Prediction", value: "R² = 0.60", icon: BarChart3, sub: "MAE: 2.50 Finishing Places" },
    { label: "Formal Tests", value: "10 Hypotheses", icon: Binary, sub: "Paddock Beliefs Tested" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[#0a0a0a] pt-12 pb-16">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,44,44,0.12),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Academic Course Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-4 py-1.5 text-xs font-mono-f1 text-[#f5f5f5]/80 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#ff2c2c] animate-pulse" />
            <span className="font-semibold text-white">23CSE351 FOUNDATIONS OF DATA SCIENCE</span>
            <span className="text-white/20">•</span>
            <span className="text-white/60">AMRITA VISHWA VIDYAPEETHAM</span>
          </div>
        </div>

        {/* Hero Title & Synopsis */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="font-display font-black uppercase tracking-tight text-white text-4xl sm:text-6xl lg:text-7xl leading-[0.94] mb-5">
            What Decides <br />
            <span className="text-[#ff2c2c]">A Grand Prix?</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#f5f5f5]/70 font-normal leading-relaxed">
            An empirical investigation into 76 seasons of Formula 1 World Championship racing (1950–2025).
            We deconstruct the <strong>60.39% machinery vs 4.47% driver skill</strong> variance paradox, quantify the monetary value of pole position, and test paddock dogma with strict statistical rigor.
          </p>

          {/* Primary Quick Anchors */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#scrub"
              className="inline-flex items-center gap-2 rounded-lg bg-[#ff2c2c] px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ff2c2c]/20 transition hover:bg-[#ff4545] hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              Explore 3D Ferrari Machinery
            </a>

            <a
              href="#predict"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161616] px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/10 hover:border-white/20"
            >
              <Play className="h-4 w-4 fill-white" />
              Launch Live ML Predictor
            </a>

            <a
              href="#myths"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161616] px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-white/80 transition hover:bg-white/10"
            >
              <ArrowDown className="h-4 w-4" />
              10 Paddock Dogmas
            </a>
          </div>
        </div>

        {/* MAIN VIDEO SHOWCASE: Crisp, High-Definition 16:9 Framerate.tv Feeds */}
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-[#161616] p-4 sm:p-5 shadow-2xl mb-12">
          {/* Stream Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#ff2c2c] animate-ping" />
              <span className="font-mono-f1 text-xs font-bold uppercase tracking-wider text-white">
                LIVE ONBOARD TELEMETRY BRIDGE
              </span>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="font-mono-f1 text-xs text-white/50 hidden sm:inline">
                FOM 1080P 60FPS SYNCHRONIZED FEED
              </span>
            </div>

            {/* Video Feed Tabs */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  setActiveView("cam1");
                  audioEngine.playRadioBeep();
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                  activeView === "cam1"
                    ? "bg-[#ff2c2c] text-white shadow"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                Cam 01 Cockpit
              </button>

              <button
                onClick={() => {
                  setActiveView("cam2");
                  audioEngine.playRadioBeep();
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                  activeView === "cam2"
                    ? "bg-[#ff2c2c] text-white shadow"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                Cam 02 Chassis
              </button>

              <button
                onClick={() => {
                  setActiveView("dual");
                  audioEngine.playRadioBeep();
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-f1 text-xs font-bold uppercase transition ${
                  activeView === "dual"
                    ? "bg-white text-black font-black"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                Dual Feed
              </button>

              <button
                onClick={toggleSound}
                title={isAudioMuted ? "Unmute Engine Audio" : "Mute Audio"}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
              >
                {isAudioMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#ff2c2c]" />}
              </button>
            </div>
          </div>

          {/* Video Frames Container */}
          {activeView === "dual" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Video 1 */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                <div className="bg-[#121212] px-3 py-2 font-mono-f1 text-xs text-white/70 border-b border-white/5 flex items-center justify-between">
                  <span className="font-bold text-[#ff2c2c]">CH-01 // COCKPIT ONBOARD</span>
                  <span className="text-white/40 text-[11px]">Framerate.tv Live</span>
                </div>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                  <video
                    src="/videos/f1-rain.mp4"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", objectFit: "cover" }}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    title="CAM 01 Onboard"
                  />
                </div>
              </div>

              {/* Video 2 */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                <div className="bg-[#121212] px-3 py-2 font-mono-f1 text-xs text-white/70 border-b border-white/5 flex items-center justify-between">
                  <span className="font-bold text-[#ff2c2c]">CH-02 // CHASSIS AERODYNAMICS</span>
                  <span className="text-white/40 text-[11px]">Framerate.tv Live</span>
                </div>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                  <video
                    src="/videos/f1-opener.mp4"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", objectFit: "cover" }}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    title="CAM 02 Chassis"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                <video
                  src={
                    activeView === "cam1"
                      ? "/videos/f1-rain.mp4"
                      : "/videos/f1-opener.mp4"
                  }
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", objectFit: "cover" }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  title={activeView === "cam1" ? "CAM 01 Onboard" : "CAM 02 Chassis"}
                />
              </div>
            </div>
          )}

          {/* Under-Video Telemetry & Starting Lights Tester */}
          <div className="mt-5 rounded-xl border border-white/5 bg-[#121212] p-4">
            <div
              onClick={handleReactionClick}
              className="cursor-pointer transition hover:border-white/20"
              title="Click as soon as the 5 red lights turn off to test your reaction time!"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="font-mono-f1 text-xs">
                    <span className="text-white/40 block">FIA STARTING GANTRY</span>
                    <span className="font-bold text-white block">Test Launch Reaction Reflexes</span>
                  </div>
                </div>

                {/* The 5 Red Lights */}
                <div className="flex items-center gap-3 sm:gap-4 bg-black/60 px-4 py-2 rounded-xl border border-white/10">
                  {lights.map((isOn, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full transition-all duration-75 ${
                          isOn
                            ? "bg-[#ff2c2c] shadow-[0_0_16px_#ff2c2c]"
                            : "bg-[#250808]"
                        }`}
                      />
                      <div
                        className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full transition-all duration-75 ${
                          isOn
                            ? "bg-[#ff2c2c] shadow-[0_0_16px_#ff2c2c]"
                            : "bg-[#250808]"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Reset button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startLightsSequence();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 font-mono-f1 text-xs text-white hover:bg-white/20 transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              {/* Status Banner */}
              <div className="mt-3 pt-2 border-t border-white/5 font-mono-f1 text-xs flex items-center justify-between">
                <div>
                  {lightsActive ? (
                    <span className="text-yellow-400 font-bold">
                      ● Holding at 12,000 RPM... Wait for lights out!
                    </span>
                  ) : jumpStart ? (
                    <span className="text-[#ff2c2c] font-bold">
                      ✕ JUMP START! False start detected · 5-second penalty applied.
                    </span>
                  ) : reactionTime !== null ? (
                    <span className="text-emerald-400 font-bold">
                      ✓ REACTION TIME: {reactionTime} ms {reactionTime < 240 ? "⚡ (F1 DRIVER TIER!)" : ""}
                    </span>
                  ) : lightsOutTime ? (
                    <span className="text-emerald-400 font-bold animate-pulse">
                      ● LIGHTS OUT AND AWAY WE GO! TAP NOW!
                    </span>
                  ) : (
                    <span className="text-white/50">Tap anywhere on this panel when lights go out</span>
                  )}
                </div>
                <div className="text-white/40 hidden sm:block">
                  F1 Benchmark: 200–240 ms
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REFINED STATISTICAL KPI METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-[#161616] p-4 transition hover:border-[#ff2c2c]/40 hover:bg-[#1a1a1a]"
              >
                <div className="flex items-center justify-between text-white/50 mb-1.5">
                  <span className="text-[11px] font-mono-f1 uppercase tracking-wider text-white/60">
                    {kpi.label}
                  </span>
                  <Icon className="h-4 w-4 text-[#ff2c2c]" />
                </div>
                <div className="font-mono-f1 text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-[11px] font-mono-f1 text-white/40 truncate mt-0.5">
                  {kpi.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


