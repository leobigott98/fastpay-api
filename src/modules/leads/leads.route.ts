import type { FastifyInstance } from 'fastify';
import { createLeadHandler, getLeadByIdHandler } from './leads.controller';
import { createLeadSchema, getLeadByIdSchema } from './leads.schema';
import { CreateLeadRequest } from './leads.types';

export default async function leadsRoutes(app: FastifyInstance) {
  app.post<
    {
      Headers: { 'idempotency-key': string };
      Body: CreateLeadRequest;
    }
  >(
    '/v1/leads',
    {
      schema: createLeadSchema,
      preHandler: [app.authenticate, app.authorize(['erp:leads:create'])],
    },
    createLeadHandler
  );

  app.get<
    {
      Params: { leadId: string };
    }
  >(
    '/v1/leads/:leadId',
    {
      schema: getLeadByIdSchema,
      preHandler: [app.authenticate, app.authorize(['leads:read'])],
    },
    getLeadByIdHandler
  );
}