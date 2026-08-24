import React, { useState, useEffect, memo } from 'react';
import { ExternalLink, Star, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { getCurrentLanguage } from '../utils/lang';

// Exact Official Instagram Embed Card Component (Preserves Native Dynamic Account Avatar, Username & View Profile)
const InstagramEmbedCard = memo(({ post }) => {
  const rawUrl = (post.postUrl || post.tweetUrl || '').trim();
  
  // Extract canonical embed URL (without /captioned/ to avoid long multi-line text walls)
  let embedUrl = '';
  const match = rawUrl.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (match && match[1] && match[2]) {
    const type = match[1].toLowerCase();
    const code = match[2];
    embedUrl = `https://www.instagram.com/${type}/${code}/embed/`;
  } else if (rawUrl.includes('instagram.com')) {
    embedUrl = `${rawUrl.split('?')[0].replace(/\/$/, '')}/embed/`;
  }

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="w-full shrink-0 flex justify-center overflow-hidden rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-all p-1">
      <iframe
        src={embedUrl}
        className="w-full rounded-2xl border-0 bg-white"
        style={{
          width: '100%',
          maxWidth: '380px',
          minHeight: '440px',
          height: '440px',
          overflow: 'hidden'
        }}
        frameBorder="0"
        scrolling="no"
        allowTransparency="true"
        allow="encrypted-media"
        title={`Instagram Post ${post.id}`}
        loading="eager"
      />
    </div>
  );
});

InstagramEmbedCard.displayName = 'InstagramEmbedCard';

// Helper to ensure enough items in each group for a seamless infinite scroll
const prepareMarqueeGroup = (items) => {
  if (!items || items.length === 0) return [];
  if (items.length >= 3) return items;
  if (items.length === 2) return [...items, ...items];
  return [...items, ...items, ...items];
};

