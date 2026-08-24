import { MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { getCurrentLanguage, setAppLanguage } from '../utils/lang';

const Topbar = () => {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    setAppLanguage(langCode);
  };

  return (
    <div className="bg-secondary text-primary border-b border-primary/10 text-[10px] md:text-xs py-1.5 md:py-2 px-4 md:px-8 flex justify-between items-center">
      <div className="flex items-center space-x-1 md:space-x-2">
        <MapPin size={12} className="md:w-3.5 md:h-3.5" />
        <span className="font-medium">Kallakurichi Office</span>
      </div>
      
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="flex items-center space-x-1 md:space-x-2">
          <Phone size={12} className="md:w-3.5 md:h-3.5" />
          <span className="font-medium">+91 98765 43210</span>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2">
          <Mail size={12} className="md:w-3.5 md:h-3.5" />
          <span className="font-medium">kallakurichioffice@gmail.com</span>
        </div>
        
        {/* Language Switcher linked to Google Translate */}
        <div className="flex items-center space-x-2 text-[9px] md:text-xs notranslate">
          <button 
            onClick={() => changeLanguage('ta')}
            className={`px-2 py-1 md:px-4 md:py-1.5 rounded transition cursor-pointer ${currentLang === 'ta' ? 'bg-primary text-secondary font-bold' : 'border border-primary/30 text-primary hover:bg-primary/5'}`}
          >
            தமிழ்
          </button>
          <button 
            onClick={() => changeLanguage('en')}
            className={`px-2 py-1 md:px-4 md:py-1.5 rounded transition cursor-pointer ${currentLang === 'en' ? 'bg-primary text-secondary font-bold' : 'border border-primary/30 text-primary hover:bg-primary/5'}`}
          >
            ENG
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
