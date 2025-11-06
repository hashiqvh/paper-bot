import {
    CompanyData,
    NotificationPreferencesData,
    PasswordData,
    PaymentInstructionsData,
    ProfileData,
    SmtpSettingsData,
    SystemSettingsData,
    TwoFactorData,
    WalletData,
} from '@/lib/validations/settings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Profile
async function getProfile() {
  const response = await fetch('/api/settings/profile', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch profile');
  }
  return data;
}

async function updateProfile(data: ProfileData) {
  const response = await fetch('/api/settings/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update profile');
  }
  return result;
}

export function useProfile() {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Password
async function updatePassword(data: PasswordData) {
  const response = await fetch('/api/settings/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update password');
  }
  return result;
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: updatePassword,
  });
}

// 2FA
async function update2FA(data: TwoFactorData) {
  const response = await fetch('/api/settings/2fa', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update 2FA');
  }
  return result;
}

export function useUpdate2FA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: update2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Company
async function getCompany() {
  const response = await fetch('/api/settings/company', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch company');
  }
  return data;
}

async function updateCompany(data: CompanyData) {
  const response = await fetch('/api/settings/company', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update company');
  }
  return result;
}

export function useCompany() {
  return useQuery({
    queryKey: ['settings', 'company'],
    queryFn: getCompany,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'company'] });
    },
  });
}

// Wallets
async function getWallets() {
  const response = await fetch('/api/settings/wallets', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch wallets');
  }
  return data;
}

async function createWallet(data: WalletData) {
  const response = await fetch('/api/settings/wallets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create wallet');
  }
  return result;
}

async function deleteWallet(id: string) {
  const response = await fetch(`/api/settings/wallets/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete wallet');
  }
  return result;
}

async function updateWallet(id: string, data: Partial<WalletData> & { isPrimary?: boolean }) {
  const response = await fetch(`/api/settings/wallets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update wallet');
  }
  return result;
}

export function useWallets() {
  return useQuery({
    queryKey: ['settings', 'wallets'],
    queryFn: getWallets,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'wallets'] });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'wallets'] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WalletData> & { isPrimary?: boolean } }) =>
      updateWallet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'wallets'] });
    },
  });
}

// Payment Instructions
async function getPaymentInstructions() {
  const response = await fetch('/api/settings/payment-instructions', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch payment instructions');
  }
  return data;
}

async function updatePaymentInstructions(data: PaymentInstructionsData) {
  const response = await fetch('/api/settings/payment-instructions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update payment instructions');
  }
  return result;
}

export function usePaymentInstructions() {
  return useQuery({
    queryKey: ['settings', 'payment-instructions'],
    queryFn: getPaymentInstructions,
  });
}

export function useUpdatePaymentInstructions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePaymentInstructions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'payment-instructions'] });
    },
  });
}

// Notifications
async function getNotificationPreferences() {
  const response = await fetch('/api/settings/notifications', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch notification preferences');
  }
  return data;
}

async function updateNotificationPreferences(data: NotificationPreferencesData) {
  const response = await fetch('/api/settings/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update notification preferences');
  }
  return result;
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] });
    },
  });
}

// System Settings
async function getSystemSettings() {
  const response = await fetch('/api/settings/system', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch system settings');
  }
  return data;
}

async function updateSystemSettings(data: SystemSettingsData) {
  const response = await fetch('/api/settings/system', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update system settings');
  }
  return result;
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['settings', 'system'],
    queryFn: getSystemSettings,
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'system'] });
    },
  });
}

// Signature
async function uploadSignature(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/settings/signature', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to upload signature');
  }
  return result;
}

async function deleteSignature() {
  const response = await fetch('/api/settings/signature', {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete signature');
  }
  return result;
}

export function useUploadSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadSignature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useDeleteSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSignature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Services
async function getServices() {
  const response = await fetch('/api/settings/services', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch services');
  }
  return data;
}

async function createService(data: { name: string; description?: string; isActive?: boolean }) {
  const response = await fetch('/api/settings/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create service');
  }
  return result;
}

async function updateService(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
  const response = await fetch(`/api/settings/services/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update service');
  }
  return result;
}

async function deleteService(id: string) {
  const response = await fetch(`/api/settings/services/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete service');
  }
  return result;
}

export function useServices() {
  return useQuery({
    queryKey: ['settings', 'services'],
    queryFn: getServices,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'services'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; isActive?: boolean } }) =>
      updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'services'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'services'] });
    },
  });
}

// Expense Categories
async function getExpenseCategories() {
  const response = await fetch('/api/settings/expense-categories', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch expense categories');
  }
  return data;
}

async function createExpenseCategory(data: { name: string; description?: string }) {
  const response = await fetch('/api/settings/expense-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create expense category');
  }
  return result;
}

async function updateExpenseCategory(id: string, data: { name?: string; description?: string }) {
  const response = await fetch(`/api/settings/expense-categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update expense category');
  }
  return result;
}

async function deleteExpenseCategory(id: string) {
  const response = await fetch(`/api/settings/expense-categories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete expense category');
  }
  return result;
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['settings', 'expense-categories'],
    queryFn: getExpenseCategories,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'expense-categories'] });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      updateExpenseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'expense-categories'] });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'expense-categories'] });
    },
  });
}

// SMTP Settings
async function getSmtpSettings() {
  const response = await fetch('/api/settings/smtp', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch SMTP settings');
  }
  return data;
}

async function updateSmtpSettings(data: SmtpSettingsData) {
  const response = await fetch('/api/settings/smtp', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update SMTP settings');
  }
  return result;
}

export function useSmtpSettings() {
  return useQuery({
    queryKey: ['settings', 'smtp'],
    queryFn: getSmtpSettings,
  });
}

export function useUpdateSmtpSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSmtpSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'smtp'] });
    },
  });
}

