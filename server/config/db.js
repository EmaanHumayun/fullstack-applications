import mongoose from 'mongoose';
import { env } from './env.js';
import { seedInitialData } from '../services/seed.js';

let connectPromise = null;
let memoryServerInstance = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const uri = env.MONGODB_URI;
    if (uri && uri.trim() && !uri.includes('example.mongodb.net')) {
      try {
        console.log('[db] Connecting to MongoDB Atlas...');
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log('[db] Connected to MongoDB Atlas successfully.');
        await seedInitialData();
        return;
      } catch (err) {
        console.warn('[db] MongoDB Atlas connection failed:', err.message);
        console.log('[db] Falling back to in-memory MongoDB engine for zero-config local runs...');
      }
    } else {
      console.log('[db] No external MONGODB_URI configured. Starting in-memory MongoDB engine...');
    }

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = memoryServerInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log('[db] Connected to in-memory MongoDB engine successfully.');
      await seedInitialData();
    } catch (err) {
      console.error('[db] Failed to start in-memory MongoDB:', err.message);
      throw err;
    }
  })();

  return connectPromise;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
  connectPromise = null;
}

export function getDBState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    isInMemory: !!memoryServerInstance,
    host: mongoose.connection.host || 'local'
  };
}
