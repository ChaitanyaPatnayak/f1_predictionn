import { useRef, useState } from 'react'
import * as d3 from 'd3'
import { Chapter } from '@/components/chapter'
import { Slider } from '@/components/ui/slider'
import { D, pct } from '@/lib/data'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const W = 640, H = 300, M = { l: 44, r: 16, t: 16, b: 40 }
const x = d3.scaleLinear().domain([10, 100]).range([M.l, W - M.r])
const y = d3.scaleLinear().domain([0, 1]).range([H - M.b, M.t])

export function TitleFight() {
  const [f, setF] = useState(50)
  const d = D.title.find((t) => Math.round(t.f * 100) === f) ?? D.title[4]
  const line = d3.line<(typeof D.title)[number]>().x((t) => x(t.f * 100)).y((t) => y(t.rate)).curve(d3.curveMonotoneX)(D.title) ?? ''
  const band = d3.area<(typeof D.title)[number]>().x((t) => x(t.f * 100)).y0((t) => y(t.lo)).y1((t) => y(t.hi)).curve(d3.curveMonotoneX)(D.title) ?? ''
  const lose = Math.round(10 * (1 - d.rate))
  const lineRef = useRef<SVGPathElement>(null)
  const bandRef = useRef<SVGPathElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    const st = { trigger: lineRef.current, start: 'top 80%', once: true }
    gsap.from(lineRef.current, { drawSVG: '0%', duration: 1.8, ease: 'power2.inOut', scrollTrigger: st })
    gsap.from(bandRef.current, { opacity: 0, duration: 1.4, delay: 0.6, scrollTrigger: st })
  })

  return (
    <Chapter
      id="title"
      index="08"
      eyebrow="Proportions · Wilson confidence intervals"
      title={<>When is the title<br />really decided?</>}
      deck="Across 76 seasons we checked who led the championship at each point of the year and whether they went on to win it."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="grid content-start gap-8 bg-panel p-6 md:p-10">
          <div className="grid gap-3">
            <div className="flex items-baseline justify-between"><label htmlFor="tf" className="eyebrow">Season completed</label><output className="num text-xl">{f}%</output></div>
            <Slider id="tf" value={[f]} min={10} max={100} step={10} onValueChange={([v]) => setF(v)} aria-label="Share of season completed" />
          </div>
          <div className="grid gap-2">
            <span className="display text-[clamp(4.5rem,10vw,8rem)] leading-none text-red">{pct(d.rate)}</span>
            <span className="text-lg">of championship leaders at this point went on to win the title.</span>
            <span className="num text-sm text-ink-muted">95% CI {pct(d.lo)} to {pct(d.hi)}</span>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">
            {f === 100 ? 'At the final round the leader is the champion by definition.' : `About ${lose} in 10 leaders at this stage still lose the title.`}
            {' '}Before and after 2000 the mid-season figure does not differ significantly (Fisher’s exact test, p = 0.59).
          </p>
        </div>
        <div className="bg-panel p-6 md:p-8">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Chance that the championship leader becomes champion, by share of season completed">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
                <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fill="rgba(245,245,245,0.45)" fontSize={11} fontFamily="JetBrains Mono">{t * 100}%</text>
              </g>
            ))}
            <path ref={bandRef} d={band} fill="#ff2c2c" fillOpacity={0.12} />
            <path ref={lineRef} d={line} fill="none" stroke="#ff2c2c" strokeWidth={2.5} />
            {D.title.map((t) => <circle key={t.f} cx={x(t.f * 100)} cy={y(t.rate)} r={3} fill="#ff2c2c" />)}
            <line x1={x(f)} x2={x(f)} y1={M.t} y2={H - M.b} stroke="rgba(245,245,245,0.35)" strokeDasharray="3 4" />
            <circle cx={x(f)} cy={y(d.rate)} r={8} fill="#0a0a0a" stroke="#f5f5f5" strokeWidth={2} />
            {D.title.map((t) => (
              <text key={t.f} x={x(t.f * 100)} y={H - M.b + 18} textAnchor="middle" fill="rgba(245,245,245,0.45)" fontSize={11} fontFamily="JetBrains Mono">{Math.round(t.f * 100)}%</text>
            ))}
            <text x={W - M.r} y={H - 4} textAnchor="end" fill="rgba(245,245,245,0.45)" fontSize={11} fontFamily="Inter">share of the season’s rounds completed · shaded band = 95% CI</text>
          </svg>
        </div>
      </div>
    </Chapter>
  )
}
