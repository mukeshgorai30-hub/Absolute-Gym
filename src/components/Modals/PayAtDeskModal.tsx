import React from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import {
  X,
  Building2,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
} from 'lucide-react';

export const PayAtDeskModal: React.FC = () => {
  const { selectedPlanForModal, setSelectedPlanForModal, themeColor, config } = useGym();
  const theme = themeStyles[themeColor];

  if (!selectedPlanForModal) return null;

  const plan = selectedPlanForModal;
  const currency = config.currencySymbol || '₹';
  const displayPrice = plan.priceMonthly;

  const handleClose = () => {
    setSelectedPlanForModal(null);
  };

  const handleWhatsApp = () => {
    const phone = config.phone?.replace(/[^0-9]/g, '') || '';
    const text = encodeURIComponent(
      `Hi ${config.name}! I am interested in activating the ${plan.name} (${plan.duration || 'Plan'} - ${currency}${displayPrice.toLocaleString()}). Could you please share desk arrival details?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    if (config.phone) {
      window.location.href = `tel:${config.phone.replace(/[^0-9+]/g, '')}`;
    }
  };

  return (
    <div
      id="pay-at-desk-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative max-w-lg w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-pay-at-desk-modal-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className={`p-3 rounded-2xl ${theme.accentBg} text-black font-bold shadow-lg shadow-amber-500/10 shrink-0`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                Walk-In Activation
              </span>
              {plan.badge && (
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
              Pay at Gym Desk
            </h3>
          </div>
        </div>

        {/* Selected Plan Summary Card */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 mb-5">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div>
              <h4 className="text-base font-bold text-white tracking-wide">
                {plan.name}
              </h4>
              <p className="text-xs text-neutral-400 font-medium">
                {plan.duration ? `Duration: ${plan.duration}` : 'Standard Gym Access'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 tracking-tight">
                {currency}{displayPrice.toLocaleString()}
              </span>
              <span className="text-neutral-400 text-xs block font-medium">
                / {plan.duration || 'package'}
              </span>
            </div>
          </div>

          {/* Included Features preview */}
          {plan.features && plan.features.length > 0 && (
            <div className="pt-3 border-t border-neutral-800/60 mt-3 space-y-1.5">
              {plan.features.slice(0, 3).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desk Arrival Guidance */}
        <div className="space-y-3.5 mb-6 text-xs text-neutral-300">
          {/* Location & Timings */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
            {config.address && (
              <div className="flex items-start gap-2 text-neutral-300 text-xs">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Location: </span>
                  <span>{config.address}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-neutral-300 text-xs">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Hours: </span>
                <span>{config.hours || 'Mon-Sat 5:30 AM - 10:00 PM | Sun 6:00 AM - 12:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {config.phone && (
            <button
              id="pay-desk-modal-whatsapp-btn"
              type="button"
              onClick={handleWhatsApp}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-emerald-950/40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Desk</span>
            </button>
          )}

          {config.phone && (
            <button
              id="pay-desk-modal-call-btn"
              type="button"
              onClick={handleCall}
              className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Call Reception</span>
            </button>
          )}

          <button
            id="pay-desk-modal-got-it-btn"
            type="button"
            onClick={handleClose}
            className={`py-3 px-6 rounded-xl ${theme.accentBg} text-black font-black text-xs uppercase tracking-wider transition active:scale-[0.98] flex items-center justify-center`}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
