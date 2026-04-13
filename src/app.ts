import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import swaggerPlugin from './plugins/swagger';
import dbPlugin from './plugins/db';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';
import requestContextPlugin from './plugins/request-context';
import healthRoutes from './modules/health/health.route';
import protectedRoutes from './modules/health/protected.route';
import leadsRoutes from './modules/leads/leads.route';
import preRegistrationsRoutes from './modules/preRegistrations/preRegistrations.route';
import customersRoutes from './modules/customers/customers.route';
import rateLimitPlugin from './plugins/rate-limit';
import { baseLogger } from './shared/logging/logger';
import requestTracingPlugin from './plugins/request-tracing';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    loggerInstance: baseLogger,
    disableRequestLogging: false,
    requestIdHeader: 'x-correlation-id',
    requestIdLogLabel: 'correlationId',
  });

  await app.register(requestContextPlugin);
  await app.register(swaggerPlugin);
  await app.register(dbPlugin);
  await app.register(authPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(rateLimitPlugin);
  await app.register(requestTracingPlugin);

  await app.register(healthRoutes);
  await app.register(protectedRoutes);
  await app.register(leadsRoutes);
  await app.register(preRegistrationsRoutes);
  await app.register(customersRoutes);

  return app;
}