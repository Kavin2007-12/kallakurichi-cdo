import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentLanguage } from '../utils/lang';

const Footer = () => {
  const currentLang = getCurrentLanguage();

  const quickLinks = [
    { name: currentLang === 'ta' ? 'முகப்பு' : 'Home', path: '/' },
    { name: currentLang === 'ta' ? 'எங்களைப் பற்றி' : 'About us', path: '/about' },
    { name: currentLang === 'ta' ? 'சந்திப்பு பதிவு' : 'Book Appointment', path: '/appointment' },
    { name: currentLang === 'ta' ? 'தன்னார்வலர்கள்' : 'Volunteers', path: '/volunteer' }
  ];

  return (
    <footer className="bg-primary text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/20 pb-12 mb-8">
          
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                 <img src="/tn_logo.png" alt="Gov Logo" className="w-7 h-7 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight text-white">KALLAKURICHI</span>
                <span className="text-[10px] text-gray-300 font-medium">CONSTITUENCY DIGITAL OFFICE</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed pr-4">
              We are committed to serve the people of Kallakurichi. Your voice helps us build a better tomorrow.
            </p>
            <div className="flex items-center space-x-3 pt-3">
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-md text-white">
                <svg viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform shadow-md text-white">
                <svg viewBox="0 0 320 512" width="11" height="16" fill="currentColor">
                  <path d="M279.1 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.4 0 225.4 0c-73.22 0-121.1 44.38-121.1 124.7v70.62H22.89V288h81.39v224h100.2V288z"/>
                </svg>
              </a>
              {/* X (Twitter) */}
              <a href="#" aria-label="X (Twitter)" className="w-9 h-9 rounded-full bg-black border border-gray-700 flex items-center justify-center hover:scale-110 transition-transform shadow-md text-white">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center hover:scale-110 transition-transform shadow-md text-white">
                <svg viewBox="0 0 576 512" width="16" height="14" fill="currentColor">
                  <path d="M549.7 124.1c-6.28-23.65-24.76-42.28-48.28-48.6-42.66-11.45-213.6-11.45-213.6-11.45s-170.9 0-213.6 11.45c-23.52 6.32-42 24.95-48.28 48.6-11.41 42.87-11.41 132.3-11.41 132.3s0 89.44 11.41 132.3c6.28 23.65 24.76 42.28 48.28 48.6 42.66 11.45 213.6 11.45 213.6 11.45s170.9 0 213.6-11.45c23.52-6.32 42-24.95 48.28-48.6 11.41-42.87 11.41-132.3 11.41-132.3s0-89.44-11.41-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide notranslate">
              {currentLang === 'ta' ? 'விரைவு இணைப்புகள்' : 'QUICK LINKS'}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm text-gray-300 hover:text-yellow-400 transition flex items-center space-x-2 notranslate">
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">USEFUL LINKS</h3>
            <ul className="space-y-3">
              {[
                'Kallakurichi District Official Website',
                'Government of Tamil Nadu',
                'TN e-Services',
                'Public Grievance Portal'
              ].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-gray-300 hover:text-yellow-400 transition flex items-center space-x-2">
                    <span>{link}</span>
                    <ExternalLink size={12} className="opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">CONTACT US</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="mt-1">📍</span>
                <span>Kallakurichi Constituency Office, <br/>Kallakurichi, Tamil Nadu - 606202</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-300">
                <span>📞</span>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-300">
                <span>✉️</span>
                <span>kallakurichioffice@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-300">
                <span>🕒</span>
                <span>Mon - Sat : 10:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 text-center md:text-left">
          <p className="mb-3 md:mb-0 leading-relaxed max-w-xs md:max-w-none">
            © 2024 Kallakurichi Constituency Digital Office. All rights reserved.
          </p>
          <p className="leading-relaxed">
            Designed and developed by a citizen of Kallakurichi.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
