import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import {
  X,
  Check,
  CheckCircle,
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  Zap,
  Copy,
  Clock,
  ArrowRight,
  UserCheck,
  Lock,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  Receipt,
  FileText,
  Printer,
  FileDown,
} from 'lucide-react';
import { downloadReceiptAsPDF, downloadReceiptAsText, FormattedReceipt } from '../../utils/receiptGenerator';

type PaymentMethodType = 'qr' | 'upi' | 'card';

export const PlanBookingModal: React.FC = () => {
  const {
    selectedPlanForModal,
    setSelectedPlanForModal,
    themeColor,
    config,
    addLead,
    setIsReceiptPortalOpen,
  } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  // State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('qr');
  
  // UPI App / VPA state
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);

  // Debit Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // QR Code state
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrTimerSeconds, setQrTimerSeconds] = useState(600); // 10 minutes countdown

  // Submission & Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    memberId: string;
    txnId: string;
    paidAmount: number;
    paymentType: string;
    date: string;
  } | null>(null);

  // Gym UPI Details
  const gymUpiId = `${config.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'absolutegym'}@okhdfcbank`;

  // Countdown timer for QR code payment
  useEffect(() => {
    if (!selectedPlanForModal || submitted) return;
    const interval = setInterval(() => {
      setQrTimerSeconds((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedPlanForModal, submitted]);

  if (!selectedPlanForModal) return null;

  const plan = selectedPlanForModal;
  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Detect card network
  const getCardNetwork = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'text-blue-400' };
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return { name: 'Mastercard', color: 'text-orange-400' };
    if (/^(?:508[5-9]|6521[5-9]|652[2-9]|60[6-8]|608[0-5]|6530|6531)/.test(clean)) return { name: 'RuPay', color: 'text-emerald-400' };
    if (/^3[47]/.test(clean)) return { name: 'Amex', color: 'text-cyan-400' };
    return { name: 'Debit Card', color: 'text-neutral-400' };
  };

  // UPI verification simulation
  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) return;
    setUpiVerifying(true);
    setTimeout(() => {
      setUpiVerifying(false);
      setIsUpiVerified(true);
    }, 600);
  };

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(gymUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsProcessing(true);
    setProcessingStep('Connecting to secure payment gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing payment with bank / UPI network...');
    }, 700);

    setTimeout(() => {
      setProcessingStep('Generating member biometric pass & security token...');
    }, 1400);

    setTimeout(() => {
      const generatedMemberId = `ABS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedTxnId = `TXN_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

      let paymentLabel = 'QR Code (UPI Scan & Pay)';
      if (paymentMethod === 'upi') {
        paymentLabel = upiId ? `UPI ID (${upiId})` : `UPI App (${selectedUpiApp.toUpperCase()})`;
      } else if (paymentMethod === 'card') {
        const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '8890';
        paymentLabel = `Debit Card (•••• ${last4})`;
      }

      addLead({
        name,
        email,
        phone,
        type: 'membership_inquiry',
        planName: `${plan.name} (${billingCycle})`,
        message: `Enrolled via online portal. Paid ${currency}${price.toLocaleString('en-IN')} using ${paymentLabel}. Member ID: ${generatedMemberId}. Txn: ${generatedTxnId}`,
      });

      setReceiptData({
        memberId: generatedMemberId,
        txnId: generatedTxnId,
        paidAmount: price,
        paymentType: paymentLabel,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      setIsProcessing(false);
      setSubmitted(true);
    }, 2100);
  };

  const handleClose = () => {
    setSelectedPlanForModal(null);
    setSubmitted(false);
    setIsProcessing(false);
    setName('');
    setEmail('');
    setPhone('');
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvv('');
    setUpiId('');
    setIsUpiVerified(false);
    setReceiptData(null);
  };

  const minutes = Math.floor(qrTimerSeconds / 60);
  const seconds = qrTimerSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      id="plan-checkout-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative max-w-2xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-plan-modal-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PROCESSING OVERLAY */}
        {isProcessing && (
          <div className="text-center py-16 px-4 space-y-6 animate-in fade-in duration-200">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-800 border-t-amber-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-neutral-900 border-b-cyan-400 animate-spin animate-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                Processing Membership
              </h3>
              <p className="text-sm text-neutral-400 mt-2 max-w-sm mx-auto font-medium">
                {processingStep}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>256-Bit Bank-Grade Encrypted Gateway</span>
            </div>
          </div>
        )}

        {/* SUCCESS CONFIRMATION RECEIPT & PASS */}
        {!isProcessing && submitted && receiptData && (
          <div className="text-center py-4 space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                Payment Successful & Activated
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white mt-2">
                Welcome to Absolute Gym!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-1">
                Your <span className="font-bold text-white">{plan.name}</span> subscription is officially active. Show your Digital ID Pass at the front desk for instant entry.
              </p>
            </div>

            {/* DIGITAL MEMBER PASS CARD */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-2 border-amber-500/40 text-left shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${theme.accentBg} flex items-center justify-center text-black font-black text-xs`}>
                    AE
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-white tracking-wider">
                      {config.name}
                    </div>
                    <div className="text-[10px] text-amber-400 uppercase font-mono font-bold">
                      Digital Member Pass
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Member Name</span>
                  <span className="font-extrabold text-white text-sm">{name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Member ID</span>
                  <span className="font-mono font-extrabold text-amber-400">{receiptData.memberId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Plan Tier</span>
                  <span className="font-bold text-white">{plan.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Amount Paid</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    {currency}{receiptData.paidAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Payment Method</span>
                  <span className="font-medium text-neutral-300 truncate block">{receiptData.paymentType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Txn Reference</span>
                  <span className="font-mono text-neutral-400 text-[11px] truncate block">{receiptData.txnId}</span>
                </div>
              </div>

              {/* Barcode Mockup */}
              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-1 font-mono tracking-widest text-neutral-500 text-xs select-none">
                  ||||| | |||| ||| |||| | ||||| || ||||
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {receiptData.date}
                </span>
              </div>
            </div>

            {/* DOWNLOAD & ACCESS ACTIONS */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Official Payment Receipt & Downloads</span>
                <span className="text-emerald-400 font-bold text-[10px]">Instant Document Export</span>
              </div>

              {/* Primary Download Buttons: PDF & TXT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="download-receipt-pdf-btn"
                  onClick={() => {
                    const baseAmt = Math.round(receiptData.paidAmount / 1.18);
                    const taxAmt = receiptData.paidAmount - baseAmt;
                    const formatted: FormattedReceipt = {
                      receiptNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                      date: receiptData.date,
                      memberName: name || 'Valued Member',
                      memberEmail: email || '',
                      memberPhone: phone || '',
                      memberId: receiptData.memberId,
                      planName: `${plan.name} (${billingCycle})`,
                      duration: billingCycle === 'yearly' ? '12 Months (Annual)' : '1 Month (30 Days)',
                      startDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                      expiryDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                      paymentMethod: receiptData.paymentType,
                      transactionId: receiptData.txnId,
                      baseAmount: baseAmt,
                      taxAmount: taxAmt,
                      totalAmount: receiptData.paidAmount,
                    };
                    downloadReceiptAsPDF(formatted, config);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-[0.98] transition ${theme.accentBg}`}
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>

                <button
                  type="button"
                  id="download-receipt-txt-btn"
                  onClick={() => {
                    const baseAmt = Math.round(receiptData.paidAmount / 1.18);
                    const taxAmt = receiptData.paidAmount - baseAmt;
                    const formatted: FormattedReceipt = {
                      receiptNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                      date: receiptData.date,
                      memberName: name || 'Valued Member',
                      memberEmail: email || '',
                      memberPhone: phone || '',
                      memberId: receiptData.memberId,
                      planName: `${plan.name} (${billingCycle})`,
                      duration: billingCycle === 'yearly' ? '12 Months' : '1 Month',
                      startDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                      expiryDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                      paymentMethod: receiptData.paymentType,
                      transactionId: receiptData.txnId,
                      baseAmount: baseAmt,
                      taxAmount: taxAmt,
                      totalAmount: receiptData.paidAmount,
                    };
                    downloadReceiptAsText(formatted, config);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-neutral-700 active:scale-[0.98] transition shadow-md"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Download Text (.TXT) File</span>
                </button>
              </div>

              {/* Secondary Actions: Open Portal / Print / WhatsApp */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setIsReceiptPortalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-800 transition"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Invoice & Pass Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-800 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Print A4</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHECKOUT FORM */}
        {!isProcessing && !submitted && (
          <div>
            {/* Header with Plan Info & Features Breakdown */}
            <div className="mb-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.accentBadge}`}>
                  Official Gym Checkout
                </span>
                {plan.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-amber-400 uppercase">
                    {plan.badge}
                  </span>
                )}
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold ml-auto">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure & RBI Compliant
                </span>
              </div>
              
              <div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">{plan.tagline}</p>
              </div>

              {/* Comprehensive Membership Benefits & Features Bar */}
              {plan.features && plan.features.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>Included Membership Privileges</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{plan.features.length} Perks Active</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-200">
                        <div className={`p-0.5 rounded-full ${theme.accentBg} shrink-0`}>
                          <Check className="w-3 h-3 text-black stroke-[3]" />
                        </div>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price & Billing Cycle Selector */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                  Total Payable Amount
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className={`text-3xl sm:text-4xl font-black font-sans ${theme.accentText}`}>
                    {currency}{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {plan.id === 'plan_daypass' ? 'for 1-Day All-Access Pass' : billingCycle === 'yearly' ? '/ month (billed annually)' : '/ month'}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.id !== 'plan_daypass' && (
                  <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                    ✓ Annual Savings of {currency}{((plan.priceMonthly - plan.priceYearly) * 12).toLocaleString('en-IN')} included!
                  </div>
                )}
              </div>

              {plan.id !== 'plan_daypass' && (
                <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      billingCycle === 'monthly' ? `${theme.accentBg} shadow` : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      billingCycle === 'yearly' ? `${theme.accentBg} shadow` : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-black">
                      -20%
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Member Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Jessica Martinez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Email Address (for Digital Pass) *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="e.g. jessica@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Phone Number (for SMS & Keycard) *
                    </label>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR (QR CODE, UPI, DEBIT CARD) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select Payment Method:</span>
                  </label>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono font-bold">
                    Zero Extra Fees
                  </span>
                </div>

                {/* 3 Payment Tabs: QR Code, UPI, Debit Card */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-neutral-950 border border-neutral-800 mb-3">
                  {/* Tab 1: QR Code */}
                  <button
                    type="button"
                    id="payment-method-qr-btn"
                    onClick={() => setPaymentMethod('qr')}
                    className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'qr'
                        ? `${theme.accentBg} shadow-lg scale-[1.02]`
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <QrCode className="w-4 h-4 shrink-0" />
                    <span>QR Code</span>
                  </button>

                  {/* Tab 2: UPI */}
                  <button
                    type="button"
                    id="payment-method-upi-btn"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'upi'
                        ? `${theme.accentBg} shadow-lg scale-[1.02]`
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span>UPI Apps</span>
                  </button>

                  {/* Tab 3: Debit Card */}
                  <button
                    type="button"
                    id="payment-method-card-btn"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? `${theme.accentBg} shadow-lg scale-[1.02]`
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Debit Card</span>
                  </button>
                </div>

                {/* 1. QR CODE CONTENT */}
                {paymentMethod === 'qr' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Interactive Simulated UPI QR Code Graphic */}
                      <div className="relative shrink-0 p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400/80 flex flex-col items-center">
                        <div className="w-36 h-36 relative flex items-center justify-center bg-white p-1">
                          {/* High Quality Vector QR Code Graphic Pattern */}
                          <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-950" fill="currentColor">
                            {/* Position Detection Squares (Top-Left) */}
                            <path d="M4,4 h24 v24 h-24 z M8,8 v16 h16 v-16 z M12,12 h8 v8 h-8 z" />
                            {/* Position Detection Squares (Top-Right) */}
                            <path d="M72,4 h24 v24 h-24 z M76,8 v16 h16 v-16 z M80,12 h8 v8 h-8 z" />
                            {/* Position Detection Squares (Bottom-Left) */}
                            <path d="M4,72 h24 v24 h-24 z M8,76 v16 h16 v-16 z M12,80 h8 v8 h-8 z" />
                            {/* Timing & Alignment Patterns */}
                            <path d="M32,8 h4 v4 h-4 z M40,8 h4 v4 h-4 z M48,8 h4 v4 h-4 z M56,8 h4 v4 h-4 z M64,8 h4 v4 h-4 z" />
                            <path d="M8,32 v4 h4 v-4 z M8,40 v4 h4 v-4 z M8,48 v4 h4 v-4 z M8,56 v4 h4 v-4 z M8,64 v4 h4 v-4 z" />
                            {/* Dynamic Data Modules */}
                            <path d="M32,32 h6 v6 h-6 z M42,32 h8 v4 h-8 z M54,32 h6 v6 h-6 z M64,32 h4 v8 h-4 z" />
                            <path d="M32,42 h4 v4 h-4 z M40,40 h6 v6 h-6 z M50,42 h8 v4 h-8 z M62,44 h6 v6 h-6 z" />
                            <path d="M32,50 h8 v6 h-8 z M44,52 h4 v8 h-4 z M52,50 h6 v4 h-6 z M62,54 h8 v4 h-8 z" />
                            <path d="M32,60 h6 v4 h-6 z M42,62 h6 v6 h-6 z M52,60 h8 v6 h-8 z M64,62 h6 v4 h-6 z" />
                            <path d="M4,36 h6 v4 h-6 z M14,36 h4 v6 h-4 z M22,36 h6 v4 h-6 z" />
                            <path d="M4,44 h4 v6 h-4 z M12,46 h8 v4 h-8 z M24,44 h4 v6 h-4 z" />
                            <path d="M4,54 h8 v4 h-8 z M16,56 h6 v4 h-6 z M24,54 h4 v6 h-4 z" />
                            <path d="M4,64 h6 v4 h-6 z M14,64 h8 v4 h-8 z" />
                            <path d="M72,36 h6 v4 h-6 z M82,36 h6 v6 h-6 z M92,36 h4 v4 h-4 z" />
                            <path d="M72,44 h8 v4 h-8 z M84,46 h8 v4 h-8 z M94,44 h2 v6 h-2 z" />
                            <path d="M72,54 h4 v6 h-4 z M80,54 h6 v4 h-6 z M90,54 h6 v6 h-6 z" />
                            <path d="M72,64 h8 v4 h-8 z M84,64 h6 v4 h-6 z M92,64 h4 v4 h-4 z" />
                            <path d="M32,72 h4 v6 h-4 z M40,74 h8 v4 h-8 z M52,72 h6 v4 h-6 z M62,72 h8 v6 h-8 z M74,72 h6 v4 h-6 z M84,72 h8 v6 h-8 z" />
                            <path d="M32,82 h8 v4 h-8 z M44,82 h6 v6 h-6 z M54,84 h4 v4 h-4 z M62,82 h6 v4 h-6 z M72,82 h4 v6 h-4 z M80,84 h8 v4 h-8 z" />
                            <path d="M32,90 h6 v6 h-6 z M42,92 h6 v4 h-6 z M52,90 h8 v6 h-8 z M64,92 h6 v4 h-6 z M74,90 h8 v6 h-8 z M86,92 h6 v4 h-6 z" />
                          </svg>
                          
                          {/* Center Gym Logo Pill */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-black text-amber-400 border border-amber-400/80 flex items-center justify-center font-black text-[10px] shadow-md">
                              ⚡
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] font-black uppercase text-black mt-1">
                          Scan to Pay {currency}{price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Instructions & Timer */}
                      <div className="space-y-3 flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300 uppercase">
                            Scan with Any UPI App:
                          </span>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
                            <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                            <span>Expires in {formattedTime}</span>
                          </div>
                        </div>

                        {/* Supported UPI App Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'CRED', 'Amazon Pay'].map((app) => (
                            <span
                              key={app}
                              className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-300"
                            >
                              {app}
                            </span>
                          ))}
                        </div>

                        {/* Gym UPI ID Copy Box */}
                        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2">
                          <div className="truncate">
                            <div className="text-[9px] font-bold text-neutral-500 uppercase">Gym Merchant VPA</div>
                            <div className="text-xs font-mono font-bold text-white truncate">{gymUpiId}</div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition ${
                              copiedUpi
                                ? 'bg-emerald-500 text-black'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                            }`}
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                          </button>
                        </div>

                        <div className="text-[11px] text-neutral-400 space-y-1">
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Check className="w-3 h-3" />
                            <span>Instant automated confirmation upon transfer</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. UPI APP SELECTION & VPA ID */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        1. Choose Your Preferred UPI App:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'gpay', name: 'Google Pay', icon: '⚡ GPay' },
                          { id: 'phonepe', name: 'PhonePe', icon: '🟣 PhonePe' },
                          { id: 'paytm', name: 'Paytm UPI', icon: '🔵 Paytm' },
                          { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳 BHIM' },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              selectedUpiApp === app.id
                                ? `bg-neutral-900 border-amber-400 text-white shadow-md`
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                            }`}
                          >
                            <span>{app.icon}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Or enter custom UPI ID */}
                    <div className="pt-2 border-t border-neutral-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          2. Or Enter UPI ID / VPA:
                        </label>
                        {isUpiVerified && (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified User
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="e.g. mobile@okhdfcbank or username@ybl"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setIsUpiVerified(false);
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyUpi}
                          disabled={!upiId || isUpiVerified || upiVerifying}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                            isUpiVerified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                          }`}
                        >
                          {upiVerifying ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : isUpiVerified ? (
                            'Verified ✓'
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>

                      {/* Fast Suffix Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-neutral-500">Quick handles:</span>
                        {['@okhdfcbank', '@oksbi', '@ybl', '@paytm', '@ibl'].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              const base = upiId.split('@')[0] || (name ? name.toLowerCase().replace(/\s+/g, '') : 'member');
                              setUpiId(`${base}${suffix}`);
                              setIsUpiVerified(false);
                            }}
                            className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DEBIT CARD CONTENT */}
                {paymentMethod === 'card' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5 animate-in fade-in duration-200">
                    {/* Card Brand Header */}
                    <div className="flex items-center justify-between text-xs pb-1">
                      <span className="font-bold text-neutral-400 uppercase">Debit / ATM Card Details</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black uppercase ${getCardNetwork(cardNumber).color}`}>
                          {getCardNetwork(cardNumber).name}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase">RuPay / Visa / MC</span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="4532 •••• •••• 8890"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono tracking-wider focus:outline-none focus:border-amber-400"
                        />
                        <CreditCard className="absolute right-3.5 top-3 w-4 h-4 text-neutral-500" />
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Cardholder Name (as on card)
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'card'}
                        placeholder={name || 'Jessica Martinez'}
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white uppercase focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Expiry & CVV Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="08/29"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono text-center focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          CVV / CVC (3-4 Digits)
                        </label>
                        <input
                          type="password"
                          required={paymentMethod === 'card'}
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono text-center focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Auto-renew checkbox */}
                    <label className="flex items-center gap-2 pt-1 text-xs text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-4 h-4 rounded accent-amber-400"
                      />
                      <span>Save card securely for seamless membership renewals (RBI tokenized)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Submit CTA Button - ZERO DOLLAR SIGN */}
              <div className="pt-3">
                <button
                  type="submit"
                  id="confirm-plan-enrollment-btn"
                  className={`w-full py-4 px-6 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl hover:brightness-110 ${theme.accentBg}`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    Pay {currency}{price.toLocaleString('en-IN')} & Activate Membership
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
