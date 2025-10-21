export class SessionManager {
  constructor(db) {
    this.db = db;
    this.currentSession = null;
    this.saveInterval = null;
  }

  async startSession(campaignId) {
    this.currentSession = {
      id: crypto.randomUUID(),
      campaignId,
      startTime: Date.now(),
      state: {
        players: [],
        combatLog: [],
        activeEffects: [],
        boardState: null
      }
    };

    // Start auto-save
    this.saveInterval = setInterval(() => this.saveSession(), 60000);
    
    return this.currentSession;
  }

  async saveSession() {
    if (!this.currentSession) return;

    await this.db.run(`
      INSERT OR REPLACE INTO sessions (
        id, campaign_id, state, last_updated
      ) VALUES (?, ?, ?, datetime('now'))
    `, [
      this.currentSession.id,
      this.currentSession.campaignId,
      JSON.stringify(this.currentSession.state)
    ]);
  }

  async loadSession(sessionId) {
    const session = await this.db.get(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId]
    );

    if (!session) throw new Error('Session not found');

    this.currentSession = {
      ...session,
      state: JSON.parse(session.state)
    };

    return this.currentSession;
  }
}