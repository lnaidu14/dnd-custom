import { ai, imageGen, resourceMonitor, getDb } from '../../../services';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check system resources first
    await resourceMonitor.checkResources();

    const { theme, campaignId } = req.body;
    const db = await getDb();

    // Generate world data
    const worldData = await ai.generateText(`Create D&D setting: ${theme}`);
    
    // Queue image generation
    const mapImage = await resourceMonitor.queueImageGeneration(
      `fantasy map of ${theme}`
    );

    // Store in database
    await db.run(`
      INSERT INTO world_data (campaign_id, description, map_url)
      VALUES (?, ?, ?)
    `, [campaignId, worldData, mapImage]);

    res.status(200).json({ worldData, mapImage });
  } catch (error) {
    console.error('World generation failed:', error);
    res.status(500).json({ error: error.message });
  }
}