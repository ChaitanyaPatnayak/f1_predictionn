import { useState } from 'react'
import * as d3 from 'd3'
import { Chapter } from '@/components/chapter'
import { Slider } from '@/components/ui/slider'
import { AGE_BANDS, D, EXP_BANDS, ageBand, careerProb, expBand, pct } from '@/lib/data'
import { cn } from '@/lib/utils'

const heat = d3.scaleLinear<string>().domain([0.2, 0.5, 0.88]).range(['#2a0f0f', '#ff2c2c', '#ffe3df']).clamp(true)

function Donut() {
  const parts = [
    { label: 'The car', note: 'team and season', v: D.variance.car, color: '#ff2c2c' },
    { label: 'The driver', note: 'within the same car', v: D.variance.driver, color: '#f5f5f5' },
    { label: 'The day', note: 'incidents, strategy, luck', v: D.variance.luck, color: 'rgba(245,245,245,0.14)' },
  ]
  const arcs = d3.pie<(typeof parts)[number]>().sort(null).value((d) => d.v).padAngle(0.012)(parts)
  const arc = d3.arc<d3.PieArcDatum<(typeof parts)[number]>>().innerRadius(82).outerRadius(124).cornerRadius(3)
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <svg viewBox="-130 -130 260 260" className="w-full max-w-[260px]" role="img" aria-label="Car 60 percent, driver 4.5 percent, unexplained 35 percent">
        {arcs.map((a) => <path key={a.data.label} d={arc(a) ?? ''} fill={a.data.color} />)}
        <text textAnchor="middle" y={4} fill="#f5f5f5" fontSize={40} fontFamily="Boldonse">13.6×</text>
        <text textAnchor="middle" y={30} fill="rgba(245,245,245,0.6)" fontSize={11} fontFamily="Inter">car over driver</text>
      </svg>
      <ul className="grid gap-5">
        {parts.map((p) => (
          <li key={p.label} className="grid grid-cols-[14px_minmax(0,1fr)_auto] items-baseline gap-3">
            <span className="h-3.5 w-3.5 rounded-sm" style={{ background: p.color }} />
            <span><span className="font-semibold">{p.label}</span> <span className="text-sm text-ink-dim">{p.note}</span></span>
            <span className="num text-xl">{pct(p.v, 1)}</span>
          </li>
        ))}
        <li className="text-sm leading-relaxed text-ink-muted">Top drivers tend to join top teams, so read the car’s share as an upper bound and the driver’s as a lower bound.</li>
      </ul>
    </div>
  )
}

export function Drivers() {
  const [age, setAge] = useState(29)
  const [starts, setStarts] = useState(140)
  const ai = ageBand(age), ei = expBand(starts)
  const p = careerProb(ai, ei)

  return (
    <Chapter
      id="drivers"
      index="06"
      eyebrow="Nested ANOVA · Bradley–Terry model"
      title={<>Car, driver,<br />and the career curve</>}
      deck="Comparing teammates removes the car from the equation. Experience makes a driver stronger and age makes them weaker, as two separate effects that balance between 28 and 30."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-2">
        <div className="grid content-start gap-8 bg-panel p-6 md:p-10">
          <span className="eyebrow">Variance in finishing position · 2014 to 2025</span>
          <Donut />
        </div>
        <div className="grid content-start gap-7 bg-panel p-6 md:p-10">
          <span className="eyebrow">Build a driver</span>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-3">
              <div className="flex justify-between"><label htmlFor="b-age" className="text-sm text-ink-muted">Age</label><output className="num text-lg">{age}</output></div>
              <Slider id="b-age" value={[age]} min={19} max={40} step={1} onValueChange={([v]) => setAge(v)} aria-label="Age" />
            </div>
            <div className="grid gap-3">
              <div className="flex justify-between"><label htmlFor="b-starts" className="text-sm text-ink-muted">Career starts</label><output className="num text-lg">{starts}</output></div>
              <Slider id="b-starts" value={[starts]} min={0} max={320} step={5} onValueChange={([v]) => setStarts(v)} aria-label="Career starts" />
            </div>
          </div>
          <p className="text-lg leading-snug">
            Beats a rookie teammate aged 24 or under <span className="display text-[1.6rem] text-red">{Math.round(100 * p)}%</span> of the time.
          </p>
          <div className="overflow-x-auto">
            <div className="grid min-w-[420px] grid-cols-[56px_repeat(6,minmax(0,1fr))] gap-1 text-xs">
              <span />
              {EXP_BANDS.map((b) => <span key={b} className="num pb-1 text-center text-ink-dim">{b}</span>)}
              {AGE_BANDS.map((a, r) => (
                <div key={a} className="contents">
                  <span className="num flex items-center text-ink-dim">{a}</span>
                  {EXP_BANDS.map((_, c) => {
                    const v = careerProb(r, c)
                    const sel = r === ai && c === ei
                    return (
                      <button key={c} type="button" onClick={() => { setAge([22, 26, 29, 32, 35, 38][r]); setStarts([10, 35, 75, 125, 175, 250][c]) }}
                        aria-label={`Age ${a}, ${EXP_BANDS[c]} starts: ${Math.round(100 * v)} percent`}
                        className={cn('num grid aspect-[1.6] place-items-center rounded-md text-[0.78rem] font-medium transition-[outline] duration-200',
                          sel ? 'outline outline-2 outline-offset-2 outline-ink' : '')}
                        style={{ background: heat(v), color: v > 0.62 ? '#0a0a0a' : '#f5f5f5' }}>
                        {Math.round(100 * v)}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-dim">Rows: age band. Columns: previous starts. Each cell is the chance of beating a teammate aged 24 or under with 0 to 20 starts.</p>
          </div>
        </div>
      </div>
    </Chapter>
  )
}
