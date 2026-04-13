import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { multistream } from 'pino';
import { env } from '../../config/env';
import { FastifyBaseLogger } from 'fastify';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const appLogPath = path.join(logsDir, 'app.log');
const errorLogPath = path.join(logsDir, 'error.log');

const streams = [
  {
    level: env.LOG_LEVEL,
    stream:
      process.env.NODE_ENV === 'production'
        ? pino.destination(appLogPath)
        : pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }),
  },
  {
    level: 'info',
    stream: pino.destination(appLogPath),
  },
  {
    level: 'error',
    stream: pino.destination(errorLogPath),
  },
];

export const baseLogger = pino(
  {
    level: env.LOG_LEVEL,
    base: {
      service: 'fastpay-integration-api',
      env: process.env.NODE_ENV || 'development',
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'authorization',
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'body.attachments.*.contentBase64',
      ],
      censor: '[REDACTED]',
    },
    msgPrefix: '[FastPay Integration API] ',
  },
  multistream(streams)
) as FastifyBaseLogger;