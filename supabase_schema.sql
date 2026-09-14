-- ==============================================================================
-- Qdelta CRM v1 — Supabase PostgreSQL Schema (100% Free Tier Compatible)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional migrations for existing installations:
ALTER TABLE leads ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'Individual';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country TEXT;

-- 2. Leads Table (Cleaned up: handling_mode & referral_commission are optional/deprecated)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_type TEXT DEFAULT 'Individual', -- 'Individual' or 'Organization'
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
  assigned_to TEXT DEFAULT 'Nagireddy Sai Prabhath', -- 'MD Qais', 'Nagireddy Sai Prabhath', 'MD Fazeel'
  handling_mode TEXT DEFAULT 'In-House',
  partner_agency_id UUID,
  referral_commission_rate NUMERIC DEFAULT 10,
  referral_commission_amount NUMERIC DEFAULT 0,
  paypal_payment_link TEXT,
  quote_amount NUMERIC DEFAULT 0, -- 1st Deposit (30% Upfront Kickoff)
  currency TEXT DEFAULT 'USD',
  lead_score INTEGER DEFAULT 80, -- Lead Quality Score (0-100 based on budget, priority, scope completeness)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  primary_contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'Growth Studio', -- 'VIP Flagship', 'Enterprise', 'Growth Studio', 'Monthly Retainer'
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  assigned_lead_partner TEXT DEFAULT 'Nagireddy Sai Prabhath',
  total_ltv NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  onboarding_status JSONB DEFAULT '{"brand_assets": false, "credentials": false, "kickoff_booked": false, "slack_invited": false}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
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

-- 5. Payments & Invoices Table (Supports 30% Kickoff, 35% Mid-Dev, 35% Final Launch)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
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

-- 6. Lead Activity Logs Table (Audit trail tracking full progress per lead / client)
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL DEFAULT 'note_added', -- 'created', 'status_changed', 'priority_changed', 'payment_link_generated', 'converted', 'note_added', 'assigned'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by TEXT DEFAULT 'Nagireddy Sai Prabhath',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Partner Agencies Table
CREATE TABLE IF NOT EXISTS partner_agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT NOT NULL,
  default_commission_rate NUMERIC DEFAULT 10,
  total_referred_leads INTEGER DEFAULT 0,
  total_commission_earned NUMERIC DEFAULT 0,
  total_commission_paid NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Indexes for High-Velocity Query Performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_clients_lead_id ON clients(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_lead_id ON payments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- Row Level Security (RLS) policies (Permits Studio Anon & Service Roles)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow studio full access" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON lead_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow studio full access" ON partner_agencies FOR ALL USING (true) WITH CHECK (true);

