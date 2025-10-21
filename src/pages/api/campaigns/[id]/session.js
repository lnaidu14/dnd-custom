// Simple in-memory session tracking (in production, use Redis or database)
const sessions = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: campaignId } = req.query;
  const { action, role, userId } = req.body;

  if (!campaignId) {
    return res.status(400).json({ error: 'Campaign ID required' });
  }

  // Initialize session if it doesn't exist
  if (!sessions.has(campaignId)) {
    sessions.set(campaignId, {
      playerCount: 0,
      dmPresent: false,
      connectedUsers: [],
      dmUserId: null
    });
  }

  const session = sessions.get(campaignId);

  try {
    if (action === 'join') {
      if (role === 'dm') {
        // Check if DM already exists
        if (session.dmPresent) {
          return res.status(409).json({ 
            error: 'A DM is already in this session',
            sessionInfo: session
          });
        }
        
        session.dmPresent = true;
        session.dmUserId = userId;
        session.connectedUsers.push({ userId, role: 'dm', joinedAt: new Date() });
      } else if (role === 'player') {
        // Check if user already connected
        const existingUser = session.connectedUsers.find(user => user.userId === userId);
        if (!existingUser) {
          session.playerCount++;
          session.connectedUsers.push({ userId, role: 'player', joinedAt: new Date() });
        }
      }
    } else if (action === 'leave') {
      // Find and remove user
      const userIndex = session.connectedUsers.findIndex(user => user.userId === userId);
      if (userIndex !== -1) {
        const user = session.connectedUsers[userIndex];
        session.connectedUsers.splice(userIndex, 1);
        
        if (user.role === 'dm') {
          session.dmPresent = false;
          session.dmUserId = null;
        } else if (user.role === 'player') {
          session.playerCount = Math.max(0, session.playerCount - 1);
        }
      }
    }

    // Update session
    sessions.set(campaignId, session);

    res.status(200).json({
      success: true,
      playerCount: session.playerCount,
      dmPresent: session.dmPresent,
      connectedUsers: session.connectedUsers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session management error:', error);
    res.status(500).json({
      error: 'Failed to manage session',
      details: error.message
    });
  }
}
