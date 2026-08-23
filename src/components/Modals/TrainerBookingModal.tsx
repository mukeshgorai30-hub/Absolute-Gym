import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { X, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';

export const TrainerBookingModal: React.FC = () => {
  const { selectedTrainerForModal, setSelectedTrainerForModal, themeColor, config, addLead } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [goals, setGoals] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!selectedTrainerForModal) return null;

  const trainer = selectedTrainerForModal;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addLead({
      name,
      email,
      phone,
      type: 'trainer_booking',
      trainerName: trainer.name,
      preferredTime: preferredDate || 'Flexible',
      message: `Requested 1-on-1 assessment with Coach ${trainer.name}. Goals: ${goals || 'Strength & Conditioning'}`,
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    setSelectedTrainerForModal(null);
    setSubmitted(false);
    setName('');
    setEmail('');
    setPhone('');
    setPreferredDate('');
    setGoals('');
  };

  return (
    <div
      id="trainer-booking-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative max-w-xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back / Close Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            id="back-to-coaches-btn"
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition active:scale-95 touch-manipulation"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            id="close-trainer-modal-btn"
            onClick={handleClose}
            className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase text-white">
              Assessment Request Received!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              We've notified <span className="font-bold text-amber-400">{trainer.name}</span>. Our training coordinator will call or email you within 2 hours to confirm your time slot and pre-assessment form.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleClose}
                className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider ${theme.accentBg}`}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-800">
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-16 h-16 rounded-2xl object-cover border border-neutral-700 shadow"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${theme.accentBadge}`}>
                  Personal Training Consultation
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                  Coach {trainer.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  {trainer.role} • {currency}{(trainer.ratePerSession ?? 0).toLocaleString('en-IN')}/session
                </p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. David Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    spellCheck={false}
                    placeholder="e.g. david@example.com"
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
                    placeholder="e.g. +1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Preferred Date & Time Window:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tuesday morning around 8:00 AM or Saturday afternoon"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Primary Goals / Areas to Focus On:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Barbell squat form correction, powerlifting prep, body recomposition"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-extrabold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  id="submit-trainer-booking-btn"
                  className={`flex-1 py-3 px-6 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${theme.accentBg}`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Assessment Session</span>
                </button>
              </div>

              <p className="text-[11px] text-neutral-500 text-center">
                Includes complimentary InBody 770 movement and body composition scan.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
