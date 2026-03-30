import type { PoolConnection } from 'mariadb';
import type { CustomerSearchQuery, CustomerSearchResultItem } from './customers.types';

function hasValue(value?: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export const customersRepository = {
  async searchCustomers(
    conn: PoolConnection,
    filters: CustomerSearchQuery
  ): Promise<CustomerSearchResultItem[]> {
    const clausesLeads: string[] = [];
    const valuesLeads: unknown[] = [];

    const clausesPreRegistrations: string[] = [];
    const valuesPreRegistrations: unknown[] = [];

    if (hasValue(filters.documentType) && hasValue(filters.documentNumber)) {
      clausesLeads.push(`document_type = ? AND document_number = ?`);
      valuesLeads.push(filters.documentType, filters.documentNumber);

      clausesPreRegistrations.push(`document_type = ? AND document_number = ?`);
      valuesPreRegistrations.push(filters.documentType, filters.documentNumber);
    }

    if (hasValue(filters.phone)) {
      clausesLeads.push(`phone = ?`);
      valuesLeads.push(filters.phone);

      clausesPreRegistrations.push(`phone = ?`);
      valuesPreRegistrations.push(filters.phone);
    }

    if (hasValue(filters.email)) {
      clausesLeads.push(`email = ?`);
      valuesLeads.push(filters.email);

      clausesPreRegistrations.push(`email = ?`);
      valuesPreRegistrations.push(filters.email);
    }

    if (hasValue(filters.taxId)) {
      clausesPreRegistrations.push(`tax_id = ?`);
      valuesPreRegistrations.push(filters.taxId);
    }

    const leadWhere =
      clausesLeads.length > 0 ? `WHERE ${clausesLeads.join(' OR ')}` : `WHERE 1 = 0`;

    const preRegistrationWhere =
      clausesPreRegistrations.length > 0
        ? `WHERE ${clausesPreRegistrations.join(' OR ')}`
        : `WHERE 1 = 0`;

    const query = `
      SELECT
        'lead' AS sourceType,
        lead_id AS sourceId,
        full_name AS fullName,
        document_type AS documentType,
        document_number AS documentNumber,
        phone,
        email,
        business_name AS businessName,
        NULL AS taxId,
        status,
        external_reference AS externalReference,
        created_at AS createdAt
      FROM ai_leads
      ${leadWhere}

      UNION ALL

      SELECT
        'pre_registration' AS sourceType,
        pre_registration_id AS sourceId,
        full_name AS fullName,
        document_type AS documentType,
        document_number AS documentNumber,
        phone,
        email,
        business_name AS businessName,
        tax_id AS taxId,
        status,
        external_reference AS externalReference,
        created_at AS createdAt
      FROM ai_pre_registrations
      ${preRegistrationWhere}

      ORDER BY createdAt DESC
      LIMIT 50
    `;

    return conn.query(query, [...valuesLeads, ...valuesPreRegistrations]);
  },

  async insertAuditLog(
    conn: PoolConnection,
    params: {
      eventType: string;
      resourceType: string;
      resourceId: string;
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
        null,
        params.actorType,
        params.actorId,
        params.correlationId ?? null,
        params.createdAt,
      ]
    );
  },
};