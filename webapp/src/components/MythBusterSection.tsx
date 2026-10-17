import { useState } from "react";
import { PADDOCK_MYTHS } from "@/data/f1Data";
import { CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, FlaskConical } from "lucide-react";

export function MythBusterSection() {
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});

  const allOpen = Object.keys(openCards).length === PADDOCK_MYTHS.length && Object.values(openCards).every(Boolean);

  const toggleCard = (index: number) => {
    setOpenCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAll = () => {
    if (allOpen) {
      setOpenCards({});
    } else {
      const all: Record<number, boolean> = {};
      PADDOCK_MYTHS.forEach((_, i) => {
        all[i] = true;
      });
      setOpenCards(all);
    }
  };

  return (
    <section id="myths" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
              <FlaskConical className="h-3.5 w-3.5" />
              FORMAL HYPOTHESIS TESTING · 10 PADDOCK DOGMAS
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Myth <span className="text-[#ff2c2c]">Buster</span>
            </h2>
            <p className="mt-3 text-base text-white/70 leading-relaxed">
              Every veteran in the paddock has an intuition. We put ten universal beliefs through strict statistical testing:
              Two-sample t-tests, Mann–Whitney U, Pearson Chi-Square, Likelihood Ratio tests, and Wilson score intervals.
            </p>
          </div>

          <button
            onClick={toggleAll}
            className="self-start md:self-end flex items-center gap-2 rounded-lg border border-white/10 bg-[#161616] px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 hover:border-white/20"
          >
            {allOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {allOpen ? "Conceal All Verdicts" : "Reveal All Verdicts"}
          </button>
        </div>

        {/* 10 Myths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PADDOCK_MYTHS.map((myth, idx) => {
            const isOpen = !!openCards[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleCard(idx)}
                className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                  isOpen
                    ? "border-white/20 bg-[#161616] shadow-xl"
                    : "border-white/5 bg-[#161616] hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono-f1 text-xs font-bold text-white/70">
                      {idx + 1}
                    </span>
                    <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
                      "{myth.q}"
                    </h3>
                  </div>

                  {/* Badge */}
                  {isOpen ? (
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 rounded px-2.5 py-1 font-mono-f1 text-[11px] font-bold tracking-wider uppercase ${
                        myth.status === "confirmed"
                          ? "bg-white/15 text-white border border-white/30"
                          : myth.status === "busted"
                          ? "bg-[#ff2c2c]/20 text-[#ff2c2c] border border-[#ff2c2c]/40"
                          : "bg-white/5 text-white/70 border border-white/10"
                      }`}
                    >
                      {myth.status === "confirmed" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : myth.status === "busted" ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {myth.badge}
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs font-mono-f1 text-white/40 group-hover:text-white/80 transition underline">
                      Tap to test
                    </span>
                  )}
                </div>

                {/* Evidence & Test stats (revealed on open) */}
                {isOpen ? (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
                    <p className="text-sm text-white/80 leading-relaxed">
                      {myth.evidence}
                    </p>
                    <div className="rounded bg-black/40 px-3 py-1.5 font-mono-f1 text-xs text-white/60 border border-white/5 flex items-center justify-between">
                      <span className="text-[#ff2c2c] font-semibold">{myth.test}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-xs font-mono-f1 text-white/40">
                    <span>Ask the room to guess...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
