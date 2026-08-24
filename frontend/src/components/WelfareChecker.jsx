import { useState } from 'react';
import { Award, ChevronRight, ChevronLeft, Check, HelpCircle, Loader2, ArrowRight, X } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const WelfareChecker = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  
  // Quiz Answers State
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  
  // App States
  const [isCalculating, setIsCalculating] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [appliedSchemeId, setAppliedSchemeId] = useState(null);
  const [applyPhone, setApplyPhone] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const currentLang = getCurrentLanguage();

  // Predefined Tamil Nadu & Kallakurichi Zonal Welfare Schemes Database
  const schemesDatabase = [
    {
      id: 'SCH-01',
      title: 'Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar)',
      titleTa: 'புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார்)',
      benefit: '₹1,000 / Month stipend for college education',
      benefitTa: 'கல்லூரி படிப்பிற்கு மாதம் ₹1,000 நிதியுதவி',
      desc: 'Assists female students who studied in government schools from Classes 6 to 12 to pursue higher education.',
      descTa: '6 முதல் 12-ஆம் வகுப்பு வரை அரசுப் பள்ளிகளில் படித்து மேல்முறையீடு செய்யும் மாணவிகளுக்கு மாதம் ₹1000 உதவித்தொகை.',
      rules: { gender: 'female', ageRange: '18-35', occupation: 'student' }
    },
    {
      id: 'SCH-02',
      title: 'Kalaignar Magalir Urimai Thogai Scheme',
      titleTa: 'கலைஞர் மகளிர் உரிமைத் தொகை திட்டம்',
      benefit: '₹1,050 / Month basic livelihood support',
      benefitTa: 'மாதம் ₹1,050 குடும்பத் தலைவிகள் உரிமைத்தொகை',
      desc: 'Provides monthly cash support to women heads of eligible households to improve financial independence.',
      descTa: 'தகுதியுள்ள குடும்பத் தலைவிகளுக்கு மாதம் ₹1050 நிதி வழங்கும் மாநில மகளிர் உரிமைத் திட்டம்.',
      rules: { gender: 'female', ageRange: ['18-35', '36-60'], income: 'under_15k' }
    },
    {
      id: 'SCH-03',
      title: 'Tamil Nadu Farmer Crop Loan Waiver & Seed Subsidies',
      titleTa: 'விவசாய பயிர் கடன் தள்ளுபடி & விதை மானியம்',
      benefit: 'Interest-free credit & 50% subsidy on organic seeds',
      benefitTa: 'வட்டி இல்லா பயிர்க்கடன் & 50% விதை மானியம்',
      desc: 'Offers financial relief on cooperative bank crop loans and provides quality seeds for local agricultural development.',
      descTa: 'கூட்டுறவு வங்கி பயிர்க்கடன் தள்ளுபடி மற்றும் விவசாயிகளுக்கு தரமான விதைகள் மற்றும் உரம் மானிய விலையில் வழங்கல்.',
      rules: { occupation: 'farmer' }
    },
    {
      id: 'SCH-04',
      title: 'Tamil Nadu State Old Age Pension Scheme (OAP)',
      titleTa: 'முதியோர் ஓய்வூதியத் திட்டம் (OAP)',
      benefit: '₹1,000 / Month pension & free travel passes',
      benefitTa: 'மாதம் ₹1,000 முதியோர் ஓய்வூதியம் & இலவச பஸ் பாஸ்',
      desc: 'Ensures social security and monthly pension for senior citizens above the age of 60 living under low-income levels.',
      descTa: '60 வயதிற்கு மேற்பட்ட ஆதரவற்ற முதியோர்களுக்கு சமூகப் பாதுகாப்பு மற்றும் மாதாந்திர ஓய்வூதியம் வழங்கும் திட்டம்.',
      rules: { ageRange: 'above_60', income: 'under_15k' }
    },
    {
      id: 'SCH-05',
      title: 'Kallakurichi Youth Skill Development & Job Placement Drives',
      titleTa: 'கள்ளக்குறிச்சி இளைஞர் திறன் மேம்பாடு & வேலைவாய்ப்பு முகாம்',
      benefit: 'Free IT/Mechanical skill certification & job referral',
      benefitTa: 'இலவச தொழில்முறை பயிற்சி மற்றும் வேலைவாய்ப்பு',
      desc: 'A constituency-level skill development campaign connecting local unemployed youth with manufacturing and IT employers.',
      descTa: 'கள்ளக்குறிச்சி தொகுதி இளைஞர்களுக்கு இலவச தொழிற்பயிற்சி அளித்து வேலைவாய்ப்பு முகாம்கள் மூலம் பணி நியமனம் செய்தல்.',
      rules: { ageRange: ['18-35'], occupation: ['unemployed', 'student'] }
    },
    {
      id: 'SCH-06',
      title: 'Tamil Nadu Free Laptop Scheme for Government School Students',
      titleTa: 'மாணவர்களுக்கான இலவச மடிக்கணினி வழங்கும் திட்டம்',
      benefit: 'Free Student Laptop & educational soft-kits',
      benefitTa: 'இலவச லேப்டாப் மற்றும் மென்பொருள் தொகுப்பு',
      desc: 'Provides free laptops to secondary school students in government and government-aided institutions to encourage digital literacy.',
      descTa: 'அரசுப் பள்ளி மாணவ, மாணவிகளின் டிஜிட்டல் கல்விக்காக விலையில்லா மடிக்கணினிகள் வழங்கும் திட்டம்.',
      rules: { ageRange: 'under_18', occupation: 'student', income: ['under_15k', '15k_50k'] }
    }
  ];

  // Logic to compute eligibility matches
  const checkEligibility = () => {
    setIsCalculating(true);
    setEligibleSchemes([]);
    
    setTimeout(() => {
      const matches = schemesDatabase.filter(scheme => {
        const rules = scheme.rules;
        
        // Match specific rules if defined
        if (rules.gender && rules.gender !== gender) return false;
        
        if (rules.ageRange) {
          if (Array.isArray(rules.ageRange)) {
            if (!rules.ageRange.includes(ageRange)) return false;
          } else {
            if (rules.ageRange !== ageRange) return false;
          }
        }
        
        if (rules.occupation) {
          if (Array.isArray(rules.occupation)) {
            if (!rules.occupation.includes(occupation)) return false;
          } else {
            if (rules.occupation !== occupation) return false;
          }
        }
        
        if (rules.income) {
          if (Array.isArray(rules.income)) {
            if (!rules.income.includes(income)) return false;
          } else {
            if (rules.income !== income) return false;
          }
        }
        
        return true;
      });

      // Default backup general scheme if no matches are found
      if (matches.length === 0) {
        matches.push(schemesDatabase[4]); // Skill development scheme is open to general public
      }

      setEligibleSchemes(matches);
      setIsCalculating(false);
      setStep(5);
    }, 1500);
  };

  const handleNextStep = () => {
    if (step === 1 && !gender) return;
    if (step === 2 && !ageRange) return;
    if (step === 3 && !occupation) return;
    if (step === 4) {
      if (!income) return;
      checkEligibility();
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleResetQuiz = () => {
    setGender('');
    setAgeRange('');
    setOccupation('');
    setIncome('');
    setEligibleSchemes([]);
    setAppliedSchemeId(null);
    setApplyPhone('');
    setApplySuccess(false);
    setStep(1);
  };

  const handleClosePortal = () => {
    handleResetQuiz();
    if (onClose) onClose();
  };

  const handleApplyClick = (schemeId) => {
    setAppliedSchemeId(schemeId);
    setApplySuccess(false);
    setApplyPhone('');
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyPhone.trim()) return;

    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setApplySuccess(true);
    }, 1000);
  };

  return (
    <>
      {/* Welfare Checker Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[80] flex items-center justify-center p-4 notranslate">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-scale-up select-text">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2.5">
                <Award size={20} />
                <div>
                  <h3 className="font-bold text-base md:text-lg">
                    {currentLang === 'ta' ? 'அரசு நலத்திட்ட தகுதி சரிபார்ப்பு' : 'Welfare Schemes Eligibility Checker'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={handleClosePortal}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content body */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
              
              {/* Wizard Content container */}
              <div className="bg-gray-50 border border-gray-150 rounded-[2rem] p-6 sm:p-8 shadow-xs relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                
                {/* Step Indicators Bar */}
                {step <= 4 && (
                  <div className="flex items-center justify-between max-w-xs mx-auto mb-8 relative select-none">
                    <div className="absolute left-0 right-0 h-0.5 bg-gray-200 top-1/2 -translate-y-1/2 z-0"></div>
                    {[1, 2, 3, 4].map((num) => (
                      <div 
                        key={num}
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs relative z-10 border-2 transition-all duration-300 ${
                          step >= num 
                            ? 'bg-primary text-white border-primary shadow-xs' 
                            : 'bg-white text-gray-400 border-gray-250'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 1: GENDER SELECTION */}
                {step === 1 && (
                  <div className="space-y-6 text-center">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center justify-center space-x-2">
                      <HelpCircle size={16} className="text-primary" />
                      <span>Select Your Gender / பாலினம்</span>
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                      {['male', 'female', 'other'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-3.5 rounded-xl font-bold text-xs sm:text-sm capitalize transition border cursor-pointer border-0 outline-none ${
                            gender === g 
                              ? 'bg-primary text-white border-primary shadow-md' 
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100/50'
                          }`}
                        >
                          {g === 'male' && (currentLang === 'ta' ? 'ஆண்' : 'Male')}
                          {g === 'female' && (currentLang === 'ta' ? 'பெண்' : 'Female')}
                          {g === 'other' && (currentLang === 'ta' ? 'இதர' : 'Other')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: AGE RANGE */}
                {step === 2 && (
                  <div className="space-y-6 text-center">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center justify-center space-x-2">
                      <HelpCircle size={16} className="text-primary" />
                      <span>Select Your Age Group / வயது வரம்பு</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
                      {[
                        { id: 'under_18', label: 'Under 18', labelTa: '18 வயது கீழ்' },
                        { id: '18-35', label: '18 - 35 Yrs', labelTa: '18 - 35 வயது' },
                        { id: '36-60', label: '36 - 60 Yrs', labelTa: '36 - 60 வயது' },
                        { id: 'above_60', label: 'Above 60', labelTa: '60 வயது மேல்' }
                      ].map((age) => (
                        <button
                          key={age.id}
                          type="button"
                          onClick={() => setAgeRange(age.id)}
                          className={`py-3.5 rounded-xl font-bold text-xs sm:text-sm transition border cursor-pointer border-0 outline-none ${
                            ageRange === age.id 
                              ? 'bg-primary text-white border-primary shadow-md' 
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100/50'
                          }`}
                        >
                          {currentLang === 'ta' ? age.labelTa : age.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: OCCUPATION */}
                {step === 3 && (
                  <div className="space-y-6 text-center">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center justify-center space-x-2">
                      <HelpCircle size={16} className="text-primary" />
                      <span>What is Your Occupation? / தொழில்</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 max-w-2xl mx-auto">
                      {[
                        { id: 'farmer', label: 'Farmer / Weaver', labelTa: 'விவசாயி' },
                        { id: 'student', label: 'Student', labelTa: 'மாணவர்' },
                        { id: 'unemployed', label: 'Unemployed', labelTa: 'வேலையில்லாதவர்' },
                        { id: 'salaried', label: 'Salaried / Job', labelTa: 'பணியாளர்' },
                        { id: 'retired', label: 'Retired / Senior', labelTa: 'ஓய்வு பெற்றவர்' }
                      ].map((occ) => (
                        <button
                          key={occ.id}
                          type="button"
                          onClick={() => setOccupation(occ.id)}
                          className={`py-3.5 px-2 rounded-xl font-bold text-xs transition border cursor-pointer border-0 outline-none ${
                            occupation === occ.id 
                              ? 'bg-primary text-white border-primary shadow-md' 
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100/50'
                          }`}
                        >
                          {currentLang === 'ta' ? occ.labelTa : occ.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: INCOME */}
                {step === 4 && (
                  <div className="space-y-6 text-center">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center justify-center space-x-2">
                      <HelpCircle size={16} className="text-primary" />
                      <span>Monthly Family Income / குடும்ப வருமானம்</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                      {[
                        { id: 'under_15k', label: 'Under ₹15,000', labelTa: '₹15,000 கீழ்' },
                        { id: '15k_50k', label: '₹15,000 - ₹50,000', labelTa: '₹15,000 - ₹50,000' },
                        { id: 'above_50k', label: 'Above ₹50,000', labelTa: '₹50,000 மேல்' }
                      ].map((inc) => (
                        <button
                          key={inc.id}
                          type="button"
                          onClick={() => setIncome(inc.id)}
                          className={`py-3.5 rounded-xl font-bold text-xs sm:text-sm transition border cursor-pointer border-0 outline-none ${
                            income === inc.id 
                              ? 'bg-primary text-white border-primary shadow-md' 
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100/50'
                          }`}
                        >
                          {currentLang === 'ta' ? inc.labelTa : inc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5: RESULTS SCREEN */}
                {step === 5 && (
                  <div className="space-y-4 text-left select-text">
                    <div className="flex justify-between items-center border-b border-gray-250 pb-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center space-x-2">
                        <Award size={18} className="text-emerald-600 animate-bounce" />
                        <span>{currentLang === 'ta' ? 'தகுதியுள்ள திட்டங்கள்' : 'Matched Schemes'}</span>
                      </h4>
                      
                      <button
                        onClick={handleResetQuiz}
                        className="text-[10px] font-bold text-primary hover:text-accent bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-lg transition border-0 cursor-pointer"
                      >
                        {currentLang === 'ta' ? 'மீண்டும் சரிபார்' : 'Check Again'}
                      </button>
                    </div>

                    {/* Grid of Results */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                      {eligibleSchemes.map((scheme) => (
                        <div 
                          key={scheme.id}
                          className="bg-white border border-gray-250 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition duration-200 text-left"
                        >
                          <div>
                            <span className="text-[7px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase inline-block mb-1">
                              {scheme.id}
                            </span>
                            <h5 className="text-xs font-bold text-gray-900 leading-snug">
                              {currentLang === 'ta' ? scheme.titleTa : scheme.title}
                            </h5>
                            <p className="text-[10px] text-gray-500 font-medium mt-1 leading-normal">
                              {currentLang === 'ta' ? scheme.descTa : scheme.desc}
                            </p>
                          </div>

                          <div className="border-t border-gray-100 pt-2.5 mt-3 flex items-center justify-between">
                            <div className="text-left flex flex-col">
                              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider leading-none">BENEFIT</span>
                              <span className="text-[10px] font-extrabold text-emerald-600 mt-1">
                                {currentLang === 'ta' ? scheme.benefitTa : scheme.benefit}
                              </span>
                            </div>

                            <button
                              onClick={() => handleApplyClick(scheme.id)}
                              className="bg-primary hover:bg-accent text-white px-3 py-1 rounded-lg text-[9px] font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200 border-0 cursor-pointer"
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calculator Loading Overlay */}
                {isCalculating && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center z-30 select-none">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-xs font-bold text-gray-600 mt-2.5">Evaluating Scheme Eligibility...</span>
                  </div>
                )}

                {/* Wizard Action Footer Navigation Buttons */}
                {step <= 4 && (
                  <div className="flex justify-between items-center border-t border-gray-150 pt-4 mt-4 select-none">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={step === 1}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl border border-gray-250 text-gray-705 text-xs font-bold hover:bg-gray-100 transition cursor-pointer disabled:opacity-35"
                    >
                      <ChevronLeft size={14} />
                      <span>Back</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center space-x-1 bg-primary hover:bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
                    >
                      <span>{step === 4 ? 'Calculate Eligibility' : 'Continue'}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Scheme Application Overlay Modal */}
      {appliedSchemeId && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[85] flex items-center justify-center p-4 notranslate">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-scale-up select-text">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shadow-sm">
              <h3 className="font-bold text-xs md:text-sm">
                Apply: {appliedSchemeId}
              </h3>
              <button 
                onClick={() => setAppliedSchemeId(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer border-0 outline-none focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            {!applySuccess ? (
              <form onSubmit={handleApplySubmit} className="p-5 space-y-4 text-left">
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Enter your registered mobile number to receive the pre-filled welfare application forms and checklist directly via SMS/WhatsApp.
                </p>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="border border-gray-200 focus:border-primary rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none transition font-medium"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setAppliedSchemeId(null)}
                    className="px-4 py-2 rounded-xl border border-gray-250 text-gray-750 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="bg-primary hover:bg-accent text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    {isApplying ? 'Processing...' : 'Send Details'}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Screen */
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                  <Check size={20} strokeWidth={3} />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">Application Link Dispatched!</h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    The registration guidelines and pre-filled PDF forms have been sent to **{applyPhone}**.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setAppliedSchemeId(null)}
                    className="w-full bg-primary hover:bg-accent text-white py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default WelfareChecker;
