import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '..', 'twinforge.db');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Migrate on startup
export function runMigrations() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS twins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model_id TEXT NOT NULL,
      category TEXT NOT NULL,
      params TEXT NOT NULL,
      health_score REAL NOT NULL DEFAULT 0,
      simulation_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS simulations (
      id TEXT PRIMARY KEY,
      twin_id TEXT NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
      twin_name TEXT NOT NULL,
      scenario_id TEXT NOT NULL,
      scenario_name TEXT NOT NULL,
      overall_risk TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      report TEXT,
      created_at TEXT NOT NULL
    );
  `);
}
