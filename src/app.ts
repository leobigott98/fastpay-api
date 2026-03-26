import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { env } from './config/env';
import swaggerPlugin from './plugins/swagger';
import dbPlugin from './plugins/db';
import healthRoutes from './modules/health/health.route';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    disableRequestLogging: false,
  });

  await app.register(swaggerPlugin);
  await app.register(dbPlugin);
  await app.register(healthRoutes);

  return app;
}