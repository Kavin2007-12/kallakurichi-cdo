import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, CheckSquare, X, ChevronRight, CheckCircle2, Award, Loader2 } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const VolunteerSignup = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ward, setWard] = useState('1');
  const [interests, setInterests] = useState([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membershipData, setMembershipData] = useState(null);

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
            const shadowAlpha1 = 0.12 + 0.23 * eased;
            const shadowAlpha2 = 0.06 + 0.12 * eased;

            const boxShadow = `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px ${shadowSpread.toFixed(1)}px rgba(120, 0, 0, ${shadowAlpha1.toFixed(3)}), 0 ${(shadowY * 0.5).toFixed(1)}px ${(shadowBlur * 0.5).toFixed(1)}px -6px rgba(0, 0, 0, ${shadowAlpha2.toFixed(3)})`;

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

  const currentLang = getCurrentLanguage();

  const interestOptions = [
    { id: 'welfare', label: currentLang === 'ta' ? 'சமூக நலப் பணிகள்' : 'Social Welfare & Support' },
    { id: 'environment', label: currentLang === 'ta' ? 'சுற்றுச்சூழல் & துப்புரவுப் பணிகள்' : 'Environment & Clean Drives' },
    { id: 'events', label: currentLang === 'ta' ? 'கூட்டங்கள் & கள ஒருங்கிணைப்பு' : 'Event Coordination & Rallies' },
    { id: 'digital', label: currentLang === 'ta' ? 'டிஜிட்டல் பிரச்சாரம் & சமூக ஊடகம்' : 'Digital Campaign & Social Media' },
  ];

  const handleInterestToggle = (id) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const memberId = `TVK-VOL-${Math.floor(10000 + Math.random() * 90000)}`;
    const regDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    const newVolunteer = {
      id: memberId,
      name: name.trim(),
      mobile: phone.trim(),
      phone: phone.trim(),
      email: email.trim() || 'N/A',
      constituency: 'Kallakurichi',
      taluk: 'Kallakurichi',
      village: `Ward ${ward}`,
      fullAddress: [
        interests.length > 0 ? `Interests: ${interests.join(', ')}` : '',
        message ? `Reason: ${message}` : '',
        `Ward ${ward}`
      ].filter(Boolean).join(' | '),
      status: 'PENDING',
      adminRemarks: '',
      date: regDate,
      createdAt: new Date().toISOString()
    };

    // Save to database & localStorage
    import('../services/api').then(({ api }) => {
      api.registerVolunteer(newVolunteer);
      const savedVolunteers = localStorage.getItem('kallakurichi_volunteers');
      const volunteersList = savedVolunteers ? JSON.parse(savedVolunteers) : [];
      volunteersList.unshift(newVolunteer);
      localStorage.setItem('kallakurichi_volunteers', JSON.stringify(volunteersList));
    });

    setTimeout(() => {
      setMembershipData({
        memberId,
        name,
        phone,
        email: email || 'N/A',
        ward,
        regDate
      });

      setIsSubmitting(false);
    }, 1000);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form after closing if registered
    if (membershipData) {
      setName('');
      setPhone('');
      setEmail('');
      setWard('1');
      setInterests([]);
      setMessage('');
      setMembershipData(null);
    }
  };

  return (
    <>
      <section id="volunteers" className="py-16 bg-white border-b border-gray-100 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Call-to-action Banner Card with scroll-driven scale animation */}
        <div 
          ref={cardRef}
          className="bg-gradient-to-br from-primary via-accent to-primary rounded-[2.5rem] p-8 md:p-12 lg:p-16 border border-primary/20 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-left transition-transform duration-200 ease-out will-change-transform"
          style={{
            transform: 'scale(0.88)',
            transformOrigin: 'center center',
          }}
        >
          {/* Subtle Background Glow Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl select-text">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 uppercase tracking-tight">
              {currentLang === 'ta' ? 'தொகுதி தன்னார்வலர் குழுவில் இணையுங்கள்!' : 'Join the Volunteer Wing!'}
            </h2>
            <p className="text-secondary font-extrabold text-sm uppercase tracking-widest mb-3">
              {currentLang === 'ta' ? 'நமது கள்ளக்குறிச்சியின் வளர்ச்சிக்கு கை கொடுப்போம்' : 'Empowering local citizen leaders'}
            </p>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              {currentLang === 'ta'
                ? 'மக்கள் நலத்திட்ட முகாம்கள், சுற்றுச்சூழல் தூய்மைப் பணிகள், மற்றும் சமூக விழிப்புணர்வு பிரச்சாரங்களில் முன்னின்று களப்பணியாற்ற எங்களோடு இணையுங்கள்.'
                : 'Be the active force driving positive change in your community. Volunteer to coordinate local welfare camps, environmental drives, and social welfare distribution campaigns.'}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => navigate('/volunteer')}
              className="bg-secondary text-primary font-black px-8 py-4 rounded-full text-xs md:text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl border border-primary/10 cursor-pointer flex items-center space-x-2"
            >
              <span>{currentLang === 'ta' ? 'தன்னார்வலராக பதிவு செய்' : 'Register as Volunteer'}</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        </div>
      </section>

      {/* Centered Card Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 notranslate">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
          ></div>

          {/* Modal Panel Container */}
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-gray-150/80 shadow-2xl flex flex-col justify-between max-h-[85vh] overflow-hidden transform transition-all duration-300 ease-out select-none animate-scale-up">
            
            {/* Header Box (Maroon bg) */}
            <div className="bg-primary p-5 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">
                    {currentLang === 'ta' ? 'தன்னார்வலர் பதிவுப் படிவம்' : 'Volunteer Registration'}
                  </h4>
                  <span className="text-[10px] text-secondary font-bold block uppercase tracking-widest mt-0.5">TVK Youth Wing</span>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-gray-50/50">
              {membershipData ? (
                // Success Badge Card (TVK Membership Ticket ID style)
                <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-md text-center space-y-6 relative overflow-hidden select-text">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 size={36} strokeWidth={2.5} />
                    </div>
                    <h5 className="text-lg font-black text-gray-800 uppercase tracking-tight">Registration Confirmed</h5>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Welcome to the Constituency Support Wing</p>
                  </div>

                  {/* ID Ticket */}
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 bg-gray-50 text-left space-y-2 relative">
                    <div className="absolute top-4 right-4 text-primary opacity-25">
                      <Award size={32} />
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center">
                      <span className="bg-secondary/20 px-2 py-0.5 rounded border border-secondary/15">Volunteer Badge</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400">MEMBER ID: <span className="font-extrabold text-gray-800">{membershipData.memberId}</span></p>
                    <p className="text-[13px] font-extrabold text-gray-900 border-t border-gray-200/60 pt-2 mt-1">Name: {membershipData.name}</p>
                    <p className="text-[11px] font-bold text-gray-600">Ward: {membershipData.ward}</p>
                    <p className="text-[11px] font-bold text-gray-600">Registered: {membershipData.regDate}</p>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    We will notify you via SMS/WhatsApp regarding upcoming volunteer briefing sessions and constituency projects.
                  </p>

                  <button
                    onClick={handleClose}
                    className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                // Form Fields
                <form id="volunteer-form" onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Name field */}
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1 flex items-center">
                      <User size={12} className="text-primary/70 mr-1 shrink-0" /> Full Name
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. R. K. Arul"
                      className="border border-gray-250 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                      required
                    />
                  </div>

                  {/* Phone field */}
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1 flex items-center">
                      <Phone size={12} className="text-primary/70 mr-1 shrink-0" /> Mobile Number
                    </label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="border border-gray-250 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                      required
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1 flex items-center">
                      <Mail size={12} className="text-primary/70 mr-1 shrink-0" /> Email Address (Optional)
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. info@domain.com"
                      className="border border-gray-250 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                    />
                  </div>

                  {/* Ward field */}
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1 flex items-center">
                      <MapPin size={12} className="text-primary/70 mr-1 shrink-0" /> Select Ward
                    </label>
                    <select 
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="border border-gray-250 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 bg-white font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                        <option key={w} value={w.toString()}>Ward {w}</option>
                      ))}
                    </select>
                  </div>

                  {/* Interests Checkbox Grid */}
                  <div className="flex flex-col text-left space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center mb-0.5">
                      <CheckSquare size={12} className="text-primary/70 mr-1 shrink-0" /> Areas of Interest
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {interestOptions.map(opt => (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => handleInterestToggle(opt.id)}
                          className={`flex items-center text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all duration-300 font-semibold cursor-pointer select-none ${
                            interests.includes(opt.id)
                              ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded border border-gray-300 flex items-center justify-center mr-2.5 shrink-0 ${
                            interests.includes(opt.id) ? 'bg-primary border-primary text-white' : 'bg-white'
                          }`}>
                            {interests.includes(opt.id) && <span className="text-[9px]">✓</span>}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message box */}
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">Why do you want to join? (Optional)</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Briefly tell us how you want to contribute to Ward projects."
                      rows="3"
                      className="border border-gray-250 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 resize-none font-medium text-left"
                    ></textarea>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Footer Submit Row */}
            {!membershipData && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  type="submit"
                  form="volunteer-form"
                  disabled={isSubmitting || !name.trim() || !phone.trim()}
                  className="w-full bg-primary hover:bg-accent text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:bg-primary cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Membership</span>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default VolunteerSignup;
