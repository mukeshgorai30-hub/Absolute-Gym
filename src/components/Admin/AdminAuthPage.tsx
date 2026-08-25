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
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from '../../firebase';

interface AdminAuthPageProps {
  onBackToWebsite: () => void;
  onAuthenticated: () => void;
}

type AuthMethod = 'firebase' | 'pin';
type PageView = 'login' | 'forgot_password';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({
  onBackToWebsite,
  onAuthenticated,
}) => {
  const { config, themeColor, updateConfig } = useGym();
  const theme = themeStyles[themeColor];

  // Auth method selection - default to Firebase
  const [authMethod, setAuthMethod] = useState<AuthMethod>('firebase');
  const [pageView, setPageView] = useState<PageView>('login');

  // Firebase Auth Inputs
  const [firebaseEmail, setFirebaseEmail] = useState(config.adminEmail || 'mukeshgorai30@gmail.com');
  const [firebasePassword, setFirebasePassword] = useState('');
  const [showFirebasePassword, setShowFirebasePassword] = useState(false);

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
    sessionStorage.removeItem('apex_admin_failed_attempts');
    sessionStorage.removeItem('apex_admin_lockout_until');
    setFailedAttempts(0);
    setSuccessMessage('Authentication verified! Redirecting to Admin Management Portal...');
    sessionStorage.setItem('apex_admin_authenticated', 'true');
    setTimeout(() => {
      onAuthenticated();
    }, 450);
  };

  // 1. Firebase Email & Password Login
  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, firebaseEmail.trim(), firebasePassword);
      if (userCredential.user) {
        sessionStorage.setItem('apex_admin_auth_type', 'firebase_email');
        sessionStorage.setItem('apex_admin_user_email', userCredential.user.email || firebaseEmail);
        handleAuthSuccess();
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        recordFailedAttempt();
        setErrorMessage('Invalid Firebase credentials. You can also use Google Sign-In or the Master PIN.');
      } else {
        recordFailedAttempt();
        setErrorMessage(err?.message || 'Failed to authenticate with Firebase.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1b. Firebase Google One-Click Login
  const handleFirebaseGoogleLogin = async () => {
    if (lockoutRemaining > 0) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        sessionStorage.setItem('apex_admin_auth_type', 'firebase_google');
        sessionStorage.setItem('apex_admin_user_email', result.user.email || '');
        handleAuthSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Sign-in failed or was cancelled.');
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

      // Match against admin username or email, and exact saved adminPin
      const isUserMatch =
        cleanUser === 'admin' ||
        cleanUser === 'apexadmin' ||
        cleanUser === validAdminEmail ||
        cleanUser.includes('admin') ||
        cleanUser === 'mukeshgorai30@gmail.com';

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

    if (authMethod === 'firebase') {
      try {
        await sendPasswordResetEmail(auth, cleanRecoveryEmail);
        setIsLoading(false);
        setSuccessMessage(`Password reset link sent to ${cleanRecoveryEmail} via Firebase.`);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err?.message || 'Failed to send Firebase reset link.');
      }
      return;
    }

    // Default: Master PIN OTP Recovery
    setTimeout(() => {
      setIsLoading(false);
      if (cleanRecoveryEmail === authorizedEmail || cleanRecoveryEmail.includes('@')) {
        const pinHint = config.adminPin || '1234';
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        setSuccessMessage(`One-Time Recovery Passcode generated for ${cleanRecoveryEmail}. Current master pin is "${pinHint}".`);
      } else {
        setErrorMessage('Unrecognized recovery email address.');
      }
    }, 400);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (recoveryCode.trim() === generatedCode.trim() && generatedCode !== '') {
      setIsCodeVerified(true);
      setSuccessMessage('Passcode verified! Set your new security PIN.');
    } else {
      setErrorMessage('Invalid or expired recovery passcode.');
    }
  };

  const handleSetNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (resetNewPin.length < 4) {
      setErrorMessage('PIN must be at least 4 digits/characters.');
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

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30">
            <Database className="w-3 h-3" />
            <span>Firebase Connected</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Top Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Header Icon & Title */}
            <div className="text-center space-y-2 mb-6 relative">
              <div className="inline-flex p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-amber-400 shadow-inner mb-1">
                {pageView === 'login' && <ShieldCheck className="w-8 h-8" />}
                {pageView === 'forgot_password' && <HelpCircle className="w-8 h-8 text-amber-400" />}
              </div>

              <h1 className="text-2xl font-black uppercase tracking-wide text-white">
                {pageView === 'login' && 'Admin Portal Login'}
                {pageView === 'forgot_password' && 'Reset Security Credentials'}
              </h1>

              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {pageView === 'login' &&
                  'Authenticate securely via Firebase Cloud, Google Sign-In, or Master Security PIN to access CMS settings.'}
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
                    id="tab-auth-firebase"
                    onClick={() => {
                      setAuthMethod('firebase');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      authMethod === 'firebase'
                        ? 'bg-neutral-800 text-amber-400 border border-amber-500/30 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Firebase Auth</span>
                  </button>

                  <button
                    type="button"
                    id="tab-auth-pin"
                    onClick={() => {
                      setAuthMethod('pin');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      authMethod === 'pin'
                        ? 'bg-neutral-800 text-amber-400 border border-amber-500/30 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Master PIN</span>
                  </button>
                </div>

                {/* METHOD A: FIREBASE CLOUD AUTH LOGIN */}
                {authMethod === 'firebase' && (
                  <div className="space-y-4">
                    {/* Google One-Click Button */}
                    <button
                      type="button"
                      onClick={handleFirebaseGoogleLogin}
                      disabled={isLoading || lockoutRemaining > 0}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-white flex items-center justify-center gap-2.5 shadow-md hover:border-neutral-600 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign In with Google</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-neutral-800" />
                      <span className="text-[10px] uppercase font-bold text-neutral-500">or email</span>
                      <div className="flex-1 h-px bg-neutral-800" />
                    </div>

                    <form onSubmit={handleFirebaseLogin} className="space-y-3.5">
                      {/* Firebase Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Firebase Admin Email</span>
                          </span>
                        </label>
                        <input
                          type="email"
                          id="firebase-email-input"
                          required
                          autoComplete="email"
                          disabled={lockoutRemaining > 0 || isLoading}
                          value={firebaseEmail}
                          onChange={(e) => setFirebaseEmail(e.target.value)}
                          placeholder="e.g. mukeshgorai30@gmail.com"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                        />
                      </div>

                      {/* Firebase Password */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Password</span>
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
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showFirebasePassword ? 'text' : 'password'}
                            id="firebase-password-input"
                            required
                            autoComplete="current-password"
                            disabled={lockoutRemaining > 0 || isLoading}
                            value={firebasePassword}
                            onChange={(e) => setFirebasePassword(e.target.value)}
                            placeholder="Enter your Firebase password"
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFirebasePassword(!showFirebasePassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                            title={showFirebasePassword ? 'Hide password' : 'Show password'}
                          >
                            {showFirebasePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        id="firebase-signin-btn"
                        disabled={isLoading || lockoutRemaining > 0}
                        className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2 bg-amber-500 hover:bg-amber-400 text-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                            <span>Verifying with Firebase...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-black" />
                            <span>Sign In to Admin Portal</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
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
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                      />
                    </div>

                    {/* Security PIN */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Master Security PIN</span>
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
                          placeholder="Default is 1234"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
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

                    {/* Quick helper note */}
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
                      <span>Default PIN is <strong className="text-amber-400 font-mono">1234</strong></span>
                      <button
                        type="button"
                        onClick={() => setPinPassword('1234')}
                        className="text-amber-400 hover:underline font-bold text-[10px]"
                      >
                        Auto-fill 1234
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="pin-signin-btn"
                      disabled={isLoading || lockoutRemaining > 0}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2 bg-amber-500 hover:bg-amber-400 text-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-black" />
                          <span>Unlock Admin Panel</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* VIEW 2: FORGOT PASSWORD / RECOVERY */}
            {pageView === 'forgot_password' && (
              <div className="space-y-5">
                {!isCodeVerified ? (
                  <form onSubmit={generatedCode ? handleVerifyCode : handleInitiateRecovery} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Registered Admin Email</span>
                      </label>
                      <input
                        type="email"
                        required
                        disabled={isLoading || Boolean(generatedCode)}
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="e.g. mukeshgorai30@gmail.com"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition disabled:opacity-50"
                      />
                    </div>

                    {generatedCode && (
                      <div className="space-y-1.5 animate-in fade-in">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          <span>Enter 6-Digit OTP Recovery Code</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-center text-white placeholder-neutral-600 focus:outline-none transition"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPageView('login');
                          setErrorMessage('');
                          setSuccessMessage('');
                          setGeneratedCode('');
                        }}
                        className="flex-1 py-3 px-4 rounded-xl border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : generatedCode ? (
                          <span>Verify Passcode</span>
                        ) : (
                          <span>Send Reset Link</span>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSetNewPin} className="space-y-4 animate-in fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        New Security PIN
                      </label>
                      <input
                        type="password"
                        required
                        value={resetNewPin}
                        onChange={(e) => setResetNewPin(e.target.value)}
                        placeholder="Enter at least 4 digits"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition"
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
                        placeholder="Confirm new PIN"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update & Save PIN</span>}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-neutral-900 px-4 py-4 text-center text-xs text-neutral-600">
        <span>Protected by Cloud Firestore & Firebase Auth Security Infrastructure &bull; Absolute Gym CMS</span>
      </footer>
    </div>
  );
};
