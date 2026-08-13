/*
# Add developer role + landing timeline content

## Overview
1. Introduces a new `developer` profile role that has the same access as `admin`
   (managing users, forms, ranking, landing content, gallery, champions, etc.)
   but can additionally switch between the member area and the admin panel from
   within the app.
2. Updates the `is_admin()` helper so both `admin` and `developer` roles pass
   every existing admin-only policy. No policy rewrites needed.
3. Promotes the existing auth user with email `devraffles@gmail.com` to
   `developer` and creates a matching profile row + global_rankings row if they
   are missing.
4. Seeds a new `timeline` landing_content key with a few starter milestones so
   the new timeline section on the landing page renders out of the box.

## Modified objects
- `is_admin()` — now returns true for `admin` OR `developer`.
- `profiles` — no schema change; the `role` text column already accepts any
  string. `developer` is a new allowed value alongside `member` and `admin`.

## Data changes
- Profile row for user `f10c2807-92e8-4ad3-8301-b2364fa5701c`
  (devraffles@gmail.com) created if missing, with role = `developer`.
- `landing_content` row with key = `timeline` seeded if not present.

## Security
- No new tables. No new policies. The broadened `is_admin()` intentionally
  grants `developer` the same write access as `admin` on every admin-managed
  table, which is the desired behavior.
*/

-- ============================================================
-- Broaden is_admin() to include the developer role
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'developer')
  );
$$;

-- ============================================================
-- Promote desenvolvedor /_devraffles user to developer
-- ============================================================
INSERT INTO profiles (id, username, display_name, role)
VALUES (
  'f10c2807-92e8-4ad3-8301-b2364fa5701c',
  'devraffles',
  'Desenvolvedor',
  'developer'
)
ON CONFLICT (id) DO UPDATE
  SET role = 'developer',
      username = COALESCE(profiles.username, EXCLUDED.username),
      display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
      updated_at = now();

-- Ensure the developer has a global_rankings row like every other member
INSERT INTO global_rankings (user_id)
VALUES ('f10c2807-92e8-4ad3-8301-b2364fa5701c')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- Seed timeline landing content
-- ============================================================
INSERT INTO landing_content (key, value) VALUES
  ('timeline', '{"title": "Momentos Marcantes", "subtitle": "Uma linha do tempo da nossa jornada, mão a mão, encontro a encontro.", "items": [{"date": "2023-01", "title": "O Primeiro Encontro", "desc": "Cinco amigos em volta de uma mesa. Nascia a Resenha Club.", "photo_url": ""}, {"date": "2023-06", "title": "Primeiro Torneio Interno", "desc": "Nosso primeiro campeonato entre membros, com premiação e ranking.", "photo_url": ""}, {"date": "2024-02", "title": "Treinamento GTO", "desc": "Lançamos o treinamento GTO para evoluir o jogo de todos.", "photo_url": ""}, {"date": "2024-09", "title": "100 Membros", "desc": "Atingimos a marca de 100 membros ativos no clube.", "photo_url": ""}, {"date": "2025-03", "title": "Resenha Trainer", "desc": "Plataforma online de treino e ranking lançada para todos os membros.", "photo_url": ""}]}')
ON CONFLICT (key) DO NOTHING;
