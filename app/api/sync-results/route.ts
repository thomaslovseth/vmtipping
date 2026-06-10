import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GROUP_MATCHES } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEAM_MAP: Record<string, string> = {
  'Mexico': 'Mexico',
  'South Africa': 'Sør-Afrika',
  'South Korea': 'Sør-Korea',
  'Korea Republic': 'Sør-Korea',
  'Czechia': 'Tsjekkia',
  'Czech Republic': 'Tsjekkia',
  'Canada': 'Canada',
  'Bosnia-Herzegovina': 'Bosnia-Hercegovina',
  'Qatar': 'Qatar',
  'Switzerland': 'Sveits',
  'Brazil': 'Brasil',
  'Morocco': 'Marokko',
  'Haiti': 'Haiti',
  'Scotland': 'Skottland',
  'United States': 'USA',
  'USA': 'USA',
  'Paraguay': 'Paraguay',
  'Australia': 'Australia',
  'Turkey': 'Tyrkia',
  'Germany': 'Tyskland',
  "Côte d'Ivoire": 'Elfenbenskysten',
  'Ivory Coast': 'Elfenbenskysten',
  'Ecuador': 'Ecuador',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'Netherlands': 'Nederland',
  'Sweden': 'Sverige',
  'Japan': 'Japan',
  'Tunisia': 'Tunisia',
  'Belgium': 'Belgia',
  'Egypt': 'Egypt',
  'Iran': 'Iran',
  'New Zealand': 'New Zealand',
  'Spain': 'Spania',
  'Uruguay': 'Uruguay',
  'Saudi Arabia': 'Saudi-Arabia',
  'Cape Verde': 'Kapp Verde',
  'France': 'Frankrike',
  'Norway': 'Norge',
  'Senegal': 'Senegal',
  'Iraq': 'Irak',
  'Argentina': 'Argentina',
  'Algeria': 'Algeria',
  'Austria': 'Østerrike',
  'Jordan': 'Jordan',
  'Portugal': 'Portugal',
  'DR Congo': 'DR Kongo',
  'England': 'England',
  'Croatia': 'Kroatia',
  'Colombia': 'Colombia',
  'Uzbekistan': 'Uzbekistan',
  'Ghana': 'Ghana',
  'Panama': 'Panama',
}

function norm(name: string): string {
  return TEAM_MAP[name] ?? name
}

function getRoundLabel(stage: string): string {
  switch (stage) {
    case 'ROUND_OF_32': return 'Runde av 32'
    case 'ROUND_OF_16': return 'Runde av 16'
    case 'QUARTER_FINALS': return 'Kvartfinale'
    case 'SEMI_FINALS': return 'Semifinale'
    case 'THIRD_PLACE': return 'Bronsefinale'
    case 'FINAL': return 'FINALE'
    default: return stage
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      {
        headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY! },
        cache: 'no-store',
      }
    )
    if (!res.ok) throw new Error(`football-data.org feil: ${res.status}`)

    const data = await res.json()
    const matches = data.matches ?? []

    let updatedResults = 0
    let updatedKO = 0

    // Teller per runde for unike IDer
    const roundCounters: Record<string, number> = {}

    for (const match of matches) {
      const home = norm(match.homeTeam?.name ?? '')
      const away = norm(match.awayTeam?.name ?? '')
      const status = match.status // TIMED, IN_PLAY, PAUSED, FINISHED
      const stage = match.stage  // GROUP_STAGE, ROUND_OF_32, etc.
      const date = match.utcDate
      const homeGoals = match.score?.fullTime?.home
      const awayGoals = match.score?.fullTime?.away

      if (stage === 'GROUP_STAGE') {
        // Finn match_id fra hardkodet data
        const groupMatch = GROUP_MATCHES.find(
          m => m.home === home && m.away === away
        )
        if (!groupMatch) continue

        // Lagre resultat hvis ferdig
        if (status === 'FINISHED' && homeGoals !== null && awayGoals !== null) {
          await supabase.from('match_results').upsert(
            {
              match_id: groupMatch.id,
              home_score: homeGoals,
              away_score: awayGoals,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'match_id' }
          )
          updatedResults++
        }
      } else {
        // Sluttspillkamp
        const roundLabel = getRoundLabel(stage)
        roundCounters[stage] = (roundCounters[stage] ?? 0) + 1
        const matchNum = roundCounters[stage]

        // Generer match_id
        const stagePrefix: Record<string, string> = {
          'ROUND_OF_32': 'R32',
          'ROUND_OF_16': 'R16',
          'QUARTER_FINALS': 'QF',
          'SEMI_FINALS': 'SF',
          'THIRD_PLACE': '3RD',
          'FINAL': 'FINAL',
        }
        const prefix = stagePrefix[stage] ?? 'KO'
        const matchId = stage === 'FINAL' || stage === 'THIRD_PLACE'
          ? prefix
          : `${prefix}_${matchNum}`

        // Upsert sluttspillkamp
        await supabase.from('ko_matches').upsert(
          {
            id: matchId,
            round: roundLabel,
            label: `${roundLabel} – Kamp ${matchNum}`,
            home: home || null,
            away: away || null,
            date: date,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        updatedKO++

        // Lagre resultat hvis ferdig
        if (status === 'FINISHED' && homeGoals !== null && awayGoals !== null) {
          await supabase.from('match_results').upsert(
            {
              match_id: matchId,
              home_score: homeGoals,
              away_score: awayGoals,
              updated_at: new Date().toISOString(),
            },
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
      total: matches.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sync feil:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
