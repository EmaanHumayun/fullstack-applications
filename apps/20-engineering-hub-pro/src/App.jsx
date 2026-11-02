import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { api } from './lib/api.js';
import { initActiveTheme } from './lib/theme.js';
import { Layout } from './components/Layout.jsx';

// Public Pages
import { PublicHome, PublicNav, PublicFooter } from './pages/PublicHome.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import DomainsPage from './pages/DomainsPage.jsx';
import SkillsPage from './pages/SkillsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import RoadmapsPage from './pages/RoadmapsPage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PublicDomainDetail from './pages/PublicDomainDetail.jsx';
import AdminDomainDetail from './pages/admin/AdminDomainDetail.jsx';
import PracticeLabsPage from './pages/PracticeLabsPage.jsx';
import AssignmentsPage from './pages/AssignmentsPage.jsx';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminProjects from './pages/admin/AdminProjects.jsx';
import AdminFolders from './pages/admin/AdminFolders.jsx';
import AdminSkills from './pages/admin/AdminSkills.jsx';
import AdminRoadmaps from './pages/admin/AdminRoadmaps.jsx';
import AdminPracticeLabs from './pages/admin/AdminPracticeLabs.jsx';
import AdminAssignments from './pages/admin/AdminAssignments.jsx';
import AdminWorkLogs from './pages/admin/AdminWorkLogs.jsx';
import AdminMilestones from './pages/admin/AdminMilestones.jsx';
import AdminGoals from './pages/admin/AdminGoals.jsx';
import AdminCertificates from './pages/admin/AdminCertificates.jsx';
import AdminNotes from './pages/admin/AdminNotes.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import AdminThemes from './pages/admin/AdminThemes.jsx';
import AdminArchive from './pages/admin/AdminArchive.jsx';
import AdminDomains from './pages/admin/AdminDomains.jsx';
import AdminSiteContent from './pages/admin/AdminSiteContent.jsx';
import AdminSocialLinks from './pages/admin/AdminSocialLinks.jsx';
import SuperAdminCenter from './pages/admin/SuperAdminCenter.jsx';
import AdminEcosystems from './pages/admin/AdminEcosystems.jsx';
import AdminEcosystemDetail from './pages/admin/AdminEcosystemDetail.jsx';
import { AdminResources } from './pages/admin/AdminResources.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function PublicShell({ children, profile, content, socialLinks }) {
  const [siteContent, setSiteContent] = useState(content || null);
  const [links, setLinks] = useState(socialLinks || []);

  useEffect(() => {
    if (content) {
      setSiteContent(content);
    } else {
      api('/site-content').then(setSiteContent).catch(() => {});
    }
  }, [content]);

  useEffect(() => {
    if (socialLinks && socialLinks.length > 0) {
      setLinks(socialLinks);
    } else {
      api('/social-links').then(res => setLinks(res || [])).catch(() => {});
    }
  }, [socialLinks]);

  return (
    <div className="public-shell min-h-screen flex flex-col justify-between">
      <PublicNav profile={profile} content={siteContent} />
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {children}
      </main>
      <PublicFooter profile={profile} content={siteContent} socialLinks={links} />
    </div>
  );
}

