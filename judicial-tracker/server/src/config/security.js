'use strict';

const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');

// ─── CORS ─────────────────────────────────────────────────────────────────────
const getAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGINS || 'http://localhost:5173';
  return raw.split(',').map(o => o.trim());
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowed.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods:          ['GET', 'POST', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders:   ['X-Request-ID', 'X-RateLimit-Remaining'],
  credentials:      true,
  maxAge:           86400, // preflight cache: 24 h
};

// ─── Rate limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs:        parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:             parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   'Too many requests. Please try again later.',
    errorAr: 'طلبات كثيرة جداً. الرجاء المحاولة لاحقاً.',
  },
  skip: (req) => req.path === '/health',
});

// ─── Helmet preset ────────────────────────────────────────────────────────────
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      objectSrc:  ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // allow embedding if needed
};

// ─── Request-ID middleware ────────────────────────────────────────────────────
const { v4: uuidv4 } = require('uuid');
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

// ─── Apply all to Express app ─────────────────────────────────────────────────
const applySecurity = (app) => {
  app.use(helmet(helmetOptions));
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // handle pre-flight
  app.use(requestId);
  app.use('/api', apiLimiter);
};

module.exports = { applySecurity, corsOptions, apiLimiter };
