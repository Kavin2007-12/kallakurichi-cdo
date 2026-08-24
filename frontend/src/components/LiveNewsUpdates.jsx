import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Share2, FileText } from 'lucide-react';
import { createNewsSlug } from '../utils/slug';
import { getCurrentLanguage } from '../utils/lang';

const LiveNewsUpdates = () => {
  const containerRef = useRef(null);
  const isInteracting = useRef(false);
  const pauseTimeoutRef = useRef(null);
  const [mediaUpdates, setMediaUpdates] = useState([]);
  const currentLang = getCurrentLanguage();

  useEffect(() => {
    import('../services/api').then(({ api }) => {
      api.getLiveNews([]).then(data => {
        if (Array.isArray(data)) {
          setMediaUpdates(data);
        }
      });
    });
  }, []);

  // Set initial scroll position to middle set so backward scrolling works immediately
  useEffect(() => {
    const container = containerRef.current;
    if (container && mediaUpdates.length > 0) {
      const timer = setTimeout(() => {
        const singleSetWidth = container.scrollWidth / 4;
        if (singleSetWidth > 0) {
          container.scrollLeft = singleSetWidth;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mediaUpdates]);

  // Infinite wrap handler on scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || mediaUpdates.length === 0) return;
    const singleSetWidth = container.scrollWidth / 4;
    if (singleSetWidth <= 0) return;

    if (container.scrollLeft >= singleSetWidth * 2.8) {
      container.scrollLeft -= singleSetWidth;
    } else if (container.scrollLeft <= singleSetWidth * 0.2) {
      container.scrollLeft += singleSetWidth;
    }
  };

  // Continuous auto-scroll loop using requestAnimationFrame
  useEffect(() => {
    if (mediaUpdates.length === 0) return;
    let animationFrameId;
    let lastTime = performance.now();

    const scrollLoop = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const container = containerRef.current;
      if (container && !isInteracting.current && mediaUpdates.length > 0) {
        container.scrollLeft += 110 * delta;

        const singleSetWidth = container.scrollWidth / 4;
        if (singleSetWidth > 0 && container.scrollLeft >= singleSetWidth * 2.8) {
          container.scrollLeft -= singleSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    animationFrameId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mediaUpdates.length]);

  // Scroll handlers for Left and Right buttons
  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    isInteracting.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    const firstChild = container.firstElementChild;
    const cardWidth = firstChild ? firstChild.offsetWidth + 24 : 384;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;

    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    pauseTimeoutRef.current = setTimeout(() => {
      isInteracting.current = false;
    }, 2500);
  };

  // If no news published yet, do not render dummy news
  if (!mediaUpdates || mediaUpdates.length === 0) {
    return null;
  }

  // Duplicate for seamless infinite loop if enough items, or single list
  const displayItems = mediaUpdates.length >= 2
    ? [...mediaUpdates, ...mediaUpdates, ...mediaUpdates, ...mediaUpdates]
    : mediaUpdates;

  return (
    <div id="news-feed" className="bg-gray-50/50 py-16 select-none scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION 2: OFFICIAL SOURCES - NEWS MEDIA UPDATES */}
        <div>
          {/* Header Row */}
          <div className="flex justify-between items-end mb-8">
            <div className="text-left">
              <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest block mb-1">
                Official Sources
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
                {currentLang === 'ta' ? 'அதிகாரப்பூர்வ அறிவிப்புகள்' : 'News Media Updates'}
              </h2>
            </div>
            
            {/* Scroll Buttons */}
            {mediaUpdates.length > 1 && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => scroll('left')}
                  aria-label="Scroll Left"
                  className="w-10 h-10 rounded-full border border-gray-250 bg-white hover:bg-gray-50 hover:text-primary transition flex items-center justify-center cursor-pointer shadow-xs active:scale-90"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  aria-label="Scroll Right"
                  className="w-10 h-10 rounded-full border border-gray-250 bg-white hover:bg-gray-50 hover:text-primary transition flex items-center justify-center cursor-pointer shadow-xs active:scale-90"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Track */}
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            onMouseEnter={() => { isInteracting.current = true; }}
            onMouseLeave={() => { isInteracting.current = false; }}
            onTouchStart={() => { isInteracting.current = true; }}
            onTouchEnd={() => {
              if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
              pauseTimeoutRef.current = setTimeout(() => {
                isInteracting.current = false;
              }, 2500);
            }}
            className="flex overflow-x-auto gap-6 py-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayItems.map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`}
                className="w-[290px] sm:w-[330px] md:w-[360px] shrink-0 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-150 flex flex-col group hover:shadow-lg transition-all duration-300"
              >
                {/* Image Block */}
                {item.image && (
                  <div className="relative h-44 sm:h-48 md:h-52 w-full overflow-hidden bg-gray-150">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top-Left Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-red-700 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase flex items-center border border-red-500/20">
                        <FileText size={10} className="mr-1.5" /> {item.category || 'NEWS MEDIA'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content Block */}
                <div className="p-5 flex-grow flex flex-col justify-between text-left">
                  <Link to={`/news/${createNewsSlug(item.title, item.id)}`} className="block group/link">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 leading-snug group-hover/link:text-primary transition-colors line-clamp-2 select-text mb-4">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-primary font-bold text-xs">
                    <Link 
                      to={`/news/${createNewsSlug(item.title, item.id)}`} 
                      className="hover:underline flex items-center space-x-1 cursor-pointer select-none"
                    >
                      <span>{currentLang === 'ta' ? 'முழு அறிவிப்பை படிக்க' : 'Read Full Notice'}</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link to={`/news/${createNewsSlug(item.title, item.id)}`} className="text-gray-400 hover:text-primary transition p-1 cursor-pointer">
                      <Share2 size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Styles for hiding scrollbar */}
          <style>{`
            .scrollbar-none::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-none {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>

      </div>
    </div>
  );
};

export default LiveNewsUpdates;
