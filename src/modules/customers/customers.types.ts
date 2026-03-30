export type CustomerSearchQuery = {
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  taxId?: string;
};

export type CustomerSearchResultItem = {
  sourceType: 'lead' | 'pre_registration';
  sourceId: string;
  fullName: string;
  documentType: string | null;
  documentNumber: string | null;
  phone: string | null;
  email: string | null;
  businessName: string | null;
  taxId: string | null;
  status: string;
  externalReference: string | null;
  createdAt: string;
};

export type CustomerSearchResponse = {
  filters: CustomerSearchQuery;
  total: number;
  results: CustomerSearchResultItem[];
};