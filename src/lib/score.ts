import { categoriesFor } from './config'
import type { PersonId, Rating, Visit, VisitRow } from './types'

export const IDS: PersonId[] = ['a', 'b']
export const other = (id: PersonId): PersonId => (id === 'a' ? 'b' : 'a')

export function mean(nums: (number | null | undefined)[]): number | null {
  const xs = nums.filter((n): n is number => typeof n === 'number')
  return xs.length ? xs.reduce((s, n) => s + n, 0) / xs.length : null
}

/** One decimal, or an en dash for "not scored". */
export const fmt = (n: number | null | undefined) => (n == null ? '–' : n.toFixed(1))
const round1 = (n: number) => Math.round(n * 10) / 10

export const overallOf = (r: Rating | undefined, foodType: string) =>
  r ? mean(categoriesFor(foodType).map((c) => r.scores[c.key])) : null

export const hasScores = (r: Rating | undefined) => !!r && Object.keys(r.scores).length > 0

export function buildVisits(rows: VisitRow[], ratings: Rating[], me: PersonId): Visit[] {
  const chrono = [...rows].sort((x, y) => x.date.localeCompare(y.date) || x.created_at.localeCompare(y.created_at))
  return chrono
    .map((row, i) => {
      const mine = ratings.filter((r) => r.visit_id === row.id)
      let byPerson: Visit['ratings'] = Object.fromEntries(mine.map((r) => [r.person, r]))
      // No peeking: hide the partner's rating until I've rated too.
      const awaitingMe = !hasScores(byPerson[me]) && hasScores(byPerson[other(me)])
      if (awaitingMe) byPerson = {}
      const overall: Visit['overall'] = {}
      for (const id of IDS) {
        const o = overallOf(byPerson[id], row.food_type)
        if (o != null) overall[id] = o
      }
      return { ...row, ep: i + 1, ratings: byPerson, overall, together: mean(IDS.map((id) => overall[id])), awaitingMe }
    })
    .reverse() // newest first
}

/** Combined score for ranking: together score, or both people's mean for one category. */
export function combinedScore(v: Visit, cat: string): number | null {
  if (cat === 'overall') return v.together
  return mean(IDS.map((id) => v.ratings[id]?.scores[cat]))
}

export function homeStats(visits: Visit[]) {
  const scored = visits.filter((v) => v.together != null)
  const best = scored.reduce<Visit | null>((b, v) => (!b || v.together! > b.together! ? v : b), null)
  const avgOf = (id: PersonId) => mean(visits.map((v) => v.overall[id]))
  const a = avgOf('a')
  const b = avgOf('b')
  const harsh: PersonId | null = a == null || b == null || a === b ? null : a < b ? 'a' : 'b'
  return { avg: mean(scored.map((v) => v.together)), best, harsh }
}

export function headToHead(visits: Visit[]) {
  const both = visits.filter((v) => v.overall.a != null && v.overall.b != null)
  let aHigher = 0, bHigher = 0, ties = 0
  let gap: { visit: Visit; size: number } | null = null
  for (const v of both) {
    const a = round1(v.overall.a!), b = round1(v.overall.b!)
    if (a > b) aHigher++
    else if (b > a) bHigher++
    else ties++
    const size = Math.abs(a - b)
    if (!gap || size > gap.size) gap = { visit: v, size }
  }
  const cats = categoriesFor('ramen').map((c) => ({
    ...c,
    a: mean(visits.map((v) => v.ratings.a?.scores[c.key])),
    b: mean(visits.map((v) => v.ratings.b?.scores[c.key])),
  }))
  return {
    total: both.length,
    aHigher, bHigher, ties, gap,
    avg: { a: mean(visits.map((v) => v.overall.a)), b: mean(visits.map((v) => v.overall.b)) },
    cats,
  }
}

export function verdict(h: ReturnType<typeof headToHead>, names: Record<PersonId, string>): string {
  if (!h.total) return 'Rate a bowl together to start the rivalry.'
  const diffs = h.cats.filter((c) => c.a != null && c.b != null).map((c) => ({ c, d: c.a! - c.b! }))
  const list = (xs: typeof diffs) => xs.slice(0, 2).map((x) => x.c.en.toLowerCase()).join(' & ')
  const aCares = diffs.filter((x) => x.d > 0.2).sort((x, y) => y.d - x.d)
  const bCares = diffs.filter((x) => x.d < -0.2).sort((x, y) => x.d - y.d)
  const parts: string[] = []
  if (aCares.length) parts.push(`${names.a} cares about ${list(aCares)}.`)
  if (bCares.length) parts.push(`${names.b} is here for the ${list(bCares)}.`)
  if (!parts.length) parts.push('Scarily in sync.')
  if (h.gap && h.gap.size > 0) {
    const v = h.gap.visit
    parts.push(`Biggest fight: ${v.spot_name} (${fmt(v.overall.a)} vs ${fmt(v.overall.b)}).`)
  }
  return parts.join(' ')
}
