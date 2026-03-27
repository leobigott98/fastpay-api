import { randomUUID } from 'crypto';
import type { FastifyInstance } from 'fastify';
import type {
  CreateLeadRequest,
  CreateLeadResponse,
  LeadDetailsResponse,
} from './leads.types';
import { leadsRepository } from './leads.repository';
import { AppError } from '../../shared/errors/app-error';
import { ErrorCodes } from '../../shared/errors/error-codes';

function toSqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export const leadsService = {
  async createLead(
    app: FastifyInstance,
    payload: CreateLeadRequest,
    context: {
      idempotencyKey: string;
      actorId: string;
      correlationId: string;
    }
  ): Promise<CreateLeadResponse> {
    const conn = await app.db.getConnection();

    try {
      await conn.beginTransaction();

      const existingLead = await leadsRepository.findByExternalReference(
        conn,
        payload.externalReference
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
        source: payload.source,
        channel: payload.channel,
        fullName: payload.fullName,
        documentType: payload.documentType,
        documentNumber: payload.documentNumber,
        phone: payload.phone,
        email: payload.email,
        businessName: payload.businessName,
        notes: payload.notes,
        consentAccepted: payload.consentAccepted ?? false,
        externalReference: payload.externalReference,
        status: 'LEAD_CREATED',
        createdAt: now,
        updatedAt: now,
      });

      await leadsRepository.insertLeadServices(
        conn,
        leadId,
        payload.interestedServices,
        now
      );

      await leadsRepository.insertAuditLog(conn, {
        eventType: 'LEAD_CREATED',
        resourceType: 'lead',
        resourceId: leadId,
        externalReference: payload.externalReference,
        actorType: 'system_client',
        actorId: context.actorId,
        correlationId: context.correlationId,
        createdAt: now,
      });

      await conn.commit();

      return {
        leadId,
        status: 'LEAD_CREATED',
        createdAt: now,
      };
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
    }
  ): Promise<LeadDetailsResponse> {
    const conn = await app.db.getConnection();

    try {
      const lead = await leadsRepository.findByLeadId(conn, leadId);

      if (!lead) {
        throw new AppError({
          statusCode: 404,
          code: ErrorCodes.NOT_FOUND,
          message: 'Lead not found',
        });
      }

      const services = await leadsRepository.getServicesByLeadId(conn, leadId);

      await leadsRepository.insertAuditLog(conn, {
        eventType: 'LEAD_READ',
        resourceType: 'lead',
        resourceId: leadId,
        externalReference: lead.external_reference,
        actorType: 'system_client',
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