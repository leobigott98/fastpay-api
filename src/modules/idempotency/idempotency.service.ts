import { createHash } from 'crypto';
import type { PoolConnection } from 'mariadb';
import { AppError } from '../../shared/errors/app-error';
import { ErrorCodes } from '../../shared/errors/error-codes';
import { idempotencyRepository } from './idempotency.repository';

function stableStringify(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort());
}

export const idempotencyService = {
  buildRequestHash(payload: unknown): string {
    return createHash('sha256').update(stableStringify(payload)).digest('hex');
  },

  async assertOrReplay(
    conn: PoolConnection,
    params: {
      idempotencyKey: string;
      endpoint: string;
      payload: unknown;
    }
  ): Promise<
    | { type: 'continue'; requestHash: string }
    | { type: 'replay'; statusCode: number; responseBody: unknown }
  > {
    const requestHash = this.buildRequestHash(params.payload);

    const existing = await idempotencyRepository.findByKeyAndEndpoint(
      conn,
      params.idempotencyKey,
      params.endpoint
    );

    if (!existing) {
      return { type: 'continue', requestHash };
    }

    if (existing.request_hash !== requestHash) {
      throw new AppError({
        statusCode: 409,
        code: ErrorCodes.IDEMPOTENCY_CONFLICT,
        message: 'The same Idempotency-Key was already used with a different request body',
      });
    }

    return {
      type: 'replay',
      statusCode: existing.status_code,
      responseBody: JSON.parse(existing.response_body_json),
    };
  },

  async persistResult(
    conn: PoolConnection,
    params: {
      idempotencyKey: string;
      endpoint: string;
      requestHash: string;
      responseBody: unknown;
      statusCode: number;
      createdAt: string;
    }
  ): Promise<void> {
    await idempotencyRepository.insertRecord(conn, {
      idempotencyKey: params.idempotencyKey,
      endpoint: params.endpoint,
      requestHash: params.requestHash,
      responseBodyJson: JSON.stringify(params.responseBody),
      statusCode: params.statusCode,
      createdAt: params.createdAt,
    });
  },
};