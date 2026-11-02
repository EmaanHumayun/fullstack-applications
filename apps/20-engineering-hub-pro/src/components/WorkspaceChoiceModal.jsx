import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShieldCheck, ArrowRight, X } from 'lucide-react';

export function WorkspaceChoiceModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-ink animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-elevated transition"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-serif text-ink tracking-tight">
            Workspace Access
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Viewer Mode */}
          <div
            onClick={() => {
              onClose();
              navigate('/admin/login?tier=viewer');
            }}
            className="group cursor-pointer rounded-xl border-2 border-border hover:border-primary/80 bg-surface-elevated/40 hover:bg-surface-elevated p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye size={20} />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-primary transition-colors">
                Viewer Access
              </h3>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-primary">
              <span>View Workspace</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option 2: Admin Mode */}
          <div
            onClick={() => {
              onClose();
              navigate('/admin/login?tier=admin');
            }}
            className="group cursor-pointer rounded-xl border-2 border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-primary transition-colors">
                Administrator
              </h3>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-primary">
              <span>Admin Portal</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
