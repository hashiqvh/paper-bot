import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  fee: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    country?: string;
  };
}

export interface ProposalListParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProposalListResponse {
  success: boolean;
  proposals: Proposal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProposalDetailResponse {
  success: boolean;
  proposal: Proposal;
}

// API Functions
async function getProposals(params: ProposalListParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/proposals?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch proposals');
  }
  return data as ProposalListResponse;
}

async function getProposal(id: string) {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch proposal');
  }
  return data as ProposalDetailResponse;
}

async function createProposal(data: {
  clientId: string;
  service: string;
  fee: number;
  status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string;
  notes?: string;
}) {
  const response = await fetch('/api/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create proposal');
  }
  return result;
}

async function updateProposal(
  id: string,
  data: {
    service?: string;
    fee?: number;
    status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    validUntil?: string;
    notes?: string;
  }
) {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update proposal');
  }
  return result;
}

async function deleteProposal(id: string) {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete proposal');
  }
  return result;
}

// React Query Hooks
export function useProposals(params: ProposalListParams = {}) {
  return useQuery({
    queryKey: ['proposals', params],
    queryFn: () => getProposals(params),
  });
}

export function useProposal(id: string | null) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: () => getProposal(id!),
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposal> }) =>
      updateProposal(id, data as { service?: string; fee?: number; status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'; validUntil?: string; notes?: string }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', variables.id] });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

