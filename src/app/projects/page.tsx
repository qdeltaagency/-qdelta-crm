'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  XMarkIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import {
  Search,
  Filter,
  ArrowUpRight,
  ChevronDown,
  Check,
  Zap,
} from 'lucide-react';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { ProjectStatus } from '@/lib/types';
import { Modal } from '@/components/ui/modal';

const STAGE_CONFIG: {
  id: ProjectStatus;
  title: string;
  countColor: string;
  badgeStyle: string;
}[] = [
  {
    id: 'Planning',
    title: 'Planning & Architecture',
    countColor: 'text-purple-600 dark:text-purple-400',
    badgeStyle: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
  },
  {
    id: 'In Progress',
    title: 'In Development',
    countColor: 'text-blue-600 dark:text-blue-400',
    badgeStyle: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
  },
  {
    id: 'Client Review',
    title: 'Client Review',
    countColor: 'text-amber-600 dark:text-amber-400',
    badgeStyle: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  },
  {
    id: 'Final Settlement',
    title: 'Final Settlement',
    countColor: 'text-orange-600 dark:text-orange-400',
    badgeStyle: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  },
  {
    id: 'Launched',
    title: 'Launched & Handover',
    countColor: 'text-emerald-600 dark:text-emerald-400',
    badgeStyle: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  },
];

