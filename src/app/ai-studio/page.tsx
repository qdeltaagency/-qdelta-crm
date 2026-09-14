'use client';

import React, { useState } from 'react';
import {
  SparklesIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { ServicePillar } from '@/lib/types';

export default function AIStudioPage() {
  const { leads, settings } = useCRM();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'sow' | 'qualifier'>('sow');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedSow, setCopiedSow] = useState(false);

  // SOW Generator State
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [clientName, setClientName] = useState('Acme Corporation');
  const [projectName, setProjectName] = useState('Next.js 15 High-Conversion Flagship Platform');
  const [servicePillar, setServicePillar] = useState<ServicePillar>('Web Design & Full-Stack');
  const [budget, setBudget] = useState(8500);
  const [timeline, setTimeline] = useState('4 Weeks Sprint');
  const [tone, setTone] = useState<'Executive & High-Impact' | 'Technical & Rigorous' | 'Modern Startup & Dynamic'>('Executive & High-Impact');

  // Generated Output State
  const [generatedSOW, setGeneratedSOW] = useState<{
    executiveSummary: string;
    scopeHighlights: string[];
    milestones: { title: string; timeline: string; payment: string }[];
    techStack: string[];
    clientPitchEmail: string;
  } | null>({
    executiveSummary:
      'Qdelta Agency will architect, design, and engineer a flagship Next.js application tailored for high-conversion user acquisition, sub-50ms global edge delivery, and bespoke interactive motion shaders.',
    scopeHighlights: [
      'Comprehensive UI/UX design system in Figma with dark/light theme tokens.',
      'Next.js App Router full-stack architecture with React 19 Server Components.',
      'Interactive 3D / WebGL motion animations and Framer Motion micro-interactions.',
      'Automated Supabase database schema & real-time webhook pipeline.',
      'SEO metadata optimization, sub-second LCP caching, and responsive mobile polish.',
    ],
    milestones: [
      { title: 'Stage 1: Asset Discovery & Wireframe Architecture', timeline: 'Week 1', payment: 'Deposit (30%) - $2,550' },
      { title: 'Stage 2: Core Engineering & CMS / Backend Integrations', timeline: 'Week 2-3', payment: 'Milestone 2 (35%) - $2,975' },
      { title: 'Stage 3: Staging Review & Revisions Walkthrough', timeline: 'Week 4', payment: 'Client Approval Sprint' },
      { title: 'Stage 4: Production DNS Launch & Final Handover', timeline: 'Week 4+', payment: 'Final Launch (35%) - $2,975' },
    ],
    techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Framer Motion', 'Vercel Edge'],
    clientPitchEmail: `Hi there,\n\nFollowing our discovery discussion, we've structured a comprehensive Statement of Work (SOW) for ${projectName}.\n\nOur sprint covers end-to-end design, full-stack Next.js engineering, and sub-second performance tuning for a fixed investment of $8,500 split into 3 milestones (30% deposit to initiate sprint, 35% at mid-development review, 35% upon final production sign-off).\n\nLet us know if you'd like to review the Figma wireframes or if you're ready for the kickoff link!\n\nBest regards,\nQdelta Team`,
  });

  // Qualifier State
  const [qualifyDetails, setQualifyDetails] = useState('');
  const [qualifyBudget, setQualifyBudget] = useState(6000);
  const [qualifyTimeline, setQualifyTimeline] = useState('3 Weeks');
  const [qualifyResult, setQualifyResult] = useState<{
    score: number;
    grade: string;
    mode: string;
    risks: string[];
    strengths: string[];
  } | null>(null);

  // Auto-fill from lead selection
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setClientName(lead.company || lead.name);
      setProjectName(`${lead.serviceType} Sprint for ${lead.company || lead.name}`);
      setServicePillar(lead.serviceType);
      setBudget(lead.quoteAmount || 5000);
      setTimeline(lead.timeline || '4 Weeks Sprint');
    }
  };

  const handleGenerateSOW = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const deposit = Math.round(budget * 0.3);
      const milestone2 = Math.round(budget * 0.35);
      const finalPayment = Math.max(0, budget - deposit - milestone2);

      setGeneratedSOW({
        executiveSummary: `Qdelta will design, engineer, and deploy a bespoke ${servicePillar} solution for ${clientName}. This contract encompasses rapid iterative sprint delivery, high-performance architecture, and complete ownership transfer upon final settlement.`,
        scopeHighlights: [
          `Custom Figma visual design system crafted with ${tone.toLowerCase()} branding.`,
          `High-performance Next.js full-stack implementation with clean modular TypeScript components.`,
          `Automated database migrations, API integration, and edge-cached content delivery.`,
          `Cross-browser responsiveness, accessibility compliance, and mobile gesture refinement.`,
          `Production deploy to Vercel/AWS with custom domain SSL and automated backups.`,
        ],
        milestones: [
          { title: 'Stage 1: Discovery, Architecture & Figma Wireframes', timeline: 'Week 1', payment: `Deposit (30%) - $${deposit.toLocaleString()}` },
          { title: 'Stage 2: Frontend & Backend Core Development Sprint', timeline: 'Week 2-3', payment: `Milestone 2 (35%) - $${milestone2.toLocaleString()}` },
          { title: 'Stage 3: Staging Review Walkthrough & Client QA', timeline: 'Week 4', payment: 'Approval Sign-off' },
          { title: 'Stage 4: Production Handover & Live DNS Cutover', timeline: 'Week 4+', payment: `Final Launch (35%) - $${finalPayment.toLocaleString()}` },
        ],
        techStack: ['Next.js App Router', 'TypeScript', 'Tailwind CSS', 'Supabase PostgreSQL', 'Vercel Edge'],
        clientPitchEmail: `Hi ${clientName} team,\n\nFollowing up on our discussions, here is the tailored project plan and SOW for ${projectName}.\n\nKey Highlights:\n- Service: ${servicePillar}\n- Timeline: ${timeline}\n- Total Contract Value: $${budget.toLocaleString()} USD (30% deposit of $${deposit.toLocaleString()} / 35% milestone 2 of $${milestone2.toLocaleString()} / 35% final balance of $${finalPayment.toLocaleString()})\n\nWe are ready to initiate the design sprint immediately upon invoice confirmation.\n\nBest regards,\nQdelta Team`,
      });

      setIsGenerating(false);
      toast({
        title: 'AI Statement of Work Generated! ✨',
        description: `Created proposal package for ${clientName}.`,
      });
    }, 700);
  };

  const handleQualifyLead = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let score = 85;
      if (qualifyBudget < 3000) score -= 25;
      if (qualifyBudget >= 8000) score += 10;
      if (qualifyTimeline.includes('1 Week')) score -= 15;

      const mode = score >= 75 ? 'In-House Delivery' : qualifyBudget < 3000 ? 'White-Label / Partner Referral' : 'In-House';

      setQualifyResult({
        score: Math.max(10, Math.min(98, score)),
        grade: score >= 80 ? 'Grade A (High Value / High Win)' : score >= 60 ? 'Grade B (Standard)' : 'Grade C (High Risk / Low Margin)',
        mode,
        risks: [
          qualifyTimeline.includes('1') ? 'Compressed timeline: Requires overtime or scope trim.' : 'Standard delivery timeline manageable.',
          qualifyBudget < 3500 ? 'Budget constraint: Margin may be tight for bespoke 3D motion.' : 'Budget aligns well with expected development velocity.',
        ],
        strengths: [
          'High client clarity on functional requirements.',
          'Strong upside for recurring monthly maintenance retainer.',
        ],
      });

      setIsGenerating(false);
      toast({
        title: 'AI Qualification Completed 🎯',
        description: `Lead evaluated with score of ${score}/100.`,
      });
    }, 600);
  };

  const copyToClipboard = (text: string, type: 'pitch' | 'sow') => {
    navigator.clipboard.writeText(text);
    if (type === 'pitch') {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else {
      setCopiedSow(true);
      setTimeout(() => setCopiedSow(false), 2000);
    }
    toast({
      title: 'Copied to Clipboard! 📋',
      description: 'Content ready to paste into email or client document.',
    });
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-amber-500" />
            <span>AI Studio & Proposal Generator</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Generate client Statements of Work (SOW), tailored milestone structures, and automated deal qualification
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('sow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sow'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <DocumentTextIcon className="h-3.5 w-3.5" />
            <span>SOW Generator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualifier')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qualifier'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            <span>Lead Qualifier</span>
          </button>
        </div>
      </div>

      {activeTab === 'sow' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* SOW Inputs Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                <CpuChipIcon className="h-4 w-4 text-indigo-500" />
                <span>Proposal Parameters</span>
              </h2>
              <p className="text-[11px] text-zinc-500">Configure parameters or link an inbound lead</p>
            </div>

            {leads.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Import Details from Active Lead
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleSelectLead(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="">-- Manual Entry / Custom Client --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} {l.company ? `(${l.company})` : ''} - {l.serviceType}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Client / Company Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Project Scope Title *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Service Pillar
                </label>
                <select
                  value={servicePillar}
                  onChange={(e) => setServicePillar(e.target.value as ServicePillar)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="Landing Pages">Landing Pages</option>
                  <option value="Web Design & Full-Stack">Web Design & Full-Stack</option>
                  <option value="AI Solutions & Smart Workflows">AI Solutions & Smart Workflows</option>
                  <option value="UI/UX Redesign & Overhaul">UI/UX Redesign & Overhaul</option>
                  <option value="Mobile App MVP">Mobile App MVP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Budget ($ USD)
                </label>
                <input
                  type="number"
                  min="500"
                  step="250"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Timeline
                </label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Proposal Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="Executive & High-Impact">Executive & High-Impact</option>
                  <option value="Technical & Rigorous">Technical & Rigorous</option>
                  <option value="Modern Startup & Dynamic">Modern Startup & Dynamic</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateSOW}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <SparklesIcon className="h-4 w-4 text-amber-400" />
              <span>{isGenerating ? 'Generating Structured SOW...' : 'Generate AI Proposal & SOW'}</span>
            </button>
          </div>

          {/* SOW Generated Output (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs space-y-4">
            {generatedSOW ? (
              <>
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                  <div>
                    <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                      <DocumentTextIcon className="h-4 w-4 text-indigo-500" />
                      <span>Statement of Work (SOW) Preview</span>
                    </h2>
                    <p className="text-[11px] text-zinc-500">{projectName} • ${(budget).toLocaleString()} USD</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `# STATEMENT OF WORK (SOW)\n\nClient: ${clientName}\nProject: ${projectName}\nContract Value: ${budget.toLocaleString()} USD\n\n## Executive Summary\n${generatedSOW.executiveSummary}\n\n## Key Deliverables\n${generatedSOW.scopeHighlights.map((s) => `- ${s}`).join('\n')}\n\n## Milestone Payment Schedule\n${generatedSOW.milestones.map((m) => `- ${m.title} (${m.timeline}): ${m.payment}`).join('\n')}`,
                          'sow'
                        )
                      }
                      className="text-xs border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSow ? <CheckIcon className="h-3.5 w-3.5 text-emerald-500" /> : <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" />}
                      <span>{copiedSow ? 'Copied SOW' : 'Copy SOW'}</span>
                    </button>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/70 dark:border-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Executive Summary
                  </p>
                  <p className="leading-relaxed">{generatedSOW.executiveSummary}</p>
                </div>

                {/* Scope Highlights */}
                <div className="space-y-1.5">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">
                    Scope of Deliverables:
                  </p>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {generatedSOW.scopeHighlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4-Stage Milestone Schedule */}
                <div className="space-y-1.5">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">
                    4-Stage Milestone & Payment Schedule:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {generatedSOW.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200/70 dark:border-zinc-800/60 text-xs"
                      >
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{m.title}</p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                          <span>{m.timeline}</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{m.payment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pitch Email Draft */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                      <EnvelopeIcon className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Ready-to-Send Client Pitch Email</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedSOW.clientPitchEmail, 'pitch')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPitch ? <CheckIcon className="h-3 w-3" /> : <ClipboardDocumentIcon className="h-3 w-3" />}
                      <span>{copiedPitch ? 'Copied Pitch' : 'Copy Email'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={generatedSOW.clientPitchEmail}
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none resize-none"
                  />
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-zinc-400 text-xs">
                Configure parameters on the left and click &quot;Generate AI Proposal&quot;.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Lead Qualifier Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                <span>Lead Qualification Evaluator</span>
              </h2>
              <p className="text-[11px] text-zinc-500">Assess deal viability, margin health, and risks</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Project Scope & Client Context
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Client needs a full WebGL 3D landing page with Supabase auth and Stripe checkout for SaaS launch."
                value={qualifyDetails}
                onChange={(e) => setQualifyDetails(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Budget ($ USD)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={qualifyBudget}
                  onChange={(e) => setQualifyBudget(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Requested Timeline
                </label>
                <select
                  value={qualifyTimeline}
                  onChange={(e) => setQualifyTimeline(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="1 Week (Urgent)">1 Week (Urgent)</option>
                  <option value="2-3 Weeks">2-3 Weeks</option>
                  <option value="4-6 Weeks">4-6 Weeks</option>
                  <option value="8+ Weeks Enterprise">8+ Weeks Enterprise</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleQualifyLead}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <SparklesIcon className="h-4 w-4 text-emerald-400" />
              <span>{isGenerating ? 'Analyzing Scope...' : 'Evaluate Deal Score & Risks'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs space-y-4">
            {qualifyResult ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                  <div>
                    <h2 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                      Qualification Verdict
                    </h2>
                    <p className="text-[11px] text-zinc-500">{qualifyResult.grade}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {qualifyResult.score}/100
                    </span>
                    <p className="text-[10px] text-zinc-400">Quality Score</p>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/70 dark:border-zinc-800/60 space-y-1 text-xs">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200">
                    Recommended Handling Mode:
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                    {qualifyResult.mode}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">Key Risk Factors:</p>
                  <ul className="space-y-1 text-xs text-rose-600 dark:text-rose-400">
                    {qualifyResult.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>⚠️</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">Deal Strengths:</p>
                  <ul className="space-y-1 text-xs text-emerald-600 dark:text-emerald-400">
                    {qualifyResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400 text-xs">
                Fill in scope criteria on the left to run an automated deal quality analysis.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
