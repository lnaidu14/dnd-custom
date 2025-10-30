import {
  getSession,
  createOrUpdateSession,
  deleteSession,
} from "../../../../services/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id: campaignId } = req.query;

  // Handle both regular POST and sendBeacon requests
  let requestBody;
  if (req.body && typeof req.body === "string") {
    // sendBeacon sends data as string
    try {
      requestBody = JSON.parse(req.body);
    } catch (e) {
      requestBody = req.body;
    }
  } else {
    requestBody = req.body;
  }

  const { action, role, userId, userName } = requestBody;

  if (!campaignId) {
    return res.status(400).json({ error: "Campaign ID required" });
  }

  if (!action || !role || !userId) {
    return res
      .status(400)
      .json({ error: "Missing required fields: action, role, userId" });
  }

  try {
    // Get current session from database
    let currentSession = await getSession(campaignId);
    console.log("currentSession: ", currentSession);
    let connectedUsers = currentSession
      ? JSON.parse(currentSession.connected_users || "[]")
      : [];
    let dmUserId = currentSession?.dm_user_id || null;
    let dmName = currentSession?.dm_name || null;

    if (action === "join") {
      if (role === "dm") {
        // Check if DM already exists
        if (dmUserId && dmUserId !== userId) {
          return res.status(200).json({
            message: "A DM is already in this session",
            dmName: dmName,
            dmPresent: true,
          });
        }

        // Add or update DM
        const existingUserIndex = connectedUsers.findIndex(
          (user) => user.userId === userId
        );
        const dmInfo = {
          userId,
          userName: userName || `DM_${userId.slice(-4)}`,
          role: "dm",
          joinedAt: new Date().toISOString(),
        };

        if (existingUserIndex >= 0) {
          connectedUsers[existingUserIndex] = dmInfo;
        } else {
          connectedUsers.push(dmInfo);
        }

        dmUserId = userId;
        dmName = dmInfo.userName;
      } else if (role === "player") {
        // Check if session has DM
        if (!dmUserId) {
          return res.status(200).json({
            message: "Cannot join session without a DM present",
            dmPresent: false,
          });
        }

        // Add or update player
        const existingUserIndex = connectedUsers.findIndex(
          (user) => user.userId === userId
        );
        const playerInfo = {
          userId,
          userName: userName || `Player_${userId.slice(-4)}`,
          role: "player",
          joinedAt: new Date().toISOString(),
        };

        if (existingUserIndex >= 0) {
          connectedUsers[existingUserIndex] = playerInfo;
        } else {
          connectedUsers.push(playerInfo);
        }
      }
    } else if (action === "leave") {
      // Remove user from connected users
      const userIndex = connectedUsers.findIndex(
        (user) => user.userId === userId
      );

      if (userIndex !== -1) {
        const user = connectedUsers[userIndex];
        connectedUsers.splice(userIndex, 1);

        // If DM is leaving, clear DM info
        if (user.role === "dm" && dmUserId === userId) {
          dmUserId = null;
          dmName = null;
        }
      }
    }

    // Calculate player count (exclude DM)
    const playerCount = connectedUsers.filter(
      (user) => user.role === "player"
    ).length;

    // Update session in database
    await createOrUpdateSession(campaignId, {
      dm_user_id: dmUserId,
      dm_name: dmName,
      player_count: playerCount,
      connected_users: connectedUsers,
    });

    // Return session info in the format expected by existing code
    res.status(200).json({
      success: true,
      playerCount: playerCount,
      dmPresent: !!dmUserId,
      dmName: dmName,
      connectedUsers: connectedUsers.length,
      joinable: !!dmUserId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session management error:", error);
    res.status(500).json({
      error: "Failed to manage session",
      details: error.message,
    });
  }
}
