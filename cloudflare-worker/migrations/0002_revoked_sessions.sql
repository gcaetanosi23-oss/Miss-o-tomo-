-- Revogação individual de sessões do professor.
-- Execute após 0001_classroom_schema.sql e antes de publicar o Worker atualizado.

CREATE TABLE IF NOT EXISTS revoked_sessions (
  jti TEXT PRIMARY KEY,
  teacher_github_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (teacher_github_id) REFERENCES teachers(github_id)
);

CREATE INDEX IF NOT EXISTS idx_revoked_sessions_expiry
  ON revoked_sessions(expires_at);
