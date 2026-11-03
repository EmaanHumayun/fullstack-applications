import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckSquare,
  Square,
  Search,
  Filter,
  Code2,
  GraduationCap,
  Award,
  Layers,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { api } from '../../lib/api.js';

export function WorkspaceImporterModal({ isOpen, onClose, onImportData }) {
  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState(null);
  const [activeTab, setActiveTab] = useState('skills'); // 'profile' | 'skills' | 'projects' | 'certificates'
  const [skillSearch, setSkillSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Selected State
  const [selectedProfile, setSelectedProfile] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState({}); // { [skillName]: category }
  const [selectedProjects, setSelectedProjects] = useState([]); // array of project objects
  const [selectedCerts, setSelectedCerts] = useState([]); // array of cert objects
  const [selectedEdu, setSelectedEdu] = useState([]); // array of edu objects

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api('/resumes/workspace/data')
      .then(res => {
        setWorkspaceData(res);
        // Pre-select education records if present
        if (res.profile?.education) {
          setSelectedEdu(res.profile.education);
        }
      })
      .catch(err => {
        console.error('Failed to load workspace data:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle skill selection
  const toggleSkill = (skillName, category) => {
    setSelectedSkills(prev => {
      const next = { ...prev };
      if (next[skillName]) {
        delete next[skillName];
      } else {
        next[skillName] = category;
      }
      return next;
    });
  };

  // Toggle entire category of skills
  const toggleCategory = (category, skillsList) => {
    setSelectedSkills(prev => {
      const next = { ...prev };
      const allSelected = skillsList.every(s => next[s.name]);
      if (allSelected) {
        skillsList.forEach(s => delete next[s.name]);
      } else {
        skillsList.forEach(s => {
          next[s.name] = category;
        });
      }
      return next;
    });
  };

  // Toggle project selection
  const toggleProject = proj => {
    setSelectedProjects(prev => {
      const exists = prev.some(p => p.id === proj.id);
      if (exists) {
        return prev.filter(p => p.id !== proj.id);
      } else {
        return [...prev, proj];
      }
    });
  };

  // Toggle cert selection
  const toggleCert = cert => {
    setSelectedCerts(prev => {
      const exists = prev.some(c => c.id === cert.id);
      if (exists) {
        return prev.filter(c => c.id !== cert.id);
      } else {
        return [...prev, cert];
      }
    });
  };

  // Toggle education item
  const toggleEdu = edu => {
    setSelectedEdu(prev => {
      const exists = prev.some(e => e.degree === edu.degree && e.institution === edu.institution);
      if (exists) {
        return prev.filter(e => !(e.degree === edu.degree && e.institution === edu.institution));
      } else {
        return [...prev, edu];
      }
    });
  };

  const handleApply = () => {
    // 1. Group selected skills into structured categories
    const categoriesMap = {};
    Object.entries(selectedSkills).forEach(([skillName, catName]) => {
      if (!categoriesMap[catName]) categoriesMap[catName] = [];
      categoriesMap[catName].push(skillName);
    });

    const structuredSkills = Object.entries(categoriesMap).map(([name, skills]) => ({
      name,
      skills
    }));

    // 2. Map selected projects into resume entries
    const projectEntries = selectedProjects.map(p => ({
      title: p.title,
      subtitle: p.domain,
      description: p.summary,
      technologies: p.technologies || [],
      githubUrl: p.githubUrl || '',
      url: p.liveUrl || '',
      bullets: []
    }));

    // 3. Map selected certificates into resume entries
    const certEntries = selectedCerts.map(c => ({
      title: c.title,
      organization: c.issuer,
      startDate: c.issuedAt,
      url: c.credentialUrl || '',
      description: c.credentialId ? `Credential ID: ${c.credentialId}` : ''
    }));

    // 4. Map selected education
    const eduEntries = selectedEdu.map(e => ({
      title: e.degree,
      organization: e.institution,
      subtitle: e.fieldOfStudy || '',
      startDate: e.startYear || '',
      endDate: e.endYear || '',
      description: e.grade ? `Grade/CGPA: ${e.grade}` : ''
    }));

    // 5. Emit snapshot to parent
    onImportData({
      profile: selectedProfile ? workspaceData?.profile : null,
      skillsData: structuredSkills.length > 0 ? { categories: structuredSkills } : null,
      projectEntries,
      certEntries,
      eduEntries,
      counts: {
        skills: Object.keys(selectedSkills).length,
        projects: selectedProjects.length,
        certs: selectedCerts.length,
        edu: selectedEdu.length
      }
    });

    onClose();
  };

  const totalSelectedSkills = Object.keys(selectedSkills).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="font-bold text-base text-stone-900 font-serif">
                Import from Personal Workspace
              </h2>
              <p className="text-xs text-stone-500">
                Select verified skills, projects, and credentials to snapshot into this resume.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-border bg-stone-100 flex items-center gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'skills'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles size={13} /> Skills ({totalSelectedSkills})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'projects'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Code2 size={13} /> Projects ({selectedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'certificates'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award size={13} /> Certifications ({selectedCerts.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'profile'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck size={13} /> Profile & Education ({selectedEdu.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-stone-500">
              Loading workspace engineering data...
            </div>
          ) : !workspaceData ? (
            <div className="py-12 text-center text-xs text-red-500">
              Failed to load workspace data.
            </div>
          ) : (
            <>
              {/* TAB 1: SKILLS */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={skillSearch}
                        onChange={e => setSkillSearch(e.target.value)}
                        placeholder="Filter skills (e.g. Python, Docker, React)..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <span className="text-xs text-stone-500 shrink-0">
                      Total in Workspace: {workspaceData.totalSkills}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {Object.entries(workspaceData.skillsByCategory || {}).map(([cat, list]) => {
                      const filteredList = list.filter(s =>
                        s.name.toLowerCase().includes(skillSearch.toLowerCase())
                      );
                      if (filteredList.length === 0) return null;
                      const allSelected = filteredList.every(s => selectedSkills[s.name]);

                      return (
                        <div key={cat} className="p-3.5 rounded-xl border border-border bg-stone-50/60">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80">
                            <span className="font-bold text-xs text-stone-900 uppercase tracking-wide">
                              {cat} ({filteredList.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCategory(cat, filteredList)}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              {allSelected ? 'Deselect Category' : 'Select Category'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {filteredList.map(skill => {
                              const isChecked = !!selectedSkills[skill.name];
                              return (
                                <button
                                  key={skill.id}
                                  type="button"
                                  onClick={() => toggleSkill(skill.name, cat)}
                                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition border ${
                                    isChecked
                                      ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
                                      : 'bg-white border-border text-stone-700 hover:border-stone-300'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckSquare size={14} className="text-primary shrink-0" />
                                  ) : (
                                    <Square size={14} className="text-stone-300 shrink-0" />
                                  )}
                                  <span className="truncate">{skill.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={projectSearch}
                      onChange={e => setProjectSearch(e.target.value)}
                      placeholder="Filter projects by title, domain, or technology..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {(workspaceData.projects || [])
                      .filter(p =>
                        (p.title || '').toLowerCase().includes(projectSearch.toLowerCase()) ||
                        (p.technologies || []).some(t => t.toLowerCase().includes(projectSearch.toLowerCase()))
                      )
                      .map(proj => {
                        const isChecked = selectedProjects.some(p => p.id === proj.id);
                        return (
                          <div
                            key={proj.id}
                            onClick={() => toggleProject(proj)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                              isChecked
                                ? 'bg-primary/5 border-primary/40 shadow-xs'
                                : 'bg-white border-border hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <span className="font-bold text-xs text-stone-900 line-clamp-1">
                                  {proj.title}
                                </span>
                                {isChecked ? (
                                  <CheckSquare size={15} className="text-primary shrink-0" />
                                ) : (
                                  <Square size={15} className="text-stone-300 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                                {proj.summary}
                              </p>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-border/70 flex items-center justify-between text-[10px]">
                              <span className="font-mono text-stone-500">{proj.domain}</span>
                              <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                {proj.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 3: CERTIFICATES */}
              {activeTab === 'certificates' && (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {(workspaceData.certificates || []).map(cert => {
                    const isChecked = selectedCerts.some(c => c.id === cert.id);
                    return (
                      <div
                        key={cert.id}
                        onClick={() => toggleCert(cert)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-primary/5 border-primary/40'
                            : 'bg-white border-border hover:border-stone-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <strong className="text-xs text-stone-900 block truncate">{cert.title}</strong>
                          <span className="text-[11px] text-stone-500">
                            {cert.issuer} {cert.issuedAt ? `· Issued ${cert.issuedAt}` : ''}
                          </span>
                        </div>
                        {isChecked ? (
                          <CheckSquare size={16} className="text-primary shrink-0" />
                        ) : (
                          <Square size={16} className="text-stone-300 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 4: PROFILE & EDUCATION */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-stone-50/60">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-stone-900 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedProfile}
                        onChange={e => setSelectedProfile(e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span>Sync Personal Details & Summary from Profile</span>
                    </label>
                    <div className="text-xs text-stone-600 space-y-1 pl-5">
                      <div><strong>Name:</strong> {workspaceData.profile?.name}</div>
                      <div><strong>Title:</strong> {workspaceData.profile?.headline}</div>
                      <div><strong>Email:</strong> {workspaceData.profile?.email || workspaceData.profile?.contactEmail}</div>
                      <div><strong>Location:</strong> {workspaceData.profile?.location}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-2">
                      Academic Education Records
                    </h3>
                    <div className="space-y-2">
                      {(workspaceData.profile?.education || []).map((edu, idx) => {
                        const isChecked = selectedEdu.some(
                          e => e.degree === edu.degree && e.institution === edu.institution
                        );
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleEdu(edu)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                              isChecked
                                ? 'bg-primary/5 border-primary/40'
                                : 'bg-white border-border hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <strong className="text-xs text-stone-900 block">{edu.degree}</strong>
                              <span className="text-[11px] text-stone-500">
                                {edu.institution} {edu.startYear ? `· ${edu.startYear} - ${edu.endYear}` : ''}
                              </span>
                            </div>
                            {isChecked ? (
                              <CheckSquare size={16} className="text-primary shrink-0" />
                            ) : (
                              <Square size={16} className="text-stone-300 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Summary Counter & Action Button */}
        <div className="p-4 bg-stone-50 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-600 flex items-center gap-3 flex-wrap">
            <span><strong>Skills:</strong> {totalSelectedSkills}</span>
            <span><strong>Projects:</strong> {selectedProjects.length}</span>
            <span><strong>Certs:</strong> {selectedCerts.length}</span>
            <span><strong>Education:</strong> {selectedEdu.length}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-white text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:brightness-105 transition shadow-sm"
            >
              <span>Add Selected Data to Resume</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
