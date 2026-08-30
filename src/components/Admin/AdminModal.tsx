import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import {
  ThemeColor,
  SubscriptionPlan,
  Trainer,
  GymClass,
  GymAmenity,
  Testimonial,
  VideoReview,
  GalleryItem,
  MemberLead,
  LogoIconType,
} from '../../types';
import { GymLogo, renderLogoIcon } from '../GymLogo';
import { ReceiptModal, ReceiptData } from '../Modals/ReceiptModal';
import { CafeManagerTab } from './CafeManagerTab';
import { FaqManagerTab } from './FaqManagerTab';
import { SpaManagerTab } from './SpaManagerTab';
import { FirebaseManagerTab } from './FirebaseManagerTab';
import { ImageUploadField } from './ImageUploadField';
import { VideoUploadField } from './VideoUploadField';
import { defaultSpaServices, defaultGymConfig } from '../../data/defaultGymData';
import { signOutSupabaseAuth } from '../../supabase';
import {
  X,
  ShieldAlert,
  BarChart3,
  Building2,
  CreditCard,
  Users,
  Calendar,
  Sparkles,
  Image,
  MessageSquare,
  Inbox,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Check,
  ExternalLink,
  Search,
  Filter,
  Save,
  CheckCircle2,
  Palette,
  Activity,
  Flame,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Dumbbell,
  Clock,
  Trophy,
  Zap,
  Shield,
  Crown,
  HeartPulse,
  Target,
  Droplets,
  Swords,
  Skull,
  FileText,
  Printer,
  Receipt,
  Coffee,
  HelpCircle,
  MapPin,
  Navigation,
  Globe,
  LogOut,
  Copy,
  Music,
  Lock,
  KeyRound,
  User,
  Smartphone,
  ShieldCheck,
  Database,
  Sun,
  Moon,
  Video,
  Play,
} from 'lucide-react';

