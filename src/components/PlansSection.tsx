import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { SubscriptionPlan, SpaServiceItem, PackageDuration } from '../types';
import {
  Check,
  X,
  Zap,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Flame,
  Receipt,
  Droplets,
  HeartPulse,
  Clock,
  Tag,
  User,
  Users,
  Calendar,
  Layers,
} from 'lucide-react';
import { defaultSpaServices } from '../data/defaultGymData';

const DURATION_SUBSECTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Packages' },
  { id: '1 Day', label: '1 Day' },
  { id: '3 Days', label: '3 Days' },
  { id: '7 Days', label: '7 Days' },
  { id: '15 Days', label: '15 Days' },
  { id: '1 Month', label: '1 Month' },
  { id: '2 Months', label: '2 Months' },
  { id: '3 Months', label: '3 Months' },
  { id: '6 Months', label: '6 Months' },
  { id: '1 Year', label: '1 Year' },
  { id: '2 Years', label: '2 Years' },
];

export const PlansSection: React.FC = () => {
  const {
    config,
    themeColor,
    setSelectedPlanForModal,
    setIsTrialModalOpen,
    setIsReceiptPortalOpen,
    setCurrentPage,
  } = useGym();
  const theme = themeStyles[themeColor];

  // Primary Tab: 'packages' or 'spa' (Replacing Monthly vs Annual)
  const [activeMainTab, setActiveMainTab] = useState<'packages' | 'spa'>('packages');

  // Sub-section for Packages (Duration filter)
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  // Sub-section for Massage & Steam ('all' | 'member' | 'non-member')
  const [spaSubSection, setSpaSubSection] = useState<'all' | 'member' | 'non-member'>('all');

  // Spa services list from config or defaults
  const spaServices: SpaServiceItem[] =
    config.spaServices && config.spaServices.length > 0
      ? config.spaServices
      : defaultSpaServices;

  // Filter plans by selected duration
  const filteredPlans = config.plans.filter((plan) => {
    if (selectedDuration === 'all') return true;
    if (!plan.duration) {
      if (selectedDuration === '1 Month') return true;
      return false;
    }
    return plan.duration.toLowerCase() === selectedDuration.toLowerCase();
  });

  const currency = config.currencySymbol || '₹';

  return (
    <section
      id="plans"
      className="w-full max-w-full py-24 bg-neutral-950 text-white relative overflow-hidden border-b border-neutral-800"
    >
      {/* Dynamic Atmospheric Background Image */}
      {config.plansBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.plansBgImage}
            alt="Plans Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/85 to-neutral-950" />
        </div>
      )}

      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-neutral-900/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent Memberships & Spa Therapy</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            {activeMainTab === 'packages'
              ? 'Choose Your Membership Package'
              : 'Massage & Eucalyptus Steam Spa'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            {activeMainTab === 'packages'
              ? 'Flexible passes and memberships tailored to your fitness lifestyle — from 1-day drop-ins to multi-year championship packages.'
              : 'Restorative athletic recovery, deep tissue sports massage, volcanic hot stones, and private eucalyptus detox steam suites.'}
          </p>

          {/* Primary Switch Toggle: Packages vs Massage and Steam */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-inner max-w-full overflow-x-auto">
            <button
              id="tab-packages-btn"
              onClick={() => setActiveMainTab('packages')}
              className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all min-h-[46px] touch-manipulation active:scale-95 flex items-center gap-2 ${
                activeMainTab === 'packages'
                  ? `${theme.accentBg} shadow-lg`
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Packages</span>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-extrabold">
                1 Day – 2 Yrs
              </span>
            </button>

            <button
              id="tab-massage-steam-btn"
              onClick={() => setActiveMainTab('spa')}
              className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all min-h-[46px] touch-manipulation active:scale-95 flex items-center gap-2 ${
                activeMainTab === 'spa'
                  ? `${theme.accentBg} shadow-lg`
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>Massage & Steam</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: PACKAGES & DURATION SUB-SECTIONS                     */}
        {/* ------------------------------------------------------------- */}
        {activeMainTab === 'packages' && (
          <div className="space-y-8">
            {/* Duration Sub-Section Filter Bar */}
            <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 mb-3 px-2">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Package Duration Sub-Section:</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Showing {filteredPlans.length} of {config.plans.length} Packages
                </span>
              </div>

              {/* Scrollable Duration Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                {DURATION_SUBSECTIONS.map((sub) => {
                  const isActive = selectedDuration === sub.id;
                  const matchingCount =
                    sub.id === 'all'
                      ? config.plans.length
                      : config.plans.filter(
                          (p) =>
                            p.duration?.toLowerCase() === sub.id.toLowerCase() ||
                            (!p.duration && sub.id === '1 Month')
                        ).length;

                  return (
                    <button
                      key={sub.id}
                      id={`duration-filter-${sub.id.replace(/\s+/g, '-').toLowerCase()}-btn`}
                      onClick={() => setSelectedDuration(sub.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? `${theme.accentBg} shadow-md scale-[1.02]`
                          : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>{sub.label}</span>
                      {matchingCount > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive
                              ? 'bg-black/30 text-black'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {matchingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Swipe Indicator Hint */}
            <div className="flex md:hidden items-center justify-between text-xs text-neutral-400 px-1">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                <span>← Swipe packages horizontally →</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {filteredPlans.length} plans available
              </span>
            </div>

            {/* Pricing Cards Grid / Horizontal Scroll on Mobile */}
            {filteredPlans.length > 0 ? (
              <div className="w-full max-w-full overflow-hidden">
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-7 items-stretch overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 md:scroll-px-0 pb-6 md:pb-0 px-4 sm:px-6 md:px-0 scrollbar-none touch-auto">
                  {filteredPlans.map((plan: SubscriptionPlan) => {
                    const price = plan.priceMonthly;
                    const isHighlighted = plan.popular;
                    const planDuration = plan.duration || '1 Month';

                    return (
                      <div
                        key={plan.id}
                        id={`plan-card-${plan.id}`}
                        onClick={() => setSelectedPlanForModal(plan)}
                        className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-200 cursor-pointer active:scale-[0.99] touch-manipulation select-none w-[84vw] sm:w-[320px] max-w-[340px] shrink-0 snap-center md:snap-align-none md:w-auto md:max-w-none md:shrink ${
                          isHighlighted
                            ? `bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border-2 ${theme.accentBorder} ${theme.glowClass} scale-[1.01] z-20`
                            : 'bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {/* Duration & Badge Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{planDuration}</span>
                          </span>

                          {plan.badge && (
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                                isHighlighted
                                  ? theme.accentBg
                                  : 'bg-neutral-800 text-amber-400 border border-neutral-700'
                              }`}
                            >
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          {/* Plan Name & Tagline */}
                          <div className="text-left">
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-neutral-400 mt-2 min-h-[36px] line-clamp-2">
                              {plan.tagline}
                            </p>
                          </div>

                          {/* Price Display */}
                          <div className="mt-5 mb-5 text-left border-y border-neutral-800/80 py-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
                                {currency}
                                {(price ?? 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Features List */}
                          <div className="space-y-2.5 text-left">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                              Included Perks:
                            </div>
                            {plan.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 text-xs text-neutral-200"
                              >
                                <div
                                  className={`mt-0.5 p-0.5 rounded-full ${theme.accentBg} shrink-0`}
                                >
                                  <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                                </div>
                                <span className="leading-snug">{feature}</span>
                              </div>
                            ))}

                            {/* Excluded Perks */}
                            {plan.notIncluded && plan.notIncluded.length > 0 && (
                              <div className="pt-2 space-y-1.5">
                                {plan.notIncluded.map((notItem, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 text-[11px] text-neutral-500"
                                  >
                                    <X className="w-3 h-3 text-neutral-600 shrink-0 mt-0.5" />
                                    <span className="line-through">{notItem}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Plan Action CTA */}
                        <div className="mt-6 pt-3">
                          <button
                            id={`select-plan-${plan.id}-btn`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlanForModal(plan);
                            }}
                            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[46px] touch-manipulation active:scale-[0.98] ${
                              isHighlighted
                                ? `${theme.accentBg} shadow-lg hover:brightness-110`
                                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                            }`}
                          >
                            <span>{plan.ctaText || `Choose ${planDuration}`}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800">
                <p className="text-neutral-400 text-sm">
                  No packages currently configured for "{selectedDuration}".
                </p>
                <button
                  onClick={() => setSelectedDuration('all')}
                  className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-white hover:bg-neutral-700"
                >
                  View All Packages
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: MASSAGE & STEAM PRICING TABLE                        */}
        {/* ------------------------------------------------------------- */}
        {activeMainTab === 'spa' && (
          <div className="space-y-8">
            {/* Sub-Section Filter: All vs Member vs Non-Member */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-black uppercase text-white">
                    Massage Therapy & Steam Bath Rates
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Transparent service rate card for Active Members & Walk-in Guests
                  </p>
                </div>
              </div>

              {/* Sub-section buttons */}
              <div className="inline-flex items-center p-1 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
                <button
                  id="spa-filter-all-btn"
                  onClick={() => setSpaSubSection('all')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    spaSubSection === 'all'
                      ? `${theme.accentBg} shadow-sm`
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Therapies</span>
                </button>
                <button
                  id="spa-filter-member-btn"
                  onClick={() => setSpaSubSection('member')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    spaSubSection === 'member'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Member Rates</span>
                </button>
                <button
                  id="spa-filter-nonmember-btn"
                  onClick={() => setSpaSubSection('non-member')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    spaSubSection === 'non-member'
                      ? 'bg-neutral-700 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Non-Member Rates</span>
                </button>
              </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* PRICE TABLE (Desktop & Tablet High Contrast View)                */}
            {/* ---------------------------------------------------------------- */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/80 text-xs font-black uppercase tracking-wider text-neutral-300">
                    <th className="py-4 px-6 w-[50%]">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-amber-400" />
                        <span>Service & Treatment</span>
                      </div>
                    </th>
                    <th
                      className={`py-4 px-6 w-[25%] ${
                        spaSubSection === 'member' || spaSubSection === 'all'
                          ? 'bg-emerald-950/40 text-emerald-300'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span>Member Rate</span>
                      </div>
                    </th>
                    <th
                      className={`py-4 px-6 w-[25%] ${
                        spaSubSection === 'non-member' || spaSubSection === 'all'
                          ? 'bg-neutral-900/90 text-neutral-200'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-neutral-400" />
                        <span>Non-Member Rate</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70 text-sm">
                  {spaServices.map((service, idx) => {
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={service.id}
                        id={`spa-service-row-${service.id}`}
                        className={`transition-colors hover:bg-neutral-900/60 ${
                          isEven ? 'bg-neutral-950' : 'bg-neutral-900/30'
                        }`}
                      >
                        {/* Service Details */}
                        <td className="py-4 px-6 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-black text-white uppercase tracking-tight">
                                {service.name}
                              </span>

                              {/* Duration Pill */}
                              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-amber-400 text-xs font-mono font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.duration}
                              </span>

                              {/* Category Badge */}
                              <span className="px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300 text-[11px] font-bold">
                                {service.category}
                              </span>

                              {/* Badge */}
                              {service.badge && (
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                    service.popular ? theme.accentBg : 'bg-neutral-800 text-cyan-400'
                                  }`}
                                >
                                  {service.badge}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                              {service.description}
                            </p>

                            {/* Benefits Chips */}
                            {service.benefits && service.benefits.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                {service.benefits.map((b, bIdx) => (
                                  <span
                                    key={bIdx}
                                    className="text-[11px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800"
                                  >
                                    ✓ {b}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Member Price */}
                        <td
                          className={`py-4 px-6 align-middle ${
                            spaSubSection === 'member' || spaSubSection === 'all'
                              ? 'bg-emerald-950/20'
                              : ''
                          }`}
                        >
                          <div className="text-2xl font-black text-emerald-400 font-sans tracking-tight">
                            {currency}
                            {(service.memberPrice ?? 0).toLocaleString('en-IN')}
                          </div>
                        </td>

                        {/* Non-Member Price */}
                        <td
                          className={`py-4 px-6 align-middle ${
                            spaSubSection === 'non-member' || spaSubSection === 'all'
                              ? 'bg-neutral-900/40'
                              : ''
                          }`}
                        >
                          <div>
                            <div className="text-2xl font-black text-neutral-200 font-sans tracking-tight">
                              {currency}
                              {(service.nonMemberPrice ?? 0).toLocaleString('en-IN')}
                            </div>
                            <button
                              onClick={() => setIsTrialModalOpen(true)}
                              className="mt-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline block"
                            >
                              Book Appointment →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* MOBILE SERVICE CARDS (Touch Friendly)                           */}
            {/* ---------------------------------------------------------------- */}
            <div className="md:hidden space-y-4">
              {spaServices.map((service) => {
                return (
                  <div
                    key={service.id}
                    className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-left"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-400">
                          {service.category}
                        </span>
                        <h4 className="text-lg font-black uppercase text-white mt-1">
                          {service.name}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-mono font-bold shrink-0">
                        {service.duration}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Rate Comparison Box */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      {/* Member Column */}
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-left">
                        <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">
                          Member Price
                        </span>
                        <span className="text-xl font-black text-emerald-300 font-sans">
                          {currency}
                          {(service.memberPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Non-Member Column */}
                      <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-left">
                        <span className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
                          Non-Member Price
                        </span>
                        <span className="text-xl font-black text-neutral-200 font-sans">
                          {currency}
                          {(service.nonMemberPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsTrialModalOpen(true)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition ${theme.accentBg}`}
                    >
                      Book {service.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Free Pass Banner Strip */}
        <div className="mt-16 p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl bg-neutral-800 border border-neutral-700 shrink-0 ${theme.accentText}`}
            >
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-black uppercase text-white">
                Not sure which package or spa therapy is right for you?
              </h4>
              <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
                Come in for a complimentary tour, meet our certified trainers, tour our eucalyptus
                steam suites, and claim your free 1-Day All-Access Pass.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setCurrentPage('plans');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition flex items-center gap-1.5"
            >
              <span>View Full Pricing Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="plans-claim-free-pass-btn"
              onClick={() => setIsTrialModalOpen(true)}
              className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap ${theme.accentBg}`}
            >
              Claim 1-Day VIP Pass
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
