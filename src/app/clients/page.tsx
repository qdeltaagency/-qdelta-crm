'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  BuildingOffice2Icon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { ClientTier } from '@/lib/types';

export default function ClientsPage() {
  const { clients, projects, addClient } = useCRM();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual Add Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    organizationName: '',
    primaryContactName: '',
    email: '',
    phone: '',
    tier: 'Growth Studio' as ClientTier,
    totalLtv: '' as string | number,
    notes: '',
  });

  const filteredClients = clients.filter((client) => {
    const activeProj = projects.find((p) => p.clientId === client.id);
    const search = searchQuery.toLowerCase();
    return (
      client.primaryContactName.toLowerCase().includes(search) ||
      client.organizationName.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      (activeProj && activeProj.title.toLowerCase().includes(search))
    );
  });

  const handleCopyEmail = (client: (typeof clients)[0]) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(client.email);
    }
    setCopiedId(client.id);
    toast({
      type: 'success',
      title: 'Email Copied',
      description: `Copied ${client.email} to clipboard.`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.organizationName.trim() || !newClientData.primaryContactName.trim() || !newClientData.email.trim()) {
      toast({
        type: 'error',
        title: 'Missing Fields',
        description: 'Organization name, contact name, and email are required.',
      });
      return;
    }

    const created = addClient({
      organizationName: newClientData.organizationName.trim(),
      primaryContactName: newClientData.primaryContactName.trim(),
      email: newClientData.email.trim(),
      phone: newClientData.phone.trim() || undefined,
      tier: newClientData.tier,
      totalLtv: Number(newClientData.totalLtv) || 5000,
      totalPaid: 0,
      onboardingStatus: {
        brandAssets: false,
        credentials: false,
        kickoffBooked: false,
        slackInvited: false,
      },
      notes: newClientData.notes.trim() || 'Manual client directory entry.',
    });

    setIsAddModalOpen(false);
    setNewClientData({
      organizationName: '',
      primaryContactName: '',
      email: '',
      phone: '',
      tier: 'Growth Studio',
      totalLtv: '',
      notes: '',
    });

    toast({
      type: 'success',
      title: 'Client Added',
      description: `${created.primaryContactName} (${created.organizationName}) logged successfully.`,
    });
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Title */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight">
            Client Directory & Installments
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track active client accounts, milestone billing status, and access client hubs.
          </p>
        </div>

        {/* Right Side: Search & Add Button */}
        <div className="flex items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-44 sm:w-56 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Add Client manually Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-xl shadow-xs">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">Total Contract Value (LTV)</p>
          <p className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight">
            ${clients.reduce((sum, c) => sum + (c.totalLtv || 5000), 0).toLocaleString()} USD
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{clients.length} active client accounts</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-xl shadow-xs">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">1st Installments Collected (Deposit)</p>
          <p className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
            ${clients.reduce((sum, c) => sum + (c.totalPaid || Math.round((c.totalLtv || 5000) * 0.5)), 0).toLocaleString()} USD
          </p>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">✓ 50% upfront deposits received</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-xl shadow-xs">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">2nd Installments Pending (Launch)</p>
          <p className="text-lg md:text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
            ${clients.reduce((sum, c) => {
              const ltv = c.totalLtv || 5000;
              const paid = c.totalPaid || Math.round(ltv * 0.5);
              return sum + Math.max(0, ltv - paid);
            }, 0).toLocaleString()} USD
          </p>
          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">⏳ Due at project handover / launch</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-4 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 px-4 py-2.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold grid grid-cols-12 items-center">
          <div className="col-span-3">Client & Contact</div>
          <div className="col-span-2">Active Project</div>
          <div className="col-span-2">Total Contract</div>
          <div className="col-span-3">2-Installment Breakdown</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
          {filteredClients.map((client) => {
            const activeProject = projects.find((p) => p.clientId === client.id);
            const totalLtv = client.totalLtv || (activeProject?.contractValue || 5000);
            const totalPaid = client.totalPaid || Math.round(totalLtv * 0.5);
            const remainingDue = Math.max(0, totalLtv - totalPaid);
            const inst1Amount = Math.round(totalLtv * 0.5);
            const inst2Amount = totalLtv - inst1Amount;
            const isInst1Paid = totalPaid >= inst1Amount;
            const isInst2Paid = remainingDue === 0;

            return (
              <div
                key={client.id}
                className="px-4 py-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors grid grid-cols-12 items-center text-xs"
              >
                {/* 1. Client & Contact */}
                <div className="col-span-3 pr-2 min-w-0">
                  <p className="text-zinc-900 dark:text-zinc-200 font-semibold text-xs md:text-sm truncate">
                    {client.primaryContactName}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 truncate flex items-center gap-1">
                    <BuildingOffice2Icon className="h-3 w-3 shrink-0" />
                    <span>{client.organizationName}</span>
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-[10px] truncate font-mono mt-0.5">
                    {client.email}
                  </p>
                </div>

                {/* 2. Active Project + Status Badge */}
                <div className="col-span-2 pr-2 min-w-0">
                  {activeProject ? (
                    <div>
                      <p className="text-zinc-800 dark:text-zinc-200 font-medium text-xs truncate">
                        {activeProject.title}
                      </p>
                      <div className="mt-1">
                        {activeProject.status === 'Planning' && (
                          <span className="text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10 border border-purple-200 dark:border-purple-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            Planning
                          </span>
                        )}
                        {activeProject.status === 'In Progress' && (
                          <span className="text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            In Progress
                          </span>
                        )}
                        {activeProject.status === 'Client Review' && (
                          <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            Client Review
                          </span>
                        )}
                        {activeProject.status === 'Launched' && (
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            Launched
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-500 italic text-xs">No active project</span>
                  )}
                </div>

                {/* 3. Total Contract (LTV) */}
                <div className="col-span-2 pr-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      ${totalLtv.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                      Total Deal LTV
                    </span>
                  </div>
                </div>

                {/* 4. 2-Installment Breakdown */}
                <div className="col-span-3 pr-3">
                  <div className="bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-2 space-y-1.5">
                    {/* Row 1: 1st Installment */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">1st (50%):</span> ${inst1Amount.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/70 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        <CheckIcon className="h-2.5 w-2.5 stroke-[3]" /> Paid
                      </span>
                    </div>

                    {/* Row 2: 2nd Installment */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">2nd (50%):</span> ${inst2Amount.toLocaleString()}
                      </span>
                      {isInst2Paid ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100/70 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                          <CheckIcon className="h-2.5 w-2.5 stroke-[3]" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100/70 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                          Due on Launch
                        </span>
                      )}
                    </div>

                    {/* Progress Bar (50% vs 100%) */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full w-1/2" title="1st Installment Paid (50%)" />
                      <div
                        className={isInst2Paid ? 'bg-blue-500 h-full w-1/2' : 'bg-transparent h-full w-1/2'}
                        title={isInst2Paid ? '2nd Installment Settled' : '2nd Installment Due'}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Actions: Copy Email & Open Hub */}
                <div className="col-span-2 text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    {/* Button 1: Copy Email */}
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(client)}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
                      title={`Copy ${client.email}`}
                    >
                      {copiedId === client.id ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <DocumentDuplicateIcon className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                          <span className="text-[11px] hidden xl:inline">Email</span>
                        </>
                      )}
                    </button>

                    {/* Button 2: Open Hub */}
                    <Link
                      href={`/client-hub/${client.id}`}
                      className="text-xs border border-zinc-300 dark:border-zinc-700 px-3 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors cursor-pointer shrink-0 inline-block font-medium shadow-2xs"
                    >
                      Open Hub
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
              <BuildingOffice2Icon className="h-8 w-8 mx-auto text-zinc-400 stroke-1" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">No clients found</p>
              <p className="text-zinc-500">
                {searchQuery ? `No clients matching "${searchQuery}"` : 'When leads pay their deposit or are converted, they will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Client Manually"
        subtitle="Log a new client into the directory and database"
        icon={<UserPlusIcon className="h-5 w-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Organization / Company Name *</label>
            <input
              type="text"
              required
              value={newClientData.organizationName}
              onChange={(e) => setNewClientData({ ...newClientData, organizationName: e.target.value })}
              placeholder="Organization name"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Primary Contact Person *</label>
              <input
                type="text"
                required
                value={newClientData.primaryContactName}
                onChange={(e) => setNewClientData({ ...newClientData, primaryContactName: e.target.value })}
                placeholder="Full name"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Email Address *</label>
              <input
                type="email"
                required
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                placeholder="example@gmail.com"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Phone / WhatsApp</label>
              <input
                type="text"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Total Contract Value ($)</label>
              <input
                type="number"
                value={newClientData.totalLtv}
                onChange={(e) => setNewClientData({ ...newClientData, totalLtv: e.target.value })}
                placeholder="5000"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              Save Client
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

