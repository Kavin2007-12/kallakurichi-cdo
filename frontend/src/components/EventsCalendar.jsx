import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Check, X, ShieldCheck } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const EventsCalendar = () => {
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpWard, setRsvpWard] = useState('1');
  const [confirmedTickets, setConfirmedTickets] = useState({});

  const currentLang = getCurrentLanguage();
  const isTa = currentLang === 'ta';

  // Default event list
  const defaultEvents = [
    {
      id: 1,
      title: 'Anna Nagar Grievance Redressal Town Hall',
      description: 'Direct town hall meeting with local representatives and officials to file public grievances and inspect ward requirements.',
      date: 'Aug 18, 2026',
      time: '10:00 AM - 01:00 PM',
      venue: 'Constituency Main Office, Near Central Park',
      attendees: 142,
      category: 'Grievance'
    },
    {
      id: 2,
      title: 'Welfare Scheme Distribution Drive',
      description: 'Constituency welfare drive distributing educational scholarships, senior citizen aids, and self-employment packages.',
      date: 'Aug 21, 2026',
      time: '11:00 AM - 02:00 PM',
      venue: 'Chinnasalem Community Hall',
      attendees: 285,
      category: 'Welfare'
    },
    {
      id: 3,
      title: 'Ward 5 Tree Plantation & Green City Drive',
      description: 'Community green initiative aiming to plant 1,000 native tree saplings around the playground. Free saplings for residents.',
      date: 'Aug 25, 2026',
      time: '08:00 AM - 12:00 PM',
      venue: 'Kaveri Nagar Public Playground',
      attendees: 98,
      category: 'Environment'
    }
  ];

  const [events, setEvents] = useState(defaultEvents);

  useEffect(() => {
    import('../services/api').then(({ api }) => {
      api.getEvents(defaultEvents).then(setEvents);
    });
  }, []);

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpPhone.trim()) return;

    const eventId = rsvpEvent.id;
    const ticketId = `CDO-EV-${eventId}-${Math.floor(1000 + Math.random() * 9000)}`;

    import('../services/api').then(({ api }) => {
      api.registerRsvp(eventId).then(() => {
        setEvents(prev => prev.map(ev => {
          if (ev.id === eventId) {
            return { ...ev, attendees: (ev.attendees || 0) + 1 };
          }
          return ev;
        }));
      });
    });

    setConfirmedTickets(prev => ({
      ...prev,
      [eventId]: {
        ticketId,
        name: rsvpName,
        phone: rsvpPhone,
        ward: rsvpWard
      }
    }));

    setRsvpEvent(null);
    setRsvpName('');
    setRsvpPhone('');
    setRsvpWard('1');
  };

  return (
    <section id="events" className="py-20 bg-gray-50/50 border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Heading */}
        <div className="mb-14">
          <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/5 px-4 py-1.5 rounded-full">
            {isTa ? 'பொதுக் கூட்டங்கள்' : 'Public Meetings'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
            {isTa ? 'நிகழ்வுகள் காலண்டர்' : 'Upcoming Meetings & Events'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold max-w-xl mx-auto mt-3">
            {isTa 
              ? 'சட்டமன்ற உறுப்பினர் பங்கேற்கும் மக்கள் தொடர்பு கூட்டங்கள் மற்றும் சிறப்பு முகாம்களின் கால அட்டவணை.'
              : 'Schedule of upcoming interactive town halls, public grievances camps, and social drives involving the MLA.'}
          </p>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((ev) => {
            const ticket = confirmedTickets[ev.id];
            return (
              <div 
                key={ev.id}
                className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                
                {/* Category Badge */}
                <div className="flex justify-between items-start">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    ev.category === 'Grievance' 
                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                      : ev.category === 'Welfare'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {ev.category}
                  </span>
                </div>

                <div className="text-left mt-4 select-text">
                  {/* Date Block */}
                  <div className="text-primary font-black text-sm uppercase tracking-widest mb-3 flex items-center">
                    <Calendar size={14} className="mr-1.5" />
                    <span>{ev.date}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors duration-200 mb-3">
                    {ev.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-semibold mb-6">
                    {ev.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-gray-200/60 text-xs text-gray-600 font-semibold">
                    <div className="flex items-center">
                      <Clock size={13} className="text-primary/70 shrink-0 mr-2.5" />
                      <span>{ev.time}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin size={13} className="text-primary/70 shrink-0 mr-2.5 mt-0.5" />
                      <span className="line-clamp-1">{isTa ? ev.venueTa || ev.venue : ev.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={13} className="text-primary/70 shrink-0 mr-2.5" />
                      <span className="text-gray-900">{ev.attendees} {isTa ? 'பங்கேற்கிறார்கள்' : 'Attending'}</span>
                    </div>
                  </div>
                </div>

                {/* RSVP / Confirmation Area */}
                <div className="mt-8 pt-4">
                  {ticket ? (
                    // Confirmed Ticket Box
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-left select-text flex flex-col space-y-1 relative">
                      <div className="flex items-center space-x-1.5 text-emerald-700 font-extrabold text-xs uppercase tracking-wider mb-1">
                        <ShieldCheck size={14} />
                        <span>RSVP Registered</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600">TICKET: {ticket.ticketId}</span>
                      <span className="text-xs font-bold text-gray-700 truncate mt-0.5">Name: {ticket.name}</span>
                      <span className="text-xs font-bold text-gray-600">Ward: {ticket.ward}</span>
                    </div>
                  ) : (
                    // Action RSVP Button
                    <button
                      onClick={() => setRsvpEvent(ev)}
                      className="w-full bg-primary hover:bg-accent text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-sm hover:shadow active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <span>{isTa ? 'பதிவு செய்க (RSVP)' : 'Register RSVP'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Modal: RSVP Submission Form */}
        {rsvpEvent && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[80] flex items-center justify-center p-4 notranslate">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-scale-up">
              
              {/* Modal Header */}
              <div className="bg-primary text-white p-4 flex items-center justify-between shadow-sm">
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-2">
                  <span>Register Town Hall RSVP</span>
                </h3>
                <button 
                  onClick={() => setRsvpEvent(null)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleRsvpSubmit} className="p-6 space-y-4">
                <div className="text-left text-xs bg-gray-50 border border-gray-150 p-3.5 rounded-xl font-semibold text-gray-600">
                  <span className="font-extrabold text-primary uppercase block mb-1">EVENT DETAILS:</span>
                  <span className="font-bold text-gray-800 text-sm line-clamp-1">{isTa ? rsvpEvent.titleTa || rsvpEvent.title : rsvpEvent.title}</span>
                  <span className="block mt-1">Date: {rsvpEvent.date}</span>
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">Your Full Name</label>
                  <input 
                    type="text" 
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="e.g. Arul Kumar"
                    className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">Ward Number</label>
                  <select 
                    value={rsvpWard}
                    onChange={(e) => setRsvpWard(e.target.value)}
                    className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                      <option key={w} value={w.toString()}>Ward {w}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-accent text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={16} />
                  <span>Confirm Registration</span>
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default EventsCalendar;
