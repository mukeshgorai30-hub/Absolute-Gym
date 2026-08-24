import React, { useEffect, useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { SubscriptionPlan, SpaServiceItem } from '../types';
import { defaultSpaServices } from '../data/defaultGymData';
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  Flame,
  Droplets,
  Star,
  Users,
  ChevronDown,
} from 'lucide-react';

export const PlansPricingPage: React.FC = () => {
  const { config, themeColor, setSelectedPlanForModal, setIsTrialModalOpen } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const spaServices = config.spaServices || defaultSpaServices;

  const pricingFaqs = [
    {
      q: 'Are there any hidden admission or equipment maintenance fees?',
      a: 'None whatsoever. All prices displayed are completely transparent with full access to gym equipment, locker rooms, saunas, and showers included in your plan tier.',
    },
    {
      q: 'Can I freeze or pause my membership if I travel or get injured?',
      a: 'Yes! Members on 3-month, 6-month, or 1-year plans can freeze their membership free of charge up to 30 days per calendar year directly from member support.',
    },
    {
      q: 'Do plans include personal training sessions?',
      a: 'All plans include a complimentary 1-on-1 Fitness Assessment & Biometrics Scan upon joining. VIP Elite packages additionally include complimentary monthly 1-on-1 coaching sessions and custom meal plans.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and zero-interest EMI options on quarterly and annual subscriptions.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white pt-6 pb-24">
      {/* Page Hero Header */}
      <div className="relative border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-16 sm:py-24 overflow-hidden">
        {config.plansBgImage && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={config.plansBgImage}
              alt="Plans Background"
              className="w-full h-full object-cover opacity-15 filter blur-xs scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/90 to-neutral-950" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 ${theme.accentBadge}`}>
            <Sparkles className="w-4 h-4" />
            <span>Membership Packages & Transparent Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
            Plans & Pricing
          </h1>

          <p className="mt-4 text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Invest in your strength, longevity, and physical peak. Flexible commitments from short-term passes to full VIP annual access with zero hidden fees.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
                billingCycle === 'monthly'
                  ? `${theme.accentBg} shadow-md`
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? `${theme.accentBg} shadow-md`
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Annual Pass</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {config.plans.map((plan: SubscriptionPlan) => {
            const displayPrice =
              billingCycle === 'yearly' && plan.priceYearly
                ? Math.round(plan.priceYearly / 12)
                : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                id={`plans-page-card-${plan.id}`}
                className={`relative bg-neutral-900/90 rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl ${
                  plan.popular
                    ? `${theme.glowClass} border-amber-400/80 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950`
                    : 'border-neutral-800/90 hover:border-neutral-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-black px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
                    <Star className="w-3.5 h-3.5 fill-black" />
                    <span>{plan.badge || 'Most Popular Choice'}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                      {plan.name}
                    </h3>
                    {plan.duration && (
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-[11px] font-bold text-neutral-300 border border-neutral-700">
                        {plan.duration}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-400 min-h-[40px] leading-relaxed">
                    {plan.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="mt-6 pb-6 border-b border-neutral-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-5xl font-black text-white font-mono">
                        {currency}{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs sm:text-sm text-neutral-400 font-bold uppercase">
                        / month
                      </span>
                    </div>

                    {billingCycle === 'yearly' && plan.priceYearly && (
                      <div className="text-xs text-emerald-400 font-bold mt-1.5">
                        Billed annually ({currency}{plan.priceYearly.toLocaleString('en-IN')} / yr)
                      </div>
                    )}
                  </div>

                  {/* Features Included */}
                  <div className="mt-6 space-y-3">
                    <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                      Included with this package:
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                        <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}

                    {/* Exclusions */}
                    {plan.notIncluded && plan.notIncluded.length > 0 && (
                      <div className="pt-2 space-y-2">
                        {plan.notIncluded.map((notFeat, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-500 line-through">
                            <span className="w-3.5 h-3.5 text-center shrink-0">×</span>
                            <span>{notFeat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="mt-8 pt-6 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForModal(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg min-h-[48px] touch-manipulation active:scale-[0.98] ${
                      plan.popular ? theme.accentBg : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    }`}
                  >
                    <span>{plan.ctaText || 'Get Started Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Spa & Recovery Add-on Services Strip */}
        <div className="mt-20 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
                <Droplets className="w-3.5 h-3.5" />
                <span>Recovery & Hydrotherapy</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Spa & Recovery Add-On Menu
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
                Enhance your training with our on-site Finnish sauna, eucalyptus steam room, and clinical deep-tissue recovery therapy.
              </p>
            </div>
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition shrink-0"
            >
              Inquire at Front Desk
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {spaServices.map((spa: SpaServiceItem) => (
              <div
                key={spa.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span className="font-bold text-cyan-400 uppercase text-[10px]">{spa.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {spa.duration}
                    </span>
                  </div>
                  <h4 className="text-base font-black uppercase text-white">{spa.name}</h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{spa.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 block">Member Price</span>
                    <span className="text-base font-black text-white font-mono">
                      {currency}{(spa.memberPrice ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-neutral-500 block">Standard</span>
                    <span className="text-xs font-bold text-neutral-400 line-through font-mono">
                      {currency}{(spa.nonMemberPrice ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing FAQs Accordion */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Frequently Asked Pricing Questions
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Have questions regarding membership terms, cancellation, or upgrades?
            </p>
          </div>

          <div className="space-y-3">
            {pricingFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 touch-manipulation"
                  >
                    <span className="text-sm sm:text-base font-extrabold text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
