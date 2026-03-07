const isServer = typeof window === 'undefined';

interface LogContext {
  [key: string]: any;
}

export const universalLogger = {
  info: (message: string, context?: LogContext) => {
    if (isServer) {
      try {
        const { logger } = require('@/app/lib/axiom/server');
        logger.info(message, context);
      } catch (error) {
        console.info(`[Axiom] ${message}`, context);
      }
    } else {
      console.info(`[Client] ${message}`, context);
    }
  },

  error: (message: string, context?: LogContext) => {
    if (isServer) {
      try {
        const { logger } = require('@/app/lib/axiom/server');
        logger.error(message, context);
      } catch (error) {
        console.error(`[Axiom] ${message}`, context);
      }
    } else {
      console.error(`[Client] ${message}`, context);
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (isServer) {
      try {
        const { logger } = require('@/app/lib/axiom/server');
        logger.warn(message, context);
      } catch (error) {
        console.warn(`[Axiom] ${message}`, context);
      }
    } else {
      console.warn(`[Client] ${message}`, context);
    }
  }
};
