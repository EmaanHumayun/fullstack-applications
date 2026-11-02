import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Copy,
  Check,
  Menu,
  X,
  FileBadge,
  ExternalLink,
  Code2,
  Workflow,
  Sparkles,
  Command,
  CheckCircle2,
  Trophy,
  GraduationCap,
  BookOpen,
  Target,
  Layers,
  Shield,
  Cpu,
  Cloud,
  Zap,
  Server,
  Globe,
  Tag,
  BarChart3,
  Terminal,
  Activity,
  Lock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../lib/api.js';
import {
  Button,
  Toast,
  ProjectCard,
  SectionHeading,
  EmptyState,
  Modal
} from '../components.jsx';
import { WorkspaceChoiceModal } from '../components/WorkspaceChoiceModal.jsx';
import { initActiveTheme } from '../lib/theme.js';
import { getDomainIcon } from './admin/AdminDomains.jsx';
import { getPlatformIcon } from './admin/AdminSocialLinks.jsx';

const fallbackProfile = {
  name: 'Emaan Humayun',
  headline: 'DevOps & Site Reliability Engineer · Kubernetes · Cloud Infrastructure',
  bio: 'DevOps & Site Reliability Engineer building automated, fault-tolerant cloud platforms, Kubernetes clusters, and GitOps delivery pipelines. Passionate about infrastructure as code, continuous observability, and high-availability systems.',
  githubUrl: 'https://github.com/EmaanHumayun',
  linkedinUrl: 'https://linkedin.com/in/emaanhumayun',
  contactEmail: 'emaan.humayun@example.com'
};

/**
 * PUBLIC NAVIGATION (Compact, Consistent & Professional)
 */
