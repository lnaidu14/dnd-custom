import { initDatabase } from '../../../services/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { campaignId } = req.query;

  if (!campaignId) {
    return res.status(400).json({ error: 'Campaign ID is required' });
  }

  try {
    const db = await initDatabase();
    
    // Check if campaign exists
    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    
    if (!campaign) {
      await db.close();
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Delete the campaign
    await db.run('DELETE FROM campaigns WHERE id = ?', [campaignId]);
    await db.close();

    res.status(200).json({ 
      success: true, 
      message: 'Campaign deleted successfully' 
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
}
