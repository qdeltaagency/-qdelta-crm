'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GlobeAltIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  EnvelopeIcon,
  XMarkIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { PartnerAgency } from '@/lib/types';

export default function PartnersPage() {
  const { partnerAgencies, leads, addPartnerAgency, updatePartnerAgency } = useCRM();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerAgency | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    specialization: '',
    defaultCommissionRate: 10,
  });

  const [selectedPartnerForPayout, setSelectedPartnerForPayout] = useState<PartnerAgency | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  // New Partner Form
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    specialization: 'High-End 3D & WebGL Shaders',
    defaultCommissionRate: 10,
  });

  // Open Edit Modal
  const handleOpenEdit = (partner: PartnerAgency) => {
    setEditingPartner(partner);
    setEditFormData({
      name: partner.name,
      contactPerson: partner.contactPerson,
      email: partner.email,
      specialization: partner.specialization,
      defaultCommissionRate: partner.defaultCommissionRate,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    if (!editFormData.name.trim() || !editFormData.contactPerson.trim() || !editFormData.email.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in agency name, contact person, and email.',
        type: 'error',
      });
      return;
    }

    updatePartnerAgency(editingPartner.id, {
      name: editFormData.name.trim(),
      contactPerson: editFormData.contactPerson.trim(),
      email: editFormData.email.trim(),
      specialization: editFormData.specialization.trim(),
      defaultCommissionRate: Number(editFormData.defaultCommissionRate) || 10,
    });

    toast({
      title: 'Partner Updated 🤝',
      description: `Updated details and commission rate for ${editFormData.name}.`,
    });

    setEditingPartner(null);
  };

  // Filter partners
  const filteredPartners = partnerAgencies.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Referred leads across the agency
  const referredLeads = leads.filter(
    (l) =>
      l.status === 'Referred Out' ||
      l.handlingMode === 'White-Label / Partner' ||
      l.handlingMode === 'Referred Out' ||
      Boolean(l.referringPartner)
  );

  // Aggregate Metrics
  const totalAgencies = partnerAgencies.length;
  const totalLeadsReferred = partnerAgencies.reduce((sum, p) => sum + (p.totalReferredLeads || 0), 0) + referredLeads.length;
  const totalEarned = partnerAgencies.reduce((sum, p) => sum + (p.totalCommissionEarned || 0), 0);
  const totalPaid = partnerAgencies.reduce((sum, p) => sum + (p.totalCommissionPaid || 0), 0);
  const netCommissionBalance = totalEarned - totalPaid;

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in agency name, contact person, and email.',
        type: 'error',
      });
      return;
    }

    const created = addPartnerAgency({
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      specialization: formData.specialization.trim(),
      defaultCommissionRate: Number(formData.defaultCommissionRate) || 10,
    });

    toast({
      title: 'Partner Agency Added! 🤝',
      description: `${created.name} is now registered in your agency network.`,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      specialization: 'High-End 3D & WebGL Shaders',
      defaultCommissionRate: 10,
    });
  };

  const handleRecordPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerForPayout || payoutAmount <= 0) return;

    updatePartnerAgency(selectedPartnerForPayout.id, {
      totalCommissionPaid: (selectedPartnerForPayout.totalCommissionPaid || 0) + payoutAmount,
    });

    toast({
      title: 'Commission Payout Recorded! 💸',
      description: `Logged ${payoutAmount.toLocaleString()} settlement to ${selectedPartnerForPayout.name}.`,
    });

    setSelectedPartnerForPayout(null);
    setPayoutAmount(0);
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight">
            Agency Partner Network
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Outbound & inbound cross-agency commission tracking, referrals, and white-label partners
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <MagnifyingGlassIcon className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner agencies..."
              className="w-48 sm:w-60 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Partner Agency</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Active Agencies</span>
          <div className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight mt-0.5">
            {totalAgencies}
          </div>
        </div>

        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Referred Inquiries</span>
          <div className="text-lg md:text-xl font-semibold text-indigo-600 dark:text-indigo-400 tracking-tight mt-0.5">
            {totalLeadsReferred}
          </div>
        </div>

        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Commissions Earned (Inbound)</span>
          <div className="text-lg md:text-xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
            ${totalEarned.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#F2F4F7] dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Commissions Paid Out</span>
          <div className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight mt-0.5">
            ${totalPaid.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Partner Agencies Directory */}
      <div className="space-y-3">
        <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
          <GlobeAltIcon className="h-4 w-4 text-zinc-500" />
          <span>Registered Agency Partners</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPartners.map((partner) => {
            const directMatchingLeads = leads.filter(
              (l) =>
                Boolean(l.referringPartner) && l.referringPartner?.toLowerCase() === partner.name.toLowerCase()
            );
            const dynamicLeadsCount = Math.max(partner.totalReferredLeads || 0, directMatchingLeads.length);
            const directEarned = directMatchingLeads.reduce(
              (s, l) =>
                s +
                (l.referralCommissionAmount ||
                  Math.round(((l.quoteAmount || 0) * (l.referralCommissionRate || partner.defaultCommissionRate || 10)) / 100)),
              0
            );
            const dynamicEarned = (partner.totalCommissionEarned || 0) + directEarned;
            const pendingDue = dynamicEarned - (partner.totalCommissionPaid || 0);

            return (
              <div
                key={partner.id}
                className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{partner.name}</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                        <EnvelopeIcon className="h-3 w-3 text-zinc-400" />
                        <span>{partner.contactPerson} ({partner.email})</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">
                      {partner.defaultCommissionRate}% Fee
                    </span>
                  </div>

                  <div className="mt-2.5 p-2 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/70 dark:border-zinc-800/60 text-[11px] text-zinc-600 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-500">Specialization:</span> {partner.specialization}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/70 space-y-2">
                  <div className="grid grid-cols-3 gap-1 text-center text-xs">
                    <div className="bg-zinc-50 dark:bg-zinc-950/40 p-1.5 rounded">
                      <p className="text-[10px] text-zinc-400">Leads</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{dynamicLeadsCount}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950/40 p-1.5 rounded">
                      <p className="text-[10px] text-zinc-400">Earned</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">${dynamicEarned.toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950/40 p-1.5 rounded">
                      <p className="text-[10px] text-zinc-400">Paid Out</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">${(partner.totalCommissionPaid || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-1.5 flex-wrap">
                    <span className="text-[11px] text-zinc-500">
                      Pending: <strong className={pendingDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-700 dark:text-zinc-300'}>${pendingDue.toLocaleString()}</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(partner)}
                        className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700/60 px-2 py-1 rounded font-medium transition-colors cursor-pointer"
                      >
                        Edit Rate / Info
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPartnerForPayout(partner);
                          setPayoutAmount(pendingDue > 0 ? pendingDue : 500);
                        }}
                        className="text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 px-2 py-1 rounded font-medium transition-colors cursor-pointer"
                      >
                        Payout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPartners.length === 0 && (
            <div className="col-span-full p-8 text-center bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
              <GlobeAltIcon className="h-8 w-8 mx-auto text-zinc-400 mb-2 opacity-60" />
              <p className="font-medium text-zinc-700 dark:text-zinc-300">No partner agencies found</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Click &quot;Add Partner Agency&quot; to expand your agency network.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cross-Agency Referral Tracker */}
      <div className="mt-4 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowPathRoundedSquareIcon className="h-4 w-4 text-indigo-500" />
            <span>Outbound / Inbound Referral Log</span>
          </div>
          <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded font-medium">
            {referredLeads.length} Tracked Inquiries
          </span>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
          {referredLeads.length > 0 ? (
            referredLeads.map((lead) => {
              const matchedPartner = partnerAgencies.find(
                (p) => lead.referringPartner && p.name.toLowerCase() === lead.referringPartner.toLowerCase()
              );
              const partnerName = matchedPartner?.name || lead.referringPartner || 'External Referral';

              return (
                <div
                  key={lead.id}
                  className="px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-200">{lead.name}</span>
                      {lead.company && <span className="text-[11px] text-zinc-500">({lead.company})</span>}
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.2 rounded">
                        {lead.serviceType}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Partner: <strong className="text-zinc-700 dark:text-zinc-300">{partnerName}</strong> • Mode: {lead.handlingMode}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                        ${(lead.quoteAmount || 3000).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Fee: {lead.referralCommissionRate || 10}% (${((lead.referralCommissionAmount || ((lead.quoteAmount || 3000) * (lead.referralCommissionRate || 10) / 100))).toLocaleString()})
                      </p>
                    </div>

                    <Link
                      href="/leads"
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700/60 px-2.5 py-1 rounded font-medium text-zinc-800 dark:text-zinc-200 transition-colors shrink-0"
                    >
                      View Lead
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs">
              No referral inquiries logged yet. When leads are transferred to partners or received as referrals, they appear here.
            </div>
          )}
        </div>
      </div>

      {/* Add Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Register Agency Partner
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Add an agency for referral kickbacks and white-label fulfillment
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Agency / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nova Motion Labs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., David Chen"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Default Fee (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.defaultCommissionRate}
                    onChange={(e) => setFormData({ ...formData, defaultCommissionRate: Number(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@agency.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Fulfillment Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g., Native iOS Apps / Swift / Kotlin"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-lg transition-colors shadow-xs"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payout Modal */}
      {selectedPartnerForPayout && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Record Commission Payout
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {selectedPartnerForPayout.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartnerForPayout(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Payout Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  step="50"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 font-semibold"
                />
              </div>

              <p className="text-[11px] text-zinc-500">
                This will record the payment settlement against {selectedPartnerForPayout.name}&apos;s account balance.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForPayout(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Edit Partner Agency
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Update agreed referral commission rate & contact information
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Agency / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Agreed Commission Fee (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={editFormData.defaultCommissionRate}
                    onChange={(e) => setEditFormData({ ...editFormData, defaultCommissionRate: Number(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-indigo-300 dark:border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Fulfillment Specialization
                </label>
                <input
                  type="text"
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <p className="text-[10px] text-zinc-500">
                Updating the agreed commission fee will automatically apply as the locked rate for all future leads from this partner.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-lg transition-colors shadow-xs"
                >
                  Save Partner Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
