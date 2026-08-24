import { useState } from 'react';
import { Plus, Trash2, Shield, Key, User, Phone, Clock, Eye, EyeOff, ShieldCheck, Check, Copy, Edit3 } from 'lucide-react';

export const Settings = ({
  adminsList = [],
  currentUser,
  onOpenAddAdminModal,
  onEditAdmin,
  onDeleteAdmin,
  triggerConfirmDelete
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const togglePassword = (username) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handleCopy = (key, text) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const displayAdmins = adminsList.filter(
    (admin) => admin.username?.toLowerCase() !== 'admin'
  );

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
            <span>Admin Accounts & Security</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
              Super Admin Portal
            </span>
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Manage authorized portal administrators, security credentials, mobile numbers, and access roles.
          </p>
        </div>
        {currentUser?.role === 'Super Admin' && (
          <button
            onClick={onOpenAddAdminModal}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#660000] hover:to-[#440000] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/25 transition cursor-pointer border border-[#FFCC00]/30"
          >
            <Plus className="w-4 h-4 text-[#FFCC00]" />
            <span>Add New Admin</span>
          </button>
        )}
      </div>

      {/* Admin Accounts Table / Cards */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#800000]" />
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Authorized Administrators ({displayAdmins.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-500">
            Click eye icon to reveal, copy icon to copy credentials.
          </span>
        </div>

        {displayAdmins.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <User className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-black text-gray-800">No Administrators Added Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Click "Add New Admin" button above to create portal admin accounts with custom role, mobile number, and password.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayAdmins.map((admin) => {
              const isSuper = admin.role === 'Super Admin';
              const isPasswordVisible = !!visiblePasswords[admin.username];

              return (
                <div 
                  key={admin.id || admin.username} 
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-gray-50/60 transition"
                >
                  {/* Left: User Identity & Role */}
                  <div className="flex items-start space-x-4 min-w-[220px]">
                    <div className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm border ${
                      isSuper 
                        ? 'bg-[#800000] text-[#FFCC00] border-[#FFCC00]/40' 
                        : 'bg-gray-900 text-white border-gray-700'
                    }`}>
                      {(admin.username || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-black text-gray-900 font-mono">
                          @{admin.username}
                        </h4>
                      </div>
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-flex items-center space-x-1 border ${
                          isSuper 
                            ? 'bg-amber-50 text-amber-900 border-amber-300' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {isSuper ? <Shield className="w-3 h-3 text-[#800000]" /> : <User className="w-3 h-3 text-blue-600" />}
                          <span>{admin.role || 'Admin'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Details (Mobile, Password with Reveal Toggle & Copy, Created Date) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1 lg:max-w-2xl bg-gray-50/80 p-3.5 sm:p-4 rounded-2xl border border-gray-200/70 text-xs">
                    {/* Mobile Number */}
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#800000]" />
                        <span>Mobile Number</span>
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-gray-900 font-mono">
                          {admin.mobile || admin.phone || 'Not Specified'}
                        </span>
                        {(admin.mobile || admin.phone) && (
                          <button
                            onClick={() => handleCopy(`mob-${admin.username}`, admin.mobile || admin.phone)}
                            className="text-gray-400 hover:text-gray-700 p-1 rounded cursor-pointer transition hover:bg-gray-200/60"
                            title="Copy Mobile Number"
                          >
                            {copiedKey === `mob-${admin.username}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Password with Show/Hide Eye Toggle & Copy Button */}
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1 flex items-center space-x-1">
                        <Key className="w-3 h-3 text-gray-500" />
                        <span>Password</span>
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-gray-200 ${
                          isPasswordVisible ? 'text-emerald-700' : 'text-gray-500 tracking-widest'
                        }`}>
                          {isPasswordVisible ? (admin.password || '••••••••') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePassword(admin.username)}
                          className="p-1 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-[#800000] border border-gray-200 transition cursor-pointer shadow-2xs"
                          title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="w-3.5 h-3.5 text-[#800000]" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {admin.password && (
                          <button
                            type="button"
                            onClick={() => handleCopy(`pass-${admin.username}`, admin.password)}
                            className="p-1 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-emerald-600 border border-gray-200 transition cursor-pointer shadow-2xs"
                            title="Copy Password"
                          >
                            {copiedKey === `pass-${admin.username}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Added Date & Time */}
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>Added Date & Time</span>
                      </span>
                      <span className="font-bold text-gray-800 block truncate" title={admin.createdAt || 'Recent'}>
                        {admin.createdAt || 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 justify-end lg:justify-center">
                    {onEditAdmin && (
                      <button
                        onClick={() => onEditAdmin(admin)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                        title="Edit Admin Details & Password"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      onClick={() => triggerConfirmDelete({
                        title: 'Revoke Admin Access',
                        message: `Are you sure you want to permanently delete admin account "${admin.name || admin.username}" (@${admin.username})?`,
                        onConfirm: () => onDeleteAdmin(admin.username)
                      })}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent text-xs font-bold transition cursor-pointer"
                      title="Delete Admin Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
