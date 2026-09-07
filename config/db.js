const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS SRV lookup issues with mongodb+srv:// URIs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if DNS server override is restricted
}

class DatabaseConnectionManager {
  constructor() {
    this.isConnected = false;
    this.connectionType = 'none';
    this.mongoServer = null;
  }

  async connect() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/catalogue_db';

    try {
      // Attempt 1: Connect to configured MongoDB URI (Local or Atlas)
      console.log(`Connecting to MongoDB at: ${mongoUri}...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      this.isConnected = true;
      this.connectionType = 'MongoDB Host';
      console.log(`MongoDB Connected successfully (${this.connectionType})`);
    } catch (err) {
      console.warn(`Could not connect to target MongoDB (${err.message}). Initializing MongoMemoryServer fallback...`);
      
      try {
        // Attempt 2: Fallback to MongoDB Memory Server for standalone environments
        const { MongoMemoryServer } = require('mongodb-memory-server');
        this.mongoServer = await MongoMemoryServer.create();
        const memoryUri = this.mongoServer.getUri();
        
        await mongoose.connect(memoryUri);
        this.isConnected = true;
        this.connectionType = 'Embedded MongoMemoryServer (In-Memory)';
        console.log(`MongoDB Connected successfully (${this.connectionType})`);
      } catch (memErr) {
        console.error(`Failed to start MongoMemoryServer: ${memErr.message}`);
        this.isConnected = false;
        this.connectionType = 'Disconnected';
      }
    }

    return {
      isConnected: this.isConnected,
      connectionType: this.connectionType,
      host: mongoose.connection.host || 'localhost',
      dbName: mongoose.connection.name || 'catalogue_db'
    };
  }

  getStatus() {
    return {
      isConnected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      connectionType: this.connectionType,
      host: mongoose.connection.host || 'none',
      dbName: mongoose.connection.name || 'none'
    };
  }

  async disconnect() {
    await mongoose.disconnect();
    if (this.mongoServer) {
      await this.mongoServer.stop();
    }
    this.isConnected = false;
    this.connectionType = 'Disconnected';
  }
}

const dbManager = new DatabaseConnectionManager();
module.exports = dbManager;
