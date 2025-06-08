import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import type { Request, Response, NextFunction } from 'express';

// Rate limiting configurations
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window (increased for development)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false, // Disable trust proxy to fix configuration error
  skip: (req) => {
    // Skip rate limiting for static assets and development
    return req.path.includes('/src/') || req.path.includes('/@') || 
           req.path.includes('.js') || req.path.includes('.css') ||
           process.env.NODE_ENV === 'development';
  }
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

export const voiceRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 voice commands per minute
  message: {
    error: 'Voice command rate limit exceeded, please wait before trying again.',
    retryAfter: '1 minute'
  }
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: {
    error: 'AI service rate limit exceeded, please wait before trying again.',
    retryAfter: '1 minute'
  }
});

// Security middleware
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// Compression middleware
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress responses larger than 1KB
});

// Error tracking middleware
export const errorTrackingMiddleware = (
  error: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Log error details
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error.status && error.status < 500) {
    // Client errors (4xx)
    res.status(error.status).json({
      error: error.message,
      ...(isDevelopment && { stack: error.stack })
    });
  } else {
    // Server errors (5xx)
    res.status(500).json({
      error: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack })
    });
  }
};

// Request logging middleware
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};