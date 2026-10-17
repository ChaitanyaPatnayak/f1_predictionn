import { useRef, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type Props = {
  id: string
  index: string
  eyebrow: string
  title: ReactNode
  deck?: ReactNode
  children: ReactNode
  className?: string
}

/** A numbered chapter of the story: header with a line-by-line reveal, then the content. */
export function Chapter({ id, index, eyebrow, title, deck, children, className }: Props) {
  const root = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !titleRef.current) return
      const split = SplitText.create(titleRef.current, { type: 'lines', mask: 'lines', linesClass: 'line' })
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%', once: true },
      })
      gsap.from(root.current!.querySelectorAll('[data-fade]'), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.08,
        scrollTrigger: { trigger: titleRef.current, start: 'top 80%', once: true },
      })
      gsap.from(contentRef.current!.children, {
        opacity: 0,
        y: 60,
        duration: 1.1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: contentRef.current, start: 'top 85%', once: true },
      })
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section id={id} ref={root} className={cn('gutter relative scroll-mt-16 py-24 md:py-36', className)}>
      <div className="mx-auto max-w-[1360px]">
        <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end">
          <div className="grid gap-5">
            <div className="flex items-center gap-4" data-fade>
              <span className="num text-sm text-red">{index}</span>
              <span className="h-px w-10 bg-hairline-strong" />
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <h2 ref={titleRef} className="display text-[clamp(2rem,5vw,4.3rem)]" style={{ lineHeight: 1.32 }}>
              {title}
            </h2>
          </div>
          {deck && (
            <p data-fade className="max-w-[46ch] text-[1.05rem] leading-relaxed text-ink-muted md:justify-self-end">
              {deck}
            </p>
          )}
        </header>
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  )
}
