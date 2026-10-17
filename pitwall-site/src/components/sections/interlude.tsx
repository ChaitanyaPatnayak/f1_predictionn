import { useRef } from 'react'
import { VideoEmbed, VIDEOS } from '@/components/video-embed'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { D, pct } from '@/lib/data'

/** Full-bleed video break between chapters, carrying one finding. */
export function Interlude() {
  const root = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const quote = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(frame.current, { clipPath: 'inset(12% 10% 12% 10% round 24px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 16px)',
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'center 55%', scrub: true },
      })
      gsap.fromTo(quote.current, { yPercent: 40, opacity: 0.2 }, {
        yPercent: -10, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 30%', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="gutter py-16 md:py-24" aria-label="Interlude">
      <div className="mx-auto grid max-w-[1560px] gap-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <p ref={quote} className="max-w-[24ch] font-serif text-[clamp(2rem,4.4vw,3.8rem)] italic leading-[1.08]">
            About a third of every result is decided on the day.
          </p>
          <div className="grid gap-1 md:text-right">
            <span className="display text-[clamp(2.6rem,6vw,5rem)] text-red">{pct(D.variance.luck)}</span>
            <span className="eyebrow">of finishing-position variance that neither car nor driver explains</span>
          </div>
        </div>
        <div ref={frame} className="overflow-hidden rounded-2xl bg-black">
          <VideoEmbed src={VIDEOS.rain} title="Animated Formula 1 car racing in the rain" />
        </div>
      </div>
    </section>
  )
}
