import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Key,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { SUPABASE_SQL_SETUP_SCRIPT } from '../../supabase';

interface SupabaseManagerTabProps {
  onNotify: (msg: string) => void;
}

export const SupabaseManagerTab: React.FC<SupabaseManagerTabProps> = ({ onNotify }) => {
  const {
    config,
    supabaseConfig,
    updateSupabaseCredentials,
    testSupabase,
    isSupabaseActive,
    syncToCloudNow,
  } = useGym();

  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [anonKeyInput, setAnonKeyInput] = useState(supabaseConfig.anonKey || '');
  const [isEnabledInput, setIsEnabledInput] = useState(supabaseConfig.isEnabled);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists: boolean;
  } | null>(null);

  const [isPushingData, setIsPushingData] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveAndTest = async () => {
    updateSupabaseCredentials({
      url: urlInput.trim(),
      anonKey: anonKeyInput.trim(),
      isEnabled: isEnabledInput,
    });

    setIsTesting(true);
    setTestResult(null);

    // Give state a tick to settle and test
    setTimeout(async () => {
      try {
        const result = await testSupabase();
        setTestResult(result);
        if (result.success && result.tableExists) {
          onNotify('Supabase connected successfully! Real-time sync is active.');
        } else if (result.success && !result.tableExists) {
          onNotify('Supabase connected! Please run the SQL table creation script.');
        } else {
          onNotify('Supabase connection failed. Check your URL & Key.');
        }
      } catch (err: any) {
        setTestResult({
          success: false,
          message: err?.message || 'Failed to connect to Supabase.',
          tableExists: false,
        });
      } finally {
        setIsTesting(false);
      }
    }, 200);
  };

  const handlePushAllData = async () => {
    setIsPushingData(true);
    try {
      const result = await syncToCloudNow();
      if (result.success) {
        onNotify(result.message);
      } else {
        onNotify(result.message || 'Cloud sync failed. Check Supabase connection settings.');
      }
    } finally {
      setIsPushingData(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    onNotify('Supabase SQL setup script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>Supabase Backend & Global Real-time Sync</span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase border ${
                  isSupabaseActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                {isSupabaseActive ? 'CONNECTED & ACTIVE' : 'SETUP REQUIRED'}
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Connect your Supabase project so changes in this Admin CMS sync instantly across all devices, mobile phones, and Netlify visitors in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-4 h-4 rounded-full mt-1 shrink-0 ${
                isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'
              }`}
            />
            <div>
              <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <span>Real-Time Replication Engine</span>
                {isSupabaseActive && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Broadcasting
                  </span>
                )}
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isSupabaseActive
                  ? 'All changes made in this admin panel will automatically update the mobile website and all visitors worldwide without refreshing the page.'
                  : 'Supabase allows you to host the live database for free, giving you 100% instant updates on Netlify, Vercel, and mobile devices.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePushAllData}
              disabled={isPushingData}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPushingData ? 'animate-spin' : ''}`} />
              <span>{isPushingData ? 'Pushing...' : 'Push All Data Now'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs font-bold border flex items-start gap-2.5 ${
              testResult.success
                ? testResult.tableExists
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-extrabold">{testResult.message}</div>
              {!testResult.tableExists && testResult.success && (
                <div className="mt-1 font-normal text-[11px] text-amber-200">
                  Copy and execute the SQL script in Step 2 below in your Supabase SQL editor to create the database tables.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Configuration Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Step 1: Enter Supabase Credentials</span>
          </h4>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          In your Supabase project dashboard, go to <strong className="text-neutral-200">Project Settings &gt; API</strong> and copy your Project URL and Anon Public Key.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzabcdefgh.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKeyInput}
              onChange={(e) => setAnonKeyInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-800">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabledInput}
              onChange={(e) => setIsEnabledInput(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-950 border-neutral-800"
            />
            <span className="text-xs font-bold text-neutral-300">
              Enable Supabase Real-Time Backend
            </span>
          </label>

          <button
            onClick={handleSaveAndTest}
            disabled={isTesting}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing Connection...' : 'Save & Test Connection'}</span>
          </button>
        </div>
      </div>

      {/* Step 2: SQL Table Creation Script */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Step 2: Initialize Database Tables (1-Click SQL)</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              Run this script once in your Supabase SQL editor to create the <code className="text-emerald-400">gym_config</code> and <code className="text-emerald-400">gym_leads</code> tables with Realtime sync enabled.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition border border-neutral-700"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-56 leading-relaxed">
            {SUPABASE_SQL_SETUP_SCRIPT}
          </pre>
        </div>

        <div className="text-xs text-neutral-400 flex items-center gap-2">
          <span>💡 Tip: Paste into</span>
          <a
            href="https://supabase.com/dashboard/project/_/sql"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Supabase SQL Editor</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>and click <strong>Run</strong>.</span>
        </div>
      </div>

      {/* Step 3: Netlify Deployment Instructions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <h4 className="text-base font-black uppercase text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Step 3: Setup Environment Variables in Netlify</span>
        </h4>
        <p className="text-xs text-neutral-400 leading-relaxed">
          When you deploy your site from GitHub to Netlify, add these two environment variables in Netlify so the live public website and mobile browsers can connect directly to your Supabase realtime backend:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 font-mono text-xs text-neutral-300">
            <div className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Variable Name 1</div>
            <div className="text-emerald-400 font-bold">VITE_SUPABASE_URL</div>
            <div className="text-[11px] text-neutral-500 truncate mt-1">Value: {urlInput || 'https://your-project.supabase.co'}</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 font-mono text-xs text-neutral-300">
            <div className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Variable Name 2</div>
            <div className="text-emerald-400 font-bold">VITE_SUPABASE_ANON_KEY</div>
            <div className="text-[11px] text-neutral-500 truncate mt-1">Value: {anonKeyInput ? '••••••••••••••••••••' : 'your-anon-public-key'}</div>
          </div>
        </div>

        <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-300 space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>How to add them in Netlify:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] pl-1">
            <li>Go to <strong className="text-neutral-200">Netlify Dashboard</strong> &gt; Select your site &gt; <strong className="text-neutral-200">Site Configuration</strong></li>
            <li>Click on <strong className="text-neutral-200">Environment variables</strong> in the left sidebar</li>
            <li>Click <strong className="text-neutral-200">Add a variable</strong> and enter <code className="text-emerald-400">VITE_SUPABASE_URL</code> and <code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code></li>
            <li>Click <strong className="text-neutral-200">Deploys &gt; Trigger deploy &gt; Clear cache and deploy site</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
};
