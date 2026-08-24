import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, MapPin, Users, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const Events = ({
  events = [],
  currentUser,
  onOpenAddEventModal,
  onDeleteEvent,
  triggerConfirmDelete
}) => {
  const [localEvents, setLocalEvents] = useState(Array.isArray(events) ? events : []);

  useEffect(() => {
    if (Array.isArray(events)) {
      setLocalEvents(events);
    }
  }, [events]);

  useEffect(() => {
    if (!localEvents || localEvents.length === 0) {
      api.getEvents([]).then(res => {
        if (res && Array.isArray(res) && res.length) {
          setLocalEvents(res);
        }
      }).catch(err => console.warn('Failed to fetch events in component:', err));
    }
  }, []);

  const displayEvents = (Array.isArray(localEvents) && localEvents.length) ? localEvents : (Array.isArray(events) ? events : []);
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#800000]" />
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Events & Public Town Halls</h2>
          </div>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Schedule public meetings, grievance redressal town halls, and constituency welfare drives.
          </p>
        </div>
        {onOpenAddEventModal && (
          <button
            onClick={onOpenAddEventModal}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#800000] to-[#540000] hover:from-[#660000] hover:to-[#400000] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/20 transition cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FFCC00]" />
            <span>Schedule New Event</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      {displayEvents.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-12 text-center border border-gray-200/80 shadow-xs space-y-3">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
          <h4 className="text-base font-bold text-gray-700">No Events Scheduled</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Click "Schedule New Event" above to create public town halls and constituency welfare drives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayEvents.map((event) => {
            if (!event) return null;
            return (
              <div 
                key={event.id || Math.random()} 
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-red-50 text-[#800000] text-[10px] font-black uppercase tracking-wider border border-red-100">
                      {event.category || 'Meeting'}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{event.attendees || 0} RSVPs</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-gray-900 leading-snug">{event.title || 'Untitled Event'}</h4>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{event.description || 'No description provided.'}</p>

                  <div className="pt-2 space-y-2 text-xs font-bold text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-[#800000] flex-shrink-0" />
                      <span>{event.date || 'TBA'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#800000] flex-shrink-0" />
                      <span>{event.time || '10:00 AM - 01:00 PM'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#800000] flex-shrink-0" />
                      <span className="truncate">{event.venue || 'Constituency Main Office'}</span>
                    </div>
                  </div>
                </div>

                {isSuperAdmin && onDeleteEvent && (
                  <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => {
                        if (triggerConfirmDelete) {
                          triggerConfirmDelete({
                            title: 'Delete Event',
                            message: `Are you sure you want to delete "${event.title || 'this event'}"?`,
                            onConfirm: () => onDeleteEvent(event.id)
                          });
                        } else {
                          onDeleteEvent(event.id);
                        }
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-extrabold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
