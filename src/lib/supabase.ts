import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string
  total_hands: number
  correct_decisions: number
  current_streak: number
  best_streak: number
  total_sessions: number
  total_quiz_score: number
  total_quizzes: number
  rank_points: number
  role: "member" | "admin"
  must_change_password: boolean
  settings: {
    sound: boolean
    notifications: boolean
    theme: string
    language: string
  }
  created_at: string
  updated_at: string
}

export type Tournament = {
  id: string
  creator_id: string
  name: string
  description: string
  poker_type: string
  max_players: number
  current_players: number
  buy_in: number
  prize_pool: number
  start_time: string
  end_time: string | null
  status: "registration" | "active" | "completed" | "cancelled"
  blind_structure: BlindLevel[]
  config: Record<string, unknown>
  winner_id: string | null
  created_at: string
}

export type BlindLevel = {
  level: number
  small_blind: number
  big_blind: number
  ante: number
  duration_minutes: number
}

export type TournamentParticipant = {
  id: string
  tournament_id: string
  user_id: string
  position: number | null
  chips: number
  status: "registered" | "active" | "eliminated" | "winner"
  prize: number
  registered_at: string
  profiles?: Profile
}

export type NewsPost = {
  id: string
  title: string
  content: string
  excerpt: string
  category: "news" | "update" | "article" | "strategy" | "event"
  image_url: string
  author_name: string
  author_avatar: string
  is_featured: boolean
  published_at: string
}

export type Event = {
  id: string
  title: string
  description: string
  event_type: "tournament" | "training" | "stream" | "community" | "special"
  start_time: string
  end_time: string | null
  location: string
  image_url: string
  registration_url: string
  max_participants: number | null
  is_featured: boolean
}

export type GlobalRanking = {
  id: string
  user_id: string
  points: number
  wins: number
  top3_finishes: number
  tournaments_played: number
  quiz_avg_score: number
  training_accuracy: number
  updated_at: string
  profiles?: Profile
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "tournament" | "achievement"
  is_read: boolean
  related_id: string | null
  created_at: string
}

export type InterestSubmission = {
  id: string
  name: string
  phone: string
  instagram: string
  city: string
  poker_experience: string
  message: string
  consent_lgpd: boolean
  consent_image: boolean
  status: "pending" | "approved" | "rejected"
  reviewed_at: string | null
  created_at: string
}

export type Champion = {
  id: string
  photo_url: string
  name: string
  titles_count: number
  last_victory: string
  victory_date: string | null
  sort_order: number
  created_at: string
}

export type GalleryPhoto = {
  id: string
  url: string
  caption: string
  consent_by: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export type LandingContent = {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}
