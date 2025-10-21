import { CombatSystem } from './combatSystem';
import { SpellSystem } from './spellSystem';
import { AudioManager } from './audioManager';
import { AssetCache } from './assetCache';
import { GameStateManager } from './gameStateManager';

export class GameEngine {
  constructor() {
    this.combat = new CombatSystem();
    this.spells = new SpellSystem();
    this.audio = new AudioManager();
    this.assets = new AssetCache();
    this.state = new GameStateManager();
  }

  async initialize(campaign) {
    // Load campaign assets
    await Promise.all([
      this.assets.preloadAssets(campaign.requiredAssets),
      this.audio.loadTracks(campaign.audioTracks)
    ]);

    // Initialize systems
    this.combat.initialize(campaign.combatRules);
    this.spells.initialize(campaign.spellRules);

    await Promise.all([
      this.assets.init(),
      this.audio.init(),
      this.state.init()
    ]);
  }

  async handleAction(action) {
    const result = await this.processAction(action);
    await this.state.saveState(this.getCurrentState());
    return result;
  }

  getCurrentState() {
    return {
      combat: this.combat.getState(),
      spells: this.spells.getState(),
      audio: this.audio.getState(),
      assets: this.assets.getState()
    };
  }
}