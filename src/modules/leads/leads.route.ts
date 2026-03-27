import type { FastifyInstance } from 'fastify';
import { createLeadHandler, getLeadByIdHandler } from './leads.controller';
import { createLeadSchema, getLeadByIdSchema } from './leads.schema';

export default async function leadsRoutes(app: FastifyInstance) {
  app.post(
    '/v1/leads',
    {
      schema: createLeadSchema,
      preHandler: [app.authenticate, app.authorize(['leads:create'])],
    },
    createLeadHandler
  );

  app.get(
    '/v1/leads/:leadId',
    {
      schema: getLeadByIdSchema,
      preHandler: [app.authenticate, app.authorize(['leads:read'])],
    },
    getLeadByIdHandler
  );
}