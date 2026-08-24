import { Home, Edit3, Search, PhoneCall, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentLanguage } from '../utils/lang';

const MobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentLang = getCurrentLanguage();

  const navItems = [
    { name: currentLang === 'ta' ? 'முகப்பு' : 'Home', path: '/', icon: Home },
    { name: currentLang === 'ta' ? 'பதிவு' : 'Register', path: '/register', icon: Edit3 },
    { name: currentLang === 'ta' ? 'கண்காணிப்பு' : 'Track', path: '/track', icon: Search },
    { name: currentLang === 'ta' ? 'தொடர்பு' : 'Contact', path: '/contact', icon: PhoneCall },
    { name: currentLang === 'ta' ? 'உதவி' : 'Help', path: '/faq', icon: HelpCircle },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#6a0000] text-white border-t border-red-900 flex justify-around items-center h-[70px] z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        return (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors notranslate ${
              isActive ? 'text-secondary font-bold' : 'text-white/80 hover:text-white'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNav;
