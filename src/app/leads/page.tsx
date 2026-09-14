'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  CreditCardIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  FireIcon,
  BoltIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  CheckIcon,
  UserIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  Globe,
  UserPlus,
  Users,
  Send,
  Layers,
  Building2,
  User,
  CheckCircle2,
  Check,
  ChevronDown,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Plus,
  ExternalLink,
  Copy,
  CreditCard,
  FileText,
  Activity,
} from 'lucide-react';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { CustomSelect } from '@/components/ui/custom-select';
import { Lead, LeadPriority, LeadStatus, HandlingMode, TeamMemberName } from '@/lib/types';

type LeadSource =
  | 'Landing Page Form'
  | 'Manual CRM Entry'
  | 'Agency Referral'
  | 'LinkedIn / Outreach';

interface OrgOption {
  organizationName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  isClient: boolean;
}

const COUNTRY_OPTIONS = [
  { value: 'United States', label: '🇺🇸 United States' },
  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'United Arab Emirates', label: '🇦🇪 United Arab Emirates' },
  { value: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia' },
  { value: 'Qatar', label: '🇶🇦 Qatar' },
  { value: 'Kuwait', label: '🇰🇼 Kuwait' },
  { value: 'Bahrain', label: '🇧🇭 Bahrain' },
  { value: 'Oman', label: '🇴🇲 Oman' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Malaysia', label: '🇲🇾 Malaysia' },
  { value: 'Indonesia', label: '🇮🇩 Indonesia' },
  { value: 'Philippines', label: '🇵🇭 Philippines' },
  { value: 'Thailand', label: '🇹🇭 Thailand' },
  { value: 'Vietnam', label: '🇻🇳 Vietnam' },
  { value: 'Japan', label: '🇯🇵 Japan' },
  { value: 'South Korea', label: '🇰🇷 South Korea' },
  { value: 'Hong Kong', label: '🇭🇰 Hong Kong' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands' },
  { value: 'Switzerland', label: '🇨🇭 Switzerland' },
  { value: 'Sweden', label: '🇸🇪 Sweden' },
  { value: 'Norway', label: '🇳🇴 Norway' },
  { value: 'Denmark', label: '🇩🇰 Denmark' },
  { value: 'Finland', label: '🇫🇮 Finland' },
  { value: 'Ireland', label: '🇮🇪 Ireland' },
  { value: 'Spain', label: '🇪🇸 Spain' },
  { value: 'Italy', label: '🇮🇹 Italy' },
  { value: 'Portugal', label: '🇵🇹 Portugal' },
  { value: 'Poland', label: '🇵🇱 Poland' },
  { value: 'Austria', label: '🇦🇹 Austria' },
  { value: 'Belgium', label: '🇧🇪 Belgium' },
  { value: 'Brazil', label: '🇧🇷 Brazil' },
  { value: 'Mexico', label: '🇲🇽 Mexico' },
  { value: 'Israel', label: '🇮🇱 Israel' },
  { value: 'New Zealand', label: '🇳🇿 New Zealand' },
  { value: 'South Africa', label: '🇿🇦 South Africa' },
  { value: 'Turkey', label: '🇹🇷 Turkey' },
  { value: 'Egypt', label: '🇪🇬 Egypt' },
  { value: 'Nigeria', label: '🇳🇬 Nigeria' },
  { value: 'Kenya', label: '🇰🇪 Kenya' },
  { value: 'Argentina', label: '🇦🇷 Argentina' },
  { value: 'Chile', label: '🇨🇱 Chile' },
  { value: 'Colombia', label: '🇨🇴 Colombia' },
  { value: 'Other / International', label: '🌐 Other / International' },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string; bg: string; border: string }
> = {
  'New Inquiry': {
    label: 'New Inquiry',
    color: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500 dark:bg-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/30',
  },
  'New': {
    label: 'New Inquiry',
    color: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500 dark:bg-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/30',
  },
  'Proposal Sent': {
    label: 'Proposal Sent',
    color: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  'Link Sent': {
    label: 'Proposal Sent',
    color: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  'In Discussion': {
    label: 'In Discussion',
    color: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500 dark:bg-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/30',
  },
  'Converted': {
    label: 'Converted to Client',
    color: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  'Lost': {
    label: 'Lost Deal',
    color: 'text-zinc-600 dark:text-zinc-400',
    dot: 'bg-zinc-400 dark:bg-zinc-400',
    bg: 'bg-zinc-100 dark:bg-zinc-800/80',
    border: 'border-zinc-200 dark:border-zinc-700/60',
  },
};

const DISPLAY_STATUSES: LeadStatus[] = [
  'New Inquiry',
  'Proposal Sent',
  'In Discussion',
  'Lost',
];

export default function LeadsPage() {
  const { toast } = useToast();
  const {
    leads,
    addLead,
    updateLeadStatus,
    updateLead,
    deleteLead,
    convertLeadToClient,
    addClient,
    partnerAgencies,
    clients,
    settings,
    leadActivities,
    addLeadActivity,
  } = useCRM();

  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const companyDropdownRef = React.useRef<HTMLDivElement>(null);
  const indivDropdownRef = React.useRef<HTMLDivElement>(null);

  // Active open leads (excluding already converted clients)
  const openLeads = useMemo(
    () => leads.filter((l) => l.status !== 'Converted'),
    [leads]
  );

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
      if (indivDropdownRef.current && !indivDropdownRef.current.contains(e.target as Node)) {
        setIsIndivDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Drawer review state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDrawerStatusOpen, setIsDrawerStatusOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [conversionStep, setConversionStep] = useState<1 | 2>(1);

  // Filter activities for currently selected lead in drawer
  const leadActivitiesForSelected = useMemo(() => {
    if (!selectedLead) return [];
    return leadActivities.filter((a) => a.leadId === selectedLead.id);
  }, [leadActivities, selectedLead]);

  // Edit and Delete states
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isIndivDropdownOpen, setIsIndivDropdownOpen] = useState(false);
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false);

  // Modal create state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    company?: string;
    country?: string;
    serviceType?: string;
    timeline?: string;
    customTimeline?: string;
    budget?: string;
    quoteAmount?: string;
    currency?: string;
    source?: string;
    customSource?: string;
  }>({});

  // Form Fields State
  const [formData, setFormData] = useState({
    leadType: 'Individual' as 'Individual' | 'Organization',
    name: '', // Lead Name (Mandatory)
    email: '', // Lead Email (Mandatory)
    company: '', // Company / Organization (Mandatory if Organization, optional if Individual)
    phone: '',
    country: '',
    serviceType: '', // Service Pillar (Mandatory)
    timeline: '', // Target Timeline (Mandatory)
    customTimeline: '',
    budget: '' as string | number, // Total Agreed Project Budget (Mandatory)
    deposit1: '' as string | number, // 1st Deposit (30% Upfront Kickoff)
    deposit2: '' as string | number, // 2nd Milestone (35% Mid-Dev)
    deposit3: '' as string | number, // 3rd Final (35% Launch)
    quoteAmount: '' as string | number, // 1st Deposit Quote
    currency: 'USD', // Currency (Mandatory)
    priority: 'Cold' as LeadPriority, // Defaults to Cold
    source: '', // Source / Platform (Mandatory for Individual, no default auto-select)
    customSource: '',
    assignedTo: '' as TeamMemberName,
    handlingMode: 'In-House' as HandlingMode,
    details: '',
  });

  // Autocomplete matching organizations from clients and existing leads
  interface OrgOption {
    organizationName: string;
    contactName?: string;
    email?: string;
    phone?: string;
    country?: string;
    isClient: boolean;
  }

  interface IndivOption {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    isClient: boolean;
  }

  const existingOrganizations = useMemo<OrgOption[]>(() => {
    const map = new Map<string, OrgOption>();
    (clients || []).forEach((c) => {
      const orgName = c.organizationName || (c.clientType === 'Organization' ? c.name : '');
      if (orgName) {
        map.set(orgName.toLowerCase(), {
          organizationName: orgName,
          contactName: c.primaryContactName || c.name,
          email: c.email,
          phone: c.phone,
          country: c.country,
          isClient: true,
        });
      }
    });
    (leads || []).forEach((l) => {
      if (l.company && !map.has(l.company.toLowerCase())) {
        map.set(l.company.toLowerCase(), {
          organizationName: l.company,
          contactName: l.name,
          email: l.email,
          phone: l.phone,
          country: l.country,
          isClient: false,
        });
      }
    });
    return Array.from(map.values());
  }, [clients, leads]);

  const matchingOrganizations = useMemo(() => {
    const q = formData.company.trim().toLowerCase();
    if (!q) return existingOrganizations.slice(0, 6);
    return existingOrganizations.filter((org) =>
      org.organizationName.toLowerCase().includes(q)
    );
  }, [existingOrganizations, formData.company]);

  // Autocomplete matching individuals from clients directory and previous leads
  const existingIndividuals = useMemo<IndivOption[]>(() => {
    const map = new Map<string, IndivOption>();
    (clients || []).forEach((c) => {
      if (c.clientType === 'Individual' && c.email) {
        map.set(c.email.toLowerCase(), {
          name: c.name || c.primaryContactName || c.organizationName,
          email: c.email,
          phone: c.phone,
          country: c.country,
          isClient: true,
        });
      }
    });
    (leads || []).forEach((l) => {
      if (l.leadType === 'Individual' && l.email && !map.has(l.email.toLowerCase())) {
        map.set(l.email.toLowerCase(), {
          name: l.name,
          email: l.email,
          phone: l.phone,
          country: l.country,
          isClient: false,
        });
      }
    });
    return Array.from(map.values());
  }, [clients, leads]);

  const matchingIndividuals = useMemo(() => {
    const qName = formData.name.trim().toLowerCase();
    const qEmail = formData.email.trim().toLowerCase();
    if (!qName && !qEmail) return existingIndividuals.slice(0, 6);
    return existingIndividuals.filter(
      (indiv) =>
        (qName && indiv.name.toLowerCase().includes(qName)) ||
        (qEmail && indiv.email.toLowerCase().includes(qEmail))
    );
  }, [existingIndividuals, formData.name, formData.email]);


  // Check if user has entered any data into the modal form
  const isFormDirty = () => {
    const b = String(formData.budget || '').trim();
    return Boolean(
      formData.name.trim() ||
      formData.email.trim() ||
      formData.company.trim() ||
      formData.phone.trim() ||
      (formData.country && formData.country.trim()) ||
      formData.serviceType.trim() ||
      formData.timeline.trim() ||
      formData.customTimeline.trim() ||
      formData.source.trim() ||
      b ||
      (formData.quoteAmount !== '' && Number(formData.quoteAmount) > 0) ||
      formData.details.trim() ||
      formData.assignedTo.trim()
    );
  };

  // Intercept browser back button when modal is open with unsaved changes
  useEffect(() => {
    if (!isAddModalOpen) return;

    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      if (isFormDirty()) {
        window.history.pushState({ modalOpen: true }, '');
        setIsConfirmDiscardOpen(true);
      } else {
        handleForceCloseModal();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAddModalOpen, formData]);

  const handleRequestClose = () => {
    if (isFormDirty()) {
      setIsConfirmDiscardOpen(true);
    } else {
      handleForceCloseModal();
    }
  };

  const handleForceCloseModal = () => {
    setIsConfirmDiscardOpen(false);
    setIsAddModalOpen(false);
    setEditingLeadId(null);
    setFormStep(1);
    setFormErrors({});
    setFormData({
      leadType: 'Individual',
      name: '',
      email: '',
      company: '',
      phone: '',
      country: '',
      serviceType: '',
      timeline: '',
      customTimeline: '',
      budget: '',
      deposit1: '',
      deposit2: '',
      deposit3: '',
      quoteAmount: '',
      currency: 'USD',
      priority: 'Cold',
      source: '',
      customSource: '',
      assignedTo: '',
      handlingMode: 'In-House',
      details: '',
    });
  };

  const handleOpenAddModal = () => {
    setEditingLeadId(null);
    setFormStep(1);
    setFormErrors({});
    setFormData({
      leadType: 'Individual',
      name: '',
      email: '',
      company: '',
      phone: '',
      country: '',
      serviceType: '',
      timeline: '',
      customTimeline: '',
      budget: '',
      deposit1: '',
      deposit2: '',
      deposit3: '',
      quoteAmount: '',
      currency: 'USD',
      priority: 'Cold',
      source: '',
      customSource: '',
      assignedTo: '',
      handlingMode: 'In-House',
      details: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setFormStep(1);
    setFormErrors({});
    const b = lead.budget ? String(lead.budget).replace(/[^0-9.]/g, '') : '';
    const budgetNum = Number(b) || (lead.quoteAmount ? Math.round(lead.quoteAmount / 0.3) : 0);
    const d1 = lead.quoteAmount || (budgetNum ? Math.round(budgetNum * 0.3) : '');
    const d2 = budgetNum ? Math.round(budgetNum * 0.35) : '';
    const d3 = budgetNum ? budgetNum - (typeof d1 === 'number' ? d1 : 0) - (typeof d2 === 'number' ? d2 : 0) : '';

    setFormData({
      leadType: lead.leadType || (lead.company && lead.company !== lead.name ? 'Organization' : 'Individual'),
      name: lead.name || '',
      email: lead.email || '',
      company: lead.company || '',
      phone: lead.phone || '',
      country: lead.country || '',
      serviceType: lead.serviceType || '',
      timeline: lead.timeline || '',
      customTimeline: '',
      budget: budgetNum || lead.budget || '',
      deposit1: d1,
      deposit2: d2,
      deposit3: d3,
      quoteAmount: lead.quoteAmount || d1 || '',
      currency: 'USD',
      priority: lead.priority || 'Cold',
      source: lead.source || '',
      customSource: '',
      assignedTo: (lead.assignedTo as TeamMemberName) || '',
      handlingMode: 'In-House',
      details: lead.details || '',
    });
    setIsAddModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    deleteLead(leadToDelete.id);
    if (selectedLead?.id === leadToDelete.id) {
      setSelectedLead(null);
      setIsPanelOpen(false);
    }
    setLeadToDelete(null);
    toast({
      type: 'success',
      title: 'Lead Deleted',
      description: `${leadToDelete.name} has been permanently deleted from pipeline.`,
    });
  };

  const filteredLeads = useMemo(() => {
    return openLeads.filter((lead) => {
      const src = lead.source || '';
      const matchesSource =
        sourceFilter === 'All' ||
        (sourceFilter === 'LinkedIn' && (src.includes('LinkedIn') || src === 'LinkedIn Outreach')) ||
        (sourceFilter === 'Twitter (X)' && (src.includes('Twitter') || src.includes('X'))) ||
        (sourceFilter === 'Instagram' && src.includes('Instagram')) ||
        (sourceFilter === 'Upwork' && src.includes('Upwork')) ||
        (sourceFilter === 'Website Form' && (src.includes('Landing') || src.includes('Website'))) ||
        (sourceFilter === 'Organizations' && (lead.leadType === 'Organization' || src.includes('Organization')));

      const matchesPriority = priorityFilter === 'All' || (lead.priority || 'Warm') === priorityFilter;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(q) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.serviceType && lead.serviceType.toLowerCase().includes(q)) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.referringPartner && lead.referringPartner.toLowerCase().includes(q));

      return matchesSource && matchesPriority && matchesSearch;
    });
  }, [openLeads, sourceFilter, priorityFilter, searchQuery]);

  const handleReviewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setIsDrawerStatusOpen(false);
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!selectedLead) return;

    if (newStatus === 'Converted') {
      setLeadToConvert(selectedLead);
      setConversionStep(1);
      return;
    }

    updateLeadStatus(selectedLead.id, newStatus);
    setSelectedLead({ ...selectedLead, status: newStatus });
    toast({
      type: 'info',
      title: 'Status Updated',
      description: `${selectedLead.name} moved to "${newStatus}".`,
    });
  };

  const handlePriorityChange = (newPriority: LeadPriority) => {
    if (!selectedLead) return;
    const prevPriority = selectedLead.priority || 'Cold';
    if (prevPriority === newPriority) return;

    let newScore = 60;
    if (newPriority === 'Hot') newScore = 95;
    else if (newPriority === 'Warm') newScore = 80;

    updateLead(selectedLead.id, { priority: newPriority, leadScore: newScore });
    setSelectedLead({ ...selectedLead, priority: newPriority, leadScore: newScore });
    addLeadActivity({
      leadId: selectedLead.id,
      actionType: 'priority_changed',
      title: 'Deal Priority Updated',
      description: `Deal priority changed from ${prevPriority} to "${newPriority} Deal".`,
      performedBy: selectedLead.assignedTo || 'Nagireddy Sai Prabhath',
    });
    toast({
      type: 'success',
      title: 'Deal Priority Updated',
      description: `Priority updated to ${newPriority} Deal.`,
    });
  };

  const handleCopyPayPalLink = () => {
    if (!selectedLead) return;
    const link =
      selectedLead.paypalPaymentLink ||
      `https://paypal.me/${settings.paypalHandle || 'qdeltastudio'}/${selectedLead.quoteAmount || 0}${selectedLead.currency || 'USD'}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setIsCopied(true);
    toast({
      type: 'success',
      title: 'PayPal Link Copied',
      description: `Copied deposit link for ${selectedLead.name}.`,
    });
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Step 1: Validate and Transition to Financials & Routing (Step 2)
  const handleNextStep = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const errors: typeof formErrors = {};
    if (!formData.name.trim()) errors.name = 'Lead name is required';
    if (!formData.email.trim()) errors.email = 'Valid lead email is required';
    else if (!formData.email.includes('@')) errors.email = 'Invalid email format';

    if (formData.leadType === 'Organization' && !formData.company.trim()) {
      errors.company = 'Organization / Company name is required';
    }

    if (!formData.country.trim()) errors.country = 'Country / Region is required';
    if (!formData.serviceType.trim()) errors.serviceType = 'Please select a service pillar';
    if (!formData.timeline.trim()) {
      errors.timeline = 'Please select a target timeline';
    } else if (formData.timeline === 'Custom' && !formData.customTimeline.trim()) {
      errors.customTimeline = 'Please enter your custom timeline';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        type: 'error',
        title: 'Required Fields Missing',
        description: 'Please complete all required fields marked with * to proceed.',
      });
      return;
    }

    setFormErrors({});
    setFormStep(2);
  };

  // Step 2: Final Lead Submission to Supabase
  const handleSaveLead = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (formStep !== 2) {
      handleNextStep(e);
      return;
    }

    const errors: typeof formErrors = {};
    if (!formData.name.trim()) errors.name = 'Lead name is required';
    if (!formData.email.trim()) errors.email = 'Valid lead email is required';
    if (formData.leadType === 'Organization' && !formData.company.trim()) {
      errors.company = 'Organization / Company name is required';
    }
    if (!formData.country.trim()) errors.country = 'Country / Region is required';
    if (!formData.serviceType.trim()) errors.serviceType = 'Please select a service pillar';
    if (!formData.timeline.trim()) {
      errors.timeline = 'Please select a target timeline';
    } else if (formData.timeline === 'Custom' && !formData.customTimeline.trim()) {
      errors.customTimeline = 'Please enter your custom timeline';
    }

    if (errors.name || errors.email || errors.company || errors.country || errors.serviceType || errors.timeline || errors.customTimeline) {
      setFormStep(1);
      setFormErrors(errors);
      toast({
        type: 'error',
        title: 'Missing Required Fields',
        description: 'Please complete all mandatory fields marked with * in Contact & Scope.',
      });
      return;
    }

    const budgetVal = String(formData.budget || '').trim();
    if (!budgetVal || Number(budgetVal) <= 0) {
      errors.budget = 'Agreed project budget is required';
    }

    if (!formData.currency.trim()) {
      errors.currency = 'Currency selection is required';
    }

    if (formData.leadType === 'Individual') {
      if (!formData.source.trim()) {
        errors.source = 'Lead source / channel is required';
      } else if (formData.source === 'Other / Custom' && !formData.customSource.trim()) {
        errors.customSource = 'Please specify custom lead source';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        type: 'error',
        title: 'Mandatory Financials Missing',
        description: 'Please fill in Total Agreed Project Budget and required fields.',
      });
      return;
    }

    const effectiveCompany =
      formData.leadType === 'Organization'
        ? formData.company.trim()
        : formData.company.trim() || formData.name.trim();

    const effectiveSource =
      formData.leadType === 'Organization'
        ? (formData.company ? `Organization Direct (${formData.company.trim()})` : 'Client Hub Organization')
        : (formData.source === 'Other / Custom' && formData.customSource.trim()
            ? formData.customSource.trim()
            : formData.source || 'Manual CRM Entry');

    const effectiveTimeline =
      formData.timeline === 'Custom' && formData.customTimeline.trim()
        ? formData.customTimeline.trim()
        : formData.timeline;

    const totalBudgetNum = Number(formData.budget) || 0;
    const depositQuote = Number(formData.deposit1) || Math.round(totalBudgetNum * 0.30) || Number(formData.quoteAmount) || 0;
    const formattedBudget = `$${totalBudgetNum.toLocaleString()} ${formData.currency || 'USD'}`;

    const autoPaypalLink = depositQuote > 0
      ? `https://paypal.me/${settings.paypalHandle || 'qdeltastudio'}/${depositQuote}${formData.currency || 'USD'}`
      : `https://paypal.me/${settings.paypalHandle || 'qdeltastudio'}`;

    let leadScore = 60;
    if (formData.priority === 'Hot') leadScore = 95;
    else if (formData.priority === 'Warm') leadScore = 80;

    if (editingLeadId) {
      updateLead(editingLeadId, {
        leadType: formData.leadType,
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: effectiveCompany,
        phone: formData.phone.trim() || undefined,
        country: formData.country.trim() || undefined,
        serviceType: formData.serviceType,
        timeline: effectiveTimeline,
        budget: formattedBudget,
        quoteAmount: depositQuote,
        currency: formData.currency || 'USD',
        priority: formData.priority,
        source: effectiveSource,
        paypalPaymentLink: autoPaypalLink,
        assignedTo: formData.assignedTo || undefined,
        details: formData.details.trim(),
        leadScore,
      });

      toast({
        type: 'success',
        title: 'Lead Updated in Supabase',
        description: `${formData.name} details updated successfully.`,
      });
      handleForceCloseModal();
      return;
    }

    const created = addLead({
      leadType: formData.leadType,
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: effectiveCompany,
      phone: formData.phone.trim() || undefined,
      country: formData.country.trim() || undefined,
      serviceType: formData.serviceType,
      timeline: effectiveTimeline,
      budget: formattedBudget,
      quoteAmount: depositQuote,
      currency: formData.currency || 'USD',
      priority: formData.priority,
      source: effectiveSource,
      status: 'New Inquiry',
      paypalPaymentLink: autoPaypalLink,
      assignedTo: formData.assignedTo || undefined,
      details: formData.details.trim(),
      leadScore,
    });

    // Auto-create organization in directory if new
    if (formData.leadType === 'Organization' && formData.company.trim()) {
      const orgNameClean = formData.company.trim().toLowerCase();
      const orgAlreadyExists = clients.some(
        (c) => (c.organizationName || c.name || '').toLowerCase() === orgNameClean
      );
      if (!orgAlreadyExists) {
        addClient({
          type: 'Organization',
          name: formData.company.trim(),
          contactPerson: formData.name.trim(),
          organizationName: formData.company.trim(),
          primaryContactName: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          country: formData.country.trim() || undefined,
          clientType: 'Organization',
          assignedLeadPartner: formData.assignedTo || 'Nagireddy Sai Prabhath',
          totalLtv: 0,
          totalPaid: 0,
          onboardingStatus: {
            brandAssets: false,
            credentials: false,
            kickoffBooked: false,
            slackInvited: false,
          },
        });
      }
    }

    handleForceCloseModal();

    toast({
      type: 'success',
      title: 'Lead Saved to Supabase',
      description: `${created.name} (${created.company || created.source}) logged successfully.`,
    });
  };

  const renderSourceBadge = (source: string) => {
    if (source.includes('LinkedIn')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
          <Send className="h-3 w-3 shrink-0" />
          <span>LinkedIn</span>
        </span>
      );
    }
    if (source.includes('Twitter') || source.includes('X')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
          <span className="font-bold text-[10px]">𝕏</span>
          <span>Twitter</span>
        </span>
      );
    }
    if (source.includes('Instagram')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20">
          <span className="text-[10px]">📷</span>
          <span>Instagram</span>
        </span>
      );
    }
    if (source.includes('Upwork')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          <span className="font-bold text-[10px]">Up</span>
          <span>Upwork</span>
        </span>
      );
    }
    if (source.includes('Landing') || source.includes('Website')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
          <Globe className="h-3 w-3 shrink-0" />
          <span>Website Form</span>
        </span>
      );
    }
    if (source.includes('Organization')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
          <Building2 className="h-3 w-3 shrink-0" />
          <span>Organization</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
        <span>{source}</span>
      </span>
    );
  };

  const renderQualityScoreBadge = (lead: Lead) => {
    const priority = lead.priority || (lead.leadScore && lead.leadScore >= 90 ? 'Hot' : lead.leadScore && lead.leadScore >= 70 ? 'Warm' : 'Cold');
    if (priority === 'Hot') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
          <FireIcon className="h-3 w-3 text-rose-500 shrink-0" />
          <span>Hot Deal</span>
        </span>
      );
    }
    if (priority === 'Warm') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
          <BoltIcon className="h-3 w-3 text-amber-500 shrink-0" />
          <span>Warm Deal</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-lg whitespace-nowrap">
        <span className="text-[10px]">❄️</span>
        <span>Cold Lead</span>
      </span>
    );
  };

  const renderPriorityBadge = (priority?: LeadPriority) => {
    switch (priority) {
      case 'Hot':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-1.5 py-0.5 rounded">
            <FireIcon className="h-2.5 w-2.5" />
            <span>Hot</span>
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.5 rounded">
            <BoltIcon className="h-2.5 w-2.5" />
            <span>Warm</span>
          </span>
        );
      case 'Cold':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
            <span>Cold</span>
          </span>
        );
    }
  };

  // Metric calculations on active leads
  const totalPotentialRevenue = useMemo(() => {
    return openLeads.reduce((sum, l) => {
      const budgetNum = l.budget ? Number(String(l.budget).replace(/[^0-9.]/g, '')) : 0;
      const quoteNum = l.quoteAmount ? l.quoteAmount * 2 : 0;
      return sum + (quoteNum || budgetNum || 5000);
    }, 0);
  }, [openLeads]);

  const potentialDeposit = Math.round(totalPotentialRevenue * 0.30);
  const potentialLaunch = totalPotentialRevenue - potentialDeposit;

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Clean Title */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight">
            Leads Pipeline
          </h1>
        </div>

        {/* Right Side: Search & Add Lead Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <MagnifyingGlassIcon className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, companies..."
              className="w-48 sm:w-60 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* 4-Card Lead Pipeline Financial & Volume Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Active Leads */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
            Total Active Leads
          </p>
          <p className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight font-mono">
            {openLeads.length} {openLeads.length === 1 ? 'Lead' : 'Leads'}
          </p>
        </div>

        {/* Card 2: Total Potential Pipeline */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
            Total Potential Pipeline
          </p>
          <p className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight font-mono truncate">
            ${totalPotentialRevenue.toLocaleString('en-US')} USD
          </p>
        </div>

        {/* Card 3: Expected 1st Inst. (30% Upfront Kickoff) */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium uppercase tracking-wider truncate">
            Expected 1st Inst. (30%)
          </p>
          <p className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight font-mono truncate">
            ${potentialDeposit.toLocaleString('en-US')} USD
          </p>
        </div>

        {/* Card 4: Expected Milestones & Launch (70%) */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium uppercase tracking-wider truncate">
            Milestones & Launch (70%)
          </p>
          <p className="text-lg md:text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 tracking-tight font-mono truncate">
            ${potentialLaunch.toLocaleString('en-US')} USD
          </p>
        </div>
      </div>

      {/* Modern Filter Toolbar: Source Tabs & Intent Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-200 dark:border-zinc-800/60 pb-2.5 pt-1 text-xs">
        {/* Source Filter Tabs with Clean Lucide Icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* 1. All Sources */}
          <button
            onClick={() => setSourceFilter('All')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              sourceFilter === 'All'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span>All Sources{sourceFilter === 'All' ? ` (${openLeads.length})` : ''}</span>
          </button>

          {/* 2. LinkedIn */}
          <button
            onClick={() => setSourceFilter('LinkedIn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              sourceFilter === 'LinkedIn'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Send className="h-3.5 w-3.5 shrink-0 text-sky-500 dark:text-sky-400" />
            <span>
              LinkedIn
              {sourceFilter === 'LinkedIn'
                ? ` (${openLeads.filter((l) => (l.source || '').includes('LinkedIn')).length})`
                : ''}
            </span>
          </button>

          {/* 3. Twitter (X) */}
          <button
            onClick={() => setSourceFilter('Twitter (X)')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              sourceFilter === 'Twitter (X)'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <span className="font-bold text-[10px]">𝕏</span>
            <span>
              Twitter
              {sourceFilter === 'Twitter (X)'
                ? ` (${openLeads.filter((l) => (l.source || '').includes('Twitter') || (l.source || '').includes('X')).length})`
                : ''}
            </span>
          </button>

          {/* 4. Instagram */}
          <button
            onClick={() => setSourceFilter('Instagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              sourceFilter === 'Instagram'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <span className="text-[10px]">📷</span>
            <span>
              Instagram
              {sourceFilter === 'Instagram'
                ? ` (${openLeads.filter((l) => (l.source || '').includes('Instagram')).length})`
                : ''}
            </span>
          </button>

          {/* 5. Upwork */}
          <button
            onClick={() => setSourceFilter('Upwork')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              sourceFilter === 'Upwork'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <span className="font-bold text-[10px] text-emerald-500">Up</span>
            <span>
              Upwork
              {sourceFilter === 'Upwork'
                ? ` (${openLeads.filter((l) => (l.source || '').includes('Upwork')).length})`
                : ''}
            </span>
          </button>

          {/* 6. Website Form */}
          <button
            onClick={() => setSourceFilter('Website Form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              sourceFilter === 'Website Form'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Globe className="h-3.5 w-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
            <span>
              Website Form
              {sourceFilter === 'Website Form'
                ? ` (${openLeads.filter((l) => (l.source || '').includes('Landing') || (l.source || '').includes('Website')).length})`
                : ''}
            </span>
          </button>

          {/* 7. Organizations */}
          <button
            onClick={() => setSourceFilter('Organizations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-xs border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              sourceFilter === 'Organizations'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 shrink-0 text-purple-500 dark:text-purple-400" />
            <span>
              Organizations
              {sourceFilter === 'Organizations'
                ? ` (${openLeads.filter((l) => l.leadType === 'Organization' || (l.source || '').includes('Organization')).length})`
                : ''}
            </span>
          </button>
        </div>

        {/* Priority / Intent Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-zinc-500 font-medium">Intent:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 cursor-pointer"
          >
            <option value="All">All Intent</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">⚡ Warm</option>
            <option value="Cold">❄️ Cold</option>
          </select>
        </div>
      </div>

      {/* Table / Empty State Container */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 px-4 py-2.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold grid grid-cols-12 items-center">
          <div className="col-span-3">Lead & Organization</div>
          <div className="col-span-2">Source / Channel</div>
          <div className="col-span-2">Scope & Timeline</div>
          <div className="col-span-2">Budget & 30% Dep</div>
          <div className="col-span-1">Quality</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
          {filteredLeads.map((lead) => {
            const statusStyle = STATUS_CONFIG[lead.status] || STATUS_CONFIG['New Inquiry'];

            return (
              <div
                key={lead.id}
                className="px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors grid grid-cols-12 items-center text-xs gap-1"
              >
                {/* 1. Lead & Organization */}
                <div className="col-span-3 pr-2 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-zinc-900 dark:text-zinc-200 font-semibold text-xs md:text-sm truncate">{lead.name}</p>
                    {lead.createdAt && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        • {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 truncate flex items-center gap-1.5">
                    {lead.company ? (
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{lead.company}</span>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">{lead.email}</span>
                    )}
                    {lead.submissionType && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                        {lead.submissionType === 'Website Form' ? '🌐 Web' : '✏️ Manual'}
                      </span>
                    )}
                  </p>
                </div>

                {/* 2. Source Badge */}
                <div className="col-span-2 pr-2">
                  {renderSourceBadge(lead.source)}
                  {lead.referringPartner && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-1 truncate">
                      via {lead.referringPartner}
                    </p>
                  )}
                </div>

                {/* 3. Scope & Timeline */}
                <div className="col-span-2 pr-2 min-w-0">
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium text-xs truncate">{lead.serviceType}</p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-[11px] truncate mt-0.5">
                    {lead.timeline || 'Standard'}
                  </p>
                </div>

                {/* 4. Budget & Quote */}
                <div className="col-span-2 pr-2">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">{lead.budget || '—'}</p>
                  {lead.quoteAmount ? (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      30%: <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono">${lead.quoteAmount.toLocaleString()} {lead.currency}</span>
                    </p>
                  ) : null}
                </div>

                {/* 5. Quality Score */}
                <div className="col-span-1">
                  {renderQualityScoreBadge(lead)}
                </div>

                {/* 6. Status Badge */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                {/* 7. Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleReviewLead(lead)}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditLead(lead)}
                    className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    title="Edit Lead"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No active leads in the pipeline</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Add New Lead</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REVIEW & CONVERSION SLIDE-OVER DRAWER */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" 
            onClick={handleClosePanel} 
          />
          <aside className="relative w-full max-w-md bg-white dark:bg-[#111112] border-l border-zinc-200 dark:border-zinc-800 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-out transform translate-x-0 animate-in slide-in-from-right-full z-10 text-xs">
            <div>
              {/* Top Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{selectedLead?.name}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{selectedLead?.company || selectedLead?.email}</p>
                  {selectedLead?.createdAt && (
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-400 font-mono">
                      <span>Received: {new Date(selectedLead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedLead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {selectedLead.submissionType || 'Manual CRM Entry'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedLead) {
                        setLeadToDelete(selectedLead);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Lead"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClosePanel}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lead Details */}
              <div className="space-y-4">
                {/* Contact Card */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400">Company / Organization</span>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                        {selectedLead?.company || 'Direct Client'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400">Lead Email</span>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 mt-0.5 truncate">{selectedLead?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400">Phone / WhatsApp</span>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 mt-0.5">{selectedLead?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400">Country / Region</span>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 mt-0.5">{selectedLead?.country || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">Lead Type</span>
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 mt-0.5">
                      {selectedLead?.leadType || (selectedLead?.company && selectedLead?.company !== selectedLead?.name ? 'Organization' : 'Individual')}
                    </p>
                  </div>
                </div>

                {/* Scope & Brief */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Service Pillar</span>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedLead?.serviceType || 'Web & App Development'}</p>
                    </div>
                    {selectedLead?.timeline && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{selectedLead.timeline}</span>
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Project Brief & Requirements</span>
                    <div className="mt-1.5 p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {selectedLead?.details ? (
                        <p className="whitespace-pre-wrap">{selectedLead.details}</p>
                      ) : (
                        <p className="text-zinc-400 italic">No additional project brief provided.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financials & Status */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">Agreed Project Budget</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">{selectedLead?.budget}</p>
                    <p className="text-[10px] text-zinc-500">1st Deposit (30%): ${selectedLead?.quoteAmount?.toLocaleString()} {selectedLead?.currency || 'USD'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">Pipeline Status</span>
                    <div className="mt-1 relative">
                      <select
                        value={selectedLead?.status || 'New Inquiry'}
                        onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 pr-7 text-xs font-semibold text-zinc-900 dark:text-zinc-100 shadow-2xs focus:outline-none focus:ring-2 focus:ring-zinc-400/20 cursor-pointer appearance-none"
                      >
                        {DISPLAY_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Deal Priority & Quality Dropdown (Modern, Clean, No Numbers) */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Deal Priority & Quality</span>
                    </span>
                    <span className="text-xs font-semibold">
                      {selectedLead?.priority === 'Hot' ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                          <FireIcon className="h-3 w-3" />
                          <span>Hot Deal</span>
                        </span>
                      ) : selectedLead?.priority === 'Warm' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                          <BoltIcon className="h-3 w-3" />
                          <span>Warm Deal</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500 font-semibold text-[11px]">
                          <span>❄️ Cold Lead</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedLead?.priority || (selectedLead?.leadScore && selectedLead.leadScore >= 90 ? 'Hot' : selectedLead?.leadScore && selectedLead.leadScore >= 70 ? 'Warm' : 'Cold')}
                      onChange={(e) => handlePriorityChange(e.target.value as LeadPriority)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-zinc-900 dark:text-zinc-100 shadow-2xs focus:outline-none focus:ring-2 focus:ring-zinc-400/20 cursor-pointer appearance-none"
                    >
                      <option value="Hot">🔥 Hot Deal</option>
                      <option value="Warm">⚡ Warm Deal</option>
                      <option value="Cold">❄️ Cold Lead</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Live PayPal Payment Link Card */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                      <span>PayPal Deposit Link (30% Kickoff)</span>
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      ${selectedLead?.quoteAmount?.toLocaleString()} {selectedLead?.currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedLead?.paypalPaymentLink || `https://paypal.me/${settings.paypalHandle || 'qdeltastudio'}/${selectedLead?.quoteAmount || 0}${selectedLead?.currency || 'USD'}`}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 truncate focus:outline-none select-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPayPalLink}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs ${
                        isCopied
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white scale-[1.02]'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
                      }`}
                      title="Copy PayPal Link"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-white animate-in zoom-in-50 duration-200" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Automated Activity History & Audit Trail (Non-editable, with Date and Time) */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Activity History & Audit Trail</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {leadActivitiesForSelected.length} {leadActivitiesForSelected.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {leadActivitiesForSelected.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-3 text-center italic">No activity logs recorded yet.</p>
                    ) : (
                      leadActivitiesForSelected.map((act) => {
                        const dateObj = new Date(act.createdAt || act.timestamp || Date.now());
                        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                        return (
                          <div key={act.id} className="flex items-start gap-2.5 text-xs border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 py-0.5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate text-[11px]">{act.title}</p>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
                                  {dateStr} • {timeStr}
                                </span>
                              </div>
                              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed mt-0.5">{act.description}</p>
                              {act.performedBy && (
                                <p className="text-[9px] text-zinc-400 mt-1">
                                  Logged by {act.performedBy}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Conversion Action */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4">
              <button
                type="button"
                onClick={() => {
                  if (selectedLead) {
                    setLeadToConvert(selectedLead);
                    setConversionStep(1);
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 text-xs shadow-xs hover:shadow-md active:scale-[0.99]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Convert Lead to Active Client</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ULTRA-MODERN, CLEAN ADD LEAD MODAL WITH INDIVIDUAL VS ORGANIZATION SELECTOR */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleRequestClose}
        title={editingLeadId ? 'Edit Lead' : 'Add New Lead'}
        maxWidth="2xl"
      >
        {/* Step Stepper */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl">
          <button
            type="button"
            onClick={() => setFormStep(1)}
            className={`py-2 px-3.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-start gap-2.5 text-left ${
              formStep === 1
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-300/80 dark:border-zinc-700/60 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                formStep === 1
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              1
            </div>
            <span className="font-semibold text-xs leading-tight truncate">Lead Details</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleNextStep(e)}
            className={`py-2 px-3.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-start gap-2.5 text-left ${
              formStep === 2
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-300/80 dark:border-zinc-700/60 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                formStep === 2
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              2
            </div>
            <span className="font-semibold text-xs leading-tight truncate">Deal Scope & Assignment</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (formStep === 1) {
              handleNextStep(e);
            } else {
              handleSaveLead(e);
            }
          }}
          className="space-y-4"
        >
          <div className="min-h-[360px] flex flex-col justify-between">
            {formStep === 1 ? (
              /* STEP 1: Contact Details & Project Scope */
              <div className="space-y-3.5 animate-fade-in">
                {/* Segmented Switcher: Individual vs Organization */}
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 text-xs mb-1.5 font-medium">
                    Lead Classification
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, leadType: 'Individual', company: '' })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.leadType === 'Individual'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>Individual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, leadType: 'Organization' })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.leadType === 'Organization'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Organization</span>
                    </button>
                  </div>
                </div>

                {/* Organization Field (When Organization is selected, appears first with Add New Org button) */}
                {formData.leadType === 'Organization' && (
                  <div className={`relative ${isCompanyDropdownOpen ? 'z-50' : 'z-0'}`} ref={companyDropdownRef}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1">
                        <span>Organization Selection <span className="text-rose-500 font-bold">*</span></span>
                      </label>
                      <Link
                        href="/organizations?new=1&from=leads"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-800/60 transition-all shadow-2xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Add New Organization</span>
                      </Link>
                    </div>
                    <div
                      className={`flex items-center gap-2.5 px-3 py-2 bg-zinc-50/90 dark:bg-zinc-900/90 border rounded-xl transition-all shadow-2xs ${
                        formErrors.company
                          ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/15'
                          : 'border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-500 dark:focus-within:border-zinc-400'
                      }`}
                    >
                      <Building2 className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                      <input
                        type="text"
                        value={formData.company}
                        onFocus={() => setIsCompanyDropdownOpen(true)}
                        onChange={(e) => {
                          setFormData({ ...formData, company: e.target.value });
                          if (formErrors.company) setFormErrors({ ...formErrors, company: undefined });
                          setIsCompanyDropdownOpen(true);
                        }}
                        placeholder="Search existing organization or type new..."
                        className="w-full bg-transparent border-0 p-0 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer p-0.5"
                        tabIndex={-1}
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Autocomplete Dropdown - Solid, crisp & clean */}
                    {isCompanyDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 p-2 space-y-1.5 animate-fade-in">
                        <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-1 mb-0.5 flex items-center justify-between">
                          <span>Studio Organizations ({existingOrganizations.length})</span>
                          <span className="text-[9px] text-indigo-500 font-mono">Unique by Name</span>
                        </div>

                        {matchingOrganizations.length > 0 ? (
                          <>
                            {/* Inline Quick-Create Action if user typed a name that isn't exact match */}
                            {formData.company.trim() && !existingOrganizations.some(o => o.organizationName.toLowerCase() === formData.company.trim().toLowerCase()) && (
                              <div className="p-0.5 mb-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCompanyDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50/90 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-medium text-xs text-left transition-colors border border-indigo-200/80 dark:border-indigo-800/80 cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Plus className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                                    <span className="truncate">
                                      Create new org <strong className="text-zinc-900 dark:text-white">&quot;{formData.company}&quot;</strong>
                                    </span>
                                  </div>
                                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0 shadow-2xs">
                                    + New Org
                                  </span>
                                </button>
                              </div>
                            )}

                            {matchingOrganizations.map((org) => (
                              <button
                                key={org.organizationName}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    company: org.organizationName,
                                    name: prev.name.trim() ? prev.name : org.contactName || prev.name,
                                    email: prev.email.trim() ? prev.email : org.email || prev.email,
                                    phone: prev.phone?.trim() ? prev.phone : org.phone || prev.phone,
                                    country: prev.country?.trim() ? prev.country : org.country || prev.country,
                                  }));
                                  if (formErrors.company) setFormErrors({ ...formErrors, company: undefined });
                                  setIsCompanyDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                              >
                                <div className="min-w-0 pr-2">
                                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {org.organizationName}
                                  </p>
                                  {(org.contactName || org.email) && (
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                      {org.contactName} {org.email ? `• ${org.email}` : ''} {org.country ? `• ${org.country}` : ''}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 border ${
                                    org.isClient
                                      ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                  }`}
                                >
                                  {org.isClient ? 'Existing Client Org' : 'Lead Org'}
                                </span>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="p-4 text-center text-zinc-400 text-xs space-y-2.5">
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">No matching organizations found</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              No company matches &quot;{formData.company}&quot;. Click below to create it now.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsCompanyDropdownOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Create Organization &quot;{formData.company || 'New Org'}&quot;</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}


                {/* Individual Contact Details (Email First as Unique Key, Name Second) */}
                <div className={`relative ${isIndivDropdownOpen ? 'z-50' : 'z-0'}`} ref={indivDropdownRef}>

                  {formData.leadType === 'Individual' && (
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Individual Contact Details</span>
                      <Link
                        href="/individuals?new=1&from=leads"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-800/60 transition-all shadow-2xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Add New Individual</span>
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Lead Email (Primary Unique Identifier & Search Input) */}
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 text-xs mb-1 font-medium flex items-center justify-between">
                        <span>Lead Email <span className="text-rose-500 font-bold">*</span></span>
                        {formErrors.email && <span className="text-[10px] text-rose-500 font-normal">{formErrors.email}</span>}
                      </label>
                      <div
                        className={`flex items-center gap-2.5 px-3 py-2 bg-zinc-50/90 dark:bg-zinc-900/90 border rounded-xl transition-all shadow-2xs ${
                          formErrors.email
                            ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/15'
                            : 'border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-500 dark:focus-within:border-zinc-400'
                        }`}
                      >
                        <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <input
                          type="email"
                          value={formData.email}
                          onFocus={() => {
                            if (formData.leadType === 'Individual' && (existingIndividuals.length > 0 || formData.email.trim())) {
                              setIsIndivDropdownOpen(true);
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, email: val });
                            if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                            if (formData.leadType === 'Individual' && (existingIndividuals.length > 0 || val.trim())) {
                              setIsIndivDropdownOpen(true);
                            }
                          }}
                          placeholder="Search or enter email (e.g. alex@company.com)..."
                          className="w-full bg-transparent border-0 p-0 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* 2. Lead Name */}
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 text-xs mb-1 font-medium flex items-center justify-between">
                        <span>Lead Name <span className="text-rose-500 font-bold">*</span></span>
                        {formErrors.name && <span className="text-[10px] text-rose-500 font-normal">{formErrors.name}</span>}
                      </label>
                      <div
                        className={`flex items-center gap-2.5 px-3 py-2 bg-zinc-50/90 dark:bg-zinc-900/90 border rounded-xl transition-all shadow-2xs ${
                          formErrors.name
                            ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/15'
                            : 'border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-500 dark:focus-within:border-zinc-400'
                        }`}
                      >
                        <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                          }}
                          placeholder="e.g. Alex Harrison"
                          className="w-full bg-transparent border-0 p-0 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Individual Autocomplete Search Dropdown (Anchored to Email Search) */}
                  {formData.leadType === 'Individual' && isIndivDropdownOpen && (existingIndividuals.length > 0 || formData.email.trim().length > 0) && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-fade-in">
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-1 mb-0.5 flex items-center justify-between">
                        <span>Directory Individuals & Contacts ({existingIndividuals.length})</span>
                        <span className="text-[9px] text-indigo-500 font-mono">Unique by Email</span>
                      </div>

                      {/* Quick-Create as New Individual Button if typed email is not an exact match */}
                      {formData.email.trim() && !existingIndividuals.some(i => i.email.toLowerCase() === formData.email.trim().toLowerCase()) && (
                        <div className="p-1 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsIndivDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 font-medium text-xs text-left transition-colors border border-indigo-200/80 dark:border-indigo-800/80 cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Plus className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                              <span className="truncate">
                                Create as new individual with email <strong className="text-zinc-900 dark:text-white">&quot;{formData.email.trim()}&quot;</strong>
                              </span>
                            </div>
                            <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0 shadow-2xs">
                              + New Contact
                            </span>
                          </button>
                        </div>
                      )}

                      {matchingIndividuals.length > 0 ? (
                        matchingIndividuals.map((indiv) => (
                          <button
                            key={indiv.email}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                name: indiv.name || prev.name,
                                email: indiv.email || prev.email,
                                phone: indiv.phone || prev.phone,
                                country: indiv.country || prev.country,
                              }));
                              if (formErrors.name || formErrors.email) {
                                setFormErrors((prev) => ({ ...prev, name: undefined, email: undefined }));
                              }
                              setIsIndivDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                                <User className="h-3 w-3 text-zinc-400 shrink-0" />
                                <span>{indiv.name}</span>
                              </p>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                {indiv.email} {indiv.phone ? `• ${indiv.phone}` : ''} {indiv.country ? `• ${indiv.country}` : ''}
                              </p>
                            </div>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 border ${
                                indiv.isClient
                                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              {indiv.isClient ? 'Existing Client' : 'Lead Contact'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-zinc-400 text-xs space-y-2">
                          <p className="font-medium text-zinc-700 dark:text-zinc-300">No matching contacts found for &quot;{formData.email}&quot;</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Click below to use this email as a new individual contact profile.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsIndivDropdownOpen(false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Use &quot;{formData.email}&quot; as New Contact</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>



                {/* Service Pillar & Target Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <CustomSelect
                      label={
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Service Pillar <span className="text-rose-500 font-bold">*</span></span>
                        </span>
                      }
                      value={formData.serviceType}
                      onChange={(val) => {
                        setFormData({ ...formData, serviceType: val });
                        if (formErrors.serviceType) setFormErrors({ ...formErrors, serviceType: undefined });
                      }}
                      placeholder="Select a service pillar..."
                      error={formErrors.serviceType}
                      options={[
                        { value: 'Landing Pages & High Conversion', label: 'Landing Pages & High Conversion' },
                        { value: 'Web Design & Full-Stack App', label: 'Web Design & Full-Stack App' },
                        { value: 'UI/UX Redesign & Overhaul', label: 'UI/UX Redesign & Overhaul' },
                        { value: 'AI Solutions & Automations', label: 'AI Solutions & Automations' },
                        { value: 'Mobile App MVP', label: 'Mobile App MVP' },
                      ]}
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label={
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Target Timeline <span className="text-rose-500 font-bold">*</span></span>
                        </span>
                      }
                      value={formData.timeline}
                      onChange={(val) => {
                        setFormData({ ...formData, timeline: val });
                        if (formErrors.timeline) setFormErrors({ ...formErrors, timeline: undefined });
                        if (formErrors.customTimeline) setFormErrors({ ...formErrors, customTimeline: undefined });
                      }}
                      placeholder="Select target timeline..."
                      error={formErrors.timeline || formErrors.customTimeline}
                      clearable
                      onClear={() => {
                        setFormData({ ...formData, timeline: '', customTimeline: '' });
                        setFormErrors({ ...formErrors, timeline: undefined, customTimeline: undefined });
                      }}
                      options={[
                        { value: 'Standard (2 - 4 Weeks)', label: 'Standard (2 - 4 Weeks)' },
                        { value: 'Rush (< 2 Weeks)', label: 'Rush (< 2 Weeks)' },
                        { value: '1 - 2 Months', label: '1 - 2 Months' },
                        { value: 'Flexible', label: 'Flexible' },
                        { value: 'Custom', label: 'Custom' },
                      ]}
                    />

                    {formData.timeline === 'Custom' && (
                      <div className="mt-2 animate-fade-in">
                        <input
                          type="text"
                          value={formData.customTimeline}
                          onChange={(e) => {
                            setFormData({ ...formData, customTimeline: e.target.value });
                            if (formErrors.customTimeline) setFormErrors({ ...formErrors, customTimeline: undefined });
                          }}
                          placeholder="e.g. 6 Weeks Sprint"
                          className="w-full bg-white dark:bg-zinc-900 border border-indigo-300 dark:border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Country & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <CustomSelect
                      label={
                        <span className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Country / Region <span className="text-rose-500 font-bold">*</span></span>
                        </span>
                      }
                      value={formData.country}
                      onChange={(val) => {
                        setFormData({ ...formData, country: val });
                        if (formErrors.country) setFormErrors({ ...formErrors, country: undefined });
                      }}
                      placeholder="Select country / region..."
                      searchPlaceholder="Search country..."
                      searchable={true}
                      clearable={true}
                      onClear={() => {
                        setFormData({ ...formData, country: '' });
                        setFormErrors({ ...formErrors, country: 'Country / Region is required' });
                      }}
                      error={formErrors.country}
                      options={COUNTRY_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 text-xs mb-1 font-medium">
                      Phone / WhatsApp <span className="text-zinc-400 text-[11px] font-normal">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <Phone className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 019-2831"
                        className="w-full bg-transparent border-0 p-0 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Brief & Notes as Textarea */}
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 text-xs mb-1 font-medium">
                    Project Brief & Notes <span className="text-zinc-400 text-[11px] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Brief project summary, deliverables, or initial scope notes..."
                    className="w-full bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 resize-y min-h-[64px]"
                  />
                </div>
              </div>
            ) : (
              /* STEP 2: Financials & Routing */
              <div className="space-y-4 animate-fade-in">
                {/* Total Agreed Project Budget & Currency Input */}
                <div className="p-3.5 bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5">
                      <CreditCardIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      <span>Total Agreed Project Budget <span className="text-rose-500 font-bold">*</span></span>
                    </label>
                    {formErrors.budget && <span className="text-[10px] text-rose-500 font-normal">{formErrors.budget}</span>}
                  </div>

                  <div
                    className={`flex items-center bg-white dark:bg-[#18181B] border rounded-xl overflow-hidden shadow-2xs ${
                      formErrors.budget
                        ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/15'
                        : 'border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-500 dark:focus-within:border-zinc-400'
                    }`}
                  >
                    <span className="px-3.5 py-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border-r border-zinc-200 dark:border-zinc-800 shrink-0 select-none">
                      Total Budget
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.budget}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = Number(val);
                        const d1 = num > 0 ? Math.round(num * 0.30) : '';
                        const d2 = num > 0 ? Math.round(num * 0.35) : '';
                        const d3 = num > 0 ? num - (typeof d1 === 'number' ? d1 : 0) - (typeof d2 === 'number' ? d2 : 0) : '';

                        setFormData({
                          ...formData,
                          budget: val,
                          quoteAmount: d1,
                          deposit1: d1,
                          deposit2: d2,
                          deposit3: d3,
                        });
                        if (formErrors.budget) setFormErrors({ ...formErrors, budget: undefined });
                        if (formErrors.quoteAmount) setFormErrors({ ...formErrors, quoteAmount: undefined });
                      }}
                      placeholder="e.g. 10000"
                      className="w-full bg-transparent border-0 px-3.5 py-2.5 text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="bg-zinc-100 dark:bg-zinc-800/80 text-xs font-semibold px-3 py-2.5 text-zinc-700 dark:text-zinc-300 border-l border-zinc-200 dark:border-zinc-800 shrink-0 select-none">
                      USD ($)
                    </span>
                  </div>

                  {/* 3-Milestone / Deposit Breakdown (30% / 35% / 35%) */}
                  <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Payment Milestone Schedule (30% • 35% • 35%)
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Total: {Number(formData.budget) > 0 ? `$${Number(formData.budget).toLocaleString()} USD` : '—'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Deposit 1: 30% */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-1.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                            1st Deposit (30%)
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 font-medium">
                            Kickoff
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 font-mono select-none">USD</span>
                          <input
                            type="number"
                            min="0"
                            value={formData.deposit1 !== undefined && formData.deposit1 !== '' ? formData.deposit1 : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ ...formData, deposit1: val, quoteAmount: val });
                            }}
                            placeholder="0"
                            className="w-full bg-transparent border-0 p-0 text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                      {/* Deposit 2: 35% */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-1.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                            2nd Milestone (35%)
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 font-medium">
                            Design / Dev
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 font-mono select-none">USD</span>
                          <input
                            type="number"
                            min="0"
                            value={formData.deposit2 !== undefined && formData.deposit2 !== '' ? formData.deposit2 : ''}
                            onChange={(e) => setFormData({ ...formData, deposit2: e.target.value })}
                            placeholder="0"
                            className="w-full bg-transparent border-0 p-0 text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                      {/* Deposit 3: 35% */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-1.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                            3rd Final (35%)
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 font-medium">
                            Launch
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 font-mono select-none">USD</span>
                          <input
                            type="number"
                            min="0"
                            value={formData.deposit3 !== undefined && formData.deposit3 !== '' ? formData.deposit3 : ''}
                            onChange={(e) => setFormData({ ...formData, deposit3: e.target.value })}
                            placeholder="0"
                            className="w-full bg-transparent border-0 p-0 text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intent Priority & Lead Source (Lead Source only shown for Individual) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 text-xs mb-1.5 font-medium">
                      Intent Priority
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Cold', 'Warm', 'Hot'] as LeadPriority[]).map((p) => {
                        const isSelected = formData.priority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority: p })}
                            className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                              isSelected
                                ? p === 'Hot'
                                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 shadow-xs'
                                : p === 'Warm'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 shadow-xs'
                                : 'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-xs'
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                          >
                            {p === 'Hot' && <FireIcon className="h-3.5 w-3.5 text-rose-500" />}
                            {p === 'Warm' && <BoltIcon className="h-3.5 w-3.5 text-amber-500" />}
                            <span>{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formData.leadType === 'Individual' ? (
                    <div>
                      <CustomSelect
                        label={
                          <span className="flex items-center justify-between">
                            <span>Lead Source <span className="text-rose-500 font-bold">*</span></span>
                          </span>
                        }
                        value={formData.source}
                        onChange={(val) => {
                          setFormData({ ...formData, source: val });
                          if (formErrors.source) setFormErrors({ ...formErrors, source: undefined });
                        }}
                        placeholder="Select lead source..."
                        error={formErrors.source}
                        clearable
                        options={[
                          { value: 'LinkedIn Outreach', label: 'LinkedIn Outreach' },
                          { value: 'Twitter (X)', label: 'Twitter (X)' },
                          { value: 'Instagram', label: 'Instagram' },
                          { value: 'Upwork', label: 'Upwork' },
                          { value: 'Other / Custom', label: 'Other / Custom' },
                        ]}
                      />
                      {formData.source === 'Other / Custom' && (
                        <div className="mt-2 animate-fade-in">
                          <input
                            type="text"
                            value={formData.customSource}
                            onChange={(e) => {
                              setFormData({ ...formData, customSource: e.target.value });
                              if (formErrors.customSource) setFormErrors({ ...formErrors, customSource: undefined });
                            }}
                            placeholder="Specify custom lead source..."
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <CustomSelect
                        label={
                          <span className="flex items-center gap-1.5">
                            <ShieldCheckIcon className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Assigned Studio Lead</span>
                          </span>
                        }
                        value={formData.assignedTo}
                        onChange={(val) => setFormData({ ...formData, assignedTo: val as TeamMemberName })}
                        placeholder="Select team member..."
                        options={[
                          { value: 'Nagireddy Sai Prabhath', label: 'Nagireddy Sai Prabhath' },
                          { value: 'MD Qais', label: 'MD Qais' },
                          { value: 'MD Fazeel', label: 'MD Fazeel' },
                        ]}
                      />
                    </div>
                  )}
                </div>

                {formData.leadType === 'Individual' && (
                  <div>
                    <CustomSelect
                      label={
                        <span className="flex items-center gap-1.5">
                          <ShieldCheckIcon className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Assigned Studio Lead</span>
                        </span>
                      }
                      value={formData.assignedTo}
                      onChange={(val) => setFormData({ ...formData, assignedTo: val as TeamMemberName })}
                      placeholder="Select team member..."
                      options={[
                        { value: 'Nagireddy Sai Prabhath', label: 'Nagireddy Sai Prabhath' },
                        { value: 'MD Qais', label: 'MD Qais' },
                        { value: 'MD Fazeel', label: 'MD Fazeel' },
                      ]}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
            {formStep === 1 ? (
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span>Back to Scope</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              {formStep === 1 ? (
                <button
                  type="button"
                  onClick={(e) => handleNextStep(e)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Financials & Routing</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleSaveLead(e)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <DocumentCheckIcon className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-600" />
                  <span>{editingLeadId ? 'Update Lead in Pipeline' : 'Save Lead to Pipeline'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        title="Delete Lead"
        subtitle="Permanent removal from CRM pipeline & Supabase database"
        icon={<TrashIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50/90 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3 shadow-2xs">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-rose-950 dark:text-rose-200">
                Are you sure you want to delete this lead?
              </p>
              <p className="text-rose-800/90 dark:text-rose-300/90 leading-relaxed">
                This will permanently delete{' '}
                <span className="font-bold text-rose-950 dark:text-rose-100">
                  {leadToDelete?.name}
                </span>{' '}
                {leadToDelete?.company && (
                  <span>
                    from <span className="font-bold text-rose-950 dark:text-rose-100">{leadToDelete.company}</span>
                  </span>
                )}{' '}
                from your pipeline and PostgreSQL records.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={() => setLeadToDelete(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 2-STEP CONVERT LEAD CONFIRMATION MODAL */}
      <Modal
        isOpen={!!leadToConvert}
        onClose={() => {
          setLeadToConvert(null);
          setConversionStep(1);
        }}
        title={conversionStep === 1 ? 'Convert Lead (Step 1 of 2)' : 'Final Confirmation (Step 2 of 2)'}
        subtitle={
          conversionStep === 1
            ? `Ready to convert ${leadToConvert?.name}?`
            : `Confirm project initialization and milestone activation for ${leadToConvert?.name}.`
        }
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        maxWidth="sm"
        zIndex={100}
      >
        <div className="space-y-3.5 text-xs">
          {/* 2-Step Progress Indicator */}
          <div className="flex items-center gap-1.5 pb-1">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${conversionStep >= 1 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${conversionStep >= 2 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
          </div>

          {conversionStep === 1 ? (
            /* STEP 1: Overview Confirmation */
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Client / Org</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                    {leadToConvert?.company || leadToConvert?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Service Pillar</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                    {leadToConvert?.serviceType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Total Value</span>
                  <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {leadToConvert?.budget || '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setLeadToConvert(null);
                    setConversionStep(1);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setConversionStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Final Verification & Conversion Confirmation */
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">1st Kickoff Deposit (30%)</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${leadToConvert?.quoteAmount ? Number(leadToConvert.quoteAmount).toLocaleString('en-US') : '0'} {leadToConvert?.currency || 'USD'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Milestone Tracker</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Ready to Initialize</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setConversionStep(1)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!leadToConvert) return;
                    convertLeadToClient(leadToConvert.id);
                    setSelectedLead((prev) => (prev ? { ...prev, status: 'Converted' } : null));
                    setLeadToConvert(null);
                    setConversionStep(1);
                    setIsPanelOpen(false);
                    toast({
                      type: 'success',
                      title: '🎉 Lead Converted to Active Client!',
                      description: `${leadToConvert.name} is now an active Client with project milestones initialized.`,
                    });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Final Confirm & Convert</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* DISCARD UNSAVED CHANGES CONFIRMATION MODAL (CLEAN CENTERED POPUP) */}
      <Modal
        isOpen={isConfirmDiscardOpen}
        onClose={() => setIsConfirmDiscardOpen(false)}
        title="Discard unsaved lead?"
        subtitle="You have unsaved changes. Are you sure you want to exit?"
        icon={<ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        maxWidth="sm"
        zIndex={100}
      >
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setIsConfirmDiscardOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleForceCloseModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            <span>OK</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
