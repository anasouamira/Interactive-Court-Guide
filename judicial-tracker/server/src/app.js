'use strict';

const express     = require('express');
const morgan      = require('morgan');
const { applySecurity }  = require('./config/security');
const dossierRoutes      = require('./routes/dossierRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ─── 1. Security middleware (helmet, cors, rate-limit) ────────────────────────
applySecurity(app);

// ─── 2. Request logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── 3. Body parsing ─────────────────────────────────────────────────────────
app.use(express.json({
  limit: process.env.REQUEST_SIZE_LIMIT || '50kb',
  strict: true,
}));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── 4. Health check (before rate limiter hits it) ───────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'court-services-backend',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    mode:      process.env.USE_MOCK !== 'false' ? 'mock' : 'live',
    uptime:    Math.floor(process.uptime()),
  });
});

// ─── 5. API routes ───────────────────────────────────────────────────────────
app.use('/api/dossier', dossierRoutes);

// ─── 6. Root info ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name:    'Court Services — Dossier Tracking API',
    version: '1.0.0',
    docs:    'POST /api/dossier/search',
    health:  'GET  /health',
  });
});

// ─── 7. 404 + global error handler (must be last) ───────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
