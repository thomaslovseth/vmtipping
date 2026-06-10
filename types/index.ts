export interface User {
  id: string
  username: string
  display_name: string
  is_admin: boolean
  created_at: string
}

export interface Pick {
  id?: string
  user_id: string
  match_id: string
  pick?: string
  updated_at?: string
}

export interface Special {
  id?: string
  user_id: string
  special_id: string
  answer: string
  updated_at?: string
}

export interface MatchResult {
  id?: string
  match_id: string
  home_score: number | null
  away_score: number | null
  updated_at?: string
}

export interface SpecialResult {
  id?: string
  special_id: string
  answer: string
  updated_at?: string
}

export interface Match {
  id: string
  home: string
  away: string
  group?: string
  date: string
  round?: string
  label?: string
}

export interface KOMatch {
  id: string
  round: string
  label: string
  home: string | null
  away: string | null
  date: string
}

export interface SpecialDef {
  id: string
  label: string
  desc: string
  type: 'select' | 'radio'
  options: string[]
  lockAtStart: boolean
  points: number
}

export interface LeaderboardEntry {
  display_name: string
  username: string
  points: number
}
