-- ==============================================================================
-- Qdelta CRM v1 — Supabase PostgreSQL Schema (100% Free Tier Compatible)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Leads Table (Pre-Sale Prospect Pipeline)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_type TEXT DEFAULT 'Individual', -- 'Individual' or 'Organization'
  submission_type TEXT DEFAULT 'Manual CRM Entry', -- 'Website Form', 'Manual CRM Entry', 'Webhook / API'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  country TEXT,
  service_type TEXT NOT NULL DEFAULT 'Landing Page',
  budget TEXT,
  timeline TEXT,
  details TEXT,
  source TEXT DEFAULT 'LinkedIn Outreach',
  status TEXT NOT NULL DEFAULT 'New Inquiry', -- 'New Inquiry', 'Proposal Sent', 'In Discussion', 'Link Sent', 'Payment Received', 'Converted', 'Lost'
  priority TEXT DEFAULT 'Cold', -- 'Hot', 'Warm', 'Cold'
  assigned_to TEXT DEFAULT 'Nagireddy Sai Prabhath',
  paypal_payment_link TEXT,
  quote_amount NUMERIC DEFAULT 0, -- 1st Deposit (30% Upfront Kickoff)
  currency TEXT DEFAULT 'USD',
  lead_score INTEGER DEFAULT 80, -- Lead Quality Score (0-100 based on budget, priority, scope completeness)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Organizations Table (Company Accounts)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- Company Name (e.g. Apex Labs)
  contact_person TEXT NOT NULL, -- Primary Contact Person Name (e.g. Marcus Vance)
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  avatar_url TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  assigned_lead_partner TEXT DEFAULT 'Nagireddy Sai Prabhath',
  total_ltv NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  onboarding_status JSONB DEFAULT '{"brand_assets": false, "credentials": false, "kickoff_booked": false, "slack_invited": false}'::jsonb,
  contract_agreement JSONB DEFAULT '{"signed": false}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Individuals Table (Direct / Solo Founder Accounts)
CREATE TABLE IF NOT EXISTS individuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- Person Full Name (e.g. David Miller)
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  avatar_url TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  assigned_lead_partner TEXT DEFAULT 'Nagireddy Sai Prabhath',
  total_ltv NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  onboarding_status JSONB DEFAULT '{"brand_assets": false, "credentials": false, "kickoff_booked": false, "slack_invited": false}'::jsonb,
  contract_agreement JSONB DEFAULT '{"signed": false}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects Table (Production Deliverables)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_type TEXT NOT NULL DEFAULT 'Organization', -- 'Organization' or 'Individual'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  individual_id UUID REFERENCES individuals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  service_pillar TEXT NOT NULL DEFAULT 'Web Design & Full-Stack App',
  contract_value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'Planning', -- 'Planning', 'In Progress', 'Client Review', 'Final Settlement', 'Launched', 'Archived'
  progress_percent INTEGER DEFAULT 15,
  start_date DATE,
  target_launch_date DATE,
  github_repo_url TEXT,
  figma_url TEXT,
  staging_url TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payments Table (Invoices & Installments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_type TEXT NOT NULL DEFAULT 'Organization', -- 'Organization' or 'Individual'
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  individual_id UUID REFERENCES individuals(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT DEFAULT 'Deposit (30%)', -- 'Deposit (30%)', 'Milestone 2 (35%)', 'Final Launch (35%)', 'Monthly Retainer'
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Link Sent', 'Paid', 'Refunded'
  paypal_reference_id TEXT,
  payment_link TEXT,
  receipt_sent BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Unified Activity & Audit Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'lead', -- 'lead', 'organization', 'individual', 'project', 'payment', 'ai', 'system'
  action_type TEXT DEFAULT 'general', -- 'note_added', 'status_changed', 'converted', 'stage_advanced', 'payment_received', 'project_created'
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  individual_id UUID REFERENCES individuals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  performed_by TEXT DEFAULT 'Nagireddy Sai Prabhath',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_individuals_name ON individuals(name);
CREATE INDEX IF NOT EXISTS idx_individuals_created_at ON individuals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_indiv_id ON projects(individual_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_id ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_indiv_id ON payments(individual_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_lead_id ON activity_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_indiv_id ON activity_logs(individual_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 8. Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE individuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow studio full access" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON individuals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

