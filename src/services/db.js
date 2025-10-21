import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDatabase() {
  const db = await open({
    filename: './data/campaign_data.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      dm_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      campaign_id TEXT,
      player_id TEXT,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      stats JSON,
      inventory JSON,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    );

    CREATE TABLE IF NOT EXISTS game_states (
      id TEXT PRIMARY KEY,
      campaign_id TEXT,
      state JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export async function saveCampaignState(campaignId, state) {
  const db = await initDatabase();
  await db.run(`
    INSERT OR REPLACE INTO game_states (id, campaign_id, state, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `, [Date.now().toString() + Math.random().toString(36), campaignId, JSON.stringify(state)]);
}

export class SessionManager {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await open({
      filename: './sessions.db',
      driver: sqlite3.Database
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        campaign_id TEXT,
        state JSON,
        last_updated TIMESTAMP
      )
    `);
  }

  async saveSession(sessionId, state) {
    await this.db.run(
      'INSERT OR REPLACE INTO sessions (id, state, last_updated) VALUES (?, ?, ?)',
      [sessionId, JSON.stringify(state), new Date().toISOString()]
    );
  }
}