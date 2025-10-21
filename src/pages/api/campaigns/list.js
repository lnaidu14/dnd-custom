import { initDatabase } from '../../../services/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initDatabase();
    const campaigns = await db.all(
      'SELECT * FROM campaigns ORDER BY updated_at DESC'
    );
    await db.close();

    res.status(200).json({
      success: true,
      campaigns
    });
  } catch (error) {
    console.error('Failed to load campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load campaigns',
      details: error.message
    });
  }
}
