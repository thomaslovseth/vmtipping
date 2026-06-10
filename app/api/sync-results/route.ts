import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GROUP_MATCHES } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEAM_MAP: Record<string, string> = {
  'Mexico': 'Mexico', 'South Korea': 'Sør-Korea', 'South Africa': 'Sør-Afrika',
  'Czech Republic': 'Tsjekkia', 'Czechia': 'Tsjekkia', 'Canada': 'Canada',
  'Qatar': 'Qatar', 'Switzerland': 'Sveits', 'Bosnia': 'Bosnia-Hercegovina',
  'Brazil': 'Brasil', 'Morocco': 'Marokko', 'Haiti': 'Haiti', 'Scotland': 'Skottland',
  'USA': 'USA', 'United States': 'USA', 'Turkey': 'Tyrkia', 'Australia': 'Australia',
  'Paraguay': 'Paraguay', 'Germany': 'Tyskland', "Ivory Coast": 'Elfenbenskysten',
  "Côte d'Ivoire": 'Elfenbenskysten', 'Ecuador': 'Ecuador', 'Curacao': 'Curaçao',
  'Netherlands': 'Nederland', 'Japan': 'Japan', 'Sweden': 'Sverige', 'Tunisia': 'Tunisia',
  'Belgium': 'Belgia', 'Egypt': 'Egypt', 'Iran': 'Iran', 'New Zealand': 'New Zealand',
  'Spain': 'Spania', 'Uruguay': 'Uruguay', 'Saudi Arabia': 'Saudi-Arabia',
  'Cape Verde': 'Kapp Verde', 'France': 'Frankrike', 'Norway': 'Norge',
  'Senegal': 'Senegal', 'Iraq': 'Irak', 'Argentina': 'Argentina', 'Algeria': 'Algeria',
  'Austria': 'Østerrike', 'Jordan': 'Jordan', 'Portugal': 'Portugal',
  'DR Congo': 'DR Kongo', 'England': 'England', 'Croatia': 'Kroatia',
  'Colombia': 'Colombia', 'Uzbekistan': 'Uzbekistan', 'Ghana': 'Ghana', 'Panama': 'Panama',
}

function norm(name: string): string {
  return TEAM_MAP[name] ?? name
}

// Map api-football round navn til våre runde-IDer
function getRoundId(round: string, matchNum: number): string {
  if (round.includes('Round of 32') || round.includes('1/16')) return `R32_${matchNum}`
  if (round.includes('Round of 16') || round.includes('1/8')) return `R16_${matchNum}`
  if (round.includes('Quarter')) return `QF${matchNum}`
  if (round.includes('Semi')) return `SF${matchNum}`
  if (round.includes('3rd') || round.includes('Third')) return '3RD'
  if (round.includes('Final')) return 'FINAL'
  return `KO_${matchNum}`
}

function getRoundLabel(round: string): string {
  if (round.includes('Round of 32') || round.includes('1/16')) return 'Runde av 32'
  if (round.includes('Round of 16') || round.includes('1/8')) return 'Runde av 16'
  if (round.includes('Quarter')) return 'Kvartfinale'
  if (round.includes('Semi')) return 'Semifinale'
  if (round.includes('3rd') || round.includes('Third')) return 'Bronsefinale'
  if (round.includes('Final')) return 'FINALE'
  return round
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Hent alle VM 2026-kamper (både pågående og ferdige)
    const res = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026',
      {
        headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
        cache: 'no-store',
      }
    )
    if (!res.ok) throw new Error(`API-Football feil: ${res.status}`)

    const data = await res.json()
    const fixtures = data.response ?? []

    let updatedResults = 0
    let updatedKO = 0
    let skipped = 0

    // Teller per runde for å generere unike IDer
    const roundCounters: Record<string, number> = {}

    for (const fixture of fixtures) {
      const home = fixture.teams?.home?.name
      const away = fixture.teams?.away?.name
      const homeGoals = fixture.goals?.home
      const awayGoals = fixture.goals?.away
      const status = fixture.fixture?.status?.short // FT, NS, 1H, 2H, HT, etc.
      const date = fixture.fixture?.date
      const round = fixture.league?.round ?? ''

      const normHome = norm(home)
      const normAway = norm(away)

      // Sjekk om dette er en gruppespillkamp
      const isGroupMatch = GROUP_MATCHES.find(
        m => m.home === normHome && m.away === normAway
      )

      if (isGroupMatch) {
        // Lagre resultat hvis kampen er ferdig
        if (status === 'FT' && homeGoals !== null && awayGoals !== null) {
          await supabase.from('match_results').upsert(
            { match_id: isGroupMatch.id, home_score: homeGoals, away_score: awayGoals, updated_at: new Date().toISOString() },
            { onConflict: 'match_id' }
          )
          updatedResults++
        }
      } else {
        // Sluttspillkamp – oppdater ko_matches med lag og evt. resultat
        const roundKey = getRoundLabel(round)
        roundCounters[roundKey] = (roundCounters[roundKey] ?? 0) + 1
        const matchNum = roundCounters[roundKey]
        const matchId = getRoundId(round, matchNum)
        const roundLabel = getRoundLabel(round)

        // Upsert sluttspillkamp med lag
        await supabase.from('ko_matches').upsert(
          {
            id: matchId,
            round: roundLabel,
            label: `${roundLabel} – Kamp ${matchNum}`,
            home: normHome,
            away: normAway,
            date: date,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        updatedKO++

        // Lagre resultat hvis ferdig
        if (status === 'FT' && homeGoals !== null && awayGoals !== null) {
          await supabase.from('match_results').upsert(
            { match_id: matchId, home_score: homeGoals, away_score: awayGoals, updated_at: new Date().toISOString() },
            { onConflict: 'match_id' }
          )
          updatedResults++
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedResults,
      updatedKO,
      skipped,
      total: fixtures.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sync feil:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
