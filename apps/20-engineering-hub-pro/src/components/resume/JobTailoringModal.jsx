import React, { useState } from 'react';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
  X,
  Target,
  Wand2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { parseRawSkills, autoCategorizeSkills } from './SmartSkillsParser.js';

// Technical keywords taxonomy for deep extraction
const TECH_KEYWORDS = [
  'Node.js', 'Express', 'FastAPI', 'Python', 'TypeScript', 'JavaScript', 'Go', 'Rust', 'Java',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch', 'DynamoDB',
  'Docker', 'Kubernetes', 'Terraform', 'AWS', 'GCP', 'Azure', 'Linux', 'CI/CD', 'GitHub Actions',
  'Microservices', 'REST APIs', 'GraphQL', 'gRPC', 'Event-Driven', 'Kafka', 'RabbitMQ',
  'React', 'Next.js', 'Tailwind CSS', 'Vite', 'Vue.js',
  'System Design', 'High Availability', 'Zero-Downtime', 'Scalability', 'Security', 'RBAC', 'JWT',
  'AI', 'LLM', 'LangChain', 'LangGraph', 'RAG', 'Vector Search', 'Machine Learning'
];

export function JobTailoringModal({
  isOpen,
  onClose,
  currentResume,
  onApplyTailoredResume
}) {
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState(currentResume?.targetRole || '');
  const [companyName, setCompanyName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [tailoredResult, setTailoredResult] = useState(null);

  if (!isOpen) return null;

  const handleAnalyzeAndTailor = () => {
    if (!jobDescription.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      const jdText = jobDescription.toLowerCase();

      // 1. Detect or refine Target Role
      let detectedRole = targetRole.trim();
      if (!detectedRole) {
        if (jdText.includes('backend') || jdText.includes('api')) detectedRole = 'Backend Software Engineer';
        else if (jdText.includes('devops') || jdText.includes('infrastructure') || jdText.includes('sre')) detectedRole = 'DevOps & Cloud Engineer';
        else if (jdText.includes('full stack') || jdText.includes('fullstack')) detectedRole = 'Full-Stack Software Engineer';
        else if (jdText.includes('ai') || jdText.includes('machine learning') || jdText.includes('agent')) detectedRole = 'AI Systems Engineer';
        else if (jdText.includes('cloud')) detectedRole = 'Cloud Platform Architect';
        else detectedRole = 'Software Engineer';
      }

      // 2. Extract matched keywords
      const matchedKeywords = TECH_KEYWORDS.filter(tech => {
        const lower = tech.toLowerCase();
        return jdText.includes(lower);
      });

      // 3. Fallback skills if sparse
      const activeKeywords = matchedKeywords.length >= 4
        ? matchedKeywords
        : Array.from(new Set([...matchedKeywords, 'Node.js', 'Docker', 'PostgreSQL', 'REST APIs', 'Linux', 'Git', 'AWS']));

      // 4. Calculate Match Score
      const matchScore = Math.min(98, Math.max(72, Math.round(55 + activeKeywords.length * 5)));

      // 5. Generate Tailored Executive Summary
      const candidateName = currentResume?.personalInformation?.fullName || 'Emaan Humayun';
      const companyClause = companyName.trim() ? ` with high impact at ${companyName.trim()}` : '';
      const topSkillsSnippet = activeKeywords.slice(0, 5).join(', ');

      const tailoredSummary = `${detectedRole} dedicated to engineering reliable, resilient production systems${companyClause}. Proven expertise delivering high-performance backend microservices and automated infrastructure using ${topSkillsSnippet}. Grounded in first-principles software architecture with deep practical focus on high availability, clean RESTful design, and deterministic deployment pipelines.`;

      // 6. Generate Prioritized Categorized Skills
      const prioritizedCategories = autoCategorizeSkills(activeKeywords);

      // 7. Tailor Project Bullet Points for Job Keywords
      const updatedSections = (currentResume?.sections || []).map(sec => {
        if (sec.sectionType === 'projects') {
          return {
            ...sec,
            entries: (sec.entries || []).map((proj, idx) => {
              // Align tech stack with JD keywords if applicable
              const mergedTech = Array.from(new Set([
                ...(proj.technologies || []),
                ...activeKeywords.slice(idx * 2, idx * 2 + 2)
              ])).slice(0, 7);

              const tailoredBullets = [
                `Architected scalable services utilizing ${activeKeywords[0] || 'Node.js'} and ${activeKeywords[1] || 'PostgreSQL'}, ensuring resilient throughput and sub-100ms API response times.`,
                `Streamlined deployment workflows using ${activeKeywords[2] || 'Docker'} containerization and automated CI/CD checks, achieving zero-downtime rolling updates.`
              ];

              return {
                ...proj,
                technologies: mergedTech,
                bullets: tailoredBullets
              };
            })
          };
        }
        return sec;
      });

      setTailoredResult({
        targetRole: detectedRole,
        companyName: companyName.trim(),
        matchScore,
        matchedKeywords: activeKeywords,
        tailoredSummary,
        prioritizedCategories,
        updatedSections
      });

      setAnalyzing(false);
    }, 600);
  };

  const handleApply = () => {
    if (!tailoredResult) return;

    onApplyTailoredResume({
      targetRole: tailoredResult.targetRole,
      title: `${tailoredResult.targetRole}${tailoredResult.companyName ? ` — ${tailoredResult.companyName}` : ''}`,
      professionalSummary: tailoredResult.tailoredSummary,
      personalInformation: {
        ...currentResume.personalInformation,
        professionalTitle: tailoredResult.targetRole
      },
      skillsData: {
        categories: tailoredResult.prioritizedCategories
      },
      sections: tailoredResult.updatedSections.map(s => {
        if (s.sectionType === 'summary') {
          return { ...s, customContent: tailoredResult.tailoredSummary };
        }
        return s;
      })
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <Wand2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Tailor Resume to Job Requirements
              </h2>
              <p className="text-xs text-stone-500">
                Paste any Job Description (JD) to automatically optimize keywords, summary, and technical alignment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Target Role / Title (Optional)
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full text-xs rounded-xl border border-stone-300 px-3.5 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Target Company / Organization (Optional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon, Google, Acme Corp"
                className="w-full text-xs rounded-xl border border-stone-300 px-3.5 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Paste Job Description / Requirements
              </label>
              <span className="text-[11px] text-stone-500">
                LinkedIn, Indeed, Upwork or direct job spec
              </span>
            </div>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the job description here... (e.g. 'We are looking for a Backend Engineer with strong expertise in Node.js, PostgreSQL, Docker, and AWS microservices...')"
              className="w-full text-xs rounded-xl border border-stone-300 p-3.5 font-sans focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!jobDescription.trim() || analyzing}
              onClick={handleAnalyzeAndTailor}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-105 transition shadow-xs disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Analyzing Keywords & Requirements...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Analyze & Tailor Resume</span>
                </>
              )}
            </button>
          </div>

          {/* Tailored Results Display */}
          {tailoredResult && (
            <div className="mt-6 border-t border-stone-200 pt-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                    TARGET POSITION
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                    {tailoredResult.targetRole} {tailoredResult.companyName ? `at ${tailoredResult.companyName}` : ''}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                    ATS KEYWORD MATCH
                  </span>
                  <div className="text-base font-black text-emerald-700 font-mono">
                    {tailoredResult.matchScore}%
                  </div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Matched & Prioritized Technical Keywords ({tailoredResult.matchedKeywords.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tailoredResult.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tailored Executive Summary */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Tailored Professional Summary
                </label>
                <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl text-xs text-stone-800 leading-relaxed font-sans">
                  {tailoredResult.tailoredSummary}
                </div>
              </div>

              {/* Apply Action */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs text-emerald-950">
                  <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                  <span>
                    Ready to populate your selected template with tailored keywords, aligned summary, and prioritized skills.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition shadow-xs shrink-0"
                >
                  <span>Apply to Resume</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

