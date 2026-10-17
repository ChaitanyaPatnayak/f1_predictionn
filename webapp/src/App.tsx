import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HeroScrub } from "@/components/ui/hero-scrub";
import { PredictorSection } from "@/components/PredictorSection";
import { MythBusterSection } from "@/components/MythBusterSection";
import { PermutationLabSection } from "@/components/PermutationLabSection";
import { TimeMachineSection } from "@/components/TimeMachineSection";
import { CarVsDriverSection } from "@/components/CarVsDriverSection";
import { NationsSection } from "@/components/NationsSection";
import { TitleFightSection } from "@/components/TitleFightSection";
import { CircuitsSection } from "@/components/CircuitsSection";
import { OnboardTheaterSection } from "@/components/OnboardTheaterSection";
import { Footer } from "@/components/Footer";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import { TermsModal } from "@/components/TermsModal";
import { AcademicPaperModal } from "@/components/AcademicPaperModal";

export default function App() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-[#ff2c2c] selection:text-white">
      {/* Sticky Navigation */}
      <Navbar
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenPaperModal={() => setPaperOpen(true)}
      />

      {/* Main Pit Wall Application */}
      <main>
        {/* 1. Header with F1 Video Theater, Live Feeds & Starting Sequence */}
        <HeroSection />

        {/* 2. Cinematic 300-Frame Scroll-Scrubbed F1 Machinery Showcase */}
        <HeroScrub
          frameCount={300}
          frameUrl={(i) =>
            `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, "0")}.webp`
          }
          titleTop="SCUDERIA"
          titleBottom="PIT WALL"
          accentHex="#ff2c2c"
        />

        {/* 3. Live Multiple Linear Regression Race Predictor & Timing Tower */}
        <PredictorSection />

        {/* 4. Hypothesis Testing Myth Buster (10 paddock beliefs) */}
        <MythBusterSection />

        {/* 5. In-Browser 4,000-Shuffle Monte Carlo Permutation Test Lab */}
        <PermutationLabSection />

        {/* 6. 76 Seasons Interactive Time Machine (1950 – 2025) */}
        <TimeMachineSection />

        {/* 7. Nested ANOVA & Bradley-Terry Driver Builder */}
        <CarVsDriverSection />

        {/* 8. Nations Head-to-Head with Holm-Bonferroni Multi-Testing Control */}
        <NationsSection />

        {/* 9. Championship Title Fight Wilson Score Confidence Intervals */}
        <TitleFightSection />

        {/* 10. 77 World Championship Circuits Directory */}
        <CircuitsSection />

        {/* 11. Onboard Telemetry Video Theater (Dual Framerate.tv Feeds) */}
        <OnboardTheaterSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenPaperModal={() => setPaperOpen(true)}
      />

      {/* Institutional Modals */}
      <PrivacyPolicyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <AcademicPaperModal isOpen={paperOpen} onClose={() => setPaperOpen(false)} />
    </div>
  );
}
