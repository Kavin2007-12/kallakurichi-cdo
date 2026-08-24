import { useState } from 'react';
import { Menu, X, MapPin, Phone, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentLanguage, setAppLanguage } from '../utils/lang';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const currentLang = getCurrentLanguage();

  const toggleLanguage = (langCode) => {
    setAppLanguage(langCode);
  };

  const navLinks = [
    { name: currentLang === 'ta' ? 'முகப்பு' : 'Home', path: '/' },
    { name: currentLang === 'ta' ? 'எங்களைப் பற்றி' : 'About us', path: '/about' },
    { name: currentLang === 'ta' ? 'சந்திப்பு பதிவு' : 'Book Appointment', path: '/appointment' },
    { name: currentLang === 'ta' ? 'தன்னார்வலர்கள்' : 'Volunteers', path: '/volunteer' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-secondary shadow-sm md:overflow-visible transition-all duration-300">
      <div className="w-full px-2.5 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-1.5 sm:gap-4">

          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer select-none min-w-0 flex-1 sm:flex-initial">
            <img
              src="/TVK_Logo.png"
              alt="TVK Party Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain shrink-0"
            />
            <div className="flex flex-col text-left min-w-0">
              <span className="text-primary font-extrabold text-[13px] xs:text-[15px] sm:text-lg md:text-2xl leading-tight whitespace-nowrap notranslate">
                {currentLang === 'ta' ? 'திரு. சி. அருள் விக்னேஷ்' : 'Mr. C. Arul Vignesh'} <span className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-90">M.Sc.,MLA</span>
              </span>
              <span className="text-primary text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap truncate max-w-[175px] xs:max-w-[230px] sm:max-w-none notranslate">
                {currentLang === 'ta' ? 'கள்ளக்குறிச்சி சட்டமன்ற உறுப்பினர்' : 'Kallakurichi Member of Legislative Assembly'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation & Lang Switcher */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={index}
                  to={link.path}
                  className={`text-sm md:text-base font-bold transition-all duration-200 cursor-pointer pb-1 border-b-2 notranslate ${isActive
                      ? 'text-primary border-primary'
                      : 'text-primary/70 border-transparent hover:text-primary hover:border-primary'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Language Selection Pills */}
            <div className="flex items-center bg-primary/10 rounded-full p-1 border border-primary/15 select-none notranslate">
              <button
                onClick={() => toggleLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer notranslate ${currentLang === 'en'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-primary/70 hover:text-primary'
                  }`}
              >
                Eng
              </button>
              <button
                onClick={() => toggleLanguage('ta')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer notranslate ${currentLang === 'ta'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-primary/70 hover:text-primary'
                  }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* Mobile Menu & Language Toggle Row */}
          <div className="lg:hidden flex items-center space-x-1.5 sm:space-x-3 shrink-0 select-none">

            {/* Mobile Lang Toggles */}
            <div className="flex items-center bg-primary/10 rounded-full p-0.5 border border-primary/15 shrink-0 notranslate">
              <button
                onClick={() => toggleLanguage('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition notranslate cursor-pointer ${currentLang === 'en' ? 'bg-primary text-white shadow-xs' : 'text-primary/70'
                  }`}
              >
                Eng
              </button>
              <button
                onClick={() => toggleLanguage('ta')}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition notranslate cursor-pointer ${currentLang === 'ta' ? 'bg-primary text-white shadow-xs' : 'text-primary/70'
                  }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-primary hover:text-accent focus:outline-none cursor-pointer p-1"
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 select-none ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Sidebar */}
        <div className={`relative flex flex-col max-w-[280px] w-full h-full bg-secondary shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          <div className="px-5 pt-6 pb-6 flex items-center justify-between border-b border-primary/20">
            <div className="flex items-center space-x-3">
              <img src="/TVK_Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <div className="flex flex-col text-left">
                <span className="text-primary font-bold text-base leading-tight mt-1 uppercase notranslate">
                  {currentLang === 'ta' ? 'கள்ளக்குறிச்சி' : 'Kallakurichi'}
                </span>
              </div>
            </div>

            {/* Modern Close Button Inside Sidebar */}
            <button
              className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-secondary transition-colors focus:outline-none cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Links list in Sidebar */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <nav className="px-4 space-y-2">
              {navLinks.map((link, index) => {
                const isActive = currentPath === link.path;
                return (
                  <Link
                    key={index}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center w-full px-4 py-3.5 text-base font-semibold rounded-xl transition cursor-pointer text-left notranslate ${isActive
                        ? 'bg-primary text-white'
                        : 'text-primary hover:bg-primary hover:text-secondary'
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Zonal Office Quick Contacts Block inside Sidebar Footer */}
          <div className="p-5 border-t border-primary/20 bg-primary/5 text-left text-xs font-semibold text-primary space-y-3 notranslate">
            <span className="block text-[10px] text-primary/60 font-black uppercase tracking-wider mb-1">
              {currentLang === 'ta' ? 'தொடர்பு விவரங்கள்' : 'Constituency Contacts'}
            </span>

            <div className="flex items-start space-x-2">
              <MapPin size={14} className="shrink-0 mt-0.5 text-primary" />
              <span className="text-primary/80 font-medium text-[11px] leading-normal">
                {currentLang === 'ta'
                  ? 'சேலம் நெடுஞ்சாலை சந்திப்பு, கள்ளக்குறிச்சி.'
                  : 'Salem Highway Junction, Kallakurichi.'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Phone size={14} className="shrink-0 text-primary" />
              <span className="text-primary/80 font-medium text-[11px]">+91 98765 43210</span>
            </div>

            <div className="flex items-center space-x-2">
              <Mail size={14} className="shrink-0 text-primary" />
              <span className="text-primary/80 font-medium text-[11px] text-wrap break-all">mla.kallakurichi@cdo.tn.gov.in</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
