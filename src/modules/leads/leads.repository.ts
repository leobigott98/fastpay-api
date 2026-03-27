import type { PoolConnection } from 'mariadb';
import type { LeadRecord } from './leads.types';

type LeadServiceRow = {
  service_code: string;
};

export const leadsRepository = {
  async findByExternalReference(
    conn: PoolConnection,
    externalReference: string
  ): Promise<LeadRecord | null> {
    const rows = await conn.query(
      `
      SELECT *
      FROM ai_leads
      WHERE external_reference = ?
      LIMIT 1
      `,
      [externalReference]
    );

    return rows[0] ?? null;
  },

  async findByLeadId(
    conn: PoolConnection,
    leadId: string
  ): Promise<LeadRecord | null> {
    const rows = await conn.query(
      `
      SELECT *
      FROM ai_leads
      WHERE lead_id = ?
      LIMIT 1
      `,
      [leadId]
    );

    return rows[0] ?? null;
  },

  async getServicesByLeadId(
    conn: PoolConnection,
    leadId: string
  ): Promise<string[]> {
    const rows: LeadServiceRow[] = await conn.query(
      `
      SELECT service_code
      FROM ai_lead_services
      WHERE lead_id = ?
      ORDER BY id ASC
      `,
      [leadId]
    );

    return rows.map((row) => row.service_code);
  },

  async insertLead(
    conn: PoolConnection,
    lead: {
      leadId: string;
      source: string;
      channel: string;
      fullName: string;
      documentType?: string;
      documentNumber?: string;
      phone: string;
      email?: string;
      businessName?: string;
      notes?: string;
      consentAccepted: boolean;
      externalReference: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    }
  ): Promise<void> {
    await conn.query(
      `
      INSERT INTO ai_leads (
        lead_id,
        source,
        channel,
        full_name,
        document_type,
        document_number,
        phone,
        email,
        business_name,
        notes,
        consent_accepted,
        external_reference,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        lead.leadId,
        lead.source,
        lead.channel,
        lead.fullName,
        lead.documentType ?? null,
        lead.documentNumber ?? null,
        lead.phone,
        lead.email ?? null,
        lead.businessName ?? null,
        lead.notes ?? null,
        lead.consentAccepted ? 1 : 0,
        lead.externalReference,
        lead.status,
        lead.createdAt,
        lead.updatedAt,
      ]
    );
  },

  async insertLeadServices(
    conn: PoolConnection,
    leadId: string,
    services: string[],
    createdAt: string
  ): Promise<void> {
    for (const service of services) {
      await conn.query(
        `
        INSERT INTO ai_lead_services (
          lead_id,
          service_code,
          created_at
        ) VALUES (?, ?, ?)
        `,
        [leadId, service, createdAt]
      );
    }
  },

  async insertAuditLog(
    conn: PoolConnection,
    params: {
      eventType: string;
      resourceType: string;
      resourceId: string;
      externalReference?: string;
      actorType: string;
      actorId: string;
      correlationId?: string;
      createdAt: string;
    }
  ): Promise<void> {
    await conn.query(
      `
      INSERT INTO ai_audit_logs (
        event_type,
        resource_type,
        resource_id,
        external_reference,
        actor_type,
        actor_id,
        correlation_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        params.eventType,
        params.resourceType,
        params.resourceId,
        params.externalReference ?? null,
        params.actorType,
        params.actorId,
        params.correlationId ?? null,
        params.createdAt,
      ]
    );
  },
};