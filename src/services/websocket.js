import { io } from 'socket.io-client';

export class GameSocket {
  constructor(campaignId) {
    this.socket = io("ws://localhost:3001");
    this.campaignId = campaignId;

    this.socket.on("stateUpdate", (newState) => {
      // Update local game state
    });
  }
}