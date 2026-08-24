import { useState, useEffect } from 'react';
import { 
  Users, Clock, Newspaper, Briefcase, Calendar, Sliders, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

export const Dashboard = ({ 
  appointments = [], 
  volunteers = [], 
  liveNews = [], 
  dailyUpdates = [], 
  events = [], 
  heroSlides = [],
  currentUser,
  setActiveTab 
}) => {
  const [localAppts, setLocalAppts] = useState(appointments);
  const [localVols, setLocalVols] = useState(volunteers);
  const [localNews, setLocalNews] = useState(liveNews);
  const [localDaily, setLocalDaily] = useState(dailyUpdates);
  const [localHero, setLocalHero] = useState(heroSlides);

  useEffect(() => {
    setLocalAppts(appointments);
  }, [appointments]);

  useEffect(() => {
    setLocalVols(volunteers);
  }, [volunteers]);

  useEffect(() => {
    setLocalNews(liveNews);
  }, [liveNews]);

  useEffect(() => {
    setLocalDaily(dailyUpdates);
  }, [dailyUpdates]);

  useEffect(() => {
    setLocalHero(heroSlides);
  }, [heroSlides]);

  useEffect(() => {
    if (localAppts.length === 0) {
      api.getAppointments([]).then(res => { if (res && res.length) setLocalAppts(res); });
    }
    if (localVols.length === 0) {
      api.getVolunteers([]).then(res => { if (res && res.length) setLocalVols(res); });
    }
    if (localNews.length === 0) {
      api.getLiveNews([]).then(res => { if (res && res.length) setLocalNews(res); });
    }
    if (localDaily.length === 0) {
      api.getDailyUpdates([]).then(res => { if (res && res.length) setLocalDaily(res); });
    }
    if (localHero.length === 0) {
      api.getHeroSlides([]).then(res => { if (res && res.length) setLocalHero(res); });
    }
  }, []);

  const displayAppts = localAppts.length ? localAppts : appointments;
  const displayVols = localVols.length ? localVols : volunteers;
  const displayNews = localNews.length ? localNews : liveNews;
  const displayDaily = localDaily.length ? localDaily : dailyUpdates;
  const displayHero = localHero.length ? localHero : heroSlides;

  const pendingAppointments = displayAppts.filter(a => (a.status || 'PENDING').toUpperCase() === 'PENDING').length;
  const pendingVolunteers = displayVols.filter(v => (v.status || 'PENDING').toUpperCase() === 'PENDING').length;

  const stats = [
    { title: 'Appointments', count: displayAppts.length, sub: `${pendingAppointments} Pending`, icon: Clock, color: 'from-[#800000] to-[#990000]', tab: 'appointments' },
    { title: 'Volunteers', count: displayVols.length, sub: `${pendingVolunteers} Pending`, icon: Users, color: 'from-[#059669] to-[#047857]', tab: 'volunteers' },
    { title: 'Live News', count: displayNews.length, sub: 'Media Releases', icon: Newspaper, color: 'from-[#D97706] to-[#B45309]', tab: 'news' },
    { title: 'Completed Works', count: displayDaily.length, sub: 'Daily Updates', icon: Briefcase, color: 'from-[#800000] to-[#600000]', tab: 'daily' },
    { title: 'Hero Banners', count: displayHero.length, sub: 'Active Slides', icon: Sliders, color: 'from-[#CA8A04] to-[#A16207]', tab: 'banners' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* TVK Flag Vibrant Banner (Pure Red #800000 & Gold #FFCC00, No Muddy Black) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#800000] via-[#940000] to-[#800000] p-5 sm:p-8 md:p-10 text-white shadow-xl border-2 border-[#FFCC00]/40">
        <div className="relative z-10 max-w-2xl text-left space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFCC00]/20 border border-[#FFCC00]/50 text-[#FFCC00] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFCC00]" />
            <span>Digital Constituency Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            Welcome back, <span className="text-[#FFCC00]">{currentUser?.username || 'Admin'}</span>!
          </h2>
          <p className="text-white/90 text-xs sm:text-sm font-semibold leading-relaxed pt-1">
            Manage citizen grievances, review volunteer registrations, coordinate public appointments, and update constituency development works in real time.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(item.tab)}
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-[#FFCC00] transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-extrabold text-gray-400 group-hover:text-[#800000] transition flex items-center space-x-1">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{item.count}</h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{item.title}</p>
              <span className="inline-block mt-2 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-yellow-50 text-[#800000] border border-yellow-200">
                {item.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-gray-200/80 shadow-xs text-left">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <h3 className="text-sm sm:text-base font-black text-gray-900">Quick Constituency Actions</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('news')}
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/40 hover:bg-amber-50 border border-amber-100 hover:border-amber-300 text-left transition cursor-pointer group"
          >
            <Newspaper className="w-5 h-5 text-[#800000] mb-1.5" />
            <p className="text-xs font-bold text-gray-900 group-hover:text-[#800000]">Publish News</p>
            <p className="text-[10px] text-gray-500 font-semibold">Post a media release</p>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-300 text-left transition cursor-pointer group"
          >
            <Briefcase className="w-5 h-5 text-emerald-700 mb-1.5" />
            <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700">Add Daily Work</p>
            <p className="text-[10px] text-gray-500 font-semibold">Log road/water work</p>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50/40 hover:bg-red-50 border border-red-100 hover:border-red-300 text-left transition cursor-pointer group"
          >
            <Clock className="w-5 h-5 text-[#800000] mb-1.5" />
            <p className="text-xs font-bold text-gray-900 group-hover:text-[#800000]">Appointments</p>
            <p className="text-[10px] text-gray-500 font-semibold">Review & assign slots</p>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-yellow-50/40 hover:bg-yellow-50 border border-yellow-100 hover:border-yellow-300 text-left transition cursor-pointer group"
          >
            <Sliders className="w-5 h-5 text-[#B45309] mb-1.5" />
            <p className="text-xs font-bold text-gray-900 group-hover:text-[#B45309]">Banners</p>
            <p className="text-[10px] text-gray-500 font-semibold">Update hero slides</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
