import { LocalAIService } from '../../services/localAI';
import { LocalImageGenerator } from '../../services/localImageGen';

const ai = new LocalAIService();
const imageGen = new LocalImageGenerator();

export default async function handler(req, res) {
  const { theme } = req.body;
  
  try {
    // Generate world description
    const worldDescription = await ai.generateText(`
      Create a D&D campaign setting based on: ${theme}
      Include:
      - 3 major locations
      - 5 key NPCs
      - 2 potential quests
    `);

    // Generate a map
    const mapImage = await imageGen.generateImage(
      `fantasy map of ${theme}, top down view, parchment style`
    );

    res.status(200).json({
      description: worldDescription,
      map: mapImage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}