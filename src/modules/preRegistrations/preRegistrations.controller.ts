import type { FastifyReply, FastifyRequest } from 'fastify';
import { preRegistrationsService } from './preRegistrations.service';
import type {
  CreatePreRegistrationRequest,
  CreatePreRegistrationResponse,
  PreRegistrationDetailsResponse,
} from './preRegistrations.types';

type CreatePreRegistrationRequestFastify = FastifyRequest<{
  Headers: {
    'idempotency-key': string;
  };
  Body: CreatePreRegistrationRequest;
}>;

type GetPreRegistrationByIdRequestFastify = FastifyRequest<{
  Params: {
    preRegistrationId: string;
  };
}>;

export async function createPreRegistrationHandler(
  request: CreatePreRegistrationRequestFastify,
  reply: FastifyReply
): Promise<void> {
  const result: CreatePreRegistrationResponse =
    await preRegistrationsService.createPreRegistration(
      request.server,
      request.body,
      {
        idempotencyKey: request.headers['idempotency-key'],
        actorId: request.user.sub,
        correlationId: request.id,
      }
    );

  void reply.code(201).send(result);
}

export async function getPreRegistrationByIdHandler(
  request: GetPreRegistrationByIdRequestFastify,
  reply: FastifyReply
): Promise<void> {
  const result: PreRegistrationDetailsResponse =
    await preRegistrationsService.getPreRegistrationById(
      request.server,
      request.params.preRegistrationId,
      {
        actorId: request.user.sub,
        correlationId: request.id,
      }
    );

  void reply.code(200).send(result);
}