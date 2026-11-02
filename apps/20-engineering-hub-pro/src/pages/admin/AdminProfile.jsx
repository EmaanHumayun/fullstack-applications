import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings2,
  User,
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Twitter,
  UploadCloud,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  ExternalLink,
  FileText
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Toast } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

export default function AdminProfile() {
  const { isViewer, canEdit } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    headline: '',
    bio: '',
    location: '',
    email: '',
    phone: '',
    avatarUrl: '',
    resumeUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: '',
    education: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/profile');
      if (data) {
        setProfile({
          name: data.name || '',
          headline: data.headline || '',
          bio: data.bio || '',
          location: data.location || '',
          email: data.email || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '',
          resumeUrl: data.resumeUrl || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          twitterUrl: data.twitterUrl || '',
          websiteUrl: data.websiteUrl || '',
          education: Array.isArray(data.education) ? data.education : []
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAvatarUpload = async e => {
    if (isViewer) {
      showToast('Viewer mode: avatar upload is disabled.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api('/upload', {
        method: 'POST',
        body: data
      });
      setProfile(prev => ({ ...prev, avatarUrl: res.url }));
      showToast('Avatar uploaded successfully');
    } catch (err) {
      showToast(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async e => {
    if (isViewer) {
      showToast('Viewer mode: resume upload is disabled.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api('/upload', {
        method: 'POST',
        body: data
      });
      setProfile(prev => ({ ...prev, resumeUrl: res.url }));
      showToast('Resume uploaded successfully');
    } catch (err) {
      showToast(err.message || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
    }
  };

  const addEducation = () => {
    if (isViewer) {
      showToast('Viewer mode: adding education is disabled.');
      return;
    }
    setProfile(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startYear: new Date().getFullYear() - 4,
          endYear: new Date().getFullYear(),
          grade: '',
          description: ''
        }
      ]
    }));
  };

  const updateEducation = (index, field, value) => {
    setProfile(prev => {
      const nextEd = [...prev.education];
      nextEd[index] = { ...nextEd[index], [field]: value };
      return { ...prev, education: nextEd };
    });
  };

  const removeEducation = index => {
    if (isViewer) {
      showToast('Viewer mode: removing education is disabled.');
      return;
    }
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewer mode: changes cannot be saved.');
      return;
    }
    setSaving(true);
    try {
      const updated = await api('/profile', {
        method: 'PUT',
        body: jsonBody(profile)
      });
      setProfile(prev => ({ ...prev, ...updated }));
      showToast('Profile and education updated successfully');
    } catch (err) {
      showToast(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-stone-500">Loading profile…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <User size={14} />
            Public Identity & Biography
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Profile & Education Settings
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Manage your professional identity, contact channels, resume, and academic qualifications.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition self-start"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {isViewer && <ReadOnlyNotice featureName="Profile & Education Settings" />}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset disabled={isViewer} className="contents space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                <User size={16} className="text-amber-800" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Alex Henderson"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA / Remote"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.headline}
                    onChange={e => setProfile({ ...profile, headline: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer · Distributed Systems & AI"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Introduce yourself, your engineering philosophy, what problems you solve..."
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Media & Documents */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                <UploadCloud size={16} className="text-amber-800" />
                Profile Media & Resume
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Avatar Image URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={profile.avatarUrl}
                      onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })}
                      placeholder="https://.../avatar.jpg"
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                    {canEdit && (
                      <label className="shrink-0 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition">
                        <UploadCloud size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Resume / CV (PDF URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={profile.resumeUrl}
                      onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })}
                      placeholder="https://.../resume.pdf"
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                    {canEdit && (
                      <label className="shrink-0 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition">
                        <UploadCloud size={16} />
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleResumeUpload}
                          disabled={uploadingResume}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Social & Contact Channels */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                <Globe size={16} className="text-amber-800" />
                Contact & Profiles
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Public Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    placeholder="contact@yourdomain.com"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profile.githubUrl}
                    onChange={e => setProfile({ ...profile, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={e => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Website / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={profile.websiteUrl}
                    onChange={e => setProfile({ ...profile, websiteUrl: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
              </div>
            </div>

            {/* Academic Qualifications / Education */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                  <GraduationCap size={16} className="text-amber-800" />
                  Academic Qualifications & Education
                </h2>
                {canEdit && (
                  <button
                    type="button"
                    onClick={addEducation}
                    className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium transition"
                  >
                    <Plus size={14} /> Add Degree
                  </button>
                )}
              </div>

              {profile.education.length === 0 ? (
                <p className="text-xs text-stone-500 py-3 text-center italic">
                  No education records listed yet. Click "Add Degree" to add your university or certifications.
                </p>
              ) : (
                <div className="space-y-4 pt-2">
                  {profile.education.map((ed, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-stone-200 rounded-lg bg-stone-50/50 space-y-3 relative"
                    >
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => removeEducation(idx)}
                          className="absolute right-3 top-3 text-stone-400 hover:text-red-700 transition"
                          title="Remove degree"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Institution / University *
                          </label>
                          <input
                            type="text"
                            required
                            value={ed.institution || ''}
                            onChange={e => updateEducation(idx, 'institution', e.target.value)}
                            placeholder="e.g. Stanford University"
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Degree / Program *
                          </label>
                          <input
                            type="text"
                            required
                            value={ed.degree || ''}
                            onChange={e => updateEducation(idx, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Science"
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={ed.fieldOfStudy || ''}
                            onChange={e => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Start Year
                            </label>
                            <input
                              type="number"
                              value={ed.startYear || ''}
                              onChange={e => updateEducation(idx, 'startYear', e.target.value)}
                              placeholder="2020"
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              End Year
                            </label>
                            <input
                              type="number"
                              value={ed.endYear || ''}
                              onChange={e => updateEducation(idx, 'endYear', e.target.value)}
                              placeholder="2024"
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canEdit && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition shadow-sm"
                >
                  <Check size={16} />
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Right Col: Live Preview Card */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm sticky top-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-3 block">
                Live Public Card Preview
              </span>

              <div className="text-center py-4 border-b border-stone-100">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-amber-800/20 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-xl mx-auto border-2 border-stone-200">
                    {(profile.name || 'User')
                      .split(' ')
                      .map(x => x[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}

                <h3 className="font-bold text-stone-900 text-lg mt-3">
                  {profile.name || 'Your Name'}
                </h3>
                <p className="text-xs font-medium text-amber-800 mt-0.5">
                  {profile.headline || 'Your Professional Headline'}
                </p>
                {profile.location && (
                  <p className="text-[11px] text-stone-500 mt-1">{profile.location}</p>
                )}
              </div>

              {profile.bio && (
                <div className="py-4 border-b border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    About
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">
                    {profile.bio}
                  </p>
                </div>
              )}

              <div className="pt-4 flex flex-wrap gap-2 justify-center">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                    title="GitHub"
                  >
                    <Github size={15} />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                    title="LinkedIn"
                  >
                    <Linkedin size={15} />
                  </a>
                )}
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold rounded-lg transition"
                  >
                    <FileText size={14} /> Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        </fieldset>
      </form>

      <Toast message={toast} />
    </div>
  );
}
