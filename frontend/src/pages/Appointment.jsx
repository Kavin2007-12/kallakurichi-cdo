import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, Search, ShieldCheck, ExternalLink, MapPin, Copy, Check, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { getCurrentLanguage } from '../utils/lang';

const Appointment = () => {
  const currentLang = getCurrentLanguage();
  const isTa = currentLang === 'ta';

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [constituency] = useState('Kallakurichi');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Search states
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Lightning-speed instant booking handler
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !taluk.trim() || !village.trim() || !preferredDate || !fullAddress.trim() || !purpose.trim()) {
      return;
    }

    if (mobile.length !== 10) {
      triggerToast(isTa ? 'சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்!' : 'Please enter a valid 10-digit mobile number!', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Fetch existing appointments to calculate next sequential TVK-KKI-XXXX ID
      let allAppointments = [];
      try {
        const fetched = await api.getAppointments();
        if (Array.isArray(fetched)) allAppointments = fetched;
      } catch (err) {
        console.warn('Could not fetch existing appointments for ID sequence', err);
      }

      let maxNum = 0;
      for (const a of allAppointments) {
        const match = (a.id || '').match(/TVK-KKI-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      const ticketId = `TVK-KKI-${(maxNum + 1).toString().padStart(4, '0')}`;

      const newAppointment = {
        id: ticketId,
        name: name.trim(),
        mobile: mobile.trim(),
        phone: mobile.trim(),
        email: email.trim(),
        constituency: 'Kallakurichi',
        taluk: taluk.trim(),
        village: village.trim(),
        preferredDate,
        date: preferredDate,
        fullAddress: fullAddress.trim(),
        purpose: purpose.trim(),
        reason: purpose.trim(),
        status: 'PENDING',
        adminRemarks: '',
        createdAt: new Date().toISOString()
      };

      // Save directly to MySQL database
      await api.bookAppointment(newAppointment);

      // Instant UI modal popup display
      setTicketDetails(newAppointment);
      setIsSubmitting(false);

      // Reset form fields
      setName('');
      setMobile('');
      setEmail('');
      setTaluk('');
      setVillage('');
      setPreferredDate('');
      setFullAddress('');
      setPurpose('');
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setIsSubmitting(false);
    }
  };

  const handleCopyId = (id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2200);
  };

  const handleTrackFromModal = (id) => {
    setSearchPhone(id);
    setTicketDetails(null);
    api.getAppointments([]).then(appointmentsList => {
      const filtered = (appointmentsList || []).filter((apt) => {
        return apt.id && apt.id.toLowerCase().trim() === id.toLowerCase().trim();
      });
      setSearchResults(filtered);
      const searchEl = document.getElementById('search-status-box');
      if (searchEl) {
        searchEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  // Search status handler (Strictly fetches live from MySQL database)
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchPhone.trim().toLowerCase();
    if (!query) return;

    try {
      const appointmentsList = await api.getAppointments([]);
      const filtered = (appointmentsList || []).filter((apt) => {
        const m = (apt.mobile || apt.phone || '').trim().toLowerCase();
        const cleanMobile = m.replace(/^0+/, '');
        const cleanQuery = query.replace(/^0+/, '');
        const idMatch = apt.id && apt.id.toLowerCase().trim() === query;
        const mobileMatch = m === query || cleanMobile === cleanQuery || (m.includes(query) && query.length >= 7);
        return idMatch || mobileMatch;
      });
      setSearchResults(filtered);
    } catch (err) {
      console.error('Failed to search appointments:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-0 pb-16">
        
        {/* Page Hero Header */}
        <section className="bg-gradient-to-r from-primary to-accent text-white py-16 mb-12 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-5">
            <span className="text-xs font-bold text-secondary tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full">
              {isTa ? 'சட்டமன்ற உறுப்பினர் திரு. சி. அருள் விக்னேஷ் சந்திப்பு பதிவு' : 'Zonal MLA Mr. C. Arul Vignesh Appointments Portal'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black">
              {isTa ? 'சந்திப்பு பதிவு' : 'Book Appointment'}
            </h1>
            <p className="text-sm md:text-base text-gray-200 mx-auto max-w-2xl font-medium leading-relaxed">
              {isTa 
                ? 'சட்டமன்ற உறுப்பினர் திரு. சி. அருள் விக்னேஷ் அவர்களை நேரில் சந்தித்து குறைகளை தெரிவிக்க மற்றும் திட்டங்களுக்கு ஒப்புதல் பெற உங்கள் சந்திப்பு நேரத்தை பதிவு செய்யுங்கள்.'
                : 'Schedule a formal meeting with MLA Mr. C. Arul Vignesh at the constituency office. Submit request details below.'}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Booking Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs text-left">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6">
                {isTa ? 'சந்திப்பு பதிவு படிவம்' : 'Appointment Application Form'}
              </h2>

              <form onSubmit={handleBooking} className="space-y-5">
                
                {/* 1. FULL NAME */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                    <User size={13} className="mr-1.5 text-primary flex-shrink-0" />
                    <span>{isTa ? 'முழுப் பெயர் *' : 'FULL NAME *'}</span>
                  </label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTa ? 'எ.கா. அன்பரசன்' : 'e.g. Anbarasan'}
                    className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800"
                    required
                  />
                </div>

                {/* 2. MOBILE NUMBER & EMAIL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                      <Phone size={13} className="mr-1.5 text-primary flex-shrink-0" />
                      <span>{isTa ? 'கைபேசி எண் *' : 'MOBILE NUMBER *'}</span>
                    </label>
                    <input 
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                      <Mail size={13} className="mr-1.5 text-primary flex-shrink-0" />
                      <span>{isTa ? 'மின்னஞ்சல் (விருப்பத்தேர்வு)' : 'EMAIL (OPTIONAL)'}</span>
                    </label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. citizen@gmail.com"
                      className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800"
                    />
                  </div>
                </div>

                {/* 3. CONSTITUENCY, TALUK & VILLAGE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                      <MapPin size={13} className="mr-1.5 text-primary flex-shrink-0" />
                      <span>{isTa ? 'தொகுதி' : 'CONSTITUENCY'}</span>
                    </label>
                    <input 
                      type="text"
                      value={constituency}
                      readOnly
                      className="w-full h-11 border border-gray-200 bg-gray-100/70 rounded-xl px-4 text-xs md:text-sm font-black text-primary cursor-not-allowed select-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                      <MapPin size={13} className="mr-1.5 text-primary flex-shrink-0" />
                      <span>{isTa ? 'வட்டம் (TALUK) *' : 'TALUK *'}</span>
                    </label>
                    <select 
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800 bg-white cursor-pointer"
                      required
                    >
                      <option value="">{isTa ? 'வட்டத்தை தேர்ந்தெடுக்கவும்' : 'Select Taluk'}</option>
                      <option value="Kallakurichi">Kallakurichi</option>
                      <option value="Chinnasalem">Chinnasalem</option>
                      <option value="Sankarapuram">Sankarapuram</option>
                      <option value="Tirukkoyilur">Tirukkoyilur</option>
                      <option value="Ulundurpet">Ulundurpet</option>
                      <option value="Kalvarayan Hills">Kalvarayan Hills</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                      <MapPin size={13} className="mr-1.5 text-primary flex-shrink-0" />
                      <span>{isTa ? 'கிராமம் / வார்டு *' : 'VILLAGE / WARD *'}</span>
                    </label>
                    <input 
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder={isTa ? 'எ.கா. தியாகதுருகம்' : 'e.g. Thiyagadurgam'}
                      className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* 4. PREFERRED DATE */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center h-4">
                    <Calendar size={13} className="mr-1.5 text-primary flex-shrink-0" />
                    <span>{isTa ? 'விரும்பும் சந்திப்பு தேதி *' : 'PREFERRED DATE *'}</span>
                  </label>
                  <input 
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-11 border border-gray-200 focus:border-primary rounded-xl px-4 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800 bg-white cursor-pointer"
                    required
                  />
                </div>

                {/* 5. FULL RESIDENTIAL ADDRESS */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center">
                    <MapPin size={13} className="mr-1.5 text-primary" />
                    <span>{isTa ? 'முழு முகவரி *' : 'FULL RESIDENTIAL ADDRESS *'}</span>
                  </label>
                  <textarea 
                    rows={2}
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder={isTa ? 'கதவு எண், தெரு பெயர், பின்கோடு...' : 'Door No, Street Name, Landmark, Pincode...'}
                    className="border border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800"
                    required
                  />
                </div>

                {/* 6. PURPOSE OF MEETING */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1.5 flex items-center">
                    <FileText size={13} className="mr-1.5 text-primary" />
                    <span>{isTa ? 'சந்திப்பின் நோக்கம் / கோரிக்கை விவரம் *' : 'PURPOSE OF MEETING / PETITION SUMMARY *'}</span>
                  </label>
                  <textarea 
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder={isTa ? 'உங்கள் மனு அல்லது சந்திப்பின் நோக்கத்தை சுருக்கமாக குறிப்பிடவும்...' : 'Briefly describe your petition, welfare request, or meeting objective...'}
                    className="border border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none transition font-semibold text-gray-800"
                    required
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 select-none">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-accent text-white font-extrabold py-3.5 px-6 rounded-xl text-xs md:text-sm uppercase tracking-wider transition shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? (isTa ? 'பதிவு செய்யப்படுகிறது...' : 'Submitting Request...') 
                      : (isTa ? 'சந்திப்பு பதிவு செய்க' : 'Request Appointment')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Appointment Status Retrieval & Location Map */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Card 1: Status Check Box */}
            <div id="search-status-box" className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs space-y-6 text-left scroll-mt-24">
              <div className="border-b border-gray-100 pb-3 flex items-center space-x-2 select-none">
                <ShieldCheck size={20} className="text-primary" />
                <h2 className="text-lg font-extrabold text-gray-900">
                  {isTa ? 'பதிவின் நிலை சரிபார்க்க' : 'Check Status'}
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                {isTa 
                  ? 'உங்கள் சந்திப்பு கோரிக்கையின் நிலையை (நிலுவையில், அனுமதிக்கப்பட்டதா, மறுக்கப்பட்டதா) அறிய உங்கள் பதிவு செய்யப்பட்ட கைபேசி எண்ணை உள்ளிடவும்.'
                  : 'Enter your registered mobile phone number below to retrieve appointment approvals and office schedules.'}
              </p>

              {/* Search form */}
              <form onSubmit={handleSearch} className="flex gap-2 select-none">
                <input 
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder={isTa ? 'எ.கா. 9876543210 அல்லது TVK-KLI-1001' : 'e.g. 9876543210 or TVK-KLI-657914'}
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
                <div className="space-y-4 pt-2 max-h-[350px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider select-none">Search Results ({searchResults.length})</h3>
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-red-500 font-bold select-none">No active requests found for this search.</p>
                  ) : (
                    searchResults.map((apt) => (
                      <div key={apt.id} className="bg-gray-50 border border-gray-150 p-4 rounded-2xl text-xs space-y-2.5">
                        <div className="flex justify-between items-center select-none">
                          <span className="font-extrabold text-primary notranslate">{apt.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest border uppercase ${
                            apt.status === 'APPROVED' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : apt.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : apt.status === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {apt.status || 'PENDING'}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-gray-600 leading-normal space-y-1">
                          <div>Visitor: <span className="font-bold text-gray-900">{apt.name}</span></div>
                          <div>Preferred Date: <span className="font-bold text-gray-900">{apt.preferredDate || apt.date || 'N/A'}</span></div>
                          <div className="flex items-center space-x-1.5 pt-0.5">
                            <span className="text-gray-700 font-bold">Allotted Time Slot:</span>
                            <span className={`font-black px-2 py-0.5 rounded text-[10px] tracking-wide ${
                              apt.timeSlot 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs font-extrabold' 
                                : 'bg-gray-200/60 text-gray-400 italic'
                            }`}>
                              {apt.timeSlot || (isTa ? 'நேரம் இன்னும் ஒதுக்கப்படவில்லை' : 'Pending Allocation')}
                            </span>
                          </div>
                        </div>
                        
                        {apt.adminRemarks && (
                          <div className="border-t border-gray-200/60 pt-2 text-[10px] font-bold text-primary italic leading-normal">
                            Remarks: <span className="text-gray-600 font-semibold block mt-0.5 select-text">{apt.adminRemarks}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Card 2: Office Visiting Hours & Guidelines */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs space-y-4 text-left">
              <div className="border-b border-gray-100 pb-3 flex items-center space-x-2 select-none">
                <Clock className="text-[#800000]" size={20} />
                <h2 className="text-lg font-extrabold text-gray-900">
                  {isTa ? 'அலுவலக வழிகாட்டுதல்கள்' : 'Office Visiting Guidelines'}
                </h2>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <span className="text-base">🕒</span>
                  <div>
                    <span className="font-extrabold text-gray-900 block">
                      {isTa ? 'பார்வையாளர் நேரம்' : 'Visiting Hours'}
                    </span>
                    <span className="text-gray-600 font-semibold text-[11px]">
                      {isTa ? 'திங்கள் - வெள்ளி: காலை 10:00 - மாலை 05:00 மணி வரை' : 'Monday - Friday: 10:00 AM - 05:00 PM'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-gray-50 border border-gray-150">
                  <span className="text-base">📍</span>
                  <div>
                    <span className="font-extrabold text-gray-900 block">
                      {isTa ? 'அலுவலக முகவரி' : 'Constituency Office'}
                    </span>
                    <span className="text-gray-600 font-semibold text-[11px]">
                      {isTa ? 'எம்.எல்.ஏ அலுவலகம், சேலம் பைபாஸ் சந்திப்பு, கள்ளக்குறிச்சி' : 'MLA Office, Salem Highway Junction, Kallakurichi'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                  <span className="text-base">📄</span>
                  <div>
                    <span className="font-extrabold text-emerald-950 block">
                      {isTa ? 'கொண்டு வர வேண்டியவை' : 'Documents to Bring'}
                    </span>
                    <span className="text-emerald-800 font-semibold text-[11px]">
                      {isTa ? 'ஆதார் அட்டை & கோரிக்கை மனு ஆவணங்களை நேரில் வரும்போது கொண்டு வரவும்' : 'Please bring your Aadhaar Card & petition copy during your visit'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 🌟 Celebratory Success Modal Popup with Name & Appointment ID */}
        {ticketDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-100 text-left space-y-6 animate-scaleUp relative overflow-hidden">
              {/* Top decorative gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#800000] via-[#FFCC00] to-emerald-500"></div>

              {/* Close X Button */}
              <button
                onClick={() => setTicketDetails(null)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Header with animated Icon & Name Greeting */}
              <div className="flex items-start space-x-4 pt-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 size={32} className="text-emerald-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={11} className="text-emerald-500" />
                    <span>{isTa ? 'மனு பதிவு செய்யப்பட்டது' : 'Application Submitted'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug notranslate">
                    {isTa ? `வணக்கம், ${ticketDetails.name}!` : `Hello, ${ticketDetails.name}!`}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold">
                    {isTa ? 'உங்கள் சந்திப்பு கோரிக்கை வெற்றிகரமாகப் பதிவு செய்யப்பட்டது.' : 'Your MLA meeting request has been submitted successfully.'}
                  </p>
                </div>
              </div>

              {/* Highlighted Appointment ID Card with 1-Click Copy */}
              <div className="bg-gradient-to-br from-yellow-50/60 to-gray-50 border-2 border-[#FFCC00]/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#800000]">
                    {isTa ? 'சந்திப்பு அடையாள எண் (APPOINTMENT ID)' : 'OFFICIAL APPOINTMENT ID'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider border border-amber-200">
                    {ticketDetails.status || 'PENDING'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 shadow-xs">
                  <span className="font-mono font-black text-lg sm:text-2xl text-primary tracking-wider select-all">
                    {ticketDetails.id}
                  </span>
                  <button
                    onClick={() => handleCopyId(ticketDetails.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                      copiedId 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#800000] hover:bg-[#990000] text-[#FFCC00]'
                    }`}
                  >
                    {copiedId ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedId ? (isTa ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : 'Copy ID'}</span>
                  </button>
                </div>

                {/* Brief Appointment Details Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-700 pt-1">
                  <div className="bg-white/80 p-2 rounded-lg border border-gray-150">
                    <span className="block text-[9px] text-gray-400 font-bold uppercase">{isTa ? 'தேதி' : 'Date'}</span>
                    <span className="text-gray-900 text-xs font-extrabold">{ticketDetails.preferredDate || ticketDetails.date}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-gray-150">
                    <span className="block text-[9px] text-gray-400 font-bold uppercase">{isTa ? 'இடம்' : 'Location'}</span>
                    <span className="text-gray-900 text-xs font-extrabold">{ticketDetails.taluk} - {ticketDetails.village}</span>
                  </div>
                </div>
              </div>

              {/* Instruction Notice */}
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-150">
                💡 {isTa 
                  ? 'உங்கள் Appointment ID-ஐ குறித்து வைத்துக்கொள்ளவும். இதன் மூலம் உங்கள் சந்திப்பு அனுமதிக்கப்பட்ட நேரம் மற்றும் விவரங்களை எப்போது வேண்டுமானாலும் அறியலாம்.' 
                  : 'Please save your Appointment ID. You can use it below anytime to track approval status and allotted time slots.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
                <button
                  onClick={() => handleTrackFromModal(ticketDetails.id)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Search size={14} />
                  <span>{isTa ? 'நிலையை அறிய (Track Status)' : 'Track Status Now'}</span>
                </button>
                <button
                  onClick={() => setTicketDetails(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#800000] hover:bg-[#990000] text-[#FFCC00] text-xs font-black shadow-md shadow-[#800000]/20 transition cursor-pointer"
                >
                  {isTa ? 'சரி (Done)' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Appointment;
