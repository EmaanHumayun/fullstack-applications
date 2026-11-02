import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Command,
  LayoutDashboard,
  Boxes,
  Code2,
  Folder,
  Sparkles,
  Workflow,
  Clock,
  Trophy,
  Target,
  GraduationCap,
  BookOpen,
  Settings2,
  Palette,
  Archive,
  ShieldCheck,
  Globe,
  Menu,
  ArrowUpRight,
  LogOut,
  X,
  Layers,
  FileEdit,
  Share2,
  Library,
  Eye,
  FlaskConical,
  FileCheck
} from 'lucide-react';
import { api, setStoredToken } from '../lib/api.js';
import { PaletteSwitcher } from './PaletteSwitcher.jsx';

function NavItem({ to, icon: Icon, children, badge, onClick }) {
  const loc = useLocation();
  const active = to === '/admin' ? loc.pathname === '/admin' : loc.pathname.startsWith(to);
  return (
    <Link
      onClick={onClick}
      to={to}
      className={`nav-item ${active ? 'nav-active' : ''}`}
    >
      <Icon size={16} />
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto rounded-full bg-stone-200 px-1.5 py-0.2 text-[9px] font-bold text-stone-700">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Layout({ children, currentUser, profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [loc.pathname]);

  async function handleLogout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (e) {}
    setStoredToken('');
    navigate('/admin/login');
  }

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Command size={20} />
          </span>
          <span>
            <strong>{profile?.name || 'emaan.dev'}</strong>
            <small>ENGINEERING HUB</small>
          </span>
        </Link>

        <div className="side-label">WORKSPACE</div>
        <nav className="nav-list">
          <NavItem to="/admin" icon={LayoutDashboard}>Overview</NavItem>
          <NavItem to="/admin/ecosystems" icon={Boxes}>Learning Ecosystems</NavItem>
          <NavItem to="/admin/domains" icon={Layers}>Domains & Fields</NavItem>
          <NavItem to="/admin/projects" icon={Code2}>Projects</NavItem>
          <NavItem to="/admin/folders" icon={Folder}>Repositories & Tree</NavItem>
          <NavItem to="/admin/skills" icon={Sparkles}>Skills</NavItem>
          <NavItem to="/admin/roadmaps" icon={Workflow}>Roadmaps</NavItem>
          <NavItem to="/admin/practice-labs" icon={FlaskConical}>Practice Labs</NavItem>
          <NavItem to="/admin/assignments" icon={FileCheck}>Assignments</NavItem>
          <NavItem to="/admin/work-logs" icon={Clock}>Work Logs</NavItem>
          <NavItem to="/admin/milestones" icon={Trophy}>Milestones</NavItem>
          <NavItem to="/admin/goals" icon={Target}>Goals</NavItem>
          <NavItem to="/admin/certificates" icon={GraduationCap}>Certificates</NavItem>
          <NavItem to="/admin/notes" icon={BookOpen}>Knowledge</NavItem>
          <NavItem to="/admin/resources" icon={Library}>Resources</NavItem>
        </nav>

        <div className="side-label mt-5">CMS & PRESENTATION</div>
        <nav className="nav-list">
          <NavItem to="/admin/site-content" icon={FileEdit}>Site Content</NavItem>
          <NavItem to="/admin/social-links" icon={Share2}>Social & Contact</NavItem>
          <NavItem to="/admin/profile" icon={Settings2}>Profile</NavItem>
          <NavItem to="/admin/themes" icon={Palette}>Themes</NavItem>
          <NavItem to="/admin/archive" icon={Archive}>Recycle Bin</NavItem>
        </nav>

        {isSuperAdmin && (
          <>
            <div className="side-label mt-5 text-amber-700">SUPER ADMIN</div>
            <nav className="nav-list">
              <NavItem to="/admin/super" icon={ShieldCheck}>Control Center</NavItem>
            </nav>
          </>
        )}

        <div className="side-label mt-5">PUBLIC SPACE</div>
        <nav className="nav-list">
          <NavItem to="/" icon={Globe}>Portfolio Home</NavItem>
          <NavItem to="/projects" icon={Code2}>Public Projects</NavItem>
          <NavItem to="/practice-labs" icon={FlaskConical}>Practice Labs</NavItem>
          <NavItem to="/assignments" icon={FileCheck}>Assignments</NavItem>
          <NavItem to="/notes" icon={BookOpen}>Public Notes</NavItem>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span className="text-[11px] font-medium text-stone-600">Engine Operational</span>
          </div>

          <div className="mini-profile">
            <div className="avatar">
              {(currentUser?.name || profile?.name || 'A')
                .split(' ')
                .map(x => x[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-semibold text-stone-800 truncate">
                {currentUser?.name || 'Administrator'}
              </strong>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block rounded px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider ${
                  isSuperAdmin
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : currentUser?.role === 'viewer'
                    ? 'bg-amber-500/15 text-amber-900 border border-amber-500/30 font-mono font-bold'
                    : 'bg-stone-100 text-stone-700'
                }`}>
                  {currentUser?.role === 'super_admin' ? 'Super Admin' : currentUser?.role === 'viewer' ? 'Viewer (Read-Only)' : currentUser?.role || 'Admin'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-auto p-1.5 text-stone-400 hover:text-red-600 transition"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main Panel */}
      <main className="main-panel">
        {/* Read-Only Viewer Notice Banner */}
        {currentUser?.role === 'viewer' && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-amber-950 animate-fade-in shadow-inner">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-amber-800 shrink-0" />
              <span>
                <strong>Viewer Mode Active:</strong> You are exploring this workspace in Read-Only mode. Creating, editing, and deleting records are restricted to the administrator.
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/25 text-amber-900 border border-amber-500/40 shrink-0 ml-3">
              READ-ONLY
            </span>
          </div>
        )}

        <header className="topbar">
          <button
            type="button"
            className="mobile-menu icon-button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-dot">/</span>
            <strong>
              {loc.pathname === '/admin'
                ? 'Overview'
                : loc.pathname === '/admin/super'
                ? 'Super Admin Control Center'
                : loc.pathname.replace('/admin/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </strong>
          </div>

          <div className="topbar-right">
            <PaletteSwitcher />
            <Link to="/" className="view-site-button" target="_blank">
              View site <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