export function PublicNav({ profile, content }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const nav = content?.navigation || {};
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `#${targetId}`);
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  const initials = (profile?.name || 'Emaan Humayun')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('');

  return (
    <>
      <header className={`public-nav-sticky-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="public-nav">
          <Link to="/" className="brand" aria-label="Go to homepage">
            <span className="brand-mark">{initials || 'EH'}</span>
            <span className="flex flex-col">
              <strong className="text-sm sm:text-base font-bold tracking-tight text-ink whitespace-nowrap font-display">
                {profile?.name || 'Emaan Humayun'}
              </strong>
              <small className="text-[9px] font-mono font-bold tracking-widest text-primary uppercase whitespace-nowrap">
                WORKSPACE
              </small>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary navigation">
            <Link to="/projects">{nav.projectsLabel || 'Projects'}</Link>
            <Link to="/domains">{nav.domainsLabel || 'Domains'}</Link>
            <Link to="/skills">{nav.skillsLabel || 'Skills'}</Link>
            <Link to="/analytics">{nav.analyticsLabel || 'Analytics'}</Link>
            <Link to="/roadmaps">{nav.roadmapsLabel || 'Roadmaps'}</Link>
            <Link to="/practice-labs">{nav.practiceLabsLabel || 'Labs'}</Link>
            <Link to="/assignments">{nav.assignmentsLabel || 'Assignments'}</Link>
            <Link to="/credentials">{nav.certificatesLabel || 'Credentials'}</Link>
            <Link to="/notes">{nav.notesLabel || 'Notes'}</Link>
            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>{nav.contactLabel || 'Contact'}</a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {profile?.githubUrl && (
              <Button
                as="a"
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                size="sm"
              >
                <Github size={15} /> GitHub
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setChoiceModalOpen(true)}
              variant="primary"
              size="sm"
            >
              Workspace <ArrowUpRight size={14} />
            </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Accessible Mobile Drawer */}
      {mobileOpen && (
        <div id="mobile-nav-drawer" className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="mobile-nav-content">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-display font-bold text-sm text-ink">Navigation</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-ink transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/projects"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.projectsLabel || 'Projects & Work'}
              </Link>
              <Link
                to="/domains"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.domainsLabel || 'Technical Domains'}
              </Link>
              <Link
                to="/skills"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.skillsLabel || 'Skills & Competencies'}
              </Link>
              <Link
                to="/analytics"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.analyticsLabel || 'Analytics & Evidence'}
              </Link>
              <Link
                to="/roadmaps"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.roadmapsLabel || 'Learning Roadmaps'}
              </Link>
              <Link
                to="/practice-labs"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.practiceLabsLabel || 'Practice Labs & Sandboxes'}
              </Link>
              <Link
                to="/assignments"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.assignmentsLabel || 'Technical Assignments'}
              </Link>
              <Link
                to="/credentials"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.certificatesLabel || 'Certificates & Credentials'}
              </Link>
              <Link
                to="/notes"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.notesLabel || 'Engineering Notes'}
              </Link>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, 'contact')}
                className="text-sm font-bold py-2 text-ink hover:text-primary transition"
              >
                {nav.contactLabel || 'Contact & Inquiries'}
              </a>
            </div>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setChoiceModalOpen(true);
                }}
                variant="primary"
                size="md"
                className="w-full justify-center"
              >
                Workspace <ArrowUpRight size={15} />
              </Button>
              {profile?.githubUrl && (
                <Button
                  as="a"
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  size="md"
                  className="w-full justify-center"
                >
                  <Github size={15} /> GitHub Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Choice Modal: Viewer vs Admin Workspace Access */}
      <WorkspaceChoiceModal
        isOpen={choiceModalOpen}
        onClose={() => setChoiceModalOpen(false)}
      />
    </>
  );
}

/**
 * WORLD-CLASS ENGINEERING FOOTER
 * Modern, multi-column architecture showcase with live node telemetry,
 * quick navigation, core engineering tenets, social channels, and smooth scroll.
 */
export function PublicFooter({ profile, content, socialLinks = [] }) {
  const footer = content?.footer || {};
  const nav = content?.navigation || {};
  const initials = (profile?.name || 'Emaan Humayun')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const footerSocials = (socialLinks || []).filter(
    l => l.isEnabled !== false && (!l.placement || l.placement.includes('footer'))
  );

  return (
    <footer className="public-footer-advanced border-t border-border bg-surface/90 backdrop-blur-md">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 py-16">
        {/* Balanced Top Grid (4 Columns Total) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-border">
          {/* Column 1 & 2: Brand, Identity & Availability (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                {initials || 'EH'}
              </span>
              <div>
                <span className="block font-display font-extrabold text-lg text-ink tracking-tight">
                  {profile?.name || 'Emaan Humayun'}
                </span>
                <span className="block font-mono text-[11px] font-bold text-primary tracking-wider uppercase">
                  {profile?.headline || 'DevOps & Cloud Infrastructure Engineer'}
                </span>
              </div>
            </Link>

            <p className="text-sm text-ink/80 font-medium leading-relaxed max-w-md">
              {profile?.bio ||
                'Building practical software, reliable cloud infrastructure, Kubernetes platforms, and automated delivery pipelines from first principles.'}
            </p>

            {/* Live Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs font-mono font-bold text-ink shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Available for Cloud Infrastructure &amp; SRE Engagements</span>
            </div>

            {/* Social Channels Row */}
            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              {footerSocials.length > 0 ? (
                footerSocials.map(s => {
                  const IconComp = getPlatformIcon(s.platform);
                  const isMail = (s.url || '').startsWith('mailto:');
                  return (
                    <a
                      key={s._id || s.url}
                      href={s.url}
                      target={isMail ? '_self' : '_blank'}
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-surface border border-border hover:border-primary hover:text-primary flex items-center justify-center text-ink/75 transition-all shadow-xs hover:-translate-y-0.5"
                      title={s.label || s.platform}
                      aria-label={s.label || s.platform}
                    >
                      <IconComp size={16} />
                    </a>
                  );
                })
              ) : (
                <>
                  {profile?.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-surface border border-border hover:border-primary hover:text-primary flex items-center justify-center text-ink/75 transition-all shadow-xs hover:-translate-y-0.5"
                      title="GitHub Profile"
                      aria-label="GitHub Profile"
                    >
                      <Github size={16} />
                    </a>
                  )}
                  {profile?.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-surface border border-border hover:border-primary hover:text-primary flex items-center justify-center text-ink/75 transition-all shadow-xs hover:-translate-y-0.5"
                      title="LinkedIn Profile"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {profile?.contactEmail && (
                    <a
                      href={`mailto:${profile.contactEmail}`}
                      className="w-9 h-9 rounded-xl bg-surface border border-border hover:border-primary hover:text-primary flex items-center justify-center text-ink/75 transition-all shadow-xs hover:-translate-y-0.5"
                      title="Send Email"
                      aria-label="Send Email"
                    >
                      <Mail size={16} />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Column 3: Navigation & Exploration */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-ink/80">
              <li>
                <Link to="/projects" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Code2 size={15} className="text-primary" />
                  <span>{nav.projectsLabel || 'Projects & Repos'}</span>
                </Link>
              </li>
              <li>
                <Link to="/domains" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Layers size={15} className="text-primary" />
                  <span>{nav.domainsLabel || 'Technical Domains'}</span>
                </Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Cpu size={15} className="text-primary" />
                  <span>{nav.skillsLabel || 'Skills & Toolsets'}</span>
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-primary transition-colors flex items-center gap-2">
                  <BarChart3 size={15} className="text-primary" />
                  <span>{nav.analyticsLabel || 'Analytics & Telemetry'}</span>
                </Link>
              </li>
              <li>
                <Link to="/roadmaps" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Workflow size={15} className="text-primary" />
                  <span>{nav.roadmapsLabel || 'Learning Roadmaps'}</span>
                </Link>
              </li>
              <li>
                <Link to="/practice-labs" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Terminal size={15} className="text-primary" />
                  <span>{nav.practiceLabsLabel || 'Practice Labs'}</span>
                </Link>
              </li>
              <li>
                <Link to="/assignments" className="hover:text-primary transition-colors flex items-center gap-2">
                  <FileBadge size={15} className="text-primary" />
                  <span>{nav.assignmentsLabel || 'Assignments'}</span>
                </Link>
              </li>
              <li>
                <Link to="/credentials" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Trophy size={15} className="text-primary" />
                  <span>{nav.certificatesLabel || 'Credentials & Proof'}</span>
                </Link>
              </li>
              <li>
                <Link to="/notes" className="hover:text-primary transition-colors flex items-center gap-2">
                  <BookOpen size={15} className="text-primary" />
                  <span>{nav.notesLabel || 'Knowledge Notes'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect & Direct Access */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              Connect &amp; Access
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-ink/80">
              {profile?.contactEmail && (
                <li>
                  <a
                    href={`mailto:${profile.contactEmail}?subject=Engineering%20Hub%20Inquiry`}
                    className="hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Mail size={15} className="text-primary" />
                    <span>Direct Email</span>
                  </a>
                </li>
              )}
              {profile?.githubUrl && (
                <li>
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Github size={15} className="text-primary" />
                    <span>GitHub Profile</span>
                  </a>
                </li>
              )}
              {profile?.linkedinUrl && (
                <li>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Linkedin size={15} className="text-primary" />
                    <span>LinkedIn Network</span>
                  </a>
                </li>
              )}
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    const el = document.getElementById('contact');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Terminal size={15} className="text-primary" />
                  <span>{nav.contactLabel || 'Contact Hub'}</span>
                </a>
              </li>
              <li className="pt-2 border-t border-border/60">
                <Link
                  to="/admin/login"
                  className="text-xs font-mono font-bold text-muted hover:text-primary transition-colors flex items-center gap-1.5"
                  title="Workspace Administration Portal"
                >
                  <Lock size={12} />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-ink/70">
          <p>
            {footer.copyrightText && !footer.copyrightText.includes('Learn in public')
              ? footer.copyrightText
              : `© ${currentYear} ${profile?.name || 'Emaan Humayun'}. All rights reserved.`}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-ink hover:text-primary hover:border-primary transition font-bold text-xs shadow-2xs cursor-pointer group"
              aria-label="Scroll back to top of page"
            >
              <span>Back to Top</span>
              <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * CLEAN AUTHENTIC TYPEWRITER TEXT FOR HERO ROLES
 */
function TypewriterRoles({
  roles = [
    'DevOps & Site Reliability Engineer',
    'Kubernetes & Cloud Infrastructure Architect',
    'Infrastructure as Code (Terraform & Helm)',
    'GitOps & Automated CI/CD Pipelines',
    'Multi-Cloud Platforms (AWS • Docker • Linux)'
  ],
  typingSpeed = 55,
  deletingSpeed = 28,
  pauseDuration = 2600
}) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!roles || roles.length === 0) return;

    const currentRole = roles[roleIndex % roles.length];
    let timer;

    if (!isDeleting) {
      if (displayedText.length < currentRole.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setRoleIndex(prev => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, roleIndex, roles, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className="inline-flex items-center text-primary font-mono font-bold tracking-wider">
      <span>{displayedText}</span>
      <span className="inline-block w-[2px] h-[1em] bg-primary ml-1 animate-pulse" aria-hidden="true" />
    </span>
  );
}

/**
 * FIGURE & NUMBER COUNT-UP ANIMATION FOR METRICS & STATS
 */
function AnimatedCounter({ target = 0, duration = 1500, padZeros = 2, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    const numericTarget = typeof target === 'number' ? target : parseInt(target, 10) || 0;
    if (numericTarget <= 0) {
      setCount(0);
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const runCountAnimation = () => {
      startTime = performance.now();
      setIsSettled(false);

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ultra-smooth exponential ease-out deceleration
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.round(easeProgress * numericTarget);
        setCount(currentVal);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setCount(numericTarget);
          setIsSettled(true);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    };

    if (!ref.current) {
      runCountAnimation();
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          runCountAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [target, duration]);

  const formatted = padZeros && count < Math.pow(10, padZeros)
    ? String(count).padStart(padZeros, '0')
    : String(count);

  return (
    <span
      ref={ref}
      className={`inline-flex items-baseline tabular-nums font-black transition-transform duration-300 ${
        isSettled ? 'scale-100' : 'scale-98'
      }`}
    >
      {prefix && <span>{prefix}</span>}
      <span>{formatted}</span>
      {suffix && (
        <span className="text-[0.68em] font-extrabold opacity-80 ml-0.5" aria-hidden="true">
          {suffix}
        </span>
      )}
    </span>
  );
}

/**
 * DYNAMIC SYSTEM BLUEPRINT TERMINAL CARD
 * Interactive 3D tilt, gentle floating levitation, live telemetry stream,
 * active dynamic role typing, multi-tab inspector, and ping simulation.
 */
function DynamicSystemBlueprint({ profile, domains = [], genuineProjects = [] }) {
  const [activeTab, setActiveTab] = useState('blueprint'); // 'blueprint' | 'telemetry' | 'architecture'
  const [copied, setCopied] = useState(false);
  const [liveLatency, setLiveLatency] = useState(12);
  const [dynamicRoleIndex, setDynamicRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState('DevOps Engineer');
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });
  const cardRef = useRef(null);

  const roles = useMemo(() => [
    'DevOps Engineer',
    'Site Reliability Engineer (SRE)',
    'Kubernetes Specialist',
    'Cloud Platform Architect',
    'GitOps & CI/CD Lead'
  ], []);

  // Character-by-character typing within code
  useEffect(() => {
    if (activeTab !== 'blueprint') return;
    const current = roles[dynamicRoleIndex % roles.length];
    let timer;

    if (!isDeletingRole) {
      if (displayedRole.length < current.length) {
        timer = setTimeout(() => {
          setDisplayedRole(current.slice(0, displayedRole.length + 1));
        }, 55);
      } else {
        timer = setTimeout(() => {
          setIsDeletingRole(true);
        }, 2600);
      }
    } else {
      if (displayedRole.length > 0) {
        timer = setTimeout(() => {
          setDisplayedRole(current.slice(0, displayedRole.length - 1));
        }, 28);
      } else {
        setIsDeletingRole(false);
        setDynamicRoleIndex(prev => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedRole, isDeletingRole, dynamicRoleIndex, roles, activeTab]);

  // Live ping latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLatency(Math.floor(Math.random() * 5) + 10);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Interactive 3D Parallax Tilt Handler
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6.5;
    const rotateY = ((x - centerX) / centerX) * 6.5;
    setTilt({ x: rotateX, y: rotateY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, isHovered: false });
  };

  const handleCopyCode = async () => {
    const code = activeTab === 'blueprint' 
      ? `// cluster.tf — Production Infrastructure as Code
module "production_k8s" {
  source          = "terraform-aws/eks"
  cluster_name    = "k8s-prod-us-east-1"
  cluster_version = "1.30"
  lead_engineer   = "${profile?.name || 'Emaan Humayun'}"
  role            = "${displayedRole}"
  gitops_sync     = "argo-cd/v2.10"
  node_autoscaler = { min = 4, max = 32, type = "c6i.2xlarge" }
  observability   = ["Prometheus", "Grafana", "OpenTelemetry"]
  sla_uptime      = "99.99%"
  zero_downtime   = true
}`
      : activeTab === 'telemetry'
      ? `[K8S] Production EKS: 16 nodes healthy (0 pods failing)
[CI/CD] GitHub Actions: build & push to ECR SUCCESS (24s)
[ARGO] GitOps controller: sync complete -> rev #3e91da live
[INGRESS] Envoy API gateway: 0% packet loss, p99: ${liveLatency}ms
[SECURITY] Trivy image audit: 0 critical vulnerabilities
[PROMETHEUS] Scraping 64 exporter endpoints (100% UP)
[SRE] SLA availability: 99.99% uptime target MET`
      : JSON.stringify({
          cluster: "k8s-prod-us-east-1",
          devopsLead: profile?.name || 'Emaan Humayun',
          role: displayedRole,
          orchestrator: "Kubernetes v1.30",
          gitopsEngine: "ArgoCD v2.10",
          iacDriver: "Terraform Cloud",
          activeNodes: 16,
          uptimeSLA: "99.99%",
          clusterLatency: `${liveLatency}ms`
        }, null, 2);

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="hero-art relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Ambient Moving Gradient Aura */}
      <div className="art-glow" />

      {/* Main Elevated Card with 3D Tilt & Floating Levitation */}
      <div
        ref={cardRef}
        className={`art-center ${tilt.isHovered ? '' : 'art-floating'}`}
        style={tilt.isHovered ? {
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
        } : undefined}
      >
        {/* Animated Light Scanline Ray */}
        <div className="art-scanline" />

        {/* Card Header with Window Controls & Interactive Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block shadow-xs" title="Terminal Window" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-xs" />
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex items-center gap-1 bg-border/40 p-0.5 rounded-lg text-[10.5px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('blueprint')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'blueprint'
                  ? 'bg-surface text-primary shadow-xs font-bold'
                  : 'text-text-muted hover:text-ink'
              }`}
            >
              cluster.tf
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'telemetry'
                  ? 'bg-surface text-primary shadow-xs font-bold'
                  : 'text-text-muted hover:text-ink'
              }`}
            >
              <Activity size={10} className="text-emerald-500 animate-pulse" />
              pipeline.log
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-surface text-primary shadow-xs font-bold'
                  : 'text-text-muted hover:text-ink'
              }`}
            >
              k8s-cluster.json
            </button>
          </div>

          {/* Quick Copy / Action Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 rounded-md text-text-muted hover:text-primary hover:bg-border/40 transition-colors cursor-pointer"
            title="Copy snippet"
            aria-label="Copy code snippet"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        </div>

        {/* Live Status Sub-header */}
        <div className="flex items-center justify-between text-[11px] font-mono pb-2 border-b border-border/50">
          <span className="art-kicker flex items-center gap-1.5 font-bold">
            <Terminal size={12} className="text-primary" />
            {activeTab === 'blueprint' ? 'TERRAFORM IaC' : activeTab === 'telemetry' ? 'CI/CD & GITOPS' : 'K8S SPEC v1.30'}
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{liveLatency}ms node</span>
          </span>
        </div>

        {/* Tab 1: cluster.tf with line numbers & dynamic typing */}
        {activeTab === 'blueprint' && (
          <div className="art-code flex items-start">
            <div className="art-gutter flex flex-col font-mono text-[11px] leading-[2.05]">
              <span>01</span>
              <span>02</span>
              <span>03</span>
              <span>04</span>
              <span>05</span>
              <span>06</span>
              <span>07</span>
              <span>08</span>
              <span>09</span>
              <span>10</span>
            </div>
            <div className="flex-1 font-mono text-xs leading-[2.05] text-ink overflow-x-auto">
              <div><span className="code-purple">module</span> <span className="code-gold">"production_cluster"</span> {'{'}</div>
              <div className="code-indent">source = <span className="code-gold">"terraform-aws/eks"</span>,</div>
              <div className="code-indent">cluster_name = <span className="code-gold">"k8s-prod-us-east"</span>,</div>
              <div className="code-indent">
                role = <span className="code-gold font-bold">"{displayedRole}"</span>
                <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 animate-pulse" />
                ,
              </div>
              <div className="code-indent">orchestrator = <span className="code-gold">"Kubernetes-v1.30"</span>,</div>
              <div className="code-indent">gitops_sync = <span className="code-gold">"ArgoCD-v2.10"</span>,</div>
              <div className="code-indent">iac_driver = <span className="code-gold">"Terraform"</span>,</div>
              <div className="code-indent">sla_uptime = <span className="text-emerald-600 dark:text-emerald-400 font-bold">"99.99%"</span>,</div>
              <div className="code-indent">zero_downtime = <span className="code-green">true</span></div>
              <div>{'}'};</div>
            </div>
          </div>
        )}

        {/* Tab 2: pipeline.log live console stream */}
        {activeTab === 'telemetry' && (
          <div className="art-code flex items-start">
            <div className="art-gutter flex flex-col font-mono text-[11px] leading-[2.05]">
              <span>01</span>
              <span>02</span>
              <span>03</span>
              <span>04</span>
              <span>05</span>
              <span>06</span>
              <span>07</span>
            </div>
            <div className="flex-1 font-mono text-xs leading-[2.05] text-ink overflow-x-auto">
              <div><span className="text-emerald-600 font-bold">&gt; [K8S]</span> Production EKS: 16 nodes healthy (0 pods failing)</div>
              <div><span className="text-primary font-bold">&gt; [CI/CD]</span> GitHub Actions: build & push to ECR SUCCESS (24s)</div>
              <div><span className="text-blue-500 font-bold">&gt; [ARGO]</span> GitOps controller: sync complete -&gt; rev #3e91da live</div>
              <div><span className="text-primary font-bold">&gt; [INGRESS]</span> Envoy gateway: 0% drop, p99 latency: <span className="text-emerald-600 font-bold">{liveLatency}ms</span></div>
              <div><span className="text-amber-600 font-bold">&gt; [SEC]</span> Trivy container scan: 0 critical vulnerabilities</div>
              <div><span className="text-emerald-600 font-bold">&gt; [PROMETHEUS]</span> Scraping 64 exporter endpoints (100% UP)</div>
              <div className="text-muted"><span className="text-primary font-bold">&gt; [SRE]</span> SLA target: 99.99% availability <span className="animate-pulse">_</span></div>
            </div>
          </div>
        )}

        {/* Tab 3: k8s-cluster.json structured spec */}
        {activeTab === 'architecture' && (
          <div className="art-code flex items-start">
            <div className="art-gutter flex flex-col font-mono text-[11px] leading-[2.05]">
              <span>01</span>
              <span>02</span>
              <span>03</span>
              <span>04</span>
              <span>05</span>
              <span>06</span>
              <span>07</span>
              <span>08</span>
            </div>
            <div className="flex-1 font-mono text-xs leading-[2.05] text-ink overflow-x-auto">
              <div>{'{'}</div>
              <div className="code-indent">"cluster": <span className="code-gold">"k8s-prod-us-east-1"</span>,</div>
              <div className="code-indent">"devopsLead": <span className="code-gold">"{profile?.name || 'Emaan Humayun'}"</span>,</div>
              <div className="code-indent">"orchestrator": <span className="code-gold">"Kubernetes v1.30"</span>,</div>
              <div className="code-indent">"activeNodes": <span className="code-purple font-bold">16</span>,</div>
              <div className="code-indent">"delivery": <span className="code-gold">"GitOps & ArgoCD"</span>,</div>
              <div className="code-indent">"uptimeSLA": <span className="code-gold">"99.99%"</span>,</div>
              <div className="code-indent">"clusterStatus": <span className="code-green">"HEALTHY_RUNNING"</span></div>
              <div>{'}'}</div>
            </div>
          </div>
        )}

        {/* Card Footer with Live Animated Metric Chips */}
        <div className="art-bottom">
          <span className="flex items-center gap-1.5 font-bold">
            <Server size={14} className="text-primary" />
            <AnimatedCounter target={16} padZeros={1} /> Nodes Active
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <Workflow size={14} className="text-gold" />
            Zero-Downtime
          </span>
          <span className="flex items-center gap-1.5 text-accent font-bold">
            <Shield size={14} className="animate-pulse" />
            GitOps Verified
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * AWWWARDS-INSPIRED DEVOPS TOOLCHAIN & CLOUD ECOSYSTEM MATRIX
 * Modern, executive 3x3 capability architecture with live status,
 * authentic icons, and interactive category filtering.
 */
