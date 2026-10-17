import { useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Chapter } from '@/components/chapter'
import { D } from '@/lib/data'
import { prefersReducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const binary = (k: number, n: number) => Array.from({ length: n }, (_, i) => (i < k ? 1 : 0))
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

type Experiment = {
  key: 'rules' | 'pole'
  tab: string
  a: number[]
  b: number[]
  aLabel: string
  bLabel: string
  h0: string
  metric: string
  span: number
  fmt: (v: number) => string
  diffFmt: (v: number) => string
  reference: string
}

const EXPERIMENTS: Experiment[] = [
  {
    key: 'rules', tab: '2022 rules and overtaking', a: D.abOrder.A, b: D.abOrder.B,
    aLabel: 'A · 2017 to 2021', bLabel: 'B · 2022 to 2025',
    h0: 'The 2022 ground-effect rules did not change how much the running order reshuffles.',
    metric: 'Order change per race, in places', span: 0.6,
    fmt: (v) => v.toFixed(2), diffFmt: (v) => `${v > 0 ? '+' : ''}${v.toFixed(3)} places`,
    reference: 'Notebook: Welch t-test p = 0.023 · Mann–Whitney p = 0.024 · Cohen’s d = 0.33',
  },
  {
    key: 'pole', tab: 'Hybrid era and pole position', a: binary(...D.abPole.A), b: binary(...D.abPole.B),
    aLabel: 'A · 2000 to 2013', bLabel: 'B · 2014 to 2025',
    h0: 'Pole position converts into victory equally often in both eras.',
    metric: 'Share of poles converted to wins', span: 0.16,
    fmt: (v) => `${(100 * v).toFixed(1)}%`, diffFmt: (v) => `${v > 0 ? '+' : ''}${(100 * v).toFixed(1)} points`,
    reference: 'Notebook: two-proportion z-test p = 0.35 · Cohen’s h = 0.08',
  },
]

const TOTAL = 4000
const W = 640, H = 260, M = { l: 40, r: 16, t: 16, b: 40 }

function shuffledDiff(pool: number[], nA: number) {
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = pool[i]; pool[i] = pool[j]; pool[j] = t
  }
  let sA = 0, sB = 0
  for (let i = 0; i < pool.length; i++) (i < nA ? (sA += pool[i]) : (sB += pool[i]))
  return sB / (pool.length - nA) - sA / nA
}

function Strip({ e }: { e: Experiment }) {
  if (e.key === 'pole') {
    return (
      <div className="grid gap-6">
        {[[e.aLabel, e.a, 'bg-ink'], [e.bLabel, e.b, 'bg-red']].map(([label, arr, color]) => {
          const rate = mean(arr as number[])
          return (
            <div key={label as string} className="grid gap-2">
              <div className="flex justify-between text-sm"><span className="text-ink-muted">{label as string}</span><span className="num">{e.fmt(rate)} won</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-panel-2"><div className={cn('h-full rounded-full', color as string)} style={{ width: `${100 * rate}%` }} /></div>
              <span className="num text-xs text-ink-dim">{(arr as number[]).filter(Boolean).length} wins from {(arr as number[]).length} poles</span>
            </div>
          )
        })}
      </div>
    )
  }
  const x = d3.scaleLinear().domain([0, 5.5]).range([12, 508])
  let seed = 11
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  return (
    <svg viewBox="0 0 520 200" className="w-full" role="img" aria-label="Order change per race for each group, with group means">
      {[[e.aLabel, e.a, '#f5f5f5'], [e.bLabel, e.b, '#ff2c2c']].map(([label, arr, color], g) => {
        const yc = 52 + g * 82
        const m = mean(arr as number[])
        return (
          <g key={label as string}>
            <text x={12} y={yc - 30} fill="rgba(245,245,245,0.6)" fontSize={12} fontFamily="Inter">{label as string}</text>
            {(arr as number[]).map((v, i) => (
              <circle key={i} cx={x(v)} cy={yc + (rnd() - 0.5) * 28} r={3.2} fill={color as string} fillOpacity={0.55} />
            ))}
            <line x1={x(m)} x2={x(m)} y1={yc - 20} y2={yc + 20} stroke={color as string} strokeWidth={2.5} />
            <text x={x(m) + 6} y={yc - 12} fill={color as string} fontSize={12} fontFamily="JetBrains Mono">mean {m.toFixed(2)}</text>
          </g>
        )
      })}
      {[0, 1, 2, 3, 4, 5].map((t) => (
        <text key={t} x={x(t)} y={194} textAnchor="middle" fill="rgba(245,245,245,0.45)" fontSize={11} fontFamily="JetBrains Mono">{t}</text>
      ))}
    </svg>
  )
}

