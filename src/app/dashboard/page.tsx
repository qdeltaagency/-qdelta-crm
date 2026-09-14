'use client';

import React from 'react';

export default function DashboardOverviewPage() {
  return (
    <div className="w-full space-y-5 animate-fade-in transition-colors duration-200">
      {/* Top Section */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Real-time snapshot of agency pipeline, cash flow, and active client deliverables
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Clients */}
        <div className="bg-[#FAFBFD] dark:bg-[#1C1C1F] border border-zinc-200/90 dark:border-[#2C2C31] rounded-xl p-4 md:p-5 flex flex-col justify-between space-y-2 shadow-2xs">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Clients</span>
          <div className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            14
          </div>
        </div>

        {/* Card 2: Pipeline Value */}
        <div className="bg-[#FAFBFD] dark:bg-[#1C1C1F] border border-zinc-200/90 dark:border-[#2C2C31] rounded-xl p-4 md:p-5 flex flex-col justify-between space-y-2 shadow-2xs">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pipeline Value</span>
          <div className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            $1,25,000
          </div>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="bg-[#FAFBFD] dark:bg-[#1C1C1F] border border-zinc-200/90 dark:border-[#2C2C31] rounded-xl p-4 md:p-5 flex flex-col justify-between space-y-2 shadow-2xs">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pending Payments</span>
          <div className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            $12,400
          </div>
        </div>

        {/* Card 4: Network Commissions */}
        <div className="bg-[#FAFBFD] dark:bg-[#1C1C1F] border border-zinc-200/90 dark:border-[#2C2C31] rounded-xl p-4 md:p-5 flex flex-col justify-between space-y-1.5 shadow-2xs">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Network Commissions</span>
          <div className="flex flex-col space-y-1">
            <div className="flex items-baseline flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">+$3,200</span>
              <span className="text-zinc-500 text-xs ml-1.5">Outbound (To Collect)</span>
            </div>
            <div className="flex items-baseline flex-wrap">
              <span className="text-rose-600 dark:text-rose-400 font-semibold text-sm">-$450</span>
              <span className="text-zinc-500 text-xs ml-1.5">Inbound (To Pay)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Column Layout: Inbound Leads Queue, Payment Actions, & Active Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Column 1: Inbound Leads / Action Queue */}
        <div className="bg-[#FAFBFD] dark:bg-[#1C1C1F] border border-zinc-200/90 dark:border-[#2C2C31] rounded-xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inbound Leads Queue</h2>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/60 font-medium">2 Pending</span>
            </div>

            {/* Task 1 */}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#232327] rounded-lg mb-2.5 border border-zinc-200/80 dark:border-[#2C2C31] shadow-2xs">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">Sarah Jenkins</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Requested pricing • SaaS Landing</p>
              </div>
              <button className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700/60 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0">
                Review
              </button>
            </div>

            {/* Task 2 */}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#232327] rounded-lg border border-zinc-200/80 dark:border-[#2C2C31] shadow-2xs">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">Samantha Miller</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Proposal sent • E-commerce</p>
              </div>
              <button className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700/60 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0">
                Follow Up
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Payment & Cash Flow Queue */}
        <div className="bg-[#FAFBFD] dark:bg-[#1C1C1F] border border-zinc-200/90 dark:border-[#2C2C31] rounded-xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Payment & Cash Flow</h2>
              <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">Action Required</span>
            </div>

            {/* Payment 1: Inbound Client Payment */}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#232327] rounded-lg mb-2.5 border border-zinc-200/80 dark:border-[#2C2C31] shadow-2xs">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">Marcus Sterling</p>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">$4,200</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Deposit sent 3d ago</p>
              </div>
              <button className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700/60 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0">
                Send Nudge
              </button>
            </div>

            {/* Payment 2: Outbound Partner Commission */}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#232327] rounded-lg border border-zinc-200/80 dark:border-[#2C2C31] shadow-2xs">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">Apex Design Lab</p>
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">-$450</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Referral commission due</p>
              </div>
              <button className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700/60 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0">
                Pay Now
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Active Deliverables */}
        <div className="bg-[#FAFBFD] dark:bg-[#1C1C1F] border border-zinc-200/90 dark:border-[#2C2C31] rounded-xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Active Deliverables</h2>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/60 font-medium">2 Active</span>
            </div>

            {/* Project 1 */}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#232327] rounded-lg mb-2.5 border border-zinc-200/80 dark:border-[#2C2C31] shadow-2xs">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">Vortex App Redesign</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Due Oct 24</p>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                On Track
              </span>
            </div>

            {/* Project 2 */}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-[#232327] rounded-lg border border-zinc-200/80 dark:border-[#2C2C31] shadow-2xs">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">Starlight E-commerce</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Due Oct 28</p>
              </div>
              <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                Client Review
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

