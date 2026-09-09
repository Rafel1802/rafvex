import React, { useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  ShieldAlert, ShieldCheck, Ban, Trash2, Search, Filter,
  CheckCircle2, XCircle, AlertTriangle, Clock, Globe, Laptop,
  Plus, Check, X, RefreshCw, Copy, Sparkles, Lock, Unlock,
  Shield, Zap, Terminal, ExternalLink, ArrowUpRight, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlockedIp {
  id: number;
  ip_address: string;
  reason: string | null;
  created_by: number | null;
  creator_name: string | null;
  creator_email: string | null;
  expires_at: string | null;
  permanent: boolean;
  active: boolean;
  created_at: string;
}

interface LoginLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  email: string | null;
  ip_address: string;
  user_agent: string | null;
  successful: boolean;
  failure_reason: string | null;
  created_at: string;
}

interface Props {
  auth: {
    user: {
      id?: number;
      name: string;
      email: string;
      avatar: string | null;
      roles?: string[];
    };
  };
  blockedIps: BlockedIp[];
  loginLogs: {
    data: LoginLog[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  stats: {
    total_blocked: number;
    failed_24h: number;
    success_24h: number;
    total_logs: number;
  };
  isSuperAdmin: boolean;
  currentIp?: string;
  filters: {
    status?: string;
    search?: string;
  };
}

const PRESET_REASONS = [
  'Brute force attack on /ourcms',
  'Malicious crawler / scraping bot',
  'Credential stuffing attempts',
  'Spam & automated flooding',
  'Unauthorized vulnerability probe',
];

const DURATIONS = [
  { id: 'permanent', label: 'Permanent', desc: 'Indefinite ban' },
  { id: '24h', label: '24 Hours', desc: 'Temporary quarantine' },
  { id: '7d', label: '7 Days', desc: '1 week lockout' },
  { id: '30d', label: '30 Days', desc: 'Extended block' },
];

export default function SecurityIndex({
  auth,
  blockedIps = [],
  loginLogs,
  stats,
  isSuperAdmin,
  currentIp = '',
  filters
}: Props) {
  const [activeTab, setActiveTab] = useState<'blocked' | 'logs'>('blocked');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

  const { data: blockData, setData: setBlockData, post: postBlock, processing: blockProcessing, errors: blockErrors, reset: resetBlock } = useForm({
    ip_address: '',
    reason: '',
    duration: 'permanent',
  });

  // Client-side IP format validation
  const ipValidation = useMemo(() => {
    const ip = blockData.ip_address.trim();
    if (!ip) return null;
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(?:\/(?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;
    if (ipv4Regex.test(ip)) return { valid: true, type: 'IPv4' };
    if (ipv6Regex.test(ip)) return { valid: true, type: 'IPv6' };
    return { valid: false, type: 'Unknown' };
  }, [blockData.ip_address]);

  const isSelfIp = useMemo(() => {
    return currentIp && blockData.ip_address.trim() === currentIp.trim();
  }, [blockData.ip_address, currentIp]);

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelfIp) {
      if (!confirm('Warning: You are attempting to block your OWN current IP address (' + currentIp + '). This will lock you out of this session immediately. Are you sure you want to proceed?')) {
        return;
      }
    }
    postBlock('/ourcms/security/block-ip', {
      onSuccess: () => {
        setIsBlockModalOpen(false);
        resetBlock();
      },
    });
  };

  const handleUnblock = (id: number, ip: string) => {
    if (!confirm(`Are you sure you want to unblock IP address ${ip}?`)) return;
    setUnblockingId(id);
    router.delete(`/ourcms/security/unblock-ip/${id}`, {
      onFinish: () => setUnblockingId(null),
    });
  };

  const handleClearLogs = () => {
    router.post('/ourcms/security/clear-logs', {}, {
      onSuccess: () => setIsClearModalOpen(false),
    });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      '/ourcms/security',
      {
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      },
      { preserveState: true }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const openQuickBlock = (ip: string, reason?: string) => {
    setBlockData({
      ip_address: ip,
      reason: reason || 'Detected repeated failed authorization attempts',
      duration: 'permanent',
    });
    setIsBlockModalOpen(true);
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Security & Logs — Rafvex CMS" />

      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* ── Header Title & Actions ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
                  Security & Access Control
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Perimeter Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time IP perimeter defense, brute-force lockout, and rolling 7-day automated audit logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                setBlockData({ ip_address: '', reason: '', duration: 'permanent' });
                setIsBlockModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Ban size={16} /> Block IP / Device
            </button>

            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              title="Clear login audit logs"
            >
              <Trash2 size={16} /> Clear Logs
            </button>

            <button
              type="button"
              onClick={() => router.reload()}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh security metrics"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* ── Stat Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Blocked */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-red-300 dark:hover:border-red-900 transition-colors group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Blocklist
              </span>
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                <Ban size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display">
              {stats.total_blocked}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-600 dark:text-red-400">
              <ShieldAlert size={13} />
              <span>Threshold: 7 failed attempts</span>
            </div>
          </div>

          {/* Failed Logins (24h) */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-900 transition-colors group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Failed Logins (24h)
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display">
              {stats.failed_24h}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Zap size={13} />
              <span>Monitored per client & user-agent</span>
            </div>
          </div>

          {/* Successful Logins (24h) */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-900 transition-colors group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Authorized Logins (24h)
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display">
              {stats.success_24h}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={13} />
              <span>Verified administrative sessions</span>
            </div>
          </div>

          {/* Log Retention Policy */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-900 transition-colors group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Data Retention
              </span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3 font-display">
              Weekly Auto-Purge
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
              <History size={13} />
              <span>Purges records older than 7 days</span>
            </div>
          </div>
        </div>

        {/* ── Tabs Bar ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('blocked')}
            className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'blocked'
                ? 'border-red-600 text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ban size={16} />
            <span>Active Blacklist</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'blocked'
                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {blockedIps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-red-600 text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-950/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock size={16} />
            <span>Live Login Audit Logs</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'logs'
                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {loginLogs.total}
            </span>
          </button>
        </div>

        {/* ── TAB 1: ACTIVE BLOCKLIST ── */}
        {activeTab === 'blocked' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield size={18} className="text-red-600 dark:text-red-400" />
                  Active Denied IP Addresses
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Inbound HTTP/HTTPS requests from these IP addresses are terminated immediately before application execution
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {isSuperAdmin ? 'Full Unblock Permission' : 'Superadmin Required to Unblock'}
              </span>
            </div>

            {blockedIps.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  No Active IP Bans
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5">
                  The security perimeter is clear. Suspicious IPs exceeding 7 failed login attempts will be automatically quarantined here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(true)}
                  className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus size={14} /> Manually Block an IP Address
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                      <th className="px-5 py-3.5">Target IP / Host</th>
                      <th className="px-5 py-3.5">Threat Reason</th>
                      <th className="px-5 py-3.5">Duration</th>
                      <th className="px-5 py-3.5">Enforced At</th>
                      <th className="px-5 py-3.5">Authority</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {blockedIps.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                              <Globe size={14} />
                            </span>
                            <span>{item.ip_address}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.ip_address)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              title="Copy IP address"
                            >
                              {copiedIp === item.ip_address ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.reason || 'Threshold Violation (>7 Failed Attempts)'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {item.permanent ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                              <Lock size={12} /> Permanent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                              <Clock size={12} />
                              {item.expires_at ? `Expires ${new Date(item.expires_at).toLocaleDateString()}` : 'Temporary'}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString()}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {item.creator_name ? (
                            <span className="font-semibold text-slate-900 dark:text-white">{item.creator_name}</span>
                          ) : (
                            <span className="italic text-slate-400">Automated Guard</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            BLOCKED
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleUnblock(item.id, item.ip_address)}
                            disabled={!isSuperAdmin || unblockingId === item.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSuperAdmin
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 active:scale-95 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                            }`}
                            title={isSuperAdmin ? 'Revoke block for this IP' : 'Only Super Admin has authority'}
                          >
                            <Unlock size={13} />
                            {unblockingId === item.id ? 'Revoking...' : 'Unblock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: LOGIN ACTIVITY LOGS ── */}
        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Filter Toolbar */}
            <form onSubmit={handleFilterSubmit} className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by user email, IP address, or failure reason..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Events</option>
                  <option value="success">Authorized (Success)</option>
                  <option value="failed">Unauthorized (Failed)</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </form>

            {loginLogs.data.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Clock size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">No Matching Records</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No sign-in events match the selected criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                      <th className="px-5 py-3.5">Result</th>
                      <th className="px-5 py-3.5">Account / Identity</th>
                      <th className="px-5 py-3.5">IP Address</th>
                      <th className="px-5 py-3.5">Device & Environment</th>
                      <th className="px-5 py-3.5">Message</th>
                      <th className="px-5 py-3.5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loginLogs.data.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          {log.successful ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={12} /> SUCCESS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800">
                              <XCircle size={12} /> FAILED
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                          {log.user_name || log.email || <span className="text-slate-400 italic">Unregistered</span>}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 dark:text-slate-300">{log.ip_address}</span>
                            {!log.successful && (
                              <button
                                type="button"
                                onClick={() => openQuickBlock(log.ip_address, `Flagged from failed login attempts on ${log.email || 'account'}`)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-300 border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
                                title="Instantly block this IP"
                              >
                                <Zap size={10} /> Block
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={log.user_agent || ''}>
                          <span className="inline-flex items-center gap-1.5">
                            <Laptop size={13} className="text-slate-400 shrink-0" />
                            {log.user_agent ? log.user_agent.split('(')[1]?.split(')')[0] || log.user_agent.slice(0, 32) : 'Unknown'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-xs">
                          <span className={log.successful ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {log.failure_reason || (log.successful ? 'Authorized access' : 'Authentication failed')}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-400 dark:text-slate-500 text-right whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {loginLogs.last_page > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
                {loginLogs.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      link.active
                        ? 'bg-red-600 text-white shadow-xs'
                        : link.url
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer'
                        : 'bg-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          CYBERSECURITY BLOCK IP MODAL (REDESIGNED & HIGH-END)
         ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isBlockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBlockModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
            >
              {/* Top Cyber Accent Line */}
              <div className="h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

              <div className="p-6 sm:p-7 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                      <Ban size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                        Block IP or Network Device
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Enforce perimeter rejection on all incoming requests from this address
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBlockModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Self-IP Alert Banner (Prevents Lockout Accidents) */}
                {isSelfIp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs"
                  >
                    <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Caution: Self-Lockout Risk!</strong>
                      The IP address you entered matches your current active session (<code className="font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded">{currentIp}</code>). If confirmed, you will be blocked from accessing the CMS.
                    </div>
                  </motion.div>
                )}

                {/* Main Form */}
                <form onSubmit={handleBlockSubmit} className="space-y-5">
                  {/* IP Address Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        IP Address or CIDR Subnet <span className="text-red-500">*</span>
                      </label>

                      {currentIp && (
                        <button
                          type="button"
                          onClick={() => setBlockData('ip_address', currentIp)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                          My IP: <span className="font-mono underline">{currentIp}</span>
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Globe size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 192.168.1.100 or 2001:db8::1"
                        value={blockData.ip_address}
                        onChange={e => setBlockData('ip_address', e.target.value)}
                        className={`w-full pl-11 pr-24 py-3 rounded-xl border text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                          blockErrors.ip_address || (ipValidation && !ipValidation.valid)
                            ? 'border-red-400 dark:border-red-600 focus:ring-red-500 bg-red-50/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-red-500 text-slate-900 dark:text-white'
                        }`}
                      />

                      {/* Format Badge */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {ipValidation && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            ipValidation.valid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {ipValidation.valid ? ipValidation.type : 'Invalid IP'}
                          </span>
                        )}
                      </div>
                    </div>

                    {blockErrors.ip_address && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {blockErrors.ip_address}
                      </p>
                    )}
                  </div>

                  {/* Reason Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Reason for Ban
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Terminal size={17} />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Repeated failed passwords, abusive bot, or spam probe"
                        value={blockData.reason}
                        onChange={e => setBlockData('reason', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Preset Reason Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_REASONS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBlockData('reason', preset)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selector */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Lockout Duration
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DURATIONS.map(dur => (
                        <button
                          key={dur.id}
                          type="button"
                          onClick={() => setBlockData('duration', dur.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            blockData.duration === dur.id
                              ? 'border-red-600 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-300 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-xs font-bold">{dur.label}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{dur.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsBlockModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={blockProcessing}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Ban size={16} />
                      {blockProcessing ? 'Enforcing Block...' : 'Enforce IP Ban'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Clear Logs Modal ── */}
      <AnimatePresence>
        {isClearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClearModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl z-10 space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Clear All Sign-In Activity Logs?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  This action will permanently purge all recorded authentication events from the database. Note that weekly log purging already runs automatically every 7 days.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  Yes, Clear All Logs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
