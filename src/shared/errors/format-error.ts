import type { FastifyRequest } from 'fastify';
import { AppError } from './app-error';
import { ErrorCodes } from './error-codes';

export function formatErrorResponse(error: unknown, request: FastifyRequest) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          correlationId: request.id,
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Internal server error',
        correlationId: request.id,
      },
    },
  };
}