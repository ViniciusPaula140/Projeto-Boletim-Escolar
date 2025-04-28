export const config = {
  // URLs
  backendUrl: process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL || 'https://seu-backend.onrender.com'
    : 'http://localhost:5000',
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  
  // Server
  port: 5000,
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Session
  sessionSecret: process.env.SESSION_SECRET,

  // Ping Service
  pingInterval: 14 * 60 * 1000, // 14 minutes in milliseconds
  pingEnabled: process.env.NODE_ENV === 'production',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Security
  corsOrigin: process.env.CORS_ORIGIN || '*',
}; 