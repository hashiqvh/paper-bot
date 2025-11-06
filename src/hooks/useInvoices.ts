import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  subtotal?: number | null;
  taxRate?: number | null;
  tax: number;
  total: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'UPCOMING';
  dueDate: string;
  issueDate: string;
  paidDate?: string | null;
  notes?: string | null;
  paymentTerms?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    country?: string;
  };
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceListParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface InvoiceListResponse {
  success: boolean;
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvoiceDetailResponse {
  success: boolean;
  invoice: Invoice;
}

// API Functions
async function getInvoices(params: InvoiceListParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/invoices?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch invoices');
  }
  return data as InvoiceListResponse;
}

async function getInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch invoice');
  }
  return data as InvoiceDetailResponse;
}

async function createInvoice(data: {
  clientId: string;
  taxRate?: number;
  dueDate: string;
  issueDate?: string;
  status?: 'PAID' | 'UNPAID' | 'OVERDUE' | 'UPCOMING';
  notes?: string;
  paymentTerms?: string;
  lineItems: Array<{ description: string; amount: number }>;
}) {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create invoice');
  }
  return result;
}

async function updateInvoice(
  id: string,
  data: {
    taxRate?: number;
    dueDate?: string;
    status?: 'PAID' | 'UNPAID' | 'OVERDUE' | 'UPCOMING';
    notes?: string;
    paymentTerms?: string;
    lineItems?: Array<{ id?: string; description: string; amount: number }>;
  }
) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update invoice');
  }
  return result;
}

async function deleteInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete invoice');
  }
  return result;
}

// React Query Hooks
export function useInvoices(params: InvoiceListParams = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => getInvoices(params),
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      updateInvoice(id, data as  { taxRate?: number; dueDate?: string; status?: 'PAID' | 'UNPAID' | 'OVERDUE' | 'UPCOMING'; notes?: string; paymentTerms?: string; lineItems?: Array<{ id?: string; description: string; amount: number }> }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

