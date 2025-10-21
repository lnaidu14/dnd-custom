import { io } from 'socket.io-client';

export class GameSocket {
  constructor(campaignId) {
    this.socket = io('ws://localhost:3001');
    this.campaignId = campaignId;
    
    this.socket.on('stateUpdate', (newState) => {
      // Update local game state
    });
  }
}

export class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
      }
    };

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };
  }
}