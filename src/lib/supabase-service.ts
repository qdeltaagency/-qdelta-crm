import { supabase, isSupabaseConfigured } from './supabase';
import { Lead, Organization, Individual, Client, Project, Payment, LeadActivity, ActivityLog, LeadStatus, PaymentStatus, ProjectStatus } from './types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

// Map snake_case DB row to camelCase Lead
export function mapLeadRow(row: any): Lead {
  let priority: 'Hot' | 'Warm' | 'Cold' = 'Warm';
  const score = Number(row.lead_score || 80);
  if (score >= 90) priority = 'Hot';
  else if (score < 70) priority = 'Cold';

  return {
    id: row.id,
    leadType: (row.lead_type as 'Individual' | 'Organization') || (row.company && row.company !== row.name ? 'Organization' : 'Individual'),
    submissionType: row.submission_type || 'Manual CRM Entry',
    name: row.name,
    email: row.email,
    company: row.company || '',
    phone: row.phone || '',
    country: row.country || '',
    serviceType: row.service_type || 'Landing Page',
    budget: row.budget || '',
    timeline: row.timeline || '',
    details: row.details || '',
    source: row.source || 'Manual CRM Entry',
    status: (row.status as LeadStatus) || 'New Inquiry',
    assignedTo: row.assigned_to || undefined,
    paypalPaymentLink: row.paypal_payment_link,
    quoteAmount: Number(row.quote_amount || 0),
    currency: row.currency || 'USD',
    leadScore: score,
    priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map snake_case DB row to camelCase Organization
export function mapOrganizationRow(row: any): Organization {
  const name = row.name || row.organization_name || '';
  const contactPerson = row.contact_person || row.primary_contact_name || name;

  return {
    id: row.id,
    type: 'Organization',
    name,
    contactPerson,
    organizationName: name, // Compatibility alias
    primaryContactName: contactPerson, // Compatibility alias
    clientType: 'Organization', // Compatibility alias
    email: row.email || '',
    phone: row.phone || '',
    country: row.country || '',
    avatarUrl: row.avatar_url,
    leadId: row.lead_id,
    assignedLeadPartner: row.assigned_lead_partner,
    totalLtv: Number(row.total_ltv || 0),
    totalPaid: Number(row.total_paid || 0),
    onboardingStatus: row.onboarding_status || {
      brandAssets: false,
      credentials: false,
      kickoffBooked: false,
      slackInvited: false,
    },
    contractAgreement: row.contract_agreement,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map snake_case DB row to camelCase Individual
export function mapIndividualRow(row: any): Individual {
  const name = row.name || row.primary_contact_name || '';

  return {
    id: row.id,
    type: 'Individual',
    name,
    contactPerson: name,
    organizationName: name, // Compatibility alias
    primaryContactName: name, // Compatibility alias
    clientType: 'Individual', // Compatibility alias
    email: row.email || '',
    phone: row.phone || '',
    country: row.country || '',
    avatarUrl: row.avatar_url,
    leadId: row.lead_id,
    assignedLeadPartner: row.assigned_lead_partner,
    totalLtv: Number(row.total_ltv || 0),
    totalPaid: Number(row.total_paid || 0),
    onboardingStatus: row.onboarding_status || {
      brandAssets: false,
      credentials: false,
      kickoffBooked: false,
      slackInvited: false,
    },
    contractAgreement: row.contract_agreement,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const mapClientRow = (row: any): Client => {
  if (row.type === 'Individual' || (!row.contact_person && row.name)) {
    return mapIndividualRow(row);
  }
  return mapOrganizationRow(row);
};

// Map snake_case DB row to camelCase Project
export function mapProjectRow(row: any): Project {
  const orgId = row.organization_id || row.client_id;
  const indivId = row.individual_id;
  const resolvedClientId = orgId || indivId || '';
  const clientType = row.client_type || (indivId ? 'Individual' : 'Organization');

  return {
    id: row.id,
    clientType,
    organizationId: orgId || undefined,
    individualId: indivId || undefined,
    clientId: resolvedClientId, // Compatibility alias
    title: row.title,
    servicePillar: row.service_pillar,
    contractValue: Number(row.contract_value || 0),
    currency: row.currency || 'USD',
    status: row.status as ProjectStatus,
    progressPercent: Number(row.progress_percent || 0),
    startDate: row.start_date || '',
    targetLaunchDate: row.target_launch_date || '',
    githubRepoUrl: row.github_repo_url,
    figmaUrl: row.figma_url,
    stagingUrl: row.staging_url,
    milestones: row.milestones || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map snake_case DB row to camelCase Payment
export function mapPaymentRow(row: any): Payment {
  const orgId = row.organization_id || row.client_id;
  const indivId = row.individual_id;
  const resolvedClientId = orgId || indivId || undefined;
  const clientType = row.client_type || (indivId ? 'Individual' : 'Organization');

  return {
    id: row.id,
    clientType,
    organizationId: orgId || undefined,
    individualId: indivId || undefined,
    clientId: resolvedClientId, // Compatibility alias
    leadId: row.lead_id,
    projectId: row.project_id,
    amount: Number(row.amount || 0),
    currency: row.currency || 'USD',
    type: row.type,
    status: row.status as PaymentStatus,
    paypalReferenceId: row.paypal_reference_id,
    paymentLink: row.payment_link || '',
    receiptSent: Boolean(row.receipt_sent),
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

// Map snake_case DB row to camelCase ActivityLog
export function mapActivityLogRow(row: any): ActivityLog {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category || 'lead',
    actionType: row.action_type || 'general',
    leadId: row.lead_id || undefined,
    organizationId: row.organization_id || undefined,
    individualId: row.individual_id || undefined,
    projectId: row.project_id || undefined,
    partner: row.performed_by || row.partner || 'Nagireddy Sai Prabhath',
    performedBy: row.performed_by || row.partner || 'Nagireddy Sai Prabhath',
    timestamp: row.created_at,
    createdAt: row.created_at,
  };
}

// Backward compatibility alias
export const mapLeadActivityRow = mapActivityLogRow;


// ==============================================================================
// Live Supabase CRUD Operations
// ==============================================================================

export async function fetchLiveLeads(): Promise<Lead[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map(mapLeadRow);
}

export async function createLiveLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | null> {
  if (!supabase) return null;
  const payload = {
    lead_type: lead.leadType || (lead.company ? 'Organization' : 'Individual'),
    submission_type: lead.submissionType || 'Manual CRM Entry',
    name: lead.name,
    email: lead.email,
    company: lead.company || null,
    phone: lead.phone || null,
    country: lead.country || null,
    service_type: lead.serviceType,
    budget: lead.budget || null,
    timeline: lead.timeline || null,
    details: lead.details || null,
    source: lead.source || 'Manual CRM Entry',
    status: lead.status || 'New Inquiry',
    assigned_to: lead.assignedTo || 'Nagireddy Sai Prabhath',
    paypal_payment_link: lead.paypalPaymentLink || null,
    quote_amount: lead.quoteAmount || 0,
    currency: lead.currency || 'USD',
    lead_score: lead.leadScore || 80,
  };

  const { data, error } = await supabase.from('leads').insert(payload).select().single();
  if (error || !data) {
    console.error('Supabase createLiveLead error:', error?.message || error?.details || error);
    return null;
  }
  return mapLeadRow(data);
}

export async function updateLiveLead(id: string, updates: Partial<Lead>): Promise<boolean> {
  if (!supabase) return false;
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.leadType !== undefined) payload.lead_type = updates.leadType;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.company !== undefined) payload.company = updates.company;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.country !== undefined) payload.country = updates.country;
  if (updates.serviceType !== undefined) payload.service_type = updates.serviceType;
  if (updates.budget !== undefined) payload.budget = updates.budget;
  if (updates.timeline !== undefined) payload.timeline = updates.timeline;
  if (updates.details !== undefined) payload.details = updates.details;
  if (updates.quoteAmount !== undefined) payload.quote_amount = updates.quoteAmount;
  if (updates.paypalPaymentLink !== undefined) payload.paypal_payment_link = updates.paypalPaymentLink;
  if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
  if (updates.leadScore !== undefined) payload.lead_score = updates.leadScore;

  const { error } = await supabase.from('leads').update(payload).eq('id', id);
  return !error;
}

export async function deleteLiveLead(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leads').delete().eq('id', id);
  return !error;
}

// ------------------------------------------------------------------------------
// Organizations Table Operations
// ------------------------------------------------------------------------------

export async function fetchLiveOrganizations(): Promise<Organization[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map(mapOrganizationRow);
}

export async function createLiveOrganization(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization | null> {
  if (!supabase) return null;
  const payload: any = {
    name: org.name || org.organizationName,
    contact_person: org.contactPerson || org.primaryContactName || org.name || org.organizationName,
    email: org.email,
    phone: org.phone || null,
    country: org.country || null,
    avatar_url: org.avatarUrl || null,
    lead_id: isValidUUID(org.leadId) ? org.leadId : null,
    assigned_lead_partner: org.assignedLeadPartner || 'Nagireddy Sai Prabhath',
    total_ltv: org.totalLtv || 0,
    total_paid: org.totalPaid || 0,
    onboarding_status: org.onboardingStatus,
    contract_agreement: org.contractAgreement,
    notes: org.notes || null,
  };

  const { data, error } = await supabase.from('organizations').insert(payload).select().single();
  if (error || !data) {
    console.error('Supabase createLiveOrganization error:', error?.message || error?.details || error);
    return null;
  }
  return mapOrganizationRow(data);
}

export async function updateLiveOrganization(id: string, updates: Partial<Organization>): Promise<boolean> {
  if (!supabase) return false;
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.organizationName !== undefined) payload.name = updates.organizationName;
  if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson;
  if (updates.primaryContactName !== undefined) payload.contact_person = updates.primaryContactName;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.country !== undefined) payload.country = updates.country || null;
  if (updates.totalLtv !== undefined) payload.total_ltv = updates.totalLtv;
  if (updates.totalPaid !== undefined) payload.total_paid = updates.totalPaid;
  if (updates.onboardingStatus !== undefined) payload.onboarding_status = updates.onboardingStatus;
  if (updates.contractAgreement !== undefined) payload.contract_agreement = updates.contractAgreement;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase.from('organizations').update(payload).eq('id', id);
  return !error;
}

export async function deleteLiveOrganization(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  return !error;
}

// ------------------------------------------------------------------------------
// Individuals Table Operations
// ------------------------------------------------------------------------------

export async function fetchLiveIndividuals(): Promise<Individual[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('individuals').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map(mapIndividualRow);
}

export async function createLiveIndividual(indiv: Omit<Individual, 'id' | 'createdAt' | 'updatedAt'>): Promise<Individual | null> {
  if (!supabase) return null;
  const payload: any = {
    name: indiv.name || indiv.primaryContactName || indiv.organizationName,
    email: indiv.email,
    phone: indiv.phone || null,
    country: indiv.country || null,
    avatar_url: indiv.avatarUrl || null,
    lead_id: isValidUUID(indiv.leadId) ? indiv.leadId : null,
    assigned_lead_partner: indiv.assignedLeadPartner || 'Nagireddy Sai Prabhath',
    total_ltv: indiv.totalLtv || 0,
    total_paid: indiv.totalPaid || 0,
    onboarding_status: indiv.onboardingStatus,
    contract_agreement: indiv.contractAgreement,
    notes: indiv.notes || null,
  };

  const { data, error } = await supabase.from('individuals').insert(payload).select().single();
  if (error || !data) {
    console.error('Supabase createLiveIndividual error:', error?.message || error?.details || error);
    return null;
  }
  return mapIndividualRow(data);
}

export async function updateLiveIndividual(id: string, updates: Partial<Individual>): Promise<boolean> {
  if (!supabase) return false;
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.primaryContactName !== undefined) payload.name = updates.primaryContactName;
  if (updates.organizationName !== undefined) payload.name = updates.organizationName;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.country !== undefined) payload.country = updates.country || null;
  if (updates.totalLtv !== undefined) payload.total_ltv = updates.totalLtv;
  if (updates.totalPaid !== undefined) payload.total_paid = updates.totalPaid;
  if (updates.onboardingStatus !== undefined) payload.onboarding_status = updates.onboardingStatus;
  if (updates.contractAgreement !== undefined) payload.contract_agreement = updates.contractAgreement;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase.from('individuals').update(payload).eq('id', id);
  return !error;
}

export async function deleteLiveIndividual(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('individuals').delete().eq('id', id);
  return !error;
}

// ------------------------------------------------------------------------------
// Unified Clients Service (Merges Organizations & Individuals)
// ------------------------------------------------------------------------------

export async function fetchLiveClients(): Promise<Client[] | null> {
  if (!supabase) return null;
  const [orgsResult, indivsResult] = await Promise.all([
    supabase.from('organizations').select('*').order('created_at', { ascending: false }),
    supabase.from('individuals').select('*').order('created_at', { ascending: false }),
  ]);

  const orgs = (orgsResult.data || []).map(mapOrganizationRow);
  const indivs = (indivsResult.data || []).map(mapIndividualRow);

  const combined = [...orgs, ...indivs];
  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return combined;
}

export async function createLiveClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> {
  if (client.type === 'Individual' || client.clientType === 'Individual') {
    return createLiveIndividual(client as Omit<Individual, 'id' | 'createdAt' | 'updatedAt'>);
  }
  return createLiveOrganization(client as Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>);
}

export async function updateLiveClient(id: string, updates: Partial<Client>): Promise<boolean> {
  if (updates.type === 'Individual' || updates.clientType === 'Individual') {
    return updateLiveIndividual(id, updates as Partial<Individual>);
  }
  if (updates.type === 'Organization' || updates.clientType === 'Organization') {
    return updateLiveOrganization(id, updates as Partial<Organization>);
  }
  // Try organization first, then individual if not found
  const orgSuccess = await updateLiveOrganization(id, updates as Partial<Organization>);
  if (orgSuccess) return true;
  return updateLiveIndividual(id, updates as Partial<Individual>);
}

export async function deleteLiveClient(id: string, type?: 'Organization' | 'Individual'): Promise<boolean> {
  if (type === 'Individual') {
    return deleteLiveIndividual(id);
  }
  if (type === 'Organization') {
    return deleteLiveOrganization(id);
  }
  const orgSuccess = await deleteLiveOrganization(id);
  if (orgSuccess) return true;
  return deleteLiveIndividual(id);
}

// Helper to safely resolve whether a foreign key belongs to organizations or individuals table
async function resolveEntityIds(
  clientId?: string,
  organizationId?: string,
  individualId?: string,
  clientType?: 'Organization' | 'Individual'
): Promise<{ orgId: string | null; indivId: string | null; resolvedType: 'Organization' | 'Individual' }> {
  if (!supabase) return { orgId: null, indivId: null, resolvedType: clientType || 'Organization' };

  let targetOrgId: string | null = (organizationId && isValidUUID(organizationId)) ? organizationId : null;
  let targetIndivId: string | null = (individualId && isValidUUID(individualId)) ? individualId : null;
  let resolvedType: 'Organization' | 'Individual' = clientType || (targetIndivId ? 'Individual' : 'Organization');

  const rawId = clientId;
  if (!targetOrgId && !targetIndivId && rawId && isValidUUID(rawId)) {
    if (clientType === 'Individual') {
      targetIndivId = rawId;
      resolvedType = 'Individual';
    } else if (clientType === 'Organization') {
      targetOrgId = rawId;
      resolvedType = 'Organization';
    } else {
      // Intelligently check whether the UUID exists in organizations or individuals table
      const { data: orgMatch } = await supabase.from('organizations').select('id').eq('id', rawId).maybeSingle();
      if (orgMatch) {
        targetOrgId = orgMatch.id;
        resolvedType = 'Organization';
      } else {
        const { data: indivMatch } = await supabase.from('individuals').select('id').eq('id', rawId).maybeSingle();
        if (indivMatch) {
          targetIndivId = indivMatch.id;
          resolvedType = 'Individual';
        }
      }
    }
  }

  return {
    orgId: targetOrgId,
    indivId: targetIndivId,
    resolvedType,
  };
}

// ------------------------------------------------------------------------------
// Projects Table Operations
// ------------------------------------------------------------------------------

export async function fetchLiveProjects(): Promise<Project[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map(mapProjectRow);
}

export async function createLiveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
  if (!supabase) return null;
  const { orgId, indivId, resolvedType } = await resolveEntityIds(
    project.clientId,
    project.organizationId,
    project.individualId,
    project.clientType
  );

  const payload = {
    client_type: resolvedType,
    organization_id: orgId,
    individual_id: indivId,
    title: project.title,
    service_pillar: project.servicePillar,
    contract_value: project.contractValue,
    currency: project.currency || 'USD',
    status: project.status || 'Planning',
    progress_percent: project.progressPercent || 15,
    start_date: project.startDate || null,
    target_launch_date: project.targetLaunchDate || null,
    github_repo_url: project.githubRepoUrl || null,
    figma_url: project.figmaUrl || null,
    staging_url: project.stagingUrl || null,
    milestones: project.milestones || [],
  };

  const { data, error } = await supabase.from('projects').insert(payload).select().single();
  if (error || !data) {
    console.error('Supabase createLiveProject error:', error?.message || error?.details || error);
    return null;
  }
  return mapProjectRow(data);
}

export async function updateLiveProject(id: string, updates: Partial<Project>): Promise<boolean> {
  if (!supabase) return false;
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.progressPercent !== undefined) payload.progress_percent = updates.progressPercent;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.servicePillar !== undefined) payload.service_pillar = updates.servicePillar;
  if (updates.contractValue !== undefined) payload.contract_value = updates.contractValue;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.targetLaunchDate !== undefined) payload.target_launch_date = updates.targetLaunchDate;
  if (updates.startDate !== undefined) payload.start_date = updates.startDate;
  if (updates.githubRepoUrl !== undefined) payload.github_repo_url = updates.githubRepoUrl;
  if (updates.figmaUrl !== undefined) payload.figma_url = updates.figmaUrl;
  if (updates.stagingUrl !== undefined) payload.staging_url = updates.stagingUrl;
  if (updates.milestones !== undefined) payload.milestones = updates.milestones;

  const { error } = await supabase.from('projects').update(payload).eq('id', id);
  return !error;
}

