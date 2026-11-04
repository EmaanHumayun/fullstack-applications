import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Layers,
  ArrowRight,
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Cpu,
  Cloud,
  FileCode2,
  FolderGit2
} from 'lucide-react';

export function LabsAndChallengesSection({ practiceLabs = [], assignments = [] }) {
  const [activeTab, setActiveTab] = useState('labs'); // 'labs' | 'challenges'

  return (
    <section id="labs-challenges" className="public-section py-8 sm:py-12 border-t border-border" aria-label="Engineering Practice Labs and Architecture Challenges">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                HANDS-ON PRACTICE &amp; ARCHITECTURAL RUBRICS
              </span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-ink tracking-tight">
              Engineering Labs &amp; Architecture Challenges
            </h2>
            <p className="text-xs text-muted max-w-xl mt-1 leading-relaxed">
              Production-ready DevOps sandboxes, automated cloud laboratories, and enterprise architectural case studies with full task rubrics and verified GitHub repositories.
            </p>
          </div>

          {/* Unified Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary-background/80 border border-border/80 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('labs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'labs'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Terminal size={14} />
              <span>Practice Labs ({practiceLabs.length || 8})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('challenges')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'challenges'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Layers size={14} />
              <span>Architecture Challenges ({assignments.length || 3})</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: PRACTICE LABS (Hands-on DevOps Modules)       */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'labs' && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {practiceLabs.slice(0, 4).map((lab, idx) => (
                <div
                  key={lab._id || idx}
                  className="bg-surface rounded-2xl border border-border p-5 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {lab.domain || 'Cloud & DevOps'}
                      </span>
                      <span className="text-[10px] font-mono text-muted">
                        {lab.difficulty || 'Intermediate'}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-ink group-hover:text-primary transition-colors leading-snug">
                      {lab.title}
                    </h3>

                    <p className="text-[11.5px] text-muted line-clamp-3 leading-relaxed">
                      {lab.summary || lab.description || 'Hands-on production engineering lab.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between text-xs">
                    {lab.githubUrl ? (
                      <a
                        href={lab.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-primary hover:underline"
                      >
                        <Github size={12} />
                        <span>Inspect Repo</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-muted">Verified Module</span>
                    )}

                    <span className="text-[10px] font-mono text-muted">
                      Lab #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <Link
                to="/practice-labs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline font-mono"
              >
                <span>Explore All {practiceLabs.length || 8} Practice Labs</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: ARCHITECTURE CHALLENGES (Enterprise Rubrics)  */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'challenges' && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {assignments.map((chal, idx) => (
                <div
                  key={chal._id || idx}
                  className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        {chal.domain || 'Enterprise Architecture'}
                      </span>
                      <span className="text-[10px] font-mono text-amber-800 font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                        {chal.difficulty || 'Advanced'}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-ink group-hover:text-primary transition-colors leading-snug">
                      {chal.title}
                    </h3>

                    <p className="text-xs text-muted leading-relaxed line-clamp-3">
                      {chal.summary || chal.description || 'Enterprise-grade architectural case study and task rubric.'}
                    </p>

                    {/* Architectural Rubric Highlights */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10.5px] font-mono uppercase font-bold text-ink block">
                        Verified Requirements:
                      </span>
                      <ul className="space-y-1 text-[11px] text-muted">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          <span className="truncate">Automated IaC &amp; Health Probe Checks</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          <span className="truncate">Zero-Downtime High-Availability SLOs</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between text-xs">
                    {chal.githubUrl ? (
                      <a
                        href={chal.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-primary hover:underline"
                      >
                        <FolderGit2 size={13} />
                        <span>Challenge Repo</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-muted">Verified Challenge</span>
                    )}

                    <span className="text-[10px] font-mono text-muted font-bold">
                      Case Study #{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <Link
                to="/assignments"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline font-mono"
              >
                <span>Explore All {assignments.length || 3} Architecture Challenges</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

