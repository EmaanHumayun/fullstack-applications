import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LockKeyhole,
  Command,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  Compass,
  Mail,
  Sparkles,
  Info
} from 'lucide-react';
import { api, jsonBody, setStoredToken } from '../lib/api.js';
import { PaletteSwitcher } from '../components/PaletteSwitcher.jsx';
import { GoogleSignInButton } from '../components/GoogleSignInButton.jsx';

export default function LoginPage({ onLoginSuccess }) {
  const [searchParams] = useSearchParams();
  const initialTier = searchParams.get('tier') === 'admin' ? 'admin' : 'viewer';

  const [activeTier, setActiveTier] = useState(initialTier); // 'viewer' | 'admin'
  const [viewerAction, setViewerAction] = useState('login'); // 'login' | 'register' | 'instant'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tier = searchParams.get('tier');
    if (tier === 'admin' || tier === 'viewer') {
      setActiveTier(tier);
    }
  }, [searchParams]);

  // Handle Admin Login
  const handleAdminLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: jsonBody({ email, password })
      });

      if (res.token) setStoredToken(res.token);

      const userData = res.user || {
        id: res.id || res.sub || res._id,
        email: res.email,
        name: res.name,
        role: res.role,
        isSuperAdmin: res.role === 'super_admin',
        isViewer: res.role === 'viewer'
      };

      if (onLoginSuccess) onLoginSuccess(userData);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid administrator email or password');
    } finally {
      setLoading(false);
    }
  };

  // Handle Viewer Standard Login
  const handleViewerLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: jsonBody({ email, password, asViewer: true, tier: 'viewer' })
      });

      if (res.token) setStoredToken(res.token);

      const userData = res.user || {
        id: res.id || res.sub || res._id,
        email: res.email,
        name: res.name,
        role: 'viewer',
        isSuperAdmin: false,
        isViewer: true
      };

      setSuccessMsg('Welcome to Engineering Hub! Entering Read-Only workspace…');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(userData);
        navigate('/admin');
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid email or password. You can also register below.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Viewer Registration
  const handleViewerRegister = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api('/auth/register-viewer', {
        method: 'POST',
        body: jsonBody({ email, password, name })
      });

      if (res.token) setStoredToken(res.token);

      const userData = res.user || {
        id: res.id || res.sub || res._id,
        email: res.email,
        name: res.name,
        role: 'viewer',
        isSuperAdmin: false,
        isViewer: true
      };

      setSuccessMsg('Viewer account registered! Entering workspace…');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(userData);
        navigate('/admin');
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Fast Instant Guest Access
  const handleInstantGuest = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api('/auth/guest-viewer', {
        method: 'POST',
        body: jsonBody({ email, name })
      });

      if (res.token) setStoredToken(res.token);

      const userData = res.user || {
        id: res.id || res.sub || res._id,
        email: res.email,
        name: res.name,
        role: 'viewer',
        isSuperAdmin: false,
        isViewer: true
      };

      setSuccessMsg('Guest session initialized! Entering workspace…');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(userData);
        navigate('/admin');
      }, 600);
    } catch (err) {
      setError(err.message || 'Could not start guest session.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Success
  const handleGoogleSuccess = userData => {
    setSuccessMsg('Google authentication successful! Entering workspace…');
    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess(userData);
      navigate('/admin');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative font-sans text-ink">
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4">
        <PaletteSwitcher />
      </div>

      {/* Brand Logo Header */}
      <Link to="/" className="flex items-center gap-2.5 mb-6 group transition-transform hover:scale-105">
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg font-bold">
          <Command size={20} />
        </div>
        <div className="text-left">
          <h1 className="text-lg font-bold font-serif text-ink tracking-tight group-hover:text-primary transition-colors">
            Engineering Hub Pro
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">
            Workspace Authentication
          </p>
        </div>
      </Link>

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden animate-scale-up">
        {/* Tier Selector: Viewer vs Admin */}
        <div className="flex border-b border-border bg-surface-elevated/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTier('viewer');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTier === 'viewer'
                ? 'bg-surface text-primary shadow-sm border border-border'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Eye size={15} />
            <span>Login as Viewer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTier('admin');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTier === 'admin'
                ? 'bg-surface text-primary shadow-sm border border-border'
                : 'text-muted hover:text-ink'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Login as Admin</span>
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {/* Notifications / Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TIER 1: VIEWER EXPERIENCE (Guest / Read-Only)            */}
          {/* ======================================================== */}
          {activeTier === 'viewer' && (
            <div className="space-y-4">
              {/* 1. Google One-Tap / Button */}
              <div>
                <GoogleSignInButton
                  roleRequested="viewer"
                  buttonText="Continue with Google"
                  onSuccess={handleGoogleSuccess}
                  onError={err => setError(err)}
                  disabled={loading}
                />
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-border w-full" />
                <span className="bg-surface px-3 text-[10px] font-mono font-bold tracking-wider text-muted uppercase shrink-0">
                  OR EMAIL ACCESS
                </span>
                <div className="border-t border-border w-full" />
              </div>

              {/* Sub-tabs for Viewer: Login / Register / Fast Guest */}
              <div className="flex border-b border-border pb-1 text-xs font-semibold gap-3">
                <button
                  type="button"
                  onClick={() => setViewerAction('login')}
                  className={`pb-1 transition-colors ${
                    viewerAction === 'login'
                      ? 'border-b-2 border-primary text-primary font-bold'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setViewerAction('register')}
                  className={`pb-1 transition-colors ${
                    viewerAction === 'register'
                      ? 'border-b-2 border-primary text-primary font-bold'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Register Account
                </button>
                <button
                  type="button"
                  onClick={() => setViewerAction('instant')}
                  className={`pb-1 transition-colors ${
                    viewerAction === 'instant'
                      ? 'border-b-2 border-primary text-primary font-bold'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Quick Guest Access
                </button>
              </div>

              {/* Viewer Login Form */}
              {viewerAction === 'login' && (
                <form onSubmit={handleViewerLogin} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="viewer@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                    <span>Enter as Viewer</span>
                  </button>
                </form>
              )}

              {/* Viewer Register Form */}
              {viewerAction === 'register' && (
                <form onSubmit={handleViewerRegister} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-3.5 py-2 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Create Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    <span>Register as Viewer</span>
                  </button>
                </form>
              )}

              {/* Instant Guest Entry Form */}
              {viewerAction === 'instant' && (
                <form onSubmit={handleInstantGuest} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="visitor@domain.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Guest Recruiter / Visitor"
                      className="w-full px-3.5 py-2 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
                    <span>Enter Workspace Now</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TIER 2: ADMIN EXPERIENCE (Owner Master Credentials)      */}
          {/* ======================================================== */}
          {activeTier === 'admin' && (
            <div className="space-y-4">
              {/* Google Sign-In for Admin */}
              <div>
                <GoogleSignInButton
                  roleRequested="admin"
                  buttonText="Sign in as Admin with Google"
                  onSuccess={handleGoogleSuccess}
                  onError={err => setError(err)}
                  disabled={loading}
                />
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-border w-full" />
                <span className="bg-surface px-3 text-[10px] font-mono font-bold tracking-wider text-muted uppercase shrink-0">
                  OR MASTER CREDENTIALS
                </span>
                <div className="border-t border-border w-full" />
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="emaanhumayun23072@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-elevated border border-border rounded-xl text-ink focus:outline-none focus:border-primary transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}
                  <span>Sign In as Admin</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-elevated border-t border-border px-6 py-3.5 flex items-center justify-between text-xs text-muted">
          <Link to="/" className="hover:text-primary transition flex items-center gap-1 font-medium">
            &larr; Back to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
