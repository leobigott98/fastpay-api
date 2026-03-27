import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

export default fp(async function requestContextPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    const externalCorrelationId = request.headers['x-correlation-id'];

    if (typeof externalCorrelationId === 'string' && externalCorrelationId.trim()) {
      request.log = request.log.child({
        externalCorrelationId,
      });
    }

    request.log = request.log.child({
      correlationId: request.id,
    });
  });
});