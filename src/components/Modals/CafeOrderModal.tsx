import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { CafeItem } from '../../types';
import {
  X,
  Coffee,
  Info,
  CheckCircle,
  Bell,
  MapPin,
  Clock,
  Sparkles,
  Utensils,
} from 'lucide-react';

interface CafeOrderModalProps {
  item: CafeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CafeOrderModal: React.FC<CafeOrderModalProps> = ({ item, isOpen, onClose }) => {
  const { config, themeColor, addLead } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  const [notifyContact, setNotifyContact] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!isOpen || !item) return null;

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyContact.trim()) return;

    addLead({
      name: 'Gym Member',
      email: notifyContact.includes('@') ? notifyContact : 'member@absolute.fit',
      phone: !notifyContact.includes('@') ? notifyContact : '+91 98765 43210',
      type: 'general_contact',
      planName: `Cafe Online Waitlist: ${item.name}`,
      message: `User requested notification for Cafe Online Ordering. Contact: ${notifyContact}. Interested in: ${item.name}`,
    });

    setIsSubscribed(true);
  };

  const handleClose = () => {
    setIsSubscribed(false);
    setNotifyContact('');
    onClose();
  };

  return (
    <div
      id="cafe-order-dialog-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        id="cafe-order-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cafe-dialog-title"
        className="relative max-w-lg w-full bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${theme.accentBg} text-black shadow-md`}>
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${theme.accentBadge}`}>
                {config.cafe?.name || 'Absolute Gym Cafe'}
              </span>
              <h3 id="cafe-dialog-title" className="text-lg font-black uppercase text-white tracking-tight">
                Café Ordering Notice
              </h3>
            </div>
          </div>

          <button
            id="close-cafe-dialog-btn"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Selected Item Snippet */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-xl border border-neutral-800 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Selected Item
              </span>
              <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
              <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                {currency}{(item.price ?? 0).toLocaleString('en-IN')}
                {item.proteinGrams && (
                  <span className="ml-2 text-neutral-400 font-sans font-normal text-[11px]">
                    ({item.proteinGrams}g Protein)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Notice Callout Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                Online Ordering Unavailable
              </h4>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                Online ordering is currently unavailable. For now, all orders must be placed offline at the café counter. We’ll notify you once online ordering is available.
              </p>
            </div>
          </div>

          {/* Counter Service Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center gap-2.5 text-neutral-300">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="truncate">Front Café Counter</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center gap-2.5 text-neutral-300">
              <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="truncate">{config.cafe?.hours || '6:00 AM – 10:30 PM'}</span>
            </div>
          </div>

          {/* Notify Me Waitlist (Optional Form) */}
          <div className="pt-2 border-t border-neutral-800/80">
            {!isSubscribed ? (
              <form onSubmit={handleNotifySubmit} className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-neutral-400" />
                  Get notified when online ordering launches
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notifyContact}
                    onChange={(e) => setNotifyContact(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-600 transition"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition shrink-0"
                  >
                    Notify Me
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>You're on the list! We'll notify you as soon as online ordering opens.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            id="close-cafe-notice-btn"
            type="button"
            onClick={handleClose}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md ${theme.accentBg}`}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
