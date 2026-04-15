const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routers/auth');
const interviewRoutes = require('./routers/interview');
const reportsRoutes = require('./routers/reports');
const interviewSessionRoutes = require('./routers/interviewSessions');
const chatMessageRoutes = require('./routers/chatMessages');
const aiInteractionRoutes = require('./routers/aiInteractions');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/interview-sessions', interviewSessionRoutes);
app.use('/api/chat-messages', chatMessageRoutes);
app.use('/api/ai-interactions', aiInteractionRoutes);

module.exports = app;