import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileBadge,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  Trophy,
  Search,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { api } from '../lib/api.js';
import { EmptyState, Modal, Button } from '../components.jsx';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'certs', 'achievements', 'education'
  const [selectedCertModal, setSelectedCertModal] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [cRes, mRes, pRes] = await Promise.all([
          api('/certificates').catch(() => []),
          api('/milestones').catch(() => []),
          api('/profile').catch(() => null)
        ]);
        setCerts(cRes || []);
        setMilestones(mRes || []);
        setProfile(pRes);
      } catch (err) {
        console.error('Failed to load certificates page data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completedMilestones = useMemo(() => {
    return milestones.filter(m => m.status === 'completed');
  }, [milestones]);

  const educationList = useMemo(() => {
    return profile?.education || [];
  }, [profile]);

  const filteredCerts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return certs;
    return certs.filter(c => {
      return (
        c.title.toLowerCase().includes(q) ||
        (c.issuer || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    });
  }, [certs, search]);

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={13} />
        <span className="text-ink font-semibold">Credentials & Achievements</span>
      </nav>

      {/* Hero Header */}
      <div className="listing-hero max-w-3xl py-4">
        <span className="eyebrow inline-block mb-2 font-mono font-bold tracking-widest text-xs uppercase text-primary">
          CREDENTIAL ARCHIVE & VERIFIABLE OUTCOMES
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-ink leading-tight">
          Verified Credentials & Milestones.
        </h1>
        <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
          Accredited certifications, verified technical achievements, and academic foundations demonstrating continuous professional commitment.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            VERIFIED CERTIFICATES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{certs.length}</span>
            <span className="text-xs text-muted font-medium">External Accreditations</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
            KEY ACHIEVEMENTS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-emerald-700 dark:text-emerald-400">{completedMilestones.length}</span>
            <span className="text-xs text-muted font-medium">Proven Deliverables</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-primary font-bold block">
            ACADEMIC DEGREES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-primary">{educationList.length}</span>
            <span className="text-xs text-muted font-medium">CS Foundations</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            VERIFIABLE PROOF
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">100%</span>
            <span className="text-xs text-muted font-medium">Verified Records</span>
          </div>
        </div>
      </div>

      {/* Section Tabs & Search Filter */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search certificates and milestones..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-border bg-background text-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                selectedTab === 'all'
                  ? 'bg-primary text-primary-text border-primary shadow-xs'
                  : 'bg-background text-muted border-border hover:text-ink'
              }`}
            >
              All Records
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('certs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                selectedTab === 'certs'
                  ? 'bg-primary text-primary-text border-primary shadow-xs'
                  : 'bg-background text-muted border-border hover:text-ink'
              }`}
            >
              Certificates ({certs.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('achievements')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                selectedTab === 'achievements'
                  ? 'bg-primary text-primary-text border-primary shadow-xs'
                  : 'bg-background text-muted border-border hover:text-ink'
              }`}
            >
              Achievements ({completedMilestones.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('education')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                selectedTab === 'education'
                  ? 'bg-primary text-primary-text border-primary shadow-xs'
                  : 'bg-background text-muted border-border hover:text-ink'
              }`}
            >
              Education ({educationList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Part 1: Verified External Certificates */}
      {(selectedTab === 'all' || selectedTab === 'certs') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
              <FileBadge size={18} className="text-primary" /> Verified External Certificates
            </h3>
            <span className="font-mono text-xs text-muted">{filteredCerts.length} certificates</span>
          </div>

          {filteredCerts.length === 0 ? (
            <EmptyState title="No certificates match" description="Try adjusting your search criteria." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCerts.map(c => (
                <div
                  key={c._id}
                  onClick={() => setSelectedCertModal(c)}
                  className="group p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/15 text-primary flex items-center justify-center shrink-0 border border-gold/30 group-hover:scale-105 transition-transform">
                        <FileBadge size={20} />
                      </div>
                      {c.issuedAt && (
                        <span className="font-mono text-[10px] text-muted bg-secondary-background px-2 py-0.5 rounded border border-border">
                          {c.issuedAt}
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-bold text-sm sm:text-base text-ink group-hover:text-primary transition leading-snug">
                      {c.title}
                    </h4>
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 mt-1">
                      {c.issuer || 'Accredited Issuer'}
                    </p>
                    {c.description && (
                      <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs font-mono">
                    <span className="text-primary font-bold inline-flex items-center gap-1 group-hover:underline">
                      Inspect Details <ArrowUpRight size={13} />
                    </span>
                    {c.credentialUrl && (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-muted hover:text-ink inline-flex items-center gap-1"
                      >
                        Verify <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Part 2: Key Engineering Achievements */}
      {(selectedTab === 'all' || selectedTab === 'achievements') && completedMilestones.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
              <Trophy size={18} className="text-gold" /> Key Engineering Milestones & Deliverables
            </h3>
            <span className="font-mono text-xs text-muted">{completedMilestones.length} milestones</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedMilestones.map(m => (
              <div key={m._id} className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      {m.category || 'Milestone'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 size={12} /> Achieved
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ink font-display">{m.title}</h4>
                  {m.description && (
                    <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                  {m.primaryDomain?.name && (
                    <span className="mt-3 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-background text-muted border border-border">
                      {m.primaryDomain.name} {m.subdomain ? `· ${m.subdomain}` : ''}
                    </span>
                  )}
                </div>

                {(m.evidenceUrl || (m.evidence && m.evidence.length > 0)) && (
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                    <span className="text-muted">Deliverable proof</span>
                    <a
                      href={m.evidenceUrl || m.evidence[0]?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Inspect <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 3: Education & Academic Foundations */}
      {(selectedTab === 'all' || selectedTab === 'education') && educationList.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" /> Education & Computer Science Foundations
            </h3>
            <span className="font-mono text-xs text-muted">{educationList.length} degrees</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {educationList.map((edu, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex items-start gap-4">
                <div className="p-3 rounded-xl bg-background border border-border text-primary shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider block">
                    {edu.startYear} – {edu.endYear || 'Present'}
                  </span>
                  <h4 className="text-base font-bold text-ink mt-0.5 font-display">{edu.degree}</h4>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">{edu.institution}</p>
                  {edu.grade && (
                    <span className="mt-2 inline-block rounded bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-bold font-mono">
                      {edu.grade}
                    </span>
                  )}
                  {edu.description && (
                    <p className="mt-2 text-xs text-muted leading-relaxed">{edu.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
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
    </div>
  );
}
