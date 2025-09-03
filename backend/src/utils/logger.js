// Simple logger utility without external dependencies
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

const formatMessage = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    service: 'jersey-nexus-api',
    ...data
  };
  return JSON.stringify(logEntry);
};

const writeToFile = (filename, message) => {
  const filePath = path.join(logsDir, filename);
  fs.appendFileSync(filePath, message + '\n');
};

const log = (level, levelNum, message, data = {}) => {
  if (levelNum > currentLogLevel) return;

  const formattedMessage = formatMessage(level, message, data);

  // Always write to combined log
  writeToFile('combined.log', formattedMessage);

  // Write errors to error log
  if (level === 'ERROR') {
    writeToFile('error.log', formattedMessage);
  }

  // Console output in development
  if (process.env.NODE_ENV !== 'production') {
    const emoji = level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : level === 'INFO' ? 'ℹ️' : '🐛';
    console.log(`${emoji} [${level}] ${message}`, Object.keys(data).length ? data : '');
  }
};

const logger = {
  error: (message, data) => log('ERROR', LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log('WARN', LOG_LEVELS.WARN, message, data),
  info: (message, data) => log('INFO', LOG_LEVELS.INFO, message, data),
  debug: (message, data) => log('DEBUG', LOG_LEVELS.DEBUG, message, data)
};

// Helper functions for common logging patterns
const logPaymentEvent = (event, data) => {
  logger.info(`Payment Event: ${event}`, { event, ...data });
};

const logOrderEvent = (event, data) => {
  logger.info(`Order Event: ${event}`, { event, ...data });
};

const logAuthEvent = (event, data) => {
  logger.info(`Auth Event: ${event}`, { event, ...data });
};

const logError = (error, context = {}) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    ...context
  });
};

module.exports = {
  logger,
  logPaymentEvent,
  logOrderEvent,
  logAuthEvent,
  logError
};
