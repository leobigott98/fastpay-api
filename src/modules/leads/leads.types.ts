export type LeadChannel = 'voice' | 'whatsapp' | 'web';
export type DocumentType = 'V' | 'E' | 'J' | 'P' | 'G';

export type CreateLeadRequest = {
  source: string;
  channel: LeadChannel;
  fullName: string;
  documentType?: DocumentType;
  documentNumber?: string;
  phone: string;
  email?: string;
  businessName?: string;
  interestedServices: string[];
  notes?: string;
  consentAccepted?: boolean;
  externalReference: string;
};

export type CreateLeadResponse = {
  leadId: string;
  status: string;
  createdAt: string;
};

export type LeadRecord = {
  id: number;
  lead_id: string;
  source: string;
  channel: string;
  full_name: string;
  document_type: string | null;
  document_number: string | null;
  phone: string;
  email: string | null;
  business_name: string | null;
  notes: string | null;
  consent_accepted: number;
  external_reference: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type LeadDetailsResponse = {
  leadId: string;
  source: string;
  channel: string;
  fullName: string;
  documentType: string | null;
  documentNumber: string | null;
  phone: string;
  email: string | null;
  businessName: string | null;
  interestedServices: string[];
  notes: string | null;
  consentAccepted: boolean;
  externalReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};