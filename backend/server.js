require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Security & Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const roadmapRoutes = require('./routes/roadmap');
const progressRoutes = require('./routes/progress');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/progress', progressRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Database Connection & Server Initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-mentor';

let server;

async function startServer() {
    try {
        // Try connecting to primary MongoDB URI (timeout fast if local daemon is absent)
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 2500
        });
        console.log('Connected to MongoDB via URI:', MONGO_URI);
    } catch (err) {
        console.warn('Could not connect to external MongoDB URI, falling back to embedded in-memory MongoDB...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('Connected to Embedded MongoDB Memory Server at:', uri);
        } catch (memErr) {
            console.error('Fatal: Failed to connect to any MongoDB instance:', memErr);
            process.exit(1);
        }
    }

    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();

module.exports = { app, startServer };
