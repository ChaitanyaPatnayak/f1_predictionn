import { useRef, useState } from 'react'
import { Chapter } from '@/components/chapter'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type Verdict = 'busted' | 'confirmed' | 'half'

const MYTHS: { belief: string; verdict: Verdict; label: string; evidence: string; test: string }[] = [
  { belief: 'The hybrid era made pole position worth more.', verdict: 'busted', label: 'Busted',
    evidence: 'Pole converted to a win 49.4% of the time in 2000 to 2013 and 53.6% in 2014 to 2025. The confidence interval of the difference includes zero.', test: 'Two-proportion z-test · p = 0.35 · h = 0.08' },
  { belief: 'Monaco is won on Saturday.', verdict: 'half', label: 'Half true',
    evidence: 'The order changes less at Monaco, but its pole-sitter wins 46.5% of the time against 43.3% elsewhere. No real difference.', test: 'z-test p = 0.60 · Mann–Whitney p = 0.0096' },
  { belief: 'Drivers find extra speed at their home Grand Prix.', verdict: 'busted', label: 'Busted',
    evidence: 'Each driver compared with themselves: they beat their teammate 52.8% of the time at home and 50.3% away.', test: 'Paired t-test · p = 0.41 · d = 0.11' },
  { belief: 'The car matters more than the driver.', verdict: 'confirmed', label: 'Confirmed',
    evidence: 'The car explains 60.4% of the variation in finishing position. The driver, within the same car, adds 4.5%.', test: 'Nested ANOVA · F = 53.1 · η² = 0.60' },
  { belief: 'One team dominates more than it used to.', verdict: 'confirmed', label: 'Confirmed since 1980',
    evidence: 'Dominance fell until the 1970s and has risen since. The 2020s average only 2.1 effective winning teams.', test: 'Kendall’s τ = +0.27 · p = 0.009' },
  { belief: 'The 2022 rules brought more overtaking.', verdict: 'confirmed', label: 'Confirmed, small',
    evidence: 'Position changes per race rose from 2.26 to 2.55 places, a 13% increase that faded after 2023.', test: 'Welch t-test · p = 0.023 · d = 0.33' },
  { belief: 'Street circuits end more races in the wall.', verdict: 'confirmed', label: 'Confirmed',
    evidence: '10.2% of starters crash out on street circuits and 7.2% on permanent tracks, a 41% higher risk.', test: 'Chi-square test · p < 0.0001' },
  { belief: 'Experience always beats youth.', verdict: 'half', label: 'Half true',
    evidence: 'Experience helps and age hurts, as two separate effects. They balance at a peak between 28 and 30.', test: 'Likelihood-ratio tests · p < 10⁻²⁵' },
  { belief: 'A one-stop race beats a two-stop race.', verdict: 'busted', label: 'Busted',
    evidence: 'One-stop finishers gained 1.46 places and two-stop finishers 1.20. The difference is negligible.', test: 'Mann–Whitney U · p = 0.063 · r = −0.03' },
]

const chipClass: Record<Verdict, string> = {
  busted: 'bg-red text-carbon',
  confirmed: 'bg-ink text-carbon',
  half: 'border border-ink text-ink',
}

export function Myths() {
  const [open, setOpen] = useState<boolean[]>(() => MYTHS.map(() => false))
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (prefersReducedMotion()) return
    const items = gridRef.current!.children
    gsap.set(items, { opacity: 0, y: 70, rotationX: -18, transformOrigin: '50% 100%' })
    ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, rotationX: 0, duration: 1, stagger: 0.09, ease: 'expo.out' }),
    })
  }, { scope: gridRef })

  const flip = (i: number, to: boolean) => {
    const el = cards.current[i]
    if (el) gsap.to(el, { rotationY: to ? 180 : 0, duration: prefersReducedMotion() ? 0 : 0.8, ease: 'expo.inOut' })
  }
  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      flip(i, next[i])
      return next
    })
  }
  const all = open.every(Boolean)
  const toggleAll = () => {
    const to = !all
    MYTHS.forEach((_, i) => setTimeout(() => flip(i, to), i * 60))
    setOpen(MYTHS.map(() => to))
  }

  return (
    <Chapter
      id="myths"
      index="02"
      eyebrow="Hypothesis testing"
      title={<>Paddock beliefs,<br />put to the test</>}
      deck="Nine things people in Formula 1 take for granted. Each was tested in the notebook with a stated null hypothesis, a p-value and an effect size. Guess first, then turn the card."
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={cn('chip', chipClass.confirmed)}>Confirmed</span>
          <span className={cn('chip', chipClass.half)}>Half true</span>
          <span className={cn('chip', chipClass.busted)}>Busted</span>
        </div>
        <button type="button" onClick={toggleAll}
          className="rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium transition hover:border-ink">
          {all ? 'Turn all back' : 'Reveal all'}
        </button>
      </div>
      <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: '1600px' }}>
        {MYTHS.map((m, i) => (
          <button key={m.belief} type="button" onClick={() => toggle(i)} aria-pressed={open[i]}
            aria-label={`${m.belief} ${open[i] ? `Verdict: ${m.label}. ${m.evidence}` : 'Reveal verdict'}`}
            className="group text-left">
            <div ref={(el) => { cards.current[i] = el }} className="grid min-h-[300px]" style={{ transformStyle: 'preserve-3d' }}>
              <div className="col-start-1 row-start-1 flex flex-col justify-between rounded-2xl border border-hairline-strong bg-panel p-7 transition-colors group-hover:border-white/30"
                style={{ backfaceVisibility: 'hidden' }}>
                <span className="num text-xs text-ink-dim">{String(i + 1).padStart(2, '0')} / {String(MYTHS.length).padStart(2, '0')}</span>
                <p className="font-serif text-[1.7rem] italic leading-[1.2]">“{m.belief}”</p>
                <span className="eyebrow flex items-center gap-2 text-ink-dim group-hover:text-ink">Turn the card <span aria-hidden>→</span></span>
              </div>
              <div className="col-start-1 row-start-1 flex flex-col justify-between gap-5 rounded-2xl border border-hairline-strong bg-panel-2 p-7"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <span className={cn('chip self-start', chipClass[m.verdict])}>{m.label}</span>
                <p className="text-[0.98rem] leading-relaxed text-ink">{m.evidence}</p>
                <p className="num text-xs text-ink-muted">{m.test}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Chapter>
  )
}
