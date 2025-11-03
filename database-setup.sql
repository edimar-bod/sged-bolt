-- SGED Database Setup Script
-- Execute this in your Supabase SQL Editor

-- 1. Create tables
CREATE TABLE IF NOT EXISTS tournament_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_torneo text NOT NULL DEFAULT 'Copa Dorada 2024',
  organizacion text NOT NULL DEFAULT 'Fundación Corazón de Azúcar',
  fvf_autorizado boolean DEFAULT true,
  fecha_inicio date DEFAULT CURRENT_DATE,
  fecha_fin date,
  equipos_a text[] DEFAULT ARRAY[]::text[],
  equipos_b text[] DEFAULT ARRAY[]::text[],
  equipos_c text[] DEFAULT ARRAY[]::text[],
  initialized boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text UNIQUE NOT NULL,
  grupo text NOT NULL CHECK (grupo IN ('A', 'B', 'C')),
  jornada integer NOT NULL CHECK (jornada > 0),
  numero integer NOT NULL CHECK (numero > 0),
  equipo_local text NOT NULL,
  equipo_visitante text NOT NULL,
  cancha text DEFAULT '',
  fecha date NOT NULL,
  hora time NOT NULL,
  score_local integer CHECK (score_local >= 0 AND score_local <= 99),
  score_visitante integer CHECK (score_visitante >= 0 AND score_visitante <= 99),
  played boolean DEFAULT false,
  incomparecencia boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo text NOT NULL CHECK (grupo IN ('A', 'B', 'C')),
  equipo text NOT NULL,
  posicion integer DEFAULT 0,
  pj integer DEFAULT 0,
  g integer DEFAULT 0,
  e integer DEFAULT 0,
  p integer DEFAULT 0,
  gf integer DEFAULT 0,
  gc integer DEFAULT 0,
  dif integer DEFAULT 0,
  pts integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(grupo, equipo)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accion text NOT NULL,
  tabla text NOT NULL,
  registro_id text NOT NULL,
  cambios jsonb,
  usuario_id uuid REFERENCES auth.users(id),
  timestamp timestamptz DEFAULT now(),
  ip_address text
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'user', 'viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_matches_grupo ON matches(grupo);
CREATE INDEX IF NOT EXISTS idx_matches_jornada ON matches(jornada);
CREATE INDEX IF NOT EXISTS idx_matches_played ON matches(played);
CREATE INDEX IF NOT EXISTS idx_standings_grupo ON standings(grupo);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- 3. Enable RLS
ALTER TABLE tournament_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Anyone can view tournament config"
  ON tournament_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update tournament config"
  ON tournament_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert tournament config"
  ON tournament_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view standings"
  ON standings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can update standings"
  ON standings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "System can insert standings"
  ON standings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 5. Insert sample data
INSERT INTO tournament_config (
  nombre_torneo,
  organizacion,
  fvf_autorizado,
  fecha_inicio,
  fecha_fin,
  equipos_a,
  equipos_b,
  equipos_c,
  initialized
) VALUES (
  'Copa Dorada 2024',
  'Fundación Corazón de Azúcar',
  true,
  '2024-05-31',
  '2024-06-30',
  ARRAY['Dorado Citty', 'GALACTICOS2', 'CASAGRANDE', 'ATLETICO CHIVAO', 'GALACTICOS FC', 'El Dorado 1970'],
  ARRAY['SAN JOSE', 'ALASKA FC', 'PARURUAKA', 'ESEQUIBO FC', 'SANTA RITA', 'CERVECEROS'],
  ARRAY['MINESUR', 'ROSCIO ACTIVA', 'MOTOS AVA TUMEREMO', 'EL PLACER', 'ATLETIC YURUAN', 'VAPOR'],
  true
) ON CONFLICT DO NOTHING;

-- 6. Insert sample matches for Grupo A - Jornada 1
INSERT INTO matches (match_id, grupo, jornada, numero, equipo_local, equipo_visitante, cancha, fecha, hora)
VALUES
  ('j1-1', 'A', 1, 1, 'Dorado Citty', 'GALACTICOS2', 'Estadio El Dorado', '2024-05-31', '18:00'),
  ('j1-2', 'A', 1, 2, 'CASAGRANDE', 'ATLETICO CHIVAO', 'Cancha Municipal', '2024-05-31', '20:00'),
  ('j1-3', 'A', 1, 3, 'GALACTICOS FC', 'El Dorado 1970', 'Estadio El Dorado', '2024-06-01', '16:00')
ON CONFLICT DO NOTHING;

-- 7. Insert sample matches for Grupo B - Jornada 1
INSERT INTO matches (match_id, grupo, jornada, numero, equipo_local, equipo_visitante, cancha, fecha, hora)
VALUES
  ('j1-4', 'B', 1, 1, 'SAN JOSE', 'ALASKA FC', 'Campo San José', '2024-05-31', '18:00'),
  ('j1-5', 'B', 1, 2, 'PARURUAKA', 'ESEQUIBO FC', 'Cancha Norte', '2024-05-31', '20:00'),
  ('j1-6', 'B', 1, 3, 'SANTA RITA', 'CERVECEROS', 'Campo San José', '2024-06-01', '16:00')
ON CONFLICT DO NOTHING;

-- IMPORTANT: After creating your first user via the app, run this to make them admin:
-- UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
-- Or insert directly:
-- INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');