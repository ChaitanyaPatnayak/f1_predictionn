import raw from '@/data/f1.json'

export type Season = {
  year: number
  hhi: number
  eff: number
  topShare: number
  finish: number
  pole: number | null
  order: number | null
  winners: number
  races: number
  topTeam: string
  topDriver: string
  champion: string
}

export type Nation = {
  nat: string
  races: number
  rate: number
  pRaw: number
  pHolm: number
  drivers: number
  top: string
  topShare: number
}

export type Circuit = {
  name: string
  country: string
  lat: number
  lon: number
  races: number
  first: number
  last: number
  poleConv: number | null
}

export type F1Data = {
  kpi: { races: number; entries: number; drivers: number; teams: number; circuits: number }
  seasons: Season[]
  abOrder: { A: number[]; B: number[] }
  abPole: { A: [number, number]; B: [number, number] }
  model: {
    features: string[]
    params: number[]
    xtxInv: number[][]
    scale: number
    t975: number
    stdBeta: Record<string, number>
    scores: Record<string, { 'R²': number; MAE: number; RMSE: number }>
    nTrain: number
    nTest: number
  }
  winByGrid: Record<string, number>
  podiumByGrid: Record<string, number>
  variance: { car: number; driver: number; luck: number }
  career: { exp: Record<string, number>; age: Record<string, number> }
  nations: Nation[]
  title: { f: number; rate: number; lo: number; hi: number }[]
  circuits: Circuit[]
  topDrivers: Record<string, number>
  topTeams: Record<string, number>
}

export const D = raw as unknown as F1Data

export const pct = (v: number | null | undefined, digits = 0) =>
  v == null || Number.isNaN(v) ? '–' : `${(100 * v).toFixed(digits)}%`

export const EXP_BANDS = ['0–20', '21–50', '51–100', '101–150', '151–200', '200+'] as const
export const AGE_BANDS = ['≤24', '25–27', '28–30', '31–33', '34–36', '37+'] as const

export const expBand = (starts: number) =>
  starts <= 20 ? 0 : starts <= 50 ? 1 : starts <= 100 ? 2 : starts <= 150 ? 3 : starts <= 200 ? 4 : 5
export const ageBand = (age: number) =>
  age <= 24 ? 0 : age <= 27 ? 1 : age <= 30 ? 2 : age <= 33 ? 3 : age <= 36 ? 4 : 5

/** P(driver in this age/experience cell beats a rookie teammate aged 24 or under), from the Bradley–Terry model. */
export const careerProb = (ai: number, ei: number) =>
  1 / (1 + Math.exp(-(D.career.age[AGE_BANDS[ai]] + D.career.exp[EXP_BANDS[ei]])))

export const eraOf = (y: number) =>
  y < 1980 ? 'Pioneer era' : y < 2000 ? 'Turbo and aero era' : y < 2014 ? 'V10 and V8 era' : y < 2022 ? 'Hybrid era' : 'Ground-effect era'
