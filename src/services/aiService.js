export class LocalAIService {
  constructor() {
    this.apiUrl = '/api/ai/generate';
  }

  async generateText(prompt) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          type: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'AI response not available';
    } catch (error) {
      console.warn('AI service unavailable, using fallback:', error.message);
      return this.fallbackResponse(prompt);
    }
  }

  async generateWorld(theme) {
    return this.generateText(`Create a D&D world based on ${theme}`);
  }

  async generateNPC(role, location) {
    return this.generateText(`Create a D&D NPC ${role} for ${location}`);
  }

  async calculateDnDRules(action, params) {
    const prompt = `Given D&D 5e rules, calculate: ${action} with parameters: ${JSON.stringify(params)}`;
    return this.generateText(prompt);
  }

  async generatePortrait(description) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Fantasy character portrait: ${description}`,
          type: 'image'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Image generation error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.image;
    } catch (error) {
      console.warn('Image generation unavailable:', error.message);
      return null;
    }
  }

  async generateScenarioAssets(description) {
    return this.generateText(`Generate visual descriptions and ambient elements for: ${description}`);
  }

  fallbackResponse(prompt) {
    // Simple fallback responses when AI service is unavailable
    if (prompt.includes('item') || prompt.includes('weapon') || prompt.includes('armor')) {
      return JSON.stringify({
        name: 'Mysterious Item',
        type: 'misc',
        rarity: 'common',
        description: 'A mysterious item of unknown origin.',
        stats: {},
        effects: [],
        slot: null,
        value: 50
      });
    }
    
    return 'AI service is currently unavailable. Please try again later.';
  }
}