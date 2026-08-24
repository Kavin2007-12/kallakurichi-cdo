import { useState } from 'react';
import { FileEdit, Landmark, Award, ArrowRight } from 'lucide-react';
import GrievanceCenter from './GrievanceCenter';
import ConstituencyTracker from './ConstituencyTracker';
import WelfareChecker from './WelfareChecker';
import { getCurrentLanguage } from '../utils/lang';

const CitizenPortalsHub = () => {
  const [activeModal, setActiveModal] = useState(null); // 'grievance', 'fund', 'welfare', or null
  const currentLang = getCurrentLanguage();

  const services = [
    {
      id: 'grievance',
      badge: currentLang === 'ta' ? 'புகார் தீர்வு' : 'CITIZEN RESOLUTION',
      title: currentLang === 'ta' ? 'பொதுமக்கள் குறைதீர்ப்பு மையம்' : 'Citizen Grievance Center',
      desc: currentLang === 'ta' 
        ? 'தூய்மை, சாலைகள், குடிநீர் மற்றும் தெருவிளக்குகள் போன்ற உள்ளூர் பிரச்சனைகளை நேரடியாகப் பதிவு செய்து அதன் நிலையை நேரலையாக கண்காணிக்கவும்.'
        : 'File complaints directly to your ward inspectors and track on-site resolution timelines using transparent complaint codes.',
      icon: <FileEdit className="w-6 h-6 text-rose-600" />,
      color: 'hover:border-rose-300 hover:shadow-rose-100/50',
      iconBg: 'bg-rose-50',
      btnText: currentLang === 'ta' ? 'புகார் செய்க →' : 'Explore Grievance Center',
    },
    {
      id: 'fund',
      badge: currentLang === 'ta' ? 'நிதி மேலாண்மை' : 'FINANCIAL TRACKER',
      title: currentLang === 'ta' ? 'தொகுதி மேம்பாட்டு நிதி கண்காணிப்பு' : 'Constituency Fund Tracker',
      desc: currentLang === 'ta' 
        ? 'தொகுதிக்கு ஒதுக்கப்பட்ட ₹5 கோடி நிதியின் துறை வாரியான பயன்பாடுகள், வார்டு வாரியான திட்டங்கள் மற்றும் தணிக்கை அறிக்கைகளை சரிபார்க்கவும்.'
        : 'Access the interactive ward-wise spending map, sector budget charts, and download certified municipal project audit summaries.',
      icon: <Landmark className="w-6 h-6 text-amber-600" />,
      color: 'hover:border-amber-300 hover:shadow-amber-100/50',
      iconBg: 'bg-amber-50',
      btnText: currentLang === 'ta' ? 'நிதிநிலையை காண்க →' : 'Explore Zonal Finances',
    },
    {
      id: 'welfare',
      badge: currentLang === 'ta' ? 'அரசு நலத்திட்டங்கள்' : 'WELFARE & BENEFITS',
      title: currentLang === 'ta' ? 'அரசு நலத்திட்ட தகுதி சரிபார்ப்பு' : 'Welfare Schemes Portal',
      desc: currentLang === 'ta' 
        ? 'விவசாயிகள், குடும்பத் தலைவிகள் மற்றும் மாணவர்களுக்கான தகுதியுள்ள அரசு நலத்திட்டங்களை கண்டறிந்து விண்ணப்பங்களை மொபைலில் பெறுக.'
        : 'Take the 4-step eligibility quiz to instantly match with state benefits and simulate downloading pre-filled application forms.',
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      color: 'hover:border-emerald-300 hover:shadow-emerald-100/50',
      iconBg: 'bg-emerald-50',
      btnText: currentLang === 'ta' ? 'தகுதியை சரிபார் →' : 'Explore Welfare Schemes',
    }
  ];

  return (
    <>
      <section className="py-16 bg-gray-50/40 border-b border-gray-150 select-none animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-widest block mb-2">
            {currentLang === 'ta' ? 'அதிகாரப்பூர்வ பொதுமக்கள் சேவை மையம்' : 'OFFICIAL CITIZEN HUB'}
          </span>
          <h2 className="text-3xl md:text-4.5xl font-black text-gray-900 tracking-tight leading-tight uppercase font-sans">
            {currentLang === 'ta' ? 'மின்னணு தொகுதி மக்கள் சேவை மையம்' : 'Constituency Services Hub'}
          </h2>
          <p className="mt-2 text-xs md:text-sm text-gray-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            {currentLang === 'ta'
              ? 'விண்ணப்பங்களை சமர்ப்பிக்கவும், வார்டு நிதிநிலையை சரிபார்க்கவும், அல்லது அரசு நலத்திட்டங்களுக்கு உங்களின் தகுதியை சரிபார்க்க ஒரே தளம்.'
              : 'Direct access to municipal grievance forms, interactive ward map finances, and rule-based welfare eligibility calculators.'}
          </p>
        </div>

        {/* Unified 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => setActiveModal(service.id)}
              className={`bg-white rounded-[2.5rem] p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 ease-out cursor-pointer group ${service.color}`}
            >
              <div className="text-left space-y-4">
                {/* Icon Header */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-gray-150/40 shadow-xs ${service.iconBg}`}>
                  {service.icon}
                </div>

                {/* Badge & Title */}
                <div>
                  <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest block mb-1">
                    {service.badge}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                  {service.desc}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-gray-100 mt-6 flex justify-end">
                <button
                  type="button"
                  className="bg-primary hover:bg-accent text-white font-black px-5 py-2.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1.5 transition duration-300 group-hover:scale-105"
                >
                  <span>{service.btnText}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>

    {/* Render Modal Overlays Conditionally */}
      <GrievanceCenter isOpen={activeModal === 'grievance'} onClose={() => setActiveModal(null)} />
      <ConstituencyTracker isOpen={activeModal === 'fund'} onClose={() => setActiveModal(null)} />
      <WelfareChecker isOpen={activeModal === 'welfare'} onClose={() => setActiveModal(null)} />

    </>
  );
};

export default CitizenPortalsHub;
