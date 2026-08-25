import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { X, Send, CheckCircle, Mail, Phone, User, FileText, MessageSquare } from 'lucide-react';

export const TrialPassModal: React.FC = () => {
  const { isTrialModalOpen, setIsTrialModalOpen, themeColor, addLead } = useGym();
  const theme = themeStyles[themeColor];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');

  if (!isTrialModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !description.trim()) return;

    const refId = `INQ-${(Date.now() % 1000000).toString().padStart(6, '0')}`;
    setInquiryId(refId);

    addLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      type: 'membership_inquiry',
      planName: 'General & Service Inquiry',
      message: `[Ref: ${refId}] ${description.trim()}`,
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    setIsTrialModalOpen(false);
    setSubmitted(false);
    setName('');
    setEmail('');
    setPhone('');
    setDescription('');
    setInquiryId('');
  };

  return (
    <div
      id="inquiry-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative max-w-lg w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-inquiry-modal-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
          aria-label="Close inquiry modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">
              Inquiry Submitted!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-white font-bold">{name}</span>. We have received your inquiry. Our fitness & wellness advisors will contact you shortly via phone or email.
            </p>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
              <div className="text-[10px] uppercase font-bold text-neutral-400">Reference Number</div>
              <div className={`font-mono text-base font-black ${theme.accentText}`}>
                {inquiryId}
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider ${theme.accentBg}`}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${theme.accentBadge}`}>
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Inquiry & Consultation</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Send Us An Inquiry
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Fill in your details below and our team will get in touch with you right away.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="Enter your phone number (e.g. +91 98765 43210)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    spellCheck={false}
                    placeholder="Enter your email address (e.g. name@example.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-1">
                  Description / Message *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your requirements, preferred timing, spa service, or questions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="inquiry-submit-btn"
                  className={`w-full py-3.5 px-6 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] ${theme.accentBg}`}
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

