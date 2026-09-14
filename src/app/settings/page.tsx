'use client';

import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { sanitizeString } from '@/lib/security';

export default function SettingsPage() {
  const { settings, updateSettings } = useCRM();
  const { toast } = useToast();

  // Local Form State bound to CRM Settings
  const [formData, setFormData] = useState({
    companyName: settings.companyName || 'Qdelta Digital Studio',
    agencyContactEmail: settings.agencyContactEmail || 'hello@qdelta.io',
    paypalHandle: settings.paypalHandle || 'qdeltastudio',
    defaultCurrency: settings.defaultCurrency || 'USD',
    geminiApiKey: settings.geminiApiKey || '',
  });

  // UI state for password/key visibility
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Synchronize when global settings hydrate
  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || 'Qdelta Digital Studio',
        agencyContactEmail: settings.agencyContactEmail || 'hello@qdelta.io',
        paypalHandle: settings.paypalHandle || 'qdeltastudio',
        defaultCurrency: settings.defaultCurrency || 'USD',
        geminiApiKey: settings.geminiApiKey || '',
      });
    }
  }, [settings]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const sanitized = {
      companyName: sanitizeString(formData.companyName).slice(0, 100),
      agencyContactEmail: sanitizeString(formData.agencyContactEmail).slice(0, 120),
      paypalHandle: sanitizeString(formData.paypalHandle).replace(/[@/]/g, '').trim(),
      defaultCurrency: formData.defaultCurrency,
      geminiApiKey: formData.geminiApiKey.trim(),
    };

    updateSettings(sanitized);

    toast({
      type: 'success',
      title: 'Settings Saved Successfully',
      description: 'Your agency configuration and workspace preferences have been updated.',
    });
  };

  return (
    <div className="w-full bg-[#FAFBFD] dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 p-4 md:p-5 rounded-xl space-y-6 border border-zinc-300/80 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-200 tracking-tight flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5 text-zinc-500 dark:text-[#8B8B94]" />
            <span>Workspace & Agency Settings</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure agency branding, PayPal checkout handles, and Google Gemini AI key
          </p>
        </div>

        {/* Save Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveAll()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6 max-w-4xl">
        
        {/* SECTION 1: AGENCY BRAND PROFILE */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BuildingOffice2Icon className="h-4 w-4 text-zinc-500 dark:text-[#8B8B94]" />
              <span>Agency Brand & Invoicing Profile</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Studio identification shown on digital agreements, payment receipts, and PayPal checkout links
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Agency Studio Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleFieldChange('companyName', e.target.value)}
                placeholder="e.g. Qdelta Digital Studio"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Primary Studio Email
              </label>
              <input
                type="email"
                value={formData.agencyContactEmail}
                onChange={(e) => handleFieldChange('agencyContactEmail', e.target.value)}
                placeholder="e.g. hello@qdelta.io"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                PayPal Handle (for Direct Checkout Links)
              </label>
              <div className="flex items-center">
                <span className="bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-800 rounded-l-lg px-2.5 py-2 text-xs text-zinc-500 font-mono">
                  paypal.me/
                </span>
                <input
                  type="text"
                  value={formData.paypalHandle}
                  onChange={(e) => handleFieldChange('paypalHandle', e.target.value)}
                  placeholder="qdeltastudio"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-r-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Default Currency
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => handleFieldChange('defaultCurrency', e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="USD">USD ($ - United States Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="AED">AED (د.إ - UAE Dirham)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: GEMINI AI API */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-zinc-500 dark:text-[#8B8B94]" />
              <span>Google Gemini AI Engine</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Power automated proposal generation and smart task parsing from voice notes
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={formData.geminiApiKey}
                onChange={(e) => handleFieldChange('geminiApiKey', e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showGeminiKey ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Optional override. Default key is loaded server-side from environment variables.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
