import type { FastifyInstance } from 'fastify';
import { searchCustomersHandler } from './customers.controller';
import { CustomerSearchQuery } from './customers.types';

export default async function customersRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: CustomerSearchQuery;
  }>(
    '/v1/customers/search',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Search customers by document, phone, email or taxId',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            documentType: { type: 'string', minLength: 1, maxLength: 5 },
            documentNumber: { type: 'string', minLength: 1, maxLength: 30 },
            phone: { type: 'string', minLength: 1, maxLength: 30 },
            email: { type: 'string', format: 'email', maxLength: 150 },
            taxId: { type: 'string', minLength: 1, maxLength: 30 },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['filters', 'total', 'results'],
            properties: {
              filters: {
                type: 'object',
                properties: {
                  documentType: { type: ['string', 'null'] },
                  documentNumber: { type: ['string', 'null'] },
                  phone: { type: ['string', 'null'] },
                  email: { type: ['string', 'null'] },
                  taxId: { type: ['string', 'null'] },
                },
              },
              total: { type: 'number' },
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  required: [
                    'sourceType',
                    'sourceId',
                    'fullName',
                    'documentType',
                    'documentNumber',
                    'phone',
                    'email',
                    'businessName',
                    'taxId',
                    'status',
                    'externalReference',
                    'createdAt',
                  ],
                  properties: {
                    sourceType: { type: 'string' },
                    sourceId: { type: 'string' },
                    fullName: { type: 'string' },
                    documentType: { type: ['string', 'null'] },
                    documentNumber: { type: ['string', 'null'] },
                    phone: { type: ['string', 'null'] },
                    email: { type: ['string', 'null'] },
                    businessName: { type: ['string', 'null'] },
                    taxId: { type: ['string', 'null'] },
                    status: { type: 'string' },
                    externalReference: { type: ['string', 'null'] },
                    createdAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      preHandler: [app.authenticate, app.authorize(['customers:read'])],
    },
    searchCustomersHandler
  );
}