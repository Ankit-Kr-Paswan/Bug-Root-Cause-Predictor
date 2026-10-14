/**
 * Database schema and SQL statements for SQLite local persistence
 */

export const CURRENT_DB_VERSION = 1;

export const CREATE_ANALYSIS_TABLE_V1 = `
  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL,
    language TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    original_input TEXT NOT NULL,
    parsed_info_json TEXT NOT NULL,
    candidates_json TEXT NOT NULL,
    limitations_json TEXT NOT NULL,
    engine_type TEXT NOT NULL,
    engine_version TEXT NOT NULL,
    is_favorite INTEGER DEFAULT 0,
    is_redacted INTEGER DEFAULT 0
  );
`;

export const CREATE_ANALYSIS_INDEXES_V1 = `
  CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_analyses_category ON analyses (category);
  CREATE INDEX IF NOT EXISTS idx_analyses_language ON analyses (language);
`;

export const CREATE_APP_METADATA_TABLE = `
  CREATE TABLE IF NOT EXISTS db_metadata (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;
