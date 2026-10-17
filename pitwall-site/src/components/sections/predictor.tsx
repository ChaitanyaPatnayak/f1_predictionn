import { useMemo, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Chapter } from '@/components/chapter'
import { gsap, useGSAP } from '@/lib/gsap'
import { D, pct } from '@/lib/data'
import { FEATURE_LABELS, predict, type RaceInputs } from '@/lib/model'
import { cn } from '@/lib/utils'

const PRESETS: { name: string; values: Partial<RaceInputs> }[] = [
  { name: 'Pole in a top car', values: { grid: 1, form: 2.5, starts: 150, age: 27 } },
  { name: 'Bad qualifying, fast car', values: { grid: 15, form: 3, starts: 150, age: 28 } },
  { name: 'Rookie in the midfield', values: { grid: 11, form: 10, starts: 0, age: 19 } },
  { name: 'Veteran in a back-marker', values: { grid: 17, form: 16, starts: 300, age: 39 } },
]

const scores = D.model.scores['Multiple Linear Regression']

function Control(props: {
  id: string; label: string; value: number; display: string; min: number; max: number; step: number
  hint: string; onChange: (v: number) => void
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={props.id} className="eyebrow">{props.label}</label>
        <output htmlFor={props.id} className="num text-xl font-medium">{props.display}</output>
      </div>
      <Slider id={props.id} value={[props.value]} min={props.min} max={props.max} step={props.step}
        onValueChange={([v]) => props.onChange(v)} aria-label={props.label} />
      <p className="text-[0.8rem] leading-snug text-ink-dim">{props.hint}</p>
    </div>
  )
}

export function Predictor() {
  const [s, setS] = useState<RaceInputs>({ grid: 15, form: 3, starts: 150, age: 28, street: false, home: false, groundEffect: true })
  const r = useMemo(() => predict(s), [s])
  const bigRef = useRef<HTMLDivElement>(null)
  const set = (patch: Partial<RaceInputs>) => setS((prev) => ({ ...prev, ...patch }))

  useGSAP(() => {
    gsap.fromTo(bigRef.current, { yPercent: 12, opacity: 0.35 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out' })
  }, { dependencies: [r.position] })

  const delta = s.grid - r.value
  const verdict = delta > 0.5 ? `Expected to gain ${delta.toFixed(1)} places from the grid`
    : delta < -0.5 ? `Expected to lose ${(-delta).toFixed(1)} places from the grid` : 'Expected to finish where it starts'

  return (
    <Chapter
      id="predictor"
      index="01"
      eyebrow="Multiple linear regression"
      title={<>Predict the<br />finishing position</>}
      deck={<>Trained on 2014 to 2023, tested on the unseen 2024 and 2025 seasons: R² {scores['R²'].toFixed(2)}, average error {scores.MAE.toFixed(2)} places. Every input is known before the lights go out.</>}
    >
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Scenario presets">
        {PRESETS.map((p) => (
          <button key={p.name} type="button" onClick={() => set(p.values)}
            className="rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition hover:border-ink hover:text-ink">
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)]">
        <div className="grid content-start gap-8 bg-panel p-6 md:p-8">
          <Control id="grid" label="Grid position" value={s.grid} display={`P${s.grid}`} min={1} max={20} step={1}
            hint="Where the car starts. P1 is pole position." onChange={(v) => set({ grid: v })} />
          <Control id="form" label="Team form" value={s.form} display={s.form.toFixed(1)} min={1.5} max={18} step={0.5}
            hint="Team's average finish over its last three races. About 3 for a top team, 10 midfield, 16 at the back." onChange={(v) => set({ form: v })} />
          <Control id="starts" label="Career starts" value={s.starts} display={String(s.starts)} min={0} max={350} step={5}
            hint="Previous Grand Prix starts. A rookie has none." onChange={(v) => set({ starts: v })} />
          <Control id="age" label="Driver age" value={s.age} display={String(s.age)} min={18} max={42} step={1}
            hint="Age on race day." onChange={(v) => set({ age: v })} />
          <div className="grid gap-4 border-t border-hairline-strong pt-6">
            {([['street', 'Street circuit'], ['home', 'Home Grand Prix'], ['groundEffect', '2022+ regulations']] as const).map(([key, label]) => (
              <label key={key} htmlFor={`sw-${key}`} className="flex cursor-pointer items-center justify-between gap-4 text-sm">
                <span>{label}</span>
                <Switch id={`sw-${key}`} checked={s[key]} onCheckedChange={(v) => set({ [key]: v })} />
              </label>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-8 bg-panel p-6 md:p-10">
          <div className="grid gap-3">
            <span className="eyebrow">Predicted finish</span>
            <div className="overflow-hidden">
              <div ref={bigRef} className="display text-[clamp(6rem,15vw,12rem)] leading-[0.8] text-red">P{r.position}</div>
            </div>
            <p className="num text-sm text-ink-muted">
              model value {r.value.toFixed(1)} · 95% prediction interval P{r.low} to P{r.high}
            </p>
            <p className="text-lg">{verdict}.</p>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hairline-strong">
            <div className="grid gap-1 bg-panel-2 p-4">
              <span className="num text-2xl">{pct(D.winByGrid[String(s.grid)], 1)}</span>
              <span className="text-xs text-ink-dim">of starts from P{s.grid} were won, 2014 to 2025</span>
            </div>
            <div className="grid gap-1 bg-panel-2 p-4">
              <span className="num text-2xl">{pct(D.podiumByGrid[String(s.grid)], 1)}</span>
              <span className="text-xs text-ink-dim">of starts from P{s.grid} ended on the podium</span>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="eyebrow">What moved the prediction</span>
              <span className="text-xs text-ink-dim">places vs a typical driver</span>
            </div>
            {FEATURE_LABELS.map((label, i) => {
              const c = r.contributions[i]
              const w = Math.min(50, (Math.abs(c) / 6) * 50)
              return (
                <div key={label} className="grid grid-cols-[7.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
                  <span className="text-ink-muted">{label}</span>
                  <span className="relative h-2.5 rounded-full bg-panel-2">
                    <span className="absolute inset-y-[-4px] left-1/2 w-px bg-hairline-strong" />
                    <span className={cn('absolute inset-y-0 rounded-full transition-all duration-300', c > 0 ? 'bg-red' : 'bg-ink')}
                      style={{ width: `${w}%`, left: c > 0 ? '50%' : `${50 - w}%` }} />
                  </span>
                  <span className="num text-right">{c > 0.05 ? '+' : c < -0.05 ? '−' : ''}{Math.abs(c).toFixed(1)}</span>
                </div>
              )
            })}
            <p className="text-xs text-ink-dim">White bars gain places, red bars cost places. The typical driver starts P10 in a midfield car with 106 starts, aged 27.</p>
          </div>
        </div>

        <div className="bg-panel p-6 md:p-8">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="eyebrow">Timing tower</span>
            <span className="text-xs text-ink-dim">95% interval</span>
          </div>
          <ol className="grid gap-[3px]">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((p) => {
              const hit = p === r.position
              const band = p >= r.low && p <= r.high
              return (
                <li key={p} className={cn('num flex h-7 items-center justify-between rounded-md px-3 text-xs transition-colors duration-300',
                  hit ? 'bg-red text-carbon' : band ? 'bg-white/[0.09] text-ink' : 'bg-white/[0.025] text-ink-dim')}>
                  <span className="font-medium">P{p}</span>
                  {p === s.grid && <span className={cn('text-[0.65rem] tracking-[0.18em]', hit ? 'text-carbon' : 'text-red')}>GRID</span>}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </Chapter>
  )
}