function AdminGate({ currentUser, loadingUser, children }) {
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex items-center gap-2.5 text-stone-600 text-sm font-medium">
          <Loader2 className="animate-spin text-amber-800" size={20} />
          <span>Verifying authentication & permissions…</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function SuperAdminGate({ currentUser, children }) {
  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="p-12 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900">Super Admin Required</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          The application Control Center is restricted to the <code>super_admin</code> authority.
          Your authenticated role is <code>{currentUser?.role || 'viewer'}</code>.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
        >
          <ArrowLeft size={14} /> Back to Overview
        </Link>
      </div>
    );
  }
  return children;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profile, setProfile] = useState(null);
  const location = useLocation();

  const verifyAuth = useCallback(async () => {
    try {
      const user = await api('/auth/me');
      setCurrentUser(user);
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    initActiveTheme();
    api('/profile')
      .then(p => setProfile(p))
      .catch(() => {});
    verifyAuth();
  }, [verifyAuth]);

  // Re-verify auth when switching to admin routes
  useEffect(() => {
    if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
      verifyAuth();
    }
  }, [location.pathname, verifyAuth]);

  return (
    <AuthProvider currentUser={currentUser}>
      <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicHome />} />
      <Route
        path="/projects"
        element={
          <PublicShell profile={profile}>
            <ProjectsPage profile={profile} />
          </PublicShell>
        }
      />
      <Route
        path="/projects/:slug"
        element={
          <PublicShell profile={profile}>
            <ProjectDetail />
          </PublicShell>
        }
      />
      <Route
        path="/notes"
        element={
          <PublicShell profile={profile}>
            <NotesPage />
          </PublicShell>
        }
      />
      <Route
        path="/domains/:slug"
        element={
          <PublicShell profile={profile}>
            <PublicDomainDetail />
          </PublicShell>
        }
      />
      <Route
        path="/domains"
        element={
          <PublicShell profile={profile}>
            <DomainsPage />
          </PublicShell>
        }
      />
      <Route
        path="/skills"
        element={
          <PublicShell profile={profile}>
            <SkillsPage />
          </PublicShell>
        }
      />
      <Route
        path="/analytics"
        element={
          <PublicShell profile={profile}>
            <AnalyticsPage />
          </PublicShell>
        }
      />
      <Route
        path="/roadmaps"
        element={
          <PublicShell profile={profile}>
            <RoadmapsPage />
          </PublicShell>
        }
      />
      <Route
        path="/practice-labs"
        element={
          <PublicShell profile={profile}>
            <PracticeLabsPage />
          </PublicShell>
        }
      />
      <Route
        path="/assignments"
        element={
          <PublicShell profile={profile}>
            <AssignmentsPage />
          </PublicShell>
        }
      />
      <Route
        path="/credentials"
        element={
          <PublicShell profile={profile}>
            <CertificatesPage />
          </PublicShell>
        }
      />
      <Route
        path="/certificates"
        element={
          <PublicShell profile={profile}>
            <CertificatesPage />
          </PublicShell>
        }
      />
      <Route
        path="/resources"
        element={
          <PublicShell profile={profile}>
            <AdminResources />
          </PublicShell>
        }
      />
      <Route path="/contact" element={<Navigate to="/#contact" replace />} />

      {/* Authentication */}
      <Route
        path="/admin/login"
        element={<LoginPage onLoginSuccess={user => setCurrentUser(user)} />}
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminOverview currentUser={currentUser} />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/ecosystems"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminEcosystems />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/ecosystems/:slug"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminEcosystemDetail />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/domains"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminDomains />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/domains/:slug"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminDomainDetail />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/site-content"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminSiteContent />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/social-links"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminSocialLinks />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminProjects />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/folders"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminFolders />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminSkills />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/roadmaps"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminRoadmaps />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/practice-labs"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminPracticeLabs currentUser={currentUser} />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminAssignments currentUser={currentUser} />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/work-logs"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminWorkLogs />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/milestones"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminMilestones />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/goals"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminGoals />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/certificates"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminCertificates />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/notes"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminNotes />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/resources"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminResources />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminProfile />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/themes"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminThemes />
            </Layout>
          </AdminGate>
        }
      />
      <Route
        path="/admin/archive"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <Layout currentUser={currentUser} profile={profile}>
              <AdminArchive />
            </Layout>
          </AdminGate>
        }
      />

      {/* Super Admin Control Center */}
      <Route
        path="/admin/super"
        element={
          <AdminGate currentUser={currentUser} loadingUser={loadingUser}>
            <SuperAdminGate currentUser={currentUser}>
              <Layout currentUser={currentUser} profile={profile}>
                <SuperAdminCenter />
              </Layout>
            </SuperAdminGate>
          </AdminGate>
        }
      />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <PublicShell profile={profile}>
            <div className="py-20 text-center space-y-4">
              <span className="text-4xl font-serif font-bold text-amber-900 block">404</span>
              <h1 className="text-2xl font-bold font-serif text-stone-900">Page Not Found</h1>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                The resource you are looking for has been moved or does not exist in the public catalogue.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-800 transition"
              >
                <ArrowLeft size={14} /> Return to Home
              </Link>
            </div>
          </PublicShell>
        }
      />
    </Routes>
    </AuthProvider>
  );
}
