import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { X, Flame, CheckCircle, Sparkles, UserCheck } from 'lucide-react';

export const TrialPassModal: React.FC = () => {
  const { isTrialModalOpen, setIsTrialModalOpen, themeColor, addLead } = useGym();
  const theme = themeStyles[themeColor];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isTrialModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addLead({
      name,
      email,
      phone,
      type: 'trial_pass',
      planName: '1-Day Free VIP Pass',
      message: 'Claimed VIP All-Access Trial pass from website modal.',
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    setIsTrialModalOpen(false);
    setSubmitted(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div
      id="trial-pass-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative max-w-lg w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-trial-modal-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase text-white">
              VIP Pass Activated!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              Your free 1-Day All-Access Pass is ready. Show this confirmation or provide your phone number at the front desk to enter and get your locker assigned.
            </p>
            <div className="p-4 rounded-xl bg-neutral-950 border border-dashed border-amber-500/40 text-center font-mono text-sm text-amber-400">
              PASS CODE: ABS-VIP-{(Date.now() % 100000).toString().padStart(6, '0')}
            </div>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider ${theme.accentBg}`}
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${theme.accentBadge}`}>
                <Flame className="w-3.5 h-3.5" />
                <span>Complimentary Guest Access</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">
                Claim Your Free 1-Day VIP Pass
              </h3>
              <p className="text-xs text-neutral-400 mt-2">
                Experience full gym floor access, Olympic lifting bays, infrared saunas, and any group fitness studio class of your choice.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="claim-pass-submit-btn"
                  className={`w-full py-4 px-6 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${theme.accentBg}`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Get pass access</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
