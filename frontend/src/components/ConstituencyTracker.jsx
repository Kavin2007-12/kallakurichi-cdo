import { useState } from 'react';
import { Landmark, TrendingUp, ChevronRight, ArrowRight, BarChart3, CheckCircle2, X } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const ConstituencyTracker = ({ isOpen, onClose }) => {
  const [selectedWard, setSelectedWard] = useState(1);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const currentLang = getCurrentLanguage();

  // Financial summary data
  const totalAllocation = 5.00; // Crores
  const spentAmount = 3.40; // Crores
  const remainingAmount = 1.60; // Crores
  const overallProgressPercentage = 68;

  // Sector breakdown data
  const sectors = [
    { name: currentLang === 'ta' ? 'சாலைகள் & மேம்பாடு' : 'Roads & Infrastructure', spent: 1.80, allocated: 2.00, progress: 90, color: 'bg-primary' },
    { name: currentLang === 'ta' ? 'குடிநீர் & வடிகால்' : 'Water Supply & Sanitation', spent: 1.00, allocated: 1.20, progress: 83, color: 'bg-emerald-600' },
    { name: currentLang === 'ta' ? 'தெருவிளக்குகள் & பாதுகாப்பு' : 'Street Lights & Safety', spent: 0.40, allocated: 0.50, progress: 80, color: 'bg-amber-500' },
    { name: currentLang === 'ta' ? 'பூங்காக்கள் & பொது நலன்' : 'Parks & Community Welfare', spent: 0.20, allocated: 1.30, progress: 15, color: 'bg-blue-600' },
  ];

  // Ward data renamed to Kallakurichi Zones with audit reports
  const wardDetails = {
    1: {
      name: currentLang === 'ta' ? 'வார்டு 1 - கள்ளக்குறிச்சி டவுன் மண்டலம்' : 'Ward 1 - Kallakurichi Town Zone',
      allocated: '₹75 Lakhs',
      spent: '₹55 Lakhs',
      completed: [
        currentLang === 'ta' ? 'கள்ளக்குறிச்சி பிரதான குறுக்கு தெரு தார் சாலை சீரமைப்பு' : 'Kallakurichi Main Cross Street tarring',
        currentLang === 'ta' ? '45 புதிய எல்.இ.டி மின்விளக்குகள் நிறுவுதல்' : 'Installation of 45 new LED streetlights'
      ],
      ongoing: [
        currentLang === 'ta' ? 'கள்ளக்குறிச்சி பூங்கா நடைபாதை மற்றும் அமரும் இருக்கைகள் சீரமைப்பு' : 'Kallakurichi Central Park walkway restoration and bench setup'
      ],
      auditOfficer: 'Thiru. S. Janarthanan, IAAS',
      auditDate: 'July 25, 2026',
      items: [
        { name: currentLang === 'ta' ? 'சாலை தார் அமைத்தல் மற்றும் லெவலிங்' : 'Road Tarring & Leveling', budget: '₹35 Lakhs', spent: '₹35 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'எல்.இ.டி தெருவிளக்குகள் கொள்முதல்' : 'LED Streetlights Procurement', budget: '₹20 Lakhs', spent: '₹20 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'பூங்கா உபகரணங்கள் மற்றும் நடைபாதை சீரமைப்பு' : 'Park Walkway & Bench Setup', budget: '₹20 Lakhs', spent: '₹0 Lakhs', variance: '₹20 Lakhs', status: 'Ongoing' }
      ]
    },
    2: {
      name: currentLang === 'ta' ? 'வார்டு 2 - பஜார் தெரு கள்ளக்குறிச்சி' : 'Ward 2 - Bazaar Street Kallakurichi',
      allocated: '₹90 Lakhs',
      spent: '₹80 Lakhs',
      completed: [
        currentLang === 'ta' ? 'பஜார் தெரு சாலை முழுமையாக தார் அமைத்தல்' : 'Complete repaving of Main Bazaar Road',
        currentLang === 'ta' ? 'குடிநீர் குழாய்கள் சுத்தம் செய்தல்' : 'Underground supply lines flushed'
      ],
      ongoing: [
        currentLang === 'ta' ? 'மழைநீர் வடிகால் தூர்வாரும் பணிகள்' : 'Stormwater drain dredging and safety cover installation'
      ],
      auditOfficer: 'Thiru. R. Varadharajan, M.Tech',
      auditDate: 'July 28, 2026',
      items: [
        { name: currentLang === 'ta' ? 'சாலை தார் மற்றும் பஜார் சாலை சீரமைப்பு' : 'Road Tarring & Bazaar Repaving', budget: '₹50 Lakhs', spent: '₹50 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'நீர் குழாய் மற்றும் வால்வ் சுத்திகரிப்பு' : 'Water Pipe Valve Flushing', budget: '₹30 Lakhs', spent: '₹30 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'வடிகால் பாதுகாப்பு கவர்கள் அமைத்தல்' : 'Drainage Safety Covers', budget: '₹10 Lakhs', spent: '₹0 Lakhs', variance: '₹10 Lakhs', status: 'Ongoing' }
      ]
    },
    3: {
      name: currentLang === 'ta' ? 'வார்டு 3 - காந்தி காலனி கள்ளக்குறிச்சி' : 'Ward 3 - Gandhi Colony Kallakurichi',
      allocated: '₹60 Lakhs',
      spent: '₹40 Lakhs',
      completed: [
        currentLang === 'ta' ? 'மத்திய சுத்திகரிக்கப்பட்ட குடிநீர் நிலையம் திறப்பு' : 'RO Drinking Water Station commissioned',
        currentLang === 'ta' ? 'அரசு பள்ளி கூடுதல் வகுப்பறைகள் சீரமைப்பு' : 'Primary School renovation'
      ],
      ongoing: [
        currentLang === 'ta' ? 'பகுதிநேர நியாய விலை கடை கட்டுமானப் பணி' : 'Cooperative fair price shop building construction'
      ],
      auditOfficer: 'Tmt. K. Suganthi, B.E',
      auditDate: 'July 22, 2026',
      items: [
        { name: currentLang === 'ta' ? 'குடிநீர் சுத்திகரிப்பு ஆலை நிறுவுதல்' : 'RO Drinking Water Plant', budget: '₹25 Lakhs', spent: '₹25 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'அரசு ஆரம்பப் பள்ளி சீரமைப்பு' : 'Primary School Renovation', budget: '₹15 Lakhs', spent: '₹15 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'கூட்டுறவு நியாய விலை கடை கட்டிடம்' : 'Fair Price Shop Building', budget: '₹20 Lakhs', spent: '₹0 Lakhs', variance: '₹20 Lakhs', status: 'Ongoing' }
      ]
    },
    4: {
      name: currentLang === 'ta' ? 'வார்டு 4 - ரயில்வே ஜங்ஷன் மண்டலம்' : 'Ward 4 - Railway Junction Zone',
      allocated: '₹85 Lakhs',
      spent: '₹65 Lakhs',
      completed: [
        currentLang === 'ta' ? 'அனைத்து பிரதான சந்திகளிலும் கேமராக்கள் பொருத்துதல்' : 'CCTV installation at major junctions',
        currentLang === 'ta' ? 'பழுதடைந்த மின் கம்பங்கள் மாற்றுதல்' : 'Damaged power poles replaced'
      ],
      ongoing: [
        currentLang === 'ta' ? 'ரயில்வே சுரங்கப்பாதை வடிகால் சீரமைப்பு' : 'Railway underpass drainage pipeline setup'
      ],
      auditOfficer: 'Thiru. S. Janarthanan, IAAS',
      auditDate: 'August 01, 2026',
      items: [
        { name: currentLang === 'ta' ? 'சிசிடிவி கேமராக்கள் கொள்முதல்' : 'CCTV Camera Procurement', budget: '₹45 Lakhs', spent: '₹45 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'பாதுகாப்பு மின் கம்பங்கள் மற்றும் கம்பிகள்' : 'Safety Poles & Wiring', budget: '₹20 Lakhs', spent: '₹20 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'சுரங்கப்பாதை வடிகால் வடிகட்டுதல்' : 'Underpass Drainage Pipeline', budget: '₹20 Lakhs', spent: '₹0 Lakhs', variance: '₹20 Lakhs', status: 'Ongoing' }
      ]
    },
    5: {
      name: currentLang === 'ta' ? 'வார்டு 5 - காவேரி நகர் மண்டலம்' : 'Ward 5 - Kaveri Nagar Zone',
      allocated: '₹1.10 Crore',
      spent: '₹75 Lakhs',
      completed: [
        currentLang === 'ta' ? 'புதிய கழிவுநீர் கால்வாய் அமைத்தல்' : 'Main concrete drainage canal construction',
        currentLang === 'ta' ? 'சுகாதார மைய உபகரணங்கள் மேம்பாடு' : 'Primary Health Centre updates'
      ],
      ongoing: [
        currentLang === 'ta' ? 'புதிய பூங்கா மற்றும் உடற்பயிற்சி கூடம் அமைத்தல்' : 'Open gym and kids play park installation'
      ],
      auditOfficer: 'Thiru. R. Varadharajan, M.Tech',
      auditDate: 'August 03, 2026',
      items: [
        { name: currentLang === 'ta' ? 'கான்கிரீட் கழிவுநீர் வடிகால் கால்வாய்' : 'Concrete Drainage Canal', budget: '₹50 Lakhs', spent: '₹50 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'ஆரம்ப சுகாதார நிலைய மருத்துவ உபகரணங்கள்' : 'Primary Health Center equipment', budget: '₹25 Lakhs', spent: '₹25 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'பூங்கா மற்றும் உடற்பயிற்சி கூடம் திறப்பு' : 'Park Open Gym installation', budget: '₹35 Lakhs', spent: '₹0 Lakhs', variance: '₹35 Lakhs', status: 'Ongoing' }
      ]
    },
    6: {
      name: currentLang === 'ta' ? 'வார்டு 6 - நேதாஜி வீதி மண்டலம்' : 'Ward 6 - Netaji Street Zone',
      allocated: '₹80 Lakhs',
      spent: '₹35 Lakhs',
      completed: [
        currentLang === 'ta' ? 'பழைய தெருவிளக்குகள் எல்.இ.டி-யாக மாற்றுதல்' : 'High-mast LED light installation at Netaji Junction',
      ],
      ongoing: [
        currentLang === 'ta' ? 'தார் மற்றும் சிமெண்ட் சாலைகள் அமைக்கும் பணி' : 'Concrete link road construction between Netaji & Kaveri'
      ],
      auditOfficer: 'Tmt. K. Suganthi, B.E',
      auditDate: 'July 30, 2026',
      items: [
        { name: currentLang === 'ta' ? 'ஹை மாஸ்ட் எல்.இ.டி விளக்கு அமைத்தல்' : 'High Mast LED light setup', budget: '₹35 Lakhs', spent: '₹35 Lakhs', variance: '₹0', status: 'Completed' },
        { name: currentLang === 'ta' ? 'கான்கிரீட் இணைப்பு சாலை அமைத்தல்' : 'Concrete road paving', budget: '₹45 Lakhs', spent: '₹0 Lakhs', variance: '₹45 Lakhs', status: 'Ongoing' }
      ]
    }
  };

  const activeWard = wardDetails[selectedWard];

  const handleCloseTracker = () => {
    setSelectedWard(1);
    setIsAuditModalOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Full Zonal Finance Dashboard Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-scale-up select-text">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2.5">
                <Landmark size={20} />
                <div>
                  <h3 className="font-bold text-base md:text-lg">
                    {currentLang === 'ta' ? 'தொகுதி மேம்பாட்டு நிதி கண்காணிப்பகம்' : 'Constituency Zonal Finance Portal'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={handleCloseTracker}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              
              {/* Financial Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Total Allocated */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-150 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white text-gray-700 border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
                    <Landmark size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      {currentLang === 'ta' ? 'மொத்த நிதி ஒதுக்கீடு' : 'Total Allocation'}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-none">
                      ₹{totalAllocation.toFixed(2)} Cr
                    </h3>
                  </div>
                </div>

                {/* Card 2: Spent */}
                <div className="bg-emerald-50/30 rounded-2xl p-6 border border-emerald-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      {currentLang === 'ta' ? 'செலவிடப்பட்ட நிதி' : 'Funds Spent'}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-emerald-600 leading-none">
                      ₹{spentAmount.toFixed(2)} Cr
                    </h3>
                  </div>
                </div>

                {/* Card 3: Remaining */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white text-primary border border-primary/10 flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart3 size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      {currentLang === 'ta' ? 'மீதமுள்ள நிதி' : 'Remaining Balance'}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-primary leading-none">
                      ₹{remainingAmount.toFixed(2)} Cr
                    </h3>
                  </div>
                </div>

              </div>

              {/* Global Progress Bar */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-150 text-left">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    {currentLang === 'ta' ? 'ஒட்டுமொத்த நிதி பயன்பாட்டு சதவீதம்' : 'Overall Fund Utilization'}
                  </span>
                  <span className="text-xs md:text-sm font-black text-primary bg-secondary/30 px-3 py-1 rounded-full border border-secondary/15">
                    {overallProgressPercentage}% Spent
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${overallProgressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Two Column Section: Sector Bars & Interactive Map */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column (5/12): Sector allocations */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-150 space-y-5 text-left">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center">
                    <BarChart3 size={18} className="text-primary mr-2" />
                    {currentLang === 'ta' ? 'துறை வாரியாக செலவுகள்' : 'Spending by Sector'}
                  </h3>
                  
                  <div className="space-y-4">
                    {sectors.map((sec, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-gray-750">
                          <span>{sec.name}</span>
                          <span className="text-gray-500">₹{sec.spent.toFixed(2)} / ₹{sec.allocated.toFixed(2)} Cr</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`${sec.color} h-full rounded-full`}
                            style={{ width: `${sec.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-[9px] font-bold text-gray-400">{sec.progress}% utilized</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column (7/12): Interactive Ward Map & Details */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-150 flex flex-col md:flex-row gap-6 items-stretch justify-between">
                  
                  {/* Interactive SVG Wards Plot */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-1/2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      {currentLang === 'ta' ? 'வார்டு வரைபடம் (தேர்வு செய்க)' : 'Interactive Ward Map'}
                    </h4>
                    
                    <svg viewBox="0 0 240 240" className="w-40 h-40 md:w-48 md:h-48 filter drop-shadow-xs">
                      {/* Ward 1 Path */}
                      <polygon 
                        points="20,80 120,20 120,120 20,120" 
                        onClick={() => setSelectedWard(1)}
                        className={`cursor-pointer transition-all duration-300 stroke-white stroke-[3] ${
                          selectedWard === 1 ? 'fill-secondary' : 'fill-primary hover:fill-primary/80'
                        }`}
                      />
                      <text x="65" y="80" className={`text-[12px] font-black pointer-events-none ${selectedWard === 1 ? 'fill-primary' : 'fill-white'}`}>W1</text>
                      
                      {/* Ward 2 Path */}
                      <polygon 
                        points="120,20 220,80 220,120 120,120" 
                        onClick={() => setSelectedWard(2)}
                        className={`cursor-pointer transition-all duration-300 stroke-white stroke-[3] ${
                          selectedWard === 2 ? 'fill-secondary' : 'fill-primary/90 hover:fill-primary/80'
                        }`}
                      />
                      <text x="165" y="80" className={`text-[12px] font-black pointer-events-none ${selectedWard === 2 ? 'fill-primary' : 'fill-white'}`}>W2</text>

                      {/* Ward 3 Path */}
                      <polygon 
                        points="20,120 120,120 120,220 20,160" 
                        onClick={() => setSelectedWard(3)}
                        className={`cursor-pointer transition-all duration-300 stroke-white stroke-[3] ${
                          selectedWard === 3 ? 'fill-secondary' : 'fill-primary/95 hover:fill-primary/80'
                        }`}
                      />
                      <text x="65" y="165" className={`text-[12px] font-black pointer-events-none ${selectedWard === 3 ? 'fill-primary' : 'fill-white'}`}>W3</text>

                      {/* Ward 4 Path */}
                      <polygon 
                        points="120,120 220,120 220,160 120,220" 
                        onClick={() => setSelectedWard(4)}
                        className={`cursor-pointer transition-all duration-300 stroke-white stroke-[3] ${
                          selectedWard === 4 ? 'fill-secondary' : 'fill-primary hover:fill-primary/80'
                        }`}
                      />
                      <text x="165" y="165" className={`text-[12px] font-black pointer-events-none ${selectedWard === 4 ? 'fill-primary' : 'fill-white'}`}>W4</text>

                      {/* Ward 5 Path */}
                      <polygon 
                        points="20,80 20,20 120,20" 
                        onClick={() => setSelectedWard(5)}
                        className={`cursor-pointer transition-all duration-300 stroke-white stroke-[3] ${
                          selectedWard === 5 ? 'fill-secondary' : 'fill-primary/85 hover:fill-primary/80'
                        }`}
                      />
                      <text x="50" y="40" className={`text-[10px] font-black pointer-events-none ${selectedWard === 5 ? 'fill-primary' : 'fill-white'}`}>W5</text>

                      {/* Ward 6 Path */}
                      <polygon 
                        points="120,20 220,20 220,80" 
                        onClick={() => setSelectedWard(6)}
                        className={`cursor-pointer transition-all duration-300 stroke-white stroke-[3] ${
                          selectedWard === 6 ? 'fill-secondary' : 'fill-primary/85 hover:fill-primary/80'
                        }`}
                      />
                      <text x="175" y="40" className={`text-[10px] font-black pointer-events-none ${selectedWard === 6 ? 'fill-primary' : 'fill-white'}`}>W6</text>
                    </svg>
                  </div>

                  {/* Ward Details Column */}
                  <div className="flex-grow flex flex-col justify-between text-left">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-100 flex items-center justify-between">
                        <span>{activeWard.name}</span>
                        <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">Active</span>
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-150">
                          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Allocated</span>
                          <span className="text-xs font-bold text-gray-800">{activeWard.allocated}</span>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-150">
                          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Spent</span>
                          <span className="text-xs font-bold text-emerald-600">{activeWard.spent}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Completed list */}
                        <div>
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Completed Works</h5>
                          <ul className="space-y-1 text-[11px] text-gray-700 font-semibold select-text">
                            {activeWard.completed.map((comp, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mr-1.5 mt-0.5" />
                                <span>{comp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Ongoing list */}
                        <div>
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ongoing Works</h5>
                          <ul className="space-y-1 text-[11px] text-gray-700 font-semibold select-text">
                            {activeWard.ongoing.map((ong, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0 mr-2 mt-1.5 animate-ping"></span>
                                <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0 mr-2 mt-1.5 absolute"></span>
                                <span>{ong}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* View Full Ward Audit Report Action Trigger */}
                    <button 
                      onClick={() => setIsAuditModalOpen(true)}
                      className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-primary font-bold text-xs group/btn cursor-pointer w-full text-left bg-transparent border-0 hover:text-accent focus:outline-none"
                    >
                      <span>View Full Ward Audit Report</span>
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-primary" />
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Ward Audit Report Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-scale-up select-text">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-5 flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-base md:text-lg">
                  {currentLang === 'ta' ? 'வார்டு தணிக்கை அறிக்கை' : 'Ward Development & Audit Report'}
                </h3>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-0.5">{activeWard.name}</p>
              </div>
              <button 
                onClick={() => setIsAuditModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Financial Quick Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl text-left">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Allocated</span>
                  <span className="text-base md:text-lg font-extrabold text-gray-800">{activeWard.allocated}</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-left">
                  <span className="text-[10px] font-bold text-emerald-600/80 block uppercase tracking-wider">Disbursed</span>
                  <span className="text-base md:text-lg font-extrabold text-emerald-600">{activeWard.allocated}</span>
                </div>
                <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl text-left">
                  <span className="text-[10px] font-bold text-primary/80 block uppercase tracking-wider">Spent</span>
                  <span className="text-base md:text-lg font-extrabold text-primary">{activeWard.spent}</span>
                </div>
              </div>

              {/* Expenditure Detail Table */}
              <div className="text-left space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Expenditure Breakdown</h4>
                
                <div className="overflow-x-auto border border-gray-150 rounded-2xl bg-white">
                  <table className="w-full text-left border-collapse text-xs md:text-[13px] font-medium">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="p-3">Project Scope</th>
                        <th className="p-3">Budget</th>
                        <th className="p-3">Spent</th>
                        <th className="p-3">Variance</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {activeWard.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition">
                          <td className="p-3 font-bold text-gray-900">{item.name}</td>
                          <td className="p-3 font-semibold">{item.budget}</td>
                          <td className="p-3 font-semibold text-emerald-600">{item.spent}</td>
                          <td className="p-3 font-semibold text-gray-500">{item.variance}</td>
                          <td className="p-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Signoff Credentials */}
              <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 text-left space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Auditing Assessment</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                    PASSED ✓
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Auditing Officer</span>
                    <span className="text-gray-900 font-bold">{activeWard.auditOfficer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Verification Date</span>
                    <span className="text-gray-900 font-bold">{activeWard.auditDate}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-gray-250 text-gray-700 text-xs md:text-sm font-bold hover:bg-gray-100 transition cursor-pointer"
              >
                Print Report
              </button>
              <button 
                onClick={() => setIsAuditModalOpen(false)}
                className="bg-primary hover:bg-accent text-white px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md transition cursor-pointer"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ConstituencyTracker;
