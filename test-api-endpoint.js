// Test the session API endpoint directly
async function testSessionAPI() {
  const campaignId = 'be6ddef4-6821-4dee-aa32-993c5a4e9bf8';
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Session API Endpoint...');
  
  try {
    // Test 1: DM joins session
    console.log('\n1. Testing DM joining session...');
    const dmJoinResponse = await fetch(`${baseUrl}/api/campaigns/${campaignId}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        role: 'dm',
        userId: 'test-dm-123',
        userName: 'Test DM'
      })
    });
    
    console.log('DM Join Response Status:', dmJoinResponse.status);
    const dmJoinText = await dmJoinResponse.text();
    console.log('DM Join Response Text:', dmJoinText);
    
    let dmJoinData;
    try {
      dmJoinData = JSON.parse(dmJoinText);
      console.log('DM Join Response:', dmJoinData);
    } catch (e) {
      console.log('Failed to parse JSON response');
    }
    
    if (dmJoinResponse.status === 200) {
      console.log('✅ DM joined successfully');
    } else {
      console.log('❌ DM join failed');
      return;
    }
    
    // Test 2: Player joins session
    console.log('\n2. Testing player joining session...');
    const playerJoinResponse = await fetch(`${baseUrl}/api/campaigns/${campaignId}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        role: 'player',
        userId: 'test-player-456',
        userName: 'Test Player'
      })
    });
    
    console.log('Player Join Response Status:', playerJoinResponse.status);
    const playerJoinData = await playerJoinResponse.json();
    console.log('Player Join Response:', playerJoinData);
    
    if (playerJoinResponse.status === 200) {
      console.log('✅ Player joined successfully');
    } else {
      console.log('❌ Player join failed');
    }
    
    // Test 3: DM leaves session
    console.log('\n3. Testing DM leaving session...');
    const dmLeaveResponse = await fetch(`${baseUrl}/api/campaigns/${campaignId}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'leave',
        role: 'dm',
        userId: 'test-dm-123',
        userName: 'Test DM'
      })
    });
    
    console.log('DM Leave Response Status:', dmLeaveResponse.status);
    const dmLeaveData = await dmLeaveResponse.json();
    console.log('DM Leave Response:', dmLeaveData);
    
    if (dmLeaveResponse.status === 200) {
      console.log('✅ DM left successfully');
      console.log('DM Present after leaving:', dmLeaveData.dmPresent);
    } else {
      console.log('❌ DM leave failed');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testSessionAPI();