export async function deleteLiveProject(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('projects').delete().eq('id', id);
  return !error;
}

// ------------------------------------------------------------------------------
// Payments Table Operations
// ------------------------------------------------------------------------------

export async function fetchLivePayments(): Promise<Payment[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map(mapPaymentRow);
}

export async function createLivePayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment | null> {
  if (!supabase) return null;
  const { orgId, indivId, resolvedType } = await resolveEntityIds(
    payment.clientId,
    payment.organizationId,
    payment.individualId,
    payment.clientType
  );

  const payload = {
    project_id: isValidUUID(payment.projectId) ? payment.projectId : null,
    client_type: resolvedType,
    organization_id: orgId,
    individual_id: indivId,
    lead_id: isValidUUID(payment.leadId) ? payment.leadId : null,
    amount: payment.amount,
    currency: payment.currency || 'USD',
    type: payment.type || 'Deposit (30%)',
    status: payment.status || 'Pending',
    paypal_reference_id: payment.paypalReferenceId || null,
    payment_link: payment.paymentLink || null,
    receipt_sent: payment.receiptSent || false,
    paid_at: payment.paidAt || null,
  };

  const { data, error } = await supabase.from('payments').insert(payload).select().single();
  if (error || !data) {
    console.error('Supabase createLivePayment error:', error?.message || error?.details || error);
    return null;
  }
  return mapPaymentRow(data);
}

