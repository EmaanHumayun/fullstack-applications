import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Layers, AlertCircle } from 'lucide-react';

/**
 * DomainSelector
 * Reusable cascading Domain -> Subdomain selector component with optional secondary domains.
 *
 * Props:
 * - primaryDomainId: string (current selected domain ID)
 * - subdomainName: string (current selected subdomain name or slug)
 * - secondaryDomainIds: array of strings (optional multi-select)
 * - onChange: ({ primaryDomainId, primaryDomainName, subdomainName, subdomainId, secondaryDomainIds }) => void
 * - showSecondary: boolean (default false)
 * - required: boolean (default true)
 * - disabled: boolean (default false)
 * - className: string
 */
export function DomainSelector({
  primaryDomainId = '',
  subdomainName = '',
  secondaryDomainIds = [],
  onChange,
  showSecondary = false,
  required = true,
  disabled = false,
  className = ''
}) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api('/domains?all=true')
      .then(data => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setDomains(list);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError('Failed to load domains');
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Find currently selected domain doc
  const selectedDomain = domains.find(d => String(d._id) === String(primaryDomainId) || d.name === primaryDomainId);
  const subdomains = selectedDomain?.fields || [];

  const handleDomainChange = (e) => {
    const newDomainId = e.target.value;
    const newDomain = domains.find(d => String(d._id) === newDomainId);
    const newSubdomains = newDomain?.fields || [];
    // Reset subdomain if previous one doesn't belong to the newly selected domain
    const stillValidSubdomain = newSubdomains.some(s => s.name === subdomainName);
    const nextSubdomain = stillValidSubdomain ? subdomainName : (newSubdomains[0]?.name || '');
    const nextSubdomainId = newSubdomains.find(s => s.name === nextSubdomain)?._id || null;

    if (onChange) {
      onChange({
        primaryDomainId: newDomainId,
        primaryDomainName: newDomain?.name || '',
        subdomainName: nextSubdomain,
        subdomainId: nextSubdomainId,
        secondaryDomainIds: secondaryDomainIds.filter(id => id !== newDomainId)
      });
    }
  };

  const handleSubdomainChange = (e) => {
    const nextSub = e.target.value;
    const subDoc = subdomains.find(s => s.name === nextSub);
    if (onChange) {
      onChange({
        primaryDomainId: selectedDomain ? String(selectedDomain._id) : primaryDomainId,
        primaryDomainName: selectedDomain?.name || '',
        subdomainName: nextSub,
        subdomainId: subDoc?._id || null,
        secondaryDomainIds
      });
    }
  };

  const handleSecondaryToggle = (domId) => {
    let next;
    if (secondaryDomainIds.includes(domId)) {
      next = secondaryDomainIds.filter(id => id !== domId);
    } else {
      next = [...secondaryDomainIds, domId];
    }
    if (onChange) {
      onChange({
        primaryDomainId: selectedDomain ? String(selectedDomain._id) : primaryDomainId,
        primaryDomainName: selectedDomain?.name || '',
        subdomainName,
        subdomainId: subdomains.find(s => s.name === subdomainName)?._id || null,
        secondaryDomainIds: next
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
        <div className="h-9 bg-stone-100 rounded-lg"></div>
        <div className="h-9 bg-stone-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Primary Domain */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers size={13} className="text-amber-700" />
              Primary Domain {required && <span className="text-red-500">*</span>}
            </span>
            {selectedDomain && (
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: selectedDomain.accentColor || '#bb9457' }}
                title={`Accent: ${selectedDomain.accentColor}`}
              />
            )}
          </label>
          <select
            value={selectedDomain ? String(selectedDomain._id) : ''}
            onChange={handleDomainChange}
            disabled={disabled}
            required={required}
            className="w-full text-xs font-medium bg-white border border-stone-300 rounded-lg px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 disabled:opacity-50"
          >
            <option value="">-- Select Primary Domain --</option>
            {domains.map(dom => (
              <option key={dom._id} value={String(dom._id)}>
                {dom.name} {dom.fields?.length ? `(${dom.fields.length} subdomains)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Subdomain (Cascaded) */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Subdomain / Area of Focus
          </label>
          <select
            value={subdomainName || ''}
            onChange={handleSubdomainChange}
            disabled={disabled || !selectedDomain || subdomains.length === 0}
            className="w-full text-xs font-medium bg-white border border-stone-300 rounded-lg px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 disabled:bg-stone-50 disabled:text-stone-400"
          >
            <option value="">
              {!selectedDomain
                ? 'Select a primary domain first'
                : subdomains.length === 0
                ? 'No subdomains configured'
                : '-- Select Subdomain --'}
            </option>
            {subdomains.map(sub => (
              <option key={sub._id || sub.slug} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Secondary Domains (Optional) */}
      {showSecondary && domains.length > 1 && (
        <div className="pt-2 border-t border-stone-100">
          <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
            Secondary Domain Associations (Optional cross-discipline links)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {domains
              .filter(d => String(d._id) !== String(primaryDomainId))
              .map(dom => {
                const isSelected = secondaryDomainIds.includes(String(dom._id));
                return (
                  <button
                    key={dom._id}
                    type="button"
                    onClick={() => handleSecondaryToggle(String(dom._id))}
                    disabled={disabled}
                    className={`text-[10px] font-medium px-2 py-1 rounded-md border transition ${
                      isSelected
                        ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {dom.name}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
