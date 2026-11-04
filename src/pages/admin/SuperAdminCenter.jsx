import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  FileText,
  Download,
  AlertTriangle,
  Plus,
  Trash2,
  Pencil,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Server,
  Database,
  HardDrive,
  Cpu,
  Radio,
  Globe,
  Laptop,
  Key,
  Eye,
  Clock,
  Lock,
  UserCheck,
  UserX
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function SuperAdminCenter() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('health');
  const [healthData, setHealthData] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessionsData, setSessionsData] = useState({ onlineCount: 0, activeUsers: [], recentLoginLogs: [] });
  const [userSearch, setUserSearch] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Modals
  const [userModal, setUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'admin' });
  const [editModal, setEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'admin', status: 'active', password: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  // Danger zone reset
  const [resetModule, setResetModule] = useState('workLogs');
  const [confirmCode, setConfirmCode] = useState('');
  const [resetBusy, setResetBusy] = useState(false);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [h, u, a, s] = await Promise.all([
        api('/super-admin/system-health'),
        api('/super-admin/users'),
        api('/super-admin/audit-logs?limit=50'),
        api('/super-admin/active-sessions').catch(() => ({ onlineCount: 0, activeUsers: [], recentLoginLogs: [] }))
      ]);
      setHealthData(h);
      setUsers(Array.isArray(u) ? u : (u.users || []));
      setAuditLogs(a.logs || []);
      setSessionsData(s || { onlineCount: 0, activeUsers: [], recentLoginLogs: [] });
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreateUser(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/super-admin/users', {
        method: 'POST',
        body: jsonBody(newUser)
      });
      showToast(`User ${newUser.email} created successfully`);
      setUserModal(false);
      setNewUser({ email: '', name: '', password: '', role: 'admin' });
      await loadData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  function openEditUser(user) {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'admin',
      status: user.status || 'active',
      password: ''
    });
    setEditModal(true);
  }

  async function handleSaveEditUser(e) {
    e.preventDefault();
    if (!editingUser) return;
    setBusy(true);
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status
      };
      if (editForm.password && editForm.password.trim().length >= 8) {
        payload.password = editForm.password.trim();
      }
      await api(`/super-admin/users/${editingUser._id}`, {
        method: 'PUT',
        body: jsonBody(payload)
      });
      showToast(`User ${editForm.email} updated successfully`);
      setEditModal(false);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await api(`/super-admin/users/${userId}/role`, {
        method: 'PUT',
        body: jsonBody({ role: newRole })
      });
      showToast('User role updated');
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleStatusToggle(userId, currentStatus) {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await api(`/super-admin/users/${userId}/status`, {
        method: 'PUT',
        body: jsonBody({ status: nextStatus })
      });
      showToast(`User status set to ${nextStatus}`);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return;
    try {
      await api(`/super-admin/users/${deleteTarget._id}`, { method: 'DELETE' });
      showToast(`User ${deleteTarget.email} deleted`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleExportData() {
    try {
      const data = await api('/super-admin/export-data');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engineering-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Sanitized database snapshot exported');
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleModuleReset(e) {
    e.preventDefault();
    setResetBusy(true);
    try {
      const body = {
        module: resetModule,
        confirmText: confirmCode
      };
      if (resetModule === 'all') {
        body.doubleConfirm = confirmCode;
      }
      await api('/settings/reset-module', {
        method: 'POST',
        body: jsonBody(body)
      });
      showToast(`Module ${resetModule} reset completed`);
      setConfirmCode('');
      await loadData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setResetBusy(false);
    }
  }

  if (loading && !healthData) {
    return <div className="loading-row min-h-[60vh]">Loading Super Admin Control Center…</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-top">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-900 border border-amber-300">
              <ShieldCheck size={14} /> HIGHEST PRIVILEGE LEVEL
            </span>
          </div>
          <h1 className="admin-title">Super Admin <em>Control Center</em></h1>
          <p className="admin-subtitle">
            System health diagnostics, team role-based access control, security audit trails, and data sovereignty.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="button-secondary" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button type="button" className="button-primary" onClick={handleExportData}>
            <Download size={14} /> Export Backup
          </button>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'health', label: 'System Health & Metrics', icon: Server },
          { id: 'users', label: `Team & Roles (${users.length})`, icon: Users },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: Activity },
          { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-wine text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: System Health */}
      {activeTab === 'health' && healthData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="metric-top">
                <span>Database Engine</span>
                <Database size={16} />
              </div>
              <strong className="text-xl capitalize">{healthData.database?.state}</strong>
              <small>{healthData.database?.isInMemory ? 'In-Memory Engine (Dev)' : 'MongoDB Atlas Cluster'}</small>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <span>Storage Provider</span>
                <HardDrive size={16} />
              </div>
              <strong className="text-xl capitalize">{healthData.storage?.provider}</strong>
              <small>Bucket: {healthData.storage?.bucket}</small>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <span>Memory Allocation</span>
                <Cpu size={16} />
              </div>
              <strong className="text-xl">{healthData.system?.memoryRssMb} MB</strong>
              <small>Heap: {healthData.system?.heapUsedMb} MB · Node {healthData.system?.nodeVersion}</small>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <span>Uptime</span>
                <Activity size={16} />
              </div>
              <strong className="text-xl">{Math.floor(healthData.uptimeSeconds / 60)} min</strong>
              <small>Service: {healthData.service}</small>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">LIVE DATA INVENTORY</p>
                <h3>Total Persisted Content by Module</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {[
                { label: 'Projects Total', count: healthData.counts?.projects?.total, sub: `${healthData.counts?.projects?.published} published` },
                { label: 'Skills Registered', count: healthData.counts?.skills, sub: 'Curated competencies' },
                { label: 'Roadmaps Active', count: healthData.counts?.roadmaps, sub: 'Interactive tracks' },
                { label: 'Work Logs Logged', count: healthData.counts?.workLogs, sub: 'Time entries' },
                { label: 'Milestones', count: healthData.counts?.milestones, sub: 'Achievements' },
                { label: 'Goals Tracked', count: healthData.counts?.goals, sub: 'Strategic objectives' },
                { label: 'Knowledge Notes', count: healthData.counts?.notes, sub: 'PKM entries' },
                { label: 'Certificates', count: healthData.counts?.certificates, sub: 'Verified credentials' }
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">{item.label}</span>
                  <span className="text-2xl font-serif font-bold text-wine mt-1 block">{item.count ?? 0}</span>
                  <span className="text-[11px] text-stone-500">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User & Team Management + Active Logged-in Sessions */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Active Sessions & Logged-In Telemetry Card ("Kon Kon Login Hai") */}
          <div className="panel-card border-stone-200 bg-stone-50/40">
            <div className="panel-heading">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Radio size={18} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="eyebrow text-emerald-800 m-0">LIVE SESSION TELEMETRY</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      {sessionsData.onlineCount || users.filter(u => u.isOnline).length || 0} Online Now
                    </span>
                  </div>
                  <h3 className="m-0 text-base font-bold text-stone-900">Active Sessions & Recent Logins</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="button-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                title="Refresh sessions"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Real-time monitor showing all team members and viewers currently logged into the system, their IP addresses, devices, and auth providers.
            </p>

            {/* Active Users Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(sessionsData.activeUsers && sessionsData.activeUsers.length > 0
                ? sessionsData.activeUsers
                : users.filter(u => u.lastLogin)
              ).slice(0, 6).map(u => {
                const isOnline = Boolean(u.isOnline);
                const roleColors = {
                  super_admin: 'bg-amber-100 text-amber-900 border-amber-300',
                  admin: 'bg-stone-200 text-stone-800 border-stone-300',
                  editor: 'bg-purple-100 text-purple-900 border-purple-200',
                  viewer: 'bg-blue-100 text-blue-900 border-blue-200'
                };

                return (
                  <div
                    key={u._id}
                    className={`p-3.5 rounded-xl border bg-white transition shadow-2xs relative flex flex-col justify-between ${
                      isOnline ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-800 font-bold flex items-center justify-center text-xs border border-stone-200">
                            {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          {isOnline && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"
                              title="Online right now"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <strong className="block text-xs font-bold text-stone-900 truncate">
                            {u.name || 'Unnamed User'}
                          </strong>
                          <span className="block text-[11px] text-stone-500 truncate" title={u.email}>
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                        roleColors[u.role] || 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}>
                        {u.role === 'super_admin' ? 'Super Admin' : u.role}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-stone-600">
                        <span className="flex items-center gap-1 text-stone-400">
                          <Clock size={11} /> Status:
                        </span>
                        {isOnline ? (
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online Now
                          </span>
                        ) : (
                          <span className="text-stone-500 font-mono text-[10px]">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-stone-600 font-mono text-[10px]">
                        <span className="flex items-center gap-1 text-stone-400 font-sans text-[11px]">
                          <Globe size={11} /> IP & Method:
                        </span>
                        <span>
                          {u.lastLoginIp || '127.0.0.1'} · <strong className="font-sans capitalize">{u.lastLoginMethod ? u.lastLoginMethod.replace('_', ' ') : (u.authProvider || 'Local')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Directory & Full CRUD Management Table */}
          <div className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">USER ACCESS & CRUD CONTROLS</p>
                <h3>All Workspace Users ({users.length})</h3>
              </div>
              <button type="button" className="button-primary" onClick={() => setUserModal(true)}>
                <Plus size={15} /> Add Team Member
              </button>
            </div>

            {/* Filter Search */}
            <div className="mb-4 max-w-sm relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search users by name or email…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:border-amber-800"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-100 text-[10px] uppercase font-bold text-stone-500">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Login Session</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users
                    .filter(u => {
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase();
                      return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                    })
                    .map(u => (
                      <tr key={u._id} className="hover:bg-stone-50/70 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0">
                              <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-bold flex items-center justify-center text-xs border border-stone-200">
                                {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                              </div>
                              {u.isOnline && (
                                <span
                                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"
                                  title="Online right now"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <strong className="block text-stone-900 truncate">
                                {u.name}
                                {currentUser?.email === u.email && (
                                  <span className="ml-1.5 text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-mono font-normal">
                                    YOU
                                  </span>
                                )}
                              </strong>
                              <span className="text-stone-500 block text-[11px] truncate">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-800"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer (Read-Only)</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(u._id, u.status)}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            {u.status === 'active' ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="p-3 text-stone-500">
                          <div>
                            {u.isOnline ? (
                              <span className="font-bold text-emerald-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online Now
                              </span>
                            ) : (
                              <span>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never logged in'}</span>
                            )}
                            {u.lastLoginIp && (
                              <span className="text-[10px] font-mono text-stone-400 block">
                                IP: {u.lastLoginIp} · {u.lastLoginMethod || u.authProvider || 'local'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditUser(u)}
                              className="p-1.5 text-stone-400 hover:text-stone-800 rounded transition"
                              title="Edit user details & password"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded transition"
                              title="Delete user"
                              disabled={u._id === currentUser?._id && users.filter(x => x.role === 'super_admin').length <= 1}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live Audit Trail */}
      {activeTab === 'audit' && (
        <div className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">COMPLIANCE & TRACEABILITY</p>
              <h3>Security & Administrative Audit Log</h3>
            </div>
            <span className="text-xs text-stone-500">Showing last {auditLogs.length} events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-100 text-[10px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditLogs.map(log => (
                  <tr key={log._id} className="hover:bg-stone-50/70 font-mono text-[11px]">
                    <td className="p-3 text-stone-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-stone-100 px-2 py-0.5 font-bold text-wine">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-stone-800 font-semibold">{log.actorEmail}</span>
                      <span className="text-[10px] text-stone-400 block">{log.actorRole}</span>
                    </td>
                    <td className="p-3 text-stone-600">{log.targetResource || '—'}</td>
                    <td className="p-3 max-w-xs truncate text-stone-500" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-3 text-stone-400 whitespace-nowrap">{log.ip || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Danger Zone */}
      {activeTab === 'danger' && (
        <div className="panel-card border-red-200 bg-red-50/30">
          <div className="panel-heading">
            <div>
              <p className="eyebrow text-red-600">HIGH RISK OPERATIONS</p>
              <h3 className="text-red-900">Module Resets & Purge Operations</h3>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-stone-600 max-w-2xl">
            Resetting a module purges its database collection permanently. Type the required confirmation phrase below.
          </p>

          <form onSubmit={handleModuleReset} className="mt-6 max-w-md space-y-4">
            <label className="block text-xs font-semibold text-stone-800">
              Select Target Module
              <select
                value={resetModule}
                onChange={e => setResetModule(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-2.5 text-xs text-stone-800"
              >
                <option value="workLogs">Work Logs (Purge all time entries)</option>
                <option value="notes">Knowledge Notes (Purge notes)</option>
                <option value="milestones">Milestones (Purge achievements)</option>
                <option value="goals">Goals (Purge objectives)</option>
                <option value="projects">Projects (Reset to seed defaults)</option>
                <option value="all">ALL DATA (Full database reset)</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-stone-800">
              Type {resetModule === 'all' ? '"RESET_ALL_DATA"' : '"CONFIRM"'} to authorize:
              <input
                type="text"
                value={confirmCode}
                onChange={e => setConfirmCode(e.target.value)}
                placeholder={resetModule === 'all' ? 'RESET_ALL_DATA' : 'CONFIRM'}
                required
                className="mt-1.5 w-full rounded-lg border border-red-300 bg-white p-2.5 text-xs text-stone-900"
              >
              </input>
            </label>

            <button
              type="submit"
              disabled={resetBusy || !confirmCode}
              className="rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"
            >
              {resetBusy ? 'Processing Reset…' : 'Execute Irreversible Reset'}
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add Team Member */}
      {userModal && (
        <Modal title="Provision Team Member" onClose={() => setUserModal(false)}>
          <form onSubmit={handleCreateUser} className="editor-form">
            <div className="form-grid">
              <label className="field-span-2">
                Full Name *
                <input
                  required
                  value={newUser.name}
                  onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                  placeholder="e.g. Sarah Connor"
                />
              </label>

              <label className="field-span-2">
                Email Address *
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                  placeholder="sarah@example.com"
                />
              </label>

              <label>
                Role Level *
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                >
                  <option value="admin">Admin (Content & Modules)</option>
                  <option value="editor">Editor (Draft & Published Content)</option>
                  <option value="viewer">Viewer (Read-Only Workspace)</option>
                  <option value="super_admin">Super Admin (Full Authority)</option>
                </select>
              </label>

              <label>
                Temporary Password *
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUser.password}
                  onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                  placeholder="Min 8 characters"
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="button-secondary" onClick={() => setUserModal(false)}>
                Cancel
              </button>
              <button type="submit" className="button-primary" disabled={busy}>
                {busy ? 'Creating User…' : 'Provision User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Team Member */}
      {editModal && editingUser && (
        <Modal
          title={`Edit User: ${editingUser.name || editingUser.email}`}
          onClose={() => {
            setEditModal(false);
            setEditingUser(null);
          }}
        >
          <form onSubmit={handleSaveEditUser} className="editor-form">
            <div className="form-grid">
              <label className="field-span-2">
                Full Name *
                <input
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sarah Connor"
                />
              </label>

              <label className="field-span-2">
                Email Address *
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="sarah@example.com"
                />
              </label>

              <label>
                Role Level *
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="admin">Admin (Content & Workspace)</option>
                  <option value="editor">Editor (Draft & Published Content)</option>
                  <option value="viewer">Viewer (Read-Only Workspace)</option>
                  <option value="super_admin">Super Admin (Full Authority)</option>
                </select>
              </label>

              <label>
                Account Status *
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="disabled">Disabled (Access Blocked)</option>
                </select>
              </label>

              <label className="field-span-2">
                Reset Password (Optional)
                <span className="block text-[11px] font-normal text-stone-500 mb-1">
                  Leave blank to keep existing password unchanged. Enter at least 8 characters to reset.
                </span>
                <input
                  type="password"
                  minLength={8}
                  value={editForm.password}
                  onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter new password (optional, min 8 characters)"
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setEditModal(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="button-primary" disabled={busy}>
                {busy ? 'Saving Changes…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Team Member"
        message={
          deleteTarget?._id === currentUser?._id
            ? `WARNING: You are about to delete your own Super Admin account (${deleteTarget?.email})! Are you absolutely sure?`
            : `Are you sure you want to permanently delete user "${deleteTarget?.name || deleteTarget?.email}" (${deleteTarget?.email})? This action cannot be undone.`
        }
        confirmText="Delete User"
        danger
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast message={toast} />
    </div>
  );
}

export default SuperAdminCenter;
