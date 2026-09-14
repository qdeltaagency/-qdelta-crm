// ==============================================================================
// Qdelta CRM v1 — Master TypeScript Definitions & Types
// ==============================================================================

export type ServicePillar = 
  | 'Landing Page'
  | 'Multi-Page Website'
  | 'Web Design & Full-Stack App'
  | 'AI Agent & Next.js SaaS'
  | 'Brand Identity & Design System'
  | string;

export type LeadStatus = 
  | 'New'
  | 'New Inquiry'
  | 'Proposal Sent'
  | 'In Discussion'
  | 'Link Sent'
  | 'Payment Received'
  | 'Converted'
  | 'Referred Out'
  | 'Lost';

export type LeadPriority = 'Hot' | 'Warm' | 'Cold';

export type HandlingMode = 
  | 'In-House'
  | 'Referred Out'
  | 'White-Label'
  | string;

export type TeamMemberName = 
  | 'MD Qais'
  | 'Nagireddy Sai Prabhath'
  | 'MD Fazeel'
  | string;

export type ProjectStatus = 
  | 'Planning'
  | 'In Progress'
  | 'Client Review'
  | 'Final Settlement'
  | 'Launched'
  | 'Archived';

export type PaymentType = 
  | 'Deposit (30%)'
  | 'Milestone 2 (35%)'
  | 'Final Launch (35%)'
  | 'Deposit (50%)'
  | 'Milestone 2'
  | 'Final (100%)'
  | 'Monthly Retainer'
  | string;

export type PaymentStatus = 'Pending' | 'Link Sent' | 'Paid' | 'Refunded';

export type AccountType = 'Organization' | 'Individual';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
}

export interface Lead {
  id: string;
  leadType?: AccountType;
  submissionType?: 'Website Form' | 'Manual CRM Entry' | 'Webhook / API' | string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  phone?: string;
  country?: string;
  serviceType: ServicePillar;
  budget?: string;
  timeline?: string;
  details: string;
  source: string; // 'LinkedIn Outreach' | 'Twitter (X)' | 'Instagram' | 'Upwork' | 'Website Form' | 'Other / Custom'
  status: LeadStatus;
  assignedTo?: TeamMemberName;
  handlingMode?: HandlingMode;
  referringPartner?: string;
  referralCommissionRate?: number;
  referralCommissionAmount?: number;
  paypalPaymentLink?: string;
  quoteAmount: number; // 1st Deposit (30% Upfront Kickoff)
  currency: string;
  leadScore: number;
  priority?: LeadPriority;
  contractAgreement?: {
    signed: boolean;
    signerName?: string;
    signerTitle?: string;
    signedAt?: string;
    signatureDataUrl?: string;
    termsAgreed?: boolean;
    agreementVersion?: string;
    scopeSummary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 'lead' | 'organization' | 'individual' | 'project' | 'payment' | 'partner' | 'ai' | 'system';

export type ActivityActionType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'payment_link_generated'
  | 'payment_received'
  | 'converted'
  | 'note_added'
  | 'assigned'
  | 'stage_advanced'
  | 'general'
  | string;

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  category?: ActivityCategory;
  actionType?: ActivityActionType;
  leadId?: string;
  organizationId?: string;
  individualId?: string;
  clientId?: string; // Compatibility alias
  projectId?: string;
  timestamp?: string;
  createdAt?: string;
  partner?: TeamMemberName | string;
  performedBy?: string;
}

// Unified alias for backward compatibility across components
export type LeadActivity = ActivityLog;



export interface ContractAgreement {
  signed: boolean;
  signerName: string;
  signerTitle?: string;
  signedAt: string;
  signatureDataUrl?: string;
  termsAgreed: boolean;
  agreementVersion: string;
  scopeSummary?: string;
}

export interface Organization {
  id: string;
  type: AccountType;
  name: string; // Company name (e.g. Apex Labs)
  contactPerson: string; // Primary contact person name
  email: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
  leadId?: string;
  assignedLeadPartner?: TeamMemberName;
  totalLtv: number;
  totalPaid: number;
  onboardingStatus: {
    brandAssets: boolean;
    credentials: boolean;
    kickoffBooked: boolean;
    slackInvited: boolean;
  };
  contractAgreement?: ContractAgreement;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Compatibility aliases
  organizationName: string;
  primaryContactName: string;
  clientType?: AccountType;
}

export interface Individual {
  id: string;
  type: AccountType;
  name: string; // Person name (e.g. David Miller)
  contactPerson: string; // Person name
  email: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
  leadId?: string;
  assignedLeadPartner?: TeamMemberName;
  totalLtv: number;
  totalPaid: number;
  onboardingStatus: {
    brandAssets: boolean;
    credentials: boolean;
    kickoffBooked: boolean;
    slackInvited: boolean;
  };
  contractAgreement?: ContractAgreement;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Compatibility aliases
  organizationName: string; // Maps to name
  primaryContactName: string; // Maps to name
  clientType?: AccountType;
}

export type Client = Organization | Individual;

export interface Project {
  id: string;
  clientType?: AccountType;
  organizationId?: string;
  individualId?: string;
  clientId: string; // Compatibility alias (org or individual id)
  clientName?: string;
  leadId?: string;
  title: string;
  servicePillar: ServicePillar;
  contractValue: number;
  currency: string;
  status: ProjectStatus;
  progressPercent: number;
  startDate: string;
  targetLaunchDate: string;
  githubRepoUrl?: string;
  figmaUrl?: string;
  stagingUrl?: string;
  scopeSummary?: string;
  contractAgreement?: ContractAgreement;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  clientType?: AccountType;
  organizationId?: string;
  individualId?: string;
  clientId?: string; // Compatibility alias
  clientName?: string;
  projectId?: string;
  projectTitle?: string;
  leadId?: string;
  leadName?: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  paypalReferenceId?: string;
  paymentLink: string;
  receiptSent: boolean;
  receiptEmailId?: string;
  receiptSentAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PartnerAgency {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  specialization: string;
  defaultCommissionRate: number;
  totalReferredLeads: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  createdAt: string;
}


export interface AgencySettings {
  paypalHandle: string;
  defaultCurrency: string;
  n8nLeadWebhookUrl?: string;
  n8nPaymentWebhookUrl?: string;
  n8nOnboardingWebhookUrl?: string;
  geminiApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  companyName: string;
  agencyContactEmail: string;
  agencyMasterPasskey?: string;
}