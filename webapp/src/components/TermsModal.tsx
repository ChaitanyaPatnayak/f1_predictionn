import { FileText, X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#161616] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#ff2c2c]" />
            <h3 className="font-display font-bold text-lg">Terms of Use & Citation</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 font-mono-f1 text-xs text-white/80 leading-relaxed">
          <h4 className="font-display font-bold text-sm text-white">1. Academic Purpose & Integrity</h4>
          <p>
            The software, statistical models, mathematical derivations, and interactive visualizations presented herein
            were developed as part of the semester 5 coursework for <strong>23CSE351: Foundations of Data Science</strong>.
            This system is intended for faculty evaluation, academic demonstration, and educational peer review.
          </p>

          <h4 className="font-display font-bold text-sm text-white pt-2">2. Citation & Attribution</h4>
          <p>
            When referencing findings, effect sizes, or regression parameters from this case study, please cite as:
          </p>
          <div className="rounded bg-black/60 p-3 text-[11px] text-white/90 border border-white/10 select-all">
            Meghapranay, R., Krishna Chaitanya, P., Rishit Kumar, M., & Aditya, K. (2025).
            <em>"Formula 1 Race Analytics (1950–2025): A Statistical & Predictive Study of Grand Prix Outcomes"</em>.
            Department of Computer Science & Engineering, Amrita Vishwa Vidyapeetham.
          </div>

          <h4 className="font-display font-bold text-sm text-white pt-2">3. Dataset Disclaimers</h4>
          <p>
            Formula 1, F1, Grand Prix, and related marks are trademarks of Formula One Licensing B.V., a Formula One Group company.
            This project is an independent non-commercial academic study and is not affiliated with, sponsored by, or endorsed by Formula One Licensing B.V. or the FIA.
          </p>

          <div className="mt-6 border-t border-white/10 pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Accept & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
