import { initDatabase } from '../../../services/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { campaignName } = req.body;

  if (!campaignName) {
    return res.status(400).json({ error: 'Campaign name is required' });
  }

  try {
    const db = await initDatabase();
    
    // Find campaign by name (case-insensitive)
    const campaign = await db.get(
      'SELECT * FROM campaigns WHERE LOWER(name) = LOWER(?)',
      [campaignName]
    );

    if (!campaign) {
      // Get list of available campaigns to help user
      const allCampaigns = await db.all('SELECT name FROM campaigns ORDER BY created_at DESC');
      await db.close();
      
      return res.status(404).json({ 
        error: 'Campaign not found',
        message: `No campaign found with name "${campaignName}"`,
        availableCampaigns: allCampaigns.map(c => c.name)
      });
    }

    // Get latest game state
    const gameState = await db.get(
      'SELECT * FROM game_states WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 1',
      [campaign.id]
    );

    await db.close();

    res.status(200).json({
      success: true,
      campaign: {
        ...campaign,
        gameState: gameState ? JSON.parse(gameState.state) : null
      }
    });
  } catch (error) {
    console.error('Failed to join campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join campaign',
      details: error.message
    });
  }
}
