import { initDatabase } from '../../../services/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initDatabase();
    await db.close();
    
    res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database initialization failed',
      details: error.message 
    });
  }
}
