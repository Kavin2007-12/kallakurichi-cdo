import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, User, Share2, ArrowLeft, FileText, Check, Copy,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { createNewsSlug } from '../utils/slug';
import { getCurrentLanguage } from '../utils/lang';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allNews, setAllNews] = useState([]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isTa = getCurrentLanguage() === 'ta';

  useEffect(() => {
    setLoading(true);
    api.getLiveNews([]).then((data) => {
      const list = Array.isArray(data) ? data : [];
      setAllNews(list);
      if (id && list.length > 0) {
        const decodedParam = decodeURIComponent(id).toLowerCase().trim();
        // 1. Match by SEO Title Slug
        let found = list.find((item) => createNewsSlug(item.title, item.id) === decodedParam);
        // 2. Match by exact numerical ID (for backwards compatibility)
        if (!found) {
          found = list.find((item) => String(item.id) === String(id));
        }
        // 3. Match by partial slug
        if (!found) {
          found = list.find((item) => item.title && createNewsSlug(item.title, item.id).includes(decodedParam));
        }
        setArticle(found || null);
      } else if (list.length > 0) {
        setArticle(list[0]);
      } else {
        setArticle(null);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-bold text-sm">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4 max-w-md mx-auto px-4">
            <FileText size={48} className="text-gray-300 mx-auto" />
            <h2 className="text-xl font-black text-gray-800">
              {isTa ? 'செய்தி கட்டுரை கிடைக்கவில்லை' : 'News Article Not Found'}
            </h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {isTa ? 'கோரப்பட்ட செய்தி கட்டுரை நீக்கப்பட்டு இருக்கலாம் அல்லது கிடைக்கவில்லை.' : 'The requested news announcement could not be found.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-accent transition"
            >
              <ArrowLeft size={14} />
              <span>{isTa ? 'முகப்பிற்கு செல்லவும்' : 'Back to Home'}</span>
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = article.title;
  const content = article.content || article.description || '';
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const relatedArticles = allNews.filter((n) => String(n.id) !== String(article.id)).slice(0, 3);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n\nRead full notice on TVK Kallakurichi Portal:\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${title} | TVK Kallakurichi`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-800">
      <Navbar />

      <main className="flex-grow pt-4 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Back Button */}
          <div className="flex items-center justify-end mb-6 pt-2">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary transition shadow-2xs cursor-pointer select-none"
            >
              <ArrowLeft size={14} />
              <span>{isTa ? 'முகப்பிற்கு திரும்பு' : 'Back to Home'}</span>
            </button>
          </div>

          {/* Article Header & Badges */}
          <div className="space-y-4 text-left mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-red-700 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase flex items-center shadow-xs">
                <FileText size={11} className="mr-1.5" />
                {article.category || (isTa ? 'செய்தி வெளியீடு' : 'NEWS MEDIA')}
              </span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} />
                {isTa ? 'அதிகாரப்பூர்வ அறிவிப்பு' : 'OFFICIAL NOTICE'}
              </span>
            </div>

            <h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.18] font-sans text-justify"
              style={{ textAlign: 'justify', textJustify: 'inter-word' }}
            >
              {title}
            </h1>

            {/* Author & Date Meta Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 font-semibold border-y border-gray-150 py-3 select-none">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
                  <User size={12} />
                </div>
                <span className="text-gray-800 font-bold">
                  {(article.author && article.author !== 'TVK Youth Wing' && article.author !== 'TVK Media & Press Cell')
                    ? article.author
                    : (isTa ? 'மாண்புமிகு சட்டமன்ற உறுப்பினர் திரு. சி. அருள் விக்னேஷ் அலுவலகம்' : "Desk of Hon'ble MLA Mr. C. Arul Vignesh")}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-gray-600">
                <Calendar size={14} className="text-primary" />
                <span>{article.date || 'Recent'}</span>
              </div>
            </div>
          </div>

          {/* Big Featured Hero Image Banner */}
          {article.image && (
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-gray-900 mb-8 group aspect-[16/9] max-h-[480px]">
              <img
                src={article.image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Main Article Content & Share Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left Column: Big Content Paragraphs */}
            <div className="lg:col-span-8 space-y-6 text-left">

              {/* Paragraphs with Justify text alignment */}
              <div className="space-y-6 text-gray-800 text-base sm:text-lg leading-relaxed select-text font-normal">
                {paragraphs.length > 0 ? (
                  paragraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-justify leading-relaxed text-gray-800 text-base sm:text-lg"
                      style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                    >
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    {isTa ? 'முழு விவரங்கள் விரைவில் பதிவேற்றப்படும்.' : 'Detailed notice content will be updated shortly.'}
                  </p>
                )}
              </div>

              {/* Article Footnote */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 mt-8 text-xs text-gray-500 leading-relaxed">
                <span className="font-bold text-gray-700 block mb-1">
                  {isTa ? 'அதிகாரப்பூர்வ தகவல் குறிப்பு:' : 'Official Communication Desk:'}
                </span>
                {isTa
                  ? 'இந்த அறிவிப்பு மற்றும் செய்திக் குறிப்பு கள்ளக்குறிச்சி தொகுதி மாண்புமிகு சட்டமன்ற உறுப்பினர் திரு. சி. அருள் விக்னேஷ் அலுவலகத்தினால் அதிகாரப்பூர்வமாக வெளியிடப்பட்டுள்ளது.'
                  : "This public communication and press release is officially verified and distributed by the Desk of Hon'ble MLA Mr. C. Arul Vignesh for Kallakurichi Constituency."}
              </div>

              {/* Bottom Navigation */}
              <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => {
                    navigate('/#news-feed');
                    setTimeout(() => {
                      const el = document.getElementById('news-feed');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="bg-primary hover:bg-accent text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>{isTa ? 'செய்திப் பிரிவுக்குச் செல்லவும்' : 'Back to News Feed'}</span>
                </button>
              </div>

            </div>

            {/* Right Column: Sticky Share & Related News Sidebar */}
            <div className="lg:col-span-4 space-y-6 text-left sticky top-28 self-start">

              {/* Share Box */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <Share2 className="text-primary" size={18} />
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    {isTa ? 'செய்தியைப் பகிரவும்' : 'Share Notice'}
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-4 py-1">
                  {/* Official WhatsApp */}
                  <button
                    onClick={shareOnWhatsApp}
                    className="w-12 h-12 rounded-2xl bg-[#25D366] text-white shadow-md shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title="Share on WhatsApp"
                    aria-label="Share on WhatsApp"
                  >
                    <svg viewBox="0 0 448 512" width="22" height="22" fill="currentColor">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                  </button>

                  {/* Official X */}
                  <button
                    onClick={shareOnTwitter}
                    className="w-12 h-12 rounded-2xl bg-black text-white shadow-md shadow-black/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title="Share on X (Twitter)"
                    aria-label="Share on X (Twitter)"
                  >
                    <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
                      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                    </svg>
                  </button>

                  {/* Official Link / Copy */}
                  <button
                    onClick={handleCopyLink}
                    className={`w-12 h-12 rounded-2xl text-white shadow-md hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 shadow-emerald-600/30'
                        : 'bg-gray-800 hover:bg-gray-900 shadow-gray-800/20'
                    }`}
                    title={copied ? 'Copied to clipboard!' : 'Copy link'}
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <Check size={22} className="text-white" />
                    ) : (
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Related News List */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    {isTa ? 'மற்ற முக்கிய செய்திகள்' : 'Recent Announcements'}
                  </h3>

                  <div className="space-y-4">
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/news/${createNewsSlug(rel.title, rel.id)}`}
                        className="group flex space-x-3 items-center hover:bg-gray-50 p-2 rounded-2xl transition border border-transparent hover:border-gray-150"
                      >
                        {rel.image && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                            <img
                              src={rel.image}
                              alt={rel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <span className="text-[9px] font-black text-primary uppercase block">
                            {rel.date || 'Recent'}
                          </span>
                          <h4 className="text-xs font-bold text-gray-800 group-hover:text-primary transition line-clamp-2 leading-snug">
                            {rel.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