function getToolIcon(tech) {
  const name = (tech?.name || '').toLowerCase();
  const cat = (tech?.category || '').toLowerCase();
  if (name.includes('kube') || name.includes('k8s')) return Layers;
  if (name.includes('docker') || name.includes('container')) return Server;
  if (name.includes('linux') || name.includes('bash') || name.includes('shell')) return Terminal;
  if (name.includes('terraform') || name.includes('iac')) return Code2;
  if (name.includes('aws') || name.includes('gcp') || name.includes('azure') || name.includes('cloud')) return Cloud;
  if (name.includes('helm')) return Tag;
  if (name.includes('ci/cd') || name.includes('action') || name.includes('pipeline') || name.includes('workflow')) return Workflow;
  if (name.includes('argo') || name.includes('gitops')) return CheckCircle2;
  if (name.includes('prometh') || name.includes('grafana') || name.includes('observ') || name.includes('monitor')) return Activity;
  if (name.includes('python') || name.includes('node') || name.includes('code') || name.includes('rust')) return Code2;
  if (name.includes('sec') || name.includes('vault') || name.includes('shield')) return Shield;
  if (name.includes('ai') || name.includes('llm')) return Cpu;
  return Layers;
}

export function DevOpsToolchainMatrix({ skills = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const activeSkills = useMemo(() => {
    return (skills || []).filter(s => !s.isArchived && s.visibility !== 'private');
  }, [skills]);

  // Extract unique categories from actual user skills
  const categories = useMemo(() => {
    if (!activeSkills.length) return [];
    const set = new Set();
    activeSkills.forEach(s => {
      const cat = s.category || s.subcategory;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [activeSkills]);

  const filteredTools = useMemo(() => {
    if (activeCategory === 'all') return activeSkills;
    return activeSkills.filter(
      (s) => (s.category || s.subcategory) === activeCategory
    );
  }, [activeCategory, activeSkills]);

  if (activeSkills.length === 0) {
    return (
      <section className="toolchain-matrix-card" aria-label="DevOps Toolchain & Cloud Infrastructure Ecosystem">
        <div className="toolchain-matrix-surface p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Layers size={22} />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            Cloud Native Ecosystem
          </span>
          <h2 className="font-display font-extrabold text-base sm:text-lg text-ink tracking-tight mt-1 mb-2">
            DevOps Toolchain &amp; Cloud Infrastructure Matrix
          </h2>
          <p className="text-xs text-muted max-w-md mx-auto mb-5 leading-relaxed">
            No tools or skills added to the workspace yet. As soon as you add your tools, cloud platforms, and engineering skills in the Admin Console, they will sync live here.
          </p>
          <Link
            to="/admin/skills"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105 transition shadow-xs"
          >
            <span>Add Skills in Admin</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="toolchain-matrix-card" aria-label="DevOps Toolchain & Cloud Infrastructure Ecosystem">
      <div className="toolchain-matrix-surface p-5 sm:p-6">
        {/* Architectural Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                Cloud Native Ecosystem
              </span>
              <span className="text-[10px] font-mono text-muted px-2 py-0.5 rounded-full border border-border bg-secondary-background font-semibold">
                {activeSkills.length} Verified {activeSkills.length === 1 ? 'Skill' : 'Skills'}
              </span>
            </div>
            <h2 className="font-display font-extrabold text-base sm:text-lg text-ink tracking-tight">
              DevOps Toolchain &amp; Cloud Infrastructure Matrix
            </h2>
            <p className="text-xs text-muted leading-relaxed max-w-xl">
              Code-defined platforms, automated container orchestration, GitOps delivery pipelines, and continuous observability.
            </p>
          </div>

          {/* Dynamic Interactive Filter Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary-background/80 border border-border/80 self-start md:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`toolchain-filter-btn whitespace-nowrap ${
                  activeCategory === 'all' ? 'is-active' : ''
                }`}
              >
                <span>All</span>
                <span className="ml-1.5 opacity-60 font-normal">({activeSkills.length})</span>
              </button>
              {categories.map((cat) => {
                const count = activeSkills.filter(s => (s.category || s.subcategory) === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`toolchain-filter-btn whitespace-nowrap ${
                      activeCategory === cat ? 'is-active' : ''
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="ml-1.5 opacity-60 font-normal">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Precision Engineering Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-5">
          {filteredTools.map((tech) => {
            const Icon = getToolIcon(tech);
            const role = tech.publicDescription || tech.description || tech.subcategory || `${tech.level || 'Intermediate'} Proficiency`;
            return (
              <div key={tech._id || tech.name} className="toolchain-grid-item group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="toolchain-icon-box">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-display font-bold text-sm text-ink truncate block group-hover:text-primary transition-colors">
                      {tech.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted truncate block">
                      {role}
                    </span>
                  </div>
                </div>
                <span className="toolchain-pill-tag">
                  {tech.proficiencyPercentage ? `${tech.proficiencyPercentage}%` : tech.level || 'Practiced'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Executive Footnote Ribbon */}
        <div className="mt-5 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-muted">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
            <span>Continuous GitOps Reconciliation · Self-Healing Production State</span>
          </div>
          <Link to="/skills" className="hover:text-primary transition flex items-center gap-1 font-semibold">
            <span>Explore All Skills</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * PUBLIC HOME (Layer 1: Curated Professional Overview)
 */
export function PublicHome() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [siteContent, setSiteContent] = useState(null);
  const [domains, setDomains] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCertModal, setSelectedCertModal] = useState(null);
  const heroRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash && !loading) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.hash, loading]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopy = async (text, successMsg) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg || 'Copied to clipboard');
    } catch {
      showToast(text);
    }
  };

  useEffect(() => {
    initActiveTheme();
    Promise.all([
      api('/profile').catch(() => fallbackProfile),
      api('/site-content').catch(() => null),
      api('/domains').catch(() => []),
      api('/social-links').catch(() => []),
      api('/projects').catch(() => []),
      api('/skills').catch(() => []),
      api('/milestones').catch(() => []),
      api('/certificates').catch(() => [])
    ])
      .then(([p, sc, doms, soc, pr, s, m, c]) => {
        if (p?.name) setProfile(p);
        setSiteContent(sc);
        setDomains(doms || []);
        setSocialLinks(soc || []);
        setProjects(pr || []);
        setSkills(s || []);
        setMilestones(m || []);
        setCerts(c || []);

        if (sc?.seo?.title) {
          document.title = sc.seo.title;
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const ctx = gsap.context(() => {
        gsap.fromTo(
          heroRef.current.querySelectorAll('[data-hero]'),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' }
        );
      }, heroRef.current);
      return () => ctx.revert();
    }
  }, []);

  const hero = siteContent?.hero || {};
  const about = siteContent?.about || {};
  const sections = siteContent?.sections || {};

  const genuineProjects = useMemo(() => {
    return projects.filter(
      p => p.type !== 'folder' && !p.isArchived && !p.title.includes('Component')
    );
  }, [projects]);

  // Curated Featured Projects: Up to 3 projects on homepage as per Section 4 requirement
  const featuredProjects = useMemo(() => {
    return [...genuineProjects]
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      .slice(0, 3);
  }, [genuineProjects]);

  const completedMilestones = useMemo(() => {
    return milestones.filter(m => m.status === 'completed');
  }, [milestones]);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const emailAddress = sections.contact?.primaryEmail || profile?.contactEmail || 'emaan.humayun@example.com';

  const handleCopyEmail = async () => {
    if (!emailAddress) return;
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      showToast('Email address copied to clipboard');
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      showToast(emailAddress);
    }
  };

  const contactSocials = (socialLinks || []).filter(
    l => l.isEnabled !== false && (!l.placement || l.placement.includes('contact'))
  );

  const networkChannels = useMemo(() => {
    if (contactSocials.length > 0) {
      return contactSocials
        .filter(s => s.platform !== 'email' && !s.url?.startsWith('mailto:'))
        .map(s => {
          let label = s.label || s.platform;
          if (s.platform === 'twitter' || s.platform === 'x') label = s.label || 'X / Twitter';
          if (s.platform === 'whatsapp') label = s.label || 'WhatsApp';

          let sublabel = s.username
            ? (s.username.startsWith('@') ? s.username : `@${s.username}`)
            : (s.sublabel || (s.platform === 'whatsapp' ? 'Instant Direct Message' : s.platform === 'github' ? 'Code & IaC Repositories' : s.platform === 'linkedin' ? 'Professional Network & SRE' : 'Direct Channel'));

          return {
            id: s._id || s.platform,
            label,
            sublabel,
            url: s.url,
            platform: s.platform,
            icon: getPlatformIcon(s.platform)
          };
        });
    }

    const channels = [];
    if (profile?.githubUrl) {
      channels.push({
        id: 'gh-primary',
        label: 'GitHub',
        sublabel: 'Code & IaC Repositories',
        url: profile.githubUrl,
        platform: 'github',
        icon: Github
      });
    }
    if (profile?.linkedinUrl) {
      channels.push({
        id: 'li-primary',
        label: 'LinkedIn',
        sublabel: 'Professional Network & SRE',
        url: profile.linkedinUrl,
        platform: 'linkedin',
        icon: Linkedin
      });
    }
    return channels;
  }, [contactSocials, profile]);

  const heroSocials = (socialLinks || []).filter(
    l => l.isEnabled !== false && (!l.placement || l.placement.includes('hero'))
  );

  return (
    <div className="public-shell">
      <Toast message={toastMessage} />
      <PublicNav profile={profile} content={siteContent} />

      {/* SECTION 2 — HERO: Balanced, Intentional First-Screen Experience */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-copy">
          <div data-hero className="mt-2">
            {/* Dynamic Typewriter Roles - Clean & Grounded */}
            <div className="eyebrow flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase mb-2 text-primary">
              <span className="w-3 h-0.5 bg-primary/70 rounded-full inline-block" />
              <TypewriterRoles />
            </div>

            <h1 className="heading-display">
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-ink leading-[1.08]">
                {profile?.name || 'Emaan Humayun'}
              </span>
              <span className="block text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-primary mt-2.5 leading-tight tracking-tight">
                {hero.heading || 'Automating cloud infrastructure.'}{' '}
                <span className="text-ink/80 font-semibold">{hero.headingAccent || 'From commit to self-healing cluster.'}</span>
              </span>
            </h1>
          </div>

          <p data-hero className="text-sm sm:text-base text-ink/80 font-normal leading-relaxed mt-4 max-w-xl">
            {hero.description ||
              profile.bio ||
              'DevOps & Site Reliability Engineer specializing in resilient multi-cloud architectures, Kubernetes orchestration, zero-downtime CI/CD delivery pipelines, and Infrastructure as Code. Engineering scalable, observable, and automated production platforms.'}
          </p>

          <div data-hero className="hero-actions mt-7 space-y-4">
            {/* Primary Action Button */}
            <div className="flex items-center gap-3">
              <Link
                to="/projects"
                onClick={(e) => {
                  const el = document.getElementById('projects');
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.history.pushState(null, '', '#projects');
                  }
                }}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-white font-display font-bold text-sm sm:text-base shadow-md hover:shadow-xl hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>{hero.primaryCtaText || 'Explore Cloud Infrastructure'}</span>
                <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Direct Engineering Contact / Hero Socials — Compact, Underneath & Ordered */}
            {heroSocials.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {heroSocials.map(s => {
                  const IconComp = getPlatformIcon(s.platform);
                  const isMail = (s.url || '').startsWith('mailto:');
                  return (
                    <a
                      key={s._id || s.url}
                      href={s.url}
                      target={isMail ? '_self' : '_blank'}
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-ink/80 hover:text-primary hover:border-primary text-xs font-semibold shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all duration-150"
                      title={s.label || s.platform}
                      aria-label={s.label || s.platform}
                    >
                      <IconComp size={13} className="shrink-0 text-ink/60 group-hover:text-primary transition-colors" />
                      <span>{s.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Hero Architecture Dynamic Interactive Visual Composition */}
        <div data-hero className="w-full flex justify-center lg:justify-end">
          <DynamicSystemBlueprint
            profile={profile}
            domains={domains}
            genuineProjects={genuineProjects}
          />
        </div>
      </section>

      {/* SECTION 2.5 — AWWWARDS-INSPIRED DEVOPS TOOLCHAIN MATRIX */}
      <DevOpsToolchainMatrix skills={skills} />

      {/* SECTION 3 — PROFESSIONAL PROOF STATS STRIP (Interactive, Animated & Eye-Catching) */}
      <section className="stat-strip-container" aria-label="Professional Engineering Telemetry">
        {/* Live System Telemetry Status Bar */}
        <div className="stat-strip-telemetry-bar">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-ink uppercase">
              Production Telemetry Verified
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-muted">
              · GitOps Active Continuous Sync
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
            <Activity size={13} className="text-emerald-500 animate-pulse" />
            <span className="font-semibold text-ink">99.99%</span>
            <span className="hidden xs:inline">Target SLA</span>
          </div>
        </div>

        {/* 4 Clean Editorial Metrics Cards */}
        <div className="stat-strip-grid">
          {/* Card 1: Public Repositories */}
          <Link
            to="/projects"
            title="Explore All Published Projects & IaC Repositories"
            className="stat-card stat-card-emerald group"
          >
            <div className="stat-card-header">
              <div className="stat-icon-badge">
                <Code2 size={20} className="stat-icon text-emerald-600 dark:text-emerald-400" />
              </div>
              <ArrowUpRight size={15} className="stat-arrow" />
            </div>

            <div className="stat-card-body">
              <div className="stat-number">
                <AnimatedCounter
                  target={genuineProjects.length}
                  padZeros={2}
                  suffix={genuineProjects.length > 0 ? "+" : ""}
                />
              </div>
              <h3 className="stat-label">Public Repositories</h3>
              <p className="stat-desc">Production IaC, Helm Charts &amp; Cloud Workloads</p>
            </div>

            <div className="stat-card-progress" />
          </Link>

          {/* Card 2: Technical Domains */}
          <Link
            to="/domains"
            title="Explore Technical Architecture Domains"
            className="stat-card stat-card-indigo group"
          >
            <div className="stat-card-header">
              <div className="stat-icon-badge">
                <Layers size={20} className="stat-icon text-indigo-600 dark:text-indigo-400" />
              </div>
              <ArrowUpRight size={15} className="stat-arrow" />
            </div>

            <div className="stat-card-body">
              <div className="stat-number">
                <AnimatedCounter
                  target={domains.length}
                  padZeros={2}
                />
              </div>
              <h3 className="stat-label">Technical Domains</h3>
              <p className="stat-desc">Cloud Platform, K8s, CI/CD, SecOps &amp; SRE</p>
            </div>

            <div className="stat-card-progress" />
          </Link>

          {/* Card 3: Skills & Toolsets */}
          <Link
            to="/skills"
            title="Explore Verified Skills & Competencies"
            className="stat-card stat-card-amber group"
          >
            <div className="stat-card-header">
              <div className="stat-icon-badge">
                <Cpu size={20} className="stat-icon text-amber-600 dark:text-amber-400" />
              </div>
              <ArrowUpRight size={15} className="stat-arrow" />
            </div>

            <div className="stat-card-body">
              <div className="stat-number">
                <AnimatedCounter
                  target={skills.length}
                  padZeros={2}
                  suffix={skills.length > 0 ? "+" : ""}
                />
              </div>
              <h3 className="stat-label">Skills &amp; Toolsets</h3>
              <p className="stat-desc">Docker, Terraform, AWS, K8s, Linux &amp; Prometheus</p>
            </div>

            <div className="stat-card-progress" />
          </Link>

          {/* Card 4: Credentials & Proof */}
          <Link
            to="/credentials"
            title="Explore Verified Credentials & Deliverables"
            className="stat-card stat-card-purple group"
          >
            <div className="stat-card-header">
              <div className="stat-icon-badge">
                <Trophy size={20} className="stat-icon text-purple-600 dark:text-purple-400" />
              </div>
              <ArrowUpRight size={15} className="stat-arrow" />
            </div>

            <div className="stat-card-body">
              <div className="stat-number">
                <AnimatedCounter
                  target={certs.length + completedMilestones.length}
                  padZeros={2}
                  suffix={(certs.length + completedMilestones.length) > 0 ? "+" : ""}
                />
              </div>
              <h3 className="stat-label">Credentials &amp; Proof</h3>
              <p className="stat-desc">Industry Certifications, Key Milestones &amp; SLAs</p>
            </div>

            <div className="stat-card-progress" />
          </Link>
        </div>
      </section>

      {/* SECTION 4 — SELECTED WORK (Featured Projects: Strictly Up to 3 Cards) */}
      {sections.projects?.visible !== false && (
        <section id="projects" className="public-section border-t border-border">
          <SectionHeading
            eyebrow={sections.projects?.eyebrow || 'SELECTED WORK'}
            title={sections.projects?.title || 'Projects with an architectural purpose.'}
            description={
              sections.projects?.description ||
              'Practical systems, experiments, and engineering repositories — built from first principles and documented with real architectural trade-offs.'
            }
            action={
              <Link className="text-link inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline" to="/projects">
                Explore Project Catalog ({genuineProjects.length}) <ArrowRight size={14} />
              </Link>
            }
          />

          {loading ? (
            <div className="loading-row p-8 text-center text-sm text-muted">Loading projects…</div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map(p => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-surface border border-dashed border-border rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Code2 size={20} />
              </div>
              <h4 className="font-display font-bold text-base text-ink">No projects published yet</h4>
              <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                Projects and repositories added in the Admin Workspace will automatically sync and appear here.
              </p>
              <Link
                to="/admin/projects"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105 transition shadow-xs"
              >
                <span>Add Projects in Admin</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Catalog Exploration Footer Callout */}
          {genuineProjects.length > 0 && (
            <div className="mt-8 p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-muted">
                Looking for full architectural case studies, subdomain filters, and source repositories?
              </span>
              <Link
                to="/projects"
                className="font-bold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
              >
                Browse all {genuineProjects.length} projects in Catalog <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* SECTION 5 — ENGINEERING EXPERTISE (Compact Selection of 4 Core Domains) */}
      {sections.domains?.visible !== false && domains.length > 0 && (
        <section id="domains" className="public-section border-t border-border">
          <SectionHeading
            eyebrow={sections.domains?.eyebrow || 'SPECIALIZATIONS & DISCIPLINES'}
            title={sections.domains?.title || 'Technical domains & areas of focus.'}
            description={
              sections.domains?.description ||
              'Specialized disciplines across software engineering, artificial intelligence, security, and systems architecture.'
            }
            action={
              <Link className="text-link inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline" to="/domains">
                Explore Domain Hierarchy ({domains.length}) <ArrowRight size={14} />
              </Link>
            }
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {domains.slice(0, 4).map(dom => {
              const IconComp = getDomainIcon(dom.icon);
              return (
                <div
                  key={dom._id}
                  className="domain-card group flex flex-col justify-between p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary hover:shadow-sm transition-all duration-200"
                  style={{ borderTopWidth: 4, borderTopColor: dom.accentColor || '#6f1d1b' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform"
                        style={{ background: dom.accentColor || '#6f1d1b' }}
                      >
                        <IconComp size={18} />
                      </div>
                      <span className="font-mono text-[9.5px] bg-secondary-background text-muted px-2 py-0.5 rounded border border-border">
                        {dom.fields?.length || 0} Subdomains
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ink m-0 group-hover:text-primary transition font-display">
                      <Link to={`/domains/${dom.slug}`} className="hover:underline flex items-center justify-between">
                        <span>{dom.name}</span>
                        <ArrowRight size={13} className="text-muted group-hover:text-primary group-hover:translate-x-0.5 transition" />
                      </Link>
                    </h3>
                    <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                      {dom.description || 'Specialized focus area and project collection.'}
                    </p>

                    {/* Compact Subdomain Badges */}
                    {dom.fields && dom.fields.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/80">
                        {dom.fields.slice(0, 3).map(f => (
                          <Link
                            key={f._id}
                            to={`/domains/${dom.slug}?subdomain=${encodeURIComponent(f.slug || f.name)}`}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-background text-muted hover:text-ink border border-border transition"
                          >
                            {f.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                    <Link
                      to={`/domains/${dom.slug}`}
                      className="font-bold text-primary inline-flex items-center gap-1 hover:underline text-[11px]"
                    >
                      Domain Hub <ArrowRight size={11} />
                    </Link>
                    <Link
                      to={`/projects?domain=${encodeURIComponent(dom.name)}`}
                      className="text-muted hover:text-ink text-[11px]"
                    >
                      Projects →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Skills Cross-Link Callout */}
          <div className="mt-6 p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                <Cpu size={14} />
              </div>
              <span className="text-muted">
                Looking for verified technical frameworks, radar telemetry, and competency evidence?
              </span>
            </div>
            <Link
              to="/skills"
              className="font-bold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
            >
              Explore all {skills.length} verified skills in Skills Directory <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}

      {/* SECTION 6 — SELECTED CREDENTIALS & ACCOMPLISHMENTS (Curated 3 items) */}
      {sections.certificates?.visible !== false && certs.length > 0 && (
        <section id="certificates" className="public-section border-t border-border">
          <SectionHeading
            eyebrow={sections.certificates?.eyebrow || 'VERIFIED CREDENTIALS'}
            title={sections.certificates?.title || 'Selected credentials & accomplishments.'}
            description={
              sections.certificates?.description ||
              'Verified external certifications, technical assessments, and production milestones demonstrating disciplined software engineering.'
            }
            action={
              <Link className="text-link inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline" to="/credentials">
                View Complete Archive ({certs.length + completedMilestones.length}) <ArrowRight size={14} />
              </Link>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certs.slice(0, 3).map(c => (
              <div
                className="certificate-card cursor-pointer group"
                key={c._id}
                onClick={() => setSelectedCertModal(c)}
                title="Click to inspect credential details"
              >
                <div className="certificate-icon group-hover:scale-105 transition-transform">
                  <FileBadge size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="group-hover:text-primary transition">{c.title}</h3>
                  <p>{c.issuer || 'Credential'}</p>
                  {c.issuedAt && <small>{c.issuedAt}</small>}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCertModal(c);
                      }}
                      className="subtle-link text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      Inspect Details <ArrowUpRight size={13} />
                    </button>
                    {c.credentialUrl && (
                      <a
                        className="text-[11px] font-mono text-muted hover:text-primary inline-flex items-center gap-1"
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Verify <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7 — ABOUT & ENGINEERING DIRECTION (Focus Band) */}
      <section className="focus-band">
        <div>
          <span className="eyebrow">{about.eyebrow || "ENGINEERING PHILOSOPHY"}</span>
          <h2 className="heading-h2 mt-2">
            {about.heading || 'Curiosity, with a'}<br />
            <em className="text-primary not-italic font-semibold">{about.headingAccent || 'practical direction.'}</em>
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed mt-4 max-w-lg">
            {about.description ||
              'From resilient APIs and distributed architectures to AI-powered agentic systems and security engineering, I focus on understanding first principles and turning complex technical ideas into reliable, usable software.'}
          </p>
        </div>

        <div className="focus-grid">
          {(about.focusGrid && about.focusGrid.length > 0
            ? about.focusGrid
            : [
                { title: 'Distributed Systems & APIs', subtitle: 'Idempotency, queue workers, and transaction safety', icon: 'server' },
                { title: 'Agentic AI & Orchestration', subtitle: 'Multi-agent coordination, structured tool calling, and deterministic reasoning', icon: 'cpu' },
                { title: 'Defensive Security & RBAC', subtitle: 'Centralized permissions, input sanitization, and audit trails', icon: 'shield' },
                { title: 'Full-Stack Performance & UX', subtitle: 'Fast feedback loops, accessible design, and unified design tokens', icon: 'layers' }
              ]
          ).map((item, idx) => {
            const Icon = getDomainIcon(item.icon);
            return (
              <div key={idx}>
                <Icon />
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 8 — CONTACT & COLLABORATION SHOWCASE */}
      {sections.contact?.visible !== false && (
        <section id="contact" className="contact-section">
          <div className="contact-showcase">
            {/* Left Column: Storytelling & Technical Signals */}
            <div className="contact-showcase-left">
              <div className="contact-availability-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs font-mono font-bold text-primary shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>{sections.contact?.eyebrow || "LET'S CONNECT · OPEN FOR INQUIRIES"}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-ink tracking-tight leading-[1.12] mt-5">
                {sections.contact?.title || 'Good work gets better'}<br />
                <span className="text-primary italic font-serif font-extrabold">
                  {sections.contact?.headingAccent || 'when it is shared.'}
                </span>
              </h2>

              <p className="text-sm sm:text-base text-ink/80 font-medium leading-relaxed mt-4 max-w-xl">
                {sections.contact?.description ||
                  'Have an interesting engineering problem, an architectural challenge, or want to collaborate on distributed systems, backend resilience, or agentic AI workflows? Feel free to reach out directly.'}
              </p>

              {/* Signals Bar */}
              <div className="contact-signals">
                <div className="contact-signal-pill">
                  <Zap size={15} className="text-primary shrink-0" />
                  <span>{sections.contact?.responseTimeBadge || 'Typically responds within 24h'}</span>
                </div>
                <div className="contact-signal-pill">
                  <Globe size={15} className="text-primary shrink-0" />
                  <span>{sections.contact?.locationBadge || 'Lahore, PK · Remote Available (PKT · UTC+5)'}</span>
                </div>
                <div className="contact-signal-pill">
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                  <span>{sections.contact?.architectureBadge || 'First-Principles Architecture'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Direct Interactive Contact Hub Card */}
            <div className="contact-showcase-right">
              <div className="contact-hub-card">
                {/* Card Header & Operational Signal */}
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                      {sections.contact?.channelCardHeader || 'Direct Communication Channel'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-muted px-2 py-0.5 rounded-full border border-border bg-secondary-background">
                    {sections.contact?.channelCardTimezone || 'PKT · UTC+5'}
                  </span>
                </div>

                {/* Unified Master Direct Email Box */}
                {emailAddress && (
                  <div className="contact-email-box group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="contact-email-icon-box">
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider font-semibold block">
                          Primary Direct Email
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-ink truncate block select-all">
                          {emailAddress}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="contact-copy-btn"
                        title="Copy email to clipboard"
                      >
                        {copiedEmail ? (
                          <>
                            <Check size={13} className="text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} className="text-muted" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`mailto:${emailAddress}?subject=Engineering%20Hub%20Inquiry`}
                        className="contact-compose-btn"
                        title="Compose message in mail client"
                      >
                        <span>Compose</span>
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Channels Divider */}
                <div className="contact-divider">
                  <span>{sections.contact?.channelsSubheading || 'VERIFIED PROFESSIONAL CHANNELS'}</span>
                </div>

                {/* 2-Column Channel Grid */}
                <div className="contact-channel-grid">
                  {networkChannels.map(ch => {
                    const Icon = ch.icon;
                    return (
                      <a
                        key={ch.id}
                        href={ch.url}
                        target={ch.url.startsWith('mailto:') ? '_self' : '_blank'}
                        rel="noreferrer"
                        className="contact-channel-tile group"
                      >
                        <div className="contact-channel-info">
                          <div className="contact-channel-icon">
                            <Icon size={16} />
                          </div>
                          <div className="contact-channel-text">
                            <span className="contact-channel-name">{ch.label}</span>
                            <span className="contact-channel-sub">{ch.sublabel}</span>
                          </div>
                        </div>
                        <ArrowUpRight
                          size={14}
                          className="contact-channel-arrow"
                        />
                      </a>
                    );
                  })}
                </div>

                {/* Micro Response Guarantee Notice */}
                <div className="pt-2 text-center border-t border-border/60">
                  <span className="font-mono text-[10.5px] text-muted block">
                    {sections.contact?.guaranteeNote || '⚡ Guaranteed response within 24 hours · Open to consulting & engineering engagements'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Credential Inspection Modal */}
      {selectedCertModal && (
        <Modal
          title={`Verified Credential: ${selectedCertModal.title}`}
          onClose={() => setSelectedCertModal(null)}
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-background border border-border flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gold/15 text-primary shrink-0">
                <FileBadge size={28} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase font-bold text-primary block mb-1">
                  Official External Credential
                </span>
                <h3 className="font-display font-bold text-lg text-ink leading-snug">
                  {selectedCertModal.title}
                </h3>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 mt-1">
                  Issued by: <span className="text-primary font-bold">{selectedCertModal.issuer || 'Accredited Organization'}</span>
                </p>
                {selectedCertModal.issuedAt && (
                  <p className="text-[11px] font-mono text-muted mt-1">
                    Issue Date: {selectedCertModal.issuedAt}
                  </p>
                )}
                {selectedCertModal.credentialId && (
                  <p className="text-[11px] font-mono text-muted">
                    Credential ID: <span className="text-ink font-semibold">{selectedCertModal.credentialId}</span>
                  </p>
                )}
              </div>
            </div>

            {selectedCertModal.description && (
              <div className="text-xs text-muted leading-relaxed">
                <p>{selectedCertModal.description}</p>
              </div>
            )}

            {selectedCertModal.credentialUrl && (
              <div className="pt-2">
                <Button
                  as="a"
                  href={selectedCertModal.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                >
                  <span>Verify with Official Issuer</span>
                  <ExternalLink size={14} />
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      <PublicFooter profile={profile} content={siteContent} socialLinks={socialLinks} />
    </div>
  );
}

export default PublicHome;
