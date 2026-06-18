import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RotateCcw, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle,
  HardDrive
} from 'lucide-react';
import { AuditLog } from '../types';

interface ActivityLogsProps {
  token: string | null;
}

export default function ActivityLogs({ token }: ActivityLogsProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.username.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const getModuleBadgeColor = (mod: string) => {
    switch (mod) {
      case 'System': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Auth': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'POS': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-450';
      case 'Inventory': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Backup': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-450';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-500 animate-pulse" />
            Security Audit Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic ledger tracking all database commits, pharmacy sales, backups, and role authorization audits.
          </p>
        </div>
        
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 self-end text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-gray-250 dark:border-slate-800 rounded-lg hover:shadow-xs hover:border-gray-300 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 animate-spin-reverse" />
          Refresh Ledger
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 border border-gray-200 dark:border-slate-800 rounded-xl">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search action, username, or description details..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800 rounded-lg text-xs pl-10 pr-4 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Modules</option>
            <option value="System">System</option>
            <option value="Auth">Auth</option>
            <option value="POS">POS (Billing)</option>
            <option value="Inventory">Inventory</option>
            <option value="Backup">Backup & Restore</option>
          </select>
        </div>

        <div className="flex items-center justify-center p-2 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-150/40 rounded-lg text-emerald-700 dark:text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
          <CheckCircle className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
          Total Actions: {filteredLogs.length}
        </div>
      </div>

      {/* Log Ledger Panel */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-805 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
            <span className="text-xs text-slate-500 font-mono">Loading tamper-proof ledger...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
            <p className="font-semibold text-sm">No security alerts or audit logs matched.</p>
            <p className="text-xs text-slate-400 mt-1">Refine your search criteria or filter scope.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/30 border-b border-gray-200 dark:border-slate-801 text-slate-600 dark:text-slate-400 font-display font-semibold text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Action performed</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Audit trail details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-800 text-xs">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors text-slate-700 dark:text-slate-350"
                  >
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(log.timestamp).toLocaleDateString()}
                        <Clock className="w-3 h-3 text-slate-400 ml-1.5" />
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getModuleBadgeColor(log.module)}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-900 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
                        {log.username}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-sans text-slate-600 dark:text-slate-400 leading-normal">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
