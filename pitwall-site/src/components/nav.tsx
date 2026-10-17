import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

const LINKS = [
  ['predictor', 'Predictor'],
  ['myths', 'Myths'],
  ['lab', 'A/B lab'],
  ['history', 'History'],
  ['dynasties', 'Dynasties'],
  ['drivers', 'Drivers'],
  ['nations', 'Nations'],
  ['aero', 'Aero'],
  ['circuits', 'Circuits'],
  ['arcade', 'Arcade'],
] as const

export function Nav() {
  const bar = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.to(bar.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    })
  })

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-carbon/75 backdrop-blur-md"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="gutter mx-auto flex h-14 max-w-[1560px] items-center gap-6">
        <a href="#top" className="display shrink-0 text-[0.95rem] tracking-normal" aria-label="Pit Wall, back to top">
          Pit<span className="text-red">/</span>Wall
        </a>
        <div className="-mr-2 flex flex-1 justify-end gap-1 overflow-x-auto [scrollbar-width:none]">
          {LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-[0.82rem] font-medium text-ink-muted transition-colors hover:bg-panel-2 hover:text-ink"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
      <div ref={bar} aria-hidden className="h-[2px] origin-left scale-x-0 bg-red" />
    </nav>
  )
}
