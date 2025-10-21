import { initDatabase } from '../../../services/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const db = await initDatabase();
      
      // Get campaign data
      const campaign = await db.get(
        'SELECT * FROM campaigns WHERE id = ?',
        [id]
      );

      if (!campaign) {
        await db.close();
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Get latest game state
      const gameState = await db.get(
        'SELECT * FROM game_states WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 1',
        [id]
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
      console.error('Failed to load campaign:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load campaign',
        details: error.message
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const { gameState } = req.body;
      const db = await initDatabase();
      
      // Check if campaign exists
      const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
      
      if (!campaign) {
        await db.close();
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Save game state
      await db.run(
        'INSERT INTO game_states (campaign_id, state, created_at) VALUES (?, ?, datetime("now"))',
        [id, JSON.stringify(gameState)]
      );

      await db.close();

      res.status(200).json({
        success: true,
        message: 'Campaign updated successfully'
      });
    } catch (error) {
      console.error('Failed to update campaign:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update campaign',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