export async function updateLivePayment(id: string, updates: Partial<Payment>): Promise<boolean> {
  if (!supabase) return false;
  const payload: any = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.paidAt !== undefined) payload.paid_at = updates.paidAt;
  if (updates.receiptSent !== undefined) payload.receipt_sent = updates.receiptSent;
  if (updates.paymentLink !== undefined) payload.payment_link = updates.paymentLink;

  const { error } = await supabase.from('payments').update(payload).eq('id', id);
  return !error;
}

export async function deleteLivePayment(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('payments').delete().eq('id', id);
  return !error;
}

export async function fetchLiveActivityLogs(filters?: {
  leadId?: string;
  organizationId?: string;
  individualId?: string;
  projectId?: string;
  limit?: number;
}): Promise<ActivityLog[] | null> {
  if (!supabase) return null;
  let query = supabase.from('activity_logs').select('*').order('created_at', { ascending: false });

  if (filters?.leadId && isValidUUID(filters.leadId)) {
    query = query.eq('lead_id', filters.leadId);
  }
  if (filters?.organizationId && isValidUUID(filters.organizationId)) {
    query = query.eq('organization_id', filters.organizationId);
  }
  if (filters?.individualId && isValidUUID(filters.individualId)) {
    query = query.eq('individual_id', filters.individualId);
  }
  if (filters?.projectId && isValidUUID(filters.projectId)) {
    query = query.eq('project_id', filters.projectId);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  } else if (!filters?.leadId && !filters?.organizationId && !filters?.individualId && !filters?.projectId) {
    query = query.limit(100);
  }

  const { data, error } = await query;
  if (error || !data) return null;
  return data.map(mapActivityLogRow);
}

