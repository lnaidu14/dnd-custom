import { initDatabase } from '../../../services/db';
// Use crypto.randomUUID or fallback for browser compatibility
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Campaign name is required' });
  }

  try {
    const db = await initDatabase();
    const campaignId = generateUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO campaigns (id, name, description, dm_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [campaignId, name, description || '', 'current_user', now, now]
    );

    await db.close();

    res.status(200).json({
      success: true,
      campaign: {
        id: campaignId,
        name,
        description: description || '',
        dm_id: 'current_user',
        created_at: now,
        updated_at: now
      }
    });
  } catch (error) {
    console.error('Campaign creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
      details: error.message
    });
  }
}
