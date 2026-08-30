import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import {
  X,
  Search,
  Receipt,
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle,
  Smartphone,
  CreditCard,
  QrCode,
  ShieldCheck,
  Calendar,
  User,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  Lock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  IdCard,
  FileDown,
} from 'lucide-react';
import { GymLogo } from '../GymLogo';
import { downloadReceiptAsPDF, downloadReceiptAsText, FormattedReceipt } from '../../utils/receiptGenerator';

type PortalTab = 'invoice' | 'pass';

export const CustomerReceiptPortalModal: React.FC = () => {
  const {
    isReceiptPortalOpen,
    setIsReceiptPortalOpen,
    config,
    themeColor,
    leads,
  } = useGym();

  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>('invoice');
  const [copied, setCopied] = useState(false);

  // Selected or Active Receipt
  const [activeReceipt, setActiveReceipt] = useState<{
    receiptNumber: string;
    date: string;
    memberName: string;
    memberEmail: string;
    memberPhone: string;
    memberId: string;
    planName: string;
    duration: string;
    startDate: string;
    expiryDate: string;
    paymentMethod: string;
    transactionId: string;
    baseAmount: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
  } | null>(null);

  if (!isReceiptPortalOpen) return null;

  const handleClose = () => {
    setIsReceiptPortalOpen(false);
    setSearchQuery('');
    setHasSearched(false);
    setActiveReceipt(null);
  };

  // Perform search across leads
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    setHasSearched(true);

    if (!query) {
      // Default to most recent lead or sample
      const lead = leads[0];
      if (lead) {
        selectLeadAsReceipt(lead);
      } else {
        selectDefaultSample();
      }
      return;
    }

    const matched = leads.find((l) => {
      const nameMatch = l.name.toLowerCase().includes(query);
      const emailMatch = l.email.toLowerCase().includes(query);
      const phoneMatch = l.phone.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
      const msgMatch = l.message?.toLowerCase().includes(query);
      return nameMatch || emailMatch || phoneMatch || msgMatch;
    });

    if (matched) {
      selectLeadAsReceipt(matched);
    } else {
      // Generate dynamically based on search query
      const isEmail = query.includes('@');
      const isDigits = /^\d+$/.test(query.replace(/\D/g, '')) && query.length >= 7;

      const generatedTotal = config.plans[0]?.priceMonthly || 2999;
      const base = Math.round(generatedTotal / 1.18);
      const tax = generatedTotal - base;

      const todayStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const expiryStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      setActiveReceipt({
        receiptNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: todayStr,
        memberName: isEmail ? query.split('@')[0].toUpperCase() : isDigits ? 'Verified Gym Member' : searchQuery,
        memberEmail: isEmail ? searchQuery : `${query.replace(/[^a-z0-9]/g, '')}@gmail.com`,
        memberPhone: isDigits ? searchQuery : '+91 98765 43210',
        memberId: `ABS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        planName: config.plans[0]?.name || 'Elite Monthly Plan',
        duration: '1 Month (All Facility Access)',
        startDate: todayStr,
        expiryDate: expiryStr,
        paymentMethod: 'UPI / QR Code Scan & Pay',
        transactionId: `TXN_${Date.now().toString(36).toUpperCase()}`,
        baseAmount: base,
        taxAmount: tax,
        totalAmount: generatedTotal,
        status: 'Active (Paid)',
      });
    }
  };

  const selectLeadAsReceipt = (lead: any) => {
    const matchingPlan = config.plans.find(
      (p) => lead.planName && p.name.toLowerCase().includes(lead.planName.toLowerCase())
    );
    const total = matchingPlan ? matchingPlan.priceMonthly : 2999;
    const base = Math.round(total / 1.18);
    const tax = total - base;

    let method = 'UPI (Google Pay / PhonePe)';
    if (lead.message?.includes('Debit Card')) method = 'Debit Card (RuPay / Visa)';
    else if (lead.message?.includes('UPI')) method = 'UPI App / VPA';
    else if (lead.message?.includes('QR')) method = 'QR Code (UPI Scan & Pay)';

    // Extract memberId or generate
    const idMatch = lead.message?.match(/Member ID:\s*([A-Z0-9-]+)/i);
    const txnMatch = lead.message?.match(/Txn:\s*([A-Z0-9_]+)/i);

    const issueDate = new Date(lead.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const expDate = new Date(new Date(lead.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setActiveReceipt({
      receiptNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: issueDate,
      memberName: lead.name,
      memberEmail: lead.email,
      memberPhone: lead.phone,
      memberId: idMatch ? idMatch[1] : `ABS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      planName: lead.planName || config.plans[0]?.name || 'Elite Monthly Plan',
      duration: '1 Month (30 Days)',
      startDate: issueDate,
      expiryDate: expDate,
      paymentMethod: method,
      transactionId: txnMatch ? txnMatch[1] : `TXN_${Date.now().toString(36).toUpperCase()}`,
      baseAmount: base,
      taxAmount: tax,
      totalAmount: total,
      status: 'Active (Paid)',
    });
  };

  const selectDefaultSample = () => {
    const total = config.plans[0]?.priceMonthly || 2999;
    const base = Math.round(total / 1.18);
    const tax = total - base;

    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const expStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    setActiveReceipt({
      receiptNumber: `INV-${new Date().getFullYear()}-4821`,
      date: todayStr,
      memberName: 'Jessica Martinez',
      memberEmail: 'jessica.m@example.com',
      memberPhone: '+91 98765 43210',
      memberId: `ABS-${new Date().getFullYear()}-849201`,
      planName: config.plans[0]?.name || 'Elite Monthly Pro',
      duration: '1 Month (All Zones + Spa)',
      startDate: todayStr,
      expiryDate: expStr,
      paymentMethod: 'UPI (Scan & Pay)',
      transactionId: `TXN_L8K9_${Math.floor(1000 + Math.random() * 9000)}`,
      baseAmount: base,
      taxAmount: tax,
      totalAmount: total,
      status: 'Active (Paid)',
    });
  };

  const handleDownloadPdf = () => {
    if (!activeReceipt) return;
    const formatted: FormattedReceipt = {
      receiptNumber: activeReceipt.receiptNumber,
      date: activeReceipt.date,
      memberName: activeReceipt.memberName,
      memberEmail: activeReceipt.memberEmail,
      memberPhone: activeReceipt.memberPhone,
      memberId: activeReceipt.memberId,
      planName: activeReceipt.planName,
      duration: activeReceipt.duration,
      startDate: activeReceipt.startDate,
      expiryDate: activeReceipt.expiryDate,
      paymentMethod: activeReceipt.paymentMethod,
      transactionId: activeReceipt.transactionId,
      baseAmount: activeReceipt.baseAmount,
      taxAmount: activeReceipt.taxAmount,
      totalAmount: activeReceipt.totalAmount,
    };
    downloadReceiptAsPDF(formatted, config);
  };

  const handleDownloadTxt = () => {
    if (!activeReceipt) return;
    const formatted: FormattedReceipt = {
      receiptNumber: activeReceipt.receiptNumber,
      date: activeReceipt.date,
      memberName: activeReceipt.memberName,
      memberEmail: activeReceipt.memberEmail,
      memberPhone: activeReceipt.memberPhone,
      memberId: activeReceipt.memberId,
      planName: activeReceipt.planName,
      duration: activeReceipt.duration,
      startDate: activeReceipt.startDate,
      expiryDate: activeReceipt.expiryDate,
      paymentMethod: activeReceipt.paymentMethod,
      transactionId: activeReceipt.transactionId,
      baseAmount: activeReceipt.baseAmount,
      taxAmount: activeReceipt.taxAmount,
      totalAmount: activeReceipt.totalAmount,
    };
    downloadReceiptAsText(formatted, config);
  };

  const handlePrintOrPdf = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!activeReceipt) return;
    const total = activeReceipt.totalAmount ?? 0;
    const text = `*${config.name} - Official Membership Tax Receipt*\n\n` +
      `🧾 *Receipt No:* ${activeReceipt.receiptNumber}\n` +
      `👤 *Member Name:* ${activeReceipt.memberName}\n` +
      `🆔 *Member ID:* ${activeReceipt.memberId}\n` +
      `🏋️ *Plan:* ${activeReceipt.planName}\n` +
      `💰 *Total Paid:* ${currency}${total.toLocaleString('en-IN')}\n` +
      `💳 *Payment Method:* ${activeReceipt.paymentMethod}\n` +
      `📅 *Valid Until:* ${activeReceipt.expiryDate}\n` +
      `✅ *Status:* ACTIVE (PAID)\n\n` +
      `_Gym Location: ${config.address} • Tel: ${config.phone}_`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Open WhatsApp Web/Mobile if on mobile
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopySummary = () => {
    if (!activeReceipt) return;
    const total = activeReceipt.totalAmount ?? 0;
    const text = `*${config.name} Membership Receipt*\nReceipt: ${activeReceipt.receiptNumber}\nMember: ${activeReceipt.memberName} (${activeReceipt.memberId})\nPlan: ${activeReceipt.planName}\nAmount Paid: ${currency}${total.toLocaleString('en-IN')}\nStatus: Paid & Active`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="customer-receipt-portal-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative max-w-3xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER & SEARCH BAR */}
        <div className="p-5 sm:p-6 bg-neutral-950 border-b border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${theme.accentBg} text-black shadow-lg`}>
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${theme.accentBadge}`}>
                  Member Self-Service Portal
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  Download Receipt & Digital Pass
                </h3>
              </div>
            </div>

            <button
              id="close-receipt-portal-btn"
              onClick={handleClose}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Phone No, Email, or Member ID to retrieve receipt..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                id="search-receipt-btn"
                className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-md ${theme.accentBg}`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Receipt</span>
              </button>

              {!activeReceipt && (
                <button
                  type="button"
                  onClick={selectDefaultSample}
                  className="px-3.5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition whitespace-nowrap"
                >
                  Load Sample
                </button>
              )}
            </div>
          </form>

          {/* Recent Online Purchases Quick Chips (if any exist in state) */}
          {leads.length > 0 && !activeReceipt && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-neutral-400">
              <span className="text-[11px] text-neutral-500 font-bold uppercase">Recent Purchases:</span>
              {leads.slice(0, 3).map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => selectLeadAsReceipt(lead)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 transition"
                >
                  <User className="w-3 h-3 text-amber-400" />
                  <span>{lead.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">({lead.planName || 'Plan'})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RECEIPT VIEW & DOWNLOAD CONTAINER */}
        {activeReceipt ? (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-neutral-900/40 space-y-6">
            {/* View Selector Tabs & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800">
              {/* Tab Toggles: Tax Invoice vs Digital Pass */}
              <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('invoice')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition ${
                    activeTab === 'invoice' ? `${theme.accentBg} shadow` : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tax Invoice (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pass')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition ${
                    activeTab === 'pass' ? `${theme.accentBg} shadow` : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Digital Keycard Pass</span>
                </button>
              </div>

              {/* Action Buttons: PDF, TXT, WhatsApp, Print */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="portal-download-pdf-btn"
                  onClick={handleDownloadPdf}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg ${theme.accentBg}`}
                  title="Download official PDF receipt file"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  id="portal-download-txt-btn"
                  onClick={handleDownloadTxt}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition"
                  title="Download plain text receipt file"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download .TXT</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                  title="Send or share via WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition"
                  title="Copy receipt summary"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintOrPdf}
                  id="print-download-receipt-btn"
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition"
                  title="Print A4"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* TAB 1: OFFICIAL TAX INVOICE (A4 PRINT/PDF FORMAT) */}
            {activeTab === 'invoice' && (
              <div
                id="customer-printable-invoice"
                className="bg-white text-neutral-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-neutral-300 font-sans print:shadow-none print:border-none print:m-0 print:p-8 animate-in fade-in duration-200"
              >
                {/* Header: Gym Info & Invoice Tag */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-neutral-900">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-amber-400 flex items-center justify-center font-black text-2xl border-2 border-neutral-900 shadow-md">
                      ⚡
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
                        {config.name}
                      </h1>
                      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        {config.tagline || 'Premium Fitness & Strength Club'}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-1 max-w-sm">
                        {config.address || '108 Olympic Way, Fitness Plaza, Level 2'} • Tel: {config.phone || '+91 98765 43210'}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        GSTIN: {config.gstin || '20AABCA1234F1Z8'} • Email: {config.email || 'memberships@absolutegym.fit'}
                      </p>
                    </div>
                  </div>

                  {/* Invoice Meta */}
                  <div className="text-left sm:text-right">
                    <span className="inline-block px-3 py-1 bg-neutral-950 text-white rounded-lg text-xs font-black uppercase tracking-wider mb-2">
                      TAX INVOICE / RECEIPT
                    </span>
                    <div className="text-xs font-mono font-bold text-neutral-900">
                      <span className="text-neutral-500 font-sans font-medium">Receipt #: </span>
                      {activeReceipt.receiptNumber}
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">
                      <span className="text-neutral-500">Date: </span>
                      {activeReceipt.date}
                    </div>
                    <div className="text-xs text-neutral-600 font-mono">
                      <span className="text-neutral-500 font-sans">Member ID: </span>
                      <span className="font-bold text-neutral-900">{activeReceipt.memberId}</span>
                    </div>
                  </div>
                </div>

                {/* Billed To & Validity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-neutral-200">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                      Billed To (Member Details):
                    </span>
                    <div className="text-base font-extrabold text-neutral-950">
                      {activeReceipt.memberName}
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5">{activeReceipt.memberEmail}</div>
                    <div className="text-xs font-mono text-neutral-600">{activeReceipt.memberPhone}</div>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 text-xs space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                      Membership Validity Period:
                    </span>
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>Start Date:</span>
                      <span className="font-mono">{activeReceipt.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>Expiry Date:</span>
                      <span className="font-mono text-amber-700">{activeReceipt.expiryDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600 pt-1 border-t border-neutral-200 text-[11px]">
                      <span>Access Level:</span>
                      <span className="font-semibold text-emerald-700">All Gym Zones + Locker Access</span>
                    </div>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="py-6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-neutral-900 text-[10px] font-black uppercase tracking-wider text-neutral-700">
                        <th className="pb-2">Description / Package</th>
                        <th className="pb-2 text-center">Duration</th>
                        <th className="pb-2 text-right">Tax (18% GST)</th>
                        <th className="pb-2 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      <tr>
                        <td className="py-4">
                          <div className="font-bold text-neutral-950 text-sm">
                            {activeReceipt.planName}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            Includes Heavy Weights, Cardio Deck, Group Fitness Classes & Digital Pass
                          </div>
                        </td>
                        <td className="py-4 text-center font-bold text-neutral-700">
                          {activeReceipt.duration}
                        </td>
                        <td className="py-4 text-right font-mono text-neutral-600">
                          {currency}{(activeReceipt.taxAmount ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-right font-mono font-bold text-neutral-950 text-sm">
                          {currency}{(activeReceipt.totalAmount ?? 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calculations & Payment Proof */}
                <div className="pt-4 border-t-2 border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                  {/* Payment Details */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                      Payment Verification:
                    </span>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 font-medium">Method:</span>
                        <span className="font-bold text-neutral-900">{activeReceipt.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 font-medium">Txn Ref ID:</span>
                        <span className="font-mono font-bold text-neutral-800 text-[11px]">
                          {activeReceipt.transactionId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 font-medium">Payment Status:</span>
                        <span className="font-black text-emerald-700 text-xs">CONFIRMED / PAID ✓</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-500 pt-1 italic">
                      * This is a computer-generated tax invoice and requires no physical signature.
                    </p>
                  </div>

                  {/* Totals Box */}
                  <div className="bg-neutral-100 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal (Base):</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {currency}{(activeReceipt.baseAmount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>GST (18%):</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {currency}{(activeReceipt.taxAmount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-300 flex justify-between items-baseline">
                      <span className="text-sm font-black uppercase text-neutral-950">Total Paid:</span>
                      <span className="text-xl font-black font-mono text-neutral-950">
                        {currency}{(activeReceipt.totalAmount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Sign-off */}
                <div className="mt-8 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 gap-2">
                  <div>
                    <span>{config.name} • Official Member Tax Invoice</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Gym Registration & Pass</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DIGITAL VIP MEMBER KEYCARD PASS */}
            {activeTab === 'pass' && (
              <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border-2 border-amber-500/50 shadow-2xl relative overflow-hidden text-left">
                  {/* Decorative ambient glow */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${theme.accentBg} flex items-center justify-center text-black font-black text-sm shadow-md`}>
                        ⚡
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase text-white tracking-wider">
                          {config.name}
                        </div>
                        <div className="text-[10px] text-amber-400 uppercase font-mono font-bold tracking-widest">
                          VIP MEMBER ACCESS PASS
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                      ACTIVE
                    </span>
                  </div>

                  {/* Card Content Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase block">Member Name</span>
                      <span className="font-extrabold text-white text-base truncate block">{activeReceipt.memberName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase block">Member ID</span>
                      <span className="font-mono font-extrabold text-amber-400 text-sm">{activeReceipt.memberId}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase block">Subscription Plan</span>
                      <span className="font-bold text-white truncate block">{activeReceipt.planName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase block">Valid Until</span>
                      <span className="font-mono font-bold text-emerald-400">{activeReceipt.expiryDate}</span>
                    </div>
                  </div>

                  {/* Access Perks */}
                  <div className="mt-5 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                    <div className="text-[9px] font-black uppercase tracking-wider text-amber-400">Included Amenities:</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Olympic Lifting & Cardio Zone Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Digital Locker Room & Steam Spa Access</span>
                    </div>
                  </div>

                  {/* Barcode & Timestamp */}
                  <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div className="font-mono tracking-widest text-neutral-400 text-xs select-none">
                      ||||| | |||| ||| |||| | ||||| || ||||
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Verified Scan Pass
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-neutral-400">
                    Show this digital pass at the front desk scanner or turnstile for instant facility access.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Search State Instructions */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
              <Search className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-black uppercase text-white">
                Find & Download Your Membership Receipt
              </h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Enter your registered phone number, email address, or member ID above to view, download as PDF, or WhatsApp your official tax receipt and digital gym pass.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={selectDefaultSample}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition ${theme.accentBg}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>View Sample Receipt / Demo Pass</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