export default function ProjectsPage() {
  const { projects, clients, updateProject } = useCRM();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isStageMenuOpen, setIsStageMenuOpen] = useState(false);
  const stageMenuRef = React.useRef<HTMLDivElement>(null);
  const [isDrawerPhaseOpen, setIsDrawerPhaseOpen] = useState(false);
  const drawerPhaseRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isViewingSowModal, setIsViewingSowModal] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stageMenuRef.current && !stageMenuRef.current.contains(e.target as Node)) {
        setIsStageMenuOpen(false);
      }
      if (drawerPhaseRef.current && !drawerPhaseRef.current.contains(e.target as Node)) {
        setIsDrawerPhaseOpen(false);
      }
    };
    if (isStageMenuOpen || isDrawerPhaseOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStageMenuOpen, isDrawerPhaseOpen]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedClient = clients.find((c) => c.id === selectedProject?.clientId);

  const filteredProjects = projects.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(search) ||
      (client && client.organizationName.toLowerCase().includes(search)) ||
      (p.clientName && p.clientName.toLowerCase().includes(search)) ||
      p.servicePillar.toLowerCase().includes(search);

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-4 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Title & Counter */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight">
              Global Projects Ledger
            </h1>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-0.5 rounded-full">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage active deliverables, client contracts, and full-stack sprints
          </p>
        </div>

        {/* Right Side: Search & Custom Dropdown Filter */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search Filter */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none stroke-[2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, clients..."
              className="w-40 sm:w-56 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Modern Stage Dropdown Filter */}
          <div className="relative shrink-0" ref={stageMenuRef}>
            <button
              type="button"
              onClick={() => setIsStageMenuOpen(!isStageMenuOpen)}
              className="bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 cursor-pointer flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0 stroke-[1.75]" />
              <span className="font-medium">
                {statusFilter === 'All'
                  ? `All Stages (${projects.length})`
                  : `${STAGE_CONFIG.find((s) => s.id === statusFilter)?.title || statusFilter} (${projects.filter((p) => p.status === statusFilter).length})`}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 ${isStageMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStageMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('All');
                    setIsStageMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    statusFilter === 'All'
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>All Stages</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800 px-1.5 py-0.2 rounded-full">
                      {projects.length}
                    </span>
                    {statusFilter === 'All' && <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />}
                  </div>
                </button>

                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

                {STAGE_CONFIG.map((stage) => {
                  const count = projects.filter((p) => p.status === stage.id).length;
                  const isSelected = statusFilter === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(stage.id);
                        setIsStageMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          stage.id === 'Planning' ? 'bg-purple-500' :
                          stage.id === 'In Progress' ? 'bg-blue-500' :
                          stage.id === 'Client Review' ? 'bg-amber-500' :
                          stage.id === 'Final Settlement' ? 'bg-orange-500' :
                          'bg-emerald-500'
                        }`} />
                        <span>{stage.title}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800 px-1.5 py-0.2 rounded-full">
                          {count}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Stage Summary Metric Boxes Side by Side */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {STAGE_CONFIG.map((stage) => {
          const count = projects.filter((p) => p.status === stage.id).length;
          const isSelected = statusFilter === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setStatusFilter(statusFilter === stage.id ? 'All' : stage.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900/10 dark:ring-zinc-100/20'
                  : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <p className={`text-[11px] font-medium uppercase tracking-wider ${isSelected ? 'text-zinc-300 dark:text-zinc-600 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {stage.title}
              </p>
              <p className={`text-lg md:text-xl font-bold font-mono mt-1 tracking-tight ${isSelected ? 'text-white dark:text-zinc-950' : stage.countColor}`}>
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Master List View Table */}
      <div className="mt-4 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 px-4 py-2.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold grid grid-cols-12 items-center">
          <div className="col-span-4">Project & Client</div>
          <div className="col-span-3">Production Phase</div>
          <div className="col-span-2">Target Delivery</div>
          <div className="col-span-2">Budget Value</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50 text-xs">
          {filteredProjects.map((project) => {
            const client = clients.find((c) => c.id === project.clientId);
            const clientName = client?.organizationName || project.clientName || 'Direct Client';
            const stageConfig = STAGE_CONFIG.find((s) => s.id === project.status) || STAGE_CONFIG[0];

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors grid grid-cols-12 items-center cursor-pointer"
              >
                {/* 1. Project & Client */}
                <div className="col-span-4 pr-2">
                  <p className="text-zinc-900 dark:text-zinc-200 font-semibold text-xs md:text-sm hover:text-indigo-600 transition-colors">
                    {project.title}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 flex items-center gap-1">
                    <BuildingOfficeIcon className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
                    <span>{clientName}</span>
                  </p>
                </div>

                {/* 2. Production Phase Status Badge */}
                <div className="col-span-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border inline-block ${stageConfig.badgeStyle}`}>
                    {stageConfig.title}
                  </span>
                </div>

                {/* 3. Target Delivery */}
                <div className="col-span-2">
                  <span className="text-zinc-700 dark:text-zinc-300 text-xs">
                    {project.targetLaunchDate || '4 Weeks Sprint'}
                  </span>
                </div>

                {/* 4. Budget */}
                <div className="col-span-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs font-mono">
                    ${project.contractValue.toLocaleString()} {project.currency || 'USD'}
                  </span>
                </div>

                {/* 5. Action */}
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProjectId(project.id);
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    Manage →
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No active projects found. When leads are converted, their projects will automatically appear here.
            </div>
          )}
        </div>
      </div>

      {/* SLIDE-OUT PROJECT & MILESTONE MANAGER DRAWER */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedProjectId(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <aside className="relative w-full max-w-lg bg-white dark:bg-[#141416] border-l border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl z-10 space-y-6 animate-fade-in">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <BuildingOfficeIcon className="h-3.5 w-3.5" />
                    <span>{selectedClient?.organizationName || selectedProject.clientName}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Status Stepper / Dropdown */}
              <div className="space-y-1.5 relative" ref={drawerPhaseRef}>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Project Production Phase</span>
                  <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400">
                    {selectedProject.progressPercent || 20}% Sprint Progress
                  </span>
                </label>

                {(() => {
                  const currentStage = STAGE_CONFIG.find((s) => s.id === selectedProject.status) || STAGE_CONFIG[0];
                  return (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDrawerPhaseOpen(!isDrawerPhaseOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${currentStage.badgeStyle}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${
                              currentStage.id === 'Planning'
                                ? 'bg-purple-500'
                                : currentStage.id === 'In Progress'
                                ? 'bg-blue-500'
                                : currentStage.id === 'Client Review'
                                ? 'bg-amber-500'
                                : currentStage.id === 'Final Settlement'
                                ? 'bg-orange-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span className="truncate">{currentStage.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-zinc-400 ${
                            isDrawerPhaseOpen ? 'rotate-180 text-zinc-900 dark:text-white' : ''
                          }`}
                        />
                      </button>

                      {isDrawerPhaseOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDrawerPhaseOpen(false)}
                          />
                          <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#161618] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 space-y-1 animate-fade-in backdrop-blur-md">
                            {STAGE_CONFIG.map((col) => {
                              const isSelected = selectedProject.status === col.id;
                              const defaultProgress =
                                col.id === 'Planning'
                                  ? 20
                                  : col.id === 'In Progress'
                                  ? 50
                                  : col.id === 'Client Review'
                                  ? 75
                                  : col.id === 'Final Settlement'
                                  ? 90
                                  : 100;

                              return (
                                <button
                                  key={col.id}
                                  type="button"
                                  onClick={() => {
                                    updateProject(selectedProject.id, {
                                      status: col.id,
                                      progressPercent: defaultProgress,
                                    });
                                    setIsDrawerPhaseOpen(false);
                                    toast({
                                      type: 'success',
                                      title: 'Production Phase Updated',
                                      description: `Project moved to "${col.title}".`,
                                    });
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    isSelected
                                      ? `${col.badgeStyle} font-semibold`
                                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`h-2 w-2 rounded-full ${
                                        col.id === 'Planning'
                                          ? 'bg-purple-500'
                                          : col.id === 'In Progress'
                                          ? 'bg-blue-500'
                                          : col.id === 'Client Review'
                                          ? 'bg-amber-500'
                                          : col.id === 'Final Settlement'
                                          ? 'bg-orange-500'
                                          : 'bg-emerald-500'
                                      }`}
                                    />
                                    <span>{col.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                                      {defaultProgress}%
                                    </span>
                                    {isSelected && <Check className="h-3.5 w-3.5" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Project Overview & Deliverable Details Card */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Project Overview
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Service Pillar</p>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                      {selectedProject.servicePillar || 'Full-Stack Development'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Contract Value</p>
                    <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ${selectedProject.contractValue.toLocaleString()} {selectedProject.currency || 'USD'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Target Delivery</p>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {selectedProject.targetLaunchDate || '4 Weeks Sprint'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Start Date</p>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono">
                      {selectedProject.startDate || 'Immediate'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statement of Work (SOW) & Contract Document Card */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DocumentCheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Statement of Work (SOW)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-semibold">
                    {selectedProject.contractAgreement?.signed ? 'Signed & Sealed' : 'Active Contract'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {selectedProject.contractAgreement?.agreementVersion || `QDL-SOW-${selectedProject.id.slice(-6)}`} • ${selectedProject.contractValue.toLocaleString()} {selectedProject.currency || 'USD'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsViewingSowModal(true)}
                  className="w-full text-center bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-1"
                >
                  <DocumentTextIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>View & Print Signed SOW Document</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              {selectedClient && (
                <Link
                  href={`/organizations/${selectedClient.id}`}
                  className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Organization Workspace</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* SOW DOCUMENT MODAL */}
      {selectedProject && (
        <Modal
          isOpen={isViewingSowModal}
          onClose={() => setIsViewingSowModal(false)}
          title={selectedProject.title}
          subtitle={`SOW Document Ref: ${selectedProject.contractAgreement?.agreementVersion || `QDL-SOW-${selectedProject.id.slice(-6)}`} • ${selectedProject.servicePillar}`}
          icon={<DocumentCheckIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Header Box */}
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                  Statement of Work (SOW) — Sprint Agreement
                </p>
                <p className="text-[10px] text-indigo-800 dark:text-indigo-300 font-mono mt-0.5">
                  Target Launch: {selectedProject.targetLaunchDate || '4 Weeks'} • Service Pillar: {selectedProject.servicePillar}
                </p>
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ${selectedProject.contractValue.toLocaleString()} {selectedProject.currency || 'USD'}
              </span>
            </div>

            {/* 2-Installment Settlement Breakdown */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Project Settlement Schedule:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 uppercase font-semibold block">1st Installment (50% Deposit)</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ${Math.round(selectedProject.contractValue * 0.5).toLocaleString()} {selectedProject.currency || 'USD'}
                  </span>
                  <p className="text-[9px] text-emerald-700 dark:text-emerald-400 mt-0.5">Paid upon signing to reserve sprint</p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 uppercase font-semibold block">2nd Installment (50% Launch)</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    ${(selectedProject.contractValue - Math.round(selectedProject.contractValue * 0.5)).toLocaleString()} {selectedProject.currency || 'USD'}
                  </span>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Due upon staging review & final handover</p>
                </div>
              </div>
            </div>

            {/* Scope Deliverables */}
            <div className="p-3 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Project Scope & Deliverables:
              </p>
              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedProject.title}</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10">
                    {selectedProject.servicePillar}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Full turnkey delivery covering architecture planning, full-stack development, API integrations, QA & speed audit, and production cloud launch handover.
                </p>
              </div>
            </div>

            {/* Signature Seal */}
            <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-center space-y-1.5">
              <p className="text-[9px] text-zinc-400 uppercase font-mono">SOW Authorized Signature</p>
              {selectedProject.contractAgreement?.signatureDataUrl ? (
                <img
                  src={selectedProject.contractAgreement.signatureDataUrl}
                  alt="Client Signature"
                  className="h-12 max-w-full object-contain mx-auto"
                />
              ) : (
                <p className="text-2xl font-serif italic text-indigo-700 dark:text-indigo-400 tracking-wider">
                  {selectedProject.contractAgreement?.signerName || selectedClient?.primaryContactName || 'Authorized Signer'}
                </p>
              )}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-1 text-[9px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between font-mono">
                <span>Signer: {selectedProject.contractAgreement?.signerName || selectedClient?.primaryContactName || 'Client Representative'} ({selectedProject.contractAgreement?.signerTitle || 'Authorized Signer'})</span>
                <span>Date: {selectedProject.contractAgreement?.signedAt ? new Date(selectedProject.contractAgreement.signedAt).toLocaleDateString() : selectedProject.startDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <PrinterIcon className="h-3.5 w-3.5" />
                <span>Print SOW</span>
              </button>
              <button
                type="button"
                onClick={() => setIsViewingSowModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
