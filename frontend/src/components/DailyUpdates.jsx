import { useState, useEffect } from 'react';
import { CheckCircle2, Calendar, MapPin, ArrowRight, Plus, X, Upload, Loader2 } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const DailyUpdates = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [updates, setUpdates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PARKS & WALKWAYS');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const handleCardClick = (id) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  const currentLang = getCurrentLanguage();

  // Expanded initial updates data showing this month (Aug 2026) and last few weeks (Jul 2026)
  const defaultUpdates = [
    {
      id: 1,
      title: "Garbage Clearance and Sanitation Improvement",
      description: "Under the supervision of local ward authorities, massive garbage mounds at PP Garden were cleared, followed by complete disinfection and street sweeping.",
      category: "WELLNESS",
      location: "PP GARDEN - 102 WARD",
      date: "Aug 12, 2026",
      image: "/completed_water_supply.jpg",
      status: "PENDING",
      hasBadge: false,
      isBefore: true
    },
    {
      id: 2,
      title: "Swift Action Taken on Public Garbage Complaints.",
      description: "Immediate response to citizens' complaints regarding overflowing public waste bins. The entire zone along Bharathipuram Main Road was cleaned and cleared.",
      category: "PARKS & WALKWAYS",
      location: "BHARATHIPURAM MAIN ROAD",
      date: "Aug 11, 2026",
      image: "/completed_streetlights.jpg",
      status: "PENDING",
      hasBadge: false,
      isBefore: true
    },
    {
      id: 3,
      title: "Encroachments Removed from Revamped Anna Nagar Bougainvillea Park Under MLA Mr. Arul Vignesh's Initiative",
      description: "Under the active supervision of MLA Mr. Arul Vignesh, key encroachments surrounding the Bougainvillea Park in Anna Nagar were cleared by corporation officials, restoring pedestrian pathways.",
      category: "PARKS & WALKWAYS",
      location: "BOUGAINVILLEA PARK",
      date: "Aug 10, 2026",
      image: "/completed_road_work.jpg",
      status: "DONE",
      hasBadge: true,
      isBefore: false
    },
    {
      id: 4,
      title: "Grand re-opening of Bougainvillea Park",
      description: "MLA Mr. Arul Vignesh along with community members inaugurated the fully renovated Bougainvillea Park, featuring new green lawns, clean walking tracks, and children play facilities.",
      category: "ROADS",
      location: "BOUGAINVILLEA PARK",
      date: "Aug 09, 2026",
      image: "/header-banner02.png",
      status: "DONE",
      hasBadge: true,
      isBefore: false
    },
    {
      id: 5,
      title: "Water Logging Cleared at Salem-Ulundurpet National Highway Junction",
      description: "Emergency drainage deployment cleared severe water logging after heavy overnight rainfall, preventing long traffic congestion at the Kallakurichi entry highway.",
      category: "ROADS",
      location: "SALEM HIGHWAY",
      date: "Aug 06, 2026",
      image: "/completed_road_work.jpg",
      status: "PENDING",
      hasBadge: false,
      isBefore: true
    },
    {
      id: 6,
      title: "Heavy Rain Relief Materials Distributed in Sankarapuram Wards",
      description: "Essential grocery kits, blankets, and milk supplies were distributed to over 300 families in low-lying Sankarapuram blocks following severe storm water accumulation.",
      category: "WELLNESS",
      location: "SANKARAPURAM",
      date: "Aug 03, 2026",
      image: "/header-banner0d1.png",
      status: "DONE",
      hasBadge: true,
      isBefore: false
    },
    {
      id: 7,
      title: "Pothole Filling & Road Restoration on Kachirayapalayam Main Road",
      description: "Full restoration and filling of deep potholes along the high-traffic Kachirayapalayam road to guarantee rider safety and smooth local transit.",
      category: "ROADS",
      location: "KACHIRAYAPALAYAM RD",
      date: "July 29, 2026",
      image: "/completed_road_work.jpg",
      status: "DONE",
      hasBadge: true,
      isBefore: false
    },
    {
      id: 8,
      title: "High-Mast Solar Streetlights Installation Completed at Chinnasalem",
      description: "Commissioned 15 high-power solar LED streetlights at key pedestrian junctions in Chinnasalem to increase night safety and visibility.",
      category: "STREET LIGHTS",
      location: "CHINNASALEM",
      date: "July 23, 2026",
      image: "/completed_streetlights.jpg",
      status: "DONE",
      hasBadge: true,
      isBefore: false
    },
    {
      id: 9,
      title: "New RO Clean Drinking Water Plant Opened at Thiyagadurgam Bus Stand",
      description: "A free reverse osmosis water purification station was set up for public use, benefiting thousands of daily commuters and local shopkeepers.",
      category: "WATER SUPPLY",
      location: "THIYAGADURGAM",
      date: "July 16, 2026",
      image: "/completed_water_supply.jpg",
      status: "DONE",
      hasBadge: true,
      isBefore: false
    },
    {
      id: 10,
      title: "Mass Health and Eye Care Camp for Agricultural Laborers Coordinated",
      description: "Specialist doctors conducted free health checks, distributed basic medicines, and supplied free reading glasses to agricultural workers in Kallakurichi outskirts.",
      category: "WELLNESS",
      location: "KALLAKURICHI OUTSKIRTS",
      date: "July 08, 2026",
      image: "/header-banner01.png",
      status: "DONE",
      hasBadge: true,
      isBefore: false
    }
  ];

  // Load from localStorage (updated key to v3 to flush cache and load expanded list) or use defaults
  useEffect(() => {
    import('../services/api').then(({ api }) => {
      api.getDailyUpdates(defaultUpdates).then(setUpdates);
    });
  }, []);

  // Dynamic categories extracted from updates
  const categories = [
    'All',
    ...Array.from(
      new Set(
        updates
          .map((u) => (u.category || '').trim().toUpperCase())
          .filter(Boolean)
      )
    )
  ];

  // Submit new update handler
  const handleAddUpdate = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const formattedDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });

      const newUpdate = {
        id: Date.now(),
        title,
        description,
        category: (category || 'GENERAL').trim().toUpperCase(),
        location: location.toUpperCase(),
        date: formattedDate,
        image,
        status: 'DONE',
        hasBadge: false,
        isBefore: false
      };

      const updatedList = [newUpdate, ...updates];
      setUpdates(updatedList);
      import('../services/api').then(({ api }) => {
        api.addDailyUpdate(newUpdate);
        localStorage.setItem('kallakurichi_updates_v3', JSON.stringify(updatedList));
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setLocation('');
      setImage('/completed_road_work.jpg');
      setIsSubmitting(false);
      setIsModalOpen(false);

      // Trigger highlight animation on the new card
      setNewlyAddedId(newUpdate.id);
      setActiveFilter('All');
      setTimeout(() => setNewlyAddedId(null), 3000);
    }, 1000);
  };

  // Filter updates based on selected category
  const filteredUpdates = activeFilter === 'All'
    ? updates
    : updates.filter(update => (update.category || '').trim().toUpperCase() === activeFilter.toUpperCase());

  // Generate timeline nodes based on rows (2 columns in desktop)
  const timelineNodes = [];
  for (let i = 0; i < filteredUpdates.length; i += 2) {
    timelineNodes.push(filteredUpdates[i]);
  }

  return (
    <section className="py-16 bg-white select-none animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-primary tracking-tight uppercase font-sans">
              Updates & Works Completed
            </h2>
            <p className="mt-2 text-xs md:text-sm text-gray-500 font-medium">
              Real-time updates on developmental works and issues resolved by MLA V. K. Ramkumar's office.
            </p>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-start md:justify-center overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-none">
          <div className="flex space-x-2 md:space-x-3 whitespace-nowrap">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-secondary text-primary shadow-sm font-bold border border-primary/20'
                    : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Layout Grid Wrapper */}
        <div className="flex gap-6 lg:gap-10 items-stretch relative">
          
          {/* Vertical Timeline Track - Left Side (Desktop only) */}
          <div className="hidden lg:flex flex-col items-center relative w-12 shrink-0 pt-6">
            {/* Main Vertical Track Line */}
            <div className="w-[3px] bg-gray-200/80 absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-full"></div>
            
            {/* Timeline nodes mapping dynamically with filtered updates rows */}
            {timelineNodes.map((update, idx) => (
              <div 
                key={`node-${update.id}`} 
                className="z-10 flex flex-col items-center justify-center"
                style={{ 
                  height: '386px',
                  marginTop: idx === 0 ? '0' : '16px'
                }}
              >
                {/* Milestone Node Pin */}
                <div className={`w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-300 ${
                  idx === 0 
                    ? 'bg-secondary text-primary scale-110 ring-2 ring-secondary/50 font-black text-xs' 
                    : 'bg-gray-300 text-gray-500 font-bold text-[10px]'
                }`}>
                  {idx + 1}
                </div>
                {/* Date tag below node */}
                <span className="text-[9px] font-black text-gray-400 mt-2 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-150 uppercase tracking-wider">
                  {update.date.split(',')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Card Grid Column */}
          <div className="flex-1">
            {filteredUpdates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {filteredUpdates.map((update, idx) => {
                  const isExpanded = expandedCardId === update.id;
                  return (
                    <div 
                      key={update.id}
                      onClick={() => handleCardClick(update.id)}
                      className={`relative min-h-[340px] sm:min-h-[350px] md:h-[374px] rounded-[2rem] overflow-hidden shadow-sm border flex flex-col justify-end group transition-all duration-500 cursor-pointer ${
                        newlyAddedId === update.id
                          ? 'ring-4 ring-emerald-400 border-emerald-300 scale-[1.02] shadow-xl animate-pulse'
                          : 'border-gray-150/50 hover:shadow-2xl hover:border-gray-200'
                      }`}
                      style={{
                        marginTop: (idx > 0 && idx % 2 !== 0 && window.innerWidth >= 768) ? '12px' : '0px'
                      }}
                    >
                      {/* Full Card Background Image */}
                      <img 
                        src={update.image} 
                        alt={update.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0"
                      />

                      {/* Dark Gradient Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10"></div>

                      {/* Bottom Content Overlay */}
                      <div className="relative z-20 p-6 sm:p-8 text-left text-white flex flex-col justify-end h-full">
                        {/* Uppercase Category Tags */}
                        <div className="text-[10px] md:text-xs font-black tracking-widest text-secondary/90 uppercase mb-2 flex items-center flex-wrap gap-1.5 opacity-90">
                          <span>{update.category}</span>
                          <span className="text-white/40 font-normal select-none">•</span>
                          <span>{update.location}</span>
                        </div>

                        {/* Overlaid Title */}
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold leading-snug group-hover:text-secondary transition-colors line-clamp-3 pr-8">
                          {update.title}
                        </h3>
                        
                        {/* Sub-details (Toggles on Click/Tap for Mobile & Hover/Click for Desktop) */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out text-xs text-white/90 leading-relaxed font-medium line-clamp-4 ${
                          isExpanded
                            ? 'max-h-36 opacity-100 mt-3'
                            : 'max-h-0 opacity-0 mt-0 group-hover:max-h-36 group-hover:opacity-100 group-hover:mt-3'
                        }`}>
                          {update.description}
                        </div>
                      </div>

                    {/* Yellow Circular Arrow Button in Bottom-Right (Screenshot Style) */}
                    {update.isBefore && (
                      <div className="absolute bottom-6 right-6 z-25">
                        <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform duration-300">
                          <ArrowRight size={18} strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 h-[350px] flex flex-col items-center justify-center">
                <p className="text-gray-500 text-sm md:text-base font-bold font-sans">No updates available in this category yet. Check back soon!</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Publish Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[80] flex items-center justify-center p-4 notranslate">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shadow-sm">
              <h3 className="font-bold text-base md:text-lg flex items-center space-x-2">
                <Plus size={18} />
                <span>Publish Live Work Update</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddUpdate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title input */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 text-left">Update Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cleared roadside shops near Anna Nagar"
                  className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                  required
                />
              </div>

              {/* Grid: Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-1 text-left">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 bg-white font-medium"
                  >
                    {categories.filter(c => c !== 'All').map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-1 text-left">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. BHOOMINATHAN STREET"
                    className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Image selector */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1.5 text-left">Select Project Photo</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setImage('/completed_road_work.jpg')}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition duration-200 cursor-pointer ${
                      image === '/completed_road_work.jpg' ? 'border-primary shadow-md' : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img src="/completed_road_work.jpg" alt="Road" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded-sm">Roads</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImage('/completed_streetlights.jpg')}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition duration-200 cursor-pointer ${
                      image === '/completed_streetlights.jpg' ? 'border-primary shadow-md' : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img src="/completed_streetlights.jpg" alt="Streetlights" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded-sm">Lighting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImage('/completed_water_supply.jpg')}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition duration-200 cursor-pointer ${
                      image === '/completed_water_supply.jpg' ? 'border-primary shadow-md' : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img src="/completed_water_supply.jpg" alt="Water" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded-sm">Water</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-1 text-left">Details & Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the scope of work completed, benefits to the residents, and quality standards met."
                  rows="3"
                  className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 resize-none font-medium text-left"
                  required
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-250 text-gray-700 text-xs md:text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-accent text-white px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Publish Live Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default DailyUpdates;
