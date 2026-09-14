'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderOpenIcon,
  UserCircleIcon,
  GlobeAltIcon,
  PlusIcon,
  CreditCardIcon,
  DocumentTextIcon,
  LinkIcon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { ProjectStatus, ServicePillar } from '@/lib/types';

const STAGES: { id: ProjectStatus; name: string; desc: string; iconNumber: string }[] = [
  { id: 'Planning', name: '1. Onboarding & Kickoff', desc: 'Deposit authorized & asset discovery', iconNumber: '1' },
  { id: 'In Progress', name: '2. Design & Build Sprint', desc: 'Architecture, UI/UX & full-stack code', iconNumber: '2' },
  { id: 'Client Review', name: '3. QA & Staging Preview', desc: 'Client walkthrough & approval revisions', iconNumber: '3' },
  { id: 'Launched', name: '4. Production Launch & Handover', desc: 'Final launch & balance settlement', iconNumber: '4' },
];

export default function OrganizationWorkspacePage() {
  const params = useParams();
  const clientId = typeof params?.clientId === 'string' ? params.clientId : '';
  const { toast } = useToast();
  const {
    clients,
    projects,
    payments,
    leads,
    isHydrated,
    updateProject,
    addProject,
    addPayment,
    updateClient,
    toggleOnboardingItem,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'projects' | 'payments' | 'onboarding'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // New Project Form State
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    servicePillar: 'Web Design & Full-Stack App' as ServicePillar,
    contractValue: 5000,
    currency: 'USD',
  });

  const client = clients.find((c) => c.id === clientId);

  const clientProjects = client
    ? projects.filter(
        (p) =>
          p.clientId === client.id ||
          (client.organizationName && p.clientName?.toLowerCase() === client.organizationName.toLowerCase())
      )
    : [];

  const activeProject = selectedProjectId
    ? clientProjects.find((p) => p.id === selectedProjectId) || null
    : null;

  const clientPayments = client
    ? payments.filter(
        (p) =>
          p.clientId === client.id ||
          (client.leadId && p.leadId === client.leadId) ||
          (client.organizationName && p.clientName?.toLowerCase() === client.organizationName.toLowerCase())
      )
    : [];

  const linkedLead = leads.find(
    (l) =>
      (client?.leadId && l.id === client.leadId) ||
      (client?.email && l.email.toLowerCase() === client.email.toLowerCase()) ||
      (client?.organizationName && l.company && l.company.toLowerCase() === client.organizationName.toLowerCase())
  );

  const isOrg = client?.clientType !== 'Individual';
  const company = client?.organizationName || 'Account Workspace';
  const contact = client?.primaryContactName || 'Primary Contact';
  const email = client?.email || '';
  const phone = client?.phone || '';

  // Aggregate financials
  const totalLtv = client?.totalLtv || clientProjects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
  const totalPaid = client?.totalPaid || clientPayments.filter((p) => p.status === 'Paid').reduce((acc, p) => acc + (p.amount || 0), 0);
  const remainingDue = Math.max(0, totalLtv - totalPaid);

  const handleStageClick = (targetStatus: ProjectStatus) => {
    if (!activeProject) return;
    updateProject(activeProject.id, {
      status: targetStatus,
      progressPercent:
        targetStatus === 'Planning'
          ? 20
          : targetStatus === 'In Progress'
          ? 60
          : targetStatus === 'Client Review'
          ? 85
          : 100,
    });
    toast({
      type: 'success',
      title: 'Project Stage Updated',
      description: `${activeProject.title} advanced to "${targetStatus}".`,
    });
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !newProjectData.title.trim()) {
      toast({
        title: 'Missing title',
        description: 'Please enter a project title.',
        type: 'error',
      });
      return;
    }

    const val = Number(newProjectData.contractValue) || 0;
    const targetLaunch = new Date();
    targetLaunch.setDate(targetLaunch.getDate() + 28);

    const created = addProject({
      clientId: client.id,
      clientName: client.organizationName,
      title: newProjectData.title.trim(),
      servicePillar: newProjectData.servicePillar,
      contractValue: val,
      currency: newProjectData.currency || 'USD',
      status: 'Planning',
      progressPercent: 15,
      startDate: new Date().toISOString().split('T')[0],
      targetLaunchDate: targetLaunch.toISOString().split('T')[0],
      milestones: [
        { id: `m1-${Date.now()}`, title: '1. Discovery & Architecture Sprint', completed: true, dueDate: 'Week 1' },
        { id: `m2-${Date.now()}`, title: '2. Core Build & Integration', completed: false, dueDate: 'Week 2-3' },
        { id: `m3-${Date.now()}`, title: '3. QA Review & Staging Sandbox', completed: false, dueDate: 'Week 4' },
        { id: `m4-${Date.now()}`, title: '4. Production Launch & Handover', completed: false, dueDate: 'Week 4+' },
      ],
    });

    // Generate 30% upfront deposit invoice automatically
    const depositAmt = Math.round(val * 0.3);
    if (depositAmt > 0) {
      addPayment({
        clientId: client.id,
        clientName: client.organizationName,
        amount: depositAmt,
        currency: 'USD',
        type: 'Deposit (30%)',
        status: 'Pending',
        paymentLink: `https://paypal.me/qdeltastudio/${depositAmt}USD`,
        receiptSent: false,
      });
    }

    // Update Client LTV
    const newLtv = (client.totalLtv || 0) + val;
    updateClient(client.id, {
      totalLtv: newLtv,
    });

    setSelectedProjectId(created.id);
    setIsAddProjectModalOpen(false);
    setNewProjectData({
      title: '',
      servicePillar: 'Web Design & Full-Stack App',
      contractValue: 5000,
      currency: 'USD',
    });

    toast({
      type: 'success',
      title: 'Project Added to Account! 🚀',
      description: `Attached "${created.title}" to ${client.organizationName}.`,
    });
  };

  if (!isHydrated && !client) {
    return (
      <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-6 md:p-8 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48" />
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-72 mt-2" />
      </div>
    );
  }

  if (isHydrated && !client) {
    return (
      <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-8 rounded-xl text-center space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm">
        <BuildingOffice2Icon className="h-12 w-12 text-zinc-400 mx-auto" />
        <h1 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Account Workspace Not Found
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          No active organization or client record exists for ID <span className="font-mono text-zinc-700 dark:text-zinc-300">{clientId}</span>.
        </p>
        <div className="pt-2">
          <Link
            href="/organizations"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Return to Organizations Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <Link
          href="/organizations"
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to Organizations</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddProjectModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Main Header / Account Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <BuildingOffice2Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>{company}</span>
            </h1>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isOrg ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'}`}>
              {isOrg ? '🏢 Organization' : '👤 Individual Client'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex-wrap">
            <span>Primary Contact: <strong className="text-zinc-800 dark:text-zinc-200">{contact}</strong></span>
            {email && <span className="flex items-center gap-1"><EnvelopeIcon className="h-3.5 w-3.5" /> {email}</span>}
            {phone && <span className="flex items-center gap-1"><PhoneIcon className="h-3.5 w-3.5" /> {phone}</span>}
            {client?.country && <span className="flex items-center gap-1"><GlobeAltIcon className="h-3.5 w-3.5" /> {client.country}</span>}
            {client?.createdAt && (
              <span className="text-[11px] text-zinc-400 font-mono">
                • Client since {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3 Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Card 1: Total Account LTV */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium uppercase tracking-wider">Account Lifetime LTV</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono tracking-tight">
            ${totalLtv.toLocaleString()} USD
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">{clientProjects.length} project{clientProjects.length === 1 ? '' : 's'} contracted</p>
        </div>

        {/* Card 2: Total Collected */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium uppercase tracking-wider">Total Collected</p>
            <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              ✓ Settled
            </span>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tracking-tight">
            ${totalPaid.toLocaleString()} USD
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Realized revenue to date</p>
        </div>

        {/* Card 3: Remaining Balance */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium uppercase tracking-wider">Milestone & Launch Balance</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${remainingDue === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
              {remainingDue === 0 ? '✓ Paid in Full' : '⏳ Scheduled'}
            </span>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono tracking-tight">
            ${remainingDue.toLocaleString()} USD
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Due upon sprint milestones & launch</p>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'projects'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FolderOpenIcon className="h-3.5 w-3.5" />
          <span>Projects ({clientProjects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <CreditCardIcon className="h-3.5 w-3.5" />
          <span>Invoices & Payments ({clientPayments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'onboarding'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <DocumentTextIcon className="h-3.5 w-3.5" />
          <span>Onboarding & Notes</span>
        </button>
      </div>

      {/* TAB 1: PROJECTS & SPRINTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {activeProject ? (
            /* INSIDE PROJECT WORKSPACE VIEW */
            <div className="space-y-4">
              {/* Back to Projects List Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-2xs self-start"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>← Back to All Projects</span>
                </button>

                <div className="flex items-center gap-3 flex-wrap">
                  {clientProjects.length > 1 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-zinc-400 text-[11px]">Jump to:</span>
                      <select
                        value={activeProject.id}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                      >
                        {clientProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} (${p.contractValue.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Full Projects Hub</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>

              {/* Project Overview Card */}
              <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 p-4 rounded-xl shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {activeProject.title}
                      </h2>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30">
                        {activeProject.servicePillar}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex-wrap">
                      <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        Contract Value: ${activeProject.contractValue.toLocaleString()} {activeProject.currency || 'USD'}
                      </span>
                      {activeProject.targetLaunchDate && (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
                          Target Launch: {activeProject.targetLaunchDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 self-start sm:self-center">
                    Status: <strong className="text-indigo-600 dark:text-indigo-400">{activeProject.status}</strong> ({activeProject.progressPercent}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, activeProject.progressPercent))}%` }}
                  />
                </div>
              </div>

              {/* Project Lifecycle Stepper */}
              <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Sprint Lifecycle Delivery
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Click any stage to advance delivery status
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                  {STAGES.map((st) => {
                    const isCurrent = activeProject.status === st.id;
                    const stageOrder: ProjectStatus[] = ['Planning', 'In Progress', 'Client Review', 'Launched'];
                    const isPassed = stageOrder.indexOf(activeProject.status) >= stageOrder.indexOf(st.id);

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStageClick(st.id)}
                        className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-500/30 ring-2 ring-indigo-500/20'
                            : isPassed
                            ? 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-100'
                            : 'bg-white border-zinc-200/60 dark:bg-zinc-950/40 dark:border-zinc-800/60 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-zinc-400">Step {st.iconNumber}</span>
                          {isPassed && <CheckIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{st.name}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{st.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3-Stage Milestone Payment Schedule & Stage Triggers Card */}
              {(() => {
                const p1Amt = Math.round(activeProject.contractValue * 0.30);
                const p2Amt = Math.round(activeProject.contractValue * 0.35);
                const p3Amt = activeProject.contractValue - p1Amt - p2Amt;

                const pay1 = clientPayments.find((p) => p.type.includes('30%') || p.type.includes('Deposit'));
                const pay2 = clientPayments.find((p) => p.type.includes('Milestone 2') || p.type.includes('Mid-Dev') || (p.amount === p2Amt && p.id.includes('-2')));
                const pay3 = clientPayments.find((p) => p.type.includes('Final') || p.type.includes('Launch') || (p.amount === p3Amt && p.id.includes('-3')));

                const isM2Due = activeProject.status === 'In Progress' || activeProject.status === 'Client Review';
                const isM3Due = activeProject.status === 'Client Review' || activeProject.status === 'Launched';

                return (
                  <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCardIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <span>3-Part Milestone Payments & Financial Triggers</span>
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Payments automatically trigger and unlock as the project advances through sprint stages
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        Total: <strong className="text-zinc-900 dark:text-zinc-100">${activeProject.contractValue.toLocaleString()} {activeProject.currency || 'USD'}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {/* Milestone 1: 30% Kickoff */}
                      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Part 1 • 30% Kickoff</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              ✓ Paid & Settled
                            </span>
                          </div>
                          <p className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                            ${p1Amt.toLocaleString()} {activeProject.currency || 'USD'}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Unlocked at Step 1 (Kickoff deposit authorized)
                          </p>
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          <span>Kickoff Authorized</span>
                        </div>
                      </div>

                      {/* Milestone 2: 35% Mid-Dev */}
                      <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                        pay2?.status === 'Paid'
                          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40'
                          : isM2Due
                          ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/10 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 opacity-75'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Part 2 • 35% Mid-Dev</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              pay2?.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                : isM2Due
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 animate-pulse'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                            }`}>
                              {pay2?.status === 'Paid' ? '✓ Paid' : isM2Due ? '⚡ Due Now (Step 2/3)' : '⏳ Scheduled'}
                            </span>
                          </div>
                          <p className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                            ${p2Amt.toLocaleString()} {activeProject.currency || 'USD'}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Due upon Design & Build sprint approval
                          </p>
                        </div>

                        <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                          <span className={`text-[10px] font-medium ${isM2Due && pay2?.status !== 'Paid' ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-zinc-400'}`}>
                            {isM2Due ? 'Sprint Reached' : 'Pending Step 2'}
                          </span>
                          {pay2?.paymentLink && pay2?.status !== 'Paid' && (
                            <a
                              href={pay2.paymentLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Payment Link</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Milestone 3: 35% Final Launch */}
                      <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                        pay3?.status === 'Paid'
                          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40'
                          : isM3Due
                          ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/40 dark:bg-rose-500/10 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 opacity-75'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Part 3 • 35% Launch</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              pay3?.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                : isM3Due
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 animate-pulse'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                            }`}>
                              {pay3?.status === 'Paid' ? '✓ Paid' : isM3Due ? '🚀 Due for Launch' : '⏳ Scheduled'}
                            </span>
                          </div>
                          <p className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                            ${p3Amt.toLocaleString()} {activeProject.currency || 'USD'}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Due before DNS release & handover
                          </p>
                        </div>

                        <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                          <span className={`text-[10px] font-medium ${isM3Due && pay3?.status !== 'Paid' ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-zinc-400'}`}>
                            {isM3Due ? 'Launch Stage' : 'Pending Step 4'}
                          </span>
                          {pay3?.paymentLink && pay3?.status !== 'Paid' && (
                            <a
                              href={pay3.paymentLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Payment Link</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Milestones & Deliverables */}
              <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Sprint Milestones & Checklist
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {activeProject.milestones?.filter((m) => m.completed).length || 0} of {activeProject.milestones?.length || 0} completed
                  </span>
                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                  {activeProject.milestones && activeProject.milestones.length > 0 ? (
                    activeProject.milestones.map((m) => (
                      <div
                        key={m.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => toggleMilestone(activeProject.id, m.id)}
                          className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                        >
                          <div className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${m.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                            {m.completed && <CheckIcon className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className={`font-medium ${m.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {m.title}
                          </span>
                        </button>
                        {m.dueDate && <span className="text-[10px] text-zinc-400 font-mono">{m.dueDate}</span>}
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-xs text-zinc-400 text-center">No milestones created yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* PROJECTS LIST VIEW */
            <div className="space-y-3">
              {/* Header with Title and Add Project Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                    <FolderOpenIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Contracted Projects ({clientProjects.length})</span>
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Select a project to inspect deliverables, sprint stages, and milestones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Add New Project</span>
                </button>
              </div>

              {clientProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {clientProjects.map((proj) => {
                    const completedMilestones = proj.milestones?.filter((m) => m.completed).length || 0;
                    const totalMilestones = proj.milestones?.length || 0;

                    return (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className="group p-4 bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Left: Project title & metadata */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {proj.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30">
                              {proj.servicePillar}
                            </span>
                          </div>

                          <div className="flex items-center gap-3.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              ${proj.contractValue.toLocaleString()} {proj.currency || 'USD'}
                            </span>
                            {proj.targetLaunchDate && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
                                Target Launch: {proj.targetLaunchDate}
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-400">
                              • {completedMilestones} of {totalMilestones} milestones complete
                            </span>
                          </div>
                        </div>

                        {/* Right: Progress bar & Open Button */}
                        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                          <div className="w-36 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{proj.status}</span>
                              <span className="font-mono text-zinc-500">{proj.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(0, proj.progressPercent))}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                            <span>Open Project</span>
                            <ChevronRightIcon className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-xl text-center space-y-3">
                  <FolderOpenIcon className="h-10 w-10 text-zinc-400 mx-auto" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">No projects attached to this account yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddProjectModalOpen(true)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    + Add First Project
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENTS & INVOICES */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Installment Schedule & Invoices
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {clientPayments.length > 0 ? (
              clientPayments.map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{p.type}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {p.paidAt ? `Settled on ${new Date(p.paidAt).toLocaleDateString()}` : 'Awaiting payment authorization'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                      ${p.amount.toLocaleString()} USD
                    </div>
                    {p.paymentLink && p.status !== 'Paid' && (
                      <a
                        href={p.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 justify-end mt-0.5"
                      >
                        <span>Open Checkout</span>
                        <LinkIcon className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-zinc-400">No payment invoices logged for this account yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ONBOARDING & NOTES */}
      {activeTab === 'onboarding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Onboarding Checklist */}
          <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Client Onboarding Checklist
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { key: 'slackInvited', label: 'Slack Shared Connect / Discord Invited' },
                { key: 'brandAssets', label: 'Brand Assets & Logo Kit Received' },
                { key: 'credentials', label: 'Hosting & Domain Credentials Verified' },
                { key: 'kickoffBooked', label: 'Sprint Kickoff Call Scheduled' },
              ].map((item) => {
                const isChecked = Boolean(client?.onboardingStatus?.[item.key as keyof typeof client.onboardingStatus]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (client) toggleOnboardingItem(client.id, item.key as any);
                    }}
                    className="flex items-center gap-2.5 w-full text-left py-1 cursor-pointer"
                  >
                    <div className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                      {isChecked && <CheckIcon className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className={`font-medium ${isChecked ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-500'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discovery Notes & Signed Agreement */}
          <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Account Discovery & Contract Agreement
            </h3>
            <div className="text-xs space-y-2 text-zinc-600 dark:text-zinc-300">
              <p className="bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] leading-relaxed">
                {client?.notes || linkedLead?.details || 'No discovery notes recorded.'}
              </p>
              {client?.contractAgreement?.signed && (
                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-[11px] space-y-1">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    <span>Signed MSA Agreement: {client.contractAgreement.agreementVersion || 'QDL-2026.1'}</span>
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 text-[10px]">
                    Signer: {client.contractAgreement.signerName} ({client.contractAgreement.signerTitle})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderOpenIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Attach New Project to {company}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProjectModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mobile App MVP or AI Agent Redesign"
                  value={newProjectData.title}
                  onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Service Pillar
                </label>
                <select
                  value={newProjectData.servicePillar}
                  onChange={(e) => setNewProjectData({ ...newProjectData, servicePillar: e.target.value as ServicePillar })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                >
                  <option value="Landing Page">Landing Page</option>
                  <option value="Multi-Page Website">Multi-Page Website</option>
                  <option value="Web Design & Full-Stack App">Web Design & Full-Stack App</option>
                  <option value="AI Agent & Next.js SaaS">AI Agent & Next.js SaaS</option>
                  <option value="Brand Identity & Design System">Brand Identity & Design System</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Contract Value ($ USD) *
                </label>
                <input
                  type="number"
                  required
                  value={newProjectData.contractValue}
                  onChange={(e) => setNewProjectData({ ...newProjectData, contractValue: Number(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                >
                  Create & Attach Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
