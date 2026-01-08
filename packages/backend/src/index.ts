import { createApp } from './app.js';
import { config } from './shared/config.js';
import { connectDatabase, disconnectDatabase } from './shared/database.js';
import { logger } from './shared/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('Connected to database');

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
