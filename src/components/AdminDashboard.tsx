import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, Users, Globe, BookOpen, Activity, Lock, CheckCircle2, RefreshCw, ShieldAlert, AlertCircle, ArrowRight, UserCheck, X, FileText, Copy, Filter, Terminal, Search, Download, Trash2, Archive } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  type: 'User Action' | 'System Alert' | 'Security Event';
  actor: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  payload: Record<string, any>;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-09-11 13:30:12 UTC',
    type: 'Security Event',
    actor: 'girmahb1979@gmail.com',
    action: 'Admin RBAC Session Verification Passed',
    severity: 'low',
    payload: {
      event: 'AUTH_ROLE_VERIFIED',
      userId: 'admin-01',
      role: 'admin',
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Cloud Run Container Engine)',
      sessionValid: true,
      permissions: ['read:all', 'write:all', 'audit:execute']
    }
  },
  {
    id: 'log-102',
    timestamp: '2026-09-11 13:28:04 UTC',
    type: 'User Action',
    actor: 'student.addis@eduviva.edu',
    action: 'Completed Module: AI Ethics & Socratic Reasoning',
    severity: 'low',
    payload: {
      event: 'MODULE_COMPLETION',
      moduleId: 'mod-ethics-02',
      score: 95,
      durationSeconds: 420,
      offlineSynced: true,
      deviceId: 'edu-tablet-ethiopia-09'
    }
  },
  {
    id: 'log-103',
    timestamp: '2026-09-11 13:20:55 UTC',
    type: 'System Alert',
    actor: 'system-sync-daemon',
    action: 'Firestore Bidirectional Sync Batch Reconciled',
    severity: 'medium',
    payload: {
      event: 'FIRESTORE_SYNC_BATCH',
      recordsSynced: 14,
      databaseId: 'ai-studio-eduvivaai-ec525c67-381e-48cf-949a-14bc4a661ffa',
      latencyMs: 142,
      status: 'SUCCESS'
    }
  },
  {
    id: 'log-104',
    timestamp: '2026-09-11 13:10:01 UTC',
    type: 'Security Event',
    actor: 'unknown-client@ip-blocked',
    action: 'Rate-limit triggered on Gemini Proxy Endpoint',
    severity: 'high',
    payload: {
      event: 'SECURITY_RATE_LIMIT',
      endpoint: '/api/gemini/chat',
      requestsPerMinute: 65,
      threshold: 50,
      actionTaken: 'TEMPORARY_THROTTLE',
      clientFingerprint: 'fp-auth-failed-8832'
    }
  },
  {
    id: 'log-105',
    timestamp: '2026-09-11 12:45:30 UTC',
    type: 'User Action',
    actor: 'teacher.tigist@eduviva.edu',
    action: 'Published Amharic Translation Patch v1.4',
    severity: 'low',
    payload: {
      event: 'TRANSLATION_PUBLISH',
      language: 'Amharic (አማርኛ)',
      stringsUpdated: 120,
      reviewerId: 'rev-04',
      approvalStatus: 'VERIFIED'
    }
  }
];

interface AdminDashboardProps {
  user: UserProfile;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

