/*
# Resenha Club MVP — Schema additions

## Overview
Adds role-based access control, interest submissions (landing page form),
champions ranking, gallery photos, and landing page content management.
All new tables have RLS enabled with appropriate policies.

## Modified Tables
### profiles
- `role` (text, default 'member') — 'member' or 'admin'
- `must_change_password` (boolean, default false) — forces password change on first login

## New Tables
1. **interest_submissions** — Landing page form submissions from prospective members
2. **champions** — Hall of fame / champions ranking (admin-managed)
3. **gallery_photos** — Gallery photos for landing page
4. **landing_content** — Editable landing page text/content

## Security
- RLS enabled on all new tables
- Helper function is_admin() checks profiles.role = 'admin'
- interest_submissions: anon can INSERT, only admin can SELECT/UPDATE/DELETE
- champions, landing_content: authenticated can SELECT, only admin can write
- gallery_photos: anyone can SELECT active, only admin can write
*/

-- ============================================================
-- PROFILES: add role and must_change_password columns FIRST
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'member';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'must_change_password') THEN
    ALTER TABLE profiles ADD COLUMN must_change_password boolean DEFAULT false;
  END IF;
END $$;

-- ============================================================
-- Helper function: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- INTEREST SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS interest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  instagram text DEFAULT '',
  city text NOT NULL,
  poker_experience text DEFAULT '',
  message text DEFAULT '',
  consent_lgpd boolean NOT NULL DEFAULT false,
  consent_image boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interest_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_submissions" ON interest_submissions;
CREATE POLICY "anon_insert_submissions"
  ON interest_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_submissions" ON interest_submissions;
CREATE POLICY "admin_select_submissions"
  ON interest_submissions FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_update_submissions" ON interest_submissions;
CREATE POLICY "admin_update_submissions"
  ON interest_submissions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_submissions" ON interest_submissions;
CREATE POLICY "admin_delete_submissions"
  ON interest_submissions FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- CHAMPIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS champions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text DEFAULT '',
  name text NOT NULL,
  titles_count integer DEFAULT 0,
  last_victory text DEFAULT '',
  victory_date date,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE champions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_champions" ON champions;
CREATE POLICY "auth_select_champions"
  ON champions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_champions" ON champions;
CREATE POLICY "admin_insert_champions"
  ON champions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_champions" ON champions;
CREATE POLICY "admin_update_champions"
  ON champions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_champions" ON champions;
CREATE POLICY "admin_delete_champions"
  ON champions FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- GALLERY PHOTOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  caption text DEFAULT '',
  consent_by text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_gallery" ON gallery_photos;
CREATE POLICY "public_select_gallery"
  ON gallery_photos FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery_photos;
CREATE POLICY "admin_insert_gallery"
  ON gallery_photos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_gallery" ON gallery_photos;
CREATE POLICY "admin_update_gallery"
  ON gallery_photos FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery_photos;
CREATE POLICY "admin_delete_gallery"
  ON gallery_photos FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- LANDING CONTENT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS landing_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_landing_content" ON landing_content;
CREATE POLICY "public_select_landing_content"
  ON landing_content FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_landing_content" ON landing_content;
CREATE POLICY "admin_insert_landing_content"
  ON landing_content FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_landing_content" ON landing_content;
CREATE POLICY "admin_update_landing_content"
  ON landing_content FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_landing_content" ON landing_content;
CREATE POLICY "admin_delete_landing_content"
  ON landing_content FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- SEED LANDING CONTENT
-- ============================================================
INSERT INTO landing_content (key, value) VALUES
  ('hero', '{"title": "Mais que Poker. Uma Resenha entre Amigos.", "subtitle": "O clube privado de poker que une técnica, estratégia e amizade. Acesso exclusivo para membros convidados.", "cta": "Quero fazer parte da Resenha"}'),
  ('history', '{"title": "Nossa História", "text": "A Resenha Club nasceu da paixão por poker e da vontade de criar um espaço onde amigos se reúnem para evoluir no jogo. Começamos com encontros informais e crescemos para um clube estruturado, com treinamento GTO, torneios e cash game. Aqui, cada mão é uma chance de aprender e cada encontro é uma nova história."}'),
  ('how_it_works', '{"title": "Como Funciona", "items": [{"icon": "calendar", "title": "Encontros Quinzenais", "desc": "Reuniões a cada duas semanas para treinar, jogar e evoluir juntos."}, {"icon": "trophy", "title": "Torneios Internos", "desc": "Competições exclusivas entre membros com premiação e ranking."}, {"icon": "cards", "title": "Cash Game", "desc": "Mesas de cash game em ambiente seguro e entre amigos."}, {"icon": "family", "title": "Ambiente Familiar", "desc": "Um clube fechado, apenas por convite, onde todos se conhecem."}]}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_interest_submissions_status ON interest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_interest_submissions_created ON interest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_champions_sort_order ON champions(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_active_sort ON gallery_photos(is_active, sort_order);
