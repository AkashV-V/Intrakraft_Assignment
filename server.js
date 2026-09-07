const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const dbManager = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const ratioRoutes = require('./routes/ratioRoutes');
const toolRoutes = require('./routes/toolRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ratios', ratioRoutes);
app.use('/api/tools', toolRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: dbManager.getStatus(),
  });
});

// Serve main frontend index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect to Database
async function startServer(initialPort = PORT) {
  const dbInfo = await dbManager.connect();
  const server = app.listen(initialPort, () => {
    console.log(`====================================================`);
    console.log(`🚀 Catalogue REST API Server running on port ${initialPort}`);
    console.log(`🌐 Frontend URL: http://localhost:${initialPort}`);
    console.log(`📊 DB Status: ${dbInfo.connectionType} (${dbInfo.dbName})`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${initialPort} is in use, trying port ${Number(initialPort) + 1}...`);
      startServer(Number(initialPort) + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();

module.exports = app;
