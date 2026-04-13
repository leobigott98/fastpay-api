import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

export default fp(async function requestTracingPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    request.log.info(
      {
        eventType: 'REQUEST_STARTED',
        method: request.method,
        url: request.url,
        correlationId: request.id,
      },
      'Request started'
    );
  });

  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        eventType: 'REQUEST_COMPLETED',
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        correlationId: request.id,
        responseTime: reply.elapsedTime,
      },
      'Request completed'
    );
  });
});