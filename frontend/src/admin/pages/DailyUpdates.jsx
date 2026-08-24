import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, MapPin, Calendar, Briefcase } from 'lucide-react';
import { api } from '../../services/api';

export const DailyUpdates = ({
  dailyUpdates = [],
  currentUser,
  onOpenAddDailyModal,
  onOpenEditDailyModal,
  onDeleteDaily,
  triggerConfirmDelete
}) => {
  const [localDaily, setLocalDaily] = useState(dailyUpdates);

  useEffect(() => {
    setLocalDaily(dailyUpdates);
  }, [dailyUpdates]);

  useEffect(() => {
    if (localDaily.length === 0) {
      api.getDailyUpdates([]).then(res => {
        if (res && res.length) setLocalDaily(res);
      });
    }
  }, []);

  const displayDaily = localDaily.length ? localDaily : dailyUpdates;
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">MLA Daily Works & Field Updates</h2>
          <p className="text-xs font-semibold text-gray-500">Document local inspections, welfare distributions, and daily development activities.</p>
        </div>
        <button
          onClick={onOpenAddDailyModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Daily Work</span>
        </button>
      </div>

      {/* Grid List of Updates */}
      {displayDaily.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center space-y-4">
          <Briefcase size={48} className="text-gray-300 mx-auto" />
          <h3 className="text-base font-black text-gray-800">No Daily Works Logged</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Click below to document constituency road works, sanitation inspections, or water project field updates.
          </p>
          <button
            onClick={onOpenAddDailyModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Daily Work</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDaily.map((work) => (
          <div key={work.id} className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              {work.image && (
                <div className="relative aspect-video bg-gray-100">
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                    {work.category || 'INSPECTION'}
                  </span>
                </div>
              )}
              <div className="p-6 space-y-3">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{work.date || 'Recent'}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span className="truncate">{work.location || 'Kallakurichi'}</span>
                </div>
                <h4 className="text-sm font-black text-gray-900 leading-snug line-clamp-2">{work.title}</h4>
                {work.description && (
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-medium">{work.description}</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <button
                onClick={() => onOpenEditDailyModal && onOpenEditDailyModal(work)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Work</span>
              </button>

              {isSuperAdmin && onDeleteDaily && (
                <button
                  onClick={() => triggerConfirmDelete ? triggerConfirmDelete({
                    title: 'Delete Work Entry',
                    message: `Are you sure you want to delete "${work.title}"?`,
                    onConfirm: () => onDeleteDaily(work.id)
                  }) : onDeleteDaily(work.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-extrabold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default DailyUpdates;
