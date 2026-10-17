import { Shield, X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#161616] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#ff2c2c]" />
            <h3 className="font-display font-bold text-lg">Academic Data Privacy Policy</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 font-mono-f1 text-xs text-white/80 leading-relaxed">
          <p>
            <strong>Institution:</strong> Amrita Vishwa Vidyapeetham · Department of Computer Science & Engineering<br />
            <strong>Course:</strong> 23CSE351 Foundations of Data Science (FODS) · Case Study Project
          </p>

          <h4 className="font-display font-bold text-sm text-white pt-2">1. Data Provenance & Open Source Transparency</h4>
          <p>
            This application operates entirely upon the open-access Jolpica F1 Database (the community-maintained successor to the Ergast Developer API).
            All historical Grand Prix telemetry, lap timestamps, championship points standings, and finishing classifications are public historical sports records under the Creative Commons CC0 1.0 Universal license.
          </p>

          <h4 className="font-display font-bold text-sm text-white pt-2">2. Zero User Telemetry & Local Execution</h4>
          <p>
            No user tracking cookies, pixel trackers, marketing scripts, or third-party ad networks are utilized.
            All statistical calculations (including the 4,000-shuffle Monte Carlo permutation resampling, Bradley–Terry probability matrices, and Ordinary Least Squares prediction interval evaluations) execute locally in your client's browser engine using client-side JavaScript.
          </p>

          <h4 className="font-display font-bold text-sm text-white pt-2">3. Institutional Academic Exemption</h4>
          <p>
            In accordance with international research data protection frameworks (including GDPR Article 89 academic research exemptions), this platform is operated exclusively for non-profit statistical education, peer review, and academic presentation.
          </p>

          <div className="mt-6 border-t border-white/10 pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Close Privacy Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
