import { useState, useEffect } from 'react';

const TempleLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [dots, setDots] = useState('.');

  // Animated dots timer (".", "..", "...", "....")
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 4 ? '.' : prev + '.'));
    }, 380);
    return () => clearInterval(dotTimer);
  }, []);

  useEffect(() => {
    let isLoaded = document.readyState === 'complete';
    let currentProgress = 0;

    const handleLoad = () => {
      isLoaded = true;
    };

    window.addEventListener('load', handleLoad);

    // Dynamic timer: speed adapts to real window/document page loading status
    const timer = setInterval(() => {
      if (document.readyState === 'complete') {
        isLoaded = true;
      }

      let increment;
      if (isLoaded) {
        // Accelerate quickly to 100% when real page resources are loaded
        increment = Math.max(6, (100 - currentProgress) * 0.25);
      } else {
        // Smooth steady progress up to ~85% while waiting for page load
        if (currentProgress < 85) {
          increment = (85 - currentProgress) * 0.06 + 0.8;
        } else {
          increment = 0.2; // Hold gently near 85% until page is ready
        }
      }

      currentProgress = Math.min(100, currentProgress + increment);
      setProgress(Math.round(currentProgress));

      if (currentProgress >= 100) {
        clearInterval(timer);
        window.removeEventListener('load', handleLoad);

        // Smooth transition out
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }, 650);
        }, 200);
      }
    }, 30);

    return () => {
      clearInterval(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Container for Temple Image Reveal & Loading Text */}
      <div className="relative max-w-[310px] sm:max-w-[370px] md:max-w-[430px] w-full flex flex-col items-center justify-center space-y-2 my-auto">
        
        {/* Temple Image with Faded Corners and Smooth Bottom-to-Top Reveal */}
        <div
          className="relative w-full max-h-[54vh] overflow-hidden transition-all duration-75 ease-out flex items-center justify-center"
          style={{
            clipPath: `inset(${100 - progress}% 0 0 0)`,
            WebkitClipPath: `inset(${100 - progress}% 0 0 0)`,
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 82%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 82%)'
          }}
        >
          <img
            src="/tirukkoyilur_temple.jpg"
            alt="Tirukkoyilur Temple"
            className="w-full h-auto max-h-[54vh] object-contain select-none"
            draggable="false"
          />
        </div>

        {/* Yellow Bold Text with Animated Loading Dots */}
        <div className="text-amber-500 font-extrabold text-lg sm:text-xl md:text-2xl tracking-wider flex items-center justify-center select-none pt-1 shrink-0">
          <span>TVK Kallakurichi</span>
          <span className="inline-block w-8 text-left ml-0.5">{dots}</span>
        </div>

        {/* Dark Red Bold "Loading...." Subtext */}
        <div className="text-[#800000] font-extrabold text-sm sm:text-base tracking-wide select-none shrink-0 -mt-1">
          Loading....
        </div>

      </div>
    </div>
  );
};

export default TempleLoader;
