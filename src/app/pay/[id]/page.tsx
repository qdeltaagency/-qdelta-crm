'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCRM } from '@/lib/store';
import { fetchLiveLeads } from '@/lib/supabase-service';
import { Lead } from '@/lib/types';
import { sanitizeString, validateSignatureBase64 } from '@/lib/security';
import {
  ShieldCheckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  LockClosedIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  DocumentCheckIcon,
  XMarkIcon,
  CheckBadgeIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

export default function PaymentCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = (params?.id as string) || '';
  const { leads, isHydrated, convertLeadToClient, settings } = useCRM();

  const [directLead, setDirectLead] = useState<Lead | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); // 1 = Contract Sign, 2 = Payment, 3 = Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [txId, setTxId] = useState('');

  // Signature Form State
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('type');
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [signedAtDate, setSignedAtDate] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [signError, setSignError] = useState('');

  // Canvas Drawing Ref & State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Find lead from CRM context or from direct fetch
  const storeLead = leads.find((l) => l.id === leadId);
  const lead = storeLead || directLead;

  useEffect(() => {
    if (!storeLead && leadId) {
      fetchLiveLeads().then((allLeads) => {
        if (allLeads) {
          const match = allLeads.find((l) => l.id === leadId);
          if (match) setDirectLead(match);
        }
      });
    }
  }, [storeLead, leadId]);

  // Lead details
  const leadName = lead?.name || 'Client Lead';
  const companyName = lead?.company || 'Organization';
  const email = lead?.email || 'client@company.com';
  const servicePillar = lead?.serviceType || 'Web Design & Full-Stack App';
  const currency = lead?.currency || 'USD';
  const totalAmount = lead?.quoteAmount || (lead?.budget ? parseFloat(lead.budget.replace(/[^0-9.]/g, '')) : 5000) || 5000;
  const depositAmount = Math.round(totalAmount * 0.3);
  const midMilestoneAmount = Math.round(totalAmount * 0.35);
  const finalLaunchAmount = Math.max(0, totalAmount - depositAmount - midMilestoneAmount);
  const timeline = lead?.timeline || 'Standard (2 - 4 Weeks)';

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const handleSignAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(signerName);
    const cleanTitle = sanitizeString(signerTitle);

    if (!cleanName.trim()) {
      setSignError('Please enter your full legal name.');
      return;
    }
    if (!cleanTitle.trim()) {
      setSignError('Please enter your job title / role.');
      return;
    }
    if (!termsAgreed) {
      setSignError('You must accept the agreement terms to proceed.');
      return;
    }
    if (signatureMode === 'draw') {
      if (!signatureDataUrl) {
        setSignError('Please draw your signature on the pad above or switch to Type Name.');
        return;
      }
      const sigCheck = validateSignatureBase64(signatureDataUrl);
      if (!sigCheck.valid) {
        setSignError(sigCheck.reason || 'Invalid signature drawing.');
        return;
      }
    }

    setSignError('');
    setSignerName(cleanName);
    setSignerTitle(cleanTitle);
    setSignedAtDate(new Date().toLocaleString());
    setCurrentStep(2); // Proceed to Payment Step
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    // Simulate network processing with PayPal Sandbox
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const generatedTxId = `PP-TX-${Date.now().toString().slice(-6)}`;
    setTxId(generatedTxId);

    if (lead) {
      // Validate signature if present
      let finalSignature = signatureDataUrl;
      if (finalSignature) {
        const check = validateSignatureBase64(finalSignature);
        if (!check.valid) finalSignature = '';
      }

      let receiptEmailId: string | undefined;
      let onboardingEmailId: string | undefined;

      // Automatically dispatch Receipt & Onboarding Emails via Resend
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'both',
            to: lead.email,
            clientName: lead.name,
            companyName: lead.company || lead.name,
            projectTitle: `${lead.serviceType || 'Digital Studio'} Flagship Sprint`,
            amount: depositAmount,
            currency: lead.currency || 'USD',
            milestoneType: 'Deposit (30%)',
            transactionId: generatedTxId,
            receiptUrl: `${baseUrl}/pay/${lead.id}`,
            portalUrl: `${baseUrl}/client-hub`,
            servicePillar: lead.serviceType || 'Web Design & Full-Stack',
            assignedPartner: lead.assignedTo || 'Nagireddy Sai Prabhath',
          }),
        });

        if (emailRes.ok) {
          const emailData = await emailRes.json();
          if (emailData?.results) {
            const receiptResult = emailData.results.find((r: any) => r.type === 'payment_receipt');
            const onboardingResult = emailData.results.find((r: any) => r.type === 'onboarding_welcome');
            receiptEmailId = receiptResult?.id;
            onboardingEmailId = onboardingResult?.id;
          }
        }
      } catch (err) {
        console.warn('Email dispatch warning:', err);
      }

      // Convert Lead to Client with Signed Contract & Email Delivery Metadata
      convertLeadToClient(lead.id, undefined, {
        signerName: sanitizeString(signerName.trim()),
        signerTitle: sanitizeString(signerTitle.trim()) || 'Authorized Representative',
        signedAt: signedAtDate || new Date().toISOString(),
        signatureDataUrl: finalSignature || undefined,
        receiptEmailId,
        onboardingEmailId,
      });
    }

    setIsProcessing(false);
    setCurrentStep(3); // Completed Confirmation
  };

  if (!isHydrated && !lead) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-48" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-72" />
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl mt-4" />
        </div>
      </div>
    );
  }

  if (isHydrated && !lead && !directLead) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <DocumentTextIcon className="h-12 w-12 text-zinc-400 mx-auto" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Invoice Link Not Found</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This payment invoice link may have expired or is invalid. Please contact the studio team.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-indigo-950 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs tracking-wider">
                Q
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-300">Qdelta Digital Studio</p>
                <p className="text-[9px] text-zinc-400">Master Scope Agreement & Authorized Deposit Checkout</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <LockClosedIcon className="h-3 w-3" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>

          <div className="relative z-10 space-y-0.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {currentStep === 1
                ? 'Master Services Agreement & Scope Authorization'
                : currentStep === 2
                ? 'Authorized Project Deposit Checkout'
                : 'Project Initialized & Deposit Received!'}
            </h1>
            <p className="text-[11px] text-zinc-300">
              {currentStep === 3
                ? `Contract sealed & kickoff initialized for ${companyName}.`
                : `Contract & Invoicing prepared for ${leadName} at ${companyName}`}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          {currentStep !== 3 && (
            <div className="flex items-center gap-2 pt-3 text-[10px] font-medium">
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                  currentStep === 1
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-white/10 text-emerald-300'
                }`}
              >
                <span>1. Review & Sign Agreement</span>
                {currentStep > 1 && <CheckCircleIcon className="h-3 w-3 inline" />}
              </div>
              <span className="text-zinc-500">→</span>
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                  currentStep === 2
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-white/5 text-zinc-400'
                }`}
              >
                <span>2. Kickoff Deposit (30%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Body Section */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* STEP 1: CONTRACT AGREEMENT & DIGITAL SIGNATURE */}
          {currentStep === 1 && (
            <form onSubmit={handleSignAgreement} className="space-y-4">
              {/* Deliverable & Milestone Summary Box */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
                  <div>
                    <p className="text-[9px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">Statement of Work (SOW)</p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mt-0.5">
                      <SparklesIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{servicePillar}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">Estimated Timeline</p>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{timeline}</p>
                  </div>
                </div>

                {/* 3-Stage Milestone Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-950 dark:text-indigo-200 text-[10px]">1. Deposit (30%)</span>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200 text-[11px]">${depositAmount.toLocaleString()} {currency}</span>
                    </div>
                    <p className="text-[9px] text-indigo-700 dark:text-indigo-400 mt-0.5">Due on signing to reserve sprint</p>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-800 dark:text-zinc-300 text-[10px]">2. Mid-Dev (35%)</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">${midMilestoneAmount.toLocaleString()} {currency}</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Due upon core design/feature review</p>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-800 dark:text-zinc-300 text-[10px]">3. Launch (35%)</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">${finalLaunchAmount.toLocaleString()} {currency}</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Due on staging approval & launch</p>
                  </div>
                </div>
              </div>

              {/* Master Services Agreement Terms Accordion / Box */}
              <div className="p-3 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400 max-h-40 overflow-y-auto">
                <p className="font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
                  Master Services Agreement (MSA) Clauses:
                </p>
                <div className="space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-zinc-800 dark:text-zinc-200">1. Scope of Work:</strong> Qdelta Digital Studio agrees to engineer and deliver the deliverables outlined in this Statement of Work according to the specified timeline.
                  </p>
                  <p>
                    <strong className="text-zinc-800 dark:text-zinc-200">2. Milestone Settlement:</strong> A 30% kickoff deposit authorizes commencement. A 35% mid-development milestone is billed upon core deliverables review, and the final 35% balance is due upon staging approval prior to final production handover.
                  </p>
                  <p>
                    <strong className="text-zinc-800 dark:text-zinc-200">3. Intellectual Property:</strong> 100% full ownership of custom code, design system tokens, assets, and database architecture automatically transfers to the Client upon final invoice settlement.
                  </p>
                  <p>
                    <strong className="text-zinc-800 dark:text-zinc-200">4. QA & Revisions:</strong> Two (2) comprehensive rounds of staging feedback & revisions are included in the scope prior to production launch.
                  </p>
                </div>
              </div>

              {/* Digital Signature Pad */}
              <div className="space-y-2.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                    <PencilSquareIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Digital Signature Authorization</span>
                  </label>
                  
                  {/* Mode Toggle */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('type')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        signatureMode === 'type'
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                          : 'text-zinc-500'
                      }`}
                    >
                      Type Name
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        signatureMode === 'draw'
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                          : 'text-zinc-500'
                      }`}
                    >
                      Draw Pen
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-medium mb-1">Legal Signer Full Name *</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-medium mb-1">Signer Title / Role *</label>
                    <input
                      type="text"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      placeholder="e.g. Founder & CEO / Project Lead"
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Draw Signature Canvas (Only when Draw Pen mode is selected) */}
                {signatureMode === 'draw' && (
                  <div className="space-y-1">
                    <div className="relative border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={110}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-24 touch-none cursor-crosshair"
                      />
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="absolute top-2 right-2 text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded hover:bg-zinc-200 cursor-pointer"
                      >
                        Clear Pad
                      </button>
                    </div>
                    <p className="text-[9px] text-zinc-400">Draw your signature inside the box using your mouse or finger.</p>
                  </div>
                )}

                {/* Agreement Acceptance Checkbox */}
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-tight">
                    I confirm that I am authorized to bind <strong className="text-zinc-900 dark:text-zinc-100">{companyName}</strong> to this Statement of Work, and agree to the 3-stage milestone terms (30% / 35% / 35%) and IP ownership provisions.
                  </span>
                </label>

                {signError && (
                  <p className="text-xs text-rose-600 font-medium">{signError}</p>
                )}
              </div>

              {/* Submit / Proceed Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DocumentCheckIcon className="h-4 w-4" />
                  <span>Sign Agreement & Unlock Deposit Checkout &rarr;</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: DEPOSIT PAYMENT (30% UPFRONT) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Signed Agreement Verification Seal */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-950 dark:text-emerald-200 text-[11px]">
                      Agreement Digitally Signed & Authorized
                    </p>
                    <p className="text-[9px] text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">
                      Signed by {signerName} ({signerTitle}) • {signedAtDate}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-[10px] text-emerald-700 dark:text-emerald-300 underline font-medium hover:text-emerald-950 cursor-pointer"
                >
                  Edit Signature
                </button>
              </div>

              {/* Payment Summary Box */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div>
                    <p className="text-[9px] uppercase font-semibold text-zinc-400 tracking-wider">Milestone 1 (30% Kickoff Deposit)</p>
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ${depositAmount.toLocaleString()} {currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-semibold text-zinc-400 tracking-wider">Remaining Milestones</p>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                      ${(midMilestoneAmount + finalLaunchAmount).toLocaleString()} {currency} (35% + 35%)
                    </p>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                    Payment Channel:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 border-2 border-indigo-600 dark:border-indigo-500 rounded-lg bg-indigo-50/30 dark:bg-indigo-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] italic">
                          PayPal
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px]">PayPal / Debit / Card</p>
                          <p className="text-[9px] text-zinc-500">@{settings.paypalHandle || 'qdeltastudio'}</p>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    </div>

                    <div className="p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between opacity-70">
                      <div className="flex items-center gap-2">
                        <CreditCardIcon className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="font-medium text-zinc-800 dark:text-zinc-300 text-[11px]">Direct Bank Wire</p>
                          <p className="text-[9px] text-zinc-400">Corporate Invoicing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Deposit Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-4 w-4" />
                      <span>Authorize & Pay Kickoff Deposit (${depositAmount.toLocaleString()} {currency})</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeftIcon className="h-3 w-3" />
                    <span>Back to Agreement</span>
                  </button>
                  <span className="flex items-center gap-1 text-[10px]">
                    <ShieldCheckIcon className="h-3 w-3 text-emerald-500" />
                    <span>Instant Workspace Initialization</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & CONFIRMATION */}
          {currentStep === 3 && (
            <div className="py-4 space-y-5 animate-scale-up text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircleIcon className="h-9 w-9 stroke-[2.2]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Master Agreement & Deposit Confirmed!</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-zinc-900 dark:text-zinc-100">{signerName}</span>! Your agreement has been sealed and deposit of{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${depositAmount.toLocaleString()} {currency}</span> has been processed.
                </p>
              </div>

              {/* Receipt & Contract Audit Box */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-left text-[11px] space-y-2 max-w-md mx-auto shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200">{txId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Document Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Signed & Sealed (QDL-MSA-2026.1)</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Authorized Signer:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{signerName} ({signerTitle})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Client Hub Workspace:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Active & Ready for Discovery</span>
                </div>
              </div>

              {/* Navigation & Document Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <PrinterIcon className="h-3.5 w-3.5" />
                  <span>Print / Download Signed SOW</span>
                </button>
                <Link
                  href="/clients"
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold px-4 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <BuildingOffice2Icon className="h-3.5 w-3.5" />
                  <span>View Client Workspace</span>
                </Link>
                <Link
                  href="/payments"
                  className="w-full sm:w-auto border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DocumentTextIcon className="h-3.5 w-3.5" />
                  <span>View Ledger</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
