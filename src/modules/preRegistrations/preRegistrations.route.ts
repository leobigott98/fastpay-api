import type { FastifyInstance } from "fastify";
import {
  createPreRegistrationHandler,
  getPreRegistrationByIdHandler,
} from "./preRegistrations.controller";
import {
  createPreRegistrationSchema,
  getPreRegistrationByIdSchema,
} from "./preRegistrations.schema";
import { CreatePreRegistrationRequest } from "./preRegistrations.types";

export default async function preRegistrationsRoutes(app: FastifyInstance) {
  app.post<{
    Headers: { "idempotency-key": string };
    Body: CreatePreRegistrationRequest;
  }>(
    "/v1/pre-registrations",
    {
      schema: createPreRegistrationSchema,
      preHandler: [
        app.authenticate,
        app.authorize(["preregistrations:create"]),
      ],
    },
    createPreRegistrationHandler,
  );

  app.get<{
    Params: { preRegistrationId: string };
  }>(
    "/v1/pre-registrations/:preRegistrationId",
    {
      schema: getPreRegistrationByIdSchema,
      preHandler: [app.authenticate, app.authorize(["preregistrations:read"])],
    },
    getPreRegistrationByIdHandler,
  );
}
