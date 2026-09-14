'use client';

import React from 'react';
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
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

export default function OverviewPage() {
  const {
    leads,
    clients,
    projects,
    payments,
    partnerAgencies,
  } = useCRM();
  const { toast } = useToast();

  // 1. Live Metrics
  const activeClientsCount = clients.length;
  const inProgressProjectsCount = projects.filter(
    (p) => p.status === 'In Progress' || p.status === 'Client Review'
  ).length;

  const totalClientsLtv = clients.reduce((acc, c) => acc + (c.totalLtv || 0), 0);
  const openLeadsPipeline = leads
    .filter((l) => l.status !== 'Converted' && l.status !== 'Lost')
    .reduce((acc, l) => acc + (l.quoteAmount || 0), 0);
  const totalPipelineValue = totalClientsLtv + openLeadsPipeline;

  const pendingPaymentsList = payments.filter((p) => p.status === 'Pending' || p.status === 'Link Sent');
  const pendingPaymentsTotal = pendingPaymentsList.reduce((acc, p) => acc + (p.amount || 0), 0);

  const outboundCommissions = partnerAgencies.reduce((acc, p) => acc + (p.totalCommissionEarned || 0), 0);
  const inboundCommissions = partnerAgencies.reduce((acc, p) => acc + (p.totalCommissionPaid || 0), 0);

  // 2. Action Queue Data
  const allOpenLeads = leads.filter((l) => l.status !== 'Converted' && l.status !== 'Lost');
  const openLeadsQueue = allOpenLeads.slice(0, 3);

  const activeProjectsQueue = projects
    .filter((p) => p.status !== 'Archived')
    .slice(0, 3);

  const handleCopyPaymentLink = (link: string, clientName?: string) => {
    if (!link) {
      toast({
        title: 'No link generated',
        description: 'Please generate a payment link in the Payments module.',
        type: 'error',
      });
      return;
    }
    navigator.clipboard.writeText(link);
    toast({
      type: 'success',
      title: 'Payment Link Copied',
      description: `Copied checkout link for ${clientName || 'Client'}.`,
    });
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Live operational command center & revenue analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leads"
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Lead</span>
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

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Clients */}
        <Link
          href="/clients"
          className="group bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Clients</span>
            <UsersIcon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          </div>
          <div className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            {activeClientsCount}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {inProgressProjectsCount} active project{inProgressProjectsCount === 1 ? '' : 's'} in delivery
          </div>
        </Link>

        {/* Card 2: Pipeline Value */}
        <Link
          href="/leads"
          className="group bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pipeline Value</span>
            <CurrencyDollarIcon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          </div>
          <div className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            ${totalPipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ${totalClientsLtv.toLocaleString()} closed • ${openLeadsPipeline.toLocaleString()} open
          </div>
        </Link>

        {/* Card 3: Pending Payments */}
        <Link
          href="/payments"
          className="group bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pending Payments</span>
            <ClockIcon className="h-4 w-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            ${pendingPaymentsTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {pendingPaymentsList.length} invoice{pendingPaymentsList.length === 1 ? '' : 's'} awaiting settlement
          </div>
        </Link>

        {/* Card 4: Network Commissions */}
        <Link
          href="/partners"
          className="group bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-2xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Network Commissions</span>
            <GlobeAltIcon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold font-mono">
                +${outboundCommissions.toLocaleString()}
              </span>
              <span className="text-zinc-400 text-[10px]">Earned</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-rose-600 dark:text-rose-400 text-sm font-semibold font-mono">
                -${inboundCommissions.toLocaleString()}
              </span>
              <span className="text-zinc-400 text-[10px]">Paid</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Three-Column Operational Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        
        {/* Column 1: Inbound Leads Queue */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Inbound Leads Queue
              </h2>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 font-medium">
                {allOpenLeads.length} Pending
              </span>
            </div>

            {openLeadsQueue.length > 0 ? (
              <div className="space-y-2">
                {openLeadsQueue.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900/80 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                        {lead.status} • {lead.serviceType || 'Web App'} {lead.quoteAmount ? `($${lead.quoteAmount.toLocaleString()})` : ''}
                      </p>
                    </div>
                    <Link
                      href="/leads"
                      className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/60 text-center">
                <CheckCircleIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">All leads converted or reviewed</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Pipeline is clear and up to date.</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/60 text-right">
            <Link
              href="/leads"
              className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all leads</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Column 2: Payment & Cash Flow */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Payment & Cash Flow
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                pendingPaymentsList.length > 0
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {pendingPaymentsList.length > 0 ? `${pendingPaymentsList.length} Pending` : 'Settled'}
              </span>
            </div>

            {pendingPaymentsList.length > 0 ? (
              <div className="space-y-2">
                {pendingPaymentsList.slice(0, 3).map((pay) => {
                  const client = clients.find((c) => c.id === pay.clientId);
                  const targetHref = pay.clientId
                    ? `/client-hub/${pay.clientId}`
                    : pay.leadId
                    ? `/leads`
                    : `/payments`;

                  return (
                    <div
                      key={pay.id}
                      className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900/80 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {pay.clientName || client?.organizationName || pay.leadName || 'Client Project'}
                          </p>
                          <span className="text-[10px] text-zinc-700 dark:text-zinc-300 font-bold font-mono">
                            ${Number(pay.amount).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          {pay.type} • {pay.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {pay.paymentLink && (
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentLink(pay.paymentLink, pay.clientName || client?.organizationName)}
                            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                          >
                            Copy
                          </button>
                        )}
                        <Link
                          href={targetHref}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 px-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/60 text-center">
                <CheckCircleIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">All invoices settled</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">No overdue balances or pending deposits.</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/60 text-right">
            <Link
              href="/payments"
              className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
            >
              <span>Manage payments</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Column 3: Active Deliverables */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Active Deliverables
              </h2>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 font-medium">
                {activeProjectsQueue.length} Active
              </span>
            </div>

            {activeProjectsQueue.length > 0 ? (
              <div className="space-y-2">
                {activeProjectsQueue.map((project) => (
                  <Link
                    key={project.id}
                    href={`/client-hub/${project.clientId}`}
                    className="block p-3 bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 pr-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{project.title}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          {project.servicePillar} • Due {project.targetLaunchDate || 'TBD'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {project.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/60 text-center">
                <BriefcaseIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">No active projects</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Convert a lead to initiate project delivery.</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/60 text-right">
            <Link
              href="/projects"
              className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
            >
              <span>View projects</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

