require('dotenv').config();
require('express-async-errors');

const app = require('./app');
const connectDB = require('./utils/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`🚀 Node API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

start();
