'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker';

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

export default function ReportsPage() {
  const { leads, clients, projects, payments, partnerAgencies } = useCRM();
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
    presetLabel: 'All Time',
  });

  // Filter entities by date range
  const filteredPayments = React.useMemo(() => {
    return payments.filter((p) => isWithinDateRange(p.paidAt || p.createdAt, dateRange));
  }, [payments, dateRange]);

  const filteredClients = React.useMemo(() => {
    return clients.filter((c) => isWithinDateRange(c.createdAt, dateRange));
  }, [clients, dateRange]);

  const filteredLeads = React.useMemo(() => {
    return leads.filter((l) => isWithinDateRange(l.createdAt, dateRange));
  }, [leads, dateRange]);

  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => isWithinDateRange(p.startDate || p.createdAt, dateRange));
  }, [projects, dateRange]);

  // 1. Financial KPIs
  const paidPayments = filteredPayments.filter((p) => p.status === 'Paid');
  const totalRevenueCollected = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = filteredPayments.filter((p) => p.status === 'Pending' || p.status === 'Link Sent');
  const totalPendingRevenue = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const isFiltered = Boolean(dateRange.startDate || dateRange.endDate);
  const effectiveClients = !isFiltered ? clients : filteredClients.length > 0 ? filteredClients : clients;
  const totalContractedLtv = effectiveClients.reduce((sum, c) => sum + (c.totalLtv || 0), 0);
  const avgDealSize = effectiveClients.length > 0 ? Math.round(totalContractedLtv / effectiveClients.length) : 0;

  // 2. Conversion Funnel KPIs
  const effectiveLeads = !isFiltered ? leads : filteredLeads;
  const totalLeadsCount = effectiveLeads.length + effectiveClients.length;
  const convertedLeadsCount =
    effectiveLeads.filter((l) => l.status === 'Converted' || l.status === 'Payment Received').length +
    effectiveClients.length;
  const inDiscussionCount = effectiveLeads.filter(
    (l) => l.status === 'In Discussion' || l.status === 'Proposal Sent' || l.status === 'Link Sent'
  ).length;
  const newInquiriesCount = effectiveLeads.filter((l) => l.status === 'New' || l.status === 'New Inquiry').length;
  const lostLeadsCount = effectiveLeads.filter((l) => l.status === 'Lost').length;

  const winRatePercent = totalLeadsCount > 0 ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) : 100;

  // 3. Service Pillar Breakdown
  const servicePillars = [
    'Landing Pages',
    'Web Design & Full-Stack',
    'AI Solutions & Smart Workflows',
    'UI/UX Redesign & Overhaul',
    'Mobile App MVP',
  ];

  const effectiveProjects = !isFiltered ? projects : filteredProjects.length > 0 ? filteredProjects : projects;
  const pillarStats = servicePillars.map((pillar) => {
    const matchingProjects = effectiveProjects.filter((p) =>
      p.servicePillar?.toLowerCase().includes(pillar.toLowerCase().slice(0, 10))
    );
    const revenue = matchingProjects.reduce((sum, p) => sum + (p.contractValue || 0), 0);
    const count = matchingProjects.length;

    return {
      pillar,
      revenue,
      count,
      percent: totalContractedLtv > 0 ? Math.round((revenue / totalContractedLtv) * 100) : 0,
    };
  });

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = 'ID,Organization,Contact,Tier,LTV,TotalPaid,Projects\n';
    const rows = effectiveClients
      .map(
        (c) =>
          `"${c.id}","${c.organizationName}","${c.primaryContactName}","${c.tier}","${c.totalLtv}","${c.totalPaid}","${projects.filter((p) => p.clientId === c.id).length}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qdelta-executive-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Executive Report Exported 📊',
      description: 'Downloaded clean CSV spreadsheet with client financial metrics.',
    });
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight">
              Executive Reports & Analytics
            </h1>
            {isFiltered && (
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Custom Range Filtered
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time agency revenue, conversion velocity, deal sizing, and service pillar performance
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dynamic Month-to-Month and Date Range Picker */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            align="right"
          />

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <DocumentArrowDownIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Total Revenue Collected */}
        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Total Cash Settled</span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRightIcon className="h-2.5 w-2.5 stroke-[3]" />
              100% Live
            </span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
            ${totalRevenueCollected.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            Across {paidPayments.length} authorized PayPal transactions
          </div>
        </div>

        {/* Card 2: Conversion Win Rate */}
        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Pipeline Win Rate</span>
            <FunnelIcon className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight mt-1">
            {winRatePercent}%
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            {convertedLeadsCount} closed / {totalLeadsCount} total inquiries
          </div>
        </div>

        {/* Card 3: Average Deal Size */}
        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Average Client LTV</span>
            <CurrencyDollarIcon className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
            ${avgDealSize.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            Total Contract Base: ${totalContractedLtv.toLocaleString()}
          </div>
        </div>

        {/* Card 4: Pending Cash Flow */}
        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Pending Invoices</span>
            <ClockIcon className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight mt-1">
            ${totalPendingRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            {pendingPayments.length} milestone invoice{pendingPayments.length === 1 ? '' : 's'} pending
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Service Pillar Revenue Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
            <div>
              <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                <ChartBarIcon className="h-4 w-4 text-indigo-500" />
                <span>Revenue Breakdown by Service Pillar</span>
              </h2>
              <p className="text-[11px] text-zinc-500">Contract volume across core agency offerings</p>
            </div>
            <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              {projects.length} Total Projects
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {pillarStats.map((stat) => (
              <div key={stat.pillar} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stat.pillar}</span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                      {stat.count} deal{stat.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">${stat.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 w-8 text-right font-mono">{stat.percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pipeline Conversion Funnel (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
            <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
              <FunnelIcon className="h-4 w-4 text-emerald-500" />
              <span>Conversion Velocity Funnel</span>
            </h2>
            <p className="text-[11px] text-zinc-500">Inquiry-to-paid client lifecycle progression</p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/70 dark:border-zinc-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">1. Total Inquiries Received</p>
                <p className="text-[10px] text-zinc-400">Landing page forms & referrals</p>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 px-2 py-1 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                {totalLeadsCount}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/70 dark:border-zinc-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">2. Active In Discussion</p>
                <p className="text-[10px] text-zinc-400">Quotes sent & discovery calls</p>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-1 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                {inDiscussionCount}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/70 dark:border-zinc-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">3. Converted & Retained</p>
                <p className="text-[10px] text-zinc-400">Deposit received & project active</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                {convertedLeadsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Financial Ledger */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BriefcaseIcon className="h-4 w-4 text-zinc-400" />
            <span>Client Lifetime Revenue Ledger</span>
          </div>
          <Link
            href="/client-hub"
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Manage Client Workspaces &rarr;
          </Link>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
          {clients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);
            const settled = (client.totalPaid || 0) >= client.totalLtv;

            return (
              <div
                key={client.id}
                className="px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {client.organizationName}
                    </span>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.2 rounded text-zinc-600 dark:text-zinc-300">
                      {client.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Lead Partner: {client.assignedLeadPartner || 'Nagireddy Sai Prabhath'} • {clientProjects.length} Project{clientProjects.length === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      ${(client.totalPaid || 0).toLocaleString()} <span className="text-[11px] font-normal text-zinc-400">/ ${(client.totalLtv || 0).toLocaleString()}</span>
                    </p>
                    <span className={`text-[10px] font-semibold ${settled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {settled ? '100% Settled ✓' : `${(client.totalLtv - (client.totalPaid || 0)).toLocaleString()} Outstanding`}
                    </span>
                  </div>

                  <Link
                    href={`/client-hub/${client.id}`}
                    className="text-xs border border-zinc-300 dark:border-zinc-700/60 px-2.5 py-1 rounded font-medium bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
