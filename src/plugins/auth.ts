import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env";
import path from "path";
import { readFileSync } from "fs";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      iss?: string;
      aud?: string | string[];
      scope?: string;
      exp?: number;
      iat?: number;
    };
    user: {
      sub: string;
      iss?: string;
      aud?: string | string[];
      scope?: string;
      exp?: number;
      iat?: number;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    authorize: (
      requiredScopes: string[],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

function hasExpectedAudience(
  aud: string | string[] | undefined,
  expectedAudience: string,
): boolean {
  if (!aud) return false;
  if (Array.isArray(aud)) return aud.includes(expectedAudience);
  return aud === expectedAudience;
}

export default fp(async function authPlugin(app: FastifyInstance) {
  const publicKeyPath = path.join(__dirname, env.JWT_PUBLIC_KEY_PATH);
  const publicKey = readFileSync(publicKeyPath, "utf8");

  await app.register(jwt, {
    secret: {
      public: publicKey,
    },
    verify: {
      algorithms: ["RS256"],
    },
  });

  app.decorate(
    "authenticate",
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();

        if (request.user.iss !== env.JWT_EXPECTED_ISSUER) {
          return reply.code(403).send({
            error: {
              code: "FORBIDDEN",
              message: "Invalid token issuer",
            },
          });
        }

        if (!hasExpectedAudience(request.user.aud, env.JWT_EXPECTED_AUDIENCE)) {
          return reply.code(403).send({
            error: {
              code: "FORBIDDEN",
              message: "Invalid token audience",
            },
          });
        }
      } catch (error) {
        request.log.warn({ err: error }, "JWT validation failed");

        return reply.code(401).send({
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired token",
          },
        });
      }
    },
  );

  app.decorate("authorize", function authorize(requiredScopes: string[]) {
    return async function scopeGuard(
      request: FastifyRequest,
      reply: FastifyReply,
    ) {
      const rawScope = request.user.scope ?? "";
      const scopes = rawScope.split(" ").filter(Boolean);

      const hasAllRequiredScopes = requiredScopes.every((scope) =>
        scopes.includes(scope),
      );

      if (!hasAllRequiredScopes) {
        return reply.code(403).send({
          error: {
            code: "FORBIDDEN",
            message: "Insufficient scope",
            details: requiredScopes.map((scope) => ({
              requiredScope: scope,
            })),
          },
        });
      }
    };
  });
});
