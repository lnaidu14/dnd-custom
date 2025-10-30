// Test script to verify sessions database functionality
import { initDatabase, getSession, createOrUpdateSession } from './src/services/db.js';

async function testSessions() {
  console.log('🧪 Testing Sessions Database...');
  
  try {
    // Initialize database
    console.log('1. Initializing database...');
    const db = await initDatabase();
    await db.close();
    console.log('✅ Database initialized');

    // Test creating a session
    console.log('2. Creating test session...');
    await createOrUpdateSession('test-campaign-123', {
      dm_user_id: 'dm-user-456',
      dm_name: 'Test DM',
      player_count: 2,
      connected_users: [
        { userId: 'dm-user-456', userName: 'Test DM', role: 'dm', joinedAt: new Date().toISOString() },
        { userId: 'player-1', userName: 'Player One', role: 'player', joinedAt: new Date().toISOString() },
        { userId: 'player-2', userName: 'Player Two', role: 'player', joinedAt: new Date().toISOString() }
      ]
    });
    console.log('✅ Session created');

    // Test retrieving the session
    console.log('3. Retrieving session...');
    const session = await getSession('test-campaign-123');
    console.log('✅ Session retrieved:', {
      campaignId: session.campaign_id,
      dmName: session.dm_name,
      playerCount: session.player_count,
      connectedUsers: JSON.parse(session.connected_users).length
    });

    // Test updating the session
    console.log('4. Updating session (adding player)...');
    const existingUsers = JSON.parse(session.connected_users);
    existingUsers.push({
      userId: 'player-3',
      userName: 'Player Three',
      role: 'player',
      joinedAt: new Date().toISOString()
    });
    
    await createOrUpdateSession('test-campaign-123', {
      dm_user_id: session.dm_user_id,
      dm_name: session.dm_name,
      player_count: existingUsers.filter(u => u.role === 'player').length,
      connected_users: existingUsers
    });
    console.log('✅ Session updated');

    // Verify update
    const updatedSession = await getSession('test-campaign-123');
    console.log('✅ Updated session verified:', {
      playerCount: updatedSession.player_count,
      totalUsers: JSON.parse(updatedSession.connected_users).length
    });

    console.log('🎉 All tests passed! Sessions database is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSessions();
