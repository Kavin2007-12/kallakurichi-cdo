import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export const Home = ({
  heroSlides = [],
  volunteerSlides = [],
  currentUser,
  onAddSlide,
  onDeleteSlide,
  triggerConfirmDelete
}) => {
  const [localHero, setLocalHero] = useState(heroSlides);
  const [localVolSlides, setLocalVolSlides] = useState(volunteerSlides);

  useEffect(() => {
    setLocalHero(heroSlides);
  }, [heroSlides]);

  useEffect(() => {
    setLocalVolSlides(volunteerSlides);
  }, [volunteerSlides]);

  useEffect(() => {
    if (localHero.length === 0) {
      api.getHeroSlides([]).then(res => {
        if (res && res.length) setLocalHero(res);
      });
    }
    if (localVolSlides.length === 0) {
      api.getVolunteerSlides([]).then(res => {
        if (res && res.length) setLocalVolSlides(res);
      });
    }
  }, []);

  const displayHero = localHero.length ? localHero : heroSlides;
  const displayVol = localVolSlides.length ? localVolSlides : volunteerSlides;

  const [activeSlideTab, setActiveSlideTab] = useState('hero');
  const isHeroMaxReached = activeSlideTab === 'hero' && displayHero.length >= 3;
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Switchers */}
        <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 border border-gray-200">
          <button
            onClick={() => setActiveSlideTab('hero')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              activeSlideTab === 'hero'
                ? 'bg-[#FFCC00] text-[#800000] shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hero Carousel Banners ({displayHero.length}/3)
          </button>
          <button
            onClick={() => setActiveSlideTab('volunteer')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              activeSlideTab === 'volunteer'
                ? 'bg-[#FFCC00] text-[#800000] shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Volunteer Page Banners ({displayVol.length})
          </button>
        </div>

        {/* Add Button */}
        {isHeroMaxReached ? (
          <div className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs">
            <span>Max 3 Banners Limit Reached</span>
          </div>
        ) : (
          <button
            onClick={() => onAddSlide(activeSlideTab === 'hero' ? 'banners' : 'volunteers')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#800000] to-[#540000] hover:from-[#600000] hover:to-[#400000] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer border border-[#FFCC00]/30"
          >
            <Plus className="w-4 h-4 text-[#FFCC00]" />
            <span>Add New Slide</span>
          </button>
        )}
      </div>

      {/* Hero Slides Display (Clean Image-Only with Overlay Actions) */}
      {activeSlideTab === 'hero' && (
        <>
          {displayHero.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs">
              <p className="text-sm font-bold text-gray-700">No Hero Banners added yet.</p>
              <p className="text-xs text-gray-400 mt-1">Upload up to 3 banner images to display on the website homepage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayHero.map((slide, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden border-2 border-gray-150 shadow-sm hover:shadow-md transition relative group">
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={slide.desktop || slide.mobile}
                      alt={`Hero Slide ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Top-Left Slide Index Badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#800000]/90 backdrop-blur-md text-[#FFCC00] text-[10px] font-black uppercase tracking-wider border border-[#FFCC00]/40 shadow-md">
                      Slide #{idx + 1}
                    </span>

                    {/* Top-Right Delete Action Button */}
                    {onDeleteSlide && (
                      <button
                        onClick={() => triggerConfirmDelete({
                          title: `Delete Slide #${idx + 1}`,
                          message: 'Are you sure you want to delete this hero banner slide?',
                          onConfirm: () => onDeleteSlide('banners', idx)
                        })}
                        className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-red-600 hover:text-white text-red-600 rounded-2xl shadow-lg transition cursor-pointer border border-gray-100 backdrop-blur-xs flex items-center justify-center"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Volunteer Slides Display (Clean Image-Only with Overlay Actions) */}
      {activeSlideTab === 'volunteer' && (
        <>
          {displayVol.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs">
              <p className="text-sm font-bold text-gray-700">No Volunteer Banners added yet.</p>
              <p className="text-xs text-gray-400 mt-1">Upload banner slides to display on the volunteer registration page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayVol.map((slide, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden border-2 border-gray-150 shadow-sm hover:shadow-md transition relative group">
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={slide.desktop || slide.mobile}
                      alt={`Volunteer Slide ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Top-Left Slide Index Badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#800000]/90 backdrop-blur-md text-[#FFCC00] text-[10px] font-black uppercase tracking-wider border border-[#FFCC00]/40 shadow-md">
                      Slide #{idx + 1}
                    </span>

                    {/* Top-Right Delete Action Button */}
                    {onDeleteSlide && (
                      <button
                        onClick={() => triggerConfirmDelete({
                          title: `Delete Volunteer Slide #${idx + 1}`,
                          message: 'Are you sure you want to delete this volunteer banner slide?',
                          onConfirm: () => onDeleteSlide('volunteers', idx)
                        })}
                        className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-red-600 hover:text-white text-red-600 rounded-2xl shadow-lg transition cursor-pointer border border-gray-100 backdrop-blur-xs flex items-center justify-center"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
