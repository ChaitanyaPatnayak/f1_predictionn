import { useState } from "react";
import { F1_DATA } from "@/data/f1Data";
import { Globe, AlertTriangle, CheckCircle2 } from "lucide-react";

export function NationsSection() {
  const [useHolm, setUseHolm] = useState<boolean>(true);

  const sortedNations = [...F1_DATA.nations].sort((a, b) => b.rate - a.rate);

  const significantCount = sortedNations.filter((n) => (useHolm ? n.pHolm : n.pRaw) < 0.05).length;

  return (
    <section id="nations" className="relative border-b border-white/5 bg-[#0a0a0a] py-16 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1 font-mono-f1 text-xs text-[#ff2c2c] mb-3">
            <Globe className="h-3.5 w-3.5" />
            MULTIPLE COMPARISONS · HOLM–BONFERRONI FAMILYWISE CONTROL
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Which Nations Produce <span className="text-[#ff2c2c]">The Best Drivers?</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed">
            Teammate head-to-heads from 1980 to 2025. Testing 11 nations simultaneously at α = 0.05 yields an inflated
            43.1% probability of at least one false discovery. Toggle the Holm step-down correction to observe rigorous academic control.
          </p>
        </div>

        {/* Panel */}
        <div className="rounded-2xl border border-white/10 bg-[#161616] p-5 sm:p-8 shadow-xl">
          {/* Correction Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseHolm(false)}
                className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition ${
                  !useHolm
                    ? "bg-white text-black shadow-md font-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Raw Uncorrected p &lt; 0.05
              </button>
              <button
                onClick={() => setUseHolm(true)}
                className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition ${
                  useHolm
                    ? "bg-[#ff2c2c] text-white shadow-md shadow-[#ff2c2c]/30 font-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Holm–Bonferroni Corrected
              </button>
            </div>

            <div className="font-mono-f1 text-xs text-white/80">
              <span className="font-bold text-white">{significantCount} of {sortedNations.length}</span> nations statistically significant
            </div>
          </div>

          {/* Educational Note */}
          <div className="mb-6 rounded-xl bg-black/40 p-4 border border-white/5 text-xs font-mono-f1">
            {useHolm ? (
              <div className="flex items-start gap-2.5 text-[#f5f5f5]">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#ff2c2c]" />
                <p>
                  <strong className="text-[#ff2c2c]">Holm-Bonferroni Activated:</strong> Family-wise error rate bounded at α = 0.05.
                  Notice how British (raw p = 0.016) and Italian (raw p = 0.011) drivers are no longer deemed statistically significant; they were false discoveries induced by multiple testing!
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-white/80">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#ff2c2c]" />
                <p>
                  <strong className="text-white">Unadjusted p-values (Naive Testing):</strong> Spurious significance flagged across multiple nations due to 11 independent null tests without adjustment.
                </p>
              </div>
            )}
          </div>

          {/* Nations list */}
          <div className="space-y-3 font-mono-f1 text-xs">
            {sortedNations.map((nat) => {
              const p = useHolm ? nat.pHolm : nat.pRaw;
              const isSig = p < 0.05;
              const isPositive = nat.rate > 0.5;

              return (
                <div
                  key={nat.nat}
                  className="grid grid-cols-12 items-center gap-3 rounded-lg border border-white/5 bg-black/30 p-3 transition hover:border-white/20"
                >
                  <div className="col-span-3 sm:col-span-2">
                    <span className="font-bold text-white text-sm block">{nat.nat}</span>
                    <span className="text-[10px] text-white/40">{nat.drivers} drivers · {nat.races} races</span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="col-span-6 sm:col-span-7">
                    <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/40 z-10" />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          !isSig
                            ? "bg-white/25"
                            : isPositive
                            ? "bg-[#ff2c2c]"
                            : "bg-white/40"
                        }`}
                        style={{ width: `${nat.rate * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 mt-1">
                      <span>Top: {nat.top} ({(nat.topShare * 100).toFixed(0)}% wins)</span>
                      <span>p = {p < 0.0001 ? p.toExponential(2) : p.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Win rate & badge */}
                  <div className="col-span-3 text-right">
                    <span
                      className={`font-bold text-sm block ${
                        !isSig ? "text-white/60" : isPositive ? "text-[#ff2c2c]" : "text-white/90"
                      }`}
                    >
                      {(nat.rate * 100).toFixed(1)}%
                    </span>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isSig
                          ? isPositive
                            ? "bg-[#ff2c2c]/20 text-[#ff2c2c] border border-[#ff2c2c]/40"
                            : "bg-white/10 text-white/70"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {isSig ? (isPositive ? "ELITE" : "DEFICIT") : "INSIGNIFICANT"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
