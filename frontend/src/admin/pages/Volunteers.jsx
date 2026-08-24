import { useState, useEffect } from 'react';
import { 
  Search, Filter, Users, CheckCircle2, AlertTriangle, X, Check, Eye, Phone, Mail, Award, Download, Image as ImageIcon, Plus, Edit3, Trash2
} from 'lucide-react';
import { api } from '../../services/api';

export const Volunteers = ({
  volunteers = [],
  volunteerPhotos = [],
  currentUser,
  onUpdateStatus,
  onSaveRemarks,
  onOpenIdCardModal,
  onOpenAddPhotoModal,
  onOpenEditPhotoModal,
  onDeletePhoto,
  onDeleteVolunteer
}) => {
  const [localVols, setLocalVols] = useState(volunteers);
  const [localPhotos, setLocalPhotos] = useState(volunteerPhotos);

  useEffect(() => {
    setLocalVols(volunteers);
  }, [volunteers]);

  useEffect(() => {
    setLocalPhotos(volunteerPhotos);
  }, [volunteerPhotos]);

  useEffect(() => {
    if (localVols.length === 0) {
      api.getVolunteers([]).then(res => {
        if (res && res.length) setLocalVols(res);
      });
    }
    if (localPhotos.length === 0) {
      api.getVolunteerPhotos([]).then(res => {
        if (res && res.length) setLocalPhotos(res);
      });
    }
  }, []);

  const displayVols = localVols.length ? localVols : volunteers;
  const displayPhotos = localPhotos.length ? localPhotos : volunteerPhotos;

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlood, setSelectedBlood] = useState('ALL');
  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'gallery'
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const filtered = displayVols.filter(v => {
    const statusMatch = filterStatus === 'ALL' || (v.status || 'PENDING').toUpperCase() === filterStatus;
    const bloodMatch = selectedBlood === 'ALL' || (v.bloodGroup || v.blood || '').toUpperCase() === selectedBlood;
    const q = searchQuery.toLowerCase().trim();
    const searchMatch = !q ||
      (v.name || '').toLowerCase().includes(q) ||
      (v.mobile || v.phone || '').includes(q) ||
      (v.id || '').toLowerCase().includes(q) ||
      (v.village || '').toLowerCase().includes(q);
    return statusMatch && bloodMatch && searchMatch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Top Nav Switcher (Responsive Dropdown on Mobile, Tabs on Desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Mobile Sub-Tab Select */}
        <div className="sm:hidden w-full">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full h-11 px-4 py-2.5 rounded-2xl border-2 border-gray-200 text-xs font-black text-gray-900 bg-white shadow-xs focus:outline-none focus:border-[#800000] transition cursor-pointer"
          >
            <option value="members">Registered Volunteers ({volunteers.length})</option>
            <option value="gallery">Field Photos Gallery ({volunteerPhotos.length})</option>
          </select>
        </div>

        {/* Desktop Tab Switcher */}
        <div className="hidden sm:inline-flex p-1.5 rounded-2xl bg-gray-100 border border-gray-200">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              activeTab === 'members' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Registered Volunteers ({volunteers.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              activeTab === 'gallery' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Field Photos Gallery ({volunteerPhotos.length})
          </button>
        </div>

        {activeTab === 'gallery' && onOpenAddPhotoModal && (
          <button
            onClick={onOpenAddPhotoModal}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#540000] hover:from-[#660000] hover:to-[#400000] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#FFCC00]" />
            <span>Upload Photo</span>
          </button>
        )}
      </div>

      {activeTab === 'members' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Filters Bar with Mobile Dropdown */}
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
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                      <option key={st} value={st}>
                        {st} ({volunteers.filter(v => st === 'ALL' || (v.status || 'PENDING').toUpperCase() === st).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Desktop Status Tabs */}
              <div className="hidden md:inline-flex p-1.5 rounded-2xl bg-gray-100 border border-gray-200">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition cursor-pointer ${
                      filterStatus === st ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {st} ({volunteers.filter(v => st === 'ALL' || (v.status || 'PENDING').toUpperCase() === st).length})
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, Mobile, ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#800000]"
                />
              </div>
            </div>

            {/* Sub Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span>Blood Group:</span>
                <select
                  value={selectedBlood}
                  onChange={(e) => setSelectedBlood(e.target.value)}
                  className="h-10 px-3 py-1.5 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-800 bg-white focus:outline-none focus:border-[#800000] cursor-pointer"
                >
                  {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="text-gray-400 text-[11px] sm:text-xs">Showing {filtered.length} of {volunteers.length} members</span>
            </div>
          </div>

          {/* Volunteers Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filtered.map((vol) => {
              const statusUpper = (vol.status || 'PENDING').toUpperCase();
              return (
                <div
                  key={vol.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {vol.image || vol.photo ? (
                        <img src={vol.image || vol.photo} alt={vol.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFCC00] to-[#E5A800] text-[#800000] font-black text-lg flex items-center justify-center flex-shrink-0 shadow-xs">
                          {(vol.name || 'V')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <h4 className="text-sm font-black text-gray-900 truncate">{vol.name}</h4>
                        <span className="text-xs font-mono font-bold text-gray-500 block truncate">{vol.id}</span>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 mt-0.5">
                          <span>Age: {vol.age || vol.Age || '25'}</span>
                          <span>•</span>
                          <span className="text-red-700 font-extrabold">{vol.bloodGroup || vol.blood || 'O+'}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                      statusUpper === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      statusUpper === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {statusUpper}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold">{vol.mobile || vol.phone || 'N/A'}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold truncate">{vol.email || 'N/A'}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium bg-gray-50 p-2.5 rounded-xl">
                      {vol.fullAddress || vol.address || `${vol.village || ''}, ${vol.taluk || ''}`}
                    </p>
                  </div>

                  {/* Actions & ID Card Generation & Delete */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateStatus(vol.id, 'APPROVED')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition ${
                          statusUpper === 'APPROVED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onUpdateStatus(vol.id, 'REJECTED')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition ${
                          statusUpper === 'REJECTED' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 hover:bg-red-100 text-red-700'
                        }`}
                      >
                        Reject
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenIdCardModal && onOpenIdCardModal(vol)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#800000] hover:bg-[#600000] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        title="View Official TVK Volunteer ID Card"
                      >
                        <Award className="w-3.5 h-3.5 text-[#FFCC00]" />
                        <span>ID Card</span>
                      </button>

                      {isSuperAdmin && onDeleteVolunteer && (
                        <button
                          onClick={() => onDeleteVolunteer(vol)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer"
                          title="Permanently Delete Volunteer Record & Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Field Photos Gallery Tab */}
      {activeTab === 'gallery' && (
        <div>
          {displayPhotos.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-gray-900">No Fieldwork Photos Added Yet</h4>
                <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
                  Upload photos of volunteer activities, community drives, and welfare campaigns to showcase on the public volunteer page.
                </p>
              </div>
              {onOpenAddPhotoModal && (
                <button
                  onClick={onOpenAddPhotoModal}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#800000] hover:bg-[#600000] text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#FFCC00]" />
                  <span>Upload First Photo</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-4/3 bg-gray-100 overflow-hidden relative">
                      <img 
                        src={photo.image} 
                        alt={photo.title || 'Field Photo'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="p-4 text-left">
                      <h5 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                        {photo.title || 'Field Activity Photo'}
                      </h5>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="px-4 pb-4 pt-1 flex items-center justify-end space-x-2 border-t border-gray-50">
                    {onOpenEditPhotoModal && (
                      <button
                        onClick={() => onOpenEditPhotoModal(photo)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition cursor-pointer"
                        title="Edit Photo & Title"
                      >
                        <Edit3 className="w-3 h-3 text-gray-600" />
                        <span>Edit</span>
                      </button>
                    )}
                    {isSuperAdmin && onDeletePhoto && (
                      <button
                        onClick={() => onDeletePhoto(photo)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Volunteers;
