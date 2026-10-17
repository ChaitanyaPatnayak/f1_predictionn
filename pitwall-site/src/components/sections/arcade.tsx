import { useCallback, useEffect, useRef, useState } from 'react'
import { Chapter } from '@/components/chapter'
import { cn } from '@/lib/utils'

const store = {
  get: (k: string) => { try { const v = localStorage.getItem(k); return v ? Number(v) : null } catch { return null } },
  set: (k: string, v: number) => { try { localStorage.setItem(k, String(v)) } catch { /* storage unavailable */ } },
}
const fmtTime = (s: number | null) => (s == null ? '–:–––' : `${Math.floor(s / 60)}:${(s % 60).toFixed(3).padStart(6, '0')}`)

/* ------------------------------------------------------------------ reaction start */

type Phase = 'idle' | 'arming' | 'hold' | 'go' | 'done' | 'jump'

function ReactionStart() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [lit, setLit] = useState(0)
  const [ms, setMs] = useState<number | null>(null)
  const [best, setBest] = useState<number | null>(() => store.get('pitwall-reaction-best'))
  const timers = useRef<number[]>([])
  const t0 = useRef(0)
  const phaseRef = useRef<Phase>('idle')
  phaseRef.current = phase

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const start = () => {
    clear(); setMs(null); setLit(0); setPhase('arming')
    for (let i = 1; i <= 5; i++) timers.current.push(window.setTimeout(() => setLit(i), i * 900))
    timers.current.push(window.setTimeout(() => setPhase('hold'), 5 * 900))
    const out = 5 * 900 + 400 + Math.random() * 2600
    timers.current.push(window.setTimeout(() => { setLit(0); setPhase('go'); t0.current = performance.now() }, out))
  }
  const press = useCallback(() => {
    const p = phaseRef.current
    if (p === 'idle' || p === 'done' || p === 'jump') { start(); return }
    if (p === 'arming' || p === 'hold') { clear(); setLit(0); setPhase('jump'); return }
    if (p === 'go') {
      const r = Math.round(performance.now() - t0.current)
      setMs(r); setPhase('done')
      setBest((b) => { const nb = b == null || r < b ? r : b; store.set('pitwall-reaction-best', nb); return nb })
    }
  }, [])
  useEffect(() => clear, [])

  const verdict = ms == null ? '' : ms < 200 ? 'Formula 1 reflexes.' : ms < 260 ? 'Quick. Close to a race start.' : ms < 350 ? 'Solid, but the field is gone.' : 'Stalled on the grid.'

  return (
    <div className="grid content-start gap-6 bg-panel p-6 md:p-8">
      <div className="grid gap-1">
        <span className="eyebrow">Game 1 · Lights out</span>
        <h3 className="text-2xl font-semibold">How fast is your start?</h3>
        <p className="text-sm text-ink-muted">Wait for all five lights, then press the moment they go out. F1 drivers usually react in about 0.2 seconds. Press too early and it is a jump start.</p>
      </div>
      <button type="button" onPointerDown={press} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press() } }}
        className="grid gap-6 rounded-2xl border border-hairline-strong bg-carbon p-6 text-left transition hover:border-white/30 focus-visible:border-red"
        aria-label="Reaction game. Press to start, then press when the lights go out.">
        <div className="flex justify-center gap-2 sm:gap-3" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid gap-2 rounded-xl bg-black p-2">
              {[0, 1].map((j) => (
                <span key={j} className={cn('block h-7 w-7 rounded-full transition-[background,box-shadow] duration-75 sm:h-9 sm:w-9',
                  lit >= i ? 'bg-red shadow-[0_0_24px_rgba(255,44,44,0.85)]' : 'bg-[#1d0b0b]')} />
              ))}
            </div>
          ))}
        </div>
        <div className="grid justify-items-center gap-1 text-center">
          <span className={cn('display text-[clamp(1.7rem,3vw,2.4rem)] leading-tight', phase === 'jump' ? 'text-red' : 'text-ink')}>
            {phase === 'idle' ? 'Start' : phase === 'arming' || phase === 'hold' ? 'Wait…' : phase === 'go' ? 'Go!' : phase === 'jump' ? 'Jump start' : `${ms} ms`}
          </span>
          <span className="text-sm text-ink-muted">
            {phase === 'done' ? `${verdict} Press to go again.` : phase === 'jump' ? 'You moved before the lights went out. Press to retry.' : 'Click, tap or press Space'}
          </span>
        </div>
      </button>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hairline-strong text-sm">
        <div className="grid gap-1 bg-panel-2 p-4"><span className="num text-xl">{best == null ? '–' : `${best} ms`}</span><span className="text-xs text-ink-dim">your best on this device</span></div>
        <div className="grid gap-1 bg-panel-2 p-4"><span className="num text-xl">≈ 200 ms</span><span className="text-xs text-ink-dim">typical F1 driver</span></div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ hot lap */

