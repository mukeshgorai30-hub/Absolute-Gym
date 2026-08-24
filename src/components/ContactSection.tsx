import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  Sparkles,
  Flame,
  ShieldCheck,
  ExternalLink,
  Navigation,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { config, themeColor, addLead } = useGym();
  const theme = themeStyles[themeColor];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState<'trial_pass' | 'membership_inquiry' | 'general_contact'>('trial_pass');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addLead({
      name,
      email,
      phone,
      type: inquiryType,
      message,
    });

    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <section id="contact" className="w-full max-w-full py-24 bg-neutral-950 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.contactBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.contactBgImage}
            alt="Contact Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/85 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <MapPin className="w-3.5 h-3.5" />
            <span>Facility Location & Operating Hours</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Visit {config.name || 'Absolute Gym'} Today
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Stop by for a workout, book a facility tour, or message our membership team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact & Free Pass Capture Form (Left on Desktop) */}
          <div className="lg:col-span-7 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl">
            <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
              <Flame className={`w-5 h-5 ${theme.accentText}`} />
              <span>Claim Free VIP Pass or Send Message</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Fill out the form below. We will send your digital guest pass barcode and schedule your welcome tour.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-neutral-950 border border-emerald-500/40 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-white uppercase">
                  Request Submitted Successfully!
                </h4>
                <p className="text-xs text-neutral-300 max-w-md mx-auto">
                  Thank you! Our concierge team has logged your pass. Check your inbox or stop by our front desk with your phone number.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${theme.accentBg}`}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-4">
                  <button
                    type="button"
                    onClick={() => setInquiryType('trial_pass')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition uppercase ${
                      inquiryType === 'trial_pass' ? theme.accentBg : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    1-Day VIP Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryType('membership_inquiry')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition uppercase ${
                      inquiryType === 'membership_inquiry' ? theme.accentBg : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Membership Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryType('general_contact')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition uppercase ${
                      inquiryType === 'general_contact' ? theme.accentBg : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    General Message
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. John Miller"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. +1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Message / Fitness Goals (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what time you'd like to visit or any questions you have..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="contact-submit-btn"
                    className={`w-full py-4 px-6 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${theme.accentBg}`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {inquiryType === 'trial_pass' ? 'Claim My Free 1-Day Pass Now' : 'Send Message To Concierge'}
                    </span>
                  </button>
                </div>

                <p className="text-[11px] text-neutral-500 text-center mt-2">
                  🔒 We respect your privacy. No spam guaranteed. Instant confirmation logged.
                </p>
              </form>
            )}
          </div>

          {/* Gym Information & Hours Card (Right on Desktop) */}
          <div className="lg:col-span-5 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
                ABOUT OUR GYM
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {config.description}
              </p>
            </div>

            {/* Address & Quick Contacts */}
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0 ${theme.accentText}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Location</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{config.address}</div>
                  {(config.googleMapsEmbedUrl || config.address) && (
                    <a
                      href={
                        config.googleMapsEmbedUrl?.trim() ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className={`text-xs font-bold mt-1.5 inline-flex items-center gap-1.5 hover:underline ${theme.accentText}`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0 ${theme.accentText}`}>
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Phone & Desk</div>
                  <a href={`tel:${config.phone}`} className="text-sm font-semibold text-white hover:underline block mt-0.5">
                    {config.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0 ${theme.accentText}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email Inquiries</div>
                  <a href={`mailto:${config.email}`} className="text-sm font-semibold text-white hover:underline block mt-0.5">
                    {config.email}
                  </a>
                </div>
              </div>

              {config.whatsapp && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">WhatsApp Chat</div>
                    <a
                      href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-emerald-400 hover:underline block mt-0.5"
                    >
                      Chat with Membership Team →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Operating Hours Table */}
            <div className="pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Operating & Staffed Hours</span>
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Monday – Friday</span>
                  <span className="text-white font-bold">{config.operatingHours.monFri}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Saturday</span>
                  <span className="text-white font-bold">{config.operatingHours.saturday}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Sunday</span>
                  <span className="text-white font-bold">{config.operatingHours.sunday}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
