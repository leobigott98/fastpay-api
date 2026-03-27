import 'dotenv/config';

function required(name: string, value?: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT || 3000),

  DB_HOST: required('DB_HOST', process.env.DB_HOST),
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: required('DB_USER', process.env.DB_USER),
  DB_PASSWORD: required('DB_PASSWORD', process.env.DB_PASSWORD),
  DB_NAME: required('DB_NAME', process.env.DB_NAME),

  JWT_PUBLIC_KEY_PATH: required('JWT_PUBLIC_KEY_PATH', process.env.JWT_PUBLIC_KEY_PATH),
  JWT_EXPECTED_ISSUER: required('JWT_EXPECTED_ISSUER', process.env.JWT_EXPECTED_ISSUER),
  JWT_EXPECTED_AUDIENCE: required('JWT_EXPECTED_AUDIENCE', process.env.JWT_EXPECTED_AUDIENCE),

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;