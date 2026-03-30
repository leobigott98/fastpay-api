import type { FastifyInstance } from 'fastify';
import { AppError } from '../../shared/errors/app-error';
import { ErrorCodes } from '../../shared/errors/error-codes';
import { customersRepository } from './customers.repository';
import type {
  CustomerSearchQuery,
  CustomerSearchResponse,
} from './customers.types';

function toSqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export const customersService = {
  async searchCustomers(
    app: FastifyInstance,
    filters: CustomerSearchQuery,
    context: {
      actorId: string;
      correlationId: string;
    }
  ): Promise<CustomerSearchResponse> {
    const normalizedFilters: CustomerSearchQuery = {
      documentType: filters.documentType?.trim(),
      documentNumber: filters.documentNumber?.trim(),
      phone: filters.phone?.trim(),
      email: filters.email?.trim().toLowerCase(),
      taxId: filters.taxId?.trim(),
    };

    const hasAtLeastOneFilter = Boolean(
      (normalizedFilters.documentType && normalizedFilters.documentNumber) ||
        normalizedFilters.phone ||
        normalizedFilters.email ||
        normalizedFilters.taxId
    );

    if (!hasAtLeastOneFilter) {
      throw new AppError({
        statusCode: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        message:
          'At least one valid filter is required: documentType + documentNumber, phone, email or taxId',
      });
    }

    const conn = await app.db.getConnection();

    try {
      const results = await customersRepository.searchCustomers(
        conn,
        normalizedFilters
      );

      await customersRepository.insertAuditLog(conn, {
        eventType: 'CUSTOMER_SEARCH',
        resourceType: 'customer_search',
        resourceId: 'search',
        actorType: 'system_client',
        actorId: context.actorId,
        correlationId: context.correlationId,
        createdAt: toSqlDateTime(new Date()),
      });

      return {
        filters: normalizedFilters,
        total: results.length,
        results,
      };
    } finally {
      conn.release();
    }
  },
};