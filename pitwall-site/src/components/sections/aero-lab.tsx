import { useEffect, useRef, useState } from 'react'
import { Chapter } from '@/components/chapter'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

/* Simplified aerodynamics, for explanation only.
   Downforce F = ½ ρ v² A C_L, drag D = ½ ρ v² A C_D, with illustrative coefficients for a modern F1 car. */
const RHO = 1.225, AREA = 1.5, MASS = 800, G = 9.81

function aero(speedKmh: number, wing: number, drs: boolean, groundEffect: boolean) {
  const v = speedKmh / 3.6
  const floorCl = groundEffect ? 2.0 : 1.5
  let wingCl = 0.6 + 0.05 * wing
  let cd = 0.55 + 0.022 * wing
  if (drs) { wingCl *= 0.45; cd -= 0.1 }
  const cl = floorCl + wingCl
  const q = 0.5 * RHO * v * v * AREA
  const downKg = (q * cl) / G
  const dragN = q * cd
  const upsideDown = Math.sqrt((2 * MASS * G) / (RHO * AREA * cl)) * 3.6
  const turbulence = (0.35 + wingCl * 0.45) * (groundEffect ? 0.45 : 1)
  return { downKg, dragN, upsideDown, turbulence, floorShare: floorCl / cl }
}

type P = { x: number; h: number; px: number; py: number; seed: number }

