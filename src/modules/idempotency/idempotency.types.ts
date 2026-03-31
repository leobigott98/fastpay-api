export type StoredIdempotencyRecord = {
  id: number;
  idempotency_key: string;
  endpoint: string;
  request_hash: string;
  response_body_json: string;
  status_code: number;
  created_at: string;
};