// Logger utility for error logging and monitoring

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      // userId: getCurrentUser()?.id, // TODO: Implement when auth is ready
    };
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('info', message, context);
    this.logs.push(entry);
    console.info(message, context);
    this.trimLogs();
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('warn', message, context);
    this.logs.push(entry);
    console.warn(message, context);
    this.trimLogs();
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry = this.createEntry('error', message, context, error);
    this.logs.push(entry);
    console.error(message, error, context);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(entry);
    }

    this.trimLogs();
  }

  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') {
      const entry = this.createEntry('debug', message, context);
      this.logs.push(entry);
      console.debug(message, context);
      this.trimLogs();
    }
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private async sendToService(entry: LogEntry): Promise<void> {
    try {
      // TODO: Integrate with Sentry or other error monitoring service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

