import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDatabase() {
  let db = await open({
    filename: "./data/campaign_data.db",
    driver: sqlite3.Database,
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

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      dm_user_id TEXT,
      dm_name TEXT,
      player_count INTEGER DEFAULT 0,
      connected_users TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
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

// Session management functions
export async function getSession(campaignId) {
  const db = await initDatabase();
  const session = await db.get(
    'SELECT * FROM sessions WHERE campaign_id = ?',
    [campaignId]
  );
  await db.close();
  return session;
}

export async function createOrUpdateSession(campaignId, sessionData) {
  const db = await initDatabase();
  const { dm_user_id, dm_name, player_count, connected_users } = sessionData;
  
  await db.run(`
    INSERT OR REPLACE INTO sessions 
    (id, campaign_id, dm_user_id, dm_name, player_count, connected_users, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    campaignId, // Use campaign_id as session id for simplicity
    campaignId,
    dm_user_id,
    dm_name,
    player_count,
    JSON.stringify(connected_users)
  ]);
  
  await db.close();
}

export async function deleteSession(campaignId) {
  const db = await initDatabase();
  await db.run('DELETE FROM sessions WHERE campaign_id = ?', [campaignId]);
  await db.close();
}