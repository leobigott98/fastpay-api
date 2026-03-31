import { randomUUID } from "crypto";
import type { FastifyInstance } from "fastify";
import type {
  CreateLeadRequest,
  CreateLeadResponse,
  LeadDetailsResponse,
} from "./leads.types";
import { leadsRepository } from "./leads.repository";
import { AppError } from "../../shared/errors/app-error";
import { ErrorCodes } from "../../shared/errors/error-codes";
import { idempotencyService } from "../idempotency/idempotency.service";

function toSqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export const leadsService = {
  async createLead(
    app: FastifyInstance,
    payload: CreateLeadRequest,
    context: {
      idempotencyKey: string;
      actorId: string;
      correlationId: string;
    },
  ): Promise<CreateLeadResponse> {
    const conn = await app.db.getConnection();

    const normalizedPayload = {
      ...payload,
      source: payload.source.trim(),
      channel: payload.channel,
      fullName: payload.fullName.trim(),
      documentType: payload.documentType?.trim(),
      documentNumber: payload.documentNumber?.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim().toLowerCase(),
      businessName: payload.businessName?.trim(),
      notes: payload.notes?.trim(),
      externalReference: payload.externalReference.trim(),
      interestedServices: [
        ...new Set(payload.interestedServices.map((service) => service.trim())),
      ],
    };

    try {
      await conn.beginTransaction();

      const idempotencyCheck = await idempotencyService.assertOrReplay(conn, {
        idempotencyKey: context.idempotencyKey,
        endpoint: "/v1/leads",
        payload: normalizedPayload,
      });

      if (idempotencyCheck.type === "replay") {
        await conn.rollback();
        return idempotencyCheck.responseBody as CreateLeadResponse;
      }

      const existingLead = await leadsRepository.findByExternalReference(
        conn,
        normalizedPayload.externalReference,
      );

      // Control inicial de duplicados por externalReference.
      if (existingLead) {
        await conn.rollback();

        return {
          leadId: existingLead.lead_id,
          status: existingLead.status,
          createdAt: existingLead.created_at,
        };
      }

      const now = toSqlDateTime(new Date());
      const leadId = `ld_${randomUUID()}`;

      await leadsRepository.insertLead(conn, {
        leadId,
        source: normalizedPayload.source,
        channel: normalizedPayload.channel,
        fullName: normalizedPayload.fullName,
        documentType: normalizedPayload.documentType,
        documentNumber: normalizedPayload.documentNumber,
        phone: normalizedPayload.phone,
        email: normalizedPayload.email,
        businessName: normalizedPayload.businessName,
        notes: normalizedPayload.notes,
        consentAccepted: normalizedPayload.consentAccepted ?? false,
        externalReference: normalizedPayload.externalReference,
        status: "LEAD_CREATED",
        createdAt: now,
        updatedAt: now,
      });

      await leadsRepository.insertLeadServices(
        conn,
        leadId,
        normalizedPayload.interestedServices,
        now,
      );

      await leadsRepository.insertAuditLog(conn, {
        eventType: "LEAD_CREATED",
        resourceType: "lead",
        resourceId: leadId,
        externalReference: normalizedPayload.externalReference,
        actorType: "system_client",
        actorId: context.actorId,
        correlationId: context.correlationId,
        createdAt: now,
      });

      const response: CreateLeadResponse = {
        leadId,
        status: "LEAD_CREATED",
        createdAt: now,
      }

      await idempotencyService.persistResult(conn, {
        idempotencyKey: context.idempotencyKey,
        endpoint: "/v1/leads",
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

  async getLeadById(
    app: FastifyInstance,
    leadId: string,
    context: {
      actorId: string;
      correlationId: string;
    },
  ): Promise<LeadDetailsResponse> {
    const conn = await app.db.getConnection();

    try {
      const lead = await leadsRepository.findByLeadId(conn, leadId);

      if (!lead) {
        throw new AppError({
          statusCode: 404,
          code: ErrorCodes.NOT_FOUND,
          message: "Lead not found",
        });
      }

      const services = await leadsRepository.getServicesByLeadId(conn, leadId);

      await leadsRepository.insertAuditLog(conn, {
        eventType: "LEAD_READ",
        resourceType: "lead",
        resourceId: leadId,
        externalReference: lead.external_reference,
        actorType: "system_client",
        actorId: context.actorId,
        correlationId: context.correlationId,
        createdAt: toSqlDateTime(new Date()),
      });

      return {
        leadId: lead.lead_id,
        source: lead.source,
        channel: lead.channel,
        fullName: lead.full_name,
        documentType: lead.document_type,
        documentNumber: lead.document_number,
        phone: lead.phone,
        email: lead.email,
        businessName: lead.business_name,
        interestedServices: services,
        notes: lead.notes,
        consentAccepted: lead.consent_accepted === 1,
        externalReference: lead.external_reference,
        status: lead.status,
        createdAt: lead.created_at,
        updatedAt: lead.updated_at,
      };
    } finally {
      conn.release();
    }
  },
};
