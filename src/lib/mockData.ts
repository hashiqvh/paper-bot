export type UserRole = 'admin'  | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  twoFactorEnabled?: boolean;
}

export interface Client {
  accountType: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: 'Lead' | 'Verified' | 'Active' | 'Suspended';
  dateAdded: string;
  kycStatus: 'Pending' | 'Approved' | 'Rejected';
  documents: Document[];
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  // Old format (single service) - kept for backward compatibility
  service?: string;
  amount?: number;
  // New format (multiple line items)
  lineItems?: InvoiceLineItem[];
  subtotal?: number;
  taxRate?: number;
  tax: number;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Upcoming';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  fee: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  createdDate: string;
  sentDate?: string;
  content?: {
    introduction?: string;
    serviceDetails?: string;
    deliverables?: string;
    timeline?: string;
    paymentTerms?: string;
    termsAndConditions?: string;
  };
  validity?: number;
}

export interface Expense {
  id: string;
  date: string;
  type: 'Advertising' | 'Office' | 'Platform Fee' | 'Other';
  amount: number;
  description: string;
  receipt?: string;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'KYC' | 'Agreement' | 'Compliance' | 'Report' | 'Other' | 'Policy' | 'Template' | 'Contract' | 'Legal' | 'Financial' | 'HR' | 'Marketing';
  uploadDate: string;
  status?: string;
  url?: string;
  ownerType?: 'client' | 'company';
}

export interface ServiceAgreement {
  id: string;
  clientId: string;
  clientName: string;
  proposalId: string;
  service: string;
  fee: number;
  status: 'Draft' | 'Sent' | 'Signed' | 'Active' | 'Expired';
  createdDate: string;
  sentDate?: string;
  signedDate?: string;
  startDate?: string;
  endDate?: string;
  content?: {
    scope?: string;
    terms?: string;
    obligations?: string;
    termination?: string;
  };
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@forexcrm.com',
    role: 'admin',
    twoFactorEnabled: true,
  },
 
  {
    id: '4',
    name: 'Michael Roberts',
    email: 'michael@example.com',
    role: 'client',
    twoFactorEnabled: false,
  },
];

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Michael Roberts',
    email: 'michael@example.com',
    phone: '+1 555-0101',
    country: 'United States',
    status: 'Active',
    dateAdded: '2024-01-15',
    kycStatus: 'Approved',
    accountType: 'Client',
    documents: [
      {
        id: 'd1',
        name: 'Passport Copy',
        type: 'KYC',
        uploadDate: '2024-01-15',
        status: 'Approved',
      },
      {
        id: 'd2',
        name: 'Address Proof',
        type: 'KYC',
        uploadDate: '2024-01-15',
        status: 'Approved',
      },
    ],
  },
  {
    id: 'c2',
    name: 'Emma Thompson',
    email: 'emma@example.com',
    accountType: 'Client',
    phone: '+44 20 7123 4567',
    country: 'United Kingdom',
    status: 'Verified',
    dateAdded: '2024-02-20',
    kycStatus: 'Pending',
    documents: [
      {
        id: 'd3',
        name: 'ID Document',
        type: 'KYC',
        uploadDate: '2024-02-20',
        status: 'Pending',
      },
    ],
  },
  {
    id: 'c3',
    name: 'David Chen',
    email: 'david@example.com',
    accountType: 'Client',
    phone: '+65 1234 5678',
    country: 'Singapore',
    status: 'Active',
    dateAdded: '2023-11-10',
    kycStatus: 'Approved',
    documents: [
      {
        id: 'd4',
        name: 'Passport',
        type: 'KYC',
        uploadDate: '2023-11-10',
        status: 'Approved',
      },
    ],
  },
  {
    id: 'c4',
    name: 'Sofia Martinez',
    email: 'sofia@example.com',
    phone: '+34 91 123 4567',
    country: 'Spain',
    status: 'Lead',
    dateAdded: '2024-03-05',
    kycStatus: 'Pending',
    accountType: 'Client',
    documents: [],
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    clientId: 'c1',
    clientName: 'Michael Roberts',
    service: 'Managed Account Service',
    amount: 2000,
    tax: 400,
    total: 2400,
    status: 'Paid',
    dueDate: '2024-02-15',
    issueDate: '2024-01-15',
    paidDate: '2024-02-10',
  },
  {
    id: 'inv2',
    clientId: 'c3',
    clientName: 'David Chen',
    service: 'Account Setup',
    amount: 500,
    tax: 100,
    total: 600,
    status: 'Paid',
    dueDate: '2023-12-10',
    issueDate: '2023-11-10',
    paidDate: '2023-12-05',
  },
  {
    id: 'inv3',
    clientId: 'c2',
    clientName: 'Emma Thompson',
    service: 'Premium Account Setup',
    amount: 1500,
    tax: 300,
    total: 1800,
    status: 'Unpaid',
    dueDate: '2024-03-20',
    issueDate: '2024-02-20',
  },
  {
    id: 'inv4',
    clientId: 'c1',
    clientName: 'Michael Roberts',
    service: 'Monthly Management Fee',
    amount: 500,
    tax: 100,
    total: 600,
    status: 'Overdue',
    dueDate: '2024-03-01',
    issueDate: '2024-02-01',
  },
  // Example with multiple line items
  {
    id: 'inv5',
    clientId: 'c3',
    clientName: 'David Chen',
    lineItems: [
      {
        description: 'Managed Account Service - Monthly Fee',
        amount: 2000,
      },
      {
        description: 'Performance Analysis Report',
        amount: 500,
      },
      {
        description: 'Strategy Consultation Session',
        amount: 450,
      },
    ],
    subtotal: 2950,
    taxRate: 20,
    tax: 590,
    total: 3540,
    status: 'Unpaid',
    dueDate: '2024-04-15',
    issueDate: '2024-03-15',
  },
];

