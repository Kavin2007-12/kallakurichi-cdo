import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Copy, Check, Link2 } from 'lucide-react';

const Social = ({
  socialPosts = [],
  currentUser,
  onOpenAddPostModal,
  onDeletePost,
  triggerConfirmDelete
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState('x');
  const [copiedId, setCopiedId] = useState(null);

  const filteredPosts = socialPosts.filter(p => (p.platform || 'x') === activePlatformTab);
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const handleCopyLink = (id, url) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Platform Switcher & Add Post Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 border border-gray-200">
          {/* X Tab */}
          <button
            onClick={() => setActivePlatformTab('x')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 ${
              activePlatformTab === 'x' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
              <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
            </svg>
            <span>X (Twitter) Posts ({socialPosts.filter(p => (p.platform || 'x') === 'x').length})</span>
          </button>

          {/* Instagram Tab */}
          <button
            onClick={() => setActivePlatformTab('instagram')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-2 ${
              activePlatformTab === 'instagram' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <svg viewBox="0 0 448 512" width="13" height="13" fill="currentColor" className="text-[#dc2743]">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
            <span>Instagram Posts ({socialPosts.filter(p => (p.platform || 'x') === 'instagram').length})</span>
          </button>
        </div>

        <button
          onClick={() => onOpenAddPostModal(activePlatformTab)}
          className={`inline-flex items-center space-x-2 px-5 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition cursor-pointer ${
            activePlatformTab === 'x'
              ? 'bg-black hover:bg-gray-900 shadow-black/20'
              : 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 shadow-pink-500/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add {activePlatformTab === 'x' ? 'X (Twitter)' : 'Instagram'} Post</span>
        </button>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    activePlatformTab === 'x' ? 'bg-black' : 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
                  }`}>
                    {activePlatformTab === 'x' ? (
                      <svg viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                      {activePlatformTab === 'x' ? 'X (Twitter) Feed' : 'Instagram Reel / Post'}
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      ID: #{post.id}
                    </span>
                  </div>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => triggerConfirmDelete ? triggerConfirmDelete(() => onDeletePost(post.id), 'Delete Social Post', 'Are you sure you want to remove this post from the public marquee?') : onDeletePost(post.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* URL preview box */}
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                  <span className="flex items-center gap-1.5 truncate">
                    <Link2 size={13} className="shrink-0 text-gray-400" />
                    <span className="truncate">{post.postUrl || post.tweetUrl}</span>
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-gray-200/60">
                  <button
                    onClick={() => handleCopyLink(post.id, post.postUrl || post.tweetUrl)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 text-[10px] font-bold transition cursor-pointer shadow-2xs"
                  >
                    {copiedId === post.id ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={post.postUrl || post.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 text-[10px] font-bold transition cursor-pointer shadow-2xs"
                  >
                    <span>Visit Post</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 pt-1">
                <span>Auto-Marquee: Active</span>
                <span>{post.createdAt || 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Link2 size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-800">No {activePlatformTab === 'x' ? 'X (Twitter)' : 'Instagram'} posts added yet</h4>
            <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto mt-1">
              Click &quot;Add {activePlatformTab === 'x' ? 'X (Twitter)' : 'Instagram'} Post&quot; above to embed direct post links into the public marquee.
            </p>
          </div>
          <button
            onClick={() => onOpenAddPostModal(activePlatformTab)}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activePlatformTab === 'x' ? 'bg-black hover:bg-gray-900' : 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add First Post</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Social;
