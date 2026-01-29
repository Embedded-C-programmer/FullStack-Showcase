// ==================== backend/src/utils/logger.js (ENHANCED) ====================
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const formatLog = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${logData}\n`;
};

const writeToFile = (filename, content) => {
    try {
        const filePath = path.join(logDir, filename);
        fs.appendFileSync(filePath, content);
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
};

const logger = {
    info: (message, data = null) => {
        const log = formatLog('INFO', message, data);
        console.log(log.trim());
        if (process.env.NODE_ENV !== 'test') {
            writeToFile('app.log', log);
        }
    },

    error: (message, error = null) => {
        const errorMessage = error ? `${message}: ${error.message || error}` : message;
        const log = formatLog('ERROR', errorMessage);
        console.error(log.trim());

        if (process.env.NODE_ENV !== 'test') {
            writeToFile('error.log', log);

            if (error && error.stack) {
                writeToFile('error.log', `Stack trace:\n${error.stack}\n`);
            }
        }
    },

    warn: (message, data = null) => {
        const log = formatLog('WARN', message, data);
        console.warn(log.trim());
        if (process.env.NODE_ENV !== 'test') {
            writeToFile('app.log', log);
        }
    },

    debug: (message, data = null) => {
        if (process.env.NODE_ENV === 'development') {
            const log = formatLog('DEBUG', message, data);
            console.log(log.trim());
            writeToFile('debug.log', log);
        }
    },

    http: (req, res, responseTime) => {
        const log = formatLog('HTTP', `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`);
        console.log(log.trim());
        if (process.env.NODE_ENV !== 'test') {
            writeToFile('http.log', log);
        }
    }
};

// Clean old logs (keep last 7 days)
const cleanOldLogs = () => {
    try {
        const files = fs.readdirSync(logDir);
        const now = Date.now();
        const weekInMs = 7 * 24 * 60 * 60 * 1000;

        files.forEach(file => {
            const filePath = path.join(logDir, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtimeMs > weekInMs) {
                fs.unlinkSync(filePath);
                console.log(`Deleted old log file: ${file}`);
            }
        });
    } catch (error) {
        console.error('Error cleaning old logs:', error);
    }
};

// Run cleanup once a day
if (process.env.NODE_ENV === 'production') {
    setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);
}

module.exports = logger;