export const mockProposals: Proposal[] = [
  {
    id: 'p1',
    clientId: 'c1',
    clientName: 'Michael Roberts',
    service: 'Managed Account Service',
    fee: 2000,
    status: 'Accepted',
    createdDate: '2024-01-10',
    sentDate: '2024-01-11',
  },
  {
    id: 'p2',
    clientId: 'c2',
    clientName: 'Emma Thompson',
    service: 'Premium Account Setup',
    fee: 1500,
    status: 'Sent',
    createdDate: '2024-02-15',
    sentDate: '2024-02-16',
  },
  {
    id: 'p3',
    clientId: 'c4',
    clientName: 'Sofia Martinez',
    service: 'Standard Account Setup',
    fee: 750,
    status: 'Draft',
    createdDate: '2024-03-05',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    date: '2024-01-10',
    type: 'Advertising',
    amount: 1200,
    description: 'Google Ads Campaign',
    vendor: 'Google LLC',
    paymentMethod: 'Credit Card',
    notes: 'Q1 advertising campaign for new client acquisition',
  },
  {
    id: 'e2',
    date: '2024-02-01',
    type: 'Platform Fee',
    amount: 500,
    description: 'MT4 Server License',
    vendor: 'MetaQuotes Software',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'e3',
    date: '2024-02-15',
    type: 'Office',
    amount: 800,
    description: 'Office Rent',
    vendor: 'Downtown Properties LLC',
    paymentMethod: 'Bank Transfer',
    notes: 'Monthly office rent payment',
  },
  {
    id: 'e4',
    date: '2024-03-01',
    type: 'Other',
    amount: 350,
    description: 'Software Subscriptions',
    vendor: 'Various Vendors',
    paymentMethod: 'Credit Card',
    notes: 'Includes CRM, analytics tools, and productivity software',
  },
  {
    id: 'e5',
    date: '2024-03-15',
    type: 'Advertising',
    amount: 2500,
    description: 'Facebook & Instagram Ads',
    vendor: 'Meta Platforms',
    paymentMethod: 'Credit Card',
    notes: 'Social media marketing campaign',
  },
  {
    id: 'e6',
    date: '2024-04-01',
    type: 'Office',
    amount: 450,
    description: 'Office Supplies',
    vendor: 'Office Depot',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'e7',
    date: '2024-04-10',
    type: 'Platform Fee',
    amount: 750,
    description: 'Trading Platform Annual License',
    vendor: 'cTrader',
    paymentMethod: 'Bank Transfer',
    notes: 'Annual license renewal',
  },
  {
    id: 'e8',
    date: '2024-04-20',
    type: 'Other',
    amount: 200,
    description: 'Professional Development',
    vendor: 'Udemy',
    paymentMethod: 'Credit Card',
    notes: 'Training courses for team members',
  },
];

export const mockCompanyDocuments: Document[] = [
  {
    id: 'cd1',
    name: 'Employee Handbook 2024',
    type: 'HR',
    uploadDate: '2024-01-15',
    ownerType: 'company',
  },
  {
    id: 'cd2',
    name: 'Service Agreement Template',
    type: 'Template',
    uploadDate: '2024-02-10',
    status: 'Active',
    ownerType: 'company',
  },
  {
    id: 'cd3',
    name: 'Anti-Money Laundering Policy',
    type: 'Policy',
    uploadDate: '2024-01-05',
    status: 'Active',
    ownerType: 'company',
  },
  {
    id: 'cd4',
    name: 'Client Onboarding SOP',
    type: 'Policy',
    uploadDate: '2024-03-01',
    status: 'Active',
    ownerType: 'company',
  },
  {
    id: 'cd5',
    name: 'NDA Template',
    type: 'Contract',
    uploadDate: '2024-01-20',
    ownerType: 'company',
  },
  {
    id: 'cd6',
    name: 'Company Registration Certificate',
    type: 'Legal',
    uploadDate: '2023-12-01',
    ownerType: 'company',
  },
  {
    id: 'cd7',
    name: 'Financial Report Q1 2024',
    type: 'Financial',
    uploadDate: '2024-04-05',
    ownerType: 'company',
  },
  {
    id: 'cd8',
    name: 'Marketing Pitch Deck',
    type: 'Marketing',
    uploadDate: '2024-03-15',
    ownerType: 'company',
  },
];

export const mockAgreements: ServiceAgreement[] = [
  {
    id: 'agr1',
    clientId: 'c1',
    clientName: 'Michael Roberts',
    proposalId: 'p1',
    service: 'Managed Account Service',
    fee: 2000,
    status: 'Active',
    createdDate: '2024-01-12',
    sentDate: '2024-01-12',
    signedDate: '2024-01-14',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
  },
  {
    id: 'agr2',
    clientId: 'c3',
    clientName: 'David Chen',
    service: 'Account Setup',
    proposalId: 'p4',
    fee: 500,
    status: 'Signed',
    createdDate: '2023-11-11',
    sentDate: '2023-11-11',
    signedDate: '2023-11-12',
    startDate: '2023-11-15',
  },
  {
    id: 'agr3',
    clientId: 'c2',
    clientName: 'Emma Thompson',
    proposalId: 'p2',
    service: 'Premium Account Setup',
    fee: 1500,
    status: 'Sent',
    createdDate: '2024-02-18',
    sentDate: '2024-02-18',
  },
];
