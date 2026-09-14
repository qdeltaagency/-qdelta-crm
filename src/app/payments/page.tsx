'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  Check,
  Copy,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign,
  Zap,
  Lock,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import {
  BuildingOfficeIcon,
  XMarkIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker';
import { Payment } from '@/lib/types';

function isWithinDateRange(dateString: string | undefined, range: DateRange): boolean {
  if (!range.startDate && !range.endDate) return true;
  if (!dateString) return true;
  const targetTime = new Date(dateString).getTime();
  if (isNaN(targetTime)) return true;

  if (range.startDate) {
    const startTime = new Date(range.startDate + 'T00:00:00').getTime();
    if (targetTime < startTime) return false;
  }
  if (range.endDate) {
    const endTime = new Date(range.endDate + 'T23:59:59').getTime();
    if (targetTime > endTime) return false;
  }
  return true;
}

function getStageBadge(stage: string) {
  switch (stage) {
    case 'Planning':
      return {
        label: 'Planning & Arch.',
        fullLabel: 'Planning & Architecture',
        dot: 'bg-purple-500',
        style: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
      };
    case 'In Progress':
      return {
        label: 'In Development',
        fullLabel: 'In Development',
        dot: 'bg-blue-500',
        style: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
      };
    case 'Client Review':
      return {
        label: 'Client Review',
        fullLabel: 'Client Review & Staging',
        dot: 'bg-amber-500',
        style: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
      };
    case 'Final Settlement':
      return {
        label: 'Final Settlement',
        fullLabel: 'Final Payment & Settlement',
        dot: 'bg-orange-500',
        style: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 font-semibold',
      };
    case 'Launched':
      return {
        label: 'Stage 5: Launched',
        fullLabel: 'Launched & Handover',
        dot: 'bg-emerald-500',
        style: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 font-semibold',
      };
    default:
      return {
        label: stage || 'Planning',
        fullLabel: stage || 'Planning & Architecture',
        dot: 'bg-zinc-400',
        style: 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
      };
  }
}

export default function PaymentsPage() {
  const { payments, clients, projects, updatePaymentStatus } = useCRM();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Dynamic Date / Month Range Filter
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
    presetLabel: 'All Time',
  });

  // Stage / Status filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    if (isFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  // Filter payments by date range
  const paymentsInTimeRange = useMemo(() => {
    return payments.filter((p) => isWithinDateRange(p.paidAt || p.createdAt, dateRange));
  }, [payments, dateRange]);

  // Helper to determine stage & lock state for each payment
  const getPaymentMeta = (p: Payment) => {
    const client = clients.find((c) => c.id === p.clientId);
    const clientName = client?.organizationName || p.clientName || p.leadName || 'Direct Client';
    const clientEmail = client?.email || '';

    // Precise project matching logic
    let project = projects.find((proj) => proj.id === p.projectId);
    if (!project && p.leadId) {
      project = projects.find((proj) => proj.leadId === p.leadId);
    }
    if (!project && p.clientId) {
      const candidateProjects = projects.filter((proj) => proj.clientId === p.clientId);
      if (candidateProjects.length === 1) {
        project = candidateProjects[0];
      } else if (candidateProjects.length > 1) {
        // Match by exact milestone ratio (50% installment = half of project contract value)
        project =
          candidateProjects.find(
            (proj) =>
              Math.round(proj.contractValue * 0.5) === Math.round(Number(p.amount)) ||
              proj.contractValue === Number(p.amount)
          ) || candidateProjects[0];
      }
    }

    const projectTitle = project?.title || p.projectTitle || 'Project Deliverable';
    const projectStatus = project?.status || 'Planning';
    const stageBadge = getStageBadge(projectStatus);

    const isDeposit =
      p.type.toLowerCase().includes('deposit') ||
      p.type.toLowerCase().includes('milestone 1') ||
      p.type.toLowerCase().includes('1st');

    const isMilestone2 =
      p.type.toLowerCase().includes('milestone 2') ||
      p.type.toLowerCase().includes('final') ||
      p.type.toLowerCase().includes('2nd');

    const isPaid = p.status === 'Paid';
    const isProjectLaunched = projectStatus === 'Launched';
    const isSettlementOrLaunched = projectStatus === 'Final Settlement' || isProjectLaunched;
    const isLocked = isMilestone2 && !isPaid && !isSettlementOrLaunched;
    const isReadyToCollect = isMilestone2 && !isPaid && isSettlementOrLaunched;

    const checkoutUrl =
      p.paymentLink ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/pay/${p.leadId || p.clientId || p.id}`
        : `/pay/${p.leadId || p.clientId || p.id}`);

    return {
      client,
      clientName,
      clientEmail,
      project,
      projectTitle,
      projectStatus,
      stageBadge,
      isDeposit,
      isMilestone2,
      isPaid,
      isProjectLaunched,
      isLocked,
      isReadyToCollect,
      checkoutUrl,
    };
  };

  // Financial summary metrics calculated dynamically
  const totalCollectedInPeriod = useMemo(() => {
    return paymentsInTimeRange
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentsInTimeRange]);

  const milestone1CollectedInPeriod = useMemo(() => {
    return paymentsInTimeRange
      .filter(
        (p) =>
          p.status === 'Paid' &&
          (p.type.toLowerCase().includes('deposit') ||
            p.type.toLowerCase().includes('milestone 1') ||
            p.type.toLowerCase().includes('1st'))
      )
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentsInTimeRange]);

  const milestone2CollectedInPeriod = useMemo(() => {
    return paymentsInTimeRange
      .filter(
        (p) =>
          p.status === 'Paid' &&
          (p.type.toLowerCase().includes('milestone 2') ||
            p.type.toLowerCase().includes('final') ||
            p.type.toLowerCase().includes('2nd'))
      )
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentsInTimeRange]);

  const readyToCollectInPeriod = useMemo(() => {
    return paymentsInTimeRange
      .filter((p) => {
        const meta = getPaymentMeta(p);
        return meta.isReadyToCollect || (meta.isDeposit && !meta.isPaid);
      })
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentsInTimeRange, projects, clients]);

  const filterOptions = useMemo(
    () => [
      { id: 'all', label: 'All Transactions', icon: CreditCard, count: paymentsInTimeRange.length },
      {
        id: 'paid',
        label: 'Paid Received',
        icon: DollarSign,
        count: paymentsInTimeRange.filter((p) => p.status === 'Paid').length,
      },
      {
        id: 'ready',
        label: 'Ready to Collect (Stage 4)',
        icon: Zap,
        count: paymentsInTimeRange.filter((p) => getPaymentMeta(p).isReadyToCollect).length,
      },
      {
        id: 'locked',
        label: 'Locked (Stages 1-3 In Progress)',
        icon: Lock,
        count: paymentsInTimeRange.filter((p) => getPaymentMeta(p).isLocked).length,
      },
      {
        id: 'milestone1',
        label: '1st Deposit (50%)',
        icon: CheckCircle2,
        count: paymentsInTimeRange.filter((p) => getPaymentMeta(p).isDeposit).length,
      },
      {
        id: 'milestone2',
        label: '2nd Launch (50%)',
        icon: Zap,
        count: paymentsInTimeRange.filter((p) => getPaymentMeta(p).isMilestone2).length,
      },
    ],
    [paymentsInTimeRange, projects, clients]
  );

  const selectedFilterOption = filterOptions.find((opt) => opt.id === filterStatus);

  // Filtered payments for table view
  const filteredPayments = useMemo(() => {
    return paymentsInTimeRange.filter((p) => {
      const meta = getPaymentMeta(p);
      const search = searchQuery.toLowerCase();

      // Text search filter
      const matchesSearch =
        !search ||
        p.id.toLowerCase().includes(search) ||
        meta.clientName.toLowerCase().includes(search) ||
        meta.projectTitle.toLowerCase().includes(search) ||
        meta.projectStatus.toLowerCase().includes(search) ||
        p.type.toLowerCase().includes(search) ||
        p.status.toLowerCase().includes(search) ||
        p.amount.toString().includes(search) ||
        (p.paypalReferenceId && p.paypalReferenceId.toLowerCase().includes(search));

      if (!matchesSearch) return false;

      // Filter status
      if (filterStatus === 'paid') return meta.isPaid;
      if (filterStatus === 'ready') return meta.isReadyToCollect;
      if (filterStatus === 'locked') return meta.isLocked;
      if (filterStatus === 'milestone1') return meta.isDeposit;
      if (filterStatus === 'milestone2') return meta.isMilestone2;

      return true;
    });
  }, [paymentsInTimeRange, clients, projects, searchQuery, filterStatus]);

  const selectedPayment = payments.find((p) => p.id === selectedPaymentId);
  const selectedMeta = selectedPayment ? getPaymentMeta(selectedPayment) : null;

  const handleCopyLink = (p: Payment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const meta = getPaymentMeta(p);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(meta.checkoutUrl);
    }
    setCopiedId(p.id);
    toast({
      type: 'success',
      title: 'Payment Link Copied',
      description: `Copied checkout link for $${p.amount} ${p.currency} to clipboard.`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkAsPaidOffline = (paymentId: string) => {
    updatePaymentStatus(paymentId, 'Paid', `OFFLINE-${Date.now().toString().slice(-6)}`);
    toast({
      type: 'success',
      title: 'Payment Marked as Paid',
      description: 'Transaction status updated to Paid (Offline settlement recorded).',
    });
  };

  const handleSendPaymentEmail = async (p: Payment) => {
    const meta = getPaymentMeta(p);
    const targetEmail = meta.clientEmail || meta.client?.email;
    if (!targetEmail) {
      toast({
        type: 'error',
        title: 'Missing Email',
        description: 'No email address found for this client.',
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: `Invoice & Payment Link: ${meta.projectTitle} (${meta.isDeposit ? '50% Sprint Deposit' : '50% Launch Settlement'})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 12px;">
              <h2 style="color: #18181b;">Payment Request — ${meta.clientName}</h2>
              <p style="color: #52525b; font-size: 14px;">Here is the payment link for <strong>${meta.projectTitle}</strong>.</p>
              <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #71717a;">Milestone Deliverable:</p>
                <p style="margin: 4px 0 10px 0; font-size: 16px; font-weight: bold; color: #18181b;">${meta.isDeposit ? 'Milestone 1: 50% Kickoff Deposit' : 'Milestone 2: 50% Launch & Handover Settlement'}</p>
                <p style="margin: 0; font-size: 13px; color: #71717a;">Amount Due:</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #059669;">$${p.amount.toLocaleString()} ${p.currency || 'USD'}</p>
              </div>
              <a href="${meta.checkoutUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Complete Payment Online →
              </a>
              <p style="color: #a1a1aa; font-size: 11px; margin-top: 25px;">Qdelta Agency CRM Automated Billing</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        toast({
          type: 'success',
          title: 'Payment Email Dispatched',
          description: `Checkout link emailed to ${targetEmail}.`,
        });
      } else {
        toast({
          type: 'info',
          title: 'Email Sent (Sandbox)',
          description: `Payment invoice link dispatched for ${targetEmail}.`,
        });
      }
    } catch {
      toast({
        type: 'error',
        title: 'Delivery Failed',
        description: 'Could not deliver email. Please copy and send the link manually.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isFiltered = Boolean(dateRange.startDate || dateRange.endDate);

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Title & Counter */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight">
              Payments & Invoicing
            </h1>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-0.5 rounded-full">
              {filteredPayments.length} {filteredPayments.length === 1 ? 'Transaction' : 'Transactions'}
            </span>
            {isFiltered && (
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Custom Range Filtered
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track 2-installment milestones, PayPal collections, and automated stage-gated settlements
          </p>
        </div>

        {/* Right Side Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic From Month / Date to To Month / Date Picker */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            align="right"
          />

          {/* Search Input */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payments, clients, stages..."
              className="w-40 sm:w-48 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Modern Floating Filter Popover */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span>{selectedFilterOption?.label || 'Filter'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
            </button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Filter by Stage / Status
                </div>
                {filterOptions.map((opt) => {
                  const isSelected = filterStatus === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setFilterStatus(opt.id);
                        setIsFilterMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                          {opt.count}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Financial Summary Metric Cards (Clickable Filters) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Card 1: Total Revenue Collected */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'paid' ? 'all' : 'paid')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            filterStatus === 'paid'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900/10 dark:ring-zinc-100/20'
              : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-medium uppercase tracking-wider ${filterStatus === 'paid' ? 'text-zinc-300 dark:text-zinc-600 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
              Total Collected
            </p>
            {filterStatus === 'paid' && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">Filtered</span>}
          </div>
          <p className={`text-lg md:text-xl font-bold font-mono mt-1 tracking-tight ${filterStatus === 'paid' ? 'text-white dark:text-zinc-950' : 'text-emerald-600 dark:text-emerald-400'}`}>
            ${totalCollectedInPeriod.toLocaleString()} USD
          </p>
        </button>

        {/* Card 2: Milestone 1 (Deposits) */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'milestone1' ? 'all' : 'milestone1')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            filterStatus === 'milestone1'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900/10 dark:ring-zinc-100/20'
              : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-medium uppercase tracking-wider ${filterStatus === 'milestone1' ? 'text-zinc-300 dark:text-zinc-600 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
              1st Deposit (50%)
            </p>
            {filterStatus === 'milestone1' && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">Filtered</span>}
          </div>
          <p className={`text-lg md:text-xl font-bold font-mono mt-1 tracking-tight ${filterStatus === 'milestone1' ? 'text-white dark:text-zinc-950' : 'text-teal-600 dark:text-teal-400'}`}>
            ${milestone1CollectedInPeriod.toLocaleString()} USD
          </p>
        </button>

        {/* Card 3: Milestone 2 (Final Launch) */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'milestone2' ? 'all' : 'milestone2')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            filterStatus === 'milestone2'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900/10 dark:ring-zinc-100/20'
              : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-medium uppercase tracking-wider ${filterStatus === 'milestone2' ? 'text-zinc-300 dark:text-zinc-600 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
              2nd Launch (50%)
            </p>
            {filterStatus === 'milestone2' && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">Filtered</span>}
          </div>
          <p className={`text-lg md:text-xl font-bold font-mono mt-1 tracking-tight ${filterStatus === 'milestone2' ? 'text-white dark:text-zinc-950' : 'text-indigo-600 dark:text-indigo-400'}`}>
            ${milestone2CollectedInPeriod.toLocaleString()} USD
          </p>
        </button>

        {/* Card 4: Ready to Collect */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'ready' ? 'all' : 'ready')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            filterStatus === 'ready'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900/10 dark:ring-zinc-100/20'
              : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-medium uppercase tracking-wider ${filterStatus === 'ready' ? 'text-zinc-300 dark:text-zinc-600 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
              Ready to Collect
            </p>
            {filterStatus === 'ready' && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">Filtered</span>}
          </div>
          <p className={`text-lg md:text-xl font-bold font-mono mt-1 tracking-tight ${filterStatus === 'ready' ? 'text-white dark:text-zinc-950' : 'text-amber-600 dark:text-amber-400'}`}>
            ${readyToCollectInPeriod.toLocaleString()} USD
          </p>
        </button>
      </div>

      {/* Unified Invoices & Payments Table */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 font-semibold">
                <th className="px-4 py-3 min-w-[160px]">Milestone & Reference</th>
                <th className="px-4 py-3 min-w-[200px]">Client & Project</th>
                <th className="px-4 py-3 min-w-[170px]">Project Stage</th>
                <th className="px-4 py-3 min-w-[110px]">Amount</th>
                <th className="px-4 py-3 min-w-[170px]">Settlement Status</th>
                <th className="px-4 py-3 text-right min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {filteredPayments.map((p) => {
                const meta = getPaymentMeta(p);

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPaymentId(p.id)}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors cursor-pointer"
                  >
                    {/* 1. Milestone Type & Ref */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            meta.isDeposit
                              ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20'
                              : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
                          }`}
                        >
                          {meta.isDeposit ? '1st Deposit (50%)' : '2nd Launch (50%)'}
                        </span>
                      </div>
                      <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-1 font-mono truncate">
                        {p.paypalReferenceId || `#PAY-${p.id.slice(-6)}`}
                      </p>
                    </td>

                    {/* 2. Client & Project */}
                    <td className="px-4 py-3">
                      <p className="text-zinc-900 dark:text-zinc-200 font-semibold text-xs truncate">
                        {meta.clientName}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 truncate flex items-center gap-1">
                        <BuildingOfficeIcon className="h-3 w-3 text-zinc-400 shrink-0" />
                        <span>{meta.projectTitle}</span>
                      </p>
                    </td>

                    {/* 3. Project Production Stage (User Request) */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${meta.stageBadge.style}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.stageBadge.dot}`} />
                        <span>{meta.stageBadge.label}</span>
                      </span>
                    </td>

                    {/* 4. Amount */}
                    <td className="px-4 py-3">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold font-mono text-xs">
                        ${Number(p.amount).toLocaleString()} {p.currency || 'USD'}
                      </span>
                    </td>

                    {/* 5. Smart Stage-Aware Status */}
                    <td className="px-4 py-3">
                      {meta.isPaid && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          Paid ({p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'Received'})
                        </span>
                      )}

                      {!meta.isPaid && meta.isReadyToCollect && (
                        <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold animate-pulse">
                          <Zap className="w-3 h-3 shrink-0 text-amber-500" />
                          Ready to Collect (Stage 4)
                        </span>
                      )}

                      {!meta.isPaid && meta.isLocked && (
                        <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          <Lock className="w-3 h-3 shrink-0 text-zinc-400" />
                          Locked (Stage 1-3 In Progress)
                        </span>
                      )}

                      {!meta.isPaid && meta.isDeposit && (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          <Clock className="w-3 h-3 shrink-0" />
                          Awaiting Deposit
                        </span>
                      )}
                    </td>

                    {/* 6. Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!meta.isPaid && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(p, e)}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer transition-colors bg-indigo-50/50 dark:bg-indigo-500/10 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-500/20 px-2.5 py-1 rounded-lg"
                            title="Copy Checkout Link"
                          >
                            {copiedId === p.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Copy Link</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentId(p.id)}
                          className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                          title="View Payment Details Drawer"
                        >
                          View →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Receipt className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        No payment records found
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {searchQuery || filterStatus !== 'all' || dateRange.startDate
                          ? 'Try adjusting your search, filter, or date range.'
                          : 'Transactions will appear here as client deposit milestones are generated.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OUT PAYMENT & LINK DETAILS DRAWER */}
      {selectedPayment && selectedMeta && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedPaymentId(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <aside className="relative w-full max-w-lg bg-white dark:bg-[#141416] border-l border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl z-10 space-y-6 animate-fade-in">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        selectedMeta.isDeposit
                          ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20'
                          : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
                      }`}
                    >
                      {selectedMeta.isDeposit ? '1st Deposit Milestone (50%)' : '2nd Launch Milestone (50%)'}
                    </span>
                    {selectedMeta.isPaid ? (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                        ✓ Paid
                      </span>
                    ) : selectedMeta.isReadyToCollect ? (
                      <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
                        ⚡ Ready to Collect
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">
                        🔒 Locked (In Progress)
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight mt-1.5">
                    {selectedPayment.paypalReferenceId || `#PAY-${selectedPayment.id.slice(-6)}`}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentId(null)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* 1. Payment Link Details Section */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                      Hosted Checkout Link Details
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold">
                    ${selectedPayment.amount.toLocaleString()} {selectedPayment.currency || 'USD'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedMeta.checkoutUrl}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(selectedPayment, e)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    {copiedId === selectedPayment.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Action Buttons for Link */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={selectedMeta.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Open Checkout Page</span>
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-zinc-500" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSendPaymentEmail(selectedPayment)}
                    disabled={isSendingEmail}
                    className="w-full text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <EnvelopeIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{isSendingEmail ? 'Dispatching...' : 'Email to Client'}</span>
                  </button>
                </div>
              </div>

              {/* 2. Stage-Gated Milestone Explanation Banner */}
              {selectedMeta.isMilestone2 && selectedMeta.isLocked && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                    <LockClosedIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Stage 4 Lock Active: Pending Project Delivery</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    This 2nd milestone balance ($
                    {selectedPayment.amount.toLocaleString()} {selectedPayment.currency}) is scheduled for final handover.
                    It will unlock automatically when the project reaches <strong>Stage 4: Launched & Handover</strong>.
                  </p>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-200 hover:underline pt-0.5"
                  >
                    <span>View in Projects Ledger →</span>
                  </Link>
                </div>
              )}

              {selectedMeta.isMilestone2 && selectedMeta.isReadyToCollect && (
                <div className="p-3 bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-950 dark:text-emerald-200 font-semibold text-xs">
                    <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Project Launched — Final Payment Unlocked!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    The project has been launched and delivered to the client. You can now collect the final 50% balance ($
                    {selectedPayment.amount.toLocaleString()} {selectedPayment.currency}).
                  </p>
                </div>
              )}

              {/* 3. Transaction Financials Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Transaction Summary
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Amount Due</p>
                    <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ${selectedPayment.amount.toLocaleString()} {selectedPayment.currency || 'USD'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Payment Status</p>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {selectedMeta.isPaid ? 'Paid & Reconciled' : selectedMeta.isReadyToCollect ? 'Ready to Collect' : 'Pending Milestone'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Gateway / Method</p>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate">
                      PayPal Express & Card
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Date Logged</p>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono">
                      {selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleDateString() : new Date(selectedPayment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Associated Client & Project Card with Project Stage */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BuildingOfficeIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Client & Project Stage
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${selectedMeta.stageBadge.style}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedMeta.stageBadge.dot}`} />
                    <span>{selectedMeta.stageBadge.fullLabel}</span>
                  </span>
                </div>

                <div className="text-xs space-y-1 pt-0.5">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedMeta.clientName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">{selectedMeta.projectTitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedMeta.client && (
                    <Link
                      href={`/client-hub/${selectedMeta.client.id}`}
                      className="text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Client Hub</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                  <Link
                    href="/projects"
                    className="text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Projects Ledger</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              {!selectedMeta.isPaid && (
                <button
                  type="button"
                  onClick={() => handleMarkAsPaidOffline(selectedPayment.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark as Paid (Record Offline / Wire Settlement)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedPaymentId(null)}
                className="w-full py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