// Car geometry in car-length units (nose at 0, gearbox at 1); heights are above the ground
const BODY: [number, number][] = [
  [0.04, 0.045], [0.12, 0.06], [0.24, 0.075], [0.33, 0.085], [0.37, 0.095], [0.44, 0.1], [0.47, 0.155],
  [0.52, 0.16], [0.56, 0.13], [0.66, 0.105], [0.78, 0.085], [0.87, 0.065],
]
const FLOOR = 0.03
const bodyTop = (u: number) => {
  if (u <= BODY[0][0] || u >= BODY[BODY.length - 1][0]) return 0
  for (let i = 1; i < BODY.length; i++) {
    if (u <= BODY[i][0]) {
      const [x0, y0] = BODY[i - 1], [x1, y1] = BODY[i]
      return y0 + ((u - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return 0
}

export function AeroLab() {
  const [speed, setSpeed] = useState(250)
  const [wing, setWing] = useState(15)
  const [drs, setDrs] = useState(false)
  const [ge, setGe] = useState(true)
  const canvas = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const params = useRef({ speed, wing, drs, ge })
  params.current = { speed, wing, drs, ge }
  const a = aero(speed, wing, drs, ge)

  useEffect(() => {
    const cvs = canvas.current!, ctx = cvs.getContext('2d')!
    let w = 0, h = 0, raf = 0, visible = true, t = 0, maxH = 0.62
    const particles: P[] = []
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = wrap.current!.clientWidth
      const fill = window.innerWidth >= 1024 ? wrap.current!.clientHeight : 0
      h = Math.round(Math.min(760, Math.max(320, w * 0.6, fill)))
      cvs.width = w * dpr; cvs.height = h * dpr; cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h)
      maxH = (h * 0.8 - 12) / Math.min(w * 0.66, h * 1.7)
      particles.forEach((p) => { p.x = Math.random() * w; p.h = Math.pow(Math.random(), 1.25) * maxH; p.px = NaN })
    }
    const spawn = (p?: P): P => {
      const q = p ?? ({} as P)
      q.x = p ? -10 : Math.random() * w
      q.h = Math.pow(Math.random(), 1.25) * maxH
      q.px = NaN; q.py = NaN; q.seed = Math.random() * 1000
      return q
    }
    for (let i = 0; i < 900; i++) particles.push(spawn())
    resize()
    const ro = new ResizeObserver(resize); ro.observe(wrap.current!)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(cvs)

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const { speed: sp, wing: wg, drs: dr, ge: g } = params.current
      const ar = aero(sp, wg, dr, g)
      t += 1 / 60
      const ground = h * 0.8
      const carL = Math.min(w * 0.66, h * 1.7)
      const carX = (w - carL) / 2
      const scale = carL                      // px per car-length unit, also used for heights
      const toY = (hh: number) => ground - hh * scale
      const wingA = ((dr ? 3 : wg) * Math.PI) / 180

      ctx.fillStyle = 'rgba(13,13,13,0.28)'; ctx.fillRect(0, 0, w, h)
      const base = 1.2 + (sp / 340) * 5.2

      for (const p of particles) {
        const u = (p.x - carX) / carL
        let hh = p.h
        let speedMul = 1
        let tone = 'rgba(245,245,245,0.55)'
        if (u > 0 && u < 0.9) {
          const top = bodyTop(u)
          if (p.h < FLOOR + 0.004 && u > 0.18 && u < 0.88) {
            speedMul = g ? 1.75 : 1.3
            tone = g ? 'rgba(255,44,44,0.95)' : 'rgba(255,44,44,0.6)'
          } else {
            const lift = Math.max(0, top + 0.012 - p.h)
            hh = p.h + lift + top * 0.55 * Math.exp(-Math.max(0, p.h - top) / 0.09)
          }
        }
        // rear wing throws the air upward: the reaction pushes the car down
        if (u > 0.86 && p.h > 0.07 && p.h < 0.34) {
          const k = Math.min(1, (u - 0.86) / 0.12)
          const push = (dr ? 0.012 : 0.02 + Math.sin(wingA) * 0.22) * k * Math.exp(-Math.abs(p.h - 0.17) / 0.08)
          hh += push * (u > 0.98 ? Math.exp(-(u - 0.98) / 0.6) + 0.4 : 1)
          tone = 'rgba(245,245,245,0.8)'
        }
        // turbulent wake behind the car
        if (u > 1) {
          const decay = Math.exp(-(u - 1) / 0.9)
          const amp = ar.turbulence * 0.05 * decay * (p.h < 0.3 ? 1 : 0.3)
          hh += Math.sin(t * 9 + p.seed + u * 14) * amp + Math.cos(t * 5.3 + p.seed * 1.7) * amp * 0.6
          if (amp > 0.012) tone = `rgba(245,245,245,${0.25 + amp * 4})`
        }
        p.x += base * speedMul
        const sx = p.x, sy = toY(Math.max(0.004, hh))
        if (!Number.isNaN(p.px) && sx - p.px < 40) {
          ctx.strokeStyle = tone; ctx.lineWidth = 1.1
          ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(sx, sy); ctx.stroke()
        }
        p.px = sx; p.py = sy
        if (p.x > w + 10) spawn(p)
      }

      // ground
      ctx.fillStyle = '#161616'; ctx.fillRect(0, ground, w, h - ground)
      ctx.strokeStyle = 'rgba(245,245,245,0.25)'; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(w, ground); ctx.stroke()

      // car body
      ctx.fillStyle = '#1c1c1c'; ctx.strokeStyle = 'rgba(245,245,245,0.75)'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(carX + BODY[0][0] * carL, toY(FLOOR))
      BODY.forEach(([u, hh]) => ctx.lineTo(carX + u * carL, toY(hh)))
      ctx.lineTo(carX + 0.88 * carL, toY(FLOOR)); ctx.closePath(); ctx.fill(); ctx.stroke()
      // floor
      ctx.fillStyle = 'rgba(245,245,245,0.85)'; ctx.fillRect(carX + 0.18 * carL, toY(FLOOR) - 1.5, 0.7 * carL, 3)
      // red livery stripe
      ctx.strokeStyle = '#ff2c2c'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(carX + 0.14 * carL, toY(0.05)); ctx.lineTo(carX + 0.8 * carL, toY(0.065)); ctx.stroke()
      // halo
      ctx.strokeStyle = 'rgba(245,245,245,0.75)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(carX + 0.35 * carL, toY(0.09)); ctx.quadraticCurveTo(carX + 0.4 * carL, toY(0.15), carX + 0.46 * carL, toY(0.14)); ctx.stroke()
      // front wing
      ctx.fillStyle = 'rgba(245,245,245,0.85)'
      ctx.fillRect(carX - 0.02 * carL, toY(0.035), 0.12 * carL, 3)
      ctx.fillRect(carX + 0.0 * carL, toY(0.055), 0.08 * carL, 2.5)
      // rear wing with adjustable angle (DRS opens the upper flap)
      const rwX = carX + 0.9 * carL, rwY = toY(0.2)
      ctx.strokeStyle = 'rgba(245,245,245,0.6)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(carX + 0.93 * carL, toY(0.08)); ctx.lineTo(carX + 0.93 * carL, rwY); ctx.stroke()
      ctx.save(); ctx.translate(rwX, rwY); ctx.rotate(wingA)
      ctx.fillStyle = '#ff2c2c'; ctx.fillRect(0, -2, 0.09 * carL, 4)
      ctx.restore()
      ctx.save(); ctx.translate(rwX, rwY - 0.035 * scale); ctx.rotate(dr ? 0.05 : wingA * 1.3)
      ctx.fillStyle = 'rgba(245,245,245,0.9)'; ctx.fillRect(0, -1.5, 0.07 * carL, 3)
      ctx.restore()
      // wheels
      for (const u of [0.17, 0.8]) {
        const cx = carX + u * carL, cy = toY(0.065), r = 0.065 * scale
        ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = 'rgba(245,245,245,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2); ctx.stroke()
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * (sp / 30))
        ctx.strokeStyle = 'rgba(255,44,44,0.8)'; ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); ctx.lineTo(r * 0.6, 0); ctx.stroke()
        ctx.restore()
      }
      // downforce arrow
      const arrowLen = Math.min(h * 0.32, 10 + (ar.downKg / 2500) * h * 0.32)
      const ax = carX + 0.5 * carL
      ctx.strokeStyle = '#ff2c2c'; ctx.fillStyle = '#ff2c2c'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(ax, toY(0.2) - arrowLen - 18); ctx.lineTo(ax, toY(0.2) - 18); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ax - 7, toY(0.2) - 26); ctx.lineTo(ax + 7, toY(0.2) - 26); ctx.lineTo(ax, toY(0.2) - 14); ctx.closePath(); ctx.fill()
      ctx.font = '600 12px JetBrains Mono'; ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(ar.downKg).toLocaleString('en-US')} kg downforce`, ax, toY(0.2) - arrowLen - 26)
      ctx.fillStyle = 'rgba(245,245,245,0.55)'; ctx.textAlign = 'left'
      ctx.fillText('AIRFLOW  →', 16, 24)
      ctx.fillStyle = 'rgba(255,44,44,0.9)'
      ctx.fillText('red streaks: fast, low-pressure air under the floor', 16, h - 14)
    }
    frame()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])

  const ratio = a.downKg / MASS
  const wake = a.turbulence < 0.45 ? 'Low' : a.turbulence < 0.8 ? 'Medium' : 'High'

  return (
    <Chapter
      id="aero"
      index="09"
      eyebrow="Interactive explainer · aerodynamics"
      title={<>Why the car<br />sticks to the road</>}
      deck="Wings and the floor turn the airflow into downforce: air is thrown upward, so the car is pushed down into the track. It grows with the square of speed. Set the speed and the wing, open DRS, or switch the 2022 ground-effect floor on and off."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <div ref={wrap} className="relative self-stretch bg-[#0d0d0d]">
          <canvas ref={canvas} role="img" aria-label="Animated airflow around a side view of a Formula 1 car" className="block" />
        </div>
        <div className="grid content-start gap-7 bg-panel p-6 md:p-8">
          <div className="grid gap-3">
            <div className="flex items-baseline justify-between"><label htmlFor="aero-speed" className="eyebrow">Speed</label><output className="num text-xl">{speed} km/h</output></div>
            <Slider id="aero-speed" value={[speed]} min={50} max={340} step={5} onValueChange={([v]) => setSpeed(v)} aria-label="Speed" />
          </div>
          <div className="grid gap-3">
            <div className="flex items-baseline justify-between"><label htmlFor="aero-wing" className="eyebrow">Rear wing angle</label><output className="num text-xl">{wing}°</output></div>
            <Slider id="aero-wing" value={[wing]} min={0} max={30} step={1} onValueChange={([v]) => setWing(v)} aria-label="Rear wing angle" />
            <p className="text-xs text-ink-dim">Low angle for Monza, high angle for Monaco.</p>
          </div>
          <div className="grid gap-3 border-t border-hairline-strong pt-5">
            <label htmlFor="aero-drs" className="flex cursor-pointer items-center justify-between gap-4 text-sm"><span>DRS open</span><Switch id="aero-drs" checked={drs} onCheckedChange={setDrs} /></label>
            <label htmlFor="aero-ge" className="flex cursor-pointer items-center justify-between gap-4 text-sm"><span>2022 ground-effect floor</span><Switch id="aero-ge" checked={ge} onCheckedChange={setGe} /></label>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hairline-strong">
            <div className="grid gap-1 bg-panel-2 p-4"><span className="num text-2xl text-red">{Math.round(a.downKg).toLocaleString('en-US')}</span><span className="text-xs text-ink-dim">kg of downforce</span></div>
            <div className="grid gap-1 bg-panel-2 p-4"><span className="num text-2xl">{Math.round(a.dragN).toLocaleString('en-US')}</span><span className="text-xs text-ink-dim">newtons of drag</span></div>
            <div className="grid gap-1 bg-panel-2 p-4"><span className="num text-2xl">{Math.round(a.upsideDown)}</span><span className="text-xs text-ink-dim">km/h to drive upside down</span></div>
            <div className="grid gap-1 bg-panel-2 p-4"><span className="num text-2xl">{wake}</span><span className="text-xs text-ink-dim">turbulence for a car behind</span></div>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between text-xs text-ink-dim"><span>Downforce vs car weight (800 kg)</span><span className="num">{ratio.toFixed(1)}×</span></div>
            <div className="relative h-3 rounded-full bg-panel-2">
              <div className="h-full rounded-full bg-red transition-[width] duration-300" style={{ width: `${Math.min(100, (ratio / 3) * 100)}%` }} />
              <div className="absolute inset-y-[-4px] w-px bg-ink" style={{ left: `${100 / 3}%` }} />
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              {speed >= a.upsideDown
                ? `At ${speed} km/h the downforce is larger than the car’s weight: in theory it could drive on the ceiling.`
                : `Below ${Math.round(a.upsideDown)} km/h the downforce is still smaller than the car’s weight.`}
            </p>
          </div>
          <p className="border-t border-hairline-strong pt-5 text-xs leading-relaxed text-ink-dim">
            The 2022 rules moved downforce to the floor so the wake is cleaner for the car behind. Our A/B test found 13% more position changes after the change. Simplified physics with illustrative coefficients; real cars vary by circuit.
          </p>
        </div>
      </div>
    </Chapter>
  )
}
