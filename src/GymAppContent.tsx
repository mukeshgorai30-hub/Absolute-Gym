import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useGym } from './context/GymContext';
import { themeStyles } from './utils/theme';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ExplorePagesCards } from './components/ExplorePagesCards';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

// Icons for floating bar
import { Flame, Sparkles, Loader2, Send } from 'lucide-react';

// Code-split Lazy Loaded Pages for maximum performance
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const CoachesPage = lazy(() => import('./pages/CoachesPage').then(m => ({ default: m.CoachesPage })));
const PlansPricingPage = lazy(() => import('./pages/PlansPricingPage').then(m => ({ default: m.PlansPricingPage })));
const ClassTimingsPage = lazy(() => import('./pages/ClassTimingsPage').then(m => ({ default: m.ClassTimingsPage })));
const CafePage = lazy(() => import('./pages/CafePage').then(m => ({ default: m.CafePage })));
const BmiCalculatorPage = lazy(() => import('./pages/BmiCalculatorPage').then(m => ({ default: m.BmiCalculatorPage })));

// Code-split Lazy Loaded Modals & Admin
const PlanBookingModal = lazy(() => import('./components/Modals/PlanBookingModal').then(m => ({ default: m.PlanBookingModal })));
const TrainerBookingModal = lazy(() => import('./components/Modals/TrainerBookingModal').then(m => ({ default: m.TrainerBookingModal })));
const TrialPassModal = lazy(() => import('./components/Modals/TrialPassModal').then(m => ({ default: m.TrialPassModal })));
const AiCoachModal = lazy(() => import('./components/Modals/AiCoachModal').then(m => ({ default: m.AiCoachModal })));
const AdminModal = lazy(() => import('./components/Admin/AdminModal').then(m => ({ default: m.AdminModal })));
const AdminAuthPage = lazy(() => import('./components/Admin/AdminAuthPage').then(m => ({ default: m.AdminAuthPage })));
const CustomerReceiptPortalModal = lazy(() => import('./components/Modals/CustomerReceiptPortalModal').then(m => ({ default: m.CustomerReceiptPortalModal })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 py-20">
    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    <span className="text-xs uppercase font-bold tracking-widest text-neutral-400">Loading Portal...</span>
  </div>
);

export const GymAppContent: React.FC = () => {
  const {
    config,
    themeColor,
    currentPage,
    setCurrentPage,
    isAdminOpen,
    setIsAdminOpen,
    isTrialModalOpen,
    setIsTrialModalOpen,
    isAIModalOpen,
    setIsAIModalOpen,
    isReceiptPortalOpen,
    selectedPlanForModal,
    selectedTrainerForModal,
  } = useGym();
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
      window.location.hash = '';
      setIsAdminRoute(false);
    }
  }, [isAdminOpen, isAdminRoute, isAdminAuthenticated]);

  // If user navigates to the dedicated Admin URL / link
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
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
        </Suspense>
      );
    }

    // Authenticated admin view
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminModal />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-950 text-neutral-100 selection:bg-amber-400 selection:text-black font-sans antialiased flex flex-col justify-between">
      <div>
        {/* Main Sticky Header */}
        <Navbar />

        {/* Dynamic Page Router */}
        <Suspense fallback={<PageLoadingFallback />}>
          {currentPage === 'gallery' && <GalleryPage />}
          {currentPage === 'coaches' && <CoachesPage />}
          {currentPage === 'plans' && <PlansPricingPage />}
          {currentPage === 'timings' && <ClassTimingsPage />}
          {currentPage === 'cafe' && <CafePage />}
          {currentPage === 'calculator' && <BmiCalculatorPage />}
        </Suspense>

        {/* Default Home Page View */}
        {currentPage === 'home' && (
          <main>
            {/* Hero Header */}
            <Hero />

            {/* Dedicated Page Portals (Inside Facility, Coaches, Plans, Timings, Cafe, BMI) */}
            <ExplorePagesCards />

            {/* Verified Member Testimonials */}
            <TestimonialsSection />

            {/* Facility Details, Hours & Pass Capture */}
            <ContactSection />

            {/* FAQ */}
            <FaqSection />
          </main>
        )}
      </div>

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
          id="floating-inquiry-btn"
          onClick={() => setIsTrialModalOpen(true)}
          className={`pointer-events-auto p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${theme.accentBg} touch-manipulation`}
          title="Submit Inquiry"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider pr-1">
            Inquire Now
          </span>
        </button>
      </div>

      {/* Interactive Modals (Loaded on demand to preserve bandwidth and initial render speed) */}
      <Suspense fallback={null}>
        {selectedPlanForModal && <PlanBookingModal />}
        {selectedTrainerForModal && <TrainerBookingModal />}
        {isTrialModalOpen && <TrialPassModal />}
        {isAIModalOpen && <AiCoachModal />}
        {isAdminOpen && <AdminModal />}
        {isReceiptPortalOpen && <CustomerReceiptPortalModal />}
      </Suspense>
    </div>
  );
};

