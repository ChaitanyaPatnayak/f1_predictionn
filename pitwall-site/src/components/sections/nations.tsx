import { useRef, useState } from 'react'
import { Chapter } from '@/components/chapter'
import { D, pct } from '@/lib/data'
import { cn } from '@/lib/utils'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const NATIONS = [...D.nations].sort((a, b) => b.rate - a.rate)

export function Nations() {
  const [holm, setHolm] = useState(false)
  const sigCount = NATIONS.filter((n) => (holm ? n.pHolm : n.pRaw) < 0.05).length
  const listRef = useRef<HTMLUListElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.from(listRef.current!.querySelectorAll('[data-bar]'), {
      scaleX: 0, transformOrigin: 'left center', duration: 1.2, stagger: 0.06, ease: 'expo.out',
      scrollTrigger: { trigger: listRef.current, start: 'top 80%', once: true },
    })
  })

  return (
    <Chapter
      id="nations"
      index="07"
      eyebrow="Multiple testing · Holm–Bonferroni"
      title={<>Which countries<br />produce the best drivers?</>}
      deck="Teammate head-to-heads from 1980 to 2025, same car, different nationalities. Testing eleven countries at α = 0.05 gives a 43% chance of at least one false discovery, so the p-values need correcting."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <div className="grid content-start gap-6 bg-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-full border border-hairline-strong p-1" role="group" aria-label="Significance rule">
              {[['Raw p-values', false], ['Holm-corrected', true]].map(([label, val]) => (
                <button key={label as string} type="button" aria-pressed={holm === val} onClick={() => setHolm(val as boolean)}
                  className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition', holm === val ? 'bg-ink text-carbon' : 'text-ink-muted hover:text-ink')}>
                  {label as string}
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-dim">Bar = share of head-to-heads won · line = 50%</span>
          </div>
          <ul ref={listRef} className="grid gap-2.5">
            {NATIONS.map((n) => {
              const p = holm ? n.pHolm : n.pRaw
              const sig = p < 0.05
              return (
                <li key={n.nat} className="grid grid-cols-[6.5rem_minmax(0,1fr)_4rem_4.5rem] items-center gap-3 text-sm">
                  <span>{n.nat}</span>
                  <span className="relative h-5 rounded bg-panel-2">
                    <span data-bar className={cn('absolute inset-y-0 left-0 rounded transition-colors duration-500',
                      !sig ? 'bg-white/15' : n.rate > 0.5 ? 'bg-ink' : 'bg-red')} style={{ width: `${n.rate * 100}%` }} />
                    <span className="absolute inset-y-[-4px] left-1/2 w-px bg-ink/60" />
                  </span>
                  <span className="num text-right">{pct(n.rate, 1)}</span>
                  <span className={cn('num text-right text-xs transition-colors', sig ? 'text-ink' : 'text-ink-dim')}>p {p < 0.001 ? '<.001' : p.toFixed(3).replace(/^0/, '')}</span>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="grid content-start gap-6 bg-panel p-6 md:p-8">
          <span className="eyebrow">Significant nations</span>
          <span className="display text-[clamp(4rem,9vw,7rem)] leading-none">{sigCount}<span className="text-ink-dim">/{NATIONS.length}</span></span>
          <p className="leading-relaxed text-ink-muted">
            {holm
              ? 'After the correction, British (raw p = 0.016) and Italian (raw p = 0.011) drivers are no longer significant. Two false discoveries removed.'
              : 'Without correction, eight countries look significant. Switch on the Holm correction to see which results survive.'}
          </p>
          <div className="rule" />
          <ul className="grid gap-3 text-sm">
            <li className="flex justify-between gap-3"><span className="text-ink-muted">Germany · 16 drivers</span><span>Broad pipeline</span></li>
            <li className="flex justify-between gap-3"><span className="text-ink-muted">Spain · Alonso</span><span className="num">67% of wins</span></li>
            <li className="flex justify-between gap-3"><span className="text-ink-muted">Mexico · Pérez</span><span className="num">84% of wins</span></li>
          </ul>
          <p className="text-xs leading-relaxed text-ink-dim">A national figure means little when one driver earns most of it. Germany’s result is spread across 16 drivers; Spain’s and Mexico’s are essentially one driver each.</p>
        </div>
      </div>
    </Chapter>
  )
}