export async function createLiveActivityLog(log: {
  title: string;
  description: string;
  category?: string;
  actionType?: string;
  leadId?: string;
  organizationId?: string;
  individualId?: string;
  projectId?: string;
  partner?: string;
  performedBy?: string;
}): Promise<ActivityLog | null> {
  if (!supabase) return null;
  const payload = {
    title: log.title,
    description: log.description,
    category: log.category || 'lead',
    action_type: log.actionType || 'general',
    lead_id: log.leadId && isValidUUID(log.leadId) ? log.leadId : null,
    organization_id: log.organizationId && isValidUUID(log.organizationId) ? log.organizationId : null,
    individual_id: log.individualId && isValidUUID(log.individualId) ? log.individualId : null,
    project_id: log.projectId && isValidUUID(log.projectId) ? log.projectId : null,
    performed_by: log.performedBy || log.partner || 'Nagireddy Sai Prabhath',
  };
  const { data, error } = await supabase.from('activity_logs').insert(payload).select().single();
  if (error || !data) {
    console.error('Failed to insert activity_log:', error);
    return null;
  }
  return mapActivityLogRow(data);
}

// Backward compatibility helpers
export async function fetchLiveLeadActivities(leadId?: string): Promise<ActivityLog[] | null> {
  return fetchLiveActivityLogs(leadId ? { leadId } : undefined);
}

