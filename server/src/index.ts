import { config } from './config/env';
import app from './server';
import { disconnectDatabase } from './config/database';

// Start server
const server = app.listen(config.port, () => {
  console.log('\n\x1b[36m%s\x1b[0m', '╔══════════════════════════════════════════════════════════════╗');
  console.log('\x1b[36m%s\x1b[0m', '║                    \x1b[32mNavayuga Backend Server\x1b[36m                    ║');
  console.log('\x1b[36m%s\x1b[0m', '╠══════════════════════════════════════════════════════════════╣');
  console.log('\x1b[36m%s\x1b[0m', `║  \x1b[33mServer running on port:\x1b[0m \x1b[1m${config.port}\x1b[0m${' '.repeat(30 - config.port.toString().length)}║`);
  console.log('\x1b[36m%s\x1b[0m', `║  \x1b[33mEnvironment:\x1b[0m          \x1b[1m${process.env.NODE_ENV || 'development'}\x1b[0m${' '.repeat(30 - (process.env.NODE_ENV || 'development').length)}║`);
  console.log('\x1b[36m%s\x1b[0m', '║  \x1b[33mPress Ctrl+C to shutdown server\x1b[0m                         ║');
  console.log('\x1b[36m%s\x1b[0m', '╚══════════════════════════════════════════════════════════════╝\n');
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log('\n\x1b[36m%s\x1b[0m', '╔══════════════════════════════════════════════════════════════╗');
  console.log('\x1b[36m%s\x1b[0m', '║                   \x1b[31mShutting Down Server\x1b[36m                    ║');
  console.log('\x1b[36m%s\x1b[0m', '╚══════════════════════════════════════════════════════════════╝');
  
  server.close(() => {
    console.log('\x1b[32m%s\x1b[0m', '✓ Server closed successfully');
  });
  
  await disconnectDatabase();
  console.log('\x1b[32m%s\x1b[0m', '✓ Database disconnected successfully');
  
  console.log('\x1b[33m%s\x1b[0m', '\nServer shutdown complete. Goodbye! 👋\n');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);