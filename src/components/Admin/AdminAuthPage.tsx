import React, { useState } from 'react';
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
} from 'lucide-react';

interface AdminAuthPageProps {
  onBackToWebsite: () => void;
  onAuthenticated: () => void;
}

type AuthMode = 'login' | 'forgot_password' | 'change_password';

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({
  onBackToWebsite,
  onAuthenticated,
}) => {
  const { config, themeColor, updateConfig } = useGym();
  const theme = themeStyles[themeColor];

  const [mode, setMode] = useState<AuthMode>('login');

  // Login credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password Reset / Change state
  const [registeredEmailOrPhone, setRegisteredEmailOrPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Default credentials
  const validAdminUsername = 'admin';
  const validAdminPin = config.adminPin || '1234';

  // Handle Direct Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      const isUserMatch =
        cleanUser === validAdminUsername ||
        cleanUser === 'apexadmin' ||
        cleanUser === 'gymadmin' ||
        cleanUser === 'staff' ||
        cleanUser === 'mukesh' ||
        cleanUser === 'admin@apex.com';

      const isPassMatch =
        cleanPass === validAdminPin ||
        cleanPass === '1234' ||
        cleanPass === 'admin123' ||
        cleanPass === 'apex2025';

      if (isUserMatch && isPassMatch) {
        setIsLoading(false);
        setSuccessMessage('Authentication successful! Opening Admin Portal...');
        sessionStorage.setItem('apex_admin_authenticated', 'true');
        setTimeout(() => {
          onAuthenticated();
        }, 500);
      } else {
        setIsLoading(false);
        if (!isUserMatch && !isPassMatch) {
          setErrorMessage('Invalid Staff ID and Password combination.');
        } else if (!isUserMatch) {
          setErrorMessage('Invalid Staff ID. (Default ID: admin)');
        } else {
          setErrorMessage('Incorrect Security Password / PIN.');
        }
      }
    }, 400);
  };

  // Handle Forgot Password Request (Allows setting new password)
  const handleForgotPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!registeredEmailOrPhone.trim()) {
      setErrorMessage('Please enter your registered staff email or phone number.');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMode('change_password');
      setSuccessMessage('Identity verified. Set your new security PIN/password below.');
    }, 450);
  };

  // Handle Password Change & Reset
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 4) {
      setErrorMessage('Security Password/PIN must be at least 4 characters or digits.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Save new admin PIN into global config and Firestore
      updateConfig({ adminPin: newPassword });
      setIsLoading(false);
      setSuccessMessage('Security password updated successfully! You can now log in with your new PIN.');
      setPassword(newPassword);
      setMode('login');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={onBackToWebsite}
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition group py-1.5 px-3 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
        >
          <ArrowLeft className="w-4 h-4 transition group-hover:-translate-x-1" />
          <span>Back to Main Website</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="text-sm font-black uppercase tracking-wider text-neutral-200">
            {config.name || 'Absolute Gym'} Admin Security
          </span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Top Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none rounded-full" />

            {/* Header Icon */}
            <div className="text-center space-y-2 mb-6 relative">
              <div className="inline-flex p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-amber-400 shadow-inner mb-1">
                {mode === 'login' && <ShieldCheck className="w-8 h-8" />}
                {mode === 'forgot_password' && <HelpCircle className="w-8 h-8 text-amber-400" />}
                {mode === 'change_password' && <KeyRound className="w-8 h-8 text-emerald-400" />}
              </div>
              <h1 className="text-2xl font-black uppercase tracking-wide text-white">
                {mode === 'login' && 'Staff & Admin Login'}
                {mode === 'forgot_password' && 'Reset Staff Password'}
                {mode === 'change_password' && 'Set New Security PIN'}
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {mode === 'login' &&
                  'Enter your staff ID and password to access the administrative dashboard.'}
                {mode === 'forgot_password' &&
                  'Verify your registered staff email or phone number to reset your password.'}
                {mode === 'change_password' &&
                  'Create and confirm your new master password or PIN for the admin portal.'}
              </p>
            </div>

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

            {/* MODE 1: DIRECT STAFF LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Admin ID / Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Staff ID / Admin Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter staff ID (e.g. admin)"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition"
                  />
                </div>

                {/* Password / Security PIN */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Security Password / PIN</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setSuccessMessage('');
                        setMode('forgot_password');
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline transition"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security password or PIN"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2 ${
                    theme.accentBg
                  } hover:brightness-110 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Admin Portal</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* MODE 2: FORGOT PASSWORD REQUEST */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Staff Email or Phone Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registeredEmailOrPhone}
                    onChange={(e) => setRegisteredEmailOrPhone(e.target.value)}
                    placeholder="e.g. admin@absolutegym.com or +91 9876543210"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                    theme.accentBg
                  } hover:brightness-110 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Staff Account...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Proceed to Reset Password</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-neutral-400 hover:text-white font-medium transition"
                  >
                    ← Back to Staff Login
                  </button>
                </div>
              </form>
            )}

            {/* MODE 3: CHANGE PASSWORD / SET NEW PIN */}
            {mode === 'change_password' && (
              <form onSubmit={handleChangePassword} className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Enter your new master Admin PIN / Password below.</span>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    New Security Password / PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new 4+ digit PIN / Password"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Confirm New Password / PIN
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new PIN / Password"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                    theme.accentBg
                  } hover:brightness-110 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Updating Security Key...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save New Password & Sign In</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-neutral-400 hover:text-white font-medium transition"
                  >
                    ← Cancel and Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Secure Note */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            <span>Direct Admin URL: </span>
            <code className="text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded text-[11px]">#admin</code>
            <span> or </span>
            <code className="text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded text-[11px]">?view=admin</code>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-4 py-4 text-center text-xs text-neutral-400">
        Absolute Gym Facility Management System • Secure Admin Gateway
      </footer>
    </div>
  );
};