export async function createLiveLeadActivity(activity: any): Promise<ActivityLog | null> {
  return createLiveActivityLog({
    title: activity.title,
    description: activity.description,
    category: 'lead',
    actionType: activity.actionType || 'note_added',
    leadId: activity.leadId,
    organizationId: activity.organizationId || activity.clientId,
    individualId: activity.individualId,
    performedBy: activity.performedBy || activity.partner,
  });
}

export async function deleteLiveLeadActivities(leadId: string): Promise<boolean> {
  if (!supabase || !isValidUUID(leadId)) return false;
  const { error } = await supabase.from('activity_logs').delete().eq('lead_id', leadId);
  return !error;
}

export async function fetchLivePartners(): Promise<any[] | null> {
  return [];
}

export async function createLivePartner(partner: any): Promise<any | null> {
  return null;
}

export async function updateLivePartner(id: string, updates: any): Promise<boolean> {
  return true;
}

export async function deleteLivePartner(id: string): Promise<boolean> {
  return true;
}

// ------------------------------------------------------------------------------
// Strict Realtime Multi-Table Subscriptions
// ------------------------------------------------------------------------------

export function subscribeToLiveCRM(callbacks: {
  onLeadsChange?: () => void;
  onOrganizationsChange?: () => void;
  onIndividualsChange?: () => void;
  onProjectsChange?: () => void;
  onPaymentsChange?: () => void;
  onActivityLogsChange?: () => void;
  onAnyChange?: () => void;
}): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('crm_realtime_stream')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
      callbacks.onLeadsChange?.();
      callbacks.onAnyChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
      callbacks.onOrganizationsChange?.();
      callbacks.onAnyChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'individuals' }, () => {
      callbacks.onIndividualsChange?.();
      callbacks.onAnyChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
      callbacks.onProjectsChange?.();
      callbacks.onAnyChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
      callbacks.onPaymentsChange?.();
      callbacks.onAnyChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
      callbacks.onActivityLogsChange?.();
      callbacks.onAnyChange?.();
    })
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}


