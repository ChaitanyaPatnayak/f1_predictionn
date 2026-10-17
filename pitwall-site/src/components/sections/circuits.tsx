import { useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import dots from '@/data/dots.json'
import { Chapter } from '@/components/chapter'
import { D, pct, type Circuit } from '@/lib/data'
import { cn } from '@/lib/utils'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const W = 1000, H = 420
const projection = d3.geoEquirectangular().fitExtent([[0, 0], [W, H]], {
  type: 'Feature', properties: {},
  geometry: { type: 'Polygon', coordinates: [[[-170, 78], [180, 78], [180, -56], [-170, -56], [-170, 78]]] },
} as d3.GeoPermissibleObjects)
const LAND = (dots as [number, number][]).map(([lon, lat]) => projection([lon, lat])!)
const r = d3.scaleSqrt().domain([1, 75]).range([2.5, 11])
const RANKED = [...D.circuits].sort((a, b) => b.races - a.races)
const ON_CALENDAR = D.circuits.filter((c) => c.last >= 2025).length

export function Circuits() {
  const [sel, setSel] = useState<Circuit>(RANKED[0])
  const marks = useRef<SVGGElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.from(marks.current!.querySelectorAll('circle[data-mark]'), {
      scale: 0, transformOrigin: 'center', duration: 0.8, stagger: { each: 0.025, from: 'random' }, ease: 'back.out(2)',
      scrollTrigger: { trigger: marks.current, start: 'top 80%', once: true },
    })
  })
  const points = useMemo(() => [...D.circuits].sort((a, b) => b.races - a.races).map((c) => ({ c, p: projection([c.lon, c.lat])! })), [])

  return (
    <Chapter
      id="circuits"
      index="10"
      eyebrow={`${D.kpi.circuits} circuits · ${ON_CALENDAR} on the current calendar`}
      title={<>Where Formula 1<br />has raced</>}
      deck="Each dot of the map is land; each red mark is a circuit still on the calendar, white marks are former venues. Mark size follows the number of Grands Prix held. Select a circuit for its record."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <div className="relative bg-panel p-4 md:p-6">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Dot-matrix world map of Formula 1 circuits">
            {LAND.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={1.7} fill="rgba(245,245,245,0.16)" />)}
            <g ref={marks}>
            {points.map(({ c, p }) => {
              const active = c.last >= 2025
              const isSel = c.name === sel.name
              return (
                <g key={c.name} transform={`translate(${p[0]},${p[1]})`} className="cursor-pointer" onMouseEnter={() => setSel(c)} onClick={() => setSel(c)}>
                  {isSel && <circle r={r(c.races) + 7} fill="none" stroke="#f5f5f5" strokeWidth={1.2} />}
                  <circle data-mark r={r(c.races)} fill={active ? '#ff2c2c' : 'rgba(245,245,245,0.55)'} fillOpacity={active ? 0.85 : 0.6} stroke="#0a0a0a" strokeWidth={1} />
                </g>
              )
            })}
            </g>
          </svg>
          <div className="mt-3 flex flex-wrap gap-5 text-xs text-ink-muted">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red" />On the 2025 calendar</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-white/55" />Former venue</span>
          </div>
        </div>
        <div className="grid content-start gap-6 bg-panel p-6 md:p-8">
          <div className="grid gap-2">
            <span className="eyebrow">{sel.country}</span>
            <h3 className="text-2xl font-semibold leading-tight">{sel.name}</h3>
            <div className="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-hairline-strong">
              <div className="grid gap-1 bg-panel-2 p-3"><span className="num text-xl">{sel.races}</span><span className="text-[0.7rem] text-ink-dim">Grands Prix</span></div>
              <div className="grid gap-1 bg-panel-2 p-3"><span className="num text-xl">{sel.first}</span><span className="text-[0.7rem] text-ink-dim">first race</span></div>
              <div className="grid gap-1 bg-panel-2 p-3"><span className="num text-xl">{sel.poleConv != null ? pct(sel.poleConv) : '–'}</span><span className="text-[0.7rem] text-ink-dim">poles won</span></div>
            </div>
          </div>
          <div className="rule" />
          <div className="grid gap-1">
            <span className="eyebrow mb-2">Most Grands Prix hosted</span>
            {RANKED.slice(0, 8).map((c, i) => (
              <button key={c.name} type="button" onMouseEnter={() => setSel(c)} onClick={() => setSel(c)}
                className={cn('grid grid-cols-[1.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition',
                  c.name === sel.name ? 'bg-white/[0.08] text-ink' : 'text-ink-muted hover:text-ink')}>
                <span className="num text-xs text-ink-dim">{i + 1}</span>
                <span className="truncate">{c.name}</span>
                <span className="num text-right">{c.races}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Chapter>
  )
}
