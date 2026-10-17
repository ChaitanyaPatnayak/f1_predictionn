import { useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { D, eraOf, pct, type Season } from '@/lib/data'
import { ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'

type Metric = { key: 'eff' | 'finish' | 'pole' | 'order'; label: string; note: string; fmt: (v: number) => string; domain: [number, number]; ticks: number[]; tickFmt: (v: number) => string }

const METRICS: Metric[] = [
  { key: 'eff', label: 'Effective winning teams', note: 'Higher means more teams sharing the wins', fmt: (v) => v.toFixed(1), domain: [1, 4.5], ticks: [1, 2, 3, 4], tickFmt: (v) => String(v) },
  { key: 'finish', label: 'Finish rate', note: 'Share of starters still running at the flag', fmt: (v) => pct(v), domain: [0.3, 1], ticks: [0.4, 0.6, 0.8, 1], tickFmt: (v) => `${v * 100}%` },
  { key: 'pole', label: 'Pole converted to a win', note: 'Share of the season’s pole positions', fmt: (v) => pct(v), domain: [0, 1], ticks: [0, 0.5, 1], tickFmt: (v) => `${v * 100}%` },
  { key: 'order', label: 'Order change per race', note: 'Places reshuffled between grid and flag', fmt: (v) => v.toFixed(2), domain: [0.5, 3.5], ticks: [1, 2, 3], tickFmt: (v) => String(v) },
]

const ERAS = [
  { from: 1950, to: 1979, name: 'Pioneer' },
  { from: 1980, to: 1999, name: 'Turbo and aero' },
  { from: 2000, to: 2013, name: 'V10 / V8' },
  { from: 2014, to: 2021, name: 'Hybrid' },
  { from: 2022, to: 2025, name: 'Ground effect' },
]

const CW = 360, CH = 150, CM = { l: 34, r: 8, t: 8, b: 20 }
const x = d3.scaleLinear().domain([1950, 2025]).range([CM.l, CW - CM.r])

function rolling(seasons: Season[], key: Metric['key']) {
  return seasons.map((s, i) => {
    const win = seasons.slice(Math.max(0, i - 2), i + 3).map((d) => d[key]).filter((v): v is number => v != null)
    return { year: s.year, v: win.length ? d3.mean(win)! : null }
  })
}

function MetricChart({ m, year }: { m: Metric; year: number }) {
  const y = d3.scaleLinear().domain(m.domain).range([CH - CM.b, CM.t]).clamp(true)
  const smooth = useMemo(() => rolling(D.seasons, m.key), [m.key])
  const path = d3.line<{ year: number; v: number | null }>().defined((d) => d.v != null).x((d) => x(d.year)).y((d) => y(d.v!)).curve(d3.curveMonotoneX)(smooth) ?? ''
  const current = D.seasons.find((s) => s.year === year)
  const currentSmooth = smooth.find((s) => s.year === year)?.v
  const clipId = `clip-${m.key}`
  return (
    <div className="grid gap-3 rounded-2xl border border-hairline-strong bg-panel p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{m.label}</span>
        <span className="num text-2xl font-medium">{current?.[m.key] != null ? m.fmt(current[m.key] as number) : '–'}</span>
      </div>
      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" role="img" aria-label={`${m.label} by season, 1950 to 2025`}>
        <defs><clipPath id={clipId}><rect x={0} y={0} width={x(year)} height={CH} /></clipPath></defs>
        {m.ticks.map((t) => (
          <g key={t}>
            <line x1={CM.l} x2={CW - CM.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={CM.l - 6} y={y(t) + 3.5} textAnchor="end" fill="rgba(245,245,245,0.4)" fontSize={10} fontFamily="JetBrains Mono">{m.tickFmt(t)}</text>
          </g>
        ))}
        {D.seasons.map((s) => s[m.key] != null && (
          <circle key={s.year} cx={x(s.year)} cy={y(s[m.key] as number)} r={1.6} fill={s.year <= year ? 'rgba(245,245,245,0.5)' : 'rgba(245,245,245,0.1)'} />
        ))}
        <path d={path} fill="none" stroke="rgba(245,245,245,0.14)" strokeWidth={2} />
        <path d={path} fill="none" stroke="#ff2c2c" strokeWidth={2.4} clipPath={`url(#${clipId})`} />
        {currentSmooth != null && <circle cx={x(year)} cy={y(currentSmooth)} r={4.5} fill="#ff2c2c" stroke="#0a0a0a" strokeWidth={2} />}
        {[1950, 1980, 2000, 2025].map((t) => (
          <text key={t} x={x(t)} y={CH - 4} textAnchor="middle" fill="rgba(245,245,245,0.4)" fontSize={10} fontFamily="JetBrains Mono">{t}</text>
        ))}
      </svg>
      <span className="text-xs text-ink-dim">{m.note}. Dots are seasons; the line is a five-season average.</span>
    </div>
  )
}

export function History() {
  const root = useRef<HTMLElement>(null)
  const pinned = useRef<HTMLDivElement>(null)
  const [year, setYear] = useState(1950)
  const reduced = prefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) { setYear(2025); return }
      ScrollTrigger.create({
        trigger: pinned.current,
        start: 'top top',
        end: '+=280%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const y = Math.round(1950 + self.progress * 75)
          setYear((prev) => (prev === y ? prev : y))
        },
      })
    },
    { scope: root },
  )

  const s = D.seasons.find((d) => d.year === year) ?? D.seasons[0]
  const progress = (year - 1950) / 75

  return (
    <section id="history" ref={root} className="relative scroll-mt-0" aria-label="Seventy-six seasons of Formula 1">
      <div ref={pinned} className="gutter flex min-h-[100svh] flex-col justify-center gap-8 pb-10 pt-24">
        <div className="mx-auto grid w-full max-w-[1360px] gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
          <div className="grid content-start gap-6">
            <div className="flex items-center gap-4">
              <span className="num text-sm text-red">04</span>
              <span className="h-px w-10 bg-hairline-strong" />
              <span className="eyebrow">{reduced ? 'Seventy-six seasons' : 'Keep scrolling to travel through time'}</span>
            </div>
            <div className="display num text-[clamp(5.5rem,15vw,13rem)] leading-[0.82]">{year}</div>
            <span className="chip self-start text-ink-muted">{eraOf(year)}</span>
            <dl className="grid gap-4 border-t border-hairline-strong pt-6 sm:grid-cols-2">
              <div className="grid gap-1"><dt className="eyebrow">World champion</dt><dd className="text-xl font-semibold">{s.champion || '–'}</dd></div>
              <div className="grid gap-1"><dt className="eyebrow">Most wins</dt><dd className="text-xl font-semibold">{s.topTeam}</dd><dd className="text-sm text-ink-muted">{pct(s.topShare)} of the season’s races</dd></div>
              <div className="grid gap-1"><dt className="eyebrow">Races</dt><dd className="num text-xl">{s.races}</dd></div>
              <div className="grid gap-1"><dt className="eyebrow">Different winners</dt><dd className="num text-xl">{s.winners}</dd></div>
            </dl>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {METRICS.map((m) => <MetricChart key={m.key} m={m} year={year} />)}
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1360px]">
          <div className="relative grid h-9 overflow-hidden rounded-full border border-hairline-strong" style={{ gridTemplateColumns: ERAS.map((e) => `${e.to - e.from + 1}fr`).join(' ') }}>
            {ERAS.map((e) => (
              <div key={e.name} className={`flex items-center justify-center border-r border-hairline-strong text-[0.68rem] tracking-wide last:border-r-0 ${year >= e.from && year <= e.to ? 'bg-white/[0.08] text-ink' : 'text-ink-dim'}`}>
                <span className="truncate px-2">{e.name}</span>
              </div>
            ))}
            <div className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-red" style={{ left: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