export const AdminModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    adminTab,
    setAdminTab,
    config,
    updateConfig,
    themeColor,
    setThemeColor,
    leads,
    updateLeadStatus,
    deleteLead,
    clearAllLeads,
    addPlan,
    updatePlan,
    deletePlan,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    addClass,
    updateClass,
    deleteClass,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    addVideoReview,
    updateVideoReview,
    deleteVideoReview,
    resetToDefaults,
    exportConfigJson,
    importConfigJson,
    isCloudSynced,
    cloudSyncStatus,
    syncToCloudNow,
  } = useGym();

  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const theme = themeStyles[themeColor];
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Search & Filter state for leads
  const [leadSearch, setLeadSearch] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState('All');

  // Editing state holders
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);

  const [editingClass, setEditingClass] = useState<GymClass | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [adminClassDayFilter, setAdminClassDayFilter] = useState<string>('All');
  const [adminClassCategoryFilter, setAdminClassCategoryFilter] = useState<string>('All');
  const [adminClassTimeFilter, setAdminClassTimeFilter] = useState<'All' | 'Morning' | 'Evening'>('All');
  const [adminClassSearch, setAdminClassSearch] = useState<string>('');

  const [editingAmenity, setEditingAmenity] = useState<GymAmenity | null>(null);
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);

  const [editingVideoReview, setEditingVideoReview] = useState<VideoReview | null>(null);
  const [isAddingVideoReview, setIsAddingVideoReview] = useState(false);

  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [isAddingGalleryItem, setIsAddingGalleryItem] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState<'Gym Floor' | 'Recovery & Spa' | 'Classes & Studio' | 'Equipment'>('Gym Floor');
  const [newGalleryImage, setNewGalleryImage] = useState('');

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Receipt / Tax Invoice Generator state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptDataForModal, setReceiptDataForModal] = useState<Partial<ReceiptData> | null>(null);

  if (!isAdminOpen) return null;

  const triggerSaveNotification = (msg = 'Changes saved successfully to live website!') => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportConfigJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apex_gym_config_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportLeadsCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Name', 'Email', 'Phone', 'Plan/Trainer', 'Message', 'Status'];
    const rows = leads.map((l) => [
      l.id,
      l.createdAt ? new Date(l.createdAt).toLocaleString() : '',
      l.type,
      `"${l.name}"`,
      l.email,
      `"${l.phone || ''}"`,
      `"${l.planName || l.trainerName || ''}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gym_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div
      id="admin-cms-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col justify-start"
    >
      {/* Top Navbar */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
                Gym Admin CMS
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                Live Sync
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Customize subscription plans, trainer profiles, timetable, facilities, and member leads.
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Color Selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
            <span className="text-[10px] font-bold uppercase text-neutral-500">Theme:</span>
            {(['amber', 'orange', 'crimson', 'emerald', 'cyan', 'violet', 'gold'] as ThemeColor[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setThemeColor(c);
                  triggerSaveNotification(`Accent theme updated to ${themeStyles[c].name}`);
                }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  themeColor === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: themeStyles[c].primaryHex }}
                title={`Switch to ${themeStyles[c].name}`}
              />
            ))}
          </div>

          {/* Cloud Sync Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                cloudSyncStatus === 'saving'
                  ? 'bg-amber-400 animate-ping'
                  : cloudSyncStatus === 'synced'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-neutral-500'
              }`}
            />
            <span className="hidden sm:inline font-bold text-[11px] text-neutral-300">
              {cloudSyncStatus === 'saving' ? 'Syncing...' : cloudSyncStatus === 'synced' ? 'Live Cloud Synced' : 'Offline'}
            </span>
            <button
              onClick={async () => {
                setIsManualSyncing(true);
                const res = await syncToCloudNow();
                setIsManualSyncing(false);
                if (res.success) {
                  triggerSaveNotification(res.message);
                } else {
                  triggerSaveNotification(res.message);
                }
              }}
              disabled={isManualSyncing}
              className="ml-1 p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition"
              title="Force Sync to Cloud (Updates all mobile & web visitors worldwide immediately)"
            >
              <RefreshCw className={`w-3 h-3 ${isManualSyncing || cloudSyncStatus === 'saving' ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition"
            title="Download JSON configuration backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            id="logout-admin-btn"
            onClick={async () => {
              await signOutSupabaseAuth();
              sessionStorage.removeItem('apex_admin_authenticated');
              sessionStorage.removeItem('apex_admin_user_email');
              sessionStorage.removeItem('apex_admin_auth_type');
              setIsAdminOpen(false);
              window.location.hash = '';
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition flex items-center gap-1.5"
            title="Log out of Admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            id="close-admin-cms-btn"
            onClick={() => {
              setIsAdminOpen(false);
              window.location.hash = '';
            }}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>View Website</span>
          </button>
        </div>
      </div>

      {/* Non-intrusive Floating Save Notification Toast (prevents layout shift / jerk) */}
      {saveBanner && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-2xl flex items-center gap-2 pointer-events-none transition-all">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-neutral-950 border-r border-neutral-800 p-3 space-y-1 overflow-y-auto shrink-0 hidden md:block">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-2">
            CMS Navigation
          </div>

          {[
            { id: 'overview', label: 'Dashboard & Overview', icon: <BarChart3 className="w-4 h-4" />, badge: `${leads.length} Leads` },
            { id: 'logo', label: 'Brand Logo & Icon Studio', icon: <Crown className="w-4 h-4 text-amber-400" />, badge: 'Logo' },
            { id: 'visuals', label: 'Themes & Color Studio', icon: <Palette className="w-4 h-4" />, badge: 'Colors' },
            { id: 'backgrounds', label: 'Section Background Images', icon: <Layers className="w-4 h-4 text-cyan-400" />, badge: '11 Sections' },
            { id: 'stats', label: 'Stats & Facility Metrics', icon: <Activity className="w-4 h-4" /> },
            { id: 'general', label: 'General & Identity', icon: <Building2 className="w-4 h-4" /> },
            { id: 'plans', label: 'Subscription Packages', icon: <CreditCard className="w-4 h-4" />, badge: `${config.plans.length} Pkgs` },
            { id: 'spa', label: 'Massage & Steam Spa', icon: <Droplets className="w-4 h-4 text-cyan-400" />, badge: `${(config.spaServices || defaultSpaServices).length} Rows` },
            { id: 'cafe', label: 'Fuel Bar & Cafe Menu', icon: <Coffee className="w-4 h-4 text-amber-400" />, badge: `${config.cafe?.items?.length || 0} Items` },
            { id: 'trainers', label: 'Trainers & Coaches', icon: <Users className="w-4 h-4" />, badge: `${config.trainers.length}` },
            { id: 'classes', label: 'Class Schedule', icon: <Calendar className="w-4 h-4" />, badge: `${config.classes.length}` },
            { id: 'leads', label: 'Leads & Enquiries', icon: <Inbox className="w-4 h-4" />, badge: `${leads.filter((l) => l.status === 'new').length} New`, badgeColor: 'bg-red-500 text-white' },
            { id: 'faqs', label: 'Frequently Asked Questions', icon: <HelpCircle className="w-4 h-4 text-emerald-400" />, badge: `${config.faqs?.length || 0} FAQs` },
            { id: 'testimonials', label: 'Reviews & Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'videoReviews', label: 'Video Reviews & Stories', icon: <Video className="w-4 h-4 text-amber-400" />, badge: `${config.videoReviews?.length || 0} Videos` },
            { id: 'gallery', label: 'Photo Gallery & Showcase', icon: <Image className="w-4 h-4 text-amber-400" />, badge: `${config.gallery?.length || 0} Photos` },
            { id: 'firebase', label: 'Firebase Cloud Backend', icon: <Database className="w-4 h-4 text-amber-400" />, badge: cloudSyncStatus === 'synced' ? 'Live' : 'Connected', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
            { id: 'backup', label: 'Data & Factory Reset', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                adminTab === tab.id
                  ? `${theme.accentBg} shadow-md`
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    adminTab === tab.id
                      ? 'bg-black/30 text-black'
                      : tab.badgeColor || 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="md:hidden bg-neutral-950 border-b border-neutral-800 p-2 flex overflow-x-auto gap-1 shrink-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'firebase', label: '☁️ Firebase Cloud' },
            { id: 'logo', label: 'Brand Logo' },
            { id: 'visuals', label: 'Themes & Colors' },
            { id: 'backgrounds', label: 'Background Images' },
            { id: 'stats', label: 'Stats & Facility' },
            { id: 'general', label: 'Identity' },
            { id: 'plans', label: 'Plans' },
            { id: 'cafe', label: 'Cafe Menu' },
            { id: 'trainers', label: 'Trainers' },
            { id: 'classes', label: 'Schedule' },
            { id: 'leads', label: 'Leads' },
            { id: 'faqs', label: 'FAQs' },
            { id: 'testimonials', label: 'Reviews' },
            { id: 'videoReviews', label: 'Video Reviews' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'backup', label: 'Backup' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                adminTab === tab.id ? theme.accentBg : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-neutral-900/50 p-4 sm:p-8 overflow-y-auto text-white">
          {/* TAB 1: OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Gym Performance & CMS Overview
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Manage your gym details, active subscriptions, trainer roster, and incoming member leads.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
                    <span>Total Inquiries</span>
                    <Inbox className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2 font-mono">{leads.length}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {leads.filter((l) => l.status === 'new').length} New Uncontacted
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
                    <span>Subscription Plans</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2 font-mono">
                    {config.plans.length} Tiers
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Lowest: ${Math.min(...config.plans.map((p) => p.priceMonthly))}/mo
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
                    <span>Certified Trainers</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2 font-mono">
                    {config.trainers.length} Coaches
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">All Available for Booking</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
                    <span>Weekly Classes</span>
                    <Calendar className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-white mt-2 font-mono">
                    {config.classes.length} Sessions
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Mon - Sun Timetable</div>
                </div>
              </div>

              {/* Recent Leads Preview */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-black uppercase text-white">Recent Member Inquiries</h4>
                    <p className="text-xs text-neutral-400">Latest leads captured from website forms</p>
                  </div>
                  <button
                    onClick={() => setAdminTab('leads')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${theme.accentBg}`}
                  >
                    View All Leads ({leads.length})
                  </button>
                </div>

                <div className="divide-y divide-neutral-800">
                  {leads.slice(0, 4).map((lead) => (
                    <div key={lead.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-extrabold text-white">{lead.name}</div>
                        <div className="text-neutral-400">{lead.email} • {lead.phone}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          lead.status === 'new' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          lead.status === 'contacted' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {lead.status}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Facility Numbers Banner */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-400" />
                      <span>Live Website Key Metrics & Stats</span>
                    </h4>
                    <p className="text-xs text-neutral-400">Counters displayed in the Hero banner and trust highlights</p>
                  </div>
                  <button
                    onClick={() => setAdminTab('stats')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${theme.accentBg}`}
                  >
                    Edit All Numbers & Labels
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-center">
                    <div className="text-xl font-black text-amber-400 font-mono">{config.stats.sqFt}</div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400 mt-0.5">{config.stats.sqFtLabel || 'Training Facility'}</div>
                  </div>
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-center">
                    <div className="text-xl font-black text-emerald-400 font-mono">{config.stats.members}</div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400 mt-0.5">{config.stats.membersLabel || 'Active Lifters'}</div>
                  </div>
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-center">
                    <div className="text-xl font-black text-cyan-400 font-mono">{config.stats.trainersCount}</div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400 mt-0.5">{config.stats.trainersCountLabel || 'Certified Coaches'}</div>
                  </div>
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-center">
                    <div className="text-xl font-black text-purple-400 font-mono">{config.stats.satisfaction}</div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400 mt-0.5">{config.stats.satisfactionLabel || '5-Star Satisfaction'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BRAND LOGO & ICON STUDIO */}
          {adminTab === 'logo' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <span>Brand Logo & Icon Studio</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Upload your custom image logo, choose from 12 fitness icons, configure custom colors, shapes, and preview in real-time.
                  </p>
                </div>
                <button
                  onClick={() => triggerSaveNotification('Brand logo configuration saved!')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Logo</span>
                </button>
              </div>

              {/* Real-time Header & Footer Preview Simulator */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Live Navbar & Branding Simulation:</span>
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                    Live Sync Active
                  </span>
                </div>

                <div className="p-4 sm:p-6 bg-neutral-900/90 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <GymLogo size="lg" />
                    <div>
                      <div className="text-lg font-black tracking-wider uppercase text-white leading-none">
                        {config.name}
                      </div>
                      <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mt-1">
                        {config.tagline}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-neutral-800 text-[11px] font-bold text-neutral-300">
                      Plans
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-neutral-800 text-[11px] font-bold text-neutral-300">
                      Coaches
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase ${theme.accentBg}`}>
                      Join VIP Pass
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Logo Type Selector */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                    <span>1. Select Logo Type</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Choose whether to display an icon or an external high-res image logo (PNG/SVG/WebP).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({
                        logo: {
                          ...(config.logo || { icon: 'dumbbell', shape: 'rounded', size: 'md' }),
                          type: 'icon',
                        },
                      });
                      triggerSaveNotification('Switched to Gym Vector Icon Logo');
                    }}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
                      config.logo?.type !== 'image'
                        ? 'bg-neutral-950 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase text-white flex items-center gap-2">
                        <span>Preset Gym Vector Icon</span>
                        {config.logo?.type !== 'image' && (
                          <Check className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        High-contrast dynamic vector emblem (Dumbbell, Flame, Shield, Crown, Zap, etc.) that syncs with your brand colors.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({
                        logo: {
                          ...(config.logo || { icon: 'dumbbell', shape: 'rounded', size: 'md' }),
                          type: 'image',
                          imageUrl: config.logo?.imageUrl || '',
                        },
                      });
                      triggerSaveNotification('Switched to Custom Image Logo');
                    }}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
                      config.logo?.type === 'image'
                        ? 'bg-neutral-950 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400 shrink-0">
                      <Image className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase text-white flex items-center gap-2">
                        <span>Custom Image / SVG Logo</span>
                        {config.logo?.type === 'image' && (
                          <Check className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        Link your official brand logo file (PNG, SVG, or high-res transparent mark).
                      </p>
                    </div>
                  </button>
                </div>

                {/* IMAGE LOGO SETTINGS (When type === 'image') */}
                {config.logo?.type === 'image' && (
                  <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                    <ImageUploadField
                      label="Gym Brand Logo Photo / Emblem"
                      value={config.logo.imageUrl}
                      onChange={(val) =>
                        updateConfig({
                          logo: {
                            ...config.logo,
                            imageUrl: val,
                          },
                        })
                      }
                      aspectRatio="square"
                      helperText="Upload your official transparent PNG, SVG, or high-res JPG gym brand mark from your local device."
                    />

                    {/* Sample Gym Logo Presets */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-black uppercase text-neutral-400">
                        Or select sample gym logo preset:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          {
                            name: 'Gold Lion Crest',
                            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
                          },
                          {
                            name: 'Titan Iron Monogram',
                            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
                          },
                          {
                            name: 'Neon Cyber Badge',
                            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
                          },
                        ].map((sample) => (
                          <button
                            key={sample.name}
                            type="button"
                            onClick={() => {
                              updateConfig({
                                logo: {
                                  ...config.logo,
                                  imageUrl: sample.url,
                                },
                              });
                            }}
                            className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 text-left truncate"
                          >
                            {sample.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ICON LOGO SELECTOR (When type === 'icon') */}
                {config.logo?.type !== 'image' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Choose Your Gym Vector Icon (12 High-Impact Emblems):
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {[
                        { id: 'Dumbbell', label: 'Dumbbell', icon: <Dumbbell className="w-5 h-5" /> },
                        { id: 'Flame', label: 'Flame', icon: <Flame className="w-5 h-5" /> },
                        { id: 'Trophy', label: 'Trophy', icon: <Trophy className="w-5 h-5" /> },
                        { id: 'Zap', label: 'Lightning', icon: <Zap className="w-5 h-5" /> },
                        { id: 'Shield', label: 'Shield', icon: <Shield className="w-5 h-5" /> },
                        { id: 'Crown', label: 'Crown', icon: <Crown className="w-5 h-5" /> },
                        { id: 'Sparkles', label: 'Sparkles', icon: <Sparkles className="w-5 h-5" /> },
                        { id: 'HeartPulse', label: 'Heart Pulse', icon: <HeartPulse className="w-5 h-5" /> },
                        { id: 'Activity', label: 'Activity', icon: <Activity className="w-5 h-5" /> },
                        { id: 'Target', label: 'Target', icon: <Target className="w-5 h-5" /> },
                        { id: 'Swords', label: 'Swords', icon: <Swords className="w-5 h-5" /> },
                        { id: 'Skull', label: 'Skull Iron', icon: <Skull className="w-5 h-5" /> },
                      ].map((item) => {
                        const currentIcon = config.logo?.iconName || config.logo?.icon || 'Dumbbell';
                        const isSelected = currentIcon.toLowerCase() === item.id.toLowerCase();
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              updateConfig({
                                logo: {
                                  ...(config.logo || { shape: 'rounded', size: 'md' }),
                                  type: 'icon',
                                  iconName: item.id as LogoIconType,
                                  icon: item.id as LogoIconType,
                                },
                              });
                              triggerSaveNotification(`Logo icon set to ${item.label}`);
                            }}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${
                              isSelected
                                ? 'bg-amber-400/10 border-amber-400 text-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                            }`}
                          >
                            <div className={isSelected ? 'text-amber-400' : 'text-neutral-300'}>
                              {item.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-center">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Logo Shape & Box Styling */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-400" />
                    <span>2. Logo Container Shape & Box Styling</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Customize the shape, background color, and sizing of the logo badge.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'rounded', label: 'Rounded Rect', desc: 'Sleek rounded box' },
                    { id: 'square', label: 'Sharp Square', desc: 'Industrial brutalist box' },
                    { id: 'circle', label: 'Circle Emblem', desc: 'Badge round emblem' },
                    { id: 'transparent', label: 'Transparent', desc: 'No background container' },
                  ].map((shapeOption) => {
                    const isSelected = (config.logo?.shape || 'rounded') === shapeOption.id;
                    return (
                      <button
                        key={shapeOption.id}
                        type="button"
                        onClick={() => {
                          updateConfig({
                            logo: {
                              ...(config.logo || { icon: 'dumbbell', type: 'icon', size: 'md' }),
                              shape: shapeOption.id as any,
                            },
                          });
                          triggerSaveNotification(`Logo shape updated to ${shapeOption.label}`);
                        }}
                        className={`p-4 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-neutral-950 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-xs font-black uppercase text-white mb-1 flex items-center justify-between">
                          <span>{shapeOption.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-neutral-400">{shapeOption.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Logo Colors (Icon Color & Container BG) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Logo Custom Icon / Accent Color */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Logo Icon Color:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.logo?.customColor || theme.primaryHex}
                        onChange={(e) =>
                          updateConfig({
                            logo: {
                              ...(config.logo || { icon: 'dumbbell', type: 'icon', shape: 'rounded', size: 'md' }),
                              customColor: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-neutral-700"
                      />
                      <input
                        type="text"
                        value={config.logo?.customColor || ''}
                        onChange={(e) =>
                          updateConfig({
                            logo: {
                              ...(config.logo || { icon: 'dumbbell', type: 'icon', shape: 'rounded', size: 'md' }),
                              customColor: e.target.value,
                            },
                          })
                        }
                        placeholder={`Theme Default (${theme.primaryHex})`}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                      {config.logo?.customColor && (
                        <button
                          type="button"
                          onClick={() => {
                            updateConfig({
                              logo: {
                                ...config.logo,
                                customColor: undefined,
                              },
                            });
                          }}
                          className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-[10px] font-bold text-neutral-400"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logo Container Background Color */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Logo Container Background:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.logo?.customBgColor || '#171717'}
                        onChange={(e) =>
                          updateConfig({
                            logo: {
                              ...(config.logo || { icon: 'dumbbell', type: 'icon', shape: 'rounded', size: 'md' }),
                              customBgColor: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-neutral-700"
                      />
                      <input
                        type="text"
                        value={config.logo?.customBgColor || ''}
                        onChange={(e) =>
                          updateConfig({
                            logo: {
                              ...(config.logo || { icon: 'dumbbell', type: 'icon', shape: 'rounded', size: 'md' }),
                              customBgColor: e.target.value,
                            },
                          })
                        }
                        placeholder="Default Neutral (#171717)"
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                      {config.logo?.customBgColor && (
                        <button
                          type="button"
                          onClick={() => {
                            updateConfig({
                              logo: {
                                ...config.logo,
                                customBgColor: undefined,
                              },
                            });
                          }}
                          className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-[10px] font-bold text-neutral-400"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: THEMES & COLOR STUDIO */}
          {adminTab === 'visuals' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <Palette className="w-6 h-6 text-amber-400" />
                    <span>Themes & Color Scheme Studio</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Choose from curated high-impact gym theme palettes or configure any custom primary hex color.
                  </p>
                </div>
                <button
                  onClick={() => triggerSaveNotification('Theme & color scheme updated!')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Color Scheme</span>
                </button>
              </div>

              {/* 1. Theme Color Palette Presets */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>Curated Gym Color Themes</span>
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Currently Active: <span className="font-bold text-white uppercase">{themeStyles[themeColor].name}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(['amber', 'orange', 'crimson', 'emerald', 'cyan', 'violet', 'gold'] as ThemeColor[]).map((c) => {
                    const t = themeStyles[c];
                    const isSelected = themeColor === c;
                    return (
                      <div
                        key={c}
                        onClick={() => {
                          setThemeColor(c);
                          triggerSaveNotification(`Website theme switched to ${t.name}`);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-neutral-950 border-white ring-2 ring-white/50 shadow-xl scale-[1.02]'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-6 h-6 rounded-full shadow-inner border border-white/20"
                              style={{ backgroundColor: t.primaryHex }}
                            />
                            <span className="text-xs font-black uppercase text-white">{t.name}</span>
                          </div>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-black uppercase">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Visual sample button */}
                        <div className={`py-1.5 px-3 rounded-lg text-center text-[10px] font-black uppercase tracking-wider ${t.accentBg}`}>
                          Preview Accent
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Primary Color Override */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div>
                  <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-400" />
                    <span>Custom Brand Primary Color Override (Hex Code)</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Optionally set your exact corporate brand hex color to match your gym's real signage or merch.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="color"
                      value={config.customPrimaryColor || theme.primaryHex}
                      onChange={(e) => updateConfig({ customPrimaryColor: e.target.value })}
                      className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border border-neutral-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-300">Custom Accent Color</div>
                      <div className="text-[11px] font-mono text-neutral-400 uppercase">{config.customPrimaryColor || theme.primaryHex}</div>
                    </div>
                  </div>

                  <div className="flex-1 w-full flex items-center gap-2">
                    <input
                      type="text"
                      value={config.customPrimaryColor || ''}
                      onChange={(e) => updateConfig({ customPrimaryColor: e.target.value })}
                      placeholder={`e.g. #FF3366 or ${theme.primaryHex}`}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                    />
                    {config.customPrimaryColor && (
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig({ customPrimaryColor: undefined });
                          triggerSaveNotification('Reset to theme preset primary color');
                        }}
                        className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-400 hover:text-white font-bold"
                      >
                        Reset to Preset
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Swatches */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-black uppercase text-neutral-400">
                    Quick Brand Swatches:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Neon Flame', hex: '#ff5500' },
                      { name: 'Cyber Lime', hex: '#10b981' },
                      { name: 'Laser Cyan', hex: '#00e5ff' },
                      { name: 'Electric Purple', hex: '#9d00ff' },
                      { name: 'Viper Yellow', hex: '#ffd000' },
                      { name: 'Hot Crimson', hex: '#ff003c' },
                      { name: 'Pure White', hex: '#ffffff' },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => {
                          updateConfig({ customPrimaryColor: swatch.hex });
                          triggerSaveNotification(`Color set to ${swatch.name} (${swatch.hex})`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-600 flex items-center gap-2 text-xs font-bold text-neutral-300"
                      >
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                        <span>{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Hero CTA Buttons Customizer */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                  <span>Hero Action Button Labels</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Primary VIP Button Text:
                    </label>
                    <input
                      type="text"
                      value={config.heroCtaText || 'Claim Free 1-Day VIP Pass'}
                      onChange={(e) => updateConfig({ heroCtaText: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Secondary Plans Button Text:
                    </label>
                    <input
                      type="text"
                      value={config.heroSecondaryCtaText || 'Explore Plans & Pricing'}
                      onChange={(e) => updateConfig({ heroSecondaryCtaText: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECTION BACKGROUND IMAGES IN EVERY PAGE */}
          {adminTab === 'backgrounds' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <Layers className="w-6 h-6 text-cyan-400" />
                    <span>Every Page / Section Background Images Studio</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Edit atmospheric background images and curated presets for every single page and section of your gym website.
                  </p>
                </div>
                <button
                  onClick={() => triggerSaveNotification('All section backgrounds updated & synchronized!')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Backdrops</span>
                </button>
              </div>

              {/* Grid of All 11 Sections */}
              <div className="grid grid-cols-1 gap-8">
                {[
                  {
                    id: 'heroBgImage',
                    title: '1. Hero Main Stage',
                    desc: 'Atmospheric backdrop for the main viewport hero headline and call-to-action.',
                    currentValue: config.heroBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80',
                    color: 'text-amber-400',
                    presets: [
                      { title: 'Dark Dungeon', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80' },
                      { title: 'Athletic Arena', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=2000&q=80' },
                      { title: 'Barbell Box', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=2000&q=80' },
                      { title: 'Power Iron', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=2000&q=80' },
                      { title: 'Luxury Spa', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=2000&q=80' },
                      { title: 'Neon Spin', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=2000&q=80' },
                    ],
                  },
                  {
                    id: 'plansBgImage',
                    title: '2. Membership Plans & Pricing',
                    desc: 'Subtle high-contrast backdrop behind the membership tiers & plan cards.',
                    currentValue: config.plansBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-emerald-400',
                    presets: [
                      { title: 'Iron Weight Deck', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'VIP Dumbbell Rack', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Plate Loaded Bay', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Luxury Wellness', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'trainersBgImage',
                    title: '3. Certified Trainers & Coaches',
                    desc: 'Dynamic fitness backdrop for the coach profiles and trainer roster.',
                    currentValue: config.trainersBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-cyan-400',
                    presets: [
                      { title: 'Coaching Arena', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Olympic Barbell', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Sprint Track', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Functional Rig', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'scheduleBgImage',
                    title: '4. Class Timetable & Schedule',
                    desc: 'Backdrop for the weekly interactive class schedule and booking timetable.',
                    currentValue: config.scheduleBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-purple-400',
                    presets: [
                      { title: 'Neon Spin Studio', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Yoga & Zen Studio', url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Combat Bag Ring', url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'HIIT Conditioning', url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'amenitiesBgImage',
                    title: '5. World-Class Amenities & Facilities',
                    desc: 'Atmospheric backdrop showcasing luxury amenities, recovery spas, and cardio bays.',
                    currentValue: config.amenitiesBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-amber-400',
                    presets: [
                      { title: 'Hydro Recovery Spa', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Iron Sanctuary', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Fuel Bar Lounge', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Cold Plunge Pool', url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'VIP Lockers', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'advisorBgImage',
                    title: '6. AI Fitness Coach & Workout Advisor',
                    desc: 'Background for the smart AI training plan generator section.',
                    currentValue: config.advisorBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80',
                    color: 'text-cyan-400',
                    presets: [
                      { title: 'Cyber Iron Lab', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80' },
                      { title: 'High-Tech Weights', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80' },
                      { title: 'Olympic Stage', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1600&q=80' },
                    ],
                  },
                  {
                    id: 'bmiBgImage',
                    title: '7. BMI & Calorie Scanner',
                    desc: 'Background for the interactive body mass & caloric assessment widget.',
                    currentValue: config.bmiBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80',
                    color: 'text-emerald-400',
                    presets: [
                      { title: 'Fitness Metrics Lab', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80' },
                      { title: 'Athletic Conditioning', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1600&q=80' },
                      { title: 'Treadmill Sprints', url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1600&q=80' },
                    ],
                  },
                  {
                    id: 'galleryBgImage',
                    title: '8. Facility Photo Gallery',
                    desc: 'Atmospheric backdrop behind the HD gym photos and facility tour grid.',
                    currentValue: config.galleryBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-purple-400',
                    presets: [
                      { title: 'Arena Atmosphere', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Iron Hall', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Power Cages', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'testimonialsBgImage',
                    title: '9. Member Reviews & Testimonials',
                    desc: 'Backdrop for member success testimonials, 5-star ratings, and reviews.',
                    currentValue: config.testimonialsBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-amber-400',
                    presets: [
                      { title: 'Victory Podium', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Community Grit', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Transformation Arena', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'videoReviewsBgImage',
                    title: '10. Video Reviews & Transformation Stories',
                    desc: 'Atmospheric backdrop behind the member video reviews and story player carousel.',
                    currentValue: config.videoReviewsBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-red-400',
                    presets: [
                      { title: 'Cinematic Gym', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Strength Stage', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Studio Energy', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'contactBgImage',
                    title: '11. Facility Location & Contact Section',
                    desc: 'Backdrop for the contact form, VIP pass claim, hours, and interactive map.',
                    currentValue: config.contactBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-emerald-400',
                    presets: [
                      { title: 'Night Iron Gate', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Main Street Gym', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Cardio Deck Entrance', url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                  {
                    id: 'faqBgImage',
                    title: '11. Frequently Asked Questions (FAQ)',
                    desc: 'Atmospheric backdrop for the interactive accordion FAQ answers.',
                    currentValue: config.faqBgImage,
                    defaultValue: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80',
                    color: 'text-cyan-400',
                    presets: [
                      { title: 'Concierge Desk', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Modern Clean Hall', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1800&q=80' },
                      { title: 'Executive Lobby', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1800&q=80' },
                    ],
                  },
                ].map((section) => (
                  <div
                    key={section.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                          <Image className={`w-5 h-5 ${section.color}`} />
                          <span>{section.title}</span>
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{section.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateConfig({ [section.id]: section.defaultValue });
                            triggerSaveNotification(`${section.title} backdrop reset to default!`);
                          }}
                          className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300 font-bold"
                        >
                          Reset Default
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateConfig({ [section.id]: '' });
                            triggerSaveNotification(`${section.title} backdrop cleared.`);
                          }}
                          className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-400 hover:text-white font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Image Upload Field */}
                    <ImageUploadField
                      label={`${section.title} Backdrop Photo`}
                      value={section.currentValue}
                      onChange={(val) => {
                        updateConfig({ [section.id]: val });
                        triggerSaveNotification(`${section.title} backdrop updated!`);
                      }}
                      presets={section.presets}
                      aspectRatio="video"
                      helperText="Upload an image from your computer/device or choose from high-definition presets below."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STATS & FACILITY METRICS */}
          {adminTab === 'stats' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-amber-400" />
                    <span>Gym Numbers & Facility Metrics</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Edit the numbers and text labels displayed across the hero stats strip, facility badges, and trust counters.
                  </p>
                </div>
                <button
                  onClick={() => triggerSaveNotification('Gym stats & counters saved!')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Metrics</span>
                </button>
              </div>

              {/* Live Preview Bar */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    Live Hero Banner Preview
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({
                        stats: {
                          ...config.stats,
                          trainersCount: `${config.trainers.length}+`,
                        },
                      });
                      triggerSaveNotification(`Synced coaches count to ${config.trainers.length}+!`);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync with Trainer Roster ({config.trainers.length} active)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-center p-2 border-r border-neutral-800/60 last:border-r-0">
                    <div className={`text-2xl sm:text-3xl font-black ${theme.accentText}`}>
                      {config.stats.sqFt}
                    </div>
                    <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
                      {config.stats.sqFtLabel || 'Training Facility'}
                    </div>
                  </div>
                  <div className="text-center p-2 border-r border-neutral-800/60 md:border-r last:border-r-0">
                    <div className={`text-2xl sm:text-3xl font-black ${theme.accentText}`}>
                      {config.stats.members}
                    </div>
                    <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
                      {config.stats.membersLabel || 'Active Lifters'}
                    </div>
                  </div>
                  <div className="text-center p-2 border-r border-neutral-800/60 last:border-r-0">
                    <div className={`text-2xl sm:text-3xl font-black ${theme.accentText}`}>
                      {config.stats.trainersCount}
                    </div>
                    <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
                      {config.stats.trainersCountLabel || 'Certified Coaches'}
                    </div>
                  </div>
                  <div className="text-center p-2">
                    <div className={`text-2xl sm:text-3xl font-black ${theme.accentText}`}>
                      {config.stats.satisfaction}
                    </div>
                    <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
                      {config.stats.satisfactionLabel || '5-Star Satisfaction'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Metric 1: Training Facility / Sq Ft */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-400">
                        1. Facility Size / Location Count
                      </span>
                      <Building2 className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Value:
                      </label>
                      <input
                        type="text"
                        value={config.stats.sqFt}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, sqFt: e.target.value },
                          })
                        }
                        placeholder="e.g. 25,000+ or 3 Facilities"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Label:
                      </label>
                      <input
                        type="text"
                        value={config.stats.sqFtLabel || ''}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, sqFtLabel: e.target.value },
                          })
                        }
                        placeholder="Training Facility (Sq.Ft)"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Metric 2: Active Members / Lifters */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-400">
                        2. Active Members / Community
                      </span>
                      <Users className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Value:
                      </label>
                      <input
                        type="text"
                        value={config.stats.members}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, members: e.target.value },
                          })
                        }
                        placeholder="e.g. 4,500+"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Label:
                      </label>
                      <input
                        type="text"
                        value={config.stats.membersLabel || ''}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, membersLabel: e.target.value },
                          })
                        }
                        placeholder="Active Lifters"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Metric 3: Certified Coaches */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-cyan-400">
                        3. Certified Trainers & Coaches
                      </span>
                      <Dumbbell className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Value:
                      </label>
                      <input
                        type="text"
                        value={config.stats.trainersCount}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, trainersCount: e.target.value },
                          })
                        }
                        placeholder="e.g. 28+"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Label:
                      </label>
                      <input
                        type="text"
                        value={config.stats.trainersCountLabel || ''}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, trainersCountLabel: e.target.value },
                          })
                        }
                        placeholder="Certified Coaches"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Metric 4: Satisfaction Rate */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-purple-400">
                        4. Client Rating & Satisfaction
                      </span>
                      <Trophy className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Value:
                      </label>
                      <input
                        type="text"
                        value={config.stats.satisfaction}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, satisfaction: e.target.value },
                          })
                        }
                        placeholder="e.g. 99.4% or 4.9/5"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Display Label:
                      </label>
                      <input
                        type="text"
                        value={config.stats.satisfactionLabel || ''}
                        onChange={(e) =>
                          updateConfig({
                            stats: { ...config.stats, satisfactionLabel: e.target.value },
                          })
                        }
                        placeholder="5-Star Satisfaction"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {adminTab === 'general' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white">
                    General Gym Information
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Update gym brand name, contact info, hero texts, and operating schedule.
                  </p>
                </div>
                <button
                  onClick={() => triggerSaveNotification('General gym settings updated!')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Gym Facility Name:
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => updateConfig({ name: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Tagline / Motto:
                    </label>
                    <input
                      type="text"
                      value={config.tagline}
                      onChange={(e) => updateConfig({ tagline: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    About / Mission Description:
                  </label>
                  <textarea
                    rows={3}
                    value={config.description}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Contacts, Instagram & GSTIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4 border-t border-neutral-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Phone Number:
                    </label>
                    <input
                      type="text"
                      value={config.phone}
                      onChange={(e) => updateConfig({ phone: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Email Address:
                    </label>
                    <input
                      type="text"
                      value={config.email}
                      onChange={(e) => updateConfig({ email: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      WhatsApp Phone:
                    </label>
                    <input
                      type="text"
                      value={config.whatsapp}
                      onChange={(e) => updateConfig({ whatsapp: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Instagram URL / Handle:
                    </label>
                    <input
                      type="text"
                      value={config.instagram || ''}
                      placeholder="https://www.instagram.com/absolute_gym_jsr/"
                      onChange={(e) => updateConfig({ instagram: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-pink-400 focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      GSTIN / Tax ID:
                    </label>
                    <input
                      type="text"
                      value={config.gstin || ''}
                      placeholder="e.g. 20AABCA1234F1Z8"
                      onChange={(e) => updateConfig({ gstin: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Physical Address:
                  </label>
                  <input
                    type="text"
                    value={config.address}
                    onChange={(e) => {
                      const newAddress = e.target.value;
                      const isDefaultMap = !config.googleMapsEmbedUrl || config.googleMapsEmbedUrl.includes('New+York+Fitness+Club');
                      if (isDefaultMap && newAddress.trim()) {
                        updateConfig({
                          address: newAddress,
                          googleMapsEmbedUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newAddress)}`,
                        });
                      } else {
                        updateConfig({ address: newAddress });
                      }
                    }}
                    placeholder="e.g. 124 Grand Olympic Blvd, Metro District, NY 10001"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Google Maps Link Customization */}
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <label className="text-xs font-bold uppercase tracking-wider text-white">
                        Google Maps Redirection Link:
                      </label>
                    </div>
                    {config.googleMapsEmbedUrl && (
                      <a
                        href={config.googleMapsEmbedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <input
                    type="text"
                    value={config.googleMapsEmbedUrl || ''}
                    onChange={(e) => updateConfig({ googleMapsEmbedUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-neutral-400">
                      Paste your Google Business / place share link, or auto-generate one from your physical address.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!config.address?.trim()) {
                          alert('Please fill in your Physical Address first.');
                          return;
                        }
                        const autoUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address.trim())}`;
                        updateConfig({ googleMapsEmbedUrl: autoUrl });
                        triggerSaveNotification('Auto-generated Google Maps link from address!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Auto-Generate from Address</span>
                    </button>
                  </div>
                </div>

                {/* Hero Texts */}
                <div className="pt-4 border-t border-neutral-800 space-y-4">
                  <h4 className="text-sm font-black uppercase text-amber-400">Hero Section Content</h4>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Hero Badge Text:
                    </label>
                    <input
                      type="text"
                      value={config.heroBadge}
                      onChange={(e) => updateConfig({ heroBadge: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Main Headline:
                    </label>
                    <input
                      type="text"
                      value={config.heroHeadline}
                      onChange={(e) => updateConfig({ heroHeadline: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Hero Subtitle / Pitch:
                    </label>
                    <textarea
                      rows={2}
                      value={config.heroSubtitle}
                      onChange={(e) => updateConfig({ heroSubtitle: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Primary Button CTA:
                      </label>
                      <input
                        type="text"
                        value={config.heroCtaText || 'Claim Free 1-Day VIP Pass'}
                        onChange={(e) => updateConfig({ heroCtaText: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Secondary Button CTA:
                      </label>
                      <input
                        type="text"
                        value={config.heroSecondaryCtaText || 'Explore Plans & Pricing'}
                        onChange={(e) => updateConfig({ heroSecondaryCtaText: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div>
                    <ImageUploadField
                      label="Hero Stage Background Image"
                      value={config.heroBgImage}
                      onChange={(val) => updateConfig({ heroBgImage: val })}
                      aspectRatio="video"
                      helperText="Upload a high-energy photo for the primary gym hero background banner."
                    />
                  </div>
                </div>

                {/* Currency & Localization Settings */}
                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <h4 className="text-sm font-black uppercase text-amber-400">Currency & Pricing Localization</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Currency Symbol:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={config.currencySymbol || '₹'}
                          onChange={(e) => updateConfig({ currencySymbol: e.target.value })}
                          className="w-20 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono text-center font-bold"
                        />
                        <div className="flex gap-1 flex-wrap flex-1">
                          {[
                            { sym: '₹', code: 'INR', label: '₹ INR' },
                            { sym: '$', code: 'USD', label: '$ USD' },
                            { sym: '€', code: 'EUR', label: '€ EUR' },
                            { sym: '£', code: 'GBP', label: '£ GBP' },
                          ].map((curr) => (
                            <button
                              key={curr.sym}
                              type="button"
                              onClick={() => updateConfig({ currencySymbol: curr.sym, currencyCode: curr.code })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                (config.currencySymbol || '₹') === curr.sym
                                  ? 'bg-amber-400 text-black border-amber-400'
                                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              {curr.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Currency Code:
                      </label>
                      <input
                        type="text"
                        value={config.currencyCode || 'INR'}
                        onChange={(e) => updateConfig({ currencyCode: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        placeholder="INR, USD, EUR..."
                      />
                    </div>
                  </div>
                </div>

                {/* Announcement Bar */}
                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase text-amber-400">Announcement Top Bar</h4>
                    <label className="flex items-center gap-2 text-xs text-neutral-300 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showAnnouncement}
                        onChange={(e) => updateConfig({ showAnnouncement: e.target.checked })}
                        className="w-4 h-4 rounded accent-amber-400"
                      />
                      <span>Show Top Announcement Bar</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.announcementText}
                    onChange={(e) => updateConfig({ announcementText: e.target.value })}
                    placeholder="e.g. Flash 20% off promotion or free trial announcement..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Operating Hours */}
                <div className="pt-4 border-t border-neutral-800 space-y-4">
                  <h4 className="text-sm font-black uppercase text-amber-400">Operating Hours</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Monday – Friday:
                      </label>
                      <input
                        type="text"
                        value={config.operatingHours.monFri}
                        onChange={(e) =>
                          updateConfig({
                            operatingHours: { ...config.operatingHours, monFri: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Saturday:
                      </label>
                      <input
                        type="text"
                        value={config.operatingHours.saturday}
                        onChange={(e) =>
                          updateConfig({
                            operatingHours: { ...config.operatingHours, saturday: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Sunday:
                      </label>
                      <input
                        type="text"
                        value={config.operatingHours.sunday}
                        onChange={(e) =>
                          updateConfig({
                            operatingHours: { ...config.operatingHours, sunday: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Holidays / VIP Access:
                      </label>
                      <input
                        type="text"
                        value={config.operatingHours.holidays}
                        onChange={(e) =>
                          updateConfig({
                            operatingHours: { ...config.operatingHours, holidays: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Staff Security & Admin Master PIN Settings */}
                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Admin Security & Master Access Credentials</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Master Admin Owner Email:
                      </label>
                      <input
                        type="email"
                        value={config.adminEmail || 'mukeshgorai30@gmail.com'}
                        onChange={(e) => updateConfig({ adminEmail: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white"
                        placeholder="e.g. mukeshgorai30@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Master Admin Security PIN:
                      </label>
                      <input
                        type="text"
                        value={config.adminPin || '1234'}
                        onChange={(e) => updateConfig({ adminPin: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white font-mono"
                        placeholder="e.g. 8492"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Your admin login is protected with Firebase Cloud Authentication, Google Sign-In, brute-force rate-limiting, and owner identity verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTION PLANS CMS */}
          {adminTab === 'plans' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white">
                    Membership Packages & Passes Management
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Add, edit, reprice, or customize duration (Days, Months, Years) and features for all membership packages.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const newId = `plan_${Date.now()}`;
                      setEditingPlan({
                        id: newId,
                        name: 'New Custom Package',
                        duration: '1 Month',
                        tagline: 'Customized membership access package.',
                        priceMonthly: 1999,
                        popular: false,
                        badge: 'NEW',
                        features: ['Full Gym Floor Access', 'Locker & Shower Included', 'Free WiFi & Parking'],
                        notIncluded: ['VIP Recovery Spa'],
                        ctaText: 'Pay at Gym Desk',
                      });
                      setIsAddingPlan(true);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Package</span>
                  </button>
                </div>
              </div>

              {/* Quick Template Selector when adding */}
              {isAddingPlan && !editingPlan?.name.startsWith('1 ') && !editingPlan?.name.startsWith('3 ') && (
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xs font-bold uppercase text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Start Duration Templates:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: '1-Day All-Access Pass', duration: '1 Day', price: 299, tagline: 'Single full-day drop-in pass for gym & turf.' },
                      { name: '3-Days Traveler Pass', duration: '3 Days', price: 699, tagline: '3 consecutive days full fitness floor access.' },
                      { name: '7-Days Sprint Pass', duration: '7 Days', price: 1299, tagline: '1 week unlimited strength & cardio training.' },
                      { name: '15-Days Flex Pass', duration: '15 Days', price: 2199, tagline: 'Half-month intensive workout pass.' },
                      { name: '1-Month Standard', duration: '1 Month', price: 2999, tagline: 'Monthly gym membership with locker access.' },
                      { name: '3-Months Momentum', duration: '3 Months', price: 7499, tagline: 'Quarterly habit builder package.' },
                      { name: '6-Months Transformation', duration: '6 Months', price: 13499, tagline: 'Half-yearly body transformation program.' },
                      { name: '1-Year Annual Elite', duration: '1 Year', price: 22999, tagline: 'Full 365 days VIP access with 4 guest passes.' },
                      { name: '2-Years Championship', duration: '2 Years', price: 39999, tagline: '24 months guaranteed rate freeze & all perks.' },
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setEditingPlan({
                            id: `plan_${Date.now()}`,
                            name: tpl.name,
                            duration: tpl.duration,
                            tagline: tpl.tagline,
                            priceMonthly: tpl.price,
                            popular: tpl.duration === '1 Year' || tpl.duration === '3 Months',
                            badge: tpl.duration === '1 Year' ? 'BEST VALUE' : tpl.duration === '1 Day' ? 'DROP-IN' : undefined,
                            features: ['Full Gym Floor Access', 'Locker & Shower Included', 'Trainer Guidance On Floor'],
                            notIncluded: tpl.duration.includes('Day') ? ['Free Guest Passes', 'Personal Lockers'] : undefined,
                            ctaText: 'Pay at Gym Desk',
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{tpl.duration}</span>
                        <span className="text-neutral-500 font-mono">({config.currencySymbol || '₹'}{tpl.price})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Plan Edit Modal / Drawer */}
              {(editingPlan || isAddingPlan) && (
                <div className="bg-neutral-950 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <h4 className="text-lg font-black uppercase text-amber-400">
                      {isAddingPlan ? 'Create New Package Tier' : `Edit Package: ${editingPlan?.name}`}
                    </h4>
                    <button
                      onClick={() => {
                        setEditingPlan(null);
                        setIsAddingPlan(false);
                      }}
                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {editingPlan && (
                    <div className="space-y-4">
                      {/* Package Duration Selector */}
                      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                        <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                          Package Duration (Days, Months, Years):
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {[
                            '1 Day',
                            '3 Days',
                            '7 Days',
                            '15 Days',
                            '1 Month',
                            '2 Months',
                            '3 Months',
                            '6 Months',
                            '1 Year',
                            '2 Years',
                          ].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setEditingPlan({ ...editingPlan, duration: dur })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                                editingPlan.duration === dur
                                  ? `${theme.accentBg} shadow-md`
                                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{dur}</span>
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-1">
                              Duration Label (or custom days/years):
                            </span>
                            <input
                              type="text"
                              value={editingPlan.duration || '1 Month'}
                              placeholder="e.g. 1 Day, 7 Days, 1 Month, 1 Year, 2 Years"
                              onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-1">
                              Button CTA Label:
                            </span>
                            <input
                              type="text"
                              value={editingPlan.ctaText || `Choose ${editingPlan.duration || 'Plan'}`}
                              placeholder="e.g. Choose 1 Day, Join 1 Year Pass"
                              onChange={(e) => setEditingPlan({ ...editingPlan, ctaText: e.target.value })}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Plan / Package Name:
                          </label>
                          <input
                            type="text"
                            value={editingPlan.name}
                            onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Price for this Duration ({config.currencySymbol || '₹'}):
                          </label>
                          <input
                            type="number"
                            value={editingPlan.priceMonthly}
                            onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Tagline / Subtext:
                          </label>
                          <input
                            type="text"
                            value={editingPlan.tagline}
                            onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Badge Label (Optional):
                          </label>
                          <input
                            type="text"
                            value={editingPlan.badge || ''}
                            placeholder="e.g. POPULAR, BEST VALUE, DROP-IN"
                            onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPlan.popular || false}
                            onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                            className="w-4 h-4 rounded accent-amber-400"
                          />
                          <span>Highlight as Featured / Recommended Package</span>
                        </label>
                      </div>

                      {/* Features list */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Included Features (one per line):
                        </label>
                        <textarea
                          rows={4}
                          value={editingPlan.features.join('\n')}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono"
                        />
                      </div>

                      {/* Not Included */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Not Included Features (optional, one per line):
                        </label>
                        <textarea
                          rows={2}
                          value={(editingPlan.notIncluded || []).join('\n')}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              notIncluded: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          onClick={() => {
                            setEditingPlan(null);
                            setIsAddingPlan(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (isAddingPlan) {
                              addPlan(editingPlan);
                              triggerSaveNotification(`Created new package: ${editingPlan.name} (${editingPlan.duration || '1 Month'})`);
                            } else {
                              updatePlan(editingPlan);
                              triggerSaveNotification(`Updated package: ${editingPlan.name}`);
                            }
                            setEditingPlan(null);
                            setIsAddingPlan(false);
                          }}
                          className={`px-5 py-2 rounded-xl text-xs font-black uppercase ${theme.accentBg}`}
                        >
                          Save Package
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {config.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-black uppercase text-white">{plan.name}</h4>
                        {plan.popular && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            POPULAR
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 text-xs font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {plan.duration || '1 Month'}
                        </span>
                        {plan.badge && (
                          <span className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-300 text-[10px] font-bold">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
                        {config.currencySymbol || '₹'}{(plan.priceMonthly ?? 0).toLocaleString('en-IN')}
                        <span className="text-xs text-neutral-400 font-sans font-normal ml-1">
                          / {plan.duration || '1 Month'}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 line-clamp-2">{plan.tagline}</div>
                      <div className="mt-4 text-xs text-neutral-300 space-y-1">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="truncate">• {f}</div>
                        ))}
                        {plan.features.length > 3 && (
                          <div className="text-neutral-500 text-[10px]">
                            +{plan.features.length - 3} more perks
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          setEditingPlan({ ...plan, duration: plan.duration || '1 Month' });
                          setIsAddingPlan(false);
                        }}
                        className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          deletePlan(plan.id);
                          triggerSaveNotification(`Deleted package: ${plan.name}`);
                        }}
                        className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/60"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TRAINERS CMS */}
          {adminTab === 'trainers' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white">
                    Trainers & Coaches Roster
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Add new trainers, update photos, certifications, and hourly rates.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newId = `trainer_${Date.now()}`;
                    setEditingTrainer({
                      id: newId,
                      name: 'Coach Alex Storm',
                      role: 'Senior Strength Coach',
                      specialties: ['Powerlifting', 'Conditioning'],
                      experience: '6+ Years Coaching',
                      certifications: ['NASM-CPT', 'CSCS'],
                      bio: 'Passionate coach specializing in progressive overload, athletic agility, and physique transformation.',
                      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                      ratePerSession: 1200,
                      instagram: '@coach_storm',
                      availableForBooking: true,
                    });
                    setIsAddingTrainer(true);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Coach</span>
                </button>
              </div>

              {/* Trainer Edit Drawer */}
              {(editingTrainer || isAddingTrainer) && (
                <div className="bg-neutral-950 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <h4 className="text-lg font-black uppercase text-amber-400">
                      {isAddingTrainer ? 'Add Certified Coach' : `Edit Coach: ${editingTrainer?.name}`}
                    </h4>
                    <button
                      onClick={() => {
                        setEditingTrainer(null);
                        setIsAddingTrainer(false);
                      }}
                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {editingTrainer && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Coach Full Name:
                          </label>
                          <input
                            type="text"
                            value={editingTrainer.name}
                            onChange={(e) => setEditingTrainer({ ...editingTrainer, name: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Role / Title:
                          </label>
                          <input
                            type="text"
                            value={editingTrainer.role}
                            onChange={(e) => setEditingTrainer({ ...editingTrainer, role: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Rate Per Session ({config.currencySymbol || '₹'}):
                          </label>
                          <input
                            type="number"
                            value={editingTrainer.ratePerSession}
                            onChange={(e) => setEditingTrainer({ ...editingTrainer, ratePerSession: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Experience Badge:
                          </label>
                          <input
                            type="text"
                            value={editingTrainer.experience}
                            onChange={(e) => setEditingTrainer({ ...editingTrainer, experience: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Instagram Handle:
                          </label>
                          <input
                            type="text"
                            value={editingTrainer.instagram || ''}
                            placeholder="@coach_handle"
                            onChange={(e) => setEditingTrainer({ ...editingTrainer, instagram: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <ImageUploadField
                          label="Coach Profile Photo"
                          value={editingTrainer.image}
                          onChange={(val) => setEditingTrainer({ ...editingTrainer, image: val })}
                          aspectRatio="square"
                          helperText="Upload portrait photo of the trainer from your computer or phone."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Certifications (comma separated):
                        </label>
                        <input
                          type="text"
                          value={editingTrainer.certifications.join(', ')}
                          onChange={(e) =>
                            setEditingTrainer({
                              ...editingTrainer,
                              certifications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Specialties (comma separated):
                        </label>
                        <input
                          type="text"
                          value={editingTrainer.specialties.join(', ')}
                          onChange={(e) =>
                            setEditingTrainer({
                              ...editingTrainer,
                              specialties: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Coach Bio:
                        </label>
                        <textarea
                          rows={3}
                          value={editingTrainer.bio}
                          onChange={(e) => setEditingTrainer({ ...editingTrainer, bio: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          onClick={() => {
                            setEditingTrainer(null);
                            setIsAddingTrainer(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (isAddingTrainer) {
                              addTrainer(editingTrainer);
                              triggerSaveNotification(`Added new trainer: ${editingTrainer.name}`);
                            } else {
                              updateTrainer(editingTrainer);
                              triggerSaveNotification(`Updated trainer: ${editingTrainer.name}`);
                            }
                            setEditingTrainer(null);
                            setIsAddingTrainer(false);
                          }}
                          className={`px-5 py-2 rounded-xl text-xs font-black uppercase ${theme.accentBg}`}
                        >
                          Save Coach
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trainers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {config.trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={trainer.image}
                          alt={trainer.name}
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-neutral-950/90 text-white font-mono text-xs px-2 py-0.5 rounded-full">
                          {config.currencySymbol || '₹'}{(trainer.ratePerSession ?? 0).toLocaleString('en-IN')}/session
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-base font-black uppercase text-white">{trainer.name}</h4>
                        <div className="text-xs text-amber-400 font-bold">{trainer.role}</div>
                        <div className="text-xs text-neutral-400 mt-2 line-clamp-2">{trainer.bio}</div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2 border-t border-neutral-800/80 mt-2">
                      <button
                        onClick={() => {
                          setEditingTrainer({ ...trainer });
                          setIsAddingTrainer(false);
                        }}
                        className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          deleteTrainer(trainer.id);
                          triggerSaveNotification(`Deleted trainer: ${trainer.name}`);
                        }}
                        className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/60"
                        title="Delete Trainer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLASSES & SCHEDULE CMS */}
          {adminTab === 'classes' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <span>Class Timings & Studio Schedule</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-amber-400 font-bold">
                      {config.classes.length} Total
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Add, edit, or adjust Morning and Evening class timings (Yoga, Zumba, HIIT, Strength) with live real-time sync.
                  </p>
                </div>

                {/* Quick Add Action Buttons with Morning & Evening options */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Evening Yoga */}
                  <button
                    onClick={() => {
                      const newId = `class_yoga_pm_${Date.now()}`;
                      const yogaTrainer = config.trainers.find(t => t.name.toLowerCase().includes('sofia') || t.specialties?.some(s => s.toLowerCase().includes('yoga')))?.name || config.trainers[0]?.name || 'Sofia Chen';
                      setEditingClass({
                        id: newId,
                        title: 'Candlelight Yin & Evening Restorative Yoga',
                        category: 'Yoga & Mobility',
                        trainerName: yogaTrainer,
                        dayOfWeek: (adminClassDayFilter !== 'All' ? adminClassDayFilter : 'Monday') as any,
                        time: '06:30 PM',
                        durationMinutes: 60,
                        intensity: 'All Levels',
                        capacity: 25,
                        reservedCount: 0,
                        room: 'Zen Mind & Body Studio',
                        description: 'Decompress from the workday with gentle spinal mobility, soothing stretches, and evening restorative breathwork.',
                      });
                      setIsAddingClass(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg transition border border-emerald-500/30"
                    title="Add an evening Yoga session"
                  >
                    <Moon className="w-3.5 h-3.5 text-emerald-300" />
                    <span>+ Evening Yoga (6:30 PM)</span>
                  </button>

                  {/* Evening Zumba */}
                  <button
                    onClick={() => {
                      const newId = `class_zumba_pm_${Date.now()}`;
                      const zumbaTrainer = config.trainers.find(t => t.name.toLowerCase().includes('ananya') || t.specialties?.some(s => s.toLowerCase().includes('zumba')))?.name || config.trainers[0]?.name || 'Ananya Sharma';
                      setEditingClass({
                        id: newId,
                        title: 'High-Energy Evening Zumba Dance Party',
                        category: 'Zumba & Dance',
                        trainerName: zumbaTrainer,
                        dayOfWeek: (adminClassDayFilter !== 'All' ? adminClassDayFilter : 'Monday') as any,
                        time: '06:30 PM',
                        durationMinutes: 50,
                        intensity: 'High Intensity',
                        capacity: 35,
                        reservedCount: 0,
                        room: 'Aerobic & Dance Studio',
                        description: 'Calorie-burning Latin, pop and Bollywood dance cardio with party lights and infectious energy.',
                      });
                      setIsAddingClass(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black shadow-lg transition"
                    title="Add an evening Zumba dance session"
                  >
                    <Moon className="w-3.5 h-3.5 text-black" />
                    <span>+ Evening Zumba (6:30 PM)</span>
                  </button>

                  {/* Evening HIIT / Strength */}
                  <button
                    onClick={() => {
                      const newId = `class_hiit_pm_${Date.now()}`;
                      setEditingClass({
                        id: newId,
                        title: 'After-Work Iron & HIIT Conditioning',
                        category: 'HIIT & Conditioning',
                        trainerName: config.trainers[0]?.name || 'Marcus Vance',
                        dayOfWeek: (adminClassDayFilter !== 'All' ? adminClassDayFilter : 'Monday') as any,
                        time: '07:30 PM',
                        durationMinutes: 45,
                        intensity: 'High Intensity',
                        capacity: 20,
                        reservedCount: 0,
                        room: 'Main Turf Arena',
                        description: 'High energy circuit training targeting athletic power, explosive fat burning, and functional strength.',
                      });
                      setIsAddingClass(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition"
                    title="Add an evening HIIT or Turf Conditioning session"
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-300" />
                    <span>+ Evening HIIT (7:30 PM)</span>
                  </button>

                  {/* Morning Yoga */}
                  <button
                    onClick={() => {
                      const newId = `class_yoga_am_${Date.now()}`;
                      const yogaTrainer = config.trainers.find(t => t.name.toLowerCase().includes('sofia') || t.specialties?.some(s => s.toLowerCase().includes('yoga')))?.name || config.trainers[0]?.name || 'Sofia Chen';
                      setEditingClass({
                        id: newId,
                        title: 'Sunrise Vinyasa Yoga & Pranayama',
                        category: 'Yoga & Mobility',
                        trainerName: yogaTrainer,
                        dayOfWeek: (adminClassDayFilter !== 'All' ? adminClassDayFilter : 'Monday') as any,
                        time: '06:30 AM',
                        durationMinutes: 60,
                        intensity: 'All Levels',
                        capacity: 25,
                        reservedCount: 0,
                        room: 'Zen Mind & Body Studio',
                        description: 'Gentle flow, sun salutations, spinal mobility, and restorative breathwork.',
                      });
                      setIsAddingClass(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 transition"
                    title="Add a morning Yoga session"
                  >
                    <Sun className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Morning Yoga</span>
                  </button>

                  {/* Custom Class */}
                  <button
                    onClick={() => {
                      const newId = `class_${Date.now()}`;
                      setEditingClass({
                        id: newId,
                        title: 'Evening Performance Training',
                        category: 'Strength',
                        trainerName: config.trainers[0]?.name || 'Marcus Vance',
                        dayOfWeek: (adminClassDayFilter !== 'All' ? adminClassDayFilter : 'Monday') as any,
                        time: '06:00 PM',
                        durationMinutes: 50,
                        intensity: 'Intermediate',
                        capacity: 25,
                        reservedCount: 0,
                        room: 'Main Studio',
                        description: 'Comprehensive functional training class designed to optimize muscle tone, posture, and endurance.',
                      });
                      setIsAddingClass(true);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Custom Class</span>
                  </button>
                </div>
              </div>

              {/* Class Search & Filter Bar */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminClassSearch}
                    onChange={(e) => setAdminClassSearch(e.target.value)}
                    placeholder="Search classes, Yoga, Zumba, coach, room, timing..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                  {adminClassSearch && (
                    <button
                      onClick={() => setAdminClassSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Day Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase whitespace-nowrap">Day:</span>
                  <select
                    value={adminClassDayFilter}
                    onChange={(e) => setAdminClassDayFilter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="All">All Days</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Time Filter (Morning / Evening / All) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase whitespace-nowrap">Time:</span>
                  <select
                    value={adminClassTimeFilter}
                    onChange={(e) => setAdminClassTimeFilter(e.target.value as any)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="All">All Timings</option>
                    <option value="Evening">🌙 Evening (PM)</option>
                    <option value="Morning">☀️ Morning (AM)</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase whitespace-nowrap">Category:</span>
                  <select
                    value={adminClassCategoryFilter}
                    onChange={(e) => setAdminClassCategoryFilter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="All">All Categories</option>
                    <option value="Yoga & Mobility">🧘 Yoga & Mobility</option>
                    <option value="Zumba & Dance">💃 Zumba & Dance</option>
                    <option value="HIIT & Conditioning">⚡ HIIT & Conditioning</option>
                    <option value="Strength">🏋️ Strength</option>
                    <option value="Boxing / MMA">🥊 Boxing / MMA</option>
                    <option value="Spin & Cycle">🚴 Spin & Cycle</option>
                    <option value="CrossFit">🏆 CrossFit</option>
                    <option value="Recovery & Spa">💆 Recovery & Spa</option>
                    <option value="Pilates & Aerobics">🤸 Pilates & Aerobics</option>
                  </select>
                </div>
              </div>

              {/* Class Edit Drawer */}
              {(editingClass || isAddingClass) && (
                <div className="bg-neutral-950 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2.5">
                      {editingClass?.category === 'Yoga & Mobility' && <HeartPulse className="w-5 h-5 text-emerald-400" />}
                      {editingClass?.category === 'Zumba & Dance' && <Music className="w-5 h-5 text-amber-400" />}
                      {editingClass?.time?.toUpperCase().includes('PM') ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" />
                          Evening Session
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-400" />
                          Morning Session
                        </span>
                      )}
                      <h4 className="text-lg font-black uppercase text-amber-400">
                        {isAddingClass ? 'Schedule New Class' : `Edit Class: ${editingClass?.title}`}
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setEditingClass(null);
                        setIsAddingClass(false);
                      }}
                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {editingClass && (
                    <div className="space-y-4">
                      {/* Row 1: Title, Category, Day */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Class Title:
                          </label>
                          <input
                            type="text"
                            value={editingClass.title}
                            onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })}
                            placeholder="e.g. Evening Candlelight Yoga or Zumba Party"
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Category:
                          </label>
                          <select
                            value={editingClass.category}
                            onChange={(e) => setEditingClass({ ...editingClass, category: e.target.value as any })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          >
                            <option value="Yoga & Mobility">🧘 Yoga & Mobility</option>
                            <option value="Zumba & Dance">💃 Zumba & Dance</option>
                            <option value="HIIT & Conditioning">⚡ HIIT & Conditioning</option>
                            <option value="Strength">🏋️ Strength</option>
                            <option value="Boxing / MMA">🥊 Boxing / MMA</option>
                            <option value="Spin & Cycle">🚴 Spin & Cycle</option>
                            <option value="CrossFit">🏆 CrossFit</option>
                            <option value="Recovery & Spa">💆 Recovery & Spa</option>
                            <option value="Pilates & Aerobics">🤸 Pilates & Aerobics</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Day of Week:
                          </label>
                          <select
                            value={editingClass.dayOfWeek}
                            onChange={(e) => setEditingClass({ ...editingClass, dayOfWeek: e.target.value as any })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Timing Selection with Evening Presets */}
                      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>Class Timing & Session Period</span>
                          </label>

                          {/* Quick AM / PM Switcher buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const current = editingClass.time || '06:30 PM';
                                const newTime = current.toUpperCase().includes('AM')
                                  ? current.replace(/AM/gi, 'PM')
                                  : current;
                                setEditingClass({ ...editingClass, time: newTime.trim() });
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                editingClass.time?.toUpperCase().includes('PM')
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              <Moon className="w-3.5 h-3.5" />
                              <span>Evening (PM)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const current = editingClass.time || '06:30 AM';
                                const newTime = current.toUpperCase().includes('PM')
                                  ? current.replace(/PM/gi, 'AM')
                                  : current;
                                setEditingClass({ ...editingClass, time: newTime.trim() });
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                !editingClass.time?.toUpperCase().includes('PM')
                                  ? 'bg-amber-500 text-black shadow-md'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              <Sun className="w-3.5 h-3.5" />
                              <span>Morning (AM)</span>
                            </button>
                          </div>
                        </div>

                        {/* Timing input and quick slots */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                          <div className="lg:col-span-4">
                            <div className="relative">
                              <input
                                type="text"
                                value={editingClass.time}
                                placeholder="e.g. 06:30 PM"
                                onChange={(e) => setEditingClass({ ...editingClass, time: e.target.value })}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:border-amber-400"
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 mt-1 block">
                              Type time or click a slot on the right
                            </span>
                          </div>

                          {/* Quick Evening Slots */}
                          <div className="lg:col-span-8 space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                                <Moon className="w-3 h-3" />
                                <span>Evening Slots:</span>
                              </span>
                              {['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM'].map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setEditingClass({ ...editingClass, time: slot })}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition ${
                                    editingClass.time === slot
                                      ? 'bg-indigo-600 text-white border border-indigo-400 shadow'
                                      : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                                <Sun className="w-3 h-3" />
                                <span>Morning Slots:</span>
                              </span>
                              {['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM'].map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setEditingClass({ ...editingClass, time: slot })}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition ${
                                    editingClass.time === slot
                                      ? 'bg-amber-500 text-black border border-amber-400 shadow'
                                      : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Duration, Capacity, Bookings */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Duration (Minutes):
                          </label>
                          <input
                            type="number"
                            value={editingClass.durationMinutes}
                            onChange={(e) => setEditingClass({ ...editingClass, durationMinutes: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Max Capacity:
                          </label>
                          <input
                            type="number"
                            value={editingClass.capacity}
                            onChange={(e) => setEditingClass({ ...editingClass, capacity: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Current Bookings:
                          </label>
                          <input
                            type="number"
                            value={editingClass.reservedCount}
                            onChange={(e) => setEditingClass({ ...editingClass, reservedCount: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Row 4: Coach, Intensity, Room */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Assigned Coach:
                          </label>
                          <select
                            value={editingClass.trainerName}
                            onChange={(e) => setEditingClass({ ...editingClass, trainerName: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          >
                            {config.trainers.map((t) => (
                              <option key={t.id} value={t.name}>{t.name} ({t.role})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Intensity Level:
                          </label>
                          <select
                            value={editingClass.intensity}
                            onChange={(e) => setEditingClass({ ...editingClass, intensity: e.target.value as any })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          >
                            <option value="All Levels">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="High Intensity">High Intensity</option>
                            <option value="Extreme">Extreme</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                            Studio / Room Location:
                          </label>
                          <input
                            type="text"
                            value={editingClass.room}
                            placeholder="e.g. Zen Mind & Body Studio, Aerobic & Dance Studio, Main Turf Arena"
                            onChange={(e) => setEditingClass({ ...editingClass, room: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Row 5: Description */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Class Description:
                        </label>
                        <textarea
                          rows={2}
                          value={editingClass.description}
                          onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                          placeholder="Describe the workout, target benefits, music or pace..."
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                        {/* Quick Duplicate to another day */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-neutral-400 uppercase hidden sm:inline">
                            Quick Clone To:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((shortDay, idx) => {
                              const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx];
                              return (
                                <button
                                  key={shortDay}
                                  type="button"
                                  onClick={() => {
                                    const clonedClass: GymClass = {
                                      ...editingClass,
                                      id: `class_${Date.now()}_${shortDay.toLowerCase()}`,
                                      dayOfWeek: fullDay as any,
                                    };
                                    addClass(clonedClass);
                                    triggerSaveNotification(`Cloned ${editingClass.title} to ${fullDay}!`);
                                  }}
                                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-bold text-neutral-300 hover:text-white"
                                  title={`Duplicate this class to ${fullDay}`}
                                >
                                  +{shortDay}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClass(null);
                              setIsAddingClass(false);
                            }}
                            className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAddingClass) {
                                addClass(editingClass);
                                triggerSaveNotification(`Scheduled class: ${editingClass.title} for ${editingClass.dayOfWeek} at ${editingClass.time}`);
                              } else {
                                updateClass(editingClass);
                                triggerSaveNotification(`Updated class: ${editingClass.title}`);
                              }
                              setEditingClass(null);
                              setIsAddingClass(false);
                            }}
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase ${theme.accentBg}`}
                          >
                            Save Class Schedule
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Class List Table */}
              {(() => {
                const filteredAdminClasses = config.classes.filter((cls) => {
                  const matchesDay = adminClassDayFilter === 'All' || cls.dayOfWeek === adminClassDayFilter;
                  const matchesCategory = adminClassCategoryFilter === 'All' || cls.category === adminClassCategoryFilter;
                  const isEvening = cls.time.toUpperCase().includes('PM');
                  const matchesTime =
                    adminClassTimeFilter === 'All' ||
                    (adminClassTimeFilter === 'Evening' && isEvening) ||
                    (adminClassTimeFilter === 'Morning' && !isEvening);
                  const q = adminClassSearch.toLowerCase().trim();
                  const matchesSearch =
                    !q ||
                    cls.title.toLowerCase().includes(q) ||
                    cls.trainerName.toLowerCase().includes(q) ||
                    cls.category.toLowerCase().includes(q) ||
                    cls.room.toLowerCase().includes(q) ||
                    cls.time.toLowerCase().includes(q) ||
                    cls.dayOfWeek.toLowerCase().includes(q);
                  return matchesDay && matchesCategory && matchesTime && matchesSearch;
                });

                return (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-950 text-neutral-400 uppercase font-black text-[10px] border-b border-neutral-800">
                          <tr>
                            <th className="p-4">Day & Time</th>
                            <th className="p-4">Class Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Coach</th>
                            <th className="p-4">Room</th>
                            <th className="p-4">Capacity</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {filteredAdminClasses.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-neutral-400">
                                No classes found matching filter criteria. Click "+ Evening Yoga", "+ Evening Zumba", or "+ Custom Class" above to schedule.
                              </td>
                            </tr>
                          ) : (
                            filteredAdminClasses.map((cls) => {
                              const isYoga = cls.category === 'Yoga & Mobility';
                              const isZumba = cls.category === 'Zumba & Dance';
                              const isEvening = cls.time.toUpperCase().includes('PM');

                              return (
                                <tr key={cls.id} className="hover:bg-neutral-800/40 transition">
                                  <td className="p-4 font-bold text-white whitespace-nowrap">
                                    <span className="text-amber-400 block">{cls.dayOfWeek}</span>
                                    <div className="flex items-center gap-1.5 text-neutral-300 font-normal mt-0.5">
                                      <Clock className="w-3 h-3 text-neutral-500" />
                                      <span>{cls.time}</span>
                                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                        isEvening ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {isEvening ? <Moon className="w-2.5 h-2.5 text-indigo-400" /> : <Sun className="w-2.5 h-2.5 text-amber-400" />}
                                        {isEvening ? 'PM' : 'AM'}
                                      </span>
                                      <span className="text-[10px] text-neutral-500">({cls.durationMinutes}m)</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-extrabold text-white flex items-center gap-1.5">
                                      {isYoga && <HeartPulse className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                      {isZumba && <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                      <span>{cls.title}</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                                      {cls.intensity}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                      isYoga ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                      isZumba ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                      'bg-neutral-800 text-neutral-300'
                                    }`}>
                                      {cls.category}
                                    </span>
                                  </td>
                                  <td className="p-4 text-white font-bold whitespace-nowrap">{cls.trainerName}</td>
                                  <td className="p-4 text-neutral-400">{cls.room}</td>
                                  <td className="p-4 text-neutral-300 font-mono whitespace-nowrap">
                                    {cls.reservedCount} / {cls.capacity}
                                  </td>
                                  <td className="p-4 text-right whitespace-nowrap">
                                    {/* Edit Button */}
                                    <button
                                      onClick={() => {
                                        setEditingClass({ ...cls });
                                        setIsAddingClass(false);
                                      }}
                                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white mr-1.5 transition"
                                      title="Edit Class"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Clone / Duplicate Button */}
                                    <button
                                      onClick={() => {
                                        const cloned: GymClass = {
                                          ...cls,
                                          id: `class_${Date.now()}`,
                                          title: `${cls.title} (Copy)`,
                                          reservedCount: 0,
                                        };
                                        addClass(cloned);
                                        triggerSaveNotification(`Duplicated class: ${cloned.title}`);
                                      }}
                                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white mr-1.5 transition"
                                      title="Duplicate Class"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      onClick={() => {
                                        deleteClass(cls.id);
                                        triggerSaveNotification(`Deleted class: ${cls.title}`);
                                      }}
                                      className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-400 transition"
                                      title="Delete Class"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 6: LEADS & ENQUIRIES CMS */}
          {adminTab === 'leads' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white">
                    Member Leads & Inquiries ({leads.length})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Track trial pass requests, plan inquiries, and trainer bookings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setReceiptDataForModal({
                        memberName: '',
                        memberEmail: '',
                        memberPhone: '',
                        planName: config.plans[0]?.name || 'Elite Monthly Plan',
                        totalAmount: config.plans[0]?.priceMonthly || 2999,
                        paymentMethod: 'UPI (Google Pay / PhonePe)',
                      });
                      setIsReceiptOpen(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg ${theme.accentBg}`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Make / Create Receipt</span>
                  </button>
                  <button
                    onClick={handleExportLeadsCsv}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      clearAllLeads();
                      triggerSaveNotification('All leads cleared.');
                    }}
                    className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 text-xs font-bold"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  {['All', 'trial_pass', 'membership_inquiry', 'trainer_booking', 'general_contact'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setLeadTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap uppercase ${
                        leadTypeFilter === type ? theme.accentBg : 'bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase font-black text-[10px] border-b border-neutral-800">
                      <tr>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Inquiry Type</th>
                        <th className="p-4">Target Plan / Coach</th>
                        <th className="p-4">Message Details</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {leads
                        .filter((l) => {
                          const matchesSearch =
                            l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
                            l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
                            (l.phone && l.phone.includes(leadSearch));
                          const matchesType = leadTypeFilter === 'All' || l.type === leadTypeFilter;
                          return matchesSearch && matchesType;
                        })
                        .map((lead) => (
                          <tr key={lead.id} className="hover:bg-neutral-800/40 transition">
                            <td className="p-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                              {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'}
                            </td>
                            <td className="p-4">
                              <div className="font-extrabold text-white">{lead.name}</div>
                              <a href={`mailto:${lead.email}`} className="text-neutral-400 hover:text-amber-400 block">
                                {lead.email}
                              </a>
                              {lead.phone && (
                                <a href={`tel:${lead.phone}`} className="text-neutral-500 hover:text-white block font-mono">
                                  {lead.phone}
                                </a>
                              )}
                            </td>
                            <td className="p-4 uppercase font-bold text-amber-400 whitespace-nowrap">
                              {lead.type.replace('_', ' ')}
                            </td>
                            <td className="p-4 font-semibold text-neutral-200">
                              {lead.planName || lead.trainerName || '—'}
                            </td>
                            <td className="p-4 text-neutral-300 max-w-xs truncate">
                              {lead.message || '—'}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <select
                                value={lead.status}
                                onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase focus:outline-none ${
                                  lead.status === 'new'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : lead.status === 'contacted'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : lead.status === 'enrolled'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="enrolled">Enrolled</option>
                                <option value="archived">Archived</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    const matchingPlan = config.plans.find(
                                      (p) => lead.planName && p.name.toLowerCase().includes(lead.planName.toLowerCase())
                                    );
                                    const price = matchingPlan ? matchingPlan.priceMonthly : 2999;
                                    
                                    let method = 'UPI (Google Pay / PhonePe)';
                                    if (lead.message?.includes('Debit Card')) method = 'Debit Card (RuPay / Visa)';
                                    else if (lead.message?.includes('UPI')) method = 'UPI App / VPA';
                                    else if (lead.message?.includes('QR')) method = 'QR Code (UPI Scan & Pay)';

                                    setReceiptDataForModal({
                                      memberName: lead.name,
                                      memberEmail: lead.email,
                                      memberPhone: lead.phone,
                                      planName: lead.planName || lead.trainerName || 'Apex Membership Plan',
                                      totalAmount: price,
                                      paymentMethod: method,
                                      date: new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      }),
                                    });
                                    setIsReceiptOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 transition"
                                  title="Print / Generate Tax Receipt & Invoice"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    deleteLead(lead.id);
                                    triggerSaveNotification('Lead deleted.');
                                  }}
                                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-900 text-neutral-400 hover:text-white transition"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: GALLERY CMS */}
          {adminTab === 'gallery' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white">
                    Facility Gallery Photos ({config.gallery.length})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Add high-definition photography of the gym floor and studios.
                  </p>
                </div>
              </div>

              {/* Add Image Card */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold uppercase text-amber-400">Add New Photo to Gallery</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Photo Title (e.g. Olympic Turf Deck)"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={newGalleryCategory}
                    onChange={(e) => setNewGalleryCategory(e.target.value as any)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Gym Floor">Gym Floor</option>
                    <option value="Recovery & Spa">Recovery & Spa</option>
                    <option value="Classes & Studio">Classes & Studio</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>

                <ImageUploadField
                  label="Upload Gallery Photo"
                  value={newGalleryImage}
                  onChange={(val) => setNewGalleryImage(val)}
                  aspectRatio="video"
                  helperText="Upload gym floor shots, workout action, or locker rooms directly from local files."
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!newGalleryTitle || !newGalleryImage) {
                        alert('Please provide a title and photo for the gallery item.');
                        return;
                      }
                      addGalleryItem({
                        id: `gal_${Date.now()}`,
                        title: newGalleryTitle,
                        category: newGalleryCategory,
                        image: newGalleryImage,
                      });
                      setNewGalleryTitle('');
                      setNewGalleryImage('');
                      triggerSaveNotification('New gallery image added!');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase ${theme.accentBg}`}
                  >
                    Add Image to Gallery
                  </button>
                </div>
              </div>

              {/* Gallery List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {config.gallery.map((item) => (
                  <div key={item.id} className="relative h-48 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-400">{item.category}</span>
                        <h4 className="text-sm font-black text-white">{item.title}</h4>
                      </div>
                      <button
                        onClick={() => {
                          deleteGalleryItem(item.id);
                          triggerSaveNotification('Gallery photo deleted.');
                        }}
                        className="self-end p-2 rounded-lg bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: TESTIMONIALS CMS */}
          {adminTab === 'testimonials' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[11px] font-black text-blue-600">
                      G
                    </span>
                    <h3 className="text-2xl font-black uppercase text-white">
                      Google Maps Reviews & Testimonials
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage verified Google Maps reviews, 5-star member ratings, and testimonials.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://maps.app.goo.gl/bpiN5hRb6Dd2VKig6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
                    <span>View Google Maps Page</span>
                  </a>
                  <button
                    onClick={() => {
                      updateConfig((prev) => ({
                        ...prev,
                        testimonials: defaultGymConfig.testimonials,
                        googleMapsEmbedUrl: 'https://maps.app.goo.gl/bpiN5hRb6Dd2VKig6',
                      }));
                      triggerSaveNotification('Synced Google Maps reviews from Maps link!');
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-bold text-amber-400 flex items-center gap-1.5"
                    title="Reload authentic Google Maps reviews from link"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sync Google Reviews</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTestimonial({
                        id: `g_review_${Date.now()}`,
                        name: '',
                        membership: 'Google Reviewer • Local Guide',
                        quote: '',
                        rating: 5,
                        avatar: '',
                        achievement: 'Google Verified Review • 5.0 ★',
                        isGoogleReview: true,
                        googleReviewUrl: 'https://maps.app.goo.gl/bpiN5hRb6Dd2VKig6',
                      });
                      setIsAddingTestimonial(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Review</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit Drawer */}
              {(editingTestimonial || isAddingTestimonial) && editingTestimonial && (
                <div className="bg-neutral-950 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <h4 className="text-lg font-black uppercase text-amber-400">
                      {isAddingTestimonial ? 'Add Member Testimonial' : `Edit Review: ${editingTestimonial.name}`}
                    </h4>
                    <button
                      onClick={() => {
                        setEditingTestimonial(null);
                        setIsAddingTestimonial(false);
                      }}
                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Member Name:
                        </label>
                        <input
                          type="text"
                          value={editingTestimonial.name}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                          placeholder="e.g. Jordan Brooks"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Membership / Tag:
                        </label>
                        <input
                          type="text"
                          value={editingTestimonial.membership}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, membership: e.target.value })}
                          placeholder="e.g. Pro Athlete • 6 Months"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Star Rating (1-5):
                        </label>
                        <select
                          value={editingTestimonial.rating}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                          <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                          <option value={3}>⭐⭐⭐ 3 Stars</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                        Transformation / Result Badge:
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.achievement || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, achievement: e.target.value })}
                        placeholder="e.g. Lost 14kg & Ran First Half-Marathon"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <ImageUploadField
                        label="Member Avatar / Photo"
                        value={editingTestimonial.avatar}
                        onChange={(val) => setEditingTestimonial({ ...editingTestimonial, avatar: val })}
                        aspectRatio="avatar"
                        helperText="Upload member profile picture or transformation photo from local files."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                        Review / Testimonial Quote:
                      </label>
                      <textarea
                        rows={3}
                        value={editingTestimonial.quote}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                        placeholder="Write member review or testimonial..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          setEditingTestimonial(null);
                          setIsAddingTestimonial(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-neutral-900 text-xs font-bold text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!editingTestimonial.name.trim() || !editingTestimonial.quote.trim()) {
                            alert('Please provide member name and review quote.');
                            return;
                          }
                          if (isAddingTestimonial) {
                            addTestimonial(editingTestimonial);
                            triggerSaveNotification('New testimonial added!');
                          } else {
                            updateTestimonial(editingTestimonial);
                            triggerSaveNotification('Testimonial updated!');
                          }
                          setEditingTestimonial(null);
                          setIsAddingTestimonial(false);
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase ${theme.accentBg}`}
                      >
                        {isAddingTestimonial ? 'Save Testimonial' : 'Update Testimonial'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.testimonials.map((test) => (
                  <div key={test.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {test.avatar ? (
                            <img
                              src={test.avatar}
                              alt={test.name}
                              className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400 font-black">
                              {test.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-white">{test.name}</div>
                            <div className="text-xs text-neutral-400 font-medium">{test.membership}</div>
                          </div>
                        </div>
                        <div className="text-xs text-amber-400">{'★'.repeat(test.rating)}</div>
                      </div>
                      <p className="text-xs text-neutral-300 italic mt-3">"{test.quote}"</p>
                      {test.achievement && (
                        <div className="mt-3 text-[11px] font-bold text-emerald-400">
                          Result: {test.achievement}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          setEditingTestimonial(test);
                          setIsAddingTestimonial(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          deleteTestimonial(test.id);
                          triggerSaveNotification('Testimonial removed.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: VIDEO REVIEWS & TRANSFORMATION STORIES CMS */}
          {adminTab === 'videoReviews' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <Video className="w-6 h-6 text-amber-400" />
                    <span>Video Reviews & Transformation Stories</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Manage real member video transformation reviews, YouTube/Vimeo embeds, durations, ratings, and video quotes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateConfig({
                        videoReviews: defaultGymConfig.videoReviews,
                      });
                      triggerSaveNotification('Reset video reviews to defaults.');
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={() => {
                      const newId = `vid_rev_${Date.now()}`;
                      setEditingVideoReview({
                        id: newId,
                        title: '',
                        member: '',
                        membership: 'Gym Member',
                        avatar: '',
                        videoUrl: '',
                        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
                        duration: '2:00',
                        rating: 5,
                        tag: 'Transformation',
                        summary: '',
                        date: 'Recent Story',
                      });
                      setIsAddingVideoReview(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-lg ${theme.accentBg}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Video Review</span>
                  </button>
                </div>
              </div>

              {/* Edit/Add Video Review Form Modal */}
              {(isAddingVideoReview || editingVideoReview) && editingVideoReview && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>{isAddingVideoReview ? 'Add New Video Review' : 'Edit Video Review'}</span>
                    </h4>
                    <button
                      onClick={() => {
                        setEditingVideoReview(null);
                        setIsAddingVideoReview(false);
                      }}
                      className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                        Video Story Title *
                      </label>
                      <input
                        type="text"
                        value={editingVideoReview.title}
                        onChange={(e) => setEditingVideoReview({ ...editingVideoReview, title: e.target.value })}
                        placeholder="e.g. Lost 16kg & Built Lean Muscle in 5 Months"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                        Member Name *
                      </label>
                      <input
                        type="text"
                        value={editingVideoReview.member}
                        onChange={(e) => setEditingVideoReview({ ...editingVideoReview, member: e.target.value })}
                        placeholder="e.g. Aman Deep"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                        Membership / Plan Tier
                      </label>
                      <input
                        type="text"
                        value={editingVideoReview.membership}
                        onChange={(e) => setEditingVideoReview({ ...editingVideoReview, membership: e.target.value })}
                        placeholder="e.g. 1-Year VIP Elite Member"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={editingVideoReview.tag}
                        onChange={(e) => setEditingVideoReview({ ...editingVideoReview, tag: e.target.value })}
                        placeholder="e.g. Transformation / Women Fitness / Strength & PRs"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <VideoUploadField
                        label="Member Video Source (Local Upload or Web URL) *"
                        value={editingVideoReview.videoUrl}
                        onChange={(url) => setEditingVideoReview({ ...editingVideoReview, videoUrl: url })}
                        onThumbnailGenerated={(thumbUrl) => {
                          // Auto-fill thumbnail if empty or user selects from video
                          if (!editingVideoReview.thumbnail || editingVideoReview.thumbnail.includes('unsplash')) {
                            setEditingVideoReview((prev) => prev ? { ...prev, thumbnail: thumbUrl } : null);
                          }
                        }}
                        onDurationDetected={(durationStr) => {
                          setEditingVideoReview((prev) => prev ? { ...prev, duration: durationStr } : null);
                        }}
                        helperText="Upload local video file (.mp4, .mov, .webm) or paste YouTube, Shorts, Vimeo, or direct video URL."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageUploadField
                        label="Video Cover / Thumbnail Image *"
                        value={editingVideoReview.thumbnail}
                        onChange={(url) => setEditingVideoReview({ ...editingVideoReview, thumbnail: url })}
                        folder="video_reviews"
                      />
                    </div>


                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                        Video Duration
                      </label>
                      <input
                        type="text"
                        value={editingVideoReview.duration || '1:30'}
                        onChange={(e) => setEditingVideoReview({ ...editingVideoReview, duration: e.target.value })}
                        placeholder="e.g. 1:45"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                        Star Rating (1-5)
                      </label>
                      <select
                        value={editingVideoReview.rating}
                        onChange={(e) => setEditingVideoReview({ ...editingVideoReview, rating: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value={5}>★★★★★ (5 Stars)</option>
                        <option value={4}>★★★★☆ (4 Stars)</option>
                        <option value={3}>★★★☆☆ (3 Stars)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                        Story / Review Summary Quote *
                      </label>
                      <textarea
                        rows={2}
                        value={editingVideoReview.summary}
                        onChange={(e) => setEditingVideoReview({ ...editingVideoReview, summary: e.target.value })}
                        placeholder="Key takeaway from the video quote..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVideoReview(null);
                        setIsAddingVideoReview(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingVideoReview.title || !editingVideoReview.member) {
                          alert('Please enter a story title and member name.');
                          return;
                        }
                        if (isAddingVideoReview) {
                          addVideoReview(editingVideoReview);
                          triggerSaveNotification('New video review added successfully!');
                        } else {
                          updateVideoReview(editingVideoReview);
                          triggerSaveNotification('Video review updated successfully!');
                        }
                        setEditingVideoReview(null);
                        setIsAddingVideoReview(false);
                      }}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase ${theme.accentBg}`}
                    >
                      {isAddingVideoReview ? 'Save Video Review' : 'Update Video Review'}
                    </button>
                  </div>
                </div>
              )}

              {/* List of Video Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(config.videoReviews || []).map((video) => (
                  <div key={video.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 mb-3 border border-neutral-800">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400">
                          {video.tag}
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-300">
                            {video.duration}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-extrabold text-white text-sm line-clamp-1">{video.title}</h4>
                        <span className="text-xs text-amber-400 shrink-0">{'★'.repeat(video.rating || 5)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                        <span className="font-bold text-neutral-300">{video.member}</span>
                        <span>•</span>
                        <span>{video.membership}</span>
                      </div>

                      <p className="text-xs text-neutral-400 italic line-clamp-2">
                        "{video.summary}"
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          setEditingVideoReview(video);
                          setIsAddingVideoReview(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          deleteVideoReview(video.id);
                          triggerSaveNotification('Video review deleted.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PHOTO GALLERY CMS */}
          {adminTab === 'gallery' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                    <Image className="w-6 h-6 text-amber-400" />
                    <span>Photo Gallery & Facility Showcase</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Upload, replace, and edit high-definition facility photos, power racks, steam spa, and studio zones.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newId = `gal_${Date.now()}`;
                    setEditingGalleryItem({
                      id: newId,
                      title: '',
                      category: 'Gym Floor',
                      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
                    });
                    setIsAddingGalleryItem(true);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Photo</span>
                </button>
              </div>

              {/* Add / Edit Drawer */}
              {(editingGalleryItem || isAddingGalleryItem) && editingGalleryItem && (
                <div className="bg-neutral-950 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <h4 className="text-lg font-black uppercase text-amber-400">
                      {isAddingGalleryItem ? 'Add Facility Photo' : `Edit Photo: ${editingGalleryItem.title || 'Facility Picture'}`}
                    </h4>
                    <button
                      onClick={() => {
                        setEditingGalleryItem(null);
                        setIsAddingGalleryItem(false);
                      }}
                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Photo Title / Caption:
                        </label>
                        <input
                          type="text"
                          value={editingGalleryItem.title}
                          onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                          placeholder="e.g. Olympic Powerlifting & Squat Racks"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                          Category:
                        </label>
                        <select
                          value={editingGalleryItem.category}
                          onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value as any })}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Gym Floor">Gym Floor</option>
                          <option value="Recovery & Spa">Recovery & Spa</option>
                          <option value="Classes & Studio">Classes & Studio</option>
                          <option value="Equipment">Equipment</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <ImageUploadField
                        label="Facility Photo File / URL"
                        value={editingGalleryItem.image}
                        onChange={(val) => setEditingGalleryItem({ ...editingGalleryItem, image: val })}
                        aspectRatio="video"
                        presets={[
                          { title: 'Olympic Iron Stage', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80' },
                          { title: 'Dumbbell Matrix', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80' },
                          { title: 'Cardio Deck View', url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80' },
                          { title: 'Eucalyptus Steam Spa', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80' },
                          { title: 'Neon Spin Studio', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80' },
                          { title: 'Functional Rig', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80' },
                        ]}
                        helperText="Upload gym photo from your device or select an HD preset."
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          setEditingGalleryItem(null);
                          setIsAddingGalleryItem(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-neutral-900 text-xs font-bold text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!editingGalleryItem.title.trim()) {
                            alert('Please provide a caption or title for the image.');
                            return;
                          }
                          if (isAddingGalleryItem) {
                            addGalleryItem(editingGalleryItem);
                            triggerSaveNotification('New photo added to gallery!');
                          } else {
                            updateGalleryItem(editingGalleryItem);
                            triggerSaveNotification('Gallery photo updated!');
                          }
                          setEditingGalleryItem(null);
                          setIsAddingGalleryItem(false);
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase ${theme.accentBg}`}
                      >
                        {isAddingGalleryItem ? 'Save Photo' : 'Update Photo'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(config.gallery || []).map((item) => (
                  <div
                    key={item.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group"
                  >
                    <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-amber-400 border border-neutral-700">
                        {item.category}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black uppercase text-white truncate" title={item.title}>
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-800">
                        <button
                          onClick={() => {
                            setEditingGalleryItem(item);
                            setIsAddingGalleryItem(false);
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>Edit Image</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteGalleryItem(item.id);
                            triggerSaveNotification('Photo removed from gallery.');
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MASSAGE & STEAM SPA PRICING TABLE CMS */}
          {adminTab === 'spa' && (
            <SpaManagerTab onNotify={triggerSaveNotification} />
          )}

          {/* TAB: CAFE & FUEL BAR MENU */}
          {adminTab === 'cafe' && (
            <CafeManagerTab onNotify={triggerSaveNotification} />
          )}

          {/* TAB: FREQUENTLY ASKED QUESTIONS (FAQ) */}
          {adminTab === 'faqs' && (
            <FaqManagerTab onNotify={triggerSaveNotification} />
          )}

          {/* TAB: FIREBASE CLOUD BACKEND */}
          {adminTab === 'firebase' && (
            <FirebaseManagerTab />
          )}

          {/* TAB 10: BACKUP & FACTORY RESET */}
          {adminTab === 'backup' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-2xl font-black uppercase text-white">
                  Backup, Restore & Factory Reset
                </h3>
                <p className="text-xs text-neutral-400">
                  Export complete gym configuration JSON or restore from factory template.
                </p>
              </div>

              {/* Status Alert */}
              {importStatus && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  {importStatus}
                </div>
              )}

              {/* Cloud Sync Status Banner */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-emerald-500/40 rounded-2xl p-6 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                        <span>Live Cloud Database (Firestore)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                          {cloudSyncStatus === 'synced' ? 'ACTIVE & CONNECTED' : cloudSyncStatus === 'saving' ? 'SYNCING...' : 'OFFLINE CACHE'}
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Any changes made here sync automatically to Firestore and update all mobile phones, computers, and Netlify visitors in real-time.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsManualSyncing(true);
                      const success = await syncToCloudNow();
                      setIsManualSyncing(false);
                      if (success) {
                        triggerSaveNotification('Cloud sync complete! All devices updated.');
                      }
                    }}
                    disabled={isManualSyncing}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                    <span>Push to Cloud Now</span>
                  </button>
                </div>
              </div>

              {/* Export & Import Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-400" />
                    <span>Download JSON Backup</span>
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Downloads a full snapshot of your gym name, plans, trainers, schedule, and facilities into a portable JSON file.
                  </p>
                  <button
                    onClick={handleExportJson}
                    className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider ${theme.accentBg}`}
                  >
                    Download Config File (.json)
                  </button>
                </div>

                {/* Reset Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-red-400" />
                    <span>Reset to Defaults</span>
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Restore the original Apex Elite gym seed configuration with sample trainers, plans, and schedule.
                  </p>
                  <button
                    onClick={() => {
                      resetToDefaults();
                      triggerSaveNotification('Gym reset to factory defaults!');
                    }}
                    className="w-full py-3 rounded-xl bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 text-xs font-extrabold uppercase tracking-wider transition"
                  >
                    Reset Factory Data
                  </button>
                </div>
              </div>

              {/* Raw JSON Config Editor */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Paste JSON Configuration to Restore</span>
                </h4>
                <textarea
                  rows={6}
                  placeholder="Paste exported JSON string here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => {
                    if (!importJsonText.trim()) return;
                    const res = importConfigJson(importJsonText);
                    if (res.success) {
                      setImportStatus('Configuration successfully restored!');
                      setImportJsonText('');
                      triggerSaveNotification('Custom JSON applied!');
                    } else {
                      setImportStatus(`Import error: ${res.message}`);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-black uppercase tracking-wider"
                >
                  Apply Pasted JSON Config
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECEIPT & TAX INVOICE GENERATOR MODAL */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        initialData={receiptDataForModal}
      />
    </div>
  );
};
