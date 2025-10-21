import { LocalAIService } from './aiService';
import { LocalImageGenerator } from './imageGenerator';
import { initDatabase } from './db';
import { ResourceMonitor } from './resourceMonitor';

// Singleton instances
export const ai = new LocalAIService();
export const imageGen = new LocalImageGenerator();
export const resourceMonitor = new ResourceMonitor();

// Database connection
let db = null;
export const getDb = async () => {
  if (!db) {
    db = await initDatabase();
  }
  return db;
};