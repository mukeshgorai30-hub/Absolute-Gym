import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  GymConfig,
  SubscriptionPlan,
  Trainer,
  GymClass,
  GymAmenity,
  GalleryItem,
  Testimonial,
  VideoReview,
  MemberLead,
  FAQ,
  ThemeColor,
  CafeItem,
  CafeConfig,
  SpaServiceItem,
} from '../types';
import { AppPage } from '../types/navigation';
import { defaultGymConfig, sampleInitialLeads, defaultSpaServices } from '../data/defaultGymData';
import { db, doc, onSnapshot, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from '../firebase';
import {
  getSupabaseClient,
  fetchSupabaseConfig,
  saveSupabaseConfig,
  fetchSupabaseLeads,
  saveSupabaseLead,
  getStoredSupabaseCredentials,
  saveStoredSupabaseCredentials,
  testSupabaseConnection,
  SupabaseConfigSettings,
} from '../supabase';
import {
  getStoredHostingerCredentials,
  saveStoredHostingerCredentials,
  testHostingerConnection,
  fetchHostingerConfig,
  saveHostingerConfig,
  saveHostingerLead,
  fetchHostingerLeads,
  HostingerDbConfig,
} from '../hostingerDb';

interface GymContextType {
  config: GymConfig;
  leads: MemberLead[];
  themeColor: ThemeColor;
  isCloudSynced: boolean;
  cloudSyncStatus: 'synced' | 'saving' | 'offline';
  
  // Hostinger MySQL Database Management
  hostingerConfig: HostingerDbConfig;
  updateHostingerCredentials: (creds: Partial<HostingerDbConfig>) => void;
  testHostingerDb: () => Promise<{ success: boolean; message: string; tableExists: boolean; version?: string }>;
  isHostingerActive: boolean;

  // Supabase Backend Management
  supabaseConfig: SupabaseConfigSettings;
  updateSupabaseCredentials: (creds: Partial<SupabaseConfigSettings>) => void;
  testSupabase: () => Promise<{ success: boolean; message: string; tableExists: boolean }>;
  isSupabaseActive: boolean;
  
  // Page Navigation
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  
  // UI Modals & Navigation
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
  
  selectedPlanForModal: SubscriptionPlan | null;
  setSelectedPlanForModal: (plan: SubscriptionPlan | null) => void;
  
  selectedTrainerForModal: Trainer | null;
  setSelectedTrainerForModal: (trainer: Trainer | null) => void;
  
  selectedClassForModal: GymClass | null;
  setSelectedClassForModal: (c: GymClass | null) => void;
  
  isTrialModalOpen: boolean;
  setIsTrialModalOpen: (open: boolean) => void;
  
  isAIModalOpen: boolean;
  setIsAIModalOpen: (open: boolean) => void;

  isReceiptPortalOpen: boolean;
  setIsReceiptPortalOpen: (open: boolean) => void;

  // General Config operations
  updateConfig: (updater: Partial<GymConfig> | ((prev: GymConfig) => GymConfig)) => void;
  setThemeColor: (color: ThemeColor) => void;

  // Plans operations
  addPlan: (plan: SubscriptionPlan) => void;
  updatePlan: (plan: SubscriptionPlan) => void;
  deletePlan: (id: string) => void;

  // Trainers operations
  addTrainer: (trainer: Trainer) => void;
  updateTrainer: (trainer: Trainer) => void;
  deleteTrainer: (id: string) => void;

  // Classes operations
  addClass: (gymClass: GymClass) => void;
  updateClass: (gymClass: GymClass) => void;
  deleteClass: (id: string) => void;
  reserveClassSpot: (id: string) => boolean;

  // Amenities operations
  addAmenity: (amenity: GymAmenity) => void;
  updateAmenity: (amenity: GymAmenity) => void;
  deleteAmenity: (id: string) => void;

  // Gallery operations
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;

  // Testimonials operations
  addTestimonial: (testimonial: Testimonial) => void;
  updateTestimonial: (testimonial: Testimonial) => void;
  deleteTestimonial: (id: string) => void;

  // Video Reviews operations
  addVideoReview: (videoReview: VideoReview) => void;
  updateVideoReview: (videoReview: VideoReview) => void;
  deleteVideoReview: (id: string) => void;

  // FAQs operations
  addFAQ: (faq: FAQ) => void;
  updateFAQ: (faq: FAQ) => void;
  deleteFAQ: (id: string) => void;

  // Spa & Steam operations
  addSpaService: (item: SpaServiceItem) => void;
  updateSpaService: (item: SpaServiceItem) => void;
  deleteSpaService: (id: string) => void;
  resetSpaServices: () => void;

  // Cafe operations
  addCafeItem: (item: CafeItem) => void;
  updateCafeItem: (item: CafeItem) => void;
  deleteCafeItem: (id: string) => void;
  updateCafeConfig: (cafeConfig: Partial<CafeConfig>) => void;

  // Leads operations
  addLead: (lead: Omit<MemberLead, 'id' | 'createdAt' | 'status'>) => string;
  updateLeadStatus: (id: string, status: MemberLead['status']) => void;
  deleteLead: (id: string) => void;
  clearAllLeads: () => void;

  // Persistence & Backup
  resetToDefaults: () => void;
  exportConfigJson: () => string;
  importConfigJson: (jsonString: string) => { success: boolean; message?: string };
  syncToCloudNow: () => Promise<{
    success: boolean;
    message: string;
    supabaseSynced?: boolean;
    firestoreSynced?: boolean;
    errorDetail?: string;
  }>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const STORAGE_KEY_CONFIG = 'apex_gym_custom_config_v4';
const STORAGE_KEY_LEADS = 'apex_gym_leads_v4';
const FIRESTORE_CONFIG_DOC = 'main';

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<GymConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        const gymName = parsed.name && !parsed.name.includes('Apex') ? parsed.name : defaultGymConfig.name;
        const gymEmail = parsed.email && !parsed.email.includes('apex') ? parsed.email : defaultGymConfig.email;
        const cafeName = parsed.cafe?.name && !parsed.cafe.name.includes('Apex') ? parsed.cafe.name : defaultGymConfig.cafe.name;

        const isLegacyTestimonials = !parsed.testimonials || parsed.testimonials.length === 0 || parsed.testimonials.some((t: any) => t.id === 'test_1' || t.name === 'Alexander Hayes' || t.name === 'Jessica Morales' || t.name === 'David Sterling');

        return {
          ...defaultGymConfig,
          ...parsed,
          name: gymName,
          email: gymEmail,
          googleMapsEmbedUrl: parsed.googleMapsEmbedUrl && !parsed.googleMapsEmbedUrl.includes('New+York') ? parsed.googleMapsEmbedUrl : defaultGymConfig.googleMapsEmbedUrl,
          testimonials: isLegacyTestimonials ? defaultGymConfig.testimonials : parsed.testimonials,
          videoReviews: (parsed.videoReviews && parsed.videoReviews.length > 0) ? parsed.videoReviews : defaultGymConfig.videoReviews,
          spaServices: parsed.spaServices && parsed.spaServices.length > 0 ? parsed.spaServices : defaultSpaServices,
          cafe: {
            ...defaultGymConfig.cafe,
            ...(parsed.cafe || {}),
            name: cafeName,
            items: parsed.cafe?.items && parsed.cafe.items.length > 0 ? parsed.cafe.items : defaultGymConfig.cafe.items,
          },
          currencySymbol: parsed.currencySymbol || '₹',
          currencyCode: parsed.currencyCode || 'INR',
          plans: (parsed.plans || defaultGymConfig.plans).map((p: any) => ({
            ...p,
            ctaText: p.ctaText && !p.ctaText.startsWith('Get ') && !p.ctaText.startsWith('Start ') && !p.ctaText.startsWith('Join ') && !p.ctaText.startsWith('Claim ') && !p.ctaText.startsWith('Experience ') && !p.ctaText.startsWith('Choose ') && p.ctaText !== 'Pay at Gym desk on Arrival'
              ? p.ctaText
              : 'Pay at Gym Desk'
          })),
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved gym config, using default', e);
    }
    return defaultGymConfig;
  });

  const [leads, setLeads] = useState<MemberLead[]>(() => {
    try {
      const savedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
      if (savedLeads) {
        return JSON.parse(savedLeads);
      }
    } catch (e) {
      console.warn('Failed to parse leads, using sample leads', e);
    }
    return sampleInitialLeads;
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfigSettings>(() => getStoredSupabaseCredentials());
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(() => Boolean(getStoredSupabaseCredentials().isEnabled && getStoredSupabaseCredentials().url));
  const [hostingerConfig, setHostingerConfig] = useState<HostingerDbConfig>(() => getStoredHostingerCredentials());
  const [isHostingerActive, setIsHostingerActive] = useState<boolean>(() => Boolean(getStoredHostingerCredentials().isEnabled));
  const isInitialCloudLoadDone = useRef<boolean>(false);
  const isLocalUpdate = useRef<boolean>(false);
  const isRemoteApplying = useRef<boolean>(false);
  const lastLocalEditTimestamp = useRef<number>(0);
  const lastSavedConfigJson = useRef<string>(JSON.stringify(config));
  const tabInstanceId = useRef<string>(Math.random().toString(36).substring(2, 9));

  // Modal & Navigation States
  const [currentPage, setCurrentPageState] = useState<AppPage>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#gallery' || hash === '#facility') return 'gallery';
    if (hash === '#coaches' || hash === '#trainers') return 'coaches';
    if (hash === '#plans' || hash === '#pricing') return 'plans';
    if (hash === '#timings' || hash === '#schedule' || hash === '#classes') return 'timings';
    if (hash === '#cafe' || hash === '#fuelbar') return 'cafe';
    if (hash === '#calculator' || hash === '#bmi' || hash === '#calc') return 'calculator';
    return 'home';
  });

  const setCurrentPage = (page: AppPage) => {
    setCurrentPageState(page);
    if (page === 'home') {
      if (window.location.hash && window.location.hash !== '#hero' && !window.location.hash.startsWith('#admin')) {
        history.pushState(null, '', window.location.pathname + window.location.search);
      }
    } else {
      window.location.hash = page;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#gallery' || hash === '#facility') {
        setCurrentPageState('gallery');
      } else if (hash === '#coaches' || hash === '#trainers') {
        setCurrentPageState('coaches');
      } else if (hash === '#plans' || hash === '#pricing') {
        setCurrentPageState('plans');
      } else if (hash === '#timings' || hash === '#schedule' || hash === '#classes') {
        setCurrentPageState('timings');
      } else if (hash === '#cafe' || hash === '#fuelbar') {
        setCurrentPageState('cafe');
      } else if (hash === '#calculator' || hash === '#bmi' || hash === '#calc') {
        setCurrentPageState('calculator');
      } else if (!hash || hash === '#hero' || hash === '#home' || hash === '#contact') {
        setCurrentPageState('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('overview');
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan | null>(null);
  const [selectedTrainerForModal, setSelectedTrainerForModal] = useState<Trainer | null>(null);
  const [selectedClassForModal, setSelectedClassForModal] = useState<GymClass | null>(null);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isReceiptPortalOpen, setIsReceiptPortalOpen] = useState(false);

  // 1. Supabase Realtime Synchronization Engine
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setIsSupabaseActive(false);
      return;
    }

    setIsSupabaseActive(true);

    // Initial fetch from Supabase
    fetchSupabaseConfig().then((cloudCfg) => {
      if (cloudCfg) {
        setConfigState((prev) => {
          const merged: GymConfig = {
            ...prev,
            ...cloudCfg,
            spaServices: cloudCfg.spaServices && cloudCfg.spaServices.length > 0 ? cloudCfg.spaServices : (prev.spaServices || defaultSpaServices),
            cafe: {
              ...prev.cafe,
              ...(cloudCfg.cafe || {}),
              items: cloudCfg.cafe?.items && cloudCfg.cafe.items.length > 0 ? cloudCfg.cafe.items : prev.cafe?.items || defaultGymConfig.cafe.items,
            },
          };
          const mergedJson = JSON.stringify(merged);
          if (mergedJson === lastSavedConfigJson.current) {
            return prev;
          }
          isRemoteApplying.current = true;
          lastSavedConfigJson.current = mergedJson;
          return merged;
        });
        setIsCloudSynced(true);
        setCloudSyncStatus('synced');
      }
    });

    // Initial leads fetch from Supabase
    fetchSupabaseLeads().then((cloudLeads) => {
      if (cloudLeads && cloudLeads.length > 0) {
        setLeads(cloudLeads);
      }
    });

    // Setup Supabase Realtime Channels for instant cross-device updates
    let configChannel: any = null;
    let leadsChannel: any = null;

    try {
      configChannel = client
        .channel('public:gym_config_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gym_config' },
          (payload: any) => {
            if (Date.now() - lastLocalEditTimestamp.current < 2000) return;
            if (payload?.new && payload.new.data) {
              const remoteData = payload.new.data as Partial<GymConfig>;
              setConfigState((prev) => {
                const merged: GymConfig = {
                  ...prev,
                  ...remoteData,
                  spaServices: remoteData.spaServices && remoteData.spaServices.length > 0 ? remoteData.spaServices : (prev.spaServices || defaultSpaServices),
                  cafe: {
                    ...prev.cafe,
                    ...(remoteData.cafe || {}),
                    items: remoteData.cafe?.items && remoteData.cafe.items.length > 0 ? remoteData.cafe.items : prev.cafe?.items || defaultGymConfig.cafe.items,
                  },
                };
                const mergedJson = JSON.stringify(merged);
                if (mergedJson === lastSavedConfigJson.current) {
                  return prev;
                }
                isRemoteApplying.current = true;
                lastSavedConfigJson.current = mergedJson;
                return merged;
              });
              setIsCloudSynced(true);
              setCloudSyncStatus('synced');
            }
          }
        )
        .subscribe();

      leadsChannel = client
        .channel('public:gym_leads_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gym_leads' },
          () => {
            fetchSupabaseLeads().then((latestLeads) => {
              if (latestLeads) setLeads(latestLeads);
            });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime subscription note:', e);
    }

    return () => {
      if (configChannel && client) client.removeChannel(configChannel);
      if (leadsChannel && client) client.removeChannel(leadsChannel);
    };
  }, [supabaseConfig.url, supabaseConfig.anonKey, supabaseConfig.isEnabled]);

  // 2. Subscribe to Firestore Real-Time Updates (Dual Cloud Fallback)

  useEffect(() => {
    let unsubscribeConfig: (() => void) | null = null;
    let unsubscribeLeads: (() => void) | null = null;

    try {
      const configDocRef = doc(db, 'gym_config', FIRESTORE_CONFIG_DOC);
      
      unsubscribeConfig = onSnapshot(
        configDocRef,
        (snapshot) => {
          // Ignore local pending writes to avoid visual flicker/jerk during typing or edits
          if (snapshot.metadata && snapshot.metadata.hasPendingWrites) {
            return;
          }

          // If the user has recently typed or edited locally within 2s, don't overwrite local state with cloud echo
          if (Date.now() - lastLocalEditTimestamp.current < 2000) {
            setIsCloudSynced(true);
            setCloudSyncStatus('synced');
            return;
          }

          if (snapshot.exists()) {
            const cloudData = snapshot.data() as Partial<GymConfig>;
            if (cloudData && !isLocalUpdate.current) {
              setConfigState((prev) => {
                const gymName = cloudData.name && !cloudData.name.includes('Apex') ? cloudData.name : (prev.name && !prev.name.includes('Apex') ? prev.name : defaultGymConfig.name);
                const gymEmail = cloudData.email && !cloudData.email.includes('apex') ? cloudData.email : (prev.email && !prev.email.includes('apex') ? prev.email : defaultGymConfig.email);
                const cafeName = cloudData.cafe?.name && !cloudData.cafe.name.includes('Apex') ? cloudData.cafe.name : (prev.cafe?.name && !prev.cafe.name.includes('Apex') ? prev.cafe.name : defaultGymConfig.cafe.name);

                const isCloudLegacyTestimonials = !cloudData.testimonials || cloudData.testimonials.length === 0 || cloudData.testimonials.some((t: any) => t.id === 'test_1' || t.name === 'Alexander Hayes' || t.name === 'Jessica Morales' || t.name === 'David Sterling');

                const merged: GymConfig = {
                  ...prev,
                  ...cloudData,
                  name: gymName,
                  email: gymEmail,
                  googleMapsEmbedUrl: cloudData.googleMapsEmbedUrl && !cloudData.googleMapsEmbedUrl.includes('New+York') ? cloudData.googleMapsEmbedUrl : defaultGymConfig.googleMapsEmbedUrl,
                  testimonials: isCloudLegacyTestimonials ? defaultGymConfig.testimonials : (cloudData.testimonials || defaultGymConfig.testimonials),
                  videoReviews: cloudData.videoReviews && cloudData.videoReviews.length > 0
                    ? cloudData.videoReviews
                    : (prev.videoReviews || defaultGymConfig.videoReviews),
                  spaServices: cloudData.spaServices && cloudData.spaServices.length > 0
                    ? cloudData.spaServices
                    : (prev.spaServices || defaultSpaServices),
                  cafe: {
                    ...prev.cafe,
                    ...(cloudData.cafe || {}),
                    name: cafeName,
                    items: cloudData.cafe?.items && cloudData.cafe.items.length > 0
                      ? cloudData.cafe.items
                      : prev.cafe?.items || defaultGymConfig.cafe.items,
                  },
                };
                const mergedJson = JSON.stringify(merged);
                if (mergedJson === lastSavedConfigJson.current) {
                  return prev;
                }
                isRemoteApplying.current = true;
                lastSavedConfigJson.current = mergedJson;
                return merged;
              });
              setIsCloudSynced(true);
              setCloudSyncStatus('synced');
            }
          }
          isInitialCloudLoadDone.current = true;
          isLocalUpdate.current = false;
        },
        (error) => {
          console.warn('Firestore real-time subscription error:', error);
          setCloudSyncStatus('offline');
        }
      );

      // Listen for leads collection in Firestore
      const leadsCollectionRef = collection(db, 'leads');
      unsubscribeLeads = onSnapshot(
        leadsCollectionRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudLeads: MemberLead[] = [];
            snapshot.forEach((docItem) => {
              cloudLeads.push({ id: docItem.id, ...(docItem.data() as any) });
            });
            cloudLeads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setLeads(cloudLeads);
          }
        },
        (err) => {
          console.warn('Firestore leads subscription note:', err);
        }
      );
    } catch (err) {
      console.warn('Failed to setup Firestore listener:', err);
      setCloudSyncStatus('offline');
    }

    return () => {
      if (unsubscribeConfig) unsubscribeConfig();
      if (unsubscribeLeads) unsubscribeLeads();
    };
  }, []);

  // 2. Broadcast Channel for instant same-browser multi-tab sync (ignores self-events)
  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('apex_gym_sync_channel');
        broadcastChannel.onmessage = (event) => {
          if (event.data?.sender === tabInstanceId.current) return;
          if (Date.now() - lastLocalEditTimestamp.current < 2000) return;

          if (event.data?.type === 'SYNC_CONFIG' && event.data.payload) {
            const incomingJson = JSON.stringify(event.data.payload);
            if (incomingJson !== lastSavedConfigJson.current) {
              isRemoteApplying.current = true;
              lastSavedConfigJson.current = incomingJson;
              setConfigState(event.data.payload);
            }
          } else if (event.data?.type === 'SYNC_LEADS' && event.data.payload) {
            setLeads(event.data.payload);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (Date.now() - lastLocalEditTimestamp.current < 2000) return;

      if (e.key === STORAGE_KEY_CONFIG && e.newValue) {
        try {
          if (e.newValue !== lastSavedConfigJson.current) {
            const parsed = JSON.parse(e.newValue);
            isRemoteApplying.current = true;
            lastSavedConfigJson.current = e.newValue;
            setConfigState(parsed);
          }
        } catch (err) {
          console.error('Error parsing synced config from storage event:', err);
        }
      } else if (e.key === STORAGE_KEY_LEADS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLeads(parsed);
        } catch (err) {
          console.error('Error parsing synced leads from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  // Hostinger MySQL Initial Fetch Engine
  useEffect(() => {
    if (!isHostingerActive) return;

    fetchHostingerConfig().then((cloudCfg) => {
      if (cloudCfg) {
        setConfigState((prev) => {
          const merged: GymConfig = {
            ...prev,
            ...cloudCfg,
            spaServices: cloudCfg.spaServices && cloudCfg.spaServices.length > 0 ? cloudCfg.spaServices : (prev.spaServices || defaultSpaServices),
            cafe: {
              ...prev.cafe,
              ...(cloudCfg.cafe || {}),
              items: cloudCfg.cafe?.items && cloudCfg.cafe.items.length > 0 ? cloudCfg.cafe.items : prev.cafe?.items || defaultGymConfig.cafe.items,
            },
          };
          const mergedJson = JSON.stringify(merged);
          if (mergedJson === lastSavedConfigJson.current) {
            return prev;
          }
          isRemoteApplying.current = true;
          lastSavedConfigJson.current = mergedJson;
          return merged;
        });
        setIsCloudSynced(true);
        setCloudSyncStatus('synced');
      }
    });

    fetchHostingerLeads().then((cloudLeads) => {
      if (cloudLeads && cloudLeads.length > 0) {
        setLeads(cloudLeads);
      }
    });
  }, [hostingerConfig.apiUrl, hostingerConfig.apiKey, hostingerConfig.isEnabled]);

  // 3. Save config to local storage AND write to Firestore whenever config changes
  useEffect(() => {
    const configStr = JSON.stringify(config);

    // If change was ingested from remote cloud, do NOT echo-write back to cloud
    if (isRemoteApplying.current) {
      isRemoteApplying.current = false;
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, configStr);
      } catch (e) {}
      return;
    }

    lastSavedConfigJson.current = configStr;
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, configStr);
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apex_gym_sync_channel');
        bc.postMessage({ type: 'SYNC_CONFIG', payload: config, sender: tabInstanceId.current });
        bc.close();
      }
    } catch (err) {
      console.error('Error saving config to localStorage:', err);
    }

    // Debounced write to Firestore, Supabase & Hostinger only for real local edits
    isLocalUpdate.current = true;
    setCloudSyncStatus('saving');
    const timer = setTimeout(async () => {
      let supabaseSuccess = false;
      let hostingerSuccess = false;
      let firestoreSuccess = false;

      // Save to Supabase if enabled
      if (isSupabaseActive) {
        try {
          const res = await saveSupabaseConfig(config);
          if (res.success) supabaseSuccess = true;
        } catch (e) {
          console.warn('Supabase auto-save warning:', e);
        }
      }

      // Save to Hostinger MySQL if enabled
      if (isHostingerActive) {
        try {
          const res = await saveHostingerConfig(config);
          if (res.success) hostingerSuccess = true;
        } catch (e) {
          console.warn('Hostinger auto-save warning:', e);
        }
      }

      // Save to Firestore
      try {
        const configDocRef = doc(db, 'gym_config', FIRESTORE_CONFIG_DOC);
        await setDoc(configDocRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
        firestoreSuccess = true;
      } catch (error) {
        console.warn('Firestore auto-save warning:', error);
      }

      if (supabaseSuccess || hostingerSuccess || firestoreSuccess || (!isSupabaseActive && !isHostingerActive)) {
        setIsCloudSynced(true);
        setCloudSyncStatus('synced');
      } else {
        setCloudSyncStatus('offline');
      }

      isLocalUpdate.current = false;
    }, 400);

    return () => clearTimeout(timer);
  }, [config, isSupabaseActive, isHostingerActive]);

  // 4. Save leads to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apex_gym_sync_channel');
        bc.postMessage({ type: 'SYNC_LEADS', payload: leads, sender: tabInstanceId.current });
        bc.close();
      }
    } catch (err) {
      console.error('Error saving leads to localStorage:', err);
    }
  }, [leads]);

  const updateHostingerCredentials = (creds: Partial<HostingerDbConfig>) => {
    const updated = saveStoredHostingerCredentials(creds);
    if (updated) {
      setHostingerConfig(updated);
      setIsHostingerActive(Boolean(updated.isEnabled));
    }
  };

  const testHostingerDb = async () => {
    return await testHostingerConnection();
  };

  const updateSupabaseCredentials = (creds: Partial<SupabaseConfigSettings>) => {
    const updated = saveStoredSupabaseCredentials(creds);
    if (updated) {
      setSupabaseConfig(updated);
      setIsSupabaseActive(Boolean(updated.isEnabled && updated.url && updated.anonKey));
    }
  };

  const testSupabase = async () => {
    return await testSupabaseConnection();
  };

  const syncToCloudNow = async (): Promise<{
    success: boolean;
    message: string;
    supabaseSynced?: boolean;
    hostingerSynced?: boolean;
    firestoreSynced?: boolean;
    errorDetail?: string;
  }> => {
    setCloudSyncStatus('saving');
    let supabaseSuccess = false;
    let supabaseErrorMsg: string | undefined = undefined;
    let hostingerSuccess = false;
    let hostingerErrorMsg: string | undefined = undefined;
    let firestoreSuccess = false;
    let firestoreErrorMsg: string | undefined = undefined;

    // 1. Attempt Supabase
    if (isSupabaseActive) {
      try {
        const res = await saveSupabaseConfig(config);
        if (res.success) {
          supabaseSuccess = true;
          for (const lead of leads) {
            await saveSupabaseLead(lead);
          }
        } else {
          supabaseErrorMsg = res.error;
        }
      } catch (e: any) {
        supabaseErrorMsg = e?.message || 'Supabase write error';
      }
    }

    // 2. Attempt Hostinger MySQL
    if (isHostingerActive) {
      try {
        const res = await saveHostingerConfig(config);
        if (res.success) {
          hostingerSuccess = true;
          for (const lead of leads) {
            await saveHostingerLead(lead);
          }
        } else {
          hostingerErrorMsg = res.error;
        }
      } catch (e: any) {
        hostingerErrorMsg = e?.message || 'Hostinger write error';
      }
    }

    // 3. Attempt Firestore
    try {
      const configDocRef = doc(db, 'gym_config', FIRESTORE_CONFIG_DOC);
      await setDoc(configDocRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
      firestoreSuccess = true;
    } catch (e: any) {
      firestoreErrorMsg = e?.message || 'Firestore write error';
    }

    if (supabaseSuccess || hostingerSuccess || firestoreSuccess) {
      setIsCloudSynced(true);
      setCloudSyncStatus('synced');
      const destinations = [
        firestoreSuccess ? 'Firestore' : null,
        supabaseSuccess ? 'Supabase' : null,
        hostingerSuccess ? 'Hostinger MySQL' : null,
      ].filter(Boolean).join(' & ');

      return {
        success: true,
        message: `Live Cloud Synced to ${destinations} successfully!`,
        supabaseSynced: supabaseSuccess,
        hostingerSynced: hostingerSuccess,
        firestoreSynced: firestoreSuccess,
      };
    }

    // All failed
    setCloudSyncStatus('offline');
    const failureReason = hostingerErrorMsg || supabaseErrorMsg || firestoreErrorMsg || 'Connection error. Please verify your internet or database credentials.';
    return {
      success: false,
      message: `Cloud sync notice: ${failureReason}`,
      errorDetail: failureReason,
    };
  };


  // Helper to mark a local edit timestamp
  const markLocalEdit = () => {
    lastLocalEditTimestamp.current = Date.now();
    isLocalUpdate.current = true;
  };

  const updateConfig = (updater: Partial<GymConfig> | ((prev: GymConfig) => GymConfig)) => {
    markLocalEdit();
    if (typeof updater === 'function') {
      setConfigState((prev) => updater(prev));
    } else {
      setConfigState((prev) => ({ ...prev, ...updater }));
    }
  };

  const setThemeColor = (themeColor: ThemeColor) => {
    updateConfig({ themeColor });
  };

  // Plan Management
  const addPlan = (newPlan: SubscriptionPlan) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      plans: [...prev.plans, newPlan],
    }));
  };

  const updatePlan = (updatedPlan: SubscriptionPlan) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
    }));
  };

  const deletePlan = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      plans: prev.plans.filter((p) => p.id !== id),
    }));
  };

  // Trainer Management
  const addTrainer = (newTrainer: Trainer) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      trainers: [...prev.trainers, newTrainer],
    }));
  };

  const updateTrainer = (updatedTrainer: Trainer) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      trainers: prev.trainers.map((t) => (t.id === updatedTrainer.id ? updatedTrainer : t)),
    }));
  };

  const deleteTrainer = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      trainers: prev.trainers.filter((t) => t.id !== id),
    }));
  };

  // Classes Management
  const addClass = (newClass: GymClass) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
  };

  const updateClass = (updatedClass: GymClass) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)),
    }));
  };

  const deleteClass = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== id),
    }));
  };

  const reserveClassSpot = (id: string): boolean => {
    let success = false;
    markLocalEdit();
    setConfigState((prev) => {
      const cls = prev.classes.find((c) => c.id === id);
      if (cls && cls.reservedCount < cls.capacity) {
        success = true;
        return {
          ...prev,
          classes: prev.classes.map((c) =>
            c.id === id ? { ...c, reservedCount: c.reservedCount + 1 } : c
          ),
        };
      }
      return prev;
    });
    return success;
  };

  // Amenities Management
  const addAmenity = (newAmenity: GymAmenity) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      amenities: [...prev.amenities, newAmenity],
    }));
  };

  const updateAmenity = (updatedAmenity: GymAmenity) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      amenities: prev.amenities.map((a) => (a.id === updatedAmenity.id ? updatedAmenity : a)),
    }));
  };

  const deleteAmenity = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a.id !== id),
    }));
  };

  // Gallery Management
  const addGalleryItem = (newItem: GalleryItem) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      gallery: [...prev.gallery, newItem],
    }));
  };

  const updateGalleryItem = (updatedItem: GalleryItem) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      gallery: prev.gallery.map((g) => (g.id === updatedItem.id ? updatedItem : g)),
    }));
  };

  const deleteGalleryItem = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== id),
    }));
  };

  // Testimonial Management
  const addTestimonial = (newTestimonial: Testimonial) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial],
    }));
  };

  const updateTestimonial = (updatedTestimonial: Testimonial) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) => (t.id === updatedTestimonial.id ? updatedTestimonial : t)),
    }));
  };

  const deleteTestimonial = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  };

  // Video Reviews Management
  const addVideoReview = (newVideoReview: VideoReview) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      videoReviews: [...(prev.videoReviews || []), newVideoReview],
    }));
  };

  const updateVideoReview = (updatedVideoReview: VideoReview) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      videoReviews: (prev.videoReviews || defaultGymConfig.videoReviews || []).map((v) =>
        v.id === updatedVideoReview.id ? updatedVideoReview : v
      ),
    }));
  };

  const deleteVideoReview = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      videoReviews: (prev.videoReviews || defaultGymConfig.videoReviews || []).filter((v) => v.id !== id),
    }));
  };

  // FAQ Management
  const addFAQ = (newFaq: FAQ) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      faqs: [...prev.faqs, newFaq],
    }));
  };

  const updateFAQ = (updatedFaq: FAQ) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === updatedFaq.id ? updatedFaq : f)),
    }));
  };

  const deleteFAQ = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
  };

  // Cafe Management
  const addCafeItem = (newItem: CafeItem) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      cafe: {
        ...prev.cafe,
        items: [...(prev.cafe?.items || []), newItem],
      },
    }));
  };

  const updateCafeItem = (updatedItem: CafeItem) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      cafe: {
        ...prev.cafe,
        items: (prev.cafe?.items || []).map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
      },
    }));
  };

  const deleteCafeItem = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      cafe: {
        ...prev.cafe,
        items: (prev.cafe?.items || []).filter((item) => item.id !== id),
      },
    }));
  };

  const updateCafeConfig = (cafeConfig: Partial<CafeConfig>) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      cafe: {
        ...prev.cafe,
        ...cafeConfig,
      },
    }));
  };

  // Spa & Steam Management
  const addSpaService = (newItem: SpaServiceItem) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      spaServices: [...(prev.spaServices || defaultSpaServices), newItem],
    }));
  };

  const updateSpaService = (updatedItem: SpaServiceItem) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      spaServices: (prev.spaServices || defaultSpaServices).map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  };

  const deleteSpaService = (id: string) => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      spaServices: (prev.spaServices || defaultSpaServices).filter((item) => item.id !== id),
    }));
  };

  const resetSpaServices = () => {
    markLocalEdit();
    setConfigState((prev) => ({
      ...prev,
      spaServices: defaultSpaServices,
    }));
  };

  // Leads Management
  const addLead = (leadData: Omit<MemberLead, 'id' | 'createdAt' | 'status'>): string => {
    const newId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newLead: MemberLead = {
      ...leadData,
      id: newId,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);

    // Persist to Supabase, Hostinger & Firestore
    if (isSupabaseActive) {
      saveSupabaseLead(newLead).catch((err) => console.warn('Supabase lead write notice:', err));
    }
    if (isHostingerActive) {
      saveHostingerLead(newLead).catch((err) => console.warn('Hostinger lead write notice:', err));
    }
    try {
      const leadDocRef = doc(db, 'leads', newId);
      setDoc(leadDocRef, newLead).catch((err) => console.warn('Could not write lead to Firestore:', err));
    } catch (e) {
      console.warn('Lead Firestore write exception:', e);
    }

    return newId;
  };

  const updateLeadStatus = (id: string, status: MemberLead['status']) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    const targetLead = leads.find((l) => l.id === id);
    if (targetLead && isSupabaseActive) {
      saveSupabaseLead({ ...targetLead, status }).catch((err) => console.warn('Supabase updateLead notice:', err));
    }
    if (targetLead && isHostingerActive) {
      saveHostingerLead({ ...targetLead, status }).catch((err) => console.warn('Hostinger updateLead notice:', err));
    }
    try {
      const leadDocRef = doc(db, 'leads', id);
      updateDoc(leadDocRef, { status }).catch((err) => console.warn('Could not update lead in Firestore:', err));
    } catch (e) {
      console.warn('Lead Firestore update exception:', e);
    }
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    const client = getSupabaseClient();
    if (client && isSupabaseActive) {
      Promise.resolve(client.from('gym_leads').delete().eq('id', id)).catch((err) => console.warn('Supabase delete lead note:', err));
    }
    try {
      const leadDocRef = doc(db, 'leads', id);
      deleteDoc(leadDocRef).catch((err) => console.warn('Could not delete lead from Firestore:', err));
    } catch (e) {
      console.warn('Lead Firestore delete exception:', e);
    }
  };

  const clearAllLeads = () => {
    setLeads([]);
  };

  // Reset to default
  const resetToDefaults = () => {
    setConfigState(defaultGymConfig);
    setLeads(sampleInitialLeads);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    localStorage.removeItem(STORAGE_KEY_LEADS);
  };

  // Export JSON
  const exportConfigJson = () => {
    return JSON.stringify(config, null, 2);
  };

  // Import JSON
  const importConfigJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.name || !parsed.plans || !parsed.trainers) {
        return { success: false, message: 'Invalid configuration format. Missing required fields.' };
      }
      setConfigState({ ...defaultGymConfig, ...parsed });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'JSON parsing error' };
    }
  };

  return (
    <GymContext.Provider
      value={{
        config,
        leads,
        themeColor: config.themeColor,
        isAdminOpen,
        setIsAdminOpen,
        adminTab,
        setAdminTab,
        selectedPlanForModal,
        setSelectedPlanForModal,
        selectedTrainerForModal,
        setSelectedTrainerForModal,
        selectedClassForModal,
        setSelectedClassForModal,
        isTrialModalOpen,
        setIsTrialModalOpen,
        isAIModalOpen,
        setIsAIModalOpen,
        isReceiptPortalOpen,
        setIsReceiptPortalOpen,
        updateConfig,
        setThemeColor,
        addPlan,
        updatePlan,
        deletePlan,
        addTrainer,
        updateTrainer,
        deleteTrainer,
        addClass,
        updateClass,
        deleteClass,
        reserveClassSpot,
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
        addFAQ,
        updateFAQ,
        deleteFAQ,
        addSpaService,
        updateSpaService,
        deleteSpaService,
        resetSpaServices,
        addCafeItem,
        updateCafeItem,
        deleteCafeItem,
        updateCafeConfig,
        addLead,
        updateLeadStatus,
        deleteLead,
        clearAllLeads,
        resetToDefaults,
        exportConfigJson,
        importConfigJson,
        isCloudSynced,
        cloudSyncStatus,
        syncToCloudNow,
        hostingerConfig,
        updateHostingerCredentials,
        testHostingerDb,
        isHostingerActive,
        supabaseConfig,
        updateSupabaseCredentials,
        testSupabase,
        isSupabaseActive,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </GymContext.Provider>
  );

};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
