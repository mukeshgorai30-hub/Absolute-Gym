import React, { useState, useEffect } from 'react';
import { useGym } from './context/GymContext';
import { themeStyles } from './utils/theme';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GallerySection } from './components/GallerySection';
import { TrainersSection } from './components/TrainersSection';
import { PlansSection } from './components/PlansSection';
import { ClassScheduleSection } from './components/ClassScheduleSection';
import { CafeSection } from './components/CafeSection';
import { BmiCalculatorSection } from './components/BmiCalculatorSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

// Modals & Admin
import { PlanBookingModal } from './components/Modals/PlanBookingModal';
import { TrainerBookingModal } from './components/Modals/TrainerBookingModal';
import { TrialPassModal } from './components/Modals/TrialPassModal';
import { AiCoachModal } from './components/Modals/AiCoachModal';
import { AdminModal } from './components/Admin/AdminModal';
import { AdminAuthPage } from './components/Admin/AdminAuthPage';
import { CustomerReceiptPortalModal } from './components/Modals/CustomerReceiptPortalModal';

// Icons for floating bar
import { Flame, Sparkles } from 'lucide-react';

export const GymAppContent: React.FC = () => {
  const { config, themeColor, isAdminOpen, setIsAdminOpen, setIsTrialModalOpen, setIsAIModalOpen } = useGym();
  const theme = themeStyles[themeColor];

  // Route state: check hash (#admin, #login, ?view=admin) or manual toggle
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    return hash === '#admin' || hash === '#admin-login' || hash === '#cms' || hash === '#login' || params.get('view') === 'admin' || params.get('admin') === 'true';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('apex_admin_authenticated') === 'true';
  });

  // Global Keyboard Shortcut: Ctrl + Shift + A or Cmd + Shift + A to open Admin Login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminRoute(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to custom event from footer or other discreet staff links
  useEffect(() => {
    const handleOpenAdminAuth = () => {
      setIsAdminRoute(true);
    };

    window.addEventListener('open_apex_admin_portal', handleOpenAdminAuth);
    return () => window.removeEventListener('open_apex_admin_portal', handleOpenAdminAuth);
  }, []);

  // Listen to hash changes (e.g. clicking a link to #admin or browser back)
  useEffect(() => {
    const handleHashOrLocationChange = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isTargetingAdmin =
        hash === '#admin' ||
        hash === '#admin-login' ||
        hash === '#cms' ||
        hash === '#login' ||
        params.get('view') === 'admin' ||
        params.get('admin') === 'true';

      if (isTargetingAdmin) {
        setIsAdminRoute(true);
      }

      const isAuthed = sessionStorage.getItem('apex_admin_authenticated') === 'true';
      setIsAdminAuthenticated(isAuthed);

      if (isTargetingAdmin && isAuthed) {
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('hashchange', handleHashOrLocationChange);
    window.addEventListener('popstate', handleHashOrLocationChange);

    // Initial check
    handleHashOrLocationChange();

    return () => {
      window.removeEventListener('hashchange', handleHashOrLocationChange);
      window.removeEventListener('popstate', handleHashOrLocationChange);
    };
  }, [setIsAdminOpen]);

  // Synchronize when admin is opened or closed
  useEffect(() => {
    if (!isAdminOpen && isAdminRoute && isAdminAuthenticated) {
      // User closed the CMS modal from the CMS screen
      window.location.hash = '';
      setIsAdminRoute(false);
    }
  }, [isAdminOpen, isAdminRoute, isAdminAuthenticated]);

  // If user navigates to the dedicated Admin URL / link
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <AdminAuthPage
          onBackToWebsite={() => {
            window.location.hash = '';
            setIsAdminRoute(false);
          }}
          onAuthenticated={() => {
            setIsAdminAuthenticated(true);
            setIsAdminOpen(true);
          }}
        />
      );
    }

    // Authenticated admin view
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <AdminModal />
      </div>
    );
  }

  // Public Member Website (Clean, zero public admin buttons/clutter)
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-950 text-neutral-100 selection:bg-amber-400 selection:text-black font-sans antialiased">
      {/* Main Navigation Bar */}
      <Navbar />

      {/* Hero Header */}
      <Hero />

      {/* 1st: Inside Absolute Gym (Facility Photography Gallery) */}
      <GallerySection />

      {/* 2nd: Meet Our Performance Coaches (Certified Trainers Roster) */}
      <TrainersSection />

      {/* 3rd: Choose Your Membership Package (Subscription Plans & Pricing) */}
      <PlansSection />

      {/* 4th: Class Timings & Studio Schedule (Yoga, Zumba, HIIT & More) */}
      <ClassScheduleSection />

      {/* 5th: Performance Fuel & Clean Nutrition (Fuel Bar & Gym Cafe) */}
      <CafeSection />

      {/* Interactive BMI & Nutrition Calculator */}
      <BmiCalculatorSection />

      {/* Verified Member Testimonials */}
      <TestimonialsSection />

      {/* Facility Details, Hours & Pass Capture */}
      <ContactSection />

      {/* FAQ */}
      <FaqSection />

      {/* Footer */}
      <Footer />

      {/* Floating Action Button for Customer Features (AI Coach & VIP Pass) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
        <button
          id="floating-ai-coach-btn"
          onClick={() => setIsAIModalOpen(true)}
          className="pointer-events-auto p-3.5 rounded-full bg-neutral-900 border border-neutral-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group touch-manipulation"
          title="Ask AI Fitness Coach"
        >
          <Sparkles className={`w-5 h-5 ${theme.accentText}`} />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider pr-1">
            AI Coach
          </span>
        </button>

        <button
          id="floating-free-pass-btn"
          onClick={() => setIsTrialModalOpen(true)}
          className={`pointer-events-auto p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${theme.accentBg} touch-manipulation`}
          title="Claim Free 1-Day Pass"
        >
          <Flame className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider pr-1">
            Free 1-Day Pass
          </span>
        </button>
      </div>

      {/* Interactive Modals */}
      <PlanBookingModal />
      <TrainerBookingModal />
      <TrialPassModal />
      <AiCoachModal />
      {isAdminOpen && <AdminModal />}
      <CustomerReceiptPortalModal />
    </div>
  );
};
