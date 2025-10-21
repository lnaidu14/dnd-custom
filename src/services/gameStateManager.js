export class GameStateManager {
  constructor(db, websocket) {
    this.db = db;
    this.ws = websocket;
    this.currentState = null;
    this.subscribers = new Set();
  }

  async saveState(state) {
    this.currentState = {
      ...state,
      lastUpdated: Date.now()
    };

    // Save to local DB
    await this.db.saveGameState(this.currentState);

    // Broadcast to other players
    this.ws.broadcast('STATE_UPDATE', this.currentState);

    // Notify subscribers
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentState));
  }
}