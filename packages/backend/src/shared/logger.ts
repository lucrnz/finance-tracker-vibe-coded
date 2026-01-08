type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly data?: unknown;
}

const formatLog = (entry: LogEntry): string => {
  const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
  if (entry.data !== undefined) {
    return `${base} ${JSON.stringify(entry.data)}`;
  }
  return base;
};

const createLogEntry = (level: LogLevel, message: string, data?: unknown): LogEntry => ({
  level,
  message,
  timestamp: new Date().toISOString(),
  data,
});

export const logger = {
  info: (message: string, data?: unknown): void => {
    console.log(formatLog(createLogEntry('info', message, data)));
  },
  warn: (message: string, data?: unknown): void => {
    console.warn(formatLog(createLogEntry('warn', message, data)));
  },
  error: (message: string, data?: unknown): void => {
    console.error(formatLog(createLogEntry('error', message, data)));
  },
  debug: (message: string, data?: unknown): void => {
    if (process.env['NODE_ENV'] !== 'production') {
      console.debug(formatLog(createLogEntry('debug', message, data)));
    }
  },
} as const;
