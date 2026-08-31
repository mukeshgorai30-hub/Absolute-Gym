import React, { useState, useEffect } from 'react';
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
  Download,
  Server,
  FileCode2,
  HardDrive,
  UploadCloud,
  FileText,
  Lock,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import {
  HOSTINGER_MYSQL_SETUP_SCRIPT,
  HOSTINGER_PHP_BACKEND_SCRIPT,
  getStoredHostingerCredentials,
  saveStoredHostingerCredentials,
  testHostingerConnection,
  fetchHostingerConfig,
  saveHostingerConfig,
  DEFAULT_HOSTINGER_ENDPOINT,
} from '../../hostingerDb';

interface HostingerManagerTabProps {
  onNotify: (msg: string) => void;
}

export const HostingerManagerTab: React.FC<HostingerManagerTabProps> = ({ onNotify }) => {
  const { config, leads, themeColor, syncToCloudNow } = useGym();

  const [creds, setCreds] = useState(getStoredHostingerCredentials());
  const [endpointInput, setEndpointInput] = useState(creds.endpointUrl || DEFAULT_HOSTINGER_ENDPOINT);
  const [apiKeyInput, setApiKeyInput] = useState(creds.apiKey || '');
  const [isEnabledInput, setIsEnabledInput] = useState(creds.isEnabled);
  const [dbHostInput, setDbHostInput] = useState(creds.dbHost || 'localhost');
  const [dbNameInput, setDbNameInput] = useState(creds.dbName || '');
  const [dbUserInput, setDbUserInput] = useState(creds.dbUser || '');
  const [dbPassInput, setDbPassInput] = useState('');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists: boolean;
    version?: string;
  } | null>(null);

  const [isPushingData, setIsPushingData] = useState(false);
  const [isPullingData, setIsPullingData] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);

  const handleSaveAndTest = async () => {
    const updated = saveStoredHostingerCredentials({
      endpointUrl: endpointInput.trim(),
      apiKey: apiKeyInput.trim(),
      isEnabled: isEnabledInput,
      dbHost: dbHostInput.trim(),
      dbName: dbNameInput.trim(),
      dbUser: dbUserInput.trim(),
    });
    setCreds(updated);

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testHostingerConnection(endpointInput.trim(), apiKeyInput.trim());
      setTestResult(result);
      if (result.success) {
        onNotify('Hostinger MySQL Database connected successfully!');
      } else {
        onNotify('Hostinger Database check failed. Please see details below.');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to connect to Hostinger API.',
        tableExists: false,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushAllData = async () => {
    setIsPushingData(true);
    try {
      const res = await saveHostingerConfig(config, endpointInput.trim(), apiKeyInput.trim());
      if (res.success) {
        onNotify('All Gym CMS configuration successfully pushed to Hostinger MySQL!');
      } else {
        onNotify(`Push failed: ${res.error || 'Check Hostinger API endpoint.'}`);
      }
    } finally {
      setIsPushingData(false);
    }
  };

  const handlePullData = async () => {
    setIsPullingData(true);
    try {
      const remoteConfig = await fetchHostingerConfig(endpointInput.trim(), apiKeyInput.trim());
      if (remoteConfig) {
        onNotify('Configuration successfully pulled from Hostinger MySQL!');
      } else {
        onNotify('No existing configuration found on Hostinger MySQL.');
      }
    } finally {
      setIsPullingData(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(HOSTINGER_MYSQL_SETUP_SCRIPT);
    setCopiedSql(true);
    onNotify('Hostinger MySQL SQL setup script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Generate PHP with pre-filled DB credentials
  const getCustomPhpScript = () => {
    let script = HOSTINGER_PHP_BACKEND_SCRIPT;
    if (dbHostInput) script = script.replace("define('DB_HOST', 'localhost');", `define('DB_HOST', '${dbHostInput}');`);
    if (dbNameInput) script = script.replace("define('DB_NAME', 'u123456789_gymdb');", `define('DB_NAME', '${dbNameInput}');`);
    if (dbUserInput) script = script.replace("define('DB_USER', 'u123456789_gymuser');", `define('DB_USER', '${dbUserInput}');`);
    if (dbPassInput) script = script.replace("define('DB_PASS', 'YourSecurePasswordHere123!');", `define('DB_PASS', '${dbPassInput}');`);
    if (apiKeyInput) script = script.replace("define('API_SECRET_KEY', '');", `define('API_SECRET_KEY', '${apiKeyInput}');`);
    return script;
  };

  const handleCopyPhp = () => {
    navigator.clipboard.writeText(getCustomPhpScript());
    setCopiedPhp(true);
    onNotify('Hostinger hostinger-api.php script copied to clipboard!');
    setTimeout(() => setCopiedPhp(false), 3000);
  };

  const handleDownloadPhp = () => {
    const element = document.createElement('a');
    const file = new Blob([getCustomPhpScript()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'hostinger-api.php';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onNotify('Downloaded hostinger-api.php! Upload this into your public_html/api/ folder on Hostinger.');
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([HOSTINGER_MYSQL_SETUP_SCRIPT], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'hostinger-mysql-setup.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onNotify('Downloaded hostinger-mysql-setup.sql! Import this via phpMyAdmin on Hostinger.');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <HardDrive className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  Hostinger MySQL Database Integration
                </h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                    creds.isEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {creds.isEnabled ? 'Active in CMS' : 'Ready to Connect'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Connect your website directly to your <strong>Hostinger Web Hosting MySQL Database</strong>. Manage subscription packages, trainers, classes, cafe items, and customer leads securely with your Hostinger account.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSaveAndTest}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Test Result Box */}
      {testResult && (
        <div
          className={`p-5 rounded-2xl border flex items-start gap-3 transition-all ${
            testResult.success
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/30 border-red-500/40 text-red-200'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-black uppercase text-sm">
              {testResult.success ? 'Hostinger Database Connected!' : 'Connection Check Failed'}
            </div>
            <p className="opacity-90">{testResult.message}</p>
            {testResult.version && (
              <p className="text-[11px] text-emerald-300">Server MySQL Version: {testResult.version}</p>
            )}
          </div>
        </div>
      )}

      {/* 4-STEP HOSTINGER SETUP WIZARD */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-black uppercase text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500 text-black text-xs font-black flex items-center justify-center">
              1
            </span>
            <span>Step-by-Step Hostinger Database Setup</span>
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Follow these 4 simple steps to connect your Hostinger MySQL database in less than 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* STEP 1 */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                Step 1: Hostinger hPanel
              </span>
              <a
                href="https://hpanel.hostinger.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition"
              >
                <span>Open hPanel</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h5 className="text-sm font-bold text-white uppercase">Create MySQL Database</h5>
            <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Log in to your <strong>Hostinger hPanel</strong>.</li>
              <li>Go to <strong>Databases &gt; Management</strong>.</li>
              <li>Under <em>Create a New MySQL Database and Database User</em>, enter a database name, username, and password.</li>
              <li>Click <strong>Create</strong> and note down your database credentials.</li>
            </ol>
          </div>

          {/* STEP 2 */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Step 2: phpMyAdmin Schema
              </span>
              <button
                onClick={handleCopySql}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <h5 className="text-sm font-bold text-white uppercase">Run SQL Tables Script</h5>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Click <strong>Enter phpMyAdmin</strong> in Hostinger next to your newly created database, open the <strong>SQL</strong> tab, and paste the script:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy SQL</span>
              </button>
              <button
                onClick={handleDownloadSql}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download .SQL File</span>
              </button>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Step 3: Upload API Script to Hostinger
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPhp}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  {copiedPhp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhp ? 'Copied PHP!' : 'Copy PHP Script'}</span>
                </button>
                <button
                  onClick={handleDownloadPhp}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download hostinger-api.php</span>
                </button>
              </div>
            </div>

            <h5 className="text-sm font-bold text-white uppercase">Upload PHP API File to public_html/api/</h5>
            <p className="text-xs text-neutral-300 leading-relaxed">
              In Hostinger <strong>File Manager</strong>, inside <code className="text-amber-300">public_html/</code>, create a folder named <code className="text-amber-300">api</code> and upload <code className="text-emerald-300 font-bold">hostinger-api.php</code> into it.
            </p>

            {/* Quick Credential Injector for PHP download */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Host</label>
                <input
                  type="text"
                  value={dbHostInput}
                  onChange={(e) => setDbHostInput(e.target.value)}
                  placeholder="localhost"
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Database Name</label>
                <input
                  type="text"
                  value={dbNameInput}
                  onChange={(e) => setDbNameInput(e.target.value)}
                  placeholder="u123456_gym"
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Database User</label>
                <input
                  type="text"
                  value={dbUserInput}
                  onChange={(e) => setDbUserInput(e.target.value)}
                  placeholder="u123456_gymuser"
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Database Password</label>
                <input
                  type="password"
                  value={dbPassInput}
                  onChange={(e) => setDbPassInput(e.target.value)}
                  placeholder="Password"
                  className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: CONFIGURATION & LIVE SYNC TOGGLE */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h4 className="text-lg font-black uppercase text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500 text-black text-xs font-black flex items-center justify-center">
              2
            </span>
            <span>Hostinger API Endpoint Settings</span>
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Specify where the Hostinger PHP API is located on your domain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
              Hostinger API Endpoint URL
            </label>
            <input
              type="text"
              value={endpointInput}
              onChange={(e) => setEndpointInput(e.target.value)}
              placeholder="/api/hostinger-api.php or https://yourdomain.com/api/hostinger-api.php"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Use relative <code className="text-neutral-400">/api/hostinger-api.php</code> if hosted on the same domain, or full URL.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1.5">
              Secret API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Leave empty if not enabled in PHP script"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Optional authorization key for additional security.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enable-hostinger-sync"
              checked={isEnabledInput}
              onChange={(e) => setIsEnabledInput(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-neutral-900 border-neutral-700 cursor-pointer"
            />
            <label htmlFor="enable-hostinger-sync" className="cursor-pointer">
              <div className="text-xs font-bold uppercase text-white">
                Enable Hostinger MySQL Live Auto-Sync
              </div>
              <div className="text-[11px] text-neutral-400">
                Automatically saves any CMS modifications and member inquiries to your Hostinger MySQL database.
              </div>
            </label>
          </div>

          <button
            onClick={handleSaveAndTest}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md shrink-0"
          >
            Save Settings & Test
          </button>
        </div>
      </div>

      {/* DATA MIGRATION TOOLS */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h4 className="text-lg font-black uppercase text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500 text-black text-xs font-black flex items-center justify-center">
              3
            </span>
            <span>Manual Data Migration & Sync</span>
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Push your website configuration to Hostinger MySQL or pull existing data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <UploadCloud className="w-5 h-5" />
              <h5 className="text-sm font-bold uppercase text-white">Push to Hostinger Database</h5>
            </div>
            <p className="text-xs text-neutral-400">
              Uploads all current subscription packages ({config.plans.length}), trainers ({config.trainers.length}), classes ({config.classes.length}), and cafe items to your Hostinger MySQL database.
            </p>
            <button
              onClick={handlePushAllData}
              disabled={isPushingData}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPushingData ? 'animate-spin' : ''}`} />
              <span>{isPushingData ? 'Pushing Data...' : 'Push All Data to Hostinger MySQL'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Download className="w-5 h-5" />
              <h5 className="text-sm font-bold uppercase text-white">Pull from Hostinger Database</h5>
            </div>
            <p className="text-xs text-neutral-400">
              Retrieves the latest configuration stored in your Hostinger MySQL database and updates the current live preview.
            </p>
            <button
              onClick={handlePullData}
              disabled={isPullingData}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPullingData ? 'animate-spin' : ''}`} />
              <span>{isPullingData ? 'Pulling Data...' : 'Pull Data from Hostinger MySQL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
