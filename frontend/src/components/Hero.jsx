import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    import('../services/api').then(({ api }) => {
      api.getHeroSlides([]).then((data) => {
        if (Array.isArray(data)) {
          setSlides(data);
        } else {
          setSlides([]);
        }
      });
    });
  }, []);

  const startTimer = () => {
    stopTimer();
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [slides]);

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    startTimer();
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startTimer();
  };

  // If no banner images exist in database, do not render default mock images
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div id="home" className="relative w-full flex flex-col bg-white">
      {/* Banner Carousel Container */}
      <div className="relative w-full h-[245px] sm:h-[350px] md:h-[460px] lg:h-[545px] xl:h-[600px] overflow-hidden bg-gray-50 shadow-xs">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const desktopSrc = slide?.desktop || slide?.mobile;
          const mobileSrc = slide?.mobile || slide?.desktop;

          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <picture className="w-full h-full">
                {mobileSrc && <source media="(max-width: 640px)" srcSet={mobileSrc} />}
                <img
                  src={desktopSrc}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover object-center select-none"
                  draggable="false"
                />
              </picture>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons Below the Banner */}
      {slides.length > 1 && (
        <div className="flex justify-center items-center gap-4 py-4 bg-white">
          <button
            onClick={handlePrev}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#800000]/20 bg-white text-[#800000] hover:bg-[#800000] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer focus:outline-none"
            aria-label="Previous Banner"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#800000]/20 bg-white text-[#800000] hover:bg-[#800000] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer focus:outline-none"
            aria-label="Next Banner"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Hero;
