export const createPreRegistrationSchema = {
  tags: ['PreRegistrations'],
  summary: 'Create pre-registration',
  description: 'Creates a pre-registration from Aliee and stores attachment files in FastPay shared storage.',
  security: [{ bearerAuth: [] }],
  headers: {
    type: 'object',
    required: ['authorization', 'idempotency-key'],
    properties: {
      authorization: { type: 'string', minLength: 1 },
      'idempotency-key': { type: 'string', minLength: 1, maxLength: 100 },
    },
  },
  body: {
    type: 'object',
    additionalProperties: false,
    required: [
      'applicantType',
      'fullName',
      'documentType',
      'documentNumber',
      'phone',
      'externalReference',
    ],
    properties: {
      leadId: { type: 'string', minLength: 1, maxLength: 50 },
      applicantType: { type: 'string', enum: ['individual', 'business'] },
      fullName: { type: 'string', minLength: 3, maxLength: 150 },
      documentType: { type: 'string', enum: ['V', 'E', 'J', 'P', 'G'] },
      documentNumber: { type: 'string', minLength: 3, maxLength: 30 },
      phone: { type: 'string', minLength: 8, maxLength: 30 },
      email: { type: 'string', format: 'email', maxLength: 150 },
      businessName: { type: 'string', maxLength: 150 },
      taxId: { type: 'string', maxLength: 30 },
      address: {
        type: 'object',
        additionalProperties: false,
        properties: {
          state: { type: 'string', maxLength: 100 },
          city: { type: 'string', maxLength: 100 },
          line1: { type: 'string', maxLength: 255 },
        },
      },
      requestedServices: {
        type: 'array',
        minItems: 0,
        maxItems: 20,
        items: { type: 'string', minLength: 1, maxLength: 50 },
      },
      attachments: {
        type: 'array',
        minItems: 0,
        maxItems: 20,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['type', 'fileName', 'mimeType', 'encoding', 'contentBase64'],
          properties: {
            type: { type: 'string', minLength: 1, maxLength: 50 },
            fileName: { type: 'string', minLength: 1, maxLength: 255 },
            mimeType: { type: 'string', minLength: 1, maxLength: 100 },
            encoding: { type: 'string', enum: ['base64'] },
            contentBase64: { type: 'string', minLength: 1, description: 'Base64-encoded file content' },
          },
        },
      },
      externalReference: { type: 'string', minLength: 1, maxLength: 100 },
    },
  },
  response: {
    201: {
      type: 'object',
      required: ['preRegistrationId', 'status', 'createdAt'],
      properties: {
        preRegistrationId: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
      },
    },
  },
} as const;

export const getPreRegistrationByIdSchema = {
  tags: ['PreRegistrations'],
  summary: 'Get pre-registration by ID',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['preRegistrationId'],
    properties: {
      preRegistrationId: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      required: [
        'preRegistrationId',
        'leadId',
        'applicantType',
        'fullName',
        'documentType',
        'documentNumber',
        'phone',
        'address',
        'requestedServices',
        'attachments',
        'externalReference',
        'status',
        'createdAt',
        'updatedAt',
      ],
      properties: {
        preRegistrationId: { type: 'string' },
        leadId: { type: ['string', 'null'] },
        applicantType: { type: 'string' },
        fullName: { type: 'string' },
        documentType: { type: 'string' },
        documentNumber: { type: 'string' },
        phone: { type: 'string' },
        email: { type: ['string', 'null'] },
        businessName: { type: ['string', 'null'] },
        taxId: { type: ['string', 'null'] },
        address: {
          type: 'object',
          required: ['state', 'city', 'line1'],
          properties: {
            state: { type: ['string', 'null'] },
            city: { type: ['string', 'null'] },
            line1: { type: ['string', 'null'] },
          },
        },
        requestedServices: {
          type: 'array',
          items: { type: 'string' },
        },
        attachments: {
          type: 'array',
          items: {
            type: 'object',
            required: ['type', 'fileName', 'storageKey'],
            properties: {
              type: { type: 'string' },
              fileName: { type: 'string' },
              storageKey: { type: 'string' },
            },
          },
        },
        externalReference: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
} as const;