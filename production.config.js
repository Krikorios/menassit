// Production configuration for MenAssist
const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    compression: true,
    helmet: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Database Configuration
  database: {
    ssl: true,
    connectionTimeout: 30000,
    idleTimeout: 30000,
    maxConnections: 20,
  },

  // Security Configuration
  security: {
    session: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://your-domain.replit.app',
      credentials: true,
    },
  },

  // AI Configuration
  ai: {
    enabled: process.env.AI_ENABLED === 'true',
    timeout: 30000,
    maxTokens: 1024,
    rateLimiting: {
      requests: 50,
      window: 60000, // 1 minute
    },
  },

  // Voice Configuration
  voice: {
    enabled: process.env.VOICE_ENABLED === 'true',
    timeout: process.env.VOICE_TIMEOUT || 30000,
    maxDuration: 60000, // 1 minute max recording
    sampleRate: 16000,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableAccessLogs: true,
    enableErrorLogs: true,
  },

  // Cache Configuration
  cache: {
    ttl: process.env.CACHE_TTL || 3600,
    maxSize: '100mb',
    compression: true,
  },

  // File Upload Configuration
  upload: {
    maxSize: process.env.MAX_UPLOAD_SIZE || '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    destination: './uploads',
  },
};

module.exports = config;