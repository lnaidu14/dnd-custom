export class EquipmentSystem {
  constructor(character) {
    this.character = character;
    this.slots = {
      head: null,
      chest: null,
      hands: null,
      legs: null,
      feet: null,
      mainHand: null,
      offHand: null
    };
  }

  equip(item, slot) {
    if (!this.canEquip(item, slot)) {
      throw new Error('Cannot equip item in this slot');
    }

    const oldItem = this.slots[slot];
    this.slots[slot] = item;
    this.updateStats();
    
    return oldItem; // Return old item for inventory
  }

  updateStats() {
    // Recalculate character stats based on equipment
    let totalAC = 10;
    Object.values(this.slots).forEach(item => {
      if (item?.type === 'armor') totalAC += item.armorBonus;
    });
    
    this.character.armorClass = totalAC;
  }

  canEquip(item, slot) {
    // Validate slot requirements
    if (!this.slots.hasOwnProperty(slot)) return false;
    
    // Check item requirements
    if (!this.meetsRequirements(item)) return false;
    
    // Check slot compatibility
    return this.isSlotCompatible(item, slot);
  }

  meetsRequirements(item) {
    if (!item.requirements) return true;

    return Object.entries(item.requirements).every(([stat, value]) => {
      return this.character.stats[stat] >= value;
    });
  }

  isSlotCompatible(item, slot) {
    const slotTypes = {
      head: ['helmet', 'crown'],
      chest: ['armor', 'robe'],
      hands: ['gloves', 'bracers'],
      mainHand: ['weapon', 'shield', 'staff'],
      offHand: ['weapon', 'shield', 'focus']
    };

    return slotTypes[slot]?.includes(item.type) || false;
  }

  unequip(slot) {
    if (!this.slots[slot]) {
      throw new Error('No item equipped in slot');
    }

    const item = this.slots[slot];
    this.slots[slot] = null;
    this.updateStats();
    return item;
  }
}