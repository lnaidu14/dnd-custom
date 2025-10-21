export class CombatSystem {
  constructor() {
    this.activeEffects = new Map();
    this.turnOrder = [];
    this.currentTurn = 0;
    this.animations = new Map();
    this.actionEconomy = new Map(); // Track actions per turn
    this.environmentalEffects = new Map();
  }

  async initiateCombat(participants) {
    // Roll initiative for all participants
    this.turnOrder = await Promise.all(participants.map(async (p) => {
      const initiative = await this.rollInitiative(p);
      return { ...p, initiative };
    }));
    
    // Sort by initiative
    this.turnOrder.sort((a, b) => b.initiative - a.initiative);
    return this.turnOrder;
  }

  async performAction(action) {
    const { actor, target, actionType, spell, elevationBonus = 0, coverPenalty = 0 } = action;
    
    // Check action economy
    if (!this.canPerformAction(actor, actionType)) {
      throw new Error('Cannot perform action: insufficient actions remaining');
    }
    
    // Consume action
    this.consumeAction(actor, actionType);
    
    switch (actionType) {
      case 'attack':
        return this.resolveAttack(actor, target, elevationBonus, coverPenalty);
      case 'spell':
        return this.resolveSpell(actor, target, spell);
      case 'move':
        return this.resolveMovement(actor, action.position);
      case 'interact':
        return this.resolveEnvironmentalInteraction(actor, action.object, action.position);
      default:
        throw new Error('Invalid action type');
    }
  }

  resolveAttack(actor, target, elevationBonus = 0, coverPenalty = 0) {
    // Calculate hit with BG3-style modifiers
    const baseRoll = this.rollD20();
    const attackRoll = baseRoll + actor.attackBonus + elevationBonus - coverPenalty;
    const hits = attackRoll >= target.armorClass;
    
    // Critical hit/miss
    const isCritical = baseRoll === 20;
    const isCriticalMiss = baseRoll === 1;
    
    if (isCriticalMiss) {
      return {
        success: false,
        critical: true,
        animation: 'critical-miss',
        message: `${actor.name} critically misses ${target.name}!`
      };
    }
    
    if (hits || isCritical) {
      const damage = this.calculateDamage(actor.weapon, isCritical);
      target.currentHP -= damage;
      
      return {
        success: true,
        damage,
        critical: isCritical,
        elevationBonus,
        coverPenalty,
        animation: isCritical ? 'critical-hit' : 'melee-attack',
        message: `${actor.name} ${isCritical ? 'critically ' : ''}hits ${target.name} for ${damage} damage!`
      };
    }
    
    return {
      success: false,
      elevationBonus,
      coverPenalty,
      animation: 'miss',
      message: `${actor.name}'s attack missed ${target.name}!`
    };
  }

  calculateDamage(attacker, defender, ability) {
    const baseRoll = Math.floor(Math.random() * 20) + 1;
    const attackBonus = attacker.proficiencyBonus + attacker.abilityModifiers[ability];
    const totalAttack = baseRoll + attackBonus;
    
    if (baseRoll === 20) return this.calculateCritical(attacker, ability);
    if (baseRoll === 1) return { damage: 0, missed: true };
    
    if (totalAttack >= defender.armorClass) {
      return this.calculateHit(attacker, ability);
    }
    
    return { damage: 0, missed: true };
  }

  applyEffect(targetId, effect) {
    this.activeEffects.set(targetId, [
      ...(this.activeEffects.get(targetId) || []),
      { ...effect, duration: effect.duration }
    ]);
  }

  // Action Economy System (BG3-style)
  canPerformAction(actor, actionType) {
    const actions = this.actionEconomy.get(actor.id) || {
      action: true,
      bonusAction: true,
      movement: true,
      reaction: true
    };
    
    switch (actionType) {
      case 'attack':
      case 'spell':
        return actions.action;
      case 'bonusAction':
        return actions.bonusAction;
      case 'move':
        return actions.movement;
      case 'reaction':
        return actions.reaction;
      default:
        return true;
    }
  }

  consumeAction(actor, actionType) {
    const actions = this.actionEconomy.get(actor.id) || {
      action: true,
      bonusAction: true,
      movement: true,
      reaction: true
    };
    
    switch (actionType) {
      case 'attack':
      case 'spell':
        actions.action = false;
        break;
      case 'bonusAction':
        actions.bonusAction = false;
        break;
      case 'move':
        actions.movement = false;
        break;
      case 'reaction':
        actions.reaction = false;
        break;
    }
    
    this.actionEconomy.set(actor.id, actions);
  }

  resetActions(actor) {
    this.actionEconomy.set(actor.id, {
      action: true,
      bonusAction: true,
      movement: true,
      reaction: true
    });
  }

  // Environmental Interactions
  resolveEnvironmentalInteraction(actor, object, position) {
    switch (object.type) {
      case 'chest':
        return this.openChest(actor, object);
      case 'door':
        return this.openDoor(actor, object);
      case 'lever':
        return this.activateLever(actor, object);
      case 'fire':
        return this.handleFire(actor, object);
      case 'acid':
        return this.handleAcid(actor, object);
      default:
        return {
          success: false,
          message: `Cannot interact with ${object.type}`
        };
    }
  }

  openChest(actor, chest) {
    // Simple chest opening - could be enhanced with locks, traps, etc.
    return {
      success: true,
      message: `${actor.name} opens the chest!`,
      loot: this.generateLoot(chest.lootLevel || 1)
    };
  }

  openDoor(actor, door) {
    // Door opening - could require strength checks, keys, etc.
    return {
      success: true,
      message: `${actor.name} opens the door!`,
      effect: 'door_opened'
    };
  }

  activateLever(actor, lever) {
    // Lever activation - could trigger traps, open passages, etc.
    return {
      success: true,
      message: `${actor.name} activates the lever!`,
      effect: lever.effect || 'unknown'
    };
  }

  handleFire(actor, fire) {
    // Fire damage - could be enhanced with saving throws
    const damage = this.rollD6();
    actor.currentHP -= damage;
    return {
      success: true,
      message: `${actor.name} takes ${damage} fire damage!`,
      damage
    };
  }

  handleAcid(actor, acid) {
    // Acid damage - could be enhanced with saving throws
    const damage = this.rollD4();
    actor.currentHP -= damage;
    return {
      success: true,
      message: `${actor.name} takes ${damage} acid damage!`,
      damage
    };
  }

  // Utility methods
  rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  rollD6() {
    return Math.floor(Math.random() * 6) + 1;
  }

  rollD4() {
    return Math.floor(Math.random() * 4) + 1;
  }

  calculateDamage(weapon, isCritical = false) {
    if (!weapon) return 0;
    
    const baseDamage = weapon.damage || 6; // Default 1d6
    const damage = this.rollD6();
    
    return isCritical ? damage * 2 : damage;
  }

  generateLoot(level) {
    // Simple loot generation - could be enhanced with AI
    const lootTypes = ['gold', 'potion', 'weapon', 'armor', 'scroll'];
    const type = lootTypes[Math.floor(Math.random() * lootTypes.length)];
    
    return {
      type,
      value: level * 10,
      description: `A ${type} of level ${level}`
    };
  }
}