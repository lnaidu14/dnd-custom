import { initDatabase } from '../../../services/db';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const db = await initDatabase();

      await db.close();

      res.status(200).json({
        success: true,
        message: "Database initialized"
      });
    } catch (error) {
      console.error('Campaign creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create campaign',
        details: error.message
      });
    }
  } else if (req.method === 'GET') {
    // List campaigns
    try {
      const db = await initDatabase();
      const campaigns = await db.all('SELECT * FROM campaigns ORDER BY created_at DESC');
      await db.close();

      res.status(200).json({
        success: true,
        campaigns
      });
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch campaigns',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
