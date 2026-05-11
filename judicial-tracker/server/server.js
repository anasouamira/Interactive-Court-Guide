'use strict';

require('dotenv').config();

const app  = require('./src/app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  const env  = process.env.NODE_ENV || 'development';
  const mock = process.env.USE_MOCK !== 'false' ? '  [MOCK MODE]' : '  [LIVE MODE]';
  console.log('');
  console.log('  ┌────────────────────────────────────────────┐');
  console.log(`  │  Court Services Backend running            │`);
  console.log(`  │  http://localhost:${PORT}${' '.repeat(26 - PORT.toString().length)}│`);
  console.log(`  │  ENV: ${env}${' '.repeat(37 - env.length)}│`);
  console.log(`  │  Mode:${mock}${' '.repeat(37 - mock.length)}│`);
  console.log('  └────────────────────────────────────────────┘');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[server] SIGINT received — shutting down');
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled Rejection:', reason);
  process.exit(1);
});
