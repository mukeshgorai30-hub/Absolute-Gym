import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { GymLogo } from './GymLogo';
import { AppPage } from '../types/navigation';
import {
  Clock,
  Phone,
  MapPin,
  Sparkles,
  ShieldAlert,
  Menu,
  X,
  Flame,
  ChevronRight,
  UserCheck,
  Home,
  Users,
  CreditCard,
  Calendar,
  Coffee,
  Image,
  Calculator,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    config,
    themeColor,
    currentPage,
    setCurrentPage,
    setIsAdminOpen,
    setIsTrialModalOpen,
    setIsAIModalOpen,
  } = useGym();
  const theme = themeStyles[themeColor];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const navLinks: { name: string; page?: AppPage; anchor?: string; icon?: React.ReactNode }[] = [
    { name: 'Home', page: 'home', icon: <Home className="w-4 h-4" /> },
    { name: 'Inside Gym', page: 'gallery', icon: <Image className="w-4 h-4" /> },
    { name: 'Trainers / Coaches', page: 'coaches', icon: <Users className="w-4 h-4" /> },
    { name: 'Plans & Pricing', page: 'plans', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Class Timings', page: 'timings', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Absolute Gym Cafe', page: 'cafe', icon: <Coffee className="w-4 h-4" /> },
    { name: 'BMI Calculator', page: 'calculator', icon: <Calculator className="w-4 h-4" /> },
  ];

  const handleNavClick = (link: { name: string; page?: AppPage; anchor?: string }) => {
    setMobileMenuOpen(false);
    if (link.page) {
      setCurrentPage(link.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.anchor) {
      if (currentPage !== 'home') {
        setCurrentPage('home');
        setTimeout(() => {
          const el = document.querySelector(link.anchor!);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.querySelector(link.anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 transition-colors">
      {/* Announcement Bar */}
      {config.showAnnouncement && config.announcementText && !announcementDismissed && (
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-800 px-3 sm:px-4 py-2 text-xs md:text-sm font-medium text-neutral-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
              <span className={`inline-flex items-center gap-1 font-bold shrink-0 ${theme.accentText}`}>
                <Flame className="w-3.5 h-3.5" /> ANNOUNCEMENT:
              </span>
              <span className="truncate">{config.announcementText}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                id="announcement-claim-btn"
                onClick={() => setIsTrialModalOpen(true)}
                className={`hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${theme.accentBg} transition`}
              >
                Claim Now
              </button>
              <button
                id="dismiss-announcement-btn"
                onClick={() => setAnnouncementDismissed(true)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div className="min-w-0 shrink">
            <GymLogo
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              size="md"
              className="cursor-pointer select-none"
            />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-1 shrink-0">
            {navLinks.map((link) => {
              const isActive = link.page ? currentPage === link.page : false;
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link)}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    isActive
                      ? `${theme.accentBg} shadow-md`
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <span>{link.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Action CTAs & 3-Line Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* AI Advisor Button (Desktop) */}
            <button
              id="nav-ai-coach-btn"
              onClick={() => setIsAIModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            >
              <Sparkles className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span>AI Advisor</span>
            </button>

            {/* Claim Free Pass CTA */}
            <button
              id="nav-free-pass-btn"
              onClick={() => setIsTrialModalOpen(true)}
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition uppercase touch-manipulation active:scale-95 shadow-md ${theme.accentBg}`}
            >
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">Free Pass</span>
              <span className="inline xs:hidden sm:hidden">Pass</span>
            </button>

            {/* Mobile 3-Line Menu (Hamburger) Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 active:scale-95 transition-all shadow-md touch-manipulation shrink-0 ml-0.5"
              aria-label="Toggle Navigation Menu"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" strokeWidth={2.5} />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-100" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-neutral-950/98 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Top CTAs in Mobile Drawer */}
          <div className="pt-1 pb-1">
            <button
              id="mobile-trial-pass-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsTrialModalOpen(true);
              }}
              className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg touch-manipulation active:scale-[0.98] ${theme.accentBg}`}
            >
              <Flame className="w-4 h-4" />
              <span>Claim Free 1-Day Pass</span>
            </button>
          </div>

          {/* Nav Links */}
          <div className="divide-y divide-neutral-900 rounded-xl bg-neutral-900/50 border border-neutral-800/80 px-3">
            {navLinks.map((link) => {
              const isActive = link.page ? currentPage === link.page : false;
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link)}
                  className={`w-full flex items-center justify-between py-3.5 text-sm font-semibold transition touch-manipulation text-left ${
                    isActive ? `${theme.accentText} font-bold` : 'text-neutral-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {link.icon}
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                </button>
              );
            })}
          </div>

          {/* Contact Details */}
          <div className="pt-2 text-xs text-neutral-400 space-y-2 px-1">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>{config.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{config.address}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

