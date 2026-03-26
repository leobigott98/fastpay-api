import { buildApp } from './app';
import { env } from './config/env';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    app.log.info(`Server listening on http://localhost:${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();