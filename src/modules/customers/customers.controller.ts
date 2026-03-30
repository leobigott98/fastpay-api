import type { FastifyReply, FastifyRequest } from 'fastify';
import { customersService } from './customers.service';
import type { CustomerSearchResponse } from './customers.types';

type SearchCustomersRequestFastify = FastifyRequest<{
  Querystring: {
    documentType?: string;
    documentNumber?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  };
}>;

export async function searchCustomersHandler(
  request: SearchCustomersRequestFastify,
  reply: FastifyReply
): Promise<void> {
  const result: CustomerSearchResponse = await customersService.searchCustomers(
    request.server,
    request.query,
    {
      actorId: request.user.sub,
      correlationId: request.id,
    }
  );

  void reply.code(200).send(result);
}