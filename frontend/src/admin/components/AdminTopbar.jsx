import { RefreshCw, Menu } from 'lucide-react';

export const AdminTopbar = ({ 
  activeTab, 
  currentUser, 
  onRefresh, 
  isCollapsed,
  onOpenMobileMenu 
}) => {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'overview': return 'Dashboard Overview';
      case 'banners': return 'Home & Volunteer Banners';
      case 'mla': return 'MLA Profile & Biography';
      case 'news': return 'Live News & Media Releases';
      case 'social': return 'Social Media Feeds & Quotes';
      case 'daily': return 'Daily Completed Works';
      case 'appointments': return 'Appointments Management';
      case 'volunteers': return 'Volunteers & Membership';
      case 'access_logs': return 'Access Logs & Security Audit';
      case 'admins': return 'Admin Accounts & Settings';
      default: return 'Admin Console';
    }
  };

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-gray-200/80 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-[#800000]/10 hover:bg-[#800000]/20 text-[#800000] border border-[#800000]/20 transition cursor-pointer flex-shrink-0 flex items-center justify-center"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-[#800000]" />
        </button>

        {/* Collapsed Desktop TVK Badge */}
        {isCollapsed && (
          <div className="hidden md:flex items-center space-x-2 mr-2">
            <div className="w-8 h-8 rounded-xl bg-[#800000] text-[#FFCC00] flex items-center justify-center font-black text-xs shadow-xs border border-[#FFCC00]/40">
              TVK
            </div>
          </div>
        )}

        <div className="text-left min-w-0">
          <h1 className="text-sm sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">
            {getTabTitle(activeTab)}
          </h1>
          <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden sm:block truncate">
            Tamilaga Vettri Kazhagam • Kallakurichi
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-[#800000] transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold shadow-xs"
            title="Sync Data"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#800000]" />
            <span className="hidden md:inline">Sync Data</span>
          </button>
        )}

        {/* User Pill */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-[#800000] text-white border border-[#FFCC00]/40 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse"></div>
          <span className="text-[11px] sm:text-xs font-extrabold tracking-wide">{currentUser?.username || 'Admin'}</span>
          <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-[#FFCC00] text-[#800000] uppercase">
            {currentUser?.role === 'Super Admin' ? 'Super' : 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
