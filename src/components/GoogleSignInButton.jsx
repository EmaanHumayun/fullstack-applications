import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { api, jsonBody, setStoredToken } from '../lib/api.js';

export function GoogleSignInButton({
  roleRequested = 'viewer',
  onSuccess,
  onError,
  buttonText = 'Continue with Google',
  disabled = false
}) {
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptEmail, setPromptEmail] = useState('');
  const [promptName, setPromptName] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    // Load Google Identity Services script if not already present
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [clientId]);

  const handleGoogleClick = async () => {
    if (disabled || loading) return;

    // If Google Client ID is configured and GIS is available in window
    if (clientId && window.google?.accounts?.id) {
      try {
        setLoading(true);
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async response => {
            try {
              const res = await api('/auth/google', {
                method: 'POST',
                body: jsonBody({
                  credential: response.credential,
                  roleRequested
                })
              });

              if (res.token) setStoredToken(res.token);
              if (onSuccess) onSuccess(res.user || res);
            } catch (err) {
              if (onError) onError(err.message || 'Google authentication failed');
            } finally {
              setLoading(false);
            }
          }
        });

        window.google.accounts.id.prompt(notification => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to manual prompt if GIS popup was blocked
            setShowPrompt(true);
            setLoading(false);
          }
        });
      } catch (e) {
        setLoading(false);
        setShowPrompt(true);
      }
    } else {
      // In dev mode or when VITE_GOOGLE_CLIENT_ID is not yet configured,
      // provide instant simulated Google One-Tap account input modal
      setShowPrompt(true);
    }
  };

  const handleManualGoogleSubmit = async e => {
    e.preventDefault();
    if (!promptEmail) return;

    setLoading(true);
    try {
      const res = await api('/auth/google', {
        method: 'POST',
        body: jsonBody({
          email: promptEmail,
          name: promptName || promptEmail.split('@')[0],
          roleRequested,
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(promptEmail)}`
        })
      });

      if (res.token) setStoredToken(res.token);
      setShowPrompt(false);
      if (onSuccess) onSuccess(res.user || res);
    } catch (err) {
      if (onError) onError(err.message || 'Google Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={disabled || loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-ink font-medium text-sm transition-all duration-200 shadow-sm hover:shadow hover:border-primary/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <Loader2 className="animate-spin text-primary" size={18} />
        ) : (
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
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
        )}
        <span>{buttonText}</span>
      </button>

      {/* Simulated Google Account Popup when Client ID not configured */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-muted hover:text-ink text-sm font-bold p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <h3 className="font-bold text-base text-ink">Sign in with Google</h3>
            </div>

            <p className="text-xs text-muted mb-4 leading-relaxed">
              Continue to <strong>Engineering Hub Pro</strong> as a {roleRequested === 'admin' ? 'Workspace Admin' : 'Read-Only Viewer'}.
            </p>

            <form onSubmit={handleManualGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Google Account Email:
                </label>
                <input
                  type="email"
                  required
                  value={promptEmail}
                  onChange={e => setPromptEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 text-sm bg-surface-elevated border border-border rounded-lg text-ink focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Full Name (optional):
                </label>
                <input
                  type="text"
                  value={promptName}
                  onChange={e => setPromptName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 text-sm bg-surface-elevated border border-border rounded-lg text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg border border-border text-muted hover:text-ink transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-primary text-white hover:opacity-90 transition flex items-center justify-center gap-1.5"
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