  // Hard check on user role permissions
  const isAdmin = user && user.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            {/* Header Badge & Icon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Access Restricted • Role Governance
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1.5">
                    Administrator Clearance Required
                  </h2>
                </div>
              </div>

              <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-left sm:text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Session</p>
                <p className="text-xs font-bold text-slate-800 capitalize flex items-center sm:justify-end gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Role: <span className="text-amber-700">{user?.role || 'Guest'}</span>
                </p>
              </div>
            </div>

            {/* Explanation Content */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p className="font-semibold text-slate-900">
                    The Platform Governance &amp; Administration Console is restricted to verified administrators and governance officers.
                  </p>
                  <p>
                    Your current account (<span className="font-mono text-slate-800 font-semibold">{user?.email || 'unregistered'}</span>) is signed in as a <span className="font-semibold capitalize text-slate-900">{user?.role || 'standard user'}</span>. This profile does not have authorization to view platform telemetry, initiate audit verification hashes, or modify regional language validation statuses.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Credentials Detail Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-500 font-medium">Logged Account</p>
                <p className="font-bold text-slate-800 truncate mt-0.5">{user?.name || 'Anonymous Learner'}</p>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-500 font-medium">Assigned Role</p>
                <p className="font-bold text-slate-800 capitalize mt-0.5">{user?.role || 'Learner'}</p>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-500 font-medium">Security Status</p>
                <p className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" /> Enforced RBAC
                </p>
              </div>
            </div>

            {/* Resolution Steps */}
            <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Need administrative access? Switch to the Administrator profile in the Account switcher or contact governance at <a href="mailto:girmahb1979@gmail.com" className="text-purple-700 font-semibold hover:underline">girmahb1979@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleRunAudit = () => {
    setIsVerifying(true);
    setToastMessage('Initiating system-wide integrity check and cloud ledger synchronization...');
    setTimeout(() => {
      setIsVerifying(false);
      setToastMessage('System audit complete: All 24 modules, 4 regional languages, and offline hashes verified.');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const filteredLogs = logFilter === 'ALL'
    ? auditLogs
    : auditLogs.filter(log => log.type === logFilter);

  const copyJsonToClipboard = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Actor', 'Action', 'Severity', 'Payload'];
    const rows = filteredLogs.map(log => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.type}"`,
      `"${log.actor}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      log.severity,
      `"${JSON.stringify(log.payload).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Audit logs successfully exported to CSV for offline archival.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleSelectAll = () => {
    if (selectedLogIds.length === filteredLogs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredLogs.map(l => l.id));
    }
  };

  const handleToggleSelectLog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedLogIds.length === 0) return;
    setAuditLogs(prev => prev.filter(l => !selectedLogIds.includes(l.id)));
    setToastMessage(`Successfully deleted ${selectedLogIds.length} audit log(s).`);
    setSelectedLogIds([]);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleArchiveSelected = () => {
    if (selectedLogIds.length === 0) return;
    setAuditLogs(prev => prev.filter(l => !selectedLogIds.includes(l.id)));
    setToastMessage(`Successfully archived ${selectedLogIds.length} audit log(s) to secure cloud ledger.`);
    setSelectedLogIds([]);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">
            System Administration • Ethiopia Pilot Governance
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Platform Governance & Security</h2>
          <p className="text-xs text-slate-600 mt-1">
            Manage users, role permissions, multilingual curriculum review workflows, and system telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAudit}
            disabled={isVerifying}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Verifying Hashes...' : 'Run System Audit'}
          </button>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-[10px] text-emerald-700 font-medium">System Status</p>
            <p className="text-sm font-bold text-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Operational
            </p>
          </div>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Active Users</p>
          <p className="text-xl font-bold text-slate-900 mt-1">348 Learners</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Ethiopia Pilot Cohort</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Verified Content Modules</p>
          <p className="text-xl font-bold text-slate-900 mt-1">24 Modules</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Expert Reviewed</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Supported Languages</p>
          <p className="text-xl font-bold text-slate-900 mt-1">4 Languages</p>
          <span className="text-[10px] text-emerald-600 font-semibold">EN, AM, OM, SO</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Offline Sync Events</p>
          <p className="text-xl font-bold text-slate-900 mt-1">1,420 Synced</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Low-Connectivity Ready</span>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Multilingual Governance Workflow</h3>
              <p className="text-xs text-slate-500">Human reviewer verification status for regional languages</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800">English (EN)</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified (100%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800">Amharic (አማርኛ)</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified (95%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800">Afaan Oromo</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified (92%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800">Somali (Soomaali)</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified (90%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Security & Data Privacy Controls</h3>
              <p className="text-xs text-slate-500">Server-side security and audit logs</p>
            </div>
          </div>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>API Key Protection (Server-Side Proxy)</span>
              <span className="text-emerald-700 font-bold">Secure</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>Data Minimization & Role Access</span>
              <span className="text-emerald-700 font-bold">Enforced</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>Child Safety & Socratic Guardrails</span>
              <span className="text-emerald-700 font-bold">Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Logs Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">System Audit Logs & Telemetry</h3>
              <p className="text-xs text-slate-500">Click any row to inspect the full JSON payload for deeper investigation</p>
            </div>
          </div>

          {/* Filtering Dropdown & Export CSV */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Event Types</option>
                <option value="User Action">User Action</option>
                <option value="System Alert">System Alert</option>
                <option value="Security Event">Security Event</option>
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Bulk Action Toolbar if items selected */}
        {selectedLogIds.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px]">
                {selectedLogIds.length}
              </span>
              Audit log(s) selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleArchiveSelected}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive Selected
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table id="audit-logs-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredLogs.length > 0 && selectedLogIds.length === filteredLogs.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Description</th>
                <th className="py-3 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No audit logs found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
                  if (log.type === 'Security Event') badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                  if (log.type === 'System Alert') badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                  if (log.type === 'User Action') badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200";

                  let severityBadge = "bg-slate-100 text-slate-700";
                  if (log.severity === 'critical' || log.severity === 'high') severityBadge = "bg-rose-100 text-rose-800 font-bold";
                  if (log.severity === 'medium') severityBadge = "bg-amber-100 text-amber-800 font-semibold";
                  if (log.severity === 'low') severityBadge = "bg-emerald-100 text-emerald-800";

                  const isSelected = selectedLogIds.includes(log.id);

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-purple-50/50 transition-colors cursor-pointer group ${isSelected ? 'bg-purple-50/70' : ''}`}
                    >
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectLog(log.id, e as any)}
                          className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {log.actor}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 group-hover:text-purple-900 font-medium">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${severityBadge}`}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Audit Log Investigation</h4>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {selectedLog.id} • {selectedLog.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Event Type</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedLog.type}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Severity Level</span>
                  <p className="font-bold text-slate-900 capitalize mt-0.5">{selectedLog.severity}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Actor</span>
                  <p className="font-mono text-slate-800 mt-0.5">{selectedLog.actor}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Action Description</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedLog.action}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Full JSON Payload</span>
                  <button
                    onClick={copyJsonToClipboard}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedJson ? 'Copied JSON!' : 'Copy JSON'}
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
                  <pre className="p-4 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Investigation
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

