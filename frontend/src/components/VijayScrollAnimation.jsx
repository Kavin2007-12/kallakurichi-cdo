import { useEffect, useRef, useState } from 'react';
import { getCurrentLanguage } from '../utils/lang';

const VijayScrollAnimation = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const loadedRef = useRef([]);
  const ticking = useRef(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgColor, setBgColor] = useState('#FAF6F0'); // default fallback
  const [isMobile, setIsMobile] = useState(false);

  const currentLang = getCurrentLanguage();
  const isTa = currentLang === 'ta';

  // Generate frame filenames
  const frameNumbers = Array.from({ length: 141 - 58 + 1 }, (_, i) => 58 + i).filter(
    (num) => num !== 82
  );
  const totalFrames = frameNumbers.length;

  // Track responsive screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload images with ImageBitmap decoding
  useEffect(() => {
    let active = true;

    // Helper to sample background color from the first frame
    const sampleBgColor = (img) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 20;
        canvas.height = 20;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 20, 20, 0, 0, 20, 20);
        // Average a few top-left corner pixels
        const points = [
          ctx.getImageData(2, 2, 1, 1).data,
          ctx.getImageData(5, 5, 1, 1).data,
          ctx.getImageData(10, 10, 1, 1).data,
        ];
        const r = Math.round(points.reduce((sum, p) => sum + p[0], 0) / points.length);
        const g = Math.round(points.reduce((sum, p) => sum + p[1], 0) / points.length);
        const b = Math.round(points.reduce((sum, p) => sum + p[2], 0) / points.length);
        return `rgb(${r}, ${g}, ${b})`;
      } catch (e) {
        return '#FAF6F0';
      }
    };

    let loadedCount = 0;
    const images = [];
    const loadedList = new Array(totalFrames).fill(false);

    frameNumbers.forEach((num, index) => {
      const img = new Image();
      img.src = `/vijay_animation/frame_${String(num).padStart(6, '0')}.jpg`;
      img.onload = async () => {
        if (!active) return;
        
        try {
          // Asynchronously decode and compile to an ImageBitmap
          // Apply responsive downscaling on mobile to reduce VRAM pressure
          const isMobileViewport = window.innerWidth < 1024;
          const options = isMobileViewport ? {
            resizeWidth: 480,
            resizeHeight: 854,
            resizeQuality: 'high'
          } : {};
          
          const bitmap = await createImageBitmap(img, options);
          images[index] = bitmap;
        } catch (e) {
          // Fallback to raw Image element if createImageBitmap is not supported
          images[index] = img;
        }

        loadedCount++;
        loadedList[index] = true;
        
        // Update loading progress state
        const progress = Math.round((loadedCount / totalFrames) * 100);
        setLoadingProgress(progress);

        // When the very first frame loads, sample its background color & show it
        if (index === 0) {
          const detectedColor = sampleBgColor(img);
          setBgColor(detectedColor);
          drawFrame(0);
        }

        if (loadedCount === totalFrames) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        if (!active) return;
        loadedCount++;
        const progress = Math.round((loadedCount / totalFrames) * 100);
        setLoadingProgress(progress);
      };
      images.push(img);
    });

    imagesRef.current = images;
    loadedRef.current = loadedList;

    return () => {
      active = false;
    };
  }, []);

  // Function to draw a specific frame onto the canvas
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find the closest loaded frame to avoid drawing a blank or flickering
    let targetIndex = index;
    if (!loadedRef.current[targetIndex]) {
      let left = targetIndex;
      let right = targetIndex;
      while (left >= 0 || right < totalFrames) {
        if (left >= 0 && loadedRef.current[left]) {
          targetIndex = left;
          break;
        }
        if (right < totalFrames && loadedRef.current[right]) {
          targetIndex = right;
          break;
        }
        left--;
        right++;
      }
    }

    const img = imagesRef.current[targetIndex];
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Compute drawing dimensions to maintain aspect ratio
    const imgWidth = img.naturalWidth || img.width || 768;
    const imgHeight = img.naturalHeight || img.height || 1364;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, x, y;

    const isMobileViewport = window.innerWidth < 1024;

    if (isMobileViewport) {
      // Mobile: Keep "contain" scaling so user sees full animation frames in viewport bounds
      if (canvasRatio > imgRatio) {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        x = (canvasWidth - drawWidth) / 2;
        y = 0;
      } else {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        x = 0;
        y = (canvasHeight - drawHeight) / 2;
      }
    } else {
      // Desktop: Use "cover" scaling to fill the 3:4 aspect ratio frame exactly
      if (canvasRatio > imgRatio) {
        // Canvas is wider than image relative to height -> scale to width and crop height
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        x = 0;
        y = (canvasHeight - drawHeight) / 2;
      } else {
        // Canvas is taller than image relative to width -> scale to height and crop width
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        x = (canvasWidth - drawWidth) / 2;
        y = 0;
      }
    }

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  // Adjust canvas resolution and redraw current frame on resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const isMobileViewport = window.innerWidth < 1024;

    let drawWidth, drawHeight;

    if (isMobileViewport) {
      // Mobile: fit to screen dimensions with original 9:16 aspect ratio (enlarged slightly for mobile impact)
      const imageRatio = 768 / 1364;
      const maxHeight = window.innerHeight * 0.88;
      const maxWidth = Math.min(window.innerWidth * 0.95, 460);
      
      drawWidth = maxWidth;
      drawHeight = maxWidth / imageRatio;
      
      if (drawHeight > maxHeight) {
        drawHeight = maxHeight;
        drawWidth = maxHeight * imageRatio;
      }
    } else {
      // Desktop: Match TempleHeritage image size exactly!
      // Parent container max-width is 460px
      const parent = canvas.parentElement;
      const parentWidth = parent ? parent.clientWidth : 460;
      
      // Use 3:4 aspect ratio to match TempleHeritage image (768 x 1024)
      const desktopRatio = 768 / 1024; // 0.75
      
      drawWidth = parentWidth;
      drawHeight = parentWidth / desktopRatio;
    }

    canvas.style.width = `${drawWidth}px`;
    canvas.style.height = `${drawHeight}px`;
    canvas.width = drawWidth * dpr;
    canvas.height = drawHeight * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    }

    // Recalculate frame scroll position and redraw
    const scrollProgress = calculateScrollProgress();
    const frameIndex = Math.min(
      totalFrames - 1,
      Math.floor(scrollProgress * totalFrames)
    );
    drawFrame(frameIndex);
  };

  const calculateScrollProgress = () => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    
    const totalScrollable = rect.height - window.innerHeight;
    if (totalScrollable <= 0) return 0;
    const progress = -rect.top / totalScrollable;
    return Math.max(0, Math.min(1, progress));
  };

  // Scroll listener to update frames with ticking lock
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      if (!ticking.current) {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const scrollProgress = calculateScrollProgress();
            const frameIndex = Math.min(
              totalFrames - 1,
              Math.floor(scrollProgress * totalFrames)
            );
            drawFrame(frameIndex);
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial resize setup
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [totalFrames, isLoaded, isMobile]);

  // English content layout (Clean TVK party narrative without external links)
  const contentEn = (
    <div className="space-y-4">
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold text-justify">
        Tamilaga Vettri Kazhagam (TVK) was founded under the visionary leadership of Mr. Vijay, rooted in decades of dedicated public service, youth empowerment, and grassroots community welfare across Tamil Nadu through Vijay Makkal Iyakkam.
      </p>
      
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold text-justify">
        On 2 February 2024, the party was officially launched with a profound commitment to progressive social justice, transparency in governance, and equal opportunity for every citizen, with an unwavering focus on transforming Tamil Nadu in the upcoming 2026 Legislative Assembly elections.
      </p>

      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold text-justify">
        TVK is ideologically rooted in the egalitarian and secular values of Periyar, Dr. B.R. Ambedkar, and Perunthalaivar Kamarajar. The party strongly champions state autonomy in education, high-quality public healthcare, economic self-reliance, and people-first politics dedicated to uplifting the marginalized and underprivileged.
      </p>
    </div>
  );

  // Tamil content layout (Clean TVK party narrative without external links)
  const contentTa = (
    <div className="space-y-4">
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold text-justify">
        தமிழக வெற்றி கழகம் (TVK), திரு. விஜய் அவர்களின் தொலைநோக்குப் பார்வையின் கீழ், பல தசாப்த கால மக்கள் நலப்பணிகள், இளைஞர் மேம்பாடு மற்றும் சமூக விழிப்புணர்வு நற்பணிகளை அடித்தளமாகக் கொண்டு தொடங்கப்பட்ட மக்கள் இயக்கமாகும்.
      </p>
      
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold text-justify">
        பிப்ரவரி 2, 2024 அன்று, சமூக நீதி, வெளிப்படையான நல்லாட்சி, மற்றும் அனைவருக்கும் சமவாய்ப்பு ஆகிய உன்னதக் கொள்கைகளுடன் கட்சி அதிகாரப்பூர்வமாகத் தொடங்கப்பட்டு, 2026 தமிழ்நாடு சட்டமன்றத் தேர்தலில் மக்கள் ஆதரவுடன் புதிய அரசியல் மாற்றத்தை ஏற்படுத்தும் உறுதியுடன் இயங்கி வருகிறது.
      </p>

      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold text-justify">
        தந்தை பெரியார், புரட்சியாளர் டாக்டர் பி.ஆர். அம்பேத்கர், மற்றும் பெருந்தலைவர் காமராஜர் ஆகியோரின் வழிகாட்டுதல் மற்றும் சமத்துவக் கொள்கைகளை TVK தனது அடிப்படை சித்தாந்தமாகக் கொண்டுள்ளது. மாநிலக் கல்வி உரிமை, இலவச நவீன மக்கள் நல்வாழ்வு, மற்றும் சமூகத்தில் பின்தங்கிய மக்களின் பொருளாதார மேம்பாட்டிற்காக கட்சி முழு அர்ப்பணிப்புடன் செயல்படுகிறது.
      </p>
    </div>
  );

  // If Mobile, render sequential stacked layout (Sticky Animation first, then full Text below)
  if (isMobile) {
    return (
      <div className="w-full bg-[#FAF6F0] border-b border-gray-100 flex flex-col">
        {/* 1. Animation Sticky Area */}
        <section 
          ref={containerRef} 
          className="relative w-full h-[150vh] select-none"
        >
          <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Main Canvas frame with deep organic dissolved vignette masking */}
            <div 
              className="relative overflow-hidden w-full max-w-[460px] sm:max-w-[480px] flex justify-center scale-105 transition-transform duration-300"
              style={{
                maskImage: 'radial-gradient(ellipse 75% 78% at 50% 50%, #000000 24%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.35) 64%, rgba(0,0,0,0.08) 78%, transparent 88%)',
                WebkitMaskImage: 'radial-gradient(ellipse 75% 78% at 50% 50%, #000000 24%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.35) 64%, rgba(0,0,0,0.08) 78%, transparent 88%)'
              }}
            >
              <canvas 
                ref={canvasRef} 
                className="max-w-full h-auto object-contain select-none pointer-events-none transition-opacity duration-500 ease-in-out mix-blend-multiply"
                style={{ opacity: loadingProgress > 5 ? 1 : 0 }}
              />
            </div>
          </div>
        </section>

        {/* 2. TVK History Text Section (Mobile) */}
        <section className="py-12 px-4 sm:px-6 bg-white border-t border-gray-150 select-none">
          <div className="max-w-md mx-auto space-y-6">
            
            {/* Header section styled exactly like C. Arul Vignesh profile view */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-lg w-fit text-xs font-bold notranslate">
                <span>{isTa ? 'அரசியல் கட்சியின் வரலாறு' : 'Political Party History'}</span>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 notranslate leading-tight">
                {isTa ? 'தமிழக வெற்றி கழகம் (TVK)' : 'Tamilaga Vettri Kazhagam (TVK)'}
              </h3>
              
              <p className="text-xs font-bold text-primary tracking-wide uppercase notranslate">
                {isTa ? 'கட்சி தோற்றம் மற்றும் கொள்கைகள்' : 'Party Origin and Ideology'}
              </p>
            </div>

            {/* Direct Full Details Display */}
            <div className="space-y-4 notranslate">
              {isTa ? contentTa : contentEn}
            </div>

          </div>
        </section>

        {/* Loading overlay shown until frames are preloaded */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF6F0]/80 z-10 backdrop-blur-xs transition-opacity duration-500">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#800000]/20 border-t-[#800000] rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800 tracking-wider">
                  PRELOADING ANIMATION
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  {loadingProgress}% loaded
                </p>
              </div>
              <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#800000] transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout (Side-by-Side Split-Screen Sticky Scroll)
  return (
    <section 
      ref={containerRef} 
      className="relative w-full lg:h-[180vh] py-16 lg:py-0 select-none border-b border-gray-100"
      style={{ backgroundColor: bgColor }}
    >
      <div className="lg:sticky lg:top-0 lg:h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Animation Canvas (matches TempleHeritage exactly in translation and frame layout) */}
            <div className="lg:col-span-6 flex justify-center lg:-translate-x-[75px] transition-transform duration-300">
              <div className="relative group max-w-[420px] sm:max-w-[460px] w-full">
                
                {/* Glow background effects (very subtle) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent/10 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition duration-500 -z-10"></div>
                
                {/* Main Canvas frame with deep organic dissolved vignette masking */}
                <div 
                  className="relative overflow-hidden flex justify-center w-full"
                  style={{
                    maskImage: 'radial-gradient(ellipse 72% 76% at 50% 50%, #000000 22%, rgba(0,0,0,0.85) 42%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.08) 76%, transparent 86%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 72% 76% at 50% 50%, #000000 22%, rgba(0,0,0,0.85) 42%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.08) 76%, transparent 86%)'
                  }}
                >
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-auto object-cover select-none pointer-events-none transition-opacity duration-500 ease-in-out mix-blend-multiply"
                    style={{ opacity: loadingProgress > 5 ? 1 : 0 }}
                  />
                </div>

              </div>
            </div>

            {/* Right Column: TVK History Text details (matches TempleHeritage exactly in translation and alignment) */}
            <div className="lg:col-span-6 text-left space-y-6 lg:-translate-x-[40px] transition-transform duration-300">
              
              {/* Header section similar to TempleHeritage */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-lg w-fit text-xs font-bold notranslate">
                  <span>{isTa ? 'அரசியல் கட்சியின் வரலாறு' : 'Political Party History'}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3 notranslate">
                  {isTa ? 'தமிழக வெற்றி கழகம் (TVK)' : 'Tamilaga Vettri Kazhagam (TVK)'}
                </h2>
                <div className="w-16 h-1 bg-primary mt-3 rounded-full"></div>
              </div>

              {/* Justified Description Text */}
              <div className="notranslate">
                {isTa ? contentTa : contentEn}
              </div>

            </div>

          </div>

        </div>

        {/* Loading overlay shown until frames are preloaded */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF6F0]/80 z-10 backdrop-blur-xs transition-opacity duration-500">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#800000]/20 border-t-[#800000] rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800 tracking-wider">
                  PRELOADING ANIMATION
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  {loadingProgress}% loaded
                </p>
              </div>
              <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#800000] transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default VijayScrollAnimation;
