import { useState } from 'react';
import { 
  Activity, CheckCircle2, XCircle, Search, RefreshCw, Trash2, 
  Shield, User, Clock, Globe, Laptop, Smartphone, MapPin, 
  Copy, Check, ShieldCheck
} from 'lucide-react';

export const AccessLogs = ({
  logs = [],
  onRefresh,
  onClearLogs,
  isLoading = false,
  triggerConfirmDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState(null);

  // Filter out any root 'admin' entries
  const filteredRootLogs = logs.filter(
    (log) => log.username?.toLowerCase() !== 'admin'
  );

  // Summary Metrics
  const totalLogins = filteredRootLogs.length;
  const successfulLogins = filteredRootLogs.filter(l => l.status?.toLowerCase() === 'success').length;
  const failedLogins = filteredRootLogs.filter(l => l.status?.toLowerCase() === 'failed').length;
  const successRate = totalLogins > 0 ? Math.round((successfulLogins / totalLogins) * 100) : 100;

  // Filtered Logs
  const displayedLogs = filteredRootLogs.filter((log) => {
    const matchesSearch = 
      (log.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.browser || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.device || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.createdAt || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'SUCCESS' && log.status?.toLowerCase() === 'success') ||
      (statusFilter === 'FAILED' && log.status?.toLowerCase() === 'failed');

    const matchesRole = 
      roleFilter === 'ALL' || 
      log.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCopy = (key, text) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getDeviceIcon = (deviceStr = '') => {
    const d = deviceStr.toLowerCase();
    if (d.includes('iphone') || d.includes('android') || d.includes('mobile')) {
      return <Smartphone className="w-3.5 h-3.5 text-indigo-600" />;
    }
    return <Laptop className="w-3.5 h-3.5 text-blue-600" />;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Access Logs
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
              Audit Center
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Real-time security logs for authorized administrators (excluding master root account).
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 shadow-2xs transition cursor-pointer disabled:opacity-50"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#800000]' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Total Logins */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150 shadow-sm relative overflow-hidden group hover:border-[#800000]/30 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Total Logins
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 font-mono">
                {totalLogins}
              </h3>
              <p className="text-[11px] font-semibold text-gray-400 mt-1">
                Recorded portal sessions
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shadow-2xs group-hover:scale-105 transition">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        </div>

        {/* Card 2: Successful */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                Successful
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 font-mono">
                {successfulLogins}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600/80 mt-1 flex items-center space-x-1">
                <span className="font-bold">{successRate}%</span>
                <span>success rate</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs group-hover:scale-105 transition">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        </div>

        {/* Card 3: Failed Attempts */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150 shadow-sm relative overflow-hidden group hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-rose-700">
                Failed Attempts
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-700 mt-1 font-mono">
                {failedLogins}
              </h3>
              <p className="text-[11px] font-semibold text-rose-600/80 mt-1">
                {failedLogins > 0 ? 'Security alert review' : 'Zero suspicious attempts'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shadow-2xs group-hover:scale-105 transition">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username, IP address, browser, OS, or location..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#800000] transition bg-gray-50/50 focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 md:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white text-gray-700 focus:outline-none focus:border-[#800000] cursor-pointer"
            >
              <option value="ALL">All Statuses ({totalLogins})</option>
              <option value="SUCCESS">Success Only ({successfulLogins})</option>
              <option value="FAILED">Failed Only ({failedLogins})</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white text-gray-700 focus:outline-none focus:border-[#800000] cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Admin">Admin Only</option>
              <option value="Super Admin">Super Admin Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Access Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#800000]" />
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Authentication Audit Table ({displayedLogs.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-500">
            Showing latest sessions
          </span>
        </div>

        {displayedLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Activity className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-black text-gray-800">No Access Logs Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {filteredRootLogs.length === 0 
                ? 'No sub-admin login activity recorded yet. Logs will automatically appear here when added administrators log in.'
                : 'No logs match your current search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4 text-center w-14">S.NO</th>
                  <th className="py-3.5 px-4">DATE & TIME</th>
                  <th className="py-3.5 px-4">USER NAME</th>
                  <th className="py-3.5 px-4">ROLE</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4">IP ADDRESS</th>
                  <th className="py-3.5 px-4">BROWSER</th>
                  <th className="py-3.5 px-4">DEVICE / OS</th>
                  <th className="py-3.5 px-4">LOCATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                {displayedLogs.map((log, index) => {
                  const isSuccess = log.status?.toLowerCase() === 'success';
                  const isSuper = log.role === 'Super Admin';
                  const sno = index + 1;

                  return (
                    <tr 
                      key={log.id || `log-${index}`}
                      className="hover:bg-gray-50/70 transition"
                    >
                      {/* 1. S.NO */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-gray-400">
                        #{sno}
                      </td>

                      {/* 2. DATE & TIME */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-gray-800 font-bold">
                          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{log.createdAt || 'Just now'}</span>
                        </div>
                      </td>

                      {/* 3. USER NAME */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 shadow-2xs border ${
                            isSuper 
                              ? 'bg-[#800000] text-[#FFCC00] border-[#FFCC00]/40' 
                              : 'bg-gray-900 text-white border-gray-700'
                          }`}>
                            {(log.username || 'A')[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900 font-mono">
                            @{log.username}
                          </span>
                        </div>
                      </td>

                      {/* 4. ROLE */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-flex items-center space-x-1 border ${
                          isSuper 
                            ? 'bg-amber-50 text-amber-900 border-amber-300' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {isSuper ? <Shield className="w-3 h-3 text-[#800000]" /> : <User className="w-3 h-3 text-blue-600" />}
                          <span>{log.role || 'Admin'}</span>
                        </span>
                      </td>

                      {/* 5. STATUS */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isSuccess 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span>{isSuccess ? 'Success' : 'Failed'}</span>
                        </span>
                      </td>

                      {/* 6. IP ADDRESS */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold">
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                          <button
                            onClick={() => handleCopy(`ip-${log.id || index}`, log.ipAddress || '127.0.0.1')}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer transition hover:bg-gray-200/60"
                            title="Copy IP"
                          >
                            {copiedKey === `ip-${log.id || index}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 7. BROWSER */}
                      <td className="py-4 px-4 whitespace-nowrap text-gray-700 font-bold">
                        <div className="flex items-center space-x-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span>{log.browser || 'Google Chrome'}</span>
                        </div>
                      </td>

                      {/* 8. DEVICE / OS */}
                      <td className="py-4 px-4 whitespace-nowrap text-gray-700 font-bold">
                        <div className="flex items-center space-x-1.5">
                          {getDeviceIcon(log.device)}
                          <span>{log.device || 'Desktop PC'}</span>
                        </div>
                      </td>

                      {/* 9. LOCATION */}
                      <td className="py-4 px-4 whitespace-nowrap text-gray-700 font-bold">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          <span>{log.location || 'Kallakurichi, TN'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessLogs;
