export const createLeadSchema = {
  tags: ['Leads'],
  summary: 'Create lead',
  security: [{ bearerAuth: [] }],
  headers: {
    type: 'object',
    required: ['authorization', 'idempotency-key'],
    properties: {
      authorization: { type: 'string', minLength: 1 },
      'idempotency-key': { type: 'string', minLength: 1, maxLength: 100 }
    }
  },
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['source', 'channel', 'fullName', 'phone', 'interestedServices', 'externalReference'],
    properties: {
      source: { type: 'string', minLength: 1, maxLength: 50 },
      channel: { type: 'string', enum: ['voice', 'whatsapp', 'web'] },
      fullName: { type: 'string', minLength: 3, maxLength: 150 },
      documentType: { type: 'string', enum: ['V', 'E', 'J', 'P', 'G'] },
      documentNumber: { type: 'string', minLength: 3, maxLength: 30 },
      phone: { type: 'string', minLength: 8, maxLength: 30 },
      email: { type: 'string', format: 'email', maxLength: 150 },
      businessName: { type: 'string', maxLength: 150 },
      interestedServices: {
        type: 'array',
        minItems: 1,
        maxItems: 20,
        items: { type: 'string', minLength: 1, maxLength: 50 }
      },
      notes: { type: 'string', maxLength: 2000 },
      consentAccepted: { type: 'boolean' },
      externalReference: { type: 'string', minLength: 1, maxLength: 100 }
    }
  },
  response: {
    201: {
      type: 'object',
      required: ['leadId', 'status', 'createdAt'],
      properties: {
        leadId: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' }
      },
      examples: [
      {
        leadId: 'ld_8fa0d63e-1f4f-40ba-b67c-4acdb1d3d3ce',
        status: 'LEAD_CREATED',
        createdAt: '2026-03-18 15:04:22'
      }
    ]
    }
  }
} as const;

export const getLeadByIdSchema = {
  tags: ['Leads'],
  summary: 'Get lead by ID',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['leadId'],
    properties: {
      leadId: { type: 'string', minLength: 1 }
    }
  },
  response: {
    200: {
      type: 'object',
      required: [
        'leadId',
        'source',
        'channel',
        'fullName',
        'phone',
        'interestedServices',
        'externalReference',
        'status',
        'createdAt',
        'updatedAt'
      ],
      properties: {
        leadId: { type: 'string' },
        source: { type: 'string' },
        channel: { type: 'string' },
        fullName: { type: 'string' },
        documentType: { type: ['string', 'null'] },
        documentNumber: { type: ['string', 'null'] },
        phone: { type: 'string' },
        email: { type: ['string', 'null'] },
        businessName: { type: ['string', 'null'] },
        interestedServices: {
          type: 'array',
          items: { type: 'string' }
        },
        notes: { type: ['string', 'null'] },
        consentAccepted: { type: 'boolean' },
        externalReference: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
} as const;