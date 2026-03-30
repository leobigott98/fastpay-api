export type ApplicantType = 'individual' | 'business';
export type DocumentType = 'V' | 'E' | 'J' | 'P' | 'G';

export type PreRegistrationAttachment = {
  type: string;
  fileName: string;
  storageKey: string;
};

export type CreatePreRegistrationRequest = {
  leadId?: string;
  applicantType: ApplicantType;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email?: string;
  businessName?: string;
  taxId?: string;
  address?: {
    state?: string;
    city?: string;
    line1?: string;
  };
  requestedServices?: string[];
  attachments?: PreRegistrationAttachment[];
  externalReference: string;
};

export type CreatePreRegistrationResponse = {
  preRegistrationId: string;
  status: string;
  createdAt: string;
};

export type PreRegistrationRecord = {
  id: number;
  pre_registration_id: string;
  lead_id: string | null;
  applicant_type: string;
  full_name: string;
  document_type: string;
  document_number: string;
  phone: string;
  email: string | null;
  business_name: string | null;
  tax_id: string | null;
  state: string | null;
  city: string | null;
  address_line1: string | null;
  status: string;
  external_reference: string;
  created_at: string;
  updated_at: string;
};

export type PreRegistrationAttachmentRecord = {
  attachment_type: string;
  file_name: string;
  storage_key: string;
};

export type PreRegistrationDetailsResponse = {
  preRegistrationId: string;
  leadId: string | null;
  applicantType: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string | null;
  businessName: string | null;
  taxId: string | null;
  address: {
    state: string | null;
    city: string | null;
    line1: string | null;
  };
  requestedServices: string[];
  attachments: PreRegistrationAttachment[];
  externalReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};