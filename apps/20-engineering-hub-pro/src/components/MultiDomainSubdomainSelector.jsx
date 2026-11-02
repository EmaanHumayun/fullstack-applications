import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../lib/api.js';
import {
  Layers,
  Plus,
  X,
  Search,
  Check,
  AlertCircle,
  ChevronDown,
  Trash2,
  Tag,
  CheckCheck
} from 'lucide-react';

/**
 * MultiDomainSubdomainSelector
 *
 * Reusable hierarchical selector for multiple Primary Domains and multiple Subdomains
 * under each selected domain.
 *
 * Data structure of `value`:
 * [
 *   {
 *     domainId: string,
 *     subdomainIds: string[]
 *   }
 * ]
 */
export function MultiDomainSubdomainSelector({
  value = [],
  onChange,
  disabled = false,
  required = false,
  label = 'Engineering Domains & Specialization Focus',
  description = 'Associate one or multiple engineering domains, and select multiple subdomains under each.',
  className = ''
}) {
  const [allDomains, setAllDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input for adding a primary domain
  const [domainSearch, setDomainSearch] = useState('');
  const [isDomainPickerOpen, setIsDomainPickerOpen] = useState(false);
  const domainPickerRef = useRef(null);

  // Active subdomain dropdown: domainId or null
  const [activeSubdomainPicker, setActiveSubdomainPicker] = useState(null);
  const [subdomainSearch, setSubdomainSearch] = useState('');
  const subdomainPickerRef = useRef(null);

  // Fetch all domains on mount
  useEffect(() => {
    let isMounted = true;
    api('/domains?all=true')
      .then(data => {
        if (isMounted) {
          setAllDomains(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load domains');
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (domainPickerRef.current && !domainPickerRef.current.contains(e.target)) {
        setIsDomainPickerOpen(false);
      }
      if (subdomainPickerRef.current && !subdomainPickerRef.current.contains(e.target)) {
        setActiveSubdomainPicker(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map of domainId -> Domain doc
  const domainMap = useMemo(() => {
    const map = new Map();
    allDomains.forEach(d => {
      map.set(String(d._id), d);
    });
    return map;
  }, [allDomains]);

  // Normalized safe associations array
  const safeAssociations = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value
      .filter(item => item && (item.domainId?._id || item.domainId))
      .map(item => {
        const domId = String(item.domainId?._id || item.domainId);
        const subIds = Array.isArray(item.subdomainIds)
          ? item.subdomainIds.map(s => String(s?._id || s)).filter(Boolean)
          : [];
        return { domainId: domId, subdomainIds: subIds };
      });
  }, [value]);

  // Set of selected domain IDs
  const selectedDomainIdSet = useMemo(() => {
    return new Set(safeAssociations.map(a => a.domainId));
  }, [safeAssociations]);

  // Domains available to add (unselected)
  const availableDomains = useMemo(() => {
    return allDomains.filter(d => !selectedDomainIdSet.has(String(d._id)));
  }, [allDomains, selectedDomainIdSet]);

  // Filtered available domains by search query
  const filteredAvailableDomains = useMemo(() => {
    const q = domainSearch.toLowerCase().trim();
    if (!q) return availableDomains;
    return availableDomains.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  }, [availableDomains, domainSearch]);

  // Add a primary domain
  const handleAddDomain = (domainId) => {
    if (disabled || selectedDomainIdSet.has(domainId)) return;
    const next = [...safeAssociations, { domainId, subdomainIds: [] }];
    setIsDomainPickerOpen(false);
    setDomainSearch('');
    if (onChange) onChange(next);
  };

  // Remove a primary domain
  const handleRemoveDomain = (domainId) => {
    if (disabled) return;
    const next = safeAssociations.filter(a => a.domainId !== domainId);
    if (activeSubdomainPicker === domainId) {
      setActiveSubdomainPicker(null);
    }
    if (onChange) onChange(next);
  };

  // Add a subdomain under a specific domain
  const handleAddSubdomain = (domainId, subdomainId) => {
    if (disabled) return;
    const next = safeAssociations.map(a => {
      if (a.domainId !== domainId) return a;
      if (a.subdomainIds.includes(subdomainId)) return a;
      return {
        ...a,
        subdomainIds: [...a.subdomainIds, subdomainId]
      };
    });
    if (onChange) onChange(next);
  };

  // Remove a subdomain from a specific domain
  const handleRemoveSubdomain = (domainId, subdomainId) => {
    if (disabled) return;
    const next = safeAssociations.map(a => {
      if (a.domainId !== domainId) return a;
      return {
        ...a,
        subdomainIds: a.subdomainIds.filter(id => id !== subdomainId)
      };
    });
    if (onChange) onChange(next);
  };

  // Select all subdomains for a domain
  const handleSelectAllSubdomains = (domainId) => {
    if (disabled) return;
    const dom = domainMap.get(domainId);
    if (!dom || !dom.fields) return;
    const allFieldIds = dom.fields.map(f => String(f._id));
    const next = safeAssociations.map(a => {
      if (a.domainId !== domainId) return a;
      return {
        ...a,
        subdomainIds: Array.from(new Set([...a.subdomainIds, ...allFieldIds]))
      };
    });
    if (onChange) onChange(next);
  };

  // Clear all subdomains for a domain
  const handleClearSubdomains = (domainId) => {
    if (disabled) return;
    const next = safeAssociations.map(a => {
      if (a.domainId !== domainId) return a;
      return { ...a, subdomainIds: [] };
    });
    if (onChange) onChange(next);
  };

  if (loading) {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-4 w-40 bg-stone-200 rounded"></div>
        <div className="h-10 bg-stone-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Component Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <label className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Layers size={13} className="text-amber-700 shrink-0" />
            <span>{label}</span>
            {required && <span className="text-red-500 font-bold">*</span>}
          </label>
          {description && (
            <p className="text-[11px] text-muted mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>

        {safeAssociations.length > 0 && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium border border-border">
            {safeAssociations.length} {safeAssociations.length === 1 ? 'domain' : 'domains'} selected
          </span>
        )}
      </div>

      {/* Primary Domain Adder & Search */}
      <div className="relative" ref={domainPickerRef}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || availableDomains.length === 0}
            onClick={() => setIsDomainPickerOpen(prev => !prev)}
            className="flex-1 flex items-center justify-between text-xs font-medium bg-background border border-border rounded-xl px-3 py-2 text-ink hover:border-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-800/20 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <span className="flex items-center gap-2 truncate">
              <Plus size={14} className="text-amber-800 shrink-0" />
              <span className={availableDomains.length === 0 ? 'text-muted italic' : 'text-ink font-semibold'}>
                {availableDomains.length === 0
                  ? 'All available primary domains are selected'
                  : '+ Associate Primary Domain...'}
              </span>
            </span>
            <ChevronDown size={14} className="text-muted shrink-0 ml-2" />
          </button>
        </div>

        {/* Dropdown panel for adding primary domain */}
        {isDomainPickerOpen && !disabled && (
          <div className="absolute z-40 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-lg p-2.5 space-y-2 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted" />
              <input
                type="text"
                value={domainSearch}
                onChange={e => setDomainSearch(e.target.value)}
                placeholder="Search domains by name or keyword..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-ink focus:outline-none focus:ring-1 focus:ring-amber-800"
                autoFocus
              />
            </div>

            {/* Domains List */}
            <div className="space-y-1">
              {filteredAvailableDomains.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted">
                  No matching unselected domains found.
                </div>
              ) : (
                filteredAvailableDomains.map(d => (
                  <button
                    key={d._id}
                    type="button"
                    onClick={() => handleAddDomain(String(d._id))}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-stone-50 flex items-center justify-between text-xs transition group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.accentColor || '#bb9457' }}
                      />
                      <span className="font-semibold text-ink group-hover:text-amber-900 truncate">
                        {d.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted shrink-0 ml-2">
                      {d.fields?.length || 0} subdomains
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Domains & Subdomains Container */}
      <div className="space-y-3">
        {safeAssociations.length === 0 ? (
          <div className="p-5 border-2 border-dashed border-border rounded-xl text-center bg-stone-50/50">
            <Layers size={22} className="mx-auto text-muted/60 mb-1.5" />
            <p className="text-xs font-semibold text-ink">No domains selected</p>
            <p className="text-[11px] text-muted max-w-sm mx-auto mt-0.5">
              Click &quot;+ Associate Primary Domain&quot; above to select the core engineering disciplines for this record.
            </p>
          </div>
        ) : (
          safeAssociations.map(assoc => {
            const domainDoc = domainMap.get(assoc.domainId);
            const domainName = domainDoc?.name || 'Unknown Domain';
            const accentColor = domainDoc?.accentColor || '#bb9457';
            const availableFields = domainDoc?.fields || [];
            const selectedSubIdSet = new Set(assoc.subdomainIds);

            // Subdomains currently selected
            const selectedSubdomains = availableFields.filter(f => selectedSubIdSet.has(String(f._id)));

            // Subdomains remaining to be added
            const unselectedSubdomains = availableFields.filter(f => !selectedSubIdSet.has(String(f._id)));

            // Filtered unselected by search in "+ Add Subdomain" popup
            const filteredUnselected = unselectedSubdomains.filter(f =>
              !subdomainSearch ||
              f.name.toLowerCase().includes(subdomainSearch.toLowerCase().trim())
            );

            const isSubPickerOpen = activeSubdomainPicker === assoc.domainId;

            return (
              <div
                key={assoc.domainId}
                className="rounded-xl border border-border bg-surface shadow-2xs overflow-hidden transition"
                style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
              >
                {/* Domain Header Row */}
                <div className="px-3.5 py-2.5 bg-stone-50/60 border-b border-border/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="text-xs font-bold text-ink truncate">
                      {domainName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-border text-muted">
                      {selectedSubdomains.length} / {availableFields.length} subdomains
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {availableFields.length > 0 && selectedSubdomains.length < availableFields.length && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSelectAllSubdomains(assoc.domainId)}
                        className="text-[10px] font-semibold text-amber-900 hover:text-amber-950 px-1.5 py-0.5 rounded hover:bg-amber-100/60 transition flex items-center gap-1"
                        title="Select all subdomains for this domain"
                      >
                        <CheckCheck size={11} /> Select All
                      </button>
                    )}
                    {selectedSubdomains.length > 0 && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleClearSubdomains(assoc.domainId)}
                        className="text-[10px] font-medium text-stone-500 hover:text-stone-700 px-1.5 py-0.5 rounded hover:bg-stone-200/50 transition"
                        title="Clear subdomains"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemoveDomain(assoc.domainId)}
                      className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                      title={`Remove domain "${domainName}" and its subdomains`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Subdomain Selection Body */}
                <div className="p-3 space-y-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-muted mr-1">
                      Subdomains:
                    </span>

                    {/* Selected Subdomain Chips */}
                    {selectedSubdomains.map(sub => (
                      <span
                        key={sub._id}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-amber-50 text-amber-950 border border-amber-200/80 shadow-2xs group"
                      >
                        <Tag size={10} className="text-amber-700 shrink-0" />
                        <span>{sub.name}</span>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubdomain(assoc.domainId, String(sub._id))}
                            className="text-amber-800 hover:text-red-600 rounded-full p-0.5 transition"
                            title={`Remove ${sub.name}`}
                          >
                            <X size={11} />
                          </button>
                        )}
                      </span>
                    ))}

                    {/* Add Subdomain Button / Picker */}
                    {!disabled && availableFields.length > 0 && unselectedSubdomains.length > 0 && (
                      <div className="relative inline-block" ref={isSubPickerOpen ? subdomainPickerRef : null}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubdomainPicker(isSubPickerOpen ? null : assoc.domainId);
                            setSubdomainSearch('');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-white hover:bg-amber-50 border border-amber-300 rounded-lg px-2 py-0.5 transition shadow-2xs cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>Add Subdomain</span>
                        </button>

                        {/* Subdomain Picker Dropdown */}
                        {isSubPickerOpen && (
                          <div className="absolute z-50 left-0 top-full mt-1.5 w-64 bg-surface border border-border rounded-xl shadow-xl p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                            {unselectedSubdomains.length > 5 && (
                              <input
                                type="text"
                                value={subdomainSearch}
                                onChange={e => setSubdomainSearch(e.target.value)}
                                placeholder="Search subdomain..."
                                className="w-full px-2 py-1 text-[11px] bg-background border border-border rounded-md text-ink focus:outline-none focus:ring-1 focus:ring-amber-800"
                                autoFocus
                              />
                            )}
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                              {filteredUnselected.map(sub => (
                                <button
                                  key={sub._id}
                                  type="button"
                                  onClick={() => {
                                    handleAddSubdomain(assoc.domainId, String(sub._id));
                                    setActiveSubdomainPicker(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] text-ink hover:bg-amber-50 hover:text-amber-950 font-medium flex items-center justify-between transition"
                                >
                                  <span className="truncate">{sub.name}</span>
                                  <Plus size={12} className="text-amber-800 shrink-0 ml-1.5" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Empty state or all selected notes */}
                  {availableFields.length === 0 ? (
                    <p className="text-[11px] text-muted italic">
                      No subdomains are currently configured under this domain in Domain Settings.
                    </p>
                  ) : selectedSubdomains.length === 0 ? (
                    <p className="text-[11px] text-stone-500 italic">
                      No subdomains selected yet for this domain. Click &quot;+ Add Subdomain&quot; to pick specific areas of focus.
                    </p>
                  ) : unselectedSubdomains.length === 0 ? (
                    <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 pt-0.5">
                      <Check size={11} /> All {availableFields.length} subdomains in {domainName} selected.
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1 pt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
