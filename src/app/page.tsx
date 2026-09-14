'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BriefcaseIcon,
  PlusIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  UserIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

export default function OverviewPage() {
  const {
    leads,
    clients,
    projects,
    payments,
    activityLogs,
    updatePaymentStatus,
  } = useCRM();
  const { toast } = useToast();

  // 1. Segregate Organizations vs Individuals
  const organizationClients = useMemo(() => {
    return clients.filter((c) => c.clientType !== 'Individual');
  }, [clients]);

  const individualClients = useMemo(() => {
    return clients.filter((c) => c.clientType === 'Individual');
  }, [clients]);

  // 2. Financial & Project Metrics
  const activeProjects = useMemo(() => {
    return projects.filter((p) => p.status !== 'Archived');
  }, [projects]);

  const inProgressProjects = useMemo(() => {
    return projects.filter((p) => p.status === 'In Progress' || p.status === 'Client Review');
  }, [projects]);

  const totalClientsLtv = useMemo(() => {
    return clients.reduce((acc, c) => acc + (c.totalLtv || 0), 0);
  }, [clients]);

  const openLeadsPipeline = useMemo(() => {
    return leads
      .filter((l) => l.status !== 'Converted' && l.status !== 'Lost')
      .reduce((acc, l) => {
        const budgetVal = l.quoteAmount || (l.budget ? parseFloat(l.budget.replace(/[^0-9.]/g, '')) : 0) || 0;
        return acc + budgetVal;
      }, 0);
  }, [leads]);

  const totalPipelineValue = totalClientsLtv + openLeadsPipeline;

  const pendingPayments = useMemo(() => {
    return payments.filter((p) => p.status === 'Pending' || p.status === 'Link Sent');
  }, [payments]);

  const pendingPaymentsTotal = useMemo(() => {
    return pendingPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [pendingPayments]);

  const collectedRevenueTotal = useMemo(() => {
    const fromPayments = payments.filter((p) => p.status === 'Paid').reduce((acc, p) => acc + (p.amount || 0), 0);
    const fromClients = clients.reduce((acc, c) => acc + (c.totalPaid || 0), 0);
    return Math.max(fromPayments, fromClients);
  }, [payments, clients]);

  const paidPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.status === 'Paid').length;
  }, [payments]);

  // 3. Action Queues
  const openLeads = useMemo(() => {
    return leads.filter((l) => l.status !== 'Converted' && l.status !== 'Lost');
  }, [leads]);

  // 4. Revenue By Service Pillar
  const servicePillarStats = useMemo(() => {
    const pillars = [
      'Web Design & Full-Stack App',
      'Landing Page',
      'AI Agent & Next.js SaaS',
      'Brand Identity & Design System',
      'Multi-Page Website',
    ];
    return pillars.map((pillar) => {
      const matchingProjects = projects.filter((p) => p.servicePillar === pillar);
      const revenue = matchingProjects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
      const count = matchingProjects.length;
      return {
        pillar,
        revenue,
        count,
        percent: totalClientsLtv > 0 ? Math.round((revenue / totalClientsLtv) * 100) : 0,
      };
    }).filter(p => p.count > 0 || p.revenue > 0);
  }, [projects, totalClientsLtv]);

  // Handlers
  const handleCopyPaymentLink = (link: string, clientName?: string) => {
    if (!link) {
      toast({
        title: 'No checkout link generated',
        description: 'Please generate a payment link in the Payments module.',
        type: 'error',
      });
      return;
    }
    navigator.clipboard.writeText(link);
    toast({
      type: 'success',
      title: 'Payment Link Copied! 📋',
      description: `Checkout link copied for ${clientName || 'Client'}.`,
    });
  };

  const handleMarkPaymentPaid = (paymentId: string, clientName?: string) => {
    updatePaymentStatus(paymentId, 'Paid');
    toast({
      type: 'success',
      title: 'Payment Marked Paid! 💰',
      description: `Invoice for ${clientName || 'Client'} marked as settled.`,
    });
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Studio Command Center
            </h1>
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time pipeline operations, cash flow velocity & client delivery
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/leads"
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>+ New Lead</span>
          </Link>
          <Link
            href="/organizations?new=1"
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <BuildingOffice2Icon className="h-3.5 w-3.5 text-indigo-500" />
            <span>+ Org</span>
          </Link>
          <Link
            href="/individuals?new=1"
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <UserIcon className="h-3.5 w-3.5 text-amber-500" />
            <span>+ Individual</span>
          </Link>
          <Link
            href="/reports"
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Collected Revenue */}
        <Link
          href="/payments"
          className="group bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Collected Revenue</span>
            <CheckBadgeIcon className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            ${collectedRevenueTotal.toLocaleString()} <span className="text-xs font-normal text-zinc-400">USD</span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{paidPaymentsCount} settled</span>
            <span>•</span>
            <span>Studio cash receipts</span>
          </div>
        </Link>

        {/* Card 2: Pending Receivables */}
        <Link
          href="/payments"
          className="group bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pending Receivables</span>
            <ClockIcon className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            ${pendingPaymentsTotal.toLocaleString()} <span className="text-xs font-normal text-zinc-400">USD</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {pendingPayments.length} milestone invoice{pendingPayments.length === 1 ? '' : 's'} awaiting settlement
          </div>
        </Link>

        {/* Card 3: In-Flight Sprints */}
        <Link
          href="/projects"
          className="group bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Production Sprints</span>
            <BriefcaseIcon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            {activeProjects.length} <span className="text-xs font-normal text-zinc-400">Projects</span>
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {inProgressProjects.length} in active development
          </div>
        </Link>

        {/* Card 4: Client Portfolio Split */}
        <div className="bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Client Portfolio</span>
            <UsersIcon className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            {clients.length} <span className="text-xs font-normal text-zinc-400">Accounts</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/organizations"
              className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 px-1.5 py-0.2 rounded hover:underline"
            >
              🏢 {organizationClients.length} Orgs
            </Link>
            <Link
              href="/individuals"
              className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 px-1.5 py-0.2 rounded hover:underline"
            >
              👤 {individualClients.length} Individuals
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Action Command Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
        
        {/* Urgent Action 1: Pending Invoices / Cash Flow (Span 2) */}
        <div className="lg:col-span-2 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-amber-500" />
                <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Pending Milestone Invoices
                </h2>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                pendingPayments.length > 0
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {pendingPayments.length > 0 ? `${pendingPayments.length} Invoices Due ($${pendingPaymentsTotal.toLocaleString()})` : 'All Settled ✓'}
              </span>
            </div>

            {pendingPayments.length > 0 ? (
              <div className="space-y-2">
                {pendingPayments.slice(0, 4).map((pay) => {
                  const client = clients.find((c) => c.id === pay.clientId);
                  const isOrg = client ? client.clientType !== 'Individual' : true;
                  const clientName = pay.clientName || client?.organizationName || client?.name || pay.leadName || 'Client';

                  return (
                    <div
                      key={pay.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white dark:bg-zinc-900/80 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${isOrg ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'}`}>
                            {isOrg ? '🏢 Org' : '👤 Indiv'}
                          </span>
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {clientName}
                          </p>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                            ${Number(pay.amount).toLocaleString()} {pay.currency || 'USD'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          {pay.type} • Status: <strong className="text-amber-600 dark:text-amber-400 font-medium">{pay.status}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        {pay.paymentLink && (
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentLink(pay.paymentLink, clientName)}
                            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Copy Link
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMarkPaymentPaid(pay.id, clientName)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Paid ✓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 px-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/60 text-center">
                <CheckCircleIcon className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">100% Cash Flow Settled</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">All milestone invoices are currently paid and up to date.</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Direct PayPal integration live</span>
            <Link
              href="/payments"
              className="font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
            >
              <span>Manage all payments &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Urgent Action 2: Inbound Leads Queue */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-indigo-500" />
                <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Inbound Inquiries
                </h2>
              </div>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 font-medium">
                {openLeads.length} Open
              </span>
            </div>

            {openLeads.length > 0 ? (
              <div className="space-y-2">
                {openLeads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    className="p-2.5 bg-white dark:bg-zinc-900/80 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs flex justify-between items-center gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {lead.serviceType} {lead.quoteAmount ? `• $${lead.quoteAmount.toLocaleString()}` : ''}
                      </p>
                    </div>
                    <Link
                      href="/leads"
                      className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-2 py-1 rounded text-xs font-semibold transition-colors shrink-0"
                    >
                      Convert ⚡
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/60 text-center">
                <CheckCircleIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">No pending leads</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Pipeline is clear.</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/60 text-right">
            <Link
              href="/leads"
              className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
            >
              <span>View lead pipeline &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Split Active Portfolio Activity Grid: Organizations vs Individuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
        
        {/* Column Left: Active Organizations */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <BuildingOffice2Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Organizations (Companies)
                </h2>
              </div>
              <Link
                href="/organizations"
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all ({organizationClients.length}) &rarr;
              </Link>
            </div>

            {organizationClients.length > 0 ? (
              <div className="space-y-2">
                {organizationClients.slice(0, 4).map((org) => {
                  const orgProjects = projects.filter((p) => p.clientId === org.id || p.organizationId === org.id);
                  const settledPercent = org.totalLtv > 0 ? Math.round(((org.totalPaid || 0) / org.totalLtv) * 100) : 100;

                  return (
                    <Link
                      key={org.id}
                      href={`/organizations/${org.id}`}
                      className="block p-3 bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                              {org.organizationName}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-normal">
                              ({org.primaryContactName})
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {orgProjects.length} Project{orgProjects.length === 1 ? '' : 's'} • LTV: ${(org.totalLtv || 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                            ${(org.totalPaid || 0).toLocaleString()}
                          </span>
                          <span className={`text-[10px] block font-medium ${settledPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {settledPercent}% Settled
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(5, settledPercent))}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 px-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/60 text-center">
                <BuildingOffice2Icon className="h-6 w-6 text-zinc-400 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">No organizations added yet</p>
                <Link
                  href="/organizations?new=1"
                  className="mt-2 inline-block text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  + Add first organization
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Column Right: Active Individuals */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Individual Clients (Solo Founders)
                </h2>
              </div>
              <Link
                href="/individuals"
                className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                View all ({individualClients.length}) &rarr;
              </Link>
            </div>

            {individualClients.length > 0 ? (
              <div className="space-y-2">
                {individualClients.slice(0, 4).map((indiv) => {
                  const indivProjects = projects.filter((p) => p.clientId === indiv.id || p.individualId === indiv.id);
                  const settledPercent = indiv.totalLtv > 0 ? Math.round(((indiv.totalPaid || 0) / indiv.totalLtv) * 100) : 100;

                  return (
                    <Link
                      key={indiv.id}
                      href={`/organizations/${indiv.id}`}
                      className="block p-3 bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                              {indiv.primaryContactName || indiv.name}
                            </span>
                            {indiv.country && (
                              <span className="text-[10px] text-zinc-400 font-normal">
                                • {indiv.country}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                            {indivProjects.length} Project{indivProjects.length === 1 ? '' : 's'} • {indiv.email}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                            ${(indiv.totalPaid || 0).toLocaleString()}
                          </span>
                          <span className={`text-[10px] block font-medium ${settledPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {settledPercent}% Settled
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-amber-600 dark:bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(5, settledPercent))}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 px-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/60 text-center">
                <UserIcon className="h-6 w-6 text-zinc-400 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">No individual clients added yet</p>
                <Link
                  href="/individuals?new=1"
                  className="mt-2 inline-block text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline"
                >
                  + Add first individual client
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
        
        {/* Revenue By Service Pillar */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
              <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Revenue by Service Pillar
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              ${totalClientsLtv.toLocaleString()} Contracted
            </span>
          </div>

          <div className="space-y-3">
            {servicePillarStats.map((stat) => (
              <div key={stat.pillar} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{stat.pillar}</span>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${stat.revenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">({stat.percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-200/70 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(3, stat.percent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Studio Activity Stream */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Live Studio Activity
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">Recent Actions</span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {activityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-2.5 bg-white dark:bg-zinc-900/80 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 flex items-start gap-2.5"
              >
                <div className={`mt-0.5 p-1 rounded-full text-xs ${
                  log.category === 'payment'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : log.category === 'lead'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                }`}>
                  •
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{log.title}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{log.description}</p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                    {log.partner || log.performedBy || 'System'} • {log.timestamp === 'Just now' ? 'Just now' : new Date(log.timestamp || log.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
