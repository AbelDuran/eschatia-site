CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY CHECK (id ~ '^[0-9]{17,20}$'),
  name text NOT NULL,
  discord_name text NOT NULL,
  avatar text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player','admin')),
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  device text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS oauth_attempts (
  state_hash text PRIMARY KEY, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('news','characters','countries','organizations','races','lore')),
  slug text NOT NULL, title text NOT NULL, summary text NOT NULL DEFAULT '', body text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '', country text NOT NULL DEFAULT '', organization text NOT NULL DEFAULT '', race text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','frozen','deleted')),
  owner_id text REFERENCES users(id), related jsonb NOT NULL DEFAULT '[]',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kind,slug), CHECK (status <> 'frozen' OR kind = 'characters'), CHECK (owner_id IS NULL OR kind = 'characters')
);
CREATE UNIQUE INDEX IF NOT EXISTS one_character_per_user ON articles(owner_id) WHERE kind='characters' AND status <> 'deleted';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}';
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text NOT NULL UNIQUE REFERENCES users(id),
  article_id uuid REFERENCES articles(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','changes','approved','rejected')),
  data jsonb NOT NULL DEFAULT '{}', version integer NOT NULL DEFAULT 1,
  submitted_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS application_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES applications(id),
  data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES applications(id),
  author_id text NOT NULL REFERENCES users(id), body text NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_application ON comments(application_id, created_at);
CREATE TABLE IF NOT EXISTS revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), article_id uuid NOT NULL REFERENCES articles(id),
  actor_id text NOT NULL REFERENCES users(id), snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id text NOT NULL REFERENCES users(id),
  action text NOT NULL, target text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text NOT NULL REFERENCES users(id),
  message text NOT NULL, href text NOT NULL, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY, hits integer NOT NULL, reset_at timestamptz NOT NULL
);
