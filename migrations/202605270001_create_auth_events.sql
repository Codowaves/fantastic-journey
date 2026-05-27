CREATE TABLE IF NOT EXISTS auth_events (
  id TEXT PRIMARY KEY,
  ts TIMESTAMP DEFAULT NULL,
  workspace_id TEXT DEFAULT NULL,
  user_id TEXT DEFAULT NULL,
  ip TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  kind TEXT DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS auth_events_workspace_ts_idx
  ON auth_events (workspace_id, ts);

CREATE INDEX IF NOT EXISTS auth_events_user_ts_idx
  ON auth_events (user_id, ts);
