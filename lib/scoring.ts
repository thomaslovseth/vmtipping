import type { Special, SpecialResult } from '@/types'
import { GROUP_MATCHES, KO_MATCHES, SPECIALS } from '@/lib/data'

export function calcMatchPoints(
  picks: Record<string, { pick?: string }>,
  results: Record<string, { home_score: number | null; away_score: number | null }>
): number {
  let pts = 0

  for (const m of GROUP_MATCHES) {
    const pick = picks[m.id]?.pick
    const result = results[m.id]
    if (!pick || !result || result.home_score === null || result.away_score === null) continue

    const rh = result.home_score, ra = result.away_score
    const actual = rh > ra ? 'H' : ra > rh ? 'B' : 'U'
    if (pick === actual) pts += 2
  }

  for (const m of KO_MATCHES.filter(m => m.home && m.away)) {
    const pick = picks[m.id]?.pick
    const result = results[m.id]
    if (!pick || !result || result.home_score === null || result.away_score === null) continue

    const rh = result.home_score, ra = result.away_score
    const actual = rh > ra ? 'H' : 'B' // ingen uavgjort i KO
    if (pick === actual) pts += 3
  }

  return pts
}

export function calcSpecialPoints(
  specials: Record<string, Special>,
  specialResults: Record<string, SpecialResult>
): number {
  let pts = 0
  for (const s of SPECIALS) {
    const myAnswer = (specials[s.id]?.answer ?? '').toLowerCase().trim()
    const correct = (specialResults[s.id]?.answer ?? '').toLowerCase().trim()
    if (myAnswer && correct && myAnswer === correct) pts += s.points
  }
  return pts
}