export function ABLab() {
  const [idx, setIdx] = useState(0)
  const [diffs, setDiffs] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const raf = useRef(0)
  const e = EXPERIMENTS[idx]
  const observed = mean(e.b) - mean(e.a)

  const extreme = useMemo(() => diffs.filter((d) => Math.abs(d) >= Math.abs(observed) - 1e-12).length, [diffs, observed])
  const p = diffs.length ? extreme / diffs.length : null

  const run = () => {
    if (running) return
    setRunning(true)
    const pool = e.a.concat(e.b)
    const out: number[] = []
    const step = prefersReducedMotion() ? TOTAL : 90
    const tick = () => {
      for (let i = 0; i < step && out.length < TOTAL; i++) out.push(shuffledDiff(pool, e.a.length))
      setDiffs(out.slice())
      if (out.length < TOTAL) raf.current = requestAnimationFrame(tick)
      else setRunning(false)
    }
    tick()
  }

  const choose = (i: number) => {
    if (running) return
    cancelAnimationFrame(raf.current)
    setIdx(i)
    setDiffs([])
  }

  const x = d3.scaleLinear().domain([-e.span, e.span]).range([M.l, W - M.r])
  const bins = d3.bin().domain([-e.span, e.span]).thresholds(44)(diffs)
  const y = d3.scaleLinear().domain([0, Math.max(12, d3.max(bins, (b) => b.length) ?? 12)]).range([H - M.b, M.t])
  const significant = p != null && p < 0.05

  return (
    <Chapter
      id="lab"
      index="03"
      eyebrow="A/B testing · permutation test"
      title={<>Re-run the<br />A/B tests live</>}
      deck="If the change made no difference, the A and B labels are arbitrary. Shuffle them thousands of times and count how often chance alone matches the real gap. That share is the p-value, computed here in your browser."
    >
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Experiments">
        {EXPERIMENTS.map((x, i) => (
          <button key={x.key} type="button" role="tab" aria-selected={i === idx} onClick={() => choose(i)}
            className={cn('rounded-full border px-4 py-2 text-sm font-medium transition',
              i === idx ? 'border-ink bg-ink text-carbon' : 'border-hairline-strong text-ink-muted hover:border-ink hover:text-ink')}>
            {x.tab}
          </button>
        ))}
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="grid content-start gap-8 bg-panel p-6 md:p-8">
          <dl className="grid gap-4 text-sm">
            <div className="grid gap-1"><dt className="eyebrow">Null hypothesis</dt><dd className="text-base leading-relaxed">{e.h0}</dd></div>
            <div className="grid gap-1"><dt className="eyebrow">Metric</dt><dd>{e.metric}</dd></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1"><dt className="eyebrow">{e.aLabel}</dt><dd className="num text-xl">{e.fmt(mean(e.a))}</dd><dd className="text-xs text-ink-dim">{e.a.length} {e.key === 'pole' ? 'poles' : 'races'}</dd></div>
              <div className="grid gap-1"><dt className="eyebrow text-red">{e.bLabel}</dt><dd className="num text-xl text-red">{e.fmt(mean(e.b))}</dd><dd className="text-xs text-ink-dim">{e.b.length} {e.key === 'pole' ? 'poles' : 'races'}</dd></div>
            </div>
            <div className="grid gap-1"><dt className="eyebrow">Observed difference, B minus A</dt><dd className="num text-xl">{e.diffFmt(observed)}</dd></div>
          </dl>
          <Strip e={e} />
        </div>

        <div className="grid content-start gap-6 bg-panel p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="grid gap-2">
              <span className="eyebrow">Permutation p-value</span>
              <span className={cn('display text-[clamp(3rem,7vw,5.5rem)] leading-none', p == null ? 'text-ink-dim' : significant ? 'text-red' : 'text-ink')}>
                {p == null ? '––' : p < 0.001 ? '<.001' : p.toFixed(3).replace(/^0/, '')}
              </span>
              <span className="text-sm text-ink-muted">
                {p == null ? 'Press run to start shuffling.' : running ? 'Shuffling…'
                  : significant ? 'Below 0.05: reject the null hypothesis. Chance rarely produces a gap this large.'
                    : 'Above 0.05: fail to reject. Chance produces a gap this large often.'}
              </span>
            </div>
            <div className="grid justify-items-end gap-2">
              <button type="button" onClick={run} disabled={running}
                className="rounded-full bg-red px-6 py-3 text-sm font-semibold text-carbon transition hover:brightness-110 disabled:opacity-50">
                {diffs.length ? 'Run again' : `Run ${TOTAL.toLocaleString('en-US')} shuffles`}
              </button>
              <span className="num text-xs text-ink-dim">{diffs.length.toLocaleString('en-US')} shuffles · {extreme} as extreme</span>
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-panel-2"><div className="h-full bg-red transition-[width] duration-100" style={{ width: `${(100 * diffs.length) / TOTAL}%` }} /></div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Histogram of differences under shuffling, with the observed difference marked">
            {y.ticks(4).map((t) => (
              <g key={t}>
                <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
                <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fill="rgba(245,245,245,0.45)" fontSize={11} fontFamily="JetBrains Mono">{t}</text>
              </g>
            ))}
            {bins.map((b, i) => {
              const tail = Math.abs(((b.x0 ?? 0) + (b.x1 ?? 0)) / 2) >= Math.abs(observed)
              return (
                <rect key={i} x={x(b.x0 ?? 0) + 1} width={Math.max(0, x(b.x1 ?? 0) - x(b.x0 ?? 0) - 2)}
                  y={y(b.length)} height={y(0) - y(b.length)} rx={1.5}
                  fill={tail ? '#ff2c2c' : 'rgba(245,245,245,0.22)'} />
              )
            })}
            {[observed, -observed].map((v, i) => (
              <line key={i} x1={x(v)} x2={x(v)} y1={M.t} y2={H - M.b} stroke="#f5f5f5" strokeWidth={1.5} strokeDasharray={i ? '4 5' : undefined} />
            ))}
            <text x={x(observed) + 6} y={M.t + 12} fill="#f5f5f5" fontSize={11} fontFamily="JetBrains Mono">observed</text>
            {x.ticks(6).map((t) => (
              <text key={t} x={x(t)} y={H - M.b + 18} textAnchor="middle" fill="rgba(245,245,245,0.45)" fontSize={11} fontFamily="JetBrains Mono">
                {e.key === 'pole' ? `${(100 * t).toFixed(0)}` : t.toFixed(1)}
              </text>
            ))}
            <text x={W - M.r} y={H - 4} textAnchor="end" fill="rgba(245,245,245,0.45)" fontSize={11} fontFamily="Inter">
              difference after shuffling{e.key === 'pole' ? ' (points)' : ' (places)'} · red = at least as extreme as observed
            </text>
          </svg>
          <p className="num text-xs text-ink-dim">{e.reference}</p>
        </div>
      </div>
    </Chapter>
  )
}
