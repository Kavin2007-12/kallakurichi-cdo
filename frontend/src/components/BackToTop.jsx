import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-10 right-6 lg:bottom-8 lg:right-8 z-50">
      <div 
        className={`transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <button
          onClick={scrollToTop}
          className="bg-secondary text-primary border border-primary/20 p-3.5 rounded-full shadow-2xl hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 group flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="Back to top"
        >
          <ArrowUp size={18} strokeWidth={2.5} className="group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default BackToTop;
