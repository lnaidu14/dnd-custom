const { initDatabase } = require('../src/services/db');
const { mkdir } = require('fs/promises');
const { dirname } = require('path');

async function setup() {
  try {
    // Create data directory if it doesn't exist
    await mkdir('./data', { recursive: true });
    
    // Initialize database
    const db = await initDatabase();
    console.log('Database initialized successfully');
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

setup();