const VW = 960, VH = 560, TRACK_W = 40
const CONTROL: [number, number][] = [
  [0.12, 0.82], [0.42, 0.88], [0.74, 0.86], [0.9, 0.76], [0.88, 0.58], [0.76, 0.52], [0.7, 0.4], [0.8, 0.28],
  [0.77, 0.13], [0.6, 0.09], [0.47, 0.18], [0.4, 0.35], [0.27, 0.39], [0.15, 0.3], [0.07, 0.44], [0.06, 0.66],
]

function buildTrack() {
  const pts = CONTROL.map(([x, y]) => [60 + x * (VW - 120), 40 + y * (VH - 80)] as [number, number])
  const out: [number, number][] = []
  const n = pts.length, SEG = 40
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    for (let s = 0; s < SEG; s++) {
      const t = s / SEG, t2 = t * t, t3 = t2 * t
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  const N = out.length
  const curv = out.map((_, i) => {
    const a = out[(i - 4 + N) % N], b = out[i], c = out[(i + 4) % N]
    const h1 = Math.atan2(b[1] - a[1], b[0] - a[0]), h2 = Math.atan2(c[1] - b[1], c[0] - b[0])
    let d = h2 - h1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI
    const ds = Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(c[0] - b[0], c[1] - b[1])
    return Math.abs(d) / Math.max(1, ds)
  })
  // ghost speed profile: corner speed limit, then acceleration and braking limits
  const vmax = 255, aLat = 520, acc = 170, brk = 330
  const v = curv.map((k) => Math.min(vmax, Math.sqrt(aLat / Math.max(1e-4, k))))
  const segLen = out.map((p, i) => Math.hypot(out[(i + 1) % N][0] - p[0], out[(i + 1) % N][1] - p[1]))
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; v[j] = Math.min(v[j], Math.sqrt(v[i] ** 2 + 2 * acc * segLen[i])) }
    for (let i = N - 1; i >= 0; i--) { const j = (i + 1) % N; v[i] = Math.min(v[i], Math.sqrt(v[j] ** 2 + 2 * brk * segLen[i])) }
  }
  const ghostLap = segLen.reduce((s, l, i) => s + l / v[i], 0)
  return { pts: out, curv, v, segLen, ghostLap }
}
const TRACK = buildTrack()

function nearest(x: number, y: number, hint: number) {
  const N = TRACK.pts.length
  let best = hint, bd = Infinity
  for (let k = -60; k <= 60; k++) {
    const i = (hint + k + N) % N, p = TRACK.pts[i]
    const d = (p[0] - x) ** 2 + (p[1] - y) ** 2
    if (d < bd) { bd = d; best = i }
  }
  return { i: best, d: Math.sqrt(bd) }
}

