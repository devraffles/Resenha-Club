/*
  # Resenha Club GTO Poker Trainer - Complete Schema

  ## Overview
  Full schema for the Resenha Club GTO Poker Trainer platform.

  ## Tables Created

  1. **profiles** - Extended user profiles linked to auth.users
     - username, avatar_url, bio, total_hands, accuracy, streak data, settings

  2. **training_sessions** - Records of each training session
     - user_id, hands_played, correct_decisions, session_type, duration

  3. **quiz_results** - Individual quiz attempt records
     - user_id, score, total_questions, mode, duration, question data

  4. **custom_ranges** - User-saved custom poker ranges
     - user_id, name, position, scenario, range_data (JSONB)

  5. **tournaments** - Tournament definitions
     - creator_id, name, type, buy_in, max_players, start_time, status, config

  6. **tournament_participants** - Tournament registrations
     - tournament_id, user_id, position, chips, status, prize

  7. **global_rankings** - Leaderboard points per user
     - user_id, points, wins, top3_finishes, tournaments_played

  8. **news_posts** - News and articles feed
     - title, content, category, image_url, author, published_at

  9. **events** - Calendar events and activities
     - title, description, event_type, start_time, end_time, location

  10. **notifications** - User notifications
      - user_id, title, message, type, is_read, related_id

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read public content
  - Users can only modify their own data
  - Admin-only content (news, events) uses special policies
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text DEFAULT '',
  total_hands integer DEFAULT 0,
  correct_decisions integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  total_quiz_score integer DEFAULT 0,
  total_quizzes integer DEFAULT 0,
  rank_points integer DEFAULT 0,
  settings jsonb DEFAULT '{"sound": true, "notifications": true, "theme": "dark", "language": "pt-BR"}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- TRAINING SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hands_played integer DEFAULT 0,
  correct_decisions integer DEFAULT 0,
  session_type text DEFAULT 'mixed' CHECK (session_type IN ('preflop', 'flop', 'turn', 'river', 'mixed')),
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('beginner', 'medium', 'advanced')),
  duration_seconds integer DEFAULT 0,
  hands_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON training_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON training_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- QUIZ RESULTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 10,
  mode text DEFAULT 'challenge' CHECK (mode IN ('learning', 'challenge', 'speed')),
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('beginner', 'medium', 'advanced')),
  duration_seconds integer DEFAULT 0,
  questions_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CUSTOM RANGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  position text NOT NULL DEFAULT 'BTN',
  scenario text NOT NULL DEFAULT 'RFI',
  range_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_ranges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and public ranges"
  ON custom_ranges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own ranges"
  ON custom_ranges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ranges"
  ON custom_ranges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ranges"
  ON custom_ranges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- TOURNAMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  poker_type text DEFAULT 'Texas Hold''em',
  max_players integer DEFAULT 9,
  current_players integer DEFAULT 0,
  buy_in integer DEFAULT 0,
  prize_pool integer DEFAULT 0,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  status text DEFAULT 'registration' CHECK (status IN ('registration', 'active', 'completed', 'cancelled')),
  blind_structure jsonb DEFAULT '[]'::jsonb,
  config jsonb DEFAULT '{}'::jsonb,
  winner_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- ============================================================
-- TOURNAMENT PARTICIPANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position integer,
  chips integer DEFAULT 10000,
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'eliminated', 'winner')),
  prize integer DEFAULT 0,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants"
  ON tournament_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can register themselves"
  ON tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON tournament_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- GLOBAL RANKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS global_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  wins integer DEFAULT 0,
  top3_finishes integer DEFAULT 0,
  tournaments_played integer DEFAULT 0,
  quiz_avg_score numeric(5,2) DEFAULT 0,
  training_accuracy numeric(5,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE global_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rankings"
  ON global_rankings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own ranking"
  ON global_rankings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ranking"
  ON global_rankings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NEWS POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text DEFAULT '',
  category text DEFAULT 'news' CHECK (category IN ('news', 'update', 'article', 'strategy', 'event')),
  image_url text DEFAULT '',
  author_name text DEFAULT 'Resenha Club',
  author_avatar text DEFAULT '',
  is_featured boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news"
  ON news_posts FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_type text DEFAULT 'tournament' CHECK (event_type IN ('tournament', 'training', 'stream', 'community', 'special')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location text DEFAULT 'Online',
  image_url text DEFAULT '',
  registration_url text DEFAULT '',
  max_participants integer,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'tournament', 'achievement')),
  is_read boolean DEFAULT false,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED DATA - News Posts
-- ============================================================
INSERT INTO news_posts (title, content, excerpt, category, is_featured, author_name) VALUES
(
  'Bem-vindo ao GTO Poker Trainer - The Resenha Club',
  'Estamos animados em apresentar a plataforma de treinamento GTO mais avançada do Brasil. Aprenda, compita e evolua com a comunidade The Resenha Club.',
  'Plataforma de treinamento GTO mais avançada do Brasil.',
  'update',
  true,
  'The Resenha Club'
),
(
  'Novos Cenários de Treinamento Disponíveis',
  'Adicionamos mais de 500 novos cenários de treinamento para pré-flop, flop, turn e river. Treine com situações do mundo real e melhore sua tomada de decisão GTO.',
  'Mais de 500 novos cenários de treinamento adicionados.',
  'update',
  false,
  'The Resenha Club'
),
(
  'Estratégia GTO: Entendendo Ranges de Abertura',
  'Neste artigo, vamos explorar como construir ranges de abertura equilibrados seguindo princípios GTO. Aprenda as fundações para se tornar um jogador imbatível.',
  'Construa ranges de abertura equilibrados com princípios GTO.',
  'strategy',
  false,
  'Team Resenha'
),
(
  'Torneio Semanal The Resenha Club - Registrações Abertas',
  'O torneio semanal da The Resenha Club está com registrações abertas! Mostre suas habilidades GTO e dispute o topo do ranking.',
  'Registrações abertas para o torneio semanal.',
  'event',
  true,
  'The Resenha Club'
);

-- ============================================================
-- SEED DATA - Events  
-- ============================================================
INSERT INTO events (title, description, event_type, start_time, end_time, location, is_featured) VALUES
(
  'Torneio Semanal Resenha Club',
  'Torneio semanal para membros do clube. Top 3 ganham pontos extras no ranking.',
  'tournament',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '4 hours',
  'Online - GTO Trainer',
  true
),
(
  'Live Stream: Análise de Mãos GTO',
  'Análise ao vivo de mãos difíceis com coaching especializado em GTO.',
  'stream',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
  'Twitch - TheResenhaClub',
  false
),
(
  'Workshop: Dominando o Pre-flop GTO',
  'Workshop intensivo sobre estratégias GTO pré-flop. Ideal para jogadores intermediários.',
  'training',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
  'Online',
  false
),
(
  'Grande Torneio Mensal - Resenha Masters',
  'O maior torneio mensal da comunidade. Prizes especiais para os top 10.',
  'tournament',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '6 hours',
  'Online - GTO Trainer',
  true
),
(
  'Encontro da Comunidade Resenha Club',
  'Evento especial de networking e discussão sobre estratégias de poker.',
  'community',
  NOW() + INTERVAL '21 days',
  NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
  'São Paulo, SP',
  false
);

-- ============================================================
-- FUNCTION: Handle new user registration
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO global_rankings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_global_rankings_points ON global_rankings(points DESC);
CREATE INDEX IF NOT EXISTS idx_news_posts_published ON news_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
