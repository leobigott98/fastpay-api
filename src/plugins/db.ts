import fp from 'fastify-plugin';
import * as mariadb from 'mariadb';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';

declare module 'fastify' {
  interface FastifyInstance {
    db: mariadb.Pool;
  }
}

export default fp(async function dbPlugin(app: FastifyInstance) {
  const pool = mariadb.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectionLimit: 10,
  });

  app.decorate('db', pool);

  app.addHook('onClose', async () => {
    await pool.end();
  });
});