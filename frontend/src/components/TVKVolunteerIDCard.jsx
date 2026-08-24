import React, { forwardRef } from 'react';
import { MapPin } from 'lucide-react';
import { generateQRCodeSVG } from '../utils/qrcode';
import { getCurrentLanguage } from '../utils/lang';

const TVKVolunteerIDCard = forwardRef(({ vol, scale = 1 }, ref) => {
  if (!vol) return null;

  const volName = vol.name || 'Volunteer Name';
  const volMobile = vol.mobile || vol.phone || '9360248850';
  const volBlood = vol.bloodGroup || vol.bloodgroup || vol.blood_group || vol.blood || 'O+';
  const volAge = vol.age || vol.Age || '24';
  const volDistrict = 'Kallakurichi';
  const volConstituency = vol.constituency || vol.taluk || 'Chinnasalem';
  const volId = vol.id || 'TVK-VOL-0001';
  const volPhoto = vol.image || vol.photo || '/tn_logo.png';

  // Real Scan Verification URL for QR Code (High contrast pure black for instant mobile camera detection)
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://tvkkallakurichi.in';
  const qrVerificationData = `${origin}/verify-volunteer?id=${encodeURIComponent(volId)}`;
  const qrSvgHtml = generateQRCodeSVG(qrVerificationData, 84, '#000000');

  // Detect current site language
  const isTa = getCurrentLanguage() === 'ta';

  const formatDistrict = (d) => {
    if (isTa) {
      return 'கள்ளக்குறிச்சி';
    }
    return 'Kallakurichi';
  };

  const formatConstituency = (c) => {
    const raw = (c || 'Chinnasalem').toString().toLowerCase();
    if (isTa) {
      if (raw.includes('kalla') || raw.includes('கல்ல') || raw.includes('கள்ள')) return 'கள்ளக்குறிச்சி';
      if (raw.includes('chinna') || raw.includes('சின்ன')) return 'சின்னசேலம்';
      if (raw.includes('ulundur') || raw.includes('உளுந்தூர்')) return 'உளுந்தூர்பேட்டை';
      if (raw.includes('rishi') || raw.includes('ரிஷி')) return 'ரிஷிவந்தியம்';
      if (raw.includes('sankara') || raw.includes('சங்கரா')) return 'சங்கராபுரம்';
      return 'சின்னசேலம்';
    }
    if (raw.includes('kalla') || raw.includes('கல்ல') || raw.includes('கள்ள')) return 'Kallakurichi';
    if (raw.includes('chinna') || raw.includes('சின்ன')) return 'Chinnasalem';
    if (raw.includes('ulundur') || raw.includes('உளுந்தூர்')) return 'Ulundurpet';
    if (raw.includes('rishi') || raw.includes('ரிஷி')) return 'Rishivandiyam';
    if (raw.includes('sankara') || raw.includes('சங்கரா')) return 'Sankarapuram';
    return c || 'Chinnasalem';
  };

  const displayDistrict = formatDistrict(volDistrict);
  const displayConstituency = formatConstituency(volConstituency);
  const footerAddress = isTa 
    ? 'கள்ளக்குறிச்சி தொகுதி, தமிழ்நாடு - 606202' 
    : 'Kallakurichi Constituency, Tamil Nadu - 606202';

  return (
    <div
      ref={ref}
      style={{
        width: '680px',
        height: '390px',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        fontFamily: "'Mukta Malar', 'Noto Sans Tamil', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF'
      }}
      className="relative rounded-none overflow-hidden border select-none flex flex-col justify-between shrink-0 text-left notranslate"
      translate="no"
    >
      {/* 1. TOP HEADER BAR */}
      <div 
        style={{
          boxShadow: '0 4px 6px rgba(0,0,0,0.12)',
          backgroundColor: '#680208'
        }}
        className="h-[74px] px-5 flex flex-col items-center justify-center relative shrink-0 pt-0.5"
      >
        {/* Header Title: Tamil Text in Golden Yellow (Centered & Lifted) */}
        <h1
          className="text-[23px] font-black text-[#FCCB06] tracking-wide text-center leading-none mb-1.5"
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            fontFamily: "'Mukta Malar', 'Noto Sans Tamil', sans-serif"
          }}
        >
          தமிழக வெற்றிக் கழகம்
        </h1>
        {/* Subtitle: Volunteer ID Card */}
        <span 
          style={{ color: '#FEF3C7' }}
          className="text-[11px] font-extrabold tracking-[0.2em] uppercase leading-none"
        >
          {isTa ? 'தன்னார்வலர் அடையாள அட்டை' : 'Volunteer ID Card'}
        </span>
      </div>

      {/* 2. CARD BODY */}
      <div className="relative flex-grow px-7 pt-3 pb-1 flex items-start justify-between overflow-hidden">
        {/* Tamil Nadu Map Watermark in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <img
            src="/tvk_map.png"
            alt="TVK Map Watermark"
            className="w-[260px] h-[270px] object-contain opacity-15"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Left Side: Photo Frame shifted down with Big Standalone QR Code directly below */}
        <div 
          className="z-10 flex flex-col items-center shrink-0 relative"
          style={{
            transform: 'translate(8px, 10px)'
          }}
        >
          <div 
            style={{
              borderColor: '#680208',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
            className="w-[118px] h-[126px] border-[2.5px] p-[2.5px] rounded-lg overflow-hidden flex items-center justify-center"
          >
            <img
              src={volPhoto}
              alt={volName}
              className="w-full h-full object-cover rounded-xs"
              onError={(e) => { e.target.src = '/tn_logo.png'; }}
            />
          </div>

          {/* Official Big Standalone QR Code (84px, lowered slightly) */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D1D5DB',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            className="mt-3 p-1 border rounded flex items-center justify-center"
          >
            <div 
              className="w-[84px] h-[84px] flex items-center justify-center shrink-0"
              dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
            />
          </div>
        </div>

        {/* Center: Details Grid shifted further to the right */}
        <div 
          className="z-10 flex-grow text-left relative pl-2"
          style={{
            transform: 'translate(44px, 4px)'
          }}
        >
          <table className="border-collapse">
            <tbody>
              <tr className="leading-normal">
                <td className="py-1.5 text-[13px] font-bold text-[#42221D] whitespace-nowrap">
                  {isTa ? 'பெயர்' : 'Name'}
                </td>
                <td className="py-1.5 px-3 text-[13px] font-bold text-[#42221D]">:</td>
                <td className="py-1.5 text-[15px] font-bold text-[#151515] truncate max-w-[190px]">{volName}</td>
              </tr>
              <tr className="leading-normal">
                <td className="py-1.5 text-[13px] font-bold text-[#42221D] whitespace-nowrap">
                  {isTa ? 'இரத்த வகை / வயது' : 'Blood Group / Age'}
                </td>
                <td className="py-1.5 px-3 text-[13px] font-bold text-[#42221D]">:</td>
                <td className="py-1.5 text-[15px] font-bold text-[#151515]">
                  {volBlood} / {volAge ? `${volAge} ${isTa ? 'ஆண்டுகள்' : 'Yrs'}` : 'N/A'}
                </td>
              </tr>
              <tr className="leading-normal">
                <td className="py-1.5 text-[13px] font-bold text-[#42221D] whitespace-nowrap">
                  {isTa ? 'மாவட்டம்' : 'District'}
                </td>
                <td className="py-1.5 px-3 text-[13px] font-bold text-[#42221D]">:</td>
                <td className="py-1.5 text-[15px] font-bold text-[#151515]">{displayDistrict}</td>
              </tr>
              <tr className="leading-normal">
                <td className="py-1.5 text-[13px] font-bold text-[#42221D] whitespace-nowrap">
                  {isTa ? 'தொகுதி' : 'Constituency'}
                </td>
                <td className="py-1.5 px-3 text-[13px] font-bold text-[#42221D]">:</td>
                <td className="py-1.5 text-[15px] font-bold text-[#151515] truncate max-w-[190px]">{displayConstituency}</td>
              </tr>
              <tr className="leading-normal">
                <td className="py-1.5 text-[13px] font-bold text-[#42221D] whitespace-nowrap">
                  {isTa ? 'உறுப்பினர் எண்' : 'Member ID'}
                </td>
                <td className="py-1.5 px-3 text-[13px] font-bold text-[#42221D]">:</td>
                <td className="py-1.5 text-[15px] font-bold text-[#151515]">{volId}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER SECTION */}
      <div className="z-10 shrink-0 relative">
        {/* Office Address Bar - Centered */}
        <div className="w-full pb-2 flex items-center justify-center space-x-1.5 text-center">
          <MapPin size={13} className="text-[#680208] shrink-0" />
          <span className="text-[11px] font-black text-[#42221D] leading-tight tracking-wide">
            {footerAddress}
          </span>
        </div>

        {/* Bottom Maroon & Yellow Stripe */}
        <div className="h-3.5 bg-[#680208] flex items-center px-0">
          <div className="w-full h-1 bg-[#FCCB06]" />
        </div>
      </div>

      {/* 4. Right Side: Leader + Volunteer Cutout Image (Touching the Footer Bar & Slightly Reduced Size) */}
      <div 
        className="absolute bottom-[14px] h-[235px] w-[220px] pointer-events-none flex items-end justify-end z-20 overflow-hidden"
        style={{
          right: '-4px'
        }}
      >
        <img
          src="/tvk_card_leader.png"
          alt="Leader Cutout"
          className="h-full w-auto object-contain object-bottom"
          onError={(e) => { e.target.src = '/vijay.png'; }}
        />
      </div>
    </div>
  );
});

export default TVKVolunteerIDCard;
