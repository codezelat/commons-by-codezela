-- ============================================================
-- Commons by Codezela — Full Database Schema
-- Run this against your Supabase PostgreSQL database
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Better Auth tables (user, session, account, verification)
-- ============================================================

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'reader',
  banned BOOLEAN DEFAULT FALSE,
  "banReason" TEXT,
  "banExpires" BIGINT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "user" ALTER COLUMN role SET DEFAULT 'reader';
UPDATE "user" SET role = 'reader' WHERE role = 'user';
UPDATE "user" SET role = 'reader' WHERE role IS NULL OR role NOT IN ('admin', 'moderator', 'reader');
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_role_check;
ALTER TABLE "user"
  ADD CONSTRAINT user_role_check CHECK (role IN ('admin', 'moderator', 'reader'));

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope TEXT,
  "idToken" TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Application tables
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS category (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS tag (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','pending','rejected')),
  created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  moderation_note TEXT,
  reviewed_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tag ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','pending','rejected'));
ALTER TABLE tag ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE tag ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE tag ADD COLUMN IF NOT EXISTS moderation_note TEXT;
ALTER TABLE tag ADD COLUMN IF NOT EXISTS reviewed_by TEXT REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE tag ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
UPDATE tag SET status = 'approved' WHERE status IS NULL;

-- Articles
CREATE TABLE IF NOT EXISTS article (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  seo_title TEXT,
  seo_description TEXT,
  seo_image TEXT,
  canonical_url TEXT,
  robots_noindex BOOLEAN NOT NULL DEFAULT FALSE,
  content JSONB, -- TipTap JSON (ProseMirror AST)
  content_html TEXT, -- Pre-rendered HTML for public display
  content_text TEXT, -- Plain text for full-text search
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','published','rejected','archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  featured_order INTEGER,
  moderation_note TEXT,
  reviewed_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES category(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Full-text search vector
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content_text, '')), 'B')
  ) STORED
);

