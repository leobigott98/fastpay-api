import type { FastifyInstance } from 'fastify';

export default async function protectedRoutes(app: FastifyInstance) {
  app.get(
    '/protected',
    {
      schema: {
        tags: ['Health'],
        summary: 'Protected test route',
        security: [{ bearerAuth: [] }],
      },
      preHandler: [app.authenticate, app.authorize(['erp:customers:write'])],
    },
    async (request) => {
      return {
        message: 'Protected route accessed successfully',
        user: request.user,
      };
    }
  );
}