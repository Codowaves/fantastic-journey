CREATE TABLE IF NOT EXISTS workspace_users (
  workspace_id TEXT NOT NULL,
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS workspace_users_workspace_canonical_email_idx
  ON workspace_users (workspace_id, lower(trim(email)));
