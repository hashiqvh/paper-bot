import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: 'LEAD' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  accountType: string;
  notes?: string;
  dateAdded: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListParams {
  search?: string;
  status?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClientListResponse {
  success: boolean;
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    countries: string[];
  };
}

export interface ClientDetailResponse {
  success: boolean;
  client: Client & {
    invoices?: any[];
    proposals?: any[];
    agreements?: any[];
    documents?: any[];
    expenses?: any[];
    clientNotes?: ClientNote[];
  };
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientNotesResponse {
  success: boolean;
  notes: ClientNote[];
}

// API Functions
async function getClients(params: ClientListParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.country) queryParams.append('country', params.country);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/clients?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch clients');
  }
  return data as ClientListResponse;
}

async function getClient(id: string) {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch client');
  }
  return data as ClientDetailResponse;
}

async function createClient(data: {
  name: string;
  email: string;
  phone: string;
  country?: string;
  status?: 'LEAD' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED';
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  accountType?: string;
  notes?: string;
}) {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create client');
  }
  return result;
}

async function updateClient(id: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  country: string;
  status: 'LEAD' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  accountType: string;
  notes: string;
}>) {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update client');
  }
  return result;
}

async function deleteClient(id: string) {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete client');
  }
  return result;
}

// React Query Hooks
export function useClients(params: ClientListParams = {}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => getClients(params),
  });
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClient(id!),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Client Notes Hooks
async function getClientNotes(clientId: string) {
  const response = await fetch(`/api/clients/${clientId}/notes`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch notes');
  }
  return data as ClientNotesResponse;
}

async function createClientNote(clientId: string, content: string) {
  const response = await fetch(`/api/clients/${clientId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create note');
  }
  return result;
}

async function updateClientNote(clientId: string, noteId: string, content: string) {
  const response = await fetch(`/api/clients/${clientId}/notes/${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update note');
  }
  return result;
}

async function deleteClientNote(clientId: string, noteId: string) {
  const response = await fetch(`/api/clients/${clientId}/notes/${noteId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete note');
  }
  return result;
}

export function useClientNotes(clientId: string | null) {
  return useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: () => getClientNotes(clientId!),
    enabled: !!clientId,
  });
}

export function useCreateClientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, content }: { clientId: string; content: string }) =>
      createClientNote(clientId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
    },
  });
}

export function useUpdateClientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      noteId,
      content,
    }: {
      clientId: string;
      noteId: string;
      content: string;
    }) => updateClientNote(clientId, noteId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
    },
  });
}

export function useDeleteClientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, noteId }: { clientId: string; noteId: string }) =>
      deleteClientNote(clientId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
    },
  });
}

// Client Documents Hooks
export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: string;
  uploadDate: string;
  status: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocumentsResponse {
  success: boolean;
  documents: ClientDocument[];
}

async function getClientDocuments(clientId: string) {
  const response = await fetch(`/api/clients/${clientId}/documents`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch documents');
  }
  return data as ClientDocumentsResponse;
}

async function uploadClientDocument(clientId: string, file: File, name: string, type?: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  if (type) {
    formData.append('type', type);
  }

  const response = await fetch(`/api/clients/${clientId}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to upload document');
  }
  return result;
}

async function updateClientDocument(
  clientId: string,
  documentId: string,
  data: { name?: string; type?: string; status?: string }
) {
  const response = await fetch(`/api/clients/${clientId}/documents/${documentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update document');
  }
  return result;
}

async function deleteClientDocument(clientId: string, documentId: string) {
  const response = await fetch(`/api/clients/${clientId}/documents/${documentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete document');
  }
  return result;
}

export function useClientDocuments(clientId: string | null) {
  return useQuery({
    queryKey: ['client-documents', clientId],
    queryFn: () => getClientDocuments(clientId!),
    enabled: !!clientId,
  });
}

export function useUploadClientDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      file,
      name,
      type,
    }: {
      clientId: string;
      file: File;
      name: string;
      type?: string;
    }) => uploadClientDocument(clientId, file, name, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-documents', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
    },
  });
}

export function useUpdateClientDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      documentId,
      data,
    }: {
      clientId: string;
      documentId: string;
      data: { name?: string; type?: string; status?: string };
    }) => updateClientDocument(clientId, documentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-documents', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
    },
  });
}

export function useDeleteClientDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, documentId }: { clientId: string; documentId: string }) =>
      deleteClientDocument(clientId, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-documents', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
    },
  });
}

