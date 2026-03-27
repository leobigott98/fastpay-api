import type { ErrorCode } from './error-codes';

type ErrorDetail = Record<string, unknown>;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetail[];

  constructor(params: {
    statusCode: number;
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
  }) {
    super(params.message);
    this.name = 'AppError';
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
  }
}