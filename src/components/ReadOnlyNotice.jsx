import React from 'react';
import { Eye, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function ReadOnlyNotice({ message = 'You are viewing this record in Read-Only mode. Adding, editing, and deleting records are restricted to Administrators.' }) {
  const { isViewer } = useAuth();
  if (!isViewer) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-950 flex items-start gap-2.5 animate-fade-in shadow-xs">
      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
        <Eye size={12} />
      </div>
      <div className="flex-1">
        <strong className="block font-semibold text-amber-900 mb-0.5 flex items-center gap-1.5">
          <span>Read-Only Viewer Mode</span>
          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 uppercase tracking-widest font-bold">
            NO CRUD
          </span>
        </strong>
        <p className="leading-relaxed text-[11px] opacity-90">{message}</p>
      </div>
    </div>
  );
}

export function ActionRestrictedTooltip({ children, isRestricted, actionLabel = 'This action' }) {
  if (!isRestricted) return children;

  return (
    <div className="relative group inline-block" title={`${actionLabel} is restricted to Administrators in Read-Only Viewer mode.`}>
      {children}
    </div>
  );
}
