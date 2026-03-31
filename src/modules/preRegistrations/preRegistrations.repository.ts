import type { PoolConnection } from "mariadb";
import type {
  PreRegistrationAttachmentRecord,
  PreRegistrationRecord,
} from "./preRegistrations.types";

export const preRegistrationsRepository = {
  async findByExternalReference(
    conn: PoolConnection,
    externalReference: string,
  ): Promise<PreRegistrationRecord | null> {
    const rows = await conn.query(
      `
      SELECT *
      FROM ai_pre_registrations
      WHERE external_reference = ?
      LIMIT 1
      `,
      [externalReference],
    );

    return rows[0] ?? null;
  },

  async findByPreRegistrationId(
    conn: PoolConnection,
    preRegistrationId: string,
  ): Promise<PreRegistrationRecord | null> {
    const rows = await conn.query(
      `
      SELECT *
      FROM ai_pre_registrations
      WHERE pre_registration_id = ?
      LIMIT 1
      `,
      [preRegistrationId],
    );

    return rows[0] ?? null;
  },

  async insertPreRegistration(
    conn: PoolConnection,
    preRegistration: {
      preRegistrationId: string;
      leadId?: string;
      applicantType: string;
      fullName: string;
      documentType: string;
      documentNumber: string;
      phone: string;
      email?: string;
      businessName?: string;
      taxId?: string;
      state?: string;
      city?: string;
      addressLine1?: string;
      status: string;
      externalReference: string;
      createdAt: string;
      updatedAt: string;
    },
  ): Promise<void> {
    await conn.query(
      `
      INSERT INTO ai_pre_registrations (
        pre_registration_id,
        lead_id,
        applicant_type,
        full_name,
        document_type,
        document_number,
        phone,
        email,
        business_name,
        tax_id,
        state,
        city,
        address_line1,
        status,
        external_reference,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        preRegistration.preRegistrationId,
        preRegistration.leadId ?? null,
        preRegistration.applicantType,
        preRegistration.fullName,
        preRegistration.documentType,
        preRegistration.documentNumber,
        preRegistration.phone,
        preRegistration.email ?? null,
        preRegistration.businessName ?? null,
        preRegistration.taxId ?? null,
        preRegistration.state ?? null,
        preRegistration.city ?? null,
        preRegistration.addressLine1 ?? null,
        preRegistration.status,
        preRegistration.externalReference,
        preRegistration.createdAt,
        preRegistration.updatedAt,
      ],
    );
  },

  async insertAttachments(
    conn: PoolConnection,
    preRegistrationId: string,
    attachments: Array<{
      type: string;
      fileName: string;
      storageKey: string;
    }>,
    createdAt: string,
  ): Promise<void> {
    for (const attachment of attachments) {
      await conn.query(
        `
        INSERT INTO ai_pre_registration_attachments (
          pre_registration_id,
          attachment_type,
          file_name,
          storage_key,
          created_at
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [
          preRegistrationId,
          attachment.type,
          attachment.fileName,
          attachment.storageKey,
          createdAt,
        ],
      );
    }
  },

  async getAttachmentsByPreRegistrationId(
    conn: PoolConnection,
    preRegistrationId: string,
  ): Promise<PreRegistrationAttachmentRecord[]> {
    const rows = await conn.query(
      `
      SELECT
        attachment_type,
        file_name,
        storage_key
      FROM ai_pre_registration_attachments
      WHERE pre_registration_id = ?
      ORDER BY id ASC
      `,
      [preRegistrationId],
    );

    return rows;
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
    },
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
      ],
    );
  },

  async insertRequestedServices(
    conn: PoolConnection,
    preRegistrationId: string,
    services: string[],
    createdAt: string,
  ): Promise<void> {
    for (const service of services) {
      await conn.query(
        `
      INSERT INTO ai_pre_registration_services (
        pre_registration_id,
        service_code,
        created_at
      ) VALUES (?, ?, ?)
      `,
        [preRegistrationId, service, createdAt],
      );
    }
  },

  async getRequestedServicesByPreRegistrationId(
    conn: PoolConnection,
    preRegistrationId: string,
  ): Promise<string[]> {
    const rows = await conn.query(
      `
    SELECT service_code
    FROM ai_pre_registration_services
    WHERE pre_registration_id = ?
    ORDER BY id ASC
    `,
      [preRegistrationId],
    );

    return rows.map((row: { service_code: string }) => row.service_code);
  },
};
