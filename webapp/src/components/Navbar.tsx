import { useState } from "react";
import { Shield, FileText, CheckCircle2, Globe, Cpu } from "lucide-react";

interface NavbarProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenPaperModal: () => void;
}

export function Navbar({ onOpenPrivacy, onOpenTerms, onOpenPaperModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "#scrub", label: "3D Machinery" },
    { href: "#predict", label: "Predictor" },
    { href: "#myths", label: "Myth Buster" },
    { href: "#driver", label: "Car vs Driver" },
    { href: "#lab", label: "Permutation Lab" },
    { href: "#time", label: "Time Machine" },
    { href: "#theater", label: "Telemetry Video" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-2 group">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#ff2c2c] font-black text-white text-base tracking-tighter shadow-md shadow-[#ff2c2c]/30 transition group-hover:scale-105">
              F1
            </span>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-wider text-white">
                PIT<span className="text-[#ff2c2c]">/</span>WALL
              </span>
              <span className="font-mono-f1 text-[10px] uppercase tracking-widest text-white/50">
                Statistical Intel
              </span>
            </div>
          </a>

          {/* Academic domain badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/10 bg-[#161616] px-2.5 py-1 font-mono-f1 text-[11px] text-white/70">
            <Globe className="h-3 w-3 text-emerald-400" />
            <span className="text-white/90">pitwall.f1analytics.ac.in</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded px-2.5 py-1.5 font-display text-xs font-semibold tracking-wide text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right CTA & Modals */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPaperModal}
            className="flex items-center gap-1.5 rounded-lg border border-[#ff2c2c]/40 bg-[#ff2c2c]/10 px-3 py-1.5 font-mono-f1 text-xs font-semibold text-[#ff2c2c] transition hover:bg-[#ff2c2c] hover:text-white"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">23CSE351 FODS</span>
            <span className="sm:hidden">Report</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              onClick={onOpenPrivacy}
              title="Academic Privacy Policy"
              className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
            >
              <Shield className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenTerms}
              title="Terms of Use & Citation"
              className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded p-1.5 text-white/70 hover:bg-white/10"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0d0e12] px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <button onClick={() => { onOpenPrivacy(); setMobileMenuOpen(false); }} className="hover:text-white underline">Privacy Policy</button>
            <button onClick={() => { onOpenTerms(); setMobileMenuOpen(false); }} className="hover:text-white underline">Terms & Citations</button>
          </div>
        </div>
      )}
    </nav>
  );
}
