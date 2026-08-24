import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Phone, CheckCircle, CheckCircle2, ShieldAlert, Calendar, ChevronLeft, ChevronRight, FileText, Mail, Map, MapPin, Upload, Image as ImageIcon, Heart, Users, Sparkles, Star, BookOpen, Award, TrendingUp, Search, ShieldCheck, ExternalLink, Download, Lock, Copy, Check, X, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import TVKVolunteerIDCard from '../components/TVKVolunteerIDCard';
import { getCurrentLanguage } from '../utils/lang';
import { exportVolunteerCardCanvas } from '../utils/directCardCanvas';

// Responsive Card Preview Component with auto-scaling to container width
const VolunteerCardRenderer = ({ vol, onDownload, isDownloading, isTa }) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [scale, setScale] = useState(0.55);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(Math.min(1, width / 680));
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-3 pt-1">
      <div 
        ref={containerRef} 
        className="w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white flex items-center justify-center relative"
        style={{ height: `${Math.round(390 * scale)}px` }}
      >
        <div 
          ref={cardRef}
          id={`tvk-card-${vol?.id || 'default'}`} 
          className="origin-top-left absolute top-0 left-0"
          style={{ 
            transform: `scale(${scale})`, 
            width: '680px', 
            height: '390px' 
          }}
        >
          <TVKVolunteerIDCard vol={vol} />
        </div>
      </div>

      {/* Download Volunteer Card */}
      <button
        type="button"
        onClick={() => onDownload(vol, cardRef.current)}
        disabled={isDownloading}
        className="w-full py-2.5 bg-linear-to-r from-[#680208] to-[#8C000B] hover:from-[#500106] hover:to-[#680208] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer active:scale-95 disabled:opacity-50"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{isTa ? 'பதிவிறக்குகிறது...' : 'Downloading...'}</span>
          </>
        ) : (
          <>
            <Download size={14} />
            <span>Download Volunteer Card</span>
          </>
        )}
      </button>
    </div>
  );
};

