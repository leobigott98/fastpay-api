import { APP_NAME, APP_VERSION } from '../config/constants';

export const openApiConfig = {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: APP_NAME,
      version: APP_VERSION,
      description: 'API for Aliee integration with FastPay ERP',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer' as const,
          bearerFormat: 'JWT' as const,
        },
      },
    },
  },
};