import { z } from 'zod';

// Profile validation
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

export type ProfileData = z.infer<typeof profileSchema>;

// Password validation
export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordData = z.infer<typeof passwordSchema>;

// 2FA validation
export const twoFactorSchema = z.object({
  enabled: z.boolean(),
});

export type TwoFactorData = z.infer<typeof twoFactorSchema>;

// Company validation
export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  licenseNumber: z.string().optional(),
  address: z.string().optional(),
  supportEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
});

export type CompanyData = z.infer<typeof companySchema>;

// Wallet validation
export const walletSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  cryptocurrency: z.string().min(1, 'Cryptocurrency is required'),
  address: z.string().min(1, 'Wallet address is required'),
  isPrimary: z.boolean(),
});

export type WalletData = z.infer<typeof walletSchema>;

// Payment instructions validation
export const paymentInstructionsSchema = z.object({
  instructions: z.string().optional(),
});

export type PaymentInstructionsData = z.infer<typeof paymentInstructionsSchema>;

// Notification preferences validation
export const notificationPreferencesSchema = z.object({
  newClientAdded: z.boolean(),
  proposalAccepted: z.boolean(),
  invoiceOverdue: z.boolean(),
  kycSubmission: z.boolean(),
  activityLog: z.boolean(),
  securityAlerts: z.boolean(),
});

export type NotificationPreferencesData = z.infer<typeof notificationPreferencesSchema>;

// System settings validation
export const systemSettingsSchema = z.object({
  taxEnabled: z.boolean(),
  vatRate: z.number().min(0).max(100).optional(),
}).refine((data) => {
  // If tax is enabled, VAT rate is required
  if (data.taxEnabled && !data.vatRate) {
    return false;
  }
  return true;
}, {
  message: "VAT rate is required when tax is enabled",
  path: ["vatRate"],
});

export type SystemSettingsData = z.infer<typeof systemSettingsSchema>;

// Service validation
export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type ServiceData = z.infer<typeof serviceSchema>;

// SMTP settings validation
export const smtpSettingsSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  secure: z.boolean(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(), // Optional for updates, required for creates (handled in API)
  fromEmail: z.string().email('Invalid email address'),
  fromName: z.string().min(1, 'From name is required'),
});

export type SmtpSettingsData = z.infer<typeof smtpSettingsSchema>;

