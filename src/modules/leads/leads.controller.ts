import type { FastifyReply, FastifyRequest } from 'fastify';
import { leadsService } from './leads.service';
import type {
  CreateLeadRequest,
  CreateLeadResponse,
  LeadDetailsResponse,
} from './leads.types';

type CreateLeadRequestFastify = FastifyRequest<{
  Headers: {
    'idempotency-key': string;
  };
  Body: CreateLeadRequest;
}>;

type GetLeadByIdRequestFastify = FastifyRequest<{
  Params: {
    leadId: string;
  };
}>;

export async function createLeadHandler(
  request: CreateLeadRequestFastify,
  reply: FastifyReply
): Promise<void> {
  const idempotencyKey = request.headers['idempotency-key'];

  const result: CreateLeadResponse = await leadsService.createLead(
    request.server,
    request.body,
    {
      idempotencyKey,
      actorId: request.user.sub,
      correlationId: request.id,
    }
  );

  void reply.code(201).send(result);
}

export async function getLeadByIdHandler(
  request: GetLeadByIdRequestFastify,
  reply: FastifyReply
): Promise<void> {
  const result: LeadDetailsResponse = await leadsService.getLeadById(
    request.server,
    request.params.leadId,
    {
      actorId: request.user.sub,
      correlationId: request.id,
    }
  );

  void reply.code(200).send(result);
}