ALTER TABLE article ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE article ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE article ADD COLUMN IF NOT EXISTS seo_image TEXT;
ALTER TABLE article ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE article ADD COLUMN IF NOT EXISTS robots_noindex BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE article ADD COLUMN IF NOT EXISTS moderation_note TEXT;
ALTER TABLE article ADD COLUMN IF NOT EXISTS reviewed_by TEXT REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE article ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE article DROP COLUMN IF EXISTS excerpt;

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_article_search ON article USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_article_status ON article (status);
CREATE INDEX IF NOT EXISTS idx_article_author ON article (author_id);
CREATE INDEX IF NOT EXISTS idx_article_category ON article (category_id);
CREATE INDEX IF NOT EXISTS idx_article_featured ON article (is_featured, featured_order) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_article_published_at ON article (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_article_slug ON article (slug);
CREATE INDEX IF NOT EXISTS idx_article_pending_updated ON article (updated_at DESC) WHERE status = 'pending';

-- Article ↔ Tag many-to-many
CREATE TABLE IF NOT EXISTS article_tag (
  article_id TEXT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_article_tag_tag ON article_tag (tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_status_created ON tag (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tag_created_by ON tag (created_by);

-- Article Reactions (one reaction per user per article)
CREATE TABLE IF NOT EXISTS article_reaction (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  article_id TEXT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'insightful', 'inspiring', 'curious')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (article_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_article_reaction_article ON article_reaction (article_id);
CREATE INDEX IF NOT EXISTS idx_article_reaction_user ON article_reaction (user_id);

-- Admin/Moderator audit trail
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'moderator', 'reader')),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_label TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor_id ON admin_audit_log (actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_target ON admin_audit_log (action, target_type);

CREATE OR REPLACE FUNCTION audit_actor_role_for_user(actor_user_id TEXT)
RETURNS TEXT AS $$
DECLARE
  resolved_role TEXT;
BEGIN
  IF actor_user_id IS NULL THEN
    RETURN 'reader';
  END IF;

  SELECT role INTO resolved_role
  FROM "user"
  WHERE id = actor_user_id
  LIMIT 1;

  IF resolved_role IN ('admin', 'moderator', 'reader') THEN
    RETURN resolved_role;
  END IF;

  RETURN 'reader';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION audit_log_auth_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    target_label,
    metadata
  ) VALUES (
    NEW.id,
    COALESCE(NEW.role, 'reader'),
    'auth.signup',
    'user',
    NEW.id,
    NEW.email,
    jsonb_build_object('emailVerified', NEW."emailVerified")
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_auth_signup ON "user";
CREATE TRIGGER trg_audit_auth_signup
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION audit_log_auth_signup();

CREATE OR REPLACE FUNCTION audit_log_session_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    target_label,
    metadata
  ) VALUES (
    NEW."userId",
    audit_actor_role_for_user(NEW."userId"),
    'auth.session.created',
    'session',
    NEW.id,
    NEW."userAgent",
    jsonb_build_object(
      'ipAddress', NEW."ipAddress",
      'expiresAt', NEW."expiresAt"
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_session_created ON "session";
CREATE TRIGGER trg_audit_session_created
AFTER INSERT ON "session"
FOR EACH ROW
EXECUTE FUNCTION audit_log_session_created();

CREATE OR REPLACE FUNCTION audit_log_session_revoked()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    target_label,
    metadata
  ) VALUES (
    OLD."userId",
    audit_actor_role_for_user(OLD."userId"),
    'auth.session.revoked',
    'session',
    OLD.id,
    OLD."userAgent",
    jsonb_build_object(
      'ipAddress', OLD."ipAddress",
      'expiresAt', OLD."expiresAt"
    )
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_session_revoked ON "session";
CREATE TRIGGER trg_audit_session_revoked
AFTER DELETE ON "session"
FOR EACH ROW
EXECUTE FUNCTION audit_log_session_revoked();

CREATE OR REPLACE FUNCTION audit_log_password_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."providerId" = 'credential' AND OLD.password IS DISTINCT FROM NEW.password THEN
    INSERT INTO admin_audit_log (
      actor_id,
      actor_role,
      action,
      target_type,
      target_id,
      target_label,
      metadata
    ) VALUES (
      NEW."userId",
      audit_actor_role_for_user(NEW."userId"),
      'auth.password.updated',
      'account',
      NEW.id,
      NEW."providerId",
      jsonb_build_object('providerId', NEW."providerId")
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_password_updated ON account;
CREATE TRIGGER trg_audit_password_updated
AFTER UPDATE OF password ON account
FOR EACH ROW
EXECUTE FUNCTION audit_log_password_updated();

CREATE OR REPLACE FUNCTION audit_log_verification_requested()
RETURNS TRIGGER AS $$
DECLARE
  identified_user_id TEXT;
BEGIN
  SELECT id INTO identified_user_id
  FROM "user"
  WHERE email = NEW.identifier
  LIMIT 1;

  INSERT INTO admin_audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    target_label,
    metadata
  ) VALUES (
    identified_user_id,
    audit_actor_role_for_user(identified_user_id),
    'auth.verification.requested',
    'verification',
    NEW.id,
    NEW.identifier,
    jsonb_build_object('expiresAt', NEW."expiresAt")
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_verification_requested ON verification;
CREATE TRIGGER trg_audit_verification_requested
AFTER INSERT ON verification
FOR EACH ROW
EXECUTE FUNCTION audit_log_verification_requested();

-- Rate limit counters
CREATE TABLE IF NOT EXISTS rate_limit_bucket (
  rate_key TEXT NOT NULL,
  bucket_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (rate_key, bucket_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_bucket_updated_at ON rate_limit_bucket (updated_at);

-- ============================================================
-- Seed default categories
-- ============================================================
INSERT INTO category (id, name, slug, description) VALUES
  (gen_random_uuid()::text, 'Computer Science', 'computer-science', 'Research in CS, algorithms, and software engineering'),
  (gen_random_uuid()::text, 'Mathematics', 'mathematics', 'Pure and applied mathematics research'),
  (gen_random_uuid()::text, 'Physics', 'physics', 'Theoretical and experimental physics'),
  (gen_random_uuid()::text, 'Biology', 'biology', 'Life sciences and biological research'),
  (gen_random_uuid()::text, 'Engineering', 'engineering', 'Engineering disciplines and applied sciences'),
  (gen_random_uuid()::text, 'Social Sciences', 'social-sciences', 'Psychology, sociology, economics, and related fields')
ON CONFLICT DO NOTHING;
