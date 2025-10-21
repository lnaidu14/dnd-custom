export class CharacterProgression {
  constructor(character) {
    this.character = character;
    this.experienceTable = {
      1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
      6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
      11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
      16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
    };
  }

  addExperience(amount) {
    this.character.experience += amount;
    
    // Check for level up
    const newLevel = this.calculateLevel(this.character.experience);
    if (newLevel > this.character.level) {
      this.levelUp(newLevel);
    }

    return {
      newExperience: this.character.experience,
      leveledUp: newLevel > this.character.level,
      newLevel
    };
  }

  levelUp(newLevel) {
    const levelDiff = newLevel - this.character.level;
    for (let i = 0; i < levelDiff; i++) {
      this.applyLevelUpBenefits(this.character.level + i + 1);
    }
    this.character.level = newLevel;
  }

  calculateLevel(experience) {
    for (let level = 20; level >= 1; level--) {
      if (experience >= this.experienceTable[level]) {
        return level;
      }
    }
    return 1;
  }

  applyLevelUpBenefits(level) {
    // Add class-specific benefits
    const benefits = this.getClassBenefits(level);
    Object.assign(this.character, benefits);
  }
}