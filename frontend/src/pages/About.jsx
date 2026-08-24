import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AboutMLA from '../components/AboutMLA';
import { MapPin, Phone, Mail, Clock, Target, CheckCircle2 } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const About = () => {
  const isTa = getCurrentLanguage() === 'ta';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-0 pb-16">
        {/* Exact Home Page About MLA Section */}
        <AboutMLA />

        {/* Zonal Office Mission and Contact Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          
          {/* Constituency Goals */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm hover:border-[#FFCC00]/60 hover:shadow-md transition space-y-6 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#800000]/10 border border-[#800000]/20 flex items-center justify-center text-[#800000]">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 notranslate">
                  {isTa ? 'தொகுதி வளர்ச்சி இலக்குகள்' : 'Constituency Development Goals'}
                </h3>
                <span className="text-[11px] text-[#800000] font-black uppercase tracking-wider block">
                  {isTa ? 'தமிழக வெற்றி கழகம் மக்கள் நலப்பணிகள்' : 'TVK People Welfare Priorities'}
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-600 font-semibold leading-relaxed notranslate">
              {isTa 
                ? 'கள்ளக்குறிச்சி சட்டமன்ற தொகுதியின் முழுமையான வளர்ச்சிக்காக முன்வைக்கப்பட்டுள்ள முக்கிய மக்கள் நலத் திட்டங்கள்:' 
                : 'Under the welfare principles of TVK party, our priorities for Kallakurichi constituency development focus on:'}
            </p>

            <ul className="space-y-3.5 text-xs md:text-sm font-bold text-gray-700 notranslate">
              <li className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-[#800000] shrink-0 mt-0.5" />
                <span>{isTa ? 'விவசாயப் பாசனக் கால்வாய்களைத் தூர்வாரி தடையற்ற நீர் விநியோகம் உறுதி செய்தல்.' : 'Ensuring reliable irrigation and clean canal networks for agricultural fields.'}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-[#800000] shrink-0 mt-0.5" />
                <span>{isTa ? 'முக்கிய சாலைகளில் உள்ள பள்ளங்களைச் சீரமைத்து பாதுகாப்பான போக்குவரத்து அமைத்தல்.' : 'Pothole restoration and pedestrian safety layouts on main highway link roads.'}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-[#800000] shrink-0 mt-0.5" />
                <span>{isTa ? 'கிராமப்புற அரசுப் பள்ளிகளில் தூய குடிநீர் மற்றும் நவீன சுகாதார வசதிகளை மேம்படுத்துதல்.' : 'Upgrading sanitation facilities and drinking water systems in rural schools.'}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-[#800000] shrink-0 mt-0.5" />
                <span>{isTa ? 'சந்தைப் பகுதிகள் மற்றும் முக்கிய சந்திப்புகளில் உயர்கோபுர சூரிய மின் விளக்குகள் அமைத்தல்.' : 'Installing high-mast solar lighting networks in municipal market yards.'}</span>
              </li>
            </ul>
          </div>

          {/* MLA Office Contact Details */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm hover:border-[#FFCC00]/60 hover:shadow-md transition space-y-6 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFCC00]/20 border border-[#FFCC00]/40 flex items-center justify-center text-[#800000]">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 notranslate">
                  {isTa ? 'சட்டமன்ற உறுப்பினர் அலுவலகம்' : 'MLA Constituency Office'}
                </h3>
                <span className="text-[11px] text-[#800000] font-black uppercase tracking-wider block">
                  {isTa ? 'நேரடி மக்கள் தொடர்பு மையம்' : 'Citizen Grievance & Service Center'}
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-600 font-semibold leading-relaxed notranslate">
              {isTa 
                ? 'பொதுமக்கள் தங்களின் கோரிக்கைகள் மற்றும் மனுக்களை அலுவலக வேலை நேரங்களில் நேரடியாகச் சமர்ப்பிக்கலாம்.' 
                : 'Citizens can walk in directly during grievance hours to submit petitions or request scheme benefits.'}
            </p>

            <div className="space-y-4 text-xs md:text-sm font-semibold text-gray-700 notranslate">
              <div className="flex items-start space-x-3">
                <MapPin className="text-[#800000] shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="block font-black text-gray-900">{isTa ? 'அலுவலக முகவரி:' : 'Office Address:'}</span>
                  <span className="text-gray-500 font-medium">
                    {isTa ? 'சட்டமன்ற உறுப்பினர் அலுவலகம், சேலம் மெயின் ரோடு, கள்ளக்குறிச்சி, தமிழ்நாடு.' : 'MLA Constituency Office, Salem Main Road, Kallakurichi, Tamil Nadu.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="text-[#800000] shrink-0" size={18} />
                <div>
                  <span className="block font-black text-gray-900">{isTa ? 'தொடர்பு எண்:' : 'Contact Phone:'}</span>
                  <span className="text-gray-500 font-medium">+91 4151 223456 / +91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="text-[#800000] shrink-0" size={18} />
                <div>
                  <span className="block font-black text-gray-900">{isTa ? 'மின்னஞ்சல் முகவரி:' : 'Email Support:'}</span>
                  <span className="text-gray-500 font-medium">mla.kallakurichi@cdo.tn.gov.in</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="text-[#800000] shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="block font-black text-gray-900">{isTa ? 'அலுவலக நேரம்:' : 'Office Hours:'}</span>
                  <span className="text-gray-500 font-medium">
                    {isTa ? 'திங்கள் முதல் வெள்ளி வரை: காலை 10:00 - மதியம் 02:00 வரை' : 'Monday to Friday: 10:00 AM - 02:00 PM (Grievance Submissions)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
