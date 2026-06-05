import type { Pick, MatchResult, Special, SpecialResult } from '@/types'
import { GROUP_MATCHES, KO_MATCHES, SPECIALS } from '@/lib/data'

export function calcMatchPoints(
  picks: Record<string, Pick>,
  results: Record<string, MatchResult>
): number {
  let pts = 0
  const allMatches = [
    ...GROUP_MATCHES,
    ...KO_MATCHES.filter(m => m.home && m.away)
  ]
  for (const m of allMatches) {
    const pick = picks[m.id]
    const result = results[m.id]
    if (!pick || !result) continue
    const ph = pick.home_score, pa = pick.away_score
    const rh = result.home_score, ra = result.away_score
    if (ph === null || pa === null || rh === null || ra === null) continue
    if (ph === rh && pa === ra) {
      pts += 3
    } else {
      const po = ph > pa ? 'H' : pa > ph ? 'A' : 'D'
      const ro = rh > ra ? 'H' : ra > rh ? 'A' : 'D'
      if (po === ro) pts += 1
    }
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
    if (myAnswer && correct && myAnswer === correct) {
      pts += s.points
    }
  }
  return pts
}
