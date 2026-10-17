import { Cpu, X, BookOpen, CheckCircle, Database } from "lucide-react";
import { TEAM_MEMBERS } from "@/data/f1Data";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AcademicPaperModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#161616] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#ff2c2c]" />
            <h3 className="font-display font-bold text-lg sm:text-xl">
              23CSE351 Foundations of Data Science · Faculty Review Brief
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 font-mono-f1 text-xs text-white/80 leading-relaxed">
          {/* Authors */}
          <div className="rounded-xl border border-white/5 bg-black/40 p-4">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-[#ff2c2c] block mb-2">
              Research Team & Authors (B.Tech CSE Semester 5)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {TEAM_MEMBERS.map((m) => (
                <div key={m.reg} className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <strong className="text-white block">{m.name}</strong>
                  <span className="text-[#ff2c2c] font-semibold">{m.reg}</span>
                  <span className="text-white/40 block text-[10px]">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#ff2c2c]" />
              Core Problem Statement
            </h4>
            <p>
              Formula 1 is the most technologically sophisticated sport on Earth, yet popular commentary frequently relies on dogmatic assumptions:
              that pole position guarantees Monaco victory, that the driver contributes equal variance to the car, or that home races offer psychological advantages.
              This study formulates 15 formal statistical research questions using 1,138 races (1950–2025) to uncover true causal factors.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-[#ff2c2c]" />
              Key Statistical Findings & Deliverables
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-white/70">
              <li>
                <strong className="text-white">Nested ANOVA:</strong> Car machinery explains 60.39% of finishing variance, whereas driver talent within identical machinery accounts for 4.45% (F = 53.1, p &lt; 0.001).
              </li>
              <li>
                <strong className="text-white">Predictive OLS Model:</strong> Multiple linear regression achieves test R² = 0.600 and MAE = 2.50 places on holdout races, matching Random Forest (R² = 0.598).
              </li>
              <li>
                <strong className="text-white">Resampling Tests:</strong> 2022 ground-effect regulations significantly increased race order reshuffle from 2.26 to 2.55 places (Welch t = 2.30, p = 0.023).
              </li>
              <li>
                <strong className="text-white">Holm-Bonferroni Correction:</strong> Demonstrated that uncorrected testing across 11 nations yielded 2 false discoveries (British & Italian), corrected under familywise error rate control.
              </li>
            </ul>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 flex justify-between items-center text-xs">
            <span className="text-white/40">Jupyter Notebook: F1_Case_Study.ipynb (All 22 Figures & Tests)</span>
            <button
              onClick={onClose}
              className="rounded-lg bg-[#ff2c2c] px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-[#ff4545] transition"
            >
              Close Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