const Volunteer = () => {
  const advantagesTrackRef = useRef(null);
  const isInteracting = useRef(false);
  const pauseTimeoutRef = useRef(null);

  const currentLang = getCurrentLanguage();
  const isTa = currentLang === 'ta';

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [constituency, setConstituency] = useState('Kallakurichi');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredVolunteer, setRegisteredVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [existingVolunteers, setExistingVolunteers] = useState([]);

  // Fetch existing volunteers for duplicate prevention and sequential ID
  const loadExistingVolunteers = async () => {
    try {
      const fetched = await api.getVolunteers();
      if (Array.isArray(fetched)) {
        setExistingVolunteers(fetched);
      }
    } catch (err) {
      console.warn('Could not load volunteers:', err);
    }
  };

  useEffect(() => {
    loadExistingVolunteers();
  }, []);

  // Real-time duplicate checks (Allowed to re-register only if previously REJECTED)
  const cleanMobile = mobile.replace(/\D/g, '').trim();
  const cleanEmail = email.trim().toLowerCase();

  const duplicatePhoneRecord = cleanMobile.length === 10 ? existingVolunteers.find(v => {
    const vMobile = (v.mobile || v.phone || '').replace(/\D/g, '').trim();
    const vStatus = (v.status || 'PENDING').toUpperCase();
    return vMobile === cleanMobile && vStatus !== 'REJECTED';
  }) : null;

  const duplicateEmailRecord = (cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.')) ? existingVolunteers.find(v => {
    const vEmail = (v.email || '').trim().toLowerCase();
    const vStatus = (v.status || 'PENDING').toUpperCase();
    return vEmail === cleanEmail && vStatus !== 'REJECTED';
  }) : null;

  // Status Search states
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [downloadingIdCardId, setDownloadingIdCardId] = useState(null);

  // High-Resolution ID Card Image Generator Function (.PNG)
  const handleDownloadIDCardImage = async (vol) => {
    if (!vol) return;
    const volId = vol.id || 'TVK-VOL-0001';
    setDownloadingIdCardId(volId);

    try {
      await exportVolunteerCardCanvas(vol);
    } catch (err) {
      console.error('Failed to generate Volunteer ID Card Image:', err);
      const detail = err?.message || String(err) || 'Unknown error';
      alert(isTa 
        ? `அடையாள அட்டை படம் பதிவிறக்கம் செய்ய முடியவில்லை.\nபிழை விவரம் (Error Details): ${detail}` 
        : `Failed to generate ID Card image.\nError Details: ${detail}`
      );
    } finally {
      setDownloadingIdCardId(null);
    }
  };

  // Default volunteer gallery pictures
  const defaultVolunteerPhotos = [
    {
      id: 1,
      image: '/header-banner01.png',
      title: 'Chinnasalem Tree Sapling Plantation Drive',
      titleTa: 'சின்னசேலம் மரக்கன்றுகள் நடும் சமூகப் பணி'
    },
    {
      id: 2,
      image: '/completed_water_supply.jpg',
      title: 'Local Welfare Scheme Guidance Camp',
      titleTa: 'உள்ளூர் நலத்திட்ட உதவி வழிகாட்டும் முகாம்'
    },
    {
      id: 3,
      image: '/header-banner02.png',
      title: 'Kallakurichi TVK Blood Donation Squad',
      titleTa: 'கள்ளக்குறிச்சி தவெக இரத்த தான முகாம்'
    },
    {
      id: 4,
      image: '/completed_streetlights.jpg',
      title: 'Solar Streetlight Installation Support',
      titleTa: 'சூரிய மின்விளக்கு பொருத்தும் பணி உதவி'
    }
  ];

  // Slideshow Banners Setup
  const defaultSlides = [
    { desktop: '/header-banner01.png', mobile: '/header-banner01-mobile.png' },
    { desktop: '/header-banner02.png', mobile: '/header-banner02.png' },
  ];

  const [slides, setSlides] = useState(defaultSlides);
  const [galleryPhotos, setGalleryPhotos] = useState(defaultVolunteerPhotos);

  useEffect(() => {
    import('../services/api').then(({ api }) => {
      api.getVolunteerSlides(defaultSlides).then((res) => {
        if (res && res.length > 0) setSlides(res);
      });
      api.getVolunteerPhotos(defaultVolunteerPhotos).then((res) => {
        if (res && res.length > 0) {
          setGalleryPhotos(res);
        } else {
          setGalleryPhotos(defaultVolunteerPhotos);
        }
      });
    });
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides]);

  const handlePhotoUpload = (e) => {
    setPhotoError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Enforce 2MB size limit
      if (file.size > 2 * 1024 * 1024) {
        setPhotoError(isTa ? 'படத்தின் அளவு 2MB-க்குள் இருக்க வேண்டும்.' : 'Image size exceeds 2MB limit. Please choose a file under 2MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setPhoto(compressed);
        };
        img.src = uploadEvent.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !age.trim() || !bloodGroup || !mobile.trim() || !email.trim() || !taluk.trim() || !village.trim() || !fullAddress.trim()) {
      return;
    }

    if (mobile.length !== 10) {
      alert(isTa ? 'சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்!' : 'Please enter a valid 10-digit mobile number!');
      return;
    }

    if (duplicatePhoneRecord) {
      alert(isTa 
        ? 'இந்த கைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. பதிவு நிராகரிக்கப்பட்டால் மட்டுமே மீண்டும் விண்ணப்பிக்க முடியும்.' 
        : 'This mobile number is already registered. You can only re-apply if your previous application was rejected.');
      return;
    }

    if (duplicateEmailRecord) {
      alert(isTa 
        ? 'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. பதிவு நிராகரிக்கப்பட்டால் மட்டுமே மீண்டும் விண்ணப்பிக்க முடியும்.' 
        : 'This email address is already registered. You can only re-apply if your previous application was rejected.');
      return;
    }

    if (!photo) {
      setPhotoError(isTa ? 'சுயவிவரப் படம் பதிவேற்றுவது கட்டாயமாகும் (அதிகபட்சம் 2MB).' : 'Profile image is required (Max 2MB). Please choose an image to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate next sequential TVK-VOL-XXXX ID
      let volunteersList = [];
      try {
        const fetched = await api.getVolunteers();
        if (Array.isArray(fetched)) volunteersList = fetched;
      } catch (err) {
        console.warn('Could not fetch existing volunteers for ID sequence', err);
      }

      let maxNum = 0;
      for (const v of volunteersList) {
        const match = (v.id || '').match(/TVK-VOL-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      const volunteerId = `TVK-VOL-${(maxNum + 1).toString().padStart(4, '0')}`;

      const cleanAge = age.trim();
      const cleanBlood = bloodGroup;
      const newVolunteer = {
        id: volunteerId,
        name: name.trim(),
        age: cleanAge,
        Age: cleanAge,
        bloodGroup: cleanBlood,
        bloodgroup: cleanBlood,
        blood_group: cleanBlood,
        blood: cleanBlood,
        mobile: mobile.trim(),
        phone: mobile.trim(),
        email: email.trim(),
        constituency: constituency.trim() || 'Kallakurichi',
        taluk: taluk.trim(),
        village: village.trim(),
        fullAddress: fullAddress.trim(),
        image: photo,
        photo: photo,
        status: 'PENDING',
        adminRemarks: '',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };

      // Save directly to MySQL Database
      await api.registerVolunteer(newVolunteer);
      await loadExistingVolunteers();

      // Show Popup Modal & Set Details
      setRegisteredVolunteer(newVolunteer);
      setShowModal(true);
      setIsSubmitting(false);

      // Reset Form
      setName('');
      setAge('');
      setBloodGroup('');
      setMobile('');
      setEmail('');
      setConstituency('Kallakurichi');
      setTaluk('');
      setVillage('');
      setFullAddress('');
      setPhoto('');
      setPhotoError('');
    } catch (err) {
      console.error('Failed to register volunteer:', err);
      alert(isTa ? (err.message || 'பதிவு செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.') : (err.message || 'Failed to register volunteer. Please try again.'));
      setIsSubmitting(false);
    }
  };

  // Search volunteer status handler
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchPhone.trim().toLowerCase();
    if (!query) return;

    try {
      const volunteersList = await api.getVolunteers();
      const cleanQuery = query.replace(/\D/g, '');
      const filtered = (volunteersList || []).filter((vol) => {
        const m = (vol.mobile || vol.phone || '').trim().toLowerCase();
        const cleanM = m.replace(/\D/g, '');
        const idMatch = (vol.id || '').toLowerCase().trim() === query;
        const phoneMatch = m === query || (cleanQuery.length >= 7 && cleanM.includes(cleanQuery));
        return idMatch || phoneMatch;
      });
      setSearchResults(filtered);
    } catch (err) {
      console.error('Failed to search volunteers:', err);
      setSearchResults([]);
    }
  };

  // Set initial scroll position to middle set so backward & forward scrolling works infinitely
  useEffect(() => {
    const track = advantagesTrackRef.current;
    if (track) {
      const timer = setTimeout(() => {
        const singleSetWidth = track.scrollWidth / 6;
        if (singleSetWidth > 0) {
          track.scrollLeft = singleSetWidth * 2;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [galleryPhotos]);

  // Infinite wrap handler on scroll
  const handleScroll = () => {
    const track = advantagesTrackRef.current;
    if (!track) return;
    const singleSetWidth = track.scrollWidth / 6;
    if (singleSetWidth <= 0) return;

    if (track.scrollLeft >= singleSetWidth * 3) {
      track.scrollLeft -= singleSetWidth;
    } else if (track.scrollLeft <= singleSetWidth) {
      track.scrollLeft += singleSetWidth;
    }
  };

  // Continuous auto-scroll loop (speeded up to ~150px/s) + spotlight effect
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const scrollLoop = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const track = advantagesTrackRef.current;
      if (track) {
        if (!isInteracting.current) {
          // Auto-scroll speed
          track.scrollLeft += 150 * delta;

          const singleSetWidth = track.scrollWidth / 6;
          if (singleSetWidth > 0) {
            if (track.scrollLeft >= singleSetWidth * 3) {
              track.scrollLeft -= singleSetWidth;
            } else if (track.scrollLeft <= singleSetWidth) {
              track.scrollLeft += singleSetWidth;
            }
          }
        }

        // Apply smooth 3D center spotlight focus effect
        const viewportCenter = window.innerWidth / 2;
        const cards = track.querySelectorAll('[data-card-index]');
        const maxDistance = Math.min(window.innerWidth * 0.35, 360);

        cards.forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(cardCenter - viewportCenter);
          const ratio = Math.max(0, 1 - distance / maxDistance);

          const scale = 1 + (ratio * 0.10);
          const shadowBlur = ratio * 24;
          const shadowOpacity = ratio * 0.75;

          card.style.transform = `scale(${scale})`;
          card.style.boxShadow = `0 12px ${shadowBlur}px rgba(255, 204, 0, ${shadowOpacity})`;
        });
      }

      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    animationFrameId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [galleryPhotos]);

  // Responsive Left / Right Button Click Handler
  const scrollGallery = (direction) => {
    const track = advantagesTrackRef.current;
    if (!track) return;

    // Temporarily pause continuous auto-scroll only on click
    isInteracting.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    const firstCard = track.firstElementChild;
    const cardWidth = firstCard ? firstCard.offsetWidth + 32 : 380;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;

    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    // Seamlessly resume continuous animation 1.5s after clicking
    pauseTimeoutRef.current = setTimeout(() => {
      isInteracting.current = false;
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-0 pb-16">

        {/* Page Hero Header with Auto Changing Banner Background */}
        <section className="relative py-36 mb-12 overflow-hidden select-none bg-primary">
          {/* Background Slideshow */}
          <div className="absolute inset-0 z-0">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                {/* Desktop Background Image */}
                <img
                  src={slide.desktop}
                  alt="Volunteer Background"
                  className="w-full h-full object-cover hidden md:block"
                />
                {/* Mobile Background Image */}
                <img
                  src={slide.mobile || slide.desktop}
                  alt="Volunteer Background"
                  className="w-full h-full object-cover md:hidden"
                />
              </div>
            ))}
            {/* Lighter overlay for high contrast text readability while retaining image colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-primary/30 to-black/60 z-[1]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-5 text-white">
            <span className="text-xs font-bold text-secondary tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full">
              {isTa ? 'மக்கள் சேவை இயக்கத்தில் இணையுங்கள்' : 'Join Our Public Service Movement'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black">
              {isTa ? 'தன்னார்வலராக இணைய' : 'Volunteer Portal'}
            </h1>
            <p className="text-sm md:text-base text-gray-200 mx-auto max-w-2xl font-medium leading-relaxed">
              {isTa
                ? 'கள்ளக்குறிச்சி தொகுதியின் பசுமை மேம்பாடு மற்றும் சமூக உதவி பணிகளில் தவெக இளைஞர் அணியுடன் இணைந்து பணியாற்ற உங்களை வரவேக்கிரோம்.'
                : 'Join our community drives, help desks, and green initiatives. Together, we can make Kallakurichi a better place.'}
            </p>
          </div>
        </section>

        {/* Content Section: Form & Status Check Box */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          {/* Left Column: Volunteer Registration Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-sm text-left w-full">
              <div className="border-b border-gray-100 pb-3 mb-6 select-none flex items-center space-x-2">
                <ShieldAlert size={20} className="text-primary" />
                <h2 className="text-lg font-extrabold text-gray-900">
                  {isTa ? 'தன்னார்வலர் சேர்க்கை' : 'Volunteer Application'}
                </h2>
              </div>

                <form onSubmit={handleSignup} className="space-y-5">

                  {/* 1. Name Input */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                      <User size={13} className="mr-1.5 text-primary flex-shrink-0" />
                      <span>{isTa ? 'முழு பெயர் (Name)' : 'Full Name'} <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isTa ? 'எ.கா. மு. பாலசுப்பிரமணியன்' : 'e.g. M. Balasubramanian'}
                      className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800"
                      required
                    />
                  </div>

                  {/* 1.5. Age & Blood Group Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                        <Calendar size={13} className="mr-1.5 text-primary flex-shrink-0" />
                        <span>{isTa ? 'வயது (Age)' : 'Age'} <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={age}
                        onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        placeholder={isTa ? 'எ.கா. 25' : 'e.g. 25'}
                        className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                        <Heart size={13} className="mr-1.5 text-primary flex-shrink-0" />
                        <span>{isTa ? 'இரத்த வகை (Blood Group)' : 'Blood Group'} <span className="text-red-500">*</span></span>
                      </label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800 bg-white cursor-pointer"
                        required
                      >
                        <option value="">{isTa ? '-- இரத்த வகை தேர்வு செய்யவும் --' : '-- Select Blood Group --'}</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  {/* 2. Mobile & 3. Email Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                        <Phone size={13} className="mr-1.5 text-primary flex-shrink-0" />
                        <span>{isTa ? 'கைபேசி எண் (Mobile)' : 'Mobile Number'} <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="e.g. 9876543210"
                        className={`w-full h-11 border ${duplicatePhoneRecord ? 'border-red-500 focus:border-red-600 bg-red-50/20' : 'border-gray-200 focus:border-primary'} rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800 transition`}
                        required
                      />
                      {duplicatePhoneRecord && (
                        <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center animate-fade-in text-left">
                          <AlertCircle size={13} className="mr-1 shrink-0 text-red-500" />
                          <span>
                            {isTa
                              ? `இந்த கைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (${duplicatePhoneRecord.status === 'APPROVED' ? 'ஒப்புதல் அளிக்கப்பட்டது' : 'பரிசீலனையில் உள்ளது'})!`
                              : `This mobile number is already registered (${duplicatePhoneRecord.status === 'APPROVED' ? 'Approved' : 'Pending Review'})!`}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                        <Mail size={13} className="mr-1.5 text-primary flex-shrink-0" />
                        <span>{isTa ? 'மின்னஞ்சல் (E Mail)' : 'E Mail'} <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. volunteer@gmail.com"
                        className={`w-full h-11 border ${duplicateEmailRecord ? 'border-red-500 focus:border-red-600 bg-red-50/20' : 'border-gray-200 focus:border-primary'} rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800 transition`}
                        required
                      />
                      {duplicateEmailRecord && (
                        <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center animate-fade-in text-left">
                          <AlertCircle size={13} className="mr-1 shrink-0 text-red-500" />
                          <span>
                            {isTa
                              ? `இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (${duplicateEmailRecord.status === 'APPROVED' ? 'ஒப்புதல் அளிக்கப்பட்டது' : 'பரிசீலனையில் உள்ளது'})!`
                              : `This email is already registered (${duplicateEmailRecord.status === 'APPROVED' ? 'Approved' : 'Pending Review'})!`}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Constituency (Default Kallakurichi, Editable) & 5. Taluk */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                        <MapPin size={13} className="mr-1.5 text-primary flex-shrink-0" />
                        <span>{isTa ? 'சட்டமன்ற தொகுதி (Constituency)' : 'Constituency'}</span>
                      </label>
                      <input
                        type="text"
                        value={constituency}
                        onChange={(e) => setConstituency(e.target.value)}
                        placeholder={isTa ? 'எ.கா. கள்ளக்குறிச்சி' : 'e.g. Kallakurichi'}
                        className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800 bg-white"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                        <Map size={13} className="mr-1.5 text-primary flex-shrink-0" />
                        <span>{isTa ? 'வட்டம் / தாலுகா (Taluk)' : 'Taluk Name'} <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={taluk}
                        onChange={(e) => setTaluk(e.target.value)}
                        placeholder={isTa ? 'எ.கா. சின்னசேலம் / கள்ளக்குறிச்சி' : 'e.g. Chinnasalem / Kallakurichi'}
                        className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800"
                        required
                      />
                    </div>
                  </div>

                  {/* 6. Village (Type input) */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                      <MapPin size={13} className="mr-1.5 text-primary flex-shrink-0" />
                      <span>{isTa ? 'கிராமம் / ஊர் (Village)' : 'Village Name'} <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder={isTa ? 'எ.கா. மாத்தூர் / கச்சிராயப்பாளையம்' : 'e.g. Madur / Kachirapalayam'}
                      className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none font-semibold text-gray-800"
                      required
                    />
                  </div>

                  {/* 7. Full Address (Big input box) */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center">
                      <FileText size={13} className="mr-1 text-primary" />
                      <span>{isTa ? 'முழு முகவரி (Full Address)' : 'Full Address'} <span className="text-red-500">*</span></span>
                    </label>
                    <textarea
                      rows={4}
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder={isTa ? 'கதவு எண், தெரு பெயர், பகுதி, அடையாளக் குறி, அஞ்சல் குறியீட்டு எண் (Pincode) போன்ற முழு முகவரியை உள்ளிடவும்...' : 'Enter your complete address with door no, street name, area, landmark, and pincode...'}
                      className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none font-semibold text-gray-800 resize-y leading-relaxed text-justify"
                      style={{ textAlign: 'justify' }}
                      required
                    ></textarea>
                  </div>

                  {/* 8. Image (Max 2MB) - Mandatory */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center">
                        <Upload size={13} className="mr-1 text-primary" />
                        <span>{isTa ? 'சுயவிவரப் படம் (Image)' : 'Image (Photo)'} <span className="text-red-500">*</span></span>
                      </label>
                      <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded font-black tracking-wider uppercase">Max 2MB</span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-4 border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 hover:bg-gray-50 transition relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          required={!photo}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        {photo ? (
                          <div className="flex items-center space-x-3 w-full">
                            <img src={photo} alt="Preview" className="w-12 h-12 object-cover rounded-full border border-gray-200 bg-white" />
                            <div className="flex-grow text-left">
                              <span className="text-[10px] font-bold text-emerald-600 block uppercase">{isTa ? 'படம் பதிவேற்றப்பட்டது' : 'Image Loaded'}</span>
                              <span className="text-[9px] text-gray-400 font-medium block truncate">volunteer_photo.jpg</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhoto('');
                              }}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase cursor-pointer px-2 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition z-10"
                            >
                              {isTa ? 'நீக்கு' : 'Remove'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3 text-gray-400">
                            <div className="p-2.5 bg-gray-200/50 rounded-full text-gray-400"><ImageIcon size={18} /></div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-gray-600 block">{isTa ? 'புகைப்படத்தை தேர்ந்தெடுக்கவும்' : 'Choose Profile Image'}</span>
                              <span className="text-[10px] text-gray-400 block">{isTa ? 'அதிகபட்சம் 2MB அளவு (JPG, PNG)' : 'Max 2MB file size (JPG, PNG)'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {photoError && (
                        <p className="text-xs text-red-500 font-bold text-left">{photoError}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !!duplicatePhoneRecord || !!duplicateEmailRecord}
                    className={`w-full font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition select-none flex items-center justify-center space-x-1.5 ${
                      isSubmitting || duplicatePhoneRecord || duplicateEmailRecord
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-primary hover:bg-accent text-white shadow-md hover:shadow-lg active:scale-95 cursor-pointer'
                    }`}
                  >
                    <span>
                      {isSubmitting
                        ? (isTa ? 'பதிவு செய்யப்படுகிறது...' : 'Registering...')
                        : (duplicatePhoneRecord || duplicateEmailRecord)
                          ? (isTa ? 'ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (முடக்கப்பட்டது)' : 'Already Registered (Blocked)')
                          : (isTa ? 'உறுப்பினராக இணை' : 'Join as Volunteer')}
                    </span>
                  </button>

                </form>
              </div>
          </div>

          {/* Right Column: Status Retrieval Box */}
          <div className="lg:col-span-5 space-y-8">

            {/* Card 1: Status Check Box */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs space-y-6 text-left">
              <div className="border-b border-gray-100 pb-3 flex items-center space-x-2 select-none">
                <ShieldCheck size={20} className="text-primary" />
                <h2 className="text-lg font-extrabold text-gray-900">
                  {isTa ? 'பதிவின் நிலை சரிபார்க்க' : 'Check Status'}
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                {isTa
                  ? 'உங்கள் தன்னார்வலர் பதிவின் நிலையை அறிய உங்கள் பதிவு செய்யப்பட்ட கைபேசி எண் அல்லது உறுப்பினர் ஐடி-யை உள்ளிடவும்.'
                  : 'Enter your registered mobile phone number or Volunteer ID below to retrieve volunteer membership status and details.'}
              </p>

              {/* Search form */}
              <form onSubmit={handleSearch} className="flex gap-2 select-none">
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder={isTa ? 'எ.கா. 9876543210 அல்லது TVK-VOL-0001' : 'e.g. 9876543210 or TVK-VOL-0001'}
                  className="border border-gray-200 focus:border-primary rounded-xl px-3 py-2 text-xs flex-grow focus:outline-none font-semibold text-gray-800"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-accent text-white px-4 rounded-xl flex items-center justify-center cursor-pointer focus:outline-none"
                >
                  <Search size={16} />
                </button>
              </form>

              {/* Search Results Display */}
              {searchResults && (
                <div className="space-y-4 pt-2 max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider select-none">Search Results ({searchResults.length})</h3>
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-red-500 font-bold select-none">No registered volunteer found for this search.</p>
                  ) : (
                    searchResults.map((vol) => (
                      <div key={vol.id} className="bg-gray-50 border border-gray-150 p-4 rounded-2xl text-xs space-y-3">
                        <div className="flex justify-between items-center select-none pb-1">
                          <span className="font-extrabold text-primary text-sm tracking-wide">{vol.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest border uppercase ${vol.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : vol.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {vol.status || 'PENDING'}
                          </span>
                        </div>

                        {/* ID Card & High-Quality Image Download Block (Restricted to APPROVED Volunteers) */}
                        {vol.status === 'APPROVED' ? (
                          <VolunteerCardRenderer
                            vol={vol}
                            onDownload={handleDownloadIDCardImage}
                            isDownloading={downloadingIdCardId === vol.id}
                            isTa={isTa}
                          />
                        ) : (
                          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs space-y-1.5 select-none text-left">
                            <div className="flex items-center space-x-2 text-amber-800 font-bold">
                              <Lock size={15} className="shrink-0" />
                              <span>{isTa ? 'அடையாள அட்டை பூட்டப்பட்டுள்ளது (ID Card Locked)' : 'Downloadable ID Card Locked'}</span>
                            </div>
                            <p className="text-[11px] text-amber-900/80 font-semibold leading-relaxed">
                              {vol.status === 'REJECTED'
                                ? (isTa ? 'உங்கள் பதிவு விண்ணப்பம் நிராகரிக்கப்பட்டது.' : 'Your volunteer application was rejected by admin.')
                                : (isTa
                                  ? 'உங்கள் தன்னார்வலர் பதிவு பரிசீலனையில் உள்ளது. நிர்வாகி (Admin) ஒப்புதல் அளித்த பிறகு அதிகாரப்பூர்வ PDF அடையாள அட்டை பதிவிறக்கம் செய்ய இயலும்.'
                                  : 'Your volunteer application is currently PENDING admin review. Your official downloadable PDF ID Card will be activated as soon as Admin approves your application.')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Celebratory Responsive Confirmation Modal Popup */}
        {showModal && registeredVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center relative overflow-hidden animate-scale-up">
              {/* Decorative top colored bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-amber-500 to-primary" />

              {/* Close X button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Success Icon */}
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1">
                {isTa ? 'தன்னார்வலர் பதிவு வெற்றிகரமாக முடிந்தது!' : 'Volunteer Application Submitted!'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-4">
                {isTa ? 'உங்கள் உறுப்பினர் அடையாள எண் வெற்றிகரமாக உருவாக்கப்பட்டுள்ளது.' : 'Your official volunteer reference ID has been generated.'}
              </p>

              {/* Volunteer Name */}
              <div className="text-sm font-bold text-gray-800 bg-gray-50 py-2.5 px-4 rounded-xl border border-gray-100 mb-3 flex items-center justify-center space-x-2">
                <User size={15} className="text-primary flex-shrink-0" />
                <span className="truncate">{registeredVolunteer.name}</span>
              </div>

              {/* ID Box with Copy Button */}
              <div className="bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border-2 border-primary/30 rounded-2xl p-4 mb-4 shadow-xs">
                <span className="text-[10px] font-black tracking-widest text-primary/80 uppercase block mb-1">
                  {isTa ? 'உறுப்பினர் அடையாள எண்' : 'VOLUNTEER ID CODE'}
                </span>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl sm:text-3xl font-black text-primary tracking-wider font-mono select-all">
                    {registeredVolunteer.id}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(registeredVolunteer.id);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="p-2 bg-white hover:bg-gray-100 text-primary border border-primary/20 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center"
                    title="Copy ID"
                  >
                    {copiedId ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                {copiedId && (
                  <span className="text-[10px] font-bold text-emerald-600 block mt-1 animate-fade-in">
                    {isTa ? 'நகலெடுக்கப்பட்டது!' : 'Copied to clipboard!'}
                  </span>
                )}
              </div>

              {/* Admin Review Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left mb-5">
                <p className="text-[11px] text-amber-900 font-semibold leading-relaxed">
                  {isTa
                    ? '📌 உங்கள் பதிவு நிர்வாகியின் (Admin) ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளது. ஒப்புதல் கிடைத்தவுடன் Search பகுதியில் உங்கள் ID-ஐ உள்ளிட்டு PDF அடையாள அட்டையைப் பதிவிறக்கலாம்.'
                    : '📌 Your application is submitted for Admin review. Once approved, you can search with this ID to download your Official PDF ID Card.'}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-primary hover:bg-accent text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer"
              >
                {isTa ? 'சரி, முடிந்தது' : 'Done & Close'}
              </button>
            </div>
          </div>
        )}

        {/* Marquee Volunteer Gallery Section with 3D Spotlight Focus Effect */}
        {(() => {
          const activePhotos = (galleryPhotos && galleryPhotos.length > 0) ? galleryPhotos : defaultVolunteerPhotos;
          return (
            <section className="bg-white py-16 select-none overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">

                {/* Header block with Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left space-y-1.5">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/5 px-4 py-1 rounded-full inline-block">
                      {isTa ? 'தன்னார்வலர் கேலரி' : 'COMMUNITY IMPACT & FIELD WORK'}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900">
                      {isTa ? 'தன்னார்வலர்களின் களப்பணிகள்' : 'TVK Volunteers in Action'}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 font-semibold max-w-xl leading-relaxed">
                      {isTa
                        ? 'கள்ளக்குறிச்சி தொகுதி முழுவதும் தவெக தன்னார்வலர்களின் மக்கள் சேவை மற்றும் நலத்திட்ட களப்பணிகள்.'
                        : 'Glimpses of grassroots welfare drives, help desks, and social campaigns led by TVK volunteers.'}
                    </p>
                  </div>

                  {/* Left / Right Interactive Navigation Controls */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollGallery('left')}
                      className="w-11 h-11 rounded-full border border-gray-250 bg-white hover:bg-gray-50 text-gray-700 hover:text-primary transition flex items-center justify-center cursor-pointer shadow-xs active:scale-95 focus:outline-none"
                      title="Previous"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollGallery('right')}
                      className="w-11 h-11 rounded-full border border-gray-250 bg-white hover:bg-gray-50 text-gray-700 hover:text-primary transition flex items-center justify-center cursor-pointer shadow-xs active:scale-95 focus:outline-none"
                      title="Next"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Interactive 3D Spotlight Focus Marquee for Volunteer Photos */}
                <div className="py-6 relative">
                  <div
                    ref={advantagesTrackRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-8 py-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {[...activePhotos, ...activePhotos, ...activePhotos, ...activePhotos, ...activePhotos, ...activePhotos].map((photo, idx) => (
                      <div
                        key={`${photo.id || idx}-${idx}`}
                        data-card-index={idx}
                        className="w-[290px] sm:w-[340px] md:w-[380px] shrink-0 bg-white rounded-3xl overflow-hidden border border-gray-200 flex flex-col shadow-sm transition-all duration-300 mx-2 text-left group"
                      >
                        {/* Photo Image with Badge */}
                        <div className="relative h-48 sm:h-54 md:h-60 w-full overflow-hidden bg-gray-150">
                          <img
                            src={photo.image}
                            alt={isTa ? (photo.titleTa || photo.title || photo.volunteerName || 'களப்பணி') : (photo.title || photo.volunteerName || 'TVK Volunteer')}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = '/header-banner01.png'; }}
                          />
                          <div className="absolute top-4 left-4 z-20">
                            <span className="bg-red-700 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase flex items-center border border-red-500/20 shadow-xs">
                              <FileText size={10} className="mr-1.5" /> {isTa ? 'தன்னார்வலர்' : 'TVK VOLUNTEER'}
                            </span>
                          </div>
                        </div>

                        {/* Caption / Title */}
                        <div className="p-5 flex-grow bg-white flex items-center">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 select-text">
                            {isTa
                              ? (photo.titleTa || photo.title || (photo.volunteerName ? `${photo.volunteerName} - சமூகப் பணி` : 'களப்பணி'))
                              : (photo.title || (photo.volunteerName ? `${photo.volunteerName} - Social Drive` : 'Community Welfare Camp'))}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivational Quote */}
                <div className="border-t border-gray-150 pt-8 max-w-2xl mx-auto space-y-2">
                  <div className="flex justify-center space-x-1 text-secondary">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-gray-700 italic leading-relaxed">
                    {isTa
                      ? '"...மக்கள் சேவையே மகேசன் சேவை. நமது தொகுதி சட்டமன்ற உறுப்பினர் திரு. அருள் விக்னேஷ் அவர்களின் வழிகாட்டலில் தன்னலமற்ற தன்னார்வக் குழுவில் இன்று இணைந்து வரலாறு படைப்போம்!"'
                      : '"Service to people is service to society. Join our volunteer division today under MLA Mr. C. Arul Vignesh and become a builder of Kallakurichi’s future!"'}
                  </p>
                </div>

              </div>

              {/* Styles for hiding scrollbars */}
              <style>{`
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </section>
          );
        })()}

      </main>

      <Footer />
    </div>
  );
};

export default Volunteer;
