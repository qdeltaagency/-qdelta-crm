'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  ChevronRight,
  Folder,
  User,
  ExternalLink,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { ServicePillar } from '@/lib/types';

export default function IndividualsPage() {
  const router = useRouter();
  const { clients, projects, payments, addClient, addProject, addPayment } = useCRM();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === '1' || params.get('action') === 'new') {
        setIsAddModalOpen(true);
      }
    }
  }, []);

  // Form State for New Individual Client
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    notes: '',
  });

  // Filter for Individuals only
  const individualClients = useMemo(() => {
    return clients.filter((c) => c.clientType === 'Individual');
  }, [clients]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return individualClients.filter((client) => {
      if (!q) return true;
      const contactMatch = client.primaryContactName.toLowerCase().includes(q) || client.name.toLowerCase().includes(q);
      const emailMatch = client.email.toLowerCase().includes(q);
      const countryMatch = client.country ? client.country.toLowerCase().includes(q) : false;
      const linkedProjects = projects.filter((p) => p.clientId === client.id);
      const projectMatch = linkedProjects.some((p) => p.title.toLowerCase().includes(q));
      return contactMatch || emailMatch || countryMatch || projectMatch;
    });
  }, [individualClients, searchQuery, projects]);

  // Project & Financial Metrics for Individuals
  const individualClientIds = useMemo(() => new Set(individualClients.map((c) => c.id)), [individualClients]);
  
  const individualProjects = useMemo(() => {
    return projects.filter((p) => individualClientIds.has(p.clientId));
  }, [projects, individualClientIds]);

  const activeProjects = useMemo(() => {
    return individualProjects.filter((p) => p.status !== 'Archived' && p.status !== 'Launched');
  }, [individualProjects]);

  const completedProjects = useMemo(() => {
    return individualProjects.filter((p) => p.status === 'Launched');
  }, [individualProjects]);

  const totalIndividualLtv = useMemo(() => {
    return individualClients.reduce((sum, c) => sum + (Number(c.totalLtv) || 0), 0);
  }, [individualClients]);

  const totalIndividualPaid = useMemo(() => {
    return individualClients.reduce((sum, c) => sum + (Number(c.totalPaid) || 0), 0);
  }, [individualClients]);

  const handleCreateIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide at least a client name and email.',
        type: 'error',
      });
      return;
    }

    const newClient = addClient({
      type: 'Individual',
      name: formData.name.trim(),
      contactPerson: formData.name.trim(),
      clientType: 'Individual',
      organizationName: formData.name.trim(),
      primaryContactName: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      country: formData.country.trim() || undefined,
      assignedLeadPartner: 'Nagireddy Sai Prabhath',
      totalLtv: 0,
      totalPaid: 0,
      onboardingStatus: {
        brandAssets: false,
        credentials: false,
        kickoffBooked: false,
        slackInvited: false,
      },
      notes: formData.notes.trim() || `Direct individual client profile created for ${formData.name.trim()}.`,
    });

    toast({
      type: 'success',
      title: 'Individual Client Created! 👤',
      description: `${newClient.primaryContactName}'s workspace is ready.`,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      notes: '',
    });
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span>Individual Clients & Direct Founders</span>
            </h1>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full">
              {individualClients.length} {individualClients.length === 1 ? 'Client' : 'Clients'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Directory of solo clients, personal accounts, and direct project delivery hubs
          </p>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, email, project..."
              className="w-48 sm:w-64 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* New Client Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Individual</span>
          </button>
        </div>
      </div>

      {/* 4 Project-Focused Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Individual Accounts</p>
          <div className="text-lg md:text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
            {individualClients.length}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Solo founders & direct clients
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Active Delivery Sprints</p>
          <div className="text-lg md:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tracking-tight mt-1">
            {activeProjects.length}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {individualProjects.length} total projects across accounts
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Completed & Launched</p>
          <div className="text-lg md:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
            {completedProjects.length}
          </div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
            Production handovers complete
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Individual Portfolio (LTV)</p>
          <div className="text-lg md:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight mt-1">
            ${totalIndividualLtv.toLocaleString()} USD
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            ${totalIndividualPaid.toLocaleString()} USD collected
          </p>
        </div>
      </div>

      {/* Individuals Directory Table Container */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-2xs">
        {/* Table Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 px-4 py-2.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold grid grid-cols-12 items-center">
          <div className="col-span-12 sm:col-span-4">Individual Client Profile</div>
          <div className="col-span-6 sm:col-span-3">Linked Projects & Stage</div>
          <div className="col-span-6 sm:col-span-3">Financials (LTV & Paid)</div>
          <div className="col-span-12 sm:col-span-2 text-right">Workspace</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => {
              const clientProjects = projects.filter((p) => p.clientId === client.id);
              const activeProj = clientProjects.find((p) => p.status !== 'Archived' && p.status !== 'Launched') || clientProjects[0];

              return (
                <div
                  key={client.id}
                  className="px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors grid grid-cols-12 items-center gap-3"
                >
                  {/* Col 1: Account Info */}
                  <div className="col-span-12 sm:col-span-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/organizations/${client.id}`}
                            className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                          >
                            {client.primaryContactName || client.name}
                          </Link>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                            Individual Client
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>{client.email}</span>
                          {client.phone && (
                            <>
                              <span>•</span>
                              <span>{client.phone}</span>
                            </>
                          )}
                          {client.country && (
                            <>
                              <span>•</span>
                              <span>{client.country}</span>
                            </>
                          )}
                          {client.createdAt && (
                            <>
                              <span>•</span>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                Added {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Linked Projects */}
                  <div className="col-span-6 sm:col-span-3">
                    {clientProjects.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Folder className="h-3 w-3 text-zinc-400" />
                          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                            {activeProj?.title || clientProjects[0]?.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                          <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-zinc-700 dark:text-zinc-300">
                            {clientProjects.length} Project{clientProjects.length === 1 ? '' : 's'}
                          </span>
                          <span>Stage: <strong className="text-amber-600 dark:text-amber-400">{activeProj?.status || 'Planning'}</strong></span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">No projects attached yet</span>
                    )}
                  </div>

                  {/* Col 3: Financials */}
                  <div className="col-span-6 sm:col-span-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                        ${(client.totalLtv || 0).toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">LTV</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                        <span>Paid: ${(client.totalPaid || 0).toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 4: Action Button */}
                  <div className="col-span-12 sm:col-span-2 text-right">
                    <Link
                      href={`/organizations/${client.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <span>Open Hub</span>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <User className="h-8 w-8 text-zinc-400 mx-auto" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">No individual clients found.</p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Add your first individual client
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Individual Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Add New Individual Client Workspace</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIndividual} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. David Miller"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Client Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="david@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Phone (Optional)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">Country / Location</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United States, Germany"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">Internal Notes / Context (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Direct founder inquiry, looking for full-stack build in upcoming sprint."
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 font-semibold transition-colors shadow-xs"
                >
                  Create Individual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
