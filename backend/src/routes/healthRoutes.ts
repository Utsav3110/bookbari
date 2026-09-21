import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to translate mongoose readyState number into human-readable string
const getDbStateName = (state: number): string => {
  switch (state) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};

router.get('/', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const dbStatus = getDbStateName(readyState);
  const isDbConnected = readyState === 1;

  const healthData = {
    status: isDbConnected ? 'ok' : 'degraded',
    server: 'running',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      connected: isDbConnected,
      readyState,
      host: isDbConnected ? mongoose.connection.host : null,
      name: isDbConnected ? mongoose.connection.name : null,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  // Return 200 OK when database is connected, 503 Service Unavailable when degraded/disconnected
  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json(healthData);
});

export default router;
