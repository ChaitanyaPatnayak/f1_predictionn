import { useEffect, useRef, useState } from 'react'
import { VideoEmbed, VIDEOS } from '@/components/video-embed'
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { D } from '@/lib/data'

const CAPTIONS = [`${D.kpi.races.toLocaleString('en-US')} races.`, `${D.seasons.length} seasons.`, 'One question.']
const LINES = ['WHAT DECIDES', 'A GRAND PRIX?']

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

/**
 * Opening sequence.
 * 1. Starting lights come on one by one and go out; the curtain lifts.
 * 2. The F1 opener plays, cut to the shape of the giant title (an SVG text clip-path).
 * 3. Scrolling flies the camera through the letters, the full video opens up, and three captions rise in.
 */
export function LightsOutHero() {
  const root = useRef<HTMLElement>(null)
  const curtain = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLDivElement>(null)
  const videoIntro = useRef<HTMLDivElement>(null)
  const outlineIntro = useRef<SVGSVGElement>(null)
  const clipGroup = useRef<SVGGElement>(null)
  const outline = useRef<SVGGElement>(null)
  const sheet = useRef<SVGRectElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const captions = useRef<HTMLDivElement>(null)
  const kickerScroll = useRef<HTMLDivElement>(null)
  const kickerIntro = useRef<HTMLDivElement>(null)
  const { w, h } = useViewport()
  const [fontsReady, setFontsReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true))
  }, [])

  // Title geometry, in viewport pixels
  const fs = Math.min(w * 0.092, h * 0.19, 190)
  const cx = w / 2
  const cy = h * 0.46
  const y1 = cy - fs * 0.12
  const y2 = cy + fs * 0.98

  // 1. Starting lights, then the title opens (runs once)
  useGSAP(
    () => {
      const lights = curtain.current!.querySelectorAll<HTMLElement>('[data-light]')
      const label = curtain.current!.querySelector<HTMLElement>('[data-label]')!
      if (prefersReducedMotion()) {
        gsap.set(curtain.current, { display: 'none' })
        return
      }
      gsap.set([videoIntro.current, outlineIntro.current, kickerIntro.current], { opacity: 0 })
      const intro = gsap.timeline({ delay: 0.3 })
      lights.forEach((l, i) =>
        intro.to(l, { backgroundColor: '#ff2c2c', boxShadow: '0 0 36px rgba(255,44,44,0.9)', duration: 0.06, ease: 'none' }, 0.2 + i * 0.55),
      )
      intro.to(lights, { backgroundColor: '#1d0b0b', boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.05, ease: 'none' }, '+=0.75')
      intro.to(label, { scrambleText: { text: 'Lights out', chars: 'upperCase', speed: 0.8 }, duration: 0.5 }, '<')
      intro.to(curtain.current, { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, '+=0.35')
      intro.set(curtain.current, { display: 'none' })
      intro.fromTo(videoIntro.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, '-=0.7')
      intro.to(outlineIntro.current, { opacity: 1, duration: 1.2 }, '<0.2')
      intro.to(kickerIntro.current, { opacity: 1, duration: 0.8 }, '<0.3')
      curtain.current!.addEventListener('click', () => intro.progress(1), { once: true })
    },
    { scope: root },
  )

  // 2–3. Scroll timeline (rebuilt when the viewport or fonts change)
  useGSAP(
    () => {
      if (!fontsReady) return
      const reduced = prefersReducedMotion()
      const capSplits = Array.from(captions.current!.children).map((el) =>
        SplitText.create(el as HTMLElement, { type: 'chars', mask: 'chars' }),
      )
      const origin = `${cx} ${cy + fs * 0.4}`

      capSplits.forEach((s) => gsap.set(s.chars, { yPercent: 120 }))
      if (reduced) {
        gsap.set(sheet.current, { opacity: 0 })
        gsap.set(outline.current, { opacity: 0 })
        gsap.set(capSplits[capSplits.length - 1].chars, { yPercent: 0 })
        return () => capSplits.forEach((s) => s.revert())
      }

      // 2–3. Scroll: fly through the letters, open the video, captions
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=300%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 10 },
      })
      tl.to(kickerScroll.current, { opacity: 0, y: -24, duration: 0.05 }, 0)
        .to([clipGroup.current, outline.current], { scale: 26, svgOrigin: origin, ease: 'power3.in', duration: 0.4 }, 0.03)
        .to(outline.current, { opacity: 0, duration: 0.12, ease: 'none' }, 0.2)
        .to(sheet.current, { opacity: 0, duration: 0.14, ease: 'none' }, 0.26)
        .fromTo(video.current, { scale: 1.15 }, { scale: 1, ease: 'power2.out', duration: 0.42 }, 0.02)
        .to(scrim.current, { opacity: 0.5, ease: 'none', duration: 0.12 }, 0.42)

      const slot = 0.17
      capSplits.forEach((s, i) => {
        const at = 0.46 + i * slot
        tl.to(s.chars, { yPercent: 0, stagger: 0.006, duration: 0.07, ease: 'power3.out' }, at)
        if (i < capSplits.length - 1) tl.to(s.chars, { yPercent: -120, stagger: 0.004, duration: 0.06, ease: 'power3.in' }, at + 0.11)
      })
      tl.to({}, { duration: 0.06 })
      // this pin is created after the fonts load, so every later section must re-measure its position
      ScrollTrigger.sort()
      ScrollTrigger.refresh()

      return () => capSplits.forEach((s) => s.revert())
    },
    { scope: root, dependencies: [fontsReady, w, h], revertOnUpdate: true },
  )

  const textProps = {
    x: cx,
    fontFamily: 'Boldonse, "Arial Black", sans-serif',
    fontSize: fs,
    textAnchor: 'middle' as const,
    letterSpacing: `${-0.02 * fs}px`,
  }

  return (
    <section id="top" ref={root} className="relative h-[100svh] w-full overflow-hidden bg-carbon" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">What decides a Grand Prix?</h1>


      {/* the F1 opener in FrameRate's background mode, cut to the letters */}
      <div ref={videoIntro} className="absolute inset-0">
        <div ref={video} className="absolute inset-0 will-change-transform">
          <VideoEmbed src={VIDEOS.opener} title="Formula 1 opening titles, motion graphics" cover passThrough
            onLoad={() => setVideoReady(true)} />
        </div>
        {/* hides the player's blank page while it loads, then fades away */}
        <div aria-hidden className={`absolute inset-0 bg-carbon transition-opacity duration-[1400ms] ${videoReady ? 'opacity-0' : 'opacity-100'}`} />
      </div>
      <div ref={scrim} aria-hidden className="pointer-events-none absolute inset-0 bg-carbon opacity-0" />

      {/* black sheet with the letters cut out: the video shows through the holes */}
      <svg ref={outlineIntro} className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <defs>
          <mask id="hero-knock" maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
            <rect width={w} height={h} fill="white" />
            <g ref={clipGroup} fill="black">
              <text {...textProps} y={y1}>{LINES[0]}</text>
              <text {...textProps} y={y2}>{LINES[1]}</text>
            </g>
          </mask>
        </defs>
        <rect ref={sheet} width={w} height={h} fill="#0a0a0a" mask="url(#hero-knock)" />
        <g ref={outline} fill="none" stroke="rgba(245,245,245,0.5)" strokeWidth={1.2}>
          <text {...textProps} y={y1}>{LINES[0]}</text>
          <text {...textProps} y={y2}>{LINES[1]}</text>
        </g>
      </svg>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)' }} />

      <div ref={kickerScroll} className="pointer-events-none absolute inset-x-0 bottom-10 px-6">
        <div ref={kickerIntro} className="grid justify-items-center gap-3 text-center">
          <span className="eyebrow">A data science study of Formula 1 · 1950 to 2025</span>
          <span className="flex items-center gap-2 text-xs text-ink-dim">
            <span className="inline-block h-6 w-px animate-pulse bg-red" /> Scroll
          </span>
        </div>
      </div>

      <div ref={captions} aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        {CAPTIONS.map((c, i) => (
          <p key={c} className={`display col-start-1 row-start-1 px-6 text-center ${i === CAPTIONS.length - 1 ? 'text-red' : 'text-white'}`}
            style={{ fontSize: 'clamp(2.4rem, 8vw, 8rem)', lineHeight: 1.1, textShadow: '0 8px 50px rgba(0,0,0,0.6)' }}>
            {c}
          </p>
        ))}
      </div>

      {/* starting-lights curtain */}
      <div ref={curtain} className="fixed inset-0 z-[70] grid cursor-pointer place-items-center bg-carbon" role="presentation">
        <div className="grid justify-items-center gap-8">
          <div className="flex gap-3 md:gap-5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-hairline-strong bg-black p-3 md:p-4">
                <span data-light className="block h-9 w-9 rounded-full bg-[#1d0b0b] md:h-14 md:w-14" />
                <span data-light className="block h-9 w-9 rounded-full bg-[#1d0b0b] md:h-14 md:w-14" />
              </div>
            ))}
          </div>
          <span data-label className="num text-sm uppercase tracking-[0.3em] text-ink-muted">Formation lap</span>
          <span className="text-xs text-ink-dim">Click to skip</span>
        </div>
      </div>
    </section>
  )
}
