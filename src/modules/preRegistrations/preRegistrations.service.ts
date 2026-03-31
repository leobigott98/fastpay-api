import { randomUUID } from "crypto";
import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error";
import { ErrorCodes } from "../../shared/errors/error-codes";
import { preRegistrationsRepository } from "./preRegistrations.repository";
import type {
  CreatePreRegistrationRequest,
  CreatePreRegistrationResponse,
  PreRegistrationDetailsResponse,
} from "./preRegistrations.types";
import { idempotencyService } from "../idempotency/idempotency.service";

function toSqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export const preRegistrationsService = {
  async createPreRegistration(
    app: FastifyInstance,
    payload: CreatePreRegistrationRequest,
    context: {
      idempotencyKey: string;
      actorId: string;
      correlationId: string;
    },
  ): Promise<CreatePreRegistrationResponse> {
    const conn = await app.db.getConnection();

    const normalizedPayload = {
      ...payload,
      leadId: payload.leadId?.trim(),
      applicantType: payload.applicantType,
      fullName: payload.fullName.trim(),
      documentType: payload.documentType.trim(),
      documentNumber: payload.documentNumber.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim().toLowerCase(),
      businessName: payload.businessName?.trim(),
      taxId: payload.taxId?.trim(),
      externalReference: payload.externalReference.trim(),
      address: {
        state: payload.address?.state?.trim(),
        city: payload.address?.city?.trim(),
        line1: payload.address?.line1?.trim(),
      },
      requestedServices: [
        ...new Set(
          (payload.requestedServices ?? []).map((service) => service.trim()),
        ),
      ],
      attachments: (payload.attachments ?? []).map((attachment) => ({
        type: attachment.type.trim(),
        fileName: attachment.fileName.trim(),
        storageKey: attachment.storageKey.trim(),
      })),
    };

    try {
      await conn.beginTransaction();

      const idempotencyCheck = await idempotencyService.assertOrReplay(conn, {
        idempotencyKey: context.idempotencyKey,
        endpoint: "/v1/pre-registrations",
        payload: normalizedPayload,
      });

      if (idempotencyCheck.type === "replay") {
        await conn.rollback();
        return idempotencyCheck.responseBody as CreatePreRegistrationResponse;
      }

      const existingPreRegistration =
        await preRegistrationsRepository.findByExternalReference(
          conn,
          normalizedPayload.externalReference,
        );

      if (existingPreRegistration) {
        await conn.rollback();

        return {
          preRegistrationId: existingPreRegistration.pre_registration_id,
          status: existingPreRegistration.status,
          createdAt: existingPreRegistration.created_at,
        };
      }

      const now = toSqlDateTime(new Date());
      const preRegistrationId = `pr_${randomUUID()}`;

      await preRegistrationsRepository.insertPreRegistration(conn, {
        preRegistrationId,
        leadId: normalizedPayload.leadId,
        applicantType: normalizedPayload.applicantType,
        fullName: normalizedPayload.fullName,
        documentType: normalizedPayload.documentType,
        documentNumber: normalizedPayload.documentNumber,
        phone: normalizedPayload.phone,
        email: normalizedPayload.email,
        businessName: normalizedPayload.businessName,
        taxId: normalizedPayload.taxId,
        state: normalizedPayload.address.state,
        city: normalizedPayload.address.city,
        addressLine1: normalizedPayload.address.line1,
        status: "PRE_REGISTRATION_PENDING",
        externalReference: normalizedPayload.externalReference,
        createdAt: now,
        updatedAt: now,
      });

      await preRegistrationsRepository.insertAttachments(
        conn,
        preRegistrationId,
        normalizedPayload.attachments,
        now,
      );

      await preRegistrationsRepository.insertAuditLog(conn, {
        eventType: "PRE_REGISTRATION_CREATED",
        resourceType: "pre_registration",
        resourceId: preRegistrationId,
        externalReference: normalizedPayload.externalReference,
        actorType: "system_client",
        actorId: context.actorId,
        correlationId: context.correlationId,
        createdAt: now,
      });

      const response: CreatePreRegistrationResponse = {
        preRegistrationId,
        status: "PRE_REGISTRATION_PENDING",
        createdAt: now,
      };

      await idempotencyService.persistResult(conn, {
        idempotencyKey: context.idempotencyKey,
        endpoint: "/v1/pre-registrations",
        requestHash: idempotencyCheck.requestHash,
        responseBody: response,
        statusCode: 201,
        createdAt: now,
      });

      await conn.commit();

      return response;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async getPreRegistrationById(
    app: FastifyInstance,
    preRegistrationId: string,
    context: {
      actorId: string;
      correlationId: string;
    },
  ): Promise<PreRegistrationDetailsResponse> {
    const conn = await app.db.getConnection();

    try {
      const preRegistration =
        await preRegistrationsRepository.findByPreRegistrationId(
          conn,
          preRegistrationId,
        );

      if (!preRegistration) {
        throw new AppError({
          statusCode: 404,
          code: ErrorCodes.NOT_FOUND,
          message: "Pre-registration not found",
        });
      }

      const attachments =
        await preRegistrationsRepository.getAttachmentsByPreRegistrationId(
          conn,
          preRegistrationId,
        );

      await preRegistrationsRepository.insertAuditLog(conn, {
        eventType: "PRE_REGISTRATION_READ",
        resourceType: "pre_registration",
        resourceId: preRegistrationId,
        externalReference: preRegistration.external_reference,
        actorType: "system_client",
        actorId: context.actorId,
        correlationId: context.correlationId,
        createdAt: toSqlDateTime(new Date()),
      });

      return {
        preRegistrationId: preRegistration.pre_registration_id,
        leadId: preRegistration.lead_id,
        applicantType: preRegistration.applicant_type,
        fullName: preRegistration.full_name,
        documentType: preRegistration.document_type,
        documentNumber: preRegistration.document_number,
        phone: preRegistration.phone,
        email: preRegistration.email,
        businessName: preRegistration.business_name,
        taxId: preRegistration.tax_id,
        address: {
          state: preRegistration.state,
          city: preRegistration.city,
          line1: preRegistration.address_line1,
        },
        requestedServices: [],
        attachments: attachments.map((attachment) => ({
          type: attachment.attachment_type,
          fileName: attachment.file_name,
          storageKey: attachment.storage_key,
        })),
        externalReference: preRegistration.external_reference,
        status: preRegistration.status,
        createdAt: preRegistration.created_at,
        updatedAt: preRegistration.updated_at,
      };
    } finally {
      conn.release();
    }
  },
};
