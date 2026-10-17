import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const ITEMS = [
  ['Car share of variance', '60.4%'],
  ['Driver share', '4.5%'],
  ['Pole to win, 2014 to 2025', '53.6%'],
  ['Finish rate, 2020s', '86%'],
  ['2022 rules, overtaking', '+13%'],
  ['Home advantage', 'none, p = 0.41'],
  ['Driver peak', 'age 28 to 30'],
  ['Street circuit crash risk', '+41%'],
  ['Model error', '2.50 places'],
]

/** A timing-screen ticker of findings. Its speed and lean follow how fast the page is scrolled. */
export function Ticker() {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const loop = gsap.to(track.current, { xPercent: -50, duration: 48, ease: 'none', repeat: -1 })
      const lean = gsap.quickTo(track.current, 'skewX', { duration: 0.5, ease: 'power3.out' })
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity()
          loop.timeScale(1 + Math.min(6, Math.abs(v) / 400))
          lean(gsap.utils.clamp(-10, 10, -v / 250))
          gsap.to(loop, { timeScale: 1, duration: 1.2, overwrite: true, delay: 0.1 })
        },
      })
    },
    { scope: root },
  )

  const row = ITEMS.map(([k, v]) => (
    <span key={k} className="flex shrink-0 items-center gap-4 pr-12">
      <span className="h-2 w-2 rotate-45 bg-red" />
      <span className="eyebrow text-ink-muted">{k}</span>
      <span className="display text-[1.35rem] text-ink">{v}</span>
    </span>
  ))

  return (
    <div ref={root} className="overflow-hidden border-y border-hairline-strong bg-panel py-5" aria-label="Key findings">
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>{row}</div>
      </div>
    </div>
  )
}
