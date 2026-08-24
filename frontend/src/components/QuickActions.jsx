import { useRef, useEffect } from 'react';
import { ShieldAlert, HeartPulse, Flame, PhoneCall, AlertCircle } from 'lucide-react';

const QuickActions = () => {
  const cardRef = useRef(null);

  // Scroll animation: shrinks when box is down / leaving, expands to 1.0 (normal) when fully displayed
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;

            // Element center vs Viewport center
            const elemCenter = rect.top + rect.height / 2;
            const vCenter = windowHeight / 2;

            // Distance from viewport center
            const dist = Math.abs(elemCenter - vCenter);
            const maxDist = windowHeight * 0.65;

            // Progress: 1 when perfectly centered, 0 when far away/at bottom/top
            const progress = Math.max(0, Math.min(1, 1 - dist / maxDist));

            // Smooth sine easing
            const eased = Math.sin((progress * Math.PI) / 2);

            // Scale from 0.88 (when box goes down/enters) to 1.0 (when displayed fully)
            const scale = 0.88 + 0.12 * eased;
            const opacity = 0.85 + 0.15 * eased;

            // Responsive shadow: expands and deepens dynamically with the scale animation
            const shadowY = 8 + 17 * eased;
            const shadowBlur = 20 + 30 * eased;
            const shadowSpread = -6 - 6 * eased;
            const shadowAlpha1 = 0.08 + 0.18 * eased;
            const shadowAlpha2 = 0.04 + 0.12 * eased;

            const boxShadow = `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px ${shadowSpread.toFixed(1)}px rgba(239, 68, 68, ${shadowAlpha1.toFixed(3)}), 0 ${(shadowY * 0.5).toFixed(1)}px ${(shadowBlur * 0.5).toFixed(1)}px -6px rgba(249, 115, 22, ${shadowAlpha2.toFixed(3)})`;

            cardRef.current.style.transform = `scale(${scale.toFixed(4)})`;
            cardRef.current.style.opacity = `${opacity.toFixed(3)}`;
            cardRef.current.style.boxShadow = boxShadow;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const helplines = [
    { title: 'Police', number: '100', icon: ShieldAlert, color: 'text-blue-600', bg: 'bg-blue-100', hover: 'hover:bg-blue-50 hover:border-blue-200' },
    { title: 'Ambulance', number: '108', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-100', hover: 'hover:bg-emerald-50 hover:border-emerald-200' },
    { title: 'Fire & Rescue', number: '101', icon: Flame, color: 'text-red-600', bg: 'bg-red-100', hover: 'hover:bg-red-50 hover:border-red-200' },
    { title: 'Women Helpline', number: '1091', icon: PhoneCall, color: 'text-purple-600', bg: 'bg-purple-100', hover: 'hover:bg-purple-50 hover:border-purple-200' },
  ];

  return (
    <div className="py-12 bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div 
          ref={cardRef}
          className="bg-gradient-to-br from-red-50 via-orange-50/70 to-red-50/50 rounded-[2.5rem] p-6 md:p-10 lg:p-12 border border-red-100/80 flex flex-col lg:flex-row items-center justify-between gap-10 transition-all duration-200 ease-out will-change-transform"
          style={{
            transform: 'scale(0.88)',
            transformOrigin: 'center center',
          }}
        >
          
          {/* Left: Call to Action Text */}
          <div className="text-center lg:text-left lg:max-w-sm">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-1.5 rounded-full mb-5">
               <AlertCircle size={16} strokeWidth={2.5} /> 
               <span className="text-xs font-extrabold uppercase tracking-widest">Emergency Only</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">
              Need Immediate Assistance?
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Direct helplines for the citizens of Kallakurichi. Available 24/7.
            </p>
          </div>

          {/* Right: Helpline Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full lg:w-auto flex-1 max-w-2xl">
            {helplines.map((item, index) => {
              const Icon = item.icon;
              return (
                <a 
                  href={`tel:${item.number}`}
                  key={index} 
                  className={`bg-white border border-gray-100 rounded-2xl p-4 flex items-center space-x-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer ${item.hover} group`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-gray-500 font-extrabold uppercase tracking-wider mb-0.5">
                      {item.title}
                    </p>
                    <h3 className="text-xl md:text-2xl font-black text-gray-800 group-hover:text-red-600 transition-colors">
                      {item.number}
                    </h3>
                  </div>
                </a>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickActions;
