import type { FastifyInstance } from 'fastify';
import {
  createPreRegistrationHandler,
  getPreRegistrationByIdHandler,
} from './preRegistrations.controller';
import {
  createPreRegistrationSchema,
  getPreRegistrationByIdSchema,
} from './preRegistrations.schema';

export default async function preRegistrationsRoutes(app: FastifyInstance) {
  app.post(
    '/v1/pre-registrations',
    {
      schema: createPreRegistrationSchema,
      preHandler: [app.authenticate, app.authorize(['preregistrations:create'])],
    },
    createPreRegistrationHandler
  );

  app.get(
    '/v1/pre-registrations/:preRegistrationId',
    {
      schema: getPreRegistrationByIdSchema,
      preHandler: [app.authenticate, app.authorize(['preregistrations:read'])],
    },
    getPreRegistrationByIdHandler
  );
}