import React, { useState, useRef } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle,
  FileText,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Edit3,
  Copy,
  Plus,
  FileDown,
} from 'lucide-react';
import { GymLogo } from '../GymLogo';
import { downloadReceiptAsPDF, downloadReceiptAsText, FormattedReceipt } from '../../utils/receiptGenerator';

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberId?: string;
  planName: string;
  duration?: string;
  startDate: string;
  expiryDate: string;
  paymentMethod: string;
  transactionId: string;
  baseAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  trainerName?: string;
  gstin?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ReceiptData> | null;
  onSaveReceipt?: (receipt: ReceiptData) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSaveReceipt,
}) => {
  const { config, themeColor } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';
  const printableRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Today's date formatted
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Default Receipt State
  const [formData, setFormData] = useState<ReceiptData>(() => {
    const rawTotal = initialData?.totalAmount || 2999;
    const base = Math.round(rawTotal / 1.18);
    const tax = rawTotal - base;

    return {
      receiptNumber: initialData?.receiptNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: initialData?.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      memberName: initialData?.memberName || 'Jessica Martinez',
      memberEmail: initialData?.memberEmail || 'jessica@example.com',
      memberPhone: initialData?.memberPhone || '+91 98765 43210',
      memberId: initialData?.memberId || `ABS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      planName: initialData?.planName || 'Elite Pro Plan',
      duration: initialData?.duration || '1 Month (30 Days)',
      startDate: initialData?.startDate || today,
      expiryDate: initialData?.expiryDate || nextMonth,
      paymentMethod: initialData?.paymentMethod || 'UPI (Google Pay / PhonePe)',
      transactionId: initialData?.transactionId || `TXN_${Date.now().toString(36).toUpperCase()}`,
      baseAmount: initialData?.baseAmount ?? base,
      taxAmount: initialData?.taxAmount ?? tax,
      discountAmount: initialData?.discountAmount ?? 0,
      totalAmount: rawTotal,
      notes: initialData?.notes || 'Thank you for choosing Absolute Gym! Access granted to all gym zones and locker facilities.',
      trainerName: initialData?.trainerName || '',
      gstin: initialData?.gstin || config.gstin || '20AABCA1234F1Z8',
    };
  });

  // Re-sync when initialData changes
  React.useEffect(() => {
    if (initialData) {
      const rawTotal = initialData.totalAmount || 2999;
      const base = initialData.baseAmount ?? Math.round(rawTotal / 1.18);
      const tax = initialData.taxAmount ?? (rawTotal - base);

      setFormData({
        receiptNumber: initialData.receiptNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: initialData.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        memberName: initialData.memberName || 'Member Name',
        memberEmail: initialData.memberEmail || '',
        memberPhone: initialData.memberPhone || '',
        memberId: initialData.memberId || `ABS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        planName: initialData.planName || 'Fitness Membership',
        duration: initialData.duration || '1 Month',
        startDate: initialData.startDate || today,
        expiryDate: initialData.expiryDate || nextMonth,
        paymentMethod: initialData.paymentMethod || 'UPI / QR Code',
        transactionId: initialData.transactionId || `TXN_${Date.now().toString(36).toUpperCase()}`,
        baseAmount: base,
        taxAmount: tax,
        discountAmount: initialData.discountAmount ?? 0,
        totalAmount: rawTotal,
        notes: initialData.notes || 'Full gym facility access & digital locker access activated.',
        trainerName: initialData.trainerName || '',
        gstin: initialData.gstin || config.gstin || '20AABCA1234F1Z8',
      });
    }
  }, [initialData, config.gstin]);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    const formatted: FormattedReceipt = {
      receiptNumber: formData.receiptNumber,
      date: formData.date,
      memberName: formData.memberName,
      memberEmail: formData.memberEmail,
      memberPhone: formData.memberPhone,
      memberId: formData.memberId || 'ABS-MEMBER',
      planName: formData.planName,
      duration: formData.duration,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId,
      baseAmount: formData.baseAmount,
      taxAmount: formData.taxAmount,
      discountAmount: formData.discountAmount,
      totalAmount: formData.totalAmount,
      gstin: formData.gstin || config.gstin || '20AABCA1234F1Z8',
    };
    downloadReceiptAsPDF(formatted, config);
  };

  const handleDownloadTxt = () => {
    const formatted: FormattedReceipt = {
      receiptNumber: formData.receiptNumber,
      date: formData.date,
      memberName: formData.memberName,
      memberEmail: formData.memberEmail,
      memberPhone: formData.memberPhone,
      memberId: formData.memberId || 'ABS-MEMBER',
      planName: formData.planName,
      duration: formData.duration,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId,
      baseAmount: formData.baseAmount,
      taxAmount: formData.taxAmount,
      discountAmount: formData.discountAmount,
      totalAmount: formData.totalAmount,
      gstin: formData.gstin || config.gstin || '20AABCA1234F1Z8',
    };
    downloadReceiptAsText(formatted, config);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const total = formData.totalAmount ?? 0;
    const summary = `*${config.name} Membership Receipt*\nReceipt No: ${formData.receiptNumber}\nMember: ${formData.memberName}\nPlan: ${formData.planName}\nTotal Paid: ${currency}${total.toLocaleString('en-IN')}\nPayment: ${formData.paymentMethod}\nStatus: Active (Paid)`;
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="receipt-preview-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl my-6 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL ACTION BAR */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
                <span>Official Tax Receipt & Invoice</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  PAID
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Gym membership invoice for accounting, print, or WhatsApp/Email sharing
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition"
              title="Edit Receipt Fields"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Preview Receipt' : 'Edit Details'}</span>
            </button>

            <button
              type="button"
              id="admin-download-receipt-pdf-btn"
              onClick={handleDownloadPdf}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg ${theme.accentBg}`}
              title="Download official PDF receipt file"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              id="admin-download-receipt-txt-btn"
              onClick={handleDownloadTxt}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition"
              title="Download plain text receipt file"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Download .TXT</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition"
              title="Copy text summary for WhatsApp"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition"
              title="Print A4"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-neutral-900/50 space-y-6">
          {/* EDIT FORM (IF TOGGLED) */}
          {isEditing && (
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 mb-4 animate-in fade-in duration-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" />
                <span>Customize Receipt Fields</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Receipt / Invoice No.
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    GSTIN / Tax Reg No.
                  </label>
                  <input
                    type="text"
                    value={formData.gstin || ''}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="e.g. 20AABCA1234F1Z8"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-amber-400 font-mono uppercase focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Member ID
                  </label>
                  <input
                    type="text"
                    value={formData.memberId || ''}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={formData.memberName}
                    onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Member Email
                  </label>
                  <input
                    type="email"
                    value={formData.memberEmail}
                    onChange={(e) => setFormData({ ...formData, memberEmail: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Member Phone
                  </label>
                  <input
                    type="text"
                    value={formData.memberPhone}
                    onChange={(e) => setFormData({ ...formData, memberPhone: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Membership Plan
                  </label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="QR Code (UPI Scan & Pay)">QR Code (UPI Scan & Pay)</option>
                    <option value="UPI (Google Pay / PhonePe / Paytm)">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Debit Card (RuPay / Visa / Master)">Debit Card (RuPay / Visa / Master)</option>
                    <option value="Cash at Front Desk">Cash at Front Desk</option>
                    <option value="Net Banking / IMPS">Net Banking / IMPS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Txn Reference ID
                  </label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Total Amount Paid ({currency})
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => {
                      const total = Number(e.target.value) || 0;
                      const base = Math.round(total / 1.18);
                      const tax = total - base;
                      setFormData({
                        ...formData,
                        totalAmount: total,
                        baseAmount: base,
                        taxAmount: tax,
                      });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Valid Until / Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HIGH-RES PRINTABLE INVOICE SHEET (CLEAN WHITE / BLACK PRINT DESIGN) */}
          <div
            ref={printableRef}
            id="printable-receipt-sheet"
            className="bg-white text-neutral-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-neutral-300 font-sans print:shadow-none print:border-none print:m-0 print:p-8"
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
                    GSTIN / Reg: {formData.gstin || config.gstin || '20AABCA1234F1Z8'} • Email: {config.email || 'memberships@absolutegym.fit'}
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
                  {formData.receiptNumber}
                </div>
                <div className="text-xs text-neutral-600 font-medium">
                  <span className="text-neutral-500">Date: </span>
                  {formData.date}
                </div>
                <div className="text-xs text-neutral-600 font-mono">
                  <span className="text-neutral-500 font-sans">Member ID: </span>
                  <span className="font-bold text-neutral-900">{formData.memberId}</span>
                </div>
              </div>
            </div>

            {/* Billed To & Validity Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  Billed To (Member Details):
                </span>
                <div className="text-base font-extrabold text-neutral-950">
                  {formData.memberName}
                </div>
                <div className="text-xs text-neutral-600 mt-0.5">{formData.memberEmail}</div>
                <div className="text-xs font-mono text-neutral-600">{formData.memberPhone}</div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 text-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Membership Validity Period:
                </span>
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span>Start Date:</span>
                  <span className="font-mono">{formData.startDate}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span>Expiry Date:</span>
                  <span className="font-mono text-amber-700">{formData.expiryDate}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 pt-1 border-t border-neutral-200 text-[11px]">
                  <span>Access Type:</span>
                  <span className="font-semibold text-emerald-700">All Gym Floors + Digital Pass</span>
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
                        {formData.planName}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Includes Strength Training, Cardio Zone, Group Classes & Steam Locker access
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold text-neutral-700">
                      {formData.duration}
                    </td>
                    <td className="py-4 text-right font-mono text-neutral-600">
                      {currency}{(formData.taxAmount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-neutral-950 text-sm">
                      {currency}{(formData.totalAmount ?? 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Payment Method Summary */}
            <div className="pt-4 border-t-2 border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Payment Details */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                  Payment Verification:
                </span>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Method:</span>
                    <span className="font-bold text-neutral-900">{formData.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Txn Ref ID:</span>
                    <span className="font-mono font-bold text-neutral-800 text-[11px]">
                      {formData.transactionId}
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
                  <span>Subtotal (Base Plan):</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {currency}{(formData.baseAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST / Taxes (18%):</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {currency}{(formData.taxAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                {formData.discountAmount && formData.discountAmount > 0 ? (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Applied:</span>
                    <span className="font-mono">
                      -{currency}{(formData.discountAmount ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null}
                <div className="pt-2 border-t border-neutral-300 flex justify-between items-baseline">
                  <span className="text-sm font-black uppercase text-neutral-950">Grand Total Paid:</span>
                  <span className="text-xl font-black font-mono text-neutral-950">
                    {currency}{(formData.totalAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Sign-off & Club Watermark */}
            <div className="mt-8 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 gap-2">
              <div>
                <span>Absolute Gym • All Rights Reserved</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Member Registration & Pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
