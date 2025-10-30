import { getSession, createOrUpdateSession, deleteSession } from '../../../services/db';

export default async function handler(req, res) {
  const { campaignId } = req.query;

  if (!campaignId) {
    return res.status(400).json({ error: 'Campaign ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get session info
        const session = await getSession(campaignId);
        
        if (!session) {
          return res.status(200).json({
            success: true,
            session: {
              campaignId,
              dmPresent: false,
              dmName: null,
              playerCount: 0,
              connectedUsers: [],
              joinable: false
            }
          });
        }

        const sessionUsers = JSON.parse(session.connected_users || '[]');
        return res.status(200).json({
          success: true,
          session: {
            campaignId,
            dmPresent: !!session.dm_user_id,
            dmName: session.dm_name,
            playerCount: session.player_count,
            connectedUsers: sessionUsers,
            joinable: !!session.dm_user_id // Only joinable if DM is present
          }
        });

      case 'POST':
        // Join or update session
        const { action, role, userId, userName } = req.body;

        if (!action || !role || !userId) {
          return res.status(400).json({ error: 'Missing required fields: action, role, userId' });
        }

        // Get current session
        let currentSession = await getSession(campaignId);
        let sessionConnectedUsers = currentSession ? JSON.parse(currentSession.connected_users || '[]') : [];
        let dmUserId = currentSession?.dm_user_id || null;
        let dmName = currentSession?.dm_name || null;

        if (action === 'join') {
          // Check if trying to join as DM when DM already exists
          if (role === 'dm' && dmUserId && dmUserId !== userId) {
            return res.status(409).json({ 
              error: 'A DM is already in this session',
              dmName: dmName
            });
          }

          // Check if session is joinable (has DM) for players
          if (role === 'player' && !dmUserId) {
            return res.status(403).json({ 
              error: 'Cannot join session without a DM present' 
            });
          }

          // Add or update user in connected users
          const existingUserIndex = sessionConnectedUsers.findIndex(user => user.userId === userId);
          const userInfo = {
            userId,
            userName: userName || `${role === 'dm' ? 'DM' : 'Player'}_${userId.slice(-4)}`,
            role,
            joinedAt: new Date().toISOString()
          };

          if (existingUserIndex >= 0) {
            sessionConnectedUsers[existingUserIndex] = userInfo;
          } else {
            sessionConnectedUsers.push(userInfo);
          }

          // Update DM info if joining as DM
          if (role === 'dm') {
            dmUserId = userId;
            dmName = userInfo.userName;
          }

        } else if (action === 'leave') {
          // Remove user from connected users
          sessionConnectedUsers = sessionConnectedUsers.filter(user => user.userId !== userId);
          
          // If DM is leaving, clear DM info
          if (role === 'dm' && dmUserId === userId) {
            dmUserId = null;
            dmName = null;
          }
        }

        // Calculate player count (exclude DM)
        const playerCount = sessionConnectedUsers.filter(user => user.role === 'player').length;

        // Update session in database
        await createOrUpdateSession(campaignId, {
          dm_user_id: dmUserId,
          dm_name: dmName,
          player_count: playerCount,
          connected_users: sessionConnectedUsers
        });

        // Return updated session info
        return res.status(200).json({
          success: true,
          session: {
            campaignId,
            dmPresent: !!dmUserId,
            dmName,
            playerCount,
            connectedUsers: sessionConnectedUsers,
            joinable: !!dmUserId
          }
        });

      case 'DELETE':
        // Delete session (when campaign ends)
        await deleteSession(campaignId);
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Session API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