const SocialMedia = () => {
  const currentLang = getCurrentLanguage();
  const isTa = currentLang === 'ta';

  // Social Profiles State
  const [profiles, setProfiles] = useState({
    xProfileLink: 'https://x.com/TVKVijayHQ',
    instagramProfileLink: 'https://instagram.com/tvkvijayhq',
    motivationalQuoteEn: 'Stay empowered with real-time public updates, official announcements, and grassroots developmental news by following our official social media handles!',
    motivationalQuoteTa: 'உண்மையான மக்கள் சேவை உணர்வோடு செயல்படும் நமது இயக்கத்தின் நேரடி செய்திகளையும் அறிவிப்புகளையும் அதிகாரப்பூர்வ சமூக வலைதளப் பக்கங்களில் தொடர்ந்து உடனுக்குடன் தெரிந்துகொள்ள பின்பற்றுங்கள்!'
  });

  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    // Fetch live profiles and posts
    api.getSocialProfiles(profiles).then(res => {
      if (res && typeof res === 'object') {
        setProfiles(prev => ({
          ...prev,
          xProfileLink: res.xProfileLink || (res.leaderProfileLink?.includes('x.com') ? res.leaderProfileLink : prev.xProfileLink),
          instagramProfileLink: res.instagramProfileLink || (res.partyProfileLink?.includes('instagram.com') ? res.partyProfileLink : 'https://instagram.com/tvkvijayhq'),
          motivationalQuoteEn: res.motivationalQuoteEn || prev.motivationalQuoteEn,
          motivationalQuoteTa: res.motivationalQuoteTa || prev.motivationalQuoteTa
        }));
      }
    });

    api.getSocialPosts([]).then(res => {
      if (Array.isArray(res)) {
        setAllPosts(res);
      }
    });
  }, []);

  // Process official X (Twitter) widgets
  useEffect(() => {
    const loadTwitterWidget = () => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    };

    loadTwitterWidget();
    const t1 = setTimeout(loadTwitterWidget, 600);
    const t2 = setTimeout(loadTwitterWidget, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [allPosts]);

  const xPosts = allPosts.filter(p => {
    const url = p.postUrl || p.tweetUrl || '';
    if (url.includes('instagram.com')) return false;
    return p.platform === 'x' || url.includes('x.com') || url.includes('twitter.com') || (!p.platform && !url.includes('instagram.com'));
  });

  const instagramPosts = allPosts.filter(p => {
    const url = p.postUrl || p.tweetUrl || '';
    if (url.includes('x.com') || url.includes('twitter.com')) return false;
    return p.platform === 'instagram' || url.includes('instagram.com');
  });

  const xGroupItems = prepareMarqueeGroup(xPosts);
  const instaGroupItems = prepareMarqueeGroup(instagramPosts);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden relative" id="social-media">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-gray-900 text-xs font-black uppercase tracking-widest mb-3 select-none">
            <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
              <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
            </svg>
            <span>{isTa ? 'நேரலை சமூக ஊடகப் பதிவுகள்' : 'Live Social Media Feeds'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {isTa ? 'சமூக ஊடகப் பதிவுகள்' : 'Social Media Feeds'}
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-primary via-[#FFCC00] to-primary mx-auto mt-4 rounded-full"></div>
          <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
            {isTa 
              ? 'கழகத்தின் அதிகாரப்பூர்வ எக்ஸ் (ட்விட்டர்) மற்றும் இன்ஸ்டாகிராம் நேரடிப் பதிவுகள்.' 
              : 'Real-time live updates streaming directly from official X (Twitter) & Instagram channels.'}
          </p>
        </div>

        {/* 2-Column Side-by-Side Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
          
          {/* LEFT CARD: X (TWITTER) FEED */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-md flex flex-col justify-between overflow-hidden">
            
            {/* Card Header */}
            <div className="bg-black text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-between shadow-md mb-4 notranslate">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
                  <svg viewBox="0 0 512 512" width="14" height="14" fill="currentColor">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                  </svg>
                </div>
                <span className="text-base font-black tracking-wide">X</span>
              </div>

              <a 
                href={profiles.xProfileLink || 'https://x.com/TVKVijayHQ'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-gray-100 text-xs font-black transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <span>{isTa ? 'பார்வையிடு' : 'View on X'}</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Vertical Marquee Window (Bottom to Top - 100% Seamless Infinite Track) */}
            <div className="relative h-[440px] sm:h-[480px] md:h-[500px] overflow-hidden rounded-2xl bg-gray-50/50 border border-gray-100 p-2 flex justify-center marquee-container select-none">
              {/* Top & Bottom Fade Overlays */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none"></div>

              {xPosts.length > 0 ? (
                <div className="w-full max-w-[420px] marquee-track flex flex-col">
                  {/* Group 1 */}
                  <div
                    className="flex flex-col gap-4 marquee-group pb-4"
                    style={{ animationDuration: `${Math.max(16, xGroupItems.length * 8)}s` }}
                  >
                    {xGroupItems.map((tweet, idx) => (
                      <div
                        key={`x-g1-${tweet.id}-${idx}`}
                        className="w-full shrink-0 flex justify-center"
                      >
                        <blockquote
                          className="twitter-tweet"
                          data-theme="light"
                          data-dnt="true"
                          data-align="center"
                        >
                          <a href={tweet.postUrl}>{tweet.postUrl}</a>
                        </blockquote>
                      </div>
                    ))}
                  </div>

                  {/* Group 2 (Exact Duplicate Clone for Continuous Seamless Loop) */}
                  <div
                    className="flex flex-col gap-4 marquee-group pb-4"
                    style={{ animationDuration: `${Math.max(16, xGroupItems.length * 8)}s` }}
                    aria-hidden="true"
                  >
                    {xGroupItems.map((tweet, idx) => (
                      <div
                        key={`x-g2-${tweet.id}-${idx}`}
                        className="w-full shrink-0 flex justify-center"
                      >
                        <blockquote
                          className="twitter-tweet"
                          data-theme="light"
                          data-dnt="true"
                          data-align="center"
                        >
                          <a href={tweet.postUrl}>{tweet.postUrl}</a>
                        </blockquote>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <p className="text-xs text-gray-400 font-bold">
                    {isTa ? 'எக்ஸ் பதிவுகள் எதுவும் இல்லை.' : 'No X posts added yet.'}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT CARD: INSTAGRAM FEED */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-md flex flex-col justify-between overflow-hidden">
            
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-between shadow-md mb-4 notranslate">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <svg viewBox="0 0 448 512" width="15" height="15" fill="currentColor">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                  </svg>
                </div>
                <span className="text-base font-black tracking-wide">Instagram</span>
              </div>

              <a 
                href={profiles.instagramProfileLink || 'https://instagram.com/tvkvijayhq'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-white text-[#dc2743] hover:bg-gray-100 text-xs font-black transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <span>{isTa ? 'பார்வையிடு' : 'View on Instagram'}</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Vertical Marquee Window (Bottom to Top - 100% Seamless Infinite Track) */}
            <div className="relative h-[440px] sm:h-[480px] md:h-[500px] overflow-hidden rounded-2xl bg-gray-50/50 border border-gray-100 p-2 flex justify-center marquee-container select-none">
              {/* Top & Bottom Fade Overlays */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none"></div>

              {instagramPosts.length > 0 ? (
                <div className="w-full max-w-[420px] marquee-track flex flex-col">
                  {/* Group 1 */}
                  <div
                    className="flex flex-col gap-4 marquee-group pb-4"
                    style={{ animationDuration: `${Math.max(16, instaGroupItems.length * 8)}s` }}
                  >
                    {instaGroupItems.map((insta, idx) => (
                      <InstagramEmbedCard key={`insta-g1-${insta.id}-${idx}`} post={insta} />
                    ))}
                  </div>

                  {/* Group 2 (Exact Duplicate Clone for Continuous Seamless Loop) */}
                  <div
                    className="flex flex-col gap-4 marquee-group pb-4"
                    style={{ animationDuration: `${Math.max(16, instaGroupItems.length * 8)}s` }}
                    aria-hidden="true"
                  >
                    {instaGroupItems.map((insta, idx) => (
                      <InstagramEmbedCard key={`insta-g2-${insta.id}-${idx}`} post={insta} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <p className="text-xs text-gray-400 font-bold">
                    {isTa ? 'இன்ஸ்டாகிராம் பதிவுகள் எதுவும் இல்லை.' : 'No Instagram posts added yet.'}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Motivational Quote to follow official pages */}
        <div className="border-t border-gray-200/80 pt-8 max-w-2xl mx-auto space-y-2 text-center select-none">
          <div className="flex justify-center space-x-1 text-[#FFCC00]">
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
          </div>
          <p className="text-xs md:text-sm font-bold text-gray-700 italic leading-relaxed">
            {isTa 
              ? `"${profiles.motivationalQuoteTa || 'உண்மையான மக்கள் சேவை உணர்வோடு செயல்படும் நமது இயக்கத்தின் நேரடி செய்திகளையும் அறிவிப்புகளையும் அதிகாரப்பூர்வ சமூக வலைதளப் பக்கங்களில் தொடர்ந்து உடனுக்குடன் தெரிந்துகொள்ள பின்பற்றுங்கள்!'}"`
              : `"${profiles.motivationalQuoteEn || 'Stay empowered with real-time public updates, official announcements, and grassroots developmental news by following our official social media handles!'}"`}
          </p>
        </div>

      </div>

      {/* 100% Seamless Continuous Infinite Vertical Marquee CSS with Pure Hardware-Accelerated Hover Pause */}
      <style>{`
        @keyframes continuousScrollUp {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-100%);
          }
        }

        .marquee-track {
          height: max-content;
        }

        .marquee-group {
          display: flex;
          flex-direction: column;
          animation: continuousScrollUp linear infinite;
          will-change: transform;
        }

        /* Pure CSS Pause on Hover & Active Touch with ZERO React Re-renders */
        .marquee-container:hover .marquee-group,
        .marquee-container:active .marquee-group {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
};

export default SocialMedia;
