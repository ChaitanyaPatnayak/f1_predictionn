import { useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import raw from '@/data/dynasties.json'
import { Chapter } from '@/components/chapter'
import { D } from '@/lib/data'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

type Row = { year: number } & Record<string, number>
const DATA = raw as unknown as { keys: string[]; totals: Record<string, number>; rows: Row[] }
const KEYS = DATA.keys
const W = 1200, H = 460, M = { l: 8, r: 8, t: 20, b: 34 }
const SHADES = [0.34, 0.2, 0.28, 0.16, 0.24, 0.12, 0.3, 0.18, 0.22, 0.08]

export function Dynasties() {
  const [active, setActive] = useState<string>('Ferrari')
  const [year, setYear] = useState<number | null>(null)
  const clip = useRef<SVGRectElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const { layers, x, y, labels } = useMemo(() => {
    const stack = d3.stack<Row>().keys(KEYS).offset(d3.stackOffsetWiggle).order(d3.stackOrderInsideOut)
    const layers = stack(DATA.rows)
    const x = d3.scaleLinear().domain([1950, 2025]).range([M.l, W - M.r])
    const lo = d3.min(layers, (l) => d3.min(l, (d) => d[0]))!
    const hi = d3.max(layers, (l) => d3.max(l, (d) => d[1]))!
    const y = d3.scaleLinear().domain([lo, hi]).range([H - M.b, M.t])
    const labels = layers.filter((l) => l.key !== 'Others').map((l) => {
      let best = 0, at = 0
      l.forEach((d, i) => { const t = d[1] - d[0]; if (t > best) { best = t; at = i } })
      const d = l[at]
      return { key: l.key, x: x(DATA.rows[at].year), y: y((d[0] + d[1]) / 2), thick: y(d[0]) - y(d[1]) }
    })
    return { layers, x, y, labels }
  }, [])

  const area = d3.area<d3.SeriesPoint<Row>>().x((d) => x(d.data.year)).y0((d) => y(d[0])).y1((d) => y(d[1])).curve(d3.curveBasis)

  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo(clip.current, { attr: { width: 0 } }, {
      attr: { width: W }, duration: 2.6, ease: 'power2.inOut',
      scrollTrigger: { trigger: svgRef.current, start: 'top 75%', once: true },
    })
  })

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    setYear(Math.round(Math.min(2025, Math.max(1950, x.invert(px)))))
  }

  const season = year ? D.seasons.find((s) => s.year === year) : null
  const row = year ? DATA.rows.find((r) => r.year === year) : null
  const yearWins = row ? KEYS.map((k) => [k, row[k]] as const).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]) : []

  return (
    <Chapter
      id="dynasties"
      index="05"
      eyebrow="Race wins by constructor · 1950 to 2025"
      title={<>Seventy-six years<br />of dynasties</>}
      deck="Every Grand Prix win since 1950, stacked by team. The stream thickens as the calendar grows; each swell is an era one team made its own. Hover a band to follow a team, or move across the years."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-[minmax(0,9fr)_minmax(0,3fr)]">
        <div className="bg-panel p-4 md:p-6">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" role="img"
            aria-label="Streamgraph of race wins per season by constructor, 1950 to 2025"
            onPointerMove={onMove} onPointerLeave={() => setYear(null)}>
            <defs><clipPath id="dyn-clip"><rect ref={clip} x={0} y={0} width={W} height={H} /></clipPath></defs>
            {[1960, 1970, 1980, 1990, 2000, 2010, 2020].map((t) => (
              <g key={t}>
                <line x1={x(t)} x2={x(t)} y1={M.t} y2={H - M.b} stroke="rgba(255,255,255,0.05)" />
                <text x={x(t)} y={H - 10} textAnchor="middle" fill="rgba(245,245,245,0.45)" fontSize={12} fontFamily="JetBrains Mono">{t}</text>
              </g>
            ))}
            <g clipPath="url(#dyn-clip)">
              {layers.map((l, i) => {
                const on = l.key === active
                return (
                  <path key={l.key} d={area(l) ?? ''} onPointerEnter={() => l.key !== 'Others' && setActive(l.key)}
                    fill={on ? '#ff2c2c' : `rgba(245,245,245,${SHADES[i % SHADES.length]})`}
                    stroke="#161616" strokeWidth={0.8}
                    style={{ transition: 'fill 300ms, opacity 300ms', opacity: on || l.key === 'Others' ? 1 : 0.85, cursor: 'pointer' }} />
                )
              })}
              {labels.filter((l) => l.thick > 22).map((l) => (
                <text key={l.key} x={l.x} y={l.y + 5} textAnchor="middle" pointerEvents="none"
                  fill={l.key === active ? '#0a0a0a' : '#f5f5f5'} fontSize={Math.min(20, 10 + l.thick / 9)} fontFamily="Inter" fontWeight={700}>
                  {l.key}
                </text>
              ))}
            </g>
            {year && (
              <g pointerEvents="none">
                <line x1={x(year)} x2={x(year)} y1={M.t} y2={H - M.b} stroke="#f5f5f5" strokeWidth={1} strokeDasharray="3 4" />
                <rect x={x(year) - 26} y={2} width={52} height={20} rx={10} fill="#f5f5f5" />
                <text x={x(year)} y={16} textAnchor="middle" fill="#0a0a0a" fontSize={12} fontFamily="JetBrains Mono" fontWeight={700}>{year}</text>
              </g>
            )}
          </svg>
        </div>
        <div className="grid content-start gap-6 bg-panel p-6 md:p-8">
          {season ? (
            <>
              <div className="grid gap-1">
                <span className="eyebrow">Season</span>
                <span className="display text-5xl">{season.year}</span>
              </div>
              <div className="grid gap-1"><span className="eyebrow">World champion</span><span className="text-lg font-semibold">{season.champion}</span></div>
              <ul className="grid gap-2 text-sm">
                {yearWins.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-3">
                    <span className={k === active ? 'text-red' : 'text-ink-muted'}>{k}</span>
                    <span className="num">{v} {v === 1 ? 'win' : 'wins'}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="grid gap-1">
                <span className="eyebrow">Following</span>
                <span className="display text-[2.2rem] leading-tight text-red">{active}</span>
              </div>
              <div className="grid gap-1">
                <span className="num text-4xl">{DATA.totals[active]}</span>
                <span className="text-sm text-ink-dim">Grand Prix wins, 1950 to 2025</span>
              </div>
              <div className="rule" />
              <ul className="grid gap-1.5 text-sm">
                {KEYS.filter((k) => k !== 'Others').map((k) => (
                  <li key={k}>
                    <button type="button" onClick={() => setActive(k)} onMouseEnter={() => setActive(k)}
                      className={`flex w-full items-center justify-between gap-3 rounded px-2 py-1 transition ${k === active ? 'bg-white/[0.08] text-ink' : 'text-ink-muted hover:text-ink'}`}>
                      <span>{k}</span><span className="num">{DATA.totals[k]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Chapter>
  )
}
