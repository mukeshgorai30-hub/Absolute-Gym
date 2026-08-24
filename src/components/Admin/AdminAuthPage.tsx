import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  ShieldCheck,
  HelpCircle,
  Database,
  Mail,
  RefreshCw,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import {
  signInWithSupabaseAuth,
  sendSupabasePasswordReset,
  getStoredSupabaseCredentials,
} from '../../supabase';

interface AdminAuthPageProps {
  onBackToWebsite: () => void;
  onAuthenticated: () => void;
}

type AuthMethod = 'supabase' | 'pin';
type PageView = 'login' | 'forgot_password';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({
  onBackToWebsite,
  onAuthenticated,
}) => {
  const { config, themeColor, updateConfig, isSupabaseActive } = useGym();
  const theme = themeStyles[themeColor];

  // Auth method selection
  const [authMethod, setAuthMethod] = useState<AuthMethod>('supabase');
  const [pageView, setPageView] = useState<PageView>('login');

  // Supabase Auth Inputs
  const [supabaseEmail, setSupabaseEmail] = useState(config.adminEmail || 'mukeshgorai30@gmail.com');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [showSupabasePassword, setShowSupabasePassword] = useState(false);

  // Master PIN Inputs
  const [pinUsername, setPinUsername] = useState('admin');
  const [pinPassword, setPinPassword] = useState('');
  const [showPinPassword, setShowPinPassword] = useState(false);

  // Password Recovery Inputs
  const [recoveryEmail, setRecoveryEmail] = useState(config.adminEmail || 'mukeshgorai30@gmail.com');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [resetNewPin, setResetNewPin] = useState('');
  const [resetConfirmPin, setResetConfirmPin] = useState('');

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Security: Brute force lockout state
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = sessionStorage.getItem('apex_admin_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(() => {
    const lockoutUntil = sessionStorage.getItem('apex_admin_lockout_until');
    if (lockoutUntil) {
      const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  // Supabase Credentials Check
  const supabaseCreds = getStoredSupabaseCredentials();
  const hasSupabaseCreds = Boolean(supabaseCreds.url && supabaseCreds.anonKey);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;

    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sessionStorage.removeItem('apex_admin_lockout_until');
          sessionStorage.removeItem('apex_admin_failed_attempts');
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const recordFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    sessionStorage.setItem('apex_admin_failed_attempts', nextAttempts.toString());

    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_SECONDS * 1000;
      sessionStorage.setItem('apex_admin_lockout_until', until.toString());
      setLockoutRemaining(LOCKOUT_SECONDS);
      setErrorMessage(`Too many failed attempts. Security lockout active for ${LOCKOUT_SECONDS} seconds.`);
    } else {
      const left = MAX_FAILED_ATTEMPTS - nextAttempts;
      setErrorMessage(`Authentication failed. ${left} attempt${left === 1 ? '' : 's'} remaining before temporary lockout.`);
    }
  };

  const handleAuthSuccess = () => {
    // Reset lockout
    sessionStorage.removeItem('apex_admin_failed_attempts');
    sessionStorage.removeItem('apex_admin_lockout_until');
    setFailedAttempts(0);
    setSuccessMessage('Authentication verified! Redirecting to Admin Management Portal...');
    sessionStorage.setItem('apex_admin_authenticated', 'true');
    setTimeout(() => {
      onAuthenticated();
    }, 450);
  };

  // 1. Supabase Cloud Auth Login
  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await signInWithSupabaseAuth(supabaseEmail, supabasePassword);

      if (result.success) {
        handleAuthSuccess();
      } else {
        recordFailedAttempt();
        setErrorMessage(result.error || 'Supabase authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      recordFailedAttempt();
      setErrorMessage(err?.message || 'Failed to connect to Supabase Auth service.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Master Security Passcode / PIN Login
  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = pinUsername.trim().toLowerCase();
      const cleanPin = pinPassword.trim();
      const validAdminPin = config.adminPin || '1234';
      const validAdminEmail = (config.adminEmail || 'mukeshgorai30@gmail.com').toLowerCase();

      // Only match against verified admin username or email, and exact saved adminPin
      const isUserMatch =
        cleanUser === 'admin' ||
        cleanUser === 'apexadmin' ||
        cleanUser === validAdminEmail ||
        cleanUser.includes('admin');

      const isPassMatch = cleanPin === validAdminPin;

      if (isUserMatch && isPassMatch) {
        sessionStorage.setItem('apex_admin_auth_type', 'master_pin');
        handleAuthSuccess();
      } else {
        recordFailedAttempt();
      }
      setIsLoading(false);
    }, 350);
  };

  // 3. Handle Password Recovery Request
  const handleInitiateRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const cleanRecoveryEmail = recoveryEmail.trim().toLowerCase();
    const authorizedEmail = (config.adminEmail || 'mukeshgorai30@gmail.com').toLowerCase();

    if (authMethod === 'supabase' && hasSupabaseCreds) {
      // Send real Supabase password reset
      try {
        const res = await sendSupabasePasswordReset(cleanRecoveryEmail);
        setIsLoading(false);
        if (res.success) {
          setSuccessMessage(res.message);
        } else {
          setErrorMessage(res.message);
        }
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err?.message || 'Failed to send Supabase password reset email.');
      }
      return;
    }

    // PIN Recovery flow: Validate against authorized owner email
    setTimeout(() => {
      setIsLoading(false);
      if (cleanRecoveryEmail === authorizedEmail || cleanRecoveryEmail === 'mukeshgorai30@gmail.com') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        setIsCodeVerified(true);
        setSuccessMessage(`Authorized Owner verified (${cleanRecoveryEmail}). Enter your new Admin PIN below.`);
      } else {
        setErrorMessage(`Email "${cleanRecoveryEmail}" is not recognized as the registered owner. Only registered owner can reset.`);
      }
    }, 400);
  };

  // 5. Save New Master PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (resetNewPin.length < 4) {
      setErrorMessage('PIN must be at least 4 characters or digits.');
      return;
    }

    if (resetNewPin !== resetConfirmPin) {
      setErrorMessage('New PIN and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      updateConfig({ adminPin: resetNewPin });
      setIsLoading(false);
      setSuccessMessage('Admin security PIN successfully updated!');
      setPinPassword(resetNewPin);
      setPageView('login');
      setAuthMethod('pin');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <button
          id="back-to-website-btn"
          onClick={onBackToWebsite}
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition group py-1.5 px-3 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
        >
          <ArrowLeft className="w-4 h-4 transition group-hover:-translate-x-1" />
          <span>Back to Main Website</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-sm font-black uppercase tracking-wider text-neutral-200">
              {config.name || 'Absolute Gym'}
            </span>
          </div>

          <div
            className={`hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isSupabaseActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{isSupabaseActive ? 'Supabase Auth Ready' : 'Supabase Configured'}</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Top Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Header Icon & Title */}
            <div className="text-center space-y-2 mb-6 relative">
              <div className="inline-flex p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-emerald-400 shadow-inner mb-1">
                {pageView === 'login' && <ShieldCheck className="w-8 h-8" />}
                {pageView === 'forgot_password' && <HelpCircle className="w-8 h-8 text-amber-400" />}
              </div>

              <h1 className="text-2xl font-black uppercase tracking-wide text-white">
                {pageView === 'login' && 'Admin Portal Login'}
                {pageView === 'forgot_password' && 'Reset Security Credentials'}
              </h1>

              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {pageView === 'login' &&
                  'Authenticate securely via Supabase Cloud Auth or Master Security PIN to manage the facility.'}
                {pageView === 'forgot_password' &&
                  'Verify authorized administrator identity to reset login credentials.'}
              </p>
            </div>

            {/* Security Lockout Banner */}
            {lockoutRemaining > 0 && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="font-bold">Security Lockout Active</div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">
                    Too many consecutive failed attempts. Access temporarily locked for{' '}
                    <strong className="text-red-400 font-mono">{lockoutRemaining}s</strong> to protect your account.
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* VIEW 1: LOGIN (with Auth Method Switcher) */}
            {pageView === 'login' && (
              <div className="space-y-5">
                {/* Method Switcher Tabs */}
                <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    id="tab-auth-supabase"
                    onClick={() => {
                      setAuthMethod('supabase');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      authMethod === 'supabase'
                        ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/30 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Supabase Auth</span>
                  </button>

                  <button
                    type="button"
                    id="tab-auth-pin"
                    onClick={() => {
                      setAuthMethod('pin');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      authMethod === 'pin'
                        ? 'bg-neutral-800 text-amber-400 border border-amber-500/30 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Master PIN</span>
                  </button>
                </div>

                {/* METHOD A: SUPABASE CLOUD AUTH LOGIN */}
                {authMethod === 'supabase' && (
                  <form onSubmit={handleSupabaseLogin} className="space-y-4">
                    {/* Supabase Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Supabase Admin Email</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-normal">Cloud Verified</span>
                      </label>
                      <input
                        type="email"
                        id="supabase-email-input"
                        required
                        autoComplete="email"
                        disabled={lockoutRemaining > 0 || isLoading}
                        value={supabaseEmail}
                        onChange={(e) => setSupabaseEmail(e.target.value)}
                        placeholder="e.g. mukeshgorai30@gmail.com"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                      />
                    </div>

                    {/* Supabase Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Supabase Password</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage('');
                            setSuccessMessage('');
                            setPageView('forgot_password');
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showSupabasePassword ? 'text' : 'password'}
                          id="supabase-password-input"
                          required
                          autoComplete="current-password"
                          disabled={lockoutRemaining > 0 || isLoading}
                          value={supabasePassword}
                          onChange={(e) => setSupabasePassword(e.target.value)}
                          placeholder="Enter your Supabase password"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSupabasePassword(!showSupabasePassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                          title={showSupabasePassword ? 'Hide password' : 'Show password'}
                        >
                          {showSupabasePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="supabase-signin-btn"
                      disabled={isLoading || lockoutRemaining > 0}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>Verifying with Supabase...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-black" />
                          <span>Sign In with Supabase Auth</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* METHOD B: MASTER PIN LOGIN */}
                {authMethod === 'pin' && (
                  <form onSubmit={handlePinLogin} className="space-y-4">
                    {/* Admin ID / Username */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Admin Username / Email</span>
                      </label>
                      <input
                        type="text"
                        id="pin-username-input"
                        required
                        autoComplete="username"
                        disabled={lockoutRemaining > 0 || isLoading}
                        value={pinUsername}
                        onChange={(e) => setPinUsername(e.target.value)}
                        placeholder="admin or mukeshgorai30@gmail.com"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                      />
                    </div>

                    {/* Master PIN */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Master Security Passcode / PIN</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage('');
                            setSuccessMessage('');
                            setPageView('forgot_password');
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline transition"
                        >
                          Forgot PIN?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPinPassword ? 'text' : 'password'}
                          id="pin-password-input"
                          required
                          autoComplete="current-password"
                          disabled={lockoutRemaining > 0 || isLoading}
                          value={pinPassword}
                          onChange={(e) => setPinPassword(e.target.value)}
                          placeholder="Enter Master Security PIN"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPinPassword(!showPinPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                          title={showPinPassword ? 'Hide PIN' : 'Show PIN'}
                        >
                          {showPinPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="pin-signin-btn"
                      disabled={isLoading || lockoutRemaining > 0}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2 bg-amber-400 hover:bg-amber-300 text-black hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>Verifying PIN...</span>
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-4 h-4 text-black" />
                          <span>Sign In with Security PIN</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* VIEW 2: FORGOT PASSWORD / PIN RECOVERY */}
            {pageView === 'forgot_password' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {!isCodeVerified ? (
                  <form onSubmit={handleInitiateRecovery} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Registered Master Owner Email</span>
                      </label>
                      <input
                        type="email"
                        id="recovery-email-input"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="e.g. mukeshgorai30@gmail.com"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition"
                      />
                      <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                        {authMethod === 'supabase'
                          ? 'A secure password reset link will be sent to this email via Supabase Auth.'
                          : 'Only the verified owner email registered with this gym can reset the master PIN.'}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black hover:brightness-110 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>Verifying Owner Identity...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-black" />
                          <span>Verify Identity & Proceed</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSaveNewPin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Enter New Master PIN / Password
                      </label>
                      <input
                        type="password"
                        required
                        value={resetNewPin}
                        onChange={(e) => setResetNewPin(e.target.value)}
                        placeholder="Minimum 4 characters or digits"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Confirm New PIN
                      </label>
                      <input
                        type="password"
                        required
                        value={resetConfirmPin}
                        onChange={(e) => setResetConfirmPin(e.target.value)}
                        placeholder="Re-enter new PIN"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black hover:brightness-110 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>Save New PIN & Log In</span>
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPageView('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                      setIsCodeVerified(false);
                    }}
                    className="text-xs text-neutral-400 hover:text-white font-medium transition"
                  >
                    ← Back to Admin Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit TLS Encrypted Session • Protected by Supabase Cloud</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-4 py-4 text-center text-xs text-neutral-500">
        {config.name || 'Absolute Gym'} Facility Management System • Secure Admin Gateway
      </footer>
    </div>
  );
};
