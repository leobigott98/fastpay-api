import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { formatErrorResponse } from "../shared/errors/format-error";
import { ErrorCodes } from "../shared/errors/error-codes";

export default fp(async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler(
    (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      const formatted = formatErrorResponse(error, request);
      request.log.error(
        {
          eventType: "REQUEST_FAILED",
          correlationId: request.id,
          method: request.method,
          url: request.url,
          statusCode: formatted.statusCode,
          errorCode: formatted.body.error.code,
          err: error,
        },
        "Unhandled request error",
      );

      // Errores de validación de Fastify/AJV
      if ((error as any).validation) {
        return reply.code(400).send({
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Request validation failed",
            details: (error as any).validation.map((item: any) => ({
              field:
                item.instancePath || item.params?.missingProperty || "unknown",
              issue: item.message,
            })),
            correlationId: request.id,
          },
        });
      }

      return reply.code(formatted.statusCode).send(formatted.body);
    },
  );
});
