import { useState } from "react";
import { Video, Radio, Cpu, Shield, Zap, Maximize2 } from "lucide-react";

export function OnboardTheaterSection() {
  const [activeFeed, setActiveFeed] = useState<"cam1" | "cam2" | "both">("cam1");

  const feeds = [
    {
      id: "cam1" as const,
      label: "CAM 01 · Aerodynamic Flow & Apex Telemetry",
      src: "/videos/f1-rain.mp4",
      channel: "CH-01 // COCKPIT ONBOARD",
    },
    {
      id: "cam2" as const,
      label: "CAM 02 · Pit Wall Tactical Trace & Telemetry",
      src: "/videos/f1-opener.mp4",
      channel: "CH-02 // CHASSIS DYNAMICS",
    },
  ];

  return (
    <section id="theater" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <Radio className="h-3.5 w-3.5 text-[#ff2c2c] animate-pulse" />
            LIVE TELEMETRY FEED · ONBOARD STREAM THEATER
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Pit Wall <span className="text-[#ff2c2c]">Telemetry Theater</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            Real-time video telemetry stream direct from the paddock timing bridge.
            Switch between onboard cockpit feeds and vehicle kinematic overlays.
          </p>
        </div>

        {/* Feed Switcher Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFeed("cam1")}
              className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition ${
                activeFeed === "cam1"
                  ? "bg-[#ff2c2c] text-white shadow-md shadow-[#ff2c2c]/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Cam 01 (Onboard)
            </button>
            <button
              onClick={() => setActiveFeed("cam2")}
              className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition ${
                activeFeed === "cam2"
                  ? "bg-[#ff2c2c] text-white shadow-md shadow-[#ff2c2c]/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Cam 02 (Chassis)
            </button>
            <button
              onClick={() => setActiveFeed("both")}
              className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition ${
                activeFeed === "both"
                  ? "bg-white text-black font-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Dual Split-Screen
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono-f1 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff2c2c] animate-ping" />
              1080p 60FPS SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Video Container(s) */}
        {activeFeed === "both" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feeds.map((f) => (
              <div
                key={f.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              >
                <div className="flex items-center justify-between bg-[#161616] px-4 py-2.5 font-mono-f1 text-xs text-white/70 border-b border-white/5">
                  <span className="font-bold text-[#ff2c2c]">{f.channel}</span>
                  <span className="text-white/40 text-[11px]">Framerate.tv Live</span>
                </div>
                <div className="relative w-full aspect-video overflow-hidden">
                  <video
                    src={f.src}
                    className="absolute top-0 left-0 w-full h-full border-none object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    title={f.label}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl relative">
            {/* Top Video HUD Bar */}
            <div className="flex items-center justify-between bg-[#161616] px-4 py-3 font-mono-f1 text-xs text-white/80 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#ff2c2c] animate-pulse" />
                <span className="font-bold text-white">
                  {activeFeed === "cam1" ? feeds[0].channel : feeds[1].channel}
                </span>
                <span className="text-white/40">|</span>
                <span className="text-white/60">
                  {activeFeed === "cam1" ? feeds[0].label : feeds[1].label}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px] text-white/50">
                <span>BITRATE: 18.4 MBPS</span>
                <span>LATENCY: 42 MS</span>
              </div>
            </div>

            {/* Main Video Frame */}
            <div className="relative w-full aspect-video overflow-hidden bg-black">
              <video
                src={activeFeed === "cam1" ? feeds[0].src : feeds[1].src}
                className="absolute top-0 left-0 w-full h-full border-none object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                title={activeFeed === "cam1" ? feeds[0].label : feeds[1].label}
              />
            </div>

            {/* Bottom Telemetry HUD Ribbon */}
            <div className="bg-[#161616] p-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono-f1 text-xs">
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[10px]">SPEED TRAP</span>
                <span className="text-white font-bold text-sm">334 KM/H</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[10px]">CURRENT GEAR</span>
                <span className="text-white font-bold text-sm">GEAR 7</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[10px]">ENGINE RPM</span>
                <span className="text-[#ff2c2c] font-bold text-sm">11,840 RPM</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[10px]">DRS STATUS</span>
                <span className="text-[#ff2c2c] font-bold text-sm">ENABLED</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[10px]">BRAKE BIAS</span>
                <span className="text-white font-bold text-sm">54.5% F</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[10px]">TYRE COMPOUND</span>
                <span className="text-[#ff2c2c] font-bold text-sm">C3 SOFT</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
