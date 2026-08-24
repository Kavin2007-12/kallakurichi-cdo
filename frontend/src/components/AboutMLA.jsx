import { useState, useEffect } from 'react';
import { User, Landmark, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { getCurrentLanguage } from '../utils/lang';

const getCachedMlaData = () => {
  try {
    const cached = localStorage.getItem('kallakurichi_mla');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return null;
};

const AboutMLA = () => {
  const [mlaData, setMlaData] = useState(getCachedMlaData);

  useEffect(() => {
    api.getMlaData(null).then(data => {
      if (data && typeof data === 'object') {
        setMlaData(data);
      }
    });
  }, []);

  const currentLang = getCurrentLanguage();
  const isTa = currentLang === 'ta';

  // If no data exists at all, use an empty object fallback
  const data = mlaData || {};
  const hasPhoto = Boolean(data.photo && data.photo.trim());
  const bioParagraphs = data.bio
    ? data.bio.split(/\n\n+/).filter(Boolean)
    : [data.bioP1, data.bioP2].filter(Boolean);

  return (
    <section id="about-mla" className="py-16 sm:py-24 bg-gradient-to-b from-white via-yellow-50/25 to-white overflow-hidden relative">
      {/* Decorative TVK Gold Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[#FFCC00]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#800000]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Premium Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#800000]/10 border border-[#800000]/20 text-[#800000] text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Constituency Leadership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            About the MLA
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-[#800000] via-[#FFCC00] to-[#800000] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          
          {/* Left Column: Photo Frame with TVK Emblem (Always preserved!) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-[320px] sm:max-w-[380px] w-full">
              {/* Luxury Frame Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#800000]/30 to-[#FFCC00]/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition duration-500 -z-10"></div>
              
              {/* Image Card Container */}
              <div className="relative bg-white border-2 border-[#FFCC00]/60 rounded-3xl p-3 sm:p-4 shadow-2xl overflow-hidden">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-3/4 flex items-center justify-center">
                  {hasPhoto ? (
                    <img 
                      src={data.photo} 
                      alt={data.name ? `${data.name} MLA` : "MLA Photograph"} 
                      className="w-full h-full object-cover object-top select-none group-hover:scale-103 transition-transform duration-500"
                      draggable="false"
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
                      <div className="w-20 h-20 rounded-full bg-[#800000]/10 flex items-center justify-center mb-3 border border-[#800000]/20 shadow-xs">
                        <User size={38} className="text-[#800000]/60" />
                      </div>
                      <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                        {data.name || 'Official MLA Profile'}
                      </span>
                    </div>
                  )}

                  {/* Floating TVK Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-[#800000]/90 backdrop-blur-md text-[#FFCC00] text-[10px] font-black uppercase tracking-wider border border-[#FFCC00]/40 shadow-lg">
                    TVK • MLA
                  </div>
                </div>

                {/* Card Sub-Banner */}
                <div className="pt-3.5 pb-1 text-center">
                  <span className="text-xs font-black text-gray-900 block">
                    {data.name || (isTa ? 'சட்டமன்ற உறுப்பினர்' : 'Member of Legislative Assembly')}
                  </span>
                  <span className="text-[10px] text-[#800000] font-black uppercase tracking-wider block mt-0.5">
                    {data.constituency || (isTa ? 'கள்ளக்குறிச்சி சட்டமன்ற தொகுதி' : 'Kallakurichi Assembly Constituency')}
                  </span>
                </div>
              </div>
            </div>
          </div>
 
          {/* Right Column: Bio Details */}
          <div className="lg:col-span-7 space-y-6 w-full">
            
            <div className="space-y-2.5 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center space-x-2 bg-yellow-50 text-[#800000] border border-yellow-300 px-3.5 py-1.5 rounded-xl text-xs font-black">
                <Landmark size={14} className="text-[#800000]" />
                <span>{isTa ? 'தமிழ்நாடு சட்டமன்ற உறுப்பினர்' : 'Member of Tamil Nadu Legislative Assembly'}</span>
              </div>
              
              {data.name && (
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  {data.name} {data.suffix && <span className="text-sm sm:text-base text-gray-500 font-bold ml-1">{data.suffix}</span>}
                </h3>
              )}
              
              {data.constituency && (
                <p className="text-xs sm:text-sm font-extrabold text-[#800000] tracking-wide uppercase">
                  {data.constituency}
                </p>
              )}
            </div>

            {/* Biography Paragraph Card */}
            {bioParagraphs.length > 0 && (
              <div className="pt-1">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm hover:border-[#FFCC00]/60 hover:shadow-md transition space-y-4">
                  {bioParagraphs.map((para, idx) => (
                    <p key={idx} className="text-sm sm:text-base md:text-[17px] text-gray-700 leading-relaxed text-justify font-medium">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Channels Row in Brand Colors */}
            <div className="pt-2 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-gray-150 shadow-xs">
              <div className="text-center sm:text-left">
                <span className="text-xs font-black text-gray-900 block uppercase tracking-wider">
                  {isTa ? 'அதிகாரப்பூர்வ சமூக வலைதளப் பக்கங்கள்' : 'Official Social Media'}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {isTa ? 'சட்டமன்ற உறுப்பினருடன் நேரடி தொடர்பில் இருங்கள்' : `Connect directly with ${data.name || 'MLA'}`}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md text-white cursor-pointer"
                  title="Instagram"
                >
                  <svg viewBox="0 0 448 512" width="18" height="18" fill="currentColor">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                  </svg>
                </a>
                
                {/* X (Twitter) */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md text-white cursor-pointer"
                  title="X (Twitter)"
                >
                  <svg viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md text-white cursor-pointer"
                  title="Facebook"
                >
                  <svg viewBox="0 0 320 512" width="16" height="16" fill="currentColor">
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMLA;
