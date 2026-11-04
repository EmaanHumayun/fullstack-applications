import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Cpu, Layers } from 'lucide-react';
import { api } from '../lib/api.js';
import SkillsVisualSection from '../components/SkillsVisuals.jsx';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [skillsRes, contentRes] = await Promise.all([
          api('/skills').catch(() => []),
          api('/site-content').catch(() => null)
        ]);
        setSkills(skillsRes || []);
        setSiteContent(contentRes);
      } catch (err) {
        console.error('Failed to load skills page data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={13} />
        <span className="text-ink font-semibold">Skills & Competencies</span>
      </nav>

      {/* Main Skills Visual Section */}
      <SkillsVisualSection
        rawSkills={skills}
        sections={siteContent?.sections || {}}
      />
    </div>
  );
}
