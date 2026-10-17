import { TEAM_MEMBERS } from "@/data/f1Data";
import { Globe, Shield, FileText, Database } from "lucide-react";

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenPaperModal: () => void;
}

export function Footer({ onOpenPrivacy, onOpenTerms, onOpenPaperModal }: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] py-14 text-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand & Course */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-[#ff2c2c] font-black text-white text-sm">
                F1
              </span>
              <span className="font-display font-black text-lg tracking-wider text-white">
                PIT<span className="text-[#ff2c2c]">/</span>WALL
              </span>
            </div>
            <p className="text-xs font-mono-f1 text-white/60 leading-relaxed max-w-md">
              23CSE351 Foundations of Data Science (FODS) Case Study.
              A comprehensive statistical and predictive investigation into 1,138 Formula 1 World Championship races (1950–2025).
            </p>
            <div className="pt-2 flex items-center gap-2 font-mono-f1 text-[11px] text-white/50">
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>Production Domain: </span>
              <strong className="text-white/80">pitwall.f1analytics.ac.in</strong>
            </div>
          </div>

          {/* Research Authors */}
          <div className="md:col-span-4 space-y-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-white block mb-3">
              Research Authors & Roll Numbers
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-f1">
              {TEAM_MEMBERS.map((m) => (
                <div key={m.reg} className="bg-[#161616] p-2 rounded-lg border border-white/5">
                  <div className="font-semibold text-white truncate">{m.name}</div>
                  <div className="text-[11px] text-[#ff2c2c]">{m.reg}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Links & Data Provenance */}
          <div className="md:col-span-3 space-y-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-white block mb-3">
              Data & Verification
            </span>
            <ul className="space-y-2 text-xs font-mono-f1">
              <li>
                <a
                  href="https://github.com/jolpica/jolpica-f1"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <Database className="h-3.5 w-3.5 text-[#ff2c2c]" />
                  Jolpica F1 Database (Ergast)
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenPaperModal}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <span className="text-[#ff2c2c]">•</span>
                  Course Brief & Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Academic Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Terms of Use & Citation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono-f1 text-white/40">
          <span>Department of Computer Science & Engineering · Amrita Vishwa Vidyapeetham</span>
          <span>Statistical derivations & coefficients compiled from project notebook F1_Case_Study.ipynb</span>
        </div>
      </div>
    </footer>
  );
}
