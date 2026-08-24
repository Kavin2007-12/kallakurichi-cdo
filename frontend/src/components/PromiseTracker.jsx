import { useState } from 'react';
import { Shield, Droplet, Lightbulb, Map, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const PromiseTracker = () => {
  const [activeTab, setActiveTab] = useState('All');
  const currentLang = getCurrentLanguage();

  // Promises Data
  const promises = [
    {
      id: 1,
      title: 'Road Infrastructure Upgrades',
      titleTa: 'சாலை உள்கட்டமைப்பு மேம்பாடுகள்',
      description: 'Paving all key roads in the town area and clearing major potholes.',
      descriptionTa: 'நகரப் பகுதியின் முக்கிய சாலைகளை சீரமைத்து, பள்ளங்களை சரிசெய்தல்.',
      progress: 85,
      status: 'ON TRACK',
      statusTa: 'நடைபெறுகிறது',
      icon: Map,
      color: 'text-amber-500 bg-amber-50',
      barColor: 'bg-amber-500',
      stats: '22/26 Roads Completed'
    },
    {
      id: 2,
      title: 'Clean RO Drinking Water Plants',
      titleTa: 'சுத்திகரிக்கப்பட்ட குடிநீர் நிலையங்கள்',
      description: 'Installing reverse-osmosis water stations for all major wards.',
      descriptionTa: 'அனைத்து முக்கிய வார்டுகளிலும் சுத்திகரிக்கப்பட்ட குடிநீர் நிலையங்களை அமைத்தல்.',
      progress: 100,
      status: 'COMPLETED',
      statusTa: 'நிறைவுற்றது',
      icon: Droplet,
      color: 'text-blue-500 bg-blue-50',
      barColor: 'bg-emerald-500',
      stats: '5 Wards Fully Covered'
    },
    {
      id: 3,
      title: 'Smart LED Streetlighting',
      titleTa: 'ஸ்மார்ட் எல்.இ.டி தெருவிளக்குகள்',
      description: 'Converting old traditional lamps to energy-efficient smart LED lights.',
      descriptionTa: 'பழைய தெருவிளக்குகளை நவீன ஸ்மார்ட் எல்.இ.டி விளக்குகளாக மாற்றுதல்.',
      progress: 90,
      status: 'ON TRACK',
      statusTa: 'நடைபெறுகிறது',
      icon: Lightbulb,
      color: 'text-yellow-500 bg-yellow-50',
      barColor: 'bg-yellow-500',
      stats: '400+ LED Lights Active'
    },
    {
      id: 4,
      title: 'Public Park Renovations',
      titleTa: 'பொதுப் பூங்காக்கள் சீரமைப்பு',
      description: 'Rebuilding local recreational spaces and planting shade saplings.',
      descriptionTa: 'உள்ளூர் பொழுதுபோக்கு பூங்காக்களை சீரமைத்து மரக்கன்றுகள் நடுதல்.',
      progress: 40,
      status: 'IN PROGRESS',
      statusTa: 'ஆரம்பிக்கப்பட்டுள்ளது',
      icon: Shield,
      color: 'text-emerald-500 bg-emerald-50',
      barColor: 'bg-emerald-500',
      stats: '2/5 Parks Renovated'
    }
  ];

  // Timeline Milestones Data
  const milestones = [
    {
      id: 1,
      date: 'August 2026',
      dateTa: 'ஆகஸ்ட் 2026',
      title: 'RO Station Commissioned',
      titleTa: 'குடிநீர் நிலையம் திறப்பு',
      desc: 'Ward 12 water plant is active, serving over 300 families daily.',
      descTa: 'வார்டு 12-ல் புதிய குடிநீர் நிலையம் செயல்பாட்டுக்கு வந்துள்ளது.'
    },
    {
      id: 2,
      date: 'July 2026',
      dateTa: 'ஜூலை 2026',
      title: 'Bazaar Road Re-laid',
      titleTa: 'பஜார் சாலை தார் போடுதல்',
      desc: 'The main market road asphalt paving and drain grading completed successfully.',
      descTa: 'பிரதான பஜார் சாலை தார் அமைக்கும் பணிகள் வெற்றிகரமாக நிறைவுற்றன.'
    },
    {
      id: 3,
      date: 'June 2026',
      dateTa: 'ஜூன் 2026',
      title: 'LED Lights Drive Phase 1',
      titleTa: 'எல்.இ.டி விளக்குகள் முதற்கட்ட பணி',
      desc: '45 Smart LED lamps installed on East Ring Road for pedestrian safety.',
      descTa: 'கிழக்கு வெளிவட்ட சாலையில் 45 புதிய எல்.இ.டி விளக்குகள் பொருத்தப்பட்டன.'
    }
  ];

  return (
    <section className="py-16 bg-white" id="promises">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
            <CheckCircle2 size={13} />
            <span>Serving Kallakurichi Constituency</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            {currentLang === 'ta' ? 'வாக்குறுதிகள் & முன்னேற்றக் கண்காணிப்பு' : 'Promises & Progress Tracker'}
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-xs md:text-sm text-gray-500 font-medium">
            Track real-time progress on key commitments made to the citizens of Kallakurichi.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Progress Cards (7/12 width) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span>{currentLang === 'ta' ? 'முக்கிய திட்டங்களின் நிலை' : 'Key Commitment Status'}</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {promises.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-primary/10 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      {/* Icon & Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color}`}>
                          <Icon size={20} />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          p.progress === 100 
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {currentLang === 'ta' ? p.statusTa : p.status}
                        </span>
                      </div>

                      {/* Content */}
                      <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1 truncate leading-tight">
                        {currentLang === 'ta' ? p.titleTa : p.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-normal mb-4 line-clamp-2">
                        {currentLang === 'ta' ? p.descriptionTa : p.description}
                      </p>
                    </div>

                    {/* Progress Bar Area */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                        <span className="text-[10px] md:text-xs font-medium text-gray-400">{p.stats}</span>
                        <span className="font-bold text-primary">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200/70 h-2 rounded-full overflow-hidden">
                        <div className={`${p.barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Timeline (5/12 width) */}
          <div className="lg:col-span-5 bg-gray-50/50 border border-gray-100 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-8">
              {currentLang === 'ta' ? 'சமீபத்திய மைல்கற்கள்' : 'Constituency Timeline'}
            </h3>

            {/* Timeline Vertical Stack */}
            <div className="relative border-l border-primary/20 ml-2.5 pl-6 space-y-8">
              {milestones.map((m) => (
                <div key={m.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-4 border-white shadow-sm transition-transform group-hover:scale-125 duration-200"></div>
                  
                  {/* Timeline Content */}
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                      {currentLang === 'ta' ? m.dateTa : m.date}
                    </span>
                    <h4 className="font-bold text-sm md:text-base text-gray-900 leading-tight mb-1">
                      {currentLang === 'ta' ? m.titleTa : m.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {currentLang === 'ta' ? m.descTa : m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View Full Timeline Button */}
            <div className="mt-8 pt-6 border-t border-gray-200/50 flex items-center justify-between text-xs md:text-sm font-bold text-primary cursor-pointer hover:underline">
              <span>{currentLang === 'ta' ? 'முழு காலவரிசையைப் பார்க்க' : 'View Full Timeline'}</span>
              <ArrowUpRight size={16} />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PromiseTracker;
