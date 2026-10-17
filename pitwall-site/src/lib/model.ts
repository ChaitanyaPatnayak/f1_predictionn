import { D } from './data'

export type RaceInputs = {
  grid: number
  form: number
  starts: number
  age: number
  street: boolean
  home: boolean
  groundEffect: boolean
}

export const FEATURE_LABELS = ['Grid position', 'Team form', 'Experience', 'Age', 'Street circuit', 'Home race', '2022+ rules']

/** A typical driver in the training data: P10, midfield car, 106 starts, age 27, permanent circuit, pre-2022. */
const REFERENCE = [1, 10, 11, Math.log1p(106), 27, 0, 0, 0]

const toVector = (s: RaceInputs) => [
  1,
  s.grid,
  s.form,
  Math.log1p(s.starts),
  s.age,
  s.street ? 1 : 0,
  s.home ? 1 : 0,
  s.groundEffect ? 1 : 0,
]

/** OLS point prediction plus a 95% prediction interval: ŷ ± t · sqrt(s² (1 + x'(X'X)⁻¹x)). */
export function predict(s: RaceInputs) {
  const { params, xtxInv, scale, t975 } = D.model
  const x = toVector(s)
  const y = x.reduce((sum, v, i) => sum + v * params[i], 0)
  let q = 0
  for (let i = 0; i < x.length; i++) for (let j = 0; j < x.length; j++) q += x[i] * xtxInv[i][j] * x[j]
  const half = t975 * Math.sqrt(scale * (1 + q))
  const contributions = x.slice(1).map((v, i) => params[i + 1] * (v - REFERENCE[i + 1]))
  return {
    value: y,
    position: Math.min(20, Math.max(1, Math.round(y))),
    low: Math.max(1, Math.round(y - half)),
    high: Math.min(20, Math.round(y + half)),
    contributions,
  }
}