function HotLap() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hud, setHud] = useState({ lap: 0, last: null as number | null, best: store.get('pitwall-hotlap-best'), speed: 0, offTrack: false, started: false })
  const keys = useRef({ up: false, down: false, left: false, right: false })
  const active = useRef(false)

  useEffect(() => {
    const cvs = canvas.current!, ctx = cvs.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cvs.width = VW * dpr; cvs.height = VH * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const N = TRACK.pts.length
    const start = TRACK.pts[0], next = TRACK.pts[3]
    const car = { x: start[0], y: start[1], a: Math.atan2(next[1] - start[1], next[0] - start[0]), v: 0, idx: 0 }
    const ghost = { s: 0, i: 0, t: 0 }
    let lapStart = 0, running = false, checkpoints = 0, last = performance.now(), raf = 0, visible = true, hudTick = 0
    let bestLap = store.get('pitwall-hotlap-best'), lastLap: number | null = null, lapClock = 0

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(cvs)

    const drawTrack = () => {
      ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, VW, VH)
      // subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1
      for (let gx = 0; gx < VW; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, VH); ctx.stroke() }
      for (let gy = 0; gy < VH; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(VW, gy); ctx.stroke() }
      const path = () => { ctx.beginPath(); TRACK.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath() }
      ctx.lineJoin = 'round'
      path(); ctx.strokeStyle = 'rgba(245,245,245,0.5)'; ctx.lineWidth = TRACK_W + 4; ctx.stroke()
      path(); ctx.strokeStyle = '#232323'; ctx.lineWidth = TRACK_W; ctx.stroke()
      path(); ctx.strokeStyle = 'rgba(245,245,245,0.06)'; ctx.setLineDash([10, 14]); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([])
      // kerbs on tight corners
      for (let i = 0; i < N; i += 2) {
        if (TRACK.curv[i] < 0.02) continue
        const p = TRACK.pts[i], q = TRACK.pts[(i + 2) % N]
        const nx = -(q[1] - p[1]), ny = q[0] - p[0], l = Math.hypot(nx, ny) || 1
        const side = (TRACK.curv[i] > 0 ? 1 : 1) * (TRACK_W / 2)
        ctx.strokeStyle = (i / 2) % 2 ? '#ff2c2c' : '#f5f5f5'; ctx.lineWidth = 4
        for (const sgn of [1, -1]) {
          ctx.beginPath()
          ctx.moveTo(p[0] + (nx / l) * side * sgn, p[1] + (ny / l) * side * sgn)
          ctx.lineTo(q[0] + (nx / l) * side * sgn, q[1] + (ny / l) * side * sgn)
          ctx.stroke()
        }
      }
      // start / finish line
      const p = TRACK.pts[0], q = TRACK.pts[1]
      const ang = Math.atan2(q[1] - p[1], q[0] - p[0])
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang)
      for (let r = 0; r < 8; r++) for (let c = 0; c < 2; c++) {
        ctx.fillStyle = (r + c) % 2 ? '#0a0a0a' : '#f5f5f5'
        ctx.fillRect(-4 + c * 4, -TRACK_W / 2 + r * (TRACK_W / 8), 4, TRACK_W / 8)
      }
      ctx.restore()
    }
    const drawCar = (x: number, y: number, a: number, color: string, alpha = 1) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = alpha
      ctx.fillStyle = color; ctx.fillRect(-9, -3.5, 18, 7)
      ctx.fillRect(7, -6, 4, 12); ctx.fillRect(-11, -5.5, 3, 11)
      ctx.fillStyle = '#0a0a0a'
      for (const [wx, wy] of [[-6, -6], [-6, 4], [5, -6], [5, 4]]) ctx.fillRect(wx, wy, 4, 2.5)
      ctx.restore(); ctx.globalAlpha = 1
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min(0.033, (now - last) / 1000); last = now
      if (!visible) return
      const k = keys.current
      if (!running && k.up) { running = true; lapStart = now; ghost.s = 0; ghost.i = 0; ghost.t = 0; checkpoints = 0 }

      if (running) {
        const near = nearest(car.x, car.y, car.idx)
        const off = near.d > TRACK_W / 2 + 2
        const top = off ? 95 : 300
        if (k.up) car.v += (off ? 120 : 190) * dt
        if (k.down) car.v -= 420 * dt
        car.v -= (off ? 260 : 45) * dt * (car.v > top ? 3 : 1) * Math.sign(car.v)
        if (car.v > top && !k.up) car.v -= 200 * dt
        car.v = Math.max(0, Math.min(off ? Math.max(top, car.v - 300 * dt) : top, car.v))
        const grip = car.v < 40 ? car.v / 40 : 1 - 0.3 * (car.v / 300)
        const steer = (k.left ? -1 : 0) + (k.right ? 1 : 0)
        car.a += steer * 3.1 * grip * dt
        car.x += Math.cos(car.a) * car.v * dt; car.y += Math.sin(car.a) * car.v * dt
        car.x = Math.max(5, Math.min(VW - 5, car.x)); car.y = Math.max(5, Math.min(VH - 5, car.y))
        const prevIdx = car.idx; car.idx = near.i
        if (checkpoints === 0 && car.idx > N * 0.3 && car.idx < N * 0.45) checkpoints = 1
        if (checkpoints === 1 && car.idx > N * 0.6 && car.idx < N * 0.75) checkpoints = 2
        if (checkpoints === 2 && prevIdx > N * 0.9 && car.idx < N * 0.1) {
          const lap = (now - lapStart) / 1000
          lastLap = lap; if (bestLap == null || lap < bestLap) { bestLap = lap; store.set('pitwall-hotlap-best', lap) }
          lapStart = now; checkpoints = 0; ghost.s = 0; ghost.i = 0
        }
        // ghost moves along its speed profile
        let remaining = TRACK.v[ghost.i] * dt
        while (remaining > 0) {
          const segLeft = TRACK.segLen[ghost.i] - ghost.s
          if (remaining < segLeft) { ghost.s += remaining; remaining = 0 } else { remaining -= segLeft; ghost.s = 0; ghost.i = (ghost.i + 1) % N }
        }
        lapClock = (now - lapStart) / 1000
        if (++hudTick % 6 === 0) setHud({ lap: lapClock, last: lastLap, best: bestLap, speed: Math.round((car.v / 300) * 340), offTrack: off, started: true })
      }

      drawTrack()
      const gp = TRACK.pts[ghost.i], gq = TRACK.pts[(ghost.i + 1) % N]
      const gt = ghost.s / (TRACK.segLen[ghost.i] || 1)
      drawCar(gp[0] + (gq[0] - gp[0]) * gt, gp[1] + (gq[1] - gp[1]) * gt, Math.atan2(gq[1] - gp[1], gq[0] - gp[0]), '#f5f5f5', running ? 0.45 : 0.25)
      drawCar(car.x, car.y, car.a, '#ff2c2c')
      if (!running) {
        ctx.fillStyle = 'rgba(10,10,10,0.6)'; ctx.fillRect(0, 0, VW, VH)
        ctx.fillStyle = '#f5f5f5'; ctx.textAlign = 'center'
        ctx.font = '700 30px Boldonse, Arial Black, sans-serif'; ctx.fillText('HOT LAP', VW / 2, VH / 2 - 14)
        ctx.font = '500 15px Inter, Arial, sans-serif'; ctx.fillStyle = 'rgba(245,245,245,0.75)'
        ctx.fillText('Click the track, then hold ↑ (or W) to start. Steer with ← →, brake with ↓.', VW / 2, VH / 2 + 22)
      }
    }
    raf = requestAnimationFrame(step)

    const map: Record<string, keyof typeof keys.current> = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' }
    const down = (e: KeyboardEvent) => { const m = map[e.code]; if (!m || !active.current) return; e.preventDefault(); keys.current[m] = true }
    const up = (e: KeyboardEvent) => { const m = map[e.code]; if (!m) return; keys.current[m] = false }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const hold = (k: keyof typeof keys.current) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); active.current = true; keys.current[k] = true },
    onPointerUp: () => { keys.current[k] = false },
    onPointerLeave: () => { keys.current[k] = false },
    onPointerCancel: () => { keys.current[k] = false },
  })

  return (
    <div className="grid content-start gap-6 bg-panel p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <span className="eyebrow">Game 2 · Hot lap</span>
          <h3 className="text-2xl font-semibold">Beat the ghost car</h3>
          <p className="max-w-[52ch] text-sm text-ink-muted">The white ghost drives the ideal line, braking for every corner. Run wide onto the grass and you lose speed. Click the track to take control.</p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hairline-strong text-center sm:grid-cols-4">
          {[['Lap', fmtTime(hud.started ? hud.lap : null)], ['Last', fmtTime(hud.last)], ['Best', fmtTime(hud.best)], ['Ghost', fmtTime(TRACK.ghostLap)]].map(([l, v]) => (
            <div key={l} className="grid gap-0.5 bg-panel-2 px-3 py-2"><span className="num text-sm">{v}</span><span className="text-[0.65rem] uppercase tracking-wider text-ink-dim">{l}</span></div>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-hairline-strong">
        <canvas ref={canvas} tabIndex={0} onPointerDown={() => { active.current = true; canvas.current?.focus() }}
          onFocus={() => { active.current = true }} onBlur={() => { active.current = false; keys.current = { up: false, down: false, left: false, right: false } }}
          className="block h-auto w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red"
          style={{ aspectRatio: `${VW} / ${VH}` }} role="application" aria-label="Hot lap racing game. Use the arrow keys to drive." />
        <div className="pointer-events-none absolute right-3 top-3 grid justify-items-end gap-1">
          <span className="num rounded-md bg-carbon/80 px-2 py-1 text-lg">{hud.speed} km/h</span>
          {hud.offTrack && <span className="rounded-md bg-red px-2 py-0.5 text-xs font-semibold text-carbon">Off track</span>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 md:hidden" aria-label="Touch controls">
        <div className="flex gap-2">
          <button type="button" {...hold('left')} className="h-14 w-14 rounded-xl border border-hairline-strong text-xl" aria-label="Steer left">◀</button>
          <button type="button" {...hold('right')} className="h-14 w-14 rounded-xl border border-hairline-strong text-xl" aria-label="Steer right">▶</button>
        </div>
        <div className="flex gap-2">
          <button type="button" {...hold('down')} className="h-14 rounded-xl border border-hairline-strong px-4 text-sm font-semibold" aria-label="Brake">Brake</button>
          <button type="button" {...hold('up')} className="h-14 rounded-xl bg-red px-5 text-sm font-semibold text-carbon" aria-label="Accelerate">Gas</button>
        </div>
      </div>
    </div>
  )
}

export function Arcade() {
  return (
    <Chapter
      id="arcade"
      index="11"
      eyebrow="Your turn"
      title={<>Lights out<br />and away we go</>}
      deck="Two quick games for the demo: test your reaction to the start lights, then try to beat a ghost car around a circuit. Your best times stay on this device only."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong bg-hairline-strong xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <ReactionStart />
        <HotLap />
      </div>
    </Chapter>
  )
}
