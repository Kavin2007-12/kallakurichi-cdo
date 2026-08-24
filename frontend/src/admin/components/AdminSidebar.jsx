import { 
  LayoutDashboard, Sliders, User, Newspaper, Calendar, 
  Briefcase, LogOut, Users, Clock, Shield, Share2, ChevronLeft, ChevronRight, X, Activity
} from 'lucide-react';

export const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout, 
  isCollapsed, 
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'banners', label: 'Banners (Home)', icon: Sliders },
    { id: 'mla', label: 'MLA Profile', icon: User },
    { id: 'news', label: 'Live News', icon: Newspaper },
    { id: 'events', label: 'Events & Town Halls', icon: Calendar },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'daily', label: 'Daily Works', icon: Briefcase },
    { id: 'appointments', label: 'Appointments', icon: Clock },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    ...(currentUser?.role === 'Super Admin' ? [
      { id: 'access_logs', label: 'Access Logs', icon: Activity },
      { id: 'admins', label: 'Settings', icon: Shield }
    ] : [])
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity cursor-pointer animate-fadeIn"
        />
      )}

      {/* Main Sidebar (Pure TVK Crimson Red #800000 & Gold #FFCC00) */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 bg-[#800000] text-white transition-all duration-300 ease-in-out flex flex-col border-r-2 border-[#FFCC00]/30 shadow-2xl ${
        // Mobile Drawer Slide-in
        isMobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full'
      } md:translate-x-0 ${
        // Desktop Collapse Width
        isCollapsed ? 'md:w-20' : 'md:w-64'
      }`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#FFCC00]/25 bg-[#700000]">
          {/* Logo & Text for Expanded/Mobile */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] text-[#800000] flex items-center justify-center font-black text-sm shadow-md flex-shrink-0 border-2 border-white/20">
                TVK
              </div>
              <div className="text-left truncate">
                <h2 className="text-sm font-extrabold text-white tracking-wide truncate">Kallakurichi CDO</h2>
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] animate-pulse"></span>
                  <span className="text-[10px] text-[#FFCC00] font-black tracking-widest uppercase block">Admin Portal</span>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed Desktop TVK Logo */
            <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] text-[#800000] flex items-center justify-center font-black text-sm shadow-md mx-auto border-2 border-white/20">
              TVK
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFCC00] transition cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFCC00] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFCC00] text-[#800000] font-black shadow-lg shadow-black/20 scale-[1.02]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                title={isCollapsed && !isMobileOpen ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#800000]' : 'text-[#FFCC00]'}`} />
                {(!isCollapsed || isMobileOpen) && <span className="tracking-wide truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#FFCC00]/25 bg-[#6b0000]">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FFCC00] text-[#800000] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                  {(currentUser?.username || 'A')[0].toUpperCase()}
                </div>
                <div className="text-left truncate min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.username || 'Admin'}</p>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#FFCC00] block truncate">
                    {currentUser?.role || 'Administrator'}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-white/70 hover:text-red-300 hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex justify-center p-2 text-white/70 hover:text-red-300 hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
