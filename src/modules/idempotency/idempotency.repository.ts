import type { PoolConnection } from 'mariadb';
import type { StoredIdempotencyRecord } from './idempotency.types';

export const idempotencyRepository = {
  async findByKeyAndEndpoint(
    conn: PoolConnection,
    idempotencyKey: string,
    endpoint: string
  ): Promise<StoredIdempotencyRecord | null> {
    const rows = await conn.query(
      `
      SELECT *
      FROM ai_idempotency_keys
      WHERE idempotency_key = ? AND endpoint = ?
      LIMIT 1
      `,
      [idempotencyKey, endpoint]
    );

    return rows[0] ?? null;
  },

  async insertRecord(
    conn: PoolConnection,
    params: {
      idempotencyKey: string;
      endpoint: string;
      requestHash: string;
      responseBodyJson: string;
      statusCode: number;
      createdAt: string;
    }
  ): Promise<void> {
    await conn.query(
      `
      INSERT INTO ai_idempotency_keys (
        idempotency_key,
        endpoint,
        request_hash,
        response_body_json,
        status_code,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        params.idempotencyKey,
        params.endpoint,
        params.requestHash,
        params.responseBodyJson,
        params.statusCode,
        params.createdAt,
      ]
    );
  },
};