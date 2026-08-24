import { useState, useEffect } from 'react';
import { 
  Search, Filter, Clock, CheckCircle2, AlertTriangle, X, Check, Eye, MapPin, Phone, Mail, Calendar, CalendarCheck, Trash2, Edit3, Sparkles
} from 'lucide-react';
import DateTimePickerInput from '../components/DateTimePickerInput';
import { api } from '../../services/api';

export const Appointments = ({
  appointments = [],
  currentUser,
  onUpdateStatus,
  onSaveRemarks,
  onAssignTimeSlot,
  onDeleteAppointment
}) => {
  const [localAppts, setLocalAppts] = useState(appointments);

  useEffect(() => {
    setLocalAppts(appointments);
  }, [appointments]);

  useEffect(() => {
    if (localAppts.length === 0) {
      api.getAppointments([]).then(res => {
        if (res && res.length) setLocalAppts(res);
      });
    }
  }, []);

  const displayAppts = localAppts.length ? localAppts : appointments;

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('ALL');
  const [editingRemarksId, setEditingRemarksId] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [activeModalAppt, setActiveModalAppt] = useState(null);
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  // Per-appointment slot state
  const [slotStates, setSlotStates] = useState({});

  // Taluks list for filter
  const taluks = ['ALL', ...new Set(displayAppts.map(a => a.taluk).filter(Boolean))];

  const filtered = displayAppts.filter(a => {
    const statusMatch = filterStatus === 'ALL' || (a.status || 'PENDING').toUpperCase() === filterStatus;
    const talukMatch = selectedTaluk === 'ALL' || a.taluk === selectedTaluk;
    const q = searchQuery.toLowerCase().trim();
    const searchMatch = !q || 
      (a.name || '').toLowerCase().includes(q) ||
      (a.mobile || a.phone || '').includes(q) ||
      (a.id || '').toLowerCase().includes(q) ||
      (a.village || '').toLowerCase().includes(q);
    return statusMatch && talukMatch && searchMatch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Responsive Filter Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Mobile Dropdown Status Filter */}
          <div className="md:hidden flex items-center justify-between gap-3 w-full">
            <span className="text-[11px] font-black text-gray-600 uppercase tracking-wider flex-shrink-0">Filter Status:</span>
            <div className="relative flex-1 max-w-[220px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 px-4 py-2.5 rounded-2xl border-2 border-gray-200 text-xs font-black text-gray-900 bg-gray-50/80 shadow-xs focus:outline-none focus:border-[#800000] focus:bg-white transition cursor-pointer"
              >
                {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((st) => (
                  <option key={st} value={st}>
                    {st} ({appointments.filter(a => st === 'ALL' || (a.status || 'PENDING').toUpperCase() === st).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Status Button Tabs */}
          <div className="hidden md:inline-flex p-1.5 rounded-2xl bg-gray-100 border border-gray-200">
            {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {st} ({appointments.filter(a => st === 'ALL' || (a.status || 'PENDING').toUpperCase() === st).length})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Mobile, Village, ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#800000]"
            />
          </div>
        </div>

        {/* Sub Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Taluk:</span>
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              className="h-10 px-3 py-1.5 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-800 bg-white focus:outline-none focus:border-[#800000] cursor-pointer"
            >
              {taluks.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-gray-400 text-[11px] sm:text-xs">Showing {filtered.length} of {appointments.length} records</span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-12 text-center border border-gray-200/80 shadow-xs">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm sm:text-base font-bold text-gray-700">No appointments found</h4>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filtered.map((apt) => {
            const statusUpper = (apt.status || 'PENDING').toUpperCase();
            const curSlot = slotStates[apt.id] || apt.timeSlot || '';
            const isSlotReady = Boolean(curSlot && curSlot.trim());

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Header Row: ID, Status Badge, and Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-[#800000] text-[#FFCC00] font-mono font-bold text-xs tracking-wider">
                      {apt.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                      statusUpper === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      statusUpper === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      statusUpper === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {statusUpper}
                    </span>
                  </div>

                  {/* Status Action Buttons with Strict Approval Rule */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Approve Button (Enabled ONLY when Date & Time are chosen) */}
                    <button
                      disabled={!isSlotReady}
                      onClick={() => {
                        if (isSlotReady) {
                          onUpdateStatus(apt.id, 'APPROVED', curSlot);
                        }
                      }}
                      title={isSlotReady ? 'Approve appointment with selected Date & Time slot' : 'Please select Date & Time slot below first'}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 ${
                        isSlotReady
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 cursor-pointer ring-2 ring-emerald-400/30'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{statusUpper === 'APPROVED' ? 'Approved' : 'Approve'}</span>
                    </button>

                    {/* Complete Button */}
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'COMPLETED')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    {/* View Details */}
                    <button
                      onClick={() => setActiveModalAppt(apt)}
                      className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Delete Record (Super Admin Only) */}
                    {isSuperAdmin && onDeleteAppointment && (
                      <button
                        onClick={() => onDeleteAppointment(apt.id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  {/* Citizen Info */}
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Citizen</span>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">{apt.name}</p>
                    <p className="text-gray-500 font-semibold flex items-center space-x-1 mt-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{apt.mobile || apt.phone || 'N/A'}</span>
                    </p>
                  </div>

                  {/* Location & Preferred Date */}
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Location & Citizen Preferred Date</span>
                    <p className="font-bold text-gray-800 mt-0.5">{apt.village || apt.taluk || 'Kallakurichi'}</p>
                    <p className="text-gray-500 font-semibold flex items-center space-x-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Requested: {apt.preferredDate || apt.date || 'Flexible'}</span>
                    </p>
                  </div>

                  {/* Status Tip */}
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Appointment Status</span>
                    <div className="mt-1 flex items-center space-x-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        statusUpper === 'APPROVED' ? 'bg-emerald-500 animate-pulse' :
                        statusUpper === 'COMPLETED' ? 'bg-blue-500' :
                        statusUpper === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      <span className="font-bold text-gray-800 text-xs">
                        {statusUpper === 'APPROVED' ? 'Confirmed & Scheduled' :
                         statusUpper === 'COMPLETED' ? 'Completed & Attended' :
                         statusUpper === 'REJECTED' ? 'Rejected' : 'Awaiting Date & Time Slot'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Unified Date & Time Picker Section */}
                <div className="bg-amber-50/40 rounded-2xl p-3.5 sm:p-4 border border-amber-200/60 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <CalendarCheck className="w-4 h-4 text-[#800000]" />
                      <span className="text-xs font-black text-gray-900 uppercase tracking-wide">
                        Allotted Starting Time (தேதி & நேரம்):
                      </span>
                    </div>
                    {apt.timeSlot ? (
                      <span className="px-2.5 py-0.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center space-x-1 self-start sm:self-auto">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>{apt.timeSlot}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200 self-start sm:self-auto">
                        Select to Enable Approve
                      </span>
                    )}
                  </div>

                  {/* Single Unified DateTimePickerInput */}
                  <div className="max-w-md">
                    <DateTimePickerInput
                      disablePast={true}
                      value={curSlot}
                      placeholder="Select Date & 12-Hr Time (e.g. 23/08/2026, 10:30 AM)"
                      onChange={(newSlot) => {
                        setSlotStates(prev => ({ ...prev, [apt.id]: newSlot }));
                        if (onAssignTimeSlot) {
                          onAssignTimeSlot(apt.id, newSlot);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Purpose & Admin Remarks */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Purpose / Grievance</span>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50 p-2.5 sm:p-3 rounded-xl mt-1">
                      {apt.purpose || apt.reason || 'No description provided.'}
                    </p>
                  </div>

                  {editingRemarksId === apt.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={remarksInput}
                        onChange={(e) => setRemarksInput(e.target.value)}
                        placeholder="Add official admin remarks / instructions..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingRemarksId(null)}
                          className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (onSaveRemarks) onSaveRemarks(apt.id, remarksInput);
                            setEditingRemarksId(null);
                          }}
                          className="px-3 py-1 rounded-lg bg-gray-900 text-white text-xs font-bold cursor-pointer"
                        >
                          Save Remarks
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <p className="text-gray-500 font-medium truncate">
                        <span className="font-bold text-gray-700">Remarks: </span>
                        {apt.adminRemarks || 'No remarks added yet.'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingRemarksId(apt.id);
                          setRemarksInput(apt.adminRemarks || '');
                        }}
                        className="text-[10px] font-extrabold text-[#800000] hover:underline ml-2 flex-shrink-0 cursor-pointer"
                      >
                        {apt.adminRemarks ? 'Edit' : '+ Add Remarks'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Details Modal */}
      {activeModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reference ID</span>
                <h3 className="text-lg font-black text-[#800000] font-mono">{activeModalAppt.id}</h3>
              </div>
              <button
                onClick={() => setActiveModalAppt(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-left">
              <div><span className="font-bold text-gray-500">Name:</span> <span className="font-bold text-gray-900">{activeModalAppt.name}</span></div>
              <div><span className="font-bold text-gray-500">Phone:</span> <span className="font-semibold text-gray-800">{activeModalAppt.mobile || activeModalAppt.phone}</span></div>
              <div><span className="font-bold text-gray-500">Email:</span> <span className="font-semibold text-gray-800">{activeModalAppt.email || 'N/A'}</span></div>
              <div><span className="font-bold text-gray-500">Taluk / Village:</span> <span className="font-semibold text-gray-800">{activeModalAppt.taluk}, {activeModalAppt.village}</span></div>
              <div><span className="font-bold text-gray-500">Preferred Date:</span> <span className="font-semibold text-gray-800">{activeModalAppt.preferredDate || activeModalAppt.date || 'Flexible'}</span></div>
              <div><span className="font-bold text-gray-500">Assigned Slot:</span> <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">{activeModalAppt.timeSlot || 'Not Assigned Yet'}</span></div>
              <div><span className="font-bold text-gray-500">Full Address:</span> <p className="mt-1 bg-gray-50 p-2.5 rounded-xl font-medium text-gray-700">{activeModalAppt.fullAddress || activeModalAppt.address}</p></div>
              <div><span className="font-bold text-gray-500">Purpose:</span> <p className="mt-1 bg-gray-50 p-2.5 rounded-xl font-medium text-gray-700">{activeModalAppt.purpose || activeModalAppt.reason}</p></div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
              <button
                onClick={() => setActiveModalAppt(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
