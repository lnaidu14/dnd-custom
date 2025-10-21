export class ItemGenerator {
  constructor(aiService) {
    this.aiService = aiService;
    this.itemTemplates = {
      weapon: {
        types: ['sword', 'axe', 'mace', 'bow', 'crossbow', 'staff', 'dagger', 'spear'],
        materials: ['iron', 'steel', 'mithril', 'adamantine', 'silver', 'cold iron'],
        enchantments: ['flaming', 'frost', 'shocking', 'vicious', 'keen', 'defending']
      },
      armor: {
        types: ['leather', 'chain', 'plate', 'scale', 'studded leather', 'splint'],
        materials: ['leather', 'chain', 'steel', 'mithril', 'adamantine'],
        enchantments: ['resistance', 'protection', 'deflection', 'fortification']
      },
      accessory: {
        types: ['ring', 'amulet', 'cloak', 'boots', 'gloves', 'belt'],
        materials: ['gold', 'silver', 'platinum', 'mithril', 'dragon scale'],
        enchantments: ['invisibility', 'flying', 'strength', 'dexterity', 'constitution']
      },
      potion: {
        types: ['healing', 'mana', 'strength', 'speed', 'invisibility', 'resistance'],
        strengths: ['minor', 'moderate', 'greater', 'superior', 'supreme']
      },
      scroll: {
        types: ['spell', 'blessing', 'curse', 'summoning', 'teleportation'],
        levels: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      }
    };
  }

  async generateItem(prompt) {
    try {
      // Parse the prompt to determine item type and properties
      const itemData = await this.parsePrompt(prompt);
      
      // Generate item using AI
      const aiResponse = await this.aiService.generateText(`
        Create a D&D 5e magical item based on this description: "${prompt}"
        
        Return a JSON object with these fields:
        - name: The item's name
        - type: weapon, armor, accessory, potion, scroll, tool, or misc
        - rarity: common, uncommon, rare, epic, or legendary
        - description: A brief description of the item
        - stats: Object with stat bonuses (e.g., { "attack": 2, "damage": 1 })
        - effects: Array of special effects or abilities
        - slot: Equipment slot (mainHand, offHand, head, chest, hands, legs, feet, or null for consumables)
        - value: Gold piece value
        
        Make it balanced for D&D 5e and interesting for players.
      `);

      // Parse AI response and create item
      const item = this.parseAIResponse(aiResponse, itemData);
      
      // Add unique ID and ensure required fields
      return {
        id: crypto.randomUUID(),
        name: item.name || 'Mysterious Item',
        type: item.type || 'misc',
        rarity: item.rarity || 'common',
        description: item.description || 'A mysterious item of unknown origin.',
        stats: item.stats || {},
        effects: item.effects || [],
        slot: item.slot || null,
        value: item.value || 10,
        generated: true,
        prompt: prompt
      };
    } catch (error) {
      console.error('Item generation failed:', error);
      // Fallback to template-based generation
      return this.generateFromTemplate(prompt);
    }
  }

  async parsePrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Determine item type
    let type = 'misc';
    if (lowerPrompt.includes('sword') || lowerPrompt.includes('weapon') || lowerPrompt.includes('blade')) {
      type = 'weapon';
    } else if (lowerPrompt.includes('armor') || lowerPrompt.includes('mail') || lowerPrompt.includes('plate')) {
      type = 'armor';
    } else if (lowerPrompt.includes('ring') || lowerPrompt.includes('amulet') || lowerPrompt.includes('cloak')) {
      type = 'accessory';
    } else if (lowerPrompt.includes('potion') || lowerPrompt.includes('elixir')) {
      type = 'potion';
    } else if (lowerPrompt.includes('scroll') || lowerPrompt.includes('spell')) {
      type = 'scroll';
    }

    // Determine rarity based on power level
    let rarity = 'common';
    if (lowerPrompt.includes('legendary') || lowerPrompt.includes('artifact')) {
      rarity = 'legendary';
    } else if (lowerPrompt.includes('epic') || lowerPrompt.includes('very powerful')) {
      rarity = 'epic';
    } else if (lowerPrompt.includes('rare') || lowerPrompt.includes('powerful')) {
      rarity = 'rare';
    } else if (lowerPrompt.includes('uncommon') || lowerPrompt.includes('magical')) {
      rarity = 'uncommon';
    }

    return { type, rarity };
  }

  parseAIResponse(aiResponse, itemData) {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error);
    }

    // Fallback parsing
    return {
      name: this.extractName(aiResponse) || 'Generated Item',
      type: itemData.type,
      rarity: itemData.rarity,
      description: aiResponse.substring(0, 200) + '...',
      stats: this.extractStats(aiResponse),
      effects: this.extractEffects(aiResponse),
      slot: this.determineSlot(itemData.type),
      value: this.calculateValue(itemData.rarity)
    };
  }

  extractName(response) {
    const nameMatch = response.match(/name["\s]*:["\s]*([^",\n]+)/i);
    return nameMatch ? nameMatch[1].trim() : null;
  }

  extractStats(response) {
    const stats = {};
    const statMatches = response.match(/(\w+)\s*:\s*(\d+)/g);
    if (statMatches) {
      statMatches.forEach(match => {
        const [key, value] = match.split(':').map(s => s.trim());
        if (['attack', 'damage', 'armor', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(key.toLowerCase())) {
          stats[key.toLowerCase()] = parseInt(value);
        }
      });
    }
    return stats;
  }

  extractEffects(response) {
    const effects = [];
    const effectMatches = response.match(/effect[s]?["\s]*:["\s]*([^",\n]+)/gi);
    if (effectMatches) {
      effectMatches.forEach(match => {
        const effect = match.split(':')[1]?.trim();
        if (effect) effects.push(effect);
      });
    }
    return effects;
  }

  determineSlot(type) {
    const slotMap = {
      weapon: 'mainHand',
      armor: 'chest',
      accessory: null, // Will be determined by specific type
      potion: null,
      scroll: null,
      tool: null,
      misc: null
    };
    return slotMap[type] || null;
  }

  calculateValue(rarity) {
    const valueMap = {
      common: 50,
      uncommon: 200,
      rare: 1000,
      epic: 5000,
      legendary: 25000
    };
    return valueMap[rarity] || 50;
  }

  generateFromTemplate(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const itemData = this.parsePrompt(prompt);
    
    // Generate from templates
    const template = this.itemTemplates[itemData.type];
    if (!template) {
      return this.createGenericItem(itemData);
    }

    const name = this.generateName(template, itemData);
    const stats = this.generateStats(itemData.rarity);
    const effects = this.generateEffects(itemData.rarity);

    return {
      id: crypto.randomUUID(),
      name,
      type: itemData.type,
      rarity: itemData.rarity,
      description: this.generateDescription(name, effects),
      stats,
      effects,
      slot: this.determineSlot(itemData.type),
      value: this.calculateValue(itemData.rarity),
      generated: true,
      prompt: prompt
    };
  }

  generateName(template, itemData) {
    const type = template.types[Math.floor(Math.random() * template.types.length)];
    const material = template.materials[Math.floor(Math.random() * template.materials.length)];
    const enchantment = template.enchantments[Math.floor(Math.random() * template.enchantments.length)];
    
    return `${enchantment} ${material} ${type}`;
  }

  generateStats(rarity) {
    const statCount = {
      common: 1,
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4
    };

    const stats = {};
    const possibleStats = ['attack', 'damage', 'armor', 'strength', 'dexterity', 'constitution'];
    const count = statCount[rarity] || 1;

    for (let i = 0; i < count; i++) {
      const stat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
      const value = Math.floor(Math.random() * 3) + 1; // 1-3 bonus
      stats[stat] = value;
    }

    return stats;
  }

  generateEffects(rarity) {
    const effects = [];
    const effectCount = {
      common: 0,
      uncommon: 1,
      rare: 1,
      epic: 2,
      legendary: 3
    };

    const possibleEffects = [
      'Grants resistance to fire damage',
      'Allows the wearer to cast a spell once per day',
      'Increases movement speed by 10 feet',
      'Grants advantage on saving throws',
      'Allows the wearer to see in magical darkness',
      'Grants the ability to fly for 1 minute per day'
    ];

    const count = effectCount[rarity] || 0;
    for (let i = 0; i < count; i++) {
      const effect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
      if (!effects.includes(effect)) {
        effects.push(effect);
      }
    }

    return effects;
  }

  generateDescription(name, effects) {
    let description = `A ${name.toLowerCase()} that`;
    
    if (effects.length === 0) {
      description += ' appears to be of fine craftsmanship.';
    } else if (effects.length === 1) {
      description += ` ${effects[0].toLowerCase()}.`;
    } else {
      description += ` ${effects[0].toLowerCase()} and ${effects[1].toLowerCase()}.`;
    }

    return description;
  }

  createGenericItem(itemData) {
    return {
      id: crypto.randomUUID(),
      name: 'Mysterious Item',
      type: itemData.type,
      rarity: itemData.rarity,
      description: 'A mysterious item of unknown origin and purpose.',
      stats: {},
      effects: [],
      slot: null,
      value: this.calculateValue(itemData.rarity),
      generated: true,
      prompt: prompt
    };
  }
}

