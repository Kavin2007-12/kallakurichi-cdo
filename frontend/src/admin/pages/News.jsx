import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Newspaper, Calendar, User } from 'lucide-react';
import { api } from '../../services/api';

export const News = ({
  liveNews = [],
  currentUser,
  onOpenAddNewsModal,
  onEditNews,
  onDeleteNews,
  triggerConfirmDelete
}) => {
  const [localNews, setLocalNews] = useState(liveNews);

  useEffect(() => {
    setLocalNews(liveNews);
  }, [liveNews]);

  useEffect(() => {
    if (localNews.length === 0) {
      api.getLiveNews([]).then(res => {
        if (res && res.length) setLocalNews(res);
      });
    }
  }, []);

  const displayNews = localNews.length ? localNews : liveNews;
  const isSuperAdmin = currentUser?.role === 'Super Admin';
  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Live News & Media Releases</h2>
          <p className="text-xs font-semibold text-gray-500">Publish announcements, press releases, and constituency development news.</p>
        </div>
        <button
          onClick={onOpenAddNewsModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish News</span>
        </button>
      </div>

      {displayNews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center space-y-4">
          <Newspaper size={48} className="text-gray-300 mx-auto" />
          <h3 className="text-base font-black text-gray-800">No News Announcements Published</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Click below to publish your first constituency press release or news update with high-res photos.
          </p>
          <button
            onClick={onOpenAddNewsModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNews.map((news) => (
            <div key={news.id} className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                {news.image && (
                  <div className="relative aspect-video bg-gray-100">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                      {news.category || 'NEWS'}
                    </span>
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>{news.date || 'Recent'}</span>
                    <span>•</span>
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span className="truncate">{(news.author && news.author !== 'TVK Youth Wing' && news.author !== 'TVK Media & Press Cell' && news.author !== 'TVK Media') ? news.author : "Desk of Hon'ble MLA Mr. C. Arul Vignesh"}</span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 leading-snug line-clamp-2">{news.title}</h4>
                  {news.content && (
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-medium">{news.content}</p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-2">
                <button
                  onClick={() => onEditNews && onEditNews(news)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-gray-700 hover:bg-gray-100 text-xs font-extrabold transition cursor-pointer border border-gray-200 bg-white shadow-2xs"
                  title="Edit this news article"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                  <span>Edit</span>
                </button>
                {isSuperAdmin && onDeleteNews && (
                  <button
                    onClick={() => triggerConfirmDelete({
                      title: 'Delete News Article',
                      message: `Are you sure you want to delete "${news.title}"?`,
                      onConfirm: () => onDeleteNews(news.id)
                    })}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-extrabold transition cursor-pointer border border-red-200 bg-white shadow-2xs"
                    title="Delete this news article"
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

export default News;
