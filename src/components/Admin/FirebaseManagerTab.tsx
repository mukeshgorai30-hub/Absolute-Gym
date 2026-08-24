import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import {
  firebaseConfig,
  testFirestoreConnection,
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from '../../firebase';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Cloud,
  ShieldCheck,
  Download,
  Upload,
  Layers,
  Sparkles,
  Zap,
  Activity,
  FileJson,
  Users,
  Copy,
  Check,
} from 'lucide-react';

export const FirebaseManagerTab: React.FC = () => {
  const {
    config,
    leads,
    themeColor,
    isCloudSynced,
    cloudSyncStatus,
    syncToCloudNow,
    exportConfigJson,
  } = useGym();
  const theme = themeStyles[themeColor];

  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    loading?: boolean;
    timestamp?: string;
  }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPushingCloud, setIsPushingCloud] = useState(false);
  const [stats, setStats] = useState({
    plansCount: config.plans.length,
    trainersCount: config.trainers.length,
    classesCount: config.classes.length,
    leadsCount: leads.length,
    cafeItemsCount: config.cafe?.items?.length || 0,
    spaServicesCount: config.spaServices?.length || 0,
    faqsCount: config.faqs?.length || 0,
  });

  useEffect(() => {
    setStats({
      plansCount: config.plans.length,
      trainersCount: config.trainers.length,
      classesCount: config.classes.length,
      leadsCount: leads.length,
      cafeItemsCount: config.cafe?.items?.length || 0,
      spaServicesCount: config.spaServices?.length || 0,
      faqsCount: config.faqs?.length || 0,
    });
  }, [config, leads]);

  const handleTestConnection = async () => {
    setTestResult({ loading: true });
    try {
      const result = await testFirestoreConnection();
      setTestResult({
        success: result.success,
        message: result.message,
        loading: false,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Firestore connection check failed.',
        loading: false,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleManualPush = async () => {
    setIsPushingCloud(true);
    try {
      const res = await syncToCloudNow();
      setTestResult({
        success: res.success,
        message: res.message,
        loading: false,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsPushingCloud(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  Firebase Cloud Backend
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  Firestore Connected
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                Persistent cloud storage powered by Google Cloud Firestore. Gym configurations, schedules, membership packages, and lead inquiries are securely synced and saved in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testResult.loading}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition flex items-center gap-2 shadow-lg shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testResult.loading ? 'animate-spin' : ''}`} />
            <span>{testResult.loading ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* Connection Diagnostics output */}
        {testResult.message && (
          <div
            className={`mt-5 p-4 rounded-2xl border text-xs flex items-center gap-3 transition-all ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-bold">{testResult.message}</p>
              {testResult.timestamp && (
                <span className="text-[10px] opacity-70">Checked at {testResult.timestamp}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Credentials & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Project & Database Specs */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Project Configuration</span>
            </h4>
            <span className="text-[10px] text-neutral-500 uppercase font-bold">Cloud Run Applet</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">Firebase Project ID</span>
              <div className="flex items-center justify-between mt-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-neutral-300">
                <span className="truncate">{firebaseConfig.projectId}</span>
                <button
                  onClick={() => handleCopy(firebaseConfig.projectId, 'pid')}
                  className="p-1 hover:text-white text-neutral-500"
                >
                  {copiedKey === 'pid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">Firestore Database ID</span>
              <div className="flex items-center justify-between mt-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-neutral-300">
                <span className="truncate">{firebaseConfig.firestoreDatabaseId}</span>
                <button
                  onClick={() => handleCopy(firebaseConfig.firestoreDatabaseId, 'dbid')}
                  className="p-1 hover:text-white text-neutral-500"
                >
                  {copiedKey === 'dbid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">Auth Domain</span>
              <div className="flex items-center justify-between mt-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-neutral-300">
                <span className="truncate">{firebaseConfig.authDomain}</span>
                <button
                  onClick={() => handleCopy(firebaseConfig.authDomain, 'auth')}
                  className="p-1 hover:text-white text-neutral-500"
                >
                  {copiedKey === 'auth' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time State & Live Collections */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Live Database Collections</span>
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Realtime Listener Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">gym_config</span>
              <span className="text-lg font-black text-amber-400">1 Doc</span>
              <span className="text-[9px] text-neutral-500 block">Main Config</span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">leads</span>
              <span className="text-lg font-black text-emerald-400">{stats.leadsCount} Docs</span>
              <span className="text-[9px] text-neutral-500 block">Member Enquiries</span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">classes</span>
              <span className="text-lg font-black text-cyan-400">{stats.classesCount} Slots</span>
              <span className="text-[9px] text-neutral-500 block">Yoga & Zumba</span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">plans</span>
              <span className="text-lg font-black text-indigo-400">{stats.plansCount} Pkgs</span>
              <span className="text-[9px] text-neutral-500 block">Pricing Models</span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">coaches</span>
              <span className="text-lg font-black text-purple-400">{stats.trainersCount} Pros</span>
              <span className="text-[9px] text-neutral-500 block">Trainers</span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">cafe & spa</span>
              <span className="text-lg font-black text-pink-400">{stats.cafeItemsCount + stats.spaServicesCount} Items</span>
              <span className="text-[9px] text-neutral-500 block">Fuel Bar & Spa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Actions Banner */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 shadow-xl">
        <h4 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Cloud Sync & Backup Controls</span>
        </h4>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleManualPush}
            disabled={isPushingCloud}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-xs transition flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Upload className={`w-4 h-4 ${isPushingCloud ? 'animate-bounce' : ''}`} />
            <span>{isPushingCloud ? 'Syncing to Firestore...' : 'Force Sync to Firestore Now'}</span>
          </button>

          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportConfigJson());
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `firebase_gym_backup_${new Date().toISOString().slice(0, 10)}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-wider text-xs transition flex items-center gap-2 border border-neutral-700"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Cloud Snapshot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
