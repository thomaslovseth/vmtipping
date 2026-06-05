import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GROUP_MATCHES, KO_MATCHES } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Map fra api-football lagnavn -> våre norske navn
const TEAM_MAP: Record<string, string> = {
  'Mexico': 'Mexico',
  'South Korea': 'Sør-Korea',
  'South Africa': 'Sør-Afrika',
  'Czech Republic': 'Tsjekkia',
  'Czechia': 'Tsjekkia',
  'Canada': 'Canada',
  'Qatar': 'Qatar',
  'Switzerland': 'Sveits',
  'Bosnia': 'Bosnia-Hercegovina',
  'Brazil': 'Brasil',
  'Morocco': 'Marokko',
  'Haiti': 'Haiti',
  'Scotland': 'Skottland',
  'USA': 'USA',
  'United States': 'USA',
  'Turkey': 'Tyrkia',
  'Australia': 'Australia',
  'Paraguay': 'Paraguay',
  'Germany': 'Tyskland',
  "Ivory Coast": 'Elfenbenskysten',
  "Côte d'Ivoire": 'Elfenbenskysten',
  'Ecuador': 'Ecuador',
  'Curacao': 'Curaçao',
  'Netherlands': 'Nederland',
  'Japan': 'Japan',
  'Sweden': 'Sverige',
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

function normalizeTeam(name: string): string {
  return TEAM_MAP[name] ?? name
}

// Finn match_id basert på hjemme- og bortelag
function findMatchId(home: string, away: string): string | null {
  const normHome = normalizeTeam(home)
  const normAway = normalizeTeam(away)

  const groupMatch = GROUP_MATCHES.find(
    m => m.home === normHome && m.away === normAway
  )
  if (groupMatch) return groupMatch.id

  const koMatch = KO_MATCHES.find(
    m => m.home === normHome && m.away === normAway
  )
  if (koMatch) return koMatch.id

  return null
}

export async function GET(request: Request) {
  // Sjekk at kallet kommer fra Vercel Cron eller admin
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Hent alle ferdige kamper fra api-football
    const res = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026&status=FT',
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY!,
        },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) {
      throw new Error(`API-Football feil: ${res.status}`)
    }

    const data = await res.json()
    const fixtures = data.response ?? []

    let updated = 0
    let skipped = 0

    for (const fixture of fixtures) {
      const home = fixture.teams?.home?.name
      const away = fixture.teams?.away?.name
      const homeGoals = fixture.goals?.home
      const awayGoals = fixture.goals?.away

      if (homeGoals === null || awayGoals === null) { skipped++; continue }

      const matchId = findMatchId(home, away)
      if (!matchId) { skipped++; continue }

      await supabase.from('match_results').upsert(
        {
          match_id: matchId,
          home_score: homeGoals,
          away_score: awayGoals,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'match_id' }
      )
      updated++
    }

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      total: fixtures.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sync feil:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
