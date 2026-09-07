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
    if (mongoose.connection.readyState === 1) {
      this.isConnected = true;
      return {
        isConnected: true,
        connectionType: this.connectionType || 'MongoDB Host',
        host: mongoose.connection.host,
        dbName: mongoose.connection.name
      };
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/catalogue_db';

    try {
      const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
      console.log(`Connecting to MongoDB at: ${maskedUri}...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      this.isConnected = true;
      this.connectionType = 'MongoDB Host';
      console.log(`MongoDB Connected successfully (${this.connectionType})`);
    } catch (err) {
      console.warn(`Could not connect to target MongoDB (${err.message}).`);

      // Only attempt MongoMemoryServer in local environment (NOT on Vercel)
      if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
        try {
          console.log("Initializing MongoMemoryServer fallback for local dev...");
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
      } else {
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
