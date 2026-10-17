import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { D } from '@/lib/data'

const STATS = [
  [D.kpi.races.toLocaleString('en-US'), 'Grands Prix'],
  [D.kpi.entries.toLocaleString('en-US'), 'Driver race entries'],
  [String(D.seasons.length), 'Seasons, 1950 to 2025'],
  [String(D.kpi.drivers), 'Drivers'],
  [String(D.kpi.circuits), 'Circuits'],
] as const

export function StatsBand() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      root.current!.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el, i) => {
        gsap.from(el, {
          scrambleText: { text: el.dataset.scramble!, chars: '0123456789', speed: 0.6 },
          duration: 1.4,
          delay: i * 0.08,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
        })
      })
      gsap.from('[data-intro] .word', { opacity: 0.12, stagger: 0.03, ease: 'none',
        scrollTrigger: { trigger: '[data-intro]', start: 'top 80%', end: 'bottom 55%', scrub: true } })
    },
    { scope: root },
  )

  const intro =
    'We took every World Championship race since 1950 and asked what actually decides the result: the grid, the car, the driver, the circuit or the rulebook.'

  return (
    <section ref={root} className="gutter relative border-y border-hairline py-20 md:py-28">
      <div className="mx-auto grid max-w-[1360px] gap-16">
        <p data-intro className="max-w-[30ch] font-serif text-[clamp(1.8rem,3.6vw,3.2rem)] italic leading-[1.15] text-ink">
          {intro.split(' ').map((w, i) => (
            <span key={i} className="word">{w} </span>
          ))}
        </p>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline-strong bg-hairline-strong sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map(([value, label]) => (
            <div key={label} className="grid gap-2 bg-carbon p-5 md:p-7">
              <dt className="eyebrow order-2">{label}</dt>
              <dd className="num order-1 text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium" data-scramble={value}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
