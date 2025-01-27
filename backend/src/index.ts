import app from './app';
import { testConnection } from './config/database';

const PORT = process.env.PORT || 3001;

console.log('Starting server with config:', {
  port: PORT,
  env: process.env.NODE_ENV,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME
});

const startServer = async () => {
  try {
    // Test database connection before starting server
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      console.log('--------------------');
      console.log(`Server is running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('Database:', process.env.DB_NAME);
      console.log('--------------------');
    }).on('error', (error) => {
      console.error('Error starting server:', error);
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      console.info('SIGTERM signal received.');
      console.log('Closing http server.');
      server.close(() => {
        console.log('Http